import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Star } from 'lucide-react';
import { HireRequest, Message, RequestStatus, Review, UserRole } from '@/types';
import { getStatusStyle } from '@/data/constants';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export function HiresListPage() {
  const { user } = useAuth();
  const [hires, setHires] = useState<HireRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    const role =
      user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS
        ? 'ADMIN'
        : user.role === UserRole.PROFESSIONAL
          ? 'PROFESSIONAL'
          : 'CLIENT';
    dataService.getHireRequests(user.id, role).then(setHires);
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hires</h1>
      <div className="space-y-3">
        {hires.map((h) => (
          <Link
            key={h.id}
            to={`/app/hires/${h.id}`}
            className="block bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold">{h.serviceRequested || h.serviceCategory}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {h.clientName} → {h.professionalName || 'Unassigned'}
                </p>
              </div>
              <span className={`px-2 py-1 h-fit rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(h.status)}`}>
                {h.status.replace(/_/g, ' ')}
              </span>
            </div>
          </Link>
        ))}
        {hires.length === 0 && <p className="text-slate-400 italic">No hire requests yet.</p>}
      </div>
    </div>
  );
}

export function HireDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [hire, setHire] = useState<HireRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const reload = async () => {
    if (!user || !id) return;
    const role =
      user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS
        ? 'ADMIN'
        : user.role === UserRole.PROFESSIONAL
          ? 'PROFESSIONAL'
          : 'CLIENT';
    const all = await dataService.getHireRequests(user.id, role);
    setHire(all.find((h) => h.id === id) || null);
    setMessages(await dataService.getMessages(id));
    setExistingReview(await dataService.getReviewForHire(id));
  };

  useEffect(() => {
    reload();
    if (!id) return;
    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `hire_request_id=eq.${id}` },
        () => reload()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  if (!hire || !user) return <p className="text-slate-400">Loading…</p>;

  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS;
  const isClient = user.role === UserRole.CLIENT;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/app/hires" className="text-sm font-bold text-slate-500 hover:text-[#660033]">
        ← Back
      </Link>
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(hire.status)}`}>
          {hire.status.replace(/_/g, ' ')}
        </span>
        <h1 className="text-3xl font-bold">{hire.serviceRequested || hire.serviceCategory}</h1>
        <p className="text-slate-500 font-medium">
          {hire.clientName} · {hire.professionalName || 'Matching'} · {hire.location}
        </p>
        <p className="font-bold text-[#660033]">{formatNaira(hire.amount || 0)} consultation / {formatNaira(hire.escrowAmount || 0)} escrow</p>

        <div className="flex flex-wrap gap-2 pt-4">
          {isClient && hire.status === RequestStatus.AWAITING_CONSULTATION_PAY && (
            <Button
              onClick={async () => {
                try {
                  const res = await dataService.initializePaystackPayment({
                    hireRequestId: hire.id,
                    paymentType: 'consultation',
                  });
                  if (res?.authorization_url) window.location.href = res.authorization_url;
                } catch {
                  await dataService.updateHireStatus(hire.id, RequestStatus.CONSULTATION_PAID, {
                    payment_status: 'consultation_paid',
                  });
                  reload();
                }
              }}
            >
              Pay consultation
            </Button>
          )}
          {isClient && hire.status === RequestStatus.AWAITING_ESCROW && (
            <Button
              onClick={async () => {
                try {
                  const res = await dataService.initializePaystackPayment({
                    hireRequestId: hire.id,
                    paymentType: 'escrow',
                    amount: hire.escrowAmount || undefined,
                  });
                  if (res?.authorization_url) window.location.href = res.authorization_url;
                } catch {
                  await dataService.updateHireStatus(hire.id, RequestStatus.FUNDED, { payment_status: 'escrowed' });
                  reload();
                }
              }}
            >
              Fund escrow
            </Button>
          )}
          {isStaff && hire.status === RequestStatus.CONSULTATION_PAID && (
            <Button
              onClick={async () => {
                await dataService.updateHireStatus(hire.id, RequestStatus.AWAITING_ESCROW, {
                  escrow_amount: hire.escrowAmount || 150000,
                });
                reload();
              }}
            >
              Approve consult → set escrow
            </Button>
          )}
          {isStaff && hire.status === RequestStatus.FUNDED && (
            <Button onClick={async () => { await dataService.updateHireStatus(hire.id, RequestStatus.ACTIVE); reload(); }}>
              Start job
            </Button>
          )}
          {(isStaff || user.role === UserRole.PROFESSIONAL) && hire.status === RequestStatus.ACTIVE && (
            <Button onClick={async () => { await dataService.updateHireStatus(hire.id, RequestStatus.COMPLETED); reload(); }}>
              Mark completed
            </Button>
          )}
          {isStaff && hire.status === RequestStatus.COMPLETED && (
            <Button
              onClick={async () => {
                await dataService.updateHireStatus(hire.id, RequestStatus.SETTLED, { payment_status: 'released' });
                reload();
              }}
            >
              Release escrow
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <h2 className="text-xl font-bold">Messages</h2>
        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-2xl text-sm font-medium max-w-[85%] ${
                m.senderId === user.id ? 'bg-[#660033] text-white ml-auto' : 'bg-slate-50 text-slate-700'
              }`}
            >
              {m.body}
            </div>
          ))}
          {messages.length === 0 && <p className="text-slate-400 italic text-sm">No messages yet.</p>}
        </div>
        <div className="flex gap-2">
          <TextArea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" />
          <Button
            onClick={async () => {
              if (!body.trim() || !id) return;
              await dataService.sendMessage(id, user.id, body.trim());
              setBody('');
              reload();
            }}
          >
            Send
          </Button>
        </div>
      </div>

      {existingReview && isClient && (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-2">
          <h2 className="text-xl font-bold">Your review</h2>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={20} className={n <= existingReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            ))}
          </div>
          <p className="text-slate-600 font-medium">{existingReview.comment}</p>
        </div>
      )}

      {isClient &&
        (hire.status === RequestStatus.COMPLETED || hire.status === RequestStatus.SETTLED) &&
        hire.professionalId &&
        !existingReview && (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
          <h2 className="text-xl font-bold">How was your experience?</h2>
          <p className="text-sm text-slate-500">Rate {hire.professionalName || 'this professional'} — reviews appear on their public profile.</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="p-1" aria-label={`${n} stars`}>
                <Star size={32} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
              </button>
            ))}
          </div>
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share a short note (at least 10 characters)…"
          />
          {reviewError && <p className="text-sm text-rose-600 font-bold">{reviewError}</p>}
          <Button
            disabled={reviewSaving}
            onClick={async () => {
              if (comment.trim().length < 10) {
                setReviewError('Please write at least 10 characters.');
                return;
              }
              setReviewSaving(true);
              setReviewError(null);
              try {
                await dataService.createReview({
                  hireRequestId: hire.id,
                  professionalId: hire.professionalId!,
                  clientId: user.id,
                  clientName: user.name || user.firstName,
                  category: hire.serviceCategory,
                  rating,
                  comment: comment.trim(),
                });
                await reload();
              } catch (e) {
                setReviewError(e instanceof Error ? e.message : 'Could not submit review');
              } finally {
                setReviewSaving(false);
              }
            }}
          >
            {reviewSaving ? 'Submitting…' : 'Submit review'}
          </Button>
        </div>
      )}
    </div>
  );
}

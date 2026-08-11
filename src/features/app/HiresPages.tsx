import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Briefcase, Star } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { HireRequest, Message, RequestStatus, Review, UserRole } from '@/types';
import { getStatusStyle } from '@/data/constants';
import { formatNaira } from '@/lib/utils';
import { IMAGES } from '@/data/images';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

type JobFilter = 'all' | 'active' | 'pending' | 'completed' | 'cancelled' | 'pending_pay';

const ACTIVE_STATUSES = new Set([
  'accepted',
  'consultation_paid',
  'awaiting_escrow',
  'funded',
  'active',
]);
const PENDING_STATUSES = new Set(['pending', 'assigned', 'awaiting_consultation_pay']);
const PENDING_PAY_STATUSES = new Set(['awaiting_consultation_pay', 'awaiting_escrow']);
const COMPLETED_STATUSES = new Set(['completed', 'settled']);
const CANCELLED_STATUSES = new Set(['cancelled', 'disputed']);
const PRO_COMPLETED_STATUSES = new Set(['completed', 'settled', 'cancelled', 'disputed']);

export function HiresListPage() {
  const { user } = useAuth();
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [filter, setFilter] = useState<JobFilter>('all');

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

  const isClient = user?.role === UserRole.CLIENT;
  const isPro = user?.role === UserRole.PROFESSIONAL;
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const activeCount = hires.filter((h) => ACTIVE_STATUSES.has(h.status)).length;
  const pendingPayCount = hires.filter((h) => PENDING_PAY_STATUSES.has(h.status)).length;
  const completedCount = hires.filter((h) => COMPLETED_STATUSES.has(h.status)).length;
  const cancelledCount = hires.filter((h) => CANCELLED_STATUSES.has(h.status)).length;
  const showAside = isClient || isPro || isStaff;

  const filtered = useMemo(() => {
    if ((!isPro && !isStaff) || filter === 'all') return hires;
    return hires.filter((h) => {
      if (filter === 'active') return ACTIVE_STATUSES.has(h.status);
      if (filter === 'pending') return PENDING_STATUSES.has(h.status);
      if (filter === 'pending_pay') return PENDING_PAY_STATUSES.has(h.status);
      if (filter === 'completed') {
        return isStaff ? COMPLETED_STATUSES.has(h.status) : PRO_COMPLETED_STATUSES.has(h.status);
      }
      if (filter === 'cancelled') return CANCELLED_STATUSES.has(h.status);
      return true;
    });
  }, [hires, filter, isPro, isStaff]);

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">
            {isClient ? 'Hires' : isPro ? 'Jobs' : 'Hire requests'}
          </p>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mt-1">
            {isClient ? 'Your hired staff' : isPro ? 'Your job pipeline' : 'All hire requests'}
          </h1>
          <p className="text-sm text-[#615A5C] font-medium mt-1 max-w-xl">
            {isClient
              ? 'Track consultation, escrow, and job status for each hire request.'
              : isPro
                ? 'Accept, message, and complete assigned client jobs from here.'
                : 'Filter by payment state, active work, completed, or cancelled. Open a hire for staff actions and messaging.'}
          </p>
        </div>
        {isClient && (
          <Link to="/app">
            <Button size="sm">Find professionals</Button>
          </Link>
        )}
        {isPro && (
          <Link to="/app/wallet">
            <Button size="sm" variant="secondary">
              Open payments
            </Button>
          </Link>
        )}
      </div>

      {isPro && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['active', 'Active'],
              ['pending', 'Pending'],
              ['completed', 'Completed'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              size="sm"
              variant={filter === id ? 'primary' : 'secondary'}
              onClick={() => setFilter(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {isStaff && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['pending_pay', 'Pending pay'],
              ['active', 'Active'],
              ['completed', 'Completed'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              size="sm"
              variant={filter === id ? 'primary' : 'secondary'}
              onClick={() => setFilter(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      <div className={`grid gap-6 items-start ${showAside ? 'lg:grid-cols-[1.2fr_0.8fr]' : ''}`}>
        <div className="space-y-3 min-w-0">
          {filtered.map((h) => (
            <Link
              key={h.id}
              to={`/app/hires/${h.id}`}
              className="block bg-white border border-slate-200 rounded-[1.75rem] p-5 hover:shadow-md hover:border-[#660033]/20 transition-all"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold text-[#0A0A0A]">{h.serviceRequested || h.serviceCategory}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {isClient
                      ? h.professionalName || 'Matching professional…'
                      : isPro
                        ? h.clientName
                        : `${h.clientName} → ${h.professionalName || 'Unassigned'}`}
                  </p>
                  {h.amount != null && (
                    <p className="text-xs font-bold text-[#660033] mt-2">{formatNaira(h.amount)}</p>
                  )}
                  {isPro && !h.preferredStartDate && ACTIVE_STATUSES.has(h.status) && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-2">
                      Unscheduled
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 h-fit rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(h.status)}`}
                >
                  {h.status.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 px-8 bg-white rounded-[1.75rem] border border-dashed border-slate-200 space-y-3">
              <Briefcase className="text-slate-300" size={32} />
              <p className="text-[#615A5C] font-medium max-w-md">
                {isClient
                  ? 'You haven’t hired anyone yet.'
                  : isPro
                    ? filter === 'all'
                      ? 'No jobs assigned yet. Stay verified and available so clients can hire you.'
                      : `No ${filter} jobs right now.`
                    : filter === 'all'
                      ? 'No hire requests yet.'
                      : `No ${filter.replace(/_/g, ' ')} requests.`}
              </p>
              {isClient && (
                <Link to="/app" className="inline-block text-[#660033] font-bold text-sm">
                  Browse Find to hire someone
                </Link>
              )}
              {isPro && (
                <Link to="/app" className="inline-block text-[#660033] font-bold text-sm">
                  Review your dashboard
                </Link>
              )}
            </div>
          )}
        </div>

        {isStaff && (
          <aside className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3 h-fit sticky top-24">
            <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">Queue counts</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Total</span>
                <span className="font-bold">{hires.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Pending pay</span>
                <span className="font-bold">{pendingPayCount}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Active</span>
                <span className="font-bold">{activeCount}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Completed</span>
                <span className="font-bold">{completedCount}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Cancelled</span>
                <span className="font-bold">{cancelledCount}</span>
              </div>
            </div>
            <p className="text-sm text-[#615A5C] font-medium leading-relaxed border-t border-slate-100 pt-3">
              Advance consultation → escrow → active → settled from each hire detail.
            </p>
          </aside>
        )}

        {isClient && (
          <aside className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                <p className="text-3xl font-black text-[#0A0A0A] mt-1">{hires.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">In progress</p>
                <p className="text-3xl font-black text-[#0A0A0A] mt-1">{activeCount}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
              <h2 className="font-bold text-[#0A0A0A]">Status guide</h2>
              <ul className="space-y-2 text-sm text-[#615A5C] font-medium">
                <li>
                  <span className="font-bold text-[#0A0A0A]">Awaiting consultation pay</span> — pay the one-time fee
                </li>
                <li>
                  <span className="font-bold text-[#0A0A0A]">Funded / Active</span> — escrow is in place and work can run
                </li>
                <li>
                  <span className="font-bold text-[#0A0A0A]">Completed</span> — leave a review from the hire detail
                </li>
              </ul>
            </div>
            <div className="bg-[#660033] text-white rounded-[1.75rem] p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Next step</p>
              <p className="font-bold text-lg">Need another hire?</p>
              <p className="text-sm text-white/75 font-medium">
                Open Find, pick a category, and start a new request anytime.
              </p>
              <Link to="/app" className="inline-block text-sm font-bold underline underline-offset-4 pt-1">
                Go to Find
              </Link>
            </div>
          </aside>
        )}

        {isPro && (
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] overflow-hidden h-40 border border-slate-200">
              <img src={IMAGES.process} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                <p className="text-3xl font-black text-[#0A0A0A] mt-1">{hires.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active</p>
                <p className="text-3xl font-black text-[#0A0A0A] mt-1">{activeCount}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
              <h2 className="font-bold text-[#0A0A0A]">What to do next</h2>
              <ul className="space-y-2 text-sm text-[#615A5C] font-medium">
                <li>
                  <span className="font-bold text-[#0A0A0A]">New / accepted</span> — open the job and message the client
                </li>
                <li>
                  <span className="font-bold text-[#0A0A0A]">Funded / Active</span> — deliver the work; keep updates
                  in-thread
                </li>
                <li>
                  <span className="font-bold text-[#0A0A0A]">Completed</span> — earnings move toward your wallet
                </li>
              </ul>
            </div>
            <div className="bg-[#660033] text-white rounded-[1.75rem] p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Earn more</p>
              <p className="font-bold text-lg">Stay available</p>
              <p className="text-sm text-white/75 font-medium">
                Set availability on Profile so you show as hireable in Find.
              </p>
              <Link to="/app/profile" className="inline-block text-sm font-bold underline underline-offset-4 pt-1">
                Open profile
              </Link>
            </div>
          </aside>
        )}
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
      <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
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

      <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
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
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
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
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
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

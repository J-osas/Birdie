import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Briefcase, Check, Copy, Star } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import {
  Consultation,
  HireRequest,
  Invoice,
  InvoiceStatus,
  Message,
  RequestStatus,
  Review,
  UserRole,
} from '@/types';
import { getStatusStyle, statusLabel } from '@/data/constants';
import { formatNaira, errorMessage } from '@/lib/utils';
import { IMAGES } from '@/data/images';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { KpiCard } from '@/features/admin/overview/KpiCard';
import { ReviewForm, ReviewStatusNote } from '@/features/reviews/ReviewForm';

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

const LIVING_LABELS: Record<string, string> = {
  LIVE_OUT: 'Live-out',
  LIVE_IN: 'Live-in',
  BQ: 'Boys’ Quarters',
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return 'a date to be agreed';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRequirementValue(key: string, value: unknown) {
  if (value == null || value === '') return '—';
  const text = String(value);
  if (key === 'livingCondition') return LIVING_LABELS[text] || text.replace(/_/g, ' ');
  return text.replace(/_/g, ' ');
}

function requirementLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function CopyRefButton({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  if (!code) return <span className="text-slate-400">—</span>;
  return (
    <button
      type="button"
      title="Copy reference"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#660033] hover:underline ${className}`}
    >
      {code}
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

export function HiresListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [filter, setFilter] = useState<JobFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewedHireIds, setReviewedHireIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const role =
      user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS
        ? 'ADMIN'
        : user.role === UserRole.PROFESSIONAL
          ? 'PROFESSIONAL'
          : 'CLIENT';
    setLoading(true);
    dataService.getHireRequests(user.id, role).then((rows) => {
      setHires(rows);
      setLoading(false);
    });
    if (user.role === UserRole.CLIENT) {
      dataService.getReviewsByClient(user.id).then((rows) => {
        setReviewedHireIds(new Set(rows.map((r) => r.hireRequestId)));
      });
    }
  }, [user]);

  const isClient = user?.role === UserRole.CLIENT;
  const isPro = user?.role === UserRole.PROFESSIONAL;
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const activeCount = hires.filter((h) => ACTIVE_STATUSES.has(h.status)).length;
  const pendingPayCount = hires.filter((h) => PENDING_PAY_STATUSES.has(h.status)).length;
  const completedCount = hires.filter((h) => COMPLETED_STATUSES.has(h.status)).length;
  const cancelledCount = hires.filter((h) => CANCELLED_STATUSES.has(h.status)).length;
  const showAside = isClient || isPro;

  const filtered = useMemo(() => {
    let rows = hires;
    if ((isPro || isStaff) && filter !== 'all') {
      rows = rows.filter((h) => {
        if (filter === 'active') return ACTIVE_STATUSES.has(h.status);
        if (filter === 'pending') return PENDING_STATUSES.has(h.status);
        if (filter === 'pending_pay') return PENDING_PAY_STATUSES.has(h.status);
        if (filter === 'completed') {
          return isStaff ? COMPLETED_STATUSES.has(h.status) : PRO_COMPLETED_STATUSES.has(h.status);
        }
        if (filter === 'cancelled') return CANCELLED_STATUSES.has(h.status);
        return true;
      });
    }
    const q = search.trim().toLowerCase();
    if (isStaff && q) {
      rows = rows.filter((h) =>
        [h.referenceCode, h.clientName, h.professionalName, h.serviceCategory, h.serviceRequested]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return rows;
  }, [hires, filter, isPro, isStaff, search]);

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">
            {isClient ? 'Your requests' : isPro ? 'Your jobs' : 'All requests'}
          </p>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mt-1">
            {isClient ? 'The people you are hiring' : isPro ? 'Your jobs' : 'Every request'}
          </h1>
          <p className="text-sm text-[#615A5C] font-medium mt-1 max-w-xl">
            {isClient
              ? 'See where each request has reached, from the first call to the last payment.'
              : isPro
                ? 'Accept a job, send a message, and mark work as done from here.'
                : 'Search by request number or name. Open a row to take action or send a message.'}
          </p>
        </div>
        {isClient && (
          <Link to="/app">
            <Button size="sm">Find someone to help</Button>
          </Link>
        )}
        {isPro && (
          <Link to="/app/wallet">
            <Button size="sm" variant="secondary">
              See my money
            </Button>
          </Link>
        )}
      </div>

      {isStaff && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard label="All requests" value={hires.length} onClick={() => setFilter('all')} active={filter === 'all'} />
          <KpiCard
            label="Waiting for payment"
            value={pendingPayCount}
            onClick={() => setFilter('pending_pay')}
            active={filter === 'pending_pay'}
          />
          <KpiCard
            label="Jobs running"
            value={activeCount}
            onClick={() => setFilter('active')}
            active={filter === 'active'}
          />
          <KpiCard
            label="Jobs done"
            value={completedCount}
            onClick={() => setFilter('completed')}
            active={filter === 'completed'}
          />
          <KpiCard
            label="Cancelled"
            value={cancelledCount}
            onClick={() => setFilter('cancelled')}
            active={filter === 'cancelled'}
          />
        </div>
      )}

      {isPro && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['active', 'Running now'],
              ['pending', 'Waiting to start'],
              ['completed', 'Finished'],
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
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search a request number, a name or a job…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', 'All'],
                ['pending_pay', 'Waiting for payment'],
                ['active', 'Running now'],
                ['completed', 'Finished'],
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
            <p className="text-xs font-bold text-slate-400 ml-auto">
              {filtered.length} of {hires.length}
            </p>
          </div>
        </div>
      )}

      {isStaff ? (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
          {loading && <p className="p-6 text-slate-400 font-medium">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <div className="py-16 px-8 space-y-3">
              <Briefcase className="text-slate-300" size={32} />
              <p className="text-[#615A5C] font-medium max-w-md">
                {filter === 'all' && !search.trim()
                  ? 'No requests yet.'
                  : 'Nothing matches that. Try a different search.'}
              </p>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[860px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3">Request</th>
                    <th className="px-5 py-3">Family</th>
                    <th className="px-5 py-3">Professional</th>
                    <th className="px-5 py-3">Kind of help</th>
                    <th className="px-5 py-3">Where it is</th>
                    <th className="px-5 py-3">Money</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h) => (
                    <tr
                      key={h.id}
                      onClick={() => navigate(`/app/hires/${h.id}`)}
                      className="border-b border-slate-50 last:border-0 hover:bg-[#F8FAFB] cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <CopyRefButton code={h.referenceCode} />
                      </td>
                      <td className="px-5 py-4 font-bold text-sm text-[#0A0A0A]">{h.clientName || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{h.professionalName || 'Not matched yet'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{h.serviceCategory}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(h.status)}`}
                        >
                          {statusLabel(h.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold tracking-wide text-slate-500">
                        {statusLabel(h.paymentStatus)}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#660033]">
                        {h.amount != null ? formatNaira(h.amount) : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(h.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
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
                    {h.referenceCode && (
                      <p className="font-mono text-[11px] font-bold text-[#660033] mb-1">{h.referenceCode}</p>
                    )}
                    <p className="font-bold text-[#0A0A0A]">{h.serviceRequested || h.serviceCategory}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isClient
                        ? h.professionalName || 'We are finding you someone…'
                        : isPro
                          ? h.clientName
                          : `${h.clientName} → ${h.professionalName || 'Not matched yet'}`}
                    </p>
                    {h.amount != null && (
                      <p className="text-xs font-bold text-[#660033] mt-2">{formatNaira(h.amount)}</p>
                    )}
                    {isClient && COMPLETED_STATUSES.has(h.status) && !reviewedHireIds.has(h.id) && (
                      <p className="mt-2 inline-flex text-[10px] font-bold uppercase tracking-widest text-[#660033] bg-[#660033]/5 border border-[#660033]/10 px-2 py-1 rounded-full">
                        Write a review
                      </p>
                    )}
                    {isPro && !h.preferredStartDate && ACTIVE_STATUSES.has(h.status) && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-2">
                        No date set yet
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 h-fit rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(h.status)}`}
                  >
                    {statusLabel(h.status)}
                  </span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 px-8 bg-white rounded-[1.75rem] border border-dashed border-slate-200 space-y-3">
                <Briefcase className="text-slate-300" size={32} />
                <p className="text-[#615A5C] font-medium max-w-md">
                  {isClient
                    ? 'You have not hired anyone yet.'
                    : isPro
                      ? filter === 'all'
                        ? 'No jobs yet. Keep your profile complete and stay available so families can find you.'
                        : 'Nothing here right now.'
                      : filter === 'all'
                        ? 'No requests yet.'
                        : 'Nothing here right now.'}
                </p>
                {isClient && (
                  <Link to="/app" className="inline-block text-[#660033] font-bold text-sm">
                    Find someone to help
                  </Link>
                )}
                {isPro && (
                  <Link to="/app" className="inline-block text-[#660033] font-bold text-sm">
                    Go to your dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          {isClient && (
            <aside className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">All requests</p>
                  <p className="text-3xl font-black text-[#0A0A0A] mt-1">{hires.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Happening now</p>
                  <p className="text-3xl font-black text-[#0A0A0A] mt-1">{activeCount}</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
                <h2 className="font-bold text-[#0A0A0A]">What each stage means</h2>
                <ul className="space-y-2 text-sm text-[#615A5C] font-medium">
                  <li>
                    <span className="font-bold text-[#0A0A0A]">Waiting for meeting fee</span> — pay the small one-off fee
                    so we can call you
                  </li>
                  <li>
                    <span className="font-bold text-[#0A0A0A]">Waiting for your payment</span> — your bill is ready, open
                    it and pay
                  </li>
                  <li>
                    <span className="font-bold text-[#0A0A0A]">Birdie is holding your money</span> — we keep it safe until
                    the job is done
                  </li>
                  <li>
                    <span className="font-bold text-[#0A0A0A]">Job done</span> — open the request and write a review
                  </li>
                </ul>
              </div>
              <div className="bg-[#660033] text-white rounded-[1.75rem] p-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">What next</p>
                <p className="font-bold text-lg">Need more help at home?</p>
                <p className="text-sm text-white/75 font-medium">
                  Pick the kind of help you need and send us a new request any time.
                </p>
                <Link to="/app" className="inline-block text-sm font-bold underline underline-offset-4 pt-1">
                  Find someone to help
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
      )}
    </div>
  );
}

export function HireDetailPage() {
  const { id } = useParams();
  const { user, settings } = useAuth();
  const [hire, setHire] = useState<HireRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [proUserId, setProUserId] = useState<string | undefined>();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [consultNotes, setConsultNotes] = useState('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [billDuration, setBillDuration] = useState('');
  const [billStart, setBillStart] = useState('');
  const [billDue, setBillDue] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [billBusy, setBillBusy] = useState(false);

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
    setConsultation(await dataService.getConsultationForHire(id));
    const bill = await dataService.getInvoiceForHire(id);
    setInvoice(bill);
    if (bill) {
      setBillAmount(bill.amount ? String(bill.amount) : '');
      setBillDuration(bill.duration || '');
      setBillStart(bill.startDate || '');
      setBillDue(bill.dueDate || '');
      setBillNotes(bill.notes || '');
    }
    const found = all.find((h) => h.id === id);
    if (found?.professionalId) {
      const pro = await dataService.getProfessionalById(found.professionalId);
      if (pro) setProUserId(pro.userId);
    }
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
  const requirementEntries = Object.entries(hire.requirements || {}).filter(
    ([, value]) => value != null && String(value).trim() !== ''
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/app/hires" className="text-sm font-bold text-slate-500 hover:text-[#660033]">
        ← Back
      </Link>
      <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(hire.status)}`}>
            {statusLabel(hire.status)}
          </span>
          {hire.referenceCode && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference</p>
              <CopyRefButton code={hire.referenceCode} className="text-sm" />
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold">{hire.serviceRequested || hire.serviceCategory}</h1>
        <p className="text-slate-500 font-medium">
          {hire.clientName} · {hire.professionalName || 'Finding someone'} · {hire.location}
        </p>

        <dl className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Family</dt>
            <dd className="font-bold text-[#0A0A0A] mt-1">{hire.clientName || '—'}</dd>
            {hire.clientEmail && <dd className="text-sm text-slate-500">{hire.clientEmail}</dd>}
            {hire.clientPhone && <dd className="text-sm text-slate-500">{hire.clientPhone}</dd>}
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional</dt>
            <dd className="font-bold text-[#0A0A0A] mt-1">{hire.professionalName || 'Not matched yet'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Where</dt>
            <dd className="font-medium text-slate-700 mt-1">{hire.location || '—'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Wants to start</dt>
            <dd className="font-medium text-slate-700 mt-1">{formatDate(hire.preferredStartDate)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Meeting fee</dt>
            <dd className="font-bold text-[#660033] mt-1">{formatNaira(hire.amount || 0)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Job amount</dt>
            <dd className="font-bold text-[#660033] mt-1">{formatNaira(hire.escrowAmount || 0)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Money</dt>
            <dd className="font-medium text-slate-700 mt-1">{statusLabel(hire.paymentStatus)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asked on</dt>
            <dd className="font-medium text-slate-700 mt-1">{formatDate(hire.createdAt)}</dd>
          </div>
        </dl>

        {requirementEntries.length > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">What the family asked for</p>
            <dl className="grid sm:grid-cols-2 gap-3">
              {requirementEntries.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {requirementLabel(key)}
                  </dt>
                  <dd className="text-sm font-medium text-slate-700 mt-0.5">{formatRequirementValue(key, value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {hire.notes && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notes</p>
            <p className="text-sm font-medium text-slate-700 mt-1 whitespace-pre-wrap">{hire.notes}</p>
          </div>
        )}

        {actionError && <p className="text-sm font-bold text-rose-600">{actionError}</p>}

        {isStaff && hire.status === RequestStatus.CONSULTATION_PAID && !consultation?.completedAt && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1 · The meeting</p>
            <p className="text-sm text-slate-500 font-medium">
              Meeting booked for {formatDateTime(consultation?.scheduledAt)}. Once you have spoken to the family, mark it done
              and Birdie will prepare the bill for you to check.
            </p>
            <div className="space-y-1.5">
              <Label>What was agreed (optional)</Label>
              <TextArea
                rows={2}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                placeholder="Notes from the call…"
              />
            </div>
            <Button
              disabled={billBusy}
              onClick={async () => {
                setActionError(null);
                setBillBusy(true);
                try {
                  await dataService.markConsultationDone({
                    hireId: hire.id,
                    notes: consultNotes.trim() || undefined,
                    actorId: user.id,
                  });
                  await reload();
                } catch (e) {
                  setActionError(errorMessage(e, 'Could not mark the meeting as done'));
                } finally {
                  setBillBusy(false);
                }
              }}
            >
              {billBusy ? 'Saving…' : 'Meeting done — prepare the bill'}
            </Button>
          </div>
        )}

        {isStaff && invoice && invoice.status === InvoiceStatus.DRAFT && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 2 · Check the bill</p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {invoice.invoiceNumber}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Birdie filled this in from the listed rate. Change the amount to what the family actually agreed, then send it.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount the family pays (NGN)</Label>
                <Input value={billAmount} onChange={(e) => setBillAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>How long the job runs</Label>
                <Input
                  value={billDuration}
                  onChange={(e) => setBillDuration(e.target.value)}
                  placeholder="e.g. Full-time, monthly"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Job start date</Label>
                <Input type="date" value={billStart} onChange={(e) => setBillStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Pay by</Label>
                <Input type="date" value={billDue} onChange={(e) => setBillDue(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Note for the family (optional)</Label>
              <TextArea
                rows={2}
                value={billNotes}
                onChange={(e) => setBillNotes(e.target.value)}
                placeholder="Anything the family should know about this bill…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={billBusy}
                onClick={async () => {
                  setActionError(null);
                  setBillBusy(true);
                  try {
                    await dataService.saveInvoiceDraft({
                      id: invoice.id,
                      amount: Number(billAmount),
                      dueDate: billDue || undefined,
                      duration: billDuration || undefined,
                      startDate: billStart || undefined,
                      notes: billNotes || undefined,
                    });
                    await reload();
                  } catch (e) {
                    setActionError(errorMessage(e, 'Could not save the bill'));
                  } finally {
                    setBillBusy(false);
                  }
                }}
              >
                Save for later
              </Button>
              <Button
                disabled={billBusy}
                onClick={async () => {
                  setActionError(null);
                  setBillBusy(true);
                  try {
                    await dataService.saveInvoiceDraft({
                      id: invoice.id,
                      amount: Number(billAmount),
                      dueDate: billDue || undefined,
                      duration: billDuration || undefined,
                      startDate: billStart || undefined,
                      notes: billNotes || undefined,
                    });
                    await dataService.sendInvoice({
                      invoiceId: invoice.id,
                      professionalUserId: proUserId,
                      referenceCode: hire.referenceCode,
                      actorId: user.id,
                    });
                    await reload();
                  } catch (e) {
                    setActionError(errorMessage(e, 'Could not send the bill'));
                  } finally {
                    setBillBusy(false);
                  }
                }}
              >
                {billBusy ? 'Sending…' : 'Send bill to the family'}
              </Button>
            </div>
          </div>
        )}

        {invoice && invoice.status !== InvoiceStatus.DRAFT && (
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your bill</p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(invoice.status)}`}
              >
                {statusLabel(invoice.status)}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#660033]">{formatNaira(invoice.amount)}</p>
            <p className="text-sm text-slate-500 font-medium">
              {invoice.invoiceNumber}
              {invoice.dueDate ? ` · pay by ${formatDate(invoice.dueDate)}` : ''}
              {invoice.duration ? ` · ${invoice.duration}` : ''}
            </p>
            {invoice.notes && <p className="text-sm text-slate-600 font-medium">{invoice.notes}</p>}
            <Link to={`/app/invoices/${invoice.id}`} className="text-sm font-bold text-[#660033] hover:underline">
              See the full bill →
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {isClient && hire.status === RequestStatus.AWAITING_CONSULTATION_PAY && (
            <Button
              onClick={async () => {
                setActionError(null);
                try {
                  const res = await dataService.initializePaystackPayment({
                    hireRequestId: hire.id,
                    paymentType: 'consultation',
                  });
                  if (!res?.authorization_url) throw new Error('We could not open the payment page. Please try again.');
                  window.location.href = res.authorization_url;
                } catch (e) {
                  setActionError(errorMessage(e, 'We could not open the payment page. Please try again.'));
                }
              }}
            >
              Pay the meeting fee
            </Button>
          )}
          {isClient && hire.status === RequestStatus.AWAITING_ESCROW && (
            <Button
              onClick={async () => {
                setActionError(null);
                try {
                  const res = await dataService.initializePaystackPayment({
                    hireRequestId: hire.id,
                    paymentType: 'escrow',
                    amount: hire.escrowAmount || undefined,
                  });
                  if (!res?.authorization_url) throw new Error('We could not open the payment page. Please try again.');
                  window.location.href = res.authorization_url;
                } catch (e) {
                  setActionError(errorMessage(e, 'We could not open the payment page. Please try again.'));
                }
              }}
            >
              Pay this bill · {formatNaira(invoice?.amount || hire.escrowAmount || 0)}
            </Button>
          )}
          {isStaff && hire.status === RequestStatus.FUNDED && (
            <Button
              onClick={async () => {
                setActionError(null);
                try {
                  await dataService.updateHireStatus(hire.id, RequestStatus.ACTIVE);
                  reload();
                } catch (e) {
                  setActionError(errorMessage(e, 'We could not start the job'));
                }
              }}
            >
              Start the job
            </Button>
          )}
          {(isStaff || user.role === UserRole.PROFESSIONAL) && hire.status === RequestStatus.ACTIVE && (
            <Button
              onClick={async () => {
                setActionError(null);
                try {
                  await dataService.updateHireStatus(hire.id, RequestStatus.COMPLETED);
                  reload();
                } catch (e) {
                  setActionError(errorMessage(e, 'We could not mark the job as done'));
                }
              }}
            >
              The job is done
            </Button>
          )}
          {isStaff && hire.status === RequestStatus.COMPLETED && (
            <Button
              onClick={async () => {
                setActionError(null);
                try {
                  await dataService.updateHireStatus(hire.id, RequestStatus.SETTLED);
                  reload();
                } catch (e) {
                  setActionError(errorMessage(e, 'We could not pay the professional'));
                }
              }}
            >
              Pay the professional now
            </Button>
          )}
          {isStaff &&
            (hire.status === RequestStatus.CONSULTATION_PAID ||
              hire.status === RequestStatus.AWAITING_ESCROW ||
              hire.status === RequestStatus.FUNDED ||
              hire.status === RequestStatus.ACTIVE ||
              hire.status === RequestStatus.COMPLETED) && (
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!window.confirm(`Send the money back for ${hire.referenceCode}? This only works while Birdie is still holding it.`)) {
                    return;
                  }
                  setActionError(null);
                  try {
                    const type =
                      hire.status === RequestStatus.CONSULTATION_PAID || hire.status === RequestStatus.AWAITING_ESCROW
                        ? 'consultation'
                        : 'escrow';
                    await dataService.refundPayment({ hireRequestId: hire.id, paymentType: type });
                    reload();
                  } catch (e) {
                    setActionError(errorMessage(e, 'We could not send the money back'));
                  }
                }}
              >
                Send the money back
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
          <ReviewStatusNote status={existingReview.status} />
        </div>
      )}

      {isClient &&
        (hire.status === RequestStatus.COMPLETED || hire.status === RequestStatus.SETTLED) &&
        hire.professionalId &&
        !existingReview &&
        (settings?.reviews_enabled === false ? (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6">
          <p className="text-sm font-medium text-[#615A5C]">Reviews are paused right now.</p>
        </div>
        ) : (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <h2 className="text-xl font-bold">How did it go?</h2>
          <ReviewForm
            professionalName={hire.professionalName}
            saving={reviewSaving}
            error={reviewError}
            onFinished={reload}
            onSubmit={async (rating, comment) => {
              setReviewSaving(true);
              setReviewError(null);
              try {
                return await dataService.createReview({
                  hireRequestId: hire.id,
                  professionalId: hire.professionalId!,
                  clientId: user.id,
                  clientName: user.name || user.firstName,
                  category: hire.serviceCategory,
                  rating,
                  comment,
                });
              } catch (e) {
                setReviewError(errorMessage(e, 'Could not send your review'));
              } finally {
                setReviewSaving(false);
              }
            }}
          />
        </div>
        ))}
    </div>
  );
}

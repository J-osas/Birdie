import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import {
  HireRequest,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  RequestStatus,
  WithdrawalRequest,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira } from '@/lib/utils';
import { KpiCard } from '@/features/admin/overview/KpiCard';
import { getStatusStyle, statusLabel } from '@/data/constants';

type Tab = 'inbound' | 'invoices' | 'escrow' | 'payouts' | 'refunds';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tab, setTab] = useState<Tab>('inbound');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [p, h, w, inv] = await Promise.all([
      dataService.getPayments(),
      dataService.getHireRequests('admin', 'ADMIN'),
      dataService.getWithdrawalRequests(),
      dataService.listInvoices(),
    ]);
    setPayments(p);
    setHires(h);
    setWithdrawals(w);
    setInvoices(inv);
  };

  useEffect(() => {
    load();
  }, []);

  const pendingPayouts = withdrawals.filter((w) => w.status === 'requested');
  const escrowHires = hires.filter((h) => ['funded', 'active', 'completed'].includes(h.status));
  const escrowHeld = escrowHires.reduce((s, h) => s + Number(h.escrowAmount || 0), 0);
  const awaitingPay = hires.filter(
    (h) => h.status === RequestStatus.AWAITING_CONSULTATION_PAY || h.status === RequestStatus.AWAITING_ESCROW
  );
  const readyRelease = hires.filter((h) => h.status === RequestStatus.COMPLETED);
  const failedInitiated = payments.filter(
    (p) => p.status === PaymentStatus.FAILED || p.status === PaymentStatus.INITIATED
  );

  const q = search.trim().toLowerCase();
  const match = (parts: Array<string | undefined>) =>
    !q || parts.filter(Boolean).some((v) => String(v).toLowerCase().includes(q));

  const inboundRows = useMemo(
    () => payments.filter((p) => match([p.hireReferenceCode, p.providerReference, p.type, p.status])),
    [payments, q]
  );
  const escrowRows = useMemo(
    () => escrowHires.filter((h) => match([h.referenceCode, h.clientName, h.professionalName, h.status])),
    [escrowHires, q]
  );
  const payoutRows = useMemo(
    () => withdrawals.filter((w) => match([w.professionalName, w.bankName, w.accountNumber, w.status])),
    [withdrawals, q]
  );
  const invoiceRows = useMemo(
    () =>
      invoices.filter((i) =>
        match([i.invoiceNumber, i.hireReferenceCode, i.clientName, i.professionalName, i.status])
      ),
    [invoices, q]
  );
  const draftInvoices = invoices.filter((i) => i.status === InvoiceStatus.DRAFT);
  const meetingsToClose = hires.filter((h) => h.status === RequestStatus.CONSULTATION_PAID);

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Payments</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Payments hub</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Check Paystack payments, send bills after the meeting, pay professionals when a job is done, and send money back
          if a family cancels early.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Bills to send"
          value={draftInvoices.length}
          hint={`${meetingsToClose.length} meetings to close`}
          onClick={() => setTab('invoices')}
          active={tab === 'invoices'}
        />
        <KpiCard
          label="Waiting for payouts"
          value={pendingPayouts.length}
          onClick={() => setTab('payouts')}
          active={tab === 'payouts'}
        />
        <KpiCard label="Money we hold" value={formatNaira(escrowHeld)} hint={`${escrowHires.length} jobs`} />
        <KpiCard
          label="Waiting on families"
          value={awaitingPay.length}
          onClick={() => setTab('inbound')}
          active={tab === 'inbound'}
        />
        <KpiCard
          label="Ready to pay out"
          value={readyRelease.length}
          onClick={() => setTab('escrow')}
          active={tab === 'escrow'}
        />
        <KpiCard
          label="Payments that failed"
          value={failedInitiated.length}
          onClick={() => setTab('inbound')}
          active={tab === 'inbound'}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search a reference, a name or a Paystack id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['inbound', 'Money in'],
              ['invoices', 'Bills'],
              ['escrow', 'Money we hold'],
              ['payouts', 'Payouts'],
              ['refunds', 'Money back'],
            ] as const
          ).map(([id, label]) => (
            <Button key={id} size="sm" variant={tab === id ? 'primary' : 'secondary'} onClick={() => setTab(id)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      {tab === 'inbound' && (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Hire</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Paystack</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {inboundRows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#F8FAFB] cursor-pointer"
                    onClick={() => p.hireRequestId && navigate(`/app/hires/${p.hireRequestId}`)}
                  >
                    <td className="px-5 py-4 font-bold text-sm">
                      {p.type === 'consultation' ? 'Meeting fee' : p.type === 'escrow' ? 'Job payment' : 'Money back'}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#660033]">
                      {p.hireReferenceCode || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold">{formatNaira(p.amount)}</td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500">{statusLabel(p.status)}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{p.providerReference || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('en-NG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inboundRows.length === 0 && <p className="p-6 text-slate-400 italic">No payments yet.</p>}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="space-y-4">
          {meetingsToClose.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[1.5rem] p-5 space-y-2">
              <p className="text-sm font-bold text-amber-900">
                {meetingsToClose.length} {meetingsToClose.length === 1 ? 'meeting has' : 'meetings have'} been paid for but
                not closed yet
              </p>
              <p className="text-sm text-amber-800 font-medium">
                Open the request and press "Meeting done". Birdie will then prepare the bill for you to check.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {meetingsToClose.slice(0, 6).map((h) => (
                  <Button key={h.id} size="sm" variant="secondary" onClick={() => navigate(`/app/hires/${h.id}`)}>
                    {h.referenceCode}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3">Bill number</th>
                    <th className="px-5 py-3">Family</th>
                    <th className="px-5 py-3">Professional</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Pay by</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRows.map((i) => (
                    <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-[#F8FAFB]">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-[#660033]">{i.invoiceNumber}</td>
                      <td className="px-5 py-4 text-sm font-bold">{i.clientName || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{i.professionalName || 'Not matched yet'}</td>
                      <td className="px-5 py-4 text-sm font-bold">{formatNaira(i.amount)}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-NG') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(i.status)}`}
                        >
                          {statusLabel(i.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/app/invoices/${i.id}`)}>
                            Open
                          </Button>
                          {i.status === InvoiceStatus.DRAFT && (
                            <Button size="sm" onClick={() => navigate(`/app/hires/${i.hireRequestId}`)}>
                              Check and send
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invoiceRows.length === 0 && <p className="p-6 text-slate-400 italic">No bills yet.</p>}
          </div>
        </div>
      )}

      {(tab === 'escrow' || tab === 'refunds') && (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Professional</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'escrow' ? escrowRows : hires.filter((h) =>
                  ['consultation_paid', 'awaiting_escrow', 'funded', 'active', 'completed'].includes(h.status)
                ).filter((h) => match([h.referenceCode, h.professionalName, h.clientName]))).map((h) => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#660033]">
                      <button type="button" onClick={() => navigate(`/app/hires/${h.id}`)}>
                        {h.referenceCode}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm">{h.professionalName || 'Unassigned'}</td>
                    <td className="px-5 py-4 text-sm font-bold">{formatNaira(h.escrowAmount || h.amount || 0)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(h.status)}`}>
                        {statusLabel(h.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {tab === 'escrow' && h.status === RequestStatus.COMPLETED && (
                        <Button
                          size="sm"
                          disabled={busy === h.id}
                          onClick={() =>
                            run(h.id, async () => {
                              await dataService.updateHireStatus(h.id, RequestStatus.SETTLED);
                            })
                          }
                        >
                          Pay the professional
                        </Button>
                      )}
                      {tab === 'refunds' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy === h.id || h.status === RequestStatus.SETTLED}
                          onClick={() => {
                            if (!window.confirm(`Send the money back for ${h.referenceCode}? Paystack has to accept it.`)) return;
                            const type =
                              h.status === RequestStatus.CONSULTATION_PAID || h.status === RequestStatus.AWAITING_ESCROW
                                ? 'consultation'
                                : 'escrow';
                            return run(h.id, async () => {
                              await dataService.refundPayment({ hireRequestId: h.id, paymentType: type });
                            });
                          }}
                        >
                          Send money back
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Professional</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Bank</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {payoutRows.map((w) => (
                  <tr key={w.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-4 font-bold text-sm">{w.professionalName}</td>
                    <td className="px-5 py-4 text-sm font-bold">{formatNaira(w.amount)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {w.bankName} · {w.accountNumber}
                      {!w.bankCode && w.status === 'requested' && (
                        <span className="block text-[10px] font-bold uppercase text-amber-600 mt-1">
                          Bank code missing
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500">{statusLabel(w.status)}</td>
                    <td className="px-5 py-4">
                      {w.status === 'requested' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={busy === w.id}
                            onClick={() => {
                              if (!window.confirm(`Transfer ${formatNaira(w.amount)} to ${w.professionalName} via Paystack?`)) {
                                return;
                              }
                              return run(w.id, async () => {
                                await dataService.approveWithdrawalTransfer(w.id);
                                await dataService.writeAuditLog({
                                  actorId: user?.id,
                                  action: 'payout.approve',
                                  entityType: 'withdrawal',
                                  entityId: w.id,
                                });
                              });
                            }}
                          >
                            Approve and send
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy === w.id}
                            onClick={() =>
                              run(w.id, async () => {
                                await dataService.rejectWithdrawal(w.id, 'Rejected by staff', user?.id);
                              })
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payoutRows.length === 0 && <p className="p-6 text-slate-400 italic">Nobody has asked for a payout.</p>}
        </div>
      )}
    </div>
  );
}

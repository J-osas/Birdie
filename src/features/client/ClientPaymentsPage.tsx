import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Invoice, InvoiceStatus, Payment, PaymentStatus, RequestStatus } from '@/types';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PAYMENT_SHORT } from '@/data/paymentCopy';
import { getStatusStyle, statusLabel } from '@/data/constants';

export default function ClientPaymentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [hiresAwaiting, setHiresAwaiting] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const [payments, hires, bills] = await Promise.all([
      dataService.getPayments(user.id),
      dataService.getHireRequests(user.id, 'CLIENT'),
      dataService.listInvoices(user.id),
    ]);
    setRows(payments);
    setInvoices(bills.filter((b) => b.status !== InvoiceStatus.DRAFT));
    const map: Record<string, string> = {};
    for (const h of hires) {
      if (h.status === RequestStatus.AWAITING_CONSULTATION_PAY || h.status === RequestStatus.AWAITING_ESCROW) {
        map[h.id] = h.status;
      }
    }
    setHiresAwaiting(map);
  };

  useEffect(() => {
    load();
  }, [user]);

  const retry = async (p: Payment) => {
    if (!p.hireRequestId) return;
    setError(null);
    try {
      const type = p.type === 'escrow' ? 'escrow' : 'consultation';
      const res = await dataService.initializePaystackPayment({
        hireRequestId: p.hireRequestId,
        paymentType: type,
      });
      if (res?.authorization_url) window.location.href = res.authorization_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The payment page did not open. Please try again.');
    }
  };

  const payInvoice = async (invoice: Invoice) => {
    setError(null);
    try {
      const res = await dataService.initializePaystackPayment({
        hireRequestId: invoice.hireRequestId,
        paymentType: 'escrow',
        amount: invoice.amount,
      });
      if (res?.authorization_url) window.location.href = res.authorization_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The payment page did not open. Please try again.');
    }
  };

  const unpaid = invoices.filter((i) => i.status === InvoiceStatus.SENT);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Payments</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Your money</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">{PAYMENT_SHORT}</p>
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      {invoices.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-xl font-bold text-[#0A0A0A]">Your bills</h2>
            {unpaid.length > 0 && (
              <span className="text-sm font-bold text-amber-700">
                {unpaid.length} waiting for payment
              </span>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {invoices.map((i) => (
              <div key={i.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] font-bold text-slate-400">{i.invoiceNumber}</p>
                    <p className="text-2xl font-bold text-[#660033] mt-1">{formatNaira(i.amount)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(i.status)}`}
                  >
                    {statusLabel(i.status)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  {i.professionalName || 'Your professional'}
                  {i.dueDate ? ` · pay by ${new Date(i.dueDate).toLocaleDateString('en-NG')}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {i.status === InvoiceStatus.SENT && <Button size="sm" onClick={() => payInvoice(i)}>Pay now</Button>}
                  <Link to={`/app/invoices/${i.id}`}>
                    <Button size="sm" variant="secondary">
                      See the bill
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-[#0A0A0A] -mb-4">Everything you have paid</h2>
      <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
        {rows.length === 0 && (
          <div className="py-16 px-8 space-y-3">
            <CreditCard className="text-slate-300" size={32} />
            <p className="text-[#615A5C] font-medium max-w-md">
              You have not paid for anything yet. Pick someone to help you and we will take it from there.
            </p>
            <Link to="/app" className="inline-block text-[#660033] font-bold text-sm">
              Find someone to help
            </Link>
          </div>
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">What for</th>
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">How it went</th>
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const awaiting = p.hireRequestId ? hiresAwaiting[p.hireRequestId] : '';
                  const canRetry =
                    (p.status === PaymentStatus.FAILED || p.status === PaymentStatus.INITIATED) &&
                    ((p.type === 'consultation' && awaiting === RequestStatus.AWAITING_CONSULTATION_PAY) ||
                      (p.type === 'escrow' && awaiting === RequestStatus.AWAITING_ESCROW));
                  return (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-4 font-bold text-sm">
                        {p.type === 'consultation' ? 'Meeting fee' : p.type === 'escrow' ? 'Job payment' : 'Money back'}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-[#660033]">
                        {p.hireRequestId ? (
                          <Link to={`/app/hires/${p.hireRequestId}`}>{p.hireReferenceCode || 'Open request'}</Link>
                        ) : (
                          p.hireReferenceCode || '—'
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold">{formatNaira(p.amount)}</td>
                      <td className="px-5 py-4 text-xs font-bold tracking-wide text-slate-500">
                        {statusLabel(p.status)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        {canRetry && (
                          <Button size="sm" onClick={() => retry(p)}>
                            Try again
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

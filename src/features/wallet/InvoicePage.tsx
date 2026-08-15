import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Invoice, InvoiceStatus, UserRole } from '@/types';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { getStatusStyle, statusLabel } from '@/data/constants';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvoicePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setInvoice(await dataService.getInvoice(id));
      setLoading(false);
    })();
  }, [id]);

  const pay = async () => {
    if (!invoice) return;
    setError(null);
    try {
      const res = await dataService.initializePaystackPayment({
        hireRequestId: invoice.hireRequestId,
        paymentType: 'escrow',
        amount: invoice.amount,
      });
      if (!res?.authorization_url) throw new Error('We could not open the payment page. Please try again.');
      window.location.href = res.authorization_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not open the payment page. Please try again.');
    }
  };

  if (loading) return <p className="text-slate-400">One moment…</p>;
  if (!invoice) return <p className="text-slate-400">We could not find this bill.</p>;

  const isClient = user?.role === UserRole.CLIENT;
  const canPay = isClient && invoice.status === InvoiceStatus.SENT;

  return (
    <div className="w-full max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/app/payments" className="text-sm font-bold text-slate-500 hover:text-[#660033]">
          ← Back to your money
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer size={16} className="mr-1.5" />
            Print or save
          </Button>
          {canPay && (
            <Button size="sm" onClick={pay}>
              Pay {formatNaira(invoice.amount)}
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm font-bold text-rose-600 print:hidden">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-6 print:border-0 print:rounded-none print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-2xl font-bold text-[#660033]">Birdie</p>
            <p className="text-sm text-slate-500 font-medium">Trusted help for your home</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bill number</p>
            <p className="font-mono text-sm font-bold text-[#0A0A0A]">{invoice.invoiceNumber}</p>
            <span
              className={`inline-block mt-2 px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(invoice.status)}`}
            >
              {statusLabel(invoice.status)}
            </span>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-5">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bill for</dt>
            <dd className="font-bold text-[#0A0A0A] mt-1">{invoice.clientName || 'You'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional</dt>
            <dd className="font-bold text-[#0A0A0A] mt-1">{invoice.professionalName || 'Being matched'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Request</dt>
            <dd className="font-medium text-slate-700 mt-1">
              {invoice.hireReferenceCode ? (
                <Link to={`/app/hires/${invoice.hireRequestId}`} className="text-[#660033] font-bold">
                  {invoice.hireReferenceCode}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sent on</dt>
            <dd className="font-medium text-slate-700 mt-1">{formatDate(invoice.sentAt || invoice.createdAt)}</dd>
          </div>
        </dl>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">What you are paying for</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-4">
                  <p className="font-bold text-[#0A0A0A]">{invoice.serviceRequested || 'Home help'}</p>
                  <p className="text-sm text-slate-500 font-medium">
                    {invoice.duration ? `${invoice.duration}` : 'As agreed on the call'}
                    {invoice.startDate ? ` · starts ${formatDate(invoice.startDate)}` : ''}
                  </p>
                </td>
                <td className="px-5 py-4 text-right font-bold text-[#0A0A0A]">{formatNaira(invoice.amount)}</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#0A0A0A]">Total to pay</td>
                <td className="px-5 py-4 text-right text-xl font-bold text-[#660033]">{formatNaira(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {invoice.dueDate && (
          <p className="text-sm font-bold text-slate-700">Please pay by {formatDate(invoice.dueDate)}.</p>
        )}
        {invoice.notes && (
          <div className="bg-[#F8FAFB] border border-slate-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Note from Birdie</p>
            <p className="text-sm font-medium text-slate-700 mt-1 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        <p className="text-sm text-slate-500 font-medium border-t border-slate-100 pt-5">
          You pay Birdie, not the professional. Birdie keeps your money safe and only pays the professional after the job
          is done. If the work does not happen, we send your money back.
        </p>

        {invoice.paidAt && (
          <p className="text-sm font-bold text-emerald-700">Paid on {formatDate(invoice.paidAt)}. Thank you.</p>
        )}
      </div>

      {canPay && (
        <div className="print:hidden">
          <Button onClick={pay}>Pay {formatNaira(invoice.amount)} now</Button>
        </div>
      )}
    </div>
  );
}

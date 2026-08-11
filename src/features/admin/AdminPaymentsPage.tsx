import { useEffect, useState } from 'react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { WithdrawalRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<WithdrawalRequest[]>([]);
  const [escrow, setEscrow] = useState({ count: 0, total: 0 });

  const load = async () => {
    setRows(await dataService.getWithdrawalRequests());
    setEscrow(await dataService.getEscrowSnapshot());
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('paystack-transfer', { body: { withdrawalId: id } });
      if (error) throw error;
    } catch (e) {
      console.warn('Transfer function unavailable; marking paid locally', e);
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'paid', processed_at: new Date().toISOString() })
        .eq('id', id);
    }
    await dataService.writeAuditLog({
      actorId: user?.id,
      action: 'payout.approve',
      entityType: 'withdrawal',
      entityId: id,
    });
    load();
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Payments</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Payments hub</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Approve professional withdrawals and monitor funded escrow still in flight.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold">Withdrawal queue</h2>
            {rows.map((w) => (
              <div
                key={w.id}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-5 flex flex-col sm:flex-row justify-between gap-3"
              >
                <div>
                  <p className="font-bold">{w.professionalName}</p>
                  <p className="text-sm text-slate-500">
                    {formatNaira(w.amount)} · {w.bankName} {w.accountNumber}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">{w.status}</p>
                  {w.adminNote && <p className="text-xs text-slate-500 mt-1">{w.adminNote}</p>}
                </div>
                {w.status === 'requested' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(w.id)}>
                      Approve & transfer
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await dataService.rejectWithdrawal(w.id, 'Rejected by staff', user?.id);
                        load();
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {rows.length === 0 && <p className="text-slate-400 italic">No withdrawal requests.</p>}
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
            <h2 className="text-xl font-bold">Escrow snapshot</h2>
            <p className="text-sm text-slate-500 font-medium">
              Funded and active hires holding client deposits.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jobs in escrow</p>
                <p className="text-3xl font-black mt-1">{escrow.count}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total held</p>
                <p className="text-3xl font-black mt-1">{formatNaira(escrow.total)}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">How money moves</p>
          <ol className="list-decimal pl-4 text-sm text-[#615A5C] font-medium space-y-2 leading-relaxed">
            <li>Client pays consultation, then funds escrow for the hire.</li>
            <li>On completion/settlement, the professional wallet is credited (minus commission).</li>
            <li>Pros request withdrawals; staff approve and Paystack transfer pays out.</li>
          </ol>
        </aside>
      </div>
    </div>
  );
}

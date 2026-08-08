import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { ProfessionalStatus, Wallet, WalletTransaction, WithdrawalRequest } from '@/types';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

export default function WalletPage() {
  const { user, settings, proProfile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const verified =
    !proProfile ||
    proProfile.status === ProfessionalStatus.VERIFIED ||
    proProfile.status === ProfessionalStatus.APPROVED;

  const load = async () => {
    if (!user) return;
    const w = await dataService.getWallet(user.id);
    setWallet(w);
    if (w) setTxs(await dataService.getTransactions(w.id));
    setWithdrawals(await dataService.getWithdrawalRequests(user.id));
  };

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-3xl font-bold">Wallet</h1>
      <div className="bg-[#660033] text-white rounded-[2.5rem] p-8 grid sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Available</p>
          <p className="text-4xl font-black mt-2">{formatNaira(wallet?.availableBalance || 0)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Escrow</p>
          <p className="text-2xl font-bold mt-2">{formatNaira(wallet?.escrowBalance || 0)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Pending</p>
          <p className="text-2xl font-bold mt-2">{formatNaira(wallet?.pendingEarnings || 0)}</p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Request withdrawal</h2>
          {!verified && (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Lock size={12} /> Unlocks when verified
            </span>
          )}
        </div>
        {!verified ? (
          <p className="text-sm text-slate-500 font-medium">
            Bank payout details unlock after Birdie verifies your documents and assessment.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Minimum {formatNaira(settings?.min_withdrawal_amount || 5000)}. Admin approves, then Paystack Transfer
              pays out.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount (NGN)</Label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Bank name</Label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Account number</Label>
                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Account name</Label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={async () => {
                if (!wallet || !user) return;
                const n = Number(amount);
                if (!n || n > wallet.availableBalance) {
                  alert('Invalid amount');
                  return;
                }
                await dataService.requestWithdrawal({
                  walletId: wallet.id,
                  professionalId: user.id,
                  professionalName: user.name || user.firstName,
                  amount: n,
                  bankName,
                  accountNumber,
                  accountName,
                });
                setAmount('');
                load();
              }}
            >
              Submit withdrawal
            </Button>
          </>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Transactions</h2>
        {txs.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between">
            <div>
              <p className="font-bold text-sm">{t.description || t.type}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{t.status}</p>
            </div>
            <p className="font-black text-[#660033]">{formatNaira(t.amount)}</p>
          </div>
        ))}
        {txs.length === 0 && <p className="text-slate-400 italic">No transactions yet.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Withdrawals</h2>
        {withdrawals.map((w) => (
          <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between">
            <div>
              <p className="font-bold">{formatNaira(w.amount)}</p>
              <p className="text-xs text-slate-500">
                {w.bankName} · {w.accountNumber}
              </p>
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">{w.status}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

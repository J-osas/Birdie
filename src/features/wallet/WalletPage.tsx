import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, Wallet as WalletIcon, Banknote } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { ProfessionalStatus, Wallet, WalletTransaction, WithdrawalRequest } from '@/types';
import { formatNaira } from '@/lib/utils';
import { IMAGES } from '@/data/images';
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
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Payments</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Earnings & payouts</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Track escrow, released earnings, and bank withdrawals. Funds move only after job milestones clear.
        </p>
      </div>

      <div className="bg-[#660033] text-white rounded-[1.75rem] p-8 grid sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Available</p>
          <p className="text-3xl md:text-4xl font-black mt-2">{formatNaira(wallet?.availableBalance || 0)}</p>
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

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#0A0A0A]">Request withdrawal</h2>
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
                  Minimum {formatNaira(settings?.min_withdrawal_amount || 5000)}. Admin approves, then Paystack
                  Transfer pays out.
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
            <h2 className="text-xl font-bold text-[#0A0A0A]">Transactions</h2>
            {txs.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-4 flex justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm">{t.description || t.type}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.status}</p>
                </div>
                <p className="font-black text-[#660033]">{formatNaira(t.amount)}</p>
              </div>
            ))}
            {txs.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-8 text-sm text-[#615A5C] font-medium">
                No transactions yet. Completed jobs will post escrow releases here.
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0A0A0A]">Withdrawals</h2>
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-4 flex justify-between gap-3"
              >
                <div>
                  <p className="font-bold">{formatNaira(w.amount)}</p>
                  <p className="text-xs text-slate-500">
                    {w.bankName} · {w.accountNumber}
                  </p>
                </div>
                <p className="text-xs font-bold uppercase text-slate-400">{w.status}</p>
              </div>
            ))}
            {withdrawals.length === 0 && (
              <p className="text-slate-400 italic text-sm px-1">No withdrawal requests yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-44 border border-slate-200">
            <img src={IMAGES.provider} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-[#0A0A0A]">How money moves</h2>
            <ul className="space-y-4 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <Shield className="shrink-0 text-[#660033]" size={18} />
                <span>
                  <strong className="text-[#0A0A0A]">Escrow</strong> — client funds held until work is confirmed
                </span>
              </li>
              <li className="flex gap-3">
                <WalletIcon className="shrink-0 text-[#660033]" size={18} />
                <span>
                  <strong className="text-[#0A0A0A]">Available</strong> — ready to withdraw after release
                </span>
              </li>
              <li className="flex gap-3">
                <Banknote className="shrink-0 text-[#660033]" size={18} />
                <span>
                  <strong className="text-[#0A0A0A]">Withdraw</strong> — admin review, then bank transfer
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">Tip</p>
            <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
              Keep availability updated on your{' '}
              <Link to="/app" className="font-bold text-[#660033] underline-offset-2 hover:underline">
                dashboard
              </Link>{' '}
              so clients can book you when you are free to earn.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

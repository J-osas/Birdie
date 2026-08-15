import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, Wallet as WalletIcon, Banknote } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { ProfessionalStatus, Wallet, WalletTransaction, WithdrawalRequest } from '@/types';
import { formatNaira } from '@/lib/utils';
import { IMAGES } from '@/data/images';
import { statusLabel } from '@/data/constants';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';

export default function WalletPage() {
  const { user, settings, proProfile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

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
    try {
      setBanks(await dataService.listPaystackBanks());
    } catch {
      setBanks([]);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Money</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">What you have earned</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          See the money Birdie is holding for you, the money you can take out, and the payments already sent to your
          bank. Money only moves after a job is finished.
        </p>
      </div>

      <div className="bg-[#660033] text-white rounded-[1.75rem] p-8 grid sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Ready to withdraw</p>
          <p className="text-3xl md:text-4xl font-black mt-2">{formatNaira(wallet?.availableBalance || 0)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Birdie is holding</p>
          <p className="text-2xl font-bold mt-2">{formatNaira(wallet?.escrowBalance || 0)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Coming soon</p>
          <p className="text-2xl font-bold mt-2">{formatNaira(wallet?.pendingEarnings || 0)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#0A0A0A]">Take your money out</h2>
              {!verified && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Lock size={12} /> Opens once we finish checking you
                </span>
              )}
            </div>
            {!verified ? (
              <p className="text-sm text-slate-500 font-medium">
                You can add your bank details once we finish checking your papers and your test.
              </p>
            ) : settings?.withdrawals_enabled === false ? (
              <p className="text-sm font-medium text-[#615A5C]">
                Withdrawals are paused right now. You can still see your money. Try again later.
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  The smallest amount you can take out is {formatNaira(settings?.min_withdrawal_amount || 5000)}. Birdie
                  checks it, then the money goes to your bank.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>How much (NGN)</Label>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Your bank</Label>
                    <Select
                      value={bankCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setBankCode(code);
                        setBankName(banks.find((b) => b.code === code)?.name || '');
                      }}
                    >
                      <option value="">Pick your bank</option>
                      {banks.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Your account number</Label>
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Name on the account</Label>
                    <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  </div>
                </div>
                {formError && <p className="text-sm font-bold text-rose-600">{formError}</p>}
                <Button
                  onClick={async () => {
                    if (!wallet || !user) return;
                    setFormError(null);
                    try {
                      const n = Number(amount);
                      await dataService.requestWithdrawal({
                        walletId: wallet.id,
                        professionalId: user.id,
                        professionalName: user.name || user.firstName,
                        amount: n,
                        bankName,
                        bankCode,
                        accountNumber,
                        accountName,
                      });
                      setAmount('');
                      load();
                    } catch (e) {
                      setFormError(e instanceof Error ? e.message : 'We could not send your request');
                    }
                  }}
                >
                  Send my request
                </Button>
              </>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0A0A0A]">Money in and out</h2>
            {txs.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-4 flex justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm">{t.description || statusLabel(t.type)}</p>
                  {t.hireReferenceCode && (
                    <p className="font-mono text-[11px] font-bold text-[#660033]">{t.hireReferenceCode}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{statusLabel(t.status)}</p>
                </div>
                <p className="font-black text-[#660033]">{formatNaira(t.amount)}</p>
              </div>
            ))}
            {txs.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-8 text-sm text-[#615A5C] font-medium">
                Nothing here yet. When a job is finished and Birdie pays you, it will show up here.
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0A0A0A]">Money sent to your bank</h2>
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
                <p className="text-xs font-bold uppercase text-slate-400">{statusLabel(w.status)}</p>
              </div>
            ))}
            {withdrawals.length === 0 && (
              <p className="text-slate-400 italic text-sm px-1">You have not asked for any money yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-44 border border-slate-200">
            <img src={IMAGES.provider} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-[#0A0A0A]">How you get paid</h2>
            <ul className="space-y-4 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <Shield className="shrink-0 text-[#660033]" size={18} />
                <span>
                  <strong className="text-[#0A0A0A]">Birdie is holding</strong> — the family has paid and we keep the
                  money safe until the job is done
                </span>
              </li>
              <li className="flex gap-3">
                <WalletIcon className="shrink-0 text-[#660033]" size={18} />
                <span>
                  <strong className="text-[#0A0A0A]">Ready to withdraw</strong> — the job is done, so this money is
                  yours
                </span>
              </li>
              <li className="flex gap-3">
                <Banknote className="shrink-0 text-[#660033]" size={18} />
                <span>
                  <strong className="text-[#0A0A0A]">Ask for your money</strong> — we check the request, then send it to
                  your bank
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">One tip</p>
            <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
              Say on your{' '}
              <Link to="/app" className="font-bold text-[#660033] underline-offset-2 hover:underline">
                home page
              </Link>{' '}
              when you are free, so families know they can book you.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { Input, Label } from '@/components/ui/Input';
import { SectionCard } from './SectionCard';

export function MoneySection({
  fee,
  commission,
  holdDays,
  minWithdrawal,
  invoiceDueDays,
  setFee,
  setCommission,
  setHoldDays,
  setMinWithdrawal,
  setInvoiceDueDays,
  onSave,
  saving,
  saved,
  error,
}: {
  fee: string;
  commission: string;
  holdDays: string;
  minWithdrawal: string;
  invoiceDueDays: string;
  setFee: (v: string) => void;
  setCommission: (v: string) => void;
  setHoldDays: (v: string) => void;
  setMinWithdrawal: (v: string) => void;
  setInvoiceDueDays: (v: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <SectionCard
      id="money"
      title="Money"
      hint="These numbers apply to new requests. Anything already in progress keeps the old price."
      onSave={onSave}
      saving={saving}
      saved={saved}
      error={error}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Meeting fee (NGN, once per request)</Label>
          <Input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5">
          <Label>What Birdie keeps (%)</Label>
          <Input value={commission} onChange={(e) => setCommission(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5">
          <Label>Days we hold the money after a job is done</Label>
          <Input value={holdDays} onChange={(e) => setHoldDays(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5">
          <Label>Days a bill is due</Label>
          <Input value={invoiceDueDays} onChange={(e) => setInvoiceDueDays(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Smallest withdrawal (NGN)</Label>
          <Input value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} inputMode="numeric" />
        </div>
      </div>
    </SectionCard>
  );
}

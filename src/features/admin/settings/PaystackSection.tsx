import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { SectionCard } from './SectionCard';

type PaystackStatus = {
  mode: 'test' | 'live';
  publicKeyTest: string;
  publicKeyLive: string;
  secretLast4Test: string | null;
  secretLast4Live: string | null;
  webhookUrl: string;
};

export function PaystackSection({
  isAdmin,
  mode,
  secretSaved,
}: {
  isAdmin: boolean;
  mode?: 'test' | 'live' | null;
  secretSaved?: boolean;
}) {
  const [status, setStatus] = useState<PaystackStatus | null>(null);
  const [publicTest, setPublicTest] = useState('');
  const [publicLive, setPublicLive] = useState('');
  const [secretTest, setSecretTest] = useState('');
  const [secretLive, setSecretLive] = useState('');
  const [nextMode, setNextMode] = useState<'test' | 'live'>('test');
  const [confirmLive, setConfirmLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const { data, error: err } = await supabase.functions.invoke('paystack-settings', { body: { op: 'get' } });
    if (err) {
      setError(err.message || 'Could not load card payment settings');
      return;
    }
    const body = data as PaystackStatus;
    setStatus(body);
    setPublicTest(body.publicKeyTest || '');
    setPublicLive(body.publicKeyLive || '');
    setNextMode(body.mode || 'test');
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  if (!isAdmin) {
    const live = mode === 'live';
    return (
      <SectionCard
        id="payments"
        title="Card payments"
        hint="Only an admin can change Paystack keys. You can see whether we are in test or live mode."
      >
        <p className="text-sm font-bold text-[var(--app-ink)]">
          {live ? 'Live mode' : 'Test mode'}
          {' · '}
          {secretSaved ? 'Secret key is saved' : 'Secret key is not set yet'}
        </p>
      </SectionCard>
    );
  }

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      if (nextMode === 'live' && status?.mode !== 'live' && !confirmLive) {
        throw new Error('Tick the box to confirm real money will move.');
      }
      const { data, error: err } = await supabase.functions.invoke('paystack-settings', {
        body: {
          op: 'save',
          mode: nextMode,
          publicKeyTest: publicTest.trim() || null,
          publicKeyLive: publicLive.trim() || null,
          secretKeyTest: secretTest.trim() || null,
          secretKeyLive: secretLive.trim() || null,
        },
      });
      if (err) throw err;
      if (data?.error) throw new Error(String(data.error));
      setSecretTest('');
      setSecretLive('');
      setConfirmLive(false);
      setSaved(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save Paystack settings');
    } finally {
      setSaving(false);
    }
  };

  const webhook = status?.webhookUrl || '';
  const currentLast4 = nextMode === 'live' ? status?.secretLast4Live : status?.secretLast4Test;

  return (
    <SectionCard
      id="payments"
      title="Card payments"
      hint="Families pay with Paystack. Test mode uses fake cards. Live mode moves real naira."
      onSave={save}
      saving={saving}
      saved={saved}
      error={error}
    >
      <div className="flex flex-wrap gap-2">
        {(['test', 'live'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setNextMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border ${
              nextMode === m
                ? 'bg-[#660033] text-white border-[#660033]'
                : 'bg-[var(--app-surface)] text-[var(--app-ink)] border-[var(--app-border)]'
            }`}
          >
            {m === 'test' ? 'Test' : 'Live'}
          </button>
        ))}
      </div>
      <p className="text-sm font-medium text-[var(--app-muted)]">
        {nextMode === 'test'
          ? `Test mode · ${currentLast4 ? `secret saved (••••${currentLast4})` : 'secret missing'}. Test card: 4084 0840 8408 4081, any future date, CVV 408, PIN 0000, OTP 123456.`
          : `Live mode · ${currentLast4 ? `secret saved (••••${currentLast4})` : 'secret missing'}. Real money will move.`}
      </p>
      {nextMode === 'live' && status?.mode !== 'live' && (
        <label className="flex items-start gap-2 text-sm font-bold text-rose-700">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={confirmLive}
            onChange={(e) => setConfirmLive(e.target.checked)}
          />
          Real money will move.
        </label>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Test public key (pk_test_…)</Label>
          <Input value={publicTest} onChange={(e) => setPublicTest(e.target.value)} autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label>Test secret key (sk_test_…)</Label>
          <Input
            type="password"
            value={secretTest}
            onChange={(e) => setSecretTest(e.target.value)}
            placeholder={status?.secretLast4Test ? `Saved · ••••${status.secretLast4Test}` : 'Paste to replace'}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Live public key (pk_live_…)</Label>
          <Input value={publicLive} onChange={(e) => setPublicLive(e.target.value)} autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label>Live secret key (sk_live_…)</Label>
          <Input
            type="password"
            value={secretLive}
            onChange={(e) => setSecretLive(e.target.value)}
            placeholder={status?.secretLast4Live ? `Saved · ••••${status.secretLast4Live}` : 'Paste to replace'}
            autoComplete="new-password"
          />
        </div>
      </div>
      <p className="text-xs font-medium text-[var(--app-muted)]">
        Leave a secret box empty to keep the key already saved. We never show a secret key after you save it.
      </p>

      {webhook && (
        <div className="space-y-1.5">
          <Label>Webhook URL (paste this in Paystack)</Label>
          <div className="flex gap-2">
            <Input readOnly value={webhook} />
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(webhook);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

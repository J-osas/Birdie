import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/AuthProvider';
import { Input, Label } from '@/components/ui/Input';
import { SectionCard } from './SectionCard';

type Provider = 'groq' | 'openai';

export function OpenAiSection({
  isAdmin,
  provider,
  openaiLast4,
  groqLast4,
}: {
  isAdmin: boolean;
  provider?: string | null;
  openaiLast4?: string | null;
  groqLast4?: string | null;
}) {
  const { refresh } = useAuth();
  const [choice, setChoice] = useState<Provider>(provider === 'openai' ? 'openai' : 'groq');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [savedOpenai, setSavedOpenai] = useState(openaiLast4 || null);
  const [savedGroq, setSavedGroq] = useState(groqLast4 || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChoice(provider === 'openai' ? 'openai' : 'groq');
    setSavedOpenai(openaiLast4 || null);
    setSavedGroq(groqLast4 || null);
  }, [provider, openaiLast4, groqLast4]);

  if (!isAdmin) {
    return (
      <SectionCard
        id="openai"
        title="AI"
        hint="Only an admin can paste keys or switch provider. Operations can still use Studio and the help bubble."
      >
        <p className="text-sm font-medium text-[var(--app-muted)]">
          {choice === 'groq'
            ? savedGroq
              ? `Free Groq is on (••••${savedGroq}).`
              : 'Free Groq is selected, but no Groq key is saved yet.'
            : savedOpenai
              ? `OpenAI is on (••••${savedOpenai}).`
              : 'OpenAI is selected, but no OpenAI key is saved yet.'}
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      id="openai"
      title="AI"
      hint="Use free Groq while you build. OpenAI stays saved and off until you switch to it. Keys stay on the server."
      onSave={async () => {
        setSaving(true);
        setSaved(false);
        setError(null);
        try {
          const { data: providerData, error: providerErr } = await supabase.functions.invoke('studio-settings', {
            body: { op: 'set_provider', provider: choice },
          });
          if (providerErr) throw providerErr;
          if (providerData?.error) throw new Error(providerData.error);

          if (groqKey.trim()) {
            const { data, error: err } = await supabase.functions.invoke('studio-settings', {
              body: { op: 'save', kind: 'groq', secret: groqKey.trim() },
            });
            if (err) throw err;
            if (data?.error) throw new Error(data.error);
            setSavedGroq(data?.last4 || savedGroq);
            setGroqKey('');
          }
          if (openaiKey.trim()) {
            const { data, error: err } = await supabase.functions.invoke('studio-settings', {
              body: { op: 'save', kind: 'openai', secret: openaiKey.trim() },
            });
            if (err) throw err;
            if (data?.error) throw new Error(data.error);
            setSavedOpenai(data?.last4 || savedOpenai);
            setOpenaiKey('');
          }

          setSaved(true);
          await refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not save.');
        } finally {
          setSaving(false);
        }
      }}
      saving={saving}
      saved={saved}
      error={error}
    >
      <fieldset className="space-y-3">
        <Label>Which AI to use</Label>
        <label className="flex items-start gap-3 text-sm font-medium">
          <input
            type="radio"
            name="ai-provider"
            className="mt-1 h-4 w-4 text-[#660033]"
            checked={choice === 'groq'}
            onChange={() => setChoice('groq')}
          />
          <span>
            <span className="font-bold text-[var(--app-ink)]">Free (Groq)</span>
            <span className="block text-[var(--app-muted)]">No OpenAI bill. Best while the help bubble is still new.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm font-medium">
          <input
            type="radio"
            name="ai-provider"
            className="mt-1 h-4 w-4 text-[#660033]"
            checked={choice === 'openai'}
            onChange={() => setChoice('openai')}
          />
          <span>
            <span className="font-bold text-[var(--app-ink)]">OpenAI (paid)</span>
            <span className="block text-[var(--app-muted)]">Off until you put credits on the OpenAI account.</span>
          </span>
        </label>
      </fieldset>
      <div className="space-y-1.5">
        <Label>Groq secret (gsk-…)</Label>
        <Input
          type="password"
          value={groqKey}
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder={savedGroq ? `Saved · ••••${savedGroq}` : 'Paste to save'}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1.5">
        <Label>OpenAI secret (sk-…)</Label>
        <Input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder={savedOpenai ? `Saved · ••••${savedOpenai}` : 'Paste to save later'}
          autoComplete="new-password"
        />
      </div>
    </SectionCard>
  );
}

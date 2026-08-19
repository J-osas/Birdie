import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/AuthProvider';
import { Input, Label } from '@/components/ui/Input';
import { SectionCard } from './SectionCard';

export function OpenAiSection({ isAdmin, last4 }: { isAdmin: boolean; last4?: string | null }) {
  const { refresh } = useAuth();
  const [key, setKey] = useState('');
  const [savedLast4, setSavedLast4] = useState(last4 || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSavedLast4(last4 || null);
  }, [last4]);

  if (!isAdmin) {
    return (
      <SectionCard
        id="openai"
        title="Page AI"
        hint="Only an admin can paste the OpenAI key. Operations can still use Studio once a key is saved."
      >
        <p className="text-sm font-medium text-[var(--app-muted)]">
          {savedLast4
            ? `A key is saved (••••${savedLast4}). Studio and the public help bubble can use it.`
            : 'No OpenAI key saved yet.'}
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      id="openai"
      title="Page AI (OpenAI)"
      hint="The key stays on the server. Studio uses it for page drafts. The public help bubble uses it for answers and links only — never hiring or payments."
      onSave={async () => {
        if (!key.trim()) {
          setError('Paste a key to save.');
          return;
        }
        setSaving(true);
        setSaved(false);
        setError(null);
        try {
          const { data, error: err } = await supabase.functions.invoke('studio-settings', {
            body: { op: 'save', secret: key.trim() },
          });
          if (err) throw err;
          if (data?.error) throw new Error(data.error);
          setSavedLast4(data?.last4 || savedLast4);
          setKey('');
          setSaved(true);
          await refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not save the key.');
        } finally {
          setSaving(false);
        }
      }}
      saving={saving}
      saved={saved}
      error={error}
    >
      <div className="space-y-1.5">
        <Label>OpenAI secret (sk-…)</Label>
        <Input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={savedLast4 ? `Saved · ••••${savedLast4}` : 'Paste to save'}
          autoComplete="new-password"
        />
      </div>
    </SectionCard>
  );
}

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export function SectionCard({
  id,
  title,
  hint,
  children,
  onSave,
  saving,
  saved,
  error,
}: {
  id: string;
  title: string;
  hint: string;
  children: ReactNode;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
  saved?: boolean;
  error?: string | null;
}) {
  return (
    <section
      id={id}
      className="rounded-[1.75rem] border p-6 space-y-5 scroll-mt-24 bg-[var(--app-surface)] border-[var(--app-border)]"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--app-ink)]">{title}</h2>
        <p className="text-sm font-medium text-[var(--app-muted)]">{hint}</p>
      </div>
      {children}
      {onSave && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button onClick={() => void onSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {saved && <p className="text-sm font-bold text-emerald-700">Saved.</p>}
          {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
        </div>
      )}
    </section>
  );
}

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  danger,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  danger?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0 border-[var(--app-border)]">
      <span className="space-y-1 min-w-0">
        <span className={`block text-sm font-bold ${danger ? 'text-rose-700' : 'text-[var(--app-ink)]'}`}>
          {label}
        </span>
        <span className="block text-sm font-medium text-[var(--app-muted)]">{hint}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 rounded border-slate-300 text-[#660033] focus:ring-[#660033]/20"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import {
  BlogPost,
  CommunicationLog,
  CommunicationTemplate,
  UserRole,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea } from '@/components/ui/Input';
import AccountPage from '@/features/client/AccountPage';

export function SettingsPage() {
  const { settings, user, refresh } = useAuth();
  const [fee, setFee] = useState(String(settings?.consultation_fee_ngn || 10000));
  const [commission, setCommission] = useState(String(settings?.commission_rate || 15));
  const [escrowDays, setEscrowDays] = useState(String(settings?.escrow_release_days || 3));
  const [minWithdrawal, setMinWithdrawal] = useState(String(settings?.min_withdrawal_amount || 5000));
  const [gaId, setGaId] = useState(settings?.ga_measurement_id || '');

  useEffect(() => {
    if (settings) {
      setFee(String(settings.consultation_fee_ngn));
      setCommission(String(settings.commission_rate));
      setEscrowDays(String(settings.escrow_release_days));
      setMinWithdrawal(String(settings.min_withdrawal_amount || 5000));
      setGaId(settings.ga_measurement_id || '');
    }
  }, [settings]);

  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const isClient = user?.role === UserRole.CLIENT;
  const isPro = user?.role === UserRole.PROFESSIONAL;

  if (isClient || isPro) {
    return <AccountPage />;
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Settings</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Platform settings</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Tune consultation fees, commission, escrow, withdrawals, and optional analytics ID.
        </p>
      </div>
      {isStaff ? (
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Consultation fee (NGN, once per hire)</Label>
              <Input value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Commission rate (%)</Label>
              <Input value={commission} onChange={(e) => setCommission(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Escrow release days</Label>
              <Input value={escrowDays} onChange={(e) => setEscrowDays(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Minimum withdrawal (NGN)</Label>
              <Input value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>GA Measurement ID (optional)</Label>
              <Input
                placeholder="G-XXXXXXXX"
                value={gaId}
                onChange={(e) => setGaId(e.target.value)}
              />
            </div>
            <Button
              onClick={async () => {
                await dataService.updatePlatformSettings({
                  consultation_fee_ngn: Number(fee),
                  commission_rate: Number(commission),
                  escrow_release_days: Number(escrowDays),
                  min_withdrawal_amount: Number(minWithdrawal),
                  ga_measurement_id: gaId || null,
                });
                await refresh();
                alert('Settings saved');
              }}
            >
              Save settings
            </Button>
          </div>
          <aside className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">Note</p>
            <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
              Fee and commission changes apply to new hires. GA ID is stored for a future Analytics embed —
              the current Analytics page uses in-app Birdie metrics only.
            </p>
          </aside>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-2 max-w-xl">
          <p className="font-bold">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <p className="text-xs font-bold uppercase text-slate-400">{user?.role}</p>
        </div>
      )}
    </div>
  );
}

export function CmsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  const load = () => dataService.getBlogPosts(false).then(setPosts);
  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setPublished(true);
  };

  const startEdit = async (id: string) => {
    const post = await dataService.getBlogPost(id);
    if (!post) return;
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setPublished(post.published);
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Content (CMS)</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Blog content</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Create and edit blog posts. Marketing pages (Home/About) stay code-driven in this pass.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <p className="text-sm font-bold text-slate-500">
            {editingId ? 'Editing post' : 'New post'}
          </p>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <TextArea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <TextArea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-slate-300"
            />
            Published
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                if (!title || !slug) return;
                await dataService.upsertBlogPost({
                  id: editingId || undefined,
                  title,
                  slug,
                  excerpt,
                  content,
                  published,
                  author: 'Birdie',
                });
                reset();
                load();
              }}
            >
              {editingId ? 'Save changes' : published ? 'Publish article' : 'Save draft'}
            </Button>
            {editingId && (
              <Button size="sm" variant="secondary" onClick={reset}>
                Cancel edit
              </Button>
            )}
          </div>
        </div>
        <aside className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">Tips</p>
          <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
            Use clear slugs (`hiring-guide`). Drafts stay off the public blog until Published is checked.
          </p>
        </aside>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">All posts</h2>
        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-xs text-slate-400">
                {p.slug} · {p.published ? 'Published' : 'Draft'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => startEdit(p.id)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await dataService.upsertBlogPost({
                    ...p,
                    published: !p.published,
                  });
                  load();
                }}
              >
                {p.published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunicationsPage() {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);

  useEffect(() => {
    dataService.listCommunicationTemplates().then(setTemplates);
    dataService.listCommunicationLogs().then(setLogs);
  }, []);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Communications</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Templates & logs</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Production email via Edge Function + Resend is a follow-up. In-app notifications remain the source of
          truth for verification today.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Templates</h2>
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-[1.75rem] p-5 space-y-1">
              <p className="font-bold">{t.name}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                {t.slug} · {t.status}
              </p>
              <p className="text-sm text-slate-600 mt-2">{t.subject}</p>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-slate-400 italic text-sm">
              No templates in `communication_templates` yet. Seed them in Supabase when you wire Resend.
            </p>
          )}
        </section>

        <aside className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">Triggers checklist</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 font-medium">
            <li>Hire request submitted → client + admin</li>
            <li>Consultation / escrow payment success</li>
            <li>Professional verified (in-app live; email follow-up)</li>
            <li>Withdrawal paid</li>
          </ul>
        </aside>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Recent logs</h2>
        {logs.map((l) => (
          <div key={l.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-bold text-sm">{l.subject}</p>
            <p className="text-xs text-slate-500 mt-1">
              {l.toEmail} · {l.status} · {l.templateSlug || '—'} ·{' '}
              {l.sentAt ? new Date(l.sentAt).toLocaleString() : '—'}
            </p>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-slate-400 italic text-sm">No communication logs yet.</p>
        )}
      </section>
    </div>
  );
}

/** @deprecated Use AdminPaymentsPage — kept for import safety */
export function PayoutsPage() {
  return null;
}

/** @deprecated Use AdminProfessionalsPage */
export function VettingPage() {
  return null;
}

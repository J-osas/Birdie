import { useEffect, useState } from 'react';
import { dataService } from '@/services/dataService';
import {
  BlogPost,
  CommunicationLog,
  CommunicationTemplate,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea } from '@/components/ui/Input';
import { statusLabel } from '@/data/constants';

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
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Website text</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Blog posts</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Write and change blog posts here. The other pages, like Home and About, are changed in the code.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <p className="text-sm font-bold text-slate-500">
            {editingId ? 'Changing a post' : 'New post'}
          </p>
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Web address ending</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Short summary</Label>
            <TextArea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>The post itself</Label>
            <TextArea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-slate-300"
            />
            Show this on the website
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
              {editingId ? 'Save' : published ? 'Put it on the website' : 'Keep it for later'}
            </Button>
            {editingId && (
              <Button size="sm" variant="secondary" onClick={reset}>
                Never mind
              </Button>
            )}
          </div>
        </div>
        <aside className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">One tip</p>
          <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
            Keep the web address ending short and clear, like hiring-guide. Nothing shows on the website until you
            tick the box.
          </p>
        </aside>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">Every post</h2>
        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-xs text-slate-400">
                {p.slug} · {p.published ? 'On the website' : 'Not shown yet'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => startEdit(p.id)}>
                Change
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
                {p.published ? 'Take it down' : 'Put it up'}
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
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Emails</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Emails we send</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          These are the emails Birdie sends, and a list of the ones already sent. The bell inside the app is still the
          quickest way people hear from us.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <section className="space-y-3">
          <h2 className="text-xl font-bold">The emails</h2>
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-[1.75rem] p-5 space-y-1">
              <p className="font-bold">{t.name}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                {t.slug} · {statusLabel(t.status)}
              </p>
              <p className="text-sm text-slate-600 mt-2">{t.subject}</p>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-slate-400 italic text-sm">No emails set up yet.</p>
          )}
        </section>

        <aside className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">When we send one</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 font-medium">
            <li>A family sends a new request</li>
            <li>A payment goes through</li>
            <li>We send a bill to a family</li>
            <li>We finish checking a professional</li>
            <li>We send money to a professional’s bank</li>
          </ul>
        </aside>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Emails we sent lately</h2>
        {logs.map((l) => (
          <div key={l.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-bold text-sm">{l.subject}</p>
            <p className="text-xs text-slate-500 mt-1">
              {l.toEmail} · {statusLabel(l.status)} · {l.templateSlug || '—'} ·{' '}
              {l.sentAt ? new Date(l.sentAt).toLocaleString() : '—'}
            </p>
          </div>
        ))}
        {logs.length === 0 && <p className="text-slate-400 italic text-sm">No emails sent yet.</p>}
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

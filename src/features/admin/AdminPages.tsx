import { useEffect, useState } from 'react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { ProfessionalProfile, ProfessionalStatus, WithdrawalRequest, BlogPost, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea } from '@/components/ui/Input';
import { formatNaira } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import AccountPage from '@/features/client/AccountPage';

export function VettingPage() {
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [certs, setCerts] = useState<Record<string, Array<{ id: string; title: string; verification_status: string }>>>({});
  const [docUrls, setDocUrls] = useState<
    Record<string, { govt?: string | null; proof?: string | null; nin?: string | null; avatar?: string | null }>
  >({});

  const load = async () => {
    const all = await dataService.getAllProfessionals();
    const queue = all.filter(
      (p) =>
        p.status === ProfessionalStatus.UNDER_REVIEW ||
        p.status === ProfessionalStatus.PENDING ||
        !!p.assessmentCompletedAt
    );
    const list = queue.length ? queue : all;
    setPros(list);
    const map: typeof certs = {};
    const urls: typeof docUrls = {};
    for (const p of list.slice(0, 40)) {
      map[p.id] = await dataService.getAllCertificationsForPro(p.id);
      urls[p.id] = {
        govt: p.govtIdPath ? await dataService.getSignedDocumentUrl(p.govtIdPath) : null,
        proof: p.proofOfAddressPath ? await dataService.getSignedDocumentUrl(p.proofOfAddressPath) : null,
        nin: p.ninDocPath ? await dataService.getSignedDocumentUrl(p.ninDocPath) : null,
        avatar: p.avatarUrl || null,
      };
    }
    setCerts(map);
    setDocUrls(urls);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vetting queue</h1>
      <p className="text-sm text-slate-500 font-medium">
        Review ID docs, NIN, assessment score, and attitude answers before verifying. Verify sends an in-app
        notification (wire Resend for email — see ADMIN_SETUP).
      </p>
      {pros.map((pro) => (
        <div key={pro.id} className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-bold text-lg">{pro.fullName || pro.userId}</p>
              <p className="text-sm text-slate-500">
                {pro.category} · {[pro.city, pro.state, pro.location].filter(Boolean).join(' · ')}
              </p>
              <p className="text-sm font-bold text-[#660033]">Assessment score: {pro.assessmentScore || 0}%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{pro.status}</p>
              {pro.nin && <p className="text-sm text-slate-600">NIN: {pro.nin}</p>}
              {pro.addressLine && (
                <p className="text-sm text-slate-500">
                  Address: {pro.addressLine}
                  {pro.proofOfAddressType ? ` (${pro.proofOfAddressType.replace(/_/g, ' ')})` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await dataService.updateProfessionalStatus(pro.id, ProfessionalStatus.VERIFIED);
                  load();
                }}
              >
                Verify
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await dataService.updateProfessionalStatus(pro.id, ProfessionalStatus.REJECTED);
                  load();
                }}
              >
                Reject
              </Button>
            </div>
          </div>

          {(docUrls[pro.id]?.avatar || docUrls[pro.id]?.govt || docUrls[pro.id]?.proof || docUrls[pro.id]?.nin) && (
            <div className="grid sm:grid-cols-3 gap-3 border-t border-slate-50 pt-4">
              {docUrls[pro.id]?.avatar && (
                <a href={docUrls[pro.id]!.avatar!} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={docUrls[pro.id]!.avatar!}
                    alt="Passport"
                    className="w-full h-36 object-cover rounded-2xl border"
                  />
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Passport photo</p>
                </a>
              )}
              {docUrls[pro.id]?.govt && !String(docUrls[pro.id]?.govt).startsWith('pending://') && (
                <a
                  href={docUrls[pro.id]!.govt!}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center h-36 rounded-2xl border bg-slate-50 text-sm font-bold text-[#660033]"
                >
                  Open govt ID
                </a>
              )}
              {docUrls[pro.id]?.proof && !String(docUrls[pro.id]?.proof).startsWith('pending://') && (
                <a
                  href={docUrls[pro.id]!.proof!}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center h-36 rounded-2xl border bg-slate-50 text-sm font-bold text-[#660033]"
                >
                  Open proof of address
                </a>
              )}
              {docUrls[pro.id]?.nin && !String(docUrls[pro.id]?.nin).startsWith('pending://') && (
                <a
                  href={docUrls[pro.id]!.nin!}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center h-36 rounded-2xl border bg-slate-50 text-sm font-bold text-[#660033]"
                >
                  Open NIN doc
                </a>
              )}
            </div>
          )}

          {pro.attitudeAnswers && Object.keys(pro.attitudeAnswers).length > 0 && (
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <p className="text-xs font-bold uppercase text-slate-400">Attitude answers</p>
              {Object.entries(pro.attitudeAnswers).map(([k, v]) => (
                <div key={k} className="text-sm">
                  <p className="font-bold text-slate-700">{k}</p>
                  <p className="text-slate-600 whitespace-pre-wrap">{v}</p>
                </div>
              ))}
            </div>
          )}

          {(certs[pro.id] || []).length > 0 && (
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <p className="text-xs font-bold uppercase text-slate-400">Certifications</p>
              {certs[pro.id].map((c) => (
                <div key={c.id} className="flex justify-between items-center gap-2 text-sm">
                  <span className="font-medium">{c.title}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{c.verification_status}</span>
                    {c.verification_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={async () => {
                            await dataService.setCertificationStatus(c.id, 'approved');
                            load();
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            await dataService.setCertificationStatus(c.id, 'rejected');
                            load();
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {pros.length === 0 && <p className="text-slate-400 italic">No professionals in the queue.</p>}
    </div>
  );
}

export function PayoutsPage() {
  const [rows, setRows] = useState<WithdrawalRequest[]>([]);

  const load = () => dataService.getWithdrawalRequests().then(setRows);
  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('paystack-transfer', { body: { withdrawalId: id } });
      if (error) throw error;
    } catch (e) {
      console.warn('Transfer function unavailable; marking paid locally', e);
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'paid', processed_at: new Date().toISOString() })
        .eq('id', id);
    }
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payouts</h1>
      {rows.map((w) => (
        <div
          key={w.id}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-3"
        >
          <div>
            <p className="font-bold">{w.professionalName}</p>
            <p className="text-sm text-slate-500">
              {formatNaira(w.amount)} · {w.bankName} {w.accountNumber}
            </p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">{w.status}</p>
          </div>
          {w.status === 'requested' && (
            <Button size="sm" onClick={() => approve(w.id)}>
              Approve & transfer
            </Button>
          )}
        </div>
      ))}
      {rows.length === 0 && <p className="text-slate-400 italic">No withdrawal requests.</p>}
    </div>
  );
}

export function SettingsPage() {
  const { settings, user, refresh } = useAuth();
  const [fee, setFee] = useState(String(settings?.consultation_fee_ngn || 10000));
  const [commission, setCommission] = useState(String(settings?.commission_rate || 15));
  const [escrowDays, setEscrowDays] = useState(String(settings?.escrow_release_days || 3));

  useEffect(() => {
    if (settings) {
      setFee(String(settings.consultation_fee_ngn));
      setCommission(String(settings.commission_rate));
      setEscrowDays(String(settings.escrow_release_days));
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
          Tune consultation fees, commission, and escrow release windows for the Birdie marketplace.
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
            <Button
              onClick={async () => {
                await dataService.updatePlatformSettings({
                  consultation_fee_ngn: Number(fee),
                  commission_rate: Number(commission),
                  escrow_release_days: Number(escrowDays),
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
              Changes apply to new hires. Existing funded jobs keep the economics locked at creation time.
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
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const load = () => dataService.getBlogPosts(false).then(setPosts);
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Content CMS</h1>
      <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4 max-w-2xl">
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
          <TextArea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <Button
          onClick={async () => {
            await dataService.upsertBlogPost({ title, slug, excerpt, content, published: true, author: 'Birdie' });
            setTitle('');
            setSlug('');
            setExcerpt('');
            setContent('');
            load();
          }}
        >
          Publish article
        </Button>
      </div>
      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-bold">{p.title}</p>
            <p className="text-xs text-slate-400">
              {p.slug} · {p.published ? 'Published' : 'Draft'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunicationsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Communications hub</h1>
      <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
        <p className="text-slate-600 font-medium leading-relaxed">
          Templates and triggers are stored in Supabase (`communication_templates`, `communication_logs`). Wire a
          transactional provider (Resend/Postmark) in Edge Functions for production sends.
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-500 space-y-2 font-medium">
          <li>Hire request submitted → client + admin</li>
          <li>Consultation / escrow payment success</li>
          <li>Professional verified (in-app notification on Verify; add Resend for email)</li>
          <li>Withdrawal paid</li>
        </ul>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          In-app notifications are live via the notifications table.
        </p>
      </div>
    </div>
  );
}

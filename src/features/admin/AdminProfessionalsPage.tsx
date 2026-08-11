import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { ProfessionalProfile, ProfessionalStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function AdminProfessionalsPage() {
  const { user } = useAuth();
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [certs, setCerts] = useState<
    Record<string, Array<{ id: string; title: string; verification_status: string }>>
  >({});
  const [docUrls, setDocUrls] = useState<
    Record<string, { govt?: string | null; proof?: string | null; nin?: string | null; avatar?: string | null }>
  >({});

  const load = async () => {
    const all = await dataService.getAllProfessionals();
    setPros(all);
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(pros.map((p) => p.category).filter(Boolean))).sort(),
    [pros]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pros.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      const hay = `${p.fullName || ''} ${p.category} ${p.city || ''} ${p.location || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [pros, search, statusFilter, categoryFilter]);

  const loadCertDetail = async (id: string) => {
    const pro = pros.find((p) => p.id === id);
    if (!pro) return;
    const list = await dataService.getAllCertificationsForPro(id);
    setCerts((c) => ({ ...c, [id]: list }));
    const urls = {
      govt: pro.govtIdPath ? await dataService.getSignedDocumentUrl(pro.govtIdPath) : null,
      proof: pro.proofOfAddressPath ? await dataService.getSignedDocumentUrl(pro.proofOfAddressPath) : null,
      nin: pro.ninDocPath ? await dataService.getSignedDocumentUrl(pro.ninDocPath) : null,
      avatar: pro.avatarUrl || null,
    };
    setDocUrls((u) => ({ ...u, [id]: urls }));
  };

  const openDetail = async (id: string) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (!next) return;
    await loadCertDetail(next);
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Professionals</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Directory & vetting</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Search every professional, review documents and assessments, then verify, reject, or suspend.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <Input
          placeholder="Search name, category, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium"
        >
          <option value="all">All statuses</option>
          {Object.values(ProfessionalStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((pro) => (
          <div key={pro.id} className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
            <button
              type="button"
              onClick={() => openDetail(pro.id)}
              className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80"
            >
              <div>
                <p className="font-bold text-lg text-[#0A0A0A]">{pro.fullName || pro.userId}</p>
                <p className="text-sm text-slate-500">
                  {pro.category} · {[pro.city, pro.state, pro.location].filter(Boolean).join(' · ')}
                </p>
                <p className="text-xs font-bold text-[#660033] mt-1">
                  Assessment {pro.assessmentScore || 0}%
                </p>
              </div>
              <Badge
                tone={
                  pro.status === ProfessionalStatus.VERIFIED
                    ? 'success'
                    : pro.status === ProfessionalStatus.REJECTED ||
                        pro.status === ProfessionalStatus.SUSPENDED
                      ? 'danger'
                      : 'warning'
                }
              >
                {pro.status.replace(/_/g, ' ')}
              </Badge>
            </button>

            {expanded === pro.id && (
              <div className="px-5 pb-6 space-y-4 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await dataService.updateProfessionalStatus(
                        pro.id,
                        ProfessionalStatus.VERIFIED,
                        user?.id
                      );
                      await load();
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await dataService.updateProfessionalStatus(
                        pro.id,
                        ProfessionalStatus.REJECTED,
                        user?.id
                      );
                      await load();
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await dataService.updateProfessionalStatus(
                        pro.id,
                        ProfessionalStatus.SUSPENDED,
                        user?.id
                      );
                      await load();
                    }}
                  >
                    Suspend
                  </Button>
                  <Link to={`/professionals/${pro.id}`} className="inline-flex">
                    <Button size="sm" variant="secondary">
                      Public profile
                    </Button>
                  </Link>
                </div>

                {pro.nin && <p className="text-sm text-slate-600">NIN: {pro.nin}</p>}
                {pro.addressLine && (
                  <p className="text-sm text-slate-500">
                    Address: {pro.addressLine}
                    {pro.proofOfAddressType ? ` (${pro.proofOfAddressType.replace(/_/g, ' ')})` : ''}
                  </p>
                )}

                {(docUrls[pro.id]?.avatar ||
                  docUrls[pro.id]?.govt ||
                  docUrls[pro.id]?.proof ||
                  docUrls[pro.id]?.nin) && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {docUrls[pro.id]?.avatar && (
                      <a href={docUrls[pro.id]!.avatar!} target="_blank" rel="noreferrer" className="block">
                        <img
                          src={docUrls[pro.id]!.avatar!}
                          alt=""
                          className="h-28 w-full object-cover rounded-xl border border-slate-100"
                        />
                        <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Photo</p>
                      </a>
                    )}
                    {docUrls[pro.id]?.govt && (
                      <a
                        href={docUrls[pro.id]!.govt!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-[#660033] underline"
                      >
                        Govt ID
                      </a>
                    )}
                    {docUrls[pro.id]?.proof && (
                      <a
                        href={docUrls[pro.id]!.proof!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-[#660033] underline"
                      >
                        Proof of address
                      </a>
                    )}
                    {docUrls[pro.id]?.nin && (
                      <a
                        href={docUrls[pro.id]!.nin!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-[#660033] underline"
                      >
                        NIN doc
                      </a>
                    )}
                  </div>
                )}

                {pro.attitudeAnswers && Object.keys(pro.attitudeAnswers).length > 0 && (
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-slate-400">Certifications</p>
                    {certs[pro.id].map((c) => (
                      <div key={c.id} className="flex justify-between items-center gap-2 text-sm">
                        <span className="font-medium">{c.title}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {c.verification_status}
                          </span>
                          {c.verification_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await dataService.setCertificationStatus(c.id, 'approved', user?.id);
                                  await loadCertDetail(pro.id);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={async () => {
                                  await dataService.setCertificationStatus(c.id, 'rejected', user?.id);
                                  await loadCertDetail(pro.id);
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
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-400 italic py-10 text-center">No professionals match these filters.</p>
        )}
      </div>
    </div>
  );
}

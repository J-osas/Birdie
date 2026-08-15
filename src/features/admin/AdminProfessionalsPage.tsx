import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { ProfessionalProfile, ProfessionalStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { KpiCard } from '@/features/admin/overview/KpiCard';
import { IMAGES } from '@/data/images';
import { statusLabel } from '@/data/constants';

type StatusChip = 'all' | 'pending' | 'verified' | 'rejected' | 'suspended';

const STATUS_CHIPS: { id: StatusChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Being checked' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Not approved' },
  { id: 'suspended', label: 'Paused' },
];

function matchesStatus(status: ProfessionalStatus, chip: StatusChip) {
  if (chip === 'all') return true;
  if (chip === 'pending') {
    return status === ProfessionalStatus.PENDING || status === ProfessionalStatus.UNDER_REVIEW;
  }
  if (chip === 'verified') {
    return status === ProfessionalStatus.VERIFIED || status === ProfessionalStatus.APPROVED;
  }
  if (chip === 'rejected') return status === ProfessionalStatus.REJECTED;
  return status === ProfessionalStatus.SUSPENDED;
}

function statusTone(status: ProfessionalStatus) {
  if (status === ProfessionalStatus.VERIFIED || status === ProfessionalStatus.APPROVED) return 'success' as const;
  if (status === ProfessionalStatus.REJECTED || status === ProfessionalStatus.SUSPENDED) return 'danger' as const;
  return 'warning' as const;
}

function DocCard({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  if (!href) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-4 min-h-[7rem] flex flex-col justify-end">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-xs text-slate-400 mt-1">Not uploaded</p>
      </div>
    );
  }
  const looksImage = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(href) || href.startsWith('data:') || href.includes('avatar');
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-slate-100 overflow-hidden hover:border-[#660033]/30"
    >
      {looksImage ? (
        <img src={href} alt="" className="h-28 w-full object-cover" />
      ) : (
        <div className="h-28 bg-[#F8FAFB] flex items-center justify-center">
          <FileText className="text-[#660033]" size={28} />
        </div>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">{label}</p>
    </a>
  );
}

export default function AdminProfessionalsPage() {
  const { user } = useAuth();
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusChip>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [certs, setCerts] = useState<
    Record<string, Array<{ id: string; title: string; verification_status: string }>>
  >({});
  const [docUrls, setDocUrls] = useState<
    Record<string, { govt?: string | null; proof?: string | null; nin?: string | null; avatar?: string | null }>
  >({});

  const load = async () => {
    setLoading(true);
    try {
      setPros(await dataService.getAllProfessionals());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pendingCount = pros.filter((p) => matchesStatus(p.status, 'pending')).length;
  const verifiedCount = pros.filter((p) => matchesStatus(p.status, 'verified')).length;
  const suspendedCount = pros.filter((p) => p.status === ProfessionalStatus.SUSPENDED).length;

  const categories = useMemo(
    () => Array.from(new Set(pros.map((p) => p.category).filter(Boolean))).sort(),
    [pros]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pros.filter((p) => {
      if (!matchesStatus(p.status, statusFilter)) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      const hay = `${p.fullName || ''} ${p.category} ${p.city || ''} ${p.location || ''} ${p.phone || ''}`.toLowerCase();
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

  const setStatus = async (pro: ProfessionalProfile, status: ProfessionalStatus) => {
    if (status === ProfessionalStatus.REJECTED && !window.confirm(`Reject ${pro.fullName || 'this professional'}?`)) {
      return;
    }
    if (status === ProfessionalStatus.SUSPENDED && !window.confirm(`Suspend ${pro.fullName || 'this professional'}? They will not be able to sign in until restored.`)) {
      return;
    }
    try {
      const result = await dataService.updateProfessionalStatus(pro.id, status, user?.id);
      setPros((list) =>
        list.map((p) =>
          p.id === pro.id
            ? { ...p, status: result.status, publicVisible: result.publicVisible, deletedAt: status === ProfessionalStatus.VERIFIED ? null : p.deletedAt }
            : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not update status.');
    }
  };

  const restorePro = async (pro: ProfessionalProfile) => {
    try {
      const result = await dataService.restoreProfessional(pro.id, user?.id);
      setPros((list) =>
        list.map((p) =>
          p.id === pro.id
            ? { ...p, status: result.status, publicVisible: result.publicVisible, deletedAt: null }
            : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not restore this professional.');
    }
  };

  const deletePro = async (pro: ProfessionalProfile) => {
    if (!window.confirm(`Delete ${pro.fullName || 'this professional'}? They will be hidden and cannot sign in. You can restore later.`)) {
      return;
    }
    try {
      const result = await dataService.softDeleteProfessional(pro.id, user?.id);
      setPros((list) =>
        list.map((p) =>
          p.id === pro.id
            ? { ...p, status: result.status, publicVisible: result.publicVisible, deletedAt: result.deletedAt }
            : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete this professional.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Professionals</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">People we check</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Search every professional, look at their papers and test, then approve, turn down, or pause them.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total" value={pros.length} onClick={() => setStatusFilter('all')} active={statusFilter === 'all'} />
        <KpiCard
          label="Being checked"
          value={pendingCount}
          onClick={() => setStatusFilter('pending')}
          active={statusFilter === 'pending'}
        />
        <KpiCard
          label="Verified"
          value={verifiedCount}
          onClick={() => setStatusFilter('verified')}
          active={statusFilter === 'verified'}
        />
        <KpiCard
          label="Paused"
          value={suspendedCount}
          onClick={() => setStatusFilter('suspended')}
          active={statusFilter === 'suspended'}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <Input
            placeholder="Search name, category, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lg:max-w-sm"
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="lg:max-w-xs"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_CHIPS.map((chip) => (
            <Button
              key={chip.id}
              size="sm"
              variant={statusFilter === chip.id ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter(chip.id)}
            >
              {chip.label}
            </Button>
          ))}
          <p className="text-xs font-bold text-slate-400 ml-auto">
            {filtered.length} of {pros.length}
          </p>
        </div>
      </div>

      {loading && <p className="text-slate-400 font-medium">Loading professionals…</p>}

      <div className="space-y-3">
        {filtered.map((pro) => {
          const open = expanded === pro.id;
          const pendingCerts = (certs[pro.id] || []).filter((c) => c.verification_status === 'pending').length;
          return (
            <div key={pro.id} className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
              <button
                type="button"
                onClick={() => openDetail(pro.id)}
                className="w-full text-left p-5 flex items-center gap-4 hover:bg-slate-50/80"
              >
                <img
                  src={pro.avatarUrl || IMAGES.avatarFallback}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-lg text-[#0A0A0A] truncate">{pro.fullName || pro.userId}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {pro.category} · {[pro.city, pro.state, pro.location].filter(Boolean).join(' · ') || 'No location'}
                  </p>
                  <p className="text-xs font-bold text-[#660033] mt-1">
                    Assessment {pro.assessmentScore || 0}% · Joined {new Date(pro.createdAt).toLocaleDateString()}
                    {pendingCerts > 0 ? ` · ${pendingCerts} pending certs` : ''}
                    {pro.deletedAt ? ' · Deleted' : ''}
                  </p>
                </div>
                <Badge
                  tone={
                    pro.deletedAt
                      ? 'danger'
                      : statusTone(pro.status)
                  }
                >
                  {pro.deletedAt ? 'Deleted' : statusLabel(pro.status)}
                </Badge>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <div className="px-5 pb-6 space-y-4 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setStatus(pro, ProfessionalStatus.VERIFIED)}>
                      Verify
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setStatus(pro, ProfessionalStatus.REJECTED)}>
                      Reject
                    </Button>
                    {pro.status === ProfessionalStatus.SUSPENDED || pro.deletedAt ? (
                      <Button size="sm" onClick={() => restorePro(pro)}>
                        Restore
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setStatus(pro, ProfessionalStatus.SUSPENDED)}>
                        Suspend
                      </Button>
                    )}
                    {!pro.deletedAt && (
                      <Button size="sm" variant="danger" onClick={() => deletePro(pro)}>
                        Delete
                      </Button>
                    )}
                    <Link to={`/professionals/${pro.id}`} className="inline-flex">
                      <Button size="sm" variant="secondary">
                        Public profile
                      </Button>
                    </Link>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <DocCard label="Photo" href={docUrls[pro.id]?.avatar || pro.avatarUrl} />
                      <DocCard label="Govt ID" href={docUrls[pro.id]?.govt} />
                      <DocCard label="Proof of address" href={docUrls[pro.id]?.proof} />
                      <DocCard label="NIN doc" href={docUrls[pro.id]?.nin} />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">NIN:</span> {pro.nin || '—'}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">Address:</span>{' '}
                        {pro.addressLine || '—'}
                        {pro.proofOfAddressType ? ` (${pro.proofOfAddressType.replace(/_/g, ' ')})` : ''}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">Assessment:</span> {pro.assessmentScore || 0}%
                      </p>
                      {pro.attitudeAnswers && Object.keys(pro.attitudeAnswers).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Attitude answers</p>
                          {Object.entries(pro.attitudeAnswers).map(([k, v]) => (
                            <div key={k} className="text-sm">
                              <p className="font-bold text-slate-700">{k}</p>
                              <p className="text-slate-600 whitespace-pre-wrap">{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {(certs[pro.id] || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Certifications</p>
                      {certs[pro.id].map((c) => (
                        <div key={c.id} className="flex justify-between items-center gap-2 text-sm">
                          <span className="font-medium">{c.title}</span>
                          <div className="flex gap-2 items-center">
                            <Badge
                              tone={
                                c.verification_status === 'approved'
                                  ? 'success'
                                  : c.verification_status === 'rejected'
                                    ? 'danger'
                                    : 'warning'
                              }
                            >
                              {c.verification_status}
                            </Badge>
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
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="py-16 px-8 bg-white rounded-[1.75rem] border border-dashed border-slate-200 text-center space-y-3">
            <p className="text-[#615A5C] font-medium">No professionals match these filters.</p>
            <Button size="sm" variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

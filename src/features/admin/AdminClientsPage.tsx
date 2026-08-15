import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { HireRequest, User, UserStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { KpiCard } from '@/features/admin/overview/KpiCard';
import { IMAGES } from '@/data/images';
import { formatNaira } from '@/lib/utils';
import { getStatusStyle, statusLabel } from '@/data/constants';

type ClientRow = User & { hireCount: number };
type StatusChip = 'all' | 'active' | 'suspended';

const STATUS_CHIPS: { id: StatusChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
];

export default function AdminClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusChip>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hireMap, setHireMap] = useState<Record<string, HireRequest[]>>({});
  const [allHires, setAllHires] = useState<HireRequest[] | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setClients(await dataService.listClients());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = clients.filter((c) => c.status !== UserStatus.SUSPENDED && !c.deletedAt).length;
  const suspendedCount = clients.filter((c) => c.status === UserStatus.SUSPENDED).length;
  const deletedCount = clients.filter((c) => !!c.deletedAt).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter === 'active' && (c.status === UserStatus.SUSPENDED || c.deletedAt)) return false;
      if (statusFilter === 'suspended' && c.status !== UserStatus.SUSPENDED) return false;
      if (!q) return true;
      return `${c.name || ''} ${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q);
    });
  }, [clients, search, statusFilter]);

  const openHires = async (clientId: string) => {
    const next = expanded === clientId ? null : clientId;
    setExpanded(next);
    if (!next || hireMap[clientId]) return;
    let hires = allHires;
    if (!hires) {
      hires = await dataService.getHireRequests('admin', 'ADMIN');
      setAllHires(hires);
    }
    setHireMap((m) => ({
      ...m,
      [clientId]: hires.filter((h) => h.clientId === clientId).slice(0, 8),
    }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Clients</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Client directory</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Suspend or restore household accounts and jump into their recent hire requests.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total" value={clients.length} onClick={() => setStatusFilter('all')} active={statusFilter === 'all'} />
        <KpiCard
          label="Active"
          value={activeCount}
          onClick={() => setStatusFilter('active')}
          active={statusFilter === 'active'}
        />
        <KpiCard
          label="Suspended"
          value={suspendedCount}
          onClick={() => setStatusFilter('suspended')}
          active={statusFilter === 'suspended'}
        />
        <KpiCard label="Soft-deleted" value={deletedCount} />
      </div>

      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
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
            {filtered.length} of {clients.length}
          </p>
        </div>
      </div>

      {loading && <p className="text-slate-400 font-medium">Loading clients…</p>}

      <div className="space-y-3">
        {filtered.map((c) => {
          const open = expanded === c.id;
          return (
            <div key={c.id} className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <button type="button" onClick={() => openHires(c.id)} className="text-left min-w-0 flex-1 flex items-center gap-4">
                  <img
                    src={c.avatarUrl || IMAGES.avatarFallback}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[#0A0A0A] truncate">{c.name || `${c.firstName} ${c.lastName}`}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {c.email} · {c.phone || 'No phone'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {c.hireCount} hires · Joined {new Date(c.createdAt).toLocaleDateString()}
                      {c.deletedAt ? ' · Soft-deleted' : ''}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 ml-auto hidden sm:block transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={c.status === UserStatus.SUSPENDED ? 'danger' : 'success'}>{c.status}</Badge>
                  {c.status === UserStatus.SUSPENDED ? (
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await dataService.updateUserStatus(c.id, UserStatus.ACTIVE, null, user?.id);
                          setClients((list) =>
                            list.map((row) =>
                              row.id === c.id
                                ? { ...row, status: result.status, deletedAt: result.deletedAt }
                                : row
                            )
                          );
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Could not restore this client.');
                        }
                      }}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        if (!window.confirm(`Suspend ${c.name || c.email}? They will not be able to use the app until restored.`)) {
                          return;
                        }
                        try {
                          const result = await dataService.updateUserStatus(
                            c.id,
                            UserStatus.SUSPENDED,
                            undefined,
                            user?.id
                          );
                          setClients((list) =>
                            list.map((row) =>
                              row.id === c.id ? { ...row, status: result.status, deletedAt: result.deletedAt } : row
                            )
                          );
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Could not suspend this client.');
                        }
                      }}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
              {open && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-3 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent hires</p>
                  {(hireMap[c.id] || []).map((h) => (
                    <Link
                      key={h.id}
                      to={`/app/hires/${h.id}`}
                      className="block bg-[#F8FAFB] border border-slate-100 rounded-2xl p-4 hover:border-[#660033]/30"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-[#0A0A0A]">
                            {h.serviceRequested || h.serviceCategory}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {h.professionalName || 'Not matched yet'}
                            {h.amount != null ? ` · ${formatNaira(h.amount)}` : ''}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 h-fit rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(h.status)}`}
                        >
                          {statusLabel(h.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {(hireMap[c.id] || []).length === 0 && (
                    <p className="text-sm text-slate-400 italic">No requests yet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="py-16 px-8 bg-white rounded-[1.75rem] border border-dashed border-slate-200 text-center space-y-3">
            <p className="text-[#615A5C] font-medium">No clients found.</p>
            <Button size="sm" variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

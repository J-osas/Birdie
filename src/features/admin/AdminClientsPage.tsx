import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { HireRequest, User, UserStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

type ClientRow = User & { hireCount: number };

export default function AdminClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hireMap, setHireMap] = useState<Record<string, HireRequest[]>>({});

  const load = async () => {
    setClients(await dataService.listClients());
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      `${c.name || ''} ${c.email} ${c.phone}`.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const openHires = async (clientId: string) => {
    const next = expanded === clientId ? null : clientId;
    setExpanded(next);
    if (!next || hireMap[clientId]) return;
    const all = await dataService.getHireRequests('admin', 'ADMIN');
    setHireMap((m) => ({
      ...m,
      [clientId]: all.filter((h) => h.clientId === clientId).slice(0, 8),
    }));
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

      <Input
        placeholder="Search name, email, phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <button type="button" onClick={() => openHires(c.id)} className="text-left min-w-0 flex-1">
                <p className="font-bold text-[#0A0A0A]">{c.name || `${c.firstName} ${c.lastName}`}</p>
                <p className="text-sm text-slate-500 truncate">
                  {c.email} · {c.phone || 'No phone'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {c.hireCount} hires · Joined {new Date(c.createdAt).toLocaleDateString()}
                  {c.deletedAt ? ' · Soft-deleted' : ''}
                </p>
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={c.status === UserStatus.SUSPENDED ? 'danger' : 'success'}>{c.status}</Badge>
                {c.status === UserStatus.SUSPENDED ? (
                  <Button
                    size="sm"
                    onClick={async () => {
                      await dataService.updateUserStatus(c.id, UserStatus.ACTIVE, null, user?.id);
                      await load();
                    }}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await dataService.updateUserStatus(c.id, UserStatus.SUSPENDED, undefined, user?.id);
                      await load();
                    }}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </div>
            {expanded === c.id && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent hires</p>
                {(hireMap[c.id] || []).map((h) => (
                  <Link
                    key={h.id}
                    to={`/app/hires/${h.id}`}
                    className="block text-sm font-bold text-[#660033] hover:underline"
                  >
                    {h.serviceRequested || h.serviceCategory} · {h.status.replace(/_/g, ' ')}
                  </Link>
                ))}
                {(hireMap[c.id] || []).length === 0 && (
                  <p className="text-sm text-slate-400 italic">No hire requests yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-400 italic py-10 text-center">No clients found.</p>
        )}
      </div>
    </div>
  );
}

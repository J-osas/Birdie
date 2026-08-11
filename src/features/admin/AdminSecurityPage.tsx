import { useEffect, useState } from 'react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { User, UserStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IMAGES } from '@/data/images';

export default function AdminSecurityPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [all, setAll] = useState<User[]>([]);

  const load = async () => {
    setStaff(await dataService.listStaff());
    setAll(await dataService.getAllUsers());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Security</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Access & roles</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Staff accounts are listed here. Assign new admin/operations roles in Supabase for now; suspend any
          profile that needs lockdown.
        </p>
      </div>

      <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
        <h2 className="text-xl font-bold">Your account</h2>
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || IMAGES.avatarFallback}
            alt=""
            className="w-14 h-14 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold">{user?.name || user?.email}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              {user?.role}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Staff users</h2>
        {staff.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold">{s.name || s.email}</p>
              <p className="text-sm text-slate-500">
                {s.email} · {s.role}
              </p>
            </div>
            <Badge tone={s.status === UserStatus.SUSPENDED ? 'danger' : 'success'}>{s.status}</Badge>
          </div>
        ))}
        {staff.length === 0 && <p className="text-slate-400 italic">No staff profiles found.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Suspend / restore any profile</h2>
        <p className="text-sm text-slate-500 font-medium">
          Use carefully — suspended users cannot use the app until restored.
        </p>
        {all.slice(0, 80).map((u) => (
          <div
            key={u.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold text-sm">
                {u.name || u.email}{' '}
                <span className="text-slate-400 font-medium">· {u.role}</span>
              </p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={u.status === UserStatus.SUSPENDED ? 'danger' : 'success'}>{u.status}</Badge>
              {u.status === UserStatus.SUSPENDED ? (
                <Button
                  size="sm"
                  onClick={async () => {
                    await dataService.updateUserStatus(u.id, UserStatus.ACTIVE, null, user?.id);
                    load();
                  }}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={u.id === user?.id}
                  onClick={async () => {
                    await dataService.updateUserStatus(u.id, UserStatus.SUSPENDED, undefined, user?.id);
                    load();
                  }}
                >
                  Suspend
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

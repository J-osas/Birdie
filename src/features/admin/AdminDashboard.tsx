import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import {
  AdminAuditLog,
  HireRequest,
  ProfessionalProfile,
  ProfessionalStatus,
  WithdrawalRequest,
} from '@/types';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboard() {
  const { settings, user } = useAuth();
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>([]);
  const [activity, setActivity] = useState<AdminAuditLog[]>([]);
  const [pendingCerts, setPendingCerts] = useState(0);

  const load = async () => {
    const [allPros, allHires, allPayouts, logs] = await Promise.all([
      dataService.getAllProfessionals(),
      dataService.getHireRequests('admin', 'ADMIN'),
      dataService.getWithdrawalRequests(),
      dataService.listAuditLog(12),
    ]);
    setPros(allPros);
    setHires(allHires);
    setPayouts(allPayouts);
    setActivity(logs);

    let certCount = 0;
    for (const p of allPros.slice(0, 60)) {
      const certs = await dataService.getAllCertificationsForPro(p.id);
      certCount += certs.filter((c) => c.verification_status === 'pending').length;
    }
    setPendingCerts(certCount);
  };

  useEffect(() => {
    load();
  }, []);

  const pendingPros = useMemo(
    () =>
      pros.filter(
        (p) =>
          p.status === ProfessionalStatus.PENDING || p.status === ProfessionalStatus.UNDER_REVIEW
      ),
    [pros]
  );
  const verifiedPros = pros.filter(
    (p) => p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.APPROVED
  );
  const activeJobs = hires.filter((h) => h.status === 'active' || h.status === 'funded');
  const pendingPayouts = payouts.filter((p) => p.status === 'requested');
  const avgRating =
    verifiedPros.length > 0
      ? (
          verifiedPros.reduce((s, p) => s + (p.rating || 0), 0) /
          Math.max(1, verifiedPros.filter((p) => (p.rating || 0) > 0).length || 1)
        ).toFixed(1)
      : '—';

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Operations Hub</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Birdie Central Intelligence</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Vetting queues, hire health, payouts, and platform pulse in one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Verified pros', value: verifiedPros.length },
          { label: 'Pending apps', value: pendingPros.length },
          { label: 'Active jobs', value: activeJobs.length },
          { label: 'Platform rating', value: avgRating },
          { label: 'Pending payouts', value: pendingPayouts.length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-3xl font-black mt-2 text-[#0A0A0A]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Needs attention</h2>
              <Link to="/app/professionals" className="text-sm font-bold text-[#660033]">
                Open directory
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                to="/app/professionals"
                className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending pros</p>
                <p className="text-2xl font-black mt-1">{pendingPros.length}</p>
              </Link>
              <Link
                to="/app/professionals"
                className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending certs</p>
                <p className="text-2xl font-black mt-1">{pendingCerts}</p>
              </Link>
              <Link
                to="/app/payments"
                className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Withdrawals</p>
                <p className="text-2xl font-black mt-1">{pendingPayouts.length}</p>
              </Link>
            </div>
            {pendingPros.slice(0, 4).map((pro) => (
              <div
                key={pro.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-50 pt-4"
              >
                <div>
                  <p className="font-bold">{pro.fullName || pro.userId}</p>
                  <p className="text-xs text-slate-500">
                    {pro.category} · Score {pro.assessmentScore || pro.aptitudeScore || 0}%
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge tone="warning">{pro.status}</Badge>
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
                </div>
              </div>
            ))}
            {pendingPros.length === 0 && (
              <p className="text-slate-400 italic text-sm">No pending applications.</p>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="text-xl font-bold">Recent activity</h2>
            {activity.map((row) => (
              <div key={row.id} className="border-t border-slate-50 pt-3 first:border-0 first:pt-0">
                <p className="text-sm font-bold text-[#0A0A0A]">{row.action}</p>
                <p className="text-xs text-slate-500">
                  {row.entityType}
                  {row.entityId ? ` · ${row.entityId.slice(0, 8)}…` : ''} ·{' '}
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-slate-400 italic text-sm">
                Staff actions will appear here once verify, payout, and moderation events are logged.
              </p>
            )}
          </section>
        </div>

        <aside className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4 sticky top-24">
          <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">Platform pulse</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 font-medium">Consultation fee</span>
              <span className="font-bold">{formatNaira(settings?.consultation_fee_ngn || 10000)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 font-medium">Commission</span>
              <span className="font-bold">{settings?.commission_rate ?? 15}%</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 font-medium">Escrow release</span>
              <span className="font-bold">{settings?.escrow_release_days ?? 3} days</span>
            </div>
          </div>
          <p className="text-sm text-[#615A5C] font-medium leading-relaxed border-t border-slate-100 pt-4">
            Live connectivity: Supabase Auth + Paystack for consultations, escrow, and withdrawals. In-app
            notifications cover verification today.
          </p>
          <Link to="/app/settings">
            <Button size="sm" variant="secondary" className="w-full">
              Open settings
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}

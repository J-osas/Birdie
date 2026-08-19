import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { AdminOverviewMetrics, OverviewRangeDays, ProfessionalStatus } from '@/types';
import { formatNaira } from '@/lib/utils';
import { getGaMeasurementId } from '@/lib/gtag';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { statusLabel } from '@/data/constants';
import { KpiCard } from '@/features/admin/overview/KpiCard';
import { OverviewCharts } from '@/features/admin/overview/OverviewCharts';
import { auditEntityLink, humanizeAuditAction } from '@/features/admin/overview/overviewCopy';

const RANGES: { days: OverviewRangeDays; label: string }[] = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default function AdminDashboard() {
  const { settings, user } = useAuth();
  const [rangeDays, setRangeDays] = useState<OverviewRangeDays>(30);
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (days: OverviewRangeDays) => {
    setLoading(true);
    try {
      setMetrics(await dataService.getAdminOverviewMetrics(days));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(rangeDays);
  }, [rangeDays]);

  const gaId = getGaMeasurementId(settings?.ga_measurement_id);
  const rating =
    metrics?.kpis.platformRating != null ? metrics.kpis.platformRating.toFixed(1) : '—';

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Operations Hub</p>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Birdie Central Intelligence</h1>
          <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
            Live marketplace health — queues, money, and hiring trends in one place.
          </p>
          {metrics && (
            <p className="text-xs text-slate-400 font-medium">
              Updated {new Date(metrics.refreshedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              size="sm"
              variant={rangeDays === r.days ? 'primary' : 'secondary'}
              onClick={() => setRangeDays(r.days)}
            >
              Last {r.label}
            </Button>
          ))}
        </div>
      </div>

      {loading && !metrics && (
        <p className="text-slate-400 font-medium">Loading overview…</p>
      )}

      {metrics && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Verified pros"
              value={metrics.kpis.verifiedPros}
              spark={metrics.sparklines.pros}
            />
            <KpiCard label="Pending apps" value={metrics.kpis.pendingApps} />
            <KpiCard
              label="Active jobs"
              value={metrics.kpis.activeJobs}
              spark={metrics.sparklines.hires}
            />
            <KpiCard label="Platform rating" value={rating} hint="Published reviews" />
            <KpiCard label="Pending payouts" value={metrics.kpis.pendingPayouts} />
            <KpiCard
              label="Clients"
              value={metrics.kpis.clientCount}
              spark={metrics.sparklines.clients}
            />
            <KpiCard label="Money we hold" value={formatNaira(metrics.kpis.escrowHeld)} />
            <KpiCard
              label="Consultation revenue"
              value={formatNaira(metrics.kpis.consultationRevenue)}
              hint={`Last ${rangeDays} days`}
              spark={metrics.sparklines.consultation}
            />
          </div>

          <OverviewCharts metrics={metrics} />

          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
            <div className="space-y-6">
              <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Needs attention</h2>
                  <Link to="/app/professionals" className="text-sm font-bold text-[#660033]">
                    Open directory
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  <Link
                    to="/app/professionals"
                    className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Pending certs
                    </p>
                    <p className="text-2xl font-black mt-1">{metrics.attention.pendingCerts}</p>
                  </Link>
                  <Link
                    to="/app/payments"
                    className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Withdrawals
                    </p>
                    <p className="text-2xl font-black mt-1">{metrics.attention.pendingPayouts}</p>
                  </Link>
                  <Link
                    to="/app/admin/reviews"
                    className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Reviews to decide
                    </p>
                    <p className="text-2xl font-black mt-1">{metrics.attention.flaggedReviews}</p>
                  </Link>
                  <Link
                    to="/app/clients"
                    className="rounded-2xl border border-slate-100 bg-[#F8FAFB] p-4 hover:border-[#660033]/30"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Suspended clients
                    </p>
                    <p className="text-2xl font-black mt-1">{metrics.attention.suspendedClients}</p>
                  </Link>
                </div>

                {metrics.attention.pendingPros.map((pro) => (
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
                      <Badge tone="warning">{statusLabel(pro.status)}</Badge>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await dataService.updateProfessionalStatus(
                            pro.id,
                            ProfessionalStatus.VERIFIED,
                            user?.id
                          );
                          await load(rangeDays);
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
                          await load(rangeDays);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {metrics.attention.pendingPros.length === 0 && (
                  <p className="text-slate-400 italic text-sm">No pending applications.</p>
                )}
              </section>

              <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
                <h2 className="text-xl font-bold">Recent activity</h2>
                {metrics.activity.map((row) => {
                  const href = auditEntityLink(row);
                  return (
                    <div key={row.id} className="border-t border-slate-50 pt-3 first:border-0 first:pt-0">
                      <p className="text-sm font-bold text-[#0A0A0A]">{humanizeAuditAction(row.action)}</p>
                      <p className="text-xs text-slate-500">
                        {row.entityType}
                        {href ? (
                          <>
                            {' · '}
                            <Link to={href} className="font-bold text-[#660033]">
                              Open
                            </Link>
                          </>
                        ) : row.entityId ? (
                          ` · ${row.entityId.slice(0, 8)}…`
                        ) : null}{' '}
                        · {new Date(row.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
                {metrics.activity.length === 0 && (
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
                  <span className="font-bold">{settings?.commission_rate ?? 3.5}%</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 font-medium">Days we hold money after a job</span>
                  <span className="font-bold">{settings?.escrow_release_days ?? 3} days</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 font-medium">Min withdrawal</span>
                  <span className="font-bold">{formatNaira(settings?.min_withdrawal_amount || 5000)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 font-medium">Google Analytics</span>
                  <span className={`font-bold ${gaId ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {gaId ? 'Connected' : 'Not set'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#615A5C] font-medium leading-relaxed border-t border-slate-100 pt-4">
                {gaId
                  ? `Measurement ID ${gaId} is loading on public pages. Traffic charts stay in GA until a later API pass.`
                  : 'Add a GA Measurement ID in Settings to start collecting public-site pageviews.'}
              </p>
              <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
                Paystack is how families pay the meeting fee and the job bill, and how we pay professionals.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/app/settings">
                  <Button size="sm" variant="secondary" className="w-full">
                    Open settings
                  </Button>
                </Link>
                <Link to="/app/analytics" className="text-center text-sm font-bold text-[#660033]">
                  Full analytics
                </Link>
                <Link to="/app/professionals" className="text-center text-sm font-bold text-[#660033]">
                  Professionals
                </Link>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

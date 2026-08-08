import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { HireRequest, ProfessionalProfile, ProfessionalStatus, WithdrawalRequest } from '@/types';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboard() {
  const { settings } = useAuth();
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>([]);

  const load = async () => {
    setPros(await dataService.getAllProfessionals());
    setHires(await dataService.getHireRequests('admin', 'ADMIN'));
    setPayouts(await dataService.getWithdrawalRequests());
  };

  useEffect(() => {
    load();
  }, []);

  const pendingPros = pros.filter(
    (p) => p.status === ProfessionalStatus.PENDING || p.status === ProfessionalStatus.UNDER_REVIEW
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Operations hub</h1>
        <p className="text-slate-500 font-medium">Vetting, hires, escrow, and payouts.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verified pros', value: pros.filter((p) => p.status === ProfessionalStatus.VERIFIED).length },
          { label: 'Pending vetting', value: pendingPros.length },
          { label: 'Active jobs', value: hires.filter((h) => h.status === 'active' || h.status === 'funded').length },
          {
            label: 'Consultation fee',
            value: formatNaira(settings?.consultation_fee_ngn || 10000),
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-[2rem] p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-3xl font-black mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Vetting queue</h2>
          <Link to="/app/vetting" className="text-sm font-bold text-[#660033]">
            View all
          </Link>
        </div>
        {pendingPros.slice(0, 5).map((pro) => (
          <div key={pro.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-50 pt-4">
            <div>
              <p className="font-bold">{pro.fullName || pro.userId}</p>
              <p className="text-xs text-slate-500">
                {pro.category} · Score {pro.assessmentScore || pro.aptitudeScore || 0}%
              </p>
            </div>
            <div className="flex gap-2">
              <Badge tone="warning">{pro.status}</Badge>
              <Button
                size="sm"
                onClick={async () => {
                  await dataService.updateProfessionalStatus(pro.id, ProfessionalStatus.VERIFIED);
                  await load();
                }}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await dataService.updateProfessionalStatus(pro.id, ProfessionalStatus.REJECTED);
                  await load();
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
        {pendingPros.length === 0 && <p className="text-slate-400 italic">Queue clear.</p>}
      </section>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Payout requests</h2>
          <Link to="/app/payouts" className="text-sm font-bold text-[#660033]">
            Manage
          </Link>
        </div>
        <p className="text-slate-500 text-sm">
          {payouts.filter((p) => p.status === 'requested').length} awaiting approval
        </p>
      </section>
    </div>
  );
}

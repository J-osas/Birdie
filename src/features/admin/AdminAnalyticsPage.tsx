import { useEffect, useState } from 'react';
import { dataService } from '@/services/dataService';
import { formatNaira } from '@/lib/utils';
import { statusLabel } from '@/data/constants';

type Analytics = Awaited<ReturnType<typeof dataService.getAdminAnalytics>>;

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    dataService.getAdminAnalytics().then(setData);
  }, []);

  if (!data) {
    return <p className="text-slate-400 font-medium">One moment…</p>;
  }

  const maxCat = Math.max(1, ...Object.values(data.prosByCategory));
  const statusEntries = Object.entries(data.hiresByStatus).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Analytics</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">How Birdie is doing</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Live counts straight from Birdie. Add your Google Analytics ID under Settings if you want that too.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Families', value: data.clientCount },
          { label: 'Professionals', value: data.proCount },
          { label: 'Checked and approved', value: `${data.verifiedCount} (${data.verifiedPct}%)` },
          { label: 'Meeting fee', value: formatNaira(data.consultationFee) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-2xl font-black mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <h2 className="text-xl font-bold">Requests by stage</h2>
          {statusEntries.length === 0 && (
            <p className="text-slate-400 italic text-sm">No requests yet.</p>
          )}
          {statusEntries.map(([status, count]) => (
            <div key={status} className="flex justify-between text-sm gap-3">
              <span className="font-medium text-slate-600">{statusLabel(status)}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-3 text-sm text-slate-500 font-medium">
            Birdie keeps {data.commissionRate}% · we hold the money for {data.escrowDays} days after a job
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
          <h2 className="text-xl font-bold">Professionals by kind of help</h2>
          {Object.keys(data.prosByCategory).length === 0 && (
            <p className="text-slate-400 italic text-sm">No professionals yet.</p>
          )}
          {Object.entries(data.prosByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat}</span>
                  <span className="font-bold">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#660033] rounded-full"
                    style={{ width: `${Math.round((count / maxCat) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}

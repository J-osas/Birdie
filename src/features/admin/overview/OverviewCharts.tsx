import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminOverviewMetrics } from '@/types';
import { formatNaira } from '@/lib/utils';

const MAROON = '#660033';
const MAROON_SOFT = '#e0b5cb';
const INK = '#0A0A0A';
const MIX = [MAROON, '#8B3A62', MAROON_SOFT, '#2B0116'];

function ChartPanel({
  title,
  children,
  empty,
  emptyTo,
  emptyLabel,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
  emptyTo?: string;
  emptyLabel?: string;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-[1.75rem] p-5 md:p-6 min-w-0">
      <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">{title}</h2>
      {empty ? (
        <div className="h-52 flex flex-col justify-center gap-2">
          <p className="text-sm text-slate-400 font-medium">{emptyLabel || 'Nothing to chart yet.'}</p>
          {emptyTo && (
            <Link to={emptyTo} className="text-sm font-bold text-[#660033]">
              Open section
            </Link>
          )}
        </div>
      ) : (
        <div className="h-52">{children}</div>
      )}
    </section>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  fontWeight: 600,
};

export function OverviewCharts({ metrics }: { metrics: AdminOverviewMetrics }) {
  const hireTotal = metrics.hiresByDay.reduce((s, d) => s + d.count, 0);
  const pipelineTotal = metrics.hirePipeline.reduce((s, d) => s + d.value, 0);
  const mixTotal = metrics.proStatusMix.reduce((s, d) => s + d.value, 0);
  const reviewTotal = metrics.ratingHistogram.reduce((s, d) => s + d.count, 0);
  const moneyTotal = metrics.moneyPulse.escrowHeld + metrics.moneyPulse.withdrawalsPaid;
  const moneyBars = [
    { name: 'Money we hold', value: metrics.moneyPulse.escrowHeld },
    { name: 'Paid out', value: metrics.moneyPulse.withdrawalsPaid },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ChartPanel
        title="Hire volume"
        empty={hireTotal === 0}
        emptyTo="/app/hires"
        emptyLabel="No hires in this range yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metrics.hiresByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hire-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={MAROON} stopOpacity={0.28} />
                <stop offset="100%" stopColor={MAROON} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="count" name="Hires" stroke={MAROON} strokeWidth={2} fill="url(#hire-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Where hires are"
        empty={pipelineTotal === 0}
        emptyTo="/app/hires"
        emptyLabel="No hire requests yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.hirePipeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" name="Hires" fill={MAROON} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Pros by category"
        empty={metrics.prosByCategory.length === 0}
        emptyTo="/app/professionals"
        emptyLabel="No professionals registered yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={metrics.prosByCategory.slice(0, 8)}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
          >
            <CartesianGrid stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fontSize: 10, fill: INK, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" name="Pros" fill={MAROON} radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Verification mix"
        empty={mixTotal === 0}
        emptyTo="/app/professionals"
        emptyLabel="No professional applications yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={metrics.proStatusMix}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
            >
              {metrics.proStatusMix.map((entry, i) => (
                <Cell key={entry.name} fill={MIX[i % MIX.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Money pulse"
        empty={moneyTotal === 0}
        emptyTo="/app/payments"
        emptyLabel="No money held or paid out yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={moneyBars} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNaira(v)} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              <Cell fill={MAROON} />
              <Cell fill={MAROON_SOFT} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Review ratings"
        empty={reviewTotal === 0}
        emptyTo="/app/admin/reviews"
        emptyLabel="No published reviews yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.ratingHistogram} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="rating" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" name="Reviews" fill={MAROON} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export function KpiCard({
  label,
  value,
  hint,
  spark,
  onClick,
  active,
}: {
  label: string;
  value: string | number;
  hint?: string;
  spark?: number[];
  onClick?: () => void;
  active?: boolean;
}) {
  const data = (spark || []).map((v, i) => ({ i, v }));
  const hasSpark = data.some((d) => d.v > 0);
  const body = (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl md:text-3xl font-black mt-2 text-[#0A0A0A] truncate">{value}</p>
      {hint && <p className="text-xs text-slate-400 font-medium mt-1">{hint}</p>}
      {hasSpark && (
        <div className="h-10 mt-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`kpi-spark-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#660033" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#660033" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#660033"
                strokeWidth={1.5}
                fill={`url(#kpi-spark-${label.replace(/\s+/g, '-')})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );

  const className = `bg-white border rounded-[1.75rem] p-5 min-w-0 text-left w-full ${
    active ? 'border-[#660033] ring-2 ring-[#660033]/10' : 'border-slate-200'
  } ${onClick ? 'hover:border-[#660033]/40 transition-colors' : ''}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

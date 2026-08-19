import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'brand' | 'danger';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    brand: 'bg-[#660033]/5 text-[#660033] border-[#660033]/10',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

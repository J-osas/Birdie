import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl space-y-4',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">{eyebrow}</p>
      )}
      <h2 className="text-3xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="text-lg md:text-xl text-[#615A5C] font-medium leading-relaxed">{subtitle}</p>}
    </div>
  );
}

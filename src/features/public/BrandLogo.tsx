import { IMAGES } from '@/data/images';
import { cn } from '@/lib/utils';

export function BrandLogo({
  variant = 'light',
  className,
  markClassName,
}: {
  variant?: 'light' | 'dark';
  className?: string;
  markClassName?: string;
}) {
  const dark = variant === 'dark';
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={dark ? IMAGES.markLight : IMAGES.markBurgundy}
        alt=""
        className={cn('h-9 w-auto object-contain', markClassName)}
      />
      <span
        className={cn(
          'text-xl font-bold tracking-tight leading-none',
          dark ? 'text-white' : 'text-[#0A0A0A]'
        )}
      >
        birdie
        <span className={cn('text-[11px] align-baseline', dark ? 'text-[#E0B5CB]' : 'text-[#660033]')}>
          .ng
        </span>
      </span>
    </span>
  );
}

import { useImages } from '@/app/SiteMediaProvider';
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
  const images = useImages();
  const dark = variant === 'dark';
  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src={dark ? images.logoOnDark : images.logoOnLight}
        alt="Birdie"
        className={cn('h-9 w-auto max-w-[180px] object-contain object-left', markClassName)}
      />
    </span>
  );
}

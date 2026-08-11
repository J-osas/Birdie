import React from 'react';
import { cn } from '@/lib/utils';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse' | 'outlineOnBrand';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  const variants = {
    primary:
      'bg-[#660033] text-white shadow-lg shadow-[#660033]/20 hover:bg-[#2B0116]',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-500 hover:text-[#660033]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    inverse: 'bg-white text-[#660033] shadow-none hover:bg-[#F8FAFB]',
    outlineOnBrand:
      'bg-transparent border border-white/40 text-white hover:bg-white/10 shadow-none',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-10 py-5 text-lg rounded-xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

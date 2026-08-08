import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-bold text-[#0A0A0A]">{q}</span>
        <ChevronDown
          size={18}
          className={cn('text-[#660033] shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-[#615A5C] font-medium leading-relaxed text-sm border-t border-slate-50 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

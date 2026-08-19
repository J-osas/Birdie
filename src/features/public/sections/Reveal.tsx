import { useInView } from '@/lib/motion';
import { cn } from '@/lib/utils';

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, className: motionClass } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(motionClass, className)}>
      {children}
    </div>
  );
}

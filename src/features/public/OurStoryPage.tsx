import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Heart,
  Home,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useImages } from '@/app/SiteMediaProvider';
import { useAuth } from '@/app/AuthProvider';
import { useInView } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { StudioRoute } from '@/features/studio/StudioRoute';

const CHAPTERS = [
  { id: 'home', label: 'The home', num: '01' },
  { id: 'trust', label: 'Trust', num: '02' },
  { id: 'both', label: 'Both sides', num: '03' },
  { id: 'search', label: 'The search', num: '04' },
  { id: 'birdie', label: 'Birdie', num: '05' },
] as const;

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, className: motionClass } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(motionClass, className)}>
      {children}
    </div>
  );
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? Math.min(1, el.scrollTop / height) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}

function useActiveChapter(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!nodes.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0, 0.2, 0.45, 0.7] }
    );
    nodes.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return active;
}

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function OurStoryPage() {
  return <StudioRoute slug="story" fallback={<CodedStory />} />;
}

function CodedStory() {
  const { settings } = useAuth();
  const images = useImages();
  const progress = useReadingProgress();
  const active = useActiveChapter(CHAPTERS.map((c) => c.id));
  const [lens, setLens] = useState<'together' | 'family' | 'worker'>('together');
  const hiresOpen = settings?.hires_enabled !== false;
  const proOpen = settings?.reg_pro_enabled !== false;

  return (
    <div className="pb-0">
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-[#E0B5CB]/40"
        aria-hidden
      >
        <div
          className="h-full bg-[#660033] transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-[#2B0116]">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('${images.story}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B0116] via-[#2B0116]/75 to-[#2B0116]/25" />
        <div className="relative z-10 w-full px-6 md:w-[90vw] md:mx-auto pb-16 md:pb-24 pt-32 space-y-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#E0B5CB]">Our story</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] max-w-5xl">
            Our Story, What inspired Us?
          </h1>
          <p className="text-2xl md:text-4xl text-white/90 font-medium italic leading-snug max-w-4xl">
            Birdie was born from a lifetime of living in a home that never stopped moving.
          </p>
          <button
            type="button"
            onClick={() => jumpTo('home')}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white pt-4"
          >
            Walk the story
            <span className="animate-bounce">↓</span>
          </button>
        </div>
      </section>

      <nav className="sticky top-[72px] z-40 bg-[#F8FAFB]/95 backdrop-blur-md border-b border-slate-100">
        <div className="w-full px-4 md:w-[90vw] md:mx-auto overflow-x-auto">
          <ol className="flex min-w-max md:min-w-0 md:grid md:grid-cols-5 gap-1 py-3">
            {CHAPTERS.map((chapter) => {
              const isActive = active === chapter.id;
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(chapter.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl transition-colors',
                      isActive ? 'bg-[#660033] text-white' : 'text-[#615A5C] hover:bg-white hover:text-[#660033]'
                    )}
                  >
                    <span className={cn('block text-[10px] font-bold uppercase tracking-[0.2em]', isActive ? 'text-white/70' : 'text-[#E0B5CB]')}>
                      Chapter {chapter.num}
                    </span>
                    <span className="block text-sm font-bold">{chapter.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <section id="home" className="scroll-mt-40 w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24">
        <Reveal className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-8 space-y-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">Chapter 01 · The home</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight leading-tight">
              A house that never stopped moving
            </h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-lg md:text-xl text-[#615A5C] font-medium leading-[1.85]">
              <p>
                Growing up in a busy entrepreneurial household, where several businesses ran at once, and a household full
                of people who needed care, coordination, and support.
              </p>
              <p>
                With the constant activity came a constant need for extra hands: nannies, helps, cooks, and general
                domestic support. And even with all that, it never felt like enough.
              </p>
            </div>
          </div>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-44 bg-[#F4E8EE] border border-[#660033]/15 rounded-[2rem] p-8 md:p-10">
              <p className="font-hand text-2xl md:text-3xl text-[#660033] leading-snug">
                Extra hands were always needed. Trust was the part that never quite arrived.
              </p>
            </div>
          </aside>
        </Reveal>
      </section>

      <section id="trust" className="scroll-mt-40 bg-white border-y border-slate-100">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto py-20 md:py-28 space-y-16">
          <Reveal className="max-w-none text-center space-y-6">
            <p className="text-xl md:text-2xl text-[#615A5C] font-medium">But the real challenge wasn’t the workload.</p>
            <p className="text-5xl md:text-8xl font-bold text-[#660033] tracking-tight">It was trust.</p>
          </Reveal>

          <Reveal className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7 space-y-6 text-lg md:text-xl text-[#615A5C] font-medium leading-[1.85]">
              <p>
                For years, my family, like many Nigerian families, struggled with the cycle of finding domestic help that
                never seemed to last. Workers came and went. Some were untrained or unreliable, some were overwhelmed, and
                others simply couldn’t stay due to a breach in agreement.
              </p>
              <p>
                We tried everything: agents, referrals, long searches, and even taking in young adults whose families were
                willing to let them work in exchange for shelter and basic education.
              </p>
              <p className="text-[#0A0A0A] font-bold text-xl md:text-2xl">
                Some of those stories ended well. Many did not.
              </p>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Agents', note: 'We tried them' },
                { label: 'Referrals', note: 'We asked around' },
                { label: 'Long searches', note: 'We kept looking' },
                { label: 'Shelter for work', note: 'We took people in' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#F8FAFB] border border-slate-100 rounded-[1.5rem] p-5 md:p-6 hover-lift"
                >
                  <p className="font-bold text-[#0A0A0A]">{item.label}</p>
                  <p className="text-sm text-[#615A5C] font-medium mt-1">{item.note}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="both" className="scroll-mt-40 w-full px-6 md:w-[90vw] md:mx-auto py-20 md:py-28 space-y-12">
        <Reveal className="space-y-5 max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">Chapter 03 · Both sides</p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight leading-tight">
            Families were hurting. Workers were hurting. The system protected nobody.
          </h2>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { id: 'together', label: 'The whole picture', icon: Users },
                { id: 'family', label: 'If you are a family', icon: Home },
                { id: 'worker', label: 'If you are a worker', icon: Heart },
              ] as const
            ).map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setLens(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold border transition-all',
                  lens === tab.id
                    ? 'bg-[#660033] text-white border-[#660033]'
                    : 'bg-white text-[#615A5C] border-slate-200 hover:border-[#660033]/40 hover:text-[#660033]'
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal className="grid md:grid-cols-2 gap-6">
          <div
            className={cn(
              'rounded-[2rem] p-8 md:p-10 border transition-all',
              lens === 'worker' ? 'opacity-40' : 'opacity-100',
              lens === 'family' ? 'bg-[#660033] text-white border-[#660033]' : 'bg-white border-slate-200'
            )}
          >
            <p className={cn('text-[11px] font-bold uppercase tracking-[0.2em] mb-4', lens === 'family' ? 'text-white/70' : 'text-[#E0B5CB]')}>
              Families
            </p>
            <p className={cn('text-lg font-medium leading-relaxed', lens === 'family' ? 'text-white/90' : 'text-[#615A5C]')}>
              We also saw families feel unsafe, disappointed, or exhausted from constantly starting over. The cycle of
              finding help that never seemed to last wore people down.
            </p>
          </div>
          <div
            className={cn(
              'rounded-[2rem] p-8 md:p-10 border transition-all',
              lens === 'family' ? 'opacity-40' : 'opacity-100',
              lens === 'worker' ? 'bg-[#660033] text-white border-[#660033]' : 'bg-white border-slate-200'
            )}
          >
            <p className={cn('text-[11px] font-bold uppercase tracking-[0.2em] mb-4', lens === 'worker' ? 'text-white/70' : 'text-[#E0B5CB]')}>
              Workers
            </p>
            <p className={cn('text-lg font-medium leading-relaxed', lens === 'worker' ? 'text-white/90' : 'text-[#615A5C]')}>
              We saw workers run away, steal out of desperation, fall into difficult situations, become pregnant, or
              simply lose hope. So many young adults were idle and unemployed, eager for opportunity but afraid of
              exploitation or maltreatment in homes far from their own.
            </p>
          </div>
        </Reveal>

        <Reveal className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            'Everyone was struggling, clients and workers alike.',
            'Everyone had trust issues.',
            'Everyone felt unprotected by the system.',
            'And everyone deserved better.',
          ].map((line, i) => (
            <div
              key={line}
              className={cn(
                'p-7 md:p-8 rounded-[1.75rem] border min-h-[160px] flex items-end',
                i === 3
                  ? 'bg-[#660033] text-white border-[#660033]'
                  : 'bg-white border-slate-200 text-[#0A0A0A]'
              )}
            >
              <p className="font-bold text-xl leading-snug">{line}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="search" className="scroll-mt-40 bg-[#2B0116] text-white">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto py-20 md:py-28 space-y-14">
          <Reveal className="space-y-5 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#E0B5CB]">Chapter 04 · The search</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              After years of watching this cycle repeat itself, I began to research how to fix it.
            </h2>
          </Reveal>
          <Reveal className="space-y-6">
            {[
              { q: 'How do we bring structure to this informal market?', icon: Scale },
              { q: 'How do we protect families while dignifying workers?', icon: ShieldCheck },
              {
                q: 'How do we create an honest bridge between people who need help and people who genuinely want to work?',
                icon: Search,
              },
            ].map((item, i) => (
              <div
                key={item.q}
                className="flex gap-5 md:gap-8 items-start border-t border-white/15 pt-6"
              >
                <span className="text-[#E0B5CB] font-bold text-sm tracking-[0.2em] pt-1">0{i + 1}</span>
                <item.icon className="text-[#E0B5CB] shrink-0 mt-1" size={28} />
                <p className="text-2xl md:text-4xl font-bold leading-snug">{item.q}</p>
              </div>
            ))}
          </Reveal>
          <Reveal>
            <p className="text-3xl md:text-5xl font-bold text-[#E0B5CB]">That search became Birdie.</p>
          </Reveal>
        </div>
      </section>

      <section id="birdie" className="scroll-mt-40 w-full px-6 md:w-[90vw] md:mx-auto py-20 md:py-28 space-y-16">
        <Reveal className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7 space-y-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">Chapter 05 · Birdie</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight leading-tight">
              Not just a service. A solution. A bridge.
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-[#615A5C] font-medium leading-[1.85]">
              <p>
                Birdie is a platform built from lived experience, designed to make the domestic staffing and personal
                support industry safe, structured, and humane for everyone involved.
              </p>
              <p>
                Birdie exists because we have lived the pain points, saw the gaps, and felt the frustration on both sides.
                I know that with the right system, the right training, and the right verification, we can build a domestic
                ecosystem in Nigeria that truly works.
              </p>
              <p className="text-[#0A0A0A] font-bold italic text-xl md:text-2xl">
                A new beginning, for households, for workers, and for the industry at large.
              </p>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="bg-[#F4E8EE] border border-[#660033]/15 rounded-[2rem] p-8 md:p-10 space-y-6">
              <Sparkles className="text-[#660033]" size={28} />
              <p className="font-hand text-2xl md:text-[1.85rem] text-[#660033] leading-snug">
                Birdie is a platform built from lived experience, designed to make the domestic staffing and personal
                support industry safe, structured, and humane for everyone involved.
              </p>
            </div>
          </aside>
        </Reveal>

        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033] mb-6">A place where</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Workers are trained, respected, and protected.',
                icon: Award,
              },
              {
                title: 'Families hire with confidence.',
                icon: ShieldCheck,
              },
              {
                title: 'Psychotherapy and emotional support are accessible, and dignity sits at the centre of every connection.',
                icon: Heart,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4 hover-lift"
              >
                <item.icon className="text-[#660033]" size={28} />
                <p className="text-lg font-bold text-[#0A0A0A] leading-snug">{item.title}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-[#660033] text-white">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto py-20 md:py-24 space-y-10">
          <Reveal className="space-y-4 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">Your chapter starts here</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Choose how you want to be part of this story.
            </h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed">
              Birdie is not just a service. It is a solution. A bridge. Pick the path that is yours.
            </p>
          </Reveal>
          <Reveal className="grid md:grid-cols-2 gap-5">
            <Link
              to={hiresOpen ? '/hire' : '/contact'}
              className="group bg-white text-[#0A0A0A] rounded-[2rem] p-8 md:p-10 space-y-5 hover-lift"
            >
              <Home className="text-[#660033]" size={32} />
              <h3 className="text-2xl md:text-3xl font-bold">Find a professional</h3>
              <p className="text-[#615A5C] font-medium leading-relaxed">
                Hire with confidence. Meet checked nannies, house help, cooks, drivers and more — with a clear agreement
                and money held until the work is done.
              </p>
              <span className="inline-flex items-center gap-2 font-bold text-[#660033]">
                {hiresOpen ? 'Find someone to help' : 'Talk to us'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              to={proOpen ? '/register?role=professional' : '/contact'}
              className="group bg-[#2B0116] text-white rounded-[2rem] p-8 md:p-10 space-y-5 hover-lift border border-white/10"
            >
              <Heart className="text-[#E0B5CB]" size={32} />
              <h3 className="text-2xl md:text-3xl font-bold">Become a professional</h3>
              <p className="text-white/75 font-medium leading-relaxed">
                Work with respect, training, and pay you can count on. Join a system built so you are not left
                unprotected.
              </p>
              <span className="inline-flex items-center gap-2 font-bold text-[#E0B5CB]">
                {proOpen ? 'Sign up for work' : 'Talk to us'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

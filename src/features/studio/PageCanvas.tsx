import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/features/public/sections/SectionHeading';
import { FaqItem } from '@/features/public/sections/FaqItem';
import { Reveal } from '@/features/public/sections/Reveal';
import { CATEGORIES } from '@/data/constants';
import { useImages } from '@/app/SiteMediaProvider';
import { useAuth } from '@/app/AuthProvider';
import type { BlogPost } from '@/types';
import type { PageBlock, PageLayoutDoc } from './schema';
import { resolveStudioImage } from './resolveImage';

export type CanvasPro = {
  id: string;
  fullName: string;
  category: string;
  location: string;
  photo: string;
  live: boolean;
};

function hrefFor(to: string, hireTo: string) {
  return to === '/hire' ? hireTo : to;
}

function BlockFrame({
  editing,
  children,
  onSelect,
  selected,
  label,
  blockId,
  onMove,
}: {
  editing: boolean;
  children: ReactNode;
  onSelect?: () => void;
  selected?: boolean;
  label?: string;
  blockId?: string;
  onMove?: (fromId: string, toId: string) => void;
}) {
  if (!editing) return <>{children}</>;
  return (
    <div
      className={`relative ${selected ? 'ring-2 ring-[#660033] ring-offset-2' : 'ring-1 ring-transparent hover:ring-[#E0B5CB]'}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData('text/plain');
        if (from && blockId && from !== blockId) onMove?.(from, blockId);
      }}
    >
      {label && (
        <div className="absolute z-20 left-3 top-3 flex items-center gap-1">
          <button
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', blockId || '');
              e.dataTransfer.effectAllowed = 'move';
            }}
            className="px-2 py-1 rounded-md bg-[#660033] text-white text-[10px] font-bold uppercase tracking-widest cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            ::
          </button>
          <button
            type="button"
            onClick={onSelect}
            className="px-2 py-1 rounded-md bg-[#660033] text-white text-[10px] font-bold uppercase tracking-widest"
          >
            {label}
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

function HeroBlock({
  block,
  hireTo,
  proOpen,
}: {
  block: Extract<PageBlock, { type: 'hero' }>;
  hireTo: string;
  proOpen: boolean;
}) {
  const images = useImages();
  const hero = resolveStudioImage(block.imageSlot, images);
  const avatars = [images.homeReach1, images.homeReach2, images.homeTestimonial];
  return (
    <section className="relative min-h-[88vh] flex items-start lg:items-end overflow-hidden">
      <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2B0116]/92 via-[#660033]/75 to-[#660033]/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B0116]/50 via-transparent to-[#2B0116]/20" />
      <img
        src={images.markLight}
        alt=""
        className="pointer-events-none absolute -right-8 bottom-8 w-56 md:w-80 opacity-[0.12]"
      />
      <div className="relative z-10 w-full px-6 md:w-[90vw] md:mx-auto pt-[calc(var(--public-chrome-h,72px)+3rem)] pb-16 lg:py-24">
        <div className="max-w-xl space-y-7">
          {block.eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#E0B5CB]">{block.eyebrow}</p>
          )}
          <h1 className="font-bold text-4xl sm:text-5xl lg:text-[3.5rem] text-white tracking-tight leading-[1.08]">
            {block.title}
          </h1>
          {block.subtitle && (
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed">{block.subtitle}</p>
          )}
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 pt-1">
            <Link to={hrefFor(block.ctaTo, hireTo)} className="inline-flex shrink-0">
              <Button size="lg" variant="inverse" className="whitespace-nowrap hover-lift">
                {block.ctaLabel} <ArrowRight size={20} />
              </Button>
            </Link>
            {block.proofLabel && (
              <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-full pl-1.5 pr-4 py-1.5">
                <div className="flex -space-x-3">
                  {avatars.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-white leading-tight">{block.proofLabel}</p>
              </div>
            )}
          </div>
          {proOpen && block.secondaryLabel && (
            <Link
              to="/register?role=professional"
              className="inline-flex text-sm font-bold text-[#E0B5CB] hover:text-white hover:underline underline-offset-4"
            >
              {block.secondaryLabel}
            </Link>
          )}
          <div className="flex flex-wrap gap-2 pt-2 md:hidden">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/professionals?category=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 rounded-full bg-white/95 text-[#660033] text-xs font-bold shadow-sm border border-white"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden md:flex absolute right-6 lg:right-[5vw] bottom-16 z-10 flex-col items-end gap-2 max-w-[220px]">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            to={`/professionals?category=${encodeURIComponent(cat)}`}
            className="px-4 py-1.5 rounded-full bg-white/95 text-[#660033] text-xs font-bold shadow-lg shadow-black/10 border border-white hover:bg-[#660033] hover:text-white transition-colors"
          >
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PageCanvas({
  layout,
  editing,
  selectedId,
  onSelect,
  onMove,
  pros,
  posts,
}: {
  layout: PageLayoutDoc;
  editing?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onMove?: (fromId: string, toId: string) => void;
  pros?: CanvasPro[];
  posts?: BlogPost[];
}) {
  const { settings } = useAuth();
  const images = useImages();
  const hiresOpen = settings?.hires_enabled !== false;
  const proOpen = settings?.reg_pro_enabled !== false;
  const hireTo = hiresOpen ? '/hire' : '/professionals';
  const email = settings?.support_email || 'support@birdie.ng';
  const phone = settings?.support_phone;
  const featured = posts?.[0];

  return (
    <div>
      {layout.blocks
        .filter((b) => editing || !b.hidden)
        .map((block) => (
          <BlockFrame
            key={block.id}
            blockId={block.id}
            editing={Boolean(editing)}
            selected={selectedId === block.id}
            label={block.type}
            onSelect={() => onSelect?.(block.id)}
            onMove={onMove}
          >
            {block.hidden && editing && (
              <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 py-2 bg-slate-100">
                Hidden on the live site
              </p>
            )}
            <RenderBlock
              block={block}
              hireTo={hireTo}
              proOpen={proOpen}
              email={email}
              phone={phone}
              images={images}
              pros={pros || []}
              featured={featured}
            />
          </BlockFrame>
        ))}
    </div>
  );
}

function RenderBlock({
  block,
  hireTo,
  proOpen,
  email,
  phone,
  images,
  pros,
  featured,
}: {
  block: PageBlock;
  hireTo: string;
  proOpen: boolean;
  email: string;
  phone?: string | null;
  images: ReturnType<typeof useImages>;
  pros: CanvasPro[];
  featured?: BlogPost;
}) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} hireTo={hireTo} proOpen={proOpen} />;
    case 'reach':
      return (
        <section className="w-full px-6 md:w-[90vw] md:mx-auto py-12 md:py-16">
          <Reveal className="grid md:grid-cols-[auto_1fr_auto] gap-8 items-center bg-white border border-slate-200 rounded-[2.125rem] p-6 md:p-10">
            <img
              src={resolveStudioImage(block.imageSlotLeft, images)}
              alt=""
              className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] object-cover hidden md:block"
            />
            <div className="text-center space-y-3">
              <p className="font-bold text-2xl md:text-3xl text-[#0A0A0A] leading-snug">{block.title}</p>
              {block.subtitle && <p className="text-[#615A5C] font-medium">{block.subtitle}</p>}
              <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-[#660033]">
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2">
                  <Mail size={16} /> {email}
                </a>
                {phone && (
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-2">
                    <Phone size={16} /> {phone}
                  </a>
                )}
              </div>
            </div>
            <img
              src={resolveStudioImage(block.imageSlotRight, images)}
              alt=""
              className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] object-cover hidden md:block"
            />
          </Reveal>
        </section>
      );
    case 'splitPhotoText': {
      const photo = (
        <div className="relative">
          <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200">
            <img src={resolveStudioImage(block.imageSlot, images)} alt="" className="w-full h-full object-cover" />
          </div>
          {block.caption && (
            <div className="absolute left-5 bottom-5 right-12 md:right-20 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white">
              <p className="font-bold text-lg md:text-xl text-[#660033] leading-snug">{block.caption}</p>
            </div>
          )}
        </div>
      );
      const copy = (
        <div className="space-y-6">
          <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
          {block.pills && block.pills.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {block.pills.map((p) => (
                <p key={p.label} className="text-sm font-bold uppercase tracking-widest text-[#615A5C]">
                  {p.label}
                </p>
              ))}
            </div>
          )}
          {block.ctaLabel && block.ctaTo && (
            <Link to={hrefFor(block.ctaTo, hireTo)}>
              <Button size="lg" className="hover-lift">
                {block.ctaLabel} <ArrowRight size={18} />
              </Button>
            </Link>
          )}
        </div>
      );
      const photoFirst = block.imageSide !== 'right';
      return (
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="relative w-full px-6 md:w-[90vw] md:mx-auto space-y-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {photoFirst ? photo : copy}
              {photoFirst ? copy : photo}
            </div>
            {block.cards && block.cards.length > 0 && (
              <div className="grid md:grid-cols-3 gap-5">
                {block.cards.map((c) => (
                  <div key={c.title} className="bg-white border border-slate-200 rounded-[1.75rem] p-7 space-y-3">
                    <h3 className="text-lg font-bold text-[#0A0A0A] leading-snug">{c.title}</h3>
                    <p className="text-sm text-[#615A5C] font-medium leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }
    case 'meetPros':
      return (
        <section className="bg-white border-y border-slate-100 py-16 md:py-24">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
              <Link to="/professionals" className="text-[#660033] font-bold inline-flex items-center gap-1 shrink-0">
                See all professionals <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pros.map((pro) => (
                <div
                  key={pro.id}
                  className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] overflow-hidden h-full flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#F1F5F9]">
                    <img src={pro.photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{pro.category}</p>
                    <h3 className="text-lg font-bold text-[#0A0A0A]">{pro.fullName}</h3>
                    <p className="text-xs font-bold text-[#615A5C] inline-flex items-center gap-1">
                      <MapPin size={12} /> {pro.location}
                    </p>
                    <div className="mt-auto pt-2">
                      <Link to={pro.live ? `/professionals/${pro.id}` : '/professionals'}>
                        <Button variant="secondary" size="sm" className="w-full">
                          {pro.live ? 'See profile' : 'See people'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'steps':
      return (
        <section className="w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
              <ol className="space-y-0">
                {block.items.map((s) => (
                  <li key={s.n} className="flex gap-5 py-5 border-t border-slate-200 first:border-t-0">
                    <span className="font-bold text-2xl text-[#E0B5CB] shrink-0">{s.n}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A0A0A]">{s.t}</h3>
                      <p className="text-sm text-[#615A5C] font-medium leading-relaxed mt-1">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
              <img src={resolveStudioImage(block.imageSlot, images)} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      );
    case 'quotes':
      return (
        <section className="w-full px-6 md:w-[90vw] md:mx-auto pb-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-white border border-slate-200 rounded-[2.125rem] p-8 md:p-12">
            <div className="grid sm:grid-cols-2 gap-4">
              {block.items[0] && (
                <img
                  src={resolveStudioImage(block.items[0].imageSlot, images)}
                  alt=""
                  className="rounded-[1.75rem] object-cover w-full h-64 sm:h-full min-h-[280px]"
                />
              )}
              <div className="space-y-4">
                {block.items.map((q, i) => (
                  <div
                    key={`${q.name}-${i}`}
                    className={
                      i === 0
                        ? 'bg-[#F8FAFB] border border-slate-100 rounded-2xl p-5'
                        : 'bg-white border border-slate-200 rounded-2xl p-5'
                    }
                  >
                    <p className="font-bold text-lg text-[#0A0A0A] leading-snug">“{q.quote}”</p>
                    <p className="text-sm font-bold text-[#660033] mt-4">{q.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#615A5C]">{q.role}</p>
                  </div>
                ))}
              </div>
            </div>
            <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
          </div>
        </section>
      );
    case 'ctaBand':
      return (
        <section
          className={
            block.dark
              ? 'relative overflow-hidden bg-[#660033] text-white'
              : 'relative overflow-hidden bg-white border-y border-slate-100'
          }
        >
          {block.dark && (
            <img
              src={images.markLight}
              alt=""
              className="pointer-events-none absolute -right-8 -bottom-10 w-80 md:w-[28rem] opacity-[0.12]"
            />
          )}
          <div className="relative w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {block.eyebrow && (
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.25em] ${block.dark ? 'text-white/60' : 'text-[#660033]'}`}
                >
                  {block.eyebrow}
                </p>
              )}
              <h2
                className={`font-bold text-3xl md:text-5xl tracking-tight leading-tight ${block.dark ? 'text-white' : 'text-[#0A0A0A]'}`}
              >
                {block.title}
              </h2>
              {block.subtitle && (
                <p className={`text-lg font-medium leading-relaxed max-w-xl ${block.dark ? 'text-white/80' : 'text-[#615A5C]'}`}>
                  {block.subtitle}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={hrefFor(block.ctaTo, hireTo)}>
                  <Button size="lg" variant={block.dark ? 'inverse' : 'primary'} className="w-full sm:w-auto">
                    {block.ctaLabel}
                  </Button>
                </Link>
                {block.secondaryLabel && block.secondaryTo && (
                  <Link to={hrefFor(block.secondaryTo, hireTo)}>
                    <Button
                      size="lg"
                      variant={block.dark ? 'outlineOnBrand' : 'secondary'}
                      className="w-full sm:w-auto"
                    >
                      {block.secondaryLabel}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div
              className={`aspect-[4/3] rounded-[2.125rem] overflow-hidden ${block.dark ? 'border border-white/15' : 'border border-slate-200'}`}
            >
              <img src={resolveStudioImage(block.imageSlot, images)} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      );
    case 'faq':
      return (
        <section className="bg-white border-y border-slate-100 py-16 md:py-24">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto grid lg:grid-cols-2 gap-12">
            <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
            <div className="space-y-3">
              {block.items.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>
      );
    case 'blogTeaser':
      return (
        <section className="w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
            <Link to="/blog" className="text-[#660033] font-bold flex items-center gap-1 shrink-0">
              See all <ChevronRight size={16} />
            </Link>
          </div>
          {featured && (
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid lg:grid-cols-2 bg-white border border-slate-200 rounded-[2.125rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all"
            >
              <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[320px] bg-[#F1F5F9]">
                <img
                  src={featured.imageUrl || images.blogCover}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
              <div className="p-8 md:p-12 space-y-4 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{featured.category}</p>
                <h3 className="font-bold text-2xl md:text-4xl text-[#0A0A0A] leading-tight">{featured.title}</h3>
                <p className="text-[#615A5C] font-medium leading-relaxed">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 font-bold text-[#660033] pt-2">
                  Read more <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          )}
        </section>
      );
    case 'storyTeaser':
      return (
        <section className="bg-white border-y border-slate-100 py-16 md:py-24">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="flex-1 space-y-6">
              {block.eyebrow && (
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">{block.eyebrow}</p>
              )}
              <h2 className="font-bold text-3xl md:text-4xl text-[#0A0A0A] italic leading-snug">“{block.title}”</h2>
              {block.body && <p className="text-lg text-[#615A5C] font-medium leading-relaxed">{block.body}</p>}
              {block.ctaLabel && block.ctaTo && (
                <Link
                  to={hrefFor(block.ctaTo, hireTo)}
                  className="inline-flex items-center gap-3 font-bold text-[#660033] hover:gap-4 transition-all"
                >
                  {block.ctaLabel} <ArrowRight size={18} />
                </Link>
              )}
            </div>
            <div className="w-full md:w-96 h-80 rounded-[2.125rem] overflow-hidden border border-slate-100">
              <img src={resolveStudioImage(block.imageSlot, images)} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}

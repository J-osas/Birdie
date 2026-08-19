import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import { StudioEditBar } from '@/features/studio/StudioEditBar';
import { useStudio } from '@/features/studio/StudioProvider';
import { useAuth } from '@/app/AuthProvider';
import { useImages } from '@/app/SiteMediaProvider';

function marketingSlug(path: string): string | null {
  if (path === '/') return 'home';
  if (path === '/about') return 'about';
  if (path === '/story') return 'story';
  if (path === '/contact') return 'contact';
  const extra = path.match(/^\/p\/([a-z0-9-]+)$/);
  return extra ? extra[1] : null;
}

function whatsappHref(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('http')) return trimmed;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : trimmed;
}

export default function PublicLayout() {
  const { settings } = useAuth();
  const location = useLocation();
  const studio = useStudio();
  const images = useImages();
  const name = settings?.platform_name || 'Birdie';
  const email = settings?.support_email || 'support@birdie.ng';
  const phone = settings?.support_phone;
  const whatsapp = settings?.support_whatsapp;
  const address = settings?.office_address;
  const banner = settings?.public_banner_enabled && settings.public_banner_text?.trim();
  const hiresOpen = settings?.hires_enabled !== false;
  const proOpen = settings?.reg_pro_enabled !== false;
  const onHome = location.pathname === '/';
  const chromeRef = useRef<HTMLDivElement>(null);
  const [chromeH, setChromeH] = useState(72);

  useEffect(() => {
    const slug = marketingSlug(location.pathname);
    if (slug) void studio.attach(slug);
    else studio.detach();
  }, [location.pathname, studio.attach, studio.detach]);

  useEffect(() => {
    const el = chromeRef.current;
    if (!onHome || !el) return;
    const apply = () => setChromeH(Math.round(el.getBoundingClientRect().height));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHome, banner]);

  const notice = banner ? (
    <div className="bg-[#660033] text-white text-center text-sm font-bold px-4 py-2">
      {settings.public_banner_text}
    </div>
  ) : null;

  return (
    <div
      className="min-h-screen bg-[#F8FAFB] flex flex-col"
      style={onHome ? ({ ['--public-chrome-h']: `${chromeH}px` } as CSSProperties) : undefined}
    >
      {onHome ? (
        <div ref={chromeRef} className="fixed top-0 left-0 right-0 z-50">
          {notice}
          <PublicHeader />
        </div>
      ) : (
        <>
          {notice}
          <PublicHeader />
        </>
      )}
      <StudioEditBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-auto">
        <div className="bg-white border-t border-slate-100">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2 space-y-5">
              <Link to="/" className="inline-flex items-center rounded-2xl bg-[#660033] px-5 py-4">
                <img
                  src={images.logoOnDark}
                  alt="Birdie"
                  className="h-10 w-auto max-w-[200px] object-contain object-left"
                />
              </Link>
              <p className="text-[#615A5C] font-medium max-w-md leading-relaxed">
                Good help for Lagos homes. We check every person, agree the price up front, and hold your money until the
                work is done.
              </p>
              <p className="text-sm font-bold text-[#660033] space-y-1">
                <span className="block">{address || 'Lagos, Nigeria'} · {email}</span>
                {phone && <span className="block">{phone}</span>}
                {whatsapp && (
                  <a href={whatsappHref(whatsapp)} className="block underline underline-offset-4" target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                )}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Company</p>
              <Link to="/about" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                About us
              </Link>
              <Link to="/story" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Our story
              </Link>
              <Link to="/contact" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Contact
              </Link>
              <Link to="/blog" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Reading
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Get started</p>
              <Link to="/professionals" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Find help
              </Link>
              {hiresOpen ? (
                <Link to="/hire" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                  Hire someone
                </Link>
              ) : (
                <p className="text-sm font-semibold text-slate-400">We are not taking new requests</p>
              )}
              {proOpen ? (
                <Link to="/register?role=professional" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                  I am looking for work
                </Link>
              ) : (
                <p className="text-sm font-semibold text-slate-400">Professional sign-up is closed</p>
              )}
              <Link to="/login" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#660033] text-white">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto py-5 flex flex-col sm:flex-row justify-between gap-3 text-xs font-bold uppercase tracking-[0.15em] text-white/70">
            <span>© {new Date().getFullYear()} {name}.ng</span>
            <span>Home help · Made for Lagos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


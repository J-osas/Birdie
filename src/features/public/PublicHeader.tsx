import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/AuthProvider';
import { BrandLogo } from './BrandLogo';
import { useImages } from '@/app/SiteMediaProvider';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/professionals', label: 'Find help' },
  { to: '/about', label: 'About us' },
  { to: '/story', label: 'Our story' },
  { to: '/blog', label: 'Reading' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicHeader() {
  const { user, status, settings } = useAuth();
  const images = useImages();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const hiresOpen = settings?.hires_enabled !== false;
  const hireTo = hiresOpen ? '/hire' : '/professionals';
  const signedIn = status === 'authenticated' && user;
  const onHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        'z-50 transition-all duration-300',
        onHome ? 'bg-transparent border-transparent' : 'sticky top-0',
        !onHome &&
          (scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-200/40'
            : 'bg-white/80 backdrop-blur-md border-b border-transparent')
      )}
    >
      <div className="w-full px-6 md:w-[90vw] md:mx-auto flex items-center justify-between h-[72px]">
        <Link
          to="/"
          className={cn(
            'group shrink-0 relative z-50 rounded-2xl px-3 py-1.5 transition-transform',
            onHome && 'bg-white'
          )}
          onClick={() => setOpen(false)}
        >
          <BrandLogo className="group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <nav
          className={cn(
            'hidden lg:flex items-center gap-1 p-1 rounded-full border',
            onHome ? 'bg-white border-white' : 'bg-[#F8FAFB] border-slate-200/80'
          )}
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-full text-sm font-semibold tracking-tight transition-all',
                  isActive
                    ? onHome
                      ? 'bg-[#E0B5CB] text-[#660033]'
                      : 'bg-white text-[#660033] shadow-sm'
                    : onHome
                      ? 'text-[#660033] hover:bg-[#E0B5CB]/50'
                      : 'text-[#615A5C] hover:text-[#660033] hover:bg-white/70'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {signedIn ? (
            <Link to="/app" className="hidden sm:block">
              <Button
                size="sm"
                className={
                  onHome
                    ? 'bg-white !text-[#660033] hover:!bg-[#660033] hover:!text-white shadow-none'
                    : undefined
                }
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className={onHome ? 'text-white hover:text-[#E0B5CB]' : undefined}
                >
                  Sign in
                </Button>
              </Link>
              <Link to={hireTo} className="hidden sm:block">
                <Button
                  size="sm"
                  className={
                    onHome
                      ? 'bg-white !text-[#660033] hover:!bg-[#660033] hover:!text-white shadow-none'
                      : undefined
                  }
                >
                  {hiresOpen ? 'Find help' : 'See people'}
                </Button>
              </Link>
            </>
          )}
          <button
            type="button"
            className={cn(
              'lg:hidden w-11 h-11 rounded-full flex items-center justify-center transition-colors',
              onHome
                ? 'bg-white text-[#660033] border border-white'
                : 'border border-slate-200 text-[#0A0A0A] hover:border-[#660033]/30 hover:text-[#660033]'
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] min-h-[100dvh] bg-[#2B0116] text-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <img
            src={images.markLight}
            alt=""
            className="pointer-events-none absolute -right-10 bottom-10 w-64 opacity-[0.12]"
          />
          <div className="relative flex items-center justify-between px-6 h-[72px] shrink-0">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-white px-3 py-1.5"
            >
              <BrandLogo />
            </Link>
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-white text-[#660033] flex items-center justify-center"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="relative flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block text-3xl font-bold py-3 tracking-tight transition-colors',
                    isActive ? 'text-[#E0B5CB]' : 'text-white hover:text-[#E0B5CB]'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative px-6 pb-10 pt-4 flex flex-col gap-5 shrink-0">
            {signedIn ? (
              <Link to="/app" onClick={() => setOpen(false)} className="block w-full">
                <Button size="lg" variant="inverse" className="w-full whitespace-nowrap">
                  Dashboard <ArrowRight size={18} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to={hireTo} onClick={() => setOpen(false)} className="block w-full">
                  <Button size="lg" variant="inverse" className="w-full whitespace-nowrap">
                    {hiresOpen ? 'Find someone to help' : 'See people'} <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/register?role=professional" onClick={() => setOpen(false)} className="block w-full">
                  <Button size="lg" variant="outlineOnBrand" className="w-full whitespace-nowrap">
                    I am looking for work
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setOpen(false)} className="block w-full">
                  <Button
                    size="lg"
                    className="w-full whitespace-nowrap bg-[#E0B5CB] text-[#660033] hover:bg-white shadow-none"
                  >
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

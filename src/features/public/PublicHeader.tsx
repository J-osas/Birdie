import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/AuthProvider';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/professionals', label: 'Find help' },
  { to: '/about', label: 'About us' },
  { to: '/story', label: 'Our story' },
  { to: '/blog', label: 'Reading' },
  { to: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-semibold tracking-tight transition-colors',
    isActive ? 'text-[#660033]' : 'text-[#615A5C] hover:text-[#660033]'
  );

export default function PublicHeader() {
  const { user, status, settings } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-200/40'
          : 'bg-white/80 backdrop-blur-md border-b border-transparent'
      )}
    >
      <div className="w-full px-6 md:w-[90vw] md:mx-auto flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-[#660033] text-white font-bold flex items-center justify-center text-lg group-hover:-translate-y-0.5 transition-transform">
            B
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0A0A0A]">Birdie</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === 'authenticated' && user ? (
            <Link to="/app">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to={settings?.hires_enabled === false ? '/professionals' : '/hire'} className="hidden sm:block">
                <Button size="sm">{settings?.hires_enabled === false ? 'See people' : 'Find help'}</Button>
              </Link>
              <Link to="/register" className="sm:hidden">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
          <button
            type="button"
            className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-[#0A0A0A]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-6 space-y-4 shadow-xl">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('block text-base font-bold py-2', isActive ? 'text-[#660033]' : 'text-[#0A0A0A]')
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {settings?.hires_enabled !== false && (
            <Link to="/hire" onClick={() => setOpen(false)}>
              <Button className="w-full">Find someone to help</Button>
            </Link>
            )}
            <Link to="/register?role=professional" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full">
                I am looking for work
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

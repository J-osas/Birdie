import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  Settings,
  Users,
  FileText,
  Megaphone,
  LogOut,
  Loader2,
  Search,
  Bell,
  User,
  Calendar,
  Star,
  CreditCard,
  MoreHorizontal,
  MessageSquare,
  UserRound,
  BarChart3,
  Shield,
  UserCircle,
  Images,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { UserRole } from '@/types';
import { useImages } from '@/app/SiteMediaProvider';
import { BrandLogo } from '@/features/public/BrandLogo';
import StaffNotificationsBell from '@/features/app/StaffNotificationsBell';
import { getTheme, resolveTheme, type AppTheme } from '@/lib/theme';

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
};

export default function AppShell() {
  const { status, user, proProfile, blockedReason, signOut, settings } = useAuth();
  const images = useImages();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<AppTheme>(() => getTheme());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(getTheme()));
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onTheme = (e: Event) => {
      const next = (e as CustomEvent<AppTheme>).detail || getTheme();
      setThemeState(next);
    };
    window.addEventListener('birdie-theme', onTheme as EventListener);
    return () => window.removeEventListener('birdie-theme', onTheme as EventListener);
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme);
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setResolvedTheme(mq.matches ? 'dark' : 'light');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [theme]);

  useEffect(() => {
    setMoreOpen(false);
    setAvatarMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen && !avatarMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setAvatarMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen, avatarMenuOpen]);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = avatarMenuRef.current;
      if (el && !el.contains(e.target as Node)) setAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [avatarMenuOpen]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <BrandLogo markClassName="h-12 animate-pulse" />
        <div className="flex items-center gap-2 text-[#660033] text-sm font-bold uppercase tracking-widest">
          <Loader2 className="animate-spin" size={16} /> Connecting to Birdie…
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFB]">
        <div className="max-w-md bg-white border border-slate-200 rounded-[1.75rem] p-10 text-center space-y-4 shadow-xl">
          <BrandLogo className="mx-auto" markClassName="h-12" />
          <h1 className="text-2xl font-bold text-[#0A0A0A]">You cannot sign in right now</h1>
          <p className="text-sm text-[#615A5C] font-medium">{blockedReason}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-sm font-bold text-[#660033]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS;
  const isPro = user.role === UserRole.PROFESSIONAL;
  const isClient = user.role === UserRole.CLIENT;

  if (settings?.admin_only_access && !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFB]">
        <div className="max-w-md bg-white border border-slate-200 rounded-[1.75rem] p-10 text-center space-y-4 shadow-xl">
          <BrandLogo className="mx-auto" markClassName="h-12" />
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Birdie is closed for now</h1>
          <p className="text-sm text-[#615A5C] font-medium">
            Only the Birdie team can sign in at the moment. Public pages are still open. Please try again later.
          </p>
          <button type="button" onClick={() => signOut()} className="text-sm font-bold text-[#660033]">
            Sign out
          </button>
        </div>
      </div>
    );
  }
  const needsAssessment = isPro && proProfile && !proProfile.assessmentCompletedAt;
  const onAssessmentRoute =
    location.pathname.includes('/assessment') || location.pathname.includes('/onboarding');

  if (needsAssessment && !onAssessmentRoute) {
    return <Navigate to="/app/assessment" replace />;
  }

  const links: NavItem[] = isStaff
    ? [
        { to: '/app', icon: LayoutDashboard, label: 'Overview', end: true },
        { to: '/app/professionals', icon: Users, label: 'Professionals' },
        { to: '/app/clients', icon: UserCircle, label: 'Clients' },
        { to: '/app/hires', icon: Briefcase, label: 'Requests' },
        { to: '/app/payments', icon: Wallet, label: 'Money' },
        { to: '/app/admin/reviews', icon: Star, label: 'Reviews' },
        { to: '/app/cms', icon: FileText, label: 'Website text' },
        { to: '/app/gallery', icon: Images, label: 'Gallery' },
        { to: '/app/studio', icon: Sparkles, label: 'Studio' },
        { to: '/app/communications', icon: Megaphone, label: 'Emails' },
        { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
        { to: '/app/security', icon: Shield, label: 'Security' },
      ]
    : isPro
      ? [
          { to: '/app', icon: LayoutDashboard, label: 'Home', end: true },
          { to: '/app/hires', icon: Briefcase, label: 'My jobs' },
          { to: '/app/calendar', icon: Calendar, label: 'Calendar' },
          { to: '/app/reviews', icon: Star, label: 'Reviews' },
          { to: '/app/profile', icon: User, label: 'My profile' },
          { to: '/app/wallet', icon: CreditCard, label: 'My money' },
          { to: '/app/settings', icon: Settings, label: 'Settings' },
        ]
      : [
          { to: '/app', icon: Search, label: 'Find help', end: true },
          { to: '/app/hires', icon: Briefcase, label: 'My requests' },
          { to: '/app/payments', icon: CreditCard, label: 'My payments' },
          { to: '/app/inbox', icon: Bell, label: 'Messages' },
          { to: '/app/account', icon: User, label: 'My details' },
        ];

  const primaryLinks: NavItem[] = isStaff
    ? [
        links[0], // Overview
        links[1], // Professionals
        links[3], // Hire requests
        links[4], // Payments
      ]
    : isPro
      ? [
          links[0],
          links[1],
          links[2],
          links[5], // Payments
        ]
      : links;

  const moreLinks: NavItem[] = isStaff
    ? [
        links[2], // Clients
        links[5], // Reviews
        links[6], // CMS
        links[7], // Gallery
        links[8], // Studio
        links[9], // Communications
        links[10], // Analytics
        links[11], // Settings
        links[12], // Security
      ]
    : isPro
      ? [
          links[3], // Reviews
          links[4], // Profile
          links[6], // Settings
          { to: '/app/inbox', icon: MessageSquare, label: 'Messages' },
        ]
      : [];

  const moreActive = moreLinks.some((l) =>
    l.end ? location.pathname === l.to : location.pathname === l.to || location.pathname.startsWith(`${l.to}/`)
  );

  const displayName = user.name || user.firstName || 'User';
  const avatarSrc = user.avatarUrl || proProfile?.avatarUrl || images.avatarFallback;
  const showProfileFooter = isClient || isPro || isStaff;
  const editProfileTo = isPro ? '/app/profile' : isClient ? '/app/account' : '/app/settings';
  const settingsTo = isClient ? '/app/account' : isStaff ? '/app/settings' : '/app/settings';

  return (
    <div className="app-shell min-h-screen flex" data-theme={resolvedTheme}>
      <aside className="hidden md:flex w-64 shrink-0 flex-col h-screen sticky top-0 border-r border-[var(--app-border)] bg-[var(--app-surface)] p-6 gap-8 overflow-y-auto">
        <div>
          <Link to="/app">
            <BrandLogo variant={resolvedTheme === 'dark' ? 'dark' : 'light'} />
          </Link>
          {isStaff && (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{user.role}</p>
          )}
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive ? 'bg-[#660033]/5 text-[#660033]' : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              <l.icon size={18} /> {l.label}
            </NavLink>
          ))}
        </nav>

        {showProfileFooter ? (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <Link
              to={isStaff ? '/app/settings' : isClient ? '/app/account' : '/app/settings'}
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50"
            >
              <img
                src={avatarSrc}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#0A0A0A] truncate">{displayName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {isStaff ? 'Birdie team' : isClient ? 'Family' : 'Professional'}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#660033] hover:bg-[#660033]/5 w-full"
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-rose-600"
          >
            <LogOut size={18} /> Sign out
          </button>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 h-14 md:h-16 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
          <Link to="/app" className="md:hidden">
            <BrandLogo
              variant={resolvedTheme === 'dark' ? 'dark' : 'light'}
              markClassName="h-7"
              className="gap-1.5"
            />
          </Link>
          <div className="hidden md:block" />
          <div className="ml-auto flex items-center gap-1.5">
            {user && <StaffNotificationsBell userId={user.id} role={user.role} />}
            {(isClient || isPro) && (
              <Link
                to="/app/inbox"
                className="p-2 rounded-xl text-slate-400 hover:text-[#660033] hover:bg-slate-50"
                aria-label="Messages"
              >
                <MessageSquare size={20} />
              </Link>
            )}
            <div className="relative md:hidden" ref={avatarMenuRef}>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen((o) => !o)}
                className="rounded-full p-0.5 border border-slate-200 hover:border-[#660033]/40 focus:outline-none focus:ring-2 focus:ring-[#660033]/20"
                aria-label="Account menu"
                aria-expanded={avatarMenuOpen}
              >
                <img src={avatarSrc} alt="" className="w-9 h-9 rounded-full object-cover" />
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 py-2 z-50">
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
                    {displayName}
                  </p>
                  <Link
                    to={editProfileTo}
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <UserRound size={16} className="text-[#660033]" /> My details
                  </Link>
                  <Link
                    to={settingsTo}
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={16} className="text-[#660033]" /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#660033] hover:bg-[#660033]/5 w-full text-left"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-[var(--app-border)] bg-[var(--app-surface)] pb-[env(safe-area-inset-bottom)]">
          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex-1 min-w-0 py-3 text-center text-[10px] font-bold uppercase ${
                  isActive ? 'text-[#660033]' : 'text-slate-400'
                }`
              }
            >
              <l.icon size={18} className="mx-auto mb-1" />
              {l.label}
            </NavLink>
          ))}
          {moreLinks.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={`flex-1 min-w-0 py-3 text-center text-[10px] font-bold uppercase ${
                moreActive || moreOpen ? 'text-[#660033]' : 'text-slate-400'
              }`}
            >
              <MoreHorizontal size={18} className="mx-auto mb-1" />
              More
            </button>
          )}
        </nav>

        {moreOpen && moreLinks.length > 0 && (
          <div className="md:hidden fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
            />
            <div className="absolute bottom-0 inset-x-0 bg-[var(--app-surface)] rounded-t-[1.75rem] border-t border-[var(--app-border)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl space-y-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-2">More</p>
              {moreLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                      isActive ? 'bg-[#660033]/5 text-[#660033]' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <l.icon size={18} /> {l.label}
                </NavLink>
              ))}
              {isStaff && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#660033] w-full"
                >
                  <LogOut size={18} /> Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

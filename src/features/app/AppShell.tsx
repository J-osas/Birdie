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
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { UserRole } from '@/types';
import { IMAGES } from '@/data/images';

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
};

export default function AppShell() {
  const { status, user, proProfile, blockedReason, signOut } = useAuth();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

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
        <div className="w-14 h-14 bg-[#660033] rounded-2xl text-white font-bold text-2xl flex items-center justify-center animate-pulse">
          B
        </div>
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
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#660033] text-white font-bold text-xl flex items-center justify-center">
            B
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Account unavailable</h1>
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
        { to: '/app/hires', icon: Briefcase, label: 'Hire requests' },
        { to: '/app/payments', icon: Wallet, label: 'Payments' },
        { to: '/app/admin/reviews', icon: Star, label: 'Reviews' },
        { to: '/app/cms', icon: FileText, label: 'Content (CMS)' },
        { to: '/app/communications', icon: Megaphone, label: 'Communications' },
        { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
        { to: '/app/security', icon: Shield, label: 'Security' },
      ]
    : isPro
      ? [
          { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
          { to: '/app/hires', icon: Briefcase, label: 'Jobs' },
          { to: '/app/calendar', icon: Calendar, label: 'Calendar' },
          { to: '/app/reviews', icon: Star, label: 'Reviews' },
          { to: '/app/profile', icon: User, label: 'Profile' },
          { to: '/app/wallet', icon: CreditCard, label: 'Payments' },
          { to: '/app/settings', icon: Settings, label: 'Settings' },
        ]
      : [
          { to: '/app', icon: Search, label: 'Find', end: true },
          { to: '/app/hires', icon: Briefcase, label: 'Hires' },
          { to: '/app/inbox', icon: Bell, label: 'Inbox' },
          { to: '/app/account', icon: User, label: 'Account' },
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
        links[7], // Communications
        links[8], // Analytics
        links[9], // Settings
        links[10], // Security
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
  const avatarSrc = user.avatarUrl || proProfile?.avatarUrl || IMAGES.avatarFallback;
  const showProfileFooter = isClient || isPro || isStaff;
  const editProfileTo = isPro ? '/app/profile' : isClient ? '/app/account' : '/app/settings';
  const settingsTo = isClient ? '/app/account' : isStaff ? '/app/settings' : '/app/settings';

  return (
    <div className="min-h-screen flex bg-[#F8FAFB]">
      <aside className="hidden md:flex w-64 shrink-0 flex-col h-screen sticky top-0 border-r border-slate-200 bg-white p-6 gap-8 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#660033] text-white font-bold flex items-center justify-center">
            B
          </div>
          <div>
            <p className="font-bold text-slate-900">Birdie</p>
            {isStaff && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{user.role}</p>
            )}
          </div>
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
                  {isStaff ? 'Admin' : isClient ? 'Client' : 'Professional'}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#660033] hover:bg-[#660033]/5 w-full"
            >
              <LogOut size={18} /> Logout
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
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 h-14 md:h-16 border-b border-slate-200 bg-white">
          <p className="font-bold md:hidden">Birdie</p>
          <div className="hidden md:block" />
          <div className="ml-auto flex items-center gap-1.5">
            {(isClient || isPro) && (
              <Link
                to="/app/inbox"
                className="p-2 rounded-xl text-slate-400 hover:text-[#660033] hover:bg-slate-50"
                aria-label={isClient ? 'Inbox' : 'Messages'}
              >
                <Bell size={20} />
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
                    <UserRound size={16} className="text-[#660033]" /> Edit profile
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
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
            {isStaff && (
              <button
                type="button"
                onClick={() => signOut()}
                className="hidden md:inline text-xs font-bold text-slate-400"
              >
                Sign out
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
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
            <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-[1.75rem] border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl space-y-1">
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

import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
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
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { UserRole } from '@/types';

export default function AppShell() {
  const { status, user, proProfile, signOut } = useAuth();
  const location = useLocation();

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

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS;
  const isPro = user.role === UserRole.PROFESSIONAL;
  const needsAssessment = isPro && proProfile && !proProfile.assessmentCompletedAt;
  const onAssessmentRoute =
    location.pathname.includes('/assessment') || location.pathname.includes('/onboarding');

  if (needsAssessment && !onAssessmentRoute) {
    return <Navigate to="/app/assessment" replace />;
  }

  const links = isStaff
    ? [
        { to: '/app', icon: LayoutDashboard, label: 'Ops hub', end: true },
        { to: '/app/vetting', icon: Users, label: 'Vetting' },
        { to: '/app/hires', icon: Briefcase, label: 'Hires' },
        { to: '/app/payouts', icon: Wallet, label: 'Payouts' },
        { to: '/app/cms', icon: FileText, label: 'CMS' },
        { to: '/app/communications', icon: Megaphone, label: 'Comms' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
      ]
    : isPro
      ? [
          { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
          { to: '/app/hires', icon: Briefcase, label: 'Jobs' },
          { to: '/app/wallet', icon: Wallet, label: 'Wallet' },
          { to: '/app/messages', icon: MessageSquare, label: 'Messages' },
          { to: '/app/settings', icon: Settings, label: 'Settings' },
        ]
      : [
          { to: '/app', icon: LayoutDashboard, label: 'Home', end: true },
          { to: '/app/hires', icon: Briefcase, label: 'My hires' },
          { to: '/app/messages', icon: MessageSquare, label: 'Messages' },
          { to: '/app/settings', icon: Settings, label: 'Settings' },
        ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFB]">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white p-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#660033] text-white font-bold flex items-center justify-center">B</div>
          <div>
            <p className="font-bold text-slate-900">Birdie</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{user.role}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  isActive ? 'bg-[#660033]/5 text-[#660033]' : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              <l.icon size={18} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-rose-600"
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-white">
          <p className="font-bold">Birdie</p>
          <button onClick={() => signOut()} className="text-xs font-bold text-slate-400">
            Sign out
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
        <nav className="md:hidden flex border-t border-slate-200 bg-white overflow-x-auto">
          {links.slice(0, 4).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex-1 min-w-[72px] py-3 text-center text-[10px] font-bold uppercase ${
                  isActive ? 'text-[#660033]' : 'text-slate-400'
                }`
              }
            >
              <l.icon size={18} className="mx-auto mb-1" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { 
  Home, 
  User, 
  Briefcase, 
  Settings, 
  LogOut, 
  Bell,
  ShieldCheck,
  Star,
  X,
  CheckCheck,
  Menu,
  CreditCard,
  BarChart3,
  MessageSquare,
  ShieldAlert,
  Users,
  CalendarDays,
  Layout as LayoutIcon,
  FileText,
  Search,
  Database,
  Mail
} from 'lucide-react';
import { UserRole, AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole, 
  userName, 
  onLogout,
  activeTab,
  setActiveTab,
  notifications,
  onMarkAllRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = {
    [UserRole.PROFESSIONAL]: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'jobs', icon: Briefcase, label: 'Jobs' },
      { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
      { id: 'reviews', icon: Star, label: 'Reviews' },
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'payments', icon: CreditCard, label: 'Payments' },
      { id: 'settings', icon: Settings, label: 'Settings' }
    ],
    [UserRole.ADMIN]: [
      { id: 'stats', icon: Home, label: 'Overview' },
      { id: 'pros', icon: Users, label: 'Professionals' },
      { id: 'clients', icon: User, label: 'Clients' },
      { id: 'requests', icon: Briefcase, label: 'Hire Requests' },
      { id: 'revenue', icon: CreditCard, label: 'Payments' },
      { id: 'reviews', icon: Star, label: 'Reviews' },
      { id: 'content-cms', icon: LayoutIcon, label: 'Content (CMS)' },
      { id: 'communications', icon: Mail, label: 'Communications' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics' },
      { id: 'admin-settings', icon: Settings, label: 'Settings' },
      { id: 'security', icon: ShieldAlert, label: 'Security' }
    ],
    [UserRole.OPERATIONS]: [
      { id: 'stats', icon: Home, label: 'Overview' },
      { id: 'pros', icon: Users, label: 'Vetting' },
      { id: 'requests', icon: Briefcase, label: 'Hire Requests' },
      { id: 'reviews', icon: Star, label: 'Reviews' },
      { id: 'communications', icon: Mail, label: 'Communications' },
      { id: 'analytics', icon: BarChart3, label: 'Reports' }
    ],
    [UserRole.CLIENT]: [
      { id: 'home', icon: Home, label: 'Find' },
      { id: 'requests', icon: Briefcase, label: 'Hires' },
      { id: 'notifications', icon: Bell, label: 'Inbox' },
      { id: 'profile', icon: User, label: 'Account' }
    ]
  };

  const currentNav = navItems[userRole] || [];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#0a0a0a] pb-20 md:pb-0 md:pl-64">
      {/* Notifications Popover */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-[calc(100%-2rem)] max-w-sm z-[100] animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold">Notifications</h3>
              <div className="flex items-center gap-2">
                <button onClick={onMarkAllRead} className="text-[#660033] hover:text-[#2B0116] p-1 rounded-lg">
                  <CheckCheck size={18} />
                </button>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-sm">No notifications yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-4 cursor-pointer transition-colors ${!n.isRead ? 'bg-[#660033]/5' : 'hover:bg-slate-50'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-semibold ${!n.isRead ? 'text-[#660033]' : 'text-slate-700'}`}>{n.title}</p>
                        {!n.isRead && <div className="w-2 h-2 bg-[#660033] rounded-full mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] font-bold text-slate-300 mt-2 uppercase tracking-widest">{n.createdAt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col p-6 shadow-sm z-50">
        <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => handleNavClick('stats')}>
          <div className="w-8 h-8 bg-[#660033] rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg text-white">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0a0a0a]">Birdie</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#660033]/5 text-[#660033]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0a0a0a]'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              <img src={`https://picsum.photos/seed/${userName}/100/100`} alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900">{userName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Header for Notifications */}
      <header className="hidden md:flex sticky top-0 z-[60] bg-white/80 backdrop-blur-md px-8 py-4 items-center justify-end border-b border-slate-100 shadow-sm">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 text-slate-500 relative hover:bg-slate-50 rounded-xl transition-all"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#660033] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-[60] bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
        >
          <Menu size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Menu</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#660033] rounded flex items-center justify-center">
             <span className="font-bold text-sm text-white">B</span>
          </div>
          <span className="text-lg font-bold text-[#0a0a0a]">Birdie</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#660033] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#660033] rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="text-xl font-bold">Birdie</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {currentNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-[#660033]/5 text-[#660033]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#0a0a0a]'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;

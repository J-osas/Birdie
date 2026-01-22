
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  MapPin, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  List, 
  Wallet as WalletIcon, 
  Bell, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard,
  Star,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  History,
  MoreVertical,
  Banknote,
  Building2,
  Lock,
  X,
  RefreshCw,
  Info
} from 'lucide-react';
import { Availability, HireRequest, RequestStatus, ProfessionalProfile, AppNotification, ProfessionalStatus, Review, Wallet, WithdrawalStatus, WalletTransaction, TransactionType, TransactionStatus, WithdrawalRequest } from '../types';
import { GET_STATUS_STYLE } from '../constants';

interface Props {
  profile: ProfessionalProfile;
  requests: HireRequest[];
  wallet: Wallet;
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  onWithdrawRequest: (amount: number) => void;
  notifications: AppNotification[];
  reviews: Review[];
  userName: string;
  activeSection?: 'dashboard' | 'jobs' | 'payments' | 'reviews' | 'calendar';
  onToggleAvailability: (val: Availability) => void;
  onViewRequest: (request: HireRequest) => void;
}

const ProfessionalDashboard: React.FC<Props> = ({ 
  profile, 
  requests, 
  wallet,
  transactions,
  withdrawals,
  onWithdrawRequest,
  notifications,
  reviews,
  userName,
  activeSection = 'dashboard',
  onToggleAvailability,
  onViewRequest 
}) => {
  const [jobTab, setJobTab] = useState<RequestStatus | 'ALL'>('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const stats = [
    { label: 'Pending Requests', value: requests.filter(r => r.status === RequestStatus.PENDING).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Jobs', value: requests.filter(r => r.status === RequestStatus.ACTIVE || r.status === RequestStatus.ACCEPTED).length, icon: Briefcase, color: 'text-[#660033]', bg: 'bg-[#660033]/5' },
    { label: 'Completed Jobs', value: profile.completedJobs, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Client Rating', value: `${profile.rating}`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', sub: `${profile.reviewCount} Reviews` },
  ];

  const filteredRequests = jobTab === 'ALL' ? requests : requests.filter(r => r.status === jobTab);

  // --- CALENDAR LOGIC ---
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);

    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      const dayRequests = requests.filter(r => r.requestedDate === dateStr || r.preferredStartDate.split('T')[0] === dateStr);
      days.push({ day: i, requests: dayRequests, fullDate: dateStr });
    }
    return days;
  }, [currentDate, requests]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getEventColor = (status: RequestStatus) => {
    switch(status) {
      case RequestStatus.ACTIVE:
      case RequestStatus.ACCEPTED: return 'bg-[#660033] text-white';
      case RequestStatus.PENDING: return 'bg-amber-500 text-white';
      case RequestStatus.COMPLETED: return 'bg-emerald-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#660033]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Welcome back, {firstName}</h1>
            <p className="text-slate-500 font-medium">You have {requests.filter(r => r.status === RequestStatus.PENDING).length} new requests waiting for your response.</p>
          </div>
          
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex flex-wrap gap-1">
            {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as Availability[]).map((status) => (
              <button
                key={status}
                onClick={() => onToggleAvailability(status)}
                className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest min-w-[100px] ${
                  profile.availability === status 
                    ? 'bg-[#660033] text-white shadow-lg shadow-[#660033]/20 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-3 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profile Strength</span>
              <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold">Good</div>
            </div>
            <span className="text-sm font-bold text-[#660033]">{profile.profileCompletion}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#660033] to-[#2B0116] transition-all duration-1000" 
              style={{ width: `${profile.profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center gap-5 shadow-sm hover:border-[#660033]/30 transition-all group">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 truncate">{stat.value}</p>
                {stat.sub && <p className="text-[9px] font-bold text-slate-400 uppercase">{stat.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><Bell size={20} /></div>
              <h3 className="text-xl font-bold">Activity Feed</h3>
            </div>
            <button className="text-[10px] font-bold text-[#660033] uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic">No recent activity</div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`flex gap-4 p-4 rounded-2xl border border-transparent transition-all hover:bg-slate-50 hover:border-slate-100 group ${!n.isRead ? 'bg-[#660033]/5' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-[#660033]' : 'bg-slate-200'}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#660033] transition-colors">{n.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{n.message || n.body}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-1">{n.createdAt}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><CalendarDays size={20} /></div>
              <h3 className="text-xl font-bold">Today's Schedule</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
          </div>
          <div className="space-y-4">
            {requests.filter(r => (r.status === RequestStatus.ACTIVE || r.status === RequestStatus.ACCEPTED) && r.requestedDate === new Date().toISOString().split('T')[0]).length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <CalendarIcon size={32} />
                </div>
                <p className="text-slate-400 font-medium text-sm">No jobs scheduled for today.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#660033]/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 font-bold text-[#660033]">
                      {req.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{req.clientName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{req.serviceCategory}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${GET_STATUS_STYLE(req.status)}`}>{req.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Work Calendar</h2>
          <p className="text-slate-500 font-medium">Manage your schedule and upcoming job commitments.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-slate-900 px-4 min-w-[140px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-slate-50 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
        {calendarDays.map((day, idx) => (
          <div key={idx} className={`bg-white min-h-[120px] p-3 border-t border-slate-100 transition-colors hover:bg-slate-50/50 ${!day ? 'bg-slate-50/30' : ''}`}>
            {day && (
              <div className="h-full flex flex-col gap-2">
                <span className={`text-xs font-bold ${day.fullDate === new Date().toISOString().split('T')[0] ? 'text-[#660033] bg-[#660033]/5 w-6 h-6 flex items-center justify-center rounded-lg shadow-sm' : 'text-slate-400'}`}>
                  {day.day}
                </span>
                <div className="space-y-1">
                  {day.requests.map(req => (
                    <div 
                      key={req.id} 
                      onClick={() => onViewRequest(req)}
                      className={`text-[9px] p-1.5 rounded-lg font-bold truncate cursor-pointer hover:scale-[1.02] transition-transform ${getEventColor(req.status)}`}
                    >
                      {req.clientName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Job Pipeline</h2>
          <p className="text-slate-500 font-medium">Track your pending, active and completed placements.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto custom-scrollbar">
          {(['ALL', RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.ACTIVE, RequestStatus.COMPLETED] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setJobTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                jobTab === tab ? 'bg-[#660033] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 italic text-slate-400">
            No jobs found for this category.
          </div>
        ) : (
          filteredRequests.map(req => (
            <div 
              key={req.id} 
              onClick={() => onViewRequest(req)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-[#660033]/30 transition-all cursor-pointer group flex flex-col justify-between h-full"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-[#660033] text-xl border border-slate-100">
                    {req.clientName.charAt(0)}
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border tracking-widest ${GET_STATUS_STYLE(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-[#660033] transition-colors">{req.clientName}</h4>
                  <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                    <MapPin size={14} /> {req.location}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Requested</p>
                  <p className="text-sm font-bold text-slate-700">{req.serviceRequested}</p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-300 uppercase">Started</p>
                  <p className="text-xs font-bold text-slate-900">{req.requestedDate}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#660033]/5 text-[#660033] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Client Reviews</h2>
          <p className="text-slate-500 font-medium">Feedback and ratings from your previous employers.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-5 py-2.5 rounded-2xl border border-amber-100">
           <Star size={20} className="fill-amber-400 text-amber-400" />
           <span className="text-xl font-bold text-amber-700">{profile.rating}</span>
           <span className="text-xs font-bold text-amber-600/60 uppercase tracking-widest ml-1">{profile.reviewCount} Reviews</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 space-y-4">
           <div className="p-8 bg-slate-50 rounded-full w-24 h-24 mx-auto flex items-center justify-center text-slate-200">
             <Star size={48} />
           </div>
           <p className="text-slate-400 font-medium italic">No reviews found yet. Complete jobs to start earning feedback!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 hover:border-[#660033]/20 transition-all">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400 uppercase">
                      {rev.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{rev.clientName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
                    ))}
                  </div>
               </div>
               <p className="text-slate-600 font-medium leading-relaxed italic">"{rev.text}"</p>
               <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Placement Review</span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Balance Card - Optimized for multi-state */}
          <div className="lg:col-span-2 bg-[#660033] text-white p-10 rounded-[3rem] shadow-2xl shadow-[#660033]/30 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 transition-transform group-hover:scale-110" />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Available to Withdraw</p>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-6xl md:text-7xl font-bold tracking-tighter">₦{wallet.availableBalance.toLocaleString()}<span className="text-white/30 text-3xl font-medium">.00</span></p>
              </div>

              <div className="flex flex-col gap-3">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                   <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <Lock size={10} /> Escrow Hold
                   </p>
                   <p className="text-xl font-bold">₦{wallet.escrowBalance.toLocaleString()}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                   <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <Clock size={10} /> Pending Earnings
                   </p>
                   <p className="text-xl font-bold">₦{wallet.pendingEarnings.toLocaleString()}</p>
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10 pt-4">
              <button 
                onClick={() => setShowWithdrawModal(true)}
                disabled={wallet.availableBalance < 10000}
                className="flex-1 py-5 bg-white text-[#660033] rounded-2xl font-bold text-lg uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-white"
              >
                <Banknote size={24} /> Withdraw Funds
              </button>
              <button className="flex-1 py-5 bg-white/10 text-white rounded-2xl font-bold text-lg uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20 active:scale-95">Earnings History</button>
            </div>
          </div>

          {/* Lifecycle Stats Card */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
                <h3 className="text-xl font-bold">Total Payouts</h3>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600"><Info size={18} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Life-to-date Earned</span>
                 <span className="text-xl font-bold text-slate-900">₦{(wallet.totalWithdrawn + wallet.availableBalance + wallet.pendingEarnings + wallet.escrowBalance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Successfully Withdrawn</span>
                 <span className="text-xl font-bold text-emerald-600">₦{wallet.totalWithdrawn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pending Review</span>
                 <span className="text-xl font-bold text-amber-500">₦{withdrawals.filter(w => w.status === WithdrawalStatus.REQUESTED || w.status === WithdrawalStatus.UNDER_REVIEW).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
               <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
               <p className="text-[10px] text-slate-500 font-medium leading-tight">Birdie 15% service fee is automatically deducted upon fund release to your available balance.</p>
            </div>
          </div>
       </div>

       {/* Withdrawal Queue Table */}
       {withdrawals.length > 0 && (
         <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-4">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><RefreshCw size={20} /></div>
                 <h3 className="text-lg font-bold">Active Withdrawal Requests</h3>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Request Date</th>
                    <th className="px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference</th>
                    <th className="px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-10 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimated Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {withdrawals.map((w, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-all">
                       <td className="px-10 py-5 text-sm font-medium text-slate-500">{w.requestedAt}</td>
                       <td className="px-10 py-5 text-sm font-bold text-slate-900">#WDR-{w.id.slice(-6)}</td>
                       <td className="px-10 py-5 text-sm font-bold text-slate-900">₦{w.amount.toLocaleString()}</td>
                       <td className="px-10 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                            w.status === WithdrawalStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            w.status === WithdrawalStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>{w.status.replace('_', ' ')}</span>
                       </td>
                       <td className="px-10 py-5 text-right text-xs font-bold text-slate-400">24-48 Hours</td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
         </div>
       )}

       {/* Transaction Ledger Table */}
       <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><History size={20} /></div>
              <h3 className="text-xl font-bold">Immutable Ledger</h3>
            </div>
            <button className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
              <LayoutGrid size={14} /> Export Report
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Reference</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Event Type</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Description</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Amount</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Ledger Status</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right whitespace-nowrap">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6 text-sm font-bold text-slate-900 whitespace-nowrap group-hover:text-[#660033]">{tx.reference}</td>
                    <td className="px-10 py-6">
                       <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-tight ${
                         tx.type.includes('CREDIT') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                       }`}>{tx.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-10 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">{tx.description}</td>
                    <td className={`px-10 py-6 text-sm font-bold whitespace-nowrap ${tx.type.includes('DEBIT') ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type.includes('DEBIT') ? '-' : '+'}₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[9px] font-bold rounded-lg uppercase tracking-widest border border-slate-100">{tx.status}</span>
                    </td>
                    <td className="px-10 py-6 text-xs font-bold text-slate-400 text-right whitespace-nowrap">{tx.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>

       {/* Withdrawal Modal */}
       {showWithdrawModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="p-8 space-y-8">
                  <div className="flex justify-between items-center">
                     <h3 className="text-2xl font-bold text-slate-900">Withdraw Funds</h3>
                     <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                  </div>

                  <div className="p-6 bg-[#660033]/5 rounded-3xl border border-[#660033]/10 text-center space-y-1">
                     <p className="text-[10px] font-bold text-[#660033] uppercase tracking-widest">Confirmed Balance</p>
                     <p className="text-4xl font-bold text-[#660033]">₦{wallet.availableBalance.toLocaleString()}</p>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <div className="flex justify-between items-end mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount</label>
                          <button onClick={() => setWithdrawAmount(wallet.availableBalance.toString())} className="text-[9px] font-bold text-[#660033] uppercase">Withdraw All</button>
                        </div>
                        <input 
                          type="number" 
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Enter amount..." 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#660033]/10 transition-all" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payout Account</label>
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#660033]"><Building2 size={20} /></div>
                           <div>
                              <p className="font-bold text-sm text-slate-900">Zenith Bank • 2290</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{userName}</p>
                           </div>
                           <button className="ml-auto text-[#660033] text-[10px] font-bold uppercase">Edit</button>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3">
                     <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                       Minimum withdrawal is ₦10,000. Payouts are reconciled and processed manually by Birdie finance team for security.
                     </p>
                  </div>

                  <button 
                    onClick={() => { onWithdrawRequest(Number(withdrawAmount)); setShowWithdrawModal(false); setWithdrawAmount(''); }}
                    disabled={!withdrawAmount || Number(withdrawAmount) < 10000 || Number(withdrawAmount) > wallet.availableBalance}
                    className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#660033]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    Request Payout
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {activeSection === 'dashboard' && renderOverview()}
      {activeSection === 'calendar' && renderCalendar()}
      {activeSection === 'jobs' && renderJobs()}
      {activeSection === 'reviews' && renderReviews()}
      {activeSection === 'payments' && renderPayments()}
    </div>
  );
};

export default ProfessionalDashboard;

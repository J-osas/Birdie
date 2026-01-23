
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
  Info,
  ArrowRightLeft,
  Receipt,
  Search
} from 'lucide-react';
import { Availability, HireRequest, RequestStatus, ProfessionalProfile, AppNotification, ProfessionalStatus, Review, Wallet, WithdrawalStatus, WalletTransaction, TransactionType, TransactionStatus, WithdrawalRequest, User } from '../types';
import { GET_STATUS_STYLE } from '../constants';
import ProfessionalProfileView from './ProfessionalProfileView';
import SettingsView from './SettingsView';

interface Props {
  profile: ProfessionalProfile;
  currentUser: User;
  requests: HireRequest[];
  wallet: Wallet;
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  onWithdrawRequest: (amount: number) => void;
  notifications: AppNotification[];
  reviews: Review[];
  userName: string;
  activeSection: string;
  onToggleAvailability: (val: Availability) => void;
  onViewRequest: (request: HireRequest) => void;
  onLogout: () => void;
}

const ProfessionalDashboard: React.FC<Props> = ({ 
  profile, 
  currentUser,
  requests, 
  wallet,
  transactions,
  withdrawals,
  onWithdrawRequest,
  notifications,
  reviews,
  userName,
  activeSection,
  onToggleAvailability,
  onViewRequest,
  onLogout
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
            {([Availability.AVAILABLE, Availability.BUSY, Availability.UNAVAILABLE]).map((status) => (
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
    </div>
  );

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': return renderOverview();
      case 'jobs': return <div className="animate-in fade-in duration-500"><h2 className="text-2xl font-bold mb-6">Your Jobs</h2>{/* Jobs component content here */}</div>;
      case 'calendar': return <div className="animate-in fade-in duration-500"><h2 className="text-2xl font-bold mb-6">Schedule</h2>{/* Calendar content here */}</div>;
      case 'reviews': return <div className="animate-in fade-in duration-500"><h2 className="text-2xl font-bold mb-6">Reviews</h2>{/* Reviews content here */}</div>;
      case 'payments': return <div className="animate-in fade-in duration-500"><h2 className="text-2xl font-bold mb-6">Earnings</h2>{/* Payment content here */}</div>;
      case 'profile': return <ProfessionalProfileView profile={profile} userName={userName} onEdit={() => {}} onToggleAvailability={onToggleAvailability} />;
      case 'settings': return <SettingsView user={currentUser} availability={profile.availability} onToggleAvailability={onToggleAvailability} onLogout={onLogout} />;
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {renderSection()}
    </div>
  );
};

export default ProfessionalDashboard;

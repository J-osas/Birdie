
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
  Search,
  Loader2
} from 'lucide-react';
import { Availability, HireRequest, RequestStatus, ProfessionalProfile, AppNotification, ProfessionalStatus, Review, Wallet, WithdrawalStatus, WalletTransaction, TransactionType, TransactionStatus, WithdrawalRequest, User } from '../types';
import { GET_STATUS_STYLE } from '../constants';
import ProfessionalProfileView from './ProfessionalProfileView';
import SettingsView from './SettingsView';
import { dataService } from '../services/dataService';

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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({ bank_name: '', account_number: '', account_name: '' });
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 1000) {
      alert("Minimum withdrawal is ₦1,000");
      return;
    }
    if (amount > wallet.availableBalance) {
      alert("Insufficient available balance.");
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      // Fix: Call submitWithdrawalSafe instead of non-existent submitWithdrawalRequest
      await dataService.submitWithdrawalSafe(amount, bankInfo);
      alert("Withdrawal request submitted for review.");
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      // In a real app, we'd trigger a data refresh here
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const stats = [
    { label: 'Pending Requests', value: requests.filter(r => r.status === RequestStatus.PENDING).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Jobs', value: requests.filter(r => r.status === RequestStatus.ACTIVE || r.status === RequestStatus.ACCEPTED).length, icon: Briefcase, color: 'text-[#660033]', bg: 'bg-[#660033]/5' },
    { label: 'Completed Jobs', value: profile.completedJobs, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Client Rating', value: `${profile.rating}`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', sub: `${profile.reviewCount} Reviews` },
  ];

  const renderPayments = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#660033] text-white p-10 rounded-[3rem] shadow-2xl shadow-[#660033]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 space-y-8">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Available for Payout</p>
                   <h2 className="text-5xl font-black tracking-tight">₦{wallet.availableBalance.toLocaleString()}</h2>
                </div>
                <div className="p-4 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                   <WalletIcon size={40} className="text-white" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                <div className="space-y-1">
                   <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Lock size={12} /> Held in Escrow</p>
                   <p className="text-xl font-bold">₦{wallet.escrowBalance.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 justify-end"><Clock size={12} /> Pending Clearance</p>
                   <p className="text-xl font-bold">₦{wallet.pendingEarnings.toLocaleString()}</p>
                </div>
             </div>

             <div className="pt-4">
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full py-5 bg-white text-[#660033] rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  Initiate Withdrawal
                </button>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
           <h3 className="font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={20} className="text-[#660033]" /> Earnings Summary</h3>
           <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-400 uppercase">Total Earned</span>
                 <span className="font-bold text-slate-900">₦{(wallet.availableBalance + wallet.totalWithdrawn).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-400 uppercase">Total Withdrawn</span>
                 <span className="font-bold text-slate-900">₦{wallet.totalWithdrawn.toLocaleString()}</span>
              </div>
           </div>
           <div className="pt-4 p-5 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-3">
              <Info size={18} className="text-amber-600 shrink-0 mt-1" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">Funds in <span className="font-bold">Pending</span> move to <span className="font-bold">Available</span> after a 3-day dispute window following job completion.</p>
           </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
           <h3 className="font-bold text-slate-900">Financial Ledger</h3>
           <button className="text-[10px] font-bold text-[#660033] uppercase tracking-widest flex items-center gap-1 hover:underline"><RefreshCw size={12} /> Refresh Sync</button>
        </div>
        <div className="overflow-x-auto">
           {transactions.length === 0 ? (
             <div className="p-20 text-center space-y-3">
                <Receipt size={48} className="mx-auto text-slate-200" />
                <p className="text-slate-400 font-medium italic">No transactions recorded yet.</p>
             </div>
           ) : (
             <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Transaction</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Amount</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Type</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {transactions.map(tx => (
                     <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">REF: {tx.reference || 'SYSTEM_SYNC'}</p>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`font-black text-sm ${tx.amount > 0 && !tx.type.includes('debit') ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {tx.amount > 0 && !tx.type.includes('debit') ? '+' : ''}₦{tx.amount.toLocaleString()}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${
                              tx.type.includes('credit') ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                              {tx.type.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                           {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSubmittingWithdrawal && setShowWithdrawModal(false)} />
           <div className="relative w-full max-md bg-white rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300">
              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-bold text-slate-900">Request Payout</h2>
                 <p className="text-slate-500 font-medium italic text-sm">Settlement occurs within 24 hours of approval.</p>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Withdraw Amount (₦)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="e.g. 10000"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 outline-none text-xl font-bold" 
                    />
                    <p className="text-[10px] font-medium text-slate-400 text-right">Max available: ₦{wallet.availableBalance.toLocaleString()}</p>
                 </div>

                 <div className="space-y-4 pt-2 border-t border-slate-50">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</label>
                       <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={bankInfo.bank_name} onChange={e => setBankInfo({...bankInfo, bank_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Account Number</label>
                       <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={bankInfo.account_number} onChange={e => setBankInfo({...bankInfo, account_number: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Account Name</label>
                       <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={bankInfo.account_name} onChange={e => setBankInfo({...bankInfo, account_name: e.target.value})} />
                    </div>
                 </div>

                 <button 
                  disabled={isSubmittingWithdrawal}
                  className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {isSubmittingWithdrawal ? <Loader2 className="animate-spin" size={24} /> : <>Initiate Request <ArrowRightLeft size={20} /></>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#660033]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Welcome back, {firstName}</h1>
              {(profile.status === ProfessionalStatus.VERIFIED || profile.status === ProfessionalStatus.APPROVED) && (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={14} /> Verified</span>
              )}
            </div>
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
      case 'jobs': return <div className="animate-in fade-in duration-500 space-y-6"><h2 className="text-2xl font-bold mb-6">Your Jobs</h2><p className="italic text-slate-400">Loading your pipeline...</p></div>;
      case 'calendar': return <div className="animate-in fade-in duration-500 space-y-6"><h2 className="text-2xl font-bold mb-6">Work Schedule</h2><p className="italic text-slate-400">Loading calendar events...</p></div>;
      case 'reviews': return <div className="animate-in fade-in duration-500 space-y-6"><h2 className="text-2xl font-bold mb-6">Client Feedback</h2><p className="italic text-slate-400">Loading reviews...</p></div>;
      case 'payments': return renderPayments();
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

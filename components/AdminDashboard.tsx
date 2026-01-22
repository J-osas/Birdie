
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Star, 
  CheckCircle2, 
  XCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  BarChart3,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MoreVertical,
  AlertTriangle,
  MapPin,
  Settings,
  ShieldAlert,
  MessageSquare,
  Eye,
  Flag,
  RotateCcw,
  User as UserIcon,
  Layout as LayoutIcon,
  FileText,
  Plus,
  ExternalLink,
  Mail,
  Banknote,
  Check,
  Lock,
  Wallet as WalletIcon
} from 'lucide-react';
/* Added TransactionStatus to the imports below */
import { ProfessionalProfile, ProfessionalStatus, UserRole, RequestStatus, WalletTransaction, HireRequest, Review, WithdrawalRequest, WithdrawalStatus, TransactionStatus } from '../types';
import { GET_STATUS_STYLE } from '../constants';
import AdminCMS from './AdminCMS';
import AdminCommunications from './AdminCommunications';

interface Props {
  stats: {
    totalPros: number;
    pendingApps: number;
    activeJobs: number;
    totalClients: number;
    revenue: number;
    platformFees: number;
    completedJobs: number;
    totalReviews: number;
    avgRating: number;
  };
  prosToVet: { id: string, name: string, category: string, score: number, status: ProfessionalStatus, rating: number }[];
  hireRequests: HireRequest[];
  transactions: WalletTransaction[];
  payoutQueue: WithdrawalRequest[];
  onApproveWithdrawal: (id: string) => void;
  reviews: Review[];
  onApprovePro: (id: string) => void;
  onUpdateJob: (id: string, status: RequestStatus) => void;
  onUpdateReviewStatus: (id: string, status: Review['status']) => void;
  onExploreBlog?: () => void;
  onAddNewPost?: () => void;
  onViewProfessional?: (id: string) => void;
  activeSection: string;
}

const AdminDashboard: React.FC<Props> = ({ 
  stats, 
  prosToVet, 
  hireRequests, 
  transactions,
  payoutQueue,
  onApproveWithdrawal,
  reviews,
  onApprovePro, 
  onUpdateJob,
  onUpdateReviewStatus,
  onExploreBlog,
  onAddNewPost,
  onViewProfessional,
  activeSection 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verified Pros', value: stats.totalPros, change: '+12%', color: 'text-emerald-600', icon: Users },
          { label: 'Active Jobs', value: stats.activeJobs, change: '+5', color: 'text-[#660033]', icon: Briefcase },
          { label: 'Platform Rating', value: stats.avgRating, change: 'Avg', color: 'text-[#660033]', icon: Star },
          { label: 'Pending Apps', value: stats.pendingApps, change: 'Urgent', color: 'text-amber-600', icon: Clock },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-slate-50 opacity-10 group-hover:opacity-100 transition-opacity">
                <Icon size={96} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
              <div className="flex items-baseline gap-2 relative z-10 overflow-hidden">
                <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-slate-900 truncate">{stat.value}</p>
                <span className={`text-[10px] font-bold ${stat.color} shrink-0`}>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Hire Requests</h3>
            <button className="text-[#660033] text-xs font-bold uppercase tracking-widest">View All</button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Client</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Service</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Pro</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hireRequests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-4 whitespace-nowrap">
                       <span className="font-bold text-sm text-slate-900">{req.clientName}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{req.serviceRequested}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{req.professionalName}</td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase border ${GET_STATUS_STYLE(req.status)}`}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-8">
           <h3 className="text-lg font-bold">Category Demand</h3>
           <div className="space-y-6">
             {[
               { label: 'Nanny', percent: 85, color: 'bg-[#660033]' },
               { label: 'Driver', percent: 72, color: 'bg-emerald-600' },
               { label: 'Chef', percent: 45, color: 'bg-amber-600' },
               { label: 'Security', percent: 30, color: 'bg-rose-600' }
             ].map((cat, idx) => (
               <div key={idx} className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                   <span className="text-slate-500">{cat.label}</span>
                   <span className="text-slate-900">{cat.percent}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-[#660033] p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-[#660033]/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Total Net Profit (15%)</p>
            <p className="text-4xl font-bold truncate">₦{stats.platformFees.toLocaleString()}.00</p>
            <div className="flex items-center gap-1 pt-2 text-emerald-300 text-[10px] font-bold uppercase tracking-widest">
               <ArrowUpRight size={14} /> +12.5% vs Prev Month
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-4 overflow-hidden shadow-sm group">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global Escrow Held</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl xl:text-4xl font-bold text-slate-900 truncate">₦{(stats.revenue * 0.4).toLocaleString()}</p>
               <Lock size={16} className="text-[#660033] mb-1" />
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
               Active Hires (42)
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-4 overflow-hidden shadow-sm relative group">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pending Payouts</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl xl:text-4xl font-bold text-amber-600 truncate">₦{payoutQueue.filter(p => p.status === WithdrawalStatus.REQUESTED).reduce((acc, r) => acc + r.amount, 0).toLocaleString()}</p>
              <Clock size={16} className="text-amber-500 mb-1" />
            </div>
            <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase">
               {payoutQueue.filter(p => p.status === WithdrawalStatus.REQUESTED).length} Action Required
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-4 overflow-hidden shadow-sm group">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Paid Out</p>
            <p className="text-3xl xl:text-4xl font-bold text-slate-900 truncate">₦{(stats.revenue * 0.6).toLocaleString()}</p>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase">
               <CheckCircle2 size={14} /> To 384 Pros
            </div>
          </div>
       </div>

       {/* Payout Queue */}
       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><Banknote size={20} /></div>
              <h3 className="text-lg font-bold">Professional Payout Queue</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requires Banker Approval</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest whitespace-nowrap">Professional</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest whitespace-nowrap">Withdrawal Amount</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest whitespace-nowrap">Recipient Bank Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-bold uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payoutQueue.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                       <p className="font-bold text-slate-900 text-sm">{req.professionalName}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UID: {req.professionalId}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="font-bold text-slate-900">₦{req.amount.toLocaleString()}.00</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-bold text-slate-700">{req.bankName}</p>
                       <p className="text-xs text-slate-500 font-medium">{req.accountNumber} • {req.accountName}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                         req.status === WithdrawalStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                         req.status === WithdrawalStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' :
                         'bg-amber-50 text-amber-700 border-amber-100'
                       }`}>{req.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                       {req.status === WithdrawalStatus.REQUESTED && (
                         <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => onApproveWithdrawal(req.id)}
                              className="px-5 py-2 bg-[#660033] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#660033]/10 hover:bg-[#2B0116] transition-all flex items-center gap-2"
                            >
                               <Check size={14} /> Approve & Pay
                            </button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                               <XCircle size={20} />
                            </button>
                         </div>
                       )}
                       {req.status === WithdrawalStatus.PAID && (
                         <div className="flex items-center justify-end gap-2 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 size={16} /> Processed
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>

       {/* Audit Trail - Ledger View */}
       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold">Platform Financial Ledger</h3>
            <div className="flex gap-2">
               <button className="p-2 text-slate-400 bg-slate-50 rounded-lg"><Search size={18} /></button>
               <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                  <Filter size={14} /> Filter Logic
               </button>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Ref</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Type</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Entity Involved</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Total</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Net Share</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-400 text-xs">#{tx.reference.slice(-6)}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tx.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-900 text-sm">{tx.description.split('-')[1] || 'Platform Event'}</td>
                    <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-900 text-sm">₦{tx.amount.toLocaleString()}</td>
                    <td className="px-8 py-5 whitespace-nowrap font-bold text-[#660033] text-sm">₦{(tx.amount * 0.15).toLocaleString()}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      {/* Fixed: TransactionStatus is now correctly imported and used below */}
                      <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${
                        tx.status === TransactionStatus.RELEASED || tx.status === TransactionStatus.SUCCESSFUL ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );

  const renderProfessionals = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-xl font-bold">Network Management</h2>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search Pros..." 
               className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] outline-none"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-[#660033]"><Filter size={18} /></button>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Professional</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Expertise</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Rating</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Performance</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {prosToVet.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((pro) => (
              <tr key={pro.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-5 whitespace-nowrap">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-[#660033]/10 text-[#660033] flex items-center justify-center font-bold">{pro.name.charAt(0)}</div>
                     <div>
                       <p className="font-bold text-sm text-slate-900 whitespace-nowrap">{pro.name}</p>
                     </div>
                   </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">{pro.category}</td>
                <td className="px-8 py-5 whitespace-nowrap">
                   <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
                     <Star size={14} className="fill-[#660033] text-[#660033]" />
                     {pro.rating}
                   </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{pro.score}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pro.score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border uppercase tracking-widest ${
                    pro.status === ProfessionalStatus.VERIFIED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    pro.status === ProfessionalStatus.SUSPENDED ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {pro.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right whitespace-nowrap relative">
                   <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === pro.id ? null : pro.id)}
                        className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeDropdown === pro.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={() => { setActiveDropdown(null); onViewProfessional?.(pro.id); }} 
                            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3"
                          >
                            <Eye size={16} className="text-slate-400" /> View Profile
                          </button>
                          <button 
                            onClick={() => { setActiveDropdown(null); onApprovePro(pro.id); }} 
                            className="w-full text-left px-4 py-3 text-xs font-bold text-[#660033] hover:bg-[#660033]/5 border-b border-slate-50 flex items-center gap-3"
                          >
                            <ShieldCheck size={16} className="text-[#660033]" /> Verify Pro
                          </button>
                          <button 
                            onClick={() => setActiveDropdown(null)} 
                            className="w-full text-left px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                          >
                            <XCircle size={16} className="text-rose-400" /> Suspend
                          </button>
                        </div>
                      )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSection = () => {
    switch(activeSection) {
      case 'stats': return renderOverview();
      case 'pros': return renderProfessionals();
      case 'clients': return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center space-y-6 animate-in fade-in duration-500">
          <div className="p-8 bg-[#660033]/5 text-[#660033] rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <UserIcon size={48} />
          </div>
          <h2 className="text-2xl font-bold">Client Directory</h2>
          <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">Manage your active clients, view their hire history, and handle account-level support requests.</p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search clients by name or email..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm" />
          </div>
        </div>
      );
      case 'content-cms': return <AdminCMS />;
      case 'communications': return <AdminCommunications />;
      case 'revenue': return renderRevenue();
      case 'reviews': return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center space-y-6 animate-in fade-in duration-500">
           <div className="p-8 bg-[#660033]/5 text-[#660033] rounded-full w-24 h-24 mx-auto flex items-center justify-center">
             <Star size={48} />
           </div>
           <h2 className="text-2xl font-bold">Review Moderation</h2>
           <p className="text-slate-400 max-w-sm mx-auto font-medium">Verify or flag platform reviews to ensure trust and quality in the Birdie network.</p>
        </div>
      );
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Operations Hub</h1>
          <p className="text-slate-500 font-medium italic">Birdie's Central Command Center</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold uppercase tracking-widest items-center gap-2 shadow-sm">
            <ShieldCheck size={14} /> System Health: Optimal
          </div>
          <button className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Filter size={14} /> Quick Filter
          </button>
        </div>
      </div>

      {renderSection()}
    </div>
  );
};

export default AdminDashboard;

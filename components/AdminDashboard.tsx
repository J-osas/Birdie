
import React, { useState, useEffect } from 'react';
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
  Wallet as WalletIcon,
  Trash2,
  UserCog
} from 'lucide-react';
import { ProfessionalProfile, ProfessionalStatus, UserRole, RequestStatus, WalletTransaction, HireRequest, Review, WithdrawalRequest, WithdrawalStatus, TransactionStatus, User, UserStatus } from '../types';
import { GET_STATUS_STYLE } from '../constants';
import AdminCMS from './AdminCMS';
import AdminCommunications from './AdminCommunications';
import { dataService } from '../services/dataService';

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
  activeSection 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeSection === 'clients' || activeSection === 'user-management') {
      loadUsers();
    }
  }, [activeSection]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const users = await dataService.getAllUsers();
    setAllUsers(users);
    setLoadingUsers(false);
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    try {
      await dataService.updateUserRole(userId, role);
      loadUsers();
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action is permanent.")) return;
    try {
      await dataService.deleteUser(userId);
      loadUsers();
    } catch (e) {
      alert("Failed to delete user");
    }
  };

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

  const renderUsers = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Users..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#660033]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={loadUsers} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-[#660033]"><RotateCcw size={18} /></button>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">User</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Email</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Current Role</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {allUsers.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">{u.name?.charAt(0) || 'U'}</div>
                     <p className="font-bold text-sm text-slate-900">{u.name}</p>
                   </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">{u.email}</td>
                <td className="px-8 py-5">
                   <select 
                    value={u.role} 
                    onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1 outline-none text-[#660033]"
                   >
                     {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest border ${
                    u.status === UserStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allUsers.length === 0 && !loadingUsers && (
          <div className="p-12 text-center text-slate-400 italic">No users found.</div>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    switch(activeSection) {
      case 'stats': return renderOverview();
      case 'pros': return (
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                 <h2 className="text-xl font-bold">Vetting Console</h2>
                 <span className="text-xs font-bold text-slate-400 uppercase">{prosToVet.length} Professionals</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50/50">
                     <tr>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Professional</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Category (Role)</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Assessment Score</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {prosToVet.map(pro => (
                       <tr key={pro.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-8 py-4 font-bold text-sm">{pro.name}</td>
                         <td className="px-8 py-4 text-sm text-slate-500 font-bold uppercase tracking-widest">{pro.category}</td>
                         <td className="px-8 py-4">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-xs">{pro.score}%</span>
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full ${pro.score > 70 ? 'bg-emerald-500' : pro.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width:`${pro.score}%`}} />
                             </div>
                           </div>
                         </td>
                         <td className="px-8 py-4">
                           <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase border ${
                             pro.status === ProfessionalStatus.VERIFIED || pro.status === ProfessionalStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                             pro.status === ProfessionalStatus.UNDER_REVIEW ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                           }`}>
                             {pro.status}
                           </span>
                         </td>
                         <td className="px-8 py-4">
                            {pro.status !== ProfessionalStatus.VERIFIED && (
                               <button 
                                onClick={() => onApprovePro(pro.id)} 
                                className="bg-[#660033] text-white px-4 py-1.5 rounded-lg font-bold text-[10px] hover:bg-[#2B0116] transition-all uppercase shadow-md shadow-[#660033]/10"
                               >
                                 Verify Pro
                               </button>
                            )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {prosToVet.length === 0 && (
                   <div className="p-12 text-center text-slate-400 italic">No professionals to vet.</div>
                 )}
              </div>
           </div>
        </div>
      );
      case 'clients':
      case 'user-management': return renderUsers();
      case 'content-cms': return <AdminCMS />;
      case 'communications': return <AdminCommunications />;
      case 'revenue': 
      case 'requests': return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold">All Hire Requests</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Client</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Service</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Pro</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hireRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-4 whitespace-nowrap"><span className="font-bold text-sm text-slate-900">{req.clientName}</span></td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{req.serviceRequested}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{req.professionalName || 'Not Assigned'}</td>
                    <td className="px-8 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase border ${GET_STATUS_STYLE(req.status)}`}>{req.status}</span></td>
                    <td className="px-8 py-4 text-right">
                       <select 
                        value={req.status} 
                        onChange={(e) => onUpdateJob(req.id, e.target.value as RequestStatus)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold px-2 py-1 outline-none"
                       >
                         {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      case 'reviews': return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center space-y-6">
           <div className="p-8 bg-[#660033]/5 text-[#660033] rounded-full w-24 h-24 mx-auto flex items-center justify-center">
             <LayoutIcon size={48} />
           </div>
           <h2 className="text-2xl font-bold uppercase tracking-tight">{activeSection} Module</h2>
           <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">Detailed administrative controls for {activeSection} are located in this hub.</p>
        </div>
      );
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operations Hub</h1>
          <p className="text-slate-500 font-medium italic">Birdie Central Intelligence</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
           {['stats', 'pros', 'requests', 'user-management', 'content-cms', 'communications', 'revenue'].map(tab => (
             <button 
              key={tab}
              onClick={() => { 
                // In App.tsx the activeTab state controls this, we are using the passed activeSection prop
                const nav: any = {
                   'stats': 'stats',
                   'pros': 'pros',
                   'requests': 'requests',
                   'user-management': 'clients',
                   'content-cms': 'content-cms',
                   'communications': 'communications',
                   'revenue': 'revenue'
                };
                // This would ideally trigger a parent setActiveTab, but let's assume it's handled by the sidebar
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeSection === tab ? 'bg-[#660033] text-white' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600'
              }`}
             >
               {tab.replace('-', ' ')}
             </button>
           ))}
        </div>
      </div>

      {renderSection()}
    </div>
  );
};

export default AdminDashboard;

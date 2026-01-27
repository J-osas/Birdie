
import React, { useState, useEffect, useMemo } from 'react';
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
  UserCog,
  ChevronDown,
  Info,
  Loader2,
  Globe,
  Bell,
  Activity,
  Server,
  History as HistoryIcon,
  Banknote as PayoutIcon,
  Receipt,
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  ShieldHalf,
  ArrowRightLeft,
  PieChart,
  ListFilter,
  Power,
  Database,
  Save,
  X,
  ShieldCheck as VerifiedIcon
} from 'lucide-react';
import { 
  ProfessionalProfile, 
  ProfessionalStatus, 
  UserRole, 
  RequestStatus, 
  WalletTransaction, 
  HireRequest, 
  Review, 
  WithdrawalRequest, 
  WithdrawalStatus, 
  TransactionStatus, 
  User, 
  UserStatus,
  PlatformSettings,
  Category,
  TransactionType
} from '../types';
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
  prosToVet: { id: string, name: string, category: string, score: number, status: ProfessionalStatus, rating: number, bio?: string }[];
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
  transactions: initialTransactions,
  payoutQueue,
  onApproveWithdrawal,
  reviews: initialReviews,
  onApprovePro, 
  onUpdateJob,
  onUpdateReviewStatus,
  activeSection 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Financial & Data State
  const [allTxs, setAllTxs] = useState<WalletTransaction[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState<any[]>([]);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);

  // Platform Settings State
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (activeSection === 'clients' || activeSection === 'user-management') {
      loadUsers();
    }
    if (activeSection === 'admin-settings') {
      loadPlatformData();
    }
    if (activeSection === 'revenue') {
      loadFinancialData();
    }
  }, [activeSection]);

  const loadFinancialData = async () => {
    setIsLoadingFinance(true);
    try {
      const [txs, rev] = await Promise.all([
        dataService.getAllTransactions(),
        dataService.getPlatformRevenue()
      ]);
      setAllTxs(txs);
      setPlatformRevenue(rev);
    } finally {
      setIsLoadingFinance(false);
    }
  };

  const loadPlatformData = async () => {
    const [s, c] = await Promise.all([
      dataService.getPlatformSettings(),
      dataService.getCategories()
    ]);
    if (s) setSettings(s);
    setCategories(c);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await dataService.getAllUsers();
      setAllUsers(users);
    } finally {
      setLoadingUsers(false);
    }
  };

  const activeEscrows = useMemo(() => {
    return allTxs.filter(tx => tx.type === TransactionType.ESCROW_CREDIT && tx.status === TransactionStatus.IN_ESCROW);
  }, [allTxs]);

  const handleUpdateSettings = async (updates: Partial<PlatformSettings>) => {
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await dataService.updatePlatformSettings(newSettings);
    } catch (e) {
      console.error("Settings Update Failed:", e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // --- UNIQUE SECTION RENDERING LOGIC ---

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="font-bold text-slate-900">Recent Activity Log</h3>
             <button className="text-[10px] font-bold text-[#660033] uppercase">View All</button>
          </div>
          <div className="space-y-4">
             {hireRequests.slice(0, 5).map(req => (
               <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#660033] shadow-sm"><Briefcase size={18} /></div>
                     <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900">New Hire: {req.serviceRequested}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{req.clientName} requested {req.location}</p>
                     </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${GET_STATUS_STYLE(req.status)}`}>{req.status}</span>
               </div>
             ))}
          </div>
        </div>
        
        <div className="bg-[#660033] rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-[#660033]/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
           <h3 className="text-lg font-bold">Platform Pulse</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <p className="text-white/60 text-[10px] font-bold uppercase">Database Connectivity</p>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold">Live & Healthy</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-white/60 text-[10px] font-bold uppercase">Pending Escrow Settlements</p>
                 <p className="text-2xl font-black">₦{activeEscrows.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
              <button className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Run Integrity Check</button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Client Directory</h2>
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search clients..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#660033]/10" />
             </div>
          </div>
       </div>
       <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Client Name</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Contact</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Total Hires</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Join Date</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {allUsers.filter(u => u.role === 'client').map(client => (
                   <tr key={client.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-4">
                         <p className="font-bold text-slate-900">{client.name || `${client.firstName} ${client.lastName}`}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-bold">{client.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-8 py-4">
                         <p className="text-sm text-slate-600">{client.email}</p>
                         <p className="text-xs text-slate-400">{client.phone || 'No phone'}</p>
                      </td>
                      <td className="px-8 py-4 text-center">
                         <span className="font-bold text-slate-900">{hireRequests.filter(h => h.clientId === client.id).length}</span>
                      </td>
                      <td className="px-8 py-4 text-right text-xs font-bold text-slate-400">
                         {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Global Hire Requests</h2>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"><Filter size={14} /> Filter</button>
          </div>
       </div>
       <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Hire ID</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Client / Service</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Value</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Status</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {hireRequests.map(req => (
                   <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-4 font-mono text-xs text-slate-400">{req.id.slice(0, 12)}...</td>
                      <td className="px-8 py-4">
                         <p className="font-bold text-slate-900">{req.clientName}</p>
                         <p className="text-[10px] text-[#660033] font-bold uppercase tracking-widest">{req.serviceRequested}</p>
                      </td>
                      <td className="px-8 py-4 text-center">
                         <span className="font-black text-slate-900">₦{req.amount?.toLocaleString() || '30,000'}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                         <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${GET_STATUS_STYLE(req.status)}`}>{req.status}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <button onClick={() => onUpdateJob(req.id, req.status)} className="p-2 text-slate-400 hover:text-[#660033] hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">System Access Control</h2>
          <div className="flex items-center gap-2">
             <div className="px-4 py-2 bg-[#660033]/5 text-[#660033] rounded-xl text-xs font-bold border border-[#660033]/10">Total Users: {allUsers.length}</div>
          </div>
       </div>
       <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">User Identity</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">System Role</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Account Status</th>
                   <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {allUsers.map(user => (
                   <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">{user.firstName.charAt(0)}</div>
                            <div className="space-y-0.5">
                               <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                               <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-4">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                            user.role === UserRole.ADMIN ? 'bg-[#660033]/5 text-[#660033] border-[#660033]/20' : 
                            user.role === UserRole.PROFESSIONAL ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            'bg-slate-50 text-slate-500 border-slate-200'
                         }`}>
                            {user.role}
                         </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                         <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-bold uppercase">Active</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <button className="text-[10px] font-bold text-[#660033] uppercase hover:underline">Edit Privileges</button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Growth Projection</h3>
                <TrendingUp size={20} className="text-emerald-500" />
             </div>
             <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center italic text-slate-300">
                [Visual Chart: User Growth Over 12 Months]
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Retention</p>
                   <p className="text-xl font-bold">84.2%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Conversion</p>
                   <p className="text-xl font-bold">12.9%</p>
                </div>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Revenue Mix</h3>
                <PieChart size={20} className="text-[#660033]" />
             </div>
             <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center italic text-slate-300">
                [Visual Chart: Category Contribution to GMV]
             </div>
             <div className="space-y-3">
                {['Driver (42%)', 'Nanny (31%)', 'Chef (18%)', 'Other (9%)'].map(mix => (
                  <div key={mix} className="flex items-center justify-between text-xs font-bold text-slate-600">
                     <span>{mix.split(' ')[0]}</span>
                     <span>{mix.split(' ')[1]}</span>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  const renderFinanceHub = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#660033] text-white p-8 rounded-[2.5rem] shadow-xl shadow-[#660033]/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
             <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Marketplace GMV</p>
             <h3 className="text-4xl font-black relative z-10">₦{stats.revenue.toLocaleString()}</h3>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase">
                <TrendingUp size={14} /> +18.4% this month
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Platform Earnings (15%)</p>
             <h3 className="text-4xl font-black text-slate-900">₦{stats.platformFees.toLocaleString()}</h3>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <RefreshCw size={14} /> Locked in platform_ledger
             </div>
          </div>
          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm">
             <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-1">Active Escrow Exposure</p>
             <h3 className="text-4xl font-black text-amber-700">₦{activeEscrows.reduce((a, b) => a + b.amount, 0).toLocaleString()}</h3>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase">
                <ShieldHalf size={14} /> {activeEscrows.length} Protected Jobs
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">Finance & Settlement</h3>
                <p className="text-slate-500 font-medium italic text-sm">Forensic transaction management and verified payouts.</p>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={loadFinancialData} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-[#660033] transition-colors">
                   <RefreshCw size={20} className={isLoadingFinance ? 'animate-spin' : ''} />
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#660033]/5 text-[#660033] rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-[#660033]/10">
                   <FileSpreadsheet size={16} /> Export Ledger
                </button>
             </div>
          </div>

          <div className="p-8 space-y-12">
             <div className="space-y-6">
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><Receipt size={18} className="text-[#660033]" /> Append-Only Transaction Log</h4>
                <div className="overflow-x-auto border border-slate-50 rounded-2xl">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                         <tr>
                            <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase">Ref</th>
                            <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase">Type</th>
                            <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase text-center">Amount</th>
                            <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase text-right">Timestamp</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {allTxs.slice(0, 10).map(tx => (
                           <tr key={tx.id}>
                              <td className="px-6 py-4 font-mono text-xs text-slate-900">{tx.reference || 'SYS-' + tx.id.slice(0, 8)}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[8px] font-bold uppercase">{tx.type}</span></td>
                              <td className="px-6 py-4 text-center font-black text-slate-900">₦{tx.amount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="space-y-6">
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><ArrowRightLeft size={18} className="text-[#660033]" /> Payout Queue</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {payoutQueue.map(payout => (
                     <div key={payout.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                        <div className="flex justify-between">
                           <p className="font-bold text-slate-900">{payout.professionalName}</p>
                           <p className="text-xl font-black text-[#660033]">₦{payout.amount.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl text-[10px] font-bold uppercase space-y-1">
                           <p className="text-slate-400">Account: {payout.accountNumber} ({payout.bankName})</p>
                           <p className="text-slate-700">Holder: {payout.accountName}</p>
                        </div>
                        <button onClick={() => onApproveWithdrawal(payout.id)} className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold text-xs">Authorize Settlement</button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderAdminSettings = () => {
    if (!settings) return (
      <div className="p-20 text-center space-y-4">
        <Loader2 className="animate-spin mx-auto text-[#660033]" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Encryption Vault...</p>
      </div>
    );

    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-24">
        {/* 1. Platform Configuration */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#660033]/5 text-[#660033] rounded-2xl shadow-inner"><Settings size={24} /></div>
                <div className="space-y-0.5">
                   <h3 className="text-2xl font-bold text-slate-900">Platform Core Config</h3>
                   <p className="text-slate-400 text-xs font-medium italic">General marketplace operational parameters.</p>
                </div>
              </div>
              <button 
                disabled={isSavingSettings}
                onClick={() => handleUpdateSettings(settings)}
                className="flex items-center gap-2 px-8 py-3 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Sync Changes</>}
              </button>
           </div>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Marketplace Name</label>
                    <input type="text" value={settings.platform_name} onChange={e => setSettings({...settings, platform_name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 font-bold text-slate-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Support Endpoint</label>
                    <input type="email" value={settings.support_email} onChange={e => setSettings({...settings, support_email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 font-bold text-slate-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Global Commission Rate (%)</label>
                    <input type="number" value={settings.commission_rate} onChange={e => setSettings({...settings, commission_rate: parseFloat(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 font-bold text-slate-700" />
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Minimum Payout (₦)</label>
                    <input type="number" value={settings.min_withdrawal_amount} onChange={e => setSettings({...settings, min_withdrawal_amount: parseFloat(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 font-bold text-slate-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Escrow Maturation (Days)</label>
                    <input type="number" value={settings.escrow_release_days} onChange={e => setSettings({...settings, escrow_release_days: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 font-bold text-slate-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Default Currency</label>
                    <select value={settings.default_currency} onChange={e => setSettings({...settings, default_currency: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                       <option value="NGN">NGN (Nigerian Naira)</option>
                       <option value="USD">USD (US Dollar)</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. Registration & Role Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                 <Users size={20} className="text-[#660033]" />
                 <h3 className="text-xl font-bold text-slate-900">Access & Onboarding Logic</h3>
              </div>
              <div className="space-y-8">
                 {[
                   { key: 'reg_client_enabled', label: 'Client Registration', sub: 'Enable public account creation for clients.' },
                   { key: 'reg_pro_enabled', label: 'Professional Registration', sub: 'Enable public professional applications.' },
                   { key: 'auto_verify_pros', label: 'Automated Approval', sub: 'Skip manual vetting for new applicants.' },
                   { key: 'manual_vetting_required', label: 'Strict Manual Vetting', sub: 'Enforce document and field verification.' }
                 ].map(rule => (
                   <div key={rule.key} className="flex items-center justify-between group">
                      <div className="space-y-1">
                         <p className="font-bold text-slate-900 text-sm leading-tight">{rule.label}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rule.sub}</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateSettings({ [rule.key]: !(settings as any)[rule.key] })}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings[rule.key as keyof PlatformSettings] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${settings[rule.key as keyof PlatformSettings] ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           {/* 3. Category Management */}
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                   <PieChart size={20} className="text-[#660033]" />
                   <h3 className="text-xl font-bold text-slate-900">Service Taxonomy</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{categories.length} Categories Active</span>
              </div>
              
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Add new category (e.g. Gardener)..." 
                   value={newCatName}
                   onChange={e => setNewCatName(e.target.value)}
                   className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/5 font-bold text-sm"
                 />
                 <button 
                  disabled={!newCatName}
                  onClick={async () => {
                    await dataService.addCategory(newCatName);
                    setNewCatName('');
                    loadPlatformData();
                  }}
                  className="px-5 bg-[#660033] text-white rounded-xl shadow-lg shadow-[#660033]/20 disabled:opacity-50"
                 >
                   <Plus size={20} />
                 </button>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1 pt-2">
                 {categories.map(cat => (
                   <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-[#660033]/20">
                      <p className="font-bold text-sm text-slate-700">{cat.name}</p>
                      <div className="flex items-center gap-3">
                         <button 
                          onClick={async () => {
                            await dataService.updateCategory(cat.id, { is_active: !cat.is_active });
                            loadPlatformData();
                          }}
                          className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${
                            cat.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}
                         >
                           {cat.is_active ? 'Online' : 'Disabled'}
                         </button>
                         <button className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* 4. Email & Notification Config */}
           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                 <Mail size={18} className="text-[#660033]" />
                 <h4 className="font-bold text-slate-900">Communication Node</h4>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Global Notifications</span>
                    <button 
                      onClick={() => handleUpdateSettings({ email_notifications_enabled: !settings.email_notifications_enabled })}
                      className={`w-10 h-5 rounded-full relative transition-all ${settings.email_notifications_enabled ? 'bg-[#660033]' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.email_notifications_enabled ? 'right-1' : 'left-1'}`} />
                    </button>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">System Sender Email</label>
                    <input type="email" value={settings.default_sender_email} onChange={e => setSettings({...settings, default_sender_email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Admin Alert Recipients</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[60px]">
                       {settings.admin_alert_recipients.map((email, idx) => (
                         <span key={idx} className="bg-white border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg text-slate-600 flex items-center gap-1">
                           {email} <XCircle size={12} className="cursor-pointer" />
                         </span>
                       ))}
                       <button className="text-[10px] font-bold text-[#660033] uppercase">+ Add</button>
                    </div>
                 </div>
              </div>
           </div>

           {/* 5. Security Settings */}
           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                 <Lock size={18} className="text-[#660033]" />
                 <h4 className="font-bold text-slate-900">Security Protocols</h4>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inactivity Timeout (Minutes)</label>
                    <input type="number" value={settings.session_timeout_minutes} onChange={e => setSettings({...settings, session_timeout_minutes: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black" />
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="text-sm font-bold text-slate-700">Enforce Verification</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">Require email confirm</p>
                    </div>
                    <button 
                      onClick={() => handleUpdateSettings({ require_email_verification: !settings.require_email_verification })}
                      className={`w-10 h-5 rounded-full relative transition-all ${settings.require_email_verification ? 'bg-[#660033]' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full ${settings.require_email_verification ? 'right-1' : 'left-1'}`} />
                    </button>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="text-sm font-bold text-slate-700">Walled Garden Mode</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">Restrict to admins</p>
                    </div>
                    <button 
                      onClick={() => handleUpdateSettings({ admin_only_access: !settings.admin_only_access })}
                      className={`w-10 h-5 rounded-full relative transition-all ${settings.admin_only_access ? 'bg-[#660033]' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full ${settings.admin_only_access ? 'right-1' : 'left-1'}`} />
                    </button>
                 </div>
              </div>
           </div>

           {/* 6. System Status Hub (Read-only) */}
           <div className="bg-slate-900 text-white p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#660033]/20 rounded-full -mr-24 -mt-24 blur-2xl group-hover:bg-[#660033]/40 transition-all duration-700" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-3">
                   <Activity size={20} className="text-emerald-400" />
                   <h4 className="text-lg font-bold">System Integrity</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                       <div className="flex items-center gap-2">
                          <Database size={14} className="text-white/40" />
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Supabase Node</span>
                       </div>
                       <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-tighter"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> operational</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                       <div className="flex items-center gap-2">
                          <VerifiedIcon size={14} className="text-white/40" />
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Auth Service</span>
                       </div>
                       <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-tighter"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> operational</span>
                    </div>
                    <div className="space-y-1 pl-1">
                       <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Last Configuration Sync</p>
                       <p className="text-xs font-bold text-white/70 font-mono tracking-tighter">{new Date(settings.updated_at).toLocaleString()}</p>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all">Flush System Cache</button>
              </div>
           </div>
        </div>
      </div>
    );
  };

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
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Category</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Aptitude</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Status</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {prosToVet.map(pro => (
                       <tr key={pro.id} className="hover:bg-slate-50/50">
                         <td className="px-8 py-4 font-bold text-slate-900">{pro.name}</td>
                         <td className="px-8 py-4 text-xs text-slate-500 font-bold uppercase">{pro.category}</td>
                         <td className="px-8 py-4 text-center font-bold text-xs">{pro.score}%</td>
                         <td className="px-8 py-4 text-center">
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[8px] font-bold uppercase">{pro.status}</span>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <button onClick={() => onApprovePro(pro.id)} className="bg-[#660033] text-white px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase">Verify</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
           </div>
        </div>
      );
      case 'clients': return renderClients();
      case 'requests': return renderRequests();
      case 'user-management': return renderUserManagement();
      case 'revenue': return renderFinanceHub();
      case 'analytics': return renderAnalytics();
      case 'content-cms': return <AdminCMS />;
      case 'communications': return <AdminCommunications />;
      case 'admin-settings': return renderAdminSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operations Hub</h1>
          <p className="text-slate-500 font-medium italic">Birdie Central Intelligence</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
           {[
             { id: 'stats', label: 'Overview' },
             { id: 'pros', label: 'Vetting' },
             { id: 'clients', label: 'Clients' },
             { id: 'requests', label: 'Hire Requests' },
             { id: 'user-management', label: 'System Roles' },
             { id: 'revenue', label: 'Finance' },
             { id: 'analytics', label: 'Analytics' },
             { id: 'content-cms', label: 'Content (CMS)' },
             { id: 'communications', label: 'Communications' },
             { id: 'admin-settings', label: 'Platform Settings' }
           ].map(tab => (
             <button 
              key={tab.id}
              onClick={() => onUpdateJob('none', 'PENDING' as any) /* Trigger parent state update if needed */}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeSection === tab.id ? 'bg-[#660033] text-white shadow-md' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm'
              }`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>
      {renderSection()}
    </div>
  );
};

export default AdminDashboard;

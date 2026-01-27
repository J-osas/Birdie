
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserRole, 
  Availability, 
  RequestStatus, 
  ProfessionalProfile, 
  ProfessionalStatus,
  HireRequest,
  User,
  AppNotification,
  Review,
  UserStatus,
  Wallet,
  WalletTransaction,
  TransactionType,
  TransactionStatus,
  WithdrawalRequest,
  WithdrawalStatus,
  PlatformSettings,
  Category
} from './types';
import { supabase } from './lib/supabase';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import Layout from './components/Layout';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import ProfessionalProfileView from './components/ProfessionalProfileView';
import SettingsView from './components/SettingsView';
import ProfessionalOnboarding from './components/ProfessionalOnboarding';
import RequestDetail from './components/RequestDetail';
import AdminDashboard from './components/AdminDashboard';
import ProfessionalArchive from './components/ProfessionalArchive';
import PublicHeader from './components/PublicHeader';
import PublicProfile from './components/PublicProfile';
import HireFlow from './components/HireFlow';
import BlogArchive, { BlogPost } from './components/BlogArchive';
import BlogSingle from './components/BlogSingle';
import AboutPage from './components/AboutPage';
import OurStoryPage from './components/OurStoryPage';
import ContactPage from './components/ContactPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { GET_STATUS_STYLE } from './constants';
import { Loader2, RefreshCw, WifiOff, ShieldEllipsis, Calendar, Briefcase } from 'lucide-react';

const INITIAL_PRO_PROFILE: ProfessionalProfile = {
  id: '',
  userId: '',
  category: 'Driver',
  bio: '',
  location: '',
  availability: Availability.AVAILABLE,
  profileCompletion: 0,
  status: ProfessionalStatus.PENDING,
  publicVisible: false,
  createdAt: new Date().toISOString(),
  rating: 0,
  reviewCount: 0,
  completedJobs: 0
};

const INITIAL_WALLET: Wallet = {
  id: '',
  professionalId: '',
  escrowBalance: 0,
  pendingEarnings: 0,
  availableBalance: 0,
  totalWithdrawn: 0,
  currency: 'NGN'
};

type AuthStatus = "loading" | "unauthenticated" | "authenticated";
type PublicView = 'home' | 'archive' | 'pro-profile' | 'blog-archive' | 'blog-single' | 'about' | 'story' | 'contact';

const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appSettings, setAppSettings] = useState<PlatformSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [publicView, setPublicView] = useState<PublicView>('home');
  const [isHireFlowActive, setIsHireFlowActive] = useState(false);
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [proProfile, setProProfile] = useState<ProfessionalProfile>(INITIAL_PRO_PROFILE);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null);
  const [proWallet, setProWallet] = useState<Wallet>(INITIAL_WALLET);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [pendingPros, setPendingPros] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [publicPros, setPublicPros] = useState<any[]>([]);
  const [selectedPublicPro, setSelectedPublicPro] = useState<any | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  const hydrate = useCallback(async () => {
    try {
      setAuthStatus("loading");
      setAppError(null);
      
      const [pSettings, dbCats, pPros] = await Promise.all([
        dataService.getPlatformSettings(),
        dataService.getCategories(),
        dataService.getPublicProfessionals()
      ]);
      setAppSettings(pSettings);
      setCategories(dbCats);
      setPublicPros(pPros);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const session = sessionData?.session;
      if (!session) { setAuthStatus("unauthenticated"); return; }
      
      const dbProfile = await authService.getProfile(session.user.id);
      if (!dbProfile) { setAuthStatus("unauthenticated"); return; }

      const user: User = {
        id: dbProfile.id,
        firstName: dbProfile.full_name?.split(' ')[0] || 'User',
        lastName: dbProfile.full_name?.split(' ')[1] || '',
        name: dbProfile.full_name,
        email: dbProfile.email || session.user.email || '', 
        phone: dbProfile.phone || '',
        role: (dbProfile.role?.toLowerCase() || 'client') as UserRole,
        status: (dbProfile.status?.toLowerCase() || 'active') as UserStatus,
        emailVerified: true,
        createdAt: dbProfile.created_at,
        updatedAt: new Date().toISOString()
      };
      setCurrentUser(user);
      setProfile(dbProfile);

      if (user.role === UserRole.PROFESSIONAL) {
        if (activeTab === 'stats') setActiveTab('dashboard');
        const [dbPro, dbWallet, dbRequests, dbWithdrawals] = await Promise.all([
          dataService.getProfessionalProfile(user.id),
          dataService.getWallet(user.id),
          dataService.getHireRequests(user.id, 'PROFESSIONAL'),
          dataService.getWithdrawalRequests(user.id)
        ]);
        if (dbPro) setProProfile(dbPro);
        if (dbWallet) {
          setProWallet(dbWallet);
          const dbTxs = await dataService.getTransactions(dbWallet.id);
          setWalletTransactions(dbTxs);
        }
        setRequests(dbRequests);
        setWithdrawalRequests(dbWithdrawals);
      } else if (user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS) {
        const [allRequests, allPros, allWithdrawals, users] = await Promise.all([
          dataService.getHireRequests(user.id, 'ADMIN'),
          dataService.getAllProfessionals(),
          dataService.getWithdrawalRequests(),
          dataService.getAllUsers()
        ]);
        setRequests(allRequests);
        setPendingPros(allPros);
        setWithdrawalRequests(allWithdrawals);
        setAllUsers(users);
      } else if (user.role === UserRole.CLIENT) {
        const clientRequests = await dataService.getHireRequests(user.id, 'CLIENT');
        setRequests(clientRequests);
      }
      setAuthStatus("authenticated");
    } catch (err: any) {
      console.error("Hydration Error:", err);
      if (err.message === 'Failed to fetch' || err.status === 0) {
        setAppError("Unable to connect to the Birdie network. Please check internet connection.");
      }
      setAuthStatus("unauthenticated");
    }
  }, [activeTab]);

  useEffect(() => {
    hydrate();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') hydrate();
      else if (event === 'SIGNED_OUT') { 
        setCurrentUser(null); 
        setProfile(null); 
        setAuthStatus("unauthenticated"); 
      }
    });
    return () => subscription.unsubscribe();
  }, [hydrate]);

  const handleHireSubmit = async (formData: any) => {
    if (!currentUser) {
      setPublicView('login' as any);
      return null;
    }

    try {
      const newRequest = await dataService.createHireRequest({
        clientId: currentUser.id,
        clientName: `${formData.firstName} ${formData.lastName}`,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        professionalId: formData.proId,
        professionalName: formData.proName,
        serviceCategory: formData.category,
        serviceRequested: `Domestic Support (${formData.category})`,
        location: formData.location || 'Lagos',
        requirements: formData.requirements,
        preferredStartDate: formData.startDate || new Date().toISOString(),
        discoverySource: formData.discovery
      });
      
      hydrate();
      return newRequest; // Return to trigger success state in HireFlow
    } catch (e) {
      console.error("Hire creation error:", e);
      alert("Failed to submit request. Please try again.");
      throw e;
    }
  };

  const handleUpdateJob = async (requestId: string, status: RequestStatus) => {
    if (requestId === 'none') return;
    try {
      hydrate();
      setSelectedRequest(null);
    } catch (e) {
      console.error("Job Update Error:", e);
    }
  };

  if (appError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg"><WifiOff size={40} /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Connectivity Error</h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">{appError}</p>
        <button onClick={() => hydrate()} className="flex items-center gap-2 px-8 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl"><RefreshCw size={20} /> Retry Connection</button>
      </div>
    );
  }

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-[#660033] rounded-2xl flex items-center justify-center animate-pulse"><span className="text-white font-bold text-3xl">B</span></div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[#660033] font-bold text-sm uppercase tracking-widest"><Loader2 className="animate-spin" size={16} /> Connecting to Birdie Network...</div>
        </div>
      </div>
    );
  }

  const renderPublicContent = () => {
    switch(publicView) {
      case 'archive': return <ProfessionalArchive proList={publicPros} onViewProfile={(id) => { const p = publicPros.find(x => x.id === id); if(p) { setSelectedPublicPro(p); setPublicView('pro-profile'); } }} onHire={() => setIsHireFlowActive(true)} />;
      case 'pro-profile': return selectedPublicPro && <PublicProfile profile={selectedPublicPro} reviews={[]} onBack={() => setPublicView('archive')} onHire={() => setIsHireFlowActive(true)} />;
      case 'blog-archive': return <BlogArchive onSelectPost={(p) => { setSelectedBlogPost(p); setPublicView('blog-single'); }} />;
      case 'blog-single': return selectedBlogPost && <BlogSingle post={selectedBlogPost} onBack={() => setPublicView('blog-archive')} />;
      case 'about': return <AboutPage onHire={() => setIsHireFlowActive(true)} onApply={() => { setPublicView('home'); }} />;
      case 'story': return <OurStoryPage onBack={() => setPublicView('home')} />;
      case 'contact': return <ContactPage onHire={() => setIsHireFlowActive(true)} onApply={() => { setPublicView('home'); }} />;
      default: return <HomePage onHire={() => setIsHireFlowActive(true)} onApply={() => {}} onViewArchive={() => setPublicView('archive')} onViewStory={() => setPublicView('story')} onViewBlog={() => setPublicView('blog-archive')} />;
    }
  };

  if (authStatus === "unauthenticated") {
    if ((publicView as any) === 'login') return <LoginPage onLogin={async (e, p) => authService.signIn(e, p)} onSwitchToRegister={() => setPublicView('register' as any)} onBack={() => setPublicView('home')} error={authError} />;
    if ((publicView as any) === 'register') return <RegisterPage onRegister={async (e, p, f, l, r) => { await authService.signUp(e, p, f, l, r); }} onSwitchToLogin={() => setPublicView('login' as any)} onBack={() => setPublicView('home')} error={authError} />;
    return (
      <div className="min-h-screen bg-[#f8fafb] flex flex-col">
        <PublicHeader onLoginClick={() => setPublicView('login' as any)} onViewArchive={() => setPublicView('archive')} onViewBlog={() => setPublicView('blog-archive')} onViewAbout={() => setPublicView('about')} onViewStory={() => setPublicView('story')} onViewContact={() => setPublicView('contact')} onViewHome={() => setPublicView('home')} />
        <div className="flex-1">{renderPublicContent()}</div>
        {isHireFlowActive && <HireFlow categories={categories.filter(c => c.is_active).map(c => c.name)} onClose={() => setIsHireFlowActive(false)} onSubmit={handleHireSubmit} />}
      </div>
    );
  }

  if (authStatus === "authenticated" && currentUser) {
    return (
      <Layout userRole={currentUser.role} userName={currentUser.name || 'User'} onLogout={() => authService.signOut()} activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} onMarkAllRead={() => {}}>
        {currentUser.role === UserRole.PROFESSIONAL && proProfile.status === ProfessionalStatus.PENDING && proProfile.profileCompletion < 100 ? (
          <ProfessionalOnboarding categories={categories.filter(c => c.is_active).map(c => c.name)} userName={currentUser.name || 'User'} onComplete={async (d, s) => { await dataService.updateProfessionalProfile(currentUser.id, { ...d, aptitudeScore: s, profileCompletion: 100, status: ProfessionalStatus.UNDER_REVIEW }); hydrate(); }} />
        ) : currentUser.role === UserRole.PROFESSIONAL ? (
          <ProfessionalDashboard profile={proProfile} currentUser={currentUser} requests={requests} wallet={proWallet} transactions={walletTransactions} withdrawals={withdrawalRequests} onWithdrawRequest={() => hydrate()} notifications={notifications} reviews={reviews} userName={currentUser.name || 'User'} activeSection={activeTab} onToggleAvailability={() => {}} onViewRequest={setSelectedRequest as any} onLogout={() => authService.signOut()} />
        ) : (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OPERATIONS) ? (
          <AdminDashboard 
            stats={{ 
              totalPros: pendingPros.filter(p => p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.APPROVED).length, 
              pendingApps: pendingPros.filter(p => p.status === ProfessionalStatus.PENDING || p.status === ProfessionalStatus.UNDER_REVIEW).length, 
              activeJobs: requests.filter(r => r.status === RequestStatus.ACTIVE || r.status === RequestStatus.ACCEPTED).length, 
              totalClients: allUsers.filter(u => u.role === UserRole.CLIENT).length, 
              revenue: requests.reduce((acc, curr) => acc + (curr.amount || 0), 0), 
              platformFees: requests.reduce((acc, curr) => acc + (curr.amount || 0), 0) * (appSettings?.commission_rate || 15) / 100, 
              completedJobs: requests.filter(r => r.status === RequestStatus.COMPLETED).length, 
              totalReviews: 0, 
              avgRating: 4.6 
            }} 
            prosToVet={pendingPros} 
            hireRequests={requests} 
            transactions={walletTransactions} 
            payoutQueue={withdrawalRequests.filter(w => w.status === WithdrawalStatus.REQUESTED)} 
            onApproveWithdrawal={async (id) => { await supabase.from('withdrawal_requests').update({ status: 'paid', processed_at: new Date().toISOString() }).eq('id', id); hydrate(); }} 
            reviews={[]} 
            onApprovePro={async (id) => { await dataService.updateProfessionalStatus(id, ProfessionalStatus.VERIFIED); hydrate(); }} 
            onUpdateJob={handleUpdateJob} 
            onUpdateReviewStatus={() => {}} 
            activeSection={activeTab} 
          />
        ) : (
          <div className="flex-1 space-y-8 animate-in fade-in duration-500">
             {activeTab === 'requests' ? (
                <div className="space-y-6">
                   <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Hires</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {requests.map(req => (
                        <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                           <div className="flex justify-between items-start mb-4">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${GET_STATUS_STYLE(req.status)}`}>{req.status}</span>
                              <button className="text-slate-300 group-hover:text-[#660033] transition-colors"><ShieldEllipsis size={20} /></button>
                           </div>
                           <div className="space-y-1">
                              <p className="font-bold text-slate-900">{req.serviceRequested}</p>
                              <p className="text-xs text-slate-500 font-medium">With {req.professionalName || 'Matching in progress...'}</p>
                           </div>
                           <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                 <Calendar size={12} /> {new Date(req.preferredStartDate).toLocaleDateString()}
                              </div>
                              <span className="font-bold text-[#660033]">₦{(req.amount || 0).toLocaleString()}</span>
                           </div>
                        </div>
                      ))}
                      {requests.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-4">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300"><Briefcase size={32} /></div>
                           <p className="text-slate-400 font-medium">You haven't hired anyone yet.</p>
                           <button onClick={() => setIsHireFlowActive(true)} className="text-[#660033] font-bold hover:underline">Start your first hire</button>
                        </div>
                      )}
                   </div>
                </div>
             ) : renderPublicContent()}
          </div>
        )}
        {selectedRequest && <RequestDetail request={selectedRequest} userRole={currentUser.role} onClose={() => setSelectedRequest(null)} onUpdateStatus={handleUpdateJob} />}
        {isHireFlowActive && <HireFlow categories={categories.filter(c => c.is_active).map(c => c.name)} onClose={() => setIsHireFlowActive(false)} onSubmit={handleHireSubmit} />}
      </Layout>
    );
  }
  return null;
};

export default App;

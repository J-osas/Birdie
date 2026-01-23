
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
  WithdrawalStatus
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
import ProfessionalArchive, { MOCK_ARCHIVE_PROS } from './components/ProfessionalArchive';
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
import { Loader2, RefreshCw, WifiOff, ShieldEllipsis } from 'lucide-react';

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
  const [profile, setProfile] = useState<any | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  const hydrate = useCallback(async () => {
    try {
      setAuthStatus("loading");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthStatus("unauthenticated"); return; }
      const dbProfile = await authService.getProfile(session.user.id);
      if (!dbProfile) { setAuthStatus("loading"); return; }

      const user: User = {
        id: dbProfile.id,
        firstName: dbProfile.full_name?.split(' ')[0] || 'User',
        lastName: dbProfile.full_name?.split(' ')[1] || '',
        name: dbProfile.full_name,
        email: session.user.email || '', 
        phone: dbProfile.phone || '',
        role: dbProfile.role as UserRole,
        status: dbProfile.status as UserStatus,
        emailVerified: true,
        createdAt: dbProfile.created_at,
        updatedAt: new Date().toISOString()
      };
      setCurrentUser(user);
      setProfile(dbProfile);

      if (user.role === UserRole.PROFESSIONAL) {
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
        const [allRequests, allPros, allWithdrawals] = await Promise.all([
          dataService.getHireRequests(user.id, 'ADMIN'),
          dataService.getAllProfessionals(),
          dataService.getWithdrawalRequests()
        ]);
        setRequests(allRequests);
        setPendingPros(allPros);
        setWithdrawalRequests(allWithdrawals);
      }
      setAuthStatus("authenticated");
    } catch (err: any) {
      console.error("Hydration Error:", err);
      if (err.message?.includes('Failed to fetch')) {
        setAppError("Connectivity error. Please check your internet or Supabase project status.");
      } else {
        setAuthStatus("unauthenticated");
      }
    }
  }, []);

  useEffect(() => {
    hydrate();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') hydrate();
      else if (event === 'SIGNED_OUT') { setCurrentUser(null); setProfile(null); setAuthStatus("unauthenticated"); }
    });
    return () => subscription.unsubscribe();
  }, [hydrate]);

  const handleOnboardingComplete = async (onboardingData: Partial<ProfessionalProfile>, testScore: number) => {
    if (!currentUser) return;
    try {
      const success = await dataService.updateProfessionalProfile(currentUser.id, {
        ...onboardingData,
        aptitudeScore: testScore,
        profileCompletion: 100,
        status: ProfessionalStatus.UNDER_REVIEW
      });
      if (success) {
        const updatedPro = await dataService.getProfessionalProfile(currentUser.id);
        if (updatedPro) setProProfile(updatedPro);
      }
    } catch (e) {
      console.error("Onboarding Sync Error:", e);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (err: any) { setAuthError(err.message || 'Login failed'); }
  };

  const handleRegister = async (email: string, pass: string, fName: string, lName: string, role: UserRole) => {
    setAuthError(null);
    try { await authService.signUp(email, pass, fName, lName, role); setPublicView('home'); }
    catch (err: any) { setAuthError(err.message || 'Registration failed'); throw err; }
  };

  if (appError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg"><WifiOff size={40} /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Connectivity Error</h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">{appError}</p>
        <button onClick={() => { setAppError(null); hydrate(); }} className="flex items-center gap-2 px-8 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl"><RefreshCw size={20} /> Retry</button>
      </div>
    );
  }

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-[#660033] rounded-2xl flex items-center justify-center animate-pulse"><span className="text-white font-bold text-3xl">B</span></div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[#660033] font-bold text-sm uppercase tracking-widest"><Loader2 className="animate-spin" size={16} /> Preparing your dashboard...</div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    const renderPublicContent = () => {
      switch(publicView) {
        case 'archive': return <ProfessionalArchive onViewProfile={(id) => { setPublicView('pro-profile'); }} onHire={() => setIsHireFlowActive(true)} />;
        case 'pro-profile': return <PublicProfile profile={MOCK_ARCHIVE_PROS[0]} reviews={[]} onBack={() => setPublicView('archive')} onHire={() => setIsHireFlowActive(true)} />;
        case 'blog-archive': return <BlogArchive onSelectPost={(p) => { setSelectedBlogPost(p); setPublicView('blog-single'); }} />;
        case 'blog-single': return selectedBlogPost && <BlogSingle post={selectedBlogPost} onBack={() => setPublicView('blog-archive')} />;
        case 'about': return <AboutPage onHire={() => setIsHireFlowActive(true)} onApply={() => { setPublicView('home'); }} />;
        case 'story': return <OurStoryPage onBack={() => setPublicView('home')} />;
        case 'contact': return <ContactPage onHire={() => setIsHireFlowActive(true)} onApply={() => { setPublicView('home'); }} />;
        default: return <HomePage onHire={() => setIsHireFlowActive(true)} onApply={() => {}} onViewArchive={() => setPublicView('archive')} onViewStory={() => setPublicView('story')} onViewBlog={() => setPublicView('blog-archive')} />;
      }
    };
    if ((publicView as any) === 'login') return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setPublicView('register' as any)} onBack={() => setPublicView('home')} error={authError} />;
    if ((publicView as any) === 'register') return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPublicView('login' as any)} onBack={() => setPublicView('home')} error={authError} />;
    return (
      <div className="min-h-screen bg-[#f8fafb] flex flex-col">
        <PublicHeader onLoginClick={() => setPublicView('login' as any)} onViewArchive={() => setPublicView('archive')} onViewBlog={() => setPublicView('blog-archive')} onViewAbout={() => setPublicView('about')} onViewStory={() => setPublicView('story')} onViewContact={() => setPublicView('contact')} onViewHome={() => setPublicView('home')} />
        <div className="flex-1">{renderPublicContent()}</div>
        {isHireFlowActive && <HireFlow onClose={() => setIsHireFlowActive(false)} onSubmit={() => {}} />}
      </div>
    );
  }

  if (authStatus === "authenticated" && currentUser) {
    return (
      <Layout userRole={currentUser.role} userName={currentUser.name || 'User'} onLogout={() => authService.signOut()} activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} onMarkAllRead={() => {}}>
        {currentUser.role === UserRole.PROFESSIONAL && proProfile.status === ProfessionalStatus.PENDING && proProfile.profileCompletion < 100 ? (
          <ProfessionalOnboarding userName={currentUser.name || 'User'} onComplete={handleOnboardingComplete} />
        ) : currentUser.role === UserRole.PROFESSIONAL ? (
          <ProfessionalDashboard profile={proProfile} currentUser={currentUser} requests={requests} wallet={proWallet} transactions={walletTransactions} withdrawals={withdrawalRequests} onWithdrawRequest={() => {}} notifications={notifications} reviews={reviews} userName={currentUser.name || 'User'} activeSection={activeTab} onToggleAvailability={() => {}} onViewRequest={setSelectedRequest as any} onLogout={() => authService.signOut()} />
        ) : (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OPERATIONS) ? (
          <AdminDashboard stats={{ totalPros: pendingPros.length, pendingApps: pendingPros.filter(p => p.status === ProfessionalStatus.PENDING).length, activeJobs: requests.filter(r => r.status === RequestStatus.ACTIVE).length, totalClients: 0, revenue: requests.reduce((acc, curr) => acc + (curr.amount || 0), 0), platformFees: requests.reduce((acc, curr) => acc + (curr.amount || 0), 0) * 0.15, completedJobs: requests.filter(r => r.status === RequestStatus.COMPLETED).length, totalReviews: 0, avgRating: 4.6 }} prosToVet={pendingPros} hireRequests={requests} transactions={[]} payoutQueue={withdrawalRequests} onApproveWithdrawal={() => {}} reviews={[]} onApprovePro={() => {}} onUpdateJob={() => {}} onUpdateReviewStatus={() => {}} activeSection={activeTab} />
        ) : (
          <div className="py-20 text-center space-y-6"><div className="w-20 h-20 bg-[#660033]/5 text-[#660033] rounded-3xl flex items-center justify-center mx-auto"><ShieldEllipsis size={40} /></div><h2 className="text-2xl font-bold">Client Dashboard Coming Soon</h2><button onClick={() => authService.signOut()} className="text-[#660033] font-bold underline">Logout</button></div>
        )}
        {selectedRequest && <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} onUpdateStatus={() => {}} />}
      </Layout>
    );
  }
  return null;
};

export default App;

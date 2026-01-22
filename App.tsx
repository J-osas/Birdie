
import React, { useState, useEffect, useCallback } from 'react';
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
import AdminCMS from './components/AdminCMS';
import { LogIn, UserPlus, ShieldCheck, Briefcase, Star, LayoutDashboard, ArrowLeft, X, Loader2, CheckCircle2, AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

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

type PublicView = 'home' | 'archive' | 'pro-profile' | 'blog-archive' | 'blog-single' | 'about' | 'story' | 'contact';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [authFormMode, setAuthFormMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>(UserRole.PROFESSIONAL);

  const [publicView, setPublicView] = useState<PublicView>('home');
  const [selectedPublicProId, setSelectedPublicProId] = useState<string | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isHireFlowActive, setIsHireFlowActive] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [proProfile, setProProfile] = useState<ProfessionalProfile>(INITIAL_PRO_PROFILE);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null);

  const [proWallet, setProWallet] = useState<Wallet>(INITIAL_WALLET);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [pendingPros, setPendingPros] = useState<any[]>([]);

  const handleInitialize = useCallback(async () => {
    setIsLoading(true);
    setAppError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        await fetchFullUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Initialization Error:", err);
      if (err.message === 'Failed to fetch') {
        setAppError("Could not connect to Supabase. Your project may be paused or there's a network issue.");
      } else {
        setAppError(err.message || "An unexpected error occurred during startup.");
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleInitialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchFullUserData(session.user.id);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleInitialize]);

  const fetchFullUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const fullName = profile.full_name || 'Birdie User';
        const user: User = {
          id: profile.id,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ')[1] || '',
          name: fullName,
          email: '', 
          phone: profile.phone || '',
          role: profile.role || UserRole.CLIENT,
          status: profile.status || UserStatus.ACTIVE,
          emailVerified: true,
          createdAt: profile.created_at,
          updatedAt: new Date().toISOString()
        };
        setCurrentUser(user);
        
        const role = profile.role || UserRole.CLIENT;
        if (role === UserRole.PROFESSIONAL) {
          const [dbPro, dbWallet, dbRequests, dbWithdrawals] = await Promise.all([
            dataService.getProfessionalProfile(userId),
            dataService.getWallet(userId),
            dataService.getHireRequests(userId, 'PROFESSIONAL'),
            dataService.getWithdrawalRequests(userId)
          ]);

          if (dbPro) setProProfile(dbPro);
          if (dbWallet) {
            setProWallet(dbWallet);
            const dbTxs = await dataService.getTransactions(dbWallet.id);
            setWalletTransactions(dbTxs);
          }
          setRequests(dbRequests);
          setWithdrawalRequests(dbWithdrawals);
          setActiveTab('dashboard');
        } else if (role === UserRole.CLIENT) {
           const dbRequests = await dataService.getHireRequests(userId, 'CLIENT');
           setRequests(dbRequests);
           setActiveTab('home');
        } else if (role === UserRole.ADMIN || role === UserRole.OPERATIONS) {
           const [allRequests, allPros, allWithdrawals] = await Promise.all([
             dataService.getHireRequests(userId, 'ADMIN'),
             dataService.getAllProfessionals(),
             dataService.getWithdrawalRequests()
           ]);
           setRequests(allRequests);
           setPendingPros(allPros);
           setWithdrawalRequests(allWithdrawals);
           setActiveTab('stats');
        }
      }
    } catch (err: any) {
      console.error("Full Data Fetch Error:", err);
      if (err.message === 'Failed to fetch') {
        setAppError("Connection lost. Please check if your Supabase project is active.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    
    try {
      if (authFormMode === 'signup') {
        await authService.signUp(email, password, firstNameInput, lastNameInput, signupRole);
        setAuthSuccess('Account created successfully! Check your email to verify.');
      } else {
        await authService.signIn(email, password);
        setShowLoginScreen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setShowLoginScreen(false);
    setPublicView('home');
  };

  const setView = (view: PublicView) => {
    setPublicView(view);
    setSelectedPublicProId(null);
    setSelectedBlogPost(null);
    window.scrollTo(0, 0);
  };

  if (appError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <WifiOff size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Supabase Connection Error</h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          {appError}
          <br /><br />
          <span className="text-sm font-semibold text-[#660033]">Tip: Check your Supabase Dashboard to ensure the project isn't paused.</span>
        </p>
        <button 
          onClick={handleInitialize}
          className="flex items-center gap-2 px-8 py-4 bg-[#660033] text-white rounded-2xl font-bold hover:bg-[#2B0116] transition-all shadow-xl shadow-[#660033]/20 active:scale-95"
        >
          <RefreshCw size={20} /> Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-[#660033] rounded-2xl flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-3xl">B</span>
        </div>
        <div className="flex items-center gap-2 text-[#660033] font-bold text-sm uppercase tracking-widest">
          <Loader2 className="animate-spin" size={16} /> Connecting to Birdie...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (showLoginScreen) {
      return (
        <div className="min-h-screen bg-[#f8fafb] flex flex-col">
          <PublicHeader 
            onLoginClick={() => setShowLoginScreen(true)} 
            onViewArchive={() => { setShowLoginScreen(false); setView('archive'); }} 
            onViewBlog={() => { setShowLoginScreen(false); setView('blog-archive'); }}
            onViewAbout={() => { setShowLoginScreen(false); setView('about'); }}
            onViewStory={() => { setShowLoginScreen(false); setView('story'); }}
            onViewContact={() => { setShowLoginScreen(false); setView('contact'); }}
            onViewHome={() => { setShowLoginScreen(false); setView('home'); }}
          />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#660033] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#660033]/20 cursor-pointer" onClick={() => { setShowLoginScreen(false); setView('home'); }}>
                  <span className="font-bold text-3xl text-white">B</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-900">{authFormMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h1>
                <p className="text-slate-500 font-medium italic">{authFormMode === 'signin' ? 'Manage your domestic services portal.' : 'Join Nigeria\'s #1 Service Network.'}</p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
                {authError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                    <X className="shrink-0" size={14} /> {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="shrink-0" size={14} /> {authSuccess}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authFormMode === 'signup' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <input required type="text" value={firstNameInput} onChange={e => setFirstNameInput(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input required type="text" value={lastNameInput} onChange={e => setLastNameInput(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
                  </div>

                  {authFormMode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setSignupRole(UserRole.PROFESSIONAL)} className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${signupRole === UserRole.PROFESSIONAL ? 'bg-[#660033] text-white border-[#660033]' : 'bg-white text-slate-400 border-slate-200'}`}>PROFESSIONAL</button>
                        <button type="button" onClick={() => setSignupRole(UserRole.CLIENT)} className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${signupRole === UserRole.CLIENT ? 'bg-[#660033] text-white border-[#660033]' : 'bg-white text-slate-400 border-slate-200'}`}>CLIENT</button>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-[#660033] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#2B0116] transition-all shadow-lg shadow-[#660033]/20 text-white disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="animate-spin" size={20} /> : authFormMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="pt-4 text-center">
                   <button 
                    onClick={() => { setAuthFormMode(authFormMode === 'signin' ? 'signup' : 'signin'); setAuthError(null); setAuthSuccess(null); }}
                    className="text-sm font-bold text-[#660033] hover:underline"
                   >
                     {authFormMode === 'signin' ? 'New to Birdie? Create Account' : 'Already have an account? Sign In'}
                   </button>
                </div>
                
                <button onClick={() => { setShowLoginScreen(false); setAuthError(null); setAuthSuccess(null); }} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 pt-2">
                  <ArrowLeft size={16} /> Back to Find Professionals
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const renderPublicContent = () => {
      switch(publicView) {
        case 'archive': return <ProfessionalArchive onViewProfile={(id) => { setSelectedPublicProId(id); setView('pro-profile'); }} onHire={() => setIsHireFlowActive(true)} />;
        case 'pro-profile': return <PublicProfile profile={MOCK_ARCHIVE_PROS[0]} reviews={[]} onBack={() => setView('archive')} onHire={() => setIsHireFlowActive(true)} />;
        case 'blog-archive': return <BlogArchive onSelectPost={(p) => { setSelectedBlogPost(p); setView('blog-single'); }} />;
        case 'blog-single': return selectedBlogPost && <BlogSingle post={selectedBlogPost} onBack={() => setView('blog-archive')} />;
        case 'about': return <AboutPage onHire={() => setIsHireFlowActive(true)} onApply={() => { setShowLoginScreen(true); setAuthFormMode('signup'); }} />;
        case 'story': return <OurStoryPage onBack={() => setView('home')} />;
        case 'contact': return <ContactPage onHire={() => setIsHireFlowActive(true)} onApply={() => { setShowLoginScreen(true); setAuthFormMode('signup'); }} />;
        default: return <HomePage onHire={() => setIsHireFlowActive(true)} onApply={() => { setShowLoginScreen(true); setAuthFormMode('signup'); }} onViewArchive={() => setView('archive')} onViewStory={() => setView('story')} onViewBlog={() => setView('blog-archive')} />;
      }
    };

    return (
      <div className="min-h-screen bg-[#f8fafb] flex flex-col">
        <PublicHeader onLoginClick={() => setShowLoginScreen(true)} onViewArchive={() => setView('archive')} onViewBlog={() => setView('blog-archive')} onViewAbout={() => setView('about')} onViewStory={() => setView('story')} onViewContact={() => setView('contact')} onViewHome={() => setView('home')} />
        <div className="flex-1">{renderPublicContent()}</div>
        {isHireFlowActive && <HireFlow onClose={() => setIsHireFlowActive(false)} onSubmit={() => {}} />}
      </div>
    );
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name || 'User'} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} onMarkAllRead={() => {}}>
      {currentUser.role === UserRole.PROFESSIONAL && proProfile.status === ProfessionalStatus.PENDING && proProfile.profileCompletion < 100 ? (
        <ProfessionalOnboarding userName={currentUser.name || 'User'} onComplete={(data, testScore) => {}} />
      ) : currentUser.role === UserRole.PROFESSIONAL ? (
        <ProfessionalDashboard profile={proProfile} requests={requests} wallet={proWallet} transactions={walletTransactions} withdrawals={withdrawalRequests} onWithdrawRequest={() => {}} notifications={notifications} reviews={reviews} userName={currentUser.name || 'User'} activeSection={activeTab as any} onToggleAvailability={() => {}} onViewRequest={setSelectedRequest as any} />
      ) : (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OPERATIONS) ? (
        <AdminDashboard 
          stats={{
            totalPros: pendingPros.length,
            pendingApps: pendingPros.filter(p => p.status === ProfessionalStatus.PENDING).length,
            activeJobs: requests.filter(r => r.status === RequestStatus.ACTIVE).length,
            totalClients: 0,
            revenue: requests.reduce((acc, curr) => acc + (curr.amount || 0), 0),
            platformFees: requests.reduce((acc, curr) => acc + (curr.amount || 0), 0) * 0.15,
            completedJobs: requests.filter(r => r.status === RequestStatus.COMPLETED).length,
            totalReviews: 0,
            avgRating: 4.6
          }}
          prosToVet={pendingPros}
          hireRequests={requests}
          transactions={[]}
          payoutQueue={withdrawalRequests}
          onApproveWithdrawal={() => {}}
          reviews={[]}
          onApprovePro={() => {}}
          onUpdateJob={() => {}}
          onUpdateReviewStatus={() => {}}
          activeSection={activeTab}
        />
      ) : null}

      {selectedRequest && <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} onUpdateStatus={() => {}} />}
    </Layout>
  );
};

export default App;

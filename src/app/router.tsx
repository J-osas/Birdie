import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthProvider';
import PublicLayout from '@/features/public/PublicLayout';
import HomePage from '@/features/public/HomePage';
import AboutPage from '@/features/public/AboutPage';
import OurStoryPage from '@/features/public/OurStoryPage';
import ContactPage from '@/features/public/ContactPage';
import { BlogArchive, BlogSingle } from '@/features/public/BlogPages';
import ProfessionalsPage from '@/features/public/ProfessionalsPage';
import PublicProfilePage from '@/features/public/PublicProfilePage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ProfessionalRegisterWizard from '@/features/auth/ProfessionalRegisterWizard';
import HireFlowPage from '@/features/hire/HireFlowPage';
import AppShell from '@/features/app/AppShell';
import DashboardHome from '@/features/app/DashboardHome';
import { HireDetailPage, HiresListPage } from '@/features/app/HiresPages';
import AssessmentPage from '@/features/professional/AssessmentPage';
import ProCalendarPage from '@/features/professional/ProCalendarPage';
import ProReviewsPage from '@/features/professional/ProReviewsPage';
import ProProfilePage from '@/features/professional/ProProfilePage';
import WalletPage from '@/features/wallet/WalletPage';
import PaymentReturnPage from '@/features/wallet/PaymentReturnPage';
import InvoicePage from '@/features/wallet/InvoicePage';
import ClientPaymentsPage from '@/features/client/ClientPaymentsPage';
import TermsPage from '@/features/public/TermsPage';
import FindPage from '@/features/client/FindPage';
import InboxPage from '@/features/client/InboxPage';
import AccountPage from '@/features/client/AccountPage';
import { UserRole } from '@/types';
import { CmsPage, CommunicationsPage } from '@/features/admin/AdminPages';
import SettingsPage from '@/features/admin/settings/SettingsPage';
import AdminProfessionalsPage from '@/features/admin/AdminProfessionalsPage';
import AdminClientsPage from '@/features/admin/AdminClientsPage';
import AdminPaymentsPage from '@/features/admin/AdminPaymentsPage';
import AdminReviewsPage from '@/features/admin/AdminReviewsPage';
import AdminAnalyticsPage from '@/features/admin/AdminAnalyticsPage';
import AdminSecurityPage from '@/features/admin/AdminSecurityPage';

function SettingsOrAccount() {
  const { user } = useAuth();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  if (isStaff) return <SettingsPage />;
  return <AccountPage />;
}

function PaymentsOrWallet() {
  const { user } = useAuth();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  if (isStaff) return <AdminPaymentsPage />;
  if (user?.role === UserRole.CLIENT) return <ClientPaymentsPage />;
  return <Navigate to="/app/wallet" replace />;
}

function ReviewsRoute() {
  const { user } = useAuth();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  if (isStaff) return <Navigate to="/app/admin/reviews" replace />;
  return <ProReviewsPage />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="story" element={<OurStoryPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<BlogArchive />} />
            <Route path="blog/:slug" element={<BlogSingle />} />
            <Route path="professionals" element={<ProfessionalsPage />} />
            <Route path="professionals/:id" element={<PublicProfilePage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="register/professional" element={<ProfessionalRegisterWizard />} />
          <Route path="hire" element={<HireFlowPage />} />

          <Route path="app" element={<AppShell />}>
            <Route index element={<DashboardHome />} />
            <Route path="find" element={<FindPage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="onboarding" element={<Navigate to="/app/assessment" replace />} />
            <Route path="hires" element={<HiresListPage />} />
            <Route path="hires/:id" element={<HireDetailPage />} />
            <Route path="jobs" element={<Navigate to="/app/hires" replace />} />
            <Route path="calendar" element={<ProCalendarPage />} />
            <Route path="reviews" element={<ReviewsRoute />} />
            <Route path="admin/reviews" element={<AdminReviewsPage />} />
            <Route path="profile" element={<ProProfilePage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="payments" element={<PaymentsOrWallet />} />
            <Route path="payments/return" element={<PaymentReturnPage />} />
            <Route path="invoices/:id" element={<InvoicePage />} />
            <Route path="payouts" element={<Navigate to="/app/payments" replace />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="messages" element={<Navigate to="/app/inbox" replace />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="professionals" element={<AdminProfessionalsPage />} />
            <Route path="vetting" element={<Navigate to="/app/professionals" replace />} />
            <Route path="clients" element={<AdminClientsPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="communications" element={<CommunicationsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="settings" element={<SettingsOrAccount />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

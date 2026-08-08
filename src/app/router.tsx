import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
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
import WalletPage from '@/features/wallet/WalletPage';
import TermsPage from '@/features/public/TermsPage';
import {
  CmsPage,
  CommunicationsPage,
  MessagesInboxPage,
  PayoutsPage,
  SettingsPage,
  VettingPage,
} from '@/features/admin/AdminPages';

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
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="onboarding" element={<Navigate to="/app/assessment" replace />} />
            <Route path="hires" element={<HiresListPage />} />
            <Route path="hires/:id" element={<HireDetailPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="messages" element={<MessagesInboxPage />} />
            <Route path="vetting" element={<VettingPage />} />
            <Route path="payouts" element={<PayoutsPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="communications" element={<CommunicationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

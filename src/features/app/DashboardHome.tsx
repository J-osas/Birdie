import { useAuth } from '@/app/AuthProvider';
import { UserRole } from '@/types';
import ClientDashboard from '@/features/client/ClientDashboard';
import ProDashboard from '@/features/professional/ProDashboard';
import AdminDashboard from '@/features/admin/AdminDashboard';

export default function DashboardHome() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === UserRole.ADMIN || user.role === UserRole.OPERATIONS) return <AdminDashboard />;
  if (user.role === UserRole.PROFESSIONAL) return <ProDashboard />;
  return <ClientDashboard />;
}

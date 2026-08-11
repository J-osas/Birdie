import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useAuth } from '@/app/AuthProvider';

export default function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.signIn(email, password);
      await refresh();
      navigate('/app');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFB]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex w-16 h-16 bg-[#660033] rounded-2xl items-center justify-center text-white text-3xl font-bold mb-6">
            B
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to your Birdie account</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white p-10 rounded-[2.125rem] border border-slate-200 shadow-xl space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign in to Birdie'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-bold text-[#660033]">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

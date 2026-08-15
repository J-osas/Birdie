import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useAuth } from '@/app/AuthProvider';
import { safeNextPath } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const next = safeNextPath(params.get('next'));
  const registerHref = params.get('next')
    ? `/register?next=${encodeURIComponent(params.get('next') || '')}`
    : '/register';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.signIn(email, password);
      await refresh();
      navigate(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'We could not sign you in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFB]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex w-16 h-16 bg-[#660033] rounded-2xl items-center justify-center text-white text-3xl font-bold mb-6"
          >
            B
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to Birdie</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-white p-10 rounded-[2.125rem] border border-slate-200 shadow-xl space-y-5"
        >
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
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#660033]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign in to Birdie'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            New here?{' '}
            <Link to={registerHref} className="font-bold text-[#660033]">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

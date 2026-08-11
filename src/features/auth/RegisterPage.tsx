import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Briefcase, CheckCircle2, Loader2, User } from 'lucide-react';
import { authService } from '@/services/authService';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const wantPro = params.get('role') === 'professional';
  const [role, setRole] = useState<'client' | 'professional'>(wantPro ? 'professional' : 'client');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'professional') {
      navigate('/register/professional');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signUp(email, password, firstName, lastName, UserRole.CLIENT);
      await authService.updateProfile(user.id, { phone });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl text-center space-y-6">
          <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
          <h2 className="text-3xl font-bold">Welcome to Birdie</h2>
          <p className="text-slate-500 font-medium">Check your email if verification is required, then sign in.</p>
          <Button className="w-full" onClick={() => navigate('/login')}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold">Join Birdie</h1>
          <p className="text-slate-500 font-medium mt-2">Client or professional — admin access is invite-only.</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white p-10 rounded-[2.125rem] border border-slate-200 shadow-xl space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${
                role === 'client' ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' : 'border-slate-100 text-slate-400'
              }`}
            >
              <User size={22} />
              <span className="text-xs font-bold uppercase">I need help</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('professional')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${
                role === 'professional'
                  ? 'border-[#660033] bg-[#660033]/5 text-[#660033]'
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <Briefcase size={22} />
              <span className="text-xs font-bold uppercase">I provide help</span>
            </button>
          </div>

          {role === 'professional' ? (
            <>
              <p className="text-sm text-[#615A5C] font-medium text-center">
                Professionals complete a multi-step profile, ID verification, then a skills assessment.
              </p>
              <Button type="button" className="w-full" size="lg" onClick={() => navigate('/register/professional')}>
                Continue as professional
              </Button>
            </>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl flex gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First name</Label>
                  <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last name</Label>
                  <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp number</Label>
                <Input required type="tel" placeholder="+234..." value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Create account'}
              </Button>
            </>
          )}

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#660033]">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

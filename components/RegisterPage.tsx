
import React, { useState } from 'react';
import { User, Briefcase, Mail, Lock, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface RegisterPageProps {
  onRegister: (email: string, pass: string, fName: string, lName: string, role: UserRole) => Promise<void>;
  onSwitchToLogin: () => void;
  onBack: () => void;
  error: string | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchToLogin, onBack, error }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRegister(email, password, firstName, lastName, role);
      setSuccess(true);
    } catch (err) {
      // Error handled by parent component props
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
        <div className="w-full max-w-md bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome to Birdie!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your account has been created. Please check your email to verify your connection before signing in.
          </p>
          <button 
            onClick={onSwitchToLogin}
            className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-[#660033] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#660033]/20 cursor-pointer"
            onClick={onBack}
          >
            <span className="font-bold text-3xl text-white">B</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Join Our Network</h1>
          <p className="text-slate-500 font-medium italic">Nigeria's #1 trusted service marketplace.</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">What brings you to Birdie?</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setRole(UserRole.CLIENT)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  role === UserRole.CLIENT 
                    ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 grayscale'
                }`}
              >
                <User size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">I need help</span>
              </button>
              <button 
                type="button"
                onClick={() => setRole(UserRole.PROFESSIONAL)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  role === UserRole.PROFESSIONAL 
                    ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 grayscale'
                }`}
              >
                <Briefcase size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">I provide help</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="shrink-0" size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#660033] rounded-2xl font-bold text-white shadow-lg shadow-[#660033]/20 hover:bg-[#2B0116] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Start Your Journey'}
            </button>
          </form>

          <div className="text-center">
             <p className="text-sm text-slate-500 font-medium">
               Already have an account? {' '}
               <button onClick={onSwitchToLogin} className="font-bold text-[#660033] hover:underline">Sign In</button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

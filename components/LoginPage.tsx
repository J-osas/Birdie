
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSwitchToRegister: () => void;
  onBack: () => void;
  error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister, onBack, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-[#660033] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#660033]/20 cursor-pointer hover:scale-105 transition-transform"
            onClick={onBack}
          >
            <span className="font-bold text-3xl text-white">B</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium italic">Your domestic services portal, simplified.</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3 animate-in shake duration-300">
              <AlertCircle className="shrink-0" size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@email.com" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 transition-all font-medium" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <button type="button" className="text-[10px] font-bold text-[#660033] hover:underline uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#660033]/10 transition-all font-medium" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#660033] rounded-2xl font-bold text-white shadow-lg shadow-[#660033]/20 hover:bg-[#2B0116] transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In to Birdie'}
            </button>
          </form>

          <div className="pt-4 text-center">
             <p className="text-sm text-slate-500 font-medium">
               New to Birdie? {' '}
               <button onClick={onSwitchToRegister} className="font-bold text-[#660033] hover:underline">Create an account</button>
             </p>
          </div>
          
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 pt-2 transition-colors">
            <ArrowLeft size={14} /> Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

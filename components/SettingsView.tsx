
import React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Smartphone, 
  Mail, 
  Shield, 
  ChevronRight,
  LogOut,
  Power,
  ShieldCheck,
  SmartphoneNfc,
  Eye,
  KeyRound
} from 'lucide-react';
import { User as UserType, Availability } from '../types';

interface Props {
  user: UserType;
  availability: Availability;
  onToggleAvailability: (val: Availability) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<Props> = ({ user, availability, onToggleAvailability, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Account Preferences</h1>
        <p className="text-slate-500 font-medium italic">Configure your Birdie presence and notification loop.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Core Profile Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center gap-4">
            <div className="p-3 bg-[#660033]/5 text-[#660033] rounded-2xl"><User size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Profile Details</h3>
          </div>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Owner</label>
                <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-inner">{user.firstName} {user.lastName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-inner">{user.email}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
              <button className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-[#660033] hover:text-[#660033] transition-all">Update Avatar</button>
              <button className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-[#660033] hover:text-[#660033] transition-all">Verify Phone Number</button>
            </div>
          </div>
        </div>

        {/* Visibility Engine */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-[#660033]/20 transition-all">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] shadow-sm group-hover:scale-110 transition-transform"><Power size={32} /></div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900">Work Status Engine</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">Determine how you appear to clients in the marketplace results.</p>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex gap-1">
             {/* Fixed: Use Availability enum members directly instead of incorrectly cased strings */}
             {([Availability.AVAILABLE, Availability.UNAVAILABLE]).map(val => (
               <button 
                 key={val}
                 onClick={() => onToggleAvailability(val)}
                 className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${availability === val ? 'bg-[#660033] text-white shadow-xl shadow-[#660033]/20' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {val.toLowerCase()}
               </button>
             ))}
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center gap-4">
            <div className="p-3 bg-[#660033]/5 text-[#660033] rounded-2xl"><Lock size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Security & Privacy</h3>
          </div>
          <div className="p-10 space-y-6">
            <button className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-[#660033]/20 transition-all group shadow-sm">
              <div className="flex items-center gap-5 text-slate-700 font-bold">
                <div className="p-3 bg-white rounded-xl group-hover:text-[#660033] shadow-sm transition-colors"><KeyRound size={20} /></div>
                <div className="text-left">
                   <p className="text-lg">Update Secure Password</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Last changed 4 months ago</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-[#660033]/20 transition-all group shadow-sm">
              <div className="flex items-center gap-5 text-slate-700 font-bold">
                <div className="p-3 bg-white rounded-xl group-hover:text-[#660033] shadow-sm transition-colors"><ShieldCheck size={20} /></div>
                <div className="text-left">
                   <p className="text-lg">Two-Factor Authentication</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Recommended for high-payout accounts</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[8px] font-bold uppercase tracking-widest">Off</div>
            </button>
          </div>
        </div>

        {/* Global Notifications Loop */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center gap-4">
            <div className="p-3 bg-[#660033]/5 text-[#660033] rounded-2xl"><Bell size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">Communication Channels</h3>
          </div>
          <div className="p-10 space-y-10">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#660033] transition-colors"><Mail size={24} /></div>
                <div>
                   <span className="text-lg font-bold text-slate-700">Email Notifications</span>
                   <p className="text-sm text-slate-500 font-medium">Critical system alerts and weekly summaries.</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg accent-[#660033]" />
            </div>
            <div className="flex items-center justify-between group pt-6 border-t border-slate-50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#660033] transition-colors"><Smartphone size={24} /></div>
                <div>
                   <span className="text-lg font-bold text-slate-700">App Push Notifications</span>
                   <p className="text-sm text-slate-500 font-medium">Real-time hire requests and job status updates.</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg accent-[#660033]" />
            </div>
          </div>
        </div>

        {/* Exit Actions */}
        <div className="pt-10 flex flex-col items-center gap-4">
          <button 
            onClick={onLogout}
            className="w-full max-w-sm py-5 border-2 border-rose-100 text-rose-600 bg-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-xl shadow-rose-100/20 active:scale-[0.98]"
          >
            <LogOut size={24} />
            Sign Out of Birdie
          </button>
          <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Platform Version: 1.0.4-prod</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

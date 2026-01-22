
import React from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Briefcase,
  Edit3,
  ExternalLink,
  TrendingUp,
  LayoutGrid,
  Lock,
  ChevronRight,
  /* Added missing Star and Plus icons */
  Star,
  Plus
} from 'lucide-react';
import { ProfessionalProfile, ProfessionalStatus, Availability } from '../types';

interface Props {
  profile: ProfessionalProfile;
  userName: string;
  onEdit: (section: string) => void;
  onToggleAvailability: (val: Availability) => void;
}

const ProfessionalProfileView: React.FC<Props> = ({ profile, userName, onEdit, onToggleAvailability }) => {
  const getStatusBadge = () => {
    switch(profile.status) {
      case ProfessionalStatus.VERIFIED:
      case ProfessionalStatus.APPROVED:
        return <span className="bg-emerald-50 text-emerald-700 border-emerald-200 border px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-sm"><ShieldCheck size={14} /> Fully Verified</span>;
      case ProfessionalStatus.UNDER_REVIEW:
      case ProfessionalStatus.PENDING:
        return <span className="bg-amber-50 text-amber-700 border-amber-200 border px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-sm"><Clock size={14} /> Under Review</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 border-slate-200 border px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-sm"><User size={14} /> Profile Draft</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Dynamic Header Card */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group">
        <div className="h-44 md:h-56 bg-gradient-to-r from-[#660033] to-[#2B0116] relative">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex flex-col md:flex-row md:items-end gap-8 -mt-20 md:-mt-24">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] border-8 border-white bg-slate-100 overflow-hidden shadow-2xl relative">
                <img src={`https://picsum.photos/seed/${userName}/200/200`} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <button onClick={() => onEdit('photo')} className="absolute bottom-2 right-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 text-[#660033] hover:scale-110 active:scale-95 transition-all">
                <Edit3 size={18} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4 min-w-0 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight truncate max-w-full">
                  {userName}
                </h1>
                {getStatusBadge()}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 font-medium">
                <span className="flex items-center gap-2 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-xl"><Briefcase size={18} className="text-[#660033]" /> {profile.category || profile.serviceCategory}</span>
                <span className="flex items-center gap-2 whitespace-nowrap"><MapPin size={18} /> {profile.location || 'Lagos, Nigeria'}</span>
                <div className="flex items-center gap-1.5 text-slate-900 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  {profile.rating}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 mb-4">
              <button 
                onClick={() => onEdit('profile')}
                className="px-8 py-3 bg-[#660033] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all"
              >
                Edit Public Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Responsive column structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sidebar Info - Column 1 */}
        <div className="space-y-8">
          {/* Career Stats */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Career Statistics</h3>
              <TrendingUp size={20} className="text-[#660033]" />
            </div>
            <div className="space-y-4">
              {[
                { label: 'Verified Hires', val: '129', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Platform Tenure', val: '1.4 Years', icon: Clock, color: 'text-[#660033]', bg: 'bg-[#660033]/5' },
                { label: 'Response Rate', val: '98%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((stat, i) => (
                <div key={i} className={`flex items-center justify-between p-5 ${stat.bg} rounded-[2rem] border border-transparent transition-all hover:border-slate-200`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 bg-white rounded-xl ${stat.color} shadow-sm`}><stat.icon size={20} /></div>
                    <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
              <button onClick={() => onEdit('contact')} className="p-2 text-[#660033] hover:bg-[#660033]/5 rounded-xl transition-all"><Edit3 size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Phone size={18} /></div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{profile.phone || '+234 812 345 6789'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Mail size={18} /></div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Primary Email</p>
                  <p className="text-sm font-bold text-slate-700 truncate">tunde@birdie.ng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Column 2 & 3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Professional Bio</h3>
              <button onClick={() => onEdit('bio')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-[#660033]/5 hover:text-[#660033] transition-all">
                <Edit3 size={16} /> Edit
              </button>
            </div>
            <div className="relative">
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {profile.bio || "This professional is an expert in their field with years of verified experience. They have undergone Birdie's rigorous vetting process including identity checks, reference verification, and aptitude assessments to ensure top-tier service delivery."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {['Punctual', 'Verified', 'Skill-Tested', 'Top-Rated'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Document Vault Section */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Document Vault</h3>
              <p className="text-sm text-slate-500 font-medium">Your sensitive information is encrypted and accessible only to Birdie administrators.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border border-slate-100 bg-slate-50/50 rounded-3xl space-y-6 hover:bg-white hover:border-[#660033]/20 hover:shadow-xl hover:shadow-[#660033]/5 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="p-4 bg-white rounded-2xl text-[#660033] shadow-sm group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold uppercase tracking-widest">Verified</div>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">National ID Card</p>
                  <p className="text-xs text-slate-400 font-medium">Uploaded on 12 May 2024</p>
                </div>
                <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 group-hover:border-[#660033]/20 transition-all">
                  <ExternalLink size={14} /> Preview File
                </button>
              </div>

              <div className="p-6 border border-slate-100 bg-slate-50/50 rounded-3xl space-y-6 hover:bg-white hover:border-[#660033]/20 hover:shadow-xl hover:shadow-[#660033]/5 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform"><Award size={24} /></div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold uppercase tracking-widest">Verified</div>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Trade Certification</p>
                  <p className="text-xs text-slate-400 font-medium">Professional Driver Institute</p>
                </div>
                <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 group-hover:border-[#660033]/20 transition-all">
                  <ExternalLink size={14} /> Preview File
                </button>
              </div>
            </div>
            <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-sm font-bold text-slate-400 uppercase tracking-widest hover:border-[#660033]/30 hover:text-[#660033] transition-all flex items-center justify-center gap-3">
              <Plus size={20} /> Upload New Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileView;

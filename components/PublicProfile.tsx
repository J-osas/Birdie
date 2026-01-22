
import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Star, 
  Clock, 
  CheckCircle2, 
  Award, 
  FileText, 
  ChevronLeft,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { ProfessionalProfile, Review, Availability } from '../types';

interface Props {
  profile: ProfessionalProfile;
  reviews: Review[];
  onBack: () => void;
  onHire: (pro: ProfessionalProfile) => void;
}

const PublicProfile: React.FC<Props> = ({ profile, reviews, onBack, onHire }) => {
  const firstName = profile.userId.split(' ')[0] || 'Professional';
  
  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 animate-in fade-in duration-500">
      {/* Top Navigation / Breadcrumb */}
      <div className="bg-white border-b border-slate-100 py-4 sticky top-[72px] z-40 md:static">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-[#660033] font-bold text-sm transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Professionals
          </button>
          
          <button 
            onClick={() => onHire(profile)}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#660033] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#660033]/10 hover:bg-[#2B0116] transition-all"
          >
            Hire {firstName} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-8 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-40 md:h-56 bg-gradient-to-r from-[#660033] to-[#2B0116] relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex flex-col lg:flex-row lg:items-end gap-6 -mt-16 md:-mt-20">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-8 border-white bg-slate-100 overflow-hidden shadow-xl">
                  <img 
                    src={`https://picsum.photos/seed/${profile.id}/400/400`} 
                    alt={profile.userId} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {profile.userId}
                  </h1>
                  <div className="bg-emerald-50 text-emerald-700 border-emerald-100 border px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck size={14} /> Verified Professional
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 font-medium">
                  <span className="flex items-center gap-2"><Briefcase size={18} className="text-[#660033]" /> {profile.category}</span>
                  <span className="flex items-center gap-2"><MapPin size={18} /> {profile.location || 'Lagos, Nigeria'}</span>
                  <div className="flex items-center gap-1 text-slate-900 font-bold bg-slate-50 px-3 py-1 rounded-lg">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    {profile.rating} <span className="text-slate-400 font-medium text-xs ml-1">({profile.reviewCount} Reviews)</span>
                  </div>
                </div>
              </div>

              <div className="lg:mb-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                 <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Available Now</span>
                 </div>
                 <button 
                  onClick={() => onHire(profile)}
                  className="md:hidden flex items-center justify-center gap-2 px-8 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20"
                >
                  Hire {firstName}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Columns */}
          <div className="space-y-8 order-2 lg:order-1">
            {/* Trust Badges */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Vetting Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Identity Verified', icon: ShieldCheck, status: true },
                  { label: 'Background Check', icon: CheckCircle2, status: true },
                  { label: 'Skills Assessment', icon: Award, status: true },
                  { label: 'Home Visit Done', icon: MapPin, status: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm font-medium">
                    <div className="flex items-center gap-3 text-slate-600">
                      <item.icon size={18} className="text-slate-400" />
                      {item.label}
                    </div>
                    <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Pass</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-50">
                <div className="flex items-center justify-between p-4 bg-[#660033]/5 rounded-2xl border border-[#660033]/10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#660033] uppercase tracking-widest">Aptitude Score</p>
                    <p className="text-2xl font-bold text-[#660033]">{profile.aptitudeScore || 90}%</p>
                  </div>
                  <TrendingUp size={24} className="text-[#660033] opacity-30" />
                </div>
              </div>
            </div>

            {/* Work Preferences */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Work Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-slate-900">Live-out</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min. Term</p>
                  <p className="text-sm font-bold text-slate-900">6 Months</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                  <p className="text-sm font-bold text-slate-900">8+ Years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hours</p>
                  <p className="text-sm font-bold text-slate-900">Full-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body Columns */}
          <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
            {/* Bio */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">About {firstName}</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {profile.bio || "This professional is an expert in their field with years of verified experience. They have undergone Birdie's rigorous vetting process including identity checks, reference verification, and aptitude assessments to ensure top-tier service delivery."}
              </p>
              
              <div className="pt-6 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expertise Tags</p>
                <div className="flex flex-wrap gap-2">
                  {['Punctual', 'Experienced', 'Trusted', 'Lagos Routes', 'Safety First'].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Summary */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock size={20} className="text-[#660033]" /> Work Experience
              </h3>
              <div className="space-y-8">
                 {[
                   { role: `Senior ${profile.category}`, company: 'Private Household', period: '2019 - Present' },
                   { role: `Junior ${profile.category}`, company: 'Logistics Firm', period: '2015 - 2018' }
                 ].map((job, i) => (
                   <div key={i} className="flex gap-4 relative">
                      {i === 0 && <div className="absolute top-8 left-2 bottom-0 w-px bg-slate-100" />}
                      <div className="w-4 h-4 rounded-full bg-[#660033] mt-1.5 shrink-0 shadow-lg shadow-[#660033]/20" />
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{job.role}</p>
                        <p className="text-sm font-medium text-slate-500">{job.company}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.period}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Client Feedback</h3>
                <div className="flex items-center gap-1 text-[#660033] font-bold">
                   <Star size={18} className="fill-[#660033]" />
                   {profile.rating}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white p-16 rounded-[2.5rem] border border-slate-200 text-center space-y-3">
                   <Star size={40} className="mx-auto text-slate-200" />
                   <p className="text-slate-400 font-medium italic text-sm">No reviews yet for {firstName}. Be the first to hire them!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                       <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase text-xs">
                             {rev.clientName.charAt(0)}
                           </div>
                           <p className="font-bold text-slate-900 text-sm">{rev.clientName}</p>
                         </div>
                         <div className="flex items-center gap-0.5">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} size={12} className={i < rev.rating ? "fill-[#660033] text-[#660033]" : "text-slate-200"} />
                           ))}
                         </div>
                       </div>
                       <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{rev.text}"</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{rev.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final CTA */}
            <div className="bg-[#660033] text-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-[#660033]/30 text-center space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
               <div className="relative z-10 space-y-2">
                 <h3 className="text-3xl font-bold">Ready to hire {firstName}?</h3>
                 <p className="text-white/60 font-medium max-w-sm mx-auto">Get started with a safe, managed hire through Birdie today.</p>
               </div>
               <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button 
                  onClick={() => onHire(profile)}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-[#660033] rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
                >
                  Hire Professional
                </button>
                <button className="w-full sm:w-auto px-10 py-5 border border-white/20 hover:bg-white/5 rounded-2xl font-bold transition-all">
                  Inquire First
                </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

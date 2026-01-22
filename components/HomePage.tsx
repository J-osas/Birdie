
import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  CheckCircle2, 
  Heart, 
  ArrowRight, 
  Shield, 
  Clock, 
  Briefcase,
  ChevronRight,
  TrendingUp,
  Search,
  MessageSquare
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { MOCK_BLOG_POSTS } from './BlogArchive';

interface Props {
  onHire: () => void;
  onApply: () => void;
  onViewArchive: () => void;
  onViewStory: () => void;
  onViewBlog: () => void;
}

const HomePage: React.FC<Props> = ({ onHire, onApply, onViewArchive, onViewStory, onViewBlog }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] animate-in fade-in duration-700">
      {/* 1. HERO SECTION */}
      <section className="bg-white pt-24 pb-20 border-b border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#660033]/[0.02] -skew-x-12 transform origin-top-right hidden lg:block" />
        
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#660033]/5 text-[#660033] rounded-full border border-[#660033]/10">
              <span className="w-2 h-2 rounded-full bg-[#660033] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Birdie #1 Domestic Services in Nigeria</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05]">
              Help Connecting <span className="text-[#660033]">Skilled Service</span> Providers with the Right Homes.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Friendly and approachable, built with the professionalism you expect. Find vetted domestic staff and licensed therapists fast.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={onHire}
                className="w-full sm:w-auto px-10 py-5 bg-[#660033] text-white rounded-[1.25rem] font-bold text-lg shadow-2xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                Hire a Professional <ArrowRight size={20} />
              </button>
              <button 
                onClick={onApply}
                className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] font-bold text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
              >
                Apply as a Provider
              </button>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                 <div className="aspect-[4/5] bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl rotate-[-2deg]">
                    <img src="https://picsum.photos/seed/home1/600/800" alt="Domestic Professional" className="w-full h-full object-cover" />
                 </div>
                 <div className="aspect-square bg-[#660033] rounded-[2.5rem] flex items-center justify-center p-8 text-white shadow-xl rotate-[2deg]">
                    <Heart size={64} className="opacity-20 absolute" />
                    <p className="text-lg font-bold relative z-10 leading-tight">Trust is our foundation.</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="aspect-square bg-emerald-500 rounded-[2.5rem] flex items-center justify-center p-8 text-white shadow-xl rotate-[-3deg]">
                    <ShieldCheck size={64} className="opacity-20 absolute" />
                    <p className="text-lg font-bold relative z-10 leading-tight">Safety by Design.</p>
                 </div>
                 <div className="aspect-[4/5] bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl rotate-[3deg]">
                    <img src="https://picsum.photos/seed/home2/600/800" alt="Happy Client" className="w-full h-full object-cover" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST & IMPACT METRICS */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Verified Providers', value: '12k+', icon: ShieldCheck, color: 'text-emerald-600' },
            { label: 'Successful Placements', value: '96%', icon: CheckCircle2, color: 'text-[#660033]' },
            { label: 'Average Match Time', value: '48hrs', icon: Clock, color: 'text-amber-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 flex items-center justify-between group hover:border-[#660033]/30 transition-all">
              <div className="space-y-1">
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
              <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center ${stat.color} group-hover:bg-white group-hover:shadow-inner transition-all`}>
                <stat.icon size={28} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SERVICE CATEGORIES */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto py-24 space-y-16">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Our Expertise</h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
            Find the right support for your unique needs across multiple service categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => (
            <div 
              key={cat} 
              onClick={onViewArchive}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-[#660033]/30 hover:shadow-xl hover:shadow-[#660033]/5 transition-all group cursor-pointer space-y-8"
            >
              <div className="w-16 h-16 bg-[#660033]/5 text-[#660033] rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#660033] transition-colors">{cat}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Professional and vetted {cat.toLowerCase()}s ready to assist your {i % 2 === 0 ? 'home' : 'business'}.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-[#660033] uppercase tracking-widest">
                  View Available Pros <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS (PROTECTION FOCUS) */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto space-y-20 relative z-10">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Designed to Protect. Built to Trust.</h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed">
              We've re-imagined the domestic hiring process to ensure safety, dignity, and peace of mind for both clients and providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Vetted Identity', desc: 'Every provider undergoes biometric capture and identity verification.' },
              { step: '02', title: 'Skill Assessed', desc: 'Professionals are tested for their expertise before joining our network.' },
              { step: '03', title: 'Curated Matching', desc: 'We hand-pick profiles that align with your specific household requirements.' },
              { step: '04', title: 'Managed Success', desc: 'Continuous support and check-ins for a sustainable working relationship.' }
            ].map((step, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-6 hover:bg-white/[0.08] transition-all">
                <span className="text-4xl font-bold text-[#660033] opacity-50 italic">{step.step}</span>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOR PROVIDERS (DIGNITY) */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="bg-white p-4 rounded-[3.5rem] border border-slate-200 shadow-sm">
           <div className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-slate-100">
              <img src="https://picsum.photos/seed/provider/800/600" alt="Domestic Professional Working" className="w-full h-full object-cover" />
           </div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Elevating Domestic Professionalism</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
              We treat our providers with the same respect we give our clients. Birdie is a place where your skills are valued and your growth is prioritized.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm"><Heart size={20} /></div>
               <p className="text-sm text-slate-600 font-bold leading-relaxed pt-2 uppercase tracking-widest">Fair Treatment & Processes</p>
            </div>
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-[#660033]/5 text-[#660033] flex items-center justify-center shrink-0 shadow-sm"><Award size={20} /></div>
               <p className="text-sm text-slate-600 font-bold leading-relaxed pt-2 uppercase tracking-widest">Training & Development</p>
            </div>
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm"><Shield size={20} /></div>
               <p className="text-sm text-slate-600 font-bold leading-relaxed pt-2 uppercase tracking-widest">Safety & Active Support</p>
            </div>
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm"><TrendingUp size={20} /></div>
               <p className="text-sm text-slate-600 font-bold leading-relaxed pt-2 uppercase tracking-widest">Better Pay & Opportunities</p>
            </div>
          </div>
          
          <button 
            onClick={onApply}
            className="px-10 py-5 bg-[#660033] text-white rounded-[1.25rem] font-bold text-lg shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            Apply to Join the Network <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* 6. FOUNDER'S STORY PREVIEW */}
      <section className="bg-white border-y border-slate-100 py-24">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight italic">"Birdie was born from a lifetime of living in a home that never stopped moving."</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              We've lived the pain points, seen the gaps, and felt the frustration on both sides. Birdie is our solution to building a domestic ecosystem in Nigeria that truly works.
            </p>
            <button 
              onClick={onViewStory}
              className="group flex items-center gap-3 text-lg font-bold text-[#660033] hover:gap-5 transition-all"
            >
              Read Our Full Story <ArrowRight size={20} />
            </button>
          </div>
          <div className="w-full md:w-80 h-80 bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-inner">
             <div className="absolute inset-0 bg-gradient-to-t from-[#660033]/10 to-transparent" />
             <img src="https://picsum.photos/seed/founder/400/400" alt="Birdie Vision" className="w-full h-full object-cover grayscale opacity-80" />
          </div>
        </div>
      </section>

      {/* 7. INSIGHTS / BLOG HIGHLIGHTS */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto py-24 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Latest Insights</h2>
              <p className="text-xl text-slate-500 font-medium">Expert advice on household management and professional care.</p>
           </div>
           <button onClick={onViewBlog} className="text-[#660033] font-bold flex items-center gap-2 hover:underline decoration-2">View All Articles <ChevronRight size={16} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_BLOG_POSTS.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden group hover:border-[#660033]/30 transition-all flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-[#660033]/5">
               <div className="h-56 overflow-hidden bg-slate-100 relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-[#660033] uppercase tracking-widest border border-[#660033]/10 shadow-sm">{post.category}</span>
               </div>
               <div className="p-8 flex-1 flex flex-col space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-[#660033] transition-colors">{post.title}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
                    <button onClick={onViewBlog} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-[#660033] group-hover:text-white transition-all"><ArrowRight size={18} /></button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pb-24">
        <div className="bg-[#660033] rounded-[4rem] p-12 md:p-24 text-center space-y-12 relative overflow-hidden shadow-2xl shadow-[#660033]/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32" />
          
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Ready to find the perfect professional?</h2>
            <p className="text-white/60 text-xl md:text-2xl font-medium leading-relaxed italic">
              Your safety and satisfaction are our top priorities. Experience domestic support as it should be—transparent, reliable, and humane.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onHire}
              className="w-full sm:w-auto px-12 py-6 bg-white text-[#660033] rounded-[1.5rem] font-bold text-xl hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3"
            >
              Hire a Professional <ArrowRight size={22} />
            </button>
            <button 
              onClick={onApply}
              className="w-full sm:w-auto px-12 py-6 border-2 border-white/20 text-white rounded-[1.5rem] font-bold text-xl hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Join Our Network
            </button>
          </div>
          
          <div className="relative z-10 flex items-center justify-center gap-8 pt-8">
             <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                <ShieldCheck size={16} /> Identity Verified
             </div>
             <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Clock size={16} /> 24/7 Support
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

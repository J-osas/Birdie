
import React from 'react';
import { ShieldCheck, Award, Users, CheckCircle2, Heart, Scale, ArrowRight } from 'lucide-react';

interface Props {
  onHire: () => void;
  onApply: () => void;
}

const AboutPage: React.FC<Props> = ({ onHire, onApply }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100 pt-20 pb-16">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto space-y-8">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">About Birdie</h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
              Birdie is a platform built from lived experience, designed to make the domestic staffing and personal support industry safe, structured, and humane for everyone involved.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Identity-Verified', icon: ShieldCheck },
              { label: 'Skill-Assessed', icon: Award },
              { label: 'Curated Matches', icon: Users }
            ].map((pillar, i) => (
              <span key={i} className="px-5 py-2.5 bg-[#660033]/5 text-[#660033] rounded-full text-sm font-bold flex items-center gap-2 border border-[#660033]/10">
                <pillar.icon size={16} />
                {pillar.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Verified Providers', value: '12k+', icon: ShieldCheck },
            { label: 'Successful Placements', value: '96%', icon: CheckCircle2 },
            { label: 'Average Match Time', value: '48hrs', icon: Users }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex items-center justify-between group hover:border-[#660033]/30 transition-all">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-[#660033] transition-colors">
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-200 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Empower individuals, households, businesses, and organizations to connect with trusted domestic and certified therapists through transparent, reliable processes.
            </p>
          </div>
          <div className="bg-[#660033] p-10 md:p-14 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-[#660033]/20">
            <h2 className="text-3xl font-bold">Our Vision</h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed">
              Affordable, accessible, dignified care and support for every home and workplace delivered by trained and vetted workers.
            </p>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto py-20 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">What Sets Us Apart?</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            We don't just facilitate transactions; we build bridges. Our focus on trust, structure, and empathy ensures that every connection is mutually beneficial and sustainable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {[
            { 
              title: 'Trust', 
              desc: 'Rigorous 5-point vetting including criminal records and home visits.', 
              icon: ShieldCheck,
              color: 'bg-emerald-50 text-emerald-600'
            },
            { 
              title: 'Care', 
              desc: 'Warm, respectful experiences for clients and providers alike.', 
              icon: Heart,
              color: 'bg-rose-50 text-rose-600'
            },
            { 
              title: 'Dignity', 
              desc: 'Fair processes, clear expectations, and equitable opportunities.', 
              icon: Scale,
              color: 'bg-amber-50 text-amber-600'
            }
          ].map((val, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 text-center">
              <div className={`w-16 h-16 ${val.color} rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner`}>
                <val.icon size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">{val.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto py-12">
        <div className="bg-[#660033] rounded-[3.5rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-[#660033]/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to find the right match?</h2>
            <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl mx-auto">Post a role or apply to join our provider network today.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onHire}
              className="w-full sm:w-auto px-10 py-5 bg-white text-[#660033] rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Hire a Professional <ArrowRight size={20} />
            </button>
            <button 
              onClick={onApply}
              className="w-full sm:w-auto px-10 py-5 border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all"
            >
              Apply as a Provider
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

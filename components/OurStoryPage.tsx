
import React from 'react';
import { Quote, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const OurStoryPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 animate-in fade-in duration-700">
      {/* Navigation Header - Standardized Floating Utility Container */}
      <div className="sticky top-[72px] z-40 bg-transparent py-4 pointer-events-none">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pointer-events-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg px-5 py-3 rounded-2xl text-slate-500 hover:text-[#660033] font-bold text-sm transition-all group active:scale-95"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Return to Home
          </button>
        </div>
      </div>

      <article className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-8">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Our Story, What inspired Us?
            </h1>
            
            <div className="aspect-[21/9] w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 bg-slate-200">
               <img src="https://picsum.photos/seed/story/1200/600" alt="Birdie Story" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Narrative Content */}
          <div className="space-y-12 text-lg md:text-xl text-slate-600 font-medium leading-[1.8]">
            <p className="text-2xl md:text-3xl text-slate-900 font-bold leading-relaxed italic border-l-4 border-[#660033] pl-8 py-2">
              "Birdie was born from a lifetime of living in a home that never stopped moving."
            </p>

            <p>
              Growing up in a busy entrepreneurial household, where several businesses ran at once — and a household full of people who needed care, coordination, and support. With the constant activity came a constant need for extra hands: nannies, helps, cooks, and general domestic support. And even with all that, it never felt like enough.
            </p>

            <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">But the real challenge wasn't the workload.</h2>
              <p className="text-4xl md:text-6xl font-bold text-[#660033] tracking-tighter">It was trust.</p>
            </div>

            <p>
              For years, my family, like many Nigerian families, struggled with the cycle of finding domestic help that never seemed to last. Workers came and went. Some were untrained or unreliable, some were overwhelmed, and others simply couldn't stay due to a breach in agreement. We tried everything: agents, referrals, long searches, and even taking in young adults whose families were willing to let them work in exchange for shelter and basic education.
            </p>

            <p className="text-2xl font-bold text-slate-900">Some of those stories ended well. Many did not.</p>

            <p>
              We saw workers run away, steal out of desperation, fall into difficult situations, become pregnant, or simply lose hope. We also saw families feel unsafe, disappointed, or exhausted from constantly starting over. At the same time, I noticed something else: so many young adults were idle and unemployed, eager for opportunity but afraid of exploitation or maltreatment in homes far from their own.
            </p>

            {/* Emphasis Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-50 p-8 rounded-3xl space-y-2 border border-slate-100">
                <p className="text-slate-900 font-bold text-2xl">Everyone was struggling.</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Clients and Workers Alike</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl space-y-2 border border-slate-100">
                <p className="text-slate-900 font-bold text-2xl">Everyone had trust issues.</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">A Broken Market</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl space-y-2 border border-slate-100">
                <p className="text-slate-900 font-bold text-2xl">Everyone felt unprotected.</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No System Support</p>
              </div>
              <div className="bg-[#660033]/5 p-8 rounded-3xl space-y-2 border border-[#660033]/10">
                <p className="text-[#660033] font-bold text-2xl">Everyone deserved better.</p>
                <p className="text-[#660033]/40 font-bold uppercase tracking-widest text-xs">The Motivation</p>
              </div>
            </div>

            <p>
              After years of watching this cycle repeat itself, I began to research how to fix it.
            </p>

            <p className="text-3xl font-bold text-slate-900 italic">
              How do we bring structure to this informal market?
            </p>

            <div className="bg-white p-12 md:p-20 rounded-[4rem] border border-[#660033]/20 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#660033]/5 rounded-full -mr-16 -mt-16" />
              <Quote className="text-[#660033] opacity-20" size={64} />
              <p className="text-2xl md:text-3xl font-medium text-slate-900 leading-relaxed">
                Birdie is a place where: Workers are trained, respected, and protected. Families hire with confidence. Psychotherapy and emotional support are accessible and dignity sits at the centre of every connection.
              </p>
              <div className="pt-4 space-y-2">
                <p className="text-2xl font-bold text-slate-900">Birdie is not just a service.</p>
                <p className="text-2xl font-bold text-[#660033]">It is a solution. A bridge.</p>
              </div>
            </div>

            <div className="text-center py-20">
              <p className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter">
                A new beginning.
              </p>
              <p className="text-xl md:text-2xl text-slate-400 font-medium mt-4">
                For households, for workers, and for the industry at large.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default OurStoryPage;

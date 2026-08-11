import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Heart, Scale, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IMAGES } from '@/data/images';
import { SectionHeading } from './sections/SectionHeading';

export default function AboutPage() {
  return (
    <div className="pb-8">
      <section className="bg-white border-b border-slate-100 pt-16 pb-14">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">About Birdie</p>
            <h1 className="text-4xl md:text-6xl font-bold text-[#0A0A0A] tracking-tight leading-tight">
              Domestic staffing with structure and dignity
            </h1>
            <p className="text-xl text-[#615A5C] font-medium leading-relaxed">
              Birdie is built from lived experience to make hiring domestic professionals in Nigeria safe, transparent, and humane — for households and workers.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Identity-Verified', icon: ShieldCheck },
                { label: 'Skill-Assessed', icon: Award },
                { label: 'Escrow-Backed', icon: Scale },
              ].map((p) => (
                <span
                  key={p.label}
                  className="px-4 py-2 bg-[#660033]/5 text-[#660033] rounded-full text-sm font-bold flex items-center gap-2 border border-[#660033]/10"
                >
                  <p.icon size={16} /> {p.label}
                </span>
              ))}
            </div>
          </div>
          <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200">
            <img src={IMAGES.story} alt="About Birdie" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto pt-16 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-10 rounded-[2.125rem] border border-slate-200 space-y-4 hover-lift">
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Our Mission</h2>
          <p className="text-lg text-[#615A5C] font-medium leading-relaxed">
            Connect households with trusted domestic professionals through transparent vetting, fair employment, and escrow-backed payments.
          </p>
        </div>
        <div className="bg-[#660033] p-10 rounded-[2.125rem] text-white space-y-4 hover-lift">
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            Affordable, dignified care for every home — delivered by trained, vetted workers with real safety nets.
          </p>
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-20 space-y-12">
        <SectionHeading
          eyebrow="Why choose us"
          title="Strategic guidance for every hire"
          subtitle="We don’t just list workers — we introduce structure into an informal market."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Trust',
              desc: 'Multi-tier vetting: identity, police clearance, guarantors, and skills assessment.',
              icon: ShieldCheck,
            },
            {
              title: 'Care',
              desc: 'Warm, respectful experiences for clients and providers alike.',
              icon: Heart,
            },
            {
              title: 'Structure',
              desc: 'Consultation, contracts, escrow, and clear payouts instead of informal chaos.',
              icon: Scale,
            },
          ].map((item, i) => (
            <div key={item.title} className="bg-white p-8 rounded-[1.75rem] border border-slate-200 space-y-4 hover-lift">
              <p className="text-sm font-bold text-[#E0B5CB]">0{i + 1}</p>
              <item.icon className="text-[#660033]" size={28} />
              <h3 className="text-xl font-bold text-[#0A0A0A]">{item.title}</h3>
              <p className="text-[#615A5C] font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pb-16">
        <Link to="/hire">
          <Button size="lg" className="hover-lift">
            Hire a Professional <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

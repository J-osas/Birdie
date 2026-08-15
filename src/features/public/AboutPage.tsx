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
              Home help done properly
            </h1>
            <p className="text-xl text-[#615A5C] font-medium leading-relaxed">
              Birdie makes it safe and simple to bring someone into your home. We check every person, we agree the price
              up front, and we treat the people who work in your home with respect.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'We check IDs', icon: ShieldCheck },
                { label: 'We test skills', icon: Award },
                { label: 'We hold your money', icon: Scale },
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
          <h2 className="text-2xl font-bold text-[#0A0A0A]">What we are here to do</h2>
          <p className="text-lg text-[#615A5C] font-medium leading-relaxed">
            Bring families and good home workers together, with honest checks, fair pay, and money you can trust us to
            hold.
          </p>
        </div>
        <div className="bg-[#660033] p-10 rounded-[2.125rem] text-white space-y-4 hover-lift">
          <h2 className="text-2xl font-bold">Where we are going</h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            A day when every home can afford good help, and every home worker is trained, paid on time, and safe at work.
          </p>
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-20 space-y-12">
        <SectionHeading
          eyebrow="Why Birdie"
          title="We do the hard part for you"
          subtitle="We do not just show you a list of names. We check people, agree terms, and look after the money."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Trust',
              desc: 'We check IDs, police papers and references, and we test skills before anyone joins.',
              icon: ShieldCheck,
            },
            {
              title: 'Care',
              desc: 'Families and workers are both treated with respect. Nobody is left guessing.',
              icon: Heart,
            },
            {
              title: 'Order',
              desc: 'A call, a clear bill, safe money, and pay that arrives on time. No confusion.',
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
            Find someone to help <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

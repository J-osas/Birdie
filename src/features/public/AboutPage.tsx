import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Heart, Scale, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useImages } from '@/app/SiteMediaProvider';
import { useAuth } from '@/app/AuthProvider';
import { SectionHeading } from './sections/SectionHeading';
import { Reveal } from './sections/Reveal';
import { StudioRoute } from '@/features/studio/StudioRoute';

export default function AboutPage() {
  return <StudioRoute slug="about" fallback={<CodedAbout />} />;
}

function CodedAbout() {
  const { settings } = useAuth();
  const images = useImages();
  const hiresOpen = settings?.hires_enabled !== false;
  const proOpen = settings?.reg_pro_enabled !== false;
  const hireTo = hiresOpen ? '/hire' : '/professionals';

  return (
    <div>
      <section className="w-full px-6 md:w-[90vw] md:mx-auto pt-12 md:pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">About Birdie</p>
            <h1 className="text-4xl md:text-6xl font-bold text-[#0A0A0A] tracking-tight leading-tight">
              Home help done properly
            </h1>
            <p className="text-xl text-[#615A5C] font-medium leading-relaxed max-w-xl">
              Birdie makes it safe and simple to bring someone into your home. We check every person, we agree the price
              up front, and we treat the people who work in your home with respect.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
              <img src={images.homeWhy} alt="About Birdie" className="w-full h-full object-cover" />
            </div>
            <img
              src={images.markBurgundy}
              alt=""
              className="absolute -bottom-4 -left-3 w-16 md:w-20 opacity-80 pointer-events-none"
            />
            <div className="absolute inset-x-4 bottom-5 flex flex-wrap gap-2 justify-end">
              {[
                { label: 'We check IDs', icon: ShieldCheck },
                { label: 'We test skills', icon: Award },
                { label: 'We hold your money', icon: Scale },
              ].map((p) => (
                <span
                  key={p.label}
                  className="px-3 py-1.5 rounded-full bg-white/95 text-[#660033] text-xs font-bold shadow-sm border border-white inline-flex items-center gap-1.5"
                >
                  <p.icon size={14} /> {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-12 md:py-16 grid md:grid-cols-2 gap-6">
        <Reveal className="bg-white p-10 rounded-[2.125rem] border border-slate-200 space-y-4 hover-lift">
          <h2 className="text-2xl font-bold text-[#0A0A0A]">What we are here to do</h2>
          <p className="text-lg text-[#615A5C] font-medium leading-relaxed">
            Bring families and good home workers together, with honest checks, fair pay, and money you can trust us to
            hold.
          </p>
        </Reveal>
        <Reveal className="relative overflow-hidden bg-[#660033] p-10 rounded-[2.125rem] text-white space-y-4 hover-lift">
          <img
            src={images.markLight}
            alt=""
            className="pointer-events-none absolute -right-8 -bottom-8 w-40 opacity-[0.12]"
          />
          <h2 className="relative text-2xl font-bold">Where we are going</h2>
          <p className="relative text-lg text-white/80 font-medium leading-relaxed">
            A day when every home can afford good help, and every home worker is trained, paid on time, and safe at work.
          </p>
        </Reveal>
      </section>

      <section className="relative overflow-hidden py-16 md:py-24">
        <img
          src={images.markBurgundy}
          alt=""
          className="pointer-events-none absolute -right-16 top-10 w-72 opacity-[0.06]"
        />
        <div className="relative w-full px-6 md:w-[90vw] md:mx-auto space-y-12">
          <Reveal>
            <SectionHeading
              eyebrow="Why Birdie"
              title="We do the hard part for you"
              subtitle="We do not just show you a list of names. We check people, agree terms, and look after the money."
            />
          </Reveal>
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
            ].map((item) => (
              <Reveal key={item.title}>
                <div className="bg-white p-8 rounded-[1.75rem] border border-slate-200 space-y-4 hover-lift h-full">
                  <item.icon className="text-[#660033]" size={28} />
                  <h3 className="text-xl font-bold text-[#0A0A0A]">{item.title}</h3>
                  <p className="text-[#615A5C] font-medium leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-100 py-16 md:py-24">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <Reveal className="flex-1 space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">Our story</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] italic leading-snug">
              “Birdie was born from a lifetime of living in a home that never stopped moving.”
            </h2>
            <p className="text-lg text-[#615A5C] font-medium leading-relaxed">
              We have seen how hard this is for families and for the people who work in their homes. Birdie is our way of
              making it fair for both sides.
            </p>
            <Link to="/story" className="inline-flex items-center gap-3 font-bold text-[#660033] hover:gap-4 transition-all">
              Read our story <ArrowRight size={18} />
            </Link>
          </Reveal>
          <Reveal>
            <div className="w-full md:w-96 h-80 rounded-[2.125rem] overflow-hidden border border-slate-100">
              <img src={images.story} alt="Birdie story" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#660033] text-white">
        <img
          src={images.markLight}
          alt=""
          className="pointer-events-none absolute -right-8 -bottom-10 w-80 md:w-[28rem] opacity-[0.12]"
        />
        <div className="relative w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24 space-y-8">
          <Reveal className="space-y-4 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">Ready when you are</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">Ready to get help at home?</h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed">
              Clear prices, people we have checked, and your money held safely until the work is done.
            </p>
          </Reveal>
          <Reveal className="flex flex-col sm:flex-row gap-4">
            <Link to={hireTo}>
              <Button size="lg" variant="inverse" className="w-full sm:w-auto">
                Find someone to help <ArrowRight size={18} />
              </Button>
            </Link>
            {proOpen ? (
              <Link to="/register?role=professional">
                <Button size="lg" variant="outlineOnBrand" className="w-full sm:w-auto">
                  I am looking for work
                </Button>
              </Link>
            ) : (
              <Link to="/contact">
                <Button size="lg" variant="outlineOnBrand" className="w-full sm:w-auto">
                  Talk to us
                </Button>
              </Link>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}

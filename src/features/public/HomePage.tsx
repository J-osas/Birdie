import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Heart,
  Award,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { PAYMENT_FAQS } from '@/data/paymentCopy';
import { CATEGORIES } from '@/data/constants';
import { IMAGES, categoryImage } from '@/data/images';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/services/dataService';
import { BlogPost } from '@/types';
import { SectionHeading } from './sections/SectionHeading';
import { FaqItem } from './sections/FaqItem';
import { useInView } from '@/lib/motion';
import { cn } from '@/lib/utils';

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, className: motionClass } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(motionClass, className)}>
      {children}
    </div>
  );
}

const FAQS = [
  {
    q: 'How does Birdie check the people on this site?',
    a: 'Everyone sends us their ID, gives us people who can speak for them, and takes a short test for the job they want to do. A person at Birdie reads the whole file before we give anyone a Verified badge. If someone is still being checked, you will see that on their profile.',
  },
  ...PAYMENT_FAQS,
  {
    q: 'Can I start without picking one person?',
    a: 'Yes. Press "Find someone to help", choose the kind of help you need, and look through the people we have. You can also tell us what you need and we will match you.',
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    dataService.getBlogPosts().then(setPosts).catch(console.error);
  }, []);

  return (
    <div>
      {/* HERO — Recroot-style brand-forward */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#F8FAFB]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${IMAGES.hero}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFB] via-[#F8FAFB]/92 to-[#F8FAFB]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFB] via-transparent to-[#F8FAFB]/40" />

        <div className="relative z-10 w-full px-6 md:w-[90vw] md:mx-auto py-28 md:py-36">
          <div className="max-w-2xl space-y-8">
            <p className="text-4xl md:text-6xl font-bold tracking-tight text-[#660033]">Birdie</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#0A0A0A] tracking-tight leading-[1.05]">
              Good help for your home in Lagos.
            </h1>
            <p className="text-lg md:text-xl text-[#615A5C] font-medium leading-relaxed max-w-xl">
              Drivers, nannies, house help, chefs, gardeners and security. We check every person before you meet them, and
              we hold your money safely until the job is done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/hire">
                <Button size="lg" className="w-full sm:w-auto hover-lift">
                  Find someone to help <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/register?role=professional">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto hover-lift">
                  I am looking for work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <Reveal className="w-full px-6 md:w-[90vw] md:mx-auto -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { label: 'We check everyone', value: 'ID and references', icon: ShieldCheck },
            { label: 'Your money is safe', value: 'We hold it for you', icon: CheckCircle2 },
            { label: 'Made for Lagos', value: 'We know this city', icon: Clock },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-7 md:p-8 rounded-[1.75rem] border border-slate-200/80 shadow-lg shadow-slate-200/40 flex items-center justify-between hover-lift"
            >
              <div className="space-y-1">
                <p className="text-xl md:text-2xl font-bold text-[#0A0A0A] tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold text-[#615A5C] uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
              <div className="w-12 h-12 bg-[#660033]/5 text-[#660033] rounded-2xl flex items-center justify-center">
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CATEGORIES */}
      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-24 md:py-28 space-y-14">
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Pick the kind of help you need"
            subtitle="These are the jobs Lagos homes ask us for most. Every person here has been checked."
          />
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Reveal key={cat}>
              <Link
                to={`/professionals?category=${encodeURIComponent(cat)}`}
                className="group block bg-white rounded-[1.75rem] border border-slate-200 overflow-hidden hover-lift hover:border-[#660033]/25 hover:shadow-xl hover:shadow-[#660033]/5 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#F1F5F9]">
                  <img
                    src={categoryImage(cat)}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-7 space-y-3">
                  <h3 className="text-2xl font-bold text-[#0A0A0A] group-hover:text-[#660033] transition-colors">
                    {cat}
                  </h3>
                  <p className="text-[#615A5C] font-medium text-sm leading-relaxed">
                    Checked {cat.toLowerCase()}s who are ready to start work in your home.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#660033] uppercase tracking-widest pt-1">
                    See the people <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — light, no slate-900 */}
      <section className="bg-white border-y border-slate-100 py-24 md:py-28">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <Reveal className="space-y-10">
            <SectionHeading
              eyebrow="How it works"
              title="Four simple steps"
              subtitle="Look, talk, pay, and get to work. Birdie stays with you the whole way."
            />
            <div className="space-y-6">
              {[
                {
                  n: '01',
                  t: 'Look at the people',
                  d: 'Every person here has sent us their ID, given us references, and passed a short test for their job.',
                },
                {
                  n: '02',
                  t: 'Pay a small meeting fee and talk to us',
                  d: 'We set up a call, learn what your home needs, and agree the right person, the hours and the price.',
                },
                {
                  n: '03',
                  t: 'Pay your bill',
                  d: 'We send you one clear bill. You pay it with your card and Birdie holds the money, not the professional.',
                },
                {
                  n: '04',
                  t: 'Work starts, then we pay',
                  d: 'When the job is done and you are happy, we pay the professional. If the work never happens, you get your money back.',
                },
              ].map((s) => (
                <div key={s.n} className="flex gap-5 p-5 rounded-2xl border border-slate-100 bg-[#F8FAFB]">
                  <span className="text-3xl font-bold text-[#E0B5CB] italic shrink-0">{s.n}</span>
                  <div>
                    <h3 className="text-lg font-bold text-[#0A0A0A]">{s.t}</h3>
                    <p className="text-sm text-[#615A5C] font-medium leading-relaxed mt-1">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
              <img src={IMAGES.process} alt="Birdie hiring process" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROVIDERS */}
      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-24 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200 bg-[#F1F5F9]">
            <img src={IMAGES.provider} alt="Domestic professional" className="w-full h-full object-cover" />
          </div>
        </Reveal>
        <Reveal className="space-y-8">
          <SectionHeading
            eyebrow="If you are looking for work"
            title="Work with respect and get paid on time"
            subtitle="We agree your pay before you start, we hold the money so it cannot disappear, and we are here if anything goes wrong."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: Heart, label: 'Treated well' },
              { icon: Award, label: 'Learn and grow' },
              { icon: Shield, label: 'Safe and supported' },
              { icon: TrendingUp, label: 'You know your pay' },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-[#660033]/5 text-[#660033] flex items-center justify-center">
                  <item.icon size={18} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#615A5C]">{item.label}</p>
              </div>
            ))}
          </div>
          <Link to="/register?role=professional">
            <Button size="lg" className="hover-lift">
              Sign up for work <ArrowRight size={18} />
            </Button>
          </Link>
        </Reveal>
      </section>

      {/* STORY TEASER */}
      <section className="bg-white border-y border-slate-100 py-24">
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
              <img src={IMAGES.story} alt="Birdie story" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-24 space-y-12">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Reading"
            title="Helpful things to read"
            subtitle="Short guides on hiring, staying safe, and running a home well."
          />
          <Link to="/blog" className="text-[#660033] font-bold flex items-center gap-1 shrink-0">
            See all <ChevronRight size={16} />
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post) => (
            <Reveal key={post.id}>
              <Link
                to={`/blog/${post.slug}`}
                className="block bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all h-full"
              >
                <div className="h-48 bg-[#F1F5F9]">
                  <img
                    src={post.imageUrl || IMAGES.blogCover}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{post.category}</p>
                  <h3 className="text-xl font-bold text-[#0A0A0A]">{post.title}</h3>
                  <p className="text-sm text-[#615A5C] line-clamp-3 font-medium">{post.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-y border-slate-100 py-24">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto grid lg:grid-cols-2 gap-12">
          <Reveal>
            <SectionHeading
              eyebrow="Questions"
              title="Questions people ask us"
              subtitle="Straight answers about how we check people, what you pay, and how we keep your money safe."
            />
          </Reveal>
          <Reveal className="space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-20 md:py-24">
        <Reveal>
          <div className="bg-[#660033] rounded-[2.5rem] md:rounded-[3.5rem] p-12 md:p-20 text-center space-y-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to get help at home?</h2>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                Clear prices, people we have checked, and your money held safely until the work is done.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/hire">
                  <Button size="lg" variant="inverse" className="w-full sm:w-auto">
                    Find someone to help
                  </Button>
                </Link>
                <Link to="/register?role=professional">
                  <Button size="lg" variant="outlineOnBrand" className="w-full sm:w-auto">
                    I am looking for work
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

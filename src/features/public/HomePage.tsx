import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PAYMENT_FAQS } from '@/data/paymentCopy';
import { CATEGORIES } from '@/data/constants';
import { categoryImage } from '@/data/images';
import { HOME_PLACEHOLDER_PROS, HOME_PROOF, HOME_TESTIMONIALS } from '@/data/homePlaceholders';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/services/dataService';
import { BlogPost, ProfessionalProfile, ProfessionalStatus } from '@/types';
import { SectionHeading } from './sections/SectionHeading';
import { FaqItem } from './sections/FaqItem';
import { Reveal } from './sections/Reveal';
import { useAuth } from '@/app/AuthProvider';
import { useImages } from '@/app/SiteMediaProvider';
import { StudioRoute } from '@/features/studio/StudioRoute';

const FAQS = [
  {
    q: 'How does Birdie check the people on this site?',
    a: 'Everyone sends us their ID, gives us people who can speak for them, and takes a short test for the job they want to do. A person at Birdie reads the whole file before we give anyone a Verified badge. If someone is still being checked, you will see that on their profile.',
  },
  PAYMENT_FAQS[3],
  {
    q: 'Can I start without picking one person?',
    a: 'Yes. Press "Find someone to help", choose the kind of help you need, and look through the people we have. You can also tell us what you need and we will match you.',
  },
];

type HomePro = {
  id: string;
  fullName: string;
  category: string;
  location: string;
  photo: string;
  live: boolean;
};

function toHomePro(p: ProfessionalProfile, fallback: string, images: ReturnType<typeof useImages>): HomePro {
  return {
    id: p.id,
    fullName: p.fullName || 'A Birdie professional',
    category: p.category,
    location: p.location || 'Lagos',
    photo: p.avatarUrl || categoryImage(p.category, images) || fallback,
    live: true,
  };
}

export default function HomePage() {
  return <StudioRoute slug="home" fallback={<CodedHome />} />;
}

function CodedHome() {
  const { settings } = useAuth();
  const images = useImages();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pros, setPros] = useState<HomePro[]>([]);
  const hiresOpen = settings?.hires_enabled !== false;
  const proOpen = settings?.reg_pro_enabled !== false;
  const email = settings?.support_email || 'support@birdie.ng';
  const phone = settings?.support_phone;
  const hireTo = hiresOpen ? '/hire' : '/professionals';
  const featured = posts[0];

  useEffect(() => {
    dataService.getBlogPosts().then(setPosts).catch(console.error);
    dataService
      .getPublicProfessionals()
      .then((list) => {
        const verified = list.filter(
          (p) => p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.APPROVED
        );
        const pick = (verified.length ? verified : list).slice(0, 4).map((p) => toHomePro(p, images.avatarFallback, images));
        const filled = [...pick];
        let i = 0;
        while (filled.length < 4 && i < HOME_PLACEHOLDER_PROS.length) {
          const ph = HOME_PLACEHOLDER_PROS[i];
          filled.push({
            id: ph.id,
            fullName: ph.fullName,
            category: ph.category,
            location: ph.location,
            photo: images[ph.photoKey],
            live: false,
          });
          i += 1;
        }
        setPros(filled);
      })
      .catch(() => {
        setPros(
          HOME_PLACEHOLDER_PROS.map((ph) => ({
            id: ph.id,
            fullName: ph.fullName,
            category: ph.category,
            location: ph.location,
            photo: images[ph.photoKey],
            live: false,
          }))
        );
      });
  }, [images]);

  const avatars = useMemo(
    () => [images.homeReach1, images.homeReach2, images.homeTestimonial],
    [images.homeReach1, images.homeReach2, images.homeTestimonial]
  );

  return (
    <div>
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <img
          src={images.homeHero}
          alt="A Lagos family at home"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B0116]/92 via-[#660033]/75 to-[#660033]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B0116]/50 via-transparent to-[#2B0116]/20" />
        <img
          src={images.markLight}
          alt=""
          className="pointer-events-none absolute -right-8 bottom-8 w-56 md:w-80 opacity-[0.12]"
        />

        <div className="relative z-10 w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24">
          <div className="max-w-xl space-y-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#E0B5CB]">Lagos home help</p>
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-[3.5rem] text-white tracking-tight leading-[1.08]">
              Good help you can trust, for your home in Lagos.
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed">
              Drivers, nannies, house help, chefs, gardeners and security. We check every person before you meet them,
              and we hold your money safely until the job is done.
            </p>
            <div className="flex flex-col lg:flex-row lg:items-center gap-5 pt-1">
              <Link to={hireTo} className="inline-flex shrink-0">
                <Button size="lg" variant="inverse" className="whitespace-nowrap hover-lift">
                  Find someone to help <ArrowRight size={20} />
                </Button>
              </Link>
              <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-full pl-1.5 pr-4 py-1.5">
                <div className="flex -space-x-3">
                  {avatars.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-white leading-tight">
                  {HOME_PROOF.families} {HOME_PROOF.familiesLabel}
                </p>
              </div>
            </div>
            {proOpen && (
              <Link
                to="/register?role=professional"
                className="inline-flex text-sm font-bold text-[#E0B5CB] hover:text-white hover:underline underline-offset-4"
              >
                I am looking for work
              </Link>
            )}
            <div className="flex flex-wrap gap-2 pt-2 md:hidden">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/professionals?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1.5 rounded-full bg-white/95 text-[#660033] text-xs font-bold shadow-sm border border-white"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute right-6 lg:right-[5vw] bottom-16 z-10 flex-col items-end gap-2 max-w-[220px]">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/professionals?category=${encodeURIComponent(cat)}`}
              className="px-4 py-1.5 rounded-full bg-white/95 text-[#660033] text-xs font-bold shadow-lg shadow-black/10 border border-white hover:bg-[#660033] hover:text-white transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-12 md:py-16">
        <Reveal className="grid md:grid-cols-[auto_1fr_auto] gap-8 items-center bg-white border border-slate-200 rounded-[2.125rem] p-6 md:p-10">
          <img
            src={images.homeReach1}
            alt=""
            className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] object-cover hidden md:block"
          />
          <div className="text-center space-y-3">
            <p className="font-bold text-2xl md:text-3xl text-[#0A0A0A] leading-snug">
              Have a concern? We are a message away.
            </p>
            <p className="text-[#615A5C] font-medium">
              Reach out now — a real person at Birdie will reply.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-[#660033]">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2">
                <Mail size={16} /> {email}
              </a>
              {phone && (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-2">
                  <Phone size={16} /> {phone}
                </a>
              )}
            </div>
          </div>
          <img
            src={images.homeReach2}
            alt=""
            className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] object-cover hidden md:block"
          />
        </Reveal>
      </section>

      <section className="relative overflow-hidden py-16 md:py-24">
        <img
          src={images.markBurgundy}
          alt=""
          className="pointer-events-none absolute -right-16 top-10 w-72 opacity-[0.06]"
        />
        <div className="relative w-full px-6 md:w-[90vw] md:mx-auto space-y-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal className="relative">
              <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200">
                <img src={images.homeWhy} alt="A Lagos home" className="w-full h-full object-cover" />
              </div>
              <div className="absolute left-5 bottom-5 right-12 md:right-20 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white">
                <p className="font-bold text-lg md:text-xl text-[#660033] leading-snug">
                  Dignity sits at the centre of every connection.
                </p>
              </div>
            </Reveal>
            <Reveal className="space-y-6">
              <SectionHeading
                eyebrow="Why families stay"
                title="You deserve help that does not fall apart"
                subtitle="We check the person, agree the work, and hold your money until the job is done. You are not left guessing."
              />
              <Link to={hireTo}>
                <Button size="lg" className="hover-lift">
                  Get started <ArrowRight size={18} />
                </Button>
              </Link>
            </Reveal>
          </div>
          <Reveal className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'We check IDs, references and skill',
                body: 'A person at Birdie reads the file before anyone gets a Verified badge.',
                icon: ShieldCheck,
              },
              {
                title: 'We hold your money until the work is done',
                body: 'You pay Birdie. The professional is paid when the job is complete.',
                icon: CheckCircle2,
              },
              {
                title: 'We treat the worker with respect too',
                body: 'Fair pay, a clear agreement, and someone to call if anything goes wrong.',
                icon: Heart,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-7 space-y-3 hover-lift"
              >
                <item.icon className="text-[#660033]" size={22} />
                <h3 className="text-lg font-bold text-[#0A0A0A] leading-snug">{item.title}</h3>
                <p className="text-sm text-[#615A5C] font-medium leading-relaxed">{item.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-white border-y border-slate-100 py-16 md:py-24">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto space-y-12">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Our people"
              title="Meet the professionals"
              subtitle="Checked nannies, drivers, house help and more — ready for Lagos homes."
            />
            <Link to="/professionals" className="text-[#660033] font-bold inline-flex items-center gap-1 shrink-0">
              See all professionals <ChevronRight size={16} />
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pros.map((pro) => (
              <Reveal key={pro.id}>
                <div className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift h-full flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F1F5F9]">
                    <img src={pro.photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{pro.category}</p>
                    <h3 className="text-lg font-bold text-[#0A0A0A]">{pro.fullName}</h3>
                    <p className="text-xs font-bold text-[#615A5C] inline-flex items-center gap-1">
                      <MapPin size={12} /> {pro.location}
                    </p>
                    <div className="mt-auto pt-2">
                      {pro.live ? (
                        <Link to={`/professionals/${pro.id}`}>
                          <Button variant="secondary" size="sm" className="w-full">
                            See profile
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/professionals">
                          <Button variant="secondary" size="sm" className="w-full">
                            See people
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <Reveal className="space-y-8">
            <SectionHeading
              eyebrow="How it works"
              title="Four simple steps"
              subtitle="Look, talk, pay, and get to work. Birdie stays with you the whole way."
            />
            <ol className="space-y-0">
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
                <li key={s.n} className="flex gap-5 py-5 border-t border-slate-200 first:border-t-0">
                  <span className="font-bold text-2xl text-[#E0B5CB] shrink-0">{s.n}</span>
                  <div>
                    <h3 className="text-lg font-bold text-[#0A0A0A]">{s.t}</h3>
                    <p className="text-sm text-[#615A5C] font-medium leading-relaxed mt-1">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal>
            <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
              <img src={images.process} alt="Birdie hiring process" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto pb-8">
        <Reveal className="grid lg:grid-cols-2 gap-12 items-center bg-white border border-slate-200 rounded-[2.125rem] p-8 md:p-12">
          <div className="grid sm:grid-cols-2 gap-4">
            <img
              src={images[HOME_TESTIMONIALS[0].photoKey]}
              alt=""
              className="rounded-[1.75rem] object-cover w-full h-64 sm:h-full min-h-[280px]"
            />
            <div className="space-y-4">
              <div className="bg-[#F8FAFB] border border-slate-100 rounded-2xl p-5">
                <p className="font-bold text-lg text-[#0A0A0A] leading-snug">
                  “{HOME_TESTIMONIALS[0].quote}”
                </p>
                <p className="text-sm font-bold text-[#660033] mt-4">{HOME_TESTIMONIALS[0].name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#615A5C]">
                  {HOME_TESTIMONIALS[0].role}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-[#615A5C] font-medium leading-relaxed text-sm">
                  “{HOME_TESTIMONIALS[1].quote}”
                </p>
                <p className="text-sm font-bold text-[#0A0A0A] mt-3">{HOME_TESTIMONIALS[1].name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#615A5C]">
                  {HOME_TESTIMONIALS[1].role}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Families"
              title="What it feels like when the system works"
              subtitle="These quotes are placeholders until we publish real family stories. The layout is ready."
            />
            <p className="text-sm font-bold text-[#660033]">
              {HOME_PROOF.professionals} {HOME_PROOF.professionalsLabel}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200 bg-[#F1F5F9]">
            <img src={images.provider} alt="Domestic professional" className="w-full h-full object-cover" />
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
          {proOpen ? (
            <Link to="/register?role=professional">
              <Button size="lg" className="hover-lift">
                Sign up for work <ArrowRight size={18} />
              </Button>
            </Link>
          ) : (
            <Link to="/contact">
              <Button size="lg" className="hover-lift">
                Talk to us <ArrowRight size={18} />
              </Button>
            </Link>
          )}
        </Reveal>
      </section>

      <section className="bg-white border-y border-slate-100 py-16 md:py-24">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <Reveal className="flex-1 space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">Our story</p>
            <h2 className="font-bold text-3xl md:text-4xl text-[#0A0A0A] italic leading-snug">
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

      <section className="w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24 space-y-10">
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
        {featured && (
          <Reveal>
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid lg:grid-cols-2 bg-white border border-slate-200 rounded-[2.125rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all"
            >
              <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[320px] bg-[#F1F5F9]">
                <img
                  src={featured.imageUrl || images.blogCover}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
              <div className="p-8 md:p-12 space-y-4 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{featured.category}</p>
                <h3 className="font-bold text-2xl md:text-4xl text-[#0A0A0A] leading-tight">
                  {featured.title}
                </h3>
                <p className="text-[#615A5C] font-medium leading-relaxed">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 font-bold text-[#660033] pt-2">
                  Read more <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </Reveal>
        )}
      </section>

      <section className="bg-white border-y border-slate-100 py-16 md:py-24">
        <div className="w-full px-6 md:w-[90vw] md:mx-auto grid lg:grid-cols-2 gap-12">
          <Reveal>
            <SectionHeading
              eyebrow="Questions"
              title="A few things people ask"
              subtitle="Straight answers about how we check people, and how we keep your money safe."
            />
          </Reveal>
          <Reveal className="space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#660033] text-white">
        <img
          src={images.markLight}
          alt=""
          className="pointer-events-none absolute -right-8 -bottom-10 w-80 md:w-[28rem] opacity-[0.12]"
        />
        <div className="relative w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">Ready when you are</p>
            <h2 className="font-bold text-3xl md:text-5xl tracking-tight leading-tight">
              Ready to get help at home?
            </h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-xl">
              Clear prices, people we have checked, and your money held safely until the work is done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={hireTo}>
                <Button size="lg" variant="inverse" className="w-full sm:w-auto">
                  Find someone to help
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outlineOnBrand" className="w-full sm:w-auto">
                  Talk to us
                </Button>
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-white/15">
              <img src={images.homeHero} alt="" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

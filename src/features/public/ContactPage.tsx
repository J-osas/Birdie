import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { PAYMENT_FAQS } from '@/data/paymentCopy';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea, Select } from '@/components/ui/Input';
import { useAuth } from '@/app/AuthProvider';
import { useImages } from '@/app/SiteMediaProvider';
import { FaqItem } from './sections/FaqItem';
import { SectionHeading } from './sections/SectionHeading';
import { Reveal } from './sections/Reveal';
import { StudioRoute } from '@/features/studio/StudioRoute';

const FAQS = [
  {
    q: 'What does Birdie do?',
    a: 'We help Lagos homes find good help: nannies, house help, chefs, gardeners, drivers and security. We check each person, agree the job and the price with you, and hold your money until the work is done.',
  },
  ...PAYMENT_FAQS.slice(0, 4),
  {
    q: 'Has everyone on the site been checked?',
    a: 'Anyone with a Verified badge has been through our full check by a person at Birdie. If someone is still being checked you will see that on their profile, so you always know.',
  },
];

function whatsappHref(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('http')) return trimmed;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : trimmed;
}

export default function ContactPage() {
  return <StudioRoute slug="contact" fallback={<CodedContact />} />;
}

function CodedContact() {
  const { settings } = useAuth();
  const images = useImages();
  const [sent, setSent] = useState(false);
  const fee = settings?.consultation_fee_ngn ?? 10000;
  const email = settings?.support_email || 'support@birdie.ng';
  const phone = settings?.support_phone;
  const whatsapp = settings?.support_whatsapp;
  const hiresOpen = settings?.hires_enabled !== false;

  return (
    <div>
      <section className="w-full px-6 md:w-[90vw] md:mx-auto pt-12 md:pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Contact"
              title="Talk to us"
              subtitle="Want help hiring someone, or want to work with us? Send us a note and a real person will reply."
            />
            <div className="space-y-3 text-sm font-bold text-[#660033]">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2">
                <Mail size={16} /> {email}
              </a>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2">
                  <Phone size={16} /> {phone}
                </a>
              )}
              <p className="text-[#615A5C] font-medium">
                Meeting fee ₦{Number(settings?.consultation_fee_ngn ?? fee).toLocaleString()}
              </p>
              {settings?.office_address && (
                <p className="font-medium text-[#615A5C]">{settings.office_address}</p>
              )}
              {whatsapp && (
                <a
                  className="block underline underline-offset-4"
                  href={whatsappHref(whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200">
                <img src={images.contact} alt="Contact Birdie" className="w-full h-full object-cover" />
              </div>
              <img
                src={images.markBurgundy}
                alt=""
                className="absolute -bottom-4 -left-3 w-16 opacity-80 pointer-events-none"
              />
              <div className="absolute left-5 bottom-5 right-12 md:right-20 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white">
                <p className="text-lg font-bold text-[#660033] leading-snug">A real person at Birdie will reply.</p>
              </div>
            </div>
          </div>

          <form
            className="bg-white border border-slate-200 rounded-[2.125rem] p-8 md:p-10 space-y-5 shadow-xl shadow-slate-200/40"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {sent ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-2xl font-bold text-[#0A0A0A]">We got your message</p>
                <p className="text-[#615A5C] font-medium">Someone from Birdie will get back to you soon.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input required type="email" placeholder="you@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>What is this about?</Label>
                  <Select defaultValue="hiring">
                    <option value="hiring">I want to hire someone</option>
                    <option value="provider">I am looking for work</option>
                    <option value="other">Something else</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Your message</Label>
                  <TextArea required rows={5} placeholder="Tell us how we can help…" />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Send
                </Button>
              </>
            )}
          </form>
        </div>
      </section>

      <section className="bg-white border-y border-slate-100 py-16 md:py-24 mt-8">
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

      <section className="relative overflow-hidden bg-[#660033] text-white">
        <img
          src={images.markLight}
          alt=""
          className="pointer-events-none absolute -right-8 -bottom-10 w-80 md:w-[28rem] opacity-[0.12]"
        />
        <div className="relative w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Ready to get help at home?</h2>
          <Link to={hiresOpen ? '/hire' : '/professionals'}>
            <Button size="lg" variant="inverse">
              Find someone to help <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

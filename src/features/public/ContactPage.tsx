import { useState } from 'react';
import { PAYMENT_FAQS } from '@/data/paymentCopy';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea, Select } from '@/components/ui/Input';
import { useAuth } from '@/app/AuthProvider';
import { IMAGES } from '@/data/images';
import { FaqItem } from './sections/FaqItem';
import { SectionHeading } from './sections/SectionHeading';

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

export default function ContactPage() {
  const { settings } = useAuth();
  const [sent, setSent] = useState(false);
  const fee = settings?.consultation_fee_ngn ?? 10000;

  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-16 space-y-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Contact"
            title="Talk to us"
            subtitle="Want help hiring someone, or want to work with us? Send us a note and a real person will reply."
          />
          <p className="text-sm font-bold text-[#660033] space-y-1">
            <span className="block">
              Write to {settings?.support_email || 'support@birdie.ng'}
              {settings?.consultation_fee_ngn != null ? ` · Meeting fee ₦${Number(settings.consultation_fee_ngn).toLocaleString()}` : ` · Meeting fee ₦${fee.toLocaleString()}`}
            </span>
            {settings?.support_phone && <span className="block">{settings.support_phone}</span>}
            {settings?.office_address && <span className="block font-medium text-[#615A5C]">{settings.office_address}</span>}
            {settings?.support_whatsapp && (
              <a
                className="block underline underline-offset-4"
                href={
                  settings.support_whatsapp.startsWith('http')
                    ? settings.support_whatsapp
                    : `https://wa.me/${settings.support_whatsapp.replace(/[^\d]/g, '')}`
                }
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
          </p>
          <div className="aspect-[4/3] rounded-[2.125rem] overflow-hidden border border-slate-200">
            <img src={IMAGES.contact} alt="Contact Birdie" className="w-full h-full object-cover" />
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

      <div className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Questions people ask us</h2>
        {FAQS.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  );
}

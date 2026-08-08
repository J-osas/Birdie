import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, TextArea, Select } from '@/components/ui/Input';
import { useAuth } from '@/app/AuthProvider';
import { IMAGES } from '@/data/images';
import { FaqItem } from './sections/FaqItem';
import { SectionHeading } from './sections/SectionHeading';

const FAQS = [
  {
    q: 'What does Birdie do?',
    a: 'Birdie connects households with vetted domestic professionals — nannies, house help, chefs, gardeners, drivers, and security — with structured hiring and escrow protection.',
  },
  {
    q: 'How much is the consultation fee?',
    a: 'A consultation fee is charged once per hire request. The default is ₦10,000 and can be configured by Birdie operations.',
  },
  {
    q: 'Are all professionals verified?',
    a: 'Verified professionals have completed admin review. Unverified professionals may appear with a Pending verification tag while they complete vetting.',
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
            title="Talk to Birdie"
            subtitle="Questions about hiring, vetting, or joining as a professional? We’re here for Lagos households and providers."
          />
          <p className="text-sm font-bold text-[#660033]">
            Support: {settings?.support_email || 'support@birdie.ng'} · Consultation fee: ₦
            {fee.toLocaleString()}
          </p>
          <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-slate-200">
            <img src={IMAGES.contact} alt="Contact Birdie" className="w-full h-full object-cover" />
          </div>
        </div>

        <form
          className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 space-y-5 shadow-xl shadow-slate-200/40"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {sent ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-2xl font-bold text-[#0A0A0A]">Message received</p>
              <p className="text-[#615A5C] font-medium">Our team will respond shortly.</p>
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
                <Label>Topic</Label>
                <Select defaultValue="hiring">
                  <option value="hiring">Hiring help</option>
                  <option value="provider">Becoming a provider</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <TextArea required rows={5} placeholder="How can we help?" />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Send message
              </Button>
            </>
          )}
        </form>
      </div>

      <div className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-bold text-[#0A0A0A]">FAQ</h2>
        {FAQS.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  );
}

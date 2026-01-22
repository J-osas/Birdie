
import React, { useState } from 'react';
/* Added CheckCircle2 to imports */
import { Mail, MapPin, Phone, Send, ChevronDown, ChevronUp, ShieldCheck, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onHire: () => void;
  onApply: () => void;
}

const FAQS = [
  {
    q: "What exactly does Birdie do?",
    a: "Birdie makes it easy for you to find trusted, skilled workers for your home or business. From nannies and house-helps to chefs, gardeners, drivers, security personnel, and therapists, we connect you with reliable professionals who are ready to work."
  },
  {
    q: "How do you vet and verify workers?",
    a: "Your safety comes first. Every worker goes through multiple layers of screening—ID and background checks, facial capture, skill assessments, and one-on-one interviews. Only those who pass our standards are approved."
  },
  {
    q: "How much does it cost to hire through Birdie?",
    a: "We charge a simple consultation fee of ₦10,000–₦30,000, depending on the service you need. This covers worker verification, matching, and dedicated support from our team."
  },
  {
    q: "Can I request a replacement if I’m not satisfied?",
    a: "Yes, you can. If the worker doesn’t feel like the right fit, you’re eligible for a free replacement within our grace period (typically 7–14 days). We’ll help you find someone who suits your needs."
  },
  {
    q: "How quickly can I get matched with a worker?",
    a: "Most clients get matched within 24–72 hours. For urgent roles, we can fast-track your request. Terms and conditions apply."
  },
  {
    q: "Is Birdie safe for both clients and workers?",
    a: "Absolutely. We prioritize safety, privacy, and fair treatment. Our verification process, secure communication, and dedicated support ensure a smooth experience for both sides."
  },
  {
    q: "Do I get to interview the worker before hiring?",
    a: "Yes. Once you select potential candidates, you can schedule a call or in-person interview through our team. This helps you confirm if the worker is the right fit for your home or business."
  },
  {
    q: "What happens after I hire a worker?",
    a: "We stay with you! Birdie offers post-placement support, check-ins, and guidance to ensure a smooth working relationship. You can always reach out to us if you need help."
  },
  {
    q: "Are the workers trained?",
    a: "Yes. Many workers come with existing experience, and those who score below 50% on our assessment are given access to training modules to improve their skills before being considered for placement."
  },
  {
    q: "Can I hire workers outside Lagos?",
    a: "Yes! While we’re strongly established in Lagos, Birdie offers nationwide matching, depending on the service category and availability. Just tell us your location, and we’ll handle the rest."
  }
];

const ContactPage: React.FC<Props> = ({ onHire, onApply }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 animate-in fade-in duration-700">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-100 pt-20 pb-16">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Get in Touch</h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            We’re here to help you find the right support or answer any questions you may have.
          </p>
        </div>
      </header>

      <main className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-16 space-y-24">
        
        {/* Contact Info & Form Section */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 space-y-8">
              <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#660033]/5 text-[#660033] rounded-2xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                    <a href="mailto:support@birdie.com" className="text-lg font-bold text-slate-900 hover:text-[#660033] transition-colors underline decoration-[#660033]/20">support@birdie.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#660033]/5 text-[#660033] rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Our Location</p>
                    <p className="text-lg font-bold text-slate-900">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-500 font-medium italic">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <p className="text-sm">Our support team typically responds within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
              {formStatus === 'success' ? (
                <div className="py-20 text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Thank you for reaching out. A Birdie representative will contact you shortly.</p>
                  </div>
                  <button onClick={() => setFormStatus('idle')} className="text-[#660033] font-bold text-sm hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input required type="text" placeholder="John Doe" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input required type="email" placeholder="john@example.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input type="tel" placeholder="+234..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all">
                        <option>General Inquiry</option>
                        <option>Hiring Help</option>
                        <option>Partner with Birdie</option>
                        <option>Support Request</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea required rows={5} placeholder="How can we help you?" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all resize-none" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {formStatus === 'submitting' ? 'Sending...' : 'Send Message'} <Send size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><MapPin size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Our Base Location</h2>
          </div>
          <div className="bg-white p-4 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden h-[400px] relative">
            <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126846.52445176162!2d3.3503107!3d6.5243793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a3da57233f!2sLagos!5e0!3m2!1sen!2sng!4v1717900000000!5m2!1sen!2sng" 
                className="w-full h-full border-0 grayscale opacity-80" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg font-medium">Quick answers to the most common questions about the Birdie platform.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm transition-all hover:border-[#660033]/20">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-bold text-slate-900 group-hover:text-[#660033] transition-colors">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-all ${openFaq === i ? 'bg-[#660033] text-white rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-8 animate-in slide-in-from-top duration-300">
                    <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 text-center">
            <p className="text-slate-500 font-medium italic">Still have a specific question? Feel free to contact us above!</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#660033] rounded-[3.5rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-[#660033]/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Still have questions or ready to get started?</h2>
            <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl mx-auto">Our team is ready to assist you in building a safer, better home.</p>
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
        </section>
      </main>
    </div>
  );
};

export default ContactPage;

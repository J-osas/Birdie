import { Link } from 'react-router-dom';
import { ArrowLeft, Quote } from 'lucide-react';
import { IMAGES } from '@/data/images';

export default function OurStoryPage() {
  return (
    <div className="pb-20">
      <div className="w-full px-6 md:w-[90vw] md:mx-auto pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-2xl text-[#615A5C] hover:text-[#660033] font-bold text-sm hover-lift"
        >
          <ArrowLeft size={18} /> Back to the home page
        </Link>
      </div>
      <article className="w-full px-6 md:w-[90vw] md:mx-auto pt-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#660033]">Our story</p>
            <h1 className="text-4xl md:text-6xl font-bold text-[#0A0A0A] tracking-tight">Why we started Birdie</h1>
          </div>
          <div className="aspect-[21/9] rounded-[2.125rem] overflow-hidden bg-[#F1F5F9] border border-slate-100">
            <img src={IMAGES.story} alt="Birdie story" className="w-full h-full object-cover" />
          </div>
          <p className="text-2xl md:text-3xl text-[#0A0A0A] font-bold italic border-l-4 border-[#660033] pl-8">
            “Birdie was born from a lifetime of living in a home that never stopped moving.”
          </p>
          <div className="space-y-8 text-lg text-[#615A5C] font-medium leading-[1.8]">
            <p>
              We grew up in a busy home that always needed a nanny, a cook, someone to help. The hard part was never the
              work. The hard part was trust.
            </p>
            <p>
              For years families went from one agent to the next, hoping for the best. Workers came and left. Some had
              never been trained. Some were treated badly. Nobody was happy, and everybody deserved better.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Families were tired.',
                'Nobody knew who to trust.',
                'Nobody felt protected.',
                'Everybody deserved better.',
              ].map((line, i) => (
                <div
                  key={line}
                  className={`p-8 rounded-3xl border ${
                    i === 3
                      ? 'bg-[#660033]/5 border-[#660033]/10 text-[#660033]'
                      : 'bg-[#F8FAFB] border-slate-100 text-[#0A0A0A]'
                  }`}
                >
                  <p className="font-bold text-xl">{line}</p>
                </div>
              ))}
            </div>
            <div className="bg-white p-10 md:p-14 rounded-[2.125rem] border border-[#660033]/15 space-y-6">
              <Quote className="text-[#660033] opacity-20" size={48} />
              <p className="text-xl md:text-2xl text-[#0A0A0A] leading-relaxed">
                At Birdie, workers are trained, respected and looked after, and families can hire without worrying.
                Everyone is treated properly. That is the whole point.
              </p>
              <p className="text-2xl font-bold text-[#660033]">A bridge between two sides. A fresh start.</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}


import React from 'react';
import { ChevronLeft, Calendar, User, Clock, Share2, ArrowLeft } from 'lucide-react';
import { BlogPost } from './BlogArchive';

interface Props {
  post: BlogPost;
  onBack: () => void;
}

const BlogSingle: React.FC<Props> = ({ post, onBack }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 animate-in fade-in duration-500">
      {/* Navigation Header - Standardized Floating Utility Container */}
      <div className="sticky top-[72px] z-40 bg-transparent py-4 pointer-events-none">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto flex items-center justify-between pointer-events-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg px-5 py-3 rounded-2xl text-slate-500 hover:text-[#660033] font-bold text-sm transition-all group active:scale-95"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </button>
          
          <button className="bg-white border border-slate-200 shadow-lg p-3 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-95">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-4">
        <article className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="px-4 py-1.5 bg-[#660033]/5 text-[#660033] rounded-full text-xs font-bold uppercase tracking-widest border border-[#660033]/10">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 pt-2 border-b border-slate-100 pb-8 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${post.author}/100/100`} alt="" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{post.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} />
                  <span>6 min read</span>
                </div>
              </div>
            </div>

            <div className="aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Content Area */}
          <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium leading-[1.8] space-y-8">
            <p className="text-xl text-slate-900 font-semibold leading-relaxed">
              {post.excerpt}
            </p>
            
            <p>
              In today's fast-paced world, finding the right domestic professional is about more than just filling a role—it's about finding a partner for your home. At Birdie, we believe that trust is the foundation of every successful hire. This trust is built on transparency, rigorous vetting, and a commitment to excellence that goes beyond the initial interview.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 pt-4">Why Vetting Matters</h2>
            <p>
              Background checks are just the beginning. A truly comprehensive vetting process includes identity verification, criminal record searches, employment history validation, and professional reference calls. But even more importantly, it includes an assessment of soft skills—personality, reliability, and the ability to adapt to a unique household environment.
            </p>

            <blockquote className="border-l-4 border-[#660033] pl-8 py-4 bg-[#660033]/5 rounded-r-3xl text-[#660033] italic font-bold text-2xl">
              "A house is made of bricks and beams, but a home is built on the trust of those within its walls."
            </blockquote>

            <h3 className="text-2xl font-bold text-slate-900">Key Steps to a Successful Hire</h3>
            <ul className="space-y-4 list-disc pl-6">
              <li><strong>Define Clear Expectations:</strong> Be specific about daily duties and long-term goals.</li>
              <li><strong>Prioritize Safety:</strong> Never skip the certification check or home visit.</li>
              <li><strong>Trial Period:</strong> Use a short-term trial to ensure a cultural fit for both parties.</li>
              <li><strong>Open Communication:</strong> Establish a regular check-in schedule from day one.</li>
            </ul>

            <p>
              Whether you're looking for an executive driver to navigate the complexities of Lagos traffic or a nanny who provides a nurturing environment for your children, the principles remain the same. The professionals on Birdie are chosen not just for their technical skills, but for their commitment to these values.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <button 
              onClick={onBack}
              className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold hover:border-[#660033] hover:text-[#660033] transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Return to Blog Archive
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Share this story</span>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <button key={i} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#660033] transition-all">
                    <Share2 size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogSingle;

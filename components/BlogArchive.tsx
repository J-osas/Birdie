
import React, { useState, useMemo } from 'react';
import { ArrowRight, Clock, User, Filter, X } from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  content?: string;
}

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 5 Safety Tips for Hiring In-Home Childcare',
    excerpt: 'Ensuring the safety of your family starts with a rigorous vetting process. Learn the key background checks every parent should perform.',
    category: 'Safety',
    author: 'Birdie Team',
    date: 'June 10, 2024',
    image: 'https://picsum.photos/seed/blog1/800/600',
  },
  {
    id: '2',
    title: 'The Future of Domestic Service: Technology and Trust',
    excerpt: 'How digital platforms are changing the way we manage household help, from real-time scheduling to secure digital payments.',
    category: 'Technology',
    author: 'Birdie Team',
    date: 'June 05, 2024',
    image: 'https://picsum.photos/seed/blog2/800/600',
  },
  {
    id: '3',
    title: 'Culinary Trends: Why Private Chefs are More Accessible Than Ever',
    excerpt: 'Private catering is no longer just for the elite. Discover how hiring a chef for weekly meal prep can save you time and money.',
    category: 'Lifestyle',
    author: 'Birdie Team',
    date: 'May 28, 2024',
    image: 'https://picsum.photos/seed/blog3/800/600',
  },
  {
    id: '4',
    title: 'Navigating Lagos Traffic: A Guide for Executive Drivers',
    excerpt: 'Punctuality is a skill. We talk to our top-rated drivers about how they stay ahead of the curve in West Africa’s busiest city.',
    category: 'Professionalism',
    author: 'Birdie Team',
    date: 'May 20, 2024',
    image: 'https://picsum.photos/seed/blog4/800/600',
  },
  {
    id: '5',
    title: 'The Importance of First Aid Certification for Nannies',
    excerpt: 'Beyond basic caregiving, emergency response training is the most vital credential any childcare professional can hold.',
    category: 'Certification',
    author: 'Birdie Team',
    date: 'May 12, 2024',
    image: 'https://picsum.photos/seed/blog5/800/600',
  },
  {
    id: '6',
    title: 'Eco-Friendly Gardening: Transforming Your Backyard',
    excerpt: 'Sustainable landscaping is the new standard. Learn how our gardeners use organic methods to keep Lagos green.',
    category: 'Gardening',
    author: 'Birdie Team',
    date: 'May 05, 2024',
    image: 'https://picsum.photos/seed/blog6/800/600',
  }
];

interface Props {
  onSelectPost: (post: BlogPost) => void;
}

const BlogArchive: React.FC<Props> = ({ onSelectPost }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = MOCK_BLOG_POSTS.map(post => post.category);
    return ['All', ...Array.from(new Set(cats))];
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return MOCK_BLOG_POSTS;
    return MOCK_BLOG_POSTS.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20">
      {/* Blog Header */}
      <header className="bg-white border-b border-slate-100 pt-20 pb-16">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Birdie Blog</h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Insights, tips, and stories on domestic care, safety, and professional services.
          </p>
        </div>
      </header>

      {/* Filter System - Standardized Floating Utility Container */}
      <div className="sticky top-[72px] z-30 bg-transparent py-4 pointer-events-none">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pointer-events-auto">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 overflow-x-auto custom-scrollbar scroll-smooth">
            <div className="flex items-center gap-2 text-slate-400 shrink-0 pr-2 border-r border-slate-100 mr-2">
              <Filter size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filter by</span>
            </div>
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeCategory === cat
                      ? 'bg-[#660033] border-[#660033] text-white shadow-lg shadow-[#660033]/20'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-[#660033]/30 hover:text-[#660033]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {activeCategory !== 'All' && (
              <button 
                onClick={() => setActiveCategory('All')}
                className="ml-auto flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors shrink-0"
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <main className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-12">
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Filter size={32} />
             </div>
             <p className="text-slate-400 font-medium italic">No articles found in this category.</p>
             <button 
               onClick={() => setActiveCategory('All')}
               className="text-[#660033] font-bold text-sm hover:underline"
             >
               View all articles
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                onClick={() => onSelectPost(post)}
                className="bg-white border border-slate-200 rounded-[10px] overflow-hidden hover:border-[#660033]/30 hover:shadow-xl hover:shadow-[#660033]/5 transition-all group cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-[#660033] uppercase tracking-widest shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#660033] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-500 line-clamp-3 font-medium leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      <div className="text-[10px]">
                        <p className="font-bold text-slate-900">{post.author}</p>
                        <p className="font-medium text-slate-400">{post.date}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-[#660033] uppercase tracking-widest group-hover:gap-3 transition-all">
                      Read More <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogArchive;

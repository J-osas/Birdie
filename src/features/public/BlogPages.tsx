import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { BlogPost } from '@/types';
import { IMAGES } from '@/data/images';
import { SectionHeading } from './sections/SectionHeading';

export function BlogArchive() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    dataService.getBlogPosts().then(setPosts);
  }, []);

  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-16 space-y-12">
      <SectionHeading
        eyebrow="Insights"
        title="Professional tips for households"
        subtitle="Guides on hiring, safety, and household management in Lagos."
      />
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all"
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
              <h2 className="text-xl font-bold text-[#0A0A0A]">{post.title}</h2>
              <p className="text-sm text-[#615A5C] line-clamp-3 font-medium">{post.excerpt}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{post.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogSingle() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    dataService.getBlogPosts(false).then((posts) => {
      setPost(posts.find((p) => p.slug === slug) || null);
    });
  }, [slug]);

  if (!post) {
    return (
      <div className="py-24 text-center text-[#615A5C] font-medium">
        Article not found.{' '}
        <Link to="/blog" className="text-[#660033] font-bold">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="w-full px-6 md:w-[90vw] md:mx-auto py-12 max-w-3xl space-y-8">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-[#615A5C] font-bold text-sm hover:text-[#660033]"
      >
        <ArrowLeft size={16} /> All articles
      </Link>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{post.category}</p>
      <h1 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight">{post.title}</h1>
      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
        {post.author} · {post.date}
      </p>
      <div className="aspect-[21/9] rounded-[1.75rem] overflow-hidden bg-[#F1F5F9]">
        <img src={post.imageUrl || IMAGES.blogCover} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="text-lg text-[#615A5C] font-medium leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}

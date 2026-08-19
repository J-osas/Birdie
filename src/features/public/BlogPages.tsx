import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { BlogPost } from '@/types';
import { useImages } from '@/app/SiteMediaProvider';
import { SectionHeading } from './sections/SectionHeading';
import { Reveal } from './sections/Reveal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/AuthProvider';

export function BlogArchive() {
  const images = useImages();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    dataService.getBlogPosts().then(setPosts);
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div>
      <section className="w-full px-6 md:w-[90vw] md:mx-auto pt-12 md:pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 items-end">
          <SectionHeading
            eyebrow="Reading"
            title="Helpful things to read"
            subtitle="Short guides on hiring, staying safe, and running a home in Lagos."
          />
          <p className="text-[#615A5C] font-medium lg:text-right pb-1">
            Written for Lagos families and the people who work in their homes.
          </p>
        </div>
      </section>

      {featured && (
        <section className="w-full px-6 md:w-[90vw] md:mx-auto pb-12">
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
                <h2 className="text-2xl md:text-4xl font-bold text-[#0A0A0A] leading-tight">{featured.title}</h2>
                <p className="text-[#615A5C] font-medium leading-relaxed">{featured.excerpt}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {featured.author} · {featured.date}
                </p>
                <span className="inline-flex items-center gap-2 font-bold text-[#660033] pt-2">
                  Read more <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <section className="relative overflow-hidden py-8 md:py-12 pb-20">
          <img
            src={images.markBurgundy}
            alt=""
            className="pointer-events-none absolute -right-16 top-10 w-72 opacity-[0.06]"
          />
          <div className="relative w-full px-6 md:w-[90vw] md:mx-auto grid md:grid-cols-3 gap-8">
            {rest.map((post) => (
              <Reveal key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="block bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all h-full"
                >
                  <div className="h-48 bg-[#F1F5F9]">
                    <img
                      src={post.imageUrl || images.blogCover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-7 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{post.category}</p>
                    <h2 className="text-xl font-bold text-[#0A0A0A]">{post.title}</h2>
                    <p className="text-sm text-[#615A5C] line-clamp-3 font-medium">{post.excerpt}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {post.author} · {post.date}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function BlogSingle() {
  const { slug } = useParams();
  const { settings } = useAuth();
  const images = useImages();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const hiresOpen = settings?.hires_enabled !== false;
  const proOpen = settings?.reg_pro_enabled !== false;

  useEffect(() => {
    dataService.getBlogPosts(false).then((posts) => {
      const found = posts.find((p) => p.slug === slug) || null;
      setPost(found);
      setRelated(posts.filter((p) => p.slug !== slug && p.published !== false).slice(0, 3));
    });
  }, [slug]);

  if (!post) {
    return (
      <div className="py-24 text-center text-[#615A5C] font-medium">
        We could not find that page.{' '}
        <Link to="/blog" className="text-[#660033] font-bold">
          See everything we have written
        </Link>
      </div>
    );
  }

  return (
    <div>
      <article className="w-full px-6 md:w-[90vw] md:mx-auto pt-10 md:pt-14 space-y-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-[#615A5C] font-bold text-sm hover:text-[#660033]"
        >
          <ArrowLeft size={16} /> Back to all reading
        </Link>
        <div className="max-w-3xl space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{post.category}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight">{post.title}</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            {post.author} · {post.date}
          </p>
        </div>
        <div className="relative aspect-[21/9] rounded-[2.125rem] overflow-hidden bg-[#F1F5F9] border border-slate-200">
          <img src={post.imageUrl || images.blogCover} alt="" className="w-full h-full object-cover" />
          <img
            src={images.markBurgundy}
            alt=""
            className="absolute bottom-4 left-4 w-12 opacity-80 pointer-events-none"
          />
        </div>
        <div className="max-w-3xl text-lg text-[#615A5C] font-medium leading-relaxed whitespace-pre-wrap pb-8">
          {post.content}
        </div>
      </article>

      {related.length > 0 && (
        <section className="w-full px-6 md:w-[90vw] md:mx-auto py-12 space-y-8">
          <h2 className="text-2xl font-bold text-[#0A0A0A]">More to read</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/blog/${item.slug}`}
                className="block bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all"
              >
                <div className="h-40 bg-[#F1F5F9]">
                  <img src={item.imageUrl || images.blogCover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-6 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{item.category}</p>
                  <h3 className="text-lg font-bold text-[#0A0A0A]">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-[#660033] text-white mt-8">
        <img
          src={images.markLight}
          alt=""
          className="pointer-events-none absolute -right-8 -bottom-10 w-80 md:w-[28rem] opacity-[0.12]"
        />
        <div className="relative w-full px-6 md:w-[90vw] md:mx-auto py-16 md:py-20 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to get help at home?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={hiresOpen ? '/hire' : '/professionals'}>
              <Button size="lg" variant="inverse">
                Find someone to help <ArrowRight size={18} />
              </Button>
            </Link>
            {proOpen ? (
              <Link to="/register?role=professional">
                <Button size="lg" variant="outlineOnBrand">
                  I am looking for work
                </Button>
              </Link>
            ) : (
              <Link to="/contact">
                <Button size="lg" variant="outlineOnBrand">
                  Talk to us
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

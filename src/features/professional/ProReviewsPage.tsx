import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Review } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { IMAGES } from '@/data/images';

export default function ProReviewsPage() {
  const { proProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proProfile) return;
    setLoading(true);
    dataService
      .getReviewsForProfessional(proProfile.id, { forOwner: true })
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [proProfile?.id]);

  const published = useMemo(() => reviews.filter((r) => r.status === 'published'), [reviews]);
  const avg = useMemo(() => {
    if (!published.length) return 0;
    return published.reduce((s, r) => s + r.rating, 0) / published.length;
  }, [published]);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Reviews</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">What families say about you</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Every review is checked first. Once it passes the check, it shows on your profile for everyone to see.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your stars</p>
              <p className="text-3xl font-black text-[#0A0A0A] mt-1 flex items-center gap-2">
                {avg ? avg.toFixed(1) : '0.0'}
                <Star size={20} className="text-amber-400" />
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reviews live now</p>
              <p className="text-3xl font-black text-[#0A0A0A] mt-1">{published.length}</p>
            </div>
          </div>

          {loading && (
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 text-sm text-slate-400 font-medium">
              One moment…
            </div>
          )}

          {!loading &&
            reviews.map((r) => (
              <article
                key={r.id}
                className="bg-white border border-slate-200 rounded-[1.75rem] p-5 md:p-6 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#0A0A0A]">{r.clientName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.category} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-bold">
                      <Star size={14} className="text-amber-400" /> {r.rating}
                    </span>
                    {r.status === 'published' ? (
                      <Badge tone="success">Live on your profile</Badge>
                    ) : r.status === 'pending' ? (
                      <Badge tone="warning">Being checked</Badge>
                    ) : (
                      <Badge tone="neutral">Not approved</Badge>
                    )}
                  </div>
                </div>
                {r.status === 'published' ? (
                  <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
                    {r.comment || 'They gave stars but did not write anything.'}
                  </p>
                ) : r.status === 'pending' ? (
                  <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
                    Birdie is still checking this one. Nobody else can see it yet.
                  </p>
                ) : (
                  <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
                    Birdie did not approve this one, so it stays hidden.
                  </p>
                )}
                <Link to={`/app/hires/${r.hireRequestId}`} className="text-xs font-bold text-[#660033]">
                  See the job
                </Link>
              </article>
            ))}

          {!loading && reviews.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-10 space-y-3">
              <Star className="text-slate-300" size={28} />
              <p className="text-[#615A5C] font-medium max-w-md">
                No reviews yet. When you finish a job, the family can give you stars and write a few words here.
              </p>
              <Link to="/app/hires" className="inline-block text-[#660033] font-bold text-sm">
                See my jobs
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-40 border border-slate-200">
            <img src={IMAGES.story} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
            <h2 className="font-bold text-[#0A0A0A]">What the labels mean</h2>
            <ul className="space-y-2 text-sm text-[#615A5C] font-medium">
              <li>
                <span className="font-bold text-[#0A0A0A]">Being checked</span> — we are making sure it follows our
                house rules
              </li>
              <li>
                <span className="font-bold text-[#0A0A0A]">Live on your profile</span> — anyone can read it
              </li>
              <li>
                <span className="font-bold text-[#0A0A0A]">Not approved</span> — it broke our house rules, so it stays
                hidden
              </li>
            </ul>
            {proProfile && (
              <Link
                to={`/professionals/${proProfile.id}`}
                className="inline-block text-sm font-bold text-[#660033] underline underline-offset-4 pt-1"
              >
                See my profile
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Review } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { IMAGES } from '@/data/images';

function statusTone(status: Review['status']): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'published') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'flagged') return 'danger';
  return 'neutral';
}

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

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Reviews</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Client feedback</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Reviews from completed jobs. New reviews publish automatically; Birdie ops may flag issues if needed.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Average</p>
              <p className="text-3xl font-black text-[#0A0A0A] mt-1 flex items-center gap-2">
                {avg ? avg.toFixed(1) : '0.0'}
                <Star size={20} className="text-amber-400" />
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
              <p className="text-3xl font-black text-[#0A0A0A] mt-1">{reviews.length}</p>
            </div>
          </div>

          {loading && (
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 text-sm text-slate-400 font-medium">
              Loading reviews…
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
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-[#615A5C] font-medium leading-relaxed">{r.comment || 'No written comment.'}</p>
                <Link to={`/app/hires/${r.hireRequestId}`} className="text-xs font-bold text-[#660033]">
                  Open related job
                </Link>
              </article>
            ))}

          {!loading && reviews.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-10 space-y-3">
              <Star className="text-slate-300" size={28} />
              <p className="text-[#615A5C] font-medium max-w-md">
                No reviews yet. After a client completes a job, their rating and comment appear here and on your public
                profile.
              </p>
              <Link to="/app/hires" className="inline-block text-[#660033] font-bold text-sm">
                View jobs
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-40 border border-slate-200">
            <img src={IMAGES.story} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
            <h2 className="font-bold text-[#0A0A0A]">About reviews</h2>
            <ul className="space-y-2 text-sm text-[#615A5C] font-medium">
              <li>
                <span className="font-bold text-[#0A0A0A]">Published</span> — visible on your public profile
              </li>
              <li>
                <span className="font-bold text-[#0A0A0A]">Pending / flagged</span> — held by ops if needed
              </li>
            </ul>
            {proProfile && (
              <Link
                to={`/professionals/${proProfile.id}`}
                className="inline-block text-sm font-bold text-[#660033] underline underline-offset-4 pt-1"
              >
                View public profile
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

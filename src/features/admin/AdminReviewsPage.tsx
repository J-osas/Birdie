import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = () => dataService.listAllReviews().then(setReviews);
  useEffect(() => {
    load();
  }, []);

  const tone = (status: string) => {
    if (status === 'published') return 'success' as const;
    if (status === 'flagged') return 'danger' as const;
    return 'warning' as const;
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Reviews</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Review moderation</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Publish, flag, or hide client reviews across the marketplace.
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-[1.75rem] p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#0A0A0A]">
                  {r.rating}/5 · {r.clientName} · {r.category}
                </p>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{r.comment}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs font-bold text-[#660033]">
                  <Link to={`/app/hires/${r.hireRequestId}`} className="hover:underline">
                    Hire
                  </Link>
                  <Link to={`/professionals/${r.professionalId}`} className="hover:underline">
                    Professional
                  </Link>
                  <span className="text-slate-400 font-medium">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge tone={tone(r.status)}>{r.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await dataService.setReviewStatus(r.id, 'published', user?.id);
                  load();
                }}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await dataService.setReviewStatus(r.id, 'flagged', user?.id);
                  load();
                }}
              >
                Flag
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await dataService.setReviewStatus(r.id, 'pending', user?.id);
                  load();
                }}
              >
                Hide
              </Button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-slate-400 italic py-10 text-center">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}

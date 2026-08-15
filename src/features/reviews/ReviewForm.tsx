import { useMemo, useState } from 'react';
import { Loader2, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { REVIEW_GUIDELINES, screenReviewComment } from '@/data/reviewGuidelines';
import { dataService } from '@/services/dataService';
import { Review } from '@/types';

// One place for the wording used everywhere a review's stage is shown.
export function ReviewStatusNote({ status }: { status: Review['status'] }) {
  if (status === 'published') {
    return <p className="text-sm font-bold text-emerald-700">This review is live on the profile.</p>;
  }
  if (status === 'flagged') {
    return (
      <p className="text-sm font-bold text-slate-500">
        Birdie did not put this review on the profile because it broke our rules.
      </p>
    );
  }
  return (
    <p className="text-sm font-bold text-amber-700">
      Birdie is checking this review. It will show on the profile once it passes.
    </p>
  );
}

type Phase = 'form' | 'checking' | 'done';

export function ReviewForm({
  professionalName,
  saving,
  error,
  onSubmit,
  onFinished,
}: {
  professionalName?: string;
  saving?: boolean;
  error?: string | null;
  onSubmit: (rating: number, comment: string) => Promise<Review | void> | Review | void;
  onFinished?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [result, setResult] = useState<Review | null>(null);

  const warning = useMemo(() => screenReviewComment(comment), [comment]);

  if (phase === 'checking') {
    return (
      <div className="rounded-2xl bg-[#F8FAFB] border border-slate-100 p-5 space-y-2">
        <div className="flex items-center gap-2 text-[#660033]">
          <Loader2 size={18} className="animate-spin" />
          <p className="font-bold">Thank you. Birdie is checking your review.</p>
        </div>
        <p className="text-sm text-[#615A5C] font-medium">
          This takes a few seconds. We make sure every review follows our rules before it goes on a profile.
        </p>
      </div>
    );
  }

  if (phase === 'done') {
    const live = result?.status === 'published';
    return (
      <div
        className={`rounded-2xl border p-5 space-y-2 ${
          live ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold ${live ? 'text-emerald-800' : 'text-amber-900'}`}>
          <ShieldCheck size={18} />
          <p>{live ? 'Your review is now live.' : 'A person at Birdie will look at this one.'}</p>
        </div>
        <p className={`text-sm font-medium ${live ? 'text-emerald-800' : 'text-amber-800'}`}>
          {live
            ? `Thank you. Other families can now see what you said about ${professionalName || 'this professional'}.`
            : 'Something in your words needs a human eye. We will check it and let you know. Nothing is public yet.'}
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (comment.trim().length < 10) {
          setLocalError('Please write at least 10 letters so others know what happened.');
          return;
        }
        if (!agreed) {
          setLocalError('Please tick the box to say you have read our rules.');
          return;
        }
        setLocalError(null);
        const created = await onSubmit(rating, comment.trim());
        if (!created || typeof created !== 'object') return;
        setPhase('checking');
        const checked = await dataService.waitForReviewCheck(created.id);
        setResult(checked || created);
        setPhase('done');
        onFinished?.();
      }}
    >
      <div>
        <p className="text-sm text-slate-500 font-medium">
          How did {professionalName || 'this professional'} do? Tell other families about the work.
        </p>
        <div className="flex gap-2 mt-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className="p-1" aria-label={`${n} stars`}>
              <Star size={32} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            </button>
          ))}
        </div>
      </div>
      <TextArea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a short note — at least 10 letters…"
      />
      {warning && (
        <p className="text-sm font-bold text-amber-700">
          A person at Birdie may need to read this one before it goes on the profile.
        </p>
      )}
      <div className="rounded-2xl bg-[#F8FAFB] border border-slate-100 p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Our rules for reviews</p>
        <ul className="space-y-1.5 text-sm text-[#615A5C] font-medium">
          {REVIEW_GUIDELINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <label className="flex items-start gap-2 text-sm font-medium text-[#615A5C]">
        <input
          type="checkbox"
          className="mt-1 accent-[#660033]"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I have read the rules and this review is about the work that was done.
      </label>
      {(localError || error) && <p className="text-sm text-rose-600 font-bold">{localError || error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Sending…' : 'Send my review'}
      </Button>
    </form>
  );
}

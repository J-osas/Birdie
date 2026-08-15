import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { KpiCard } from '@/features/admin/overview/KpiCard';

type Tab = 'decide' | 'checking' | 'live' | 'refused' | 'all';

// pending + a reason  -> a person has to decide
// pending, no reason  -> the automatic check is still running
// published           -> live on the profile
// flagged             -> a person said no
function stageOf(r: Review): Exclude<Tab, 'all'> {
  if (r.status === 'published') return 'live';
  if (r.status === 'flagged') return 'refused';
  return r.flagReason ? 'decide' : 'checking';
}

const STAGE_TEXT: Record<Exclude<Tab, 'all'>, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  decide: { label: 'Needs your decision', tone: 'warning' },
  checking: { label: 'Being checked', tone: 'neutral' },
  live: { label: 'Live', tone: 'success' },
  refused: { label: 'Not approved', tone: 'danger' },
};

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<Tab>('decide');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => dataService.listAllReviews().then(setReviews);
  useEffect(() => {
    load();
  }, []);

  const decide = reviews.filter((r) => stageOf(r) === 'decide');
  const checking = reviews.filter((r) => stageOf(r) === 'checking');
  const live = reviews.filter((r) => stageOf(r) === 'live');
  const refused = reviews.filter((r) => stageOf(r) === 'refused');
  const avg = live.length ? live.reduce((s, r) => s + r.rating, 0) / live.length : 0;

  const q = search.trim().toLowerCase();
  const match = (r: Review) =>
    !q ||
    [r.clientName, r.professionalName, r.comment, r.hireReferenceCode, r.category, r.flagReason]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));

  const rows = useMemo(
    () => (tab === 'all' ? reviews : reviews.filter((r) => stageOf(r) === tab)).filter(match),
    [reviews, tab, q]
  );

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not work');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Reviews</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Reviews desk</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Every review waits a few seconds while Birdie checks the words. Clean ones go live on their own. Anything with a
          problem waits here for you to say yes or no. You can never change what a family wrote.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Needs your decision"
          value={decide.length}
          onClick={() => setTab('decide')}
          active={tab === 'decide'}
        />
        <KpiCard
          label="Being checked"
          value={checking.length}
          hint="Usually a few seconds"
          onClick={() => setTab('checking')}
          active={tab === 'checking'}
        />
        <KpiCard label="Live" value={live.length} onClick={() => setTab('live')} active={tab === 'live'} />
        <KpiCard
          label="Not approved"
          value={refused.length}
          onClick={() => setTab('refused')}
          active={tab === 'refused'}
        />
        <KpiCard label="Average score" value={avg ? avg.toFixed(1) : '—'} hint="Live reviews only" />
      </div>

      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search a family, a professional, a comment or a reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['decide', 'Needs your decision'],
              ['checking', 'Being checked'],
              ['live', 'Live'],
              ['refused', 'Not approved'],
              ['all', 'All'],
            ] as const
          ).map(([id, label]) => (
            <Button key={id} size="sm" variant={tab === id ? 'primary' : 'secondary'} onClick={() => setTab(id)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Family</th>
                <th className="px-5 py-3">Professional</th>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">What they wrote</th>
                <th className="px-5 py-3">Your decision</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const stage = stageOf(r);
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="px-5 py-4 font-black text-sm">{r.rating}/5</td>
                    <td className="px-5 py-4 text-sm font-bold">{r.clientName}</td>
                    <td className="px-5 py-4 text-sm">
                      <Link
                        to={`/professionals/${r.professionalId}`}
                        className="font-bold text-[#660033] hover:underline"
                      >
                        {r.professionalName || 'Profile'}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/app/hires/${r.hireRequestId}`} className="font-mono text-xs font-bold text-[#660033]">
                        {r.hireReferenceCode || 'Request'}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={STAGE_TEXT[stage].tone}>{STAGE_TEXT[stage].label}</Badge>
                      {r.flagReason && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 max-w-[12rem]">{r.flagReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('en-NG')}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#615A5C] font-medium max-w-xs">
                      <p className="whitespace-pre-wrap">{r.comment}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={busy === r.id || r.status === 'published'}
                          onClick={() => run(r.id, () => dataService.setReviewStatus(r.id, 'published', user?.id))}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy === r.id || r.status === 'flagged'}
                          onClick={() =>
                            run(r.id, () =>
                              dataService.setReviewStatus(
                                r.id,
                                'flagged',
                                user?.id,
                                'A person at Birdie did not approve this'
                              )
                            )
                          }
                        >
                          Do not approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="text-slate-400 italic py-10 text-center">
            {tab === 'decide'
              ? 'Nothing is waiting for you. Well done.'
              : tab === 'checking'
                ? 'Nothing is being checked right now.'
                : 'Nothing to show here.'}
          </p>
        )}
      </div>
    </div>
  );
}

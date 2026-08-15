import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Briefcase, Calendar, BadgeCheck, CreditCard, User } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Availability, HireRequest, ProfessionalStatus, Review, Wallet } from '@/types';
import { formatNaira } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { getStatusStyle, statusLabel } from '@/data/constants';
import { IMAGES } from '@/data/images';

const SCHEDULED_STATUSES = new Set([
  'accepted',
  'consultation_paid',
  'awaiting_escrow',
  'funded',
  'active',
]);

export default function ProDashboard() {
  const { user, proProfile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [jobs, setJobs] = useState<HireRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const verified =
    proProfile?.status === ProfessionalStatus.VERIFIED ||
    proProfile?.status === ProfessionalStatus.APPROVED;
  const pending =
    proProfile?.status === ProfessionalStatus.UNDER_REVIEW ||
    proProfile?.status === ProfessionalStatus.PENDING;

  useEffect(() => {
    if (!user) return;
    dataService.getWallet(user.id).then(setWallet);
    dataService.getHireRequests(user.id, 'PROFESSIONAL').then(setJobs);
    if (proProfile) {
      dataService.getReviewsForProfessional(proProfile.id, { forOwner: true }).then(setReviews);
    }
  }, [user, proProfile?.id]);

  const openJobs = jobs.filter((j) =>
    ['pending', 'assigned', 'accepted', 'consultation_paid', 'awaiting_escrow', 'funded', 'active'].includes(
      j.status
    )
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    return jobs
      .filter((j) => SCHEDULED_STATUSES.has(j.status) && j.preferredStartDate)
      .map((j) => ({ job: j, ts: new Date(j.preferredStartDate).getTime() }))
      .filter((x) => !Number.isNaN(x.ts) && x.ts >= now - 86400000)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, 3)
      .map((x) => x.job);
  }, [jobs]);

  const publishedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'published'),
    [reviews]
  );

  const score = proProfile?.assessmentScore ?? 0;
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Your page</p>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mt-1">Welcome back, {firstName}</h1>
          <p className="text-[#615A5C] font-medium mt-1">
            {proProfile?.category || 'Home helper'} · your jobs, your money and your test score
          </p>
        </div>
        {pending && <Badge tone="warning">We are checking you</Badge>}
        {verified && <Badge tone="success">Checked by Birdie</Badge>}
        {proProfile?.status === ProfessionalStatus.REJECTED && <Badge tone="danger">Not accepted</Badge>}
      </div>

      {pending && (
        <div className="bg-amber-50 border border-amber-200 rounded-[1.75rem] p-6 text-sm text-amber-900 font-medium">
          We are looking at your papers and your test. Once we are done you can get paid, add certificates and change
          your profile.
        </div>
      )}

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
        <div className="bg-[#660033] text-white rounded-[1.75rem] p-8 flex flex-col justify-between gap-6">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Your test score</p>
            <p className="text-5xl md:text-6xl font-black mt-3 tabular-nums">{score}%</p>
            <p className="text-sm text-white/75 font-medium mt-3 max-w-md">
              This is how you scored on the Birdie skills test. Families can see it on your profile.
            </p>
          </div>
          <Link
            to="/app/profile"
            className="inline-flex text-sm font-bold underline underline-offset-4 text-white/90 w-fit"
          >
            Change my profile
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Ready to withdraw</p>
            <p className="text-2xl font-black text-[#0A0A0A] mt-2">{formatNaira(wallet?.availableBalance || 0)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Birdie is holding</p>
            <p className="text-xl font-bold text-[#0A0A0A] mt-2">{formatNaira(wallet?.escrowBalance || 0)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Coming soon</p>
            <p className="text-xl font-bold text-[#0A0A0A] mt-2">{formatNaira(wallet?.pendingEarnings || 0)}</p>
          </div>
          <Link
            to="/app/wallet"
            className="col-span-3 text-sm font-bold text-[#660033] underline underline-offset-4"
          >
            See my money
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jobs on your plate</p>
          <p className="text-3xl font-black text-[#0A0A0A] mt-1">{openJobs.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your stars</p>
          <p className="text-3xl font-black text-[#0A0A0A] mt-1 flex items-center gap-2">
            {proProfile?.rating?.toFixed(1) || '0.0'}
            <Star size={18} className="text-amber-400" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Can you take work?</p>
          <p className="text-lg font-bold text-[#0A0A0A] mt-2">
            {statusLabel(proProfile?.availability || Availability.UNAVAILABLE)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <section className="space-y-4 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-bold text-[#0A0A0A]">Coming up</h2>
            <Link to="/app/calendar" className="text-[#660033] font-bold text-sm">
              See my calendar
            </Link>
          </div>
          {upcoming.map((job) => (
            <Link
              key={job.id}
              to={`/app/hires/${job.id}`}
              className="block bg-white border border-slate-200 rounded-[1.75rem] p-5 hover:shadow-md hover:border-[#660033]/20"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{job.serviceRequested || job.serviceCategory}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.clientName} ·{' '}
                    {new Date(job.preferredStartDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className={getStatusStyle(job.status)}>{statusLabel(job.status)}</Badge>
              </div>
            </Link>
          ))}
          {upcoming.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-8 text-sm text-[#615A5C] font-medium">
              Nothing booked yet. Jobs with a start date will show up here and on your calendar.
            </div>
          )}

          <div className="flex justify-between items-center gap-2 pt-2">
            <h2 className="text-xl font-bold text-[#0A0A0A]">Your last jobs</h2>
            <Link to="/app/hires" className="text-[#660033] font-bold text-sm">
              See all jobs
            </Link>
          </div>
          {jobs.slice(0, 3).map((job) => (
            <Link
              key={job.id}
              to={`/app/hires/${job.id}`}
              className="block bg-white border border-slate-200 rounded-[1.75rem] p-5 hover:shadow-md hover:border-[#660033]/20"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{job.serviceRequested || job.serviceCategory}</p>
                  <p className="text-xs text-slate-500 mt-1">{job.clientName}</p>
                </div>
                <Badge className={getStatusStyle(job.status)}>{statusLabel(job.status)}</Badge>
              </div>
            </Link>
          ))}
          {jobs.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-8 text-sm text-[#615A5C] font-medium">
              No jobs yet. Once we finish checking you, families can find you and ask for your help.
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-44 border border-slate-200">
            <img src={proProfile?.avatarUrl || IMAGES.provider} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-[#0A0A0A]">Go straight to</h2>
            <ul className="space-y-3 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <Briefcase className="shrink-0 text-[#660033]" size={18} />
                <Link to="/app/hires" className="font-bold text-[#0A0A0A] hover:underline">
                  My jobs
                </Link>
              </li>
              <li className="flex gap-3">
                <Calendar className="shrink-0 text-[#660033]" size={18} />
                <Link to="/app/calendar" className="font-bold text-[#0A0A0A] hover:underline">
                  My calendar
                </Link>
              </li>
              <li className="flex gap-3">
                <User className="shrink-0 text-[#660033]" size={18} />
                <Link to="/app/profile" className="font-bold text-[#0A0A0A] hover:underline">
                  My profile and papers
                </Link>
              </li>
              <li className="flex gap-3">
                <CreditCard className="shrink-0 text-[#660033]" size={18} />
                <Link to="/app/wallet" className="font-bold text-[#0A0A0A] hover:underline">
                  My money
                </Link>
              </li>
              <li className="flex gap-3">
                <BadgeCheck className="shrink-0 text-[#660033]" size={18} />
                <span>Keep your papers up to date so families keep finding you</span>
              </li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-[#0A0A0A]">What families say</h2>
              <Link to="/app/reviews" className="text-[#660033] font-bold text-sm">
                See all
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              {proProfile?.rating?.toFixed(1) || '0.0'} stars on average · {publishedReviews.length} review
              {publishedReviews.length === 1 ? '' : 's'} live
            </p>
            {publishedReviews.slice(0, 2).map((r) => (
              <div key={r.id} className="border-t border-slate-100 pt-3 space-y-1">
                <div className="flex justify-between gap-2">
                  <p className="font-bold text-sm">{r.clientName}</p>
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Star size={14} className="text-amber-400" /> {r.rating}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{r.comment}</p>
              </div>
            ))}
            {publishedReviews.length === 0 && (
              <p className="text-slate-400 italic text-sm">
                Families can write a review once a job is finished.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

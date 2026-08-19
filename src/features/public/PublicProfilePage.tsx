import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, Star, Award, Clock, Briefcase } from 'lucide-react';
import { dataService } from '@/services/dataService';
import {
  Availability,
  HireRequest,
  ProfessionalCertification,
  ProfessionalProfile,
  ProfessionalStatus,
  Review,
  UserRole,
} from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { statusLabel } from '@/data/constants';
import { categoryImage } from '@/data/images';
import { formatNaira } from '@/lib/utils';
import { useAuth } from '@/app/AuthProvider';
import { useImages } from '@/app/SiteMediaProvider';
import { ReviewForm } from '@/features/reviews/ReviewForm';
import { Select } from '@/components/ui/Input';
import {
  genderLabel,
  osmEmbedUrl,
  publicNeighborhood,
  rateUnitShort,
  workTypeLabel,
} from '@/data/profileOptions';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, status, settings } = useAuth();
  const images = useImages();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [certs, setCerts] = useState<ProfessionalCertification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligible, setEligible] = useState<HireRequest[]>([]);
  const [eligibleLoaded, setEligibleLoaded] = useState(false);
  const [showForm, setShowForm] = useState(params.get('review') === '1');
  const [hireId, setHireId] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const loadReviews = async (professionalId: string) => {
    setReviews(await dataService.getReviewsForProfessional(professionalId));
  };

  useEffect(() => {
    if (!id) return;
    dataService.getProfessionalById(id).then(async (p) => {
      setProfile(p);
      if (p) {
        setCerts(await dataService.getApprovedCertifications(p.id));
        await loadReviews(p.id);
      }
    });
  }, [id]);

  useEffect(() => {
    if (params.get('review') === '1') setShowForm(true);
  }, [params]);

  useEffect(() => {
    if (!user || user.role !== UserRole.CLIENT || !profile) return;
    dataService.getEligibleHiresForReview(user.id, profile.id).then((rows) => {
      setEligible(rows);
      setEligibleLoaded(true);
      if (rows[0]) setHireId((prev) => prev || rows[0].id);
    });
  }, [user?.id, user?.role, profile?.id]);

  const avg = useMemo(() => {
    if (!reviews.length) return profile?.rating ?? 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews, profile?.rating]);

  if (!profile) {
    return <div className="py-24 text-center text-[#615A5C] font-medium">Loading profile…</div>;
  }

  const verified =
    profile.status === ProfessionalStatus.VERIFIED || profile.status === ProfessionalStatus.APPROVED;
  const neighborhood = publicNeighborhood(profile);
  const gender = genderLabel(profile.gender);
  const workType = workTypeLabel(profile.workType);
  const hasMap = profile.lat != null && profile.lng != null;
  const rate =
    profile.indicativeRateNgn != null && profile.indicativeRateNgn > 0
      ? `${formatNaira(profile.indicativeRateNgn)}${rateUnitShort(profile.rateUnit)}`
      : null;
  const isClient = user?.role === UserRole.CLIENT;
  const loginNext = `/login?next=${encodeURIComponent(`/professionals/${profile.id}?review=1`)}`;
  const selectedHire = eligible.find((h) => h.id === hireId) || eligible[0];

  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-10 space-y-10">
      <Link
        to="/professionals"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#615A5C] hover:text-[#660033]"
      >
        <ArrowLeft size={16} /> Back to all our people
      </Link>

      {/* Hero */}
      <section className="grid lg:grid-cols-[minmax(280px,420px)_1fr] gap-0 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/30">
        <div className="bg-[#F1F5F9] min-h-[320px] lg:min-h-full">
          <img
            src={profile.avatarUrl || categoryImage(profile.category, images) || images.avatarFallback}
            alt=""
            className="w-full h-full object-cover min-h-[320px]"
          />
        </div>
        <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {verified ? (
              <Badge tone="success">
                <ShieldCheck size={12} /> Checked by Birdie
              </Badge>
            ) : (
              <Badge tone="warning">Still being checked</Badge>
            )}
            <Badge tone="brand">{profile.category}</Badge>
            {gender && gender !== 'Prefer not to say' && gender !== 'Prefer not to share' && (
              <Badge tone="neutral">{gender}</Badge>
            )}
            {workType && <Badge tone="neutral">{workType}</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight">
            {profile.fullName || 'Birdie Professional'}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-[#615A5C] items-center">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} /> {neighborhood}
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={16} className="text-amber-400" /> {profile.rating.toFixed(1)} · {profile.completedJobs}{' '}
              jobs
            </span>
            {profile.assessmentScore != null && profile.assessmentScore > 0 && (
              <Badge tone="brand">Scored {profile.assessmentScore}% on our test</Badge>
            )}
          </div>
          {rate && (
            <p className="text-2xl font-black text-[#0A0A0A]">
              From {rate}
              <span className="block text-sm font-medium text-[#615A5C] mt-1">
                This is only a guide. We agree the real price with you on a call.
              </span>
            </p>
          )}
          <p className="text-[#615A5C] font-medium leading-relaxed max-w-2xl">
            {profile.bio || 'A home professional working with Birdie.'}
          </p>
          {settings?.hires_enabled === false ? (
            <p className="text-sm font-bold text-[#660033]">We are not taking new requests right now.</p>
          ) : (
            <Link to={`/hire?pro=${profile.id}`} className="inline-flex">
              <Button size="lg" className="hover-lift">
                Hire this person
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1 flex items-center gap-1.5">
            {avg.toFixed(1)} <Star size={16} className="text-amber-400" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jobs finished</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1">{profile.completedJobs}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Our test</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1">{profile.assessmentScore ?? 0}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Free to start?</p>
          <p className="text-lg font-bold text-[#0A0A0A] mt-2">
            {statusLabel(profile.availability || Availability.UNAVAILABLE)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5 col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Years doing this</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1">
            {profile.yearsExperience ? `${profile.yearsExperience} yr` : '—'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        <div className="space-y-8 min-w-0">
          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
            <h2 className="text-2xl font-bold text-[#0A0A0A]">About this person</h2>
            <p className="text-[#615A5C] font-medium leading-relaxed">
              {profile.bio || 'This person has not written about themselves yet.'}
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-[#615A5C]">
              {workType && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase size={16} className="text-[#660033]" /> {workType}
                </span>
              )}
              {profile.yearsExperience ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} className="text-[#660033]" /> {profile.yearsExperience} years doing this work
                </span>
              ) : null}
            </div>
          </section>

          {(profile.skills?.length || 0) > 0 && (
            <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills!.map((s) => (
                  <Badge key={s} tone="brand">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {(profile.languages?.length || 0) > 0 && (
            <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {profile.languages!.map((l) => (
                  <Badge key={l} tone="neutral">
                    {l}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {certs.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Training and certificates</h2>
              <p className="text-sm text-[#615A5C] font-medium">
                We only show these after we have seen the real papers. Nobody can download the files from here.
              </p>
              <div className="flex flex-wrap gap-3">
                {certs.map((c) => (
                  <Badge key={c.id} tone="success">
                    <Award size={12} /> {c.title}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden">
            <div className="p-8 pb-4 space-y-2">
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Where they live</h2>
              <p className="text-sm text-[#615A5C] font-medium flex items-center gap-1.5">
                <MapPin size={16} className="text-[#660033]" /> Around {neighborhood}
              </p>
            </div>
            {hasMap ? (
              <iframe
                title="Approximate service area"
                className="w-full h-72 border-t border-slate-100"
                src={osmEmbedUrl(Number(profile.lat), Number(profile.lng))}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="mx-8 mb-8 rounded-2xl bg-[#F8FAFB] border border-dashed border-slate-200 p-8 text-sm text-[#615A5C] font-medium">
                No map yet. We only share the area: {neighborhood}.
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 space-y-5">
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 md:p-8 space-y-5 shadow-lg shadow-slate-200/40">
            <h2 className="font-bold text-xl text-[#0A0A0A]">The short version</h2>
            {rate ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</p>
                <p className="text-3xl font-black text-[#0A0A0A] mt-1">{rate}</p>
                <p className="text-xs text-[#615A5C] font-medium mt-1">We agree the real price on a call</p>
              </div>
            ) : (
              <p className="text-sm text-[#615A5C] font-medium">We will talk about the price on a call.</p>
            )}
            <ul className="space-y-3 text-sm text-[#615A5C] font-medium border-t border-slate-100 pt-4">
              <li className="flex justify-between gap-3">
                <span>Area</span>
                <span className="font-bold text-[#0A0A0A] text-right">{neighborhood}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Free to start?</span>
                <span className="font-bold text-[#0A0A0A]">{statusLabel(profile.availability || 'unavailable')}</span>
              </li>
              {workType && (
                <li className="flex justify-between gap-3">
                  <span>Live in or live out</span>
                  <span className="font-bold text-[#0A0A0A]">{workType}</span>
                </li>
              )}
            </ul>
            {settings?.hires_enabled === false ? (
              <p className="text-sm font-bold text-[#660033]">We are not taking new requests right now.</p>
            ) : (
              <Link to={`/hire?pro=${profile.id}`} className="block">
                <Button size="lg" className="w-full">
                  Hire this person
                </Button>
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* Reviews */}
      <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 md:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">What families say</h2>
            <p className="text-sm text-[#615A5C] font-medium mt-1">
              {reviews.length
                ? `${avg.toFixed(1)} out of 5 · ${reviews.length} review${reviews.length === 1 ? '' : 's'}`
                : 'Reviews show up here after a job is finished.'}
            </p>
          </div>
          {!user && status !== 'loading' && (
            <Link to={loginNext}>
              <Button variant="secondary">Write a review</Button>
            </Link>
          )}
          {isClient && (
            <Button variant="secondary" onClick={() => setShowForm(true)}>
              Write a review
            </Button>
          )}
        </div>

        {showForm && isClient && (
          <div className="border border-[#660033]/15 bg-[#660033]/[0.03] rounded-2xl p-5 space-y-4">
            {!eligibleLoaded ? (
              <p className="text-sm text-slate-500 font-medium">One moment, checking your jobs…</p>
            ) : eligible.length === 0 ? (
              <div className="space-y-2">
                <p className="font-bold text-[#0A0A0A]">You can write a review after a job is finished</p>
                <p className="text-sm text-[#615A5C] font-medium">
                  Only families who finished a job with this person through Birdie can write a review here. That way you
                  know every review is real.
                </p>
                <div className="flex flex-wrap gap-3 text-sm font-bold text-[#660033]">
                  <Link to="/app" className="hover:underline">
                    Find someone to help
                  </Link>
                  <Link to="/app/hires" className="hover:underline">
                    Your requests
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {eligible.length > 1 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Which job?</p>
                    <Select value={selectedHire?.id} onChange={(e) => setHireId(e.target.value)}>
                      {eligible.map((h) => (
                        <option key={h.id} value={h.id}>
                          {(h.referenceCode || 'Job') + ' · ' + (h.serviceRequested || h.serviceCategory)}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                {settings?.reviews_enabled === false ? (
                  <p className="text-sm font-medium text-[#615A5C]">Reviews are paused right now.</p>
                ) : (
                <ReviewForm
                  professionalName={profile.fullName}
                  saving={reviewSaving}
                  error={reviewError}
                  onFinished={() => loadReviews(profile.id)}
                  onSubmit={async (rating, comment) => {
                    if (!selectedHire || !user) return;
                    setReviewSaving(true);
                    setReviewError(null);
                    try {
                      const created = await dataService.createReview({
                        hireRequestId: selectedHire.id,
                        professionalId: profile.id,
                        clientId: user.id,
                        clientName: user.name || user.firstName,
                        category: selectedHire.serviceCategory,
                        rating,
                        comment,
                      });
                      setEligible((rows) => rows.filter((h) => h.id !== selectedHire.id));
                      return created;
                    } catch (e) {
                      setReviewError(e instanceof Error ? e.message : 'Could not send your review');
                    } finally {
                      setReviewSaving(false);
                    }
                  }}
                />
                )}
              </>
            )}
          </div>
        )}

        {showForm && !user && status !== 'loading' && (
          <p className="text-sm text-[#615A5C] font-medium">
            <Link to={loginNext} className="font-bold text-[#660033]">
              Sign in
            </Link>{' '}
            to write a review about a job you finished with Birdie.
          </p>
        )}

        {reviews.length === 0 && (
          <p className="text-[#615A5C] font-medium italic py-4">No published reviews yet.</p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <article key={r.id} className="border border-slate-100 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between gap-3 items-start">
                <div>
                  <p className="font-bold text-[#0A0A0A]">{r.clientName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {r.category ? ` · ${r.category}` : ''}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold shrink-0">
                  <Star size={14} className="text-amber-400" /> {r.rating}
                </span>
              </div>
              <Badge tone="brand">Real Birdie job</Badge>
              <p className="text-[#615A5C] font-medium leading-relaxed">{r.comment || 'They did not write a note.'}</p>
              {isClient && user?.id !== r.clientId && !reportedIds.includes(r.id) && (
                <button
                  type="button"
                  disabled={reportingId === r.id}
                  onClick={async () => {
                    setReportingId(r.id);
                    try {
                      await dataService.reportReview(r.id, user?.id);
                      setReportedIds((ids) => [...ids, r.id]);
                      await loadReviews(profile.id);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setReportingId(null);
                    }
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600"
                >
                  {reportingId === r.id ? 'Telling Birdie…' : 'Report this review'}
                </button>
              )}
              {reportedIds.includes(r.id) && (
                <p className="text-[11px] font-bold text-slate-400">Thank you. Birdie will look at this review.</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

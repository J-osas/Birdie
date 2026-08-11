import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, Star, Award, Clock, Briefcase } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Availability, ProfessionalCertification, ProfessionalProfile, ProfessionalStatus, Review } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IMAGES, categoryImage } from '@/data/images';
import { formatNaira } from '@/lib/utils';
import {
  genderLabel,
  osmEmbedUrl,
  publicNeighborhood,
  rateUnitShort,
  workTypeLabel,
} from '@/data/profileOptions';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [certs, setCerts] = useState<ProfessionalCertification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!id) return;
    dataService.getProfessionalById(id).then(async (p) => {
      setProfile(p);
      if (p) {
        setCerts(await dataService.getApprovedCertifications(p.id));
        setReviews(await dataService.getReviewsForProfessional(p.id));
      }
    });
  }, [id]);

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

  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-10 space-y-10">
      <Link
        to="/professionals"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#615A5C] hover:text-[#660033]"
      >
        <ArrowLeft size={16} /> Back to directory
      </Link>

      {/* Hero */}
      <section className="grid lg:grid-cols-[minmax(280px,420px)_1fr] gap-0 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/30">
        <div className="bg-[#F1F5F9] min-h-[320px] lg:min-h-full">
          <img
            src={profile.avatarUrl || categoryImage(profile.category) || IMAGES.avatarFallback}
            alt=""
            className="w-full h-full object-cover min-h-[320px]"
          />
        </div>
        <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {verified ? (
              <Badge tone="success">
                <ShieldCheck size={12} /> Verified professional
              </Badge>
            ) : (
              <Badge tone="warning">Pending verification</Badge>
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
              <Badge tone="brand">Birdie assessment {profile.assessmentScore}%</Badge>
            )}
          </div>
          {rate && (
            <p className="text-2xl font-black text-[#0A0A0A]">
              From {rate}
              <span className="block text-sm font-medium text-[#615A5C] mt-1">
                Indicative — final rate agreed after consultation
              </span>
            </p>
          )}
          <p className="text-[#615A5C] font-medium leading-relaxed max-w-2xl">
            {profile.bio || 'Domestic professional on the Birdie network.'}
          </p>
          <Link to={`/hire?pro=${profile.id}`} className="inline-flex">
            <Button size="lg" className="hover-lift">
              Hire this professional
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rating</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1 flex items-center gap-1.5">
            {avg.toFixed(1)} <Star size={16} className="text-amber-400" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jobs done</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1">{profile.completedJobs}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assessment</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1">{profile.assessmentScore ?? 0}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Availability</p>
          <p className="text-lg font-bold text-[#0A0A0A] mt-2 capitalize">
            {(profile.availability || Availability.UNAVAILABLE).replace(/_/g, ' ')}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5 col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Experience</p>
          <p className="text-2xl font-black text-[#0A0A0A] mt-1">
            {profile.yearsExperience ? `${profile.yearsExperience} yr` : '—'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        <div className="space-y-8 min-w-0">
          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 space-y-4">
            <h2 className="text-2xl font-bold text-[#0A0A0A]">About</h2>
            <p className="text-[#615A5C] font-medium leading-relaxed">
              {profile.bio || 'This professional has not added a full bio yet.'}
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-[#615A5C]">
              {workType && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase size={16} className="text-[#660033]" /> {workType}
                </span>
              )}
              {profile.yearsExperience ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} className="text-[#660033]" /> {profile.yearsExperience} years experience
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
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Verified certifications</h2>
              <p className="text-sm text-[#615A5C] font-medium">
                Titles shown after Birdie verifies authenticity. Files are not publicly downloadable.
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
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Location</h2>
              <p className="text-sm text-[#615A5C] font-medium flex items-center gap-1.5">
                <MapPin size={16} className="text-[#660033]" /> Based around {neighborhood}
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
                Map pin not set yet. Location is shared as {neighborhood}.
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 space-y-5">
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 md:p-8 space-y-5 shadow-lg shadow-slate-200/40">
            <h2 className="font-bold text-xl text-[#0A0A0A]">Hire summary</h2>
            {rate ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</p>
                <p className="text-3xl font-black text-[#0A0A0A] mt-1">{rate}</p>
                <p className="text-xs text-[#615A5C] font-medium mt-1">Agreed after consultation</p>
              </div>
            ) : (
              <p className="text-sm text-[#615A5C] font-medium">Rate discussed during consultation.</p>
            )}
            <ul className="space-y-3 text-sm text-[#615A5C] font-medium border-t border-slate-100 pt-4">
              <li className="flex justify-between gap-3">
                <span>Location</span>
                <span className="font-bold text-[#0A0A0A] text-right">{neighborhood}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Availability</span>
                <span className="font-bold text-[#0A0A0A] capitalize">
                  {(profile.availability || 'unavailable').replace(/_/g, ' ')}
                </span>
              </li>
              {workType && (
                <li className="flex justify-between gap-3">
                  <span>Work type</span>
                  <span className="font-bold text-[#0A0A0A]">{workType}</span>
                </li>
              )}
            </ul>
            <Link to={`/hire?pro=${profile.id}`} className="block">
              <Button size="lg" className="w-full">
                Start hire
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      {/* Reviews */}
      <section className="bg-white border border-slate-200 rounded-[1.75rem] p-8 md:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">Client feedback</h2>
            <p className="text-sm text-[#615A5C] font-medium mt-1">
              {reviews.length
                ? `${avg.toFixed(1)} average · ${reviews.length} review${reviews.length === 1 ? '' : 's'}`
                : 'Reviews appear after completed jobs.'}
            </p>
          </div>
        </div>
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
              <p className="text-[#615A5C] font-medium leading-relaxed">{r.comment || 'No written comment.'}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

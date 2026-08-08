import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, Star, Award } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { ProfessionalCertification, ProfessionalProfile, ProfessionalStatus, Review } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IMAGES, categoryImage } from '@/data/images';

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

  if (!profile) {
    return <div className="py-24 text-center text-[#615A5C] font-medium">Loading profile…</div>;
  }

  const verified =
    profile.status === ProfessionalStatus.VERIFIED || profile.status === ProfessionalStatus.APPROVED;

  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-10 space-y-8 max-w-5xl">
      <Link
        to="/professionals"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#615A5C] hover:text-[#660033]"
      >
        <ArrowLeft size={16} /> Back to directory
      </Link>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40">
        <div className="grid md:grid-cols-[300px_1fr]">
          <div className="bg-[#F1F5F9] min-h-[280px]">
            <img
              src={profile.avatarUrl || categoryImage(profile.category) || IMAGES.avatarFallback}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 md:p-12 space-y-6">
            <div className="flex flex-wrap gap-2">
              {verified ? (
                <Badge tone="success">
                  <ShieldCheck size={12} /> Verified professional
                </Badge>
              ) : (
                <Badge tone="warning">Pending verification</Badge>
              )}
              <Badge tone="brand">{profile.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-[#0A0A0A]">
              {profile.fullName || 'Birdie Professional'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-[#615A5C]">
              <span className="flex items-center gap-1">
                <MapPin size={16} /> {profile.location || 'Lagos'}
              </span>
              <span className="flex items-center gap-1">
                <Star size={16} className="text-amber-400" /> {profile.rating.toFixed(1)} ·{' '}
                {profile.completedJobs} jobs
              </span>
              {profile.assessmentScore != null && profile.assessmentScore > 0 && (
                <span>Assessment {profile.assessmentScore}%</span>
              )}
            </div>
            <p className="text-[#615A5C] font-medium leading-relaxed">
              {profile.bio || 'Domestic professional on the Birdie network.'}
            </p>
            <Link to={`/hire?pro=${profile.id}`}>
              <Button size="lg" className="hover-lift">
                Hire this professional
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {certs.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-4">
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

      <section className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6">
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Client feedback</h2>
        {reviews.length === 0 && (
          <p className="text-[#615A5C] font-medium italic">No published reviews yet.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex justify-between">
              <p className="font-bold text-[#0A0A0A]">{r.clientName}</p>
              <span className="flex items-center gap-1 text-sm font-bold">
                <Star size={14} className="text-amber-400" /> {r.rating}
              </span>
            </div>
            <p className="text-[#615A5C] font-medium">{r.comment}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

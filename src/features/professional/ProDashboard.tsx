import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Star } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Availability, HireRequest, ProfessionalStatus, Review, Wallet } from '@/types';
import { formatNaira } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { getStatusStyle } from '@/data/constants';
import { supabase } from '@/lib/supabase';

export default function ProDashboard() {
  const { user, proProfile, refresh } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [jobs, setJobs] = useState<HireRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [certTitle, setCertTitle] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [bioDraft, setBioDraft] = useState('');
  const [savingBio, setSavingBio] = useState(false);

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
      dataService.getReviewsForProfessional(proProfile.id).then(setReviews);
      setBioDraft(proProfile.bio || '');
    }
  }, [user, proProfile?.id]);

  const setAvailability = async (availability: Availability) => {
    if (!user || !verified) return;
    await dataService.updateProfessionalProfile(user.id, { availability });
    await refresh();
  };

  const saveBio = async () => {
    if (!user || !verified) return;
    setSavingBio(true);
    try {
      await dataService.updateProfessionalProfile(user.id, { bio: bioDraft });
      await refresh();
    } finally {
      setSavingBio(false);
    }
  };

  const uploadCert = async () => {
    if (!user || !proProfile || !verified || !certFile || !certTitle.trim()) return;
    const path = `${user.id}/cert-${Date.now()}-${certFile.name}`;
    const { error } = await supabase.storage.from('pro-certifications').upload(path, certFile, { upsert: true });
    if (error) {
      alert(error.message);
      return;
    }
    await dataService.addCertification(proProfile.id, certTitle.trim(), path);
    setCertTitle('');
    setCertFile(null);
    alert('Certification uploaded for review.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Professional workstation</h1>
          <p className="text-slate-500 font-medium mt-1">
            {proProfile?.category} · Assessment {proProfile?.assessmentScore ?? 0}%
          </p>
        </div>
        {pending && <Badge tone="warning">Pending verification</Badge>}
        {verified && <Badge tone="success">Verified</Badge>}
        {proProfile?.status === ProfessionalStatus.REJECTED && <Badge tone="danger">Rejected</Badge>}
      </div>

      {pending && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 text-sm text-amber-900 font-medium">
          Birdie ops is reviewing your ID documents and assessment. Bank payouts, certifications, and profile edits
          unlock after verification. You’ll get an in-app notification (and email when configured) when approved.
        </div>
      )}

      <div className="bg-[#660033] text-white rounded-[2.5rem] p-8 grid md:grid-cols-3 gap-6">
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Available</p>
          <p className="text-4xl font-black mt-2">{formatNaira(wallet?.availableBalance || 0)}</p>
        </div>
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">In escrow</p>
          <p className="text-2xl font-bold mt-2">{formatNaira(wallet?.escrowBalance || 0)}</p>
        </div>
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Pending</p>
          <p className="text-2xl font-bold mt-2">{formatNaira(wallet?.pendingEarnings || 0)}</p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-lg">Availability</h2>
          {!verified && (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Lock size={12} /> Unlocks when verified
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[Availability.AVAILABLE, Availability.BUSY, Availability.UNAVAILABLE, Availability.ON_JOB].map((a) => (
            <Button
              key={a}
              size="sm"
              disabled={!verified}
              variant={proProfile?.availability === a ? 'primary' : 'secondary'}
              onClick={() => setAvailability(a)}
            >
              {a.replace('_', ' ')}
            </Button>
          ))}
        </div>
        {!verified && (
          <p className="text-sm text-slate-500">
            You’re listed with a Pending verification tag until ops approves you for hire.
          </p>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-lg">Public bio</h2>
          {!verified && (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Lock size={12} /> View only
            </span>
          )}
        </div>
        <textarea
          className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium min-h-[120px] disabled:bg-slate-50"
          value={bioDraft}
          disabled={!verified}
          onChange={(e) => setBioDraft(e.target.value)}
        />
        {verified && (
          <Button size="sm" disabled={savingBio} onClick={saveBio}>
            Save bio
          </Button>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-lg">Certifications</h2>
          {!verified && (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Lock size={12} /> Unlocks when verified
            </span>
          )}
        </div>
        {verified ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="e.g. First aid" />
            </div>
            <div className="space-y-1.5">
              <Label>Certificate file</Label>
              <Input type="file" accept="image/*,.pdf" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
            </div>
            <Button className="sm:col-span-2" onClick={uploadCert} disabled={!certFile || !certTitle.trim()}>
              Upload for review
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Upload certificates after your profile is verified.</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Job pipeline</h2>
          <Link to="/app/wallet" className="text-[#660033] font-bold text-sm">
            Open wallet
          </Link>
        </div>
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/app/hires/${job.id}`}
            className="block bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold">{job.serviceRequested || job.serviceCategory}</p>
                <p className="text-xs text-slate-500 mt-1">{job.clientName}</p>
              </div>
              <Badge className={getStatusStyle(job.status)}>{job.status.replace(/_/g, ' ')}</Badge>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && <p className="text-slate-400 italic">No assigned jobs yet.</p>}
      </section>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <h2 className="text-xl font-bold">Client reviews</h2>
        <p className="text-sm text-slate-500">
          {proProfile?.rating?.toFixed(1) || '0.0'} average · {proProfile?.reviewCount || 0} reviews
        </p>
        {reviews.map((r) => (
          <div key={r.id} className="border-t border-slate-100 pt-4 space-y-1">
            <div className="flex justify-between gap-2">
              <p className="font-bold">{r.clientName}</p>
              <span className="flex items-center gap-1 text-sm font-bold">
                <Star size={14} className="text-amber-400" /> {r.rating}
              </span>
            </div>
            <p className="text-sm text-slate-600">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-slate-400 italic text-sm">No reviews yet.</p>}
      </section>
    </div>
  );
}

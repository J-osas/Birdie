import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, Star } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { HireRequest, RequestStatus } from '@/types';
import { getStatusStyle } from '@/data/constants';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [needsReview, setNeedsReview] = useState<HireRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    dataService.getHireRequests(user.id, 'CLIENT').then(async (list) => {
      setHires(list);
      const done = list.filter(
        (h) =>
          (h.status === RequestStatus.COMPLETED || h.status === RequestStatus.SETTLED) && h.professionalId
      );
      const pending: HireRequest[] = [];
      for (const h of done.slice(0, 8)) {
        const existing = await dataService.getReviewForHire(h.id);
        if (!existing) pending.push(h);
      }
      setNeedsReview(pending);
    });
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.firstName}</h1>
          <p className="text-slate-500 font-medium mt-1">Track consultations, escrow, and active hires.</p>
        </div>
        <Link to="/hire">
          <Button>Hire a professional</Button>
        </Link>
      </div>

      {needsReview.length > 0 && (
        <div className="bg-[#660033]/5 border border-[#660033]/15 rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <Star className="text-[#660033] shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-[#0A0A0A]">Rate your recent hire</p>
              <p className="text-sm text-[#615A5C] font-medium mt-1">
                {needsReview[0].professionalName || 'Your professional'} ·{' '}
                {needsReview[0].serviceRequested || needsReview[0].serviceCategory}
              </p>
            </div>
          </div>
          <Link to={`/app/hires/${needsReview[0].id}`}>
            <Button size="sm">Leave a review</Button>
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total hires</p>
          <p className="text-3xl font-black mt-2">{hires.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active</p>
          <p className="text-3xl font-black mt-2">
            {hires.filter((h) => ['active', 'funded', 'accepted'].includes(h.status)).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Awaiting payment</p>
          <p className="text-3xl font-black mt-2">
            {hires.filter((h) => h.status.includes('awaiting') || h.status === 'pending').length}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Recent hires</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {hires.slice(0, 4).map((req) => (
            <Link
              key={req.id}
              to={`/app/hires/${req.id}`}
              className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-lg transition-all"
            >
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${getStatusStyle(req.status)}`}>
                {req.status.replace(/_/g, ' ')}
              </span>
              <p className="font-bold text-slate-900 mt-3">{req.serviceRequested || req.serviceCategory}</p>
              <p className="text-xs text-slate-500 mt-1">With {req.professionalName || 'Matching…'}</p>
              <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {req.preferredStartDate ? new Date(req.preferredStartDate).toLocaleDateString() : 'TBD'}
                </span>
                <span className="text-[#660033]">{formatNaira(req.amount || 0)}</span>
              </div>
            </Link>
          ))}
          {hires.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 space-y-3">
              <Briefcase className="mx-auto text-slate-300" size={32} />
              <p className="text-slate-400 font-medium">You haven’t hired anyone yet.</p>
              <Link to="/hire" className="text-[#660033] font-bold">
                Start your first hire
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

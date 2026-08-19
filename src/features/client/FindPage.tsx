import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Search, ShieldCheck, Wallet, MessageCircle } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Availability, HireRequest, ProfessionalProfile, ProfessionalStatus, UserRole } from '@/types';
import { CATEGORIES } from '@/data/constants';
import { categoryImage } from '@/data/images';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatNaira } from '@/lib/utils';
import { useAuth } from '@/app/AuthProvider';
import { useImages } from '@/app/SiteMediaProvider';

export default function FindPage() {
  const { user, settings } = useAuth();
  const images = useImages();
  const [params, setParams] = useSearchParams();
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [waiting, setWaiting] = useState<HireRequest[]>([]);
  const [q, setQ] = useState('');
  const [availability, setAvailability] = useState('all');
  const category = params.get('category') || '';

  useEffect(() => {
    dataService.getPublicProfessionals().then(setPros).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || user.role !== UserRole.CLIENT) return;
    dataService.getUnreviewedCompletedHires(user.id).then(setWaiting).catch(console.error);
  }, [user?.id, user?.role]);

  const filtered = useMemo(() => {
    return pros.filter((p) => {
      const matchCat = !category || p.category === category;
      const matchQ =
        !q ||
        p.fullName?.toLowerCase().includes(q.toLowerCase()) ||
        p.bio.toLowerCase().includes(q.toLowerCase()) ||
        p.location.toLowerCase().includes(q.toLowerCase());
      const matchAvail =
        availability === 'all' ||
        (availability === 'available' && p.availability === Availability.AVAILABLE) ||
        (availability === 'busy' &&
          (p.availability === Availability.BUSY || p.availability === Availability.ON_JOB));
      return matchCat && matchQ && matchAvail;
    });
  }, [pros, category, q, availability]);

  const setCategory = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('category', value);
    else next.delete('category');
    setParams(next);
  };

  return (
    <div className="w-full space-y-8">
      {waiting.length > 0 && (
        <div className="bg-white border border-[#660033]/15 rounded-[1.75rem] p-5 md:p-6 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">One small favour</p>
            <h2 className="text-xl font-bold text-[#0A0A0A] mt-1">Tell us how the job went</h2>
          </div>
          <ul className="space-y-2">
            {waiting.map((h) => (
              <li key={h.id}>
                <Link
                  to={`/app/hires/${h.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-[#615A5C] hover:text-[#660033]"
                >
                  <span>
                    How was {h.professionalName || 'the person who helped you'}?
                    {h.referenceCode ? ` · ${h.referenceCode}` : ''}
                  </span>
                  <span className="font-bold text-[#660033]">Write a review</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Find help</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] tracking-tight">
              People we have checked ourselves
            </h1>
            <p className="text-[#615A5C] font-medium max-w-2xl">
              Look through the profiles, pick someone you like, and we will set up a short call. Your money stays with
              Birdie until the job is done.
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_160px_160px] gap-3 bg-white border border-slate-200 rounded-[1.75rem] p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input
                className="pl-12 bg-[#F8FAFB]"
                placeholder="Search a name, a skill or a town…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select className="bg-[#F8FAFB]" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Any kind of help</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              className="bg-[#F8FAFB]"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="all">Free or busy</option>
              <option value="available">Free to start</option>
              <option value="busy">Busy right now</option>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                !category
                  ? 'bg-[#660033] text-white border-[#660033]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#660033]/30'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  category === c
                    ? 'bg-[#660033] text-white border-[#660033]'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#660033]/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {filtered.length} {filtered.length === 1 ? 'person' : 'people'} to choose from
          </p>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((pro) => {
              const verified =
                pro.status === ProfessionalStatus.VERIFIED ||
                pro.status === ProfessionalStatus.APPROVED;
              return (
                <div
                  key={pro.id}
                  className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all flex flex-col"
                >
                  <div className="h-44 bg-[#F1F5F9] relative">
                    <img
                      src={pro.avatarUrl || categoryImage(pro.category, images) || images.avatarFallback}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      {verified ? (
                        <Badge tone="success">Checked by Birdie</Badge>
                      ) : (
                        <Badge tone="warning">Still being checked</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">
                        {pro.category}
                      </p>
                      <h3 className="text-lg font-bold text-[#0A0A0A] mt-1">
                        {pro.fullName || 'Birdie Professional'}
                      </h3>
                    </div>
                    <p className="text-sm text-[#615A5C] line-clamp-2 font-medium">
                      {pro.bio || 'A home helper we have checked ourselves.'}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-[#615A5C]">
                      <span className="flex items-center gap-1 min-w-0 truncate">
                        <MapPin size={14} className="shrink-0" />{' '}
                        <span className="truncate">
                          {[pro.city, pro.state].filter(Boolean).join(', ') || pro.location || 'Lagos'}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Star size={14} className="text-amber-400" /> {pro.rating.toFixed(1)} (
                        {pro.reviewCount})
                      </span>
                    </div>
                    {pro.indicativeRateNgn != null && pro.indicativeRateNgn > 0 && (
                      <p className="text-sm font-black text-[#0A0A0A]">
                        From {formatNaira(pro.indicativeRateNgn)}
                        {pro.rateUnit === 'daily' ? '/day' : pro.rateUnit === 'hourly' ? '/hr' : '/mo'}
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                          We agree the real price on the call
                        </span>
                      </p>
                    )}
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                      <Link to={`/professionals/${pro.id}`}>
                        <Button variant="secondary" className="w-full" size="sm">
                          See profile
                        </Button>
                      </Link>
                      {settings?.hires_enabled === false ? (
                        <Button className="w-full" size="sm" disabled>
                          Closed
                        </Button>
                      ) : (
                      <Link to={`/hire?pro=${pro.id}`}>
                        <Button className="w-full" size="sm">
                          Ask for help
                        </Button>
                      </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center bg-white rounded-[1.75rem] border border-dashed border-slate-200">
              <p className="text-[#615A5C] font-medium">
                Nobody matches what you picked. Try a different kind of help.
              </p>
            </div>
          )}
        </div>

        <aside className="hidden lg:block space-y-5 sticky top-6">
          <div className="rounded-[1.75rem] overflow-hidden h-44 border border-slate-200">
            <img src={images.provider} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-[#0A0A0A]">How it works</h2>
            <ul className="space-y-4 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <ShieldCheck className="shrink-0 text-[#660033]" size={18} />
                <span>Read the profile and pick the person you like.</span>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="shrink-0 text-[#660033]" size={18} />
                <span>Pay one small fee and we call you to talk it through.</span>
              </li>
              <li className="flex gap-3">
                <Wallet className="shrink-0 text-[#660033]" size={18} />
                <span>Pay the bill we send you. Birdie holds the money until the job is done.</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#660033] text-white rounded-[1.75rem] p-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Not sure?</p>
            <p className="font-bold text-lg leading-snug">Don’t know which one to pick?</p>
            <p className="text-sm text-white/75 font-medium">
              Start with House Help or Nanny. You can also just message us and we will help you choose.
            </p>
            <Link to="/contact" className="inline-block text-sm font-bold underline underline-offset-4">
              Talk to Birdie
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Search } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Availability, ProfessionalProfile, ProfessionalStatus } from '@/types';
import { CATEGORIES } from '@/data/constants';
import { IMAGES, categoryImage } from '@/data/images';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { SectionHeading } from './sections/SectionHeading';

export default function ProfessionalsPage() {
  const [params, setParams] = useSearchParams();
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [q, setQ] = useState('');
  const category = params.get('category') || '';

  useEffect(() => {
    dataService.getPublicProfessionals().then(setPros).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return pros.filter((p) => {
      const matchCat = !category || p.category === category;
      const matchQ =
        !q ||
        p.fullName?.toLowerCase().includes(q.toLowerCase()) ||
        p.bio.toLowerCase().includes(q.toLowerCase()) ||
        p.location.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [pros, category, q]);

  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-12 space-y-10">
      <SectionHeading
        eyebrow="Directory"
        title="Find professionals"
        subtitle="Verified pros and pending applicants — always clearly tagged."
      />

      <div className="grid md:grid-cols-[1fr_200px_200px] gap-4 bg-white border border-slate-200 rounded-[1.75rem] p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <Input
            className="pl-12 bg-[#F8FAFB]"
            placeholder="Search by name or keyword..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          className="bg-[#F8FAFB]"
          value={category}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            if (e.target.value) next.set('category', e.target.value);
            else next.delete('category');
            setParams(next);
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select className="bg-[#F8FAFB]" defaultValue="all">
          <option value="all">All availability</option>
          <option value="available">Available</option>
          <option value="busy">Busy / on job</option>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pro) => {
          const verified =
            pro.status === ProfessionalStatus.VERIFIED || pro.status === ProfessionalStatus.APPROVED;
          return (
            <div
              key={pro.id}
              className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden hover-lift hover:border-[#660033]/25 transition-all flex flex-col"
            >
              <div className="h-48 bg-[#F1F5F9] relative">
                <img
                  src={pro.avatarUrl || categoryImage(pro.category) || IMAGES.avatarFallback}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  {verified ? (
                    <Badge tone="success">Verified</Badge>
                  ) : (
                    <Badge tone="warning">Pending verification</Badge>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{pro.category}</p>
                  <h3 className="text-xl font-bold text-[#0A0A0A] mt-1">
                    {pro.fullName || 'Birdie Professional'}
                  </h3>
                </div>
                <p className="text-sm text-[#615A5C] line-clamp-2 font-medium">
                  {pro.bio || 'Vetted domestic professional on Birdie.'}
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-[#615A5C]">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {pro.location || 'Lagos'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400" /> {pro.rating.toFixed(1)} ({pro.reviewCount})
                  </span>
                </div>
                <Badge
                  tone={
                    pro.availability === Availability.AVAILABLE
                      ? 'success'
                      : pro.availability === Availability.ON_JOB || pro.availability === Availability.BUSY
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {pro.availability.replace('_', ' ')}
                </Badge>
                <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                  <Link to={`/professionals/${pro.id}`}>
                    <Button variant="secondary" className="w-full" size="sm">
                      View profile
                    </Button>
                  </Link>
                  <Link to={`/hire?pro=${pro.id}`}>
                    <Button className="w-full" size="sm">
                      Hire pro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[1.75rem] border border-dashed border-slate-200">
          <p className="text-[#615A5C] font-medium">No professionals match these filters yet.</p>
        </div>
      )}
    </div>
  );
}

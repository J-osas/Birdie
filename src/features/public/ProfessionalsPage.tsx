import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Search } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Availability, ProfessionalProfile, ProfessionalStatus } from '@/types';
import { CATEGORIES, statusLabel } from '@/data/constants';
import { IMAGES, categoryImage } from '@/data/images';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { SectionHeading } from './sections/SectionHeading';
import { useAuth } from '@/app/AuthProvider';

export default function ProfessionalsPage() {
  const [params, setParams] = useSearchParams();
  const { settings } = useAuth();
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
        eyebrow="Our people"
        title="Find someone to help"
        subtitle="We tell you clearly who has finished our checks and who is still being checked."
      />

      <div className="grid md:grid-cols-[1fr_200px_200px] gap-4 bg-white border border-slate-200 rounded-[1.75rem] p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <Input
            className="pl-12 bg-[#F8FAFB]"
            placeholder="Search a name, a skill or an area…"
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
          <option value="">Any kind of help</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select className="bg-[#F8FAFB]" defaultValue="all">
          <option value="all">Free or busy</option>
          <option value="available">Free to start</option>
          <option value="busy">Already on a job</option>
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
                    <Badge tone="success">Checked by Birdie</Badge>
                  ) : (
                    <Badge tone="warning">Still being checked</Badge>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">{pro.category}</p>
                  <h3 className="text-xl font-bold text-[#0A0A0A] mt-1">
                    {pro.fullName || 'A Birdie professional'}
                  </h3>
                </div>
                <p className="text-sm text-[#615A5C] line-clamp-2 font-medium">
                  {pro.bio || 'Checked by Birdie and ready to work.'}
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
                  {statusLabel(pro.availability)}
                </Badge>
                <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
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
                      Hire
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
        <div className="py-20 text-center bg-white rounded-[1.75rem] border border-dashed border-slate-200">
          <p className="text-[#615A5C] font-medium">Nobody matches that yet. Try a different search.</p>
        </div>
      )}
    </div>
  );
}

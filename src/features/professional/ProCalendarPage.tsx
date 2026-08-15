import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { HireRequest } from '@/types';
import { getStatusStyle, statusLabel } from '@/data/constants';
import { IMAGES } from '@/data/images';
import { Button } from '@/components/ui/Button';

const SCHEDULED_STATUSES = new Set([
  'accepted',
  'consultation_paid',
  'awaiting_escrow',
  'funded',
  'active',
]);

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseJobDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function ProCalendarPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<HireRequest[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    dataService.getHireRequests(user.id, 'PROFESSIONAL').then(setJobs);
  }, [user]);

  const scheduled = useMemo(() => {
    return jobs.filter((j) => SCHEDULED_STATUSES.has(j.status) && parseJobDate(j.preferredStartDate));
  }, [jobs]);

  const byDay = useMemo(() => {
    const map = new Map<string, HireRequest[]>();
    for (const j of scheduled) {
      const d = parseJobDate(j.preferredStartDate)!;
      const key = dateKey(d);
      const list = map.get(key) || [];
      list.push(j);
      map.set(key, list);
    }
    return map;
  }, [scheduled]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, key: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(year, month, day));
    cells.push({ day, key });
  }

  const listGroups = useMemo(() => {
    const entries = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return entries;
  }, [byDay]);

  const selectedJobs = selectedKey ? byDay.get(selectedKey) || [] : [];

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Calendar</p>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mt-1">Work schedule</h1>
          <p className="text-sm text-[#615A5C] font-medium mt-1 max-w-xl">
            Approved and active jobs with a start date. Switch between month and list views.
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 gap-1">
          <Button
            size="sm"
            variant={view === 'calendar' ? 'primary' : 'secondary'}
            onClick={() => setView('calendar')}
          >
            <CalendarIcon size={14} className="mr-1.5" /> Calendar
          </Button>
          <Button size="sm" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
            <List size={14} className="mr-1.5" /> List
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="min-w-0 space-y-4">
          {view === 'calendar' && (
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-500"
                  onClick={() => setCursor(new Date(year, month - 1, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <p className="font-bold text-[#0A0A0A]">{monthLabel}</p>
                <button
                  type="button"
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-500"
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) => {
                  if (!cell.day || !cell.key) {
                    return <div key={`e-${i}`} className="aspect-square" />;
                  }
                  const count = byDay.get(cell.key)?.length || 0;
                  const selected = selectedKey === cell.key;
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => setSelectedKey(cell.key)}
                      className={`aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-0.5 border transition-colors ${
                        selected
                          ? 'bg-[#660033] text-white border-[#660033]'
                          : count
                            ? 'bg-[#660033]/5 text-[#660033] border-[#660033]/20 hover:border-[#660033]/40'
                            : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cell.day}</span>
                      {count > 0 && (
                        <span className={`text-[9px] font-bold ${selected ? 'text-white/80' : 'text-[#660033]'}`}>
                          {count} job{count > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'list' && (
            <div className="space-y-4">
              {listGroups.map(([key, dayJobs]) => (
                <div key={key} className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                    {new Date(key + 'T12:00:00').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {dayJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/app/hires/${job.id}`}
                      className="block bg-white border border-slate-200 rounded-[1.75rem] p-5 hover:shadow-md hover:border-[#660033]/20"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#0A0A0A]">{job.serviceRequested || job.serviceCategory}</p>
                          <p className="text-xs text-slate-500 mt-1">{job.clientName}</p>
                        </div>
                        <span
                          className={`px-2 py-1 h-fit rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(job.status)}`}
                        >
                          {statusLabel(job.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
              {listGroups.length === 0 && (
                <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-10 text-sm text-[#615A5C] font-medium">
                  Nothing booked yet. Once a job has a start date, it shows up here.
                </div>
              )}
            </div>
          )}

          {view === 'calendar' && selectedKey && (
            <div className="space-y-3">
              <h2 className="font-bold text-[#0A0A0A]">
                {new Date(selectedKey + 'T12:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              {selectedJobs.map((job) => (
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
                    <span
                      className={`px-2 py-1 h-fit rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(job.status)}`}
                    >
                      {statusLabel(job.status)}
                    </span>
                  </div>
                </Link>
              ))}
              {selectedJobs.length === 0 && (
                <p className="text-sm text-slate-400 font-medium">Nothing on this day.</p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-40 border border-slate-200">
            <img src={IMAGES.process} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-3">
            <h2 className="font-bold text-[#0A0A0A]">How scheduling works</h2>
            <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
              Jobs show here once they are accepted and have a start date. Jobs without a date stay under Jobs.
            </p>
            <Link to="/app/hires" className="inline-block text-sm font-bold text-[#660033] underline underline-offset-4">
              Open jobs
            </Link>
          </div>
          <div className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">This month</p>
            <p className="text-3xl font-black text-[#0A0A0A] mt-2">
              {[...byDay.keys()].filter((k) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
            </p>
            <p className="text-sm text-[#615A5C] font-medium mt-1">days with scheduled work</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

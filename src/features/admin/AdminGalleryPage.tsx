import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { useSiteMedia } from '@/app/SiteMediaProvider';
import { dataService } from '@/services/dataService';
import { MediaFile, MediaSlot, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/utils';

const GROUPS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'brand', label: 'Logo' },
  { id: 'home', label: 'Home' },
  { id: 'pages', label: 'Pages' },
  { id: 'categories', label: 'Categories' },
  { id: 'library', label: 'Uploads' },
];

export default function AdminGalleryPage() {
  const { user } = useAuth();
  const { refresh: refreshLive } = useSiteMedia();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;

  const [slots, setSlots] = useState<MediaSlot[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [group, setGroup] = useState('all');
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const extraInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [nextSlots, nextFiles] = await Promise.all([
      dataService.listMediaSlots(),
      dataService.listMediaFiles(),
    ]);
    setSlots(nextSlots);
    setFiles(nextFiles);
  };

  useEffect(() => {
    if (!isStaff) return;
    load().catch((err) => setError(errorMessage(err, 'Could not load the gallery.')));
  }, [isStaff]);

  const assignedIds = useMemo(() => new Set(slots.map((s) => s.mediaId).filter(Boolean)), [slots]);
  const extras = files.filter((f) => !assignedIds.has(f.id));
  const shownSlots = group === 'all' || group === 'library' ? slots : slots.filter((s) => s.groupName === group);

  const replaceSlot = async (slot: string, file: File | undefined) => {
    if (!file) return;
    setBusySlot(slot);
    setError(null);
    try {
      await dataService.uploadSiteMedia(file, slot);
      await load();
      await refreshLive();
    } catch (err) {
      setError(errorMessage(err, 'Could not replace that picture.'));
    } finally {
      setBusySlot(null);
    }
  };

  const uploadExtra = async (file: File | undefined) => {
    if (!file) return;
    setBusySlot('library');
    setError(null);
    try {
      await dataService.uploadSiteMedia(file);
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not upload that picture.'));
    } finally {
      setBusySlot(null);
    }
  };

  const assign = async (slot: string, mediaId: string) => {
    setBusySlot(slot);
    setError(null);
    try {
      await dataService.assignMediaToSlot(slot, mediaId);
      await load();
      await refreshLive();
    } catch (err) {
      setError(errorMessage(err, 'Could not use that picture.'));
    } finally {
      setBusySlot(null);
    }
  };

  const removeFile = async (id: string) => {
    setBusySlot(id);
    setError(null);
    try {
      await dataService.deleteMediaFile(id);
      await load();
      await refreshLive();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete that picture.'));
    } finally {
      setBusySlot(null);
    }
  };

  if (!isStaff) return <Navigate to="/app" replace />;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Gallery</p>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Pictures on the website</h1>
          <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
            Every photo and logo lives here. Replace one and the live site uses it straight away — same idea as a
            WordPress media library.
          </p>
        </div>
        <div>
          <input
            ref={extraInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              uploadExtra(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button size="sm" onClick={() => extraInput.current?.click()} disabled={busySlot === 'library'}>
            <ImagePlus size={16} /> Add a picture
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <Button
            key={g.id}
            size="sm"
            variant={group === g.id ? 'primary' : 'secondary'}
            onClick={() => setGroup(g.id)}
          >
            {g.label}
          </Button>
        ))}
      </div>

      {group !== 'library' && (
        <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shownSlots.map((slot) => (
            <article
              key={slot.slot}
              className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/10] bg-[#F8FAFB] flex items-center justify-center p-4">
                <img
                  src={slot.publicUrl}
                  alt={slot.label}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div>
                  <p className="font-bold text-[#0A0A0A]">{slot.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    {slot.groupName} · {slot.file ? slot.file.filename : 'Built-in file'}
                  </p>
                </div>
                <label className="mt-auto inline-flex">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="sr-only"
                    disabled={busySlot === slot.slot}
                    onChange={(e) => {
                      replaceSlot(slot.slot, e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  <span className="inline-flex items-center justify-center gap-2 font-bold px-4 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer">
                    {busySlot === slot.slot ? 'Saving…' : 'Replace'}
                  </span>
                </label>
              </div>
            </article>
          ))}
        </section>
      )}

      {(group === 'all' || group === 'library') && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Uploads not in use yet</h2>
          {extras.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">
              Nothing sitting unused. Add a picture above, then put it on a slot from here.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {extras.map((file) => (
                <article
                  key={file.id}
                  className="bg-white border border-slate-200 rounded-[1.75rem] overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-[#F8FAFB] flex items-center justify-center p-4">
                    <img src={file.publicUrl} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="font-bold text-sm truncate">{file.filename}</p>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Use this for
                      </span>
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) assign(e.target.value, file.id);
                          e.target.value = '';
                        }}
                      >
                        <option value="">Pick a place on the site…</option>
                        {slots.map((s) => (
                          <option key={s.slot} value={s.slot}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busySlot === file.id}
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

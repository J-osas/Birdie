import { useEffect, useState } from 'react';
import { GripVertical, Plus, EyeOff, Eye, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/AuthProvider';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { useStudio } from './StudioProvider';
import { BLOCK_LABELS, emptyBlock, type BlockType, type PageBlock } from './schema';
import { dataService } from '@/services/dataService';

const PALETTE = Object.keys(BLOCK_LABELS) as BlockType[];

export function StudioEditBar() {
  const { user, settings } = useAuth();
  const studio = useStudio();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const on = settings?.page_studio_enabled === true;
  const [addOpen, setAddOpen] = useState(false);
  const [slots, setSlots] = useState<{ slot: string; label: string }[]>([]);

  useEffect(() => {
    if (!isStaff || !on) return;
    dataService
      .listMediaSlots()
      .then((rows) => setSlots(rows.map((r) => ({ slot: r.slot, label: r.label }))))
      .catch(() => setSlots([]));
  }, [isStaff, on]);

  if (!isStaff || !on || !studio.slug) return null;

  const selected = studio.draft.blocks.find((b) => b.id === studio.selectedId);
  const overlay = studio.slug === 'home';

  const move = (id: string, dir: -1 | 1) => {
    const blocks = [...studio.draft.blocks];
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const [item] = blocks.splice(i, 1);
    blocks.splice(j, 0, item);
    studio.setDraft({ blocks });
  };

  const patchSelected = (patch: Partial<PageBlock>) => {
    if (!selected) return;
    studio.setDraft({
      blocks: studio.draft.blocks.map((b) => (b.id === selected.id ? ({ ...b, ...patch } as PageBlock) : b)),
    });
  };

  return (
    <div
      className={cn(
        'z-40',
        overlay
          ? 'fixed inset-x-0 pointer-events-none flex justify-center px-4 top-[calc(var(--public-chrome-h,72px)+8px)]'
          : 'sticky top-[72px] border-b border-slate-200 bg-white/95 backdrop-blur-md'
      )}
    >
      <div
        className={cn(
          overlay
            ? cn(
                'pointer-events-auto rounded-2xl border border-white/70 bg-white/95 backdrop-blur-md shadow-lg shadow-[#2B0116]/20',
                studio.editing ? 'w-full md:w-[90vw]' : 'w-auto'
              )
            : 'w-full md:w-[90vw] md:mx-auto'
        )}
      >
      <div className="px-4 py-2 flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033] mr-2">Page studio</p>
        <Button size="sm" variant={studio.editing ? 'primary' : 'secondary'} onClick={() => studio.setEditing(!studio.editing)}>
          {studio.editing ? 'Done' : 'Edit this page'}
        </Button>
        {studio.editing && (
          <>
            <div className="relative">
              <Button size="sm" variant="secondary" onClick={() => setAddOpen((v) => !v)}>
                <Plus size={14} /> Add section
              </Button>
              {addOpen && (
                <div className="absolute left-0 mt-1 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl py-1 z-50">
                  {PALETTE.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        studio.setDraft({ blocks: [...studio.draft.blocks, emptyBlock(type)] });
                        setAddOpen(false);
                      }}
                    >
                      {BLOCK_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={studio.saving}
              onClick={() => studio.saveDraft(user?.id)}
            >
              Save draft
            </Button>
            <Button size="sm" disabled={studio.saving} onClick={() => studio.publish(user?.id)}>
              Publish
            </Button>
            <Button size="sm" variant="secondary" disabled={studio.saving} onClick={() => studio.reset(user?.id)}>
              Reset
            </Button>
            {studio.dirty && <span className="text-xs font-bold text-amber-700">Unsaved</span>}
            {studio.error && <span className="text-xs font-bold text-rose-600">{studio.error}</span>}
          </>
        )}
      </div>
      {studio.editing && selected && (
        <div className="px-4 pb-3 flex flex-wrap items-end gap-3">
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', selected.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            className="text-slate-400 mb-2 cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </span>
          <p className="text-xs font-bold text-slate-500 mb-2">{BLOCK_LABELS[selected.type]}</p>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => move(selected.id, -1)} aria-label="Move up">
            <ChevronUp size={16} />
          </button>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => move(selected.id, 1)} aria-label="Move down">
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100"
            onClick={() => patchSelected({ hidden: !selected.hidden })}
            aria-label="Hide"
          >
            {selected.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"
            onClick={() => studio.setDraft({ blocks: studio.draft.blocks.filter((b) => b.id !== selected.id) })}
            aria-label="Remove"
          >
            <Trash2 size={16} />
          </button>
          {'title' in selected && (
            <label className="text-xs font-bold text-slate-500">
              Title
              <input
                className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-sm font-medium min-w-[200px]"
                value={selected.title}
                onChange={(e) => patchSelected({ title: e.target.value } as Partial<PageBlock>)}
              />
            </label>
          )}
          {'subtitle' in selected && (
            <label className="text-xs font-bold text-slate-500">
              Subtitle
              <input
                className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-sm font-medium min-w-[220px]"
                value={selected.subtitle || ''}
                onChange={(e) => patchSelected({ subtitle: e.target.value } as Partial<PageBlock>)}
              />
            </label>
          )}
          {'imageSlot' in selected && slots.length > 0 && (
            <label className="text-xs font-bold text-slate-500">
              Picture
              <select
                className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-sm font-medium"
                value={(selected as { imageSlot?: string }).imageSlot || ''}
                onChange={(e) => patchSelected({ imageSlot: e.target.value } as Partial<PageBlock>)}
              >
                <option value="">Gallery slot…</option>
                {slots.map((s) => (
                  <option key={s.slot} value={s.slot}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

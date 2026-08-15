import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { AppNotification, UserRole } from '@/types';
import { armNotificationSound, isSoundOn, playNotificationSound, setSoundOn } from '@/lib/sound';

// Where a notification takes you depends on who you are.
function targetFor(n: AppNotification, role?: UserRole) {
  const isStaff = role === UserRole.ADMIN || role === UserRole.OPERATIONS;
  if (n.relatedEntity === 'invoice' && n.relatedId) return `/app/invoices/${n.relatedId}`;
  if (n.relatedEntity === 'hire_request' && n.relatedId) return `/app/hires/${n.relatedId}`;
  if (n.relatedEntity === 'review') {
    if (isStaff) return '/app/admin/reviews';
    if (role === UserRole.PROFESSIONAL) return '/app/reviews';
    return '/app/hires';
  }
  return undefined;
}

export default function StaffNotificationsBell({ userId, role }: { userId: string; role?: UserRole }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [soundOn, setSoundOnState] = useState(isSoundOn());
  const wrapRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  const load = async () => {
    setItems(await dataService.getNotifications(userId));
  };

  useEffect(() => {
    armNotificationSound();
  }, []);

  useEffect(() => {
    load();
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const incoming: AppNotification = {
            id: String(row.id),
            userId: String(row.user_id),
            type: String(row.type || 'info'),
            title: String(row.title || ''),
            body: String(row.body || ''),
            relatedEntity: (row.related_entity as string) || undefined,
            relatedId: (row.related_id as string) || undefined,
            read: Boolean(row.read),
            createdAt: String(row.created_at || new Date().toISOString()),
          };
          setItems((prev) => (prev.some((n) => n.id === incoming.id) ? prev : [incoming, ...prev]));
          playNotificationSound();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await dataService.markNotificationsRead(userId);
      await load();
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        className="relative p-2 rounded-xl text-slate-400 hover:text-[#660033] hover:bg-slate-50"
        aria-label="Your updates"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#660033] text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 py-2 z-50">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Your updates</p>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {items.slice(0, 12).map((n) => {
              const href = targetFor(n, role);
              const inner = (
                <>
                  <p className="text-sm font-bold text-[#0A0A0A]">{n.title}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </>
              );
              return href ? (
                <Link key={n.id} to={href} className="block px-4 py-2.5 border-t border-slate-50 hover:bg-[#F8FAFB]">
                  {inner}
                </Link>
              ) : (
                <div key={n.id} className="px-4 py-2.5 border-t border-slate-50">
                  {inner}
                </div>
              );
            })}
            {items.length === 0 && <p className="px-4 py-6 text-sm text-slate-400 font-medium">Nothing new yet</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              setSoundOnState(next);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-slate-100 text-xs font-bold text-slate-500 hover:text-[#660033] hover:bg-[#F8FAFB]"
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundOn ? 'Sound is on' : 'Sound is off'}
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MessageSquare, Search, Shield } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService, InboxThread } from '@/services/dataService';
import { UserRole } from '@/types';
import { getStatusStyle, statusLabel } from '@/data/constants';
import { IMAGES } from '@/data/images';
import { Button } from '@/components/ui/Button';

export default function InboxPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const role = user.role === UserRole.PROFESSIONAL ? 'PROFESSIONAL' : 'CLIENT';
    setLoading(true);
    dataService
      .getInboxThreads(user.id, role)
      .then(setThreads)
      .finally(() => setLoading(false));
  }, [user]);

  const isClient = user?.role === UserRole.CLIENT;

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Messages</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Your messages</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Each request has its own chat. Open one to talk about dates, the work, or anything else.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="space-y-3 min-w-0">
          {loading && (
            <div className="bg-white border border-slate-200 rounded-[1.75rem] p-8 text-sm text-slate-400 font-medium">
              One moment…
            </div>
          )}

          {!loading &&
            threads.map(({ hire, lastMessage }) => {
              const counterparty =
                user?.role === UserRole.PROFESSIONAL
                  ? hire.clientName
                  : hire.professionalName || 'We are finding someone…';
              return (
                <Link
                  key={hire.id}
                  to={`/app/hires/${hire.id}`}
                  className="block bg-white border border-slate-200 rounded-[1.75rem] p-5 hover:shadow-md hover:border-[#660033]/20 transition-all"
                >
                  <div className="flex justify-between gap-3 items-start">
                    <div className="min-w-0 space-y-1">
                      <p className="font-bold text-[#0A0A0A] truncate">{counterparty}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {hire.serviceRequested || hire.serviceCategory}
                      </p>
                      <p className="text-sm text-[#615A5C] line-clamp-2 mt-2">
                        {lastMessage?.body || 'No messages yet. Open this to say hello.'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(hire.status)}`}
                    >
                      {statusLabel(hire.status)}
                    </span>
                  </div>
                  {lastMessage && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">
                      {new Date(lastMessage.createdAt).toLocaleString()}
                    </p>
                  )}
                </Link>
              );
            })}

          {!loading && threads.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-[1.75rem] p-10 md:p-12 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#660033]/5 text-[#660033] flex items-center justify-center">
                <MessageSquare size={28} />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-bold text-[#0A0A0A]">No chats yet</h2>
                <p className="text-[#615A5C] font-medium leading-relaxed">
                  {isClient
                    ? 'Once you send a request, your chat with that person and with Birdie shows up here. Every request keeps its own chat, so nothing gets mixed up.'
                    : 'When a family asks for your help, the chat for that job shows up here. Use it for dates and updates. One chat per job.'}
                </p>
              </div>
              {isClient ? (
                <div className="flex flex-wrap gap-3">
                  <Link to="/app">
                    <Button>Find someone to help</Button>
                  </Link>
                  <Link to="/app/hires">
                    <Button variant="secondary">See my requests</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Link to="/app/hires">
                    <Button>See my jobs</Button>
                  </Link>
                  <Link to="/app">
                    <Button variant="secondary">My home page</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-48 border border-slate-200">
            <img src={IMAGES.process} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-5">
            <h2 className="font-bold text-[#0A0A0A]">Good to know</h2>
            <ul className="space-y-4 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <Briefcase className="shrink-0 text-[#660033] mt-0.5" size={18} />
                <span>One chat for each job, so it is easy to find what was said.</span>
              </li>
              <li className="flex gap-3">
                <Shield className="shrink-0 text-[#660033] mt-0.5" size={18} />
                <span>Talk about money and dates here, not outside. It keeps you safe.</span>
              </li>
              <li className="flex gap-3">
                <Search className="shrink-0 text-[#660033] mt-0.5" size={18} />
                <span>
                  {isClient
                    ? 'Need someone new? Send a request first, then you can chat.'
                    : 'New jobs show under My jobs first. Open one to reply in its chat.'}
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-[#F8FAFB] border border-slate-200 rounded-[1.75rem] p-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#660033]">One tip</p>
            <p className="text-sm text-[#615A5C] font-medium leading-relaxed">
              {isClient
                ? 'Open the request itself to chat and see where things have reached, all on one page.'
                : 'Reply quickly while a job is running. It helps us pay you as soon as the job is done.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

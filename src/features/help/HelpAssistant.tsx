import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, Mic, Send, Square, X } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { useImages } from '@/app/SiteMediaProvider';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils';
import { UserRole } from '@/types';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function speechEngine() {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function helpFail(data: { error?: string; reply?: string } | null, err: unknown, fallback: string) {
  if (data?.error && !data.error.includes('non-2xx')) return data.error;
  if (err && typeof err === 'object' && 'context' in err) {
    const ctx = (err as { context?: unknown }).context;
    if (ctx && typeof ctx === 'object' && ctx !== null) {
      const fromCtx = (ctx as { error?: unknown }).error;
      if (typeof fromCtx === 'string' && fromCtx.trim() && !fromCtx.includes('non-2xx')) return fromCtx;
    }
  }
  return errorMessage(err, fallback);
}

async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || '');
      resolve(s.includes(',') ? s.split(',')[1] : s);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function whatsappHref(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('http')) return trimmed;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : trimmed;
}

function isSafePath(href: string) {
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;
  if (/^https:\/\/wa\.me\/\d+/i.test(href)) return true;
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('\\')) return false;
  return true;
}

function HelpBody({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const chunks = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
      {chunks.map((chunk, i) => {
        const m = chunk.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return <span key={i}>{chunk}</span>;
        const [, label, href] = m;
        if (!isSafePath(href)) return <span key={i}>{label}</span>;
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return (
            <a
              key={i}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="underline decoration-white/40 underline-offset-2 font-bold"
            >
              {label}
            </a>
          );
        }
        return (
          <Link key={i} to={href} onClick={onNavigate} className="underline underline-offset-2 font-bold">
            {label}
          </Link>
        );
      })}
    </p>
  );
}

function chipsFor(role: UserRole | null): { label: string; send: string }[] {
  if (role === UserRole.CLIENT) {
    return [
      { label: 'How do I hire?', send: 'How do I hire someone on Birdie?' },
      { label: 'How do I pay?', send: 'How do I pay on Birdie?' },
      { label: 'My requests', send: 'Where do I see my hire requests?' },
      { label: 'Talk to a person', send: 'I need to talk to a person at Birdie.' },
    ];
  }
  if (role === UserRole.PROFESSIONAL) {
    return [
      { label: 'Checks & assessment', send: 'How do the professional checks and assessment work?' },
      { label: 'My wallet', send: 'Where is my wallet and how do I get paid?' },
      { label: 'Talk to a person', send: 'I need to talk to a person at Birdie.' },
    ];
  }
  if (role === UserRole.ADMIN || role === UserRole.OPERATIONS) {
    return [
      { label: 'What can you do?', send: 'What can this public help assistant do?' },
      { label: 'Talk to a person', send: 'I need to talk to a person at Birdie.' },
    ];
  }
  return [
    { label: 'Find help', send: 'I need household help. How do I start?' },
    { label: 'I want to work', send: 'I want to work as a professional on Birdie.' },
    { label: 'Talk to a person', send: 'I need to talk to a person at Birdie.' },
  ];
}

export function HelpAssistant() {
  const { user, settings } = useAuth();
  const images = useImages();
  const location = useLocation();
  const on = settings?.help_assistant_enabled === true;
  const inApp = location.pathname.startsWith('/app');
  const hideHere = location.pathname.startsWith('/app/studio');

  const firstName = user?.firstName || user?.name?.split(/\s+/)[0] || '';
  const welcome = user
    ? `Hi ${firstName}, how can I help you today?`
    : 'Hi — I am Birdie help. I can explain hiring and paying, and send you to the right page. I cannot change bookings or take payments.';

  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([{ role: 'assistant', content: welcome }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const welcomeKey = useRef(welcome);

  const chips = useMemo(() => chipsFor(user?.role ?? null), [user?.role]);

  useEffect(() => {
    if (welcomeKey.current === welcome) return;
    welcomeKey.current = welcome;
    setTurns([{ role: 'assistant', content: welcome }]);
  }, [welcome]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!on || hideHere) return null;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setError(null);
    setDraft('');
    const next: ChatTurn[] = [...turns, { role: 'user', content }];
    setTurns(next);
    setBusy(true);
    try {
      const { data, error: err } = await supabase.functions.invoke('site-help', {
        body: { op: 'chat', messages: next },
      });
      if (data?.reply) {
        setTurns([...next, { role: 'assistant', content: String(data.reply) }]);
        return;
      }
      throw new Error(helpFail(data, err, 'Could not reach Birdie help.'));
    } catch (e) {
      setError(errorMessage(e, 'Could not reach Birdie help.'));
      setTurns([
        ...next,
        {
          role: 'assistant',
          content: 'I could not answer just now. Please use [Contact](/contact).',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const startSpeech = () => {
    const Ctor = speechEngine();
    if (!Ctor) return false;
    const rec = new Ctor();
    rec.lang = 'en-NG';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let said = '';
      for (let i = 0; i < ev.results.length; i++) {
        said += ev.results[i][0].transcript;
      }
      setDraft(said.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
    return true;
  };

  const stopSpeech = () => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  };

  const startFallbackRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: mime });
      if (!blob.size) return;
      setBusy(true);
      setError(null);
      try {
        const audioBase64 = await blobToBase64(blob);
        const { data, error: err } = await supabase.functions.invoke('site-help', {
          body: { op: 'transcribe', audioBase64, mimeType: mime },
        });
        if (data?.text) {
          setDraft((prev) => (prev ? `${prev} ${data.text}` : data.text));
          return;
        }
        throw new Error(helpFail(data, err, 'Could not turn that recording into text.'));
      } catch (e) {
        setError(errorMessage(e, 'Could not turn that recording into text.'));
      } finally {
        setBusy(false);
      }
    };
    mediaRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const toggleMic = async () => {
    if (listening) {
      stopSpeech();
      return;
    }
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    setError(null);
    if (startSpeech()) return;
    try {
      await startFallbackRecord();
    } catch {
      setError('Allow the microphone, or type instead.');
    }
  };

  const fabPos = inApp ? 'bottom-[5.75rem] md:bottom-6 right-4 md:right-6' : 'bottom-5 right-4 md:right-6';
  const wa = settings?.support_whatsapp ? whatsappHref(settings.support_whatsapp) : '';

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed ${fabPos} z-[45] h-14 w-14 rounded-full bg-[#660033] text-white shadow-lg shadow-[#660033]/30 flex items-center justify-center hover:bg-[#2B0116] active:scale-95 transition`}
          aria-label="Open Birdie help"
        >
          <img src={images.markLight} alt="" className="h-8 w-8 object-contain" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[55] md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[min(640px,calc(100vh-3rem))] md:max-h-[640px]">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 md:hidden"
            aria-label="Close help"
            onClick={() => setOpen(false)}
          />
          <section className="absolute inset-0 md:inset-auto md:relative flex flex-col h-full bg-white md:rounded-[1.75rem] md:border md:border-[#E0B5CB]/50 md:shadow-2xl overflow-hidden">
            <header className="flex items-center gap-3 px-4 py-3 bg-[#660033] text-white md:rounded-t-[1.75rem]">
              <img src={images.markLight} alt="" className="h-9 w-9 object-contain" />
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">Birdie help</p>
                <p className="text-xs text-white/80">Information and links only</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center"
                aria-label="Close help"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-[#F8FAFB]">
              {turns.map((t, i) => (
                <div key={`${t.role}-${i}`} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 ${
                      t.role === 'user'
                        ? 'bg-[#660033] text-white rounded-[1.25rem] rounded-br-md [&_a]:text-white'
                        : 'bg-white text-[#0A0A0A] border border-[#E0B5CB]/40 rounded-[1.25rem] rounded-bl-md [&_a]:text-[#660033]'
                    }`}
                  >
                    <HelpBody text={t.content} onNavigate={() => setOpen(false)} />
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E0B5CB]/40 rounded-[1.25rem] rounded-bl-md px-4 py-3 text-[#660033]">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
              {error && <p className="text-xs text-rose-600 px-1">{error}</p>}
            </div>

            <div className="border-t border-[#E0B5CB]/40 bg-white px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] space-y-2">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    disabled={busy}
                    onClick={() => send(c.send)}
                    className="shrink-0 rounded-full border border-[#E0B5CB] bg-white px-3 py-1.5 text-xs font-bold text-[#660033]"
                  >
                    {c.label}
                  </button>
                ))}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-full border border-[#E0B5CB] bg-white px-3 py-1.5 text-xs font-bold text-[#660033]"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
              <form
                className="flex items-center gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(draft);
                }}
              >
                <button
                  type="button"
                  onClick={() => void toggleMic()}
                  disabled={busy}
                  className={`h-11 w-11 rounded-full flex items-center justify-center ${
                    listening || recording ? 'bg-[#660033] text-white' : 'bg-[#F8FAFB] text-[#660033]'
                  }`}
                  aria-label={listening || recording ? 'Stop voice' : 'Speak'}
                >
                  {listening || recording ? <Square size={16} /> : <Mic size={18} />}
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={listening ? 'Listening…' : recording ? 'Recording…' : 'Type a message'}
                  className="flex-1 h-11 rounded-full bg-[#F8FAFB] border border-[#E0B5CB]/50 px-4 text-sm font-medium outline-none focus:border-[#660033]"
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  className="h-11 w-11 rounded-full bg-[#660033] text-white flex items-center justify-center disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

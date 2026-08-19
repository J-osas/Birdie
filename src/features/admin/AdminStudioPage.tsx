import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Mic, Square, Send } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/utils';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

function speechEngine() {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

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

function studioFail(data: { error?: string; reply?: string } | null, err: unknown, fallback: string) {
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

export default function AdminStudioPage() {
  const { user, settings } = useAuth();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const studioOn = settings?.page_studio_enabled === true;
  const hasKey = Boolean(settings?.openai_secret_last4);

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy]);

  if (!isStaff) return <Navigate to="/app" replace />;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setError(null);
    setDraft('');
    const next: ChatTurn[] = [...turns, { role: 'user', content }];
    setTurns(next);
    setBusy(true);
    try {
      const { data, error: err } = await supabase.functions.invoke('page-studio', {
        body: { op: 'chat', messages: next },
      });
      if (data?.reply) {
        setTurns([...next, { role: 'assistant', content: String(data.reply) }]);
        return;
      }
      throw new Error(studioFail(data, err, 'Could not reach the page AI.'));
    } catch (e) {
      setError(errorMessage(e, 'Could not reach the page AI.'));
      setTurns(next);
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
        const { data, error: err } = await supabase.functions.invoke('page-studio', {
          body: { op: 'transcribe', audioBase64, mimeType: mime },
        });
        if (data?.text) {
          setDraft((prev) => (prev ? `${prev} ${data.text}` : data.text));
          return;
        }
        throw new Error(studioFail(data, err, 'Could not turn that recording into text.'));
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
      setError('Microphone access is needed to record.');
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Studio</p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Page AI</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          Ask for layout and copy changes on public pages. It writes a draft only — you still click Publish on the
          page. It cannot change hiring, payments, or login.
        </p>
      </div>

      {!studioOn && (
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-900">
          Page studio is off, so this chat cannot write. Turn it on in{' '}
          <Link to="/app/settings#switches" className="font-bold underline">
            Settings
          </Link>
          . The coded site stays as it is until then.
        </div>
      )}
      {studioOn && !hasKey && (
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-900">
          Visual editing works, but the AI needs an OpenAI key. An admin can paste it under{' '}
          <Link to="/app/settings#openai" className="font-bold underline">
            Settings → Page AI
          </Link>
          .
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Public pages</p>
        <div className="flex flex-wrap gap-2">
          {[
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
            { to: '/story', label: 'Story' },
            { to: '/contact', label: 'Contact' },
          ].map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-[#2B0116] hover:bg-[#F8FAFB]"
            >
              {p.label}
            </Link>
          ))}
        </div>
        <p className="text-sm text-[#615A5C] font-medium">
          Extra pages live at <code className="font-bold">/p/your-slug</code> after you create them here and publish.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Chat</p>
        <div ref={scroller} className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
          {turns.length === 0 && (
            <p className="text-sm font-medium text-[#615A5C]">
              Try: “Shorten the home hero title” or “Add a FAQ about how we check people on About.”
            </p>
          )}
          {turns.map((t, i) => (
            <div
              key={`${t.role}-${i}`}
              className={`rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${
                t.role === 'user' ? 'bg-[#F8FAFB] text-[#0A0A0A] ml-8' : 'bg-[#660033]/5 text-[#2B0116] mr-8'
              }`}
            >
              {t.content}
            </div>
          ))}
          {busy && (
            <p className="flex items-center gap-2 text-sm font-medium text-[#615A5C]">
              <Loader2 className="h-4 w-4 animate-spin" /> Working on a draft…
            </p>
          )}
        </div>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Type, or tap the mic and talk…"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-[#0A0A0A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#660033]/20"
            disabled={busy}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={busy || !draft.trim()}>
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Button
              type="button"
              variant={listening || recording ? 'danger' : 'secondary'}
              onClick={() => void toggleMic()}
              disabled={busy}
            >
              {listening || recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? 'Stop listening' : recording ? 'Stop recording' : 'Mic'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

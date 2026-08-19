import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { HANDBOOK } from './handbook.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type AdminClient = ReturnType<typeof createClient>;
type AiProvider = 'groq' | 'openai';

function cleanSecret(value: unknown): string | null {
  const trimmed = String(value || '')
    .trim()
    .replace(/^["']|["']$/g, '');
  return trimmed.length >= 8 ? trimmed : null;
}

function asProvider(value: unknown): AiProvider {
  return value === 'openai' ? 'openai' : 'groq';
}

function providerConfig(provider: AiProvider) {
  if (provider === 'openai') {
    return {
      envName: 'OPENAI_API_KEY',
      secretName: 'OPENAI_API_KEY',
      baseUrl: 'https://api.openai.com/v1',
      chatModel: 'gpt-4o-mini',
      whisperModel: 'whisper-1',
    };
  }
  return {
    envName: 'GROQ_API_KEY',
    secretName: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1',
    chatModel: 'llama-3.3-70b-versatile',
    whisperModel: 'whisper-large-v3',
  };
}

async function getAiKey(admin: AdminClient, provider: AiProvider): Promise<string | null> {
  const cfg = providerConfig(provider);
  const fromEnv = cleanSecret(Deno.env.get(cfg.envName));
  if (fromEnv) return fromEnv;
  const { data, error } = await admin.rpc('get_app_secret', { p_name: cfg.secretName });
  if (error) {
    console.error('get_app_secret', error.message);
    return null;
  }
  return cleanSecret(data);
}

function firstNameFrom(fullName: string | null | undefined) {
  const part = String(fullName || '')
    .trim()
    .split(/\s+/)[0];
  return part || null;
}

function naira(amount: unknown) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₦10,000';
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

function whatsappUrl(value: unknown) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http')) return trimmed;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

function systemPrompt(live: {
  firstName: string | null;
  role: string;
  hiresOn: boolean;
  regClient: boolean;
  regPro: boolean;
  withdrawalsOn: boolean;
  fee: string;
  commission: string;
  holdDays: string;
  email: string;
  phone: string;
  whatsapp: string;
}) {
  const who = live.firstName
    ? `This visitor is signed in as ${live.firstName} (${live.role}). Greet them by first name if you have not already.`
    : 'This visitor is not signed in. Do not invent a name.';

  const closed: string[] = [];
  if (!live.hiresOn) closed.push('New hires are closed. Hire buttons should send people to Contact, not /hire.');
  if (!live.regClient) closed.push('Family sign-up is closed.');
  if (!live.regPro) closed.push('Professional sign-up is closed.');
  if (!live.withdrawalsOn) closed.push('Withdrawals are closed for now.');

  return `${HANDBOOK}

## Live Birdie facts for this reply (trust these over the handbook numbers)
- Meeting fee today: ${live.fee}
- Service fee Birdie keeps after a job: ${live.commission}%
- Waiting time after a job before paying the professional: ${live.holdDays} day(s)
- Support email: ${live.email || 'use [Contact](/contact)'}
- Support phone: ${live.phone || 'use [Contact](/contact)'}
- WhatsApp: ${live.whatsapp || 'use [Contact](/contact)'}
${closed.length ? `- Closed right now: ${closed.join(' ')}` : '- New hires, sign-up, and withdrawals follow the handbook unless a person says a page looks closed.'}

${who}

Reply in a few short paragraphs or a short list. Include at least one markdown link when you point them somewhere.`;
}

async function transcribe(apiKey: string, audioBase64: string, mimeType: string, baseUrl: string, model: string) {
  if (audioBase64.length > 6_000_000) throw new Error('That recording is too long. Try a shorter one.');
  const raw = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
  const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('mpeg') ? 'mp3' : 'webm';
  const file = new File([bytes], `voice.${ext}`, { type: mimeType || 'audio/webm' });
  const form = new FormData();
  form.append('file', file);
  form.append('model', model);
  form.append('language', 'en');
  const res = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Could not transcribe that recording');
  return String(data.text || '').trim();
}

type ChatMessage = { role: string; content: string };

async function chat(apiKey: string, system: string, history: ChatMessage[], baseUrl: string, model: string) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [{ role: 'system', content: system }, ...history],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = String(data?.error?.message || `AI request failed (${res.status})`);
    if (/api key|incorrect|invalid|unauthorized/i.test(raw)) {
      throw new Error('Help is not ready. Please use Contact or WhatsApp.');
    }
    if (/credits? remaining|quota|billing/i.test(raw)) {
      throw new Error('The paid AI has no credit left. Switch to free Groq in Settings → AI.');
    }
    throw new Error(raw);
  }
  return String(data.choices?.[0]?.message?.content || '').trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: settings, error: settingsError } = await admin
      .from('platform_settings')
      .select(
        'help_assistant_enabled, ai_provider, hires_enabled, withdrawals_enabled, reg_client_enabled, reg_pro_enabled, consultation_fee_ngn, commission_rate, escrow_release_days, support_email, support_phone, support_whatsapp'
      )
      .eq('id', 'global')
      .maybeSingle();
    if (settingsError) throw settingsError;

    const helpOn = settings?.help_assistant_enabled === true;
    const provider = asProvider(settings?.ai_provider);
    const cfg = providerConfig(provider);
    const apiKey = await getAiKey(admin, provider);
    const fallback =
      'I can only send you to a person from here. Open [Contact](/contact) or write to us on WhatsApp.';

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    let firstName: string | null = null;
    let role = 'guest';
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader } },
        });
        const {
          data: { user },
        } = await userClient.auth.getUser();
        if (user) {
          const { data: profile } = await admin
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .maybeSingle();
          firstName = firstNameFrom(profile?.full_name as string | undefined);
          role = String(profile?.role || 'client').toLowerCase();
        }
      } catch {
        firstName = null;
        role = 'guest';
      }
    }

    if (body.op === 'transcribe') {
      if (!helpOn) return json({ error: 'Help is off.', text: '' });
      if (!apiKey) return json({ error: 'Help is not ready. Please use Contact.', text: '' });
      const audio = typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
      const mime = typeof body.mimeType === 'string' ? body.mimeType : 'audio/webm';
      if (!audio) return json({ error: 'No audio', reply: 'No audio', text: '' });
      const text = await transcribe(apiKey, audio, mime, cfg.baseUrl, cfg.whisperModel);
      return json({ text });
    }

    if (!helpOn) {
      return json({
        reply: 'Birdie help is off right now. Please use [Contact](/contact).',
        helpOff: true,
      });
    }
    if (!apiKey) {
      return json({
        reply:
          provider === 'groq'
            ? fallback
            : 'OpenAI is selected but has no key or no credit. Switch to free Groq in Settings → AI, or use [Contact](/contact).',
        needsKey: true,
      });
    }

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const history: ChatMessage[] = incoming
      .filter(
        (m): m is { role: string; content: string } =>
          !!m &&
          typeof m === 'object' &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof (m as { content?: unknown }).content === 'string'
      )
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!history.some((m) => m.role === 'user')) {
      return json({ reply: 'Tell me what you need help with, in a short sentence.' });
    }

    const prompt = systemPrompt({
      firstName,
      role,
      hiresOn: settings?.hires_enabled !== false,
      regClient: settings?.reg_client_enabled !== false,
      regPro: settings?.reg_pro_enabled !== false,
      withdrawalsOn: settings?.withdrawals_enabled !== false,
      fee: naira(settings?.consultation_fee_ngn),
      commission: String(settings?.commission_rate ?? 3.5),
      holdDays: String(settings?.escrow_release_days ?? 3),
      email: String(settings?.support_email || ''),
      phone: String(settings?.support_phone || ''),
      whatsapp: whatsappUrl(settings?.support_whatsapp),
    });

    const reply = (await chat(apiKey, prompt, history, cfg.baseUrl, cfg.chatModel)) || fallback;
    return json({ reply });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not reach Birdie help.';
    console.error('site-help', message);
    return json({
      error: message,
      reply: 'I could not answer just now. Please use [Contact](/contact) or WhatsApp.',
    });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import {
  BLOCK_TYPES,
  emptyBlock,
  isBlockType,
  isCoreSlug,
  isExtraSlug,
  pageBlockSchema,
  parseLayout,
  parseLayoutOrThrow,
  type PageBlock,
  type PageLayoutDoc,
} from './pageSchema.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are Birdie's page studio assistant. You edit marketing layout and words only.

You never change how hiring, payments, login, or dashboards work.
You never invent new block types, fonts, or colours.
You use Birdie tokens: Plus Jakarta Sans, #660033, #2B0116, #E0B5CB, #F8FAFB, #0A0A0A, #615A5C; public width 90vw; existing Button variants; pictures only from the gallery.
Public copy never says "escrow".
You save drafts. A human clicks Publish. You have no publish tool and must not claim a page is live.
You never run SQL, edit React, touch Paystack, wallets, hires, profiles, or product switches.
If asked to change hiring, pay, auth, or settings, refuse and explain you only edit public page drafts.
Reply in plain English: what you changed, which page, and that it is a draft until Publish.

Allowed pages: home, about, story, contact, and extra pages at /p/:slug.
Allowed block types: ${BLOCK_TYPES.join(', ')}.
CTA links must be one of: /hire, /professionals, /register?role=professional, /contact, /story, /about, /blog, /login.`;

const ALLOWED_TOOLS = new Set([
  'get_page',
  'list_pages',
  'save_draft',
  'add_block',
  'update_block',
  'move_block',
  'remove_block',
  'list_gallery',
  'set_block_image',
  'create_page',
]);

const IMAGE_FIELDS = new Set(['imageSlot', 'imageSlotLeft', 'imageSlotRight']);

const RESERVED_EXTRA = new Set([
  'hire',
  'login',
  'register',
  'professionals',
  'blog',
  'terms',
  'app',
  'p',
  'payments',
  'wallet',
  'inbox',
  'account',
  'settings',
  'gallery',
  'studio',
  'cms',
  'analytics',
  'security',
  'clients',
  'find',
  'assessment',
]);

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_page',
      description: 'Read a page draft and whether a published version exists.',
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_pages',
      description: 'List marketing page slugs.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_draft',
      description: 'Replace the full draft JSON for a page. Validated against the block schema. Does not publish.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          layout: { type: 'object', description: 'Object with a blocks array' },
        },
        required: ['slug', 'layout'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_block',
      description: 'Add a palette block to a page draft.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          type: { type: 'string', enum: [...BLOCK_TYPES] },
          afterId: { type: 'string' },
        },
        required: ['slug', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_block',
      description: 'Patch copy or fields on one block. Cannot change type or invent new fields.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          id: { type: 'string' },
          patch: { type: 'object' },
        },
        required: ['slug', 'id', 'patch'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'move_block',
      description: 'Move a block to a new index (0-based).',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          id: { type: 'string' },
          index: { type: 'integer' },
        },
        required: ['slug', 'id', 'index'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_block',
      description: 'Remove a block from a page draft.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          id: { type: 'string' },
        },
        required: ['slug', 'id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_gallery',
      description: 'List existing gallery slots. Pictures must come from these slots.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_block_image',
      description: 'Point a block image field at an existing gallery slot.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          id: { type: 'string' },
          slot: { type: 'string' },
          field: { type: 'string', enum: ['imageSlot', 'imageSlotLeft', 'imageSlotRight'] },
        },
        required: ['slug', 'id', 'slot'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_page',
      description: 'Create an extra marketing page served at /p/:slug.',
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
    },
  },
];

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
    chatModel: 'openai/gpt-oss-120b',
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

function asSlug(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function loadDraft(admin: AdminClient, slug: string): Promise<{ draft: PageLayoutDoc; published: boolean }> {
  const { data, error } = await admin.from('page_layouts').select('draft, published').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`No page named ${slug}`);
  return { draft: parseLayout(data.draft), published: Boolean(data.published) };
}

async function writeDraft(admin: AdminClient, slug: string, layout: PageLayoutDoc, userId: string) {
  const checked = parseLayoutOrThrow(layout);
  const { data: existing } = await admin.from('page_layouts').select('slug').eq('slug', slug).maybeSingle();
  const row = {
    slug,
    draft: checked,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  if (existing) {
    const { error } = await admin.from('page_layouts').update(row).eq('slug', slug);
    if (error) throw error;
  } else {
    const { error } = await admin.from('page_layouts').insert({ ...row, published: null });
    if (error) throw error;
  }
  return checked;
}

async function runTool(
  admin: AdminClient,
  userId: string,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (!ALLOWED_TOOLS.has(name)) throw new Error('That tool is not allowed');

  switch (name) {
    case 'list_pages': {
      const { data, error } = await admin
        .from('page_layouts')
        .select('slug, updated_at, published')
        .order('slug');
      if (error) throw error;
      return (data || []).map((row) => ({
        slug: row.slug,
        path: isCoreSlug(String(row.slug))
          ? row.slug === 'home'
            ? '/'
            : `/${row.slug}`
          : `/p/${row.slug}`,
        hasPublished: Boolean(row.published),
        updatedAt: row.updated_at,
      }));
    }
    case 'get_page': {
      const slug = asSlug(args.slug);
      if (!slug) throw new Error('slug is required');
      const page = await loadDraft(admin, slug);
      return {
        slug,
        path: isCoreSlug(slug) ? (slug === 'home' ? '/' : `/${slug}`) : `/p/${slug}`,
        draft: page.draft,
        hasPublished: page.published,
        note: 'This is the draft. A person must click Publish for visitors to see it.',
      };
    }
    case 'save_draft': {
      const slug = asSlug(args.slug);
      if (!slug) throw new Error('slug is required');
      const layout = parseLayoutOrThrow(args.layout);
      await writeDraft(admin, slug, layout, userId);
      return { slug, blockCount: layout.blocks.length, saved: 'draft' };
    }
    case 'add_block': {
      const slug = asSlug(args.slug);
      const type = typeof args.type === 'string' ? args.type : '';
      if (!isBlockType(type)) throw new Error('Unknown block type');
      const page = await loadDraft(admin, slug);
      const next = emptyBlock(type);
      const afterId = typeof args.afterId === 'string' ? args.afterId : '';
      const at = afterId ? page.draft.blocks.findIndex((b) => b.id === afterId) : -1;
      if (at >= 0) page.draft.blocks.splice(at + 1, 0, next);
      else page.draft.blocks.push(next);
      await writeDraft(admin, slug, page.draft, userId);
      return { slug, added: next, saved: 'draft' };
    }
    case 'update_block': {
      const slug = asSlug(args.slug);
      const id = typeof args.id === 'string' ? args.id : '';
      const patch = args.patch && typeof args.patch === 'object' ? (args.patch as Record<string, unknown>) : {};
      const page = await loadDraft(admin, slug);
      const idx = page.draft.blocks.findIndex((b) => b.id === id);
      if (idx < 0) throw new Error('Block not found');
      const current = page.draft.blocks[idx];
      const merged = { ...current, ...patch, id: current.id, type: current.type };
      const parsed = pageBlockSchema.safeParse(merged);
      if (!parsed.success) {
        throw new Error(
          parsed.error.issues
            .slice(0, 6)
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('; ')
        );
      }
      page.draft.blocks[idx] = parsed.data;
      await writeDraft(admin, slug, page.draft, userId);
      return { slug, block: parsed.data, saved: 'draft' };
    }
    case 'move_block': {
      const slug = asSlug(args.slug);
      const id = typeof args.id === 'string' ? args.id : '';
      const index = typeof args.index === 'number' ? Math.floor(args.index) : -1;
      const page = await loadDraft(admin, slug);
      const from = page.draft.blocks.findIndex((b) => b.id === id);
      if (from < 0) throw new Error('Block not found');
      const [block] = page.draft.blocks.splice(from, 1);
      const to = Math.max(0, Math.min(index, page.draft.blocks.length));
      page.draft.blocks.splice(to, 0, block);
      await writeDraft(admin, slug, page.draft, userId);
      return { slug, id, index: to, saved: 'draft' };
    }
    case 'remove_block': {
      const slug = asSlug(args.slug);
      const id = typeof args.id === 'string' ? args.id : '';
      const page = await loadDraft(admin, slug);
      page.draft.blocks = page.draft.blocks.filter((b) => b.id !== id);
      await writeDraft(admin, slug, page.draft, userId);
      return { slug, removed: id, saved: 'draft' };
    }
    case 'list_gallery': {
      const { data, error } = await admin
        .from('media_slots')
        .select('slot, label, group_name')
        .order('group_name')
        .order('label');
      if (error) throw error;
      return data || [];
    }
    case 'set_block_image': {
      const slug = asSlug(args.slug);
      const id = typeof args.id === 'string' ? args.id : '';
      const slot = typeof args.slot === 'string' ? args.slot.trim() : '';
      const field = typeof args.field === 'string' && IMAGE_FIELDS.has(args.field) ? args.field : 'imageSlot';
      if (!slot) throw new Error('slot is required');
      const { data: slotRow } = await admin.from('media_slots').select('slot').eq('slot', slot).maybeSingle();
      if (!slotRow) throw new Error('That gallery slot does not exist');
      const page = await loadDraft(admin, slug);
      const idx = page.draft.blocks.findIndex((b) => b.id === id);
      if (idx < 0) throw new Error('Block not found');
      const merged = { ...page.draft.blocks[idx], [field]: slot } as PageBlock;
      const parsed = pageBlockSchema.safeParse(merged);
      if (!parsed.success) throw new Error('That block cannot take that image field');
      page.draft.blocks[idx] = parsed.data;
      await writeDraft(admin, slug, page.draft, userId);
      return { slug, id, field, slot, saved: 'draft' };
    }
    case 'create_page': {
      const slug = asSlug(args.slug);
      if (!isExtraSlug(slug) || RESERVED_EXTRA.has(slug)) {
        throw new Error('Use a short lowercase slug (letters, numbers, hyphens). Core routes are reserved.');
      }
      const { data: existing } = await admin.from('page_layouts').select('slug').eq('slug', slug).maybeSingle();
      if (existing) return { slug, path: `/p/${slug}`, already: true };
      await admin.from('page_layouts').insert({
        slug,
        draft: { blocks: [] },
        published: null,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      });
      return { slug, path: `/p/${slug}`, saved: 'draft', note: 'Empty draft. Add blocks, then a person clicks Publish.' };
    }
    default:
      throw new Error('That tool is not allowed');
  }
}

async function transcribe(apiKey: string, audioBase64: string, mimeType: string, baseUrl: string, model: string) {
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

type ChatMessage = { role: string; content?: string | null; tool_calls?: unknown; tool_call_id?: string };

async function chat(
  apiKey: string,
  history: ChatMessage[],
  admin: AdminClient,
  userId: string,
  baseUrl: string,
  model: string
) {
  const messages: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];

  for (let round = 0; round < 8; round++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const raw = String(data?.error?.message || `AI request failed (${res.status})`);
      if (/api key|incorrect|invalid|unauthorized/i.test(raw)) {
        throw new Error('The AI key was rejected. Paste a current secret in Settings → AI.');
      }
      if (/credits? remaining|quota|billing/i.test(raw)) {
        throw new Error('The paid AI has no credit left. Switch to free Groq in Settings → AI.');
      }
      throw new Error(raw);
    }
    const msg = data.choices?.[0]?.message as {
      content?: string | null;
      tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
    };
    if (!msg) throw new Error('Empty model reply');
    messages.push(msg as ChatMessage);

    if (!msg.tool_calls?.length) {
      return String(msg.content || 'Done. Changes are a draft until someone clicks Publish.').trim();
    }

    for (const call of msg.tool_calls) {
      const name = call.function?.name || '';
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function?.arguments || '{}');
      } catch {
        args = {};
      }
      let result: unknown;
      try {
        result = await runTool(admin, userId, name, args);
      } catch (e) {
        result = { error: e instanceof Error ? e.message : 'Tool failed' };
      }
      await admin.from('admin_audit_log').insert({
        actor_id: userId,
        action: `studio.${name}`,
        entity_type: 'page_layouts',
        entity_id: typeof args.slug === 'string' ? args.slug : null,
        meta: { tool: name, args: { slug: args.slug, type: args.type, id: args.id } },
      });
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return 'I made draft changes. Open the public page and click Publish when it looks right.';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const role = profile?.role as string | undefined;
    if (role !== 'admin' && role !== 'operations') return json({ error: 'Staff only' }, 403);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { data: settings } = await admin
      .from('platform_settings')
      .select('page_studio_enabled, ai_provider')
      .eq('id', 'global')
      .maybeSingle();
    const studioOn = settings?.page_studio_enabled === true;
    const provider = asProvider(settings?.ai_provider);
    const cfg = providerConfig(provider);
    const apiKey = await getAiKey(admin, provider);

    if (body.op === 'transcribe') {
      if (!apiKey) {
        return json({ error: 'Add an AI key in Settings before recording.' });
      }
      const audio = typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
      const mime = typeof body.mimeType === 'string' ? body.mimeType : 'audio/webm';
      if (!audio) throw new Error('No audio');
      const text = await transcribe(apiKey, audio, mime, cfg.baseUrl, cfg.whisperModel);
      return json({ text });
    }

    if (!studioOn) {
      return json({
        reply: 'Page studio is off. Turn it on in Settings if you want me to change public page drafts.',
        studioOff: true,
      });
    }
    if (!apiKey) {
      return json({
        reply:
          provider === 'groq'
            ? 'Add a Groq key in Settings (AI) before I can write drafts.'
            : 'Add an OpenAI key in Settings (AI), or switch to free Groq.',
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
          typeof m.content === 'string'
      )
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

    if (!history.length) throw new Error('Say what you would like to change on a public page.');

    const reply = await chat(apiKey, history, admin, user.id, cfg.baseUrl, cfg.chatModel);
    return json({ reply });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not talk to the page AI.';
    console.error('page-studio', message);
    return json({ error: message, reply: message });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function last4(value?: string | null) {
  const v = (value || '').trim();
  if (v.length < 4) return null;
  return v.slice(-4);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function asProvider(value: unknown): 'groq' | 'openai' {
  return value === 'openai' ? 'openai' : 'groq';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' });

    const admin = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' });

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return json({ error: 'Only an admin can manage the AI keys' });

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { data: settings } = await admin
      .from('platform_settings')
      .select('ai_provider, openai_secret_last4, groq_secret_last4')
      .eq('id', 'global')
      .maybeSingle();

    if (!body.op || body.op === 'get') {
      return json({
        provider: asProvider(settings?.ai_provider),
        openaiLast4: settings?.openai_secret_last4 || null,
        groqLast4: settings?.groq_secret_last4 || null,
      });
    }

    if (body.op === 'set_provider') {
      const provider = asProvider(body.provider);
      const { error } = await admin
        .from('platform_settings')
        .update({ ai_provider: provider, updated_at: new Date().toISOString() })
        .eq('id', 'global');
      if (error) throw error;
      await admin.from('admin_audit_log').insert({
        actor_id: user.id,
        action: 'settings.updated',
        entity_type: 'platform_settings',
        entity_id: 'global',
        meta: { section: 'ai', provider },
      });
      return json({ provider });
    }

    if (body.op !== 'save') return json({ error: 'Unknown operation' });

    const kind = body.kind === 'openai' ? 'openai' : 'groq';
    const secret = typeof body.secret === 'string' ? body.secret.trim() : '';
    if (!secret) return json({ error: 'Paste a key to save.' });
    if (secret.length < 20) return json({ error: 'That key looks too short.' });
    if (kind === 'openai' && !secret.startsWith('sk-')) {
      return json({ error: 'OpenAI keys start with sk-.' });
    }
    if (kind === 'groq' && !secret.startsWith('gsk_')) {
      return json({ error: 'Groq keys start with gsk_.' });
    }

    const p_name = kind === 'openai' ? 'OPENAI_API_KEY' : 'GROQ_API_KEY';
    const last4Col = kind === 'openai' ? 'openai_secret_last4' : 'groq_secret_last4';
    const { error } = await admin.rpc('upsert_app_secret', { p_name, p_value: secret });
    if (error) throw error;

    const next4 = last4(secret);
    const { error: updateErr } = await admin
      .from('platform_settings')
      .update({ [last4Col]: next4, updated_at: new Date().toISOString() })
      .eq('id', 'global');
    if (updateErr) throw updateErr;

    await admin.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'settings.updated',
      entity_type: 'platform_settings',
      entity_id: 'global',
      meta: { section: 'ai', secretUpdated: kind, last4: next4 },
    });

    return json({ kind, last4: next4, saved: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Error' });
  }
});

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const admin = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') throw new Error('Only an admin can manage the page AI key');

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { data: settings } = await admin
      .from('platform_settings')
      .select('openai_secret_last4')
      .eq('id', 'global')
      .maybeSingle();

    if (!body.op || body.op === 'get') {
      return json({ last4: settings?.openai_secret_last4 || null, saved: Boolean(settings?.openai_secret_last4) });
    }

    if (body.op !== 'save') throw new Error('Unknown operation');

    const secret = typeof body.secret === 'string' ? body.secret.trim() : '';
    if (!secret) throw new Error('Paste a key to save');
    if (!secret.startsWith('sk-')) throw new Error('OpenAI keys start with sk-');
    if (secret.length < 20) throw new Error('That key looks too short');

    const { error } = await admin.rpc('upsert_app_secret', {
      p_name: 'OPENAI_API_KEY',
      p_value: secret,
    });
    if (error) throw error;

    const next4 = last4(secret);
    const { error: updateErr } = await admin
      .from('platform_settings')
      .update({ openai_secret_last4: next4, updated_at: new Date().toISOString() })
      .eq('id', 'global');
    if (updateErr) throw updateErr;

    await admin.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'settings.updated',
      entity_type: 'platform_settings',
      entity_id: 'global',
      meta: { section: 'openai', secretUpdated: true, last4: next4 },
    });

    return json({ last4: next4, saved: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Error' }, 400);
  }
});

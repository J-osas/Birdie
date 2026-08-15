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
    if (profile?.role !== 'admin') throw new Error('Only an admin can manage card payments');

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const webhookUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/paystack-webhook`;

    const { data: settings } = await admin.from('platform_settings').select('*').eq('id', 'global').maybeSingle();

    const snapshot = () => ({
      mode: settings?.paystack_mode === 'live' ? 'live' : 'test',
      publicKeyTest: settings?.paystack_public_key_test || '',
      publicKeyLive: settings?.paystack_public_key_live || '',
      secretLast4Test: settings?.paystack_secret_last4_test || null,
      secretLast4Live: settings?.paystack_secret_last4_live || null,
      webhookUrl,
    });

    if (!body.op || body.op === 'get') {
      return json(snapshot());
    }

    const next: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.mode === 'test' || body.mode === 'live') next.paystack_mode = body.mode;
    if (typeof body.publicKeyTest === 'string') next.paystack_public_key_test = body.publicKeyTest.trim() || null;
    if (typeof body.publicKeyLive === 'string') next.paystack_public_key_live = body.publicKeyLive.trim() || null;

    const secretTest = typeof body.secretKeyTest === 'string' ? body.secretKeyTest.trim() : '';
    const secretLive = typeof body.secretKeyLive === 'string' ? body.secretKeyLive.trim() : '';

    if (secretTest) {
      if (!secretTest.startsWith('sk_')) throw new Error('Test secret should start with sk_');
      const { error } = await admin.rpc('upsert_app_secret', {
        p_name: 'PAYSTACK_SECRET_KEY_TEST',
        p_value: secretTest,
      });
      if (error) throw error;
      next.paystack_secret_last4_test = last4(secretTest);
    }
    if (secretLive) {
      if (!secretLive.startsWith('sk_')) throw new Error('Live secret should start with sk_');
      const { error } = await admin.rpc('upsert_app_secret', {
        p_name: 'PAYSTACK_SECRET_KEY_LIVE',
        p_value: secretLive,
      });
      if (error) throw error;
      next.paystack_secret_last4_live = last4(secretLive);
    }

    const { error: updateErr } = await admin.from('platform_settings').update(next).eq('id', 'global');
    if (updateErr) throw updateErr;

    const { data: fresh } = await admin.from('platform_settings').select('*').eq('id', 'global').maybeSingle();
    const saved = {
      mode: fresh?.paystack_mode === 'live' ? 'live' : 'test',
      publicKeyTest: fresh?.paystack_public_key_test || '',
      publicKeyLive: fresh?.paystack_public_key_live || '',
      secretLast4Test: fresh?.paystack_secret_last4_test || null,
      secretLast4Live: fresh?.paystack_secret_last4_live || null,
      webhookUrl,
    };

    await admin.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'settings.updated',
      entity_type: 'platform_settings',
      entity_id: 'global',
      meta: { section: 'paystack', mode: saved.mode, secretTestUpdated: Boolean(secretTest), secretLiveUpdated: Boolean(secretLive) },
    });

    return json(saved);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Error' }, 400);
  }
});

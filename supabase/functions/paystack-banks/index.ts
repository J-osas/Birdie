import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getPaystackSecret } from '../_shared/getSecret.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const paystackSecret = await getPaystackSecret(admin);
    if (!paystackSecret) throw new Error('PAYSTACK_SECRET_KEY missing');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const res = await fetch('https://api.paystack.co/bank?currency=NGN&country=nigeria', {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message || 'Could not load banks');
    const banks = (json.data || []).map((b: { name: string; code: string }) => ({
      name: b.name,
      code: b.code,
    }));
    return new Response(JSON.stringify({ banks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

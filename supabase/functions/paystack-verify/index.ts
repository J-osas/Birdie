import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { applyChargeSuccess } from './applyCharge.ts';
import { getPaystackSecret } from '../_shared/getSecret.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);
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

    const body = await req.json();
    const reference = String(body.reference || '');
    if (!reference) throw new Error('Missing reference');

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message || 'Verify failed');

    const paid = String(json.data?.status || '') === 'success';
    const { data: payment } = await admin
      .from('payments')
      .select('*')
      .eq('provider_reference', reference)
      .maybeSingle();

    if (!payment) throw new Error('Payment not found');
    if (payment.user_id !== user.id) {
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (!profile || !['admin', 'operations'].includes(profile.role)) throw new Error('Forbidden');
    }

    if (paid) await applyChargeSuccess(admin, payment, reference);

    return new Response(
      JSON.stringify({
        status: json.data?.status,
        paid,
        hireRequestId: payment.hire_request_id,
        paymentType: payment.payment_type,
        reference,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

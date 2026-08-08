import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const hireRequestId = body.hireRequestId as string;
    const paymentType = body.paymentType as 'consultation' | 'escrow';

    const { data: hire, error: hireErr } = await admin
      .from('hire_requests')
      .select('*')
      .eq('id', hireRequestId)
      .single();
    if (hireErr || !hire) throw new Error('Hire request not found');
    if (hire.client_id !== user.id) {
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (!profile || !['admin', 'operations'].includes(profile.role)) throw new Error('Forbidden');
    }

    const { data: settings } = await admin.from('platform_settings').select('*').eq('id', 'global').maybeSingle();
    let amount = Number(body.amount || 0);
    if (paymentType === 'consultation') {
      amount = Number(settings?.consultation_fee_ngn || 10000);
    } else if (!amount) {
      amount = Number(hire.escrow_amount || 0);
    }
    if (!amount || amount <= 0) throw new Error('Invalid amount');

    const reference = `birdie_${paymentType}_${hireRequestId}_${Date.now()}`;
    const amountKobo = Math.round(amount * 100);

    await admin.from('payments').insert({
      user_id: hire.client_id,
      hire_request_id: hireRequestId,
      payment_type: paymentType,
      amount,
      status: 'initiated',
      provider: 'paystack',
      provider_reference: reference,
    });

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: hire.client_email || user.email,
        amount: amountKobo,
        reference,
        currency: 'NGN',
        metadata: { hireRequestId, paymentType },
        callback_url: body.callbackUrl || undefined,
      }),
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message || 'Paystack init failed');

    return new Response(
      JSON.stringify({
        authorization_url: json.data.authorization_url,
        reference: json.data.reference,
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

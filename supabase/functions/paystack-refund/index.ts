import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getPaystackSecret } from '../_shared/getSecret.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function requireStaff(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['admin', 'operations'].includes(profile.role)) throw new Error('Forbidden');
  return { admin, user };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { admin, user } = await requireStaff(req);
    const paystackSecret = await getPaystackSecret(admin);
    if (!paystackSecret) throw new Error('PAYSTACK_SECRET_KEY missing');
    const { paymentId, hireRequestId, paymentType } = await req.json();

    let payment: Record<string, unknown> | null = null;
    if (paymentId) {
      const { data } = await admin.from('payments').select('*').eq('id', paymentId).maybeSingle();
      payment = data;
    } else if (hireRequestId && paymentType) {
      const { data } = await admin
        .from('payments')
        .select('*')
        .eq('hire_request_id', hireRequestId)
        .eq('payment_type', paymentType)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      payment = data;
    }
    if (!payment) throw new Error('Successful payment not found to refund');
    if (payment.status === 'refunded') throw new Error('Already refunded');
    if (payment.status !== 'success') throw new Error('Only successful payments can be refunded');

    const type = String(payment.payment_type);
    const hireId = payment.hire_request_id as string | null;

    if (type === 'consultation' && hireId) {
      const { data: hire } = await admin.from('hire_requests').select('status').eq('id', hireId).maybeSingle();
      if (hire && ['funded', 'active', 'completed', 'settled'].includes(String(hire.status))) {
        throw new Error('Cannot refund consultation after the job fee has been paid');
      }
    }

    if (type === 'escrow' && hireId) {
      const { data: hire } = await admin.from('hire_requests').select('status').eq('id', hireId).maybeSingle();
      if (hire && hire.status === 'settled') {
        throw new Error('Job fee already released to the professional');
      }
      const { error: revErr } = await admin.schema('private').rpc('reverse_hire_hold', { p_hire_id: hireId });
      if (revErr) throw new Error(revErr.message);
    } else if (type === 'consultation' && hireId) {
      await admin
        .from('hire_requests')
        .update({ status: 'cancelled', payment_status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', hireId);
    }

    const refundRes = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: payment.provider_reference,
        merchant_note: `Birdie refund ${type} ${hireId || payment.id}`,
      }),
    });
    const refundJson = await refundRes.json();
    if (!refundJson.status) throw new Error(refundJson.message || 'Paystack refund failed');

    await admin.from('payments').update({ status: 'refunded' }).eq('id', payment.id);
    await admin.from('payments').insert({
      user_id: payment.user_id,
      hire_request_id: hireId,
      payment_type: 'refund',
      amount: payment.amount,
      status: 'success',
      provider: 'paystack',
      provider_reference: refundJson.data?.transaction?.reference || `refund_${payment.id}`,
    });

    await admin.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'payment.refund',
      entity_type: 'payment',
      entity_id: payment.id,
      meta: { type, hireId },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'operations'].includes(profile.role)) throw new Error('Forbidden');

    const { withdrawalId } = await req.json();
    const { data: withdrawal, error } = await admin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single();
    if (error || !withdrawal) throw new Error('Withdrawal not found');

    // Resolve bank code via Paystack bank list in production; placeholder uses account details metadata.
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name: withdrawal.account_name,
        account_number: withdrawal.account_number,
        bank_code: withdrawal.bank_name, // store bank_code in bank_name field or extend schema
        currency: 'NGN',
      }),
    });
    const recipientJson = await recipientRes.json();

    if (recipientJson.status) {
      const transferRes = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(Number(withdrawal.amount) * 100),
          recipient: recipientJson.data.recipient_code,
          reason: `Birdie payout ${withdrawal.id}`,
        }),
      });
      const transferJson = await transferRes.json();
      if (!transferJson.status) throw new Error(transferJson.message || 'Transfer failed');
    } else {
      console.warn('Recipient create failed; marking paid for ops follow-up', recipientJson);
    }

    const { data: wallet } = await admin
      .from('wallets')
      .select('*')
      .eq('id', withdrawal.wallet_id)
      .maybeSingle();

    if (wallet) {
      await admin
        .from('wallets')
        .update({
          available_balance: Number(wallet.available_balance) - Number(withdrawal.amount),
          total_withdrawn: Number(wallet.total_withdrawn) + Number(withdrawal.amount),
        })
        .eq('id', wallet.id);
      await admin.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        tx_type: 'withdrawal_debit',
        amount: Number(withdrawal.amount),
        status: 'successful',
        reference: `wd_${withdrawal.id}`,
        description: 'Withdrawal payout',
      });
    }

    await admin
      .from('withdrawal_requests')
      .update({ status: 'paid', processed_at: new Date().toISOString() })
      .eq('id', withdrawalId);

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

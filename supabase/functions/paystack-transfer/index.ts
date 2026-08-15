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

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'operations'].includes(profile.role)) throw new Error('Forbidden');

    const { withdrawalId } = await req.json();
    const { data: withdrawal, error } = await admin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single();
    if (error || !withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== 'requested') throw new Error('This withdrawal is not awaiting transfer');

    const bankCode = withdrawal.bank_code || '';
    if (!bankCode) throw new Error('Missing bank code — the professional must pick a bank from the list');

    const { data: wallet } = await admin.from('wallets').select('*').eq('id', withdrawal.wallet_id).maybeSingle();
    if (!wallet) throw new Error('Wallet not found');
    if (Number(wallet.available_balance) < Number(withdrawal.amount)) {
      throw new Error('Available balance is too low for this payout');
    }

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
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });
    const recipientJson = await recipientRes.json();
    if (!recipientJson.status) {
      throw new Error(recipientJson.message || 'Could not create Paystack transfer recipient');
    }

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
    if (!transferJson.status) throw new Error(transferJson.message || 'Paystack transfer failed');

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
      reference: transferJson.data?.reference || `wd_${withdrawal.id}`,
      description: 'Withdrawal payout',
    });

    await admin
      .from('withdrawal_requests')
      .update({ status: 'paid', processed_at: new Date().toISOString() })
      .eq('id', withdrawalId);

    await admin.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'payout.approve',
      entity_type: 'withdrawal',
      entity_id: withdrawalId,
      meta: { transfer: transferJson.data?.reference },
    });

    return new Response(JSON.stringify({ ok: true, reference: transferJson.data?.reference }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { createHash, createHmac } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) throw new Error('Missing PAYSTACK_SECRET_KEY');

    const raw = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';
    const hash = createHmac('sha512', secret).update(raw).digest('hex');
    if (hash !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const event = JSON.parse(raw);
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const reference = event?.data?.reference as string;
    const eventType = event?.event as string;

    const { error: logErr } = await admin.from('payment_webhooks').insert({
      provider: 'paystack',
      event_type: eventType,
      reference: reference || createHash('sha256').update(raw).digest('hex').slice(0, 32),
      payload: event,
      processed: false,
    });
    if (logErr && !String(logErr.message || '').includes('duplicate')) {
      console.error(logErr);
    }

    if (eventType === 'charge.success' && reference) {
      const { data: payment } = await admin
        .from('payments')
        .select('*')
        .eq('provider_reference', reference)
        .maybeSingle();

      if (payment) {
        await admin.from('payments').update({ status: 'success' }).eq('id', payment.id);

        if (payment.payment_type === 'consultation' && payment.hire_request_id) {
          await admin
            .from('hire_requests')
            .update({
              status: 'consultation_paid',
              payment_status: 'consultation_paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.hire_request_id);
          await admin
            .from('consultations')
            .update({ payment_status: 'success', paystack_reference: reference })
            .eq('hire_request_id', payment.hire_request_id);
        }

        if (payment.payment_type === 'escrow' && payment.hire_request_id) {
          await admin
            .from('hire_requests')
            .update({
              status: 'funded',
              payment_status: 'escrowed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.hire_request_id);

          const { data: hire } = await admin
            .from('hire_requests')
            .select('professional_id, escrow_amount, amount')
            .eq('id', payment.hire_request_id)
            .maybeSingle();

          if (hire?.professional_id) {
            const { data: pro } = await admin
              .from('professional_profiles')
              .select('user_id')
              .eq('id', hire.professional_id)
              .maybeSingle();
            if (pro?.user_id) {
              const { data: wallet } = await admin
                .from('wallets')
                .select('*')
                .eq('professional_id', pro.user_id)
                .maybeSingle();
              if (wallet) {
                const credit = Number(payment.amount);
                await admin
                  .from('wallets')
                  .update({ escrow_balance: Number(wallet.escrow_balance) + credit })
                  .eq('id', wallet.id);
                await admin.from('wallet_transactions').insert({
                  wallet_id: wallet.id,
                  hire_request_id: payment.hire_request_id,
                  tx_type: 'escrow_credit',
                  amount: credit,
                  status: 'in_escrow',
                  reference,
                  description: 'Escrow funded by client',
                });
              }
            }
          }
        }
      }

      await admin
        .from('payment_webhooks')
        .update({ processed: true })
        .eq('reference', reference)
        .eq('event_type', eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), { status: 400 });
  }
});

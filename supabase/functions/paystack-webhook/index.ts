import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { createHash, createHmac } from 'node:crypto';
import { applyChargeFailed, applyChargeSuccess } from './applyCharge.ts';
import { getAppSecret, listPaystackSecrets } from '../_shared/getSecret.ts';

Deno.serve(async (req) => {
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const secrets = await listPaystackSecrets(admin);
    if (!secrets.length) throw new Error('Missing PAYSTACK_SECRET_KEY');

    const raw = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';
    const valid = secrets.some((secret) => createHmac('sha512', secret).update(raw).digest('hex') === signature);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const event = JSON.parse(raw);
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

    if (reference && (eventType === 'charge.success' || eventType === 'charge.failed')) {
      const { data: payment } = await admin
        .from('payments')
        .select('*')
        .eq('provider_reference', reference)
        .maybeSingle();

      if (payment) {
        if (eventType === 'charge.success') {
          await applyChargeSuccess(admin, payment, reference);
        } else {
          await applyChargeFailed(admin, payment);
          const { data: hire } = payment.hire_request_id
            ? await admin
                .from('hire_requests')
                .select('reference_code, client_email, client_name')
                .eq('id', payment.hire_request_id)
                .maybeSingle()
            : { data: null };
          const site = (await getAppSecret(admin, 'SITE_URL')) || 'https://birdie-alpha.vercel.app';
          const retryUrl = `${site}/app/payments`;
          const amount = `₦${Number(payment.amount || 0).toLocaleString('en-NG')}`;
          const refCode = hire?.reference_code || reference;
          await admin.from('notifications').insert({
            user_id: payment.user_id,
            type: 'payment',
            title: 'Payment did not go through',
            body: `Your ${payment.payment_type} payment of ${amount} for ${refCode} failed. Open Payments to try again.`,
            related_entity: 'hire_request',
            related_id: payment.hire_request_id,
          });
          try {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                templateSlug: 'payment_failed',
                toEmail: hire?.client_email,
                userId: payment.user_id,
                variables: { amount, reference: refCode, retry_url: retryUrl },
                relatedEvent: 'charge.failed',
              }),
            });
          } catch (mailErr) {
            console.error('Failed-charge email skipped', mailErr);
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

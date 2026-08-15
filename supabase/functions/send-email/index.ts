import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const templateSlug = String(body.templateSlug || '');
    let toEmail = String(body.toEmail || '');
    const userId = body.userId as string | undefined;
    const variables = (body.variables || {}) as Record<string, string>;
    const relatedEvent = String(body.relatedEvent || templateSlug);

    if (!toEmail && userId) {
      const { data: profile } = await admin.from('profiles').select('email').eq('id', userId).maybeSingle();
      toEmail = profile?.email || '';
    }
    if (!toEmail) throw new Error('No recipient email');

    const { data: template } = await admin
      .from('communication_templates')
      .select('*')
      .eq('slug', templateSlug)
      .maybeSingle();

    let subject = template?.subject || 'Birdie';
    let text = template?.body || '';
    for (const [k, v] of Object.entries(variables)) {
      const token = `{{${k}}}`;
      subject = subject.split(token).join(v);
      text = text.split(token).join(v);
    }

    const { data: settings } = await admin.from('platform_settings').select('email_notifications_enabled').eq('id', 'global').maybeSingle();
    const emailsOn = settings?.email_notifications_enabled !== false;

    let status = 'SENT';
    let error: string | null = null;
    if (!emailsOn) {
      status = 'SKIPPED';
      error = 'Emails are turned off in Settings';
    } else if (!resendKey) {
      status = 'SKIPPED';
      error = 'RESEND_API_KEY missing';
    } else {
      const send = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM') || 'Birdie <hello@birdie.ng>',
          to: [toEmail],
          subject,
          text,
        }),
      });
      if (!send.ok) {
        const errBody = await send.text();
        status = 'FAILED';
        error = errBody.slice(0, 500);
      }
    }

    await admin.from('communication_logs').insert({
      to_email: toEmail,
      recipient_role: 'client',
      subject,
      template_slug: templateSlug,
      status,
      related_event: relatedEvent,
      error,
    });

    if (status === 'FAILED') throw new Error(error || 'Email failed');
    return new Response(JSON.stringify({ ok: true, status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

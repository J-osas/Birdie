-- Plain-English email templates, plus a bill-sent template for later.

update public.communication_templates
set
  name = 'Payment did not go through',
  subject = 'Birdie: your payment did not go through',
  body = 'Hello,' || chr(10) || chr(10) ||
    'Your Birdie payment of {{amount}} for {{reference}} did not go through.' || chr(10) || chr(10) ||
    'Nothing has been marked as paid. You can try again here: {{retry_url}}' || chr(10) || chr(10) ||
    'If you need help, send us that reference number.' || chr(10) || chr(10) ||
    '— Birdie',
  variables = array['amount', 'reference', 'retry_url'],
  status = 'ACTIVE'
where slug = 'payment_failed';

insert into public.communication_templates (slug, name, subject, body, variables, status)
values (
  'invoice_sent',
  'Bill sent',
  'Birdie: your bill is ready',
  'Hello,' || chr(10) || chr(10) ||
    'Your Birdie bill {{invoice_number}} for {{reference}} is ready.' || chr(10) || chr(10) ||
    'Amount: {{amount}}' || chr(10) ||
    'Pay by: {{due_date}}' || chr(10) || chr(10) ||
    'Open it and pay here: {{pay_url}}' || chr(10) || chr(10) ||
    'Birdie holds your money until the job is done, then pays the professional.' || chr(10) || chr(10) ||
    '— Birdie',
  array['invoice_number', 'reference', 'amount', 'due_date', 'pay_url'],
  'ACTIVE'
)
on conflict (slug) do update
set
  name = excluded.name,
  subject = excluded.subject,
  body = excluded.body,
  variables = excluded.variables,
  status = excluded.status;

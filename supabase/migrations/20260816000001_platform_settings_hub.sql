-- Admin settings hub: money, Paystack display fields, product switches, contact.

alter table public.platform_settings
  add column if not exists invoice_due_days int not null default 3,
  add column if not exists paystack_mode text not null default 'test',
  add column if not exists paystack_public_key_test text,
  add column if not exists paystack_public_key_live text,
  add column if not exists paystack_secret_last4_test text,
  add column if not exists paystack_secret_last4_live text,
  add column if not exists hires_enabled boolean not null default true,
  add column if not exists withdrawals_enabled boolean not null default true,
  add column if not exists reviews_enabled boolean not null default true,
  add column if not exists public_banner_enabled boolean not null default false,
  add column if not exists public_banner_text text,
  add column if not exists support_phone text,
  add column if not exists support_whatsapp text,
  add column if not exists office_address text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'platform_settings_paystack_mode_check'
  ) then
    alter table public.platform_settings
      add constraint platform_settings_paystack_mode_check
      check (paystack_mode in ('test', 'live'));
  end if;
end $$;

-- Bills use the admin-set due window instead of a hardcoded 3 days.
create or replace function private.draft_invoice_for_hire(p_hire_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.hire_requests%rowtype;
  existing uuid;
  rate numeric;
  new_id uuid;
  due_days int;
begin
  select id into existing from public.invoices where hire_request_id = p_hire_id;
  if existing is not null then
    return existing;
  end if;

  select * into h from public.hire_requests where id = p_hire_id;
  if not found then raise exception 'Hire not found'; end if;

  select coalesce(invoice_due_days, 3) into due_days
  from public.platform_settings
  where id = 'global';
  due_days := coalesce(due_days, 3);

  if h.professional_id is not null then
    select indicative_rate_ngn into rate
    from public.professional_profiles
    where id = h.professional_id;
  end if;

  insert into public.invoices (
    hire_request_id,
    client_id,
    professional_id,
    amount,
    due_date,
    duration,
    start_date,
    status
  )
  values (
    h.id,
    h.client_id,
    h.professional_id,
    coalesce(nullif(rate, 0), h.escrow_amount, 0),
    (current_date + make_interval(days => due_days))::date,
    nullif(h.requirements->>'duration', ''),
    h.preferred_start_date::date,
    'draft'
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- Service-role only: write Paystack secrets into Vault. Never grant to authenticated.
create or replace function public.upsert_app_secret(p_name text, p_value text)
returns void
language plpgsql
security definer
set search_path = vault, public
as $$
declare
  secret_id uuid;
begin
  if p_name not in ('PAYSTACK_SECRET_KEY_TEST', 'PAYSTACK_SECRET_KEY_LIVE') then
    raise exception 'Unknown secret';
  end if;
  if p_value is null or length(trim(p_value)) < 8 then
    raise exception 'Secret value is too short';
  end if;

  select id into secret_id from vault.secrets where name = p_name limit 1;
  if secret_id is not null then
    perform vault.update_secret(secret_id, trim(p_value));
  else
    perform vault.create_secret(trim(p_value), p_name, 'Birdie Paystack key');
  end if;
end;
$$;

revoke all on function public.upsert_app_secret(text, text) from public, anon, authenticated;
grant execute on function public.upsert_app_secret(text, text) to service_role;

-- Payments ledger: bank_code, completed_at, private money functions, templates, cron

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

alter table public.withdrawal_requests
  add column if not exists bank_code text;

alter table public.hire_requests
  add column if not exists completed_at timestamptz;

create or replace function private.wallet_id_for_hire(p_hire_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select w.id
  from public.wallets w
  join public.professional_profiles pp on pp.user_id = w.professional_id
  join public.hire_requests h on h.professional_id = pp.id
  where h.id = p_hire_id
  limit 1;
$$;

create or replace function private.complete_hire(p_hire_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.hire_requests%rowtype;
  w public.wallets%rowtype;
  amt numeric;
  wid uuid;
begin
  select * into h from public.hire_requests where id = p_hire_id for update;
  if not found then raise exception 'Hire not found'; end if;
  if h.status = 'completed' then
    return jsonb_build_object('ok', true, 'status', 'completed', 'idempotent', true);
  end if;
  if h.status <> 'active' then
    raise exception 'Hire must be active before it can be completed';
  end if;

  amt := coalesce(h.escrow_amount, 0);
  update public.hire_requests
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = p_hire_id;

  wid := private.wallet_id_for_hire(p_hire_id);
  if wid is not null and amt > 0 then
    select * into w from public.wallets where id = wid for update;
    if w.escrow_balance < amt then
      amt := greatest(w.escrow_balance, 0);
    end if;
    if amt > 0 then
      update public.wallets
        set escrow_balance = escrow_balance - amt,
            pending_balance = pending_balance + amt,
            updated_at = now()
        where id = wid;
      insert into public.wallet_transactions (wallet_id, hire_request_id, tx_type, amount, status, reference, description)
      values
        (wid, p_hire_id, 'escrow_debit', amt, 'pending_release', 'complete_' || p_hire_id::text, 'Job completed — held pending release'),
        (wid, p_hire_id, 'pending_credit', amt, 'pending_release', 'complete_' || p_hire_id::text, 'Job completed — pending cooling-off');
    end if;
  end if;

  if h.professional_id is not null then
    update public.professional_profiles
      set availability = 'available'
      where id = h.professional_id;
  end if;

  return jsonb_build_object('ok', true, 'status', 'completed');
end;
$$;

create or replace function private.release_hire(p_hire_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.hire_requests%rowtype;
  w public.wallets%rowtype;
  amt numeric;
  commission numeric;
  net numeric;
  rate numeric;
  wid uuid;
begin
  select * into h from public.hire_requests where id = p_hire_id for update;
  if not found then raise exception 'Hire not found'; end if;
  if h.status = 'settled' then
    return jsonb_build_object('ok', true, 'status', 'settled', 'idempotent', true);
  end if;
  if h.status <> 'completed' then
    raise exception 'Hire must be completed before escrow can be released';
  end if;

  amt := coalesce(h.escrow_amount, 0);
  select coalesce(commission_rate, 15) into rate from public.platform_settings where id = 'global';
  commission := round(amt * coalesce(rate, 15) / 100, 2);
  net := amt - commission;
  wid := private.wallet_id_for_hire(p_hire_id);

  if wid is not null and amt > 0 then
    select * into w from public.wallets where id = wid for update;
    if w.pending_balance < amt then
      raise exception 'Pending balance is less than the job amount — cannot release';
    end if;
    update public.wallets
      set pending_balance = pending_balance - amt,
          available_balance = available_balance + net,
          updated_at = now()
      where id = wid;
    insert into public.wallet_transactions (wallet_id, hire_request_id, tx_type, amount, status, reference, description)
    values
      (wid, p_hire_id, 'pending_debit', amt, 'released', 'release_' || p_hire_id::text, 'Escrow released from pending'),
      (wid, p_hire_id, 'commission_debit', commission, 'released', 'release_' || p_hire_id::text, 'Birdie commission'),
      (wid, p_hire_id, 'available_credit', net, 'released', 'release_' || p_hire_id::text, 'Available to withdraw');
  end if;

  update public.hire_requests
    set status = 'settled', payment_status = 'released', updated_at = now()
    where id = p_hire_id;

  return jsonb_build_object('ok', true, 'status', 'settled', 'commission', commission, 'net', net);
end;
$$;

create or replace function private.reverse_hire_hold(p_hire_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.hire_requests%rowtype;
  w public.wallets%rowtype;
  amt numeric;
  wid uuid;
  bucket text;
begin
  select * into h from public.hire_requests where id = p_hire_id for update;
  if not found then raise exception 'Hire not found'; end if;
  if h.status = 'settled' then
    raise exception 'Escrow already released to the professional — cannot refund automatically';
  end if;
  amt := coalesce(h.escrow_amount, 0);
  wid := private.wallet_id_for_hire(p_hire_id);
  bucket := case
    when h.status in ('funded', 'active') then 'escrow'
    when h.status = 'completed' then 'pending'
    else null
  end;
  if wid is not null and amt > 0 and bucket is not null then
    select * into w from public.wallets where id = wid for update;
    if bucket = 'escrow' then
      if w.escrow_balance < amt then raise exception 'Escrow balance too low to reverse'; end if;
      update public.wallets
        set escrow_balance = escrow_balance - amt, updated_at = now()
        where id = wid;
    else
      if w.pending_balance < amt then raise exception 'Pending balance too low to reverse'; end if;
      update public.wallets
        set pending_balance = pending_balance - amt, updated_at = now()
        where id = wid;
    end if;
    insert into public.wallet_transactions (wallet_id, hire_request_id, tx_type, amount, status, reference, description)
    values (wid, p_hire_id, 'refund_debit', amt, 'refunded', 'refund_' || p_hire_id::text, 'Hold reversed for client refund');
  end if;

  update public.hire_requests
    set status = 'cancelled', payment_status = 'refunded', updated_at = now()
    where id = p_hire_id;

  if h.professional_id is not null then
    update public.professional_profiles set availability = 'available' where id = h.professional_id;
  end if;

  return jsonb_build_object('ok', true, 'reversed', coalesce(amt, 0), 'bucket', bucket);
end;
$$;

create or replace function private.release_due_hires()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  days int;
  n int := 0;
  r record;
begin
  select coalesce(escrow_release_days, 3) into days from public.platform_settings where id = 'global';
  for r in
    select id from public.hire_requests
    where status = 'completed'
      and completed_at is not null
      and completed_at <= now() - make_interval(days => coalesce(days, 3))
  loop
    begin
      perform private.release_hire(r.id);
      n := n + 1;
    exception when others then
      raise notice 'auto-release skipped %: %', r.id, sqlerrm;
    end;
  end loop;
  return n;
end;
$$;

create or replace function public.complete_hire(p_hire_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.role() is distinct from 'service_role' and not public.is_staff() then
    if not exists (
      select 1
      from public.hire_requests h
      join public.professional_profiles pp on pp.id = h.professional_id
      where h.id = p_hire_id and pp.user_id = auth.uid()
    ) then
      raise exception 'Forbidden';
    end if;
  end if;
  return private.complete_hire(p_hire_id);
end;
$$;

create or replace function public.release_hire(p_hire_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.role() is distinct from 'service_role' and not public.is_staff() then
    raise exception 'Forbidden';
  end if;
  return private.release_hire(p_hire_id);
end;
$$;

revoke all on function public.complete_hire(uuid) from public;
revoke all on function public.release_hire(uuid) from public;
grant execute on function public.complete_hire(uuid) to authenticated, service_role;
grant execute on function public.release_hire(uuid) to authenticated, service_role;

insert into public.communication_templates (slug, name, subject, body, variables, status)
values (
  'payment_failed',
  'Payment failed',
  'Birdie: your payment did not go through',
  'Hello,\n\nYour Birdie payment of {{amount}} for request {{reference}} did not go through.\n\nYou can try again here: {{retry_url}}\n\n— Birdie',
  array['amount', 'reference', 'retry_url'],
  'ACTIVE'
)
on conflict (slug) do nothing;

create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('birdie-release-due-hires');
exception when others then
  null;
end $$;

select cron.schedule(
  'birdie-release-due-hires',
  '0 7 * * *',
  $$select private.release_due_hires();$$
);

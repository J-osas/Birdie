-- Unique wallet row references, 3.5% Birdie fee, one-time hold credit, repair doubled test hold.

-- Dashboard trigger used NEW.type (column is tx_type) and had no ELSE, so every
-- ledger insert aborted. Money functions already update wallet balances themselves.
drop trigger if exists tr_sync_wallet on public.wallet_transactions;
drop function if exists public.sync_wallet_balances();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'wallet_transactions_reference_key'
      and conrelid = 'public.wallet_transactions'::regclass
  ) then
    alter table public.wallet_transactions
      add constraint wallet_transactions_reference_key unique (reference);
  end if;
end $$;

alter table public.platform_settings
  alter column commission_rate set default 3.5;

update public.platform_settings
  set commission_rate = 3.5, updated_at = now()
  where id = 'global';

create or replace function public.apply_job_fee_hold(
  p_wallet_id uuid,
  p_hire_id uuid,
  p_amount numeric,
  p_reference text,
  p_description text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int := 0;
begin
  if p_wallet_id is null or p_amount is null or p_amount <= 0 or p_reference is null then
    return false;
  end if;

  insert into public.wallet_transactions (
    wallet_id, hire_request_id, tx_type, amount, status, reference, description
  ) values (
    p_wallet_id, p_hire_id, 'escrow_credit', p_amount, 'in_escrow', p_reference, p_description
  )
  on conflict (reference) do nothing;

  get diagnostics n = row_count;
  if n > 0 then
    update public.wallets
      set escrow_balance = escrow_balance + p_amount,
          updated_at = now()
      where id = p_wallet_id;
    return true;
  end if;
  return false;
end;
$$;

revoke all on function public.apply_job_fee_hold(uuid, uuid, numeric, text, text) from public, anon, authenticated;
grant execute on function public.apply_job_fee_hold(uuid, uuid, numeric, text, text) to service_role;

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
        (wid, p_hire_id, 'escrow_debit', amt, 'pending_release', 'complete_' || p_hire_id::text || '_hold_out', 'Job completed — money moved out of hold'),
        (wid, p_hire_id, 'pending_credit', amt, 'pending_release', 'complete_' || p_hire_id::text || '_waiting_in', 'Job completed — waiting to be paid out');
    end if;
  end if;

  if h.professional_id is not null then
    update public.professional_profiles
      set availability = 'available'
      where id = h.professional_id;
  end if;

  insert into public.notifications (user_id, type, title, body, related_entity, related_id)
  values (
    h.client_id,
    'review',
    'How was your hire?',
    'Leave a review for ' || coalesce(h.professional_name, 'your professional')
      || case when h.reference_code is not null then ' (' || h.reference_code || ')' else '' end || '.',
    'hire_request',
    h.id
  );

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
    raise exception 'The job must be marked done before we can pay the professional';
  end if;

  amt := coalesce(h.escrow_amount, 0);
  select coalesce(commission_rate, 3.5) into rate from public.platform_settings where id = 'global';
  commission := round(amt * coalesce(rate, 3.5) / 100, 2);
  net := amt - commission;
  wid := private.wallet_id_for_hire(p_hire_id);

  if wid is not null and amt > 0 then
    select * into w from public.wallets where id = wid for update;
    if w.pending_balance < amt then
      raise exception 'Waiting balance is less than the job amount — cannot pay yet';
    end if;
    update public.wallets
      set pending_balance = pending_balance - amt,
          available_balance = available_balance + net,
          updated_at = now()
      where id = wid;
    insert into public.wallet_transactions (wallet_id, hire_request_id, tx_type, amount, status, reference, description)
    values
      (wid, p_hire_id, 'pending_debit', amt, 'released', 'release_' || p_hire_id::text || '_waiting_out', 'Paid out from waiting'),
      (wid, p_hire_id, 'commission_debit', commission, 'released', 'release_' || p_hire_id::text || '_birdie_fee', 'Birdie fee'),
      (wid, p_hire_id, 'available_credit', net, 'released', 'release_' || p_hire_id::text || '_ready', 'Ready to withdraw');
  end if;

  update public.hire_requests
    set status = 'settled', payment_status = 'released', updated_at = now()
    where id = p_hire_id;

  if not exists (select 1 from public.reviews where hire_request_id = p_hire_id) then
    insert into public.notifications (user_id, type, title, body, related_entity, related_id)
    values (
      h.client_id,
      'review',
      'How was your hire?',
      'Your job is settled. Leave a review for ' || coalesce(h.professional_name, 'your professional')
        || case when h.reference_code is not null then ' (' || h.reference_code || ')' else '' end || '.',
      'hire_request',
      h.id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', 'settled', 'commission', commission, 'net', net);
end;
$$;

-- Repair doubled hold on the test hire that could not be marked done.
do $$
declare
  h public.hire_requests%rowtype;
  wid uuid;
  pay_ref text;
  bill numeric;
begin
  select * into h from public.hire_requests where reference_code = 'BRD-260815-0002';
  if not found then return; end if;
  if h.status not in ('funded', 'active') then return; end if;

  bill := coalesce(h.escrow_amount, 0);
  wid := private.wallet_id_for_hire(h.id);
  if wid is null or bill <= 0 then return; end if;

  update public.wallets
    set escrow_balance = bill, updated_at = now()
    where id = wid and escrow_balance > bill;

  select provider_reference into pay_ref
    from public.payments
    where hire_request_id = h.id
      and payment_type = 'escrow'
      and status = 'success'
    order by created_at desc
    limit 1;

  if pay_ref is not null and not exists (
    select 1 from public.wallet_transactions where reference = pay_ref
  ) then
    insert into public.wallet_transactions (
      wallet_id, hire_request_id, tx_type, amount, status, reference, description
    ) values (
      wid, h.id, 'escrow_credit', bill, 'in_escrow', pay_ref,
      'Job fee held for ' || coalesce(h.reference_code, 'hire')
    );
  end if;
end $$;

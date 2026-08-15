-- Reviews: flag_reason, hire-owned insert RLS, notify on review, prompt client on complete

alter table public.reviews
  add column if not exists flag_reason text;

drop policy if exists "reviews_client_insert" on public.reviews;
create policy "reviews_client_insert" on public.reviews
  for insert
  with check (
    client_id = auth.uid()
    and exists (
      select 1
      from public.hire_requests h
      where h.id = hire_request_id
        and h.client_id = auth.uid()
        and h.professional_id = professional_id
        and h.status in ('completed', 'settled')
    )
  );

drop policy if exists "reviews_pro_select" on public.reviews;
create policy "reviews_pro_select" on public.reviews
  for select
  using (
    exists (
      select 1
      from public.professional_profiles pp
      where pp.id = professional_id
        and pp.user_id = auth.uid()
    )
  );

drop policy if exists "reviews_auth_report" on public.reviews;
create policy "reviews_auth_report" on public.reviews
  for update
  using (
    status = 'published'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'client'
    )
  )
  with check (
    status = 'flagged'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'client'
    )
  );

create or replace function public.reviews_protect_non_staff_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.is_staff() then
    return new;
  end if;
  if old.status = 'published'
     and new.status = 'flagged'
     and new.hire_request_id = old.hire_request_id
     and new.professional_id = old.professional_id
     and new.client_id = old.client_id
     and new.rating = old.rating
     and new.comment is not distinct from old.comment
  then
    return new;
  end if;
  raise exception 'Reviews can only be reported, not edited';
end;
$$;

drop trigger if exists reviews_protect_non_staff_update on public.reviews;
create trigger reviews_protect_non_staff_update
  before update on public.reviews
  for each row
  execute function public.reviews_protect_non_staff_update();

create or replace function private.notify_on_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pro_user uuid;
  hire_ref text;
  staff record;
begin
  select pp.user_id, h.reference_code
    into pro_user, hire_ref
  from public.professional_profiles pp
  join public.hire_requests h on h.id = new.hire_request_id
  where pp.id = new.professional_id;

  if pro_user is not null then
    insert into public.notifications (user_id, type, title, body, related_entity, related_id)
    values (
      pro_user,
      'review',
      case when new.status = 'published' then 'New client review' else 'A review is being checked' end,
      coalesce(new.client_name, 'A client') || ' left a ' || new.rating::text || '-star review'
        || case when hire_ref is not null then ' for ' || hire_ref else '' end || '.',
      'review',
      new.id
    );
  end if;

  for staff in select id from public.profiles where role in ('admin', 'operations')
  loop
    insert into public.notifications (user_id, type, title, body, related_entity, related_id)
    values (
      staff.id,
      'review',
      case when new.status = 'flagged' then 'Review held for moderation' else 'New client review' end,
      coalesce(new.client_name, 'A client') || ' · ' || new.rating::text || ' stars'
        || case when new.flag_reason is not null then ' · ' || new.flag_reason else '' end,
      'review',
      new.id
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists reviews_notify on public.reviews;
create trigger reviews_notify
  after insert on public.reviews
  for each row
  execute function private.notify_on_review();

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

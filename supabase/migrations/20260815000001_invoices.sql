-- Invoices: a real bill drafted after the consultation, checked and sent by staff

alter table public.consultations
  add column if not exists completed_at timestamptz,
  add column if not exists outcome_notes text;

create sequence if not exists public.invoice_number_seq;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  hire_request_id uuid not null unique references public.hire_requests(id) on delete cascade,
  invoice_number text,
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid references public.professional_profiles(id) on delete set null,
  amount numeric not null default 0,
  due_date date,
  duration text,
  start_date date,
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'cancelled')),
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists invoices_invoice_number_idx
  on public.invoices (invoice_number);

create index if not exists invoices_client_idx on public.invoices (client_id);
create index if not exists invoices_status_idx on public.invoices (status);

create or replace function public.set_invoice_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.invoice_number is null or btrim(new.invoice_number) = '' then
    new.invoice_number :=
      'BRD-INV-' || to_char(now(), 'YYMMDD') || '-' ||
      lpad(nextval('public.invoice_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_set_number on public.invoices;
create trigger invoices_set_number
  before insert on public.invoices
  for each row
  execute function public.set_invoice_number();

create or replace function public.touch_invoice_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists invoices_touch_updated_at on public.invoices;
create trigger invoices_touch_updated_at
  before update on public.invoices
  for each row
  execute function public.touch_invoice_updated_at();

alter table public.invoices enable row level security;

drop policy if exists "invoices_staff_all" on public.invoices;
create policy "invoices_staff_all" on public.invoices
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "invoices_client_select" on public.invoices;
create policy "invoices_client_select" on public.invoices
  for select using (client_id = auth.uid());

drop policy if exists "invoices_pro_select" on public.invoices;
create policy "invoices_pro_select" on public.invoices
  for select using (
    exists (
      select 1
      from public.professional_profiles pp
      where pp.id = professional_id
        and pp.user_id = auth.uid()
    )
  );

-- Draft an invoice for a hire once the consultation is done. Safe to call twice.
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
begin
  select id into existing from public.invoices where hire_request_id = p_hire_id;
  if existing is not null then
    return existing;
  end if;

  select * into h from public.hire_requests where id = p_hire_id;
  if not found then raise exception 'Hire not found'; end if;

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
    (current_date + interval '3 days')::date,
    nullif(h.requirements->>'duration', ''),
    h.preferred_start_date::date,
    'draft'
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function private.draft_invoice_for_hire(uuid) from public;

-- Staff-callable wrapper so the app can draft through PostgREST
create or replace function public.draft_invoice_for_hire(p_hire_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Only Birdie staff can prepare an invoice';
  end if;
  return private.draft_invoice_for_hire(p_hire_id);
end;
$$;

grant execute on function public.draft_invoice_for_hire(uuid) to authenticated;

-- Admin Operations Hub: audit log, GA setting, reviews staff update

alter table public.platform_settings
  add column if not exists ga_measurement_id text;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "audit_staff_all" on public.admin_audit_log;
create policy "audit_staff_all" on public.admin_audit_log
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "reviews_staff_update" on public.reviews;
create policy "reviews_staff_update" on public.reviews
  for update using (public.is_staff());

drop policy if exists "reviews_staff_select" on public.reviews;
create policy "reviews_staff_select" on public.reviews
  for select using (public.is_staff());

-- Page studio: marketing layouts (draft/publish) + kill switch + OpenAI key last4.

alter table public.platform_settings
  add column if not exists page_studio_enabled boolean not null default false,
  add column if not exists openai_secret_last4 text;

create table if not exists public.page_layouts (
  slug text primary key,
  draft jsonb not null default '{"blocks":[]}'::jsonb,
  published jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.page_layouts enable row level security;

drop policy if exists "page_layouts_staff_select" on public.page_layouts;
create policy "page_layouts_staff_select"
  on public.page_layouts for select
  using (public.is_staff());

drop policy if exists "page_layouts_staff_write" on public.page_layouts;
create policy "page_layouts_staff_write"
  on public.page_layouts for all
  using (public.is_staff())
  with check (public.is_staff());

grant select, insert, update, delete on public.page_layouts to authenticated;

insert into public.page_layouts (slug, draft)
values
  ('home', '{"blocks":[]}'::jsonb),
  ('about', '{"blocks":[]}'::jsonb),
  ('story', '{"blocks":[]}'::jsonb),
  ('contact', '{"blocks":[]}'::jsonb)
on conflict (slug) do nothing;

create or replace function public.get_published_layout(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select published from public.page_layouts where slug = p_slug
$$;

revoke all on function public.get_published_layout(text) from public, anon, authenticated;
grant execute on function public.get_published_layout(text) to anon, authenticated;

create or replace function public.upsert_app_secret(p_name text, p_value text)
returns void
language plpgsql
security definer
set search_path = vault, public
as $$
declare
  secret_id uuid;
begin
  if p_name not in (
    'PAYSTACK_SECRET_KEY_TEST',
    'PAYSTACK_SECRET_KEY_LIVE',
    'OPENAI_API_KEY'
  ) then
    raise exception 'Unknown secret';
  end if;
  if p_value is null or length(trim(p_value)) < 8 then
    raise exception 'Secret value is too short';
  end if;

  select id into secret_id from vault.secrets where name = p_name limit 1;
  if secret_id is not null then
    perform vault.update_secret(secret_id, trim(p_value));
  else
    perform vault.create_secret(
      trim(p_value),
      p_name,
      case when p_name = 'OPENAI_API_KEY' then 'Birdie OpenAI key' else 'Birdie Paystack key' end
    );
  end if;
end;
$$;

revoke all on function public.upsert_app_secret(text, text) from public, anon, authenticated;
grant execute on function public.upsert_app_secret(text, text) to service_role;

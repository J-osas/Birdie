-- WordPress-style media library: files in storage, named slots in the database.
-- Staff replace a slot; the public site reads the current URL.

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "site_media_staff_select"
  on storage.objects for select
  using (bucket_id = 'site-media' and public.is_staff());

create policy "site_media_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'site-media' and public.is_staff());

create policy "site_media_staff_update"
  on storage.objects for update
  using (bucket_id = 'site-media' and public.is_staff())
  with check (bucket_id = 'site-media' and public.is_staff());

create policy "site_media_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'site-media' and public.is_staff());

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text,
  byte_size int,
  alt text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.media_slots (
  slot text primary key,
  label text not null,
  group_name text not null default 'pages',
  fallback_url text not null,
  media_id uuid references public.media_files (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index media_slots_media_id_idx on public.media_slots (media_id);
create index media_files_created_at_idx on public.media_files (created_at desc);

alter table public.media_files enable row level security;
alter table public.media_slots enable row level security;

create policy "media_files_public_read"
  on public.media_files for select
  using (true);

create policy "media_files_staff_write"
  on public.media_files for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "media_slots_public_read"
  on public.media_slots for select
  using (true);

create policy "media_slots_staff_write"
  on public.media_slots for all
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.media_files to anon, authenticated;
grant insert, update, delete on public.media_files to authenticated;
grant select on public.media_slots to anon, authenticated;
grant insert, update, delete on public.media_slots to authenticated;

insert into public.media_slots (slot, label, group_name, fallback_url) values
  ('logo_on_light', 'Logo on a light background', 'brand', '/brand/logo-on-light.png'),
  ('logo_on_dark', 'Logo on a dark background', 'brand', '/brand/logo-on-dark.png'),
  ('mark_burgundy', 'Bird mark on light', 'brand', '/brand/mark-burgundy.png'),
  ('mark_light', 'Bird mark on dark', 'brand', '/brand/mark-light.png'),
  ('favicon', 'Browser tab icon', 'brand', '/favicon.png'),
  ('home_hero', 'Home hero photo', 'home', '/images/home-hero.jpg'),
  ('home_reach_1', 'Home — first reach photo', 'home', '/images/home-reach-1.jpg'),
  ('home_reach_2', 'Home — second reach photo', 'home', '/images/home-reach-2.jpg'),
  ('home_why', 'Home — why families photo', 'home', '/images/home-why.jpg'),
  ('home_testimonial', 'Home — family quote photo', 'home', '/images/home-testimonial.jpg'),
  ('hero', 'Classic hero photo', 'pages', '/images/hero.jpg'),
  ('process', 'How it works photo', 'pages', '/images/process.jpg'),
  ('provider', 'Professional photo', 'pages', '/images/provider.jpg'),
  ('story', 'Our story photo', 'pages', '/images/story.jpg'),
  ('contact', 'Contact photo', 'pages', '/images/contact.jpg'),
  ('blog_cover', 'Blog cover fallback', 'pages', '/images/blog-cover.jpg'),
  ('avatar_fallback', 'Avatar fallback', 'pages', '/images/avatar-fallback.jpg'),
  ('category_security', 'Category — Security', 'categories', '/images/category-security.jpg'),
  ('category_nanny', 'Category — Nanny', 'categories', '/images/category-nanny.jpg'),
  ('category_house_help', 'Category — House help', 'categories', '/images/category-house-help.jpg'),
  ('category_gardener', 'Category — Gardener', 'categories', '/images/category-gardener.jpg'),
  ('category_driver', 'Category — Driver', 'categories', '/images/category-driver.jpg'),
  ('category_chef', 'Category — Chef', 'categories', '/images/category-chef.jpg')
on conflict (slot) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.media_slots;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

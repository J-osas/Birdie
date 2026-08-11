-- Client account: avatar + soft delete
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists deleted_at timestamptz;

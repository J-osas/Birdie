-- Professional onboarding fields + review uniqueness
alter table public.professional_profiles
  add column if not exists state text default '',
  add column if not exists city text default '',
  add column if not exists address_line text default '',
  add column if not exists country text default 'NG',
  add column if not exists lat numeric,
  add column if not exists lng numeric,
  add column if not exists govt_id_path text,
  add column if not exists proof_of_address_path text,
  add column if not exists proof_of_address_type text,
  add column if not exists nin_doc_path text,
  add column if not exists onboarding_step text default 'personal',
  add column if not exists assessment_completed_at timestamptz,
  add column if not exists attitude_answers jsonb default '{}'::jsonb;

-- One review per hire
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_hire_request_id_key'
  ) then
    alter table public.reviews add constraint reviews_hire_request_id_key unique (hire_request_id);
  end if;
end $$;

-- Keep rating aggregates in sync
create or replace function public.refresh_professional_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  pid := coalesce(new.professional_id, old.professional_id);
  update public.professional_profiles p
  set
    rating = coalesce((
      select round(avg(r.rating)::numeric, 1)
      from public.reviews r
      where r.professional_id = pid and r.status = 'published'
    ), 0),
    review_count = coalesce((
      select count(*)::int
      from public.reviews r
      where r.professional_id = pid and r.status = 'published'
    ), 0)
  where p.id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_professional_rating();

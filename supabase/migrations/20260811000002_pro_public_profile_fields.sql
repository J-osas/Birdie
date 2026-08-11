-- Public profile expansion fields for professionals
alter table public.professional_profiles
  add column if not exists gender text default '',
  add column if not exists indicative_rate_ngn numeric,
  add column if not exists rate_unit text default 'monthly',
  add column if not exists years_experience int default 0,
  add column if not exists work_type text default '',
  add column if not exists languages text[] default '{}',
  add column if not exists skills text[] default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'professional_profiles_rate_unit_check'
  ) then
    alter table public.professional_profiles
      add constraint professional_profiles_rate_unit_check
      check (rate_unit in ('monthly', 'daily', 'hourly'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'professional_profiles_work_type_check'
  ) then
    alter table public.professional_profiles
      add constraint professional_profiles_work_type_check
      check (work_type in ('', 'live_in', 'live_out', 'part_time', 'flexible'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'professional_profiles_gender_check'
  ) then
    alter table public.professional_profiles
      add constraint professional_profiles_gender_check
      check (gender in ('', 'woman', 'man', 'prefer_not_to_say'));
  end if;
end $$;

-- professional_id must point at professional_profiles, not profiles
alter table public.hire_requests drop constraint if exists hire_requests_professional_id_fkey;
alter table public.hire_requests
  add constraint hire_requests_professional_id_fkey
  foreign key (professional_id) references public.professional_profiles(id) on delete set null;

drop policy if exists "consultations_parties" on public.consultations;
create policy "consultations_parties" on public.consultations
  for all using (
    public.is_staff()
    or hire_request_id in (select id from public.hire_requests where client_id = auth.uid())
  )
  with check (
    public.is_staff()
    or hire_request_id in (select id from public.hire_requests where client_id = auth.uid())
  );

-- Staff can update professional and profile status (WITH CHECK so updates are not silent no-ops)

drop policy if exists "pros_owner_update" on public.professional_profiles;
create policy "pros_owner_update" on public.professional_profiles
  for update
  using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

drop policy if exists "profiles_staff_all" on public.profiles;
create policy "profiles_staff_all" on public.profiles
  for all
  using (public.is_staff())
  with check (public.is_staff());

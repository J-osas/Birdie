-- Storage buckets + policies for Birdie documents
-- Run after schema migration in Supabase SQL editor

insert into storage.buckets (id, name, public)
values
  ('pro-documents', 'pro-documents', false),
  ('pro-certifications', 'pro-certifications', false),
  ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- Profile photos: public read, owner write
create policy "profile_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "profile_photos_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Private docs: owner folder or staff
create policy "pro_documents_owner_staff_select"
  on storage.objects for select
  using (
    bucket_id = 'pro-documents'
    and (
      public.is_staff()
      or (storage.foldername(name))[1] in (
        select id::text from public.professional_profiles where user_id = auth.uid()
      )
    )
  );

create policy "pro_documents_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'pro-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select id::text from public.professional_profiles where user_id = auth.uid()
    )
  );

create policy "pro_certs_owner_staff_select"
  on storage.objects for select
  using (
    bucket_id = 'pro-certifications'
    and (
      public.is_staff()
      or (storage.foldername(name))[1] in (
        select id::text from public.professional_profiles where user_id = auth.uid()
      )
    )
  );

create policy "pro_certs_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'pro-certifications'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select id::text from public.professional_profiles where user_id = auth.uid()
    )
  );

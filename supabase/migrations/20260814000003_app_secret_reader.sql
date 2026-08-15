-- Allow Edge Functions (service_role) to read named secrets from Vault.
-- Secret values themselves are inserted separately and must not live in git.

create or replace function private.get_app_secret(p_name text)
returns text
language sql
stable
security definer
set search_path = vault, public
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = p_name
  limit 1;
$$;

revoke all on function private.get_app_secret(text) from public, anon, authenticated;
grant execute on function private.get_app_secret(text) to postgres, service_role;

create or replace function public.get_app_secret(p_name text)
returns text
language sql
stable
security definer
set search_path = vault, public
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = p_name
  limit 1;
$$;

revoke all on function public.get_app_secret(text) from public, anon, authenticated;
grant execute on function public.get_app_secret(text) to service_role;

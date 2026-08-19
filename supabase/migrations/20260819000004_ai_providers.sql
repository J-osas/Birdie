-- Free Groq as the default AI. OpenAI stays saved but unused until staff pick it.

alter table public.platform_settings
  add column if not exists ai_provider text not null default 'groq',
  add column if not exists groq_secret_last4 text,
  add column if not exists gemini_secret_last4 text;

alter table public.platform_settings
  drop constraint if exists platform_settings_ai_provider_check;

alter table public.platform_settings
  add constraint platform_settings_ai_provider_check
  check (ai_provider in ('groq', 'openai'));

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
    'OPENAI_API_KEY',
    'GROQ_API_KEY',
    'GEMINI_API_KEY'
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
      case p_name
        when 'OPENAI_API_KEY' then 'Birdie OpenAI key'
        when 'GROQ_API_KEY' then 'Birdie Groq key'
        when 'GEMINI_API_KEY' then 'Birdie Gemini key'
        else 'Birdie Paystack key'
      end
    );
  end if;
end;
$$;

revoke all on function public.upsert_app_secret(text, text) from public, anon, authenticated;
grant execute on function public.upsert_app_secret(text, text) to service_role;

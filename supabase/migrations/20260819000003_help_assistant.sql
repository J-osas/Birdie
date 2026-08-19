-- Public help assistant kill switch. Off until staff turn it on.

alter table public.platform_settings
  add column if not exists help_assistant_enabled boolean not null default false;

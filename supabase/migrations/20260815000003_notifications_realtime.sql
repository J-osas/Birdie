-- Let the app hear about new notifications the moment they are written,
-- so the bell can update and play its chime without a page reload.

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Unique hire request reference codes: BRD-YYMMDD-####

create sequence if not exists public.hire_request_ref_seq;

alter table public.hire_requests
  add column if not exists reference_code text;

do $$
declare
  r record;
begin
  for r in
    select id, created_at
    from public.hire_requests
    where reference_code is null
    order by created_at, id
  loop
    update public.hire_requests
    set reference_code =
      'BRD-' || to_char(r.created_at, 'YYMMDD') || '-' ||
      lpad(nextval('public.hire_request_ref_seq')::text, 4, '0')
    where id = r.id;
  end loop;
end $$;

alter table public.hire_requests
  alter column reference_code set not null;

create unique index if not exists hire_requests_reference_code_idx
  on public.hire_requests (reference_code);

create or replace function public.set_hire_reference_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.reference_code is null or btrim(new.reference_code) = '' then
    new.reference_code :=
      'BRD-' || to_char(now(), 'YYMMDD') || '-' ||
      lpad(nextval('public.hire_request_ref_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists hire_requests_set_reference on public.hire_requests;
create trigger hire_requests_set_reference
  before insert on public.hire_requests
  for each row
  execute function public.set_hire_reference_code();

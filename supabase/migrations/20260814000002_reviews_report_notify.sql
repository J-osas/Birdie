-- Notify staff when an existing published review is flagged or reported

create or replace function private.notify_on_review_flagged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  staff record;
begin
  if old.status = new.status then
    return new;
  end if;
  if new.status <> 'flagged' then
    return new;
  end if;

  for staff in select id from public.profiles where role in ('admin', 'operations')
  loop
    insert into public.notifications (user_id, type, title, body, related_entity, related_id)
    values (
      staff.id,
      'review',
      'Review reported',
      coalesce(new.client_name, 'A review') || ' · ' || coalesce(new.flag_reason, 'Flagged'),
      'review',
      new.id
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists reviews_notify_flagged on public.reviews;
create trigger reviews_notify_flagged
  after update of status on public.reviews
  for each row
  execute function private.notify_on_review_flagged();

-- Every review waits in "pending" while Birdie checks it.
-- Clean reviews go live on their own. Anything with a reason waits for a person.
--   pending   = still being checked, or waiting for a Birdie decision
--   published = live on the profile
--   flagged   = a person at Birdie did not approve it

alter table public.reviews
  add column if not exists screened_at timestamptz;

alter table public.reviews
  alter column status set default 'pending';

-- The word check, kept in SQL so the safety net can run without the app.
create or replace function private.review_flag_reason(p_comment text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  txt text := coalesce(p_comment, '');
begin
  if txt ~* '\y(kill yourself|kys|nin|whatsapp me|call me on|fuck|fucking|shithead|bastard|bitch|whore|slut|nigger|nigga|retard|rape)\y'
     or txt ~* 'wa\.me/' then
    return 'Possible abusive language';
  end if;
  if txt ~ '(\+?234|0)[789][0-9]{8,10}' or txt ~ '[0-9]{11,}' then
    return 'Looks like private contact details';
  end if;
  return null;
end;
$$;

-- A client reporting a review sends it back to pending with a reason.
drop policy if exists "reviews_auth_report" on public.reviews;
create policy "reviews_auth_report" on public.reviews
  for update
  using (
    status = 'published'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'client'
    )
  )
  with check (
    status = 'pending'
    and flag_reason is not null
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'client'
    )
  );

create or replace function public.reviews_protect_non_staff_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.is_staff() then
    return new;
  end if;
  if old.status = 'published'
     and new.status = 'pending'
     and new.hire_request_id = old.hire_request_id
     and new.professional_id = old.professional_id
     and new.client_id = old.client_id
     and new.rating = old.rating
     and new.comment is not distinct from old.comment
  then
    return new;
  end if;
  raise exception 'Reviews can only be reported, not edited';
end;
$$;

-- Nothing is announced when a review comes in: it is not live yet.
drop trigger if exists reviews_notify on public.reviews;

-- Tell the professional when a review goes live, and tell staff when one needs a decision.
create or replace function private.notify_on_review_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pro_user uuid;
  hire_ref text;
  staff record;
begin
  if old.status = new.status and old.flag_reason is not distinct from new.flag_reason then
    return new;
  end if;

  if new.status = 'published' and old.status <> 'published' then
    select pp.user_id, h.reference_code
      into pro_user, hire_ref
    from public.professional_profiles pp
    left join public.hire_requests h on h.id = new.hire_request_id
    where pp.id = new.professional_id;

    if pro_user is not null then
      insert into public.notifications (user_id, type, title, body, related_entity, related_id)
      values (
        pro_user,
        'review',
        'You have a new review',
        coalesce(new.client_name, 'A family') || ' gave you ' || new.rating::text || ' stars'
          || case when hire_ref is not null then ' for ' || hire_ref else '' end
          || '. It is now on your profile.',
        'review',
        new.id
      );
    end if;
    return new;
  end if;

  if new.status = 'pending' and new.flag_reason is not null then
    for staff in select id from public.profiles where role in ('admin', 'operations')
    loop
      insert into public.notifications (user_id, type, title, body, related_entity, related_id)
      values (
        staff.id,
        'review',
        'A review needs your decision',
        coalesce(new.client_name, 'A family') || ' · ' || new.rating::text || ' stars · ' || new.flag_reason,
        'review',
        new.id
      );
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_notify_flagged on public.reviews;
drop trigger if exists reviews_notify_status on public.reviews;
create trigger reviews_notify_status
  after update on public.reviews
  for each row
  execute function private.notify_on_review_status();

-- Safety net: if the browser closed before the check finished, do it here.
create or replace function private.screen_pending_reviews()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  reason text;
  done integer := 0;
begin
  for r in
    select id, comment
    from public.reviews
    where status = 'pending'
      and screened_at is null
      and created_at < now() - interval '2 minutes'
  loop
    reason := private.review_flag_reason(r.comment);
    if reason is null then
      update public.reviews
        set status = 'published', flag_reason = null, screened_at = now()
        where id = r.id;
    else
      update public.reviews
        set flag_reason = reason, screened_at = now()
        where id = r.id;
    end if;
    done := done + 1;
  end loop;
  return done;
end;
$$;

do $$
begin
  perform cron.unschedule('birdie-screen-reviews');
exception when others then
  null;
end $$;

select cron.schedule(
  'birdie-screen-reviews',
  '* * * * *',
  $$select private.screen_pending_reviews();$$
);

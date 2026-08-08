-- Birdie production schema + RLS
-- Apply via Supabase SQL editor or `supabase db push`

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text default '',
  role text not null check (role in ('client', 'professional', 'admin', 'operations')),
  status text not null default 'active' check (status in ('active', 'pending', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Platform settings
create table if not exists public.platform_settings (
  id text primary key default 'global',
  platform_name text not null default 'Birdie',
  support_email text not null default 'support@birdie.ng',
  default_currency text not null default 'NGN',
  commission_rate numeric not null default 15,
  consultation_fee_ngn numeric not null default 10000,
  min_withdrawal_amount numeric not null default 5000,
  escrow_release_days int not null default 3,
  reg_client_enabled boolean not null default true,
  reg_pro_enabled boolean not null default true,
  auto_verify_pros boolean not null default false,
  manual_vetting_required boolean not null default true,
  email_notifications_enabled boolean not null default true,
  default_sender_email text not null default 'noreply@birdie.ng',
  admin_alert_recipients text[] not null default array['admin@birdie.ng'],
  session_timeout_minutes int not null default 60,
  require_email_verification boolean not null default true,
  admin_only_access boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id) values ('global') on conflict (id) do nothing;

insert into public.categories (name, slug, description) values
  ('Security', 'security', 'Verified security personnel for homes and estates'),
  ('Nanny', 'nanny', 'Childcare professionals'),
  ('House Help', 'house-help', 'Housekeeping and domestic support'),
  ('Gardener', 'gardener', 'Garden and outdoor care'),
  ('Driver', 'driver', 'Personal and executive drivers'),
  ('Chef', 'chef', 'Private chefs and cooks')
on conflict (name) do nothing;

-- Professional profiles
create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  category text not null default 'House Help',
  bio text not null default '',
  location text not null default '',
  phone text default '',
  availability text not null default 'available'
    check (availability in ('available', 'busy', 'unavailable', 'on_job')),
  profile_completion int not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'verified', 'under_review', 'suspended')),
  aptitude_score numeric default 0,
  assessment_score numeric default 0,
  public_visible boolean not null default true,
  avatar_url text,
  nin text default '',
  rating numeric not null default 0,
  review_count int not null default 0,
  completed_jobs int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_documents (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('govt_id', 'passport_photo', 'police_clearance', 'proof_of_address')),
  storage_path text not null,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.professional_certifications (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  title text not null,
  storage_path text not null,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.guarantors (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  occupation text not null default '',
  address text not null default '',
  relationship text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  category text not null,
  answers jsonb not null default '{}',
  auto_score numeric not null default 0,
  submitted_at timestamptz not null default now()
);

-- Hire + payments
create table if not exists public.hire_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid references public.professional_profiles(id),
  service_category text not null,
  service_requested text,
  preferred_start_date timestamptz,
  location text not null default 'Lagos',
  requirements jsonb not null default '{}',
  notes text,
  status text not null default 'pending',
  amount numeric,
  escrow_amount numeric,
  client_name text not null default '',
  client_email text,
  client_phone text,
  professional_name text,
  payment_status text default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  hire_request_id uuid not null references public.hire_requests(id) on delete cascade,
  scheduled_at timestamptz not null,
  fee_amount numeric not null,
  payment_status text not null default 'pending'
    check (payment_status in ('initiated', 'pending', 'success', 'failed', 'refunded')),
  paystack_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  hire_request_id uuid references public.hire_requests(id),
  payment_type text not null check (payment_type in ('consultation', 'escrow', 'refund')),
  amount numeric not null,
  status text not null default 'initiated'
    check (status in ('initiated', 'pending', 'success', 'failed', 'refunded')),
  provider text not null default 'paystack',
  provider_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paystack',
  event_type text not null,
  reference text not null,
  payload jsonb not null default '{}',
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (provider, reference, event_type)
);

-- Wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null unique references public.profiles(id) on delete cascade,
  escrow_balance numeric not null default 0,
  pending_balance numeric not null default 0,
  available_balance numeric not null default 0,
  total_withdrawn numeric not null default 0,
  currency text not null default 'NGN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  hire_request_id uuid references public.hire_requests(id),
  tx_type text not null,
  amount numeric not null,
  status text not null,
  reference text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  professional_id uuid not null references public.profiles(id),
  professional_name text not null default '',
  amount numeric not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  status text not null default 'requested'
    check (status in ('requested', 'under_review', 'approved', 'paid', 'rejected')),
  admin_note text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

-- Messaging / social
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  hire_request_id uuid not null references public.hire_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  hire_request_id uuid not null references public.hire_requests(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id),
  client_id uuid not null references public.profiles(id),
  client_name text not null default '',
  category text not null default '',
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  status text not null default 'published' check (status in ('published', 'pending', 'flagged')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text not null,
  related_entity text,
  related_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- CMS
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Guides',
  author text not null default 'Birdie',
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subject text not null,
  body text not null,
  variables text[] not null default '{}',
  status text not null default 'ACTIVE',
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  recipient_role text,
  subject text not null,
  template_slug text,
  status text not null default 'PENDING',
  related_event text,
  sent_at timestamptz default now(),
  retry_count int not null default 0,
  error text
);

-- Helpers
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'operations')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text;
begin
  chosen_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  if chosen_role not in ('client', 'professional') then
    chosen_role := 'client';
  end if;

  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    chosen_role,
    'active'
  );

  if chosen_role = 'professional' then
    insert into public.professional_profiles (user_id, status, public_visible)
    values (new.id, 'pending', true);
    insert into public.wallets (professional_id)
    values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.platform_settings enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.professional_documents enable row level security;
alter table public.professional_certifications enable row level security;
alter table public.guarantors enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.hire_requests enable row level security;
alter table public.consultations enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhooks enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.blog_posts enable row level security;
alter table public.cms_pages enable row level security;
alter table public.communication_templates enable row level security;
alter table public.communication_logs enable row level security;

-- Profiles policies
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (auth.uid() = id or public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_staff_all" on public.profiles
  for all using (public.is_staff());

-- Categories / settings public read
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_staff_write" on public.categories for all using (public.is_staff());
create policy "settings_public_read" on public.platform_settings for select using (true);
create policy "settings_staff_write" on public.platform_settings for all using (public.is_staff());

-- Pros: public can see public_visible
create policy "pros_public_read" on public.professional_profiles
  for select using (public_visible = true or user_id = auth.uid() or public.is_staff());
create policy "pros_owner_update" on public.professional_profiles
  for update using (user_id = auth.uid() or public.is_staff());
create policy "pros_owner_insert" on public.professional_profiles
  for insert with check (user_id = auth.uid() or public.is_staff());

-- Documents / certs: owner + staff only (no public download)
create policy "docs_owner_staff" on public.professional_documents
  for all using (
    public.is_staff() or professional_id in (
      select id from public.professional_profiles where user_id = auth.uid()
    )
  );
create policy "certs_owner_staff" on public.professional_certifications
  for all using (
    public.is_staff() or professional_id in (
      select id from public.professional_profiles where user_id = auth.uid()
    )
  );
-- Public may see approved cert titles only via a view or filtered select of metadata
create policy "certs_public_approved_meta" on public.professional_certifications
  for select using (
    verification_status = 'approved'
    or public.is_staff()
    or professional_id in (select id from public.professional_profiles where user_id = auth.uid())
  );

create policy "guarantors_owner_staff" on public.guarantors
  for all using (
    public.is_staff() or professional_id in (
      select id from public.professional_profiles where user_id = auth.uid()
    )
  );

create policy "assessments_owner_staff" on public.assessment_attempts
  for all using (
    public.is_staff() or professional_id in (
      select id from public.professional_profiles where user_id = auth.uid()
    )
  );

-- Hires
create policy "hires_client_read" on public.hire_requests
  for select using (
    client_id = auth.uid()
    or public.is_staff()
    or professional_id in (select id from public.professional_profiles where user_id = auth.uid())
  );
create policy "hires_client_insert" on public.hire_requests
  for insert with check (client_id = auth.uid());
create policy "hires_update_parties" on public.hire_requests
  for update using (
    client_id = auth.uid()
    or public.is_staff()
    or professional_id in (select id from public.professional_profiles where user_id = auth.uid())
  );

create policy "consultations_parties" on public.consultations
  for all using (
    public.is_staff()
    or hire_request_id in (select id from public.hire_requests where client_id = auth.uid())
  );

create policy "payments_own" on public.payments
  for select using (user_id = auth.uid() or public.is_staff());
create policy "payments_insert_own" on public.payments
  for insert with check (user_id = auth.uid() or public.is_staff());
create policy "webhooks_staff" on public.payment_webhooks
  for all using (public.is_staff());

create policy "wallets_own" on public.wallets
  for select using (professional_id = auth.uid() or public.is_staff());
create policy "wallet_tx_own" on public.wallet_transactions
  for select using (
    public.is_staff()
    or wallet_id in (select id from public.wallets where professional_id = auth.uid())
  );
create policy "withdrawals_own" on public.withdrawal_requests
  for all using (professional_id = auth.uid() or public.is_staff());

create policy "messages_hire_parties" on public.messages
  for all using (
    public.is_staff()
    or hire_request_id in (
      select id from public.hire_requests
      where client_id = auth.uid()
         or professional_id in (select id from public.professional_profiles where user_id = auth.uid())
    )
  );

create policy "reviews_public_published" on public.reviews
  for select using (status = 'published' or client_id = auth.uid() or public.is_staff());
create policy "reviews_client_insert" on public.reviews
  for insert with check (client_id = auth.uid());

create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid() or public.is_staff());

create policy "blog_public_published" on public.blog_posts
  for select using (published = true or public.is_staff());
create policy "blog_staff_write" on public.blog_posts
  for all using (public.is_staff());
create policy "cms_public_read" on public.cms_pages for select using (true);
create policy "cms_staff_write" on public.cms_pages for all using (public.is_staff());
create policy "templates_staff" on public.communication_templates for all using (public.is_staff());
create policy "comm_logs_staff" on public.communication_logs for all using (public.is_staff());

-- Storage buckets (run in dashboard if storage API unavailable here)
-- insert into storage.buckets (id, name, public) values
--   ('pro-documents', 'pro-documents', false),
--   ('pro-certifications', 'pro-certifications', false),
--   ('profile-photos', 'profile-photos', true)
-- on conflict do nothing;

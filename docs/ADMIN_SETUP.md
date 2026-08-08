# Birdie admin setup

Admin / operations users **cannot** register via the public UI. Create them in Supabase.

## Create an admin

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project `wajiuwphekflyayjwwmt` (or your project).
2. **Authentication → Users → Add user** (email + password). Confirm email if required.
3. **Table Editor → `profiles`** → find the user row.
4. Set `role` to `admin` (or `operations`).
5. Sign in at `/login` on the Birdie app → you should land in the Operations hub.

## Apply schema

Run the SQL in `supabase/migrations/` in order (or `supabase db push`), including:

- `20260308000000_birdie_schema.sql`
- `20260308000002_pro_onboarding_reviews.sql` (address/ID fields, one review per hire, rating trigger)

## Professional verification email

When an admin clicks **Verify** on `/app/vetting`:

1. `professional_profiles.status` → `verified`, `public_visible` → true  
2. An **in-app** row is written to `notifications` for the professional  

For production email, hook Resend (or Postmark) in an Edge Function listening to status changes, or call it from the Verify action. Template suggestion: “You’re verified on Birdie — bank details and certifications are unlocked.” Until that function is deployed, pros still see the in-app notification on next login.

## Storage buckets

Create private buckets:

- `pro-documents`
- `pro-certifications`

Optional public bucket:

- `profile-photos`

Policies: only owner + staff can read private objects.

## Edge Functions secrets

Deploy functions under `supabase/functions/*` and set:

- `PAYSTACK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Point Paystack webhook URL to:

`https://<project-ref>.supabase.co/functions/v1/paystack-webhook`

## Rotate leaked keys

If anon keys were ever committed in source, rotate the anon key in Supabase and update `.env.local` / Vercel env vars. Never commit service role or Paystack secret keys.

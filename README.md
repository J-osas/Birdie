# Birdie

Trusted domestic staffing marketplace for Lagos — vetted professionals, consultation-per-hire, escrow-backed payouts via Paystack, and admin ops.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (npm)
- React Router
- Supabase (Auth, Postgres + RLS, Storage, Realtime, Edge Functions)
- Paystack (consultation, escrow, transfers)

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Apply `supabase/migrations/20260308000000_birdie_schema.sql` in Supabase SQL Editor
4. Follow [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for admin user + Edge Functions
5. `npm run dev` → http://localhost:3000

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run preview` — preview build

## App routes

- Public: `/`, `/professionals`, `/hire`, `/about`, `/story`, `/blog`, `/contact`
- Auth: `/login`, `/register` (client or professional only)
- App: `/app/*` role dashboards (client, professional, admin)

## Security notes

- No secrets in the client bundle — only `VITE_*` anon keys
- Admin cannot self-register
- Private docs/certs are not publicly downloadable
- Paystack amounts resolved server-side in Edge Functions
- See plan phases and [docs/CUTOVER.md](docs/CUTOVER.md) before leaving WordPress

# WordPress → Birdie app cutover checklist

## Before DNS switch

- [ ] Schema + RLS applied on production Supabase
- [ ] Storage buckets + policies live
- [ ] Paystack live keys on Edge Functions; webhook verified
- [ ] Admin users created; vetting/hire/payout smoke tested
- [ ] Consultation fee configured in `platform_settings`
- [ ] Blog/FAQ/legal content migrated
- [ ] Real imagery replaced under `public/images/`
- [ ] Vercel project env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Lower DNS TTL on birdie.ng (e.g. 300s) 24h ahead

## Cutover

1. Deploy latest frontend to Vercel
2. Final smoke: register client/pro, hire, Paystack consultation (small live test), admin approve
3. Add 301 redirects from key WordPress URLs → new routes
4. Point birdie.ng DNS to Vercel
5. Monitor Paystack webhooks + Supabase logs for 48h

## Rollback

Keep WordPress hosting ready. Raise DNS TTL only after stability. Re-point DNS to WordPress if critical failure.

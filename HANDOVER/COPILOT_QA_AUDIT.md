# HackKnow QA Audit — Patch Pack P0-P9

**Updated:** Post patch-pack application  

## Patches Applied

| # | Scope | Status |
|---|-------|--------|
| P0 | fix(checkout): only confirm after Razorpay success | ✅ |
| P1 | feat(payment): server-side Razorpay order + verify | ✅ |
| P2 | feat(auth): real WordPress JWT login/register | ✅ |
| P3 | fix(routing): hide shop.hackknow.com from URLs | ✅ |
| P4 | feat(mobile): sticky bottom nav + account in menu | ✅ |
| P5 | chore(nginx): TLS, CSP, proxy /wp-content | ✅ |
| P6 | fix(deploy): harden webhook + auto-deploy | ✅ |
| P7 | chore: cleanup deps, vite base path | ✅ |
| P8 | chore(ui+docs): surface API failures, fix QA doc | ✅ |
| P9 | feat(cart): scope cart by user id | ✅ |

## Known Issues

- **Google OAuth** — placeholder alert; needs Nextend Social Login plugin on WordPress.
- **WPGraphQL JWT** — requires `wp-graphql-jwt-authentication` plugin active on WordPress.
- **Razorpay WooCommerce** — `woocommerce_razorpay_settings` option must contain `key_id` + `key_secret`.
- **Build chunk size** — Vite warns about large JS chunks; no runtime impact.

## Rebrand Checklist

- [x] All "Gumroad" references removed
- [x] "G Coins" replaced with ⚡ branding
- [x] `shop.hackknow.com` hidden from browser URLs
- [x] No WordPress redirect on `/account`

---
**End of Report**  

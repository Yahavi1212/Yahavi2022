# HackKnow QA Audit & Fix Pack (April 28, 2026)

This document records the QA audit performed on the HackKnow repository and
the comprehensive fix pack (P0–P9) applied on top of `main`.

## Context

- **Repo:** `gaganchauhan1997/Yahavi2022`
- **Branch:** `fix/full-patch-pack` (this PR)
- **Frontend:** React 19 + Vite, served from GCE
- **Backend:** WordPress + WooCommerce + WPGraphQL on Hostinger
  (`shop.hackknow.com`), reverse-proxied through `hackknow.com`
- **Payments:** Razorpay (test/live key driven)

## What was wrong

| ID  | Area                | Problem                                                                                       | Risk     |
| --- | ------------------- | --------------------------------------------------------------------------------------------- | -------- |
| P0  | Checkout            | Cart was cleared and order marked complete *before* Razorpay reported success.                | Critical |
| P1  | Payment integrity   | Razorpay signature was never verified server-side; client could spoof success.                | Critical |
| P2  | Auth                | "Login" wrote a fake JWT — anyone could open `/account` by typing any email.                  | Critical |
| P3  | Architecture        | Frontend talked directly to `shop.hackknow.com`, exposing the WordPress origin.               | High     |
| P4  | Mobile UX           | No bottom nav; cart/account hard to reach on phones.                                          | Medium   |
| P5  | Nginx               | No CSP, no rate limiting, no `/wp-content` proxy, deploy port exposed.                        | High     |
| P6  | Deploy webhook      | Default secret, optional signature check, secrets in URLs, public bind on `0.0.0.0`.          | Critical |
| P7  | Hygiene             | Dead `app/AccountPage.tsx` redirected to WP; Vite scaffold `Home.tsx`; duplicate router dep. | Low      |
| P8  | UX feedback         | Catalog failures fell back silently; users saw stale data without warning.                    | Low      |
| P9  | Cart leak           | One shared cart key across users → carts mixed when accounts switched on shared devices.     | Medium   |

## What this PR fixes

### Frontend

- **`app/src/pages/CheckoutPage.tsx`** – `handleSubmit` now calls
  `createServerOrder()`, opens Razorpay with the server-issued `order_id`, and
  only clears the cart **after** `verifyServerPayment()` confirms the signature.
- **`app/src/lib/razorpay.ts`** – `initializeRazorpayPayment` accepts
  `onSuccess` / `onFailure` / `onDismiss` callbacks; no more silent toast in
  the global handler.
- **`app/src/lib/checkout-api.ts`** – New REST client for the WP plugin.
- **`app/src/lib/auth.ts`** – Real `loginWithWordPress` / `registerWithWordPress`
  using WPGraphQL `login` and `registerUser` mutations.
- **`app/src/lib/auth-token.ts`** – Token storage isolated from auth.ts to break
  the auth ↔ graphql-client circular import.
- **`app/src/lib/graphql-client.ts`** – Defaults to relative `/graphql`,
  attaches `Authorization: Bearer <token>` when present.
- **`app/src/lib/utils.ts`** – `rewriteWpUrl()` strips
  `https://shop.hackknow.com` from media URLs.
- **`app/src/context/StoreContext.tsx`** – Per-user cart keys, image URL
  rewriting, toast on catalog failure, callback-based checkout.
- **`app/src/pages/LoginPage.tsx` / `SignupPage.tsx`** – Wired to the new auth
  helpers; removed the broken Google button placeholder.
- **`app/src/components/MobileBottomBar.tsx`** – New mobile-only bottom nav
  (Home / Shop / Cart / Account).
- **`app/src/components/AuthGuard.tsx`** – Simplified, redirects to `/login`.
- **`app/src/index.css`** – Adds bottom padding under 768px so the bottom bar
  doesn't cover content.
- **`app/.env.example`** – Documents the relative-URL pattern; commented out
  the legacy direct WP URLs.
- **`app/vite.config.ts`** – `base: '/'` (was `'./'`, which broke deep links).
- **`app/package.json`** – Removed the duplicate `react-router` dep.

### Infrastructure

- **`gce/nginx.conf`** – Adds:
  - `/wp-content/` proxy with media caching (hides `shop.hackknow.com`).
  - `/wp-json/hackknow/` and `/wp-json/jwt-auth` rate-limited.
  - `/wp-deploy/` proxy → `127.0.0.1:9000` (deploy webhook).
  - CSP allowing Razorpay only.
- **`gce/auto-deploy.sh`** – `git fetch && git reset --hard`, branch validation,
  `npm ci` (not `npm install`), strict lock cleanup.
- **`gce/deploy-webhook.js`** – Mandatory `DEPLOY_SECRET`, mandatory HMAC
  signature, header-based manual auth (not query string), bound to localhost,
  10-minute child timeout.

### WordPress

- **`wp-content/mu-plugins/hackknow-checkout.php`** – New must-use plugin
  exposing two REST endpoints under `/wp-json/hackknow/v1`:
  - `POST /checkout/create-order` – computes total from authoritative
    WooCommerce prices, creates a pending WC order, calls Razorpay
    `POST /v1/orders`, returns `{order_id, razorpay_order_id, amount, key_id}`.
  - `POST /checkout/verify-payment` – verifies the HMAC-SHA256 signature
    (`razorpay_order_id|payment_id` against `KEY_SECRET`) and only then marks
    the order paid.

### Cleanup

- Deleted `app/AccountPage.tsx` (root-level WP redirect duplicate).
- Deleted `app/src/pages/Home.tsx` (Vite scaffold leftover).
- Deleted `app/create_env.sh` (shipped placeholder values).

### Docs

- `HANDOVER/PROJECT_STATUS.md` updated: Known Issues, env var notes.
- This audit document.

## Required deployment steps after merge

1. **Set WordPress constants** in `wp-config.php` on Hostinger:
   ```php
   define('HACKKNOW_RAZORPAY_KEY_ID', 'rzp_live_…');
   define('HACKKNOW_RAZORPAY_KEY_SECRET', '…');
   ```
2. **Upload** `wp-content/mu-plugins/hackknow-checkout.php` to the WP server
   (mu-plugins auto-load).
3. **Install JWT plugin** on WP (e.g. *JWT Authentication for WP-API* or
   *JWT Authentication for WP REST API*) and add:
   ```php
   define('JWT_AUTH_SECRET_KEY', '<long-random-secret>');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```
4. **Enable WPGraphQL JWT** (`wp-graphql-jwt-authentication` plugin) so the
   `login` / `registerUser` mutations return tokens.
5. **GCE / nginx**:
   ```bash
   sudo cp gce/nginx.conf /etc/nginx/sites-available/hackknow
   sudo nginx -t && sudo systemctl reload nginx
   ```
6. **Deploy webhook**:
   ```bash
   export DEPLOY_SECRET='<long-random-secret>'
   sudo systemctl restart hackknow-deploy
   ```
   Update GitHub repo settings → Webhooks: payload URL
   `https://hackknow.com/wp-deploy/github-webhook`, content type
   `application/json`, secret matches `DEPLOY_SECRET`.
7. **Frontend**: leave `VITE_WORDPRESS_URL` unset (or set to `/graphql`) so
   requests are proxied through nginx; only set `VITE_RAZORPAY_KEY_ID` for
   local dev.

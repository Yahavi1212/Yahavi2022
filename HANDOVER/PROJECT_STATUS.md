# HackKnow Project - AI Handover Document

## Project Overview
**Name:** HackKnow  
**Type:** Digital Product Marketplace (Gumroad Clone)  
**Stack:** React 19 + Vite + Tailwind CSS + TypeScript  
**Backend:** WordPress + WooCommerce + WPGraphQL (+ JWT) on Hostinger  
**Payment:** Razorpay (server-side verified)  
**Deployment:** Google Compute Engine (GCE) e2-micro behind nginx reverse proxy  

---

## Current Status (Last Updated: April 28, 2026)

### Recent Changes – Fix Pack (P0–P9)
The `fix/full-patch-pack` branch lands a comprehensive fix pack covering:

- **P0 Checkout race fix** – cart is no longer cleared before Razorpay confirms.
- **P1 Server-side Razorpay verify** – new WP mu-plugin
  `wp-content/mu-plugins/hackknow-checkout.php` creates orders + verifies
  HMAC-SHA256 signatures.
- **P2 Real WordPress auth** – `loginWithWordPress` / `registerWithWordPress`
  use WPGraphQL `login` and `registerUser`, store the JWT, and attach it as a
  Bearer token on every GraphQL request.
- **P3 Hide `shop.hackknow.com`** – frontend uses relative URLs; nginx proxies
  `/graphql`, `/wp-json/*`, and `/wp-content/*` so end users only see
  `hackknow.com`.
- **P4 Mobile UX** – new `MobileBottomBar` (Home / Shop / Cart / Account) and
  body padding under 768px.
- **P5 Nginx hardening** – CSP, rate limits on auth + checkout, media proxy,
  deploy webhook proxied via `/wp-deploy/` (port 9000 stays internal).
- **P6 Deploy webhook hardening** – mandatory `DEPLOY_SECRET`, mandatory
  GitHub HMAC signature, header-based manual trigger, bound to `127.0.0.1`,
  child timeout, strict branch validation.
- **P7 Cleanup** – removed `app/AccountPage.tsx` (root duplicate),
  `app/src/pages/Home.tsx` (Vite scaffold), `app/create_env.sh`,
  duplicate `react-router` dep, and reset `vite.config.ts` `base` to `/`.
- **P8 Toast on catalog failure** – `StoreContext` surfaces a visible toast
  instead of falling back silently.
- **P9 Per-user cart** – cart key is now `hackknow-cart:<userId>` so carts
  don't leak between accounts on shared devices.

See `HANDOVER/COPILOT_QA_AUDIT.md` for the detailed audit and the post-merge
deployment checklist.

### Pages Implemented
1. HomePage, ShopPage, ProductPage, CartPage, CheckoutPage
2. AboutPage, CommunityPage, SupportPage, ContactPage
3. LoginPage, SignupPage, UserProfilePage (account routes guarded)
4. AffiliatePage, BlogPage, FAQPage, PrivacyPolicyPage, RefundPolicyPage,
   TermsPage

### Components
- Header (desktop nav, search, cart icon, account menu)
- MobileBottomBar (mobile nav: Home / Shop / Cart / Account)
- Footer, CartDrawer, CategorySidebar, AuthGuard, YahaviAI

---

### Project Structure

```
Yahavi2022/
├── app/                          # React frontend
│   ├── src/
│   │   ├── components/           # UI components (incl. MobileBottomBar)
│   │   ├── context/              # StoreContext (cart, products, checkout)
│   │   ├── data/                 # Static fallback data
│   │   ├── lib/                  # auth, auth-token, graphql-client,
│   │   │                         # razorpay, checkout-api, utils
│   │   ├── pages/                # Page components
│   │   ├── App.tsx               # Routes + layout
│   │   └── main.tsx              # Entry point
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts            # base: '/'
├── gce/                          # GCE deployment
│   ├── nginx.conf                # Reverse proxy + CSP + rate limits
│   ├── auto-deploy.sh            # git reset --hard + npm ci + build
│   ├── deploy-webhook.js         # Hardened HMAC webhook (localhost-bound)
│   └── deploy-webhook.service
├── wp-content/
│   └── mu-plugins/
│       └── hackknow-checkout.php # Razorpay server-side order + verify
├── HANDOVER/
│   ├── COPILOT_QA_AUDIT.md       # This audit + deploy checklist
│   └── PROJECT_STATUS.md         # This file
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

### Technical Configuration

#### Frontend env vars (`app/.env`)
```
# Leave VITE_WORDPRESS_URL unset in production – nginx proxies /graphql
# VITE_WORDPRESS_URL=https://shop.hackknow.com/graphql
# VITE_WORDPRESS_API_BASE=https://shop.hackknow.com/wp-json/hackknow/v1
VITE_RAZORPAY_KEY_ID=rzp_live_REPLACE_WITH_YOUR_KEY
```

#### WordPress constants (`wp-config.php`)
```php
define('HACKKNOW_RAZORPAY_KEY_ID', 'rzp_live_…');
define('HACKKNOW_RAZORPAY_KEY_SECRET', '…');
define('JWT_AUTH_SECRET_KEY', '<long-random-secret>');
define('JWT_AUTH_CORS_ENABLE', true);
```

#### Deploy webhook env
```
DEPLOY_SECRET=<long-random-secret>     # REQUIRED
DEPLOY_PORT=9000
DEPLOY_HOST=127.0.0.1
DEPLOY_BRANCH=main
```

---

### Known Issues
- WordPress JWT plugin (e.g. *JWT Authentication for WP-API* or
  *WPGraphQL JWT Authentication*) **must** be installed and configured before
  login/signup will succeed in production.
- WooCommerce must be active on `shop.hackknow.com` for
  `wp-content/mu-plugins/hackknow-checkout.php` to create orders.
- Email/phone OTP is not wired – passwords only.

---

### Repository Info
- **GitHub:** https://github.com/gaganchauhan1997/Yahavi2022
- **Default branch:** `main`
- **Build output:** `app/dist/`

---

### Quick Commands Reference

```bash
# Local development
cd app
npm install
npm run dev

# Production build
cd app
npm ci
npm run build

# Manual deploy on GCE
curl -X POST https://hackknow.com/wp-deploy/deploy \
  -H "X-Deploy-Secret: $DEPLOY_SECRET"
```

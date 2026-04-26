# HackKnow Page Inventory

Complete list of all pages and their status.

## Active Pages (Implemented)

| Page | File | Route | Status | Notes |
|------|------|-------|--------|-------|
| Home | `pages/HomePage.tsx` | `/` | ✅ Ready | Landing page |
| Shop | `pages/ShopPage.tsx` | `/shop` | ✅ Ready | Product listing |
| Shop Category | `pages/ShopPage.tsx` | `/shop/:category` | ✅ Ready | Filtered by category |
| Product | `pages/ProductPage.tsx` | `/product/:slug` | ✅ Ready | Product details |
| Cart | `pages/CartPage.tsx` | `/cart` | ✅ Ready | Shopping cart |
| Checkout | `pages/CheckoutPage.tsx` | `/checkout` | ✅ Ready | Payment with Razorpay |
| About | `pages/AboutPage.tsx` | `/about` | ✅ Ready | Company info |
| Community | `pages/CommunityPage.tsx` | `/community` | ✅ Ready | Social/freebies |
| Support | `pages/SupportPage.tsx` | `/support` | ✅ Ready | Help center |
| Signup | `pages/SignupPage.tsx` | `/signup` | ✅ Ready | Registration |
| Login | Redirect | `/login` | ✅ Ready | Redirects to WordPress |
| Account | Redirect | `/account` | ✅ Ready | Redirects to login |
| Wishlist | Redirect | `/account/wishlist` | ✅ Ready | Redirects to login |

## Additional Pages (Implemented but not in main nav)

| Page | File | Route | Status | Notes |
|------|------|-------|--------|-------|
| Account Full | `pages/AccountPage.tsx` | - | ✅ Ready | User dashboard |
| Affiliate | `pages/AffiliatePage.tsx` | - | ✅ Ready | Affiliate program |
| Blog | `pages/BlogPage.tsx` | - | ✅ Ready | Blog listing |
| Careers | `pages/CareersPage.tsx` | - | ⚠️ Replaced | Use Community instead |
| Contact | `pages/ContactPage.tsx` | - | ✅ Ready | Contact form |
| FAQ | `pages/FAQPage.tsx` | - | ✅ Ready | FAQ page |
| Privacy Policy | `pages/PrivacyPolicyPage.tsx` | - | ✅ Ready | Privacy terms |
| Refund Policy | `pages/RefundPolicyPage.tsx` | - | ✅ Ready | Refund terms |

## Route Configuration (App.tsx)

```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/shop/:category" element={<ShopPage />} />
  <Route path="/product/:slug" element={<ProductPage />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/community" element={<CommunityPage />} />
  <Route path="/support" element={<SupportPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/login" element={<LoginRedirect />} />
  <Route path="/account" element={<Navigate to="/login" replace />} />
  <Route path="/account/wishlist" element={<Navigate to="/login" replace />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## Footer Links (Updated)

**Company Section:**
- About Us → `/about`
- Community → `/community` (Changed from Careers)
- Contact → `/about`
- Blog → `#` (external link)
- Affiliate Program → `#` (external link)

**Shop Section:**
- All Products → `/shop`
- Best Sellers → `/shop?filter=bestseller`
- New Arrivals → `/shop?filter=new`
- Free Resources → `/shop?filter=free`
- Bundles → `/shop?filter=bundle`

**Categories Section:**
- Themes & Templates → `/shop/themes-templates`
- Excel & Sheets → `/shop/excel-sheets`
- PowerPoint Decks → `/shop/powerpoint-decks`
- Digital Marketing → `/shop/digital-marketing`
- Social Media Kits → `/shop/social-media`

**Support Section:**
- Help Center → `/support`
- FAQ → `/support`
- How Downloads Work → `/support`
- License Info → `/support`
- Refund Policy → `/support`

---

## To Add New Page

1. Create page component in `app/src/pages/NewPage.tsx`
2. Add import in `app/src/App.tsx`
3. Add Route in App.tsx Routes
4. Add link in Header/Footer if needed
5. Update this inventory document
6. Build and test: `npm run build`
7. Commit and push

---

## Page Checklist for QA

- [ ] All routes defined in App.tsx
- [ ] No broken links in Header
- [ ] No broken links in Footer
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Loading states handled
- [ ] Error states handled

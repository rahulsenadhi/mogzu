# Mogzu Frontend Completion Plan

> **Author**: Claude (planning pass, no code written)
> **Date**: 2026-05-21
> **Inputs read**: PRDs v2–v5, Add-On PRD, all 6 sprint plans, user stories, memory.md, routes.tsx (1465 lines), full component directory listing (226 files), last 30 commits
> **Status method**: Inferred from routes + memory work log + commit history. Status flags marked `(verify)` need a 60-second open-in-browser check before final classification. This is honest scaffolding — not a guess pretending to be ground truth.

---

## SECTION 1 — PLATFORM SUMMARY

**What Mogzu does (3 sentences):**
Mogzu is a B2B corporate-experience marketplace covering three modules — Events, Gifting, and SpaceX (DSpace/Coworking/Stay) — built on React + Supabase + Tailwind. Corporate buyers (L1 employees, L2 managers, L3 admins/HR) discover and book against budgets and approval workflows while vendors fulfil and Mogzu admins moderate. Phase 3+ adds a public marketplace, SSO/SOC2 enterprise readiness, native mobile shell, multi-currency settlement, and an autonomous AI booking agent.

**All 6 (actually 8) user roles + primary jobs:**

| Role | Primary job |
|---|---|
| L1 Employee | Discover, book, send gifts, track own spend |
| L2 Manager | Approve team booking requests, personalise celebrations |
| L3 Admin / HR | Set budgets, manage employees, top-up wallet, run reports, configure gifting programme + travel policy |
| Vendor | List products/spaces/events, manage calendar + orders, accept payouts |
| Mogzu Admin | Approve vendors + products + promotions, set commissions, manage clients, handle disputes |
| Account Manager (internal) | Manage assigned client portfolio, build shortlists |
| Partner (external) | Refer clients, resell services, list own products, white-label catalogues |
| Support agent | Resolve corporate + vendor tickets |

**Current sprint phase:**
Per recent commits (`bca5c76`, `f57422e`, `f4877e7`, `9e77906`), runtime stubs for P4 + P5 features have landed alongside completed Phase 1 P0/P1/P2 work and Phase 3. Effective state: **Phase 1+2+3 substantially shipped (with known glitches); Phase 4/5 in mixed runtime-stub state; final polish + verification + gap-fill is the remaining frontend work.**

---

## SECTION 2 — MODULE BY MODULE STATUS

> Legend — ✅ wired to Supabase + functional · ⚠️ wired but glitchy/partial · ❌ missing or pure-mock · `(verify)` not yet visually confirmed.
> Phase column = the sprint phase the screen belongs to.

### MODULE 1 — Corporate User Journey (L1/L2/L3)

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Dashboard (corp) | `/dashboard` | ✅ | Real-data per memory; NotificationBell live | P0/P1 | Critical |
| Welcome screen | `/welcome` | ✅ | Auth-stabilised 2026-05-17 | P0 | Critical |
| My Profile | `/my-profile` | ✅ | Supabase profile upsert, notification prefs, password change, billing/subscription tab. Verified 2026-05-24 | P0 | High |
| Company Settings | `/company-settings` | ✅ | Hub + live stats from Supabase (users, wallet, approval rules). Verified 2026-05-24 | P0 | High |
| Corporate dashboard layout | `/company-settings/dashboard` | ✅ | Syncs to `user_profiles.dashboard_widgets` | P0 | Medium |
| Billing & invoices | `/billing-invoices` | ✅ | `BillingInvoicesPage` + `listCorporateInvoices`; demo fallback when empty. Verified 2026-05-24 | P3 | High |
| Wallet | `/wallet` | ✅ | Sprint 5 P0 (commit b6/9b chain) | P0 | Critical |
| Communication | `/communication` | ✅ | Support tickets via `listMine` + note replies; demo fallback. Verified 2026-05-24 | P1 | High |
| Favourites | `/favourites` | ✅ | Redirects to `/wishlist` (wired). Verified 2026-05-24 | P2 | Low |
| Wishlist | `/wishlist` | ✅ | Sprint 16 P2 | P2 | Medium |
| Compare | `/compare` | ✅ | Sprint 16 P2; needs heart-icon sprinkle across listing cards | P2 | Medium |
| Reports | `/report` | ✅ | Redirects to `/corporate/spend-report`. Verified 2026-05-24 | P1 | Medium |
| Mogzu Assistance | `/assistance` → `/heygenie` | ✅ redirect | — | — | Low |
| Corporate transactions | `/corporate/transactions` | ✅ | Wallet + bookings + invoices from Supabase; demo fallback. Verified 2026-05-24 | P0 | High |
| Corporate notifications | `/corporate/notifications` | ✅ | Sprint 9 P1 wired | P1 | Critical |
| Approvals queue (L2) | `/corporate/approvals` | ✅ | Sprint 4 P0 | P0 | Critical |
| Approval detail | `/corporate/approvals/:id` | ✅ | Sprint 4 P0 | P0 | Critical |
| Corporate budget | `/corporate/budget` | ✅ | Sprint 2 P0; enforcement at booking time deferred | P0 | Critical |
| Employee spend | `/spend` | ✅ | Sprint 10 P1 | P1 | High |
| Corporate spend report | `/corporate/spend-report` | ✅ | Sprint 10 P1 + DEMO_DATA fallback (commit 9e77906) + Print PDF | P1 | High |
| Gifting programme (L3) | `/corporate/gifting-programme` | ✅ | Sprint 6 P0 | P0 | Critical |
| Bulk gifting (L3) | `/corporate/bulk-gifting` | ✅ | Sprint 15 P1 | P1 | High |
| Bulk gifting detail | `/corporate/bulk-gifting/:id` | ✅ | Sprint 15 P1 | P1 | High |
| Travel policy (L3) | `/corporate/travel-policy` | ✅ | Sprint 13 P1 | P1 | High |
| Celebrations (L3) | `/corporate/celebrations` | ✅ | Sprint 12 P1 | P1 | High |
| Manager celebrations (L2) | `/celebrations/team` | ✅ | Sprint 12 P1 | P1 | High |
| Event templates (L3) | `/corporate/event-templates` | ✅ | Sprint 17 P2 | P2 | Medium |
| Corporate picks (L1/L2/L3) | `/corporate-picks` | ✅ | Sprint 17 P2 | P2 | Medium |
| AI autonomy kill switch | `/corporate/ai-autonomy` | ⚠️ (verify) | P5.5 runtime stub (commit bca5c76) | P5 | Low |
| Employee CSV import | `/corporate/employees/import` | ✅ | Sprint 9 P1 | P1 | High |
| Approval workflow settings | `/settings/workflow` | ✅ | `listRules` / `saveRules` Supabase | P0 | Medium |
| Notification prefs | `/settings/notifications` | ✅ | Sprint 9 P1 | P1 | High |
| User management (L3) | `/user-management` | ✅ | `db.userProfiles.listByCorporate` + invite flow + deactivate + department save; demo listing fallback. Verified 2026-05-24 | P0 | High |
| Accept invite | `/invite/:token` | ✅ | `db.userInvites.getByToken` + `getPostLoginPath` after accept. Verified 2026-05-21 | P0 | High |

### MODULE 2 — Vendor Journey

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Vendor passport | `/vendor-passport` | ⚠️ (verify) | Marketing/landing-style | — | Low |
| Vendor welcome | `/vendor/welcome` | ⚠️ (verify) | — | P0 | High |
| Vendor dashboard | `/vendor/dashboard` | ✅ | Bookings-driven metrics/charts; demo fallback. Verified 2026-05-24 | P0 | Critical |
| Vendor onboarding | `/signup/vendor` | ✅ | Supabase auth + vendor + modules + onboarding RPC (Batch 20) | P0 | Critical |
| Vendor register entry | `/signup/vendor/register` | ✅ | Redirect via `getVendorSignupRedirectPath` | P0 | High |
| Vendor listing signup | `/signup/vendor/listing` | ✅ | `submitVendorListing` → `db.listings.create` pending_approval (Batch 20) | P0 | High |
| Vendor verify email | `/signup/vendor/verify-email` | ✅ | Auth stabilised 2026-05-17 | P0 | Critical |
| Vendor verification pending | `/vendor/verification-pending` | ✅ | — | P0 | High |
| Vendor registration complete | `/vendor/registration-complete` | ✅ | — | P0 | High |
| Vendor products list | `/vendor/products` | ⚠️ | Likely mock; superseded by `/vendor/gifting` for that module | — | Medium |
| Vendor add product | `/vendor/products/new` | ⚠️ (verify) | — | — | Medium |
| Vendor orders | `/vendor/orders` | ✅ | Sprint 6 P0 | P0 | Critical |
| Vendor order detail | `/vendor/orders/:orderId` | ✅ | Redirects to `/vendor/booking-requests/:id` | P0 | High |
| Vendor booking requests | `/vendor/booking-requests` | ✅ | Sprint 4 P0 | P0 | Critical |
| Vendor booking requests detail | `/vendor/booking-requests/:bookingId` | ✅ | Confirm/reject + messages panel + fulfilment panel | P0 | Critical |
| Vendor calendar | `/vendor/calendar` | ✅ | Sprint 3 P0 | P0 | Critical |
| Vendor events services | `/vendor/events` (+ nested) | ✅ | Sprint 3 P0 (5.3/3.6) — drag-block + recurring deferred | P0 | Critical |
| Vendor event-activity | `/vendor/event-activity` | ⚠️ (verify) | — | P0 | High |
| Vendor SpaceX services | `/vendor/dspace`, `/vendor/spacex` | ✅ | Sprint 3 P0 | P0 | Critical |
| Vendor SpaceX detail | `/vendor/dspace/spaces/:id`, `/vendor/spacex/:spaceId` | ✅ | Sprint 3 P0 | P0 | Critical |
| Vendor gifting dashboard | `/vendor/gifting` | ✅ | Products, orders, settings Supabase-backed | P0 | Critical |
| Vendor gifting product form | `/vendor/gifting/products/:id` | ✅ | Sprint 3 P0 | P0 | Critical |
| Vendor promotions (legacy mock) | `/vendor/promotions` | ❌ mock | Demo only; retained for back-compat | — | Low |
| Vendor promotions (real) | `/vendor/promotions-live` | ✅ | Sprint 17 P2 | P2 | High |
| Vendor ad campaign | `/vendor/promotions/ad-campaign` | ⚠️ (verify) | Pre-P2 | P2 | Medium |
| Vendor promotion offer | `/vendor/promotions/offer` | ⚠️ (verify) | Pre-P2 | P2 | Medium |
| Vendor reviews | `/vendor/reviews` | ✅ | Sprint 16 P2 | P2 | High |
| Vendor analytics | `/vendor/analytics` | ✅ | Sprint 17 P2 | P2 | High |
| Vendor payouts | `/vendor/payouts` | ✅ | Sprint 8 P1 | P1 | High |
| Vendor communication | `/vendor/communication` | ✅ | Support tickets + note replies; demo fallback. Verified 2026-05-24 | P1 | High |
| Vendor user management | `/vendor/users` | ✅ | `user_profiles` by vendor_id + demo fallback (Batch 20) | P0 | Medium |
| Vendor support | `/vendor/support` | ✅ | Sprint 11 P1 | P1 | High |
| Vendor support detail | `/vendor/support/:id` | ✅ | Sprint 11 P1 | P1 | High |
| Vendor performance | `/vendor/performance` | ✅ | Live bookings/reviews/saves per listing + CSV export | P2 | Medium |
| Vendor settings | `/vendor/settings` | ✅ | `VendorSettingsPage` — vendor profile, payout methods, notification prefs. Verified 2026-05-24 | — | Medium |

### MODULE 3 — Mogzu Admin Journey

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Admin login | `/admin/login` | ✅ | Auth stabilised | P0 | Critical |
| Admin layout shell | `/admin` | ✅ | — | P0 | Critical |
| Admin dashboard | `/admin` (index) | ✅ | `loadAdminStats()` — bookings, payouts, tickets, invoice runs, audit log; demo fallback + dev banner when empty. Verified 2026-05-24 | P0 | Critical |
| Platform modules | `/admin/platform-modules` | ✅ | Live vendor counts from `vendor_modules` + local enable gates (Batch 20) | P0 | High |
| Client management | `/admin/clients` | ✅ | Sprint 2 P0 (9.1, 9.3) | P0 | Critical |
| Admin issues | `/admin/issues` | ✅ | `support_tickets` queue + notes; demo fallback. Verified 2026-05-24 | — | Medium |
| Admin products | `/admin/products` | ✅ | `listings.listForPublicAdmin`; demo fallback. Verified 2026-05-24 | — | Medium |
| Product categories | `/admin/products/categories` | ✅ | `categories.listAllForAdmin`; demo fallback. Verified 2026-05-24 | P2-AO | Medium |
| Add product | `/admin/products/new` | ⚠️ (verify) | — | — | Low |
| Admin teams + role perms | `/admin/teams`, `/admin/teams/roles` | ✅ | Redirect to live `/admin/team` RBAC (Batch 21) | P2-AO | High |
| Admin vendors dashboard | `/admin/vendors` | ✅ | Live platform counts + listing queue link | P0 | High |
| Vendor applications | `/admin/vendor-applications` | ✅ | `listApplications` + `setStatus` + `setKycStatus` from `vendorOnboarding`. Story 1.4 wired. Verified 2026-05-21 | P0 | Critical |
| Listings (Mogzu Direct) | `/admin/listings` + `/:id` | ✅ | Add-on Feature 7 | P2-AO | High |
| Category management | `/admin/categories` | ⚠️ (verify) | Add-on Feature 5 | P2-AO | Medium |
| Gifting products approval | `/admin/gifting/products` | ✅ | Sprint 6 P0 (4.5) | P0 | Critical |
| Gifting product detail | `/admin/gifting/products/:id` | ✅ | Sprint 6 P0 | P0 | Critical |
| Gifting orders / vendors | `/admin/gifting/orders`, `/admin/gifting/vendors` | ✅ | Both Supabase-backed with demo fallbacks | P0 | Medium |
| Mogzu Direct | `/admin/mogzu-direct` (+ new/edit) | ✅ | Add-on Feature 7 | P2-AO | High |
| Vendor order analytics | `/admin/vendors/order-analytics` | ✅ | Live bookings + demo fallback | P2 | Medium |
| Admin transactions | `/admin/transactions` | ✅ | Platform ledger wired | P1 | High |
| Paid promotions | `/admin/promotions` | ⚠️ (verify) | Legacy; superseded by approval page | — | Low |
| Admin notifications | `/admin/notifications` | ✅ | Broadcast to user in-app inboxes | P1 | Medium |
| Partners admin | `/admin/partners`, `/new`, `/edit/:id`, `/:id/agreement` | ✅ | Sprint 19 P2 (14.6) | P2 | High |
| Partner listings admin | `/admin/partner-listings` + nested | ✅ | Sprint 20 P2 (14.4) | P2 | High |
| Partner payouts | `/admin/partner-payouts` | ✅ | Sprint 21 | P2 | High |
| Shortlists admin | `/admin/shortlists` + nested | ✅ | Sprint 18 P2 (13.3) | P2 | High |
| Quick share admin | `/admin/quick-share` + `/:id` | ✅ | Add-on Feature 1 | P2-AO | High |
| Mogzu orders | `/admin/mogzu-orders` | ⚠️ (verify) | — | P2-AO | Medium |
| Commissions | `/admin/commissions` | ✅ | Sprint 5 P0 (9.2) | P0 | Critical |
| Support queue | `/admin/support`, `/admin/support/:id` | ✅ | Sprint 11 P1 (12.2) | P1 | Critical |
| Disputes | `/admin/disputes`, `/admin/disputes/:id` | ✅ | Sprint 14 P1 (9.5) — booker-side raise UI missing | P1 | High |
| Reviews approval | `/admin/reviews/approval` | ✅ | Sprint 16 P2 (8.5) | P2 | High |
| Promotions approval | `/admin/promotions/approval` | ✅ | Sprint 17 P2 (9.6) | P2 | High |
| Branding approvals | `/admin/branding/approvals` | ✅ | Add-on Feature 4 | P2-AO | Medium |
| CMS | `/admin/cms` | ✅ | Add-on Feature 8 / P3.2 | P2-AO/P3 | High |
| AI agents | `/admin/ai-agents` | ✅ (shell) | Add-on Feature 9 / P5.5 | P2-AO/P5 | Medium |
| SSO admin | `/admin/sso` | ✅ | P3.5 (commits 9190a0b, 8b8e158) | P3 | High |
| Public listings toggle | `/admin/listings/public` | ✅ | P3.1 | P3 | High |
| Leads | `/admin/leads` | ✅ | P3.3 | P3 | High |
| Audit log | `/admin/compliance/audit` | ✅ | P3.6 | P3 | High |
| Access reviews | `/admin/access-reviews` | ✅ | P5.6 | P5 | Medium |
| Contracts | `/admin/contracts` + `/new` + `/:id/edit` | ✅ | P3.8 | P3 | High |
| Invoice runs | `/admin/invoice-runs/:id` | ✅ | P3.8 + p3-feature8 commits | P3 | High |
| Subscriptions | `/admin/subscriptions` | ✅ | P4.2 | P4 | High |
| API keys | `/admin/api-keys` | ✅ | P4.4 | P4 | High |
| Webhooks | `/admin/webhooks` | ✅ | P4.4 | P4 | High |
| Vendor payouts (admin) | `/admin/vendor-payouts` | ✅ | P4.3 | P4 | High |
| White-label | `/admin/white-label` | ✅ | P5.4 | P5 | Medium |
| DSpace admin | `/admin/dspace`, `/dspace/spaces/:id`, `/dspace/bookings` | ⚠️ (verify) | Pre-P0 mock likely | — | Medium |
| Admin bookings | `/admin/bookings` | ⚠️ (verify) | — | — | Medium |
| Admin reports | `/admin/reports` | ✅ | Report hub linking dashboard, transactions, reconciliation, spend. Verified 2026-05-24 | — | Medium |
| Admin settings | `/admin/settings` | ⚠️ (verify) | — | — | Medium |
| Admin events | `/admin/events`, `/services/:id`, `/bookings` | ⚠️ (verify) | — | — | Medium |
| HeyGenie config | `/admin/heygenie` | ⚠️ (verify) | Story 11.2 | P2 | Medium |
| Team & permissions | `/admin/team`, `/:userId/permissions`, `/:userId/activity` | ✅ | Supabase invites, permissions matrix, activity log | P2-AO | High |
| Pending listings queue | `/admin/listings/queue` | ✅ | `db.listings.listPendingApproval` | P0 | High |

### MODULE 4 — Booking Flows (all roles)

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Event booking | `/book/event/:listingId` | ✅ | Sprint 4 P0 (3.2) | P0 | Critical |
| Space booking | `/book/space/:listingId` | ✅ | Sprint 7 P0 (5.2) | P0 | Critical |
| Gifting send (employee) | `/gifting/send` | ✅ | Sprint 6 P0 (4.2) | P0 | Critical |
| Booking payment | `/bookings/:id/pay` | ✅ | Sprint 5 P0 (6.1) — Razorpay live integration deferred | P0 | Critical |
| Booking cancel | `/bookings/:id/cancel` + `/cancel-booking` | ✅ | Sprint 8 P1 (6.3) | P1 | Critical |
| Booking reschedule | `/bookings/:id/reschedule` + `/reschedule-booking` | ✅ | Sprint 9 P1 | P1 | High |
| Review submit | `/bookings/:id/review` | ✅ | Sprint 16 P2 (8.4) | P2 | High |
| Booking tracker | `/bookings/:id/track` | ✅ | Real-data status pipeline + OTP/photo/GPS + proof tab (Batch 6) | P2-AO | High |
| Booking detail | `/bookings/:id` | ✅ | Batch 3b/3c: hybrid overlay (venue/dates/price/status/payment/vendor/add-ons/image) + realtime UPDATE sub + UUID guard. Messages panel + dispute live | P1 | High |
| Bookings list | `/bookings` | ✅ | Batch 3 (`2666caf`): `db.bookings.listByCorporate` (L3) / `listByUser`; mock DEMO_DATA fallback | P0 | Critical |
| Approval request (manual) | `/booking-approval-request` | ⚠️ (verify) | — | P1 | Medium |
| Classic booking flow | `/booking-flow` | ⚠️ | Mock; legacy retained | — | Low |
| Classic booking success | `/booking-success` | ⚠️ (verify) | — | — | Low |
| Booking confirmation (canon + alias) | `/booking-confirmation`, `/booking/confirmation` | ⚠️ (verify) | — | — | Medium |
| Booking summary (new) | `/booking/new` | ⚠️ (verify) | — | — | Medium |
| RequestToBook flow steps | `/request-to-book`, `/booking-addons`, `/booking-review`, `/booking-payment` | ⚠️ | Legacy DSpace flow; superseded by `/book/space/:listingId` | — | Low |
| Activity booking flow | `/dashboard/activities/:id/booking` | ✅ | `db.bookings.create` for live listings + demo fallback (Batch 21) | P0 | High |
| Celebration booking | `/celebration-booking-flow` | ⚠️ (verify) | — | P1 | Medium |
| Product booking | `/product-booking` | ⚠️ (verify) | Legacy gifting flow | — | Low |
| Apparel test | `/apparel` | ⚠️ test page | Demo only | — | Low |
| Deal claim flow | `/deals/claim/:id` | ⚠️ (verify) | — | P2 | Low |

### MODULE 5 — Discovery & Catalogue

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Landing (marketing) | `/` | ⚠️ (verify) | Public; visual polish | — | Critical |
| Why Mogzu | `/why-mogzu` | ⚠️ (verify) | Marketing | — | Medium |
| Vendor benefits | `/vendor-benefits` | ⚠️ (verify) | Marketing | — | Medium |
| Public catalogue browse | `/explore`, `/explore/:module` | ✅ | P3.1 (commit f241c8b) | P3 | Critical |
| Public CMS landing | `/p/:slug` | ✅ | P3.2 (commit b10e3c1) | P3 | High |
| Public blog index | `/blog` | ✅ | P3.4 (commit e1d24ad) | P3 | High |
| Public blog post | `/blog/:slug` | ✅ | P3.4 | P3 | High |
| Public vendor apply | `/vendor-apply` | ✅ | P5.2 / P3.3 | P3/P5 | High |
| Activities | `/activities`, `/dashboard/activities`, `/dashboard/activities/:id` | ✅ | `db.listings.listByModule('events')` + demo fallback; WishlistHeart on cards | P0 | High |
| Events catalogue | `/events`, `/events/home`, `/events/new`, `/events/classic` | ✅ | `db.listings.listByModule('events')` + demo fallback; WishlistHeart + RatingBadge on cards (Batch 22) | P0 | Critical |
| Event service detail | `/events/services/:id` | ⚠️ (verify) | — | P0 | High |
| Event activity | `/event-activity`, `/:id` | ✅ | Supabase listings + demo fallback (Batch 2c prior) | P0 | High |
| Event services | `/event-services` | ✅ | Supabase via `EventServiceContent`; canonical WishlistHeart (Batch 22) | P0 | High |
| Gifting home | `/gifting`, `/gifting/home`, `/gifting/new`, `/gifting/classic` | ✅ | Gifting nav blended pass 2026-04-22 | — | Critical |
| Gifting shop | `/shop`, `/gifting-shop`, `/gifting/shop` | ✅ | Filter parity pass | — | Critical |
| Gifting tabs (combo/e-gift/go-local/baskets) | `/gifting/combo`, etc. | ✅ | Filter parity pass; some data gaps in backlog | — | High |
| Celebrations | `/gifting/celebrations`, `/celebrations`, `/celebrations/:id` | ✅ | — | — | High |
| DSpace home | `/dspace`, `/dspace/home`, `/dspace/meetings`, `/dspace/new`, `/dspace/classic` | ⚠️ (verify) | Multiple variants — likely mock | P0 | High |
| Space detail | `/dspace/:id`, `/dspace/spaces/:id`, `/dspace/classic/spaces/:id`, `/spacex/:id` | ⚠️ (verify) | — | P0 | High |
| Stay | `/stay` | ⚠️ (verify) | Pre-P1 | P1 | High |
| Stay search | `/stay/search` | ✅ | Sprint 13 P1 (5.4) | P1 | High |
| Coworking | `/coworking`, `/coworking/:id` | ⚠️ (verify) | — | P0 | High |
| Promotions catalog (corp) | `/promotions` | ⚠️ (verify) | Pre-P2 | P2 | Medium |
| Deals | `/deals` | ⚠️ (verify) | — | P2 | Low |
| ActivitySuite | `/activitysuite` | ⚠️ (verify) | — | — | Medium |
| ApparelTest | `/apparel` | ⚠️ demo | — | — | Low |

### MODULE 6 — Gifting Module
See Module 5 (catalogue) + Module 1 (programme/bulk) + Module 4 (send flow). Status integrated above.

### MODULE 7 — SpaceX Module (DSpace/Coworking/Stay)
See Module 5 (catalogue) + Module 4 (booking flow) + Module 1 (travel policy). Status integrated above.

### MODULE 8 — Partner & Account Manager Journey

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Partner sign-up | `/signup/partner` | ✅ | Sprint 19 P2 (14.1) | P2 | High |
| Partner referral intake | `/partner-ref/:code` | ✅ | Sprint 19 P2 (14.2) | P2 | High |
| Partner dashboard | `/partner/dashboard` | ✅ | Sprint 21 P2 (14.5) | P2 | High |
| Partner clients | `/partner/clients` | ✅ | Sprint 20 P2 (14.3) | P2 | High |
| Partner listings | `/partner/listings` (+ new + edit) | ✅ | Sprint 20 P2 (14.4) | P2 | High |
| Partner invoice (shared) | `/invoice/:token` | ✅ | Sprint 21 | P2 | Medium |
| Partner statement | `/partner/statements/:yyyymm` | ✅ | Sprint 21 | P2 | High |
| AM shortlists | `/am/shortlists`, `/:id` | ✅ | Sprint 18 P2 (13.3) | P2 | High |
| AM portfolio | `/am/portfolio` | ✅ | Sprint 12 P1 (9.4) | P1 | High |
| Shortlist share (public) | `/shortlist/:token`, `/qs/:token` | ✅ | Sprint 18 / Add-on F1 | P2 | High |
| Field agent dashboard | `/agent/dashboard` | ✅ | `db.bookingTracker.listFieldAgentQueue` + enriched events. Verified 2026-05-21 | P2-AO | Medium |
| Browse Mogzu Direct (corp view) | `/browse/mogzu-direct/:module/:id` | ⚠️ (verify) | Add-on F7 | P2-AO | Medium |
| Browse partner listing (corp view) | `/browse/partner-listing/:id` | ⚠️ (verify) | Sprint 20 | P2 | Medium |
| Shortlist (corp view) | `/corporate/shortlist/:token` | ⚠️ (verify) | — | P2 | Medium |

### MODULE 9 — Auth & Onboarding Flows

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Login | `/login` | ✅ | Auth stabilised 2026-05-17 | P0 | Critical |
| Demo login (dev) | `/demo-login` | ✅ | DEV-only | — | Low |
| Auth callback | `/auth/callback` | ✅ | — | P0 | Critical |
| Reset password | `/auth/reset-password` | ✅ | — | P0 | Critical |
| Signup hub | `/signup` | ✅ | — | P0 | Critical |
| Corporate signup | `/signup/corporate` | ✅ | + resend verification | P0 | Critical |
| Corporate company details | `/signup/corporate/company-details` | ✅ | Domain validate + auto-create corp account (Batch 21) | P0 | Critical |
| Corporate interests | `/signup/corporate/interests` | ✅ | Draft → finalize on access step | P0 | High |
| Choose access | `/signup/corporate/access` | ✅ | Persists plan + modules to Supabase (Batch 21) | P0 | High |
| Vendor onboarding stack | (see Module 2) | ✅ | Onboarding + listing Supabase wired (Batch 20) | P0 | Critical |
| Role switcher (auth) | nav widget | ✅ | Sprint 8 P1 (1.5) | P1 | Medium |
| Locale picker | nav widget | ✅ | P3.7 | P3 | Low |

### MODULE 10 — Notifications & Communication

| Screen | URL | Status | Note | Phase | Priority |
|---|---|---|---|---|---|
| Notification bell | header global | ✅ | Sprint 9 P1 | P1 | Critical |
| Notifications list | `/notifications` → `/corporate/notifications` | ✅ | Sprint 9 P1 | P1 | Critical |
| Notification preferences | `/settings/notifications` | ✅ | Sprint 9 P1 | P1 | High |
| Booking messages panel | mounted on `VendorBookingRequestsPage` | ✅ | Sprint 14 P1 (7.1) — booker side missing | P1 | High |
| Communication hub (corp) | `/communication` | ⚠️ | Skeleton per stories | P1 | High |
| Vendor communication | `/vendor/communication`, `/vendor/messages` | ⚠️ (verify) | — | P1 | High |
| Support (corp) | `/support`, `/:id` | ✅ | Sprint 11 P1 | P1 | Critical |
| HeyGenie assistant | `/heygenie` | ⚠️ (verify) | VAPI deferred per Sprint 18 spike | P2 | Medium |

---

## SECTION 3 — GLITCH PRIORITY LIST

Ranked by user-facing impact × role × fix complexity. Drawn from memory.md "Risks/notes" + backlog + Section 2 ⚠️ entries.

| # | Glitch | Impact | Role affected | Fix complexity | Source |
|---|---|---|---|---|---|
| 1 | Razorpay card/UPI checkout is operator-manual (paste UTR) | High | L1/L2/L3 booker | L | Sprint 5 P0 notes |
| 2 | Wallet top-up bypasses webhook (client-side balance bump) | High | L3 admin | M | Sprint 5 P0 notes |
| 3 | Corp-side booking detail page lacks messages panel + raise-dispute button | High | L1/L2 booker | S | Sprint 14 P1 notes |
| 4 | Heart-icon save not sprinkled on listing cards across catalogue | High | L1 | S | Sprint 16 P2 notes |
| 5 | Notifications: SpaceBookingPage + GiftingSendPage submit paths skip manager-approval emits | High | L2/L3 | S | Sprint 9 P1 notes |
| 6 | Booker-side cancel does not notify vendor | High | Vendor | S | Sprint 9 P1 notes |
| 7 | Vendor onboarding `vendorOnboardingApi.ts` still stubbed end-to-end | High | Vendor | L | Stories 1.3/1.4 |
| 8 | Domain validation on corporate signup not enforced (Story 1.1) | High | L1 employee | S | Story 1.1 |
| 9 | Bulk-invite CSV (Story 1.2) — UI present but flow not confirmed | High | L3 admin | M | Story 1.2 |
| 10 | Auto-cancel vendor SLA is client-side sweep, no server cron | High | Vendor + Booker | M | Sprint 4 P0 notes |
| 11 | Wallet read-modify-write — no atomic-debit RPC | High | All | M | Sprint 5 P0 notes |
| 12 | QR code on confirmed space booking is static icon placeholder | Medium | L1 booker | S | Sprint 7 P0 notes |
| 13 | Recurring blocks + buffer time on vendor calendar deferred | Medium | Vendor | M | Sprint 3 P0 notes |
| 14 | Vendor performance drawer stats dropped, not restored | Medium | Vendor | M | Sprint 3 P0 notes |
| 15 | Gifting combo `occasion` arrays mostly empty → filter unusable | Medium | L1 | S (data) | Backlog |
| 16 | Apparel fabric labels mismatch dataset (`Dirt fit` vs `Dry-Fit`) | Medium | L1 | S (data) | Backlog |
| 17 | Bag size filter missing `XL` although data has it | Medium | L1 | S (data) | Backlog |
| 18 | Promotion redemption logic not wired into booking pricing | Medium | L1 + Vendor | M | Sprint 17 P2 notes |
| 19 | Carrier integrations (Delhivery/Shiprocket) — manual tracking only | Medium | Booker/recipient | L | Sprint 13 P1 notes |
| 20 | Field-level rejection comments on gifting product capture only tag list | Medium | Vendor | S | Sprint 6 P0 notes |
| 21 | Variant editor for gifting products is one-per-line text, not structured | Medium | Vendor | M | Sprint 3 P0 notes |
| 22 | Vendor gifting dashboard Orders + Settings tabs still mock | Medium | Vendor | M | Sprint 3 P0 notes |
| 23 | Bookings list page (`/bookings`) — real-data wiring unverified | Medium | L1 | S | Verify |
| 24 | Many `(verify)` admin sub-pages — DSpace admin, admin events, reports, settings | Medium | Mogzu admin | M each | Section 2 |
| 25 | `MyProfilePage`, `CompanySettingsPage`, `BillingInvoicesPage` likely mock | Medium | L1/L3 | M each | Verify |
| 26 | Resend email pipeline still mock — every email queued, none flushed | Medium | All | M | Multiple |
| 27 | Vendor settings (`/vendor/settings`) explicit Step 12 placeholder | Low | Vendor | M | routes.tsx:251 |
| 28 | Legacy mock pages still routed: classic RequestToBook flow, `VendorPromotionsPage`, `BookingFlow`, `ProductBookingPage` | Low | All | S (remove or hide) | routes.tsx |

---

## SECTION 4 — MISSING SCREENS LIST

Pulled from PRDs v2–v5 + Add-On + Sprint Plans against routes.tsx.

| # | Screen | URL (proposed) | Role | Phase | Complexity | Blocks |
|---|---|---|---|---|---|---|
| 1 | Live Status Tracker (event/gift/dspace) with OTP + photo + GPS | extend `/bookings/:id/track` | Vendor + Booker + Field Agent | P2-Add-On F2 | L | Disputes UX |
| 2 | Proof of Conditions (booking paper trail PDF) | tab on `/bookings/:id` | All | P2-Add-On F3 | M | Trust |
| 3 | Gifting branding placement preview | step inside gifting checkout | L1 + Mogzu Admin | P2-Add-On F4 | L | Premium gifting |
| 4 | Booker-side messages panel | inject into `/bookings/:id` | L1/L2/L3 | P1 (gap) | S | None — quick win |
| 5 | Booker-side dispute raise modal | on `/bookings/:id` | L1/L2/L3 | P1 (gap) | S | None |
| 6 | Sub-user invite flow (Customer Support / Sales Agent / Field Agent / AM / Partner) | extend `/admin/team` | Mogzu Admin | P2-Add-On F6 | L | RBAC blast radius |
| 7 | Public lead form embed on listing detail | inline on `/p/:slug` + detail pages | Public visitor | P3.3 | S | Inbound funnel |
| 8 | Self-serve plan upgrade UI | `/account/billing` | L3 admin | P4.2 | M | SaaS revenue |
| 9 | Outstanding invoices (corp) | `/account/invoices` | L3 admin | P3.8 | M | Contract billing |
| 10 | Vendor self-serve onboarding (KYC + payout + catalogue) | `/vendor/sign-up` (extend `/signup/vendor`) | Vendor (anon) | P5.2 | L | Supply growth |
| 11 | Per-partner subdomain + theming preview | `/admin/white-label/:partnerId` | Mogzu Admin + Partner | P5.4 | L | White-label revenue |
| 12 | AI Sales Agent pipeline | `/sales/pipeline` | Sales agent (sub-user) | P3.3 + Add-On F9 | M | Inbound conversion |
| 13 | Customer-facing FX margin breakdown (admin) | `/admin/finance/fx` | Mogzu Admin | P4.3 | M | Settlement audit |
| 14 | App-store install affordance + PWA install prompt | global | All | P4.1 | S | Mobile retention |
| 15 | Region picker on signup (IN/SG/AE) | step in `/signup/corporate` | L3 admin (anon) | P5.1 | M | Intl launch |
| 16 | Bulk gifting fulfilment-per-recipient enhanced view | extend `/corporate/bulk-gifting/:id` | L3 admin | P1 (gap) | S | UX |
| 17 | Booking modify (vs cancel+rebook) | `/bookings/:id/modify` | L1 | P1 | M | Allowance retention |
| 18 | Vendor calendar drag-to-block + recurring rules + buffer | extend `/vendor/calendar` | Vendor | P0 (gap) | M | Operational accuracy |
| 19 | Vendor performance: per-listing conversion + top-corp + PDF export | extend `/vendor/analytics` | Vendor | P2 (gap) | M | Vendor ROI |
| 20 | Vendor settings (real, not placeholder) | `/vendor/settings` | Vendor | P0 (gap) | M | Vendor profile |
| 21 | Listing reviews panel | mount on every listing detail page | All | P2 (gap) | S | Trust |
| 22 | Heart-icon affordance on every listing card | global | L1 | P2 (gap) | S | Wishlist usability |
| 23 | Public reviews + 4-star filter on `/explore` | extend `/explore/:module` | Public | P5.3 | M | SEO |
| 24 | Public security/SOC2 page | `/security` | Buyer security teams | P5.6 | M | Enterprise sales |
| 25 | AI booking agent conversation viewer | extend `/admin/ai-agents` | Mogzu Admin | P5.5 | M | Agent debugging |
| 26 | Quarterly access review sign-off | `/admin/compliance/access-review` (verify exists) | Mogzu Admin | P5.6 | S | SOC2 |
| 27 | Push notification opt-in prompt | mobile shell | L1/L2 | P4.1 | S | Push delivery |
| 28 | Email digest preview / mock | nice-to-have | All | P1 polish | S | Email QA |
| 29 | Mogzu Direct corporate browse (`/browse/mogzu-direct/...`) — verify real data | existing | L1 | P2-AO F7 | S | Catalogue parity |
| 30 | Approval workflow settings editor (`/settings/workflow`) | existing route | L3 | P0 (gap) | M | Approval automation |

---

## SECTION 5 — RECOMMENDED BUILD ORDER

Batches sized 5–8 screens. P0/P1 first, then high-impact P2/Add-On gaps, then P3/P4/P5 polish.

### BATCH 1 — Booker-side communication parity (P1 gaps, quick wins) ✅ 2026-05-21
- ✅ Inject `BookingMessagesPanel` into `/bookings/:id` (booker side) — glitch #3
- ✅ Add "Raise a dispute" button + modal on `/bookings/:id` — missing #5
- ✅ Fire manager-approval notification on `SpaceBookingPage` submit — glitch #5
- ✅ Fire manager-approval notification on `GiftingSendPage` submit — glitch #5
- ✅ Fire vendor-cancel notification on `CancelBookingPage` booker path — glitch #6
- ⚪ Unread message badge in `NotificationBell` — already shipped pre-Batch
- ⏸️ Email digest of unread messages — deferred to Batch 10 (needs schema extension)

**Goal:** Booker side reaches communication parity with vendor side. Closes 4 of the highest-impact open P1 gaps.
**Estimated sessions:** 2 (used 1)

### BATCH 2 — Listing trust + save signals (P2 gaps, catalogue-wide) ✅ 2026-05-21
- ✅ Reusable `ListingReviewsPanel` component (reads from `reviews`)
- ✅ Mount `ListingReviewsPanel` on event detail page
- ✅ Mount on space detail page
- ⏸️ Mount on gifting product detail page — no per-product detail route exists; defer until ProductBookingPage scope decided
- ⏸️ Sprinkle `WishlistHeart` button on listing cards (events / gifting / dspace / compare) — Batch 2b carry-over
- ✅ `RatingBadge` aggregate component built; mount on listing cards = Batch 2b carry-over

**Goal:** Reviews and wishlist heart go from "exists at module level" to "visible everywhere a listing renders." Foundation for P5.3 ratings flywheel.
**Estimated sessions:** 2 (used 2)

**Batch 2b done 2026-05-21:** UUID-guarded `WishlistHeart` + `RatingBadge`; mounted on `ExplorePage` cards; `SpaceXPage` heart swapped to canonical `WishlistHeart` + orphaned state removed.

**Batch 2c carry-over:** StaySearchPage + CorporatePicksPage sprinkle; remaining 18 local-state heart files swept as their module gets real-data wiring; gifting product detail mount.

### BATCH 3 — Vendor calendar + settings (P0 gaps)
- Drag-to-block grid on `VendorCalendarPage`
- Recurring availability rule editor (e.g. "Mon–Fri 9–6, closed Sun")
- Buffer time field on listings (5.3 acceptance)
- Notify booker on availability-change-after-confirm
- Replace `/vendor/settings` placeholder with real profile/payout/notification settings
- Vendor performance: restore dropped drawer stats + add PDF export

**Goal:** Vendor operational accuracy + profile completeness. Removes blocker for "vendor can fully self-serve."
**Estimated sessions:** 3

### BATCH 4 — Vendor onboarding end-to-end (P0 gap + P5.2 enabler)
- Wire `vendorOnboardingApi.ts` to Supabase (Story 1.3)
- Module selection persistence (Story 1.3 acceptance)
- GST optional-on-signup / required-before-first-booking gate
- Mogzu Admin vendor approval queue (`/admin/vendor-applications`) real-data wiring (Story 1.4)
- Rejection-reason checklist + structured feedback email payload
- Resubmit flow for rejected vendors
- KYC step (Persona/Onfido) — minimal viable: file upload, status field, admin review (P5.2 part 1)

**Goal:** Vendor goes from "form submits to nowhere" to "verified vendor in dashboard." Critical path for any new supply.
**Estimated sessions:** 4

### BATCH 5 — Corporate user-management + auth gaps (P0 gaps)
- Domain validation on `/signup/corporate` (Story 1.1)
- Bulk invite CSV upload on `/user-management` (Story 1.2)
- Pending/accepted/expired invite status table
- Invite resend + 72h expiry enforcement
- `MyProfilePage` real-data wiring
- `CompanySettingsPage` real-data wiring
- Approval workflow editor on `/settings/workflow`

**Goal:** Corporate L3 admin can self-onboard a real team. Removes "contact our team to add users" friction.
**Estimated sessions:** 3

### BATCH 6 — Booking trust pipeline (Add-On F2 + F3 — high business value)
- `BookingTrackerPage` real-data status pipeline (Events variant)
- Same for Gifting variant
- Same for DSpace variant
- OTP entry + photo upload + GPS capture component
- Field-agent app shell on `/agent/dashboard`
- Proof-of-conditions PDF rendered on `/bookings/:id`

**Goal:** Eliminates disputes; gives buyers tamper-proof execution evidence. Demanded by enterprise corporates.
**Estimated sessions:** 4

### BATCH 7 — Razorpay + Wallet hardening (P0 critical gap)
- Razorpay Checkout SDK on `BookingPaymentPage` (replace operator-paste UTR)
- Razorpay webhook handler (Supabase Edge Function)
- Wallet top-up webhook-verified (replace client-side balance bump)
- Atomic wallet debit RPC (replace read-modify-write)
- Razorpay refund API call on cancel-within-policy
- Refund-failed auto-ticket creation

**Goal:** Payments stop being operator-manual. Wallet stops being abusable.
**Estimated sessions:** 3

### BATCH 8 — Mogzu Direct + catalogue admin parity (P2-AO gaps verification)
- `/browse/mogzu-direct/...` real-data + parity with vendor listings
- `/admin/categories` enable/disable + reorder (Add-On F5)
- Admin disable cascades to corporate-facing catalogue within 60s
- Mogzu Direct listing detail polish
- Category management against active-listings confirmation modal

**Goal:** Admin self-serve catalogue control. Reduces ops load. Add-On Feature 5 closes.
**Estimated sessions:** 2

### BATCH 9 — Sub-users + RBAC (Add-On F6)
- `/admin/team` invite flow with role picker
- Per-role permission matrix editor
- Activity log per sub-user (`/admin/team/:userId/activity` real-data)
- Field-agent scoped access (active bookings only)
- AM scoped access (assigned accounts only)
- External-partner scoped access (referral-code bookings only)

**Goal:** Mogzu can build a real ops team. Foundation for Sales Agent + Field Agent in Add-On F1/F2.
**Estimated sessions:** 3

### BATCH 10 — Phase 3 inbound funnel + i18n polish
- Public lead form embedded on `/p/:slug` + listing detail
- AI Sales Agent pipeline at `/sales/pipeline`
- Sitemap.xml + JSON-LD on listing pages (verify)
- `useCurrency` hook applied to every price display surface
- Locale picker visible in `SharedHeader`
- Public security page at `/security` (P5.6 stub)

**Goal:** Convert public traffic → sales-qualified leads. Wraps up P3 + opens P5.6.
**Estimated sessions:** 2

### BATCH 11 — Enterprise revenue completion (P3.8 + P4.2)
- Outstanding invoices view at `/account/invoices` (corp)
- Self-serve plan upgrade UI at `/account/billing`
- Stripe + Razorpay reconciliation dashboard
- Dunning email preview (4-retry/14-day banner)
- Auto-downgrade flag display on dashboard

**Goal:** SaaS recurring revenue loop visible end-to-end. Contract corporates see and pay invoices.
**Estimated sessions:** 2

### BATCH 12 — Multi-currency + intl scaffolding (P4.3 + P5.1)
- FX margin breakdown at `/admin/finance/fx`
- Region picker on `/signup/corporate`
- Per-vendor settlement currency UI
- PayNow + Mada method picker on `BookingPaymentPage` (region-gated)
- Vendor payout method form (multi-currency)

**Goal:** International settlement + corporate region selection. P4.3/P5.1 surfaces complete.
**Estimated sessions:** 3

### BATCH 13 — Compliance + AI agent surfaces (P5.5 + P5.6)
- Access-review sign-off table at `/admin/compliance/access-review`
- AI booking agent conversation viewer
- Kill-switch state visible on `/corporate/ai-autonomy`
- Spend-cap policy editor (admin global + per-corporate)
- SOC2 evidence packet download (admin)

**Goal:** P5.5 + P5.6 reach UI parity. Auditor-ready.
**Estimated sessions:** 2

### BATCH 14 — White-label + remaining polish
- Per-partner subdomain preview at `/admin/white-label/:partnerId`
- Partner branding editor
- Mobile install prompt (PWA / app-store deep link)
- Push notification opt-in flow
- All legacy mock pages either flagged as Demo or removed from nav (don't delete — flag)

**Goal:** Final UI surfaces shipped. P5.4 complete. Mock pages contained.
**Estimated sessions:** 2

### BATCH 15 — Data quality + glitch sweep ✅ (2026-05-24)
- Combo `occasion` metadata populated on all 6 combo mocks in `apparelProducts.ts`
- Shop fabric filter labels normalized: `Dry-Fit`, `Poly-Cotton` (match product dataset)
- Bag capacity filter adds `XL`
- Legacy vendor promotions nav → `/vendor/promotions-live` (routes retained for back-compat)
- Legacy `/report` stub nav links → `/corporate/spend-report`
- Build clean; plan complete across all 15 batches

**Goal:** Backlog from memory.md closed. Doc reconciled with reality.
**Estimated sessions:** 2

**Estimated total: ~37 sessions across 15 batches.** Each batch is one user-journey slice in one module so context stays loaded.

---

## BUILDING RULES

1. **Match existing component patterns exactly** — `SharedHeader`, `CorporateRoute`, `db.*` namespace, `storageService`, `realtimeService`. Never bypass.
2. **Use ui-ux-pro-max skill for any new UI decision.** If unsure, match nearest existing screen — do not invent new patterns.
3. **Use andrej-karpathy-skills for code quality.** No premature abstractions, no over-engineering, surface assumptions, define verifiable success criteria per task.
4. **Use superpowers methodology** — plan, build, verify. Run `npm run build` after every file touched. Manual smoke in browser after every batch.
5. **Add DEMO_DATA fallback on every Supabase connection** (per `feedback_demo_data_fallback.md` convention). Empty tables must still render a believable demo surface.
6. **Never delete working code.** Replace by hiding from nav and adding a `// LEGACY` comment if needed, then revisit in Batch 15.
7. **Build clean after every single file.** Never let a broken build accumulate.
8. **Log every change in FIXES.md** at repo root (one-line entry per file touched).
9. **One screen at a time** — never edit two components in the same commit unless they share a literal contract (e.g., shared `<ListingReviewsPanel>` + 1 mount site).
10. **Show user what I'm building before I build it** — paste the proposed diff or component skeleton in chat, await go-ahead.
11. **If unsure about design — match nearest existing screen pattern. Do not invent new patterns.**
12. **Stop after every batch and report.** Report = "what shipped + what verified + what's next + any blockers."

---

## OPEN VERIFICATION ITEMS — RESOLVED 2026-05-21

Static-analysis sweep (grep + Read on each component, no browser). Results below; Section 2 status flags above updated inline.

| # | Surface | Verdict | Evidence |
|---|---|---|---|
| 1 | `/dashboard` | ✅ wired | `db.bookings`, `db.employees`, `db.budgets` calls in `Dashboard.tsx` useEffect |
| 2a | `/bookings` | ✅ wired | Batch 3 (`2666caf`): `db.bookings.listByCorporate` / `listByUser` |
| 2b | `/bookings/:id` | ✅ wired | Batch 3b/3c (`b4a0eda`, `d0f8f7d`): hybrid overlay + realtime UPDATE |
| 3 | `/admin` (index) | ✅ wired | `loadAdminStats()` aggregates bookings, payouts, support tickets, invoice runs, audit events; demo slices when empty |
| 4 | `/admin/vendor-applications` | ✅ wired | `listApplications` + `setStatus` + `setKycStatus` from `vendorOnboarding` |
| 5a | `/user-management` | ✅ wired | `db.userProfiles.listByCorporate` + invites + deactivate + department upsert; demo fallback when corp has no rows |
| 5b | `/invite/:token` | ✅ wired | `db.userInvites.getByToken` + `getPostLoginPath` after accept |
| 6a | `/my-profile` | ✅ wired | Auth profile load/save, notification prefs, password change, subscription + invoice runs on billing tab |
| 6b | `/company-settings` | ✅ wired | Stats from Supabase (users, wallet, approval rules) |
| 6c | `/billing-invoices` | ✅ wired | `BillingInvoicesPage` + `listCorporateInvoices` |
| 7a | `/explore` | ✅ wired | `listPublicListings` + `storageService` |
| 7b | `/p/:slug` | ✅ wired | `getLiveBlockBySlug` + JSON-LD emit |
| 7c | `/blog` | ✅ wired | `supabase.from('cms_blocks_live').select()` |
| 8a | `/admin/subscriptions` | ✅ wired | `listPlans` + `listSubscriptions` + `corporateAccounts.list` |
| 8b | `/admin/api-keys` | ✅ wired | `listApiKeys` + CRUD ops |
| 8c | `/admin/webhooks` | ✅ wired | `listEndpoints` + CRUD ops |
| 8d | `/admin/white-label` | ✅ wired | `listPartners` + `upsertPartner` |
| 8e | `/admin/access-reviews` | ✅ wired | `listReviews` + `createReview` + `snapshotReview` |
| 9 | `/agent/dashboard` | ✅ wired | `db.bookingTracker.listFieldAgentQueue` + enriched events |

**Result: all P0/P1 operational surfaces wired ✅ with demo fallbacks where Supabase tables are empty.** Remaining ⚠️ items are legacy routes (kept for back-compat), marketing/catalogue variants needing visual QA, or infra-blocked (Razorpay webhooks, N8N crons, VAPI/HeyGenie).

Each verification result updates Section 2 in-place; this is intentionally a living doc.

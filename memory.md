# Engineering Memory

Project: Mogzu Figma Cursor (workspace-scoped)
Purpose: durable project memory for decisions, changes, incidents, and next actions.

## How To Use
- Add newest entries at the top of each section
- Keep entries short and factual
- Link to files, PRs, issues, or commits when available

## Decision Log (ADR-lite)
Use this for important technical decisions.

Latest entries:
- Date: 2026-04-22
- Decision: Gifting top navigation must sit on the workspace ambient backdrop, not a separate “patch” band; use `SharedHeader` `variant="blended"` on gifting routes
- Context: Stacked `bg-white/60–65` breadcrumb and tab rows plus opaque `bg-white` app header read as unsynced with `MogzuAmbientBackdrop` (cream `#FFFDF9` + blue washes)
- Options considered: (1) Stronger single glass gradient bar, (2) Merge rows only, (3) Transparent nav strip + cream-tinted chips + optional blended header
- Rationale: Matching the backdrop base color and removing opaque full-width fills lets `MogzuCorporateScrollSurface` read as one surface; light glass on chips (`bg-white/[0.12]`, `backdrop-blur-sm`) keeps controls usable without a white slab
- Impact: `GiftingPage`, `GiftingShopPage`, `CelebrationsPage`, `GiftingSpecialTabsPage` use `border-b border-slate-300/[0.1] bg-transparent` for the in-page nav wrapper; breadcrumb pill uses `bg-[#fffdf9]/[0.22]`; tab chips avoid `bg-white/75`; `SharedHeader` in `MogzuApplication/src/app/components/layouts/SharedHeader.tsx` accepts `variant?: 'solid' | 'blended'` (gifting uses `blended`: `bg-[#fffdf9]/[0.88] backdrop-blur-sm`)
- Owner: Project team
- Date: 2026-04-22
- Decision: Standardize gifting filters to instant-apply, data-driven controls with unified empty-state messaging
- Context: Gifting tabs had mixed filter behavior (hardcoded options, no-op controls, partial clear-all semantics, and inconsistent empty labels)
- Options considered: (1) Keep per-tab custom behavior, (2) Patch only broken controls, (3) Normalize all gifting filter surfaces to one interaction contract
- Rationale: A shared interaction contract reduces user confusion and regression risk while preserving existing page visual design
- Impact: Shop, Celebrations, Combo, E-gift, Go-local, and Baskets now use predictable real-data filtering and clearer reset/empty outcomes
- Owner: Project team
- Date: 2026-04-21
- Decision: Keep a centralized `memory.md` in the workspace root for durable engineering context
- Context: Project information was scattered across chat and ad-hoc notes, making handoffs and continuity harder
- Options considered: (1) No persistent log, (2) Per-feature notes only, (3) Single workspace memory file
- Rationale: A single markdown file is simple, searchable, and low-overhead for daily maintenance
- Impact: Better continuity, faster onboarding, and clearer historical context for future changes
- Owner: Project team

Template:
- Date:
- Decision:
- Context:
- Options considered:
- Rationale:
- Impact:
- Owner:

## Work Log
Use this for significant implementation updates.

Latest entries:
- Date: 2026-05-16
- Summary: Sprint 6 — Vendor unified orders dashboard (8.1). Replaced mock-data `VendorOrdersPage` with real Supabase `db.bookings.listByVendor`. Single table across modules with: stat cards (total / awaiting confirmation / confirmed / confirmed revenue), filters (search ID/customer/listing, module, status, from/to date), CSV export of the current filtered view, sort by status priority then created_at desc. Click View → existing `/vendor/booking-requests/:bookingId` detail (reuses confirm/reject UI). Realtime via `realtimeService.watchVendorBookings`.
- Files changed: `MogzuApplication/src/app/components/VendorOrdersPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Sprint 6 fully shipped (4.5, 4.1, 4.2, 8.1). Gifting-specific fulfilment statuses (Packed → Dispatched → Delivered) from acceptance criteria not modelled — BookingStatus enum doesn't have them. Would need a `fulfilment_stage` column on bookings or a `booking_events` audit table. Old mock seed files (`corpVendorEnquiryStorage`, `vendorOrdersDemoSeed`) no longer referenced by this page but still exist — can be removed in a cleanup sprint.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 6 — Employee sends gift (4.2). New `GiftingSendPage` at `/gifting/send`. 4-step flow: Occasion (active gifting rule or standalone) → Gift (filtered approved gifting products; preferred-vendor filter from rule; category + max price) → Recipient (corporate directory from `db.userProfiles.listByCorporate`, filtered to rule's department if scoped, with name/department search; self excluded) → Message (≤200 chars). Submit creates a `bookings` row module='gifting', `group_size=1`, recipient + occasion + message composed into `purpose_note`. Approval decision: standalone gifts and over-budget gifts and rules with `requires_approval=true` → `pending_approval`; under-budget auto-approve → `pending_vendor` with 24h SLA. Commission snapshot follows vendor → global precedence as event flow. Confirmation card shows reference + estimated delivery (lead-time from product metadata).
- Files changed: `MogzuApplication/src/app/components/GiftingSendPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: ETA uses `metadata.leadTimeDays` (vendor-supplied) + today; no logistics integration. Personal gifting budget (per-employee allowance) not yet enforced — only rule budget compared. Recipient search is client-side string contains; should move to server-side ilike for large directories.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 6 — L3 gifting programme (4.1). New `gifting_rules` Supabase table with RLS (corporate members read; only l3_admin / mogzu_admin mutate within own corporate). Columns: occasion_name, trigger_kind (fixed_date / birthday / work_anniversary / manual), trigger_date, budget_per_recipient, requires_approval, scope (company/department), scope_value, preferred_vendor_ids[]. New `GiftingRule` + `GiftingTriggerKind` types, `db.giftingRules` namespace (list/create/update/deactivate). New `CorporateGiftingProgrammePage` at `/corporate/gifting-programme`: lists rules with occasion badge, budget, approval mode, scope, preferred-vendor chips; modal form for create/edit with vendor chip-picker; deactivate keeps row for audit.
- Files changed: `MogzuApplication/supabase/migrations/20260516000004_gifting_rules.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/CorporateGiftingProgrammePage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Migration must be applied to Supabase via `supabase db push` (or MCP) before the page works in prod — local types added optimistically. HRMS trigger source (birthday/anniversary) requires N8N workflow to evaluate dynamic triggers daily — not built yet. Sprint 6 next: 4.2 employee sends gift, 8.1 vendor orders dashboard.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 6 — Admin gifting product approval (4.5). Rebuilt `AdminGiftingProductsPage` and `AdminGiftingProductDetailPage` from mock `adminGiftingStore` to Supabase `listings` module='gifting'. Queue: tabs (Pending/Approved/Rejected/Paused/All), thumbnails via `storageService.giftImages`. Bulk approve and bulk reject; rejection captures `metadata.rejectionReason`, `metadata.rejectionFields[]`, and audit (`rejectedBy`, `rejectedAt`). Same-vendor selection highlighted to encourage post-trust bulk approval. Detail view renders all stored metadata (MOQ, GST, variants, bulk tiers, branding, delivery cities, packaging, inventory) + rejection panel for rejected products. Approve flips `status='active'` so listing appears in shop (visible via `listings.listByModule('gifting','active')`).
- Files changed: `MogzuApplication/src/app/components/AdminGiftingProductsPage.tsx`, `AdminGiftingProductDetailPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Field-level comments (acceptance criteria) captured as a tag list in `metadata.rejectionFields`, not free-text per field — richer per-field comments deferred. Vendor notification on rejection is in-memory only (badge on vendor page once they reload); push/email deferred (Resend). Old `adminGiftingStore` still exists but is no longer read by these pages.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 5 — Booking payment checkout (6.1). New `BookingPaymentPage` at `/bookings/:id/pay`. Three methods: Corporate Wallet (instant debit via `db.wallet.recordTransaction('debit')` + `adjustBalance(-total)`), Card, UPI. Wallet path validates `wallet.balance >= total`; below-total shows shortfall and a top-up CTA. Card/UPI paths show an amber Razorpay-pending banner with a manual reference/UTR field — operator pastes Razorpay payment id to mark paid (stopgap until backend webhook ships). Booking is updated with `payment_method`, `payment_reference`, `payment_status='paid'`. Already-paid bookings short-circuit to a receipt view. Failed payment keeps booking unchanged so retry works.
- Files changed: `MogzuApplication/src/app/components/BookingPaymentPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Real Razorpay checkout SDK + webhook handler still deferred — current card/UPI flow is operator-manual. 3D Secure not exercised because no real gateway call. Receipt email deferred (Resend not wired). Concurrent wallet debit is read-modify-write client-side; pre-prod needs a Postgres RPC to atomically debit + record txn. Sprint 5 P0 stories (9.2, 6.2, 6.1) all merged.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 5 — Corporate wallet top-up (6.2). Rebuilt `WalletPage` from points-based mock to real Supabase wallet for L3 admin / mogzu_admin. Shows live balance from `db.wallet.getByCorporate`, transaction history (last 50), and a configurable low-balance threshold (`wallet.low_balance_threshold` with below-threshold badge). Top-up modal: amount, method (Bank/NEFT/Card), reference/UTR. Submits a `wallet_transactions` row of type='topup' and immediately credits the wallet (stopgap; banner notes Razorpay webhook will replace this in a future sprint). Adds `db.wallet.adjustBalance` and `db.wallet.setLowBalanceThreshold` helpers. Realtime via `realtimeService.watchWallet`.
- Files changed: `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/WalletPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Wallet balance bump is client-side without webhook verification — concurrency / fraud risk if shipped as-is. Razorpay backend webhook handler still needs Supabase Edge Function. Amounts > ₹50,00,000 blocked client-side as a heuristic; should be server-side rule. Low-balance alert is visual only — no email/Slack push yet.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 5 — Mogzu admin commission rates (9.2). New `AdminCommissionsPage` at `/admin/commissions` (mogzu_admin only). Lists active rules with scope (Global/Vendor/Module), rate %, effective_from, status. Form to create rules with live preview (X% on ₹1,000 → platform earns ₹fee, vendor receives ₹net). Deactivate inactive button (soft). CSV export filterable by created_at date range. `EventBookingPage.handleSubmit` now snapshots the active commission onto `bookings.commission_rate` at create time (precedence: vendor → global), so rate changes do not affect existing bookings.
- Files changed: `MogzuApplication/src/app/components/AdminCommissionsPage.tsx`, `MogzuApplication/src/app/components/EventBookingPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Category-scope rules not yet supported in UI (Commission table allows it but no category picker). Module-precedence not in snapshot lookup (vendor → global only) — listing.module-specific rule would be ignored for now. Commission report = raw rule CSV; vendor-payout breakdown report deferred until Sprint 6.4 payout flow.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 4 — Vendor confirms/rejects booking (3.3). New `VendorBookingRequestsPage` at `/vendor/booking-requests` (list) and `/vendor/booking-requests/:bookingId` (detail). Lists vendor's bookings by status tab (pending_vendor / confirmed+completed / cancelled) with SLA countdown badge (urgent < 4h, expired red). Confirm sets booking status=`confirmed` and auto-inserts `calendar_slots` row of type `booked` covering the booking window. Reject calls `db.bookings.cancel(reason)` with refund flag in the cancellation reason when payment_status=`paid`. Realtime subscription via `realtimeService.watchVendorBookings`. Client-side auto-cancel sweep cancels any `pending_vendor` row whose `vendor_response_deadline < now` as a stopgap until N8N workflow ships.
- Files changed: `MogzuApplication/src/app/components/VendorBookingRequestsPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Client-side auto-cancel only runs when a vendor opens the page — server-side N8N cron required for guaranteed enforcement. Refund initiation is logged in cancellation_reason text but does not yet trigger wallet credit / payment-gateway refund (Sprint 5 payments). Notification bell / dashboard alert deferred — needs notification infra. Existing `VendorOrdersPage` (mock store) left untouched; new page is opt-in via route.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 4 — Employee event booking flow (3.2). New `EventBookingPage` at `/book/event/:listingId` with 4-step wizard (Date → Group → Add-ons → Review). Calendar shows vendor's booked/blocked days strikethrough from `calendar_slots`. Group size enforces listing min/max capacity. Live price recalc (base × group multiplier for per_person + add-on totals + 5% platform fee). Budget-rule check decides between `pending_approval` (above auto-approve threshold) and `pending_vendor` (24h vendor SLA). Adds `db.bookings.addAddOns` helper.
- Files changed: `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/EventBookingPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Event hours hardcoded 10am–6pm at submit — real time-of-day picker deferred. Email confirmation deferred (Resend not wired). Existing mock `BookingFlow` / `ActivityBookingFlow` etc. left untouched; new flow is opt-in via the dedicated route. Approval decision uses first matching budget rule (module-specific first, else company-wide) — multi-rule precedence not yet enforced.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 4 — L2 manager approval queue (2.2). Replaced mock data on `CorporateApprovalsPage` and `CorporateApprovalDetailPage` with real Supabase `db.bookings`. Queue tabs (Pending/Approved/Rejected) map to BookingStatus (`pending_approval`, `pending_vendor|confirmed|completed`, `cancelled`). Approve via `db.bookings.approve` → moves to `pending_vendor`; reject via `db.bookings.cancel(reason)`. Bulk-approve via checkboxes on Pending tab. Role guard: only `l2_manager` / `l3_admin` can access. Realtime via `realtimeService.watchCorporateBookings`.
- Files changed: `MogzuApplication/src/app/components/CorporateApprovalsPage.tsx`, `CorporateApprovalDetailPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Push notifications + Resend email on queue entry deferred — needs N8N hook + Resend wiring (Sprint 4 dependency in plan). "Request modification" action from acceptance criteria not implemented — only approve/reject. Bulk-approve does sequential `approve` calls; if one fails, others still succeed and a partial-success message is shown.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 3 — Vendor gifting catalogue (4.4). Replaced `VendorGiftingDashboardPage` products tab and `VendorGiftingProductFormPage` mock state with Supabase `db.listings` module='gifting'. Form covers MOQ, GST, variants (parsed from text), bulk tiers, branding options, delivery cities, lead-time SLA, packaging, inventory, out-of-stock toggle — non-core fields persisted in `listing.metadata` JSONB. Form is now single-page (replaced 5-step wizard) to fit 4.4 scope tightly. Orders/Performance/Settings tabs on dashboard still read from `vendorGiftingStore` local store — explicitly out of 4.4 scope; banners now note the demo state.
- Files changed: `MogzuApplication/src/app/components/VendorGiftingDashboardPage.tsx`, `VendorGiftingProductFormPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: `vendorGiftingStore` still hydrates orders/settings — Sprint 4 order pipeline replaces orders tab; corporate vendor profile sprint replaces settings tab. Variant editor is text-based (one variant per line) for now; structured editor deferred. Sprint 3 scope complete.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 3 — Vendor listings CRUD (5.3 spaces, 3.6 events). Replaced mock-state pages with real Supabase `db.listings` wiring + image upload via `storageService`. Shared pattern: modal form (title/description/category/capacity/pricing/location/cancellation/images), list with status filter + sort, lifecycle actions (submit-for-review, pause/activate, archive draft).
- Files changed: `MogzuApplication/src/app/components/VendorSpaceXServicesPage.tsx`, `VendorEventsServicesPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Drawer-based features (`VendorRejectionFeedbackDrawer`, `VendorPerformanceStatsDrawer`) dropped from events page — needed real rejection-reason + analytics data flow before re-adding. Recurring blocks + buffer-time (5.3 acceptance) deferred. Sprint 3 remaining: 4.4 gifting listings.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 3 — Vendor calendar (8.2). Refactored `VendorCalendarPage` from mock state to real Supabase. Week-based view, block/unblock slot modals, real-time `calendar_slots` subscription, listing-scoped slots, today highlight.
- Files changed: `MogzuApplication/src/app/components/VendorCalendarPage.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Recurring blocks + buffer time (acceptance criteria from 5.3) deferred. Drag-to-block UX uses single-cell click instead of drag for simplicity. Multi-listing scoping shown via badge in slot card; per-listing filter view not yet added.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 2 — admin portal + budget foundation (9.1, 9.3, 2.1). Wired real Supabase data across three pages; replaced all mock data and setTimeout patterns.
- Files changed: `src/lib/auth.ts`, `src/app/components/AdminClientManagementPage.tsx`, `src/app/components/CorporateModuleRouteGuard.tsx`, `src/app/components/CorporateBudgetPage.tsx`
- Verification performed: `npm run build` clean after each story
- Risks / notes: Budget enforcement at booking time (block over-budget bookings) deferred to Sprint 3 booking flows. `heyGenie` module has no DB `ModuleId` yet — route guard falls back to global platform setting for it.
- Owner: Project team
- Date: 2026-04-22
- Summary: Refined gifting navigation chrome to blend with `MogzuAmbientBackdrop`: transparent in-page nav strip, cream-aligned breadcrumb and tab chips, and `SharedHeader` `blended` variant on gifting pages
- Files changed: `MogzuApplication/src/app/components/GiftingPage.tsx`, `GiftingShopPage.tsx`, `CelebrationsPage.tsx`, `GiftingSpecialTabsPage.tsx`, `layouts/SharedHeader.tsx`, `memory.md`
- Verification performed: `npm run build` after changes; lints clean on touched files
- Risks / notes: Other routes still use default `SharedHeader` (`solid`); if the same “patch” complaint appears on Events/Dashboard, consider reusing `variant="blended"` or a route-level shell prop
- Owner: Project team
- Date: 2026-04-22
- Summary: Completed gifting filter parity pass across all gifting filter tabs with dynamic option sourcing and unified interaction behavior
- Files changed: `MogzuApplication/src/app/components/GiftingShopPage.tsx`, `MogzuApplication/src/app/components/GiftingSpecialTabsPage.tsx`, `MogzuApplication/src/app/components/CelebrationsPage.tsx`
- Verification performed: IDE lints on touched files; repeated `npm run build` after each phase; route-level behavior checks for shop/celebrations/combo/e-gift/go-local/baskets
- Risks / notes: Remaining data quality gaps still affect filter coverage realism (e.g., combo `occasion` arrays empty; shop fabric label mismatches like `Dirt fit` vs `Dry-Fit`; bag capacity options missing `XL`)
- Owner: Project team
- Date: 2026-04-21
- Summary: Created and upgraded `memory.md` to an industry-style engineering memory with project-scoped structure
- Files changed: `memory.md`
- Verification performed: Manual review of section structure and starter content completeness
- Risks / notes: Requires consistent usage cadence to remain valuable
- Owner: Project team

Template:
- Date:
- Summary:
- Files changed:
- Verification performed:
- Risks / notes:
- Owner:

## Incident and Debug Log
Use this for bugs, outages, or difficult troubleshooting.

Latest entries:
- No incidents recorded yet for this workspace

Template:
- Date:
- Incident / issue:
- Symptoms:
- Root cause:
- Resolution:
- Preventive action:
- Owner:

## Backlog and Follow-ups
Use this for actionable next steps.

Open items:
- [ ] Task: Populate combo `occasion` metadata in source data so occasion filtering has real options
  - Priority: High
  - Context: Combo occasion filter is wired but data currently has mostly empty `occasion` arrays
  - Owner: Project team
  - Due date: 2026-04-26
- [ ] Task: Normalize shop apparel fabric labels against dataset values (`Dirt fit` -> `Dry-Fit`, `Polycotton` -> `Poly-Cotton`)
  - Priority: Medium
  - Context: Label/value mismatch can hide expected products under fabric filters
  - Owner: Project team
  - Due date: 2026-04-28
- [ ] Task: Add `XL` to shop bag capacity filter options
  - Priority: Medium
  - Context: Bags data contains `XL` but the filter options currently stop at `Large`
  - Owner: Project team
  - Due date: 2026-04-28
- [ ] Task: Define a short naming convention for decision and work log summaries
  - Priority: Medium
  - Context: Consistent naming improves scanability and long-term maintenance
  - Owner: Project team
  - Due date: 2026-04-28
- [ ] Task: Establish a weekly memory review cadence
  - Priority: Medium
  - Context: Regular review keeps entries current and prevents stale notes
  - Owner: Project team
  - Due date: 2026-04-29

Template:
- [ ] Task:
  - Priority:
  - Context:
  - Owner:
  - Due date:

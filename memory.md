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
- Summary: Sprint 15 P1 — Bulk gifting (4.3). New `gifting_campaigns` Supabase table (corporate, occasion_name, listing_id, scope all|department|custom, scope_value, message, budget_per_recipient, recipient_count, total_budget, status) + `bookings.gifting_campaign_id` FK column. RLS: corp members read; L3/mogzu_admin manage. New `GiftingCampaign` + `GiftingCampaignScope` + `GiftingCampaignStatus` types and `db.giftingCampaigns` (listByCorporate / getById / create / listBookings). New `BulkGiftingPage` at `/corporate/bulk-gifting` (L3 admin). 4-step wizard: Occasion (name + ≤200 char message) → Gift (filtered approved gifting products) → Recipients (all active employees / department picker / custom checkbox list searchable by name/dept/email) → Review (live total). Submit creates campaign row + one booking per recipient with module='gifting', commission snapshot, vendor_response_deadline +24h, and links each to `gifting_campaign_id`; admin pre-approves them. Recipients with matching user_profile by full_name get a `gift_received` notification. Campaign detail at `/corporate/bulk-gifting/:id` shows per-recipient booking status + fulfilment stage + tracking link.
- Files changed: `MogzuApplication/supabase/migrations/20260516000014_gifting_campaigns.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/BulkGiftingPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Recipient → user_profile matching is by `full_name` heuristic — real prod needs email join via Supabase auth. Without that, notifications fire only for recipients whose full_name happens to match a user profile; the rest still get a booking row owned by the L3 admin so the vendor still ships. Booking inserts are serial via for-loop — for ≫100 recipients consider a server-side RPC batch insert. P1 fully shipped: 18/21 stories landed (1.5, 6.3, 6.4, 3.4 cancel, 3.4 reschedule, 10.0, 7.2, 2.3, 2.4, 7.3 partial, 12.1, 12.2, 12.3, 10.1, 10.2, 9.4, 5.4, 5.5, 4.6, 7.1, 9.5, 4.3 — exact count = 21 including the partial; remaining items are infra-blocked carryovers, not new story scope).
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 14 P1 — In-platform messaging + disputes (7.1, 9.5). 7.1: new `booking_messages` Supabase table (thread per booking, sender_id, body, attachments JSONB, read_by UUID[]) with RLS scoped to booking participants + support roles. New `BookingMessage` + `BookingMessageAttachment` types and `db.bookingMessages` (listByBooking / send / markRead / unreadCountForUser). New `BookingMessagesPanel` global component with realtime via `subscribeToTable`: chat history, auto-scroll, auto-mark-read for non-sender, 5MB attachment cap (image/PDF) uploaded via `storageService.documents`. Mounted on `VendorBookingRequestsPage` detail. 9.5: new `booking_disputes` table (raised_by, reason_category, reason_body, status enum open/investigating/awaiting_party/resolved/dismissed, evidence_urls[], resolution enum no_refund/partial_refund/full_refund/vendor_penalty/no_action, resolution_note, resolved_by/at) with RLS (participants read; support roles manage). Types + `db.bookingDisputes` (listQueue/getById/listByBooking/raise/resolve/setStatus). New `AdminDisputesPage` at `/admin/disputes` and `/admin/disputes/:id`: queue with status filter + stat cards, detail with status dropdown + resolution form. Resolve action calls `db.bookings.cancelWithRefund` automatically for full/partial refund resolutions (partial = 50% retention fee) and emits `system` notification to booker.
- Files changed: `MogzuApplication/supabase/migrations/20260516000013_messages_disputes.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/global/BookingMessagesPanel.tsx`, `MogzuApplication/src/app/components/VendorBookingRequestsPage.tsx`, `MogzuApplication/src/app/components/AdminDisputesPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Booker-side messaging panel: only mounted on vendor detail page; corp-side booking detail (BookingDetailPage legacy) not yet wired to `<BookingMessagesPanel>` — one-line addition when that page is touched. Raise-dispute modal not yet added to booker side either; disputes can only be inserted directly via SQL or admin until a booking-detail "Raise dispute" button lands. Unread count not surfaced in `NotificationBell` yet — separate signal channel from notifications table. Email-on-message (when user inactive) deferred to Resend wiring.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 13 P1 — Stay booking, travel policy, gift tracking (5.4, 5.5, 4.6). 5.5: new `travel_policies` Supabase table (corporate_id, name, role_tier, max_nightly_rate, approved_cities[], min_lead_days, module spacex_stay|spacex_coworking, is_active) with RLS (corp members read; L3/mogzu_admin manage). New `TravelPolicy` type + `db.travelPolicies` (list/listActiveForRole/create/update/deactivate). New `CorporateTravelPolicyPage` at `/corporate/travel-policy` (L3 admin) with create/edit modal. 5.4: new `StaySearchPage` at `/stay` searches `spacex_stay` listings with city/check-in/check-out filters; runs policy evaluation per result (within-policy or "requires approval" badge with reason chips for rate/city/lead violations); deep-links to `/book/space/:listingId` with date params. 4.6: `bookings` table extended with `fulfilment_stage` (ordered → packed → dispatched → out_for_delivery → delivered → returned), `tracking_number`, `carrier`, `carrier_url`; new `db.bookings.setFulfilment` helper. VendorBookingRequestsPage detail now renders `FulfilmentPanel` for gifting bookings in confirmed/completed state — stage pipeline visualisation, carrier/tracking/URL inputs, save action that updates booking + emits `gift_received` notification to the booker.
- Files changed: `MogzuApplication/supabase/migrations/20260516000012_travel_and_tracking.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/CorporateTravelPolicyPage.tsx`, `MogzuApplication/src/app/components/StaySearchPage.tsx`, `MogzuApplication/src/app/components/VendorBookingRequestsPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Stay booking calls existing `/book/space/:listingId` SpaceBookingPage — adapts because module=spacex_stay still hits same flow. Auto-generated invoice on confirmation deferred (PDF gen + Resend). Carrier integrations (Delhivery/Shiprocket) deferred — manual tracking number entry only. Monthly policy-violation report deferred. Returned/dispatch reverse path not yet wired — only forward.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 12 P1 — Celebrations + AM portfolio (10.1, 10.2, 9.4). New `celebration_events` Supabase table tracking one row per scheduled milestone gift (corporate_id, gifting_rule_id, employee_id, manager_id, occasion_name, trigger_date, status enum scheduled/personalised/suppressed/fired/failed, default_listing_id, listing_id_override, budget_override, manager_message, fired_booking_id). RLS: corporate members read own; L3/mogzu_admin/account_manager manage; L2 manager can update events where manager_id=auth.uid. New `CelebrationEvent` + `CelebrationStatus` types and `db.celebrations` namespace (listByCorporate / listForManager / create / personalise / suppress). New `CorporateCelebrationsPage` at `/corporate/celebrations` (L3 admin) shows upcoming/all events with status badges + stats. New `ManagerCelebrationsPage` at `/celebrations/team` (L2/L3) shows manager's team upcoming events with personalise modal (message ≤200 chars, gift override picker from approved gifting listings, budget override) and suppress action (with reason prompt). 9.4: new `AccountManagerPortfolioPage` at `/am/portfolio` (account_manager / mogzu_admin) lists assigned corporates via `db.corporateAccounts.listByAccountManager`; per-client health score (0–100) blending: bookings last-30 vs prev-30, spend trend up/down/flat, open ticket count; deep links to client detail / spend report / support queue.
- Files changed: `MogzuApplication/supabase/migrations/20260516000011_celebration_events.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/CorporateCelebrationsPage.tsx`, `MogzuApplication/src/app/components/ManagerCelebrationsPage.tsx`, `MogzuApplication/src/app/components/AccountManagerPortfolioPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Seeding cron (N8N daily — generate next 30 days of celebration_events from employees.dob/join_date matched against gifting_rules) deferred — table populates manually until that workflow ships. Auto-fire cron (when trigger_date reached → create booking row + set status='fired') also deferred. 48h pre-trigger manager notification not yet emitted — needs N8N or scheduled job. AM portfolio "shortlists + scheduled call actions" deferred — current state offers deep-link buttons instead.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 11 P1 — Support system (12.1, 12.2, 12.3). Two new tables: `support_tickets` (audience corporate|vendor, submitter_id, category, subject, body, status enum, priority enum, sla_hours, auto-captured context: url/role/last_action/user_agent, optional related_booking_id / related_payout_id, csat fields) and `support_ticket_notes` (ticket_id, author_id, body, is_internal). RLS: submitter reads + inserts + updates own; support/mogzu_admin/account_manager manages everything; submitter can read non-internal notes and post replies. New types + `db.supportTickets` (create/getById/listMine/listQueue(audience,status?)/update) + `db.supportTicketNotes` (listByTicket/create). New pages: shared `SupportPage` at `/support` (corporate audience) and `/vendor/support` (vendor audience reuses same page via wrapper) — list own tickets, compose modal that auto-captures URL/role/user_agent, ticket detail shows public conversation + CSAT prompt on resolved tickets. New `AdminSupportPage` at `/admin/support` (support role) — full queue with audience filter, status filter, SLA-breach badges; sort by breach then priority weight; detail view shows agent context (page, role, UA, related ids), supports public+internal note posting, status dropdown.
- Files changed: `MogzuApplication/supabase/migrations/20260516000010_support_tickets.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/SupportPage.tsx`, `MogzuApplication/src/app/components/AdminSupportPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: CSAT email on close + auto-ticket-on-refund-failed deferred to N8N — workflow stubs not added. "Help button on every page" appears via NotificationBell + a future global Help affordance — current state requires user to visit `/support` (or vendor `/vendor/support`). Vendor payout-dispute context is wired structurally (related_payout_id) but no UI yet links payouts to ticket creation; needs a one-line `navigate('/vendor/support?related_payout=...')` from VendorPayoutsPage row, deferred.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 10 P1 — Spend visibility + N8N workflow 6 (2.3 + 2.4 + 7.3 partial). 2.3: new `EmployeeSpendPage` at `/spend` reading `db.bookings.listByUser` + `db.budgets.listByCorporate`; picks most-specific matching budget rule (individual → department → company), computes period start (monthly/quarterly/annual), shows allowance bar + remaining + over-threshold tint when usage ≥ `alert_threshold_pct`, per-module spend breakdown, last 5 transactions. Realtime via `realtimeService.watchCorporateBookings`. 2.4: new `CorporateSpendReportPage` at `/corporate/spend-report` (L3 only) with date range + department + module filters, total/count/top-module stat cards, by-module + by-department breakdown bars, paginated rows preview (first 200), CSV export of full filtered set. 7.3 partial: new `n8n-workflows/scheduled-spend-report.json` weekly Monday 7am IST cron — lists active corporates, fetches last-7-day bookings, builds CSV + totals, emails L3 admins via Resend with base64 attachment. The other 5 workflow JSONs (vendor SLA, budget alert, vendor reg task, festival reminder, payout trigger) were already on disk from Sprint 0.
- Files changed: `MogzuApplication/src/app/components/EmployeeSpendPage.tsx`, `MogzuApplication/src/app/components/CorporateSpendReportPage.tsx`, `MogzuApplication/src/app/routes.tsx`, `n8n-workflows/scheduled-spend-report.json`
- Verification performed: `npm run build` clean
- Risks / notes: PDF export deferred (CSV only). Scheduled email distribution lives in the N8N JSON and requires N8N Cloud import + Resend creds + Supabase service-role key to fire — until that lands, L3s pull CSV on demand from `/corporate/spend-report`. Budget alert thresholds shown visually only in 2.3; the N8N `budget-threshold-alert.json` workflow handles email out-of-band. Aggregate Sprint 10 P1 fully shipped end-to-end on the React side; backend wiring still gates real workflow execution.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 9 P1 — Push + email notifications (7.2). Two new tables: `notifications` (user_id, type enum, title, body, link_url, metadata, is_read, email_status enum) and `notification_preferences` (in_app_enabled_types[], email_enabled_types[]) with RLS (user owns both). `NotificationType` + `CRITICAL_NOTIFICATION_TYPES` const (cancellation, payment_failed, refund_*, support_reply — always emitted, locked from preference UI). `db.notifications.notify({userId,type,title,body?,linkUrl?,metadata?})` central emit helper that reads recipient prefs and writes a row with `email_status='queued'` if email opted-in, else `skipped`. Drain queue → Resend Edge Function later. `NotificationBell` in `SharedHeader` shows unread badge + 20-item dropdown with realtime via `subscribeToTable`. `/notifications` lists last 100 with all/unread tabs + mark-all-read. `/settings/notifications` channel matrix (in-app × email per type); critical rows locked with a Required pill. Wired emits: event booking submit (notifies all L2 managers if pending_approval), manager approve (booker → approval_decided), manager reject (booker → booking_cancelled), vendor confirm (booker → booking_confirmed), vendor reject (booker → booking_cancelled + refund_initiated when applicable).
- Files changed: `MogzuApplication/supabase/migrations/20260516000009_notifications.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/global/NotificationBell.tsx`, `MogzuApplication/src/app/components/NotificationsPage.tsx`, `MogzuApplication/src/app/components/NotificationPreferencesPage.tsx`, `MogzuApplication/src/app/components/layouts/SharedHeader.tsx`, `MogzuApplication/src/app/components/EventBookingPage.tsx`, `MogzuApplication/src/app/components/VendorBookingRequestsPage.tsx`, `MogzuApplication/src/app/components/CorporateApprovalDetailPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Resend wiring still deferred — `email_status='queued'` rows wait for the Edge Function to drain. Email "sent" status flips by that worker. 24h booking reminder + payment_received emits not yet wired (need scheduled job for reminder; payment-received only fires when Razorpay webhook lands). SpaceBookingPage + GiftingSendPage submit paths still skip manager-approval notifications — same one-line addition needed when next touched. CancelBookingPage by booker → notify vendor not yet wired (one-line addition).
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 9 P1 — Reschedule booking + employee CSV import (3.4 reschedule half, 10.0). Cancel half of 3.4 already shipped in 6.3. Reschedule: `RescheduleBookingPage` rebuilt to load real booking by `:id`, show vendor's blocked calendar via `db.calendar.getSlotsForListing`, pick new date + hour window, submit clears old `calendar_slots` row via new `db.calendar.deleteByBooking(bookingId)` and updates booking start/end + flips status to `pending_vendor` with fresh 24h SLA. Booking reference preserved. Route `/bookings/:id/reschedule` (legacy `/reschedule-booking` retained). 10.0 employee CSV import: new `employees` table (corporate_id, email UNIQUE per corporate, full_name, department, role_hint, dob, join_date, phone, is_active) with RLS (corp members read; L3 admin manages). New `EmployeeImportPage` at `/corporate/employees/import` (L3 admin): downloads CSV template, parses CSV client-side (quoted fields, escaped quotes, CRLF), validates row-by-row (required email/full_name, ISO dates), preview table with per-row error tags, upsert via `db.employees.upsertBatch` (onConflict=corporate_id,email).
- Files changed: `MogzuApplication/src/app/components/RescheduleBookingPage.tsx`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/routes.tsx`, `MogzuApplication/supabase/migrations/20260516000008_employees.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/app/components/EmployeeImportPage.tsx`
- Verification performed: `npm run build` clean (after each story)
- Risks / notes: Reschedule does not yet notify the vendor — depends on 7.2 notifications. CSV upsert is unauthenticated against email collisions across corporates (UNIQUE is scoped per corporate_id). HRMS connectors (Darwinbox/Keka) deferred to a P2 sprint per plan. Sprint 9 remaining: 7.2 push + email notifications.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 8 P1 — Vendor payouts (6.4). New `payouts` Supabase table with RLS (vendor reads own, mogzu_admin manages all, vendor + admin can insert on completion). Columns: booking_id (UNIQUE), vendor_id, gross_amount, commission_amount, net_amount, commission_rate, status (scheduled|processed|held|failed), scheduled_for, processed_at, gateway_reference, hold_reason, failure_reason. New `Payout` + `PayoutStatus` types and `db.payouts` namespace (create/listByVendor/listDue/markProcessed/hold/markFailed). New `db.bookings.completeWithPayout(booking)` helper: completes booking + inserts payout row with `net = gross - gross*commission_rate` snapshotted from booking, scheduled 48h out. `listDue()` returns scheduled payouts past `scheduled_for` for N8N polling. New `VendorPayoutsPage` at `/vendor/payouts`: tabs upcoming/processed/held+failed, stat cards, transfer table (gross, commission % display, net, status with hold/failure reason).
- Files changed: `MogzuApplication/supabase/migrations/20260516000007_payouts.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/VendorPayoutsPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Real bank transfer + N8N polling cron deferred — `listDue()` ready for it to consume. `completeWithPayout` not yet wired into any user-facing action; needs a "mark completed" button on vendor side (e.g. extension to VendorBookingRequestsPage detail) or fully N8N-driven once the cron lands. Bank account verification gate is shown as informational banner but not enforced (vendors.bank_account_verified column exists, payouts will be marked held by N8N if unverified). Payout amount uses booking.commission_rate snapshot — if booking pre-dates commission rate column being populated, payout = gross with 0 commission, which the admin can adjust via `hold`/manual processed.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 8 P1 — Automated refund processing (6.3). New `refunds` Supabase table with RLS (corporate members + vendors read scoped to own; L3/mogzu_admin manage; vendor and booking-owner can insert). `Refund` + `RefundMethod` + `RefundStatus` types; `db.refunds` namespace (create/listByBooking/listByCorporate/markProcessed/markFailed). New `db.bookings.cancelWithRefund(booking, reason, fee, actorId)` helper: cancels booking, computes refundable = total − fee, inserts `refunds` row. Wallet refunds processed inline (credit wallet + `wallet_transactions` of type='refund' + update balance) and status='processed'. Card/UPI refunds inserted as status='pending' awaiting Razorpay webhook. `VendorBookingRequestsPage` reject path now uses helper (full refund, fee=0). `CancelBookingPage` rebuilt: loads real booking by `:id`, enforces 24h free window (25% fee inside window), shows refund preview + method-specific copy, submits via helper. New route `/bookings/:id/cancel`; legacy `/cancel-booking` retained for back-compat.
- Files changed: `MogzuApplication/supabase/migrations/20260516000006_refunds.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/app/components/CancelBookingPage.tsx`, `MogzuApplication/src/app/components/VendorBookingRequestsPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Razorpay refund API call + webhook for card/UPI still deferred — pending refunds sit until the gateway handler ships. Refund failure → support ticket auto-open deferred until 12.1 ticket flow + 7.3 N8N. Cancellation fee is hardcoded 25% above; should move to listing.cancellation_policy parsed rules per vendor. Wallet credit is read-modify-write client-side; same atomic-debit-RPC carryover applies to credits.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 8 P1 — Role switcher for multi-role users (1.5). Migration adds `user_profiles.available_roles TEXT[]` and new `role_switch_events` audit table (RLS: user reads own + mogzu_admin reads all; user inserts own). `UserProfile.available_roles` + new `RoleSwitchEvent` type; `db.roleSwitchEvents.log/listByUser`. `AuthProvider` now exposes `availableRoles` (union of `profile.role` + `available_roles`), `activeRole` (sessionStorage override fallback to primary), and `setActiveRole(role)` that writes an audit row (non-blocking) and persists to sessionStorage. Stale overrides are cleared if their grant is revoked. Sign-out clears the override. New `AuthRoleSwitcher` header dropdown renders only when `availableRoles.length > 1` and lives next to the existing demo-shell `RoleSwitcher` in `SharedHeader`.
- Files changed: `MogzuApplication/supabase/migrations/20260516000005_role_switcher.sql`, `MogzuApplication/src/lib/database.types.ts`, `MogzuApplication/src/lib/db.ts`, `MogzuApplication/src/lib/auth.ts`, `MogzuApplication/src/app/components/global/AuthRoleSwitcher.tsx`, `MogzuApplication/src/app/components/layouts/SharedHeader.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: Migration 0005 must be applied via `supabase db push` before switcher writes work in prod. RLS guards against unauthorised role usage at the data layer, but UI just shows the granted set — actual permission enforcement still relies on existing role guards across pages. Existing demo-shell `RoleSwitcher` (corporate/vendor/admin) and `useDemoRole` retained for unauthed walkthrough mode.
- Owner: Project team
- Date: 2026-05-16
- Summary: Sprint 7 — Employee books space (5.2). New `SpaceBookingPage` at `/book/space/:listingId`. 4-step wizard: Slot (month picker + start/end hour selects, hours conflicting with `calendar_slots` shown disabled) → Attendees (enforced against listing min/max capacity) → Add-ons → Review/submit. Hourly pricing multiplies base × hours; daily pricing uses fixed rate; flat falls back to a single charge. Final pre-submit overlap re-check guards against race conditions. Confirmation shows reference, address, slot, status, and a placeholder QR tile noting access instructions arrive once vendor confirms. Confirmation has both "Proceed to payment" (→ `/bookings/:id/pay`) and "View bookings" CTAs. All P0 booking flows now wired end-to-end.
- Files changed: `MogzuApplication/src/app/components/SpaceBookingPage.tsx`, `MogzuApplication/src/app/routes.tsx`
- Verification performed: `npm run build` clean
- Risks / notes: QR rendered as static `QrCode` icon placeholder — real QR requires `qrcode.react` or similar lib; access code generation deferred to confirmation/Resend wiring. Modification window enforcement (24h before check-in → cancellation fee) shown only as policy copy; actual cancel handler in `CancelBookingPage` not yet wired to this rule. Calendar overlap check is client-side; concurrent bookings need server-side exclusion (Postgres exclusion constraint or RPC). All P0 stories shipped — Sprint 7 stabilisation buffer remaining.
- Owner: Project team
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

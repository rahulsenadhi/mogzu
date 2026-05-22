# FIXES Log — Frontend Completion Plan execution

> One line per file touched. Newest at top.

## 2026-05-22 — Batch 12: Drag-to-block grid (plan Batch 3 slice 4)

- `MogzuApplication/src/app/components/VendorCalendarPage.tsx`:
  - `BlockTarget` type extended with optional `durationHours: number`. `BlockSlotModal` initialises `form.durationHours` from `target.durationHours ?? 1` and prints range header `"Mon 9 AM – 12 PM (3h)"` when multi-hour.
  - New drag state: `dragAnchor`, `dragCurrent`, `suppressNextClick`.
  - `cellIsFree(dayIdx, hour)` predicate (no blocked/booked overlap). `handleCellMouseDown` opens drag iff cell is free + left button. `handleCellMouseEnter` extends `dragCurrent` only when same day column as anchor. `handleDragEnd` on mouse-up:
    - Both endpoints + every cell in between must be free (otherwise abort — let the existing click handler resolve to unblock modal).
    - Single-hour drag (no movement) falls through to onClick → opens 1-hour modal once.
    - Multi-hour drag → sets `blockTarget` with `durationHours = hi - lo + 1` + flags `suppressNextClick` so the trailing click event doesn't reopen the modal.
  - Window-level `mouseup` listener (active only while dragging) so a drag ending outside the grid still commits.
  - Cell render: new `inDrag = isCellInDrag(dayIdx, h)` highlight (`bg-rose-100/70 ring-1 ring-inset ring-rose-300`); `select-none` to prevent text-select during drag; `onMouseDown` / `onMouseEnter` wired alongside existing `onClick`.
  - Sidebar hint copy: "Click a cell to block time." → "Click or drag across cells to block time."

Why: plan Batch 3 acceptance "Drag-to-block grid on `VendorCalendarPage`". Vendor side gets calendar parity with Outlook/Calendly-style multi-cell selection so blocking a 4-hour maintenance window is one gesture instead of four modal trips.

Carry-over (plan Batch 3 remaining):
- Vendor performance page — 24-line stub; needs full build with drawer stats + PDF export.
- `isWithinWorkingHours` predicate not yet enforced at booking-submit (warn when picking time outside vendor hours).

Verified: `npm run build` exit 0, `built in 22.78s`.

## 2026-05-22 — Batch 11: Notify-on-availability-change + SpaceX buffer_minutes (plan Batch 3 slice 3)

- `MogzuApplication/src/app/components/VendorCalendarPage.tsx`:
  - `handleBlock()` post-insert: queries `bookings` for rows where `vendor_id=current`, `listing_id=blocked listing`, `status='confirmed'`, time range overlaps the new blocked window (`start_time < end` AND `end_time > start`).
  - For each matching booking, fires `db.notifications.notify({type:'system', title:'Vendor changed availability…', linkUrl:'/bookings/:id'})` so the booker gets in-app + email-queued alert.
  - Setblock notice reads "Block saved — N confirmed booking(s) were affected and the booker(s) were notified." when notifications fire.
  - `system` is in `CRITICAL_NOTIFICATION_TYPES` so it bypasses any booker-side opt-out.
- `MogzuApplication/src/app/components/VendorSpaceXServicesPage.tsx`:
  - `FormState` + `EMPTY_FORM` extended with `bufferMinutes`; edit-mode preload + `basePayload` write parallel to events page.
  - New form field after Location with 0-720 min range + help text.

Why: plan Batch 3 acceptance "Notify booker on availability-change-after-confirm" (trust pipeline for L3 enterprise buyers — blocked vendor slots silently breaking confirmed bookings is the top class of disputes). SpaceX form parity with events form so buffer_minutes works for time-bookable space rentals too.

Carry-over (plan Batch 3 remaining):
- Drag-to-block grid on `VendorCalendarPage` (currently click-modal — biggest UX rework left).
- Vendor performance: `VendorPerformancePage` is a 24-line stub; needs full build with drawer stats + PDF export.
- `isWithinWorkingHours` predicate from `vendorAvailability.ts` not yet consumed by booking-submit / slot-block sites.

Skipped intentionally:
- VendorGiftingProductFormPage — gifting orders aren't time-slotted; buffer_minutes irrelevant.
- DB trigger version of notify-on-change: client-side detection is sufficient for demo; trigger would need SECURITY DEFINER + auth.uid() shenanigans not worth the complexity now.

Verified: `npm run build` exit 0, `built in 22.35s`.

## 2026-05-22 — Batch 10: listings.buffer_minutes + vendor availability rules (plan Batch 3 slice 2)

**New migration (requires Supabase apply):**

- `supabase/migrations/20260522000001_listings_buffer_and_avail_rules.sql`:
  - `ALTER public.listings ADD buffer_minutes INT NOT NULL DEFAULT 0 CHECK (0..720)`.
  - `CREATE TABLE public.vendor_availability_rules` (id, vendor_id FK, listing_id FK NULL = all-listings template, day_of_week 0-6, start_minute / end_minute 0..1440 with `start < end` CHECK, is_active, timestamps). `idx_avail_rules_vendor` partial-active. RLS: vendor manages own (via `vendors.user_id = auth.uid()`), authenticated SELECT (so corp side can later render vendor working hours), mogzu_admin all. `trg_var_touch_updated_at` trigger.

**Types + service:**

- `MogzuApplication/src/lib/database.types.ts` — added `buffer_minutes: number` to `Listing` interface; new `VendorAvailabilityRule` interface; schema map entry for `vendor_availability_rules`.
- `MogzuApplication/src/lib/vendorAvailability.ts` (new) — `DAY_LABELS` constant, `minutesToHHMM` / `hhmmToMinutes` helpers, `listRules(vendorId)` (active only), `createRule(vendorId, draft)` with start<end guard, `deleteRule(id)`, `isWithinWorkingHours(rules, when, listingId)` client-side predicate (rules empty = always within; rules with listing_id=null apply globally).

**UI wiring:**

- `MogzuApplication/src/app/components/VendorEventsServicesPage.tsx`:
  - `FormState` extended with `bufferMinutes: string`; `EMPTY_FORM` default '0'; edit-mode preload reads `initial.buffer_minutes`.
  - `basePayload` writes `buffer_minutes: Math.max(0, Math.min(720, Number(form.bufferMinutes) || 0))`.
  - New form field next to cancellation policy: number input, 0-720 range, help text "Idle minutes the calendar will hold around each confirmed slot. Max 720 (12h)."
- `MogzuApplication/src/app/components/VendorCalendarPage.tsx`:
  - New `<AvailabilityRulesPanel>` section mounted below the weekly grid. List grouped by day-of-week showing time chip(s) with listing scope label (`All listings` vs specific listing title). Inline add row: Day select + Start time + End time + Listing select (default "All listings") + Add button. Per-rule × removes via `deleteRule`. Errors + success notice.

Carry-over (plan Batch 3 still pending):
- Drag-to-block grid on `VendorCalendarPage` (currently click-modal).
- Notify booker on availability-change-after-confirm — vendor blocks a confirmed slot → fire `db.notifications.notify`.
- Vendor performance: drawer stats + PDF export.
- VendorGiftingProductFormPage + SpaceX listing forms not yet updated with buffer_minutes (events form only).
- `isWithinWorkingHours` is exported but not yet enforced anywhere — booking-submit + slot-block sites need to consume it.

Verified: `npm run build` exit 0, `built in 13.46s`. Migration not yet applied to Supabase — until applied, `/vendor/calendar` rules panel will error on first load (table missing) and edit-form buffer_minutes save will error.

## 2026-05-22 — Batch 9: Vendor settings page (plan Batch 3 slice 1)

- `MogzuApplication/src/app/components/VendorSettingsPage.tsx` (new, ~500 lines) — replaces 6-line `VendorSettingsStep12Placeholder` ("future release Step 12") with a full 3-tab settings page:
  - **Business profile** tab: editable `business_name`, `gst_number`, `city`, `state`, `logo_url`, `description`. Save → `db.vendors.updateProfile()`. Status pill + bank-verified badge.
  - **Payouts** tab: list `vendor_payout_methods` via `vendorPayouts.listMethods(vendorId)`. Inline "Add method" panel with rail (razorpay_x/wise/ach/fast_sg/sepa/manual), currency, account holder, account number, primary flag. Per-method actions: Set primary (`setPrimary`), Remove (`removeMethod`). Account number masked (last-4). Primary + verified badges.
  - **Notifications** tab: 7 toggles mapped to `NotificationType` array (`booking_confirmed`, `booking_cancelled`, `approval_required`, `payment_received`, `refund_initiated`, `support_reply`, `reminder_24h`). Save → `db.notificationPreferences.upsert` with critical types (`gift_received`, `gift_pending_approval`, `system`) always force-included.
- `MogzuApplication/src/lib/db.ts` — added `vendors.updateProfile(id, patch)` (partial-pick of business_name/description/logo_url/gst_number/city/state) writing `updated_at = NOW()`.
- `MogzuApplication/src/app/routes.tsx` — deleted `VendorSettingsStep12Placeholder` inline component; route `/vendor/settings` now resolves `VendorSettingsPage` (imported alongside `VendorPerformancePage`).

Why: plan Batch 3 first deliverable ("Replace `/vendor/settings` placeholder with real profile/payout/notification settings"). Highest visibility on vendor side — anyone clicking the sidebar Settings tab hit a "coming soon" stub.

Carry-over (plan Batch 3 remaining — defer to next slice):
- Drag-to-block grid on `VendorCalendarPage` (currently click-modal only).
- Recurring availability rule editor — `CalendarSlot.recurrence_rule` column already exists; only UI missing.
- Buffer time field on listings (`buffer_minutes`) — needs ALTER + listing form field.
- Notify booker on availability-change-after-confirm — trigger logic on calendar_slots insert vs confirmed bookings.
- Vendor performance drawer stats + PDF export.

Verified: `npm run build` exit 0, `built in 14.32s`.

## 2026-05-21 — Batch 8: Approval workflow rules + bulk invite + 72h expiry

**New migrations (require Supabase apply):**

- `supabase/migrations/20260521000002_approval_workflow_rules.sql` — adds `approval_workflow_rules` table (`id`, `corporate_id` FK→corporate_accounts, `threshold` NUMERIC(12,2), `required_levels` TEXT[] of L1/L2/L3, `exception_note`, `display_order`, `is_active`, timestamps). RLS: L3 admin manages own corp; corp members read; mogzu_admin all. `idx_awr_corp_active` covering index for active rules sorted by display_order. `trg_awr_touch_updated_at` trigger. `NOTIFY pgrst, 'reload schema'`.
- `supabase/migrations/20260521000003_user_invites_corporate.sql` — extends `user_invites` with `corporate_id` (FK→corporate_accounts ON DELETE CASCADE) + `department`. Default expiry tightened 14 days → 72 hours per Batch 5 acceptance. New RLS policy `user_invites l3 admin manages own corp` lets L3 admins issue invites for their own corporate (mogzu_admin policy from `20260516000021_rbac_sub_users.sql` left in place). `accept_user_invite()` RPC patched to COALESCE `corporate_id` and `department` from the invite onto `user_profiles`. New `user_invites_with_status` view exposes derived `pending`/`accepted`/`expired` status. New `resend_user_invite(p_invite_id UUID)` RPC rotates token + refreshes `expires_at = NOW() + 72h`; SECURITY INVOKER so RLS gates the underlying UPDATE.

**New services:**

- `MogzuApplication/src/lib/approvalWorkflow.ts` — `listRules(corporateId)` (active only, ordered by display_order); `saveRules(corporateId, drafts)` uses replace-strategy (`UPDATE ... is_active=false WHERE is_active=true` then INSERT new rows — keeps history without per-row diff). `resolveLevelsForAmount(rules, amount)` helper for booking-submit side: picks the highest-threshold rule the amount meets, returns its `required_levels`. Empty rules → no approval required.
- `MogzuApplication/src/lib/userInvites.ts` — `listInvitesByCorporate(corporateId)` reads from `user_invites_with_status` view; `createInvite(corporateId, invitedBy, draft)` generates 24-byte hex token via `crypto.getRandomValues`; `createInvitesBulk(corporateId, invitedBy, drafts)` validates emails + dedupes within upload (returns `{created, skipped: [{email, reason}]}`); `resendInvite(id)` calls `resend_user_invite` RPC; `revokeInvite(id)` DELETE-by-id (RLS-gated); `parseInviteCsv(text)` parses `email,full_name,role,department` rows with optional header detection.

**Types:**

- `MogzuApplication/src/lib/database.types.ts` — extends `UserInvite` interface with `department: string | null` + `corporate_id: string | null`. New `UserInviteStatus` union + `UserInviteWithStatus` interface (UserInvite + `status`). New `ApprovalWorkflowRule` interface. Schema map entry added for `approval_workflow_rules`.

**Wired UI:**

- `MogzuApplication/src/app/components/ApprovalWorkflowPage.tsx` — full rewrite of data layer. Drops local hardcoded `rules` state + fake `setSaveMessage()`-only Save. Loads `listRules(corporateId)` on mount; empty result falls back to `DEFAULT_RULES` template (0 / 50k / 200k thresholds with L1, L1+L2, L1+L2+L3 chains + exception note). All inputs now editable: threshold `<input type=number>`, level chips toggle (click to add/remove from `required_levels`), exception text input. Save calls `saveRules()`; non-L3 viewers see read-only banner + disabled controls. Validation: every rule must have ≥1 level + non-negative threshold.
- `MogzuApplication/src/app/components/UserManagementPage.tsx`:
  - Bulk Upload dropdown item now opens hidden `<input type=file accept=".csv">` (via `csvInputRef`). On file pick: `parseInviteCsv` → `createInvitesBulk` → `loadInvites()` refresh + notice ("Created N invites. Skipped M."). CSV columns: `email,full_name,role,department` with optional header.
  - Add Single User modal final Submit (`handleAddSingleUserNext` finalize branch) now calls `createInvite()` via shared `handleAddSingleInvite` helper. Maps page `permissionLevel` ('editor' → `l2_manager`, 'admin' → `l3_admin`, default → `l1_employee`). Reuses `addBudget1Form.type` as department label for demo simplicity (the modal's own "department" field lives in the budget tab).
  - New "Invites" panel below users table: real-data table from `user_invites_with_status` view. Columns: email / role / department / status pill / expires-at / actions. Status pill colors: pending→amber, accepted→emerald, expired→rose. Actions: Resend (calls `resend_user_invite` RPC) and Revoke (DELETE) for non-accepted rows. Notice/error banners persist until next action.

Verified: `npm run build` exit 0, `built in 23.42s`.

**Action required:** Apply migrations `20260521000002_approval_workflow_rules.sql` and `20260521000003_user_invites_corporate.sql` to Supabase before testing — until applied, `/settings/workflow` Save will throw (table missing) and `/user-management` invite panel will throw (view + corporate_id column missing).

Carry-over:
- The Add Single User modal still has 4 tabs of irrelevant-for-invite fields (address, budget, permissions matrix). Final submit only sends `email + full_name + role + department`; the rest is discarded. Acceptable for invite issuance but the modal copy mis-sells.
- Bulk CSV upload accepts any L3-admin-visible email; no domain-match enforcement (UserProfile domain is set on accept_user_invite via `corporate_id` binding, so cross-domain invites bind to the corporate anyway — by design for guest invites).

## 2026-05-21 — Batch 7: Corp user-mgmt + MyProfile real-data wiring

- `MogzuApplication/src/app/components/MyProfilePage.tsx`:
  - Dropped hardcoded `profileForm` defaults (`James Brown / Operations / 9876543210`) and the setTimeout fake loader (incl. 12% random-fail simulator).
  - Pulls `useAuth().profile` on mount; `splitName()` helper splits `full_name` → `firstName`/`lastName`.
  - Personal save → `db.userProfiles.upsert({ ...profile, full_name, phone, department })` + `refreshProfile()` from auth context.
  - Password save → `authActions.updatePassword(newPassword)` (Supabase auth.updateUser). Note: Supabase doesn't verify current password — the "Current Password" field is still client-collected for UX symmetry but isn't sent.
  - Notifications save → `db.notificationPreferences.upsert({ user_id, in_app_enabled_types, email_enabled_types })`. Page's 4 toggles (`enquiryUpdates`/`approvalUpdates`/`paymentUpdates`/`bookingReminders`) map to NotificationType groups via `NOTIF_GROUP` constant (e.g. `paymentUpdates` → `['payment_received','payment_failed','refund_initiated','refund_failed']`). Critical types (`gift_*`, `system`) always enabled per backend convention.
  - Load reads existing prefs row; falls back to all-enabled when no row exists (matches backend `notify()` default-allow when prefs are absent).
  - Billing tab (plan, billing history table, payment method) intentionally left hardcoded — defer to Batch 11 (`/account/billing` per FRONTEND_COMPLETION_PLAN §5).
- `MogzuApplication/src/app/components/UserManagementPage.tsx`:
  - `initialUsers` array renamed `DEMO_USERS` (kept as fallback; same 7 fake Kapil Dev rows).
  - New `UiUser` type + `adaptProfile(p, idx)` mapper translates `UserProfile` row → table-row shape used everywhere on the page (avatar falls back to `DEMO_AVATARS[idx % 5]` figma-asset cycle when `avatar_url` null; permissions derived from `role`: `l3_admin` → `'Full-permission'`, `l2_manager` → `'Manager'`, else `'Limited'`; `role` and `group` both default to `department`).
  - `useAuth().corporateId` → `db.userProfiles.listByCorporate(corporateId)` on mount. When data populated: `setUsers(...map(adaptProfile))`. Empty result keeps `DEMO_USERS`.
  - `DevMockDataBanner` mounted at top of scroll surface when `!hasRealUsers && !isLoadingUsers`.
- `MogzuApplication/src/app/components/CompanySettingsPage.tsx` (no change): page is pure nav hub (6 cards → /my-profile, /user-management, /settings/workflow, /wallet, /company-settings/dashboard). All target routes are real-data wired. Card descriptions still hand-authored but accurate.

Why: glitch #9 — `/user-management` showed 7 identical fake "Kapil Dev" rows, `/my-profile` showed canned "James Brown / Operations" with setTimeout placeholder loader.

Carry-over (Batch 5 in FRONTEND_COMPLETION_PLAN — still pending after this slice):
- Domain validation on `/signup/corporate` (Story 1.1).
- Bulk invite CSV upload on `/user-management` (Story 1.2). Page's "Add Users" + "Add Single User" modals still local-state-only; submitting doesn't reach Supabase auth invite RPC.
- Pending/accepted/expired invite status table.
- Invite resend + 72h expiry enforcement.
- Approval workflow editor on `/settings/workflow` (still local rules + fake Save — same carry-over noted under Batch 4).

Verified: `npm run build` exit 0, `built in 1m 6s`.

## 2026-05-21 — Batch 6: Admin dashboard real-data wiring

- `MogzuApplication/src/app/components/AdminDashboardPage.tsx` — full rewrite of data layer. Drops hardcoded constants `revenueByMonth`, `commissionData`, `toReceiveRows`, `toPayRows`, `loginLog`, `pendingIssues`, `resolvedIssues`, plus the 6 KPI card literals (175 / 64 / 36 / 25 / 15 / 175). Renames to `DEMO_*` and gates behind empty-slice fallback per the demo-data convention. New `loadAdminStats()` fans out 11 parallel queries:
  - `user_profiles` head count → Total Users
  - `corporate_accounts` head count → Total Clients
  - `vendors` status=active head count → Total Vendors
  - `bookings` last-12-months in CHARGED statuses → Revenue (sum, /100k = lakhs) + monthly bucket chart
  - `support_tickets` open/in_progress/waiting_user head count → Pending Issues KPI
  - `db.promotions.listActive()` → Active Promotions
  - `payouts` (all) → commission pie (gross_amount sum / scheduled+held commission_amount / processed commission_amount)
  - `listInvoiceRuns()` filtered to finalised/sent/overdue → To Receive (top 3 by total, joined to contracts → corporate_accounts.name)
  - `payouts` status=scheduled top 3 → To Pay (vendors.business_name + net_amount)
  - `audit_events_unified` action in ['auth.signin','auth.login','login'] → Login Log (last 3, joined to user_profiles for name)
  - `support_tickets` open+resolved top 3 each → issues tabs
- "Mock data for layout preview" footer replaced with conditional `usingAnyDemo` banner ("Some panels rendered with demo fallback rows") that hides once every slice has real data.
- Sparkline on Revenue KPI now points at real `revenueChartData` 12-month series instead of fixed `[12,18,14,22,19,28,24,32]` placeholder. Falls back to placeholder array when revenue series is empty.

Why: glitch #8 — `/admin` rendered fake Jan-Dec values, fake clients (Acme/Globex/Stark), fake bills, fake login users (Kapil/Sarah/James), fake issue snippets. Top embarrassment vector for any internal-ops walkthrough.

Carry-over:
- Revenue dropdown ("This year" / "Last year" / "Last 6 months") still cosmetic — only "This year" is wired. Other ranges return same 12-month series.
- Commission pie aggregate is lifetime, not period-filtered.
- `audit_events_unified` action match-list assumed: `auth.signin`, `auth.login`, `login`. Verify with `auditLog.ts` once seed data lands.

Verified: `npm run build` exit 0, `built in 27.04s`.

## 2026-05-21 — Batch 5: Spend report sidebar wiring

- `MogzuApplication/src/app/components/layouts/SharedSidebar.tsx` — `report` nav item path: `/report` → `/corporate/spend-report`. Active matcher extended: `if (path.startsWith('/corporate/spend-report') || path.startsWith('/report')) return 'report'`. Old `/report` route preserved (ReportsPage hardcoded Jan-Dec demo charts still served if deep-linked) but no longer surfaced.
- `MogzuApplication/src/app/components/CorporateSpendReportPage.tsx` (no change) — already fully wired: date/dept/module filters, totals + breakdowns by module/department, CSV export via Blob URL with proper `csvCell` escaping, print/PDF via `window.print`. DEMO_DATA_BOOKINGS/USERS fallback when corporate has no bookings. L3-admin gate.

Why: glitch #5 — sidebar "Report" CTA pointed at `ReportsPage` (hardcoded `totalSpentData` + `totalSavingsData` arrays) instead of the real `CorporateSpendReportPage`. Real page was only reachable via deep-link from `AccountManagerPortfolioPage`.

Carry-over: ReportsPage still exists at `/report`; safe to keep for now (no inbound links from corp surfaces). Delete in Batch 15 cleanup pass per "Never delete working code" rule.

Verified: `npm run build` exit 0, `built in 25.06s`.

## 2026-05-21 — Batch 4: Approvals queue requester name embed

- `MogzuApplication/src/lib/db.ts` — `bookings.listByCorporate` select extended from `*, listings(*), vendors(*)` to `*, listings(*), vendors(*), user_profiles!user_id(*)`. Symmetry with `listPendingApproval` (line 328) which already embeds user_profiles.
- `MogzuApplication/src/app/components/CorporateApprovalsPage.tsx` (no change) — already destructures `b.user_profiles?.full_name` + `b.user_profiles?.department`; was falling back to id-slice because the embed was missing. Now renders real requester name + department.

Why: glitch #4 "Approvals queue partial wiring" — queue UI was wired but lookup query was missing the requester join. CorporateApprovalsPage row type already declared `user_profiles: UserProfile | null` on `BookingWithRefs`; only the query layer was short.

Carry-over (separate batch — out of glitch #4 scope):
- `ApprovalWorkflowPage` still 100% hardcoded local `rules` state; Save button writes nothing. Either repurpose `budget_rules` (no L1/L2/L3 levels) or add `approval_workflow_rules` migration. Per FRONTEND_COMPLETION_PLAN §4 row 30, P0 gap, M-sized.
- `ApprovalRequestPage` employee-side fallback values + setTimeout fake submit; needs `db.bookings.update(id, { status: 'pending_approval', revision_comment })` on resubmit.
- `db.bookings.cancel` on manager-reject does not credit wallet/budget back. Probably fine for demo (most flows are invoice-billed).

Verified: `npm run build` exit 0, `built in 26.36s`.

## 2026-05-21 — Batch 3c: Image + vendor contact + add-ons overlay

- `MogzuApplication/src/lib/db.ts` — `bookings.getById` select extended: `listings(*, listing_images(*)), vendors(*, user_profiles!user_id(full_name,phone)), booking_add_ons(*), user_profiles!user_id(*)`. One round-trip pulls everything the detail page renders.
- `MogzuApplication/src/app/components/BookingDetailPage.tsx`:
  - `RealBooking` type widened: `listings.listing_images[]`, `vendors.user_profiles{full_name,phone}`, `booking_add_ons[]`.
  - Overlay block now mounts:
    - `venue.image` — first listing image sorted by `display_order`; bucket selected by `listing.module` (`spaceImages` for `spacex_*`, `listingImages` otherwise).
    - `vendorContact.name` from `vendor.user_profiles.full_name` (falls back to `vendor.business_name`, then mock).
    - `vendorContact.phone` from `vendor.user_profiles.phone`.
    - `addOns[]` from `booking_add_ons` rows mapped to `{name, description: "Qty N · ₹price", icon}`; falls back to derived when empty.
  - `vendorContact.email` intentionally still mock — vendor email lives on `auth.users`, not surfaced via PostgREST embed here. Future: fetch via vendor RPC or move email to `user_profiles`.

Verified: `npm run build` exit 0, `built in 31.02s`. Hybrid render now covers venue (name/location/description/image), attendees, dates, price, status, payment, vendor contact (name+phone), add-ons. Only `vendorContact.email`, `team`, and `equipments` remain from mock.

## 2026-05-21 — Batch 3b: Detail-page hybrid render + realtime

- `MogzuApplication/src/app/components/BookingDetailPage.tsx`:
  - Added inverse mappers `mapStatus` (BookingStatus → UI `currentStatus`), `mapPaymentStatus`, `mapPaymentType`; ISO formatter `fmtIsoDate`.
  - Renamed existing `booking` useMemo → `derivedBooking` (passed-state / mock fallback derivation, unchanged).
  - New `booking` useMemo overlays `realBooking` fields onto `derivedBooking` when fetch resolves: `venue.name/location/description` from `listings`, `attendees` from `group_size`, `dateTime` from `start_time`/`end_time`, `price.basePrice/processing/total` from base_amount/platform_fee/total_amount, `bookingStatus.currentStatus` + `approvedOn`, `paymentStatus.status` + `paymentType`.
  - Realtime subscription via `subscribeToTable<RealBooking>` on `bookings` table with `id=eq.{id}` filter, event=UPDATE. Merges `payload.new` into `realBooking` state so the overlay re-renders when vendor confirms / corp cancels server-side. Cleanup on unmount.
  - Used Listing's `location_address` + `location_city` (no `location_state` on schema) for `venue.location`.

Verified: `npm run build` exit 0, `built in 14.72s`.

Carry-over → Batch 3c:
- Mount real listing image (currently `derivedBooking.venue.image` remains the mock figma asset). Need to extend `db.bookings.getById` select to include `listing_images` OR a separate fetch.
- Real vendor contact name (currently mock). Vendor row available in select but not yet wired into overlay (would need vendor user profile join for phone/email).
- Real add-ons + booking_add_ons → overlay `booking.addOns`.

## 2026-05-21 — Batch 3: Bookings glue

- `MogzuApplication/src/app/components/BookingsPage.tsx` — wire to `db.bookings`. L3 admins call `listByCorporate(corporateId)`; everyone else calls `listByUser(profile.id)`. Map `BookingStatus` → UI `{status, type}` via local `mapBookingStatus` switch. Compose `allBookings`: real ⊕ flow when real present; mock ⊕ flow otherwise (DEMO_DATA fallback per convention). `DevMockDataBanner` now gated on `!hasRealData`. Added `formatShortDate` ISO→`"MMM dd, yyyy"` helper for parity with mock format.
- `MogzuApplication/src/app/components/BookingDetailPage.tsx` — UUID guard around `db.bookings.getById`. Mock numeric ids (e.g. `1240909` from passed booking state) no longer hit Postgres → kills the 22P02 "invalid uuid" console error on legacy mock-link clicks. Real UUID ids continue to fetch + populate `realBooking` for `BookingMessagesPanel` + dispute modal.

Row-click navigation (`/bookings/:id`) confirmed sound — passes `booking` in `location.state` for both real and mock paths; BookingDetailPage uses passed state for primary render and overlays real data when fetch succeeds.

Carry-over → Batch 3b:
- Hybrid render: when `realBooking` present, override UI fields (venue.name, attendees, price.total, dates) on `booking` derived object so the detail page surface mirrors live data rather than the passed snapshot. Currently real data only powers messages + dispute.
- Status pill on `/bookings/:id` derived from `booking.bookingStatus.currentStatus` — does not yet flip when `realBooking.status` changes server-side. Add realtime subscription on `db.bookings` row.

Verified: `npm run build` exit 0, `built in 22.67s`.

## 2026-05-21 — Batch 2c: Heart sweep completion

Card-surface (listing pages, swap local heart -> canonical `<WishlistHeart>`):
- `MogzuApplication/src/app/components/StaySearchPage.tsx` — mount `<WishlistHeart listingId={stay.id} />` on image well + inline `<RatingBadge listingId={stay.id} showCount={false} />` next to vendor name; image well container made `relative` to anchor overlay
- `MogzuApplication/src/app/components/ActivitiesPage.tsx` — replace stub heart button with `<WishlistHeart listingId={String(activity.id)} />`; drop `Heart` lucide import
- `MogzuApplication/src/app/components/CelebrationsPage.tsx` — replace card heart button (line ~1326) with `<WishlistHeart>` carrying custom className for the existing rounded-button styling; keep filter-tab Heart icon (line 897) untouched
- `MogzuApplication/src/app/components/CoworkingPage.tsx` — replace card heart with `<WishlistHeart listingId={String(space.id)} />`; remove `favorites` state + `toggleFavorite` helper; drop `Heart` import
- `MogzuApplication/src/app/components/PromotionsPage.tsx` — replace static heart button with `<WishlistHeart listingId={String(promo.id)} />`; drop `Heart` import
- `MogzuApplication/src/app/components/EventActivityPage.tsx` — replace card heart with `<WishlistHeart listingId={String(cardId)} className=…/>`; remove `likedById`/`setLikedById` state; drop `Heart` import

Detail-page (canonicalize header heart):
- `MogzuApplication/src/app/components/ActivityDetailPage.tsx` — header heart -> `<WishlistHeart listingId={String(activity.id)} className=…/>`; drop `liked`/`setLiked` state + `Heart` import
- `MogzuApplication/src/app/components/CelebrationDetailPage.tsx` — header heart -> `<WishlistHeart listingId={String(product.id)} className=…/>`; drop `liked` state + `Heart` import
- `MogzuApplication/src/app/components/CoworkingDetailPage.tsx` — header heart -> `<WishlistHeart listingId={String(id ?? space.id)} className=…/>`; drop `isFavorite` state + `Heart` import
- `MogzuApplication/src/app/components/ProductBookingPageNew.tsx` — header heart -> `<WishlistHeart listingId={String(product.id)} className=…/>`; drop `Heart` import
- `MogzuApplication/src/app/components/ProductBookingPage.tsx` — drop unused `Heart` import (no usage in file)

Skipped (intentionally):
- `EventsPage` — no card heart present
- `GiftingShopPage` — `Heart` is a category icon (line 2642), not a save action
- `CelebrationsPage` filter-tab heart at line 897 — semantic filter chip, not a save action
- `ComparePage`/`WishlistPage`/`FavouritesPage`/`ReportsPage`/`RelatedProducts`/`VendorPassportPage`/`WhyMogzuPage`/`vendor/VendorPerformanceStatsDrawer` — Heart is decorative/icon-only, no toggle semantics

Verified: `npm run build` exit 0, `built in 13.46s`.

## 2026-05-21 — Batch 2b: Heart sprinkle (partial)

- `MogzuApplication/src/app/components/global/WishlistHeart.tsx` — UUID guard: real db writes only when `listingId` matches UUID v4 shape; mock ids fall back to local-only optimistic state (no Postgres FK errors). Defensive helper `isPersistable`.
- `MogzuApplication/src/app/components/global/RatingBadge.tsx` — UUID guard: skip `db.reviews.aggregate` lookup for non-UUID ids; renders null.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — mount `<WishlistHeart listingId={card.id} />` overlay in image well + `<RatingBadge listingId={card.id} />` inline below vendor row. Card image well changed `aspect-[4/3] bg-slate-100` → `relative aspect-[4/3] bg-slate-100` to anchor overlay.
- `MogzuApplication/src/app/components/SpaceXPage.tsx` — swapped local-state heart button (lines 2373-2389) for `<WishlistHeart listingId={String(space.id)} />`. Removed orphaned `likedSpaces` state (line 215). Removed unused `Heart` lucide import. Added `WishlistHeart` import.

Verified: `npm run build` exit 0, `built in 15.42s`.

Carry-over → Batch 2c:
- Remaining 18 components with local heart state — sweep when their parent module gets real-data wiring
- StaySearchPage, CorporatePicksPage — add WishlistHeart + RatingBadge (real-data surfaces, no heart today)
- Gifting product detail mount (no detail route exists)

## 2026-05-21 — Hotfixes surfaced by Batch 2 smoke

- `MogzuApplication/src/app/components/global/ListingReviewsPanel.tsx` — added UUID guard (parity with WishlistHeart + RatingBadge). Previously fired `db.reviews.listByListing("1")` → 22P02 "invalid uuid". Now renders empty state for mock ids.
- `MogzuApplication/src/app/lib/bookingDraft.tsx` — wrapped `setDraftPartial`, `setContactField`, `clearDraft` in `useCallback` for stable refs. Without this, consumers (e.g. `EventDetailPage` useEffect at line 283) caused infinite render loop because callback ref changed every render → effect deps invalidated → re-fired → setState → re-render. Pre-existing bug unmasked by Batch 2 / PriceBlock TDZ fix.
- `MogzuApplication/src/app/components/ui/PriceBlock.tsx` — useEffect at line 199 now dedupes via `lastDraftSigRef` (JSON.stringify payload signature) — parents pass inline `listing` object every render → addons array ref invalidates useMemo → effect was firing on identical content. Belt-and-suspenders alongside the bookingDraft useCallback fix.
- `MogzuApplication/src/lib/publicCatalogue.ts` — column drift: `listing_images.image_path` → `storage_path` (actual schema column). Plus `listings.pricing_mode` → `pricing_type`. Were 42703 errors.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — matching `pricing_mode` → `pricing_type` rename in `formatPrice`.

Verified: smoke 4/5 PASS. Remaining fail = empty listings table (data state, not code).
Build: `✓ built in 13.49s`.

## 2026-05-21 — Hotfix: PriceBlock TDZ

- `MogzuApplication/src/app/components/ui/PriceBlock.tsx` — moved `selectedAddons`/`addonPriceTotal`/`offerPerUnit`/`unitPrice`/`baseTotalRaw`/`feeRaw`/`grandTotalRaw` const declarations ABOVE the `useEffect` blocks that reference them. Was throwing `Cannot access 'selectedAddons' before initialization` on `/event-activity/:id`. Pre-existing bug, surfaced after Batch 2 mount changed render path. Pure reorder, no logic change.
- Verified: `npm run build` exit 0, `built in 46.30s`.

## 2026-05-21 — Batch 2: Listing trust + save signals

- `MogzuApplication/src/lib/db.ts` — added `db.wishlists.isInWishlist(userId, listingId)` (head-only count) + `db.reviews.aggregate(listingId)` (client-side avg + count, approved only)
- `MogzuApplication/src/app/components/global/WishlistHeart.tsx` — new reusable wishlist toggle (overlay + inline variants), canonical pattern from `design-system/MASTER.md §5`, optimistic update + revert on error
- `MogzuApplication/src/app/components/global/RatingBadge.tsx` — new aggregate-rating badge (overlay + inline variants), renders null when zero reviews, canonical pattern from `MASTER.md §6`
- `MogzuApplication/src/app/components/global/ListingReviewsPanel.tsx` — new reviews-list panel, reads `db.reviews.listByListing`, 5-shown + "View all (n)" expand, supports `source='invite'` "Pre-platform review" badge + vendor reply card; per `MASTER.md §7`
- `MogzuApplication/src/app/components/EventDetailPage.tsx` — mount `<ListingReviewsPanel listingId={listingId} />` between tabs container and "More events" carousel
- `MogzuApplication/src/app/components/SpaceDetailPage.tsx` — replace mock `selectedTab === 'reviews'` block (lines 898-914) with `<ListingReviewsPanel listingId={routeSpaceId} />` (transparent variant — host card retains existing rating display)

Verified: `npm run build` exit 0, `3171 modules transformed`, `built in 49.28s`. Pre-existing warnings only.

Deferred to Batch 2 follow-up:
- Mount panel on gifting product detail surface (no per-product detail page exists; revisit when product detail route lands or via shop-page modal)
- Swap canonical card heart in `SpaceXPage.tsx` to `<WishlistHeart>` — leaves the local-state debt in 20 files intact for now
- Sprinkle `<WishlistHeart>` + `<RatingBadge>` overlay on listing cards across catalogue (Batch 2b)

## 2026-05-21 — Batch 1: Booker-side communication parity

- `MogzuApplication/src/app/components/BookingDetailPage.tsx` — fetch real booking by url id (`db.bookings.getById`); inject `<BookingMessagesPanel>` below grid when real booking present; add "Raise a dispute" button + modal calling `db.bookingDisputes.raise`; mock-data fallback preserved when id absent or fetch fails
- `MogzuApplication/src/app/components/CancelBookingPage.tsx` — after `cancelWithRefund` success, look up `db.vendors.getById(booking.vendor_id)` and emit `booking_cancelled` notification to `vendor.user_id` (glitch #6)
- `MogzuApplication/src/app/components/GiftingSendPage.tsx` — fan-out `approval_required` notifications to all `l2_manager` users on `pending_approval` status (glitch #5)
- `MogzuApplication/src/app/components/SpaceBookingPage.tsx` — fan-out `approval_required` notifications to all `l2_manager` users on `pending_approval` status (glitch #5)

Verified: `npm run build` clean.

Deferred from Batch 1:
- Unread message badge in `NotificationBell` — already shipped (lines 30-49 sum `db.bookingMessages.unreadCountForUser`). Plan doc Section 3 glitch #14 entry stale.
- Email digest of unread messages — requires `notification_preferences` schema extension; moved to Batch 10.

## OPEN BUGS — fix later

- **Corporate onboarding gate is localStorage-only** — fixed 2026-05-21.
  - `isCorporateOnboardingComplete(profile?)` + `getCorporateOnboardingPath(profile?)` now accept an optional `UserProfile`. When supplied, completeness is derived from `user_profiles.corporate_id != null` (DB truth). LocalStorage flag remains as a fallback for pre-auth contexts only.
  - `getPostLoginPath(role, profile?)` updated to thread `profile` through.
  - Callsites updated to pass `profile` from `useAuth()`: ProtectedRoute.CorporateRoute, LoginPage, WelcomeScreen, AuthCallbackPage, auth.ts signIn return value.
  - AcceptInvitePage intentionally left unchanged — invite flow has no profile yet; localStorage fallback path is correct there.



- **`db.bookings.getById` PostgREST relation error** — durable fix landed 2026-05-21.
  - Migration `20260521000001_bookings_user_profiles_fkey.sql` adds explicit `bookings.user_id → user_profiles.id` FK + `NOTIFY pgrst, 'reload schema'`.
  - `db.ts:1652` also switched from bare `user_profiles(...)` to `user_profiles!user_id(...)` for the gifting-campaign bookings list (same brittleness, less critical path).
  - **Action required:** apply the migration in Supabase (push or run via SQL editor). Migration is idempotent only on first run; if `bookings_user_id_user_profiles_fkey` already exists, re-running will error.
  - Verified after apply: BookingDetailPage real-fetch path, CancelBookingPage, BookingPaymentPage, CorporateApprovalDetailPage, ReviewSubmitPage, RescheduleBookingPage, VendorBookingRequestsPage detail.

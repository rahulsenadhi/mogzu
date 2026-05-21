# FIXES Log — Frontend Completion Plan execution

> One line per file touched. Newest at top.

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

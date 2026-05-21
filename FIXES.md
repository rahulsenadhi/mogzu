# FIXES Log — Frontend Completion Plan execution

> One line per file touched. Newest at top.

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

- **Corporate onboarding gate is localStorage-only** (`src/app/lib/corporateOnboarding.ts:40`). `isCorporateOnboardingComplete()` reads `mogzu_corporate_onboarding_complete` from `localStorage`. Any existing user signing in on a fresh browser/device is forced through `/signup/corporate/company-details` even when `user_profiles.corporate_id` is already set. Root fix: derive completion from `user_profiles.corporate_id != null` (database truth) instead of/in addition to localStorage. Smoke workaround: pre-set the flag.



- **`db.bookings.getById` PostgREST relation error** (`Could not find a relationship between 'bookings' and 'user_profiles'`).
  - Surfaced on `/bookings/<id>/cancel` after Batch 1 deploy 2026-05-21.
  - Root cause: `bookings.user_id REFERENCES auth.users(id)` not `user_profiles.id`. PostgREST transitive inference via `user_profiles.id ← auth.users.id` brittle.
  - Partial fix applied: `src/lib/db.ts` lines 301, 322, 329 changed `user_profiles(*)` → `user_profiles!user_id(*)`. Will verify on next smoke test.
  - If still failing: likely PostgREST schema cache stale — restart project via Supabase dashboard (Settings → API → Restart). Long-term: add explicit FK `ALTER TABLE bookings ADD CONSTRAINT bookings_user_id_user_profiles_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id)` in a new migration.
  - Affects: CancelBookingPage, BookingDetailPage real-fetch path, BookingPaymentPage, CorporateApprovalDetailPage, ReviewSubmitPage, RescheduleBookingPage, VendorBookingRequestsPage detail.

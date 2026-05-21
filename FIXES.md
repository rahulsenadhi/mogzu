# FIXES Log — Frontend Completion Plan execution

> One line per file touched. Newest at top.

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

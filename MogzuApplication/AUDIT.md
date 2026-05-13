<!--
LISTINGS AUDIT — STEP 1 (READ-ONLY)
Scope:
- 14 target categories
  Activities: Workshops & Trainings, Arts & Creativity, Virtual Games, Wellness Programs, Entertainment, Themed Parties, CSR
  Services: Catering, Audio Visuals, Design & Decor, Security, Transportation, Technology, License/Permits
- Corporate, Vendor, Admin listing-related routes/screens/components
-->

# Listings Audit

## 1) COMPLETE (working, no immediate changes needed)

- `SpaceXPage` (`/spacex`) -> `SpaceDetailPage` (`/spacex/:id`) is fully routed and card-to-detail navigation works.
- `EventsPage` event-activity mode (`/events` tab: Event Activity) renders merged catalogue cards and navigates to `EventDetailPage` via `/event-activity/:id`.
- `ActivitiesPage` (`/activities`, `/dashboard/activities`) renders listing grid, pagination, and navigates to `ActivityDetailPage` (`/dashboard/activities/:id`).
- Corporate compare page exists: `ComparePage` (`/compare`).
- Corporate booking summary/review exists: `BookingReview` (`/booking-review`).
- Corporate booking confirmation exists: `BookingConfirmation` (`/booking-confirmation`).
- Vendor listing dashboards exist:
  - `VendorEventActivityPage` (`/vendor/event-activity`)
  - `VendorEventsServicesPage` (`/vendor/events`)
  - `VendorSpaceXServicesPage` (`/vendor/spacex`)
- Admin listing management exists:
  - `AdminPartnerListingsPage` (`/admin/partner-listings`)
  - `AdminPartnerListingFormPage` (`/admin/partner-listings/new`, `/admin/partner-listings/edit/:id`)
- Mogzu Direct admin panel exists:
  - `MogzuDirectPage` (`/admin/mogzu-direct`)
  - `MogzuDirectFormPage` (`/admin/mogzu-direct/add`, `/admin/mogzu-direct/edit/:id`)

## 2) HAS GAPS (exists but broken/incomplete)

- `EventActivityPage` (`/event-activity`)
  - Category chips (8 categories) are visual only; selected category is not applied to `filteredActivities`.
  - Filter group "Workshops & Trainings" checkboxes update state but are not used in filtering logic.
  - Date input exists but is not used in filtering.
  - Card CTA is card click only; no explicit "Book Now" button on each card.
  - Uses static mock events; not tied to full 14-category taxonomy.

- `EventsPage` (`/events`)
  - Event Activity mode has rich filters and does use many of them, but category mapping differs from requested 7 activity categories.
  - Event Service mode delegates to `EventServiceContent`, which is mostly static/mock.

- `EventServiceContent` (rendered inside `/events` when tab = event-service)
  - Service cards are hardcoded `[1..9]` clones with static text/price (`₹600`), not real category-specific data.
  - Search inputs (location/attendees/date) do not filter the grid.
  - Left filter checkboxes are presentational only (no state binding except price slider).
  - Category icons navigate to `/event-activity/1` instead of service-specific detail/listing context.
  - "License/Permits" appears as "License" only; no explicit permits representation.
  - Includes "Photography & videography" category not in requested 7 services.

- `ActivitiesPage` (`/activities`, `/dashboard/activities`)
  - Grid data is rich but activity taxonomy does not match requested 7 activity categories; uses broader sets (Indoor Fun, Sports, etc.).
  - Many filters are present but not applied in `filteredActivities`:
    - `searchAttendees`, `searchDate`, `priceRange`, `selectedRating`, `selectedFeatures` are not used.
  - Card CTA is "Enquire Now" button, but action relies on parent card click (no dedicated CTA handler).

- `EventDetailPage` (`/event-activity/:id`)
  - Uses very small local dataset (`eventActivities` contains only one item), so many IDs fall back to first item.
  - Gallery thumbnails are static images; thumbnail click behavior not implemented.
  - No review list/pagination; only ratings and static content.
  - Booking panel has date picker but no time-slot selector.

- `ActivityDetailPage` (`/dashboard/activities/:id`)
  - Gallery thumbnails are static/non-clickable.
  - No date picker/time slot controls in booking panel.
  - No review pagination/listing.
  - Uses large local mock array, not unified with events/service catalogues.

- `SpaceXPage` (`/spacex`)
  - Large filter surface exists and most filters are wired, but amenities filter computes matches and then does not enforce exclusion (comment says intentionally lenient); effectively weak filtering.
  - Category set is space-oriented (conference/casual/corporate/coworking), not the 14 target categories.
  - Wishlist action shows "future release" notice.

- `SpaceDetailPage` (`/spacex/:id`)
  - Strong detail layout and gallery/lightbox exist.
  - Reviews tab shows summary metrics only; no review pagination.
  - Date picker exists; no dedicated time-slot selector.
  - Contains "Vendor Pricing Publish Controls" inside corporate detail view (demo tooling mixed into buyer UI).

- `FavouritesPage` (`/favourites`)
  - Exists but is generic mock shortlist, not listing-type-specific saved view with real listing integration.
  - Item actions (`View Details`, remove/save) are mostly UI-only.

- `ComparePage` (`/compare`)
  - Exists with side-by-side compare and pricing block, but data is static mock and not connected to actual selected shortlist from listing pages.

- Vendor listing screens (`/vendor/events`, `/vendor/event-activity`, `/vendor/spacex`)
  - Creation/edit is single-form demo, not multi-step workflow.
  - Status coverage limited to `Active`, `Draft`, `Paused`; no `Pending`/`Rejected` lifecycle.
  - No dedicated rejection-detail screen.
  - No explicit listing performance analytics panel per listing.

- Admin listing management
  - Admin master tables exist, but no dedicated read-only "listing detail + action panel" route.
  - `AdminProductCategoriesPage` exists but is product-centric and partially future-placeholder for attributes; not clearly the 14-category listing taxonomy manager.

## 3) MISSING (does not exist yet)

- Dedicated normalized listing module specifically for the exact 14 categories (7 activities + 7 services) across corporate/vendor/admin.
- Service-specific detail page flow (current service cards jump into event-activity detail).
- Time-slot selector on detail booking panels (date exists, time slot missing).
- Review list with pagination on listing detail pages.
- Vendor rejection detail view (for declined/rejected submissions/listings).
- Vendor performance stats panel focused on listing-level KPIs.
- Admin listing detail + action panel screen (approve/reject/escalate/history) separate from edit form.
- Global demo role switcher component in app shell/nav (not present as a dedicated global component).

---

## 4) Reusable Components Found

### Layout/App shell
- `src/app/components/layouts/SharedHeader.tsx`
- `src/app/components/layouts/SharedSidebar.tsx`
- `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
- `src/app/components/layouts/VendorAppShell.tsx`
- `src/app/components/layouts/VendorSidebar.tsx`
- `src/app/components/layouts/VendorTopRightMenu.tsx`

### Listing/commerce utilities
- `src/app/components/ui/PricingBlock.tsx` (used in detail/compare flows)
- `src/app/components/ui/CompareWidget.tsx` (used in `SpaceXPage`)
- `src/app/components/SpaceXCategoryTabIcon.tsx`
- `src/app/components/corporate/CorporateMogzuPicksSection.tsx`
- `src/app/components/figma/ImageWithFallback.tsx`

### Not found as reusable primitives (mostly inline per page)
- No shared `ListingCard` component
- No shared `FilterPanel` component
- No shared `BookingPanel` component
- No shared `CategoryTabs` component (multiple local variants)

---

## 5) Mock/Seed Data Locations (exact paths)

### Listing data in components
- `src/app/components/ActivitiesPage.tsx` -> `seedActivities`
- `src/app/components/ActivityDetailPage.tsx` -> `activities`
- `src/app/components/EventActivityPage.tsx` -> `eventActivities`
- `src/app/components/EventDetailPage.tsx` -> `eventActivities` (minimal fallback data)
- `src/app/components/SpaceXPage.tsx` -> `staticSpaces`
- `src/app/components/FavouritesPage.tsx` -> `favouriteItems`
- `src/app/components/ComparePage.tsx` -> `vendors`

### Catalogue/data mappers and storage
- `src/utils/catalogueTypes.ts` (canonical `CatalogueItem` contract)
- `src/utils/catalogueUtils.ts` (`getMergedCatalogue`, mapping logic)
- `src/utils/filterContracts.ts` (`parsePriceLike`, `matchesPriceRange`, `matchesSourceFilter`)
- `src/app/lib/corporateApprovedListingsStorage.ts` (approved partner listings in localStorage)
- `src/app/lib/mogzuDomain.ts` (partner + Mogzu Direct listing models/load/save)
- `src/utils/mogzuDirectCatalogueAdmin.ts` (admin-side Mogzu Direct catalogue)
- `src/app/lib/corporateAdminPromotionsStorage.ts` (promo data for listing surfaces)
- `src/app/data/vendorServiceCatalog.ts` (vendor service catalog data source)
- `src/app/lib/adminProductsMock.ts` (admin category/product mock rows)

### Browser persistence keys seen in listing flows
- `mogzu_corporate_approved_listings`
- `mogzu_vendor_listings`
- `mogzu_direct_catalogue`
- `vendorSpaceListingConfig`

---

## 6) Pricing: How it is Stored and Displayed

### Canonical catalogue fields
- In `CatalogueItem` (`src/utils/catalogueTypes.ts`):
  - `pricing_type`: `fixed | per_head | package | custom_quote`
  - `base_price?: number`
  - `price_label?: string`

### Domain listing fields (admin/vendor)
- `mogzuDomain` listing models:
  - `pricing_mode`: `fixed | negotiable | on_request`
  - `price`
  - `price_unit`

### Card-level rendering patterns
- `EventsPage` cards:
  - Prefers `base_price` -> rendered with `formatInr(base_price)`
  - Falls back to `price_label`
- `ActivitiesPage` cards:
  - Uses `activity.price` string directly
- `EventActivityPage` cards:
  - Uses `activity.price` string directly ("Starting at")
- `SpaceXPage` cards:
  - Uses `space.price` string
  - Adds chips from `pricingType`, `paymentMode`, `paymentTerm`

### Detail-page pricing
- `SpaceDetailPage`:
  - Uses `listingPriceLine` from nav state (`space.price`) else `basePrice + priceUnit`
  - Supports pricing mode variants: `fixed`, `negotiable`, `on_request`
- `EventDetailPage` / `ActivityDetailPage`:
  - `PricingBlock` with `mode="negotiable"` and `price={...}`
- `ComparePage`:
  - Each vendor row uses `PricingBlock` with `pricingMode`, `price`, `priceUnit`

### Card vs detail mismatch risks
- Multiple pages store price as free-form string (`"₹5,000/hr"`, `"On request"`), while catalogue uses numeric + label fields.
- Detail pages can fall back to hardcoded defaults when ID mapping fails (not always using source card record).

---

## 7) Role-Specific Views/Routes (what exists)

### Corporate
- Listing/discovery routes: `/events`, `/event-activity`, `/activities`, `/dashboard/activities`, `/spacex`, `/coworking`
- Detail routes: `/event-activity/:id`, `/dashboard/activities/:id`, `/spacex/:id`, `/coworking/:id`
- Supporting routes: `/compare`, `/favourites`, booking flow (`/request-to-book`, `/booking-addons`, `/booking-review`, `/booking-payment`, `/booking-confirmation`)

### Vendor
- Listing management routes:
  - `/vendor/events`
  - `/vendor/event-activity`
  - `/vendor/spacex`
  - `/vendor/spacex/:spaceId` (detail)

### Mogzu Admin
- Listing governance routes:
  - `/admin/partner-listings`
  - `/admin/partner-listings/new`
  - `/admin/partner-listings/edit/:id`
  - `/admin/mogzu-direct`
  - `/admin/mogzu-direct/add`
  - `/admin/mogzu-direct/edit/:id`
  - `/admin/products/categories` (category management, product-oriented)

---

## 8) Checklist Findings by Requested Area

### A) LISTING CARDS

#### Do all 14 category grids render cards with real data?
- **No**.
- Activity/service taxonomy is split and inconsistent:
  - `EventsPage` has 8 activity icons (includes "Educational", not in requested 7).
  - `EventServiceContent` has 8 service icons (includes "Photography & videography", "License" only).
  - `ActivitiesPage` uses 10 broader buckets (Indoor Fun, Sports, etc.) not requested 7.

#### Undefined/null/NaN fields?
- No obvious direct `undefined` rendering in card text on main listing pages.
- **Gap risk**: `EventDetailPage` ID lookup uses `parseInt(id)` against a 1-item array -> many routes resolve to fallback item, causing incorrect detail data rather than explicit not found.

#### Pricing display on each card and field source?
- `EventsPage`: `base_price` / `price_label` from `CatalogueItem`.
- `ActivitiesPage`: `activity.price` (string).
- `EventActivityPage`: `activity.price` (string).
- `EventServiceContent`: static `₹600` hardcoded in card template.
- `SpaceXPage`: `space.price` (string) + pricing/payment chips.

#### CTA on cards and functional?
- Often card container click navigates to detail (functional).
- Explicit CTA button varies:
  - Some pages show "Enquire Now" button (no dedicated handler; parent card click handles).
  - Some cards have no explicit CTA besides clickable card.

### B) FILTERS

#### Filter panel exists?
- Yes on `EventsPage`, `EventActivityPage`, `ActivitiesPage`, `SpaceXPage`, `EventServiceContent`.

#### Inputs present vs missing (high-level)
- Present: location, attendees/team size, date, price controls, category chips/toggles, source filter (some pages), sort (some pages).
- Missing/weak: unified 14-category filter contract, consistent sort across pages, robust permit/license distinction.

#### Do filters actually narrow grid?
- `SpaceXPage`: mostly yes (except amenities logic is effectively non-restrictive).
- `EventsPage` (event-activity mode): mostly yes.
- `EventActivityPage`: partially (location/attendees/price/sort/pricing-type/payment filters yes; category/workshop checkboxes/date no).
- `ActivitiesPage`: partially (category/search/location yes; attendees/date/price/rating/activity-type no).
- `EventServiceContent`: mostly no (static cards, minimal stateful filtering).

#### Clear All works?
- Present and resets state on most pages; effectiveness depends on whether those fields are used in filtering.

#### Sort dropdown present and functional?
- Functional in `EventActivityPage`, `SpaceXPage`.
- Not consistently present in `ActivitiesPage`/`EventServiceContent`.

### C) LISTING DETAIL PAGE

#### Does detail exist and render for all 14 categories?
- **Not fully**.
- Existing detail screens:
  - `EventDetailPage` for `/event-activity/:id`
  - `ActivityDetailPage` for `/dashboard/activities/:id`
  - `SpaceDetailPage` for `/spacex/:id`
- Service categories do not have a dedicated service-detail route; service cards route into event-activity detail.

#### Image gallery + thumbnail click?
- `SpaceDetailPage`: yes (lightbox, next/prev, clickable thumbs).
- `EventDetailPage` / `ActivityDetailPage`: gallery shown, but no thumbnail click interaction.

#### Booking/price panel on right?
- Yes on all three detail pages.

#### Availability date picker + time slot selector?
- Date picker: yes (`SpaceDetailPage`, `EventDetailPage`), absent in `ActivityDetailPage`.
- Time slot selector: not implemented.

#### Reviews rendered + pagination?
- `SpaceDetailPage`: review metrics summary only; no review list pagination.
- Others: no pageable reviews.

#### Breadcrumb render + clickable links?
- Yes on major detail pages; breadcrumb links are clickable.

### D) VENDOR SCREENS

#### Vendor listing dashboard exists?
- Yes: `/vendor/events`, `/vendor/event-activity`, `/vendor/spacex`.

#### Multi-step listing create/edit form exists?
- **No**.
- Current forms are single-section create forms inside each page.

#### Status badges Draft/Pending/Active/Paused/Rejected?
- Current status chips generally support only `Active`, `Draft`, `Paused`.
- `Pending` and `Rejected` states are not implemented in vendor listing UIs.

### E) ADMIN SCREENS

#### Admin listings master table exists?
- Yes:
  - Partner listings table in `/admin/partner-listings`
  - Mogzu Direct list/cards in `/admin/mogzu-direct`

#### Admin listing detail view exists?
- Not as dedicated detail page/action panel.
- Current path is edit form route for partner/Mogzu listings.

#### Category management screen exists?
- Yes: `/admin/products/categories` (`AdminProductCategoriesPage`) but product-category oriented and partly placeholder.

#### Mogzu Direct panel exists?
- Yes: `/admin/mogzu-direct` (+ add/edit routes).

### F) Requested "Missing Screens" confirmation

- Wishlist / Saved Listings (Corporate): **Partially exists** as `/favourites` (generic, mock-heavy, not fully integrated).
- Compare View (Corporate): **Exists** (`/compare`) but static/mock data.
- Booking Summary screen (Corporate): **Exists** (`/booking-review`).
- Booking Confirmation screen (Corporate): **Exists** (`/booking-confirmation`).
- Rejection Detail view (Vendor): **Missing**.
- Performance Stats Panel (Vendor): **Missing** (no dedicated listing performance panel).
- Admin Listing Detail + Action Panel: **Missing**.
- Admin Category Management: **Exists** (`/admin/products/categories`) with scope limitations.
- Mogzu Direct Admin Panel: **Exists** (`/admin/mogzu-direct`).
- Demo Role Switcher (global nav component): **Missing** (no dedicated global role switcher component found).

---

## 9) Bottom Line

- Listing architecture is present across all 3 roles, with significant UI surface already built.
- Biggest gaps are **taxonomy consistency (exact 14 categories)**, **filter correctness**, **service-detail routing**, **vendor/admin workflow depth**, and **unified reusable listing components**.
- Audit complete for Step 1; no feature code changes were made.


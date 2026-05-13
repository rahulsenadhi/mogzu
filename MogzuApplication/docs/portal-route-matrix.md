# Portal route matrix and gap register (Phase 0)

Heuristic persona tags: **Corp** = corporate dashboard/sidebar; **Vendor** = `/vendor/*`; **Admin** = `/admin/*`; **Public** = marketing/auth; **Shared** = booking flows used by multiple actors.

## P0–P3 gap register (evidence-based)

| ID | Severity | Gap | Mitigation (implementation wave) |
|----|----------|-----|----------------------------------|
| G1 | P0 | Corporate browse pages did not load Mogzu Direct / Partner listings | Wave 1: `CorporateMogzuPicksSection` on shop, gifting, spacex, events |
| G2 | P0 | Admin sidebar linked to Partners, Shortlists, Mogzu orders without router children | Register routes under `/admin` (Wave 3 batch) |
| G3 | P1 | `ProductBookingPage` ignored vendor catalog `buyer_detail` | Wave 2: `vcat` query + `loadAllVendorCatalogProductsAggregated` |
| G4 | P2 | Admin could not backfill Mogzu order after corporate shortlist confirm (e.g. different profile) | Wave 3: `ensureOrderFromShortlistSelection` + editor CTA |
| G5 | P3 | Mock Space/Event detail tabs not typed as `ListingBuyerDetailBlock` | Wave 4: align mock payloads + reuse summaries where cheap |

## Route sample matrix (representative)

| Path prefix | Persona | Primary data source |
|-------------|---------|---------------------|
| `/dashboard`, `/shop`, `/gifting`, `/spacex`, `/events` | Corp | Mock + approved listings; **+** `mogzu_direct_listings`, `partner_listings` (Wave 1) |
| `/browse/mogzu-direct/:module/:id` | Corp | `MOGZU_DIRECT_LISTINGS_KEY` |
| `/browse/partner-listing/:id` | Corp | `PARTNER_LISTINGS_KEY` |
| `/shortlist/:token` | Corp | `SHORTLIST_PROPOSALS_KEY` |
| `/vendor/*` | Vendor | Onboarding scope + `mogzu_vendor_catalog_products_v1_*` |
| `/admin/*` | Admin | Same domain keys + admin mocks |
| `/product-booking` | Corp | Product mocks + **optional** aggregated vendor catalog (Wave 2) |

## Shells / nav entry points

- **Admin:** `AdminLayout.tsx` sidebar.
- **Corporate:** `SharedSidebar` + `Dashboard.tsx` (and per-page sidebars).
- **Vendor:** vendor dashboard shell components under `components/`.

Full path enumeration: generate from `src/app/routes.tsx` when auditing (100+ routes).

## Entertainment listings (live music, karaoke)

- **Corporate:** `/events` and `/event-activity` show `CorporateMogzuPicksSection` for `module: events`, including a **Live music and karaoke** strip filtered by category (`categoryIncludes`). Data comes from `mogzu_direct_listings` and `partner_listings` (localStorage). Empty stores are backfilled with demo seeds in `utils/mogzuDataTypes.ts` (`ensureDefaultMogzuDirectListings`, `ensureDefaultPartnerListings`).
- **Admin shortlist (vendor tab):** `MOCK_PRODUCTS` in `src/app/lib/adminProductsMock.ts` includes `vertical: 'events'` rows for shortlist demos (including live band and karaoke mock SKUs). These are not the same objects as Mogzu Direct / partner listings; replace with aggregated vendor catalog when wired.
- **Vendor portal `/vendor/events`:** still mock-first; marketplace entertainment is modelled as **partner listings** (or admin-created Mogzu Direct) until vendor event services are persisted and merged into browse (Phase 4 path **A** = partner/admin catalogue; path **B** = persist vendor UI + merge).

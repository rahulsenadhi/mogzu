# QA audit: Events, Gifting, Activity Suite, Dashboard promo

Structured notes from the Events + Gifting + Activity Suite + Dashboard promo QA plan (implementation pass).

## Route map (source: `src/app/routes.tsx`)

| Path | Screen |
|------|--------|
| `/activitysuite` | Activity Suite hub |
| `/gifting` | Gifting landing |
| `/shop`, `/gifting-shop` | Gifting shop |
| `/product-booking` | Product booking |
| `/events` | Events (tabs: Events, Event Activity, Event Service) |
| `/event-activity`, `/event-activity/:id` | Event activity list + detail |
| `/assistance` | Mogzu Assistant |
| `/dashboard` | Dashboard (promo carousel, shortcuts) |

## Activity Suite (`ActivitySuite.tsx`)

- **P0:** Event module CTA → `/events` (was `/event`). Mogzu Assistant → `/assistance` (was `/assistant`).
- **Related links:** Optional secondary CTAs (e.g. coworking, shop, event activities).
- **Assets:** Module art uses `qaImagery.ts` (Unsplash) instead of `figma:asset`.

## Dashboard promo (`Dashboard.tsx`, `PromoBanner.tsx`)

- **Visibility:** `PromoBanner` renders for **all** plans (previously gated to `professional` / `business-plus` only).
- **Slick CSS:** Imported in `src/main.tsx` from `slick-carousel`; runtime `<link>` tags removed from `PromoBanner`.
- **Shortcuts:** “You might want to try” includes navigation for Hey Genie → `/heygenie`. SpaceX card uses visible imagery (no broken mask).
- **Enterprise CTA:** “Schedule Kickoff” → `/communication`.

## Events surfaces

- **Events page:** Breadcrumb trail shows **Events** (not “Space X”). Category/event images from `qaImagery.ts`.
- **Event activity:** Breadcrumb `Activity Suite` → `Events` → `Event activity` with working navigation.
- **Event service:** Banner/vendor badge copy cleaned (“Featured partner”). “View offer” → `/event-activity`. Trending blurb de-loremized.
- **Event detail:** Fallback activity image from `qaImagery.ts`.

## Gifting surfaces

- **Gifting hub / shop:** Breadcrumbs use **Dashboard** as root crumb (was mislabeled “Activity Suite”). Product/hero imagery from `qaImagery.ts`.
- **Product booking:** Agent/vendor avatars from `qaImagery.ts`.

## Functionality notes (remaining / intentional)

- Event Service filters and search UI are still mostly **presentational** (checkboxes/range not wired to result set beyond existing markup).
- **Corporate gifting fields** (PO, cost center, etc.): deferred pending product confirmation per plan.
- `ProductBookingPageNew.tsx` still contains `figma:asset` imports if re-enabled in routes; main flow uses `ProductBookingPage.tsx`.

## Figma assets

- Scoped listing pages above: **`figma:asset` removed** in favor of `src/app/lib/qaImagery.ts`.
- Other app areas may still import `figma:asset`; track separately.

## Verification

- `npm run build`
- Manual: `/activitysuite`, `/events`, `/event-activity`, `/gifting`, `/shop`, `/dashboard` with `localStorage` plan variants.

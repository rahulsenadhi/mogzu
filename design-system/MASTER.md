# Mogzu Frontend Design System — Master Reference

> **Source:** audit of `ExplorePage`, `SpaceXPage`, `DSpaceHomePage`, `GiftingShopPage`, `ListingCardImageGallery`, plus 20 components rendering `<Heart>` icons.
> **Tech:** React + Tailwind + Vite (NOT React Native — skill defaults are React Native; rules adapted to web).
> **Date:** 2026-05-21 — pre-Batch-2 audit.
> **Use:** any new component (Batch 2 onward) MUST adopt the tokens below. Do not invent new card shells, color hues, or animation curves.

---

## 1. Page background

| Surface | Token |
|---|---|
| Page chrome (logged-in app) | `bg-[#FFFDF9]` (cream) |
| Discovery/marketing surface | `MogzuAmbientBackdrop` (cream + faint blue washes) |
| Card surface — solid (Explore, Bookings) | `bg-white` |
| Card surface — glass (DSpace, gifting nav, ambient) | `bg-white/65 backdrop-blur-md` |

**Two card systems coexist.** Treat them as different products — do not retrofit one onto the other.

---

## 2. Color palette

| Role | Token | Hex |
|---|---|---|
| Primary blue (CTA) | `bg-[#2563eb]` | `#2563EB` |
| Primary blue hover | `bg-[#1d4ed8]` / `bg-blue-700` | `#1D4ED8` |
| Mogzu orange (brand accent, active heart, partner) | `text-[#ff6b35]` / `text-[#fa8d40]` | `#FF6B35` / `#FA8D40` |
| Heading / dark text | `text-[#0e1e3f]` / `text-slate-900` | `#0E1E3F` |
| Body | `text-slate-700` / `text-slate-600` | — |
| Muted meta | `text-slate-500` / `text-slate-400` | — |
| Inactive icon (heart, etc.) | `text-[#878e9e]` | `#878E9E` |
| Section border | `border-slate-200` | — |
| Glass border | `border-white/60` | — |
| Success / approval | `text-emerald-600` / `bg-emerald-500` | — |
| Warning / SLA | `text-amber-700` / `bg-amber-50` | — |
| Destructive | `text-rose-600` / `bg-rose-50` | — |

**Discovery accent set** (DSpaceHomePage quick-access cards — DO NOT invent new ones):
- Teal: `border-[#bfe7dc]` + `text-[#0F766E]` + `bg-[#ebfffa]` (Meetings)
- Blue: `border-[#bfdbfe]` + `text-[#0369A1]` + `bg-[#eff6ff]` (Coworking)
- Amber: `border-[#fde68a]` + `text-[#B45309]` + `bg-[#fffbeb]` (Activities)
- Purple: `border-[#e9d5ff]` + `text-[#7C3AED]` + `bg-[#faf5ff]` (Stay)
- Red: `border-[#fecaca]` + `text-[#DC2626]` + `bg-[#fef2f2]` (Promotions)

---

## 3. Typography

| Role | Class |
|---|---|
| Font family (global) | `font-['Inter']` |
| Page H1 | `text-2xl font-bold text-[#0e1e3f]` |
| Section heading | `text-lg font-bold text-[#0e1e3f]` |
| Card title | `text-sm font-semibold text-slate-900` |
| Card meta | `text-xs text-slate-500` |
| Card body / description | `mt-2 line-clamp-2 text-xs text-slate-600` |
| Price | `text-sm font-bold text-slate-900` |
| Section heading w/ accent bar | `border-l-4 border-[#2563eb] pl-3 text-[16px] font-semibold text-slate-800` |
| Tiny label uppercase | `text-[10px] uppercase font-bold tracking-wider text-slate-500` |
| Badge text | `text-[10px] font-bold uppercase tracking-wider` |
| Status chip | `text-[10px] px-2 py-0.5 rounded-full font-bold` |

---

## 4. Listing card — canonical anatomy

### 4a. Solid variant (Explore, public catalogue, lists)
```
<li className="overflow-hidden rounded-2xl border border-slate-200 bg-white
              shadow-sm transition hover:shadow-md">
  <div className="aspect-[4/3] bg-slate-100">  {/* image well */}
    ...image
    {/* overlays (heart, compare, badges) live here, position absolute */}
  </div>
  <div className="p-4">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-xs text-slate-500">{vendor} · {category}</p>
    <p className="mt-2 line-clamp-2 text-xs text-slate-600">{desc}</p>
    <div className="mt-3 flex items-center justify-between">
      <span className="text-sm font-bold text-slate-900">{price}</span>
      <button className="rounded-md bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1d4ed8]">CTA</button>
    </div>
  </div>
</li>
```

### 4b. Glass variant (DSpace, SpaceX)
```
<div className="group flex min-h-[380px] flex-col overflow-hidden rounded-2xl
                border border-white/60 bg-white/65 backdrop-blur-md
                shadow-[0_10px_30px_rgba(37,99,235,0.14)]
                transition-all hover:-translate-y-0.5
                hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] cursor-pointer">
  <div className="relative h-40 overflow-hidden">  {/* image well */}
    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
    {/* heart top-right, compare top-left, rating-overlay bottom */}
  </div>
  ...body
</div>
```

### Grid
- Discovery: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Detail-heavy module pages: same, sometimes `lg:grid-cols-2`

---

## 5. Heart / wishlist affordance — CANONICAL (from SpaceXPage card)

```tsx
<button
  type="button"
  onClick={(e) => { e.stopPropagation(); toggleSaved(listingId); }}
  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm
             flex items-center justify-center rounded-full
             hover:bg-white transition-all shadow-sm z-10"
  aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
>
  <Heart className={`w-4 h-4 ${saved ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-[#878e9e]'}`} />
</button>
```

**Constraints:**
- Position: top-right of image well (compare button takes top-left).
- Active fill: `text-[#ff6b35]` with `fill-[#ff6b35]`.
- Inactive: `text-[#878e9e]`, no fill.
- Always `e.stopPropagation()` because parent card is clickable.
- 8×8 (32px) hit area — meets 44pt min via padding/hitSlop equivalent.
- aria-label required.

**Today's reality:** 20 components render `<Heart>` with local `liked*` state. NONE persist. Wiring to `db.wishlists.add/remove/listByUser` is Batch 2 work.

---

## 6. Rating badge — CANONICAL (from SpaceXPage card)

```tsx
<div className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[#0e1e3f]
                rounded-md text-[10px] font-semibold flex items-center gap-0.5
                shadow-[0_6px_14px_rgba(15,23,42,0.14)]">
  <Star className="size-2" fill="#FFCC47" stroke="none" />
  {rating.toFixed(1)}
</div>
```

**Position:** bottom-left overlay on image well, inside a gradient bar:
`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5`

**Today's reality:** rating value hard-coded mock. Batch 2 must wire aggregate from `reviews` table.

---

## 7. Reviews panel — TO DESIGN (Batch 2)

No existing reusable component. Reference: `VendorReviewsPage` (vendor-facing list), `ReviewSubmitPage` (5-star form).

**Proposed `<ListingReviewsPanel listingId>` shell:**
```
Container:  bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8
Heading:    text-lg font-bold text-[#0e1e3f] mb-6
Empty:      text-sm text-slate-400 py-6 text-center
Each row:
  border-b border-slate-100 py-4 last:border-b-0
  Top:    rating stars + reviewer + date  (text-xs text-slate-500)
  Body:   text-sm text-slate-700 mt-2
  Reply:  bg-slate-50 rounded-xl p-3 mt-3 (vendor reply variant)
Limit:  first 5 visible + "View all (n)" CTA → /listings/:id/reviews
```

**Mount sites (Batch 2):** event detail, space detail, gifting product detail. Same component, different `listingId`.

---

## 8. Button styles

| Variant | Class |
|---|---|
| Primary | `rounded-lg bg-[#2563eb] text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 transition-colors shadow-sm` |
| Primary (small) | `rounded-md bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1d4ed8]` |
| Secondary | `rounded-lg border-2 border-slate-200 text-slate-700 text-sm font-bold px-4 py-2.5 hover:bg-slate-50` |
| Destructive | `rounded-md bg-rose-600 text-white text-sm font-semibold px-4 py-2 hover:bg-rose-700` |
| Ghost / cancel | `rounded-md border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-slate-50` |
| Icon (in card) | `w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white z-10` |
| Pill filter — active | `rounded-full bg-slate-900 text-white px-4 py-1.5 text-sm font-medium` |
| Pill filter — inactive | `rounded-full border border-slate-200 bg-white text-slate-700 px-4 py-1.5 text-sm font-medium hover:bg-slate-50` |

---

## 9. Effects + motion

| Aspect | Value |
|---|---|
| Card radius | `rounded-2xl` |
| Inner element radius | `rounded-xl` |
| Chip / badge radius | `rounded-md` or `rounded-full` |
| Card shadow (solid) | `shadow-sm` rest, `shadow-md` hover |
| Card shadow (glass) | `shadow-[0_10px_30px_rgba(37,99,235,0.14)]` rest, `shadow-[0_18px_36px_rgba(37,99,235,0.22)]` hover |
| Card hover lift | `hover:-translate-y-0.5` (glass only; solid variant uses shadow change only) |
| Image hover zoom | `group-hover:scale-[1.03]` on `<img>` with `transition-transform duration-500` |
| Transition default | `transition-all` or `transition-colors`, no explicit duration → Tailwind default 150ms |
| Loader | `<Loader2 className="size-6 animate-spin text-slate-400" />` centered in `py-14` block |

---

## 10. Layout primitives

- Outer page (logged-in): `<SharedSidebar>` + `<SharedHeader>` + `<MogzuCorporateScrollSurface className="p-6 lg:p-8">`
- Content container: `max-w-[1200px] mx-auto` or `max-w-6xl mx-auto px-6`
- Card grid: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Detail page two-col: `grid grid-cols-1 lg:grid-cols-3 gap-6` (main = `lg:col-span-2`)
- Section vertical rhythm: `mb-6` between cards, `mb-8` between H1 and first card

---

## 11. Anti-patterns (from audit)

- ❌ Emoji icons. Use lucide-react.
- ❌ New card-shell variants. Pick solid (§4a) or glass (§4b). Do not blend.
- ❌ Heart-icon state stored only in local `useState` (current debt across 20 files). Always wire to `db.wishlists` going forward.
- ❌ Rating values hardcoded. Aggregate from `db.reviews.listByListing(listingId)`.
- ❌ Background patches that don't match `MogzuAmbientBackdrop` (per memory log 2026-04-22 fix).
- ❌ Buttons inside clickable cards without `e.stopPropagation()`.
- ❌ Z-index above 50 except for fixed overlays (modal scrim = `z-50`).

---

## 12. Accessibility floor (every new component)

- 44×44pt touch target — icon-only buttons use `w-8 h-8` with `aria-label`.
- Focus ring visible — Tailwind `focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]`.
- Color contrast — body text ≥ 4.5:1 (slate-600 on white passes; slate-400 fails — only for meta on rest state).
- Heart toggle keyboard reachable; pressing Enter/Space toggles wishlist row.
- Reviews panel: each star uses `aria-label="{n} out of 5 stars"`; rating count uses `<a>` or `<button>`.

---

## 13. Batch 2 contract

Components built in Batch 2 MUST:
1. Use solid card §4a tokens by default; switch to glass §4b only when mounting in DSpace/SpaceX context.
2. Use canonical heart button §5 (replace local state with `db.wishlists`).
3. Render rating badge §6 from `reviews` aggregate (compute `avg(rating)` + `count`).
4. Add `<ListingReviewsPanel>` per §7 — mounted on event-detail, space-detail, gifting-product-detail.
5. Respect §11 anti-patterns and §12 a11y floor.
6. No new color hex outside §2 palette.

If a Batch 2 surface needs a token not in this doc — STOP, add to this doc first, then build.

---

*Living doc. Update whenever a new pattern lands in a shipped sprint.*

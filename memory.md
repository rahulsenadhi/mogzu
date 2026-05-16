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

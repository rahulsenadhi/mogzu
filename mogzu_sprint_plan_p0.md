# Mogzu Sprint Plan — Phase 1 P0 Stories

**Team**: 1–2 engineers  
**Sprint length**: 2 weeks  
**Approach**: Foundation First — data layer before features  
**Generated**: 2026-05-16  

---

## Capacity Model

| Scenario | Engineers | Working days/sprint | Productive hrs/day | Total hrs | Story points |
|---|---|---|---|---|---|
| Solo | 1 | 10 | 6 | 60 | ~12 pts |
| Pair | 2 | 10 | 6 | 120 | ~20 pts |

**Velocity rule**: 70% of theoretical capacity. Buffer 20% for unplanned bugs, reviews, and infra surprises.  
**Effective commitment**: 12–14 pts (solo) / 18–20 pts (pair) per sprint.

**Story point scale**:
- S = 2 pts (1–2 days)
- M = 5 pts (3–4 days)
- L = 8 pts (5–7 days)

---

## Dependency Chain (Must Respect This Order)

```
Supabase schema + RLS
    ↓
Supabase Auth (replaces demoRole.ts)
    ↓
Auth & Onboarding (1.1–1.4)
    ↓
Admin Portal shell (9.1, 9.3) + Budget rules (2.1)
    ↓
Vendor listings CRUD (3.6, 4.4, 5.3) + Vendor calendar (8.2)
    ↓
Discovery / search (3.1, 5.1)
    ↓
Booking flows (3.2, 3.3) + Manager approvals (2.2)
    ↓
Payment + Wallet (6.1, 6.2) + Commission (9.2)
    ↓
Gifting programme (4.1) + Gifting catalogue (4.4) [already done above]
    ↓
Gifting order flow (4.2, 4.5) + SpaceX booking (5.2) + Orders dashboard (8.1)
```

---

## Sprint 0 — Foundation (Weeks 1–2)

**Goal**: Data layer, auth, and external services wired. Zero features ship. Nothing else can start without this.

| Task | Effort | Notes |
|---|---|---|
| Design Supabase schema (all P0 tables) | L | corporate_accounts, users, vendors, listings, bookings, budgets, wallet, categories, modules |
| Write RLS policies for all roles | L | L1/L2/L3/Vendor/Admin scoping via corporate_id |
| Migrate Supabase Auth (replace demoRole.ts) | M | useAuth() hook abstraction — never call supabase.auth.* directly in components |
| Create db service abstraction layer | M | Never call supabase.from() directly in components |
| Create storageService abstraction | S | Supabase Storage wrapper |
| Create realtimeService abstraction | S | Supabase Realtime wrapper |
| Set up Razorpay SDK | S | Stub only — payment routes wired, no real transactions yet |
| Set up N8N Cloud + webhook structure | S | Create /n8n-workflows/ folder, connect Supabase webhooks |
| Set up Resend (email service) | S | Transactional email templates: welcome, invite, booking confirmation |
| Set up Supabase Storage buckets | S | vendor-images, gift-images, space-images, logo-uploads |

**Total**: ~36 pts | **Pair recommended** — schema + RLS is high-stakes, needs two sets of eyes.

**Sprint 0 Definition of Done**:
- [ ] All tables created with migration files in `/supabase/migrations/`
- [ ] RLS policies tested: L1 cannot read L2 rows, Vendor A cannot read Vendor B data
- [ ] `useAuth()`, `db`, `storageService`, `realtimeService` hooks exist and used in at least one component
- [ ] Razorpay test key configured, checkout page loads without errors
- [ ] N8N Cloud connected to Supabase — test webhook fires on row insert
- [ ] Resend sends a test email successfully

---

## Sprint 1 — Auth & Onboarding (Weeks 3–4)

**Goal**: Any corporate employee can sign up, admin can invite team, vendor can register, admin can approve.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 1.1 — Corporate employee self-registration | M (5) | Supabase Auth, corporate domain table | Low — UI exists, wire backend |
| 1.2 — Corporate admin invites team members | M (5) | Story 1.1, Resend email | Low |
| 1.3 — Vendor registration & module selection | L (8) | vendorOnboardingApi.ts → Supabase | Medium — multi-step form, module selection logic |
| 1.4 — Mogzu Admin approves/rejects vendor | M (5) | Story 1.3, Resend email | Low — UI exists in adminVendorQueue |

**Total**: 23 pts | Tight for solo (push 1.4 to Sprint 2). Comfortable for pair.

**Sprint 1 Definition of Done**:
- [ ] New corporate user can sign up with work email, lands on dashboard
- [ ] Admin invite email arrives, invited user sets password and accesses platform
- [ ] Vendor completes registration, sees "verification pending" screen
- [ ] Mogzu Admin sees vendor in queue, can approve or reject with feedback email sent

---

## Sprint 2 — Admin Portal + Budget Foundation (Weeks 5–6)

**Goal**: Admin can manage clients and module access; L3 can set budgets.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 1.4 — Admin approves vendor (if pushed from S1) | M (5) | Sprint 1 | Low |
| 9.1 — Marketplace settings (module toggles) | S (2) | platformMarketplaceSettings.ts → Supabase | Low — small feature |
| 9.3 — Admin manages corporate clients | M (5) | Supabase corporate_accounts table | Medium — client detail + plan management |
| 2.1 — L3 Admin sets department budget | L (8) | Supabase budget table, real-time subscription | High — budget enforcement is core, must be solid |

**Total**: 20 pts (with 1.4) / 15 pts (without) | Comfortable either way.

**Sprint 2 Definition of Done**:
- [ ] Admin can toggle Events/Gifting/SpaceX per client; change reflects in corporate dashboard within 60s
- [ ] Admin can create, suspend, and upgrade/downgrade a corporate client
- [ ] L3 Admin can create budget rule (amount + period + scope); rule persists in Supabase
- [ ] Dashboard shows real-time remaining budget; bookings that exceed budget are blocked

---

## Sprint 3 — Vendor Listings & Calendar (Weeks 7–8)

**Goal**: Vendors can create listings across all 3 modules and manage availability.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 3.6 — Vendor creates event listings | L (8) | Supabase listings table, Supabase Storage (images), admin approval workflow | High — image upload + admin approval queue new flow |
| 4.4 — Vendor manages gifting catalogue | L (8) | adminGiftingStore.ts → Supabase, Supabase Storage | Medium — variant/inventory logic |
| 5.3 — Vendor manages space listings & availability | L (8) | VendorCalendarPage → Supabase calendar table | High — calendar drag-to-block is complex UI |
| 8.2 — Vendor manages calendar availability | L (8) | Supabase calendar table | Dependency of 5.3 — build together |

**Note**: 3.6, 5.3, and 8.2 share the calendar/availability system. Build once, apply to all three modules.

**Total**: 32 pts — split across pair. Solo: push space listings (5.3 + 8.2) to Sprint 4.

**Sprint 3 Definition of Done**:
- [ ] Vendor can create an event listing with images, pricing, capacity; listing enters admin approval queue
- [ ] Vendor can create gifting products with variants and delivery SLA
- [ ] Vendor can set availability calendar with blocks and recurring patterns
- [ ] Admin can approve/reject listings; approved listings visible in corporate catalogue

---

## Sprint 4 — Discovery + Booking Flows (Weeks 9–10)

**Goal**: Corporate users can find and book events and spaces; manager approval flow works.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 3.1 — Employee discovers events | M (5) | Events data in Supabase, search/filter | Low — UI exists, wire to Supabase |
| 5.1 — Employee searches for workspace | M (5) | Supabase spaces table, vendor availability | Low — same as 3.1 |
| 2.2 — L2 Manager approves booking requests | M (5) | Story 2.1, notification service (Resend) | Medium — approval queue + real-time notification |
| 3.2 — Employee books an event | L (8) | Vendor calendar, Story 2.2, payment stub | High — multi-step flow, state management |
| 3.3 — Vendor confirms/rejects booking | M (5) | Vendor calendar, Resend, 24h SLA auto-cancel | Medium — N8N workflow for auto-cancel |

**Total**: 28 pts | Solo: defer 3.3 to Sprint 5. Pair: all fits.

**Sprint 4 Definition of Done**:
- [ ] Employee can search events by category, date, location, budget
- [ ] Full booking flow works end-to-end: select → group size → add-ons → submit
- [ ] Booking enters "Pending Manager Approval" if budget rule requires it
- [ ] Manager sees approval queue, can approve/reject with notification sent
- [ ] Vendor receives booking request, can confirm or reject; 24h N8N auto-cancel fires correctly

---

## Sprint 5 — Payment & Wallet (Weeks 11–12)

**Goal**: Real money flows. Corporate wallet top-up, Razorpay checkout, commission rates set.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 6.1 — Payment processing at checkout | L (8) | Razorpay SDK (stubbed in Sprint 0) | High — Razorpay webhook handler, 3DS, error states |
| 6.2 — Corporate wallet top-up | M (5) | Payment gateway, Supabase wallet table | Medium — Razorpay webhook for top-up confirmation |
| 9.2 — Admin sets commission rates | M (5) | Vendor payout system (Story 6.4 is P1, but rates config is P0) | Low — admin form, stored per vendor/module |

**Total**: 18 pts | Comfortable for either solo or pair.

**Sprint 5 Definition of Done**:
- [ ] Corporate wallet top-up works via Razorpay; balance updates after webhook confirmation
- [ ] Checkout supports: Corporate Wallet (instant if in budget) / Card / UPI
- [ ] Payment receipt emailed via Resend on success
- [ ] Failed payment shows error, allows retry without losing booking state
- [ ] Admin can set global and per-vendor commission rates; stored against booking at time of creation

---

## Sprint 6 — Gifting Programme & Orders (Weeks 13–14)

**Goal**: L3 can configure gifting rules; employees can send gifts; admin can approve products.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 4.1 — L3 Admin configures gifting programme | L (8) | Supabase gifting_rules table, occasions config | Medium — occasion triggers + preferred vendor logic |
| 4.5 — Admin approves gifting products | M (5) | adminGiftingStore.ts → Supabase (done in Sprint 3) | Low — approval queue UI exists |
| 4.2 — Employee sends a gift | M (5) | Story 4.1, payment gateway, Supabase vendor gifting catalogue | Medium — recipient search from corporate directory |
| 8.1 — Vendor views and manages orders | M (5) | VendorOrdersPage.tsx → Supabase, all booking flows complete | Low — unified order view, CSV export |

**Total**: 23 pts | Tight for solo — push 8.1 to Sprint 7 if needed.

**Sprint 6 Definition of Done**:
- [ ] L3 Admin can create gifting rule (occasion → budget → auto-approve or require approval)
- [ ] Admin can approve/reject gifting products; approved products appear in gifting shop
- [ ] Employee can browse gifting shop, select recipient, add message, checkout
- [ ] Vendor sees all incoming orders across modules in unified orders dashboard

---

## Sprint 7 — SpaceX Booking + Wrap-Up (Weeks 15–16)

**Goal**: SpaceX booking flow complete. All P0 stories done. Platform ready for internal QA.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 5.2 — Employee books a space | L (8) | Vendor calendar (Sprint 3), payment (Sprint 5) | Medium — hourly/daily pricing + QR code in confirmation |
| 8.1 — Vendor orders dashboard (if deferred) | M (5) | All booking flows | Low |
| P0 regression sweep + bug fix buffer | — | All sprints | Reserve 30% capacity |

**Total**: ~13 pts of stories + buffer | Low story load intentional — Sprint 7 is stabilisation.

**Sprint 7 Definition of Done**:
- [ ] Employee can search, select, and book a coworking space or meeting room
- [ ] Booking confirmation includes address, access instructions, QR code
- [ ] Vendor receives booking; slot is blocked on calendar
- [ ] All P0 flows tested end-to-end on staging with real Razorpay test transactions
- [ ] Zero P0 stories in "partial" state — each story either fully done or explicitly deferred to P1

---

## Full Timeline Summary

| Sprint | Weeks | Focus | Key Deliverable |
|---|---|---|---|
| **0** | 1–2 | Foundation | Supabase schema, RLS, Auth, Razorpay stub, N8N, Resend |
| **1** | 3–4 | Auth & Onboarding | Any user can sign up; vendor registered; admin can approve |
| **2** | 5–6 | Admin + Budget | Module toggles, client management, budget rules live |
| **3** | 7–8 | Vendor Listings | All 3 modules listable; calendar availability works |
| **4** | 9–10 | Discovery + Booking | Search, book event, manager approval queue |
| **5** | 11–12 | Payment | Razorpay live, wallet top-up, commission rates |
| **6** | 13–14 | Gifting | Gifting programme, employee sends gift, admin approves products |
| **7** | 15–16 | SpaceX + Stabilise | Space booking, full P0 regression, staging QA |

**Total**: 16 weeks (~4 months) for all P0 stories with 1–2 engineers.

---

## Sprint Risks (Global)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Razorpay webhook integration slower than expected | High | High | Start Razorpay sandbox in Sprint 0, not Sprint 5 |
| RLS policies have gaps — data leaks between tenants | Medium | Critical | Dedicated RLS test suite in Sprint 0 before any feature work |
| Vendor calendar UI (drag-to-block) complex | High | Medium | Spike in Sprint 0 week 2; use a calendar library (react-big-calendar or similar) |
| N8N 24h auto-cancel workflow timing bugs | Medium | Medium | Test with accelerated timers in staging (24 minutes not 24 hours) |
| Solo engineer velocity drops to 8–10 pts/sprint | High | Medium | Re-sequence: push SpaceX (5.1–5.3) after Gifting, not parallel |
| Image upload to Supabase Storage slow to QA | Low | Low | Mock images in dev, test real uploads only in Sprint 3 |

---

## Definition of Done (All Sprints)

- [ ] Feature works on staging with real Supabase data (not localStorage)
- [ ] RLS verified: correct role can access, wrong role cannot
- [ ] Relevant Resend email fires and arrives
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Mobile responsive (PWA target — test on Chrome mobile)
- [ ] Relevant N8N workflow tested with staging webhook

---

## What Is NOT In This Plan

These P0-adjacent items are deliberately excluded — they become blockers only if ignored:

- **HRMS connectors** (Darwinbox/Keka) — CSV import (Story 10.0) is P1; not needed for P0
- **Vendor payouts** (Story 6.4) — P1; commission rates (9.2) are P0 but actual payout disbursement is not
- **Refunds** (Story 6.3) — P1; Razorpay refund API wired in P1 sprint after payment is stable
- **Real-time notifications** (Story 7.2) — P1; email via Resend covers P0 needs
- **Partner portal** (Epic 14) — P2 entirely

---

*Mogzu Sprint Plan v1.0 — May 2026*  
*Source: mogzu_prd_v2.md P0 stories*

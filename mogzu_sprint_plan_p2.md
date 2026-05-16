# Mogzu Sprint Plan — Phase 1 P2 Stories

**Team**: 1–2 engineers  
**Sprint length**: 2 weeks  
**Starts**: After Sprint 15 (P1 complete, week 33)  
**Generated**: 2026-05-16  

> **Important distinction**: "P2" here means lower-priority stories within Phase 1 of the product.
> The 10 "Phase 2 Add-On Features" (Quick Share, Live Status Tracker, etc.) are a separate roadmap
> that begins after all P2 stories are complete. See `mogzu_prd_v2.md` Phase 2 section.

---

## P2 Story Inventory

| Story | Title | Size | Pts |
|---|---|---|---|
| 3.5 | Corporate Event Templates | M | 5 |
| 8.3 | Vendor Performance Analytics | M | 5 |
| 8.4 | Employee Submits Review | S | 2 |
| 8.5 | Vendor Invites Existing Clients to Review | M | 5 |
| 8.6 | Vendor Responds to Reviews | S | 2 |
| 8.7 | Vendor Creates a Promotion | M | 5 |
| 9.6 | Admin Reviews Promotions Before Go-Live | S | 2 |
| 11.1 | VAPI — Employee Uses Voice Assistant | L | 8 |
| 11.2 | Admin Configures Hey Genie Module | M | 5 |
| 13.1 | Employee Saves Items to Wishlist | S | 2 |
| 13.2 | Employee Compares Listings Side by Side | M | 5 |
| 13.3 | Account Manager Creates Shortlist for Client | M | 5 |
| 14.1 | Partner Registration & Onboarding | M | 5 |
| 14.2 | Partner Refers Corporate Clients | M | 5 |
| 14.3 | Partner Resells Mogzu Services | L | 8 |
| 14.4 | Partner Lists Own Products & Services | L | 8 |
| 14.5 | Partner Unified Dashboard | M | 5 |
| 14.6 | Admin Manages Partner Agreements | M | 5 |

**Total**: 18 stories · ~87 pts  
**Pair velocity (18–20 pts/sprint)**: 4–5 sprints  
**Solo velocity (12–14 pts/sprint)**: 6–7 sprints  
**Plan target**: 6 sprints (12 weeks)

---

## Capacity Model

| Scenario | Pts/sprint | Notes |
|---|---|---|
| Solo | 12–14 | Some sprints need deferrals as noted |
| Pair | 18–20 | All sprints fit comfortably |

70% velocity rule. 20% buffer per sprint.

---

## P2 Dependency Chain

```
P1 complete (Sprint 15, week 32)
    ↓
Discovery features (no deps)   → Wishlist (13.1) + Compare (13.2)
Review system (bookings live)  → Employee Review (8.4) + Vendor Invite (8.5) + Vendor Reply (8.6)
Promotions (vendor listings)   → Vendor Promotion (8.7) → Admin Review Promotion (9.6)
Analytics (bookings data)      → Vendor Analytics (8.3)
Event listings live            → Corporate Event Templates (3.5)
    ↓
Shortlists (AM portal live)    → AM Shortlist (13.3)
    ↓
VAPI spike first               → Hey Genie Config (11.2) → VAPI Voice (11.1)
    ↓
Partner foundation             → Registration (14.1) + Admin Agreements (14.6)
    ↓
Partner referral               → Refer Clients (14.2)
    ↓
Partner advanced               → Resell (14.3) + List Products (14.4)
    ↓
Partner dashboard              → Unified Dashboard (14.5) [depends on 14.2, 14.3, 14.4]
```

---

## Sprint 16 — Discovery + Reviews (Weeks 33–34)

**Goal**: Users can save and compare listings. Reviews go live for the first time.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 13.1 — Employee saves to wishlist | S (2) | WishlistPage.tsx → Supabase | Low — UI exists, wire to Supabase |
| 13.2 — Employee compares listings | M (5) | ComparePage.tsx logic wiring | Low — UI exists, wire comparison logic |
| 8.4 — Employee submits review | S (2) | Booking status = COMPLETED, Supabase reviews table | Low — gated trigger, simple form |
| 8.5 — Vendor invites existing clients to review | M (5) | Email service (Resend), Admin approval queue | Medium — one-time invite flow, admin approval gate |
| 8.6 — Vendor responds to reviews | S (2) | Stories 8.4, 8.5, reviews table | Low — single reply per review |

**Total**: 16 pts | Comfortable for both.

**Sprint 16 Definition of Done**:
- [ ] Heart/bookmark icon saves listing to wishlist; wishlist persists in Supabase across sessions
- [ ] Up to 4 listings comparable side by side; differences highlighted
- [ ] Review prompt fires after booking COMPLETED; one review per booking, by booking employee only
- [ ] Vendor can send up to 10 invite emails to past clients; reviews enter Admin approval queue before going live
- [ ] Approved pre-platform reviews badged "Pre-platform review" on listing
- [ ] Vendor can submit one public reply per review; reply visible on listing detail page

---

## Sprint 17 — Promotions + Analytics + Event Templates (Weeks 35–36)

**Goal**: Vendors can run promotions. Vendors see real performance data. L3 Admins can create event templates.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 8.7 — Vendor creates a promotion | M (5) | vendorPromotionAdsStorage.ts → Supabase, payment for paid placement | Medium — promotion types, validity logic, paid placement payment |
| 9.6 — Admin reviews promotions before go-live | S (2) | Story 8.7 | Low — approval queue, same pattern as product/vendor approval |
| 8.3 — Vendor performance analytics | M (5) | Booking data aggregation in Supabase | Medium — aggregation queries, Recharts wired to real data |
| 3.5 — Corporate event templates | M (5) | Events module, admin portal | Low — template CRUD + "Corporate Picks" section in catalogue |

**Total**: 17 pts | Comfortable for both.

**Sprint 17 Definition of Done**:
- [ ] Vendor can create promotion: type (% off / fixed / free add-on), validity dates, max redemptions
- [ ] Paid listing boost requires payment before admin can approve
- [ ] Admin promotion queue: approve, reject with comment, or request edits
- [ ] Vendor analytics shows: total bookings, revenue, AOV, cancellation rate, listing-level conversion
- [ ] Trend chart pulls from real Supabase booking data (not seed data)
- [ ] L3 Admin can create event template with pre-set params and approved vendors
- [ ] Templates appear in "Corporate Picks" section for L1/L2; template usage tracked

---

## Sprint 18 — Shortlists + VAPI / Hey Genie (Weeks 37–38)

**Goal**: Account Managers can curate shortlists. Hey Genie voice assistant is live for pilot accounts.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 13.3 — AM creates shortlist for client | M (5) | mogzuShortlistHelpers.ts → Supabase, AM portal (9.4 P1) | Low — curated list creation, client-specific share link |
| 11.2 — Admin configures Hey Genie module | M (5) | VAPI API, platformMarketplaceSettings.ts, admin portal | Medium — VAPI SDK spike needed before this story starts |
| 11.1 — Employee uses VAPI voice assistant | L (8) | Story 11.2, VAPI integration, Events + SpaceX search API | High — VAPI SDK, natural language intent parsing, mic permissions, fallback to text |

**Total**: 18 pts | Perfect for pair. Solo: defer 11.1 to Sprint 19.

**VAPI Spike** (do in Sprint 17 week 2 — before Sprint 18 starts):
- Evaluate VAPI SDK: does it support Hindi + English? WebRTC or telephony?
- Test wake word vs button activation on mobile PWA
- Confirm microphone permission flow works on Chrome Android/iOS Safari
- Estimate realistic effort — if spike reveals L=8 is too low, re-estimate before Sprint 18 commits

**Sprint 18 Definition of Done**:
- [ ] AM can create shortlist from search results or listing detail; set expiry date and share client-specific link
- [ ] Client sees shortlist in their dashboard; AM can see view and booking attribution
- [ ] Admin can enable/disable Hey Genie per client account; configure accessible modules
- [ ] "Hey Genie" button (or wake word) activates VAPI session
- [ ] Assistant handles intent: "Book a team lunch for 10 people next Friday under ₹500 per person"
- [ ] Assistant presents 2–3 options verbally + on screen; user confirms and booking flow pre-fills
- [ ] Fallback to text if mic permission denied; voice session transcript saved

---

## Sprint 19 — Partner Foundation (Weeks 39–40)

**Goal**: Partners can register. Admin controls partner terms. Partners can refer clients.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 14.1 — Partner registration & onboarding | M (5) | Supabase partners table, Admin approval workflow, email service | Low — same pattern as vendor registration |
| 14.6 — Admin manages partner agreements | M (5) | Story 14.1, commission/wallet system | Low — agreement form, rate config |
| 14.2 — Partner refers corporate clients | M (5) | Story 14.1, Supabase referral attribution, wallet system | Medium — 90-day attribution window, commission trigger on first booking |

**Total**: 15 pts | Comfortable for both.

**Sprint 19 Definition of Done**:
- [ ] Partner completes registration with partnership type selection; Mogzu Admin approves
- [ ] Partner receives welcome email with unique referral code on approval
- [ ] Admin can configure per-partner rates: referral %, reseller wholesale rate, product revenue share %, agreement expiry
- [ ] Admin can activate, pause, or terminate partner accounts
- [ ] Partner referral link tracks signups; commission credited to partner wallet after referred client's first booking
- [ ] Partner dashboard shows referrals sent / signed up / activated / commission earned

---

## Sprint 20 — Partner Advanced: Resell + Own Listings (Weeks 41–42)

**Goal**: Partners can resell Mogzu services and list their own products on the platform.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 14.3 — Partner resells Mogzu services | L (8) | Story 14.1, white-label invoice generation, Supabase partner-client linking | High — white-label invoices, partner-managed client onboarding, resale margin calc |
| 14.4 — Partner lists own products & services | L (8) | Story 14.1, vendor listing CRUD (3.6 P0), admin approval, payout system (6.4 P1) | Medium — same flow as vendor listing + partner revenue share config |

**Total**: 16 pts | Comfortable for both.

**Sprint 20 Definition of Done**:
- [ ] Partner can onboard clients directly; clients linked to partner account and visible in partner dashboard
- [ ] Partner sets resale markup within Mogzu-allowed range; client invoices show partner branding
- [ ] Partner earns margin = resale price minus wholesale rate; paid monthly
- [ ] Partner can create listings under their brand name using same form as vendor listings
- [ ] Partner listing revenue share rate is pulled from partner agreement (not standard vendor commission)
- [ ] Partner listing enters Admin approval queue; approved listings appear in catalogue with partner brand tag
- [ ] Partner listing payouts follow same 48h post-completion cycle as vendor payouts

---

## Sprint 21 — Partner Dashboard + Stabilisation (Weeks 43–44)

**Goal**: Partner has unified view of all activity. Full P2 regression. Platform complete.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 14.5 — Partner unified dashboard | M (5) | Stories 14.2, 14.3, 14.4 | Low — aggregation of existing data, Recharts |
| P2 regression + bug fix buffer | — | All P2 sprints | Reserve 50% capacity |

**Total**: 5 pts of stories + buffer | Intentionally light — stabilisation sprint.

**Sprint 21 Definition of Done**:
- [ ] Partner dashboard shows: active referrals, reseller clients, live listings, wallet balance, pending payout
- [ ] Earnings breakdown by type: referral / reseller margin / product revenue share
- [ ] Month-on-month earnings trend chart from real Supabase data
- [ ] Monthly earnings statement PDF downloadable
- [ ] All P2 flows tested end-to-end on staging
- [ ] Zero P2 stories in "partial" state
- [ ] Full regression: no P0 or P1 regressions introduced during P2 sprints

---

## Full P2 Timeline Summary

| Sprint | Weeks | Focus | Key Deliverable |
|---|---|---|---|
| **16** | 33–34 | Discovery + Reviews | Wishlist, compare, review submission, vendor reply |
| **17** | 35–36 | Promotions + Analytics + Templates | Vendor promotions live, analytics wired, event templates |
| **18** | 37–38 | Shortlists + VAPI | AM shortlists, Hey Genie voice assistant pilot |
| **19** | 39–40 | Partner Foundation | Partner registration, referral tracking, admin agreements |
| **20** | 41–42 | Partner Advanced | Resell + own product listings |
| **21** | 43–44 | Partner Dashboard + Stabilisation | Unified partner view, full P2 regression |

**P2 duration**: 12 weeks (Weeks 33–44)

---

## Complete Mogzu Roadmap

```
Weeks  1–16   Phase 1 P0  — 17 stories, 8 sprints, full platform foundation
Weeks 17–32   Phase 1 P1  — 21 stories, 8 sprints, operational completeness
Weeks 33–44   Phase 1 P2  — 18 stories, 6 sprints, discovery, promotions, partner portal
─────────────────────── PHASE 1 COMPLETE (Week 44 / ~11 months) ───────────────────────
Week 45+      Phase 2 Add-On Features planning begins (10 features from mogzu_prd_v2.md):
              Quick Share · Live Status Tracker · Proof of Conditions · Branding Preview
              Category Management · Sub-Users RBAC · Mogzu Direct Listings · CMS
              AI Agents · DB Migration Plan
```

**Total Phase 1**: 56 stories · 22 sprints · ~44 weeks (~11 months) · 1–2 engineers

---

## P2 Sprint Risks (Global)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| VAPI SDK not production-ready for PWA on iOS Safari | High | High | Spike in Sprint 17 week 2; if PWA mic fails on iOS, fall back to button-only activation and skip wake word |
| VAPI Hindi + English (Hinglish) intent recognition accuracy low | Medium | High | Test with 20 real user phrases in spike; set minimum accuracy threshold (>80%) before committing to Sprint 18 |
| Partner white-label invoice requires PDF with custom branding | Medium | Medium | Use react-pdf with template system; partner logo stored in Supabase Storage from Sprint 19 onward |
| Partner resell margin calc edge cases (tax, refunds) | Medium | Medium | Define all edge cases before Sprint 20 starts; document in a decision log |
| Vendor analytics aggregation queries slow at scale | Low | Medium | Use Supabase materialized views or pre-aggregate nightly via N8N; don't run live aggregation on every page load |

---

## Phase 2 Add-On Features — Sequencing Preview

After Phase 1 P2 is complete (week 44+), Phase 2 Add-On features should be built in this order based on business value and dependency:

| Order | Feature | Why First |
|---|---|---|
| 1 | Sub-Users & RBAC (Feature 6) | Foundation for Field Agents needed by Feature 2 |
| 2 | Live Status Tracker + Proof of Execution (Feature 2 + 3) | Builds trust, reduces disputes, high demand from corporates |
| 3 | Quick Share Catalogue (Feature 1) | Unlocks off-platform sales immediately |
| 4 | Category Management (Feature 5) | Admin self-service, reduces ops load |
| 5 | Mogzu Direct Listings (Feature 7) | New revenue stream |
| 6 | Gifting Branding Preview (Feature 4) | Premium gifting feature |
| 7 | CMS (Feature 8) | Marketing self-service |
| 8 | AI Agents (Feature 9) | Requires all above to be stable |
| 9 | DB Migration Plan (Feature 10) | Engineering architecture, not user-facing |

---

*Mogzu Sprint Plan P2 v1.0 — May 2026*  
*Continues from: mogzu_sprint_plan_p1.md*  
*Source: mogzu_prd_v2.md P2 stories + Phase 2 Add-On Features*

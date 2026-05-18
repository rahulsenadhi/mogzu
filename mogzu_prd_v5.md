# Mogzu PRD v5.0 — Phase 5: International + Network Effects

> **Phase**: Phase 5 — Expand  
> **Window**: 16 weeks (8 sprints, Sprints 34–41)  
> **Headline goal**: Stop being an India-only platform; start being a regional one. Convert single-tenant trust into multi-region supply via vendor self-serve, ratings flywheel, and a white-label partner platform. Cap with SOC2 Type II + ISO 27001.  
> **Continues from**: `mogzu_prd_v4.md` (Mobile + Revenue Platform)  
> **Trigger to start**: P4 hits ≥₹15L MRR + first international vendor onboarded manually + ≥3 enterprise customers requesting non-INR settlement.

> **Note**: At ~20 months in, the roadmap shifts from product-led to
> business-led. Engineering's job in P5 is to keep the platform open
> enough that markets, M&A, and capital decisions don't get blocked
> by tech. Many P5 items are *enablers*, not features.

---

## Why this phase

P4 monetises and integrates. P5 expands. Three motions:

- **Geographic** — first non-India market (Singapore + UAE as
  beachheads; India-tested SOP plus light-touch local compliance)
- **Network-effect supply** — vendor self-serve onboarding instead of
  sales-led, with a ratings flywheel that compounds catalogue quality
- **Platform leverage** — white-label so other agencies host their
  catalogue on Mogzu rails (revenue from infra licensing, not
  bookings)

Plus the compliance ceiling: SOC2 Type II + ISO 27001 unlock the next
RFP tier (regulated industries, financial services, defense
contractors).

| Goal                                | Metric                              | Target by end of P5 |
|-------------------------------------|-------------------------------------|---------------------|
| International revenue share         | Non-INR bookings / total            | ≥ 15%               |
| Vendor self-serve onboarding        | Vendors onboarded without sales     | ≥ 70%               |
| Platform leverage                   | White-label partners live           | ≥ 3                 |
| Compliance ceiling                  | SOC2 Type II + ISO 27001            | Both audits passed  |
| AI autonomy                         | Bookings handled end-to-end by AI   | ≥ 5% of new volume  |

---

## Features

### Feature P5.1 — First International Market (Singapore + UAE)

> **Priority**: High · **Module**: Operations · **Requires**: P4.3 multi-currency settlement live, regional data residency story, local payment rails (PayNow, Mada)  
> **Codebase audit**: `intl-region`, `data-residency`, `paynow`, `mada`

#### Capabilities
- Region-aware corporate accounts (`region` enum: in, sg, ae)
- Data residency policy per region: SG corporates pinned to a SG-
  hosted DB replica; AE corporates likewise. India corporates stay
  on the current project
- Local payment rails: PayNow for SG, Mada for AE; Stripe for cards
- Regional admin team support (sub-users with region scope)
- Region-specific compliance docs auto-injected into contracts
  (PDPA for SG, UAE Federal Decree-Law for AE)

#### Out of scope
- Multi-region cross-corporate bookings (separate workstream)
- Full multi-language UX (P5.2 covers vendor onboarding strings;
  buyer-side full i18n deferred to P6)

---

### Feature P5.2 — Vendor Self-Serve Onboarding (Global)

> **Priority**: High · **Module**: Vendor portal · **Requires**: KYC service (Persona / Onfido), structured onboarding workflow, automated approval rules  
> **Codebase audit**: `vendor-self-serve`, `kyc`, `onboarding-funnel`

#### Capabilities
- Public `/vendor/sign-up` flow: company details, KYC docs, payout
  account, catalogue draft
- KYC via Persona (global) or Onfido (UK/EU preference); auto-approve
  on green signal, route yellow / red to admin queue
- Catalogue submission: vendor uploads N listings; admin batch-approve
  via existing AdminListingsPage (Story 9.3) with new "auto-approved"
  source filter
- Vendor SLA contract auto-generated + e-signed (DocuSign integration
  or hand-rolled signing pad)

---

### Feature P5.3 — Ratings + Reviews Public Flywheel

> **Priority**: High · **Module**: Catalogue · **Requires**: Phase 1 reviews table (Story 8.4-8.6 already shipped), public listing pages from P3.1, SEO  
> **Codebase audit**: `public-reviews`, `rating-aggregate`, `review-seo`

#### Capabilities
- Aggregate rating + review count shown on public catalogue tiles +
  detail pages
- Review pages indexed by Google (JSON-LD Product + Review schema
  from P3.2 extended)
- Vendor "verified by Mogzu" badge unlocks at 10 reviews + 4.0 avg
- Corporate-side filter: "show only 4+ star vendors"
- Reply-to-review UI for vendors (engagement metric)

---

### Feature P5.4 — White-Label / Partner Platform

> **Priority**: Medium · **Module**: Platform · **Requires**: P4.4 public API, theming engine, per-partner subdomain + branding  
> **Codebase audit**: `white-label`, `partner-platform`, `theming`

#### Capabilities
- Per-partner subdomain (`partner.mogzu.com`) with their logo + brand
  colors via a `partner_branding` table the React app reads at runtime
- Partner-scoped admin: sees only their corporates + vendors
- Per-partner pricing: agency keeps X% margin, Mogzu takes
  infra-licensing fee (different from booking commission)
- Partner-issued API keys (P4.4 surface) scoped to partner's data

---

### Feature P5.5 — Autonomous AI Booking Agent

> **Priority**: Medium · **Module**: AI · **Requires**: Phase 2 Feature 9 AI agents framework, action policies, human-in-loop fallback for edge cases  
> **Codebase audit**: `autonomous-agent`, `agent-action-policy`

#### Capabilities
- AI agent calls existing RPCs end-to-end: search → shortlist → quote
  → contract → book → confirm → settle
- Policy gates: spend per booking < ₹50k auto-runs; ≥₹50k routes to
  human approver via existing approval workflow
- Conversation transcript stored on `ai_agent_conversations` row;
  bookings tag `created_by_agent_id` so audit trail is preserved
- Kill switch per corporate at `/account/ai/autonomy`

---

### Feature P5.6 — SOC2 Type II + ISO 27001 Compliance

> **Priority**: High · **Module**: Compliance · **Requires**: P3.6 audit log already shipped; access reviews; vendor security questionnaire automation  
> **Codebase audit**: `soc2`, `iso27001`, `access-review`

#### Capabilities
- Quarterly access review: cron generates list of all sub-users +
  permissions; admin signs off in `/admin/compliance/access-review`
- Vendor security questionnaire intake at `/security` with auto-fill
  from a single-source `compliance-facts.md` doc
- Continuous control monitoring via Drata or Vanta SaaS (sales picks)
- Type II audit window: minimum 6 months evidence; targeted close
  end-of-P5
- ISO 27001 ships as a deliverable doc + external auditor sign-off,
  not new app surface

---

## Out of scope for Phase 5

Deferred indefinitely / Phase 6+:

- Full multi-language buyer UI (locale infrastructure exists from
  P3.7; actual translations are a content workstream)
- Cross-region booking (corporate in IN books vendor in SG with
  one transaction) — needs FX + tax overhaul
- Acquisition integration (M&A absorbed catalogues) — pure ops
- IPO readiness (financial controls + reporting separately tracked)
- Mobile vendor app (web-mobile sufficient for vendor side)

---

## Phase 5 risks

| Risk                                                | Mitigation                                                                |
|-----------------------------------------------------|---------------------------------------------------------------------------|
| First international market underperforms            | Beachhead segment defined pre-launch; 90-day kill criteria explicit       |
| SOC2 audit drags past P5 window                     | Engage auditor by Sprint 35 (week 71); evidence collection from Sprint 28 |
| Vendor self-serve quality drops vs sales-led onboarding | KYC tier + 30-day quality review per vendor; auto-suspend on low ratings |
| White-label partner cannibalises direct sales       | Partner agreements explicit on non-compete + commission floor             |
| Autonomous AI agent makes a costly mistake (false approve, wrong vendor) | Hard spend cap per booking; per-corporate opt-in; on-call rollback playbook |
| Region data residency forces a DB split mid-phase   | Bake region into corporate_accounts schema in Sprint 34; logical-replication route validated early |

---

## Open questions (decisions before P5 starts)

1. SOC2 firm: Drata vs Vanta vs Secureframe — sales-owned
2. International beachhead: Singapore first or UAE first — strategy call
3. White-label commercial model: revenue share vs flat infra fee vs
   per-corporate seat — finance + sales
4. Autonomous-agent spend cap: ₹50k starting point — exec approval

---

*Mogzu PRD v5.0 — 2026-05-18*  
*Continues from: mogzu_prd_v4.md*  
*Sprint plan: mogzu_sprint_plan_p5.md*  
*This is the last numbered PRD on the current roadmap. Post-P5 work shifts to ad-hoc roadmaps driven by market + capital decisions.*

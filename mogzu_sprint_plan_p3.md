# Mogzu Sprint Plan — Phase 3

> **Window**: Weeks 51–62 (12 weeks, 6 sprints, Sprints 22–27)  
> **Continues from**: `mogzu_sprint_plan_p2.md` (Sprints 16–21 + 10 add-on features complete at commit `788105a`)  
> **Source PRD**: `mogzu_prd_v3.md`

---

## P3 Story Inventory

| Story | Title | Track | Size | Pts |
|---|---|---|---|---|
| P3.1 | Public Catalogue Browse | A | L | 8 |
| P3.2 | SEO Landing Pages from CMS | A | M | 5 |
| P3.3 | Public Lead Capture | A | M | 5 |
| P3.4 | Blog + Announcements consumer | A | S | 3 |
| P3.5 | SSO / SAML for Corporates | B | L | 8 |
| P3.6 | Audit Log + Export | B | M | 5 |
| P3.7 | Multi-Currency + i18n Foundation | B | L | 8 |
| P3.8 | Contract Billing + Invoice Generation | B | L | 8 |
| C.1 | Feature 4 — booking-row branding persistence | Carry | S | 3 |
| C.2 | Cron promote_scheduled_cms_blocks | Carry | XS | 1 |
| C.3 | Phase 2 test coverage (unit + integration) | Carry | M | 5 (cross-cut) |

**Total**: 11 items · ~59 pts  
**Pair velocity (18–20 pts/sprint)**: 3 sprints  
**Solo velocity (12–14 pts/sprint)**: 4–5 sprints  
**Plan target**: 6 sprints — accounts for SOC2/SSO certification overhead and SEO crawl-warm-up.

---

## Capacity model

| Scenario | Pts/sprint | Notes |
|---|---|---|
| Solo | 12–14 | SSO + Contract Billing each consume a full sprint |
| Pair | 18–20 | One pair builds public site, other builds enterprise track |

70% velocity rule. 25% buffer per sprint (P3 has more external dependencies: SSO IdP coordination, FX rate provider, payment-gateway invoice flows).

---

## P3 Dependency Chain

```
P2 complete (Sprint 21, week 50) ──── commit 788105a
   │
   ├── Track A — Public Site
   │     │
   │     ├── P3.1 Public Catalogue (Sprint 22-23)
   │     ├── P3.2 SEO Landing      (Sprint 23-24)  ← needs P3.1 routing
   │     ├── P3.3 Public Lead      (Sprint 24)
   │     └── P3.4 Blog + RSS       (Sprint 25)
   │
   ├── Track B — Enterprise
   │     │
   │     ├── P3.5 SSO/SAML         (Sprint 22-23)
   │     ├── P3.6 Audit Log Export (Sprint 24)
   │     ├── P3.7 Multi-currency   (Sprint 25-26)
   │     └── P3.8 Contract Billing (Sprint 26-27)  ← needs P3.7 currency
   │
   └── Carry
         ├── C.1 booking-branding  (Sprint 22)
         ├── C.2 CMS cron          (Sprint 23)
         └── C.3 P2 tests          (cross-cut every sprint)
```

---

## Sprint 22 — Public Catalogue + SSO Foundation (Weeks 51–52)

**Focus**: Stand up `/explore/:module` routes + start SSO config schema.

**Stories**:
- P3.1 Public Catalogue Browse (part 1: anon RLS + browse routes) · 5 pts
- P3.5 SSO/SAML (part 1: `sso_config` table + admin UI shell) · 4 pts
- C.1 Feature 4 booking-row branding persistence · 3 pts

**Deliverables**: anon visitors can land on `/explore/events`, browse,
hit a paywall on book. Admin can paste IdP metadata at `/admin/sso`
(test connection in Sprint 23).

**Exit criteria**:
- `bash scripts/audit-abstraction-layers.sh` still passes
- Public RLS smoke test: anon client cannot see `corporate_accounts`,
  `bookings`, `user_profiles`
- Branding selection from BookingFlow lands as a real
  `gifting_branding_selections` row

---

## Sprint 23 — Public Catalogue Polish + SSO Live (Weeks 53–54)

**Stories**:
- P3.1 Public Catalogue Browse (part 2: filters + pagination + meta) · 3 pts
- P3.2 SEO Landing — slug routes from `cms_blocks_live` · 5 pts
- P3.5 SSO/SAML (part 2: domain routing + JIT provisioning) · 4 pts
- C.2 Cron for `promote_scheduled_cms_blocks` (N8N workflow file) · 1 pt

**Deliverables**: First marketing landing page (`/p/corporate-gifting`)
goes live. First test corporate signs in via Okta sandbox.

---

## Sprint 24 — Lead Capture + Audit Log (Weeks 55–56)

**Stories**:
- P3.3 Public Lead Capture + Turnstile · 5 pts
- P3.6 Audit Log + Export (`audit_events_unified` view + export UI) · 5 pts
- SEO carry-over: sitemap.xml + JSON-LD on listing pages · 2 pts

**Deliverables**: "Request quote" forms route to AI Sales Agent
pipeline. Compliance team can export 30-day audit slice to CSV.

---

## Sprint 25 — Blog + i18n Foundation (Weeks 57–58)

**Stories**:
- P3.4 Blog + Announcements public consumer + RSS · 3 pts
- P3.7 Multi-currency (part 1: schema + FX cron + `formatPrice`) · 5 pts
- P3.6 Audit retention cron + 7-year archive job · 2 pts

**Deliverables**: `/blog` live. Prices render in user's preferred
currency on the corporate dashboard.

---

## Sprint 26 — i18n Polish + Contracts (Weeks 59–60)

**Stories**:
- P3.7 Multi-currency (part 2: i18n string extraction + locale UI) · 3 pts
- P3.8 Contract Billing (part 1: `contracts` schema + admin create flow) · 5 pts
- Test backfill: branding + CMS + AI agents (cross-cut C.3) · 3 pts

**Deliverables**: All hard-coded strings live in `i18n/en.json`. Admin
can create a contract and attach it to a booking; pricing override
respected at checkout.

---

## Sprint 27 — Invoice Runs + Stabilisation (Weeks 61–62)

**Stories**:
- P3.8 Contract Billing (part 2: invoice run + PDF generation + email) · 5 pts
- Stabilisation: bug fixes, performance budget pass, accessibility audit · 4 pts
- Test backfill round 2: SSO + contracts + audit export (C.3) · 2 pts

**Deliverables**: First monthly invoice run executes end-to-end for a
pilot enterprise corporate. P3 ships.

---

## Full P3 Timeline Summary

```
Weeks 51–62   Phase 3 — 6 sprints, 59 pts, Growth + Enterprise
              Track A: Public marketplace + SEO (4 features)
              Track B: SSO + audit + multi-currency + contracts (4 features)
              Carry:   booking-branding, CMS cron, P2 tests
─────────── PHASE 3 COMPLETE (Week 62 / ~15.5 months total project) ────────
```

**Cumulative through Phase 3**: 67 stories · 28 sprints · ~56 weeks ·
1–2 engineers (plus design + sales contributions during P3 to land
enterprise deals while engineering builds).

---

## P3 Sprint Risks (Global)

| Risk                                                       | Likelihood | Impact | Mitigation                                                                 |
|------------------------------------------------------------|------------|--------|----------------------------------------------------------------------------|
| Supabase SAML not production-grade for enterprise IdPs     | Medium     | High   | Spike WorkOS wrapper in Sprint 22; fall back to WorkOS if Supabase blocks  |
| SEO crawl warm-up slow — no inbound traffic for 60–90 days | High       | Medium | Pre-publish 20 landing pages in Sprint 23; submit sitemap immediately      |
| FX rate provider rate-limits the free tier                 | Medium     | Low    | Cache FX in `currencies.fx_rate` + N8N daily refresh; fail-open to INR     |
| Contract PDF rendering inconsistent across email clients   | Medium     | Medium | Reuse partner-statement PDF template from Sprint 21; QA in 4 mail clients  |
| SOC2 audit firm engagement timing                          | Low        | High   | Sales owns engagement; engineering only needs to ship audit-log feature    |
| Multi-currency math drift between admin + corporate views  | Medium     | High   | Single `formatPrice(amount, currency)` helper; integration test on display |

---

*Mogzu Sprint Plan P3 v1.0 — 2026-05-17*  
*Continues from: mogzu_sprint_plan_p2.md*  
*Source PRD: mogzu_prd_v3.md*

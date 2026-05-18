# Mogzu Sprint Plan — Phase 5

> **Window**: Weeks 75–90 (16 weeks, 8 sprints, Sprints 34–41)  
> **Continues from**: `mogzu_sprint_plan_p4.md`  
> **Source PRD**: `mogzu_prd_v5.md`

---

## P5 Story Inventory

| Story | Title | Track | Size | Pts |
|---|---|---|---|---|
| P5.1 | First International Market (SG + AE) | Intl | XL | 13 |
| P5.2 | Vendor Self-Serve Onboarding | Supply | L | 8 |
| P5.3 | Ratings + Reviews Public Flywheel | Demand | M | 5 |
| P5.4 | White-Label / Partner Platform | Platform | L | 8 |
| P5.5 | Autonomous AI Booking Agent | AI | L | 8 |
| P5.6 | SOC2 Type II + ISO 27001 | Compliance | L | 8 (eng) + audit budget |
| C.1 | Drata / Vanta integration | Compliance | S | 3 |
| C.2 | Per-region pgbouncer pool tuning | Intl | S | 3 |

**Total**: 8 items · ~56 pts · 8 sprints

---

## Sprint 34 — Region foundation + SOC2 evidence start

- P5.1 part 1: region enum on `corporate_accounts`, regional data
  residency policy doc, SG region project provisioning · 5 pts
- P5.6 part 1: Drata / Vanta onboarding, control mapping · 4 pts
- P5.3 part 1: aggregate rating queries + public catalogue tile · 3 pts

---

## Sprint 35 — KYC + Self-Serve Onboarding

- P5.2 part 1: vendor sign-up funnel + Persona KYC integration · 5 pts
- P5.6 part 2: access-review cron + admin sign-off UI · 4 pts

---

## Sprint 36 — International payment rails

- P5.1 part 2: PayNow (SG) + Mada (AE) integrations · 6 pts
- P5.3 part 2: review SEO + JSON-LD · 3 pts

---

## Sprint 37 — White-label foundation

- P5.4 part 1: per-partner subdomain + theming engine · 5 pts
- P5.2 part 2: catalogue submission flow + automated approval rules · 4 pts

---

## Sprint 38 — Autonomous AI agent

- P5.5 part 1: action-policy framework + spend-cap policy + audit
  trail on `bookings.created_by_agent_id` · 5 pts
- P5.6 part 3: vendor security questionnaire surface · 3 pts

---

## Sprint 39 — White-label + agent rollout

- P5.4 part 2: partner-scoped admin + per-partner API keys + commercial
  model wiring · 5 pts
- P5.5 part 2: live deployment per opt-in corporate · 3 pts

---

## Sprint 40 — International go-live + ISO 27001 prep

- P5.1 part 3: SG + AE soft launch (5 corporate pilots) · 5 pts
- P5.6 part 4: ISO 27001 documentation package · 4 pts

---

## Sprint 41 — Audit close + stabilisation

- P5.6 audit close: external auditor evidence delivery · 4 pts
- Stabilisation: P5 polish, edge cases, performance budget · 5 pts

**Exit**: P5 ships. Singapore + UAE customers transacting in
SGD / AED. Three white-label partners live. SOC2 Type II report
delivered. Autonomous agent serving ≥5% of new bookings.

---

## Roadmap horizon after Phase 5

No formal Phase 6 PRD planned. Roadmap from week 91+ becomes
business-decision-driven:
- M&A integration of acquired vendor networks
- Vertical expansion (HR/L&D adjacencies)
- Capital markets readiness (Series B/C or strategic exit)
- IPO controls / Sarbanes-Oxley if listing path chosen

Engineering's role from week 91+ is to maintain reliability and
keep the platform open to whichever direction the business goes.

---

*Mogzu Sprint Plan P5 v1.0 — 2026-05-18*  
*Continues from: mogzu_sprint_plan_p4.md*  
*Source PRD: mogzu_prd_v5.md*  
*Last numbered sprint plan on the current roadmap.*

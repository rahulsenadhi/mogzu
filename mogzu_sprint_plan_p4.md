# Mogzu Sprint Plan — Phase 4

> **Window**: Weeks 63–74 (12 weeks, 6 sprints, Sprints 28–33)  
> **Continues from**: `mogzu_sprint_plan_p3.md`  
> **Source PRD**: `mogzu_prd_v4.md`

---

## P4 Story Inventory

| Story | Title | Track | Size | Pts |
|---|---|---|---|---|
| P4.1 | Native Mobile Shell (iOS + Android) | Mobile | L | 8 |
| P4.2 | SaaS Subscription Billing | Revenue | L | 8 |
| P4.3 | Multi-Currency Vendor Settlement | Revenue | L | 8 |
| P4.4 | Public API + Webhook Surface | Platform | L | 8 |
| P4.5 | Data Warehouse Export | Analytics | M | 5 |
| C.1 | iOS Push notification entitlement + APNs cert | Mobile | XS | 1 |
| C.2 | Stripe + Razorpay reconciliation cron | Revenue | S | 3 |

**Total**: 7 items · ~41 pts · 6 sprints

---

## Sprint 28 — Mobile Spike + Billing Foundations

**Stories**:
- P4.1 spike: React Native vs Capacitor decision · 3 pts
- P4.2 part 1: `plans` table, Stripe customer creation, feature flags · 5 pts
- C.1 APNs + FCM cert provisioning · 1 pt

**Exit**: mobile direction chosen + free/growth/enterprise plan rows seeded.

---

## Sprint 29 — Mobile Shell + Billing UI

- P4.1 part 1: app shell wrapping corporate dashboard route · 5 pts
- P4.2 part 2: `/account/billing` self-serve + dunning emails · 4 pts

**Exit**: internal beta APK on TestFlight + Play Console. Self-serve growth-tier upgrade live in staging.

---

## Sprint 30 — Push + Multi-Currency

- P4.1 part 2: push notifications + offline approval queue · 5 pts
- P4.3 part 1: `vendor_payout_methods` + Wise sandbox + FX lock · 5 pts

**Exit**: real push delivery in beta. First Wise sandbox payout to a USD vendor.

---

## Sprint 31 — Public API + App Store Submission

- P4.4 part 1: `/api/v1/bookings` + API key admin UI + rate limiter · 5 pts
- P4.1 part 3: app-store submission, biometric unlock · 3 pts

**Exit**: API key issuable. Apps in app-store review.

---

## Sprint 32 — Webhooks + Settlement Live

- P4.4 part 2: webhook signing + retries + admin UI · 4 pts
- P4.3 part 2: production Wise rails, reconciliation dashboard · 5 pts
- C.2 reconciliation cron · 2 pts

**Exit**: First international vendor payout from a real booking. First customer-consumed webhook.

---

## Sprint 33 — Warehouse + Stabilisation

- P4.5 BigQuery sink via Airbyte · 5 pts
- Stabilisation: app-store feedback loop, billing edge cases, doc polish · 4 pts

**Exit**: P4 ships. App store apps live. Pilot enterprise customer syncing data to BigQuery nightly.

---

## P4 risks

Mirrors PRD v4 §risks. Add Sprint-level mitigation owners during sprint kickoff.

---

*Mogzu Sprint Plan P4 v1.0 — 2026-05-18*  
*Continues from: mogzu_sprint_plan_p3.md*  
*Source PRD: mogzu_prd_v4.md*

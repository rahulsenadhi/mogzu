# Mogzu PRD v4.0 — Phase 4: Mobile + Revenue Platform

> **Phase**: Phase 4 — Scale  
> **Window**: 12 weeks (6 sprints, Sprints 28–33)  
> **Headline goal**: Turn Mogzu from "platform corporates use" into "platform corporates depend on." Native-grade mobile, real revenue automation, third-party integrations.  
> **Continues from**: `mogzu_prd_v3.md` (Growth + Enterprise Readiness)  
> **Trigger to start**: Phase 3 hits ≥4k weekly public sessions AND ≥1 closed enterprise deal with SSO.

---

## Why this phase

Phase 3 lands inbound + enterprise-readiness. Phase 4 monetises both:
revenue automation closes the cash-collection loop (recurring SaaS +
auto-settled vendor payouts in multi-currency), mobile retention
captures the day-to-day "approve booking from cab" use-case, and a
public API converts F500 SSO deals into long-tail platform
integrations (Workday calendars, SAP expense feeds, Microsoft Teams
notifications).

| Goal                                | Metric                                | Target by end of P4 |
|-------------------------------------|---------------------------------------|---------------------|
| Mobile-led approvals                | Approvals via mobile / total          | ≥ 60%               |
| Recurring revenue (SaaS subscription) | MRR (₹)                             | ≥ ₹15L              |
| Per-vendor settlement automation    | Bookings auto-settled (no manual)     | ≥ 95%               |
| Integration ecosystem               | Enterprise customers using ≥1 webhook | ≥ 10                |

---

## Features

### Feature P4.1 — Native-grade Mobile Shell (iOS + Android)

> **Priority**: High · **Module**: Mobile · **Approach**: React Native shell wrapping the existing React surface, or Capacitor over the PWA. Decision in Sprint 28 spike.  
> **Codebase audit**: `mobile`, `push-notification`, `offline-sync`, `pwa-install`

#### Capabilities
- Native app shells (Play Store + App Store) wrapping the corporate
  dashboard, approvals, and bookings surfaces
- Push notifications (FCM + APNs) for: approval requests, booking
  status changes, dispute messages
- Offline approval queue: approver opens app on flight, approves N
  bookings, queue syncs on reconnect via the existing approval RPC
- Biometric unlock (Face ID / fingerprint) for the approval action

#### Out of scope
- Native UI for vendor / admin / partner roles (web continues; mobile
  is corporate-employee + approver only in P4)

---

### Feature P4.2 — SaaS Subscription Billing

> **Priority**: High · **Module**: Finance · **Requires**: Stripe (primary) + Razorpay (INR fallback), webhook handler, `subscriptions` table, plan tier gating  
> **Codebase audit**: `subscription`, `plan-tier`, `stripe-webhook`, `billing-cycle`

#### Overview
Today corporates pay only commission on completed bookings (variable).
P4 introduces a recurring per-seat SaaS subscription for the platform
(approvals, analytics, AI agents, SSO, branding preview). Commission
remains for vendor settlements.

#### Capabilities
- `plans` table: free / growth / enterprise with feature flags
  (sso_enabled, ai_agents_count, custom_contracts, audit_export)
- Stripe customer creation on corporate signup; per-seat billing
- Self-serve plan upgrades at `/account/billing`; downgrades require
  account manager approval
- Failed-payment dunning: 4 retries over 14 days, then auto-downgrade
  to free tier (feature flags flip)
- Annual invoice + GST tax handling for Indian customers via Razorpay

---

### Feature P4.3 — Multi-Currency Vendor Settlement

> **Priority**: High · **Module**: Finance · **Requires**: P3.7 multi-currency display (display-only) extended to real settlement, Wise API (preferred) or Razorpay X, `vendor_payout_methods` table  
> **Codebase audit**: `multi-currency-payout`, `wise-payout`, `fx-conversion`

#### Overview
Phase 3 displayed prices in vendor / corporate local currencies. Phase
4 actually settles money in those currencies: corporate pays in INR,
international vendor receives in USD/SGD/AED at the locked-in FX rate
from the booking moment.

#### Capabilities
- `vendor_payout_methods` per-vendor: bank account + currency +
  rail (Wise, Razorpay X for INR, ACH for USD, FAST for SGD)
- FX lock at booking confirmation; stored on the booking row as
  `settlement_currency` + `settlement_fx_rate`
- Two-leg settlement: collect INR from corporate, payout in target
  currency on completion. Margin = commission + FX spread + Wise fee
- Reconciliation dashboard at `/admin/finance/fx` showing margin
  variance against locked rates

---

### Feature P4.4 — Public API + Webhook Surface

> **Priority**: High · **Module**: Platform · **Requires**: OpenAPI spec, API key management, rate limiting, webhook signing  
> **Codebase audit**: `public-api`, `webhook`, `api-key`, `rate-limit`

#### Overview
Enterprises with SSO + audit log + contracts want their procurement
systems (Workday, SAP Ariba) to read/write Mogzu state directly.

#### Capabilities
- REST API at `api.mogzu.com/v1` covering: list bookings, create
  booking, approve booking, list invoices, list vendors. Authenticated
  via per-corporate API keys (admin-issued at `/admin/api-keys`)
- OpenAPI 3.1 spec auto-published at `/api/docs`
- Outbound webhooks on the existing events: `booking.created`,
  `booking.approved`, `booking.completed`, `invoice.paid`,
  `dispute.opened`. HMAC-signed payload, idempotency key, 3 retries
- Per-key rate limit (default 100 req/min, configurable)

---

### Feature P4.5 — Data Warehouse Export

> **Priority**: Medium · **Module**: Analytics · **Requires**: nightly Airbyte / Fivetran sync to BigQuery, customer-owned bucket support for self-hosted lake  
> **Codebase audit**: `warehouse-export`, `bigquery-sink`, `data-export`

#### Overview
Admin analytics pages serve operations; enterprise customers want raw
data in their own warehouse for custom BI.

#### Capabilities
- Nightly incremental sync via Airbyte (Supabase Postgres CDC →
  BigQuery / Snowflake / S3 parquet)
- Per-corporate sink: customer provides destination credentials,
  Mogzu writes their slice only
- Schema documentation auto-generated from migrations + foreign keys
- Data residency: India-hosted corporates can choose Indian BigQuery
  region

---

## Out of scope for Phase 4

Deferred to Phase 5 to keep P4 focused:

- International market launches (P4 is mobile/finance for the existing
  India corporate base)
- Vendor self-serve onboarding for international vendors (P5)
- White-label / agency-as-platform (P5)
- Fully autonomous AI booking agent (P5)
- SOC2 Type II audit (P5; Phase 4 ships SOC2 readiness controls only)

---

## Phase 4 risks

| Risk                                              | Mitigation                                                       |
|---------------------------------------------------|------------------------------------------------------------------|
| iOS / Android app-store review delays             | Submit by Sprint 30 to allow 2 sprints of review-loop buffer     |
| Stripe + Razorpay split processor reconciliation  | Daily reconciliation cron; manual escalation queue for mismatches|
| Wise FX rate slippage between lock + actual payout | Locked rate stored on booking; absorb spread in margin model     |
| API rate-limit DDOS from misbehaving customer key  | Auto-suspend keys exceeding 10x normal traffic; alert admin      |
| Mobile push notification deliverability gaps       | Email + in-app fallback for any critical event                   |

---

*Mogzu PRD v4.0 — 2026-05-18*  
*Continues from: mogzu_prd_v3.md*  
*Sprint plan: mogzu_sprint_plan_p4.md*

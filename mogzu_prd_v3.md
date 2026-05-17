# Mogzu PRD v3.0 — Phase 3: Growth & Enterprise Readiness

> **Phase**: Phase 3 — Post-Add-Ons  
> **Window**: 12 weeks (6 sprints, Sprints 22-27)  
> **Headline goal**: Turn the platform Mogzu *has* into the platform Mogzu *grows*. Convert organic demand via a public marketplace and unlock high-ACV enterprise deals via compliance + SSO.  
> **Continues from**: `mogzu_prd_v2.md` (Phase 1 + Phase 2 add-on features)  
> **Source code state**: commit `788105a` (post-Phase 2 abstraction cleanup, all 10 add-on features shipped)

---

## North-star for Phase 3

After Phase 2, Mogzu has a complete operational platform but no public
front door and no enterprise-grade trust signals. Phase 3 closes both
gaps so the next dollar comes from inbound (lower CAC) and the next
deal is six-figure (higher ACV).

| Goal                              | Metric                            | Target by end of P3 |
|-----------------------------------|-----------------------------------|---------------------|
| Inbound pipeline                  | Public sessions / week            | ≥ 5,000             |
| Organic conversion                | Public visitor → lead             | ≥ 1.5%              |
| Enterprise deal velocity          | F500 RFPs answered with SSO+SOC2  | ≥ 4 / quarter       |
| Phase 2 tech-debt close           | Audit script + tests in CI        | 100%                |

---

## Track A — Public Marketplace + SEO (4 features)

### Feature P3.1 — Public Catalogue Browse

> **Priority**: High · **Module**: Public site · **Requires**: existing `listings` table + RLS, Supabase anon access for active listings, route `/explore/*`  
> **Codebase audit**: `public-catalogue`, `explore`, `seo-listings`

#### Overview
Anonymous visitors browse the same listings authenticated corporates
see, with prices and vendor info shown subject to listing visibility
rules.

#### Capabilities
- `/explore/:module` — events / gifting / spacex landing per module
- Filters: category, location, price band, rating
- Same listing card component as corporate dashboard (single source)
- Pagination (≤ 24 / page), SSR-friendly meta tags per page
- "Sign up to book" CTA — passes listing context into signup flow so
  the corporate lands directly on the listing post-onboarding

#### Business rules
- Only listings with `status='active' AND public_visible=TRUE` are
  exposed via the anon RLS read.
- Prices are hidden when the listing is `pricing_mode='request_for_price'`;
  card shows "Request quote" instead of a number.
- Mogzu Direct listings appear with the "Mogzu Direct" badge already
  surfaced in Phase 2.

---

### Feature P3.2 — SEO Landing Pages from CMS

> **Priority**: High · **Module**: Public site · **Requires**: `cms_blocks_live` view (Phase 2 Feature 8), dynamic OG image generation  
> **Codebase audit**: `seo-landing`, `cms-public`, `og-image`

#### Overview
Marketing creates landing pages without engineering. Each landing page
is a CMS block of kind `hero` + ordered child blocks (`feature_card`,
`promo_banner`, `blog_post`).

#### Capabilities
- Route `/p/:slug` reads `cms_blocks_live` for the matching `slug`
- Title, meta description, OG image pulled from block fields
- JSON-LD structured data (Organization, Product, BreadcrumbList) on
  every public route
- Sitemap.xml auto-generated nightly from `cms_blocks_live` +
  `listings` (where `public_visible=TRUE`)
- Robots.txt + canonical URLs

#### Why this matters
The CMS shipped in Phase 2 but nothing reads it. This feature is the
consumer half of that contract.

---

### Feature P3.3 — Public Lead Capture

> **Priority**: High · **Module**: Public site · **Requires**: existing `quick_share_submissions` schema (Phase 2 Feature 1) reused for lead intake, AI Sales Agent (Phase 2 Feature 9) for follow-up automation  
> **Codebase audit**: `public-lead`, `inbound`, `request-quote`

#### Overview
Convert anonymous interest into a sales-qualified lead without forcing
account creation up front.

#### Capabilities
- "Request a quote" form on every listing detail page + landing page
- Fields: company, contact name, email/phone, requirement summary,
  budget band, timeline
- Submission writes to `public_leads` table; row is auto-assigned to
  AI Sales Agent (Feature 9) which qualifies via WhatsApp / email
- Sales-Agent role sees the pipeline in `/sales/pipeline`
- Anti-spam: honeypot + Turnstile token verification server-side

---

### Feature P3.4 — Blog + Announcements (Public Consumer)

> **Priority**: Medium · **Module**: Public site · **Requires**: `cms_blocks` with `kind='blog_post'` (Phase 2 Feature 8)  
> **Codebase audit**: `blog`, `announcements-public`

#### Overview
SEO content surface for thought-leadership and product announcements.

#### Capabilities
- `/blog` index + `/blog/:slug` post pages reading `cms_blocks_live`
- Tag-based filter; RSS feed for syndication
- Author byline pulled from `published_by` user profile

---

## Track B — Enterprise Readiness (4 features)

### Feature P3.5 — SSO / SAML for Corporates

> **Priority**: High · **Module**: Auth · **Requires**: Supabase SAML provider (or WorkOS as a wrapper), per-corporate `sso_config` table, fallback password disabled per domain  
> **Codebase audit**: `sso`, `saml`, `idp-config`

#### Overview
Enterprise corporates demand IdP-led login (Okta, Azure AD, Google
Workspace). Without it, F500 RFPs stall at security review.

#### Capabilities
- Per-corporate `sso_config` row: provider, entity ID, ACS URL,
  certificate, email-domain claim
- Domain-based SSO routing: signing in with `@foo.com` redirects to
  the corporate's IdP if `sso_config` exists
- Just-in-time profile provisioning on first login
- Admin UI at `/admin/sso` to upload metadata and test connection
- Per-corporate flag to disable password fallback once SSO is enforced

---

### Feature P3.6 — Audit Log + Export

> **Priority**: High · **Module**: Compliance · **Requires**: existing `user_activity_events` (Phase 1) + `role_switch_events` (Phase 1) + `support_audit_log` (Phase 1), new uniform query view  
> **Codebase audit**: `audit-log`, `audit-export`, `compliance-trail`

#### Overview
SOC2 + GDPR require a tamper-evident log of every privileged action.
The data already exists in three tables; this feature unifies and
exposes it.

#### Capabilities
- `audit_events_unified` view: union of activity / role-switch /
  support audit / admin RPC calls, with a canonical
  `(actor, action, resource, at, ip, user_agent)` shape
- `/admin/compliance/audit` page with filters by actor, resource,
  date range
- CSV + JSON-Lines export of any filtered slice (signed download URL,
  20-minute expiry)
- 7-year retention policy enforced via a `pg_cron` cleanup job that
  archives rows older than 7 years to cold storage (S3-compatible
  bucket via `storageService`) rather than deleting

---

### Feature P3.7 — Multi-Currency + i18n Foundation

> **Priority**: Medium · **Module**: Pricing + UI · **Requires**: new `currencies` table, FX rate fetcher (cron via N8N), `t()` translation helper, locale prefs on user profile  
> **Codebase audit**: `multi-currency`, `i18n`, `locale`

#### Overview
Mogzu lists in INR. South-east-Asia and Middle East prospects need
local currency display + locale-aware formatting. Phase 3 lays the
foundation; full per-vendor multi-currency settlement is post-P3.

#### Capabilities
- `currencies` table: ISO code, symbol, decimal places, FX rate to
  INR, `fx_updated_at`
- Display layer: every price reads `formatPrice(amount, currency)`
  which pulls the user's preferred currency from `user_profiles.locale`
- Static i18n: pull-out of all hard-coded English strings into a
  `i18n/en.json` bundle (no other locale ships yet — this is the
  foundation only)
- Locale stored on `user_profiles.locale` (default `en-IN`)

---

### Feature P3.8 — Contract Billing + Invoice Generation

> **Priority**: High · **Module**: Finance · **Requires**: `contracts` table, line-item billing model, invoice PDF generator (reuse partner statement PDF infra from Sprint 21)  
> **Codebase audit**: `contracts`, `invoice-pdf`, `billing-cycle`

#### Overview
Enterprise corporates pay against contracts, not per-booking. This
feature introduces named contracts with line-item rate cards and
monthly/quarterly invoice runs.

#### Capabilities
- `/admin/contracts` — create contract: corporate, term, line items
  (rate per event type, per gift unit, per stay night), payment terms
  (Net 15/30/45)
- Contract attached to bookings overrides per-listing pricing
- `/admin/billing/runs` — kicks off an invoice run for the period;
  generates one PDF per corporate aggregating contracted bookings;
  emails invoice via existing `email.ts` service
- Outstanding invoices visible to corporates at `/account/invoices`

---

## Carry-overs from Phase 2

These were called out as deferred at the end of Phase 2 and fold into
Phase 3:

| Item                                                       | Sprint slot |
|------------------------------------------------------------|-------------|
| Feature 4 — persist branding selection on real booking row | Sprint 22   |
| Feature 8 — public CMS consumer (subsumed by P3.2)         | Sprint 22-23 |
| Cron for `promote_scheduled_cms_blocks()`                  | Sprint 23   |
| Test coverage for Phase 2 features (unit + integration)    | Sprint 22-27 (cross-cutting) |

---

## Phase 3 Audit Checklist

Run before building each P3 feature:

| Feature | Search Terms | Status |
|---|---|---|
| P3.1 Public Catalogue | `public-catalogue`, `explore`, `seo-listings` | `[ ]` |
| P3.2 SEO Landing | `seo-landing`, `cms-public`, `og-image` | `[ ]` |
| P3.3 Public Lead | `public-lead`, `inbound`, `request-quote` | `[ ]` |
| P3.4 Blog | `blog`, `announcements-public` | `[ ]` |
| P3.5 SSO | `sso`, `saml`, `idp-config` | `[ ]` |
| P3.6 Audit Log | `audit-log`, `audit-export`, `compliance-trail` | `[ ]` |
| P3.7 Multi-Currency | `multi-currency`, `i18n`, `locale` | `[ ]` |
| P3.8 Contract Billing | `contracts`, `invoice-pdf`, `billing-cycle` | `[ ]` |

---

## Out of scope for Phase 3

Deferred to Phase 4 to keep P3 focused:

- Native mobile apps (PWA continues; if RFP demands native, spin a
  separate work-stream)
- Multi-vendor settlement in non-INR (display layer only ships in P3.7)
- Full ML personalisation of catalogue ordering
- Real-time multi-tenant tenant routing (single-tenant DB continues)
- Self-serve vendor onboarding for international vendors

---

*Mogzu PRD v3.0 — 2026-05-17*  
*Continues from: mogzu_prd_v2.md*  
*Sprint plan: mogzu_sprint_plan_p3.md*

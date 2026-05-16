# Mogzu Platform — Add-On & Advanced Features (PRD Supplement)

> **Document Type:** Feature Add-On Specification (Supplement to Main PRD)
> **Status:** These features are NEW or PARTIALLY BUILT — verify against existing codebase before building
> **Note:** Some features may already exist in code (Figma → Cursor build). Audit first, then build gaps only.
> **Version:** v2.0 | May 2026

***

## How to Use This Document

Before building any feature below:
1. Run a codebase audit in Cursor/Claude Code to check if it already exists
2. If partially built — fix gaps and complete the flow
3. If missing entirely — build from scratch using the spec below
4. Mark status per feature: `Existing` / `Partial` / `Missing`

***

## Feature 1 — Quick Share Catalogue (Off-Platform Sales)

**Module:** Admin Dashboard
**Priority:** High
**Use Case:** Close quick orders from non-registered, walk-in, or one-time corporate clients without requiring them to sign up.

### User Flow
1. Admin opens "Quick Share" from the admin dashboard
2. Admin selects module (Gifting / Events / DSpace)
3. Admin multi-selects items from the catalogue
4. Admin optionally:
   - Sets a budget filter (not visible to client)
   - Disables/hides specific items from the shared view
   - Adds a custom note or greeting message
5. Admin generates a shareable link
6. Admin sends the link via **WhatsApp / Telegram / Email** (direct share buttons)
7. Client opens the link — **no login required**
8. Client browses curated items, selects preferences, and submits their final choice
9. Admin receives the selection as a new lead/order request on the dashboard
10. Admin reconfirms with the client
11. Admin generates and sends a **payment link** to collect advance or full payment
12. Order is created and tracked in the system

### Key Fields Required
- Selected items list with pricing
- Budget cap (admin-only field, hidden from client)
- Client name, company, phone, email (collected on link submission)
- Selected items by client
- Payment link status (pending / sent / paid)

### Business Logic
- Link should have an expiry (e.g., 48 hours, configurable by admin)
- Disabled items are hidden from client view, not shown as unavailable
- Submitted selections trigger a notification to admin (in-app + email/WhatsApp)
- Payment link integrates with existing payment gateway (UPI / card / wallet)

***

## Feature 2 — Live Status Tracker with Proof of Execution

**Module:** All Modules (Events, Gifting, DSpace)
**Priority:** High
**Use Case:** Provide tamper-proof, real-time execution tracking for every booking — eliminating disputes and communication gaps.

### Status Pipeline (Events)
| Stage | Trigger | Proof Required |
|---|---|---|
| Booking Confirmed | Payment complete | Auto |
| Vendor/Artist Assigned | Admin action | Auto |
| En Route | Vendor marks travel | Optional GPS |
| Arrived at Venue | OTP + Photo + GPS | Mandatory |
| Work Started | OTP + Photo + Timestamp | Mandatory |
| Work Completed | OTP + Photo + End Timestamp | Mandatory |
| Booking Closed | Corporate confirms | Rating prompt |

### Status Pipeline (Gifting)
| Stage | Trigger | Proof Required |
|---|---|---|
| Order Placed | Payment complete | Auto |
| In Production / Packaging | Vendor update | Optional photo |
| Dispatched | Tracking ID entered | Mandatory |
| Out for Delivery | Delivery agent update | Optional |
| Delivered | OTP + Photo by recipient | Mandatory |
| Confirmed | Corporate confirms receipt | Auto or manual |

### Status Pipeline (DSpace / Venues)
| Stage | Trigger | Proof Required |
|---|---|---|
| Booking Confirmed | Payment complete | Auto |
| Check-In | OTP + Photo + GPS | Mandatory |
| Space in Use | Timer starts | Auto |
| Check-Out | OTP + Photo + Timestamp | Mandatory |
| Booking Closed | Admin review | Auto |

### Key Fields
- OTP sent to: booking contact + vendor contact
- Photo upload: compressed, stored against booking ID
- GPS coordinates: stored at time of OTP submission
- Timestamps: ISO format, timezone-aware
- All records: immutable once submitted (no edit after OTP verification)

### Visibility
- Corporate: View full status pipeline (read-only)
- Vendor/Artist: Submit proof at their stage only
- Admin: Full view + override capability with reason log

***

## Feature 3 — Proof of Agreed Conditions & Payments

**Module:** All Modules — Booking Detail Page
**Priority:** High
**Use Case:** Maintain a digital paper trail of all commitments — scope, pricing, and payment — for trust and dispute resolution.

### What Gets Stored
- Agreed service scope (from booking confirmation)
- Quoted and final agreed price
- Negotiation history (if offer price flow was used)
- Payment milestones: advance %, balance %, final settlement
- Timestamps for each payment event
- Digital agreement acceptance record (who accepted, when, IP/device)
- PO/WO documents uploaded by corporate
- Admin notes or special conditions added at time of booking

### Access
- Corporate: View their own booking's proof record
- Vendor: View scope and payment milestones only
- Admin: Full access + export as PDF per booking

***

## Feature 4 — Gifting Auto Branding Placement Preview

**Module:** Gifting — Order Flow
**Priority:** Medium
**Use Case:** Allow corporates to preview and approve logo/branding placement on gifting products before production begins.

### Flow
1. Corporate selects gifting products and adds to order
2. During checkout, "Add Branding" option appears
3. Corporate uploads logo file (PNG/SVG, min 300dpi)
4. System generates preview images showing branding placement options:
   - Front print
   - Back print
   - Embossing
   - Label / tag
   - Sleeve / band
5. Corporate selects preferred placement option(s)
6. Corporate confirms and submits order with branding selection
7. Admin reviews branding specs and approves before sending to vendor/print partner
8. Vendor receives confirmed branding brief with approved mock-up

### Key Fields
- Logo file (stored securely, linked to corporate account)
- Product ID + selected placement type
- Admin approval status: Pending / Approved / Revision Requested
- Revision notes (if admin requests changes)

***

## Feature 5 — Category & Subcategory Management

**Module:** Admin Dashboard — Catalogue Management
**Priority:** Medium
**Use Case:** Admin controls catalogue structure in real time without code deployments.

### Capabilities
- **Add** new category or subcategory with name, icon, description, and module assignment
- **Edit** existing category/subcategory name, icon, or display order
- **Remove** category/subcategory (soft delete — deactivates, does not permanently delete to preserve booking history)
- **Enable / Disable** toggle per category or subcategory — immediately reflects on corporate-facing catalogue
- **Reorder** categories via drag-and-drop for display sequence control

### Rules
- Disabling a parent category hides all subcategories under it
- Active listings under a disabled category are hidden but not deleted
- Category removal requires confirmation if active listings exist under it

***

## Feature 6 — Sub-Users & Partner Management (RBAC)

**Module:** Admin Dashboard — Team Management
**Priority:** High
**Use Case:** Admin builds and manages an internal operations team with controlled, scoped access.

### Roles & Access

| Role | Module Access | Key Permissions |
|---|---|---|
| Customer Support | All modules (read) | View tickets, respond to chats, view booking status |
| Sales Agent | All modules + Quick Share | Create leads, use Quick Share Catalogue, view pipeline |
| Field Agent | Active bookings only | Submit OTP proof, upload photos, GPS check-in |
| Account Manager | Assigned accounts only | View/manage assigned corporate bookings and relationships |
| External Partner | Partner-referred bookings only | View bookings from their referral code only |

### Admin Capabilities
- Create sub-user accounts with name, role, email, phone
- Set module-level and action-level permissions per user
- Activate / deactivate sub-user accounts
- View activity log per sub-user (actions taken, timestamps)
- Assign account managers to specific corporate accounts
- Set approval workflows that route through specific sub-user roles

***

## Feature 7 — Mogzu Own Listings

**Module:** Admin Dashboard — Listings Management
**Priority:** Medium
**Use Case:** Mogzu lists and sells its own proprietary products and services directly on the platform alongside vendor listings.

### Supported Listing Types
- In-house karaoke packages
- Packaged event entertainment bundles
- Branded/in-house merchandise and gift kits
- Proprietary event production services

### Admin Capabilities
- Create listings under "Mogzu Direct" seller tag
- Set pricing (all 3 types: transparent / offer / request for price)
- Manage inventory and availability directly
- Publish without vendor approval workflow
- Edit, pause, or remove listings at any time

### Corporate-Facing Behaviour
- Mogzu Direct listings appear alongside vendor listings in catalogue
- Clearly tagged/badged as "Mogzu Direct" for trust signalling
- Participate in search, filter, comparison, and polling flows like any other listing

***

## Feature 8 — CMS — Website & Landing Page Management

**Module:** Admin Dashboard — Content Management
**Priority:** Medium
**Use Case:** Admin updates public-facing website content without developer involvement.

### Editable Sections
- Homepage hero banner (image, headline, CTA text and link)
- Feature highlight sections (text, icon, description)
- Landing page promotional banners
- "Featured" listings carousel (which listings appear on homepage)
- Blog posts and platform announcements
- Footer links and contact details

### Workflow
1. Admin navigates to CMS section in dashboard
2. Selects section to edit
3. Makes changes in a form-based editor (no raw HTML)
4. Previews changes on a staging view
5. Publishes immediately or schedules for a future date/time

***

## Feature 9 — AI Agents Management Page

**Module:** Admin Dashboard — AI & Automation
**Priority:** Medium (post-MVP phase)
**Use Case:** Configure and monitor Mogzu's AI agents across all communication channels.

### Agent 1 — AI Customer Support Agent
**Channels:** WhatsApp, Telegram, Web Chat
- Answers FAQs, booking status queries, platform navigation help
- Escalates to human support based on keywords or conversation score
- Admin configurable escalation threshold (e.g., after 2 failed responses)

### Agent 2 — AI Sales Agent
**Channels:** WhatsApp, Telegram, Web Chat, Email (outbound)
- Qualifies inbound enquiries by collecting: company name, requirement type, budget range, timeline
- Shares relevant catalogue options (links to Quick Share Catalogue)
- Sends automated follow-up sequences (day 1, day 3, day 7)
- Hands off qualified leads to human Sales Agent in-platform

### Admin Controls Page
- View conversation logs per channel, per agent, per date range
- Set and update escalation rules
- Update agent knowledge base: upload FAQs, policies, product descriptions
- Toggle each agent on/off per channel independently
- View agent performance metrics: response rate, resolution rate, escalation rate, leads qualified

***

## Feature 10 — Database Migration & Scalability Plan

**Module:** Technical Architecture (Non-UI)
**Priority:** Post-MVP
**Note:** No UI required. This is an engineering architecture decision to be documented and planned.

### Current State (MVP)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Storage: Supabase Storage
- Realtime: Supabase Realtime (websockets)

### Migration Readiness Practices (Implement from Day 1)
- Maintain all schema changes as portable `.sql` migration files (not Supabase-specific)
- Route all auth calls through a `useAuth()` service hook — never call `supabase.auth.*` directly in components
- Route all storage calls through a `storageService` abstraction layer
- Route all database queries through a `db` service layer — never raw `supabase.from()` in UI components
- Route all realtime subscriptions through a `realtimeService` abstraction

### Post-MVP Migration Target Options
| Option | Best For | Notes |
|---|---|---|
| AWS RDS (PostgreSQL) | Scale + compliance | Full control, higher ops overhead |
| Neon | Cost-effective serverless | Postgres-compatible, easy migration |
| PlanetScale | High-traffic branching | MySQL-based, requires schema changes |

### Estimated Migration Effort
- With abstraction layers in place: 1–2 weeks
- Without abstraction layers: 3–6 weeks (high risk)

***

## Audit Checklist for Developers

Use this before building each feature:

| Feature | Check Existing Code | Status |
|---|---|---|
| Quick Share Catalogue | Search for: `quickshare`, `share-link`, `catalogue-share` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| Live Status Tracker | Search for: `status-tracker`, `otp-verify`, `proof-upload` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| Proof of Conditions | Search for: `agreement`, `payment-milestone`, `booking-proof` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| Branding Preview | Search for: `branding-preview`, `logo-upload`, `mock-up` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| Category Management | Search for: `category-manage`, `enable-category`, `admin-catalogue` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| Sub-Users / RBAC | Search for: `sub-user`, `rbac`, `role-permission`, `team-manage` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| Mogzu Own Listings | Search for: `mogzu-direct`, `own-listing`, `internal-listing` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| CMS / Content Mgmt | Search for: `cms`, `content-manage`, `homepage-edit` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| AI Agents Page | Search for: `ai-agent`, `bot-manage`, `agent-config` | `[ ] Existing` `[ ] Partial` `[ ] Missing` |
| DB Migration Plan | N/A — architecture decision | `[ ] Documented` `[ ] Not Documented` |

***

*Supplement to Mogzu PRD v2.0 — May 2026*
*Use alongside: Mogzu_Platform_Feature_List_PRD.md*
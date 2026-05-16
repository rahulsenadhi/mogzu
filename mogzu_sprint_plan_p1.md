# Mogzu Sprint Plan — Phase 1 P1 Stories

**Team**: 1–2 engineers  
**Sprint length**: 2 weeks  
**Starts**: After Sprint 7 (P0 complete, week 17)  
**Generated**: 2026-05-16  

---

## P1 Story Inventory

| Story | Title | Size | Pts |
|---|---|---|---|
| 1.5 | Role Switcher | S | 2 |
| 2.3 | Employee Spend Dashboard | M | 5 |
| 2.4 | L3 Spend Report Export | M | 5 |
| 3.4 | Cancellation & Reschedule | M | 5 |
| 4.3 | L3 Bulk Gifting | L | 8 |
| 4.6 | Gift Delivery Tracking | M | 5 |
| 5.4 | Stay Booking | L | 8 |
| 5.5 | Travel & Space Policy | M | 5 |
| 6.3 | Automated Refunds | M | 5 |
| 6.4 | Vendor Payouts | L | 8 |
| 7.1 | In-Platform Messaging | L | 8 |
| 7.2 | Push & Email Notifications | M | 5 |
| 7.3 | N8N Workflow Automation | L | 8 |
| 9.4 | Account Manager Portfolio | M | 5 |
| 9.5 | Admin Disputes & Escalations | M | 5 |
| 10.0 | Employee Data CSV Import | M | 5 |
| 10.1 | Celebration Triggers | L | 8 |
| 10.2 | Manager Personalises Celebration | M | 5 |
| 12.1 | Any User Raises Support Ticket | M | 5 |
| 12.2 | Support Agent Resolves Tickets | M | 5 |
| 12.3 | Vendor Raises Support Ticket | M | 5 |

**Total**: 21 stories · ~120 pts  
**Pair velocity (18–20 pts/sprint)**: 6–7 sprints  
**Solo velocity (12–14 pts/sprint)**: 9–10 sprints  
**Plan target**: 8 sprints (16 weeks) with buffer — works for both team sizes with minor deferrals noted.

---

## Capacity Model (same as P0 plan)

| Scenario | Pts/sprint | Notes |
|---|---|---|
| Solo | 12–14 | Some sprints need deferrals |
| Pair | 18–20 | All sprints fit comfortably |

70% velocity rule applies. 20% buffer reserved per sprint for unplanned bugs.

---

## P1 Dependency Chain

```
P0 complete (Sprint 7, week 16)
    ↓
Payment live (Razorpay) → Refunds (6.3) + Payouts (6.4)
Auth live               → Role Switcher (1.5)
Booking flows live      → Cancellation (3.4)
Resend live (Sprint 0)  → Notifications (7.2)
Budget rules live       → Spend Dashboard (2.3) + Spend Report (2.4)
    ↓
N8N + all booking flows → N8N Automation (7.3)
Employee import (10.0)  → Celebration Triggers (10.1) → Manager Personalise (10.2)
Gifting live            → Bulk Gifting (4.3) + Gift Tracking (4.6)
SpaceX live             → Stay Booking (5.4) → Travel Policy (5.5)
    ↓
Messaging (7.1) + Refunds (6.3) → Disputes (9.5)
Support tickets (12.1)          → Support Agent (12.2) + Vendor Support (12.3)
Client Mgmt live (9.3)          → AM Portfolio (9.4)
```

---

## Sprint 8 — Payment Extensions (Weeks 17–18)

**Goal**: Vendors get paid. Refunds are automated. Role switching works.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 6.3 — Automated refund processing | M (5) | Razorpay refund API, booking cancellation flow | Medium — Razorpay refund webhooks, edge cases (expired card) |
| 6.4 — Vendor payouts | L (8) | Commission rates (9.2 P0), vendor bank account verification | High — payout API, 48h trigger via N8N, manual override |
| 1.5 — Role switcher | S (2) | demoRole.ts → real role table (Supabase) | Low — UI exists, wire to real roles |

**Total**: 15 pts | Comfortable for both solo and pair.

**Sprint 8 Definition of Done**:
- [ ] Cancellation within policy triggers Razorpay refund automatically; employee receives email with reference
- [ ] Refund failure creates a support ticket automatically
- [ ] Vendor payout fires 48 hours after booking completion date via N8N workflow
- [ ] Payout amount = booking total minus stored commission rate
- [ ] Vendor sees payout schedule in dashboard (upcoming / processed / held)
- [ ] Role switcher changes dashboard and nav scope; switch is logged in audit table

---

## Sprint 9 — Notifications + Cancellations + Employee Import (Weeks 19–20)

**Goal**: Users get notified. Bookings can be cancelled. Employee data can be loaded.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 7.2 — Push & email notifications | M (5) | Resend (live since Sprint 0), notification_preferences table | Medium — per-user preference config, critical notifications non-disableable |
| 3.4 — Cancellation & reschedule | M (5) | Booking flow (3.2 P0), refunds (6.3) | Medium — cancellation deadline logic per listing, fee calculation |
| 10.0 — Employee data CSV import | M (5) | Supabase employees table, RLS (corporate_id) | Low — file upload + validation UI, upsert logic |

**Total**: 15 pts | Comfortable for both.

**Sprint 9 Definition of Done**:
- [ ] All notification types fire: booking confirmed, cancelled, approval required, payment received, 24h reminder
- [ ] Each user can configure in-app vs email vs both per notification type
- [ ] Critical notifications (cancellation, payment failure) cannot be disabled
- [ ] Employee can cancel within vendor deadline at no cost; after deadline, fee shown before confirming
- [ ] Reschedule shows available slots; preserves booking ID
- [ ] L3 Admin can download CSV template, upload employee file, see preview + import summary
- [ ] Failed rows downloadable for correction; re-import works without duplicating successful rows

---

## Sprint 10 — N8N Automation + Spend Visibility (Weeks 21–22)

**Goal**: Platform runs itself on key events. Employees and admins see real spend data.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 7.3 — N8N workflow automation | L (8) | N8N Cloud, all booking flows, notifications (7.2) | High — multiple workflows, timing logic, error handling |
| 2.3 — Employee spend dashboard | M (5) | Budget rules (2.1 P0), Supabase Realtime | Low — UI exists, wire to real data |
| 2.4 — L3 spend report export | M (5) | Bookings in Supabase, Resend for scheduled emails | Medium — PDF generation, scheduled email via N8N |

**Total**: 18 pts | Pair fits well. Solo: defer 2.4 to Sprint 11.

**Workflows to build in 7.3**:
1. Vendor non-response >24h → auto-cancel + notify both parties + create support task
2. Budget reaches 80% → email L3 Admin
3. New vendor registration → create approval task in admin queue
4. Festival date approaching → bulk gifting reminder to L3 Admins
5. Booking completion → trigger vendor payout (48h delay)
6. Scheduled spend report → email to L3 distribution list (ties into 2.4)

**Sprint 10 Definition of Done**:
- [ ] All 6 N8N workflows tested with staging webhooks (use accelerated timers: 24 minutes not 24 hours)
- [ ] All workflows logged: trigger event, execution status, errors visible in N8N Cloud dashboard
- [ ] Workflow JSON files committed to `/n8n-workflows/` in repo
- [ ] Employee spend dashboard shows live used/remaining budget, per-module breakdown, last 5 transactions
- [ ] L3 Admin can build a report (date range + department + module), export CSV and PDF
- [ ] Report schedule (weekly/monthly) sends to distribution list automatically

---

## Sprint 11 — Support System (Weeks 23–24)

**Goal**: Any user can raise a ticket. Support agents can manage and resolve. Vendors have their own queue.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 12.1 — Any user raises support ticket | M (5) | Supabase support_tickets table, auto-capture context | Low — UI exists as stub, wire backend |
| 12.2 — Support agent resolves tickets | M (5) | Story 12.1, internal notes, CSAT trigger | Low — queue UI, Resend for CSAT |
| 12.3 — Vendor raises support ticket | M (5) | vendorSupportQueueStorage.ts → Supabase, payout data | Low — separate queue, payout dispute context |

**Total**: 15 pts | Comfortable for both.

**Sprint 11 Definition of Done**:
- [ ] Help button on every page auto-captures: URL, role, last action, device/browser
- [ ] Ticket submitted with category; SLA message shown at submission
- [ ] Support dashboard shows queue filtered by status, priority, SLA breach risk
- [ ] Internal notes visible to support only; CSAT email sent on close
- [ ] Vendor support portal separate from corporate queue
- [ ] Payout dispute tickets surface payout transaction details to support agent

---

## Sprint 12 — Celebrations + Account Manager Portfolio (Weeks 25–26)

**Goal**: Milestone gifting is automated. Account Managers can manage their portfolio.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 10.1 — Celebration triggers | L (8) | Story 10.0 (employee import), gifting module (P0), N8N (7.3) | High — N8N date-based triggers, gift template engine |
| 10.2 — Manager personalises celebration | M (5) | Story 10.1, notifications (7.2) | Medium — 48h pre-trigger notification window |
| 9.4 — Account Manager portfolio | M (5) | Client management (9.3 P0), role scoping | Low — scoped client list, health score calc |

**Total**: 18 pts | Pair fits well. Solo: push 9.4 to Sprint 13.

**Sprint 12 Definition of Done**:
- [ ] L3 Admin can create trigger: occasion type → budget → gift template → auto or manual
- [ ] N8N fires celebration 24h before birthday/anniversary date
- [ ] Manager receives notification 48h before trigger: can personalise message, variant, or upgrade gift
- [ ] If manager takes no action, automated default fires
- [ ] Manager can suppress ("done externally") to cancel automated send
- [ ] AM portal shows only assigned clients with health score (activity, spend trend, open tickets)
- [ ] AM can create shortlists for clients and schedule call actions

---

## Sprint 13 — Stay Booking + Gift Tracking + Travel Policy (Weeks 27–28)

**Goal**: Business trips bookable. Gifts trackable. Travel policy enforced.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 5.4 — Employee books a stay | L (8) | SpaceX module (P0 Sprint 7), travel policy (5.5) | Medium — travel policy enforcement at search time |
| 5.5 — Travel & space policy | M (5) | Supabase policy table, SpaceX search | Medium — policy enforcement must block/flag at search, not just at checkout |
| 4.6 — Gift delivery tracking | M (5) | Gifting order flow (4.2 P0), logistics/carrier API | High — carrier API integration (Delhivery/Shiprocket) is external dependency |

**Total**: 18 pts | Pair fits. Solo: defer 4.6 to Sprint 14 (carrier API is highest-risk story in P1).

**Sprint 13 Definition of Done**:
- [ ] L3 Admin can create travel policy: max nightly rate, approved cities, booking window, role tiers
- [ ] Stay search enforces policy at results level: within policy shown normally, outside flagged "requires approval"
- [ ] Booking confirmation includes auto-generated invoice for reimbursement
- [ ] Gift order detail shows status pipeline: Ordered → Packed → Dispatched → Out for Delivery → Delivered
- [ ] Tracking number and carrier link visible once dispatched
- [ ] Push + email notification at each status change

---

## Sprint 14 — Messaging + Disputes (Weeks 29–30)

**Goal**: Corporate and vendor can message about bookings. Disputes have a formal resolution path.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 7.1 — In-platform messaging | L (8) | Supabase Realtime, CommunicationPage.tsx (skeleton) | High — real-time WebSocket, file attachments, unread counts |
| 9.5 — Admin handles disputes & escalations | M (5) | Messaging (7.1), refunds (6.3) | Medium — dispute queue, evidence attachments, refund trigger from dispute |
| 4.6 — Gift delivery tracking (if deferred) | M (5) | Carrier API | High — external API |

**Total**: 13 pts (without 4.6) / 18 pts (with 4.6) | Either fits.

**Sprint 14 Definition of Done**:
- [ ] Chat thread linked to booking ID; messages are real-time via Supabase Realtime
- [ ] File attachments up to 5MB (PDF, images) stored in Supabase Storage
- [ ] Unread count in top nav notification bell; email notification if user not active in app
- [ ] Either party can raise a dispute from booking detail page
- [ ] Admin sees dispute queue with timeline, evidence, parties
- [ ] Admin can initiate full/partial/no refund with mandatory resolution note
- [ ] Resolution auto-notified to both parties; permanently logged against booking

---

## Sprint 15 — Bulk Gifting + Stabilisation (Weeks 31–32)

**Goal**: Company-wide festival gifting works. Full P1 regression. Platform ready for P2 planning.

| Story | Points | Dependencies | Risk |
|---|---|---|---|
| 4.3 — L3 Admin bulk-gifting for festival | L (8) | Gifting programme (4.1 P0), logistics API, notifications (7.2) | Medium — bulk order creation, per-employee delivery tracking |
| P1 regression + bug fix buffer | — | All sprints | Reserve 40% capacity |

**Total**: 8 pts of stories + buffer | Intentionally light — stabilisation sprint.

**Sprint 15 Definition of Done**:
- [ ] Admin can select occasion, gift item, recipient scope (all / dept / custom list)
- [ ] System calculates total budget, shows approval summary before confirming
- [ ] Bulk order placed with vendor; each employee receives gift notification
- [ ] Admin can track delivery status per employee in bulk order view
- [ ] All P1 flows tested end-to-end on staging
- [ ] Zero P1 stories in "partial" state

---

## Full P1 Timeline Summary

| Sprint | Weeks | Focus | Key Deliverable |
|---|---|---|---|
| **8** | 17–18 | Payment extensions | Refunds automated, vendor payouts live, role switcher works |
| **9** | 19–20 | Notifications + Cancellations + Data import | Users notified, bookings cancellable, employee data importable |
| **10** | 21–22 | N8N + Spend visibility | Platform self-operates on key events, spend reports exportable |
| **11** | 23–24 | Support system | Tickets raised, resolved, vendor support separate queue |
| **12** | 25–26 | Celebrations + AM Portfolio | Milestone gifting automated, AM manages assigned clients |
| **13** | 27–28 | Stay + Gift tracking + Travel policy | Business trips bookable, gift delivery tracked, travel policy enforced |
| **14** | 29–30 | Messaging + Disputes | Real-time chat, formal dispute resolution path |
| **15** | 31–32 | Bulk gifting + Stabilisation | Festival campaigns, full P1 regression |

**P1 duration**: 16 weeks (Weeks 17–32)  
**Combined P0 + P1**: 32 weeks (~8 months)

---

## P1 Sprint Risks (Global)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Carrier API (Shiprocket/Delhivery) integration slower than expected | High | Medium | Spike in Sprint 9 week 1 while other stories run; use mock tracking if API delayed |
| N8N date-based triggers (birthday/anniversary) unreliable in staging | Medium | Medium | Test with dates 1 day away in staging, not actual birth years |
| Supabase Realtime connection drops on mobile (messaging) | Medium | Medium | Add reconnection logic in realtimeService abstraction; test on 4G not WiFi |
| Razorpay payout API requires manual KYC per vendor | High | High | Start vendor bank account verification flow in Sprint 8 week 1 — KYC takes days |
| PDF report generation (2.4) requires server-side rendering | Medium | Low | Use react-pdf or puppeteer via Supabase Edge Function; spike in Sprint 9 |
| Solo engineer: Sprint 10 (N8N + 2 report stories) too heavy | High | Medium | Solo: defer 2.4 to Sprint 11, combine with support stories |

---

## What Is NOT In P1

Deliberately excluded — these are P2:

- Vendor analytics/performance dashboard (8.3)
- Vendor promotions (8.5, 9.6)
- Reviews (8.4–8.6)
- VAPI/Hey Genie (11.1, 11.2)
- Wishlist, Compare, Shortlists (13.1–13.3)
- Partner Portal (14.1–14.6)
- HRMS connectors (Darwinbox/Keka) — CSV import (10.0) handles P1 need
- Native mobile app — PWA remains sufficient through P1

---

## Combined Roadmap (P0 + P1)

```
Weeks  1–2   Sprint 0  — Foundation (Supabase, Auth, Razorpay stub, N8N, Resend)
Weeks  3–4   Sprint 1  — Auth & Onboarding
Weeks  5–6   Sprint 2  — Admin Portal + Budget
Weeks  7–8   Sprint 3  — Vendor Listings & Calendar
Weeks  9–10  Sprint 4  — Discovery + Booking Flows
Weeks 11–12  Sprint 5  — Payment & Wallet
Weeks 13–14  Sprint 6  — Gifting Module
Weeks 15–16  Sprint 7  — SpaceX + P0 Stabilisation
──────────────────────────── P0 COMPLETE ───────────────────────────
Weeks 17–18  Sprint 8  — Refunds + Payouts + Role Switcher
Weeks 19–20  Sprint 9  — Notifications + Cancellations + Employee Import
Weeks 21–22  Sprint 10 — N8N Automation + Spend Reporting
Weeks 23–24  Sprint 11 — Support System
Weeks 25–26  Sprint 12 — Celebrations + AM Portfolio
Weeks 27–28  Sprint 13 — Stay Booking + Gift Tracking + Travel Policy
Weeks 29–30  Sprint 14 — Messaging + Disputes
Weeks 31–32  Sprint 15 — Bulk Gifting + P1 Stabilisation
──────────────────────────── P1 COMPLETE ───────────────────────────
Week 33+     P2 planning begins
```

---

*Mogzu Sprint Plan P1 v1.0 — May 2026*  
*Continues from: mogzu_sprint_plan_p0.md*  
*Source: mogzu_prd_v2.md P1 stories*

# Mogzu User Stories — Complete Backlog

**Platform**: B2B SaaS — Events, Gifting, SpaceX modules  
**Format**: User Stories (As a / I want / So that)  
**Roles**: L1 Employee · L2 Manager · L3 Admin/HR · Vendor · Mogzu Admin · Account Manager · Partner · Support  
**Generated**: 2026-05-16  
**Codebase status**: ~100% UI shell built from Figma · ~30–40% end-to-end flows working · All data currently localStorage-only

---

## EPIC 1 — Authentication & Onboarding

### Story 1.1 — Corporate Employee Self-Registration
**As an L1 Employee, I want to sign up with my corporate email and be auto-linked to my company account, so that I can access the platform without waiting for manual provisioning.**

Acceptance Criteria:
- [ ] Email domain is validated against registered corporate domain list
- [ ] If domain matches, account is auto-linked to parent corporate account
- [ ] If domain is unrecognized, sign-up is blocked with "contact your HR admin" message
- [ ] User receives welcome email after successful registration
- [ ] User lands on corporate dashboard after first login

Priority: P0 | Effort: M | Dependencies: Supabase auth, corporate domain table

---

### Story 1.2 — Corporate Admin Invites Team Members
**As an L3 Admin, I want to invite employees by email and assign them a role (L1/L2), so that I control who has access and at what permission level.**

Acceptance Criteria:
- [ ] Admin can bulk-invite via CSV upload or individual email entry
- [ ] Invite email is sent with role pre-assigned
- [ ] Invited user sets password on first login (not before)
- [ ] Admin sees pending/accepted/expired invite status in user management
- [ ] Invite link expires after 72 hours; admin can resend

Priority: P0 | Effort: M | Dependencies: Story 1.1, email service

---

### Story 1.3 — Vendor Registration & Module Selection
**As a Vendor, I want to complete a multi-step registration and select which modules I want to offer (SpaceX, Events, Gifting), so that my portal is configured for my service type.**

Acceptance Criteria:
- [ ] Vendor can select 1–3 modules during onboarding
- [ ] Selected modules determine which nav items and listing forms appear
- [ ] GST number is optional during signup but required before first booking is accepted
- [ ] Vendor receives a "verification pending" confirmation screen after submission
- [ ] Vendor cannot access dashboard until Mogzu Admin approves

Priority: P0 | Effort: L | Dependencies: vendorOnboardingApi.ts (currently stubbed)

---

### Story 1.4 — Mogzu Admin Approves/Rejects Vendor
**As a Mogzu Admin, I want to review vendor applications and approve or reject with feedback, so that only quality vendors are listed on the platform.**

Acceptance Criteria:
- [ ] Admin sees queue of pending vendors with submitted details
- [ ] Approve action sets vendor status to ACTIVE and triggers welcome email
- [ ] Reject action requires selecting a rejection reason from a checklist
- [ ] Rejection email includes specific feedback items from vendorRejectionChecklist
- [ ] Rejected vendor can resubmit after correcting issues

Priority: P0 | Effort: M | Dependencies: adminVendorQueueStorage.ts → Supabase migration

---

### Story 1.5 — Role Switcher for Multi-Role Users
**As a user who has both Manager and Admin roles, I want to switch between roles without logging out, so that I can manage tasks for either role in one session.**

Acceptance Criteria:
- [ ] Role switcher is accessible from top nav
- [ ] Switching role changes dashboard, navigation, and permission scope
- [ ] Current role is clearly displayed in the header at all times
- [ ] Role switch is logged for audit purposes

Priority: P1 | Effort: S | Dependencies: demoRole.ts → real role table

---

## EPIC 2 — Corporate Dashboard & Budget Management

### Story 2.1 — L3 Admin Sets Department Budget
**As an L3 Admin, I want to set monthly or annual spend budgets per department or cost center, so that employee bookings are automatically controlled within approved limits.**

Acceptance Criteria:
- [ ] Admin can create budget rules: amount + period (monthly/quarterly/annual) + scope (department/team/individual)
- [ ] Budget rules are saved to backend (not localStorage)
- [ ] Dashboard shows real-time remaining budget per rule
- [ ] When budget reaches 80%, L3 Admin receives an alert notification
- [ ] Bookings that would exceed budget are blocked with an approval request flow

Priority: P0 | Effort: L | Dependencies: Supabase budget table, real-time subscription

---

### Story 2.2 — L2 Manager Approves Booking Requests
**As an L2 Manager, I want to see pending booking requests from my team and approve or reject them, so that team spending aligns with project priorities.**

Acceptance Criteria:
- [ ] Manager dashboard shows a prioritized approval queue
- [ ] Each request shows: requester, item, price, purpose note
- [ ] Manager can approve, reject with comment, or request modification
- [ ] Approved requests immediately proceed to payment; rejected requests notify employee
- [ ] Manager receives push notification when new request enters queue
- [ ] Bulk approve is supported for same-event requests (e.g. team outing)

Priority: P0 | Effort: M | Dependencies: Story 2.1, notification service

---

### Story 2.3 — L1 Employee Views Personal Spend Dashboard
**As an L1 Employee, I want to see my year-to-date spend across all modules, so that I understand how much of my allowance I have used.**

Acceptance Criteria:
- [ ] Dashboard card shows: used / total allowance, % remaining
- [ ] Spend is broken down by module (Events, Gifting, SpaceX)
- [ ] Last 5 transactions are listed with date, vendor, amount
- [ ] If no budget is assigned, card shows "No budget set — contact HR"
- [ ] Data refreshes in real time after a booking is confirmed

Priority: P1 | Effort: M | Dependencies: Story 2.1, booking confirmation flow

---

### Story 2.4 — L3 Admin Generates Spend Report
**As an L3 Admin, I want to export a spend report filtered by date range, department, and module, so that I can submit it to Finance for reconciliation.**

Acceptance Criteria:
- [ ] Report builder UI has date range picker, department filter, module filter
- [ ] Export formats: CSV and PDF
- [ ] Report includes: employee name, booking ID, vendor, module, amount, status, date
- [ ] Report can be scheduled (weekly/monthly) to auto-email to a distribution list
- [ ] Empty state shown if no transactions match filters

Priority: P1 | Effort: M | Dependencies: booking data in Supabase, email service

---

## EPIC 3 — Events Module

### Story 3.1 — L1 Employee Discovers Events
**As an L1 Employee, I want to browse events filtered by category, date, location, and budget, so that I can find relevant options for my team activity.**

Acceptance Criteria:
- [ ] Events listing shows category pills (Team Outing, Workshop, Celebration, etc.)
- [ ] Date picker filters to specific day or range
- [ ] Location filter (city) narrows results
- [ ] Budget slider filters by per-person price
- [ ] Each listing card shows: name, vendor, price/pax, rating, availability badge
- [ ] Clicking a card navigates to event detail page

Priority: P0 | Effort: M | Dependencies: events data in Supabase

---

### Story 3.2 — L1 Employee Books an Event
**As an L1 Employee, I want to select date, group size, and add-ons, then submit a booking request, so that my team has a confirmed activity.**

Acceptance Criteria:
- [ ] Booking flow: Select date → Group size → Add-ons → Review → Submit
- [ ] Date picker shows vendor's available slots (blocks booked dates)
- [ ] Group size validation enforces vendor's min/max capacity
- [ ] Price recalculates in real time as group size and add-ons change
- [ ] If budget approval required, booking enters "Pending Manager Approval" state
- [ ] If no approval needed, booking enters "Pending Vendor Confirmation" state
- [ ] Employee receives email confirmation with booking summary

Priority: P0 | Effort: L | Dependencies: Vendor calendar API, Story 2.2, payment gateway

---

### Story 3.3 — Vendor Confirms or Rejects Event Booking
**As a Vendor, I want to review incoming event booking requests and confirm availability, so that I can plan resources and prevent overbooking.**

Acceptance Criteria:
- [ ] Vendor sees new booking alert in dashboard and notification bell
- [ ] Booking detail shows: event name, date, group size, add-ons, corporate account name
- [ ] Vendor can confirm (sets booking to CONFIRMED) or reject with reason
- [ ] On confirmation, calendar slot is blocked for that date
- [ ] Rejection triggers refund initiation if payment was taken upfront
- [ ] Vendor has 24-hour SLA to respond; system auto-cancels and notifies both parties if no response

Priority: P0 | Effort: M | Dependencies: Vendor calendar, notification service

---

### Story 3.4 — L1 Employee Cancels or Reschedules a Booking
**As an L1 Employee, I want to cancel or reschedule a confirmed booking, so that I can adjust plans without losing my allowance.**

Acceptance Criteria:
- [ ] Cancel option is available up to vendor's cancellation deadline (configurable per listing)
- [ ] After deadline, cancellation incurs a fee (shown to user before confirming)
- [ ] Reschedule shows available slots from vendor; preserves original booking ID
- [ ] Refund is initiated automatically on eligible cancellations (full/partial per policy)
- [ ] Vendor is notified of cancellation/reschedule immediately

Priority: P1 | Effort: M | Dependencies: Story 3.2, payment/refund gateway

---

### Story 3.5 — L3 Admin Manages Corporate Event Services
**As an L3 Admin, I want to manage recurring corporate event templates (team day, annual meet, onboarding), so that managers can book pre-approved event types without starting from scratch.**

Acceptance Criteria:
- [ ] Admin can create event templates with pre-set parameters and approved vendors
- [ ] Templates appear in a "Corporate Picks" section visible to L1/L2 users
- [ ] Admin can set auto-approval for specific templates below a cost threshold
- [ ] Template usage is tracked (how many times booked, total spend)

Priority: P2 | Effort: M | Dependencies: Events module, admin portal

---

### Story 3.6 — Vendor Creates and Manages Event Listings
**As a Vendor, I want to create event listings with rich details, media, pricing, and capacity, so that corporate buyers can discover and book my services.**

Acceptance Criteria:
- [ ] Listing form: title, description, category, images (up to 10), pricing type (per person/flat), capacity, add-ons, cancellation policy
- [ ] Draft save auto-persists every 30 seconds
- [ ] Published listing is visible to corporate users after Mogzu Admin approval
- [ ] Vendor can edit a live listing; edits trigger re-review if pricing or capacity changes
- [ ] Vendor can pause a listing (hidden from discovery, existing bookings unaffected)

Priority: P0 | Effort: L | Dependencies: Media upload (S3/Supabase Storage), admin approval workflow

---

## EPIC 4 — Gifting Module

### Story 4.1 — L3 Admin Configures Gifting Programme
**As an L3 Admin, I want to set gifting budgets per occasion (birthday, work anniversary, festival), so that employees receive appropriate gifts without manual approval each time.**

Acceptance Criteria:
- [ ] Admin creates gifting rules: occasion type → budget per recipient → auto-approve or require approval
- [ ] Occasions can have fixed dates (Diwali) or dynamic triggers (employee birthday from HRMS)
- [ ] Gifting rules are applied per department or company-wide
- [ ] Admin can set preferred vendor lists per occasion

Priority: P0 | Effort: L | Dependencies: HRMS integration or manual employee data import

---

### Story 4.2 — L1 Employee Sends a Gift
**As an L1 Employee, I want to browse the gifting shop and send a gift to a colleague, so that I can celebrate team milestones within my allowed budget.**

Acceptance Criteria:
- [ ] Shop shows products filtered by category, price range, and occasion
- [ ] Employee can select recipient from corporate directory (search by name)
- [ ] Add personalised message (max 200 chars)
- [ ] Order confirmation shows estimated delivery date
- [ ] If gift exceeds personal gifting budget, request is routed to manager for approval

Priority: P0 | Effort: M | Dependencies: Story 4.1, payment gateway, shipping/logistics API

---

### Story 4.3 — L3 Admin Bulk-Gifts for a Festival
**As an L3 Admin, I want to trigger a bulk gifting order for all employees on a festival date, so that I can efficiently run company-wide appreciation campaigns.**

Acceptance Criteria:
- [ ] Admin selects occasion, gift item, and recipient scope (all / department / custom list)
- [ ] System calculates total budget required and shows approval summary
- [ ] Admin confirms; system places bulk order with vendor
- [ ] Each employee receives a gift notification with a personal message
- [ ] Admin can track delivery status per employee in bulk order view

Priority: P1 | Effort: L | Dependencies: Story 4.1, logistics API, notification service

---

### Story 4.4 — Vendor Manages Gifting Catalogue
**As a Vendor, I want to list gifting products with variants (size, colour), pricing, and delivery SLAs, so that corporate buyers can accurately select and order gifts.**

Acceptance Criteria:
- [ ] Product form: name, description, category, images, variants, price per variant, moq, delivery SLA
- [ ] Vendor sets city/state delivery coverage (orders outside coverage are blocked at checkout)
- [ ] Low stock alert when inventory < 10 units
- [ ] Vendor can mark items as "out of stock" to pause orders without delisting
- [ ] Bulk pricing tiers supported (1–10 units: ₹X, 11–50: ₹Y, 50+: ₹Z)

Priority: P0 | Effort: L | Dependencies: adminGiftingStore.ts → Supabase migration

---

### Story 4.5 — Mogzu Admin Approves Gifting Products
**As a Mogzu Admin, I want to review vendor gifting submissions and approve or request changes, so that product quality and pricing meet platform standards.**

Acceptance Criteria:
- [ ] Admin sees gifting product queue with submitted details and images
- [ ] Approve sets product to LISTED; visible to corporate users
- [ ] Request changes sends structured feedback to vendor (field-level comments)
- [ ] Vendor resubmits; admin is notified for re-review
- [ ] Admin can bulk-approve products from same vendor after initial trust is established

Priority: P0 | Effort: M | Dependencies: adminGiftingStore.ts → Supabase

---

### Story 4.6 — L1 Employee Tracks Gift Delivery
**As an L1 Employee, I want to track the delivery status of gifts I have sent, so that I know when recipients will receive them.**

Acceptance Criteria:
- [ ] Order detail page shows status: Ordered → Packed → Dispatched → Out for Delivery → Delivered
- [ ] Tracking number and carrier link shown once dispatched
- [ ] Push/email notification at each status change
- [ ] If delivery fails, employee is notified with re-delivery option

Priority: P1 | Effort: M | Dependencies: logistics/carrier API integration

---

## EPIC 5 — SpaceX Module (DSpace / Coworking / Stay)

### Story 5.1 — L1 Employee Searches for a Workspace
**As an L1 Employee, I want to search for coworking spaces or meeting rooms by location, date, capacity, and amenities, so that I can book a suitable workspace for my team.**

Acceptance Criteria:
- [ ] Search bar with city autocomplete and date picker
- [ ] Filters: space type (hot desk / private room / meeting room / event hall), capacity, amenities (WiFi, projector, catering)
- [ ] Map view and list view toggle
- [ ] Each card shows: space name, price/hour or day, rating, available slots badge
- [ ] Clicking card navigates to space detail with image gallery and availability calendar

Priority: P0 | Effort: M | Dependencies: Supabase spaces table, vendor availability data

---

### Story 5.2 — L1 Employee Books a Space
**As an L1 Employee, I want to book a coworking space or meeting room for specific dates and times, so that my team has a confirmed workspace.**

Acceptance Criteria:
- [ ] Booking flow: Select slot → Attendees → Add-ons (catering, AV) → Review → Pay
- [ ] Hourly and daily pricing calculated in real time
- [ ] Calendar blocks the slot immediately on confirmed payment
- [ ] Booking confirmation email includes address, access instructions, and QR code
- [ ] Modification window: up to 24 hours before check-in (free); after that, cancellation fee applies

Priority: P0 | Effort: L | Dependencies: Vendor calendar, payment gateway

---

### Story 5.3 — Vendor Manages Space Listings and Availability
**As a Vendor, I want to manage my space listings, set availability calendars, and block-off maintenance periods, so that bookings are always accurate.**

Acceptance Criteria:
- [ ] Listing form: space name, type, capacity, amenities checklist, images, pricing (hourly/daily/weekly)
- [ ] Calendar UI for availability: drag to block, click to unblock
- [ ] Recurring blocks supported (e.g. every Sunday unavailable)
- [ ] Buffer time configurable between bookings (e.g. 30 min cleaning break)
- [ ] Availability changes do not affect already-confirmed bookings

Priority: P0 | Effort: L | Dependencies: VendorCalendarPage → Supabase calendar

---

### Story 5.4 — L1 Employee Books a Stay (Hotel / Serviced Apartment)
**As an L1 Employee, I want to book a corporate-approved stay for a business trip, so that my accommodation is covered under company policy.**

Acceptance Criteria:
- [ ] Stay search: city, check-in/check-out dates, room type
- [ ] Results filtered to properties within corporate travel policy (max rate/night set by L3)
- [ ] Properties outside policy shown but marked "requires approval"
- [ ] Booking confirmation includes invoice auto-generated for reimbursement
- [ ] Early check-out request sends notification to vendor

Priority: P1 | Effort: L | Dependencies: travel policy config (L3 admin), StayPage.tsx wire-up

---

### Story 5.5 — L3 Admin Sets Travel and Space Policy
**As an L3 Admin, I want to define travel policies (max hotel rate, approved cities, booking lead time), so that employee space and stay bookings comply with company guidelines automatically.**

Acceptance Criteria:
- [ ] Policy form: max nightly rate, approved city list, booking window (min days in advance), eligible roles
- [ ] Policy is enforced at search time — ineligible results are hidden or flagged
- [ ] Admin receives monthly policy violation report (attempted bookings that exceeded policy)
- [ ] Admin can create role-based policy tiers (e.g. L1 ≤ ₹3,000/night, L2 ≤ ₹6,000/night)

Priority: P1 | Effort: M | Dependencies: Supabase policy table

---

## EPIC 6 — Booking Lifecycle & Payments

### Story 6.1 — Payment Processing at Checkout
**As an L1 Employee, I want to pay for a booking using corporate wallet, personal card, or UPI, so that I can complete a purchase through my preferred method.**

Acceptance Criteria:
- [ ] Payment options: Corporate Wallet (deducted from company budget) / Personal Card / UPI
- [ ] Razorpay or Stripe integration handles card/UPI
- [ ] Corporate Wallet payment is instant (no OTP) if within budget
- [ ] Payment receipt is emailed immediately after success
- [ ] Failed payment shows specific error and allows retry without re-entering booking details
- [ ] 3D Secure support for card payments

Priority: P0 | Effort: L | Dependencies: Payment gateway integration (BookingPayment.tsx currently has no integration)

---

### Story 6.2 — Corporate Wallet Top-Up by L3 Admin
**As an L3 Admin, I want to load funds into the company's Mogzu wallet, so that employees can book without using personal payment methods.**

Acceptance Criteria:
- [ ] Admin initiates top-up via bank transfer, NEFT, or corporate card
- [ ] Wallet balance updates after payment confirmation (Razorpay webhook or manual approval by Mogzu Admin)
- [ ] Low-balance alert when wallet falls below a configurable threshold
- [ ] Transaction history shows all top-ups and deductions with timestamps

Priority: P0 | Effort: M | Dependencies: Payment gateway, Supabase wallet table

---

### Story 6.3 — Automated Refund Processing
**As an L1 Employee, I want refunds to be credited automatically when I cancel within policy, so that I do not need to manually raise a support ticket.**

Acceptance Criteria:
- [ ] Cancellation within policy triggers automatic refund initiation
- [ ] Refund timeline is shown at cancellation: "3–5 business days to original payment method"
- [ ] Corporate Wallet refunds are instant
- [ ] Employee receives refund confirmation email with reference number
- [ ] If refund fails (card expired, etc.), support ticket is auto-created

Priority: P1 | Effort: M | Dependencies: Story 6.1, payment gateway refund API

---

### Story 6.4 — Vendor Receives Payouts
**As a Vendor, I want to receive automated payouts for confirmed and completed bookings, so that I am paid on time without manual intervention.**

Acceptance Criteria:
- [ ] Payout is triggered 48 hours after booking completion date
- [ ] Payout amount = booking total minus platform commission (rate configured by Mogzu Admin)
- [ ] Vendor can see payout schedule in dashboard: upcoming, processed, held
- [ ] Payout is made to verified bank account on file
- [ ] Payout fails gracefully: vendor notified, Mogzu Admin alerted, manual override available

Priority: P1 | Effort: L | Dependencies: Payment gateway payout API, vendor bank account verification

---

## EPIC 7 — Communication & Notifications

### Story 7.1 — In-Platform Messaging Between Corporate and Vendor
**As an L1 Employee, I want to message a vendor directly about a booking, so that I can ask questions or clarify requirements without switching to email.**

Acceptance Criteria:
- [ ] Chat thread is linked to a specific booking ID
- [ ] Messages are real time (WebSocket or Supabase Realtime)
- [ ] File attachments supported (PDF, images up to 5MB)
- [ ] Unread message count visible in top nav notification bell
- [ ] Vendor and corporate user both notified of new messages via email if not active in app

Priority: P1 | Effort: L | Dependencies: Supabase Realtime, CommunicationPage.tsx (currently skeleton)

---

### Story 7.2 — Push & Email Notifications
**As any user, I want to receive timely notifications for booking status changes, approvals, and reminders, so that I never miss an action item.**

Acceptance Criteria:
- [ ] Notification types: booking confirmed, booking cancelled, approval required, payment received, reminder 24h before event
- [ ] Each notification type is configurable (in-app / email / both) per user
- [ ] Notification centre in-app shows history of last 30 days
- [ ] Mark as read and mark all as read actions available
- [ ] Critical notifications (cancellations, payment failures) cannot be disabled

Priority: P1 | Effort: M | Dependencies: Email service (Resend/SendGrid), N8N orchestration

---

### Story 7.3 — N8N Workflow Automation for Triggers
**As a Mogzu Admin, I want automated workflows to fire on key events (booking confirmed, vendor pending >24h, budget threshold reached), so that operations run without manual monitoring.**

Acceptance Criteria:
- [ ] Workflow: Vendor non-response after 24h → auto-cancel + notify both parties + create support task
- [ ] Workflow: Budget 80% threshold → email L3 Admin
- [ ] Workflow: New vendor registration → create approval task in admin queue
- [ ] Workflow: Festival date approaching → trigger bulk gifting reminder to L3 Admins
- [ ] All workflows logged with trigger event, execution status, and any errors

Priority: P1 | Effort: L | Dependencies: N8N instance, Supabase webhooks/triggers

---

## EPIC 8 — Vendor Portal — Operations

### Story 8.1 — Vendor Views and Manages Orders
**As a Vendor, I want a unified order dashboard showing all incoming bookings across modules, so that I can manage fulfilment without switching between sections.**

Acceptance Criteria:
- [ ] Orders tab shows: all bookings sorted by status and date
- [ ] Filter by module (Events / Gifting / SpaceX), status, and date range
- [ ] Order detail: customer corp name, items, pricing, special instructions, contact info
- [ ] Vendor can update order status (for gifting: Packed → Dispatched → Delivered)
- [ ] CSV export of orders for offline fulfilment operations

Priority: P0 | Effort: M | Dependencies: VendorOrdersPage.tsx → Supabase

---

### Story 8.2 — Vendor Manages Calendar Availability
**As a Vendor, I want a calendar view to manage availability slots and prevent double-booking, so that every booking I accept can actually be fulfilled.**

Acceptance Criteria:
- [ ] Monthly, weekly, and daily calendar views
- [ ] Confirmed bookings shown as non-editable blocks with booking ID
- [ ] Vendor can add manual blocks (maintenance, personal time off)
- [ ] Recurring availability patterns: e.g. Mon–Fri 9am–6pm, closed Sundays
- [ ] Any change to availability after booking is accepted triggers notification to the corporate user

Priority: P0 | Effort: L | Dependencies: VendorCalendarPage.tsx → Supabase calendar table

---

### Story 8.3 — Vendor Views Performance Analytics
**As a Vendor, I want to see my revenue, booking count, and conversion metrics, so that I can understand how my listings are performing and optimise them.**

Acceptance Criteria:
- [ ] Dashboard widgets: total bookings, total revenue, average order value, cancellation rate
- [ ] Trend chart: bookings over last 30 / 90 days
- [ ] Listing-level breakdown: views, bookings, conversion rate per listing
- [ ] Top corporate accounts (by spend with this vendor)
- [ ] Export report as PDF

Priority: P2 | Effort: M | Dependencies: Booking data aggregation in Supabase

---

### Story 8.4 — Vendor Responds to Reviews
**As a Vendor, I want to respond to reviews left by corporate users, so that I can address concerns publicly and improve my platform reputation.**

Acceptance Criteria:
- [ ] Reviews tab shows all reviews sorted by date and rating
- [ ] Vendor can submit a single public reply per review
- [ ] Reply is shown below the review on the listing detail page
- [ ] Vendor is notified when a new review is posted (email + in-app)
- [ ] Vendor cannot edit or delete original review; only their own reply

Priority: P2 | Effort: S | Dependencies: Review/rating table in Supabase

---

### Story 8.5 — Vendor Creates a Promotion
**As a Vendor, I want to create time-limited discount offers or feature my listing on the platform, so that I can attract more corporate bookings during slow periods.**

Acceptance Criteria:
- [ ] Promotion types: percentage discount, fixed amount off, free add-on
- [ ] Set validity dates and maximum redemption count
- [ ] Option to boost listing (paid placement on homepage or category page)
- [ ] Promotion submitted to Mogzu Admin for approval before going live
- [ ] Performance report: redemptions, revenue impact

Priority: P2 | Effort: M | Dependencies: vendorPromotionAdsStorage.ts → Supabase, payment for paid placement

---

## EPIC 9 — Mogzu Admin Portal

### Story 9.1 — Mogzu Admin Manages Platform Marketplace Settings
**As a Mogzu Admin, I want to toggle modules (Events, Gifting, SpaceX) on/off per corporate account, so that I can control feature rollout and manage pilot programmes.**

Acceptance Criteria:
- [ ] Per-account module toggle in admin client management
- [ ] Global default: new accounts get (configurable) modules enabled by default
- [ ] Change is reflected in corporate user's dashboard within 60 seconds
- [ ] Toggle history logged (who changed what, when)

Priority: P0 | Effort: S | Dependencies: platformMarketplaceSettings.ts → Supabase (currently localStorage-only)

---

### Story 9.2 — Mogzu Admin Sets Commission Rates
**As a Mogzu Admin, I want to configure platform commission rates per vendor, module, or category, so that revenue split is accurate and auditable.**

Acceptance Criteria:
- [ ] Default commission rate set globally (e.g. 15%)
- [ ] Override rates per vendor or per module
- [ ] Commission preview shown when admin edits a rate: "at this rate, vendor earns ₹X per ₹1,000 booking"
- [ ] Rate changes apply to new bookings only; existing bookings use rate at time of booking
- [ ] Commission report exportable by period

Priority: P0 | Effort: M | Dependencies: Vendor payout system (Story 6.4)

---

### Story 9.3 — Mogzu Admin Manages Corporate Clients
**As a Mogzu Admin, I want to onboard, view, and manage corporate accounts, so that I can control access, plans, and billing.**

Acceptance Criteria:
- [ ] Client list with search, filter by plan, status, account manager assigned
- [ ] Client detail: company info, active users, module access, spend YTD, billing status
- [ ] Admin can suspend a client (blocks all new bookings, existing are unaffected)
- [ ] Admin can upgrade/downgrade plan (changes budget limits and module access)
- [ ] Client onboarding: manual create or self-service invite flow

Priority: P0 | Effort: M | Dependencies: Supabase corporate accounts table

---

### Story 9.4 — Account Manager Manages Assigned Portfolio
**As an Account Manager, I want to see all the corporate clients assigned to me with their health metrics, so that I can proactively support them and prevent churn.**

Acceptance Criteria:
- [ ] Account Manager portal shows only assigned clients (not all)
- [ ] Health score per client based on: activity in last 30 days, spend trend, open support tickets
- [ ] Quick actions: schedule a call, send an announcement, escalate to Mogzu Admin
- [ ] Account Manager can create shortlists on behalf of a client (curated vendor recommendations)
- [ ] Monthly summary report auto-generated and emailed to AM

Priority: P1 | Effort: M | Dependencies: Story 9.3, role scoping

---

### Story 9.5 — Mogzu Admin Handles Disputes and Escalations
**As a Mogzu Admin, I want to mediate disputes between corporate users and vendors, so that platform trust is maintained and resolutions are fair and documented.**

Acceptance Criteria:
- [ ] Dispute is raised by either party from a booking detail page
- [ ] Admin sees dispute queue with: parties involved, booking ID, evidence attachments, timeline
- [ ] Admin can initiate full refund, partial refund, no refund — with mandatory resolution note
- [ ] Decision is communicated to both parties automatically via notification
- [ ] Dispute resolution is permanently logged against booking record

Priority: P1 | Effort: M | Dependencies: Communication module, refund system

---

### Story 9.6 — Mogzu Admin Reviews Promotions Before Go-Live
**As a Mogzu Admin, I want to approve vendor promotions before they are displayed on the platform, so that discounts and featured placements meet brand and quality standards.**

Acceptance Criteria:
- [ ] Promotion queue shows pending submissions with all details
- [ ] Admin can approve (goes live on start date), reject with comment, or request edits
- [ ] Paid placements require payment confirmation before approval can proceed
- [ ] Active promotions list with remaining days and redemption count visible

Priority: P2 | Effort: S | Dependencies: Story 8.5

---

## EPIC 10 — Celebrations & Special Occasions

### Story 10.1 — L3 Admin Configures Celebration Triggers
**As an L3 Admin, I want to automate celebration actions for employee milestones (birthdays, work anniversaries, promotions), so that employees feel recognised without manual coordination.**

Acceptance Criteria:
- [ ] Admin connects HRMS or uploads employee data with DOB and join date
- [ ] Trigger types: birthday (day before), work anniversary (exact date), custom milestone
- [ ] For each trigger: choose gift template, budget, message template, or assign to manager for personalisation
- [ ] Admin can preview what an employee will receive before activating

Priority: P1 | Effort: L | Dependencies: HRMS integration or employee data import, gifting module

---

### Story 10.2 — L2 Manager Personalises a Celebration
**As an L2 Manager, I want to add a personal message and customise the gift for a team member's milestone, so that the recognition feels genuine rather than automated.**

Acceptance Criteria:
- [ ] 48 hours before a trigger fires, manager receives a notification: "Your team member [name] has a milestone on [date]. Customise their gift."
- [ ] Manager can change: message, gift variant, or upgrade to a higher-value gift (if within budget)
- [ ] If manager takes no action, automated default fires
- [ ] Manager can mark as "done externally" to suppress automated send

Priority: P1 | Effort: M | Dependencies: Story 10.1, Story 7.2

---

## EPIC 11 — VAPI (Voice AI) Integration

### Story 11.1 — L1 Employee Uses Voice Assistant to Discover and Book
**As an L1 Employee, I want to speak to the Mogzu voice assistant to find and initiate a booking, so that I can complete tasks hands-free or when on mobile.**

Acceptance Criteria:
- [ ] "Hey Genie" wake word or button activates VAPI session
- [ ] Assistant understands natural language booking intents: "Book a team lunch for 10 people next Friday under ₹500 per person"
- [ ] Assistant presents 2–3 matching options verbally and on screen
- [ ] User confirms selection verbally; assistant pre-fills booking flow
- [ ] Fallback to text if microphone permission denied
- [ ] Voice session transcript saved for reference

Priority: P2 | Effort: L | Dependencies: VAPI integration, Events + SpaceX search API

---

### Story 11.2 — Mogzu Admin Configures Hey Genie Module
**As a Mogzu Admin, I want to configure which intents Hey Genie can handle and for which corporate accounts, so that the AI assistant stays within approved service scope.**

Acceptance Criteria:
- [ ] Admin enables/disables Genie per client account
- [ ] Intent configuration: which modules Genie can access (Events only, or all)
- [ ] Fallback message when Genie cannot handle a request (escalates to human support)
- [ ] Admin sees Genie usage metrics: sessions, successful completions, fallback rate

Priority: P2 | Effort: M | Dependencies: VAPI API, platform marketplace settings

---

## EPIC 12 — Support & Help

### Story 12.1 — Any User Raises a Support Ticket
**As any user, I want to raise a support ticket from any page with context auto-captured, so that issues are resolved quickly without me having to explain the full context.**

Acceptance Criteria:
- [ ] Help button available in header and sidebar on all pages
- [ ] Auto-capture: current page URL, user role, last action, device/browser
- [ ] User selects issue category: billing, booking, vendor, account, other
- [ ] SLA shown at submission: "Expected response within 4 business hours"
- [ ] Ticket tracking page shows: status, assigned agent, messages

Priority: P1 | Effort: M | Dependencies: Support ticket system (Supabase or third-party helpdesk)

---

### Story 12.2 — Mogzu Support Agent Resolves Tickets
**As a Mogzu Support agent, I want a ticketing queue with filtering, priority, and internal notes, so that I can resolve user issues efficiently.**

Acceptance Criteria:
- [ ] Support dashboard shows queue filtered by: status, priority, category, SLA breach risk
- [ ] Ticket detail: full conversation thread, auto-captured context, attached bookings/orders
- [ ] Internal notes visible to support team only (not the user)
- [ ] Support can reassign to another agent or escalate to admin
- [ ] CSAT survey sent to user automatically on ticket close

Priority: P1 | Effort: M | Dependencies: Story 12.1

---

### Story 12.3 — Vendor Raises a Support Ticket
**As a Vendor, I want to raise a support ticket about a disputed booking, a payout issue, or a platform question, so that I get resolution without calling Mogzu.**

Acceptance Criteria:
- [ ] Vendor support portal is separate from corporate support queue
- [ ] Booking-linked tickets auto-attach the booking record
- [ ] Payout dispute tickets surface payout transaction details to support agent
- [ ] Vendor receives email updates on ticket progress
- [ ] Resolved tickets prompt feedback rating from vendor

Priority: P1 | Effort: M | Dependencies: vendorSupportQueueStorage.ts → Supabase

---

## EPIC 13 — Wishlist, Compare, and Shortlists

### Story 13.1 — L1 Employee Saves Items to Wishlist
**As an L1 Employee, I want to save listings to a wishlist, so that I can revisit options before deciding.**

Acceptance Criteria:
- [ ] Heart/bookmark icon on every listing card and detail page
- [ ] Wishlist page shows all saved items grouped by module
- [ ] Removing from wishlist asks for confirmation
- [ ] Wishlist is persisted across sessions (Supabase, not localStorage)
- [ ] Wishlist items that become unavailable are flagged

Priority: P2 | Effort: S | Dependencies: WishlistPage.tsx → Supabase

---

### Story 13.2 — L1 Employee Compares Listings Side by Side
**As an L1 Employee, I want to add up to 4 listings to a compare view, so that I can make an informed choice based on features, price, and ratings.**

Acceptance Criteria:
- [ ] "Add to Compare" available on listing cards (disabled when 4 already selected)
- [ ] Sticky compare bar shows selected items count and "Compare" CTA
- [ ] Compare table: price, capacity, amenities, ratings, availability, cancellation policy
- [ ] Differences highlighted between columns
- [ ] User can remove an item from compare and add another without losing others

Priority: P2 | Effort: M | Dependencies: ComparePage.tsx logic wiring

---

### Story 13.3 — Account Manager Creates a Shortlist for a Client
**As an Account Manager, I want to curate a shortlist of recommended vendors for a client's specific need, so that the client gets a personalised discovery experience.**

Acceptance Criteria:
- [ ] AM can create a shortlist from any search results or listing detail page
- [ ] Shortlist has: title, description, expiry date, and list of up to 10 listings
- [ ] AM shares shortlist via link; link is client-specific (not publicly accessible)
- [ ] Client sees shortlist as a curated section in their dashboard
- [ ] AM can see if client viewed or booked from shortlist

Priority: P2 | Effort: M | Dependencies: mogzuShortlistHelpers.ts → Supabase

---

## EPIC 14 — Partner Portal

### Story 14.1 — Partner Refers Corporate Clients
**As a Partner, I want to refer corporate clients and track when they onboard, so that I can earn referral commissions.**

Acceptance Criteria:
- [ ] Partner has a unique referral link/code
- [ ] Referred client signs up → automatically linked to partner's account
- [ ] Partner dashboard shows: referrals sent, signed up, activated, commission earned
- [ ] Commission is credited to partner wallet after referred client's first successful booking
- [ ] Partner can request payout to bank account

Priority: P2 | Effort: M | Dependencies: Partner role scoping, commission/wallet system

---

### Story 14.2 — Mogzu Admin Manages Partner Agreements
**As a Mogzu Admin, I want to configure partner commission rates and terms, so that referral economics are controlled and auditable.**

Acceptance Criteria:
- [ ] Partner agreement form: name, commission rate (%), payment terms, expiry date
- [ ] Admin can pause a partner (stops new referral attribution; existing referrals unaffected)
- [ ] Commission auto-calculated per referred client's monthly GMV
- [ ] Partner receives monthly statement email with breakdown

Priority: P2 | Effort: M | Dependencies: Story 14.1

---

## Story Map

```
Must-Have (P0) → Should-Have (P1) → Nice-to-Have (P2)

P0: Auth & Onboarding (1.1–1.4) · Vendor Listing CRUD (3.6, 4.4, 5.3) · Budget Rules (2.1)
    Manager Approvals (2.2) · Event Booking Flow (3.2, 3.3) · Payment (6.1, 6.2)
    Order Management (8.1) · Marketplace Settings (9.1) · Commission (9.2) · Client Mgmt (9.3)

P1: Budget Reports (2.4) · Cancellation/Refund (3.4, 6.3) · Vendor Payouts (6.4)
    Calendar (8.2) · Communications (7.1, 7.2) · N8N Automation (7.3)
    Support Tickets (12.1–12.3) · Celebration Triggers (10.1, 10.2) · Stay Booking (5.4)
    Disputes (9.5) · Account Manager Portfolio (9.4)

P2: Analytics (8.3) · Reviews (8.4) · Promotions (8.5, 9.6) · VAPI/Genie (11.1, 11.2)
    Wishlist (13.1) · Compare (13.2) · Shortlists (13.3) · Partner Portal (14.1, 14.2)
    Celebrations Personalisation (10.2)
```

---

## Technical Notes

1. **Storage migration**: All 15+ localStorage stores must migrate to Supabase tables with Row-Level Security policies per role. This is a prerequisite for Stories 2.1, 4.4, 8.1, and most P0 stories.
2. **Payment gateway**: BookingPayment.tsx is built; requires Razorpay or Stripe SDK integration. Refund and payout flows need webhook handlers.
3. **N8N**: No N8N integration exists in codebase. Stories 7.3, 10.1 require webhook endpoints in Supabase Edge Functions that trigger N8N.
4. **Email service**: Zero email integration currently. Recommend Resend for transactional email; all notification stories depend on this.
5. **VAPI**: Hey Genie module is gated in platformMarketplaceSettings.ts but no VAPI SDK calls exist. Needs spike.
6. **Supabase Realtime**: Required for Stories 7.1 (messaging), 2.3 (live budget), and 8.2 (calendar).
7. **Media uploads**: Vendor listing forms need S3 or Supabase Storage for images; currently no upload logic exists.
8. **RLS design**: Supabase RLS must enforce L1/L2/L3/Vendor/Admin scoping — schema design is a prerequisite spike for all data stories.

---

## Open Questions

1. **HRMS integration**: Does Mogzu integrate with Darwinbox, Keka, or similar? Required for Stories 10.1, 4.1 (auto-birthday triggers). If not, what is the employee data import format?
2. **Payment acquirer**: Razorpay or Stripe? Which currencies and regions are in scope for v1?
3. **Multi-tenancy model**: Are corporate accounts fully isolated in Supabase (separate schemas) or row-isolated in shared tables?
4. **N8N hosting**: Is N8N self-hosted or cloud? Who owns the workflow definitions?
5. **Vendor SLA for booking confirmation**: Currently 24 hours assumed — is this configurable per vendor or module?
6. **Partner vs Account Manager**: Are these external roles (separate login) or internal Mogzu staff roles?
7. **Mobile app**: All components are responsive React — is there a separate React Native app planned, or is this PWA-only?
8. **Review gating**: Can any employee leave a review, or only after a confirmed+completed booking?

---

**Total stories**: 47  
**P0**: 17 · **P1**: 19 · **P2**: 11

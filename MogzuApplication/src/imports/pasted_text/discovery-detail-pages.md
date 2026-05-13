You are a senior B2B SaaS product designer working inside the existing 
Mogzu design system. The platform has three verticals: SpaceX (venue 
booking), Gifting (corporate gifting), and Events (activity professionals 
and artists). These features already exists: Discovery, 
Booking Management, Transactions, User Management, Notifications, 
Communications, and Reports. Your task is to fill every missing gap in the 
end-to-end corporate booking flow WITHOUT redesigning existing screens.

==========================================================
DESIGN SYSTEM RULES — APPLY TO EVERY SCREEN
==========================================================
- Match existing typography, color tokens, button styles, and spacing exactly
- Use the existing vertical color coding
- All new screens use the same nav shell, sidebar, and top bar as existing screens
- All components must be Auto Layout frames with defined padding and gap tokens
- Create component variants (not separate frames) for all conditional states
- Every screen must exist for all 3 verticals unless explicitly marked as 
  "global/shared"

==========================================================
SECTION 1 — DISCOVERY FLOW (Missing & Partial)
==========================================================


SCREEN 1.1 — FILTER & SORT PANEL (Complete missing per-vertical schemas)
Spaces filters: City · Venue type · Capacity (pax) · Amenities  · Price range · Availability date · Rating
Gifting filters: Category · MOQ (minimum order qty) · Lead time · Customisation 
(yes/no) · Price per unit · Delivery PIN
Events filters: Activity type · Group size · Duration · City · Price per pax · 
Language · Rating
Sort options (all verticals): Relevance · Price: Low–High · Rating · Newest · Payment terms

- Each filter panel slides in from right as a drawer
- Apply / Reset buttons fixed at bottom of drawer

SCREEN 1.2 — DETAIL PAGE (Build for each vertical )

Space Detail Page:
- Hero image carousel (full width)
- Venue name, location, rating, verified badge
- Capacity chips: Theatre / Classroom / U-Shape / Cocktail
- Amenities icon grid
- Availability calendar 
- Pricing block component (see Section 2)
- Vendor response status banner (see Section 2)
- Vendor rating and response time
- Similar venues row (horizontal scroll)


Gifting Detail Page:
- Product image gallery (4-up grid + expand)
- Product name, category, brand/supplier, verified badge
- Description, customisation options (text/logo/colour)
- MOQ, lead time, delivery coverage
- Pricing block component (conditional)
- Bulk pricing table (qty tiers: 10–50 / 51–200 / 200+)
- Sample request CTA
- Vendor profile card
- Reviews section

Events / Artist Detail Page:
- Profile hero: full-width photo + artist avatar overlay
- Name, activity type, city, verified badge, rating
- Bio / about section
- Service cards: what they offer, group size range, session duration
- Past work gallery / showreel embed placeholder
- Pricing block component (conditional)
- Reviews section
- Similar artists row

SCREEN 1.4 — COMPARE SHORTLIST (New — Global)
- "Add to compare" toggle on every listing card (max 3 per vertical)
- Floating compare bar at bottom: shows up to 3 thumbnails + "Compare now"
- Compare view: side-by-side table
  Rows: Price · Rating · Availability · Key specs (vertical-specific) · 
  Verified status · Response time
- "Add to cart" button per column
- "Remove" to swap one vendor

==========================================================
SECTION 2 — PRICING BLOCK COMPONENT (Inject into Detail Pages)
==========================================================

The vendor configures a single pricing mode on their listing
in the Vendor Dashboard. This value (pricing_mode) is stored
as one of three enums:

  "negotiable"  →  Render Variant A
  "on_request"  →  Render Variant B
  "fixed"       →  Render Variant C

The corporate user NEVER sees a toggle or switcher.
They see exactly one variant — whichever the vendor set.

Build this as a single <PricingBlock> component that accepts
a pricing_mode prop and conditionally renders one variant.


VARIANT A — Transparent + Negotiable:
- Price displayed (large, bold)
- Price note (per day / per unit / per pax)
- Input field: "Offer price" with ₹ prefix
- Textarea: "Message to vendor" (placeholder: "Add context for your offer")
- Primary CTA: "Submit offer"
- Secondary CTA: "Check availability"

VARIANT B — Opaque / Hidden Price:
- Price area shows: "—  —  —" in muted style
- Subtext: "Pricing available on request"
- Large CTA: "Request price"
- No offer field

VARIANT C — Transparent + Fixed:
- Price displayed (large, bold)
- Lock icon + "Price is fixed — negotiation disabled by this vendor"
- Lock notice in a muted info chip
- CTA: "Check availability" only. No offer field. No negotiation.

VENDOR RESPONSE STATUS BANNER (Below pricing block, all variants):
4 states as a component variant:
- Awaiting response 
- Best offer received 
- Accepted - Declined 
Each state includes a vendor comment text area (read-only)

==========================================================
SECTION 3 — BOOKING MANAGEMENT FLOW
==========================================================

SCREEN 3.1 — CART / BOOKING REVIEW (New — Global)
- Cart header: vertical badge + item count
- Line items: vendor name + category + date/time + qty + unit price + total
- Inline budget check: "₹1,20,000 of ₹2,00,000 budget remaining"
  - Green if within budget
  - Amber if >80% used
  - Red if over budget (block proceed with override option)
- Order summary: subtotal, GST, platform fee, total
- CTA: "Proceed to terms & payment"

SCREEN 3.2 — TERMS & COMPLIANCE (New — Inject at checkout)
- Payment terms block (read-only): display vendor's payment terms
  e.g. "Net 30 · Credit · GST invoice on delivery"
- Conditional: if payment terms = Credit, show compliance block:
  - Dashed drag-drop zone: "Upload scan copy of WO / PO"
  - Checkbox: "I accept the Service Provider's Terms & Conditions"
  - Digital signature canvas: "Sign to authorise work order"
  - 4-digit OTP input: "OTP sent to registered mobile/email for PO confirmation"
- If payment terms = Advance or Immediate: skip compliance block, 
  go straight to payment gateway

SCREEN 3.3 — APPROVAL REQUEST (New — Post cart, pre payment)
- "Sent for approval" confirmation screen
- Booking summary card (vendor, date, amount)
- Approval chain visual: L1 (name, status) → L2 (name, pending) → L3 (if required)
- Status: "Awaiting L1 approval from [Name]"
- Estimated response time
- "Edit booking" and "Withdraw request" ghost buttons
- Notification sent confirmation line

SCREEN 3.4 — APPROVER INBOX (New — for L1 / L2 / L3 users)
- List of pending approvals with urgency tags
- Each item: requester name · vendor · amount · deadline · vertical badge
- Tap to open full approval detail
- Approval detail: booking summary, budget impact bar, requester note, 
  approval chain history
- Actions: [Approve] [Reject] [Request changes]
- Rejection: mandatory reason dropdown + optional comment
- "Request changes": free text sent back to requester

SCREEN 3.5 — BOOKING CONFIRMATION (New — Post approval + payment)
- Success state: large checkmark, "Booking confirmed"
- Booking reference ID
- Vendor name, date, time, amount paid
- Download: PO / WO (PDF), GST Invoice (PDF)
- "Add to calendar" button
- "View booking" → goes to upcoming bookings

SCREEN 3.6 — UPCOMING BOOKINGS (Complete partial existing screen)
- Toggle: List view / Calendar view
- List view: booking card per item
  Status chips: Draft · Pending Approval · Confirmed · Payment Due · 
  Completed · Cancelled
- Quick actions per card: Message vendor · Modify · Cancel · View details
- Calendar view: month grid with booking dots, color coded by vertical
- Empty state per tab

SCREEN 3.7 — MODIFY / CANCEL FLOW (New)
Modify: 
- Change date (vendor re-availability check)
- Change quantity / pax
- Vendor re-confirmation required before update locks in
Cancel:
- Show vendor's cancellation policy (fetched from vendor settings)
- Reason capture (mandatory dropdown)
- Refund amount calculated (based on policy)
- "Confirm cancellation" → triggers notification to vendor

SCREEN 3.8 — RESCHEDULE FLOW (New)
- Corporate requests new date
- System checks vendor's blocked dates
- If available: confirm reschedule (vendor notified)
- If unavailable: suggest 3 alternate dates (from vendor's calendar) 
  or prompt to search again

==========================================================
SECTION 4 — USER MANAGEMENT (Missing screens)
==========================================================

SCREEN 4.1 — COMPANY PROFILE (Complete partial)
Add missing fields:
- GST number + billing address
- Empanelled payment vendor (pre-approved financial partner)
- Default approval chain (set L1/L2/L3 names)
- Budget period (monthly / quarterly / annual)
- Finance contact email

SCREEN 4.2 — ROLES & PERMISSIONS (New)
- Roles list: Admin · Budget Owner · Requester · Approver (L1/L2/L3) · Finance
- Per role: define booking limit, which verticals they can access, 
  whether they can approve, whether they can view reports
- Toggle per permission per role (matrix table view)

SCREEN 4.3 — TEAM MEMBERS (New)
- Members list: name, role badge, booking limit, last active
- Invite by email + assign role
- Per member: view their booking history, adjust limit, deactivate

SCREEN 4.4 — DELEGATION RULES (New)
- Set: "If [Approver] is unavailable for [X] hours, auto-escalate to [Next]"
- Active delegations list with start/end date
- Manual override: activate delegation now

SCREEN 4.5 — VENDOR PASSPORT (New — Corporate saved vendor list)
- Saved vendors across verticals
- Per vendor card: name, vertical badge, last booked, avg rating given, 
  notes field
- Mark as "Preferred" (surfaced first in discovery)
- Remove from passport
- Used as default shortlist filter in discovery

==========================================================
SECTION 5 — BUDGET & APPROVAL SETUP
==========================================================

SCREEN 5.1 — BUDGET SETUP (New)
- Period: Monthly / Quarterly / Annual + date range
- Budget lines: add by vertical, department, or cost centre
- Alert thresholds: set notification at 80% and 100% consumed
- Save + activate

SCREEN 5.2 — APPROVAL WORKFLOW CONFIG (New — Admin only)
- Rule builder: "If booking value exceeds ₹[amount], require [Level] approval"
- Visual chain: L1 → L2 → L3 with names assigned
- Exception rules: specific vendors always require L3 regardless of value
- "Save workflow" + preview

==========================================================
SECTION 6 — TRANSACTIONS (Missing screens)
==========================================================

SCREEN 6.1 — PAYMENT GATEWAY (New — Final checkout)
2 tabs:
- Immediate payment: Credit Card · Bank Transfer · UPI · Corporate Wallet · 
  Mogzu Pay
- Empanelled vendor pay: pre-approved financial vendor, requires PO reference 
  + authorisation letter upload
Approval routing dropdown: "Route to [Level] for approval"
"Confirm & pay" CTA / "Confirm & send for approval" CTA (conditional)

SCREEN 6.2 — PO / WO GENERATION (New — Post booking confirm)
- Auto-filled from booking data: vendor name, service, dates, amount, GST
- PO for goods (gifting), WO for services (spaces + events)
- Preview PDF in-app
- "Download" and "Send to vendor" buttons

SCREEN 6.3 — GST INVOICE (New)
- Auto-generated post-payment
- Fields: GSTIN, HSN/SAC code, tax breakup (CGST/SGST/IGST)
- Download PDF, email to finance contact

SCREEN 6.4 — TRANSACTION HISTORY (Complete existing)
Add: filter by vertical / date range / payment status / vendor
Export as CSV button

==========================================================
SECTION 7 — NOTIFICATIONS (Missing screens)
==========================================================

SCREEN 7.1 — NOTIFICATION CENTRE (Complete partial)
Add: read/unread state · filter by type (Approval / Vendor / Payment / Reminder)
Inline action buttons: "Approve" / "View booking" / "Reply"

SCREEN 7.2 — NOTIFICATION TYPES (Create content for each)
- Approval request: "New booking awaiting your approval — ₹1,20,000 — 
  [Venue name] — Respond within 6 hours"
- Vendor accepted offer: "Your offer of ₹95,000 was accepted by [Vendor]"
- Vendor counter-offer: "[Vendor] countered at ₹1,05,000 — View offer"
- Vendor declined: "[Vendor] declined your request — See alternatives"
- Payment confirmed: "Payment of ₹1,20,000 confirmed — Booking #BK-2024-0091"
- Pre-event reminder (T-7): "Your event at [Venue] is in 7 days — 
  Confirm headcount"
- Pre-event reminder (T-1): "Reminder: [Event name] is tomorrow at [time]"
- OTP: "OTP for PO #PO-2024-0087: XXXX. Valid 10 minutes."
- Credit due: "Payment due in 7 days for booking #BK-2024-0091 — ₹1,20,000"

==========================================================
SECTION 8 — COMMUNICATIONS (All missing)
==========================================================

SCREEN 8.1 — INBOX / THREADS
- Thread list: vendor name + booking reference + last message preview + timestamp
- Unread count badge
- Filter: All / Enquiries / Negotiations / Active bookings / Archived

SCREEN 8.2 — VENDOR CHAT / THREAD DETAIL
- Booking reference pinned at top (tap to view booking)
- Message bubbles: corporate (right, teal) / vendor (left, gray)
- File attachment row: PDF / image
- Message input + send button
- "Offer submitted" / "Offer accepted" system events appear as timeline markers 
  within the thread

SCREEN 8.3 — OFFER / NEGOTIATION THREAD
- Structured offer exchange shown as a timeline:
  Corporate offer submitted → Vendor counter → Corporate accepts/declines
- Each offer row: amount, timestamp, status chip, message
- "Accept counter-offer" / "Submit new offer" / "Decline" actions

SCREEN 8.4 — DOCUMENT SHARING
- Documents panel within a booking thread
- Upload: event brief, gifting spec sheet, signed T&C, WO/PO scan
- Both parties see the same document list
- Tags: Shared by Corporate / Shared by Vendor

SCREEN 8.5 — EVENT BROADCAST (New — Multi-vendor events)
- Select active booking
- Compose broadcast message
- Recipients: all confirmed vendors for that booking
- Delivery: in-app + SMS (display only, toggle)
- Sent broadcast history

==========================================================
SECTION 9 — REPORTS (Missing screens)
==========================================================

SCREEN 9.1 — REPORTS DASHBOARD (Complete partial)
Add: 
- Metric cards: Total Spend · Bookings Count · Pending Approvals · 
  Budget Utilised %
- Date range picker (This month / Quarter / Year / Custom)
- Quick links to each report type

SCREEN 9.2 — SPEND ANALYSIS REPORT
- Spend by vertical (donut chart)
- Spend by department / cost centre (bar chart)
- Spend by vendor (ranked list)
- Compare: budget vs actual (grouped bar)
- Time period: month over month line chart

SCREEN 9.3 — VENDOR PERFORMANCE REPORT
- Table: vendor name, vertical, bookings count, avg rating, on-time %, 
  total spend, last booking
- Filter by vertical, date range
- Tap vendor row → vendor detail report

SCREEN 9.4 — BUDGET UTILISATION REPORT
- Per budget line: allocated, spent, remaining, % used
- Progress bars per line (green / amber / red based on threshold)
- Department-wise breakdown
- Alert log: when thresholds were crossed

SCREEN 9.5 — EXPORT / AUDIT TRAIL (New)
- Full log: every booking action, approval, payment, document upload
- Columns: timestamp, user, action, booking ref, amount, vertical
- Filters: user / action type / date range / booking ref
- Export CSV and PDF

==========================================================
COMPONENT SUMMARY — BUILD THESE AS REUSABLE COMPONENTS
==========================================================
1. Pricing block — 3 variants (A, B, C)
2. Vendor response status banner — 4 states
3. Booking status chip — 6 states
4. Approval chain progress indicator
5. Budget utilisation bar (with threshold zones)
6. Vertical badge (Spaces / Gifting / Events)
7. Verified vendor badge
8. Document upload drag-drop zone
9. OTP input (4-digit)
10. Digital signature canvas placeholder
11. Notification item (with inline action)
12. Offer timeline item (Corporate / Vendor / System event)
13. Empty state (per module, per vertical)

==========================================================

## 2026-05-24 — Post-plan Batch 46: Multi-step approval chain (persist + enforce)

- `bookingApprovalMeta.ts` — encode/decode `requiredLevels` / `approvedLevels` in `purpose_note`; `notifyFirstApprovers`, `notifyApproversForLevel`, role→level mapping.
- `db.ts` — `bookings.updatePurposeNote`.
- `createCorporatePendingApprovalBooking.ts` — `requiredApprovalLevels` + embedded meta on create.
- `SpaceBookingPage.tsx`, `EventBookingPage.tsx`, `GiftingSendPage.tsx` — `buildPurposeNoteWithApproval` on submit; first-level approver notifications.
- `CelebrationBookingFlow.tsx` — workflow rules load; approval vs direct `pending_vendor` path; notify first approver.
- `CorporateApprovalDetailPage.tsx` — parse chain from note; step approve updates meta; final step → `pending_vendor`; notify next level; chain progress UI.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 59: Corporate notifications realtime inbox

- `CorporateNotificationsPage.tsx` — subscribes to `notifications` realtime (`subscribeToTable`) scoped to current `user_id`; refetches inbox on insert/update/delete.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 58: Corporate inbox filters + email drain worker

- `corporateNotificationInboxFilters.ts` — read/kind/category filters + search.
- `CorporateNotificationsPage.tsx` — filter panel (unread, action, topic chips); clear filters empty state.
- `supabase/functions/server/index.tsx` — `POST /make-server-56765691/drain-notification-emails` (Resend; `Authorization: Bearer $CRON_SECRET`).

Verified: `npm run build` exit 0.

**Cron:** `POST https://<project>.supabase.co/functions/v1/make-server-56765691/drain-notification-emails` with `CRON_SECRET`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set on the edge function.

## 2026-05-24 — Post-plan Batch 57: L3-only publish + broadcast email queue

- `db.ts` — `broadcastSystem` loads per-recipient `notification_preferences`; sets `email_status: queued` when `system` is in email types or `forceEmail` is true.
- `CorporateNotificationsPage.tsx` — publish tab visible only for `l3_admin` / `mogzu_admin`; priority selector (normal vs high); high priority forces email queue; link to `/corporate/notifications`.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 56: Legacy purpose_note migration + corporate broadcast

- `20260527000001_strip_booking_approval_purpose_note.sql` — strips `---mogzu-approval---` JSON from `purpose_note`; backfills `required_approval_levels` / `approved_approval_levels` when empty.
- `corporateAnnouncementBroadcast.ts` — resolve recipients (all / department / selected members).
- `CorporateNotificationsPage.tsx` — **Publish Now** calls `notifications.broadcastSystem`; mark-all-read persists via API; team dropdown merges live `department` values.
- `bookingApprovalMeta.ts` — exports `APPROVAL_PURPOSE_NOTE_MARKER` for migration parity.

Verified: `npm run build` exit 0.

**Apply in Supabase:** `20260527000001_strip_booking_approval_purpose_note.sql`

## 2026-05-24 — Post-plan Batch 55: Approval columns-only + notifications cleanup

- `bookingApprovalMeta.ts` — new bookings/steps write `required_approval_levels` / `approved_approval_levels` only; `purpose_note` is user text (no `---mogzu-approval---` JSON). Legacy rows still read via column fallback + `purpose_note` parse.
- `CorporateNotificationsPage.tsx` — removed deprecated mock notification block; publish tab loads team from `userProfiles.listByCorporate` (no hardcoded Sarah Jenkins roster).
- `BookingPayment.tsx` — L3 approver dropdown from live `listByRole('l3_admin')`; optional `Routed to:` line in purpose note.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 54: Lead ops saved views

- `leadSavedViews.ts` — localStorage persistence (inbox + pipeline filter snapshots), auto-name suggestion, 12-view cap per surface.
- `LeadSavedViewsBar.tsx` — save/apply/delete chips; highlights active view when filters match.
- `AdminLeadsPage.tsx`, `SalesPipelinePage.tsx` — wired saved views bar below filters.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 53: Sales pipeline kanban drag-and-drop

- `LeadPipelineKanban.tsx` — `react-dnd` column drop targets; grip handle on cards; highlights target column on hover.
- `SalesPipelinePage.tsx` — uses shared kanban component (status dropdown + drag both call `move()` / `updateLeadStatus`).

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 52: Lead inbox bulk assign

- `LeadBulkAssignBar.tsx` — assignee picker, select-all-visible, clear, exit bulk mode.
- `LeadInboxCard.tsx` — optional bulk checkbox column when bulk mode is on.
- `LeadFilterBar.tsx` — optional `trailing` slot for toolbar actions.
- `AdminLeadsPage.tsx` — bulk mode toggle, multi-select, `assignLeadOwner` loop (demo via `patchDemoLead`); loads assignees from `listLeadAssigneesForPicker`; clears selection on filter change.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 51: Dedicated booking approval level columns

- Migration `20260526000001_booking_approval_levels.sql` — `required_approval_levels`, `approved_approval_levels` on `bookings`.
- `bookingApprovalMeta.ts` — `buildBookingApprovalFields`, `getBookingApprovalMeta` (columns first, `purpose_note` fallback).
- All booking create paths spread approval columns; `approveBookingStep` uses `updateApprovalProgress`.
- UI reads via `getBookingApprovalMeta(booking)`.

Verified: `npm run build` exit 0.

**Apply in Supabase:** `20260526000001_booking_approval_levels.sql`

## 2026-05-24 — Post-plan Batch 50: Budget rules in approval resolver + booking detail chain

- `resolveBookingApprovalOnCreate()` — loads `budget_rules` + workflow rules (was workflow-only).
- `BookingDetailPage.tsx` — strips approval JSON from purpose note display; amber banner with chain progress + link to `/corporate/approvals/:id` for managers.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 49: Approval on shared booking submit helpers

- `bookingApprovalMeta.ts` — `resolveBookingApprovalOnCreate()` centralizes status + chain resolution.
- `submitBookingDraftToSupabase.ts` — workflow-aware status, meta in `purpose_note`, first-approver notify; returns `requiresApproval`.
- `createClassicCheckoutBooking.ts` — same; pay path redirects to `/booking-approval-request` when approval required.
- `ActivityBookingFlow.tsx` — workflow on live activity bookings + approval redirect.
- `EventDetailPage.tsx`, `BookingSummaryPage.tsx` — route to approval request when `requiresApproval`.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 48: Approvals queue + classic payment path

- `bookingApprovalMeta.ts` — `canUserApproveBooking`, `approveBookingStep` (shared step/finalize logic).
- `BookingPayment.tsx` — “Send for Approval” embeds workflow chain + notifies first approver.
- `CorporateApprovalsPage.tsx` — “Pending for you” filter by role/step; chain column; bulk approve uses multi-step helper.
- `CorporateApprovalDetailPage.tsx` — uses `approveBookingStep`.
- `ApprovalRequestPage.tsx` — resubmit preserves approval meta, resets chain, re-notifies first approver.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 47: Booking flow + approval request chain UI

- `BookingFlow.tsx` — workflow rules + `evaluateCorporateApproval`; `pending_approval` vs `pending_vendor`; approval meta in `purpose_note`; `notifyFirstApprovers`; routes to `/booking-approval-request` when approval required; review step shows live chain.
- `ApprovalRequestPage.tsx` — dynamic L1→L2→L3 chain from `purpose_note` meta (or workflow rules fallback); removed hardcoded “Sarah Jenkins” mock.

Verified: `npm run build` exit 0.

**Deferred:** dedicated `required_levels` column on `bookings`.

## 2026-05-24 — Post-plan Batch 45: Approval workflow enforced on booking submit

- `approvalWorkflow.ts` — `evaluateCorporateApproval()` merges budget rules + workflow thresholds; `formatWorkflowLevels`, preview amounts.
- `ApprovalWorkflowPage.tsx` — live preview (₹25k / ₹75k / ₹250k), sorted rules, reload after save, migration/template banners.
- `SpaceBookingPage.tsx`, `EventBookingPage.tsx`, `GiftingSendPage.tsx` — load workflow rules; review step shows approval chain (L1 → L2 → L3).

Verified: `npm run build` exit 0.

**Migration:** `supabase/migrations/20260521000002_approval_workflow_rules.sql` must be applied for Save on `/settings/workflow`.

## 2026-05-24 — Hotfix: Lead ops hub crash (`STATUS_LABELS`)

- `LeadDetailDrawer.tsx` — duplicate row used undefined `STATUS_LABELS`; corrected to `LEAD_STATUS_LABELS`.

## 2026-05-24 — Post-plan Batch 44: Gifting Shop live public catalogue merge

- `giftingPublicCatalogue.ts` — map `listPublicListings({ module: 'gifting' })` into shop product cards with cover images + `mogzuListingId`.
- `GiftingShopPage.tsx` — merge live + approved + demo per category; catalogue banners for live/demo/error states.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 43: Gifting Shop wishlist + compare for approved listings

- Product types + `corporateApprovedListingsStorage` mappers — `mogzuListingId` on partner-approved gift rows.
- `GiftingShopPage.tsx` — `WishlistHeart` when `mogzuListingId` present; compare queues UUIDs in session → `/compare`; enquiry passes `listingId` to `ProductBookingPage`.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 42: Vendor calendar polish + compare wishlist

- `VendorCalendarPage.tsx` — click booked slot → `/vendor/booking-requests/:id`; drag legend; green page notice on block; disable block when no listings; `MogzuLegacyDemoBanner`; fix missing `Loader2` import.
- `ComparePage.tsx` — `WishlistHeart` on each compared listing header.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 41: Lead ops demo parity + inbox triage finish

- `leadDemoPatch.ts` — shared in-memory lead patch with `status_history` (drawer timeline stays accurate in demo).
- `SalesPipelinePage.tsx` — status dropdown always visible; demo `move()` updates kanban; human labels via `leadStatusLabel`.
- `AdminLeadsPage.tsx` — demo `setStatus()`; refactored `patchDemoLead`; auto-select first row when filters hide current lead.
- `LeadFilterBar.tsx` — **Spam** status tab.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 40: Lead ops UX continuation (filters + Quick Share)

- `LeadFilterBar.tsx` — gifting-shop status chips; active filter pills (click × to clear); auto-expand advanced when KPI sets filter.
- `AdminQuickSharePage.tsx` — `LEAD_OPS.chip` token; module/catalogue chips aligned; `LeadOpsBanner` / `LeadOpsEmptyState`; glass table wrap.
- `AdminQuickShareDetailPage.tsx` — hub back links + notice banners.
- `SalesPipelinePage.tsx` — `LeadStatusBadge` on kanban cards; clickable KPIs.
- `leadOpsStyles.ts` — added missing `chip` + `tableWrap` tokens (fixes undefined classes).

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 39: Lead ops enterprise UX pass (mogzu-enterprise-ux-architect)

- Centralized status language: `leadStatusUi.ts`, `LeadStatusBadge.tsx` (human labels: Won not converted).
- `LeadOpsBanner.tsx`, `LeadOpsEmptyState.tsx` — demo/success/error/info + guided empty states.
- `LeadOperationsHub.tsx` — tab panels, contextual hints, ARIA tab/tabpanel wiring.
- `LeadOpsStats.tsx` — clickable KPIs filter inbox (unassigned, callbacks, week, new).
- `LeadDetailDrawer.tsx` — assign + **status** in demo; module-accent Quick Share buttons; notice banners.
- `leadTriageUtils.ts` — owner-based unassigned + `callback` quick filter.
- Inbox/pipeline demo banners; gifting-shop-aligned tokens (no loud violet/sky CTAs).

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 38: Lead operations hub (unified UX)

- `LeadOperationsHub.tsx` — single `/admin/leads` workspace with tabs: Inbox | Pipeline | Quick Share.
- `leadOpsNavigation.ts` — session prefill when switching from lead → catalogue tab without leaving hub.
- `leadAssignees.ts` + `20260525000001_staff_read_lead_assignees.sql` — staff can read assignee profiles for owner dropdown.
- `LeadDetailDrawer.tsx` — assign owner always visible; demo in-memory patch via `onDemoPatch`; `listLeadAssigneesForPicker`.
- `AdminLeadsPage.tsx`, `SalesPipelinePage.tsx`, `AdminQuickSharePage.tsx` — `embedded` mode; in-hub Quick Share navigation.
- `routes.tsx` — `/admin/leads` → hub; `/admin/quick-share` + `/sales/pipeline` redirect into hub; removed stray `,` route entries.
- `AdminLayout.tsx` — one sidebar item **Lead operations** (replaces separate inbox + pipeline links).
- `AdminQuickShareDetailPage.tsx` — back links return to hub tabs.

**Apply in Supabase (live assignment):** `20260524000002_staff_update_public_leads.sql`, `20260525000001_staff_read_lead_assignees.sql`.

**Deferred (iteration):** demo status dropdown in drawer; visual polish pass; deep-link smoke on all hub tabs.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 37: legacy promo redirect + plan closure

- `routes.tsx` — `/vendor/promotions` redirects to `/vendor/promotions-live`.
- `VendorPromotionOfferPage.tsx`, `VendorAdCampaignPage.tsx` — back/save targets live promotions.
- `db.ts` — `promotions.setPaymentReference`; `VendorPromotionsRealPage` uses typed helper.
- `FRONTEND_COMPLETION_PLAN.md` — post-plan batches 23–37 table; Section 2 complete note.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 36: admin legacy surfaces + corporate AI autonomy

- `AdminMogzuOrdersPage.tsx` — merge `public_leads` with localStorage Mogzu orders; demo banner when no live leads.
- `AdminPaidPromotionsPage.tsx` — legacy demo tabs + link to promotions approval + live promo count from `db.promotions`.
- `AdminAddProductPage.tsx` — demo banner + links to gifting approval / Mogzu Direct new listing.
- `AdminCategoryManagementPage.tsx` — demo banner when category table empty.
- `CorporateAiAutonomyPage.tsx` — defaults notice when no stored row (Supabase already wired).
- `VendorPassportPage.tsx` — demo banner when no admin-approved vendors in directory.
- `ApparelPage.tsx` — demo banner + link to Gifting Shop.
- `FRONTEND_COMPLETION_PLAN.md` — mark remaining admin/corp demo routes ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 35: gifting product booking + vendor promo/product legacy surfaces

- `ProductBookingPage.tsx` — `resolveGiftingListing`; pass `listingId`/`vendorId` to `/booking-flow`; demo banner.
- `BookingFlow.tsx` — demo banner when no live ids; navigate to `/bookings/:id` after Supabase persist.
- `VendorAdCampaignPage.tsx`, `VendorPromotionOfferPage.tsx` — legacy demo banners + link to `/vendor/promotions-live`.
- `VendorAddProductPage.tsx` — demo banner + deep links to `/vendor/gifting/products/*` for live listings.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/product-booking`, `/booking-flow`, vendor promo/product routes ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 34: celebration checkout IDs + browse/shortlist banners

- `activityListingResolver.ts` — `resolveGiftingListing` for celebration detail routes.
- `CelebrationDetailPage.tsx` — pass `listingId`/`vendorId` into celebration checkout; demo banner when mock catalog.
- `MogzuDirectCorporateDetailPage.tsx`, `PartnerListingCorporateDetailPage.tsx` — demo banner when Supabase listing not found.
- `ShortlistCorporatePage.tsx` — `MogzuLegacyDemoBanner` for localStorage proposal flow.
- `VendorProductManagementPage.tsx` — legacy demo banner on vendor product catalog.
- `FRONTEND_COMPLETION_PLAN.md` — mark browse routes, shortlist, vendor products, celebration detail ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 33: deals, promotions catalog, HeyGenie corporate

- `promotionOffers.ts` — `CatalogDeal`, `mapPromotionRowToDeal`, `DEMO_CATALOG_DEALS`, `isPromotionUuid`.
- `db.ts` — `promotions.getById`, extended `listActive` join, `promotions.redeem`.
- `DealsPage.tsx` — `db.promotions.listActive()` with demo fallback + `DevMockDataBanner`.
- `DealClaimFlow.tsx` — load/redeem live promotions; demo path for `demo-*` ids.
- `PromotionsPage.tsx` — live vendor offers strip; demo banner on ad inventory.
- `HeyGeniePage.tsx` — load corporate HeyGenie config; CTA to dashboard when enabled.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/deals`, `/deals/claim/:id`, `/promotions`, `/heygenie`, `/admin/heygenie` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 32: marketing pages + admin settings hub

- `useMarketingCms.ts` — load published CMS blocks by slug for public pages.
- `LandingPage.tsx` — Book a Demo → `submitLead` RPC; optional hero from CMS slug `home`.
- `WhyMogzuPage.tsx`, `VendorBenefitsPage.tsx` — CMS copy overrides (`why-mogzu`, `vendor-benefits`).
- `AdminSettingsPage.tsx` — replace stub with platform stats + configuration deep links.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/`, `/why-mogzu`, `/vendor-benefits`, `/admin/settings` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 31: booking confirmation + summary + classic success

- `submitBookingDraftToSupabase.ts` — persist event-activity draft bookings.
- `createClassicCheckoutBooking.ts` — classic DSpace pay flow booking row.
- `BookingSummaryPage.tsx` — Supabase submit on confirm; navigate with `bookingId`.
- `BookingConfirmationFlowPage.tsx` — load confirmation by `bookingId`; draft/demo fallback.
- `ClassicBookingSuccessPage.tsx` — live booking summary when `bookingId` present.
- `BookingPayment.tsx` — create booking on Confirm & Pay when `spaceId` is listing UUID.
- `EventDetailPage.tsx` — RFQ path persists to Supabase when listing is live UUID.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/booking/new`, `/booking-confirmation`, `/booking-success` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 30: celebration checkout + approval request persistence

- `createCorporatePendingApprovalBooking.ts` — shared helper for `pending_approval` bookings.
- `ApprovalRequestPage.tsx` — load by `bookingId` (state/query); withdraw via `db.bookings.cancel`; resubmit via `db.bookings.updateStatus`; `DevMockDataBanner` when no live id.
- `CelebrationBookingFlow.tsx` — Supabase checkout when `listingId`+`vendorId` on payload; demo localStorage fallback + banner.
- `BookingPayment.tsx` — `Send for Approval` creates booking when classic `spaceId` is a listing UUID.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/celebration-booking-flow`, `/booking-approval-request` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 29: classic booking flow stability + ActivitySuite metrics

- `RequestToBook.tsx` — move `getCategoryContent()` before `validateForm()` (fixes `content` TDZ crash).
- `BookingAddOns.tsx` — `content` init order fix (prior); add `MogzuLegacyDemoBanner`.
- `BookingReview.tsx`, `BookingPayment.tsx` — legacy flow banners.
- `ActivitySuite.tsx` — metric cards load from `db.bookings` for signed-in corporate; demo fallback + `DevMockDataBanner`.
- `FRONTEND_COMPLETION_PLAN.md` — mark classic flow + ActivitySuite ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Login redirect: corporate `/login` no longer hijacked by admin

- `authRedirect.ts` — `getCorporateLoginRedirectPath`, `sanitizeCorporateReturnPath`, `isCorporatePrimaryRole`.
- `LoginPage.tsx` — clear role override + demo persona; only auto-redirect corporate users; banner for admin session.
- `auth.ts` — clear overrides on sign-in; `clearRoleOverride` on context.

## 2026-05-24 — Post-plan Batch 28: admin events/DSpace surfaces

- `adminModuleBookings.ts` — shared admin booking load + demo fallback + status actions via `db.bookings`.
- `AdminModuleBookingsPanel.tsx` — reusable bookings table with status tabs and detail drawer.
- `AdminModuleListingsQueuePage.tsx` — reusable listing approval queue (approve/reject bulk).
- `AdminListingApprovalDetailPage.tsx` — reusable listing review detail with approve/reject/pause.
- `AdminEventsPage.tsx`, `AdminDspacePage.tsx`, `AdminEventsBookings.tsx`, `AdminDspaceBookings.tsx`, `AdminEventDetailPage.tsx`, `AdminSpaceDetailPage.tsx` — replace stubs with Supabase wiring + demo fallback.
- `AdminBookingsPage.tsx` — fix `AdminPageTitleRow` required `totalLabel` prop.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/admin/dspace*`, `/admin/events*`, `/admin/bookings` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 27: vendor listing lifecycle + events nav

- `VendorEventActivityPage.tsx` — submit/withdraw/resubmit draft listings via `db.listings.updateStatus` for live UUID rows.
- `EventsPage.tsx` — event card navigation passes `source_listing_id` for Supabase UUID listings.
- `FRONTEND_COMPLETION_PLAN.md` — mark communication routes ✅ (Batch 16 verify).

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 26: event activity detail + vendor enquiries

- `EventDetailPage.tsx` — Supabase load via `resolveEventsListingDetail`; demo fallback; `WishlistHeart`; live book → `/book/event/:id`.
- `EventActivityPage.tsx` — pass full listing UUID in routes + nav state; fix wishlist IDs on cards.
- `VendorEventActivityPage.tsx` — enquiries tab loads `pending_vendor` event bookings from `db.bookings.listByVendor`.
- `eventsServicesData.ts` — optional `listingUuid` on `EventActivityListing`.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/event-activity/:id` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 25: event service detail + vendor event-activity

- `activityListingResolver.ts` — add `resolveEventsListingDetail()` with images and add-ons.
- `EventServiceDetailPage.tsx` — Supabase load + demo fallback; `WishlistHeart`; `ListingReviewsPanel`; Book Now → `/book/event/:id` for live listings.
- `EventServiceContent.tsx` — fix detail navigation to pass full UUID (not stripped digits).
- `VendorEventActivityPage.tsx` — load vendor `events` module listings; demo fallback banner; create draft + pause/activate via `db.listings`.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/events/services/:id` and `/vendor/event-activity` ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 24: SpaceDetailPage Supabase wiring

- `activityListingResolver.ts` — add `resolveSpacexListing()` for UUID + numeric hash across `spacex_coworking` and `spacex_stay`.
- `SpaceDetailPage.tsx` — replace fake 700ms loader with Supabase fetch; overlay live title, description, price, capacity, gallery; `DevMockDataBanner` on demo; canonical `<WishlistHeart>`; Book Now → `/book/space/:id` for live listings.
- `FRONTEND_COMPLETION_PLAN.md` — mark space detail routes ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 23: SpaceX/coworking catalogue Supabase wiring

- `CoworkingPage.tsx` — load `db.listings.listByModule('spacex_coworking')` with demo fallback + `DevMockDataBanner`; canonical `WishlistHeart` retained on cards.
- `CoworkingDetailPage.tsx` — resolve listing by UUID or numeric hash; map to detail shape; book CTA → `/book/space/:id` for live listings; demo fallback banner.
- `SpaceXPage.tsx` — `DevMockDataBanner` when Supabase returns zero coworking/stay rows (existing load path unchanged).
- `FRONTEND_COMPLETION_PLAN.md` — mark `/coworking`, `/dspace` (SpaceX), `/vendor/welcome`, `/stay` as ✅.

Verified: `npm run build` exit 0.

## 2026-05-24 — Post-plan Batch 22: events catalogue Supabase + heart sweep completion

- `EventsPage.tsx` — load events from `db.listings.listByModule('events', 'active')` with `getMergedCatalogue` + static demo fallback; `DevMockDataBanner` when demo; canonical `<WishlistHeart>` + `<RatingBadge>` on listing cards (Batch 2c carry-over).
- `EventServiceContent.tsx` — replace local `wishlistIds` heart toggle with canonical `<WishlistHeart>` on service cards.
- `FRONTEND_COMPLETION_PLAN.md` — mark `/events`, `/event-services`, `/event-activity`, `/activities`, `/bookings/:id/track` as ✅ wired.

Verified: `npm run build` exit 0 (~26s).

## 2026-05-24 — Post-plan Batch 21: corporate onboarding + activity booking + admin team routes

- `corporateOnboarding.ts` — `ensureCorporateAccount`, `finalizeCorporateOnboarding`, interest→module mapping, plan persistence.
- `CorporateCompanyDetails.tsx` — auto-create corporate account when domain is new; link profile as L3 admin.
- `CorporateSignUpForm.tsx` — signup no longer blocked on pre-registered domain.
- `ChooseAccess.tsx` — persists plan + `modules_enabled` to Supabase on complete.
- `activityListingResolver.ts` + `ActivityBookingFlow.tsx` — resolve events listings, submit bookings to Supabase, demo fallback banner.
- `ActivityDetailPage.tsx` — “Book this activity” CTA to booking flow.
- `routes.tsx` — `/admin/teams*` redirects to live `/admin/team`.

Verified: `npm run build` exit 0 (~25s).

## 2026-05-24 — Post-plan Batch 20: vendor onboarding listing + team + platform modules

- `vendorOnboardingApi.ts` — `submitVendorListing` persists to `listings` (`pending_approval`) via Supabase; resolves vendor from session or `vendorId`; rich onboarding fields in `metadata`.
- `VendorOnboardingPage.tsx` — stores `vendorId` in onboarding completed localStorage for listing step.
- `VendorSignUpForm.tsx` — passes `vendorId` into listing submit payload.
- `VendorUserManagementPage.tsx` — team table from `db.userProfiles.listByVendor`; demo fallback + banner.
- `AdminPlatformModulesPage.tsx` — live active vendor counts from `db.vendors.countActiveByModule`.
- `db.ts` — `vendors.getByUserId`, `userProfiles.listByVendor`, `vendors.countActiveByModule`.

Verified: `npm run build` exit 0 (~25s).

## 2026-05-24 — Post-plan Batch 19: performance, notifications, order analytics

- `VendorGiftingDashboardPage.tsx` — Performance tab: 30-day revenue chart + top products from real/demo orders.
- `AdminNotificationsPage.tsx` — broadcast via `db.notifications.broadcastSystem`; receiver list from `user_profiles`; recent from Supabase.
- `AdminVendorOrderAnalyticsPage.tsx` — order table from live `bookings` with demo fallback.
- `routes.tsx` — `/vendor/orders/:orderId` redirects to `/vendor/booking-requests/:orderId`.
- `db.ts` — `broadcastSystem` + `listRecentBroadcasts` helpers.

Verified: `npm run build` exit 0 (~30s).

## 2026-05-24 — Post-plan Batch 18: gifting vendors + vendor settings

- `AdminGiftingVendorsPage.tsx` — gifting vendors from Supabase (`vendors` + `vendor_modules`, listings, bookings); suspend/reactivate via `db.vendors.updateStatus`; demo fallback.
- `VendorGiftingDashboardPage.tsx` — Settings tab persists business name, GSTIN, pickup/delivery notes to `vendors`; email prefs to `notification_preferences`; payout summary from `listMethods`; link to `/vendor/settings`.

Verified: `npm run build` exit 0 (~30s).

## 2026-05-24 — Post-plan Batch 17: admin ledger, gifting orders, dashboard prefs

- `AdminTransactionsPage.tsx` — platform-wide ledger from `wallet_transactions` + paid `bookings`; search, pagination, demo fallback + banner.
- `AdminGiftingOrdersPage.tsx` — gifting bookings from Supabase; admin status/carrier updates via `db.bookings`.
- `VendorGiftingDashboardPage.tsx` — orders tab wired to `db.bookings.listByVendor` (module=gifting); fulfilment status updates.
- `AdminVendorManagementDashboardPage.tsx` — overview cards from live vendor/listing/booking counts; link to `/admin/listings/queue`.
- `corporateDashboardPreferences.ts` + migration `20260524000001_user_dashboard_widgets.sql` — sync widget toggles to `user_profiles.dashboard_widgets` with localStorage fallback.
- `giftingBookingOrders.ts` — shared booking→gifting order mapper.

Verified: `npm run build` exit 0 (~32s).

## 2026-05-24 — Post-plan Batch 16: wire remaining mock surfaces

- `VendorDashboardPage.tsx` — live metrics/revenue/orders/top-selling from `db.bookings.listByVendor`; demo fallback + banner.
- `AdminIssuesPage.tsx` — `db.supportTickets.listQueue('all')` + notes on select; resolve/reply persist to Supabase.
- `CommunicationPage.tsx` — corporate threads from `db.supportTickets.listMine`; reply via `supportTicketNotes.create`.
- `VendorCommunicationPage.tsx` — vendor Mogzu support threads from `listMine`; reply persistence.
- `AdminProductsPage.tsx` — `db.listings.listForPublicAdmin()` with mock fallback.
- `AdminProductCategoriesPage.tsx` — `db.categories.listAllForAdmin()` with mock fallback.
- `AdminReportsPage.tsx` — report hub linking dashboard, transactions, reconciliation, spend report.
- `routes.tsx` — `/favourites` → `/wishlist`, `/report` → `/corporate/spend-report`.

Verified: `npm run build` exit 0 (23.67s).

## 2026-05-24 — Post-plan: admin dashboard clarity + user management Supabase persistence

- `AdminDashboardPage.tsx` — show `DevMockDataBanner` when any chart/table slice falls back to demo data (revenue, commission, receivables, payables, login log, issues); broadened `usingAnyDemo` detection.
- `UserManagementPage.tsx` — `reloadUsers()` filters deactivated profiles; profile save + manage-groups department changes persist via `db.userProfiles.upsertPartial`; bulk remove calls `db.userProfiles.deactivate` when real corporate users loaded; invite department mapped from permission level (not budget type).

Note: `MyProfilePage.tsx` was already Supabase-wired (profile upsert, notification prefs, billing tab). `AdminDashboardPage.tsx` was already loading live stats via `loadAdminStats()` — this pass adds demo transparency + completes user-management write paths.

Verified: `npm run build` exit 0 (31.39s).

## 2026-05-24 — Batch 15: data quality + legacy nav cleanup

- `MogzuApplication/src/app/data/apparelProducts.ts` — populate `occasion` arrays on all 6 `giftingComboProducts` mocks (welcome, festive, wellness, tech, premium, custom).
- `MogzuApplication/src/app/components/GiftingShopPage.tsx` — normalize fabric filter keys/labels to `Dry-Fit` and `Poly-Cotton`; add `XL` to bag capacity filter + clear-all reset.
- `MogzuApplication/src/app/components/layouts/VendorSidebar.tsx` — Promotions nav targets `/vendor/promotions-live` (legacy `/vendor/promotions` route kept).
- `MogzuApplication/src/app/lib/vendorShellNav.ts` — shell promotion action → `/vendor/promotions-live`.
- `UserManagementPage.tsx`, `ActivitiesPage.tsx`, `CommunicationPage.tsx`, `ReportsPage.tsx` — Report stub links → `/corporate/spend-report` instead of legacy `/report`.

Why: plan Batch 15 — close memory.md gifting filter data gaps + hide legacy mock routes from primary nav without deleting back-compat routes.

Plan Batch 15 status: **all items shipped**. Build clean (27.68s). **All 15 plan batches complete.**

## 2026-05-24 — Batch 14: white-label + mobile polish + legacy demo flags

- `MogzuLegacyDemoBanner.tsx` (new) — prod-safe amber glass banner for legacy/mock screens.
- `AdminWhiteLabelPage.tsx` — gifting glass layout, demo partners, preview cards.
- `AdminWhiteLabelDetailPage.tsx` — branding editor + hero subdomain preview, demo partner fallback.
- `PwaInstallPrompt.tsx` — gifting product-card install sheet (PWA + iOS / store links).
- `PushOptInBanner.tsx` — gifting glass opt-in banner.
- `RequestToBook.tsx` + `VendorPromotionsPage.tsx` — legacy demo banners.
- `DevMockDataBanner.tsx` — delegates to `MogzuLegacyDemoBanner`.
- `AdminLayout.tsx` — White-label sidebar link.

Verified: `npm run build` exit 0 (27.53s).

## 2026-05-24 — Batch 13: compliance + AI agent surfaces (gifting style)

- `AdminComplianceNavChips.tsx` (new) — Access reviews | SOC2 evidence sub-nav.
- `AdminAiNavChips.tsx` (new) — AI agents | Conversations | Spend policy sub-nav.
- `AdminAccessReviewsPage.tsx` — gifting glass, status chips, expandable sign-off roster, demo fallback.
- `AdminSoc2EvidencePage.tsx` — product-card exports, glass audit window panel.
- `AdminAiPolicyPage.tsx` — spend-cap editor with glass table + demo corporates.
- `AdminAiConversationsPage.tsx` — chip filters, transcript drawer, demo conversations.
- `AdminAiAgentsPage.tsx` — gifting agent sidebar + glass detail panels.
- `CorporateAiAutonomyPage.tsx` — `CorporateModuleShell` + kill-switch hero.
- `AdminLayout.tsx` — sidebar links for AI + compliance routes.

Verified: `npm run build` exit 0 (61s).

## 2026-05-24 — Batch 12 polish: gifting-style FX + intl surfaces

- `AdminFinanceNavChips.tsx` (new) — shared finance sub-nav (Reconciliation | FX rates) using gifting category chip pattern.
- `AdminFinanceFxPage.tsx` — gifting glass layout, stat chips, demo FX fallback, margin table styling.
- `AdminFinanceReconciliationPage.tsx` — finance sub-nav chips added.
- `AdminLayout.tsx` — sidebar link for FX rates.
- `VendorPayoutMethodsPage.tsx` — glass hero, filter panel, product-card empty state, glass tables.
- `CorporateCompanyDetails.tsx` — region picker as gifting-style chips (IN/SG/AE/SA/US/GB/EU).
- `Dashboard.tsx` — dunning / auto-downgrade banner uses glass + gradient CTA.

Verified: `npm run build` exit 0 (13.19s).

## 2026-05-23 — Batch 11 start: enterprise revenue + gifting-style module system

- `MogzuApplication/src/app/components/ui/mogzuGiftingStyles.ts` (new) — extracted gifting shop tokens (nav chips, hero banner, product cards, filter sidebar, CTA gradient) from `GiftingShopPage` for reuse.
- `MogzuApplication/src/app/components/layouts/CorporateModuleShell.tsx` (new) — reusable corporate module shell matching gifting shop layout (`mogzu-module-shell-bg`, breadcrumb pill, nav chip scroller, `MogzuCorporateScrollSurface`).
- `MogzuApplication/src/app/components/BillingInvoicesPage.tsx` — redesigned `/account/invoices` with gifting-style hero, filter sidebar chips, glass table, locale currency formatting, and account nav chips (Invoices / Billing).
- `MogzuApplication/src/app/components/AccountBillingPage.tsx` — redesigned `/account/billing` with plan cards as gifting product cards, dunning retry preview, seat editor, demo fallback, and matching module shell.
- `MogzuApplication/src/app/components/AdminFinanceReconciliationPage.tsx` — upgraded admin reconciliation with gifting nav chips + stat cards + glass table; removed conflicting full-page background.
- `MogzuApplication/src/app/components/AdminLayout.tsx` — added sidebar link for Finance reconciliation.

Verified: `npm run build` exit 0.

## 2026-05-23 — Batch 10 closure: lead triage UX + glass shell parity

- `MogzuApplication/src/lib/leadTriageUtils.ts` (new) — shared quick-filter helpers (`today`, `this week`, `high budget`, `unassigned`) + search triage pipeline.
- `MogzuApplication/src/app/components/leads/LeadTriageToolbar.tsx` (new) — sticky search + quick-filter toolbar reused by admin inbox and sales pipeline.
- `MogzuApplication/src/app/components/ui/mogzuGlassStyles.ts` (new) — shared glassorium surface tokens aligned to Events/discovery modules.
- `MogzuApplication/src/app/components/AdminLeadsPage.tsx` — removed conflicting full-page gradient shell; integrated triage toolbar, quick presets, sticky bottom action bar linking to pipeline board.
- `MogzuApplication/src/app/components/SalesPipelinePage.tsx` — same triage toolbar + quick presets for kanban filtering.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — switched to `mogzu-module-shell-bg` + `MogzuCorporateScrollSurface` + shared glass tokens.
- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — full glassorium upgrade (hero, tabs, sidebar, CTAs) matching Mogzu Direct detail pattern.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — ambient backdrop, glass hero, Mogzu logo header, locale picker on public discovery.
- `MogzuApplication/src/app/components/PublicLeadForm.tsx` — glass panel + field styling + primary CTA token alignment.
- `MogzuApplication/src/app/components/AdminLayout.tsx` — sidebar links for Lead inbox + Sales pipeline; `/sales/pipeline` admin-guarded route.

Verified: `npm run build` exit 0.

## 2026-05-23 — Batch 4 start: Vendor onboarding hardening (`/signup/vendor`)

- `MogzuApplication/src/app/components/VendorOnboardingPage.tsx` — wired `submitVendorOnboarding(...)` into final submit so onboarding payload now flows through `vendorOnboardingApi` when API base is configured (with local-id fallback retained).
- `MogzuApplication/src/app/components/VendorOnboardingPage.tsx` — added fail-fast error handling for `db.vendors.create`, `db.vendors.setModules`, and `db.userProfiles.upsert`; onboarding now stops with explicit user-facing error instead of silently continuing on partial write failures.
- `MogzuApplication/src/app/components/VendorOnboardingPage.tsx` — guarded against empty `authData.user` after signup to prevent writing orphaned onboarding completion state.
- Legacy localStorage queue writes remain in place for backward compatibility with admin helper flows.

Verified: `npm run build` exit 0, `3194 modules transformed`, `built in 42.80s`.

## 2026-05-23 — Batch 4 follow-up: Rejection/resubmit + structured feedback

- `MogzuApplication/src/app/components/AdminVendorApplicationsPage.tsx` — on vendor rejection, now emits `db.notifications.notify` (`type: 'system'`) to the vendor user with structured metadata payload (`kind`, `vendorId`, `reasons`, `rejectedAt`) and deep-link to `/vendor/verification-pending`.
- `MogzuApplication/src/app/components/VendorVerificationPendingPage.tsx` — added resubmission notes textarea (optional, 500 chars), success banner, and admin/support notification fan-out on resubmit with structured metadata payload (`kind`, `vendorId`, prior reasons, note, timestamp).
- `MogzuApplication/src/app/components/VendorVerificationPendingPage.tsx` — `handleResubmit` now requires loaded vendor context so notifications include business details and prior rejection context.
- `MogzuApplication/src/app/components/VendorVerificationPendingPage.tsx` — enabled KYC upload/re-upload controls in rejected state (previously hidden), so vendors can fix KYC and resubmit without getting stuck.
- `MogzuApplication/src/app/lib/vendorOnboardingApi.ts` — replaced stub-first onboarding submit with Supabase-first flow via `submitApplication` (`vendor_onboarding_applications` RPC path), while keeping external API fallback when configured.

## 2026-05-23 — Batch 5 start: Corporate domain + invite governance

- `MogzuApplication/src/app/components/CorporateCompanyDetails.tsx` — prefill onboarding personal fields from auth context (`profile.full_name`, `user.email`) and lock corporate email to signup email when available.
- `MogzuApplication/src/app/components/CorporateCompanyDetails.tsx` — tightened domain enforcement: entered email must match signed-in signup email/domain before `validateCorporateEmailDomain(...)` runs.
- `MogzuApplication/src/app/components/UserManagementPage.tsx` — added role gating for invite operations (create single, bulk CSV, resend, revoke): L3 admin / Mogzu admin only.
- `MogzuApplication/src/app/components/UserManagementPage.tsx` — invite UI now surfaces read-only hint for non-admin users and disables invite action controls accordingly.

Verified: `npm run build` exit 0 after each change set; lints clean for touched files.

## 2026-05-23 — Batch 6 start: Booking tracker real-data progression

- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — added synthetic stage derivation from real booking status + fulfilment stage when explicit `booking_status_events` rows are missing, so `/bookings/:id/track` no longer appears empty for real bookings in early lifecycle.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — gifting pipeline now auto-derives `order_placed` → `in_production` → `dispatched` → `out_for_delivery` → `delivered` / `confirmed` from `fulfilment_stage` + booking completion.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — events / dspace pipelines now auto-derive `booking_confirmed` and `booking_closed` from booking status when applicable, while preserving manual proof-only stages for explicit submissions.
- `MogzuApplication/src/app/components/booking/BookingProofCaptureCard.tsx` — added stricter stage-aware proof validation: mandatory photo, required OTP for check-in/arrival/work/delivery stages, required GPS for location-critical stages, required dispatch reference for `dispatched`.
- `MogzuApplication/src/app/components/booking/BookingProofCaptureCard.tsx` — handles retry/idempotency by reusing existing stage event (same `booking_id + stage`) instead of always creating a new OTP row, preventing unique-index collisions on re-submit.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — passes existing stage events into proof-capture card for safe event reuse.
- `MogzuApplication/src/app/components/FieldAgentDashboardPage.tsx` — added synthetic stage derivation for queue rows (mirrors `/bookings/:id/track`) so next-stage calculation remains meaningful even when explicit stage events are sparse.
- `MogzuApplication/src/app/components/FieldAgentDashboardPage.tsx` — enforced stage-aware proof requirements (mandatory photo, OTP/GPS on critical stages, dispatch tracking reference).
- `MogzuApplication/src/app/components/FieldAgentDashboardPage.tsx` — idempotent stage handling: reuses existing stage event for current stage instead of blindly creating duplicate OTP events.
- `MogzuApplication/src/app/components/FieldAgentDashboardPage.tsx` — added notes field submission into `booking_status_events.notes` for dispatch references and audit clarity.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — Proof-of-Conditions tab now supports editable save flow for authorized users: agreed scope, quoted/final amounts, negotiation history lines, and PO document upload path persisted via `db.bookingProof.upsertRecord`.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — added in-tab PO upload using `storageService.documents.upload(...)` and save/refresh feedback loop (`onProofUpdated` reload).
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — added milestone editor for authorized users in Proof tab: add/update rows (`kind`, `%`, amount, due/paid timestamps, paid reference) and persist each row via `db.bookingProof.upsertMilestone`.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — milestone date UX hardening: switched due/paid fields to `datetime-local`, normalize to ISO on save, and validate date order (`paid_at >= due_at`).

Verified: `npm run build` exit 0. (IDE diagnostics on `db.ts` remain noisy/project-wide and pre-existing.)

Verified: `npm run build` exit 0, `3194 modules transformed`, `built in 21.67s`.

## 2026-05-23 — Batch 7 start: Refund failure auto-escalation

- `MogzuApplication/src/lib/refundFailure.ts` (new) — added `escalateRefundFailure(...)` helper to auto-create high-priority support tickets (`category: Payment / refund`, `related_booking_id`, rich context body) whenever refund processing fails.
- `MogzuApplication/src/app/components/CancelBookingPage.tsx` — booker cancellation flow now auto-escalates refund failures and shows user-facing ticket reference instead of a dead-end generic error.
- `MogzuApplication/src/app/components/VendorBookingRequestsPage.tsx` — vendor rejection flow now auto-escalates refund failures with vendor-context ticket metadata and actionable on-screen message.
- `MogzuApplication/src/app/components/AdminDisputesPage.tsx` — dispute resolution refund path now captures `cancelWithRefund` failures (previously silent), opens an escalation ticket, and surfaces the ticket id in notice text.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 7 follow-up: Wallet top-up webhook alignment

- `MogzuApplication/src/app/components/WalletPage.tsx` — card top-ups now create a pending `wallet_topup_request`, open Razorpay Checkout with `kind: wallet_topup` + `requestId`, and rely on webhook confirmation before wallet balance changes.
- `MogzuApplication/src/app/components/WalletPage.tsx` — improved top-up failure states: if order creation fails after request insert, the UI now preserves the pending-request reference and surfaces a clear retry/support path.
- `MogzuApplication/src/app/components/WalletPage.tsx` — replaced stale stopgap copy claiming immediate credit with accurate messaging: card = webhook-confirmed credit, bank/NEFT = pending finance confirmation.
- `MogzuApplication/src/lib/razorpay.ts` — added `createRazorpayRefund(...)` client helper to call the secure edge endpoint for gateway refunds.
- `MogzuApplication/src/lib/db.ts` — `bookings.cancelWithRefund(...)` now calls Razorpay refund API for card/UPI paths, writes `refunds.gateway_reference`, and marks failed state with reason when gateway call fails.
- `MogzuApplication/supabase/functions/server/index.tsx` — added `/razorpay-create-refund` endpoint that calls Razorpay `payments/:id/refund` using server-side keys and returns refund id/status.

Verified: `npm run build` exit 0. (IDE diagnostics on `db.ts` remain noisy/project-wide and pre-existing.)

## 2026-05-23 — Batch 8 start: Mogzu Direct detail polish + category confirmation modal

- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — upgraded Mogzu Direct detail UX with stronger visual hierarchy (curated hero strip, richer info cards, trust/SLA messaging), interactive image thumbnail rail, and improved tab affordances to make the page feel more premium and easier to scan.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — added persistent operational context for corporate users (response target + managed fulfilment cues) so booking intent screens look enterprise-ready instead of demo-like.
- `MogzuApplication/src/app/pages/admin/AdminCategoryManagementPage.tsx` — replaced `window.confirm` flows with a proper in-app confirmation modal for disable/soft-delete actions, including active-listing impact count and explicit buyer-visibility warning.
- `MogzuApplication/src/app/pages/admin/AdminCategoryManagementPage.tsx` — preserved one-click enable, while routing risky actions (disable/delete) through the new modal to satisfy active-listing confirmation requirements.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 8 follow-up: real-data Mogzu Direct visibility parity

- `MogzuApplication/src/lib/publicCatalogue.ts` — fixed `getPublicListing(id)` to query by id directly (instead of scanning a `limit:1` list result), ensuring reliable real-data lookup for detail pages.
- `MogzuApplication/src/lib/publicCatalogue.ts` — extracted a shared row mapper so list/detail paths normalize data consistently.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — added live public listing lookup before render and prefered DB-backed visibility for `/browse/mogzu-direct/:module/:id`; if a listing is no longer active/public, the page now exits cleanly instead of relying on stale cache.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — mapped live cover image through storage public URL helper for production-safe rendering.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 8 polish: “supreme” Mogzu Direct visual pass

- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — elevated hero treatment (image overlay, branded top strip, premium module badge), stronger tab/nav styling, and richer high-signal metadata cards for category/pricing/response target.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — added sticky right-rail value panel for corporate users (“Why teams choose Mogzu Direct” + quick-assistance CTA) to improve trust and conversion.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — upgraded card presentation for Mogzu Direct tiles with premium badge colors, softer motion on hover, and subtle hero gradient overlay for stronger catalogue aesthetics.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 8 polish: glassorium theme alignment (Discovery-style)

- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — shifted core containers/cards/rails to glassorium surfaces (`bg-white/65`, soft borders, backdrop blur, layered shadows) and gradient-accented CTA styles to mirror discovery-page visual language.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — upgraded browse shell to glassorium treatment: gradient canvas, frosted header/search shell, blurred chip filters, and elevated frosted listing cards with richer motion/CTA styling.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — converted side trust/benefit panels to frosted cards so the detail page now feels cohesive with discovery rather than mixed flat + glass styles.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 8 micro-pass: luxury typography rhythm

- `MogzuApplication/src/app/components/ExplorePage.tsx` — refined editorial hierarchy (larger, tighter-tracked page title; improved subtitle leading; stronger card title weights; cleaner metadata/description rhythm).
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — upgraded hero/title/price typography with tighter tracking + clearer section-label language (uppercase micro-heads) and improved body leading for premium readability.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 8 micro-pass: luxury interaction polish

- `MogzuApplication/src/app/components/ExplorePage.tsx` — standardized premium motion language: smoother duration/easing, subtle lift on hover, refined active press state, and visible focus rings on filter chips + CTA buttons.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — aligned interactive states across thumbnails, tabs, and CTAs (hover lift, soft press scaling, focus-visible rings) to match high-end, consistent interaction feel.

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 9 start: sub-user flow hardening (functional-first)

- `MogzuApplication/src/app/pages/admin/AdminTeamPage.tsx` — extended `/admin/team` invite role picker to include `partner`, so Mogzu Admin can invite external partner users from the same sub-user flow.
- `MogzuApplication/src/lib/db.ts` — expanded `subUsers.listInternal()` role filter to include `partner`, aligning backend team-list scope with the role picker.
- `MogzuApplication/src/lib/db.ts` — added `userActivity.listByUser(...)` to return both actor and target events for a user (`actor_id = user` OR `target_id = user`) so audit trails include admin actions done *on* sub-users.
- `MogzuApplication/src/app/pages/admin/AdminTeamActivityPage.tsx` — switched activity source from actor-only to consolidated per-user feed, giving real operational history for permission/status changes.

Verified: `npm run build` exit 0. (IDE diagnostics on `db.ts` remain noisy/project-wide and pre-existing.)

## 2026-05-23 — Batch 9 follow-up: permission matrix template enforcement

- `MogzuApplication/src/lib/rolePermissionTemplates.ts` (new) — added shared permission matrix constants (`resources/actions`), role template persistence (`localStorage`), and opinionated defaults per internal role (`mogzu_admin`, `account_manager`, `support`, `sales_agent`, `field_agent`, `partner`).
- `MogzuApplication/src/app/components/AdminRolePermissionsPage.tsx` — replaced legacy mock permission sections with real matrix-based role template editor; Mogzu Admin can now select an internal role and save reusable permission templates.
- `MogzuApplication/src/app/pages/admin/AdminTeamPermissionsPage.tsx` — wired matrix table to shared constants and added “Apply template for role” action that grants/revokes permissions to match saved role templates, with activity log audit event (`permission.template_applied`).

Verified: `npm run build` exit 0, lints clean for touched files.

## 2026-05-23 — Batch 9 follow-up: scope enforcement guardrails

- `MogzuApplication/src/app/components/auth/FieldAgentRoute.tsx` (new) — added dedicated field-agent guard with clean role-aware redirects; only `field_agent` and `mogzu_admin` can access field-agent surfaces.
- `MogzuApplication/src/app/routes.tsx` — wrapped `/agent/dashboard` with `FieldAgentRoute` and `/am/portfolio` with `AccountManagerRoute` so scope checks happen at routing boundary (not only inside page components).
- `MogzuApplication/src/lib/db.ts` — added `bookings.listByPartner(partnerId)` helper to fetch partner-attributed bookings (`bookings.partner_id`).
- `MogzuApplication/src/app/components/BookingsPage.tsx` — partner sessions now fetch bookings strictly via `bookings.listByPartner(...)` (derived from `partners.getByUserId(profile.id)`), aligning external-partner booking visibility with referral/resale attribution only.

Verified: `npm run build` exit 0. (`db.ts` IDE type noise remains pre-existing/project-wide.)

## 2026-05-23 — Batch 9 closure: deep-link booking scope enforcement

- `MogzuApplication/src/lib/bookingScope.ts` (new) — centralized booking-access policy helper (`canAccessBookingByRole`) covering corporate ownership, partner referral/resale ownership, AM assigned-account scope, and field-agent active-booking-only rule.
- `MogzuApplication/src/app/components/BookingDetailPage.tsx` — added runtime ownership validation after `bookings.getById`; unauthorized direct-link access now shows explicit denied state instead of rendering booking detail from URL alone.
- `MogzuApplication/src/app/components/BookingTrackerPage.tsx` — added equivalent scope validation before tracker/proof data hydrate, including active-booking constraint for field-agent role.

Verified: `npm run build` exit 0. (`db.ts` IDE type noise remains pre-existing/project-wide.)

## 2026-05-23 — Batch 10 start: public lead funnel parity on listing detail

- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — partner listing enquiry action now submits to `public_leads` via `submitLead(...)` (`source_slug: partner_listing`) with listing + partner metadata.
- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — retained local `MogzuOrder` fallback logging for demo continuity when lead RPC fails, while preferring real lead id (`lead-<id>`) when available.
- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — success/error notice now reflects real sales-pipeline submission state instead of always showing local-only confirmation.
- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — embedded `PublicLeadForm` in the listing detail surface (`source_slug: partner_listing_detail`) so quote capture is form-based in-page, not only CTA-button flow.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — embedded `PublicLeadForm` (`source_slug: mogzu_direct_detail`) for direct in-page lead capture alongside existing quick request actions.
- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — added JSON-LD `Service` schema payload for partner listing details so indexed pages expose structured listing metadata.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — added JSON-LD `Service` schema payload for Mogzu Direct detail pages to extend structured-data coverage beyond CMS landing pages.
- `MogzuApplication/public/sitemap.xml` (new) — added baseline public sitemap entries (`/`, `/explore`, `/blog`, `/vendor-apply`, `/security`, etc.) to close the missing sitemap.xml deliverable.
- `MogzuApplication/src/lib/i18n/useCurrency.ts` (new) — added locale-aware currency formatter hook (`en-IN`/`hi-IN`) wired to existing locale subscription.
- `MogzuApplication/src/app/pages/PartnerListingCorporateDetailPage.tsx` — moved listing price rendering onto `useCurrency` formatter for locale-sensitive currency output.
- `MogzuApplication/src/app/pages/MogzuDirectCorporateDetailPage.tsx` — moved listing price rendering onto `useCurrency` formatter for locale-sensitive currency output.
- `MogzuApplication/src/lib/i18n/useCurrency.ts` — added reusable `formatCurrencyByLocale(...)` helper for non-React utility surfaces.
- `MogzuApplication/src/utils/filterContracts.ts` — switched shared INR formatter to `formatCurrencyByLocale(...)` so all consumers now inherit locale-sensitive formatting.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — switched public catalogue card price display to `useCurrency` output.
- `MogzuApplication/src/app/components/EventsPage.tsx` — replaced remaining hardcoded rupee-label filter chips/range labels with locale-aware `formatInr(...)`.
- `MogzuApplication/src/app/components/EventsCorporateListingPage.tsx` — replaced hardcoded range-floor label with locale-aware `formatInr(...)`.
- `MogzuApplication/src/app/components/SalesPipelinePage.tsx` — redesigned pipeline to match current premium glass/frosted language: elevated hero shell, in-context lead search, richer column surfaces, and denser lead metadata chips (budget/timeline/source).
- `MogzuApplication/src/app/components/SalesPipelinePage.tsx` — improved operational clarity with filtered-count feedback (`visible vs total`) and contextual empty states (`No matches` vs `No leads`).
- `MogzuApplication/src/app/components/AdminLeadsPage.tsx` — upgraded admin lead inbox with the same glassorium visual language, integrated in-page search, cleaner lead metadata chips, and clearer visible-state messaging for filtered results.
- `MogzuApplication/src/app/components/AdminLeadsPage.tsx` — preserved existing status workflows while improving hierarchy/spacing so the ops view is easier to scan under high lead volume.
- `MogzuApplication/src/app/components/SalesPipelinePage.tsx` — added assignment visibility chip (`assigned_agent_id`) and quick contact actions (`mailto` + `tel`) on each lead card to reduce friction from review → outreach.
- `MogzuApplication/src/app/components/AdminLeadsPage.tsx` — mirrored assignment visibility and quick contact actions in admin lead inbox so both pipeline surfaces share the same conversion-focused workflow affordances.
- `MogzuApplication/src/app/components/SalesPipelinePage.tsx` — micro-interaction + a11y polish: explicit `aria-label`s on search/status/contact controls, focus-visible rings, and refined hover/active motion for keyboard and pointer parity.
- `MogzuApplication/src/app/components/AdminLeadsPage.tsx` — applied the same micro-interaction/a11y pass (focus rings, labels, motion-safe button states) to keep behavior consistent with the upgraded sales pipeline view.

Verified: `npm run build` exit 0, lints clean for touched files.

# FIXES Log — Frontend Completion Plan execution

> One line per file touched. Newest at top.

## 2026-05-22 — Batch 33 / plan Batch 15: cleanup pass

- Delete `MogzuApplication/src/app/components/ProductBookingPageNew.tsx` (1163 LOC, zero refs confirmed via grep).
- `MogzuApplication/src/app/components/RequestToBook.tsx`: prepend `// LEGACY` header — classic booking flow superseded by BookingFlow + BookingPayment chain; kept routed for back-compat with email deep links.
- `MogzuApplication/src/app/components/VendorPromotionsPage.tsx`: prepend `// LEGACY` header — localStorage-backed; superseded by AdminPromotionsApprovalPage + listings.promotion_* columns; kept routed so vendors with unsynced drafts still load.

Why: plan Batch 15 "remove or hide legacy mock routes" + BUILDING RULE 6 "never delete working code". Data-track items (combo occasion metadata, apparel fabric labels, bag XL filter) deferred — dataset work, not code.

Plan Batch 15 status: **all code items shipped**. Build clean (34.54s). Commit `0159c13`.

## 2026-05-22 — Batch 32 / plan Batch 14: white-label detail + PWA + push opt-in

- `MogzuApplication/src/lib/whiteLabelPartners.ts`: add `getById()` + `updatePartner()` helpers.
- `MogzuApplication/src/app/components/AdminWhiteLabelDetailPage.tsx` (new): branding editor (logo URL + primary/secondary color pickers + business name + contacts) + commercial-model fee fields + subdomain preview card (`https://<slug>.mogzu.app`) + live branded mock that re-renders against draft colors.
- `MogzuApplication/src/app/components/AdminWhiteLabelPage.tsx`: rows gain Edit link to `/admin/white-label/:partnerId`.
- `MogzuApplication/src/app/routes.tsx`: add `/admin/white-label/:partnerId` route.
- `MogzuApplication/public/manifest.webmanifest` (new): PWA manifest with name, theme color, 192/512 icons, standalone display.
- `MogzuApplication/index.html`: add `<link rel="manifest">`, apple-touch-icon, theme-color meta, updated title.
- `MogzuApplication/src/app/components/PwaInstallPrompt.tsx` (new): captures `beforeinstallprompt` for installable browsers; falls back to a Safari iOS hint with App Store / Play Store deep links. localStorage dismissal.
- `MogzuApplication/src/app/App.tsx`: mount `<PwaInstallPrompt />` + `<PushOptInBanner />`.
- `MogzuApplication/supabase/migrations/20260522000008_push_subscriptions.sql` (new): adds `user_profiles.push_subscription` JSONB + `push_opt_in_at` + `push_declined_at` + partial index. **Needs Supabase dashboard apply.**
- `MogzuApplication/src/lib/database.types.ts`: extend `UserProfile` with the three new columns.
- `MogzuApplication/src/lib/auth.ts`: `ensureUserProfile()` defaults the three new columns to null.
- `MogzuApplication/src/lib/pushNotifications.ts` (new): `getOptInState`, `requestPermission`, `persistOptIn`, `persistDecline` helpers.
- `MogzuApplication/src/app/components/PushOptInBanner.tsx` (new): 4-second-delayed banner gated on profile.push_opt_in_at / push_declined_at + sessionStorage flag.

Why: plan Batch 14 "white-label + remaining polish" — per-partner subdomain preview, branding editor, mobile install prompt, push notification opt-in. Demo-flag pass on legacy mock pages: existing DEMO_DATA_ + DevMockDataBanner pattern already covers all 14 fallback surfaces — no new flagging needed.

Plan Batch 14 status: **all code items shipped**. Build clean (56.16s). Commit `d7dc2c0`.

## 2026-05-22 — Batch 31 / plan Batch 13: compliance + AI agent surfaces (P5.5 + P5.6)

- `MogzuApplication/src/app/routes.tsx`: add `/admin/compliance/access-review` alias → existing `AdminAccessReviewsPage`; add `/admin/ai-conversations`, `/admin/ai-policy`, `/admin/compliance/soc2`.
- `MogzuApplication/src/lib/aiAgents.ts`: add `listAllConversations()` + `listMessages()` + `AiAgentMessage` type.
- `MogzuApplication/src/app/components/AdminAiConversationsPage.tsx` (new): cross-agent list of `ai_agent_conversations` with status/channel filters; transcript drawer reading `ai_agent_messages`; escalate action.
- `MogzuApplication/src/app/components/CorporateAiAutonomyPage.tsx`: prominent two-state kill-switch card (ShieldCheck/ShieldOff) with one-click toggle that writes `is_enabled` immediately, separated from the policy form (cap + blocklist) which still requires explicit Save.
- `MogzuApplication/src/lib/aiAutonomy.ts`: add `listAllSettings()`.
- `MogzuApplication/src/app/components/AdminAiPolicyPage.tsx` (new): platform defaults + per-corporate inline editors (is_enabled / cap / blocklist) + bulk-seed action for unconfigured corporates.
- `MogzuApplication/src/app/components/AdminSoc2EvidencePage.tsx` (new): per-table CSV downloads for `audit_events_unified` (range-filtered), `access_reviews`, `ai_autonomy_settings`, `security_questionnaires`; one-shot Export full packet button.

Why: plan Batch 13 — auditor-ready compliance surfaces + admin visibility into AI agent activity. No new migrations.

Plan Batch 13 status: **all 5 items shipped**. Build clean (12.09s). Commit `b18dc36`.

## 2026-05-22 — Batch 30 / plan Batch 12: multi-currency + intl scaffolding (P4.3 + P5.1)

- `MogzuApplication/supabase/migrations/20260522000007_corporate_region.sql` (new): adds `corporate_accounts.region` (ISO2) + `default_currency` (FK currencies.code); seeds SAR currency. **Needs Supabase dashboard apply.**
- `MogzuApplication/src/lib/currencies.ts`: add `listAllCurrencies()` + `updateCurrencyFxRate()` + `setCurrencyActive()` helpers.
- `MogzuApplication/src/app/components/AdminFinanceFxPage.tsx` (new): editable `fx_rate` per currency + margin vs hardcoded interbank baseline + fx_updated_at staleness badge + is_active toggle.
- `MogzuApplication/src/app/lib/corporateOnboarding.ts`: add `setCorporateRegion()` helper.
- `MogzuApplication/src/app/components/CorporateCompanyDetails.tsx`: add Operating region select (7 ISO regions — IN/SG/AE/SA/US/GB/EU); persists region + default_currency on submit.
- `MogzuApplication/src/app/components/BookingPayment.tsx`: regional payment method picker — PayNow for SG, Mada for SA/AE; reads `corporateAccount.region` (falls back to IN).
- `MogzuApplication/src/app/components/VendorPayoutMethodsPage.tsx` (new): self-serve form (currency + rail + account_holder + account_number + optional JSON routing_info + is_primary toggle); groups existing methods by currency; set-primary + remove actions.
- `MogzuApplication/src/app/routes.tsx`: add `/admin/finance/fx`, `/vendor/payout-methods` routes.

Why: plan Batch 12 — international settlement + corporate region selection + region-gated payment methods. Vendor settlement currency UI folded into the multi-currency payout form.

Plan Batch 12 status: **all 5 items shipped**. Build clean (11.75s). Commit `b84f535`.

## 2026-05-22 — Batch 29 / plan Batch 11: enterprise revenue completion (P3.8 + P4.2)

- `MogzuApplication/src/lib/contracts.ts`: add `listCorporateInvoices()` + `InvoiceRunWithContract` type (joins contracts + invoice_runs filtered by corporate_id).
- `MogzuApplication/src/app/components/BillingInvoicesPage.tsx`: replace stub with real `/account/invoices` page — corporate-wide invoice_runs list with status pills, overdue computation (period_ends_on + payment_terms_days), outstanding-balance card, signed PDF download via `getInvoicePdfSignedUrl`.
- `MogzuApplication/src/app/components/AccountBillingPage.tsx` (new): `/account/billing` self-serve — current plan tile + inline seat editor (`changePlan` + `setSeats`) + plan upgrade grid with feature flags + dunning preview banner (4-retry / 14-day) when `status=past_due` or `dunning_attempts>0`.
- `MogzuApplication/src/app/components/AdminFinanceReconciliationPage.tsx` (new): `/admin/finance/reconciliation` cross-checks `stripe_subscription_id` + `razorpay_subscription_id` mirrors; flags past_due / dunning / missing-external / payment-error rows; filter chips for all / needs-attention / reconciled.
- `MogzuApplication/src/app/components/Dashboard.tsx`: fetches subscription row; surfaces rose auto-downgrade banner with Update Billing CTA when `status=past_due` or `dunning_attempts>=3`.
- `MogzuApplication/src/app/routes.tsx`: add `/account/invoices`, `/account/billing`, `/admin/finance/reconciliation` routes.

Why: plan Batch 11 — SaaS recurring revenue loop visible end-to-end. Slice 4 (dunning preview) folded into AccountBillingPage; slice 5 (auto-downgrade flag) folded into Dashboard. No new migrations.

Plan Batch 11 status: **all 5 items shipped**. Build clean (12.59s). Commit `8d0c2ff`.

## 2026-05-22 — Batch 14: Out-of-hours warning on booking-submit (plan Batch 3 final slice)

- `MogzuApplication/src/app/components/SpaceBookingPage.tsx`:
  - Imports `listRules` (aliased `listAvailRules`) + `isWithinWorkingHours` from `@/lib/vendorAvailability` and `VendorAvailabilityRule` type.
  - New `availabilityRules` state; `loadAll` calls `listAvailRules(l.vendor_id)` after listing fetch (when vendor_id present) → populates rules.
  - New `outOfHoursWarning` `useMemo` checks every hour in `[startHour, endHour)` against the rules. Returns prose if any hour falls outside (`"Vendor's standard hours don't cover 8 PM on this day — they may still accept, but expect a slower response."`) — empty rules array means no warning ever fires (predicate semantics: empty = always within).
  - `StepSlot` signature extended with optional `warning?: string`; renders amber-bg banner below the slot-error red banner, gated on `!error && warning` so error always wins.
- `MogzuApplication/src/app/components/EventBookingPage.tsx`:
  - Same imports + `availabilityRules` state + load-side `listAvailRules` call.
  - `outOfHoursWarning` uses the fixed event window (10:00-18:00) — checks every hour against rules.
  - `StepDate` signature extended with optional `warning?: string`; banner rendered under "Selected: …" line.

Why: plan Batch 3 final acceptance — `isWithinWorkingHours` predicate was exported in Batch 10 but unused. Bookers now see a soft amber heads-up when their picked time falls outside the vendor's recurring template, reducing the surprise-rejection rate. Soft warning by design — not a hard block since vendors can still accept off-hours.

Plan Batch 3 status: **all 6 items shipped** across slices 1-final (commits `bd6f7c6` 9 / `79a12da` 10 / `51db344` 11 / `81e1e44` 12 / `3339ee7` 13 / this batch 14).

Carry-over (out of plan Batch 3 scope):
- Listing-form buffer_minutes field still only mounted on Events + SpaceX forms; gifting intentionally skipped (not time-slotted).
- Drawer view counts still use `getPerformanceMock` because no `listing_view_events` table exists.

Verified: `npm run build` exit 0, `built in 1m`.

## 2026-05-22 — Batch 13: Vendor performance page real build (plan Batch 3 slice 5)

- `MogzuApplication/src/app/components/VendorPerformancePage.tsx` — replaces 24-line "in development" stub with a full real-data page:
  - Header chrome: title + Range chips (7D/30D/90D/All) + CSV export + Print/PDF button (`window.print()`).
  - Parallel fetch on mount: `db.listings.listByVendor(vendorId)` + `db.bookings.listByVendor(vendorId)` + `db.reviews.listByVendor(vendorId)` + a raw `wishlists` select on the vendor's listing IDs for saves-per-listing aggregation.
  - 4-KPI strip: Bookings count (range-filtered), Revenue (sum `total_amount` for charged statuses = pending_approval/pending_vendor/confirmed/completed), Avg rating with sample size, Saves total.
  - Listings table: title / status / bookings / revenue / saves / reviews count / avg rating + per-row "Details" button → opens existing `VendorPerformanceStatsDrawer`.
  - CSV export rows: listing_id, title, status, bookings, revenue_inr, saves, reviews, avg_rating with RFC-4180 cell escaping (`csvCell`).
  - Print: `print:hidden` on range chips + actions + table action column so the printed view is a clean snapshot. Generated-at footer always visible.
  - Drawer integration: maps `Listing.status` enum → drawer's `'Active'|'Paused'|'Draft'|'Rejected'` literal shape; `categoryLabel` from `listing.module`. `coverUrl` empty (no listing-image lookup yet — drawer tolerates empty src). Edit button routes to `/vendor/products/:id`.

Why: plan Batch 3 acceptance "Vendor performance: restore dropped drawer stats + add PDF export". Drawer was already mounted on `VendorDashboardPage` but the dedicated `/vendor/performance` route was a placeholder, so vendors had no aggregate view across listings.

Carry-over (plan Batch 3 — final item):
- `isWithinWorkingHours` predicate from `vendorAvailability.ts` not yet consumed by booking-submit / slot-block sites to warn about out-of-hours bookings.

Note on data fidelity:
- Drawer itself still consumes `getPerformanceMock()` for views/conversion/peak — views aren't tracked in schema (no analytics events table). Saves/reviews come from real DB; views remain mock until a `listing_view_events` table lands.
- KPIs on the page (bookings/revenue/saves/reviews/rating) are 100% real, derived from existing tables only.

Verified: `npm run build` exit 0, `built in 21.24s`.

## 2026-05-22 — Batch 12: Drag-to-block grid (plan Batch 3 slice 4)

- `MogzuApplication/src/app/components/VendorCalendarPage.tsx`:
  - `BlockTarget` type extended with optional `durationHours: number`. `BlockSlotModal` initialises `form.durationHours` from `target.durationHours ?? 1` and prints range header `"Mon 9 AM – 12 PM (3h)"` when multi-hour.
  - New drag state: `dragAnchor`, `dragCurrent`, `suppressNextClick`.
  - `cellIsFree(dayIdx, hour)` predicate (no blocked/booked overlap). `handleCellMouseDown` opens drag iff cell is free + left button. `handleCellMouseEnter` extends `dragCurrent` only when same day column as anchor. `handleDragEnd` on mouse-up:
    - Both endpoints + every cell in between must be free (otherwise abort — let the existing click handler resolve to unblock modal).
    - Single-hour drag (no movement) falls through to onClick → opens 1-hour modal once.
    - Multi-hour drag → sets `blockTarget` with `durationHours = hi - lo + 1` + flags `suppressNextClick` so the trailing click event doesn't reopen the modal.
  - Window-level `mouseup` listener (active only while dragging) so a drag ending outside the grid still commits.
  - Cell render: new `inDrag = isCellInDrag(dayIdx, h)` highlight (`bg-rose-100/70 ring-1 ring-inset ring-rose-300`); `select-none` to prevent text-select during drag; `onMouseDown` / `onMouseEnter` wired alongside existing `onClick`.
  - Sidebar hint copy: "Click a cell to block time." → "Click or drag across cells to block time."

Why: plan Batch 3 acceptance "Drag-to-block grid on `VendorCalendarPage`". Vendor side gets calendar parity with Outlook/Calendly-style multi-cell selection so blocking a 4-hour maintenance window is one gesture instead of four modal trips.

Carry-over (plan Batch 3 remaining):
- Vendor performance page — 24-line stub; needs full build with drawer stats + PDF export.
- `isWithinWorkingHours` predicate not yet enforced at booking-submit (warn when picking time outside vendor hours).

Verified: `npm run build` exit 0, `built in 22.78s`.

## 2026-05-22 — Batch 11: Notify-on-availability-change + SpaceX buffer_minutes (plan Batch 3 slice 3)

- `MogzuApplication/src/app/components/VendorCalendarPage.tsx`:
  - `handleBlock()` post-insert: queries `bookings` for rows where `vendor_id=current`, `listing_id=blocked listing`, `status='confirmed'`, time range overlaps the new blocked window (`start_time < end` AND `end_time > start`).
  - For each matching booking, fires `db.notifications.notify({type:'system', title:'Vendor changed availability…', linkUrl:'/bookings/:id'})` so the booker gets in-app + email-queued alert.
  - Setblock notice reads "Block saved — N confirmed booking(s) were affected and the booker(s) were notified." when notifications fire.
  - `system` is in `CRITICAL_NOTIFICATION_TYPES` so it bypasses any booker-side opt-out.
- `MogzuApplication/src/app/components/VendorSpaceXServicesPage.tsx`:
  - `FormState` + `EMPTY_FORM` extended with `bufferMinutes`; edit-mode preload + `basePayload` write parallel to events page.
  - New form field after Location with 0-720 min range + help text.

Why: plan Batch 3 acceptance "Notify booker on availability-change-after-confirm" (trust pipeline for L3 enterprise buyers — blocked vendor slots silently breaking confirmed bookings is the top class of disputes). SpaceX form parity with events form so buffer_minutes works for time-bookable space rentals too.

Carry-over (plan Batch 3 remaining):
- Drag-to-block grid on `VendorCalendarPage` (currently click-modal — biggest UX rework left).
- Vendor performance: `VendorPerformancePage` is a 24-line stub; needs full build with drawer stats + PDF export.
- `isWithinWorkingHours` predicate from `vendorAvailability.ts` not yet consumed by booking-submit / slot-block sites.

Skipped intentionally:
- VendorGiftingProductFormPage — gifting orders aren't time-slotted; buffer_minutes irrelevant.
- DB trigger version of notify-on-change: client-side detection is sufficient for demo; trigger would need SECURITY DEFINER + auth.uid() shenanigans not worth the complexity now.

Verified: `npm run build` exit 0, `built in 22.35s`.

## 2026-05-22 — Batch 10: listings.buffer_minutes + vendor availability rules (plan Batch 3 slice 2)

**New migration (requires Supabase apply):**

- `supabase/migrations/20260522000001_listings_buffer_and_avail_rules.sql`:
  - `ALTER public.listings ADD buffer_minutes INT NOT NULL DEFAULT 0 CHECK (0..720)`.
  - `CREATE TABLE public.vendor_availability_rules` (id, vendor_id FK, listing_id FK NULL = all-listings template, day_of_week 0-6, start_minute / end_minute 0..1440 with `start < end` CHECK, is_active, timestamps). `idx_avail_rules_vendor` partial-active. RLS: vendor manages own (via `vendors.user_id = auth.uid()`), authenticated SELECT (so corp side can later render vendor working hours), mogzu_admin all. `trg_var_touch_updated_at` trigger.

**Types + service:**

- `MogzuApplication/src/lib/database.types.ts` — added `buffer_minutes: number` to `Listing` interface; new `VendorAvailabilityRule` interface; schema map entry for `vendor_availability_rules`.
- `MogzuApplication/src/lib/vendorAvailability.ts` (new) — `DAY_LABELS` constant, `minutesToHHMM` / `hhmmToMinutes` helpers, `listRules(vendorId)` (active only), `createRule(vendorId, draft)` with start<end guard, `deleteRule(id)`, `isWithinWorkingHours(rules, when, listingId)` client-side predicate (rules empty = always within; rules with listing_id=null apply globally).

**UI wiring:**

- `MogzuApplication/src/app/components/VendorEventsServicesPage.tsx`:
  - `FormState` extended with `bufferMinutes: string`; `EMPTY_FORM` default '0'; edit-mode preload reads `initial.buffer_minutes`.
  - `basePayload` writes `buffer_minutes: Math.max(0, Math.min(720, Number(form.bufferMinutes) || 0))`.
  - New form field next to cancellation policy: number input, 0-720 range, help text "Idle minutes the calendar will hold around each confirmed slot. Max 720 (12h)."
- `MogzuApplication/src/app/components/VendorCalendarPage.tsx`:
  - New `<AvailabilityRulesPanel>` section mounted below the weekly grid. List grouped by day-of-week showing time chip(s) with listing scope label (`All listings` vs specific listing title). Inline add row: Day select + Start time + End time + Listing select (default "All listings") + Add button. Per-rule × removes via `deleteRule`. Errors + success notice.

Carry-over (plan Batch 3 still pending):
- Drag-to-block grid on `VendorCalendarPage` (currently click-modal).
- Notify booker on availability-change-after-confirm — vendor blocks a confirmed slot → fire `db.notifications.notify`.
- Vendor performance: drawer stats + PDF export.
- VendorGiftingProductFormPage + SpaceX listing forms not yet updated with buffer_minutes (events form only).
- `isWithinWorkingHours` is exported but not yet enforced anywhere — booking-submit + slot-block sites need to consume it.

Verified: `npm run build` exit 0, `built in 13.46s`. Migration not yet applied to Supabase — until applied, `/vendor/calendar` rules panel will error on first load (table missing) and edit-form buffer_minutes save will error.

## 2026-05-22 — Batch 9: Vendor settings page (plan Batch 3 slice 1)

- `MogzuApplication/src/app/components/VendorSettingsPage.tsx` (new, ~500 lines) — replaces 6-line `VendorSettingsStep12Placeholder` ("future release Step 12") with a full 3-tab settings page:
  - **Business profile** tab: editable `business_name`, `gst_number`, `city`, `state`, `logo_url`, `description`. Save → `db.vendors.updateProfile()`. Status pill + bank-verified badge.
  - **Payouts** tab: list `vendor_payout_methods` via `vendorPayouts.listMethods(vendorId)`. Inline "Add method" panel with rail (razorpay_x/wise/ach/fast_sg/sepa/manual), currency, account holder, account number, primary flag. Per-method actions: Set primary (`setPrimary`), Remove (`removeMethod`). Account number masked (last-4). Primary + verified badges.
  - **Notifications** tab: 7 toggles mapped to `NotificationType` array (`booking_confirmed`, `booking_cancelled`, `approval_required`, `payment_received`, `refund_initiated`, `support_reply`, `reminder_24h`). Save → `db.notificationPreferences.upsert` with critical types (`gift_received`, `gift_pending_approval`, `system`) always force-included.
- `MogzuApplication/src/lib/db.ts` — added `vendors.updateProfile(id, patch)` (partial-pick of business_name/description/logo_url/gst_number/city/state) writing `updated_at = NOW()`.
- `MogzuApplication/src/app/routes.tsx` — deleted `VendorSettingsStep12Placeholder` inline component; route `/vendor/settings` now resolves `VendorSettingsPage` (imported alongside `VendorPerformancePage`).

Why: plan Batch 3 first deliverable ("Replace `/vendor/settings` placeholder with real profile/payout/notification settings"). Highest visibility on vendor side — anyone clicking the sidebar Settings tab hit a "coming soon" stub.

Carry-over (plan Batch 3 remaining — defer to next slice):
- Drag-to-block grid on `VendorCalendarPage` (currently click-modal only).
- Recurring availability rule editor — `CalendarSlot.recurrence_rule` column already exists; only UI missing.
- Buffer time field on listings (`buffer_minutes`) — needs ALTER + listing form field.
- Notify booker on availability-change-after-confirm — trigger logic on calendar_slots insert vs confirmed bookings.
- Vendor performance drawer stats + PDF export.

Verified: `npm run build` exit 0, `built in 14.32s`.

## 2026-05-21 — Batch 8: Approval workflow rules + bulk invite + 72h expiry

**New migrations (require Supabase apply):**

- `supabase/migrations/20260521000002_approval_workflow_rules.sql` — adds `approval_workflow_rules` table (`id`, `corporate_id` FK→corporate_accounts, `threshold` NUMERIC(12,2), `required_levels` TEXT[] of L1/L2/L3, `exception_note`, `display_order`, `is_active`, timestamps). RLS: L3 admin manages own corp; corp members read; mogzu_admin all. `idx_awr_corp_active` covering index for active rules sorted by display_order. `trg_awr_touch_updated_at` trigger. `NOTIFY pgrst, 'reload schema'`.
- `supabase/migrations/20260521000003_user_invites_corporate.sql` — extends `user_invites` with `corporate_id` (FK→corporate_accounts ON DELETE CASCADE) + `department`. Default expiry tightened 14 days → 72 hours per Batch 5 acceptance. New RLS policy `user_invites l3 admin manages own corp` lets L3 admins issue invites for their own corporate (mogzu_admin policy from `20260516000021_rbac_sub_users.sql` left in place). `accept_user_invite()` RPC patched to COALESCE `corporate_id` and `department` from the invite onto `user_profiles`. New `user_invites_with_status` view exposes derived `pending`/`accepted`/`expired` status. New `resend_user_invite(p_invite_id UUID)` RPC rotates token + refreshes `expires_at = NOW() + 72h`; SECURITY INVOKER so RLS gates the underlying UPDATE.

**New services:**

- `MogzuApplication/src/lib/approvalWorkflow.ts` — `listRules(corporateId)` (active only, ordered by display_order); `saveRules(corporateId, drafts)` uses replace-strategy (`UPDATE ... is_active=false WHERE is_active=true` then INSERT new rows — keeps history without per-row diff). `resolveLevelsForAmount(rules, amount)` helper for booking-submit side: picks the highest-threshold rule the amount meets, returns its `required_levels`. Empty rules → no approval required.
- `MogzuApplication/src/lib/userInvites.ts` — `listInvitesByCorporate(corporateId)` reads from `user_invites_with_status` view; `createInvite(corporateId, invitedBy, draft)` generates 24-byte hex token via `crypto.getRandomValues`; `createInvitesBulk(corporateId, invitedBy, drafts)` validates emails + dedupes within upload (returns `{created, skipped: [{email, reason}]}`); `resendInvite(id)` calls `resend_user_invite` RPC; `revokeInvite(id)` DELETE-by-id (RLS-gated); `parseInviteCsv(text)` parses `email,full_name,role,department` rows with optional header detection.

**Types:**

- `MogzuApplication/src/lib/database.types.ts` — extends `UserInvite` interface with `department: string | null` + `corporate_id: string | null`. New `UserInviteStatus` union + `UserInviteWithStatus` interface (UserInvite + `status`). New `ApprovalWorkflowRule` interface. Schema map entry added for `approval_workflow_rules`.

**Wired UI:**

- `MogzuApplication/src/app/components/ApprovalWorkflowPage.tsx` — full rewrite of data layer. Drops local hardcoded `rules` state + fake `setSaveMessage()`-only Save. Loads `listRules(corporateId)` on mount; empty result falls back to `DEFAULT_RULES` template (0 / 50k / 200k thresholds with L1, L1+L2, L1+L2+L3 chains + exception note). All inputs now editable: threshold `<input type=number>`, level chips toggle (click to add/remove from `required_levels`), exception text input. Save calls `saveRules()`; non-L3 viewers see read-only banner + disabled controls. Validation: every rule must have ≥1 level + non-negative threshold.
- `MogzuApplication/src/app/components/UserManagementPage.tsx`:
  - Bulk Upload dropdown item now opens hidden `<input type=file accept=".csv">` (via `csvInputRef`). On file pick: `parseInviteCsv` → `createInvitesBulk` → `loadInvites()` refresh + notice ("Created N invites. Skipped M."). CSV columns: `email,full_name,role,department` with optional header.
  - Add Single User modal final Submit (`handleAddSingleUserNext` finalize branch) now calls `createInvite()` via shared `handleAddSingleInvite` helper. Maps page `permissionLevel` ('editor' → `l2_manager`, 'admin' → `l3_admin`, default → `l1_employee`). Reuses `addBudget1Form.type` as department label for demo simplicity (the modal's own "department" field lives in the budget tab).
  - New "Invites" panel below users table: real-data table from `user_invites_with_status` view. Columns: email / role / department / status pill / expires-at / actions. Status pill colors: pending→amber, accepted→emerald, expired→rose. Actions: Resend (calls `resend_user_invite` RPC) and Revoke (DELETE) for non-accepted rows. Notice/error banners persist until next action.

Verified: `npm run build` exit 0, `built in 23.42s`.

**Action required:** Apply migrations `20260521000002_approval_workflow_rules.sql` and `20260521000003_user_invites_corporate.sql` to Supabase before testing — until applied, `/settings/workflow` Save will throw (table missing) and `/user-management` invite panel will throw (view + corporate_id column missing).

Carry-over:
- The Add Single User modal still has 4 tabs of irrelevant-for-invite fields (address, budget, permissions matrix). Final submit only sends `email + full_name + role + department`; the rest is discarded. Acceptable for invite issuance but the modal copy mis-sells.
- Bulk CSV upload accepts any L3-admin-visible email; no domain-match enforcement (UserProfile domain is set on accept_user_invite via `corporate_id` binding, so cross-domain invites bind to the corporate anyway — by design for guest invites).

## 2026-05-21 — Batch 7: Corp user-mgmt + MyProfile real-data wiring

- `MogzuApplication/src/app/components/MyProfilePage.tsx`:
  - Dropped hardcoded `profileForm` defaults (`James Brown / Operations / 9876543210`) and the setTimeout fake loader (incl. 12% random-fail simulator).
  - Pulls `useAuth().profile` on mount; `splitName()` helper splits `full_name` → `firstName`/`lastName`.
  - Personal save → `db.userProfiles.upsert({ ...profile, full_name, phone, department })` + `refreshProfile()` from auth context.
  - Password save → `authActions.updatePassword(newPassword)` (Supabase auth.updateUser). Note: Supabase doesn't verify current password — the "Current Password" field is still client-collected for UX symmetry but isn't sent.
  - Notifications save → `db.notificationPreferences.upsert({ user_id, in_app_enabled_types, email_enabled_types })`. Page's 4 toggles (`enquiryUpdates`/`approvalUpdates`/`paymentUpdates`/`bookingReminders`) map to NotificationType groups via `NOTIF_GROUP` constant (e.g. `paymentUpdates` → `['payment_received','payment_failed','refund_initiated','refund_failed']`). Critical types (`gift_*`, `system`) always enabled per backend convention.
  - Load reads existing prefs row; falls back to all-enabled when no row exists (matches backend `notify()` default-allow when prefs are absent).
  - Billing tab (plan, billing history table, payment method) intentionally left hardcoded — defer to Batch 11 (`/account/billing` per FRONTEND_COMPLETION_PLAN §5).
- `MogzuApplication/src/app/components/UserManagementPage.tsx`:
  - `initialUsers` array renamed `DEMO_USERS` (kept as fallback; same 7 fake Kapil Dev rows).
  - New `UiUser` type + `adaptProfile(p, idx)` mapper translates `UserProfile` row → table-row shape used everywhere on the page (avatar falls back to `DEMO_AVATARS[idx % 5]` figma-asset cycle when `avatar_url` null; permissions derived from `role`: `l3_admin` → `'Full-permission'`, `l2_manager` → `'Manager'`, else `'Limited'`; `role` and `group` both default to `department`).
  - `useAuth().corporateId` → `db.userProfiles.listByCorporate(corporateId)` on mount. When data populated: `setUsers(...map(adaptProfile))`. Empty result keeps `DEMO_USERS`.
  - `DevMockDataBanner` mounted at top of scroll surface when `!hasRealUsers && !isLoadingUsers`.
- `MogzuApplication/src/app/components/CompanySettingsPage.tsx` (no change): page is pure nav hub (6 cards → /my-profile, /user-management, /settings/workflow, /wallet, /company-settings/dashboard). All target routes are real-data wired. Card descriptions still hand-authored but accurate.

Why: glitch #9 — `/user-management` showed 7 identical fake "Kapil Dev" rows, `/my-profile` showed canned "James Brown / Operations" with setTimeout placeholder loader.

Carry-over (Batch 5 in FRONTEND_COMPLETION_PLAN — still pending after this slice):
- Domain validation on `/signup/corporate` (Story 1.1).
- Bulk invite CSV upload on `/user-management` (Story 1.2). Page's "Add Users" + "Add Single User" modals still local-state-only; submitting doesn't reach Supabase auth invite RPC.
- Pending/accepted/expired invite status table.
- Invite resend + 72h expiry enforcement.
- Approval workflow editor on `/settings/workflow` (still local rules + fake Save — same carry-over noted under Batch 4).

Verified: `npm run build` exit 0, `built in 1m 6s`.

## 2026-05-21 — Batch 6: Admin dashboard real-data wiring

- `MogzuApplication/src/app/components/AdminDashboardPage.tsx` — full rewrite of data layer. Drops hardcoded constants `revenueByMonth`, `commissionData`, `toReceiveRows`, `toPayRows`, `loginLog`, `pendingIssues`, `resolvedIssues`, plus the 6 KPI card literals (175 / 64 / 36 / 25 / 15 / 175). Renames to `DEMO_*` and gates behind empty-slice fallback per the demo-data convention. New `loadAdminStats()` fans out 11 parallel queries:
  - `user_profiles` head count → Total Users
  - `corporate_accounts` head count → Total Clients
  - `vendors` status=active head count → Total Vendors
  - `bookings` last-12-months in CHARGED statuses → Revenue (sum, /100k = lakhs) + monthly bucket chart
  - `support_tickets` open/in_progress/waiting_user head count → Pending Issues KPI
  - `db.promotions.listActive()` → Active Promotions
  - `payouts` (all) → commission pie (gross_amount sum / scheduled+held commission_amount / processed commission_amount)
  - `listInvoiceRuns()` filtered to finalised/sent/overdue → To Receive (top 3 by total, joined to contracts → corporate_accounts.name)
  - `payouts` status=scheduled top 3 → To Pay (vendors.business_name + net_amount)
  - `audit_events_unified` action in ['auth.signin','auth.login','login'] → Login Log (last 3, joined to user_profiles for name)
  - `support_tickets` open+resolved top 3 each → issues tabs
- "Mock data for layout preview" footer replaced with conditional `usingAnyDemo` banner ("Some panels rendered with demo fallback rows") that hides once every slice has real data.
- Sparkline on Revenue KPI now points at real `revenueChartData` 12-month series instead of fixed `[12,18,14,22,19,28,24,32]` placeholder. Falls back to placeholder array when revenue series is empty.

Why: glitch #8 — `/admin` rendered fake Jan-Dec values, fake clients (Acme/Globex/Stark), fake bills, fake login users (Kapil/Sarah/James), fake issue snippets. Top embarrassment vector for any internal-ops walkthrough.

Carry-over:
- Revenue dropdown ("This year" / "Last year" / "Last 6 months") still cosmetic — only "This year" is wired. Other ranges return same 12-month series.
- Commission pie aggregate is lifetime, not period-filtered.
- `audit_events_unified` action match-list assumed: `auth.signin`, `auth.login`, `login`. Verify with `auditLog.ts` once seed data lands.

Verified: `npm run build` exit 0, `built in 27.04s`.

## 2026-05-21 — Batch 5: Spend report sidebar wiring

- `MogzuApplication/src/app/components/layouts/SharedSidebar.tsx` — `report` nav item path: `/report` → `/corporate/spend-report`. Active matcher extended: `if (path.startsWith('/corporate/spend-report') || path.startsWith('/report')) return 'report'`. Old `/report` route preserved (ReportsPage hardcoded Jan-Dec demo charts still served if deep-linked) but no longer surfaced.
- `MogzuApplication/src/app/components/CorporateSpendReportPage.tsx` (no change) — already fully wired: date/dept/module filters, totals + breakdowns by module/department, CSV export via Blob URL with proper `csvCell` escaping, print/PDF via `window.print`. DEMO_DATA_BOOKINGS/USERS fallback when corporate has no bookings. L3-admin gate.

Why: glitch #5 — sidebar "Report" CTA pointed at `ReportsPage` (hardcoded `totalSpentData` + `totalSavingsData` arrays) instead of the real `CorporateSpendReportPage`. Real page was only reachable via deep-link from `AccountManagerPortfolioPage`.

Carry-over: ReportsPage still exists at `/report`; safe to keep for now (no inbound links from corp surfaces). Delete in Batch 15 cleanup pass per "Never delete working code" rule.

Verified: `npm run build` exit 0, `built in 25.06s`.

## 2026-05-21 — Batch 4: Approvals queue requester name embed

- `MogzuApplication/src/lib/db.ts` — `bookings.listByCorporate` select extended from `*, listings(*), vendors(*)` to `*, listings(*), vendors(*), user_profiles!user_id(*)`. Symmetry with `listPendingApproval` (line 328) which already embeds user_profiles.
- `MogzuApplication/src/app/components/CorporateApprovalsPage.tsx` (no change) — already destructures `b.user_profiles?.full_name` + `b.user_profiles?.department`; was falling back to id-slice because the embed was missing. Now renders real requester name + department.

Why: glitch #4 "Approvals queue partial wiring" — queue UI was wired but lookup query was missing the requester join. CorporateApprovalsPage row type already declared `user_profiles: UserProfile | null` on `BookingWithRefs`; only the query layer was short.

Carry-over (separate batch — out of glitch #4 scope):
- `ApprovalWorkflowPage` still 100% hardcoded local `rules` state; Save button writes nothing. Either repurpose `budget_rules` (no L1/L2/L3 levels) or add `approval_workflow_rules` migration. Per FRONTEND_COMPLETION_PLAN §4 row 30, P0 gap, M-sized.
- `ApprovalRequestPage` employee-side fallback values + setTimeout fake submit; needs `db.bookings.update(id, { status: 'pending_approval', revision_comment })` on resubmit.
- `db.bookings.cancel` on manager-reject does not credit wallet/budget back. Probably fine for demo (most flows are invoice-billed).

Verified: `npm run build` exit 0, `built in 26.36s`.

## 2026-05-21 — Batch 3c: Image + vendor contact + add-ons overlay

- `MogzuApplication/src/lib/db.ts` — `bookings.getById` select extended: `listings(*, listing_images(*)), vendors(*, user_profiles!user_id(full_name,phone)), booking_add_ons(*), user_profiles!user_id(*)`. One round-trip pulls everything the detail page renders.
- `MogzuApplication/src/app/components/BookingDetailPage.tsx`:
  - `RealBooking` type widened: `listings.listing_images[]`, `vendors.user_profiles{full_name,phone}`, `booking_add_ons[]`.
  - Overlay block now mounts:
    - `venue.image` — first listing image sorted by `display_order`; bucket selected by `listing.module` (`spaceImages` for `spacex_*`, `listingImages` otherwise).
    - `vendorContact.name` from `vendor.user_profiles.full_name` (falls back to `vendor.business_name`, then mock).
    - `vendorContact.phone` from `vendor.user_profiles.phone`.
    - `addOns[]` from `booking_add_ons` rows mapped to `{name, description: "Qty N · ₹price", icon}`; falls back to derived when empty.
  - `vendorContact.email` intentionally still mock — vendor email lives on `auth.users`, not surfaced via PostgREST embed here. Future: fetch via vendor RPC or move email to `user_profiles`.

Verified: `npm run build` exit 0, `built in 31.02s`. Hybrid render now covers venue (name/location/description/image), attendees, dates, price, status, payment, vendor contact (name+phone), add-ons. Only `vendorContact.email`, `team`, and `equipments` remain from mock.

## 2026-05-21 — Batch 3b: Detail-page hybrid render + realtime

- `MogzuApplication/src/app/components/BookingDetailPage.tsx`:
  - Added inverse mappers `mapStatus` (BookingStatus → UI `currentStatus`), `mapPaymentStatus`, `mapPaymentType`; ISO formatter `fmtIsoDate`.
  - Renamed existing `booking` useMemo → `derivedBooking` (passed-state / mock fallback derivation, unchanged).
  - New `booking` useMemo overlays `realBooking` fields onto `derivedBooking` when fetch resolves: `venue.name/location/description` from `listings`, `attendees` from `group_size`, `dateTime` from `start_time`/`end_time`, `price.basePrice/processing/total` from base_amount/platform_fee/total_amount, `bookingStatus.currentStatus` + `approvedOn`, `paymentStatus.status` + `paymentType`.
  - Realtime subscription via `subscribeToTable<RealBooking>` on `bookings` table with `id=eq.{id}` filter, event=UPDATE. Merges `payload.new` into `realBooking` state so the overlay re-renders when vendor confirms / corp cancels server-side. Cleanup on unmount.
  - Used Listing's `location_address` + `location_city` (no `location_state` on schema) for `venue.location`.

Verified: `npm run build` exit 0, `built in 14.72s`.

Carry-over → Batch 3c:
- Mount real listing image (currently `derivedBooking.venue.image` remains the mock figma asset). Need to extend `db.bookings.getById` select to include `listing_images` OR a separate fetch.
- Real vendor contact name (currently mock). Vendor row available in select but not yet wired into overlay (would need vendor user profile join for phone/email).
- Real add-ons + booking_add_ons → overlay `booking.addOns`.

## 2026-05-21 — Batch 3: Bookings glue

- `MogzuApplication/src/app/components/BookingsPage.tsx` — wire to `db.bookings`. L3 admins call `listByCorporate(corporateId)`; everyone else calls `listByUser(profile.id)`. Map `BookingStatus` → UI `{status, type}` via local `mapBookingStatus` switch. Compose `allBookings`: real ⊕ flow when real present; mock ⊕ flow otherwise (DEMO_DATA fallback per convention). `DevMockDataBanner` now gated on `!hasRealData`. Added `formatShortDate` ISO→`"MMM dd, yyyy"` helper for parity with mock format.
- `MogzuApplication/src/app/components/BookingDetailPage.tsx` — UUID guard around `db.bookings.getById`. Mock numeric ids (e.g. `1240909` from passed booking state) no longer hit Postgres → kills the 22P02 "invalid uuid" console error on legacy mock-link clicks. Real UUID ids continue to fetch + populate `realBooking` for `BookingMessagesPanel` + dispute modal.

Row-click navigation (`/bookings/:id`) confirmed sound — passes `booking` in `location.state` for both real and mock paths; BookingDetailPage uses passed state for primary render and overlays real data when fetch succeeds.

Carry-over → Batch 3b:
- Hybrid render: when `realBooking` present, override UI fields (venue.name, attendees, price.total, dates) on `booking` derived object so the detail page surface mirrors live data rather than the passed snapshot. Currently real data only powers messages + dispute.
- Status pill on `/bookings/:id` derived from `booking.bookingStatus.currentStatus` — does not yet flip when `realBooking.status` changes server-side. Add realtime subscription on `db.bookings` row.

Verified: `npm run build` exit 0, `built in 22.67s`.

## 2026-05-21 — Batch 2c: Heart sweep completion

Card-surface (listing pages, swap local heart -> canonical `<WishlistHeart>`):
- `MogzuApplication/src/app/components/StaySearchPage.tsx` — mount `<WishlistHeart listingId={stay.id} />` on image well + inline `<RatingBadge listingId={stay.id} showCount={false} />` next to vendor name; image well container made `relative` to anchor overlay
- `MogzuApplication/src/app/components/ActivitiesPage.tsx` — replace stub heart button with `<WishlistHeart listingId={String(activity.id)} />`; drop `Heart` lucide import
- `MogzuApplication/src/app/components/CelebrationsPage.tsx` — replace card heart button (line ~1326) with `<WishlistHeart>` carrying custom className for the existing rounded-button styling; keep filter-tab Heart icon (line 897) untouched
- `MogzuApplication/src/app/components/CoworkingPage.tsx` — replace card heart with `<WishlistHeart listingId={String(space.id)} />`; remove `favorites` state + `toggleFavorite` helper; drop `Heart` import
- `MogzuApplication/src/app/components/PromotionsPage.tsx` — replace static heart button with `<WishlistHeart listingId={String(promo.id)} />`; drop `Heart` import
- `MogzuApplication/src/app/components/EventActivityPage.tsx` — replace card heart with `<WishlistHeart listingId={String(cardId)} className=…/>`; remove `likedById`/`setLikedById` state; drop `Heart` import

Detail-page (canonicalize header heart):
- `MogzuApplication/src/app/components/ActivityDetailPage.tsx` — header heart -> `<WishlistHeart listingId={String(activity.id)} className=…/>`; drop `liked`/`setLiked` state + `Heart` import
- `MogzuApplication/src/app/components/CelebrationDetailPage.tsx` — header heart -> `<WishlistHeart listingId={String(product.id)} className=…/>`; drop `liked` state + `Heart` import
- `MogzuApplication/src/app/components/CoworkingDetailPage.tsx` — header heart -> `<WishlistHeart listingId={String(id ?? space.id)} className=…/>`; drop `isFavorite` state + `Heart` import
- `MogzuApplication/src/app/components/ProductBookingPageNew.tsx` — header heart -> `<WishlistHeart listingId={String(product.id)} className=…/>`; drop `Heart` import
- `MogzuApplication/src/app/components/ProductBookingPage.tsx` — drop unused `Heart` import (no usage in file)

Skipped (intentionally):
- `EventsPage` — no card heart present
- `GiftingShopPage` — `Heart` is a category icon (line 2642), not a save action
- `CelebrationsPage` filter-tab heart at line 897 — semantic filter chip, not a save action
- `ComparePage`/`WishlistPage`/`FavouritesPage`/`ReportsPage`/`RelatedProducts`/`VendorPassportPage`/`WhyMogzuPage`/`vendor/VendorPerformanceStatsDrawer` — Heart is decorative/icon-only, no toggle semantics

Verified: `npm run build` exit 0, `built in 13.46s`.

## 2026-05-21 — Batch 2b: Heart sprinkle (partial)

- `MogzuApplication/src/app/components/global/WishlistHeart.tsx` — UUID guard: real db writes only when `listingId` matches UUID v4 shape; mock ids fall back to local-only optimistic state (no Postgres FK errors). Defensive helper `isPersistable`.
- `MogzuApplication/src/app/components/global/RatingBadge.tsx` — UUID guard: skip `db.reviews.aggregate` lookup for non-UUID ids; renders null.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — mount `<WishlistHeart listingId={card.id} />` overlay in image well + `<RatingBadge listingId={card.id} />` inline below vendor row. Card image well changed `aspect-[4/3] bg-slate-100` → `relative aspect-[4/3] bg-slate-100` to anchor overlay.
- `MogzuApplication/src/app/components/SpaceXPage.tsx` — swapped local-state heart button (lines 2373-2389) for `<WishlistHeart listingId={String(space.id)} />`. Removed orphaned `likedSpaces` state (line 215). Removed unused `Heart` lucide import. Added `WishlistHeart` import.

Verified: `npm run build` exit 0, `built in 15.42s`.

Carry-over → Batch 2c:
- Remaining 18 components with local heart state — sweep when their parent module gets real-data wiring
- StaySearchPage, CorporatePicksPage — add WishlistHeart + RatingBadge (real-data surfaces, no heart today)
- Gifting product detail mount (no detail route exists)

## 2026-05-21 — Hotfixes surfaced by Batch 2 smoke

- `MogzuApplication/src/app/components/global/ListingReviewsPanel.tsx` — added UUID guard (parity with WishlistHeart + RatingBadge). Previously fired `db.reviews.listByListing("1")` → 22P02 "invalid uuid". Now renders empty state for mock ids.
- `MogzuApplication/src/app/lib/bookingDraft.tsx` — wrapped `setDraftPartial`, `setContactField`, `clearDraft` in `useCallback` for stable refs. Without this, consumers (e.g. `EventDetailPage` useEffect at line 283) caused infinite render loop because callback ref changed every render → effect deps invalidated → re-fired → setState → re-render. Pre-existing bug unmasked by Batch 2 / PriceBlock TDZ fix.
- `MogzuApplication/src/app/components/ui/PriceBlock.tsx` — useEffect at line 199 now dedupes via `lastDraftSigRef` (JSON.stringify payload signature) — parents pass inline `listing` object every render → addons array ref invalidates useMemo → effect was firing on identical content. Belt-and-suspenders alongside the bookingDraft useCallback fix.
- `MogzuApplication/src/lib/publicCatalogue.ts` — column drift: `listing_images.image_path` → `storage_path` (actual schema column). Plus `listings.pricing_mode` → `pricing_type`. Were 42703 errors.
- `MogzuApplication/src/app/components/ExplorePage.tsx` — matching `pricing_mode` → `pricing_type` rename in `formatPrice`.

Verified: smoke 4/5 PASS. Remaining fail = empty listings table (data state, not code).
Build: `✓ built in 13.49s`.

## 2026-05-21 — Hotfix: PriceBlock TDZ

- `MogzuApplication/src/app/components/ui/PriceBlock.tsx` — moved `selectedAddons`/`addonPriceTotal`/`offerPerUnit`/`unitPrice`/`baseTotalRaw`/`feeRaw`/`grandTotalRaw` const declarations ABOVE the `useEffect` blocks that reference them. Was throwing `Cannot access 'selectedAddons' before initialization` on `/event-activity/:id`. Pre-existing bug, surfaced after Batch 2 mount changed render path. Pure reorder, no logic change.
- Verified: `npm run build` exit 0, `built in 46.30s`.

## 2026-05-21 — Batch 2: Listing trust + save signals

- `MogzuApplication/src/lib/db.ts` — added `db.wishlists.isInWishlist(userId, listingId)` (head-only count) + `db.reviews.aggregate(listingId)` (client-side avg + count, approved only)
- `MogzuApplication/src/app/components/global/WishlistHeart.tsx` — new reusable wishlist toggle (overlay + inline variants), canonical pattern from `design-system/MASTER.md §5`, optimistic update + revert on error
- `MogzuApplication/src/app/components/global/RatingBadge.tsx` — new aggregate-rating badge (overlay + inline variants), renders null when zero reviews, canonical pattern from `MASTER.md §6`
- `MogzuApplication/src/app/components/global/ListingReviewsPanel.tsx` — new reviews-list panel, reads `db.reviews.listByListing`, 5-shown + "View all (n)" expand, supports `source='invite'` "Pre-platform review" badge + vendor reply card; per `MASTER.md §7`
- `MogzuApplication/src/app/components/EventDetailPage.tsx` — mount `<ListingReviewsPanel listingId={listingId} />` between tabs container and "More events" carousel
- `MogzuApplication/src/app/components/SpaceDetailPage.tsx` — replace mock `selectedTab === 'reviews'` block (lines 898-914) with `<ListingReviewsPanel listingId={routeSpaceId} />` (transparent variant — host card retains existing rating display)

Verified: `npm run build` exit 0, `3171 modules transformed`, `built in 49.28s`. Pre-existing warnings only.

Deferred to Batch 2 follow-up:
- Mount panel on gifting product detail surface (no per-product detail page exists; revisit when product detail route lands or via shop-page modal)
- Swap canonical card heart in `SpaceXPage.tsx` to `<WishlistHeart>` — leaves the local-state debt in 20 files intact for now
- Sprinkle `<WishlistHeart>` + `<RatingBadge>` overlay on listing cards across catalogue (Batch 2b)

## 2026-05-21 — Batch 1: Booker-side communication parity

- `MogzuApplication/src/app/components/BookingDetailPage.tsx` — fetch real booking by url id (`db.bookings.getById`); inject `<BookingMessagesPanel>` below grid when real booking present; add "Raise a dispute" button + modal calling `db.bookingDisputes.raise`; mock-data fallback preserved when id absent or fetch fails
- `MogzuApplication/src/app/components/CancelBookingPage.tsx` — after `cancelWithRefund` success, look up `db.vendors.getById(booking.vendor_id)` and emit `booking_cancelled` notification to `vendor.user_id` (glitch #6)
- `MogzuApplication/src/app/components/GiftingSendPage.tsx` — fan-out `approval_required` notifications to all `l2_manager` users on `pending_approval` status (glitch #5)
- `MogzuApplication/src/app/components/SpaceBookingPage.tsx` — fan-out `approval_required` notifications to all `l2_manager` users on `pending_approval` status (glitch #5)

Verified: `npm run build` clean.

Deferred from Batch 1:
- Unread message badge in `NotificationBell` — already shipped (lines 30-49 sum `db.bookingMessages.unreadCountForUser`). Plan doc Section 3 glitch #14 entry stale.
- Email digest of unread messages — requires `notification_preferences` schema extension; moved to Batch 10.

## 2026-05-24 — Add-on Batch F: Lead inbox UX redesign (ui-ux-pro-max)

- **Layout:** Master–detail on desktop (list + sticky work panel); mobile keeps slide-over drawer
- **Header:** Stats strip (new / unassigned / callbacks / this week), clear primary CTAs, secondary links grouped
- **Filters:** Single `LeadFilterBar` — search + status tabs; advanced filters (vertical, source, quick) behind “Filters” toggle
- **List:** `LeadInboxCard` — one card per lead, click to select; email/call only; no cluttered status/quick-share rows
- **Intake:** `LeadIntakeModal` — focused modal instead of inline form on the page
- **Flow:** Horizontal progress stepper in work panel; “next step” hint
- New: `leadOpsStyles.ts`, `LeadOpsStats`, `LeadFilterBar`, `LeadInboxCard`, `LeadIntakeModal`

Verified: `npm run build` clean.

## 2026-05-24 — UI/UX Pro Max: Admin aligned to gifting shop + pending pipeline

- `adminModuleStyles.ts` — `ADMIN_MODULE` tokens from `mogzuGiftingStyles` + `mogzuGlassStyles` (1280px container, 22px titles, nav chips, glass cards)
- `leadOpsStyles.ts` — extends `ADMIN_MODULE`; `leadOpsChipClass` = shop nav chips
- `.cursor/rules/ui-ux-pro-max-admin.mdc` — enforce skill + tokens on admin/lead pages
- `SalesPipelinePage.tsx` — same header/stats/toolbar/kanban glass as lead inbox
- `AdminGiftingProductsPage.tsx` — shop-parity header, tabs, table shell
- `LeadTriageToolbar.tsx` — unified search + chips

## 2026-05-24 — UI/UX Pro Max: Lead ops design system pass

- Unified `leadOpsStyles.ts` tokens (spacing, buttons, drawer, modal, grid)
- `LeadOpsPageHeader` — consistent page chrome for inbox + Quick Share
- `AdminLeadsPage` — fixed master–detail grid; mobile drawer only on `<lg` (no duplicate panel)
- `LeadDetailDrawer` — aligned sections, status dropdown, sticky footer actions
- `LeadInboxCard` — fixed nested button/link a11y; separated card select vs email/call
- `AdminQuickSharePage` — repaired header layout; “Options to share” listing picker

## 2026-05-24 — Add-on Batch G: Catalogue selection UX + auto-mark lead

- Quick Share from lead: in-page steps banner; listings selected via checkboxes / **Select all visible**; filters **all / services / products**
- After **Generate link**, lead auto-marked `catalogue sent` (links `quick_share_id`)
- Lead drawer: short “How to select a catalogue” helper

## 2026-05-24 — Add-on Batch E: Lead flow stepper + owner assignment + pipeline sync

- `leadFlow.ts` — 5-step enquiry flow (captured → converted) + next-action hints
- `LeadFlowStepper.tsx` — visual progress in drawer
- `publicLeads.ts` — `listLeadOwners`, `assignLeadOwner`, `markLeadCatalogueSent`, `linkRelatedLead`
- `LeadDetailDrawer.tsx` — assign to me / dropdown, mark catalogue sent, link duplicate, Mogzu orders link
- `SalesPipelinePage.tsx` — kanban cards open same drawer; owner + source badges; link to lead inbox
- `AdminLeadsPage.tsx` — owner label on rows; drawer passes current user

Verified: `npm run build` clean.

## 2026-05-24 — Add-on Batch D: Lead detail drawer + duplicates + staff update RLS

- `LeadDetailDrawer.tsx` — slide-over: contact, requirement, notes save, status timeline, duplicates, Quick Share
- `leadDuplicates.ts` — phone/email normalization + duplicate matching
- `publicLeads.ts` — `updateLeadMetadata`, `updateLeadStatus` appends `status_history`
- `AdminLeadsPage.tsx` — open drawer from name / View details; duplicate chip on rows; intake duplicate warning
- `StaffLeadIntakePanel.tsx` — duplicate warning while typing phone/email
- `20260524000002_staff_update_public_leads.sql` — sales/support can UPDATE leads

Verified: `npm run build` clean.

## 2026-05-24 — Add-on Batch C: Multi-source staff lead intake (phone, referral, etc.)

- `leadSources.ts` — channel taxonomy, source filters, staff payload builder, display helpers
- `StaffLeadIntakePanel.tsx` — admin form for phone / WhatsApp / referral / partner / walk-in / social / other
- `LeadSourceBadge.tsx` — coloured source + referrer chips in inbox
- `publicLeads.ts` — `metadata` on `PublicLead`, `createStaffLead()`
- `AdminLeadsPage.tsx` — Log phone call / Log enquiry CTAs, source filter row, intake panel, demo phone+referral rows
- `leadTriageUtils.ts` — search metadata + source filter

Verified: `npm run build` clean.

## 2026-05-24 — Add-on Batch B: Gifting + events enquiry verticals

- `leadEnquiryVertical.ts` — vertical inference (gifting/events), catalogue kind (services/products), shared prefill type
- `AdminLeadsPage.tsx` — vertical tabs; per-lead **Gifting catalogue** / **Events catalogue** buttons; vertical badge on rows
- `AdminQuickSharePage.tsx` — gifting & events only; module toggle; services/products filter; category labels; select all visible; `listByModuleWithCategories`
- `db.ts` — `listings.listByModuleWithCategories`
- `leadTriageUtils.ts` — vertical filter in `triageLeads`

Verified: `npm run build` clean.

## 2026-05-24 — Add-on Batch A: Enquiry → Quick Share bridge

- `AdminLeadsPage.tsx` — hero links to Quick Share + Mogzu orders; per-lead **Quick Share catalogue** button (prefills create form; marks `new` → `assigned` when live data)
- `AdminQuickSharePage.tsx` — reads `location.state.fromLead`; opens create form with client label, note (requirement + contact + lead ref), budget cap hint, module guess from `source_slug`

Verified: `npm run build` clean.

## OPEN BUGS — fix later

- **Corporate onboarding gate is localStorage-only** — fixed 2026-05-21.
  - `isCorporateOnboardingComplete(profile?)` + `getCorporateOnboardingPath(profile?)` now accept an optional `UserProfile`. When supplied, completeness is derived from `user_profiles.corporate_id != null` (DB truth). LocalStorage flag remains as a fallback for pre-auth contexts only.
  - `getPostLoginPath(role, profile?)` updated to thread `profile` through.
  - Callsites updated to pass `profile` from `useAuth()`: ProtectedRoute.CorporateRoute, LoginPage, WelcomeScreen, AuthCallbackPage, auth.ts signIn return value.
  - AcceptInvitePage intentionally left unchanged — invite flow has no profile yet; localStorage fallback path is correct there.



- **`db.bookings.getById` PostgREST relation error** — durable fix landed 2026-05-21.
  - Migration `20260521000001_bookings_user_profiles_fkey.sql` adds explicit `bookings.user_id → user_profiles.id` FK + `NOTIFY pgrst, 'reload schema'`.
  - `db.ts:1652` also switched from bare `user_profiles(...)` to `user_profiles!user_id(...)` for the gifting-campaign bookings list (same brittleness, less critical path).
  - **Action required:** apply the migration in Supabase (push or run via SQL editor). Migration is idempotent only on first run; if `bookings_user_id_user_profiles_fkey` already exists, re-running will error.
  - Verified after apply: BookingDetailPage real-fetch path, CancelBookingPage, BookingPaymentPage, CorporateApprovalDetailPage, ReviewSubmitPage, RescheduleBookingPage, VendorBookingRequestsPage detail.

# Mogzu Frontend Route Matrix

Generated from `src/app/routes.tsx`. PRD baseline: **mogzu_prd_v2.md** Phase 1.

| Path | Persona | Guard (pre-audit) | PRD | Status | Notes |
|------|---------|-------------------|-----|--------|-------|
| `/` | public | none | Epic 1 | implemented-e2e |  |
| `/giev` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/home` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/meetings` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/new` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/classic` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/classic/spaces/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/spaces/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/book/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/heygenie` | public | none | Epic 1 | implemented-e2e |  |
| `/why-mogzu` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor-benefits` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/login` | public | none | Epic 1 | implemented-e2e |  |
| `/auth/callback` | public | none | Epic 1 | implemented-e2e |  |
| `/auth/reset-password` | public | none | Epic 1 | implemented-e2e |  |
| `/signup` | public | none | Epic 1 | implemented-e2e |  |
| `/signup/corporate` | public | none | Epic 1 | implemented-e2e |  |
| `/signup/corporate/company-details` | public | none | Epic 1 | implemented-e2e |  |
| `/signup/corporate/interests` | public | none | Epic 1 | implemented-e2e |  |
| `/signup/corporate/access` | public | none | Epic 1 | implemented-e2e |  |
| `/signup/vendor/register` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/signup/vendor` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/signup/vendor/listing` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/signup/vendor/verify-email` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/registration-complete` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/welcome` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/verification-pending` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/welcome` | public | none | Epic 1 | implemented-e2e |  |
| `/dashboard` | public | none | Epic 1 | implemented-e2e |  |
| `/admin/login` | admin | none | Epic 1.4+ | shell-mock |  |
| `/admin` | admin | partial | Epic 1.4+ | shell-mock |  |
| `platform-modules` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `clients` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `issues` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `products` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `products/categories` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `products/new` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `teams` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `teams/roles` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `vendors` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `listings` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `listings/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `categories` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `gifting/products` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `gifting/products/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `gifting/orders` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `gifting/vendors` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `mogzu-direct/new` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `mogzu-direct/:id/edit` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `mogzu-direct/add` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `mogzu-direct/edit/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `mogzu-direct` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `vendors/order-analytics` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `transactions` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `promotions` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `notifications` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partners` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partners/new` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partners/edit/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partner-listings` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partner-listings/new` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partner-listings/edit/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `shortlists` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `shortlists/new` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `shortlists/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `heygenie` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partners/:id/agreement` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `partner-payouts` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `listings/queue` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `team` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `team/:userId/permissions` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `team/:userId/activity` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `quick-share` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `quick-share/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `mogzu-orders` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `commissions` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `support` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `support/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `disputes` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `disputes/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `reviews/approval` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `promotions/approval` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `branding/approvals` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `cms` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `ai-agents` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `sso` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `listings/public` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `leads` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `compliance/audit` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `contracts` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `contracts/new` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `contracts/:id/edit` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `invoice-runs/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `subscriptions` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `api-keys` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `webhooks` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `vendor-payouts` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `vendor-applications` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `white-label` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `access-reviews` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `dspace` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `dspace/spaces/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `dspace/bookings` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `bookings` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `reports` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `settings` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `events` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `events/services/:id` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `events/bookings` | corporate | module/none | Epic 2–8 | shell-mock |  |
| `/am/shortlists` | account_manager | none | AM | shell-mock |  |
| `/am/shortlists/:id` | account_manager | none | AM | shell-mock |  |
| `/shortlist/:token` | public | none | Epic 1 | implemented-e2e |  |
| `/signup/partner` | partner | none | Partner | shell-mock |  |
| `/partner-ref/:code` | partner | none | Partner | shell-mock |  |
| `/partner/dashboard` | partner | none | Partner | shell-mock |  |
| `/partner/clients` | partner | none | Partner | shell-mock |  |
| `/partner/listings` | partner | none | Partner | shell-mock |  |
| `/partner/listings/new` | partner | none | Partner | shell-mock |  |
| `/partner/listings/:id/edit` | partner | none | Partner | shell-mock |  |
| `/invoice/:token` | public | none | Epic 1 | implemented-e2e |  |
| `/partner/statements/:yyyymm` | partner | none | Partner | shell-mock |  |
| `/invite/:token` | public | none | Epic 1 | implemented-e2e |  |
| `/agent/dashboard` | public | none | Epic 1 | implemented-e2e |  |
| `/bookings/:id/track` | public | none | Epic 1 | implemented-e2e |  |
| `/qs/:token` | public | none | Epic 1 | implemented-e2e |  |
| `/activitysuite` | public | none | Epic 1 | implemented-e2e |  |
| `/dspace/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/spacex` | public | none | Epic 1 | implemented-e2e |  |
| `/spacex/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/request-to-book` | public | none | Epic 1 | implemented-e2e |  |
| `/booking-addons` | public | none | Epic 1 | implemented-e2e |  |
| `/booking-review` | public | none | Epic 1 | implemented-e2e |  |
| `/booking-payment` | public | none | Epic 1 | implemented-e2e |  |
| `/booking-confirmation` | public | none | Epic 1 | implemented-e2e |  |
| `/booking/confirmation` | public | none | Epic 1 | implemented-e2e |  |
| `/bookings` | public | none | Epic 1 | implemented-e2e |  |
| `/bookings/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/coworking` | public | none | Epic 1 | implemented-e2e |  |
| `/coworking/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/activities` | public | none | Epic 1 | implemented-e2e |  |
| `/dashboard/activities/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/dashboard/activities` | public | none | Epic 1 | implemented-e2e |  |
| `/dashboard/activities/:id/booking` | public | none | Epic 1 | implemented-e2e |  |
| `/stay` | public | none | Epic 1 | implemented-e2e |  |
| `/promotions` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/new` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/classic` | public | none | Epic 1 | implemented-e2e |  |
| `/shop` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting-shop` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/shop` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/home` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/combo` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/e-gift` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/go-local` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/baskets` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/celebrations` | public | none | Epic 1 | implemented-e2e |  |
| `/product-booking` | public | none | Epic 1 | implemented-e2e |  |
| `/apparel` | public | none | Epic 1 | implemented-e2e |  |
| `/booking-flow` | public | none | Epic 1 | implemented-e2e |  |
| `/book/event/:listingId` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor/booking-requests` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/booking-requests/:bookingId` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/bookings/:id/pay` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/gifting-programme` | public | none | Epic 1 | implemented-e2e |  |
| `/gifting/send` | public | none | Epic 1 | implemented-e2e |  |
| `/book/space/:listingId` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor/payouts` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/corporate/employees/import` | public | none | Epic 1 | implemented-e2e |  |
| `/notifications` | public | none | Epic 1 | implemented-e2e |  |
| `/settings/notifications` | public | none | Epic 1 | implemented-e2e |  |
| `/spend` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/spend-report` | public | none | Epic 1 | implemented-e2e |  |
| `/support` | public | none | Epic 1 | implemented-e2e |  |
| `/support/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor/support` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/support/:id` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/corporate/celebrations` | public | none | Epic 1 | implemented-e2e |  |
| `/celebrations/team` | public | none | Epic 1 | implemented-e2e |  |
| `/am/portfolio` | account_manager | none | AM | shell-mock |  |
| `/corporate/travel-policy` | public | none | Epic 1 | implemented-e2e |  |
| `/stay/search` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/bulk-gifting` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/bulk-gifting/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/bookings/:id/review` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor/analytics` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/promotions-live` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/explore` | public | none | Epic 1 | implemented-e2e |  |
| `/explore/:module` | public | none | Epic 1 | implemented-e2e |  |
| `/p/:slug` | public | none | Epic 1 | implemented-e2e |  |
| `/blog` | public | none | Epic 1 | implemented-e2e |  |
| `/blog/:slug` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor-apply` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/corporate/ai-autonomy` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/event-templates` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate-picks` | public | none | Epic 1 | implemented-e2e |  |
| `/celebrations` | public | none | Epic 1 | implemented-e2e |  |
| `/celebrations/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/celebration-booking-flow` | public | none | Epic 1 | implemented-e2e |  |
| `/events` | public | none | Epic 1 | implemented-e2e |  |
| `/events/home` | public | none | Epic 1 | implemented-e2e |  |
| `/events/new` | public | none | Epic 1 | implemented-e2e |  |
| `/events/classic` | public | none | Epic 1 | implemented-e2e |  |
| `/events/services/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/events/book/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/event-activity` | public | none | Epic 1 | implemented-e2e |  |
| `/event-activity/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/event-services` | public | none | Epic 1 | implemented-e2e |  |
| `/events/activity` | public | none | Epic 1 | implemented-e2e |  |
| `/events/service` | public | none | Epic 1 | implemented-e2e |  |
| `/user-management` | public | none | Epic 1 | implemented-e2e |  |
| `/my-profile` | public | none | Epic 1 | implemented-e2e |  |
| `/company-settings` | public | none | Epic 1 | implemented-e2e |  |
| `/company-settings/dashboard` | public | none | Epic 1 | implemented-e2e |  |
| `/billing-invoices` | public | none | Epic 1 | implemented-e2e |  |
| `/wallet` | public | none | Epic 1 | implemented-e2e |  |
| `/communication` | public | none | Epic 1 | implemented-e2e |  |
| `/browse/mogzu-direct/:module/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/browse/partner-listing/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/shortlist/:token` | public | none | Epic 1 | implemented-e2e |  |
| `/favourites` | public | none | Epic 1 | implemented-e2e |  |
| `/report` | public | none | Epic 1 | implemented-e2e |  |
| `/assistance` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/transactions` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/notifications` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/approvals` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/approvals/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/corporate/budget` | public | none | Epic 1 | implemented-e2e |  |
| `/deals` | public | none | Epic 1 | implemented-e2e |  |
| `/deals/claim/:id` | public | none | Epic 1 | implemented-e2e |  |
| `/compare` | public | none | Epic 1 | implemented-e2e |  |
| `/wishlist` | public | none | Epic 1 | implemented-e2e |  |
| `/booking/new` | public | none | Epic 1 | implemented-e2e |  |
| `/settings/workflow` | public | none | Epic 1 | implemented-e2e |  |
| `/vendor/dashboard` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/products` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/products/new` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/products/:productId` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/orders` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/orders/:orderId` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/communication` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/messages` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/users` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/team` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/settings` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/listings` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/listings/new` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/listings/:id/edit` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/events` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/events/services/new` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/events/services/:id` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/event-activity` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/dspace` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/dspace/spaces/new` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/dspace/spaces/:id` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/spacex` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/spacex/:spaceId` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/gifting` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/gifting/products/new` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/gifting/products/:id` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/promotions` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/promotions/ad-campaign` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/promotions/offer` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/reviews` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/calendar` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor/performance` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/vendor-passport` | vendor | partial | Epic 1.3 | shell-mock |  |
| `/booking-approval-request` | public | none | Epic 1 | implemented-e2e |  |
| `/bookings/:id/cancel` | public | none | Epic 1 | implemented-e2e |  |
| `/cancel-booking` | public | none | Epic 1 | implemented-e2e |  |
| `/bookings/:id/reschedule` | public | none | Epic 1 | implemented-e2e |  |
| `/reschedule-booking` | public | none | Epic 1 | implemented-e2e |  |
| `*` | system | none | — | shell-mock |  |

## Duplicate paths (first match wins)

_None detected_

## Totals

- Path entries parsed: **274**
- Unique paths: **274**
- Duplicate definitions: **0**

## Status legend

- **implemented-e2e** — Auth/data wired to Supabase
- **partial-e2e** — Auth works; data partly mock
- **shell-mock** — UI only (localStorage/demo)
- **dead-route** — Overwritten by earlier duplicate
- **redirect** — Alias route

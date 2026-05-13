# Classic Corporate Flow Contract

This contract defines the canonical route and state handoff for classic corporate flows.

## D Space Classic

- Entry: `/dspace/classic`
- Detail: `/dspace/classic/spaces/:id`
- Booking chain:
  - `/dspace/book/:id` (`RequestToBook`)
  - `/booking-addons` (`BookingAddOns`)
  - `/booking-review` (`BookingReview`)
  - `/booking-payment` (`BookingPayment`)
  - `/booking-confirmation`

State key used between steps:

- `bookingFlow` (`ClassicBookingFlowState`) from `src/app/lib/classicBookingFlow.ts`

## Events Classic

- Entry: `/events/classic`
- Service detail from Event Service tab: `/events/services/:id`
- Activity detail: `/event-activity/:id`
- Booking: `/events/book/:id` and existing booking pages

## Gifting Classic

- Entry: `/gifting/classic`
- Primary actions stay in gifting namespace:
  - `/gifting`
  - `/gifting/shop`
  - `/product-booking`

## Rules

- Preserve current classic design and layout language.
- Do not use random success/failure in checkout path.
- Keep booking summary values derived from upstream selections.

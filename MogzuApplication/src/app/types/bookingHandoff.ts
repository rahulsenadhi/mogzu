import type { ListingPricingType, ListingPriceType, OfferSubmitPayload, RequestSubmitPayload } from '@/app/components/ui/PriceBlock';

export type BookingHandoffListingSnapshot = {
  id: string;
  name: string;
  image?: string;
  city?: string;
  vendor_name?: string;
  rating?: number;
};

export type BookingHandoffPayload = {
  listing: BookingHandoffListingSnapshot;
  pricing_type: ListingPricingType;
  price_type?: ListingPriceType;
  group_size: number;
  duration: string;
  selected_date?: string;
  selected_slot?: string;
  add_on_names: string[];
  /** Transparent / offer: numeric breakdown */
  base_total?: number;
  addon_total?: number;
  platform_fee?: number;
  grand_total?: number;
  offer?: OfferSubmitPayload;
  request?: RequestSubmitPayload;
  /** ISO timestamp when handoff was created */
  created_at: string;
};

export function isBookingHandoffPayload(x: unknown): x is BookingHandoffPayload {
  if (!x || typeof x !== 'object') return false;
  const o = x as BookingHandoffPayload;
  return (
    typeof o.listing === 'object' &&
    o.listing !== null &&
    typeof (o.listing as BookingHandoffListingSnapshot).id === 'string' &&
    typeof (o.listing as BookingHandoffListingSnapshot).name === 'string' &&
    typeof o.pricing_type === 'string' &&
    typeof o.group_size === 'number' &&
    typeof o.duration === 'string' &&
    Array.isArray(o.add_on_names) &&
    typeof o.created_at === 'string'
  );
}

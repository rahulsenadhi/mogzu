import type { VendorModuleId } from '@/app/data/vendorServiceCatalog';

export interface VendorSelectionItem {
  module: VendorModuleId;
  categories: string[];
}

export interface VendorOnboardingSubmitPayload {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  stateRegion: string;
  gstOptional?: string;
  pitch?: string;
  selection: VendorSelectionItem[];
}

export interface VendorOnboardingSubmitResponse {
  onboardingId: string;
  status: 'saved' | 'submitted';
}

export interface VendorListingSubmitPayload {
  onboardingId: string;
  spaceName: string;
  description: string;
  location: string;
  mapLink?: string;
  maxCapacity?: string;
  standing?: string;
  parliament?: string;
  block?: string;
  boarding?: string;
  amenities?: string;
  /** Comma-separated: activity,event,gift,space,hey_genie */
  listingProfileIds?: string;
  longDescription?: string;
  galleryImagesNote?: string;
  pricingMode?: string;
  price?: string;
  priceUnit?: string;
  gstApplicable?: string;
  gstRate?: string;
  activityCategory?: string;
  coverageArea?: string;
  groupSizeMin?: string;
  groupSizeMax?: string;
  durationOptions?: string;
  equipmentProvided?: string;
  equipmentRequiredFromClient?: string;
  pricingPerHeadOrSession?: string;
  availabilityCalendar?: string;
  cancellationPolicy?: string;
  eventTypeCategory?: string;
  venueOrTravel?: string;
  guestCapacity?: string;
  servicesOffered?: string;
  setupBreakdownTime?: string;
  equipmentAvProvided?: string;
  cateringOptions?: string;
  pricingPerEventOrDay?: string;
  eventAvailabilityCalendar?: string;
  eventCancellationPolicy?: string;
  productCategory?: string;
  productVariants?: string;
  minOrderQty?: string;
  maxOrderQty?: string;
  bulkPricingTiers?: string;
  customisationOptions?: string;
  deliveryTimeline?: string;
  deliveryCoverageCities?: string;
  stockAvailability?: string;
  couponOfferSummary?: string;
}

export interface VendorListingSubmitResponse {
  listingId: string;
  status: 'saved' | 'submitted';
}

function getApiBase(): string {
  const envBase = import.meta.env.VITE_VENDOR_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  return typeof envBase === 'string' ? envBase.trim() : '';
}

async function postJson<T>(path: string, payload: unknown, fallback: T): Promise<T> {
  const base = getApiBase();
  if (!base) {
    await new Promise((r) => setTimeout(r, 350));
    return fallback;
  }

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  const data = (await res.json().catch(() => null)) as T | null;
  return data ?? fallback;
}

export async function submitVendorOnboarding(
  payload: VendorOnboardingSubmitPayload
): Promise<VendorOnboardingSubmitResponse> {
  return postJson<VendorOnboardingSubmitResponse>('/vendor/onboarding', payload, {
    onboardingId: `onb-${Date.now()}`,
    status: 'submitted',
  });
}

export async function submitVendorListing(
  payload: VendorListingSubmitPayload
): Promise<VendorListingSubmitResponse> {
  return postJson<VendorListingSubmitResponse>('/vendor/onboarding/listing', payload, {
    listingId: `lst-${Date.now()}`,
    status: 'submitted',
  });
}

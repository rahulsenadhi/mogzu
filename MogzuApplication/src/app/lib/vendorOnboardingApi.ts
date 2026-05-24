import type { VendorModuleId } from '@/app/data/vendorServiceCatalog';
import { submitApplication } from '@/lib/vendorOnboarding';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ListingStatus, ModuleId } from '@/lib/database.types';

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
  vendorId?: string;
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

function profileToModule(profileId: string): ModuleId {
  switch (profileId.trim()) {
    case 'gift':
    case 'hey_genie':
      return 'gifting';
    case 'space':
      return 'spacex_coworking';
    case 'activity':
    case 'event':
    default:
      return 'events';
  }
}

function resolveListingModule(listingProfileIds?: string): ModuleId {
  const first = listingProfileIds?.split(',')[0]?.trim();
  return profileToModule(first ?? 'space');
}

function mapPricingType(mode?: string): 'transparent' | 'offer' | 'request_for_price' {
  if (mode === 'fixed') return 'transparent';
  if (mode === 'negotiable') return 'offer';
  return 'request_for_price';
}

function mapPriceUnit(unit?: string): 'per_person' | 'flat' | 'per_hour' | 'per_day' | null {
  const u = (unit ?? '').toLowerCase();
  if (u.includes('person') || u.includes('head')) return 'per_person';
  if (u.includes('hour')) return 'per_hour';
  if (u.includes('day')) return 'per_day';
  if (u.trim()) return 'flat';
  return null;
}

function parseOptionalNumber(raw?: string): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

async function resolveVendorId(explicitVendorId?: string): Promise<string | null> {
  if (explicitVendorId?.trim()) return explicitVendorId.trim();

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return null;

  const { data: vendorRow } = await db.vendors.getByUserId(userId);
  return vendorRow?.id ?? null;
}

export async function submitVendorOnboarding(
  payload: VendorOnboardingSubmitPayload
): Promise<VendorOnboardingSubmitResponse> {
  // Primary path: persist application through Supabase onboarding RPC.
  const { id, error } = await submitApplication({
    applicant_email: payload.email.trim().toLowerCase(),
    applicant_name: payload.fullName.trim(),
    business_name: payload.businessName.trim(),
    region: 'in',
    kyc_provider: 'manual',
    payout_method: {
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      state: payload.stateRegion.trim(),
      gst: payload.gstOptional?.trim() || null,
    },
    catalogue_draft: payload.selection.map((s) => ({
      module: s.module,
      categories: s.categories,
    })),
  });
  if (id) {
    return { onboardingId: id, status: 'submitted' };
  }

  // Secondary path: if an external vendor API is configured, keep compatibility.
  const base = getApiBase();
  if (base) {
    return postJson<VendorOnboardingSubmitResponse>('/vendor/onboarding', payload, {
      onboardingId: `onb-${Date.now()}`,
      status: 'submitted',
    });
  }

  if (error) {
    throw new Error(error);
  }
  return {
    onboardingId: `onb-${Date.now()}`,
    status: 'submitted',
  };
}

export async function submitVendorListing(
  payload: VendorListingSubmitPayload
): Promise<VendorListingSubmitResponse> {
  const vendorId = await resolveVendorId(payload.vendorId);

  if (vendorId) {
    const module = resolveListingModule(payload.listingProfileIds);
    const basePrice = parseOptionalNumber(payload.price);
    const minCap = parseOptionalNumber(payload.groupSizeMin ?? payload.minOrderQty ?? payload.maxCapacity);
    const maxCap = parseOptionalNumber(payload.groupSizeMax ?? payload.maxOrderQty ?? payload.guestCapacity ?? payload.maxCapacity);
    const cancellation =
      payload.cancellationPolicy?.trim() ||
      payload.eventCancellationPolicy?.trim() ||
      null;

    const metadata: Record<string, unknown> = {
      onboarding_id: payload.onboardingId,
      listing_profile_ids: payload.listingProfileIds ?? null,
      map_link: payload.mapLink ?? null,
      long_description: payload.longDescription ?? null,
      gallery_images_note: payload.galleryImagesNote ?? null,
      gst_applicable: payload.gstApplicable ?? null,
      gst_rate: payload.gstRate ?? null,
      space: {
        standing: payload.standing ?? null,
        parliament: payload.parliament ?? null,
        block: payload.block ?? null,
        boarding: payload.boarding ?? null,
        amenities: payload.amenities ?? null,
      },
      activity: {
        category: payload.activityCategory ?? null,
        coverage_area: payload.coverageArea ?? null,
        duration_options: payload.durationOptions ?? null,
        equipment_provided: payload.equipmentProvided ?? null,
        equipment_required: payload.equipmentRequiredFromClient ?? null,
        pricing_per_head_or_session: payload.pricingPerHeadOrSession ?? null,
        availability_calendar: payload.availabilityCalendar ?? null,
      },
      event: {
        type_category: payload.eventTypeCategory ?? null,
        venue_or_travel: payload.venueOrTravel ?? null,
        services_offered: payload.servicesOffered ?? null,
        setup_breakdown_time: payload.setupBreakdownTime ?? null,
        equipment_av: payload.equipmentAvProvided ?? null,
        catering_options: payload.cateringOptions ?? null,
        pricing_per_event_or_day: payload.pricingPerEventOrDay ?? null,
        availability_calendar: payload.eventAvailabilityCalendar ?? null,
      },
      gift: {
        product_category: payload.productCategory ?? null,
        product_variants: payload.productVariants ?? null,
        bulk_pricing_tiers: payload.bulkPricingTiers ?? null,
        customisation_options: payload.customisationOptions ?? null,
        delivery_timeline: payload.deliveryTimeline ?? null,
        delivery_coverage_cities: payload.deliveryCoverageCities ?? null,
        stock_availability: payload.stockAvailability ?? null,
      },
      hey_genie: {
        coupon_offer_summary: payload.couponOfferSummary ?? null,
      },
    };

    const listingStatus: ListingStatus = 'pending_approval';

    const { data, error } = await db.listings.create({
      vendor_id: vendorId,
      module,
      category_id: null,
      title: payload.spaceName.trim(),
      description: payload.description.trim() || payload.longDescription?.trim() || null,
      status: listingStatus,
      pricing_type: mapPricingType(payload.pricingMode),
      base_price: basePrice,
      price_unit: mapPriceUnit(payload.priceUnit),
      min_capacity: minCap,
      max_capacity: maxCap,
      location_city: payload.location.trim() || null,
      location_address: payload.mapLink?.trim() || null,
      cancellation_policy: cancellation,
      confirmation_sla_hours: 24,
      buffer_minutes: 0,
      is_mogzu_direct: false,
      public_visible: false,
      metadata,
    });

    if (error || !data?.id) {
      throw new Error(error?.message ?? 'Could not save listing to Supabase.');
    }

    return { listingId: data.id, status: 'submitted' };
  }

  // Fallback: external vendor API when configured.
  const base = getApiBase();
  if (base) {
    return postJson<VendorListingSubmitResponse>('/vendor/onboarding/listing', payload, {
      listingId: `lst-${Date.now()}`,
      status: 'submitted',
    });
  }

  return postJson<VendorListingSubmitResponse>('/vendor/onboarding/listing', payload, {
    listingId: `lst-${Date.now()}`,
    status: 'submitted',
  });
}

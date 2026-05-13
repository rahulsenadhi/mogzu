/**
 * Reads vendor module selection from localStorage.
 * Primary: onboarding draft. Fallback: completed onboarding record (after submit)
 * when the draft has no modules and onboarding is marked complete.
 * Exact VendorModuleId values match vendorServiceCatalog.ts.
 */
import type { VendorModuleId } from '@/app/data/vendorServiceCatalog';
import {
  ONBOARDING_COMPLETED_KEY,
  ONBOARDING_DRAFT_KEY,
  hasOnboardingCompleted,
} from '@/app/lib/vendorOnboardingStorage';

export type VendorListingProfileId = 'activity' | 'event' | 'gift' | 'space' | 'hey_genie';

const ACTIVITY_MODULES: VendorModuleId[] = ['giev_events_activity', 'spacex_activities'];
const EVENT_MODULES: VendorModuleId[] = ['giev_events_services'];
const GIFT_MODULES: VendorModuleId[] = ['giev_gifting'];
const SPACE_MODULES: VendorModuleId[] = ['spacex_meeting', 'spacex_stay', 'spacex_promotions'];
const HEY_GENIE_MODULES: VendorModuleId[] = ['hey_genie'];

export type VendorSelectionRow = { module: VendorModuleId; categories: string[] };

function parseSelectionRows(raw: string | null): VendorSelectionRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { selection?: unknown };
    if (!Array.isArray(parsed.selection)) return [];
    return parsed.selection.filter(
      (s) =>
        s &&
        typeof s === 'object' &&
        typeof (s as VendorSelectionRow).module === 'string' &&
        Array.isArray((s as VendorSelectionRow).categories)
    ) as VendorSelectionRow[];
  } catch {
    return [];
  }
}

export function getVendorModuleSelectionFromDraft(): VendorSelectionRow[] {
  const fromDraft = parseSelectionRows(localStorage.getItem(ONBOARDING_DRAFT_KEY));
  if (fromDraft.length > 0) return fromDraft;
  if (hasOnboardingCompleted()) {
    return parseSelectionRows(localStorage.getItem(ONBOARDING_COMPLETED_KEY));
  }
  return [];
}

export function getActiveVendorModuleIds(): VendorModuleId[] {
  return getVendorModuleSelectionFromDraft().map((s) => s.module);
}

/** One row per profile; order stable for UI. Empty draft → single `space` default for listing UX. */
export function getVendorListingProfileIds(): VendorListingProfileId[] {
  const modSet = new Set(getActiveVendorModuleIds());
  const out: VendorListingProfileId[] = [];
  if ([...modSet].some((m) => ACTIVITY_MODULES.includes(m))) out.push('activity');
  if ([...modSet].some((m) => EVENT_MODULES.includes(m))) out.push('event');
  if ([...modSet].some((m) => GIFT_MODULES.includes(m))) out.push('gift');
  if ([...modSet].some((m) => SPACE_MODULES.includes(m))) out.push('space');
  if ([...modSet].some((m) => HEY_GENIE_MODULES.includes(m))) out.push('hey_genie');
  return out.length > 0 ? out : ['space'];
}

export function vendorHasModule(moduleId: VendorModuleId): boolean {
  return getActiveVendorModuleIds().includes(moduleId);
}

/** Nav / dashboard: which app areas are relevant for this partner. */
export function getVendorNavVisibility() {
  let ids = getActiveVendorModuleIds();
  // Match listing UX: empty draft → treat as space partner so shell nav is usable.
  if (ids.length === 0) {
    ids = ['spacex_meeting'];
  }
  const set = new Set(ids);
  return {
    showSpacex: [...set].some((m) => m.startsWith('spacex_')),
    showProducts: set.has('giev_gifting'),
    showEventActivity: set.has('giev_events_activity'),
    showEventsServices: set.has('giev_events_services'),
    showPromotions: set.has('hey_genie') || set.has('spacex_promotions'),
    /** Calendar / orders useful for any operating vendor */
    showOrders: ids.length > 0,
    showCommunication: ids.length > 0,
    showUsers: ids.length > 0,
    showReviews: ids.length > 0,
    showReports: ids.length > 0,
    showCalendar: ids.length > 0,
    showNotifications: ids.length > 0,
    showSettings: ids.length > 0,
  };
}

export type VendorNavVisibility = ReturnType<typeof getVendorNavVisibility>;

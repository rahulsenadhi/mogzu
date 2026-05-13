/**
 * Corporate-visible vendors after admin approval (localStorage only).
 */
export const CORPORATE_APPROVED_VENDORS_KEY = 'mogzu_corporate_approved_vendors';

export const CORPORATE_VENDOR_DIRECTORY_UPDATED_EVENT = 'mogzu-corporate-vendor-directory-updated';

export type CorporateVendorTab = 'SpaceX' | 'Events' | 'Gifting';

export type CorporateVisibleVendor = {
  onboardingId: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  stateRegion?: string;
  servicesSummary?: string;
  approvedAt: number;
  categories: CorporateVendorTab[];
};

function inferCategories(summary?: string): CorporateVendorTab[] {
  const s = (summary || '').toLowerCase();
  const set = new Set<CorporateVendorTab>();
  if (/(gifting|giev|swag|hamper|merchandise)/.test(s)) set.add('Gifting');
  if (/(event|catering|activity|workshop|service|audio|transport)/.test(s)) set.add('Events');
  if (/(space|spacex|meeting|venue|stay|promotion|cowork|conference)/.test(s)) set.add('SpaceX');
  if (set.size === 0) set.add('SpaceX');
  return [...set];
}

function safeParse(raw: string | null): CorporateVisibleVendor[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is CorporateVisibleVendor =>
        v &&
        typeof v === 'object' &&
        typeof (v as CorporateVisibleVendor).onboardingId === 'string' &&
        typeof (v as CorporateVisibleVendor).businessName === 'string'
    );
  } catch {
    return [];
  }
}

export function loadCorporateApprovedVendors(): CorporateVisibleVendor[] {
  return safeParse(localStorage.getItem(CORPORATE_APPROVED_VENDORS_KEY));
}

export function addApprovedVendorForCorporate(entry: {
  onboardingId: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  stateRegion?: string;
  servicesSummary?: string;
}): void {
  const existing = loadCorporateApprovedVendors();
  if (existing.some((v) => v.onboardingId === entry.onboardingId)) return;
  const row: CorporateVisibleVendor = {
    onboardingId: entry.onboardingId.trim(),
    businessName: entry.businessName.trim(),
    fullName: entry.fullName.trim(),
    email: entry.email.trim(),
    phone: entry.phone.trim(),
    city: entry.city.trim(),
    stateRegion: entry.stateRegion?.trim(),
    servicesSummary: entry.servicesSummary,
    approvedAt: Date.now(),
    categories: inferCategories(entry.servicesSummary),
  };
  localStorage.setItem(CORPORATE_APPROVED_VENDORS_KEY, JSON.stringify([row, ...existing]));
  try {
    window.dispatchEvent(new Event(CORPORATE_VENDOR_DIRECTORY_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

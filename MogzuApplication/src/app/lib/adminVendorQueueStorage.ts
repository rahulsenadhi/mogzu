/**
 * Frontend-only queue: vendors who submitted onboarding appear here for admin review.
 */
import { ONBOARDING_COMPLETED_KEY } from '@/app/lib/vendorOnboardingStorage';
import { addApprovedVendorForCorporate } from '@/app/lib/corporateVendorDirectoryStorage';

export const ADMIN_PENDING_VENDORS_KEY = 'mogzu_admin_pending_vendors';

export const ADMIN_PENDING_VENDORS_UPDATED_EVENT = 'mogzu-admin-pending-vendors-updated';

export type AdminPendingVendorStatus = 'pending_approval';

export type AdminPendingVendor = {
  id: string;
  onboardingId: string;
  businessName: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  stateRegion?: string;
  submittedAt: number;
  status: AdminPendingVendorStatus;
  /** Short summary of selected modules/categories */
  servicesSummary?: string;
};

function safeParse(raw: string | null): AdminPendingVendor[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is AdminPendingVendor =>
        v &&
        typeof v === 'object' &&
        typeof (v as AdminPendingVendor).onboardingId === 'string' &&
        typeof (v as AdminPendingVendor).businessName === 'string'
    );
  } catch {
    return [];
  }
}

export function loadPendingVendors(): AdminPendingVendor[] {
  return safeParse(localStorage.getItem(ADMIN_PENDING_VENDORS_KEY));
}

/**
 * Idempotent per onboardingId: same submit does not duplicate rows.
 */
export function enqueuePendingVendorForAdmin(entry: {
  onboardingId: string;
  businessName: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  stateRegion?: string;
  servicesSummary?: string;
}): void {
  const existing = loadPendingVendors();
  if (existing.some((v) => v.onboardingId === entry.onboardingId)) return;
  const row: AdminPendingVendor = {
    id: `pv-${entry.onboardingId}`,
    onboardingId: entry.onboardingId,
    businessName: entry.businessName,
    email: entry.email,
    fullName: entry.fullName,
    phone: entry.phone,
    city: entry.city,
    stateRegion: entry.stateRegion,
    submittedAt: Date.now(),
    status: 'pending_approval',
    servicesSummary: entry.servicesSummary,
  };
  localStorage.setItem(ADMIN_PENDING_VENDORS_KEY, JSON.stringify([row, ...existing]));
  try {
    window.dispatchEvent(new Event(ADMIN_PENDING_VENDORS_UPDATED_EVENT));
  } catch {
    // ignore (non-browser)
  }
}

/** Shape written to ONBOARDING_COMPLETED_KEY after registration (subset used for admin queue). */
type OnboardingCompletedForAdmin = {
  onboardingId?: string;
  businessName?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  city?: string;
  stateRegion?: string;
  servicesSummary?: string;
};

/**
 * Ensures a row exists for the current onboarding-completed record (repairs missed enqueue or stale admin data).
 */
export function syncPendingVendorFromOnboardingCompleted(): void {
  try {
    const raw = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!raw) return;
    const c = JSON.parse(raw) as OnboardingCompletedForAdmin;
    if (!c.onboardingId?.trim() || !c.businessName?.trim()) return;
    enqueuePendingVendorForAdmin({
      onboardingId: c.onboardingId.trim(),
      businessName: c.businessName.trim(),
      email: c.email?.trim() || '—',
      fullName: c.fullName?.trim() || '—',
      phone: c.phone?.trim() || '—',
      city: c.city?.trim() || '—',
      stateRegion: c.stateRegion?.trim(),
      servicesSummary: c.servicesSummary,
    });
  } catch {
    // ignore
  }
}

/** Remove from pending queue and expose vendor on corporate directory (Vendor Passport search). */
export function approvePendingVendorForCorporate(onboardingId: string): void {
  const pending = loadPendingVendors();
  const row = pending.find((v) => v.onboardingId === onboardingId);
  if (!row) return;
  const next = pending.filter((v) => v.onboardingId !== onboardingId);
  localStorage.setItem(ADMIN_PENDING_VENDORS_KEY, JSON.stringify(next));
  addApprovedVendorForCorporate({
    onboardingId: row.onboardingId,
    businessName: row.businessName,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    city: row.city,
    stateRegion: row.stateRegion,
    servicesSummary: row.servicesSummary,
  });
  try {
    window.dispatchEvent(new Event(ADMIN_PENDING_VENDORS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

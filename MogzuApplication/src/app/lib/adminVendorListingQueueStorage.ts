/**
 * Frontend-only queue: vendor listing submissions for admin review.
 */
import { addCorporateApprovedListingFromPending } from '@/app/lib/corporateApprovedListingsStorage';

export const ADMIN_PENDING_LISTINGS_KEY = 'mogzu_admin_pending_listings';

export const ADMIN_PENDING_LISTINGS_UPDATED_EVENT = 'mogzu-admin-pending-listings-updated';

export type AdminPendingListingStatus = 'pending_review';

export type AdminPendingListing = {
  id: string;
  listingId: string;
  onboardingId: string;
  businessName: string;
  vendorEmail?: string;
  listingTitle: string;
  shortDescription: string;
  location: string;
  listingProfileIds?: string;
  submittedAt: number;
  status: AdminPendingListingStatus;
};

function safeParse(raw: string | null): AdminPendingListing[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is AdminPendingListing =>
        v &&
        typeof v === 'object' &&
        typeof (v as AdminPendingListing).listingId === 'string' &&
        typeof (v as AdminPendingListing).onboardingId === 'string' &&
        typeof (v as AdminPendingListing).listingTitle === 'string'
    );
  } catch {
    return [];
  }
}

export function loadPendingListings(): AdminPendingListing[] {
  return safeParse(localStorage.getItem(ADMIN_PENDING_LISTINGS_KEY));
}

export function enqueuePendingListingForAdmin(entry: {
  listingId: string;
  onboardingId: string;
  businessName: string;
  vendorEmail?: string;
  listingTitle: string;
  shortDescription: string;
  location: string;
  listingProfileIds?: string;
}): void {
  const existing = loadPendingListings();
  if (existing.some((v) => v.listingId === entry.listingId)) return;
  const row: AdminPendingListing = {
    id: `pl-${entry.listingId}`,
    listingId: entry.listingId,
    onboardingId: entry.onboardingId,
    businessName: entry.businessName,
    vendorEmail: entry.vendorEmail,
    listingTitle: entry.listingTitle,
    shortDescription: entry.shortDescription,
    location: entry.location,
    listingProfileIds: entry.listingProfileIds,
    submittedAt: Date.now(),
    status: 'pending_review',
  };
  localStorage.setItem(ADMIN_PENDING_LISTINGS_KEY, JSON.stringify([row, ...existing]));
  try {
    window.dispatchEvent(new Event(ADMIN_PENDING_LISTINGS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

/** Remove from admin pending and add to corporate-approved listings (browse/search by profile). */
export function approvePendingListingForCorporate(listingId: string): void {
  const pending = loadPendingListings();
  const row = pending.find((l) => l.listingId === listingId);
  if (!row) return;
  const next = pending.filter((l) => l.listingId !== listingId);
  localStorage.setItem(ADMIN_PENDING_LISTINGS_KEY, JSON.stringify(next));
  addCorporateApprovedListingFromPending({
    listingId: row.listingId,
    onboardingId: row.onboardingId,
    businessName: row.businessName,
    vendorEmail: row.vendorEmail,
    listingTitle: row.listingTitle,
    shortDescription: row.shortDescription,
    location: row.location,
    listingProfileIds: row.listingProfileIds,
    submittedAt: row.submittedAt,
  });
  try {
    window.dispatchEvent(new Event(ADMIN_PENDING_LISTINGS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

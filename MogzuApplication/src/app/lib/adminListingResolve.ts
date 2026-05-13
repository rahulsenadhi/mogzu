import type { MogzuDirectListing, PartnerListing } from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectCatalogueForAdmin,
  saveMogzuDirectCatalogueForAdmin,
} from '@/utils/mogzuDirectCatalogueAdmin';
import { loadPartnerListings, savePartnerListings } from '@/app/lib/mogzuDomain';

export type AdminResolvedListing =
  | { kind: 'partner'; listing: PartnerListing }
  | { kind: 'mogzu_direct'; listing: MogzuDirectListing };

export const findAdminListingById = (id: string): AdminResolvedListing | null => {
  const decoded = decodeURIComponent(id.trim());
  const partners = loadPartnerListings();
  const p = partners.find((r) => r.id === decoded);
  if (p) return { kind: 'partner', listing: p };
  const direct = loadMogzuDirectCatalogueForAdmin();
  const d = direct.find((r) => r.id === decoded);
  if (d) return { kind: 'mogzu_direct', listing: d };
  return null;
};

export const updatePartnerListingInStore = (next: PartnerListing) => {
  const rows = loadPartnerListings().map((r) => (r.id === next.id ? next : r));
  savePartnerListings(rows);
};

export const updateMogzuDirectListingInStore = (next: MogzuDirectListing) => {
  const rows = loadMogzuDirectCatalogueForAdmin().map((r) => (r.id === next.id ? next : r));
  saveMogzuDirectCatalogueForAdmin(rows);
};

export const allAdminListingsRows = (): AdminResolvedListing[] => {
  const partner = loadPartnerListings().map((listing) => ({ kind: 'partner' as const, listing }));
  const direct = loadMogzuDirectCatalogueForAdmin().map((listing) => ({
    kind: 'mogzu_direct' as const,
    listing,
  }));
  return [...partner, ...direct];
};

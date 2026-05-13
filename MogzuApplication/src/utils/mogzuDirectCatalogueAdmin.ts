import type { MogzuDirectListing } from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectListings,
  MOGZU_DOMAIN_STORAGE_EVENT,
  normalizeMogzuDirectListing,
} from '@/app/lib/mogzuDomain';
import { mapMogzuDirectToCatalogue, MOGZU_DIRECT_CATALOGUE_KEY } from '@/utils/catalogueUtils';

function safeParseJsonArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function catalogueStatusFromDomain(
  s: MogzuDirectListing['status'],
): 'active' | 'draft' | 'archived' {
  if (s === 'active') return 'active';
  if (s === 'paused' || s === 'rejected' || s === 'archived') return 'archived';
  return 'draft';
}

/**
 * Persists one Mogzu Direct row for `mogzu_direct_catalogue` with required catalogue metadata
 * plus `direct_listing` for full admin round-trip.
 */
export function mogzuDirectListingToStorageRow(l: MogzuDirectListing): Record<string, unknown> {
  const cat = mapMogzuDirectToCatalogue(l);
  const catalogueStatus = catalogueStatusFromDomain(l.status);
  return {
    direct_listing: l,
    ...cat,
    status: catalogueStatus,
    is_available: l.status === 'active',
    source_type: 'mogzu_direct',
    is_mogzu_direct: true,
    vendor_name: 'Mogzu',
  };
}

export function parseStorageRowToMogzuDirectListing(item: unknown): MogzuDirectListing | null {
  if (!item || typeof item !== 'object') return null;
  const r = item as Record<string, unknown>;
  if (r.direct_listing && typeof r.direct_listing === 'object') {
    return normalizeMogzuDirectListing(r.direct_listing);
  }
  return normalizeMogzuDirectListing(item);
}

/** Admin list / form: reads `mogzu_direct_catalogue`, falls back to legacy `mogzu_direct_listings` when empty. */
export function loadMogzuDirectCatalogueForAdmin(): MogzuDirectListing[] {
  if (typeof localStorage === 'undefined') return [];
  const arr = safeParseJsonArray(localStorage.getItem(MOGZU_DIRECT_CATALOGUE_KEY));
  if (arr.length === 0) {
    return loadMogzuDirectListings();
  }
  const out: MogzuDirectListing[] = [];
  for (const item of arr) {
    const n = parseStorageRowToMogzuDirectListing(item);
    if (n) out.push(n);
  }
  return out;
}

/** Writes only to `mogzu_direct_catalogue` (not `mogzu_direct_listings`). */
export function saveMogzuDirectCatalogueForAdmin(rows: MogzuDirectListing[]): void {
  if (typeof localStorage === 'undefined') return;
  const out = rows.map((row) => {
    const id = row.id?.trim() || crypto.randomUUID();
    const rowWithId = id === row.id ? row : { ...row, id };
    return mogzuDirectListingToStorageRow(rowWithId);
  });
  localStorage.setItem(MOGZU_DIRECT_CATALOGUE_KEY, JSON.stringify(out));
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(MOGZU_DOMAIN_STORAGE_EVENT, { detail: { key: MOGZU_DIRECT_CATALOGUE_KEY } }),
      );
    }
  } catch {
    /* ignore */
  }
}

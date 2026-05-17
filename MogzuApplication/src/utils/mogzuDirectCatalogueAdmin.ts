// Phase 2 Feature 7 — Mogzu Direct catalogue admin helpers.
//
// Supabase is the source of truth (table `listings` where
// `is_mogzu_direct = TRUE`). localStorage is retained as a synchronous
// cache so the existing list/form/wizard pages can keep their sync
// `useState(() => load())` initialisers. Pages call
// `refreshMogzuDirectCatalogueAsync()` on mount to pull the latest from
// Supabase. Writes go through `saveMogzuDirectCatalogueForAdmin()`,
// which updates the cache immediately, fires the storage event, and
// pushes the diff to Supabase in the background.

import type { MogzuDirectListing } from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectListings,
  MOGZU_DOMAIN_STORAGE_EVENT,
  normalizeMogzuDirectListing,
  saveMogzuDirectListings,
} from '@/app/lib/mogzuDomain';
import {
  mapMogzuDirectToCatalogue,
  MOGZU_DIRECT_CATALOGUE_KEY,
} from '@/utils/catalogueUtils';
import { db, type MogzuDirectListingRow, type MogzuDirectListingInput } from '@/lib/db';

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

function writeCacheRaw(rows: MogzuDirectListing[]): void {
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

// ─── Supabase adapter ────────────────────────────────────────────────────────

// `listings.module` allows events|gifting|spacex_coworking|spacex_stay. The
// Mogzu Direct admin still talks in dspace|gifting|events; map both ways.
function moduleToDb(m: MogzuDirectListing['module']): string {
  if (m === 'dspace') return 'spacex_coworking';
  return m;
}

function moduleFromDb(m: string): MogzuDirectListing['module'] {
  if (m === 'spacex_coworking' || m === 'spacex_stay') return 'dspace';
  if (m === 'gifting') return 'gifting';
  return 'events';
}

function pricingModeToDb(m: MogzuDirectListing['pricing_mode']): string {
  if (m === 'negotiable') return 'offer';
  if (m === 'on_request') return 'request_for_price';
  return 'transparent';
}

function statusToDb(s: MogzuDirectListing['status']): string {
  if (s === 'archived') return 'paused';
  return s;
}

function domainToInput(l: MogzuDirectListing): MogzuDirectListingInput {
  return {
    module: moduleToDb(l.module),
    title: l.title,
    description: l.description_long || l.description_short || null,
    status: statusToDb(l.status),
    pricing_type:
      l.pricing_type === 'offer_price'
        ? 'offer'
        : l.pricing_type === 'request_for_price'
          ? 'request_for_price'
          : l.pricing_type === 'transparent'
            ? 'transparent'
            : pricingModeToDb(l.pricing_mode),
    base_price: l.base_price ?? l.starting_price ?? l.price ?? null,
    price_unit: l.price_unit ?? null,
    location_city: l.city ?? null,
    mogzu_direct_alias: l.mogzu_direct_alias ?? null,
    listing_kind: l.listing_kind ?? null,
    metadata: { direct_listing: l },
  };
}

function rowToDomain(r: MogzuDirectListingRow): MogzuDirectListing | null {
  const meta = r.metadata as { direct_listing?: unknown } | null;
  if (meta && typeof meta === 'object' && meta.direct_listing) {
    const n = normalizeMogzuDirectListing(meta.direct_listing);
    if (n) {
      return {
        ...n,
        id: r.id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        status: (n.status ?? 'draft') as MogzuDirectListing['status'],
      };
    }
  }
  return normalizeMogzuDirectListing({
    id: r.id,
    owner_type: 'mogzu_direct',
    module: moduleFromDb(r.module),
    title: r.title,
    description_short: r.description ?? '',
    description_long: r.description ?? '',
    images: (r.images ?? []).map((i) => i.storage_path),
    category: r.listing_kind ?? '',
    pricing_mode:
      r.pricing_type === 'request_for_price'
        ? 'on_request'
        : r.pricing_type === 'offer'
          ? 'negotiable'
          : 'fixed',
    price: Number(r.base_price ?? 0),
    price_unit: r.price_unit ?? 'unit',
    status: r.status as MogzuDirectListing['status'],
    managed_by: 'mogzu_team',
    created_at: r.created_at,
    updated_at: r.updated_at,
  });
}

// Pull the latest from Supabase, write through to the cache, and return
// the materialised rows. On error, returns the existing cache snapshot so
// the UI does not blank out.
export async function refreshMogzuDirectCatalogueAsync(): Promise<MogzuDirectListing[]> {
  try {
    const { data, error } = await db.mogzuDirect.list(true);
    if (error) {
      console.warn('mogzu_direct refresh failed', error);
      return loadMogzuDirectCatalogueForAdmin();
    }
    const rows = ((data ?? []) as MogzuDirectListingRow[])
      .map(rowToDomain)
      .filter((r): r is MogzuDirectListing => r !== null);
    writeCacheRaw(rows);
    // Mirror to the legacy `mogzu_direct_listings` key so the corporate
    // catalogue helpers (which still read the domain table directly)
    // surface the same Supabase-sourced rows without an extra fetch.
    saveMogzuDirectListings(rows);
    return rows;
  } catch (e) {
    console.warn('mogzu_direct refresh threw', e);
    return loadMogzuDirectCatalogueForAdmin();
  }
}

async function syncRowsToSupabase(
  prev: MogzuDirectListing[],
  next: MogzuDirectListing[],
): Promise<void> {
  const prevById = new Map(prev.map((r) => [r.id, r]));
  const nextIds = new Set(next.map((r) => r.id));
  let serverChanged = false;

  for (const row of next) {
    const before = prevById.get(row.id);
    const input = domainToInput(row);
    if (!before) {
      const { data, error } = await db.mogzuDirect.create(input);
      if (error) {
        console.warn('mogzu_direct create failed', error);
        continue;
      }
      const newId = typeof data === 'string' ? data : row.id;
      if (row.images?.length) {
        const img = await db.mogzuDirect.setImages(newId, row.images);
        if (img.error) console.warn('mogzu_direct setImages failed', img.error);
      }
      serverChanged = true;
    } else if (JSON.stringify(before) !== JSON.stringify(row)) {
      const { error } = await db.mogzuDirect.update(row.id, input);
      if (error) {
        console.warn('mogzu_direct update failed', error);
        continue;
      }
      const prevImgs = JSON.stringify(before.images ?? []);
      const nextImgs = JSON.stringify(row.images ?? []);
      if (prevImgs !== nextImgs) {
        const img = await db.mogzuDirect.setImages(row.id, row.images ?? []);
        if (img.error) console.warn('mogzu_direct setImages failed', img.error);
      }
      serverChanged = true;
    }
  }

  for (const row of prev) {
    if (!nextIds.has(row.id)) {
      const { error } = await db.mogzuDirect.remove(row.id);
      if (error) console.warn('mogzu_direct delete failed', error);
      else serverChanged = true;
    }
  }

  if (serverChanged) {
    await refreshMogzuDirectCatalogueAsync();
  }
}

// Optimistic sync save: writes the cache immediately so the UI updates,
// then pushes the diff to Supabase. A successful round-trip reloads the
// cache from the server (covers server-assigned UUIDs and updated_at).
export function saveMogzuDirectCatalogueForAdmin(rows: MogzuDirectListing[]): void {
  const prev = loadMogzuDirectCatalogueForAdmin();
  writeCacheRaw(rows);
  void syncRowsToSupabase(prev, rows);
}

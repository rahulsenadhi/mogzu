/**
 * Persists gift vendor catalog rows in localStorage, scoped by onboarding identity.
 * Each vendor (onboardingId or email fallback) has an isolated product list.
 */
import { ONBOARDING_COMPLETED_KEY, ONBOARDING_DRAFT_KEY } from '@/app/lib/vendorOnboardingStorage';
import type { ListingBuyerDetailBlock } from '../../../utils/mogzuDataTypes';
import { emptyBuyerDetailBlock, normalizeBuyerDetailBlock } from '../../../utils/mogzuDataTypes';

/** Mirrors vendor add-product pricing setup for buyer-facing behaviour */
export type VendorCatalogPricingModel = 'transparent' | 'opaque' | 'offer';

export type VendorCatalogProduct = {
  id: string;
  name: string;
  productId: string;
  category: string;
  qtyCapacity: number;
  /** Vendor base (transparent/opaque) or list/reference anchor (offer) */
  price: number;
  stock: 'Available' | 'Out of stock';
  pricingModel?: VendorCatalogPricingModel;
  /** Shown to buyers on top of `price` when model is transparent */
  mogzuMarkupPercent?: number;
  buyer_detail: ListingBuyerDetailBlock;
};

export const VENDOR_CATALOG_STORAGE_PREFIX = 'mogzu_vendor_catalog_products_v1_';

const STORAGE_PREFIX = VENDOR_CATALOG_STORAGE_PREFIX;

/** Demo seed per vendor the first time they open the catalog (no prior save). */
export const VENDOR_CATALOG_SEED_PRODUCTS: VendorCatalogProduct[] = [
  {
    id: '1',
    name: "Women's Cotton Stretch Half Sleeve",
    productId: 'POD30908147',
    category: 'Apparel',
    qtyCapacity: 2000,
    price: 400,
    stock: 'Available',
    buyer_detail: emptyBuyerDetailBlock(),
  },
  {
    id: '2',
    name: "Women's Cotton Stretch Half Sleeve",
    productId: 'POD30908148',
    category: 'Apparel',
    qtyCapacity: 0,
    price: 400,
    stock: 'Out of stock',
    buyer_detail: emptyBuyerDetailBlock(),
  },
  {
    id: '3',
    name: "Women's Cotton Stretch Half Sleeve",
    productId: 'POD30908149',
    category: 'Apparel',
    qtyCapacity: 2000,
    price: 400,
    stock: 'Available',
    buyer_detail: emptyBuyerDetailBlock(),
  },
  {
    id: '4',
    name: "Women's Cotton Stretch Half Sleeve",
    productId: 'POD30908150',
    category: 'Apparel',
    qtyCapacity: 2000,
    price: 400,
    stock: 'Available',
    buyer_detail: emptyBuyerDetailBlock(),
  },
  {
    id: '5',
    name: "Women's Cotton Stretch Half Sleeve",
    productId: 'POD30908151',
    category: 'Apparel',
    qtyCapacity: 2000,
    price: 400,
    stock: 'Available',
    buyer_detail: emptyBuyerDetailBlock(),
  },
];

export function getVendorCatalogScopeId(): string {
  try {
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (completed) {
      const j = JSON.parse(completed) as { onboardingId?: string; email?: string };
      if (j.onboardingId && String(j.onboardingId).trim()) return String(j.onboardingId).trim();
      if (j.email && String(j.email).trim()) {
        return `email_${String(j.email)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .slice(0, 64)}`;
      }
    }
    const draft = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (draft) {
      const j = JSON.parse(draft) as { email?: string };
      if (j.email && String(j.email).trim()) {
        return `draft_${String(j.email)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .slice(0, 64)}`;
      }
    }
  } catch {
    /* ignore */
  }
  return 'local_demo_vendor';
}

function storageKey(): string {
  return `${STORAGE_PREFIX}${getVendorCatalogScopeId()}`;
}

function normalizeVendorCatalogRow(row: unknown): VendorCatalogProduct | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  const qty = typeof r.qtyCapacity === 'number' && !Number.isNaN(r.qtyCapacity) ? r.qtyCapacity : 0;
  const price = typeof r.price === 'number' && !Number.isNaN(r.price) ? r.price : 0;
  const stock = r.stock === 'Out of stock' ? 'Out of stock' : 'Available';
  const pricingModel =
    r.pricingModel === 'transparent' || r.pricingModel === 'opaque' || r.pricingModel === 'offer'
      ? r.pricingModel
      : undefined;
  const mogzuMarkupPercent =
    typeof r.mogzuMarkupPercent === 'number' && !Number.isNaN(r.mogzuMarkupPercent)
      ? r.mogzuMarkupPercent
      : undefined;
  return {
    id: r.id,
    name: r.name,
    productId: typeof r.productId === 'string' ? r.productId : r.id,
    category: typeof r.category === 'string' ? r.category : 'Uncategorised',
    qtyCapacity: qty,
    price,
    stock,
    pricingModel,
    mogzuMarkupPercent,
    buyer_detail: normalizeBuyerDetailBlock(r.buyer_detail, []),
  };
}

/**
 * Merge all persisted vendor catalog arrays in localStorage (every scope key).
 * Used on corporate demo flows so buyer pages can resolve `buyer_detail` without vendor session.
 */
export function loadAllVendorCatalogProductsAggregated(): VendorCatalogProduct[] {
  if (typeof localStorage === 'undefined') return [];
  const byKey = new Map<string, VendorCatalogProduct>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(STORAGE_PREFIX)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed) {
        const n = normalizeVendorCatalogRow(item);
        if (n) {
          const dedupe = `${k}::${n.id}`;
          byKey.set(dedupe, n);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return [...byKey.values()];
}

export function findVendorCatalogProductByQuery(query: {
  id?: string;
  productId?: string;
}): VendorCatalogProduct | undefined {
  const id = query.id?.trim();
  const productId = query.productId?.trim();
  if (!id && !productId) return undefined;
  const all = loadAllVendorCatalogProductsAggregated();
  if (id) {
    const hit = all.find((p) => p.id === id);
    if (hit) return hit;
  }
  if (productId) {
    return all.find((p) => p.productId === productId || p.id === productId);
  }
  return undefined;
}

export function loadVendorCatalogProducts(): VendorCatalogProduct[] {
  const key = storageKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized: VendorCatalogProduct[] = [];
        let needsWrite = false;
        for (const item of parsed) {
          const n = normalizeVendorCatalogRow(item);
          if (n) {
            normalized.push(n);
            if (!item || typeof item !== 'object' || !('buyer_detail' in (item as object))) needsWrite = true;
          }
        }
        if (normalized.length > 0) {
          if (needsWrite) {
            try {
              localStorage.setItem(key, JSON.stringify(normalized));
            } catch {
              /* ignore */
            }
            notifyVendorCatalogUpdated();
          }
          return normalized;
        }
      }
    }
  } catch {
    /* ignore */
  }
  const seed = VENDOR_CATALOG_SEED_PRODUCTS.map((p) => ({ ...p }));
  try {
    localStorage.setItem(key, JSON.stringify(seed));
  } catch {
    /* ignore */
  }
  return seed;
}

export function saveVendorCatalogProducts(products: VendorCatalogProduct[]): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(products));
  } catch {
    /* ignore */
  }
}

/** Append one row (e.g. from Add product). Does not dedupe — caller supplies unique `id` / `productId`. */
export function appendVendorCatalogProduct(product: VendorCatalogProduct): void {
  const list = loadVendorCatalogProducts();
  saveVendorCatalogProducts([...list, product]);
  notifyVendorCatalogUpdated();
}

export const VENDOR_CATALOG_UPDATED_EVENT = 'mogzu-vendor-catalog-updated';

export function notifyVendorCatalogUpdated(): void {
  try {
    window.dispatchEvent(new CustomEvent(VENDOR_CATALOG_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Human-readable price column for vendor product list from catalog row */
export function formatVendorCatalogPriceLabel(p: VendorCatalogProduct): string {
  const model = p.pricingModel ?? 'transparent';
  if (model === 'opaque') return 'Quote on request';
  if (model === 'offer') return `From ₹${p.price} · offers welcome`;
  const m = p.mogzuMarkupPercent ?? 0;
  const buyer = Math.round(p.price * (1 + m / 100));
  if (m > 0) return `₹${buyer} / unit (buyer · incl. ${m}% platform)`;
  return `₹${p.price} / unit`;
}

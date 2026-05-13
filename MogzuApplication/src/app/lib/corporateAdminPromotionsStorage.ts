/**
 * Promotion banners created in Admin → Paid Promotion, shown on corporate module pages (localStorage only).
 */
export const CORPORATE_ADMIN_PROMOTIONS_KEY = 'mogzu_corporate_admin_promotions';

export const CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT = 'mogzu-corporate-admin-promotions-updated';

export type CorporateAdminPromoSector = 'SpaceX' | 'Gifting' | 'Events';

export type CorporateAdminPromotion = {
  id: string;
  sector: CorporateAdminPromoSector;
  title: string;
  subtitle: string;
  image: string;
  vendorName: string;
  subCategory: string;
  createdAt: number;
  active: boolean;
};

function safeParse(raw: string | null): CorporateAdminPromotion[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is CorporateAdminPromotion =>
        v &&
        typeof v === 'object' &&
        typeof (v as CorporateAdminPromotion).id === 'string' &&
        typeof (v as CorporateAdminPromotion).sector === 'string'
    );
  } catch {
    return [];
  }
}

export function loadCorporateAdminPromotions(): CorporateAdminPromotion[] {
  return safeParse(localStorage.getItem(CORPORATE_ADMIN_PROMOTIONS_KEY));
}

export function loadActiveCorporatePromotionsForSector(
  sector: CorporateAdminPromoSector
): CorporateAdminPromotion[] {
  return loadCorporateAdminPromotions().filter((p) => p.sector === sector && p.active);
}

/** Upsert: same id replaces (e.g. edit); new id appends. */
export function upsertCorporateAdminPromotion(entry: CorporateAdminPromotion): void {
  const list = loadCorporateAdminPromotions().filter((p) => p.id !== entry.id);
  localStorage.setItem(CORPORATE_ADMIN_PROMOTIONS_KEY, JSON.stringify([entry, ...list]));
  try {
    window.dispatchEvent(new Event(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

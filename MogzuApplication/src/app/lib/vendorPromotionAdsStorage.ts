const STORAGE_KEY = 'mogzu_vendor_promo_ads';

export type VendorPromoAd = {
  id: string;
  headline: string;
  description: string;
  impressions: number;
  clicks: number;
  contacts: number;
  status: 'Active' | 'Paused';
  plan?: 'starter' | 'growth' | 'scale';
  imageDataUrl?: string | null;
};

export const DEFAULT_VENDOR_PROMO_ADS: VendorPromoAd[] = [
  {
    id: 'ad-1',
    headline: 'Special offer on Meeting space',
    description:
      'Book your next event with us and choose from a variety of tailored packages designed for teams of every size.',
    impressions: 4500,
    clicks: 450,
    contacts: 150,
    status: 'Active',
  },
  {
    id: 'ad-2',
    headline: 'Special offer on Meeting space',
    description:
      'Book your next event with us and choose from a variety of tailored packages designed for teams of every size.',
    impressions: 4500,
    clicks: 450,
    contacts: 150,
    status: 'Active',
  },
];

export function loadVendorPromoAds(): VendorPromoAd[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_VENDOR_PROMO_ADS];
    const parsed = JSON.parse(raw) as VendorPromoAd[];
    return Array.isArray(parsed) ? parsed : [...DEFAULT_VENDOR_PROMO_ADS];
  } catch {
    return [...DEFAULT_VENDOR_PROMO_ADS];
  }
}

export function saveVendorPromoAds(ads: VendorPromoAd[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

export function getVendorPromoAdById(id: string): VendorPromoAd | undefined {
  return loadVendorPromoAds().find((a) => a.id === id);
}

export function upsertVendorPromoAd(ad: VendorPromoAd) {
  const list = loadVendorPromoAds();
  const idx = list.findIndex((a) => a.id === ad.id);
  if (idx >= 0) list[idx] = ad;
  else list.unshift(ad);
  saveVendorPromoAds(list);
}

/**
 * Corporate enquiries visible to vendor (Order request / enquiries) — localStorage only.
 */

export const CORP_VENDOR_ENQUIRIES_KEY = 'mogzu_corp_vendor_enquiries_v1';
export const CORP_VENDOR_ENQUIRY_UPDATED_EVENT = 'mogzu-corp-vendor-enquiry-updated';

export type CorpVendorBannerStatus = 'awaiting' | 'best_offer' | 'accepted' | 'declined';

export type CorpVendorEnquiry = {
  enquiryId: string;
  /** Shown as Order ID on vendor orders (e.g. ENQ-…) */
  vendorOrderId: string;
  corporateCompanyName: string;
  requirementSummary: string;
  requestedDate: string;
  durationLabel: string;
  headcountOrQty: number;
  offerAmountDisplay: string | null;
  productId: number;
  productName: string;
  source: string;
  createdAt: number;
  responseStatus: CorpVendorBannerStatus;
  vendorComment: string;
  /** Set when corporate completes payment (shared with vendor order view). */
  bookingConfirmedAt?: number;
  /** Vendor-facing settlement tracking after booking is confirmed (demo / local only). */
  payoutStatus?: 'pending' | 'paid';
};

function safeParse(raw: string | null): CorpVendorEnquiry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CorpVendorEnquiry =>
        row &&
        typeof row === 'object' &&
        typeof (row as CorpVendorEnquiry).enquiryId === 'string' &&
        typeof (row as CorpVendorEnquiry).vendorOrderId === 'string',
    );
  } catch {
    return [];
  }
}

function dispatchUpdated() {
  try {
    window.dispatchEvent(new Event(CORP_VENDOR_ENQUIRY_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function getCorporateCompanyDisplayName(): string {
  if (typeof window === 'undefined') return 'Corporate buyer';
  const v = localStorage.getItem('mogzu_corporate_company_display');
  return v?.trim() || 'Corporate buyer';
}

export function loadCorpVendorEnquiries(): CorpVendorEnquiry[] {
  return safeParse(localStorage.getItem(CORP_VENDOR_ENQUIRIES_KEY));
}

export function findCorpVendorEnquiryByVendorOrderId(vendorOrderId: string): CorpVendorEnquiry | undefined {
  return loadCorpVendorEnquiries().find((e) => e.vendorOrderId === vendorOrderId);
}

export function getLatestCorpVendorEnquiryForProduct(productId: number): CorpVendorEnquiry | undefined {
  const list = loadCorpVendorEnquiries().filter((e) => e.productId === productId);
  if (list.length === 0) return undefined;
  return [...list].sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function appendCorpVendorEnquiry(entry: {
  corporateCompanyName?: string;
  requirementSummary: string;
  requestedDate: string;
  durationLabel: string;
  headcountOrQty: number;
  offerAmountDisplay: string | null;
  productId: number;
  productName: string;
  source: string;
}): CorpVendorEnquiry {
  const enquiryId = `enq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const vendorOrderId = `ENQ-${Date.now().toString(36).toUpperCase()}`;
  const row: CorpVendorEnquiry = {
    enquiryId,
    vendorOrderId,
    corporateCompanyName: (entry.corporateCompanyName || getCorporateCompanyDisplayName()).trim(),
    requirementSummary: entry.requirementSummary.trim(),
    requestedDate: entry.requestedDate.trim(),
    durationLabel: entry.durationLabel.trim(),
    headcountOrQty: Math.max(0, Math.floor(entry.headcountOrQty)),
    offerAmountDisplay: entry.offerAmountDisplay,
    productId: entry.productId,
    productName: entry.productName.trim(),
    source: entry.source.trim(),
    createdAt: Date.now(),
    responseStatus: 'awaiting',
    vendorComment: '—',
  };
  const existing = loadCorpVendorEnquiries();
  localStorage.setItem(CORP_VENDOR_ENQUIRIES_KEY, JSON.stringify([row, ...existing]));
  dispatchUpdated();
  return row;
}

export function updateCorpVendorEnquiryByVendorOrderId(
  vendorOrderId: string,
  patch: Partial<
    Pick<
      CorpVendorEnquiry,
      'responseStatus' | 'vendorComment' | 'offerAmountDisplay' | 'bookingConfirmedAt' | 'payoutStatus'
    >
  >,
): CorpVendorEnquiry | null {
  const list = loadCorpVendorEnquiries();
  const idx = list.findIndex((e) => e.vendorOrderId === vendorOrderId);
  if (idx < 0) return null;
  const next = { ...list[idx], ...patch };
  list[idx] = next;
  localStorage.setItem(CORP_VENDOR_ENQUIRIES_KEY, JSON.stringify(list));
  dispatchUpdated();
  return next;
}

export function setCorpVendorEnquiryBookingConfirmed(vendorOrderId: string): CorpVendorEnquiry | null {
  const cur = findCorpVendorEnquiryByVendorOrderId(vendorOrderId);
  if (cur?.bookingConfirmedAt) return cur;
  return updateCorpVendorEnquiryByVendorOrderId(vendorOrderId, {
    bookingConfirmedAt: Date.now(),
    payoutStatus: 'pending',
  });
}

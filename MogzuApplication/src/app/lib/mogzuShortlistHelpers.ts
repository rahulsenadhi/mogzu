import type { MockProduct } from '@/app/lib/adminProductsMock';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import type {
  MogzuDirectListing,
  MogzuOrder,
  PartnerListing,
  ShortlistOption,
  ShortlistProposal,
} from '@/app/lib/mogzuDomain';
import type { CatalogueItem } from '@/utils/catalogueTypes';
import { loadMogzuOrders, loadPartnerListings, saveMogzuOrders } from '@/app/lib/mogzuDomain';

function termsSnapshot(policies: string[], descriptionLong: string): string {
  const pol = policies.filter(Boolean).join('\n');
  const desc = descriptionLong.trim();
  if (pol && desc) return `${pol}\n\n${desc}`;
  return pol || desc;
}

export function newShortlistOptionId(): string {
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newProposalToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 28);
  }
  return `t${Date.now()}${Math.random().toString(36).slice(2, 12)}`;
}

export function shortlistPublicUrl(token: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/shortlist/${encodeURIComponent(token)}`;
}

export function digitsOnlyPhone(input: string): string {
  return input.replace(/\D/g, '');
}

function mockPriceToNumber(price: string): number {
  const digits = price.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? 0 : n;
}

function priceUnitFromMock(price: string): string {
  const lower = price.toLowerCase();
  if (lower.includes('flat')) return 'flat';
  if (lower.includes('person')) return 'person';
  if (lower.includes('unit')) return 'unit';
  return 'unit';
}

export function optionFromMogzuDirect(l: MogzuDirectListing): ShortlistOption {
  const bd = l.buyer_detail;
  return {
    id: newShortlistOptionId(),
    listing_id: l.id,
    listing_type: 'mogzu_direct',
    title: l.title,
    description: l.description_short,
    images: l.images.length ? [...l.images] : [],
    videos: [],
    portfolio_links: bd.portfolio_links.length ? [...bd.portfolio_links] : [],
    amenities: [...bd.amenities],
    payment_summary: formatBuyerPaymentSummary(bd),
    price: l.pricing_mode === 'on_request' ? 0 : l.price,
    price_unit: l.price_unit,
    terms_and_conditions: termsSnapshot(bd.policies, l.description_long),
    admin_note: '',
    is_recommended: false,
    corporate_selected: false,
  };
}

/** Build a shortlist option from the unified corporate catalogue (merged Mogzu Direct + vendor). */
export function optionFromCatalogueItem(item: CatalogueItem): ShortlistOption {
  const listing_type = item.source_type === 'mogzu_direct' ? 'mogzu_direct' : 'partner';
  const priceNum = item.base_price ?? 0;
  return {
    id: newShortlistOptionId(),
    listing_id: item.id,
    listing_type,
    title: item.name,
    description: item.tagline?.trim() ? item.tagline : item.description.slice(0, 280),
    images: item.photos.length ? [...item.photos] : [],
    videos: [],
    portfolio_links: [],
    amenities: [],
    payment_summary: '',
    price: priceNum,
    price_unit: 'unit',
    terms_and_conditions: item.description.trim(),
    admin_note: '',
    is_recommended: false,
    corporate_selected: false,
    source_type: item.source_type,
    source_id: item.id,
    display_price: item.base_price,
    vendor_name: item.vendor_name,
  };
}

export function optionFromPartnerListing(l: PartnerListing): ShortlistOption {
  const bd = l.buyer_detail;
  const port = [...new Set([...l.portfolio_links, ...bd.portfolio_links])];
  return {
    id: newShortlistOptionId(),
    listing_id: l.id,
    listing_type: 'partner',
    title: l.title,
    description: l.description_short,
    images: l.images.length ? [...l.images] : [],
    videos: [...l.videos],
    portfolio_links: port,
    amenities: [...bd.amenities],
    payment_summary: formatBuyerPaymentSummary(bd),
    price: l.pricing_mode === 'on_request' ? 0 : l.price,
    price_unit: l.price_unit,
    terms_and_conditions: termsSnapshot(bd.policies, l.description_long),
    admin_note: '',
    is_recommended: false,
    corporate_selected: false,
  };
}

export function shortlistSelectionHasMogzuOrder(proposal: ShortlistProposal, opt: ShortlistOption): boolean {
  const orders = loadMogzuOrders();
  const enq = proposal.corporate_enquiry_id || proposal.id;
  return orders.some(
    (o) =>
      (o.enquiry_id === enq || o.enquiry_id === proposal.id) &&
      o.listing_id === opt.listing_id &&
      o.listing_type === opt.listing_type
  );
}

/** Idempotent: appends a Mogzu order for the corporate-selected option if none exists. */
export function ensureOrderFromShortlistSelection(proposal: ShortlistProposal): {
  ok: boolean;
  created: boolean;
  message: string;
} {
  const opt = proposal.shortlisted_options.find((o) => o.corporate_selected);
  if (!opt) {
    return { ok: false, created: false, message: 'No option is marked as selected by the corporate client.' };
  }
  if (shortlistSelectionHasMogzuOrder(proposal, opt)) {
    return { ok: true, created: false, message: 'A Mogzu order for this selection already exists.' };
  }
  const orders = loadMogzuOrders();
  const now = new Date().toISOString();
  let partner_id: string | undefined;
  let partner_profit_share: number | undefined;
  if (opt.listing_type === 'partner') {
    const pl = loadPartnerListings().find((p) => p.id === opt.listing_id);
    if (pl) {
      partner_id = pl.partner_id;
      const amt = opt.price > 0 ? opt.price : proposal.budget;
      partner_profit_share = Math.round(((amt * pl.profit_share_percentage) / 100) * 100) / 100;
    }
  }
  const total_amount = opt.price > 0 ? opt.price : proposal.budget;
  const order: MogzuOrder = {
    id: `ord-${Date.now()}`,
    enquiry_id: proposal.corporate_enquiry_id || proposal.id,
    corporate_user_id: proposal.corporate_user_id || 'shortlist-token',
    listing_id: opt.listing_id,
    listing_type: opt.listing_type,
    partner_id,
    status: 'received',
    total_amount,
    partner_profit_share,
    mogzu_margin: undefined,
    event_date: proposal.event_date,
    requirements: `${proposal.requirements ? `${proposal.requirements}\n` : ''}Shortlist: ${proposal.title} · option ${opt.title}`,
    created_at: now,
    updated_at: now,
  };
  saveMogzuOrders([...orders, order]);
  return { ok: true, created: true, message: 'Mogzu order recorded from shortlist selection.' };
}

export function optionFromVendorMock(p: MockProduct): ShortlistOption {
  return {
    id: newShortlistOptionId(),
    listing_id: p.id,
    listing_type: 'vendor',
    title: p.name,
    description: `${p.category} · ${p.seller}`,
    images: p.image ? [p.image] : [],
    videos: [],
    portfolio_links: [],
    amenities: [],
    payment_summary: '',
    price: mockPriceToNumber(p.price),
    price_unit: priceUnitFromMock(p.price),
    terms_and_conditions: 'Vendor catalogue snapshot — confirm final quote with Mogzu.',
    admin_note: '',
    is_recommended: false,
    corporate_selected: false,
  };
}

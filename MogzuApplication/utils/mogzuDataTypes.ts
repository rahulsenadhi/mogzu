export type MogzuListingModule = 'dspace' | 'gifting' | 'events';

export type MogzuPricingMode = 'negotiable' | 'on_request' | 'fixed';
export type ListingPricingType = 'transparent' | 'offer_price' | 'request_for_price';
export type ListingPriceType = 'per_person' | 'flat' | 'per_hour' | 'package';

export interface ListingPricePackage {
  name: string;
  price: number;
  includes: string[];
}

export interface ListingReview {
  id?: string;
  reviewer_name: string;
  company: string;
  rating: 4 | 5;
  comment: string;
  date: string;
  flagged?: boolean;
}

/** Corporate listing taxonomy: Activities vs Services (events module). */
export type ListingKindTaxonomy = 'activities' | 'services';

export type ListingLocationType = 'on_site' | 'virtual' | 'hybrid';

export interface InternalAdminNote {
  id: string;
  author: string;
  text: string;
  at: string;
}

export type PartnerListingStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'archived';

export type MogzuDirectListingStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'archived';

export interface ListingAddOn {
  name: string;
  price?: number;
}

export interface ListingAvailabilitySlot {
  date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
}

/** Buyer-facing detail sections aligned with corporate listing tabs (amenities, portfolio, T&C, payment). */
export interface ListingBuyerDetailBlock {
  amenities: string[];
  /** Extra case studies / PDFs / galleries (listing `images` remain primary gallery for Mogzu Direct). */
  portfolio_links: string[];
  portfolio_captions: string[];
  policies: string[];
  payment_methods: string[];
  payment_terms: string;
}

export function emptyBuyerDetailBlock(): ListingBuyerDetailBlock {
  return {
    amenities: [],
    portfolio_links: [],
    portfolio_captions: [],
    policies: [],
    payment_methods: [],
    payment_terms: '',
  };
}

/** One-line summary for shortlists / cards. */
export function formatBuyerPaymentSummary(d: ListingBuyerDetailBlock): string {
  const m = d.payment_methods.filter(Boolean).join(', ');
  const t = d.payment_terms.trim();
  if (m && t) return `${m} · ${t}`;
  return m || t;
}

function strArrayFromUnknown(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/** Normalize stored buyer detail; fall back `legacy_portfolio` when `portfolio_links` empty (e.g. partner legacy). */
export function normalizeBuyerDetailBlock(raw: unknown, legacyPortfolioLinks: string[]): ListingBuyerDetailBlock {
  const e = emptyBuyerDetailBlock();
  if (!raw || typeof raw !== 'object') {
    return {
      ...e,
      portfolio_links: legacyPortfolioLinks.length ? [...legacyPortfolioLinks] : [],
    };
  }
  const r = raw as Record<string, unknown>;
  const plinks = strArrayFromUnknown(r.portfolio_links);
  return {
    amenities: strArrayFromUnknown(r.amenities),
    portfolio_links: plinks.length > 0 ? plinks : [...legacyPortfolioLinks],
    portfolio_captions: strArrayFromUnknown(r.portfolio_captions),
    policies: strArrayFromUnknown(r.policies),
    payment_methods: strArrayFromUnknown(r.payment_methods),
    payment_terms: typeof r.payment_terms === 'string' ? r.payment_terms : '',
  };
}

export interface MogzuDirectListing {
  id: string;
  owner_type: 'mogzu_direct';
  module: MogzuListingModule;
  title: string;
  description_short: string;
  description_long: string;
  images: string[];
  videos?: string[];
  category: string;
  pricing_mode: MogzuPricingMode;
  price: number;
  price_unit: string;
  status: MogzuDirectListingStatus;
  managed_by: 'mogzu_team';
  buyer_detail: ListingBuyerDetailBlock;
  pricing_type?: ListingPricingType;
  price_type?: ListingPriceType;
  base_price?: number;
  price_packages?: ListingPricePackage[];
  starting_price?: number;
  min_acceptable_offer?: number;
  offer_validity_hours?: number;
  response_time_hours?: number;
  listing_source?: 'vendor' | 'mogzu_direct';
  mogzu_direct_alias?: string;
  vendor_id?: string | null;
  vendor_name?: string;
  vendor_rating?: number;
  vendor_verified?: boolean;
  city?: 'Hyderabad' | 'Mumbai' | 'Bangalore' | 'Delhi' | 'Chennai' | 'Pune';
  reviews?: ListingReview[];
  add_ons?: ListingAddOn[];
  availability_slots?: ListingAvailabilitySlot[];
  badges?: Array<'Top Rated' | 'Verified' | 'Popular' | 'New'>;
  featured?: boolean;
  /** Admin lifecycle */
  submission_date?: string;
  approval_date?: string;
  approved_by?: string;
  rejection_reason?: string;
  rejection_feedback?: string;
  rejection_date?: string;
  internal_notes?: InternalAdminNote[];
  /** Overview (optional; mock-friendly) */
  listing_kind?: ListingKindTaxonomy;
  location_type?: ListingLocationType;
  languages?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PartnerListing {
  id: string;
  owner_type: 'partner';
  partner_id: string;
  module: MogzuListingModule;
  title: string;
  description_short: string;
  description_long: string;
  images: string[];
  portfolio_links: string[];
  videos: string[];
  category: string;
  pricing_mode: MogzuPricingMode;
  price: number;
  price_unit: string;
  profit_share_percentage: number;
  status: PartnerListingStatus;
  buyer_detail: ListingBuyerDetailBlock;
  pricing_type?: ListingPricingType;
  price_type?: ListingPriceType;
  base_price?: number;
  price_packages?: ListingPricePackage[];
  starting_price?: number;
  min_acceptable_offer?: number;
  offer_validity_hours?: number;
  response_time_hours?: number;
  listing_source?: 'vendor' | 'mogzu_direct';
  mogzu_direct_alias?: string;
  vendor_id?: string | null;
  vendor_name?: string;
  vendor_rating?: number;
  vendor_verified?: boolean;
  city?: 'Hyderabad' | 'Mumbai' | 'Bangalore' | 'Delhi' | 'Chennai' | 'Pune';
  reviews?: ListingReview[];
  add_ons?: ListingAddOn[];
  availability_slots?: ListingAvailabilitySlot[];
  badges?: Array<'Top Rated' | 'Verified' | 'Popular' | 'New'>;
  featured?: boolean;
  submission_date?: string;
  approval_date?: string;
  approved_by?: string;
  rejection_reason?: string;
  rejection_feedback?: string;
  rejection_date?: string;
  internal_notes?: InternalAdminNote[];
  listing_kind?: ListingKindTaxonomy;
  location_type?: ListingLocationType;
  languages?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PartnerUser {
  id: string;
  role: 'partner';
  name: string;
  email: string;
  phone: string;
  business_name: string;
  expertise: string[];
  modules: MogzuListingModule[];
  profit_share_percentage: number;
  bank_details: {
    account_name: string;
    account_number: string;
    ifsc: string;
  };
  status: 'pending' | 'active' | 'suspended';
  joined_at: string;
}

export interface ShortlistOption {
  id: string;
  listing_id: string;
  listing_type: 'mogzu_direct' | 'partner' | 'vendor';
  title: string;
  description: string;
  images: string[];
  videos: string[];
  portfolio_links: string[];
  amenities: string[];
  payment_summary: string;
  price: number;
  price_unit: string;
  terms_and_conditions: string;
  admin_note: string;
  is_recommended: boolean;
  corporate_selected: boolean;
  /** Unified catalogue origin (when added from merged catalogue). */
  source_type?: 'vendor' | 'mogzu_direct';
  source_id?: string;
  /** Shown/editable as the AM-facing price line; mirrors catalogue `base_price` when set. */
  display_price?: number;
  vendor_name?: string;
}

export interface ShortlistProposal {
  id: string;
  proposal_token: string;
  corporate_enquiry_id: string;
  corporate_user_id: string;
  corporate_email: string;
  corporate_whatsapp: string;
  created_by_admin: string;
  title: string;
  message: string;
  budget: number;
  event_date: string;
  requirements: string;
  shortlisted_options: ShortlistOption[];
  status: 'draft' | 'sent' | 'viewed' | 'selection_made';
  sent_via: ('email' | 'whatsapp')[];
  created_at: string;
  expires_at: string;
}

export interface MogzuOrder {
  id: string;
  enquiry_id: string;
  corporate_user_id: string;
  listing_id: string;
  listing_type: 'mogzu_direct' | 'partner' | 'vendor';
  partner_id?: string;
  assigned_mogzu_team_member?: string;
  status:
    | 'received'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  total_amount: number;
  partner_profit_share?: number;
  mogzu_margin?: number;
  event_date: string;
  requirements: string;
  created_at: string;
  updated_at: string;
}

// LocalStorage keys (global, non-scoped) for the Mogzu domain data.
export const MOGZU_DIRECT_LISTINGS_KEY = 'mogzu_direct_listings' as const;
export const PARTNER_LISTINGS_KEY = 'partner_listings' as const;
export const PARTNER_USERS_KEY = 'partner_users' as const;
export const SHORTLIST_PROPOSALS_KEY = 'shortlist_proposals' as const;
export const MOGZU_ORDERS_KEY = 'mogzu_orders' as const;

function safeReadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const MOGZU_DOMAIN_STORAGE_EVENT = 'mogzu-domain-storage-change' as const;

export function emitMogzuStorageChange(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(MOGZU_DOMAIN_STORAGE_EVENT, { detail: { key } }));
    }
  } catch {
    /* ignore */
  }
}

/** Demo partner id used for seeded entertainment listings (vendor-network). */
export const SEED_PARTNER_ENTERTAINMENT_ID = 'partner-seed-entertainment-v1' as const;

function eventsBuyerDetail(partial: Partial<ListingBuyerDetailBlock>): ListingBuyerDetailBlock {
  const e = emptyBuyerDetailBlock();
  return {
    ...e,
    ...partial,
    amenities: partial.amenities ?? e.amenities,
    portfolio_links: partial.portfolio_links ?? e.portfolio_links,
    portfolio_captions: partial.portfolio_captions ?? e.portfolio_captions,
    policies: partial.policies ?? e.policies,
    payment_methods: partial.payment_methods ?? e.payment_methods,
    payment_terms: partial.payment_terms ?? e.payment_terms,
  };
}

function recentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function buildRollingAvailabilitySlots(seedOffset = 0): ListingAvailabilitySlot[] {
  const slots: ListingAvailabilitySlot[] = [];
  const start = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const day = d.getDay();
    if (day === 2 || day === 4 || day === 6 || (seedOffset % 2 === 0 && day === 1)) {
      slots.push({
        date: d.toISOString().slice(0, 10),
        start_time: day === 6 ? '11:00' : '10:00',
        end_time: day === 6 ? '14:00' : '13:00',
        slots_available: 2 + ((i + seedOffset) % 4),
      });
      if (slots.length >= 16) break;
    }
  }
  return slots;
}

/** Default Mogzu Direct `events` rows when `mogzu_direct_listings` is empty (demo). */
export function buildDefaultMogzuDirectEventEntertainmentSeeds(): MogzuDirectListing[] {
  const t = nowIso();
  const imgBand =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=750&fit=crop';
  const imgKaraoke =
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=750&fit=crop';
  return [
    // DATA: Added pricing_type field to existing listing [Step 2A]
    // DATA: Fixed missing vendor_name + reviews [Step 2C]
    {
      id: 'mogzu-md-evt-live-band-001',
      owner_type: 'mogzu_direct',
      module: 'events',
      title: 'Live band — 5-piece cover act',
      description_short: 'High-energy covers and classics for corporate galas and townhalls.',
      description_long:
        'Mogzu Direct house band: five musicians, curated setlists (Bollywood + English), basic PA and stage lighting included. Ideal for 80–300 guests. Sound engineer add-on available.',
      images: [
        imgBand,
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=750&fit=crop',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=750&fit=crop',
      ],
      category: 'Live band',
      pricing_mode: 'negotiable',
      price: 85000,
      price_unit: 'event',
      status: 'active',
      managed_by: 'mogzu_team',
      pricing_type: 'request_for_price',
      response_time_hours: 24,
      listing_source: 'mogzu_direct',
      mogzu_direct_alias: 'Mogzu Live Events',
      vendor_id: null,
      vendor_name: 'Mogzu Live Events',
      vendor_rating: 4.8,
      vendor_verified: true,
      city: 'Mumbai',
      reviews: [
        { reviewer_name: 'Ananya Shah', company: 'HDFC Bank', rating: 5, comment: 'Band set the perfect tone for our annual townhall. Professional setup and smooth execution.', date: recentDate(41) },
        { reviewer_name: 'Rohit Iyer', company: 'Infosys', rating: 4, comment: 'Great performance quality and crowd engagement. Coordination team was responsive throughout.', date: recentDate(88) },
      ],
      add_ons: [{ name: 'Additional 30-minute encore' }, { name: 'Premium stage lighting' }],
      availability_slots: buildRollingAvailabilitySlots(1),
      badges: ['Top Rated', 'Verified'],
      featured: true,
      buyer_detail: eventsBuyerDetail({
        amenities: [
          '5-piece lineup (vocals, keys, guitar, bass, drums)',
          'PA + basic stage lights',
          '90-minute performance + 30-minute soundcheck',
          'Repertoire: Bollywood hits, pop, classic rock',
        ],
        portfolio_links: ['https://unsplash.com/s/photos/live-band'],
        portfolio_captions: ['Reference staging — actual rider shared on confirmation'],
        policies: [
          '50% advance to confirm date',
          'Balance due 7 days before event',
          'Outdoor cover required if open-air',
        ],
        payment_methods: ['Corporate PO', 'NEFT', 'UPI'],
        payment_terms: '50% advance · balance 7 days before event',
      }),
      created_at: t,
      updated_at: t,
    },
    // DATA: Added pricing_type field to existing listing [Step 2A]
    // DATA: Fixed missing vendor_name + reviews [Step 2C]
    {
      id: 'mogzu-md-evt-karaoke-001',
      owner_type: 'mogzu_direct',
      module: 'events',
      title: 'Private karaoke suite — hosted session',
      description_short: 'Premium karaoke with host, song library, and lounge setup for teams.',
      description_long:
        'Curated Mogzu Direct karaoke experience: professional host, dual wireless mics, large-format lyrics display, and themed lounge seating for 20–80 guests. Perfect for team nights and offsites.',
      images: [
        imgKaraoke,
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=750&fit=crop',
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&h=750&fit=crop',
      ],
      category: 'Karaoke',
      pricing_mode: 'fixed',
      price: 45000,
      price_unit: 'session',
      status: 'active',
      managed_by: 'mogzu_team',
      pricing_type: 'transparent',
      price_type: 'package',
      base_price: 45000,
      price_packages: [
        { name: 'Classic Session', price: 45000, includes: ['3-hour hosted session', 'Dual wireless mics'] },
      ],
      listing_source: 'mogzu_direct',
      mogzu_direct_alias: 'Mogzu Live Events',
      vendor_id: null,
      vendor_name: 'Mogzu Live Events',
      vendor_rating: 4.7,
      vendor_verified: true,
      city: 'Mumbai',
      reviews: [
        { reviewer_name: 'Shreya Menon', company: 'Accenture', rating: 5, comment: 'Fun format for team social night. Audio quality and host energy were excellent.', date: recentDate(35) },
        { reviewer_name: 'Vikram Sinha', company: 'TCS', rating: 4, comment: 'Smooth operations and strong song library. Team really enjoyed the interactive rounds.', date: recentDate(79) },
      ],
      add_ons: [{ name: 'Theme decor', price: 12000 }, { name: 'Corporate emcee', price: 9000 }],
      availability_slots: buildRollingAvailabilitySlots(2),
      badges: ['Popular', 'Verified'],
      featured: true,
      buyer_detail: eventsBuyerDetail({
        amenities: [
          'Hosted karaoke MC',
          '50k+ track library (multi-language)',
          'Dual wireless mics + lyric screens',
          '3-hour session standard',
        ],
        policies: ['Venue power and covered space required', 'Alcohol subject to venue policy'],
        payment_methods: ['Corporate PO', 'NEFT'],
        payment_terms: '100% advance for confirmed slot',
      }),
      created_at: t,
      updated_at: t,
    },
  ];
}

function createSeedPartnerUser(): PartnerUser {
  return {
    id: SEED_PARTNER_ENTERTAINMENT_ID,
    role: 'partner',
    name: 'Riya Kapoor',
    email: 'riya@soundhouse-events.demo',
    phone: '+919876543210',
    business_name: 'SoundHouse Entertainment',
    expertise: ['Live music', 'Karaoke', 'Corporate events'],
    modules: ['events'],
    profit_share_percentage: 12,
    bank_details: {
      account_name: 'SoundHouse Entertainment',
      account_number: '000000000000',
      ifsc: 'HDFC0000001',
    },
    status: 'active',
    joined_at: nowIso(),
  };
}

/** Default partner `events` listings when `partner_listings` is empty (vendor-network demo). */
export function buildDefaultPartnerEventEntertainmentSeeds(partnerId: string): PartnerListing[] {
  const t = nowIso();
  const imgBand =
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=750&fit=crop';
  const imgKaraoke =
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=750&fit=crop';
  return [
    // DATA: Added pricing_type field to existing listing [Step 2A]
    // DATA: Fixed missing vendor_name + reviews [Step 2C]
    {
      id: 'partner-evt-live-band-vendor-001',
      owner_type: 'partner',
      partner_id: partnerId,
      module: 'events',
      title: 'Indie live band — 4-piece (vendor)',
      description_short: 'Independent artists for intimate corporate evenings and rooftops.',
      description_long:
        'Marketplace vendor listing: four-piece indie / fusion band with compact backline. Travel within city limits included; extended travel quoted separately.',
      images: [
        imgBand,
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&h=750&fit=crop',
        'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=1200&h=750&fit=crop',
      ],
      portfolio_links: [],
      videos: [],
      category: 'Live band',
      pricing_mode: 'on_request',
      price: 0,
      price_unit: 'quote',
      profit_share_percentage: 12,
      status: 'active',
      pricing_type: 'request_for_price',
      response_time_hours: 24,
      listing_source: 'vendor',
      vendor_id: partnerId,
      vendor_name: 'SoundHouse Entertainment',
      vendor_rating: 4.5,
      vendor_verified: true,
      city: 'Mumbai',
      reviews: [
        { reviewer_name: 'Kunal Rao', company: 'Wipro', rating: 4, comment: 'Good setlist flexibility and stage discipline. Team appreciated the genre mix.', date: recentDate(52) },
        { reviewer_name: 'Neha Bhat', company: 'Capgemini', rating: 5, comment: 'Very professional vendor team and on-time setup. Strong audience engagement.', date: recentDate(101) },
      ],
      add_ons: [{ name: 'Backline upgrade' }, { name: 'Extended city travel support' }],
      availability_slots: buildRollingAvailabilitySlots(3),
      badges: ['Verified'],
      featured: false,
      buyer_detail: eventsBuyerDetail({
        amenities: ['4-piece', 'Compact PA', '60–120 min sets', 'Indie / fusion repertoire'],
        policies: ['Rider shared after hold', 'GST as applicable'],
        payment_methods: ['NEFT', 'Corporate PO'],
        payment_terms: 'Quote after date hold',
      }),
      created_at: t,
      updated_at: t,
    },
    // DATA: Added pricing_type field to existing listing [Step 2A]
    // DATA: Fixed missing vendor_name + reviews [Step 2C]
    {
      id: 'partner-evt-karaoke-vendor-001',
      owner_type: 'partner',
      partner_id: partnerId,
      module: 'events',
      title: 'Pop-up karaoke lounge (vendor)',
      description_short: 'Bring-your-venue karaoke rig with operator — vendor-supplied.',
      description_long:
        'Vendor-operated karaoke: twin speakers, mixer, two mics, tablet-based song queue. Client provides space and power.',
      images: [
        imgKaraoke,
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=750&fit=crop',
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&h=750&fit=crop',
      ],
      portfolio_links: [],
      videos: [],
      category: 'Karaoke',
      pricing_mode: 'fixed',
      price: 28000,
      price_unit: 'session',
      profit_share_percentage: 12,
      status: 'active',
      pricing_type: 'offer_price',
      price_type: 'flat',
      starting_price: 28000,
      min_acceptable_offer: 24000,
      offer_validity_hours: 48,
      listing_source: 'vendor',
      vendor_id: partnerId,
      vendor_name: 'SoundHouse Entertainment',
      vendor_rating: 4.6,
      vendor_verified: true,
      city: 'Mumbai',
      reviews: [
        { reviewer_name: 'Amit Dutta', company: 'Deloitte', rating: 5, comment: 'Easy vendor to work with and transparent communication. Great karaoke setup quality.', date: recentDate(47) },
        { reviewer_name: 'Priya Das', company: 'Cognizant', rating: 4, comment: 'Smooth execution for our internal mixer. Timely operator support throughout.', date: recentDate(126) },
      ],
      add_ons: [{ name: 'Extra microphone', price: 2500 }, { name: 'Custom song queue concierge', price: 4000 }],
      availability_slots: buildRollingAvailabilitySlots(4),
      badges: ['Popular'],
      featured: false,
      buyer_detail: eventsBuyerDetail({
        amenities: ['Operator on-site', '3-hour runtime', 'Multi-language tracks'],
        policies: ['Indoor or covered outdoor only'],
        payment_methods: ['NEFT', 'UPI'],
        payment_terms: '50% advance · 50% on event day',
      }),
      created_at: t,
      updated_at: t,
    },
  ];
}

export interface MarketplaceListingSeed {
  id: string;
  module: MogzuListingModule;
  category: string;
  title: string;
  description_short: string;
  description_long: string;
  listing_source: 'vendor' | 'mogzu_direct';
  mogzu_direct_alias?: string;
  vendor_id: string | null;
  vendor_name: string;
  vendor_rating: number;
  vendor_verified: boolean;
  city: 'Hyderabad' | 'Mumbai' | 'Bangalore' | 'Delhi' | 'Chennai' | 'Pune';
  images: string[];
  reviews: ListingReview[];
  add_ons: ListingAddOn[];
  availability_slots: ListingAvailabilitySlot[];
  badges: Array<'Top Rated' | 'Verified' | 'Popular' | 'New'>;
  featured: boolean;
  status: 'active';
  pricing_type: ListingPricingType;
  price_type?: ListingPriceType;
  base_price?: number;
  price_packages?: ListingPricePackage[];
  starting_price?: number;
  min_acceptable_offer?: number;
  offer_validity_hours?: number;
  response_time_hours?: number;
}

const SEED_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=750&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=750&fit=crop',
];

function imagesBySeed(seed: number): string[] {
  return [
    SEED_IMAGE_POOL[seed % SEED_IMAGE_POOL.length],
    SEED_IMAGE_POOL[(seed + 2) % SEED_IMAGE_POOL.length],
    SEED_IMAGE_POOL[(seed + 4) % SEED_IMAGE_POOL.length],
  ];
}

function reviewPair(vendor: string, companyA: string, companyB: string): ListingReview[] {
  return [
    {
      reviewer_name: 'Ananya Mehta',
      company: companyA,
      rating: 5,
      comment: `${vendor} delivered on-time and handled execution professionally. Our team feedback was excellent.`,
      date: recentDate(34),
    },
    {
      reviewer_name: 'Rahul Nair',
      company: companyB,
      rating: 4,
      comment: `Strong coordination and reliable support from ${vendor}. We would shortlist them again.`,
      date: recentDate(79),
    },
  ];
}

function addOnsByPricingType(type: ListingPricingType, base: number): ListingAddOn[] {
  if (type === 'request_for_price') {
    return [{ name: 'Priority support' }, { name: 'Extended coverage' }];
  }
  return [
    { name: 'Priority support', price: Math.round(base * 0.12) },
    { name: 'Extended coverage', price: Math.round(base * 0.18) },
  ];
}

function baseSeed(
  seed: number,
  listing: Omit<MarketplaceListingSeed, 'images' | 'reviews' | 'add_ons' | 'availability_slots' | 'badges' | 'featured' | 'status'>
): MarketplaceListingSeed {
  const badges: Array<'Top Rated' | 'Verified' | 'Popular' | 'New'> = [];
  if (listing.vendor_verified) badges.push('Verified');
  if ((seed + listing.title.length) % 3 === 0) badges.push('Popular');
  if ((seed + listing.title.length) % 5 === 0) badges.push('Top Rated');
  if (badges.length === 0) badges.push('New');
  const featured =
    listing.listing_source === 'mogzu_direct' ? seed % 3 === 0 : (seed + listing.title.length) % 4 === 0;
  const priceRef = listing.base_price ?? listing.starting_price ?? 10000;
  return {
    ...listing,
    images: imagesBySeed(seed),
    reviews: reviewPair(listing.vendor_name, 'Infosys', 'HDFC Bank'),
    add_ons: addOnsByPricingType(listing.pricing_type, priceRef),
    availability_slots: buildRollingAvailabilitySlots(seed),
    badges,
    featured,
    status: 'active',
  };
}

/**
 * Unified listing mock dataset for all 14 target categories (vendor + Mogzu Direct).
 * Each entry includes pricing_type, listing_source, reviews, add-ons, and rolling availability.
 */
export const ENTERPRISE_EVENT_LISTING_SEEDS: MarketplaceListingSeed[] = [
  // DATA: New listing added — Workshops & Trainings, Transparent [Step 2D]
  baseSeed(10, { id: 'seed-wt-1', module: 'events', category: 'Workshops & Trainings', title: 'Leadership Workshop Sprint', description_short: 'Facilitated leadership and communication bootcamp.', description_long: 'Structured leadership workshop with facilitator-led activities and practical simulations for managers.', listing_source: 'vendor', vendor_id: 'vendor-wt-1', vendor_name: 'SkillForge Learning Pvt Ltd', vendor_rating: 4.6, vendor_verified: true, city: 'Bangalore', pricing_type: 'transparent', price_type: 'per_person', base_price: 1200 }),
  // DATA: New listing added — Workshops & Trainings, Offer Price [Step 2D]
  baseSeed(11, { id: 'seed-wt-2', module: 'events', category: 'Workshops & Trainings', title: 'Sales Enablement Masterclass', description_short: 'Hands-on sales playbook sessions for field teams.', description_long: 'Interactive coaching module for B2B sales teams with role-play tracks and pipeline simulations.', listing_source: 'vendor', vendor_id: 'vendor-wt-2', vendor_name: 'GrowthArc Consulting LLP', vendor_rating: 4.5, vendor_verified: true, city: 'Mumbai', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 1060, min_acceptable_offer: 900, offer_validity_hours: 48 }),
  // DATA: New listing added — Workshops & Trainings, Request for Price [Step 2D]
  baseSeed(12, { id: 'seed-wt-3', module: 'events', category: 'Workshops & Trainings', title: 'Enterprise Compliance Training Day', description_short: 'Policy, ethics, and compliance workshop suite.', description_long: 'Custom compliance curriculum with role-based tracks and assessment reporting for enterprise teams.', listing_source: 'vendor', vendor_id: 'vendor-wt-3', vendor_name: 'ProMentor Training Services', vendor_rating: 4.7, vendor_verified: true, city: 'Hyderabad', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Arts & Creativity, Transparent [Step 2D]
  baseSeed(13, { id: 'seed-ac-1', module: 'events', category: 'Arts & Creativity', title: 'Corporate Canvas Painting Lab', description_short: 'Guided painting workshop for team bonding.', description_long: 'Theme-based painting experiences with all materials and showcase wall setup included.', listing_source: 'vendor', vendor_id: 'vendor-ac-1', vendor_name: 'ArtPulse Studios', vendor_rating: 4.8, vendor_verified: true, city: 'Delhi', pricing_type: 'transparent', price_type: 'per_person', base_price: 900 }),
  // DATA: New listing added — Arts & Creativity, Transparent [Step 2D]
  baseSeed(14, { id: 'seed-ac-2', module: 'events', category: 'Arts & Creativity', title: 'Pottery Wheel Team Session', description_short: 'Hands-on pottery and clay design workshop.', description_long: 'Pottery workshop with guided wheel sessions, kiln-finish options, and team challenge format.', listing_source: 'vendor', vendor_id: 'vendor-ac-2', vendor_name: 'ClayCraft Collective', vendor_rating: 4.4, vendor_verified: true, city: 'Pune', pricing_type: 'transparent', price_type: 'per_person', base_price: 1100 }),
  // DATA: New listing added — Arts & Creativity, Offer Price [Step 2D]
  baseSeed(15, { id: 'seed-ac-3', module: 'events', category: 'Arts & Creativity', title: 'Design Thinking Storyboard Jam', description_short: 'Creative ideation and visual storytelling sprint.', description_long: 'Facilitated storyboard and concept sketch workshop for innovation and product teams.', listing_source: 'vendor', vendor_id: 'vendor-ac-3', vendor_name: 'CreativeMinds Workshop Co', vendor_rating: 4.5, vendor_verified: false, city: 'Chennai', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 808, min_acceptable_offer: 650, offer_validity_hours: 48 }),

  // DATA: New listing added — Virtual Games, Transparent [Step 2D]
  baseSeed(16, { id: 'seed-vg-1', module: 'events', category: 'Virtual Games', title: 'Online Trivia Battle Arena', description_short: 'Real-time hosted trivia with leaderboard.', description_long: 'Fast-paced virtual trivia challenge with custom rounds, emcee, and analytics dashboard.', listing_source: 'vendor', vendor_id: 'vendor-vg-1', vendor_name: 'PlayGrid Experiences', vendor_rating: 4.7, vendor_verified: true, city: 'Bangalore', pricing_type: 'transparent', price_type: 'per_person', base_price: 500 }),
  // DATA: New listing added — Virtual Games, Transparent [Step 2D]
  baseSeed(17, { id: 'seed-vg-2', module: 'events', category: 'Virtual Games', title: 'Virtual Escape Room League', description_short: 'Collaborative puzzle game for distributed teams.', description_long: 'Multi-stage virtual escape rooms with timed clues and role-based team participation.', listing_source: 'vendor', vendor_id: 'vendor-vg-2', vendor_name: 'QuestPulse Digital', vendor_rating: 4.6, vendor_verified: true, city: 'Mumbai', pricing_type: 'transparent', price_type: 'per_person', base_price: 650 }),
  // DATA: New listing added — Virtual Games, Offer Price [Step 2D]
  baseSeed(18, { id: 'seed-vg-3', module: 'events', category: 'Virtual Games', title: 'E-Sports Team Faceoff', description_short: 'Hosted multiplayer game tournament format.', description_long: 'Bracket-style virtual tournament with host moderation and digital award moments.', listing_source: 'vendor', vendor_id: 'vendor-vg-3', vendor_name: 'ByteArena Gaming Pvt Ltd', vendor_rating: 4.5, vendor_verified: false, city: 'Hyderabad', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 425, min_acceptable_offer: 320, offer_validity_hours: 48 }),

  // DATA: New listing added — Wellness Programs, Transparent [Step 2D]
  baseSeed(19, { id: 'seed-wp-1', module: 'events', category: 'Wellness Programs', title: 'Corporate Yoga Reset', description_short: 'Mind-body wellness sessions for teams.', description_long: 'Instructor-led yoga and breathwork tailored for workplace stress management and mobility.', listing_source: 'vendor', vendor_id: 'vendor-wp-1', vendor_name: 'ZenOrbit Wellness', vendor_rating: 4.8, vendor_verified: true, city: 'Pune', pricing_type: 'transparent', price_type: 'per_person', base_price: 1400 }),
  // DATA: New listing added — Wellness Programs, Offer Price [Step 2D]
  baseSeed(20, { id: 'seed-wp-2', module: 'events', category: 'Wellness Programs', title: 'Mindfulness + Sound Bath', description_short: 'Guided mindfulness with sound healing setup.', description_long: 'Wellness format combining grounding meditation and curated sound healing modules for office teams.', listing_source: 'vendor', vendor_id: 'vendor-wp-2', vendor_name: 'CalmCore Health Labs', vendor_rating: 4.4, vendor_verified: true, city: 'Chennai', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 1318, min_acceptable_offer: 1100, offer_validity_hours: 48 }),
  // DATA: New listing added — Wellness Programs, Request for Price [Step 2D]
  baseSeed(21, { id: 'seed-wp-3', module: 'events', category: 'Wellness Programs', title: 'Executive Wellness Retreat Day', description_short: 'Custom wellness programming for leadership cohorts.', description_long: 'End-to-end wellness day with diagnostics, nutrition, and stress-care modules for leadership teams.', listing_source: 'vendor', vendor_id: 'vendor-wp-3', vendor_name: 'ThriveCircle Corporate Wellness', vendor_rating: 4.7, vendor_verified: true, city: 'Delhi', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Entertainment, Transparent [Step 2D]
  baseSeed(22, { id: 'seed-ent-1', module: 'events', category: 'Entertainment', title: 'Live Corporate Music Night', description_short: 'Curated music act for corporate evenings.', description_long: 'Professional live entertainment for rewards nights and annual gatherings with on-stage management.', listing_source: 'vendor', vendor_id: 'vendor-ent-1', vendor_name: 'StagePulse Entertainment', vendor_rating: 4.6, vendor_verified: true, city: 'Mumbai', pricing_type: 'transparent', price_type: 'flat', base_price: 95000 }),
  // DATA: New listing added — Entertainment, Request for Price [Step 2D]
  baseSeed(23, { id: 'seed-ent-2', module: 'events', category: 'Entertainment', title: 'Celebrity Host & Act Package', description_short: 'Premium entertainment package with host options.', description_long: 'Large-format entertainment lineup with host curation, rider compliance, and production coordination.', listing_source: 'vendor', vendor_id: 'vendor-ent-2', vendor_name: 'Encore India Events', vendor_rating: 4.3, vendor_verified: true, city: 'Bangalore', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: New listing added — Entertainment, Request for Price [Step 2D]
  baseSeed(24, { id: 'seed-ent-3', module: 'events', category: 'Entertainment', title: 'Immersive Performance Showcase', description_short: 'Concept-led performance production for brand events.', description_long: 'Custom scripted performance acts with choreography, lighting, and stage movement orchestration.', listing_source: 'vendor', vendor_id: 'vendor-ent-3', vendor_name: 'PulseCraft Performances', vendor_rating: 4.4, vendor_verified: false, city: 'Hyderabad', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Themed Parties, Transparent [Step 2D]
  baseSeed(25, { id: 'seed-tp-1', module: 'events', category: 'Themed Parties', title: 'Retro Office Party Concept', description_short: 'Theme-led office party with props and activities.', description_long: 'Turnkey themed party curation including decor, interactive corners, and engagement anchors.', listing_source: 'vendor', vendor_id: 'vendor-tp-1', vendor_name: 'PartyCanvas Studios', vendor_rating: 4.5, vendor_verified: true, city: 'Delhi', pricing_type: 'transparent', price_type: 'per_person', base_price: 1900 }),
  // DATA: New listing added — Themed Parties, Offer Price [Step 2D]
  baseSeed(26, { id: 'seed-tp-2', module: 'events', category: 'Themed Parties', title: 'Awards Night Theme Build', description_short: 'Premium themed setup for annual awards nights.', description_long: 'Theme design, mood boards, and execution support for high-visibility corporate celebration events.', listing_source: 'vendor', vendor_id: 'vendor-tp-2', vendor_name: 'CelebrationLab India', vendor_rating: 4.6, vendor_verified: true, city: 'Pune', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 1615, min_acceptable_offer: 1300, offer_validity_hours: 48 }),
  // DATA: New listing added — Themed Parties, Request for Price [Step 2D]
  baseSeed(27, { id: 'seed-tp-3', module: 'events', category: 'Themed Parties', title: 'Multi-City Theme Rollout', description_short: 'Cross-location themed celebration orchestration.', description_long: 'End-to-end multi-site party concept rollout with centralized design governance and local execution.', listing_source: 'vendor', vendor_id: 'vendor-tp-3', vendor_name: 'EventAlchemy Pvt Ltd', vendor_rating: 4.2, vendor_verified: true, city: 'Chennai', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — CSR, Transparent [Step 2D]
  baseSeed(28, { id: 'seed-csr-1', module: 'events', category: 'CSR', title: 'Community Impact Volunteering Day', description_short: 'Structured CSR volunteering and partner NGO support.', description_long: 'Corporate volunteering experiences with impact tracking, NGO partnerships, and documentation support.', listing_source: 'vendor', vendor_id: 'vendor-csr-1', vendor_name: 'ImpactBridge Foundation Services', vendor_rating: 4.8, vendor_verified: true, city: 'Bangalore', pricing_type: 'transparent', price_type: 'per_person', base_price: 2600 }),
  // DATA: New listing added — CSR, Request for Price [Step 2D]
  baseSeed(29, { id: 'seed-csr-2', module: 'events', category: 'CSR', title: 'Rural Skill Lab Sponsorship Program', description_short: 'Long-form CSR engagement with measurable outcomes.', description_long: 'CSR model focused on rural skilling and entrepreneurship with monthly impact narratives.', listing_source: 'vendor', vendor_id: 'vendor-csr-2', vendor_name: 'ServeSphere Social Ventures', vendor_rating: 4.6, vendor_verified: true, city: 'Hyderabad', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: New listing added — CSR, Request for Price [Step 2D]
  baseSeed(30, { id: 'seed-csr-3', module: 'events', category: 'CSR', title: 'Education Drive Program Management', description_short: 'Education-focused CSR campaign design and operations.', description_long: 'Campaign planning, beneficiary mapping, and execution management for education and inclusion initiatives.', listing_source: 'vendor', vendor_id: 'vendor-csr-3', vendor_name: 'GreenPulse CSR Solutions', vendor_rating: 4.5, vendor_verified: false, city: 'Delhi', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Catering, Transparent [Step 2D]
  baseSeed(31, { id: 'seed-cat-1', module: 'events', category: 'Catering', title: 'Corporate Buffet Catering', description_short: 'Multi-cuisine buffet for office events and conferences.', description_long: 'Freshly prepared buffet service with setup staff, serving counters, and hygiene compliance.', listing_source: 'vendor', vendor_id: 'vendor-cat-1', vendor_name: 'RoyalPlatter Caterers', vendor_rating: 4.7, vendor_verified: true, city: 'Mumbai', pricing_type: 'transparent', price_type: 'per_person', base_price: 950 }),
  // DATA: New listing added — Catering, Offer Price [Step 2D]
  baseSeed(32, { id: 'seed-cat-2', module: 'events', category: 'Catering', title: 'Executive Lunch Box Program', description_short: 'Curated meal boxes for meetings and offsites.', description_long: 'Managed executive meal-box service with dietary labeling and punctual drop windows.', listing_source: 'vendor', vendor_id: 'vendor-cat-2', vendor_name: 'SpiceRoute Hospitality', vendor_rating: 4.5, vendor_verified: true, city: 'Pune', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 956, min_acceptable_offer: 800, offer_validity_hours: 48 }),
  // DATA: New listing added — Catering, Request for Price [Step 2D]
  baseSeed(33, { id: 'seed-cat-3', module: 'events', category: 'Catering', title: 'Large-Scale Banquet Catering', description_short: 'Custom catering for 500+ attendee formats.', description_long: 'Bulk event catering with live counters, menu engineering, and operations supervisors.', listing_source: 'vendor', vendor_id: 'vendor-cat-3', vendor_name: 'UrbanTadka Events Kitchen', vendor_rating: 4.4, vendor_verified: true, city: 'Chennai', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Audio Visuals, Transparent [Step 2D]
  baseSeed(34, { id: 'seed-av-1', module: 'events', category: 'Audio Visuals', title: 'Conference AV Essentials Kit', description_short: 'Projector, screen, microphones, and control desk.', description_long: 'Plug-and-play AV package for meetings and conference halls with technician support.', listing_source: 'vendor', vendor_id: 'vendor-av-1', vendor_name: 'EchoLine AV Systems', vendor_rating: 4.6, vendor_verified: true, city: 'Bangalore', pricing_type: 'transparent', price_type: 'flat', base_price: 110000 }),
  // DATA: New listing added — Audio Visuals, Transparent [Step 2D]
  baseSeed(35, { id: 'seed-av-2', module: 'events', category: 'Audio Visuals', title: 'Townhall LED + Sound Setup', description_short: 'High-impact LED wall and broadcast-grade audio.', description_long: 'End-to-end AV production with LED wall, mics, monitors, and real-time switching desk.', listing_source: 'vendor', vendor_id: 'vendor-av-2', vendor_name: 'PrismWave Technologies', vendor_rating: 4.8, vendor_verified: true, city: 'Delhi', pricing_type: 'transparent', price_type: 'flat', base_price: 160000 }),
  // DATA: New listing added — Audio Visuals, Offer Price [Step 2D]
  baseSeed(36, { id: 'seed-av-3', module: 'events', category: 'Audio Visuals', title: 'Hybrid Event AV Production', description_short: 'Streaming-ready AV stack for hybrid events.', description_long: 'Integrated AV + webcast package for in-person and remote audiences, including operator crew.', listing_source: 'vendor', vendor_id: 'vendor-av-3', vendor_name: 'Skyline AV Productions', vendor_rating: 4.5, vendor_verified: false, city: 'Hyderabad', pricing_type: 'offer_price', price_type: 'flat', starting_price: 138125, min_acceptable_offer: 120000, offer_validity_hours: 48 }),

  // DATA: New listing added — Design & Decor, Offer Price [Step 2D]
  baseSeed(37, { id: 'seed-dd-1', module: 'events', category: 'Design & Decor', title: 'Corporate Stage & Ambience Design', description_short: 'Concept-led event styling and production decor.', description_long: 'Visual design, render support, and onsite execution for premium corporate gatherings.', listing_source: 'vendor', vendor_id: 'vendor-dd-1', vendor_name: 'AuraDécor Events', vendor_rating: 4.6, vendor_verified: true, city: 'Mumbai', pricing_type: 'offer_price', price_type: 'flat', starting_price: 225250, min_acceptable_offer: 190000, offer_validity_hours: 48 }),
  // DATA: New listing added — Design & Decor, Request for Price [Step 2D]
  baseSeed(38, { id: 'seed-dd-2', module: 'events', category: 'Design & Decor', title: 'Experiential Decor Buildout', description_short: 'Custom installations and thematic decor planning.', description_long: 'High-touch decor with fabrication and immersive installations tailored for brand events.', listing_source: 'vendor', vendor_id: 'vendor-dd-2', vendor_name: 'StudioVibe Decorworks', vendor_rating: 4.4, vendor_verified: true, city: 'Bangalore', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: New listing added — Design & Decor, Request for Price [Step 2D]
  baseSeed(39, { id: 'seed-dd-3', module: 'events', category: 'Design & Decor', title: 'Multi-Zone Event Styling Program', description_short: 'Decor package for large-format event footprints.', description_long: 'Venue zoning, signage hierarchy, and full decor operations for enterprise-scale events.', listing_source: 'vendor', vendor_id: 'vendor-dd-3', vendor_name: 'CraftNest Spaces', vendor_rating: 4.3, vendor_verified: false, city: 'Pune', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Security, Transparent [Step 2D]
  baseSeed(40, { id: 'seed-sec-1', module: 'events', category: 'Security', title: 'Event Security Guard Team', description_short: 'Access control and perimeter management for events.', description_long: 'Trained security staff for access control, queue management, and compliance checks.', listing_source: 'vendor', vendor_id: 'vendor-sec-1', vendor_name: 'ShieldOne Security Services', vendor_rating: 4.5, vendor_verified: true, city: 'Chennai', pricing_type: 'transparent', price_type: 'flat', base_price: 22000 }),
  // DATA: New listing added — Security, Transparent [Step 2D]
  baseSeed(41, { id: 'seed-sec-2', module: 'events', category: 'Security', title: 'VIP Security + Crowd Marshals', description_short: 'Enhanced security for high-profile corporate events.', description_long: 'Layered security stack with marshal planning and incident escalation coordination.', listing_source: 'vendor', vendor_id: 'vendor-sec-2', vendor_name: 'Fortline Risk Management', vendor_rating: 4.7, vendor_verified: true, city: 'Delhi', pricing_type: 'transparent', price_type: 'flat', base_price: 30000 }),
  // DATA: New listing added — Security, Request for Price [Step 2D]
  baseSeed(42, { id: 'seed-sec-3', module: 'events', category: 'Security', title: 'Integrated Security Command Plan', description_short: 'End-to-end command and control security model.', description_long: 'Comprehensive security planning including command center, deployment matrix, and SOPs.', listing_source: 'vendor', vendor_id: 'vendor-sec-3', vendor_name: 'SecureOps India Pvt Ltd', vendor_rating: 4.4, vendor_verified: true, city: 'Hyderabad', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — Transportation, Transparent [Step 2D]
  baseSeed(43, { id: 'seed-tr-1', module: 'events', category: 'Transportation', title: 'Corporate Shuttle Fleet', description_short: 'Employee movement logistics for event day.', description_long: 'Dedicated shuttle routing with dispatch control and real-time movement coordination.', listing_source: 'vendor', vendor_id: 'vendor-tr-1', vendor_name: 'TransitPro Mobility', vendor_rating: 4.5, vendor_verified: true, city: 'Bangalore', pricing_type: 'transparent', price_type: 'flat', base_price: 28000 }),
  // DATA: New listing added — Transportation, Transparent [Step 2D]
  baseSeed(44, { id: 'seed-tr-2', module: 'events', category: 'Transportation', title: 'Executive Airport Transfer Desk', description_short: 'Premium transfer management for CXO guests.', description_long: 'Airport transfer desk with premium fleet assignments and concierge dispatch support.', listing_source: 'vendor', vendor_id: 'vendor-tr-2', vendor_name: 'CityRide Corporate Travel', vendor_rating: 4.6, vendor_verified: true, city: 'Mumbai', pricing_type: 'transparent', price_type: 'flat', base_price: 35000 }),
  // DATA: New listing added — Transportation, Offer Price [Step 2D]
  baseSeed(45, { id: 'seed-tr-3', module: 'events', category: 'Transportation', title: 'Multi-City Event Logistics Fleet', description_short: 'Scalable transport operations for large events.', description_long: 'Transport orchestration for delegates, performers, and vendors across multiple movement windows.', listing_source: 'vendor', vendor_id: 'vendor-tr-3', vendor_name: 'RouteCraft Logistics', vendor_rating: 4.4, vendor_verified: false, city: 'Pune', pricing_type: 'offer_price', price_type: 'flat', starting_price: 36125, min_acceptable_offer: 30000, offer_validity_hours: 48 }),

  // DATA: New listing added — Technology, Transparent [Step 2D]
  baseSeed(46, { id: 'seed-tech-1', module: 'events', category: 'Technology', title: 'Event Registration Tech Stack', description_short: 'QR check-in, badges, and attendee tracking.', description_long: 'Event technology package with registration portal, onsite check-in, and dashboard analytics.', listing_source: 'vendor', vendor_id: 'vendor-tech-1', vendor_name: 'EventStack Technologies', vendor_rating: 4.7, vendor_verified: true, city: 'Hyderabad', pricing_type: 'transparent', price_type: 'flat', base_price: 90000 }),
  // DATA: New listing added — Technology, Offer Price [Step 2D]
  baseSeed(47, { id: 'seed-tech-2', module: 'events', category: 'Technology', title: 'Hybrid Streaming Platform Setup', description_short: 'Secure livestream and attendee interaction suite.', description_long: 'Streaming backend, moderation controls, and audience interaction modules for hybrid events.', listing_source: 'vendor', vendor_id: 'vendor-tech-2', vendor_name: 'BlueCircuit Digital', vendor_rating: 4.5, vendor_verified: true, city: 'Bangalore', pricing_type: 'offer_price', price_type: 'flat', starting_price: 93500, min_acceptable_offer: 80000, offer_validity_hours: 48 }),
  // DATA: New listing added — Technology, Request for Price [Step 2D]
  baseSeed(48, { id: 'seed-tech-3', module: 'events', category: 'Technology', title: 'Enterprise Event App Build', description_short: 'Custom mobile app for event engagement and updates.', description_long: 'White-label event app with agenda, networking, notifications, and sponsor surfaces.', listing_source: 'vendor', vendor_id: 'vendor-tech-3', vendor_name: 'NexaEvent Tech Labs', vendor_rating: 4.4, vendor_verified: false, city: 'Chennai', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: New listing added — License/Permits, Request for Price [Step 2D]
  baseSeed(49, { id: 'seed-lp-1', module: 'events', category: 'License/Permits', title: 'Event Permit Processing Support', description_short: 'Documentation and permit workflow management.', description_long: 'End-to-end guidance for permits, approvals, and compliance checklist management.', listing_source: 'vendor', vendor_id: 'vendor-lp-1', vendor_name: 'RegEase Compliance LLP', vendor_rating: 4.6, vendor_verified: true, city: 'Delhi', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: New listing added — License/Permits, Request for Price [Step 2D]
  baseSeed(50, { id: 'seed-lp-2', module: 'events', category: 'License/Permits', title: 'Multi-Authority Event Clearance', description_short: 'Coordination across local approval authorities.', description_long: 'Permit filing support with SLA-based follow-up and issue escalation management.', listing_source: 'vendor', vendor_id: 'vendor-lp-2', vendor_name: 'ClearPath Regulatory Services', vendor_rating: 4.4, vendor_verified: true, city: 'Mumbai', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: New listing added — License/Permits, Request for Price [Step 2D]
  baseSeed(51, { id: 'seed-lp-3', module: 'events', category: 'License/Permits', title: 'Venue Compliance Audit & Filing', description_short: 'Pre-event compliance audit and filings.', description_long: 'Compliance audit framework with permit dependency mapping and timeline management.', listing_source: 'vendor', vendor_id: 'vendor-lp-3', vendor_name: 'PermitBridge Advisors', vendor_rating: 4.3, vendor_verified: false, city: 'Pune', pricing_type: 'request_for_price', response_time_hours: 24 }),

  // DATA: Mogzu Direct listing — Workshops & Trainings [Step 2E]
  baseSeed(60, { id: 'seed-md-wt-1', module: 'events', category: 'Workshops & Trainings', title: 'Mogzu Leadership Accelerator', description_short: 'Mogzu-curated leadership and collaboration workshop.', description_long: 'High-impact leadership curriculum delivered under Mogzu quality operations framework.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Learning Lab', vendor_id: null, vendor_name: 'Mogzu Learning Lab', vendor_rating: 4.8, vendor_verified: true, city: 'Bangalore', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 1150, min_acceptable_offer: 980, offer_validity_hours: 48 }),
  // DATA: Mogzu Direct listing — Arts & Creativity [Step 2E]
  baseSeed(61, { id: 'seed-md-ac-1', module: 'events', category: 'Arts & Creativity', title: 'Mogzu Creative Expression Studio', description_short: 'Curated arts and creativity sessions for teams.', description_long: 'Mogzu-led creative format blending visual design and interactive collaboration.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Creative Studio', vendor_id: null, vendor_name: 'Mogzu Creative Studio', vendor_rating: 4.7, vendor_verified: true, city: 'Mumbai', pricing_type: 'transparent', price_type: 'per_person', base_price: 950 }),
  // DATA: Mogzu Direct listing — Virtual Games [Step 2E]
  baseSeed(62, { id: 'seed-md-vg-1', module: 'events', category: 'Virtual Games', title: 'Mogzu Virtual Team Arena', description_short: 'Interactive game experiences for distributed teams.', description_long: 'Mogzu-powered virtual game stack with hosts, scoring, and team analytics.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Play', vendor_id: null, vendor_name: 'Mogzu Play', vendor_rating: 4.6, vendor_verified: true, city: 'Hyderabad', pricing_type: 'transparent', price_type: 'per_person', base_price: 580 }),
  // DATA: Mogzu Direct listing — Wellness Programs [Step 2E]
  baseSeed(63, { id: 'seed-md-wp-1', module: 'events', category: 'Wellness Programs', title: 'Mogzu Wellness Recharge', description_short: 'Guided wellness interventions for workforces.', description_long: 'Mogzu wellness modules for stress reset, energy management, and team wellbeing.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Wellness Hub', vendor_id: null, vendor_name: 'Mogzu Wellness Hub', vendor_rating: 4.8, vendor_verified: true, city: 'Chennai', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: Mogzu Direct listing — Entertainment [Step 2E]
  baseSeed(64, { id: 'seed-md-ent-1', module: 'events', category: 'Entertainment', title: 'Mogzu Signature Live Show', description_short: 'Flagship Mogzu entertainment lineup for enterprise events.', description_long: 'Premium entertainment programming with centralized Mogzu production controls.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Live Events', vendor_id: null, vendor_name: 'Mogzu Live Events', vendor_rating: 4.9, vendor_verified: true, city: 'Delhi', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: Mogzu Direct listing — Themed Parties [Step 2E]
  baseSeed(65, { id: 'seed-md-tp-1', module: 'events', category: 'Themed Parties', title: 'Mogzu Celebration Concepts', description_short: 'Theme-first party formats for corporate celebrations.', description_long: 'Mogzu theme experiences with design governance and execution SOPs.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Celebrations', vendor_id: null, vendor_name: 'Mogzu Celebrations', vendor_rating: 4.7, vendor_verified: true, city: 'Pune', pricing_type: 'offer_price', price_type: 'per_person', starting_price: 1680, min_acceptable_offer: 1400, offer_validity_hours: 48 }),
  // DATA: Mogzu Direct listing — CSR [Step 2E]
  baseSeed(66, { id: 'seed-md-csr-1', module: 'events', category: 'CSR', title: 'Mogzu Impact Action Day', description_short: 'Outcome-driven CSR execution with reporting.', description_long: 'Mogzu CSR framework with partner NGOs and measurable impact scorecards.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Impact', vendor_id: null, vendor_name: 'Mogzu Impact', vendor_rating: 4.8, vendor_verified: true, city: 'Bangalore', pricing_type: 'transparent', price_type: 'per_person', base_price: 2800 }),
  // DATA: Mogzu Direct listing — Catering [Step 2E]
  baseSeed(67, { id: 'seed-md-cat-1', module: 'events', category: 'Catering', title: 'Mogzu Curated Corporate Catering', description_short: 'Mogzu-managed menus for enterprise events.', description_long: 'Quality-controlled catering operations under Mogzu sourcing and delivery standards.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Catering Co.', vendor_id: null, vendor_name: 'Mogzu Catering Co.', vendor_rating: 4.7, vendor_verified: true, city: 'Mumbai', pricing_type: 'transparent', price_type: 'per_person', base_price: 1050 }),
  // DATA: Mogzu Direct listing — Audio Visuals [Step 2E]
  baseSeed(68, { id: 'seed-md-av-1', module: 'events', category: 'Audio Visuals', title: 'Mogzu AV Command Pack', description_short: 'Reliable AV infrastructure with expert operators.', description_long: 'Mogzu AV package with production checklists and quality assurance workflows.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu AV Studio', vendor_id: null, vendor_name: 'Mogzu AV Studio', vendor_rating: 4.8, vendor_verified: true, city: 'Hyderabad', pricing_type: 'offer_price', price_type: 'flat', starting_price: 144500, min_acceptable_offer: 126000, offer_validity_hours: 48 }),
  // DATA: Mogzu Direct listing — Design & Decor [Step 2E]
  baseSeed(69, { id: 'seed-md-dd-1', module: 'events', category: 'Design & Decor', title: 'Mogzu Spatial Design Suite', description_short: 'End-to-end visual styling and environment design.', description_long: 'Mogzu design and decor offering with concept-to-execution delivery models.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Spaces', vendor_id: null, vendor_name: 'Mogzu Spaces', vendor_rating: 4.9, vendor_verified: true, city: 'Delhi', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: Mogzu Direct listing — Security [Step 2E]
  baseSeed(70, { id: 'seed-md-sec-1', module: 'events', category: 'Security', title: 'Mogzu Event Security Grid', description_short: 'Mogzu-managed event security framework.', description_long: 'Integrated event security coordination with vetted staffing partners and controls.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Guard Services', vendor_id: null, vendor_name: 'Mogzu Guard Services', vendor_rating: 4.6, vendor_verified: true, city: 'Chennai', pricing_type: 'transparent', price_type: 'flat', base_price: 26000 }),
  // DATA: Mogzu Direct listing — Transportation [Step 2E]
  baseSeed(71, { id: 'seed-md-tr-1', module: 'events', category: 'Transportation', title: 'Mogzu Mobility Event Fleet', description_short: 'Centralized transport scheduling for events.', description_long: 'Mogzu transport control desk with dispatch and route optimization support.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Mobility', vendor_id: null, vendor_name: 'Mogzu Mobility', vendor_rating: 4.7, vendor_verified: true, city: 'Pune', pricing_type: 'transparent', price_type: 'flat', base_price: 32000 }),
  // DATA: Mogzu Direct listing — Technology [Step 2E]
  baseSeed(72, { id: 'seed-md-tech-1', module: 'events', category: 'Technology', title: 'Mogzu Event Tech Core', description_short: 'Registration, engagement, and analytics stack.', description_long: 'Mogzu technology stack for enterprise event execution and post-event intelligence.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Tech Solutions', vendor_id: null, vendor_name: 'Mogzu Tech Solutions', vendor_rating: 4.8, vendor_verified: true, city: 'Bangalore', pricing_type: 'request_for_price', response_time_hours: 24 }),
  // DATA: Mogzu Direct listing — License/Permits [Step 2E]
  baseSeed(73, { id: 'seed-md-lp-1', module: 'events', category: 'License/Permits', title: 'Mogzu Compliance Desk', description_short: 'Centralized permit and compliance support.', description_long: 'Mogzu compliance experts coordinate authority-facing permit and filing workflows.', listing_source: 'mogzu_direct', mogzu_direct_alias: 'Mogzu Compliance', vendor_id: null, vendor_name: 'Mogzu Compliance', vendor_rating: 4.7, vendor_verified: true, city: 'Mumbai', pricing_type: 'request_for_price', response_time_hours: 24 }),
];

function ensureDefaultPartnerUsers(): void {
  if (typeof localStorage === 'undefined') return;
  const parsed = safeReadJson<unknown>(PARTNER_USERS_KEY);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    safeWriteJson(PARTNER_USERS_KEY, [createSeedPartnerUser()]);
    emitMogzuStorageChange(PARTNER_USERS_KEY);
    return;
  }
  const hasSeed = parsed.some(
    (u) => u && typeof u === 'object' && (u as { id?: string }).id === SEED_PARTNER_ENTERTAINMENT_ID
  );
  if (!hasSeed) {
    safeWriteJson(PARTNER_USERS_KEY, [...parsed, createSeedPartnerUser()]);
    emitMogzuStorageChange(PARTNER_USERS_KEY);
  }
}

function firstPartnerUserIdOrSeed(): string {
  const parsed = safeReadJson<unknown>(PARTNER_USERS_KEY);
  if (!Array.isArray(parsed) || parsed.length === 0) return SEED_PARTNER_ENTERTAINMENT_ID;
  const first = parsed[0];
  if (first && typeof first === 'object' && typeof (first as { id?: string }).id === 'string') {
    return (first as { id: string }).id;
  }
  return SEED_PARTNER_ENTERTAINMENT_ID;
}

export function ensureDefaultMogzuDirectListings(): void {
  if (typeof localStorage === 'undefined') return;
  const parsed = safeReadJson<unknown>(MOGZU_DIRECT_LISTINGS_KEY);
  if (Array.isArray(parsed) && parsed.length > 0) return;
  safeWriteJson(MOGZU_DIRECT_LISTINGS_KEY, buildDefaultMogzuDirectEventEntertainmentSeeds());
  emitMogzuStorageChange(MOGZU_DIRECT_LISTINGS_KEY);
}

export function ensureDefaultPartnerListings(): void {
  if (typeof localStorage === 'undefined') return;
  ensureDefaultPartnerUsers();
  const parsed = safeReadJson<unknown>(PARTNER_LISTINGS_KEY);
  if (Array.isArray(parsed) && parsed.length > 0) return;
  const partnerId = firstPartnerUserIdOrSeed();
  safeWriteJson(PARTNER_LISTINGS_KEY, buildDefaultPartnerEventEntertainmentSeeds(partnerId));
  emitMogzuStorageChange(PARTNER_LISTINGS_KEY);
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseListingReviews(raw: unknown): ListingReview[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ListingReview[] = [];
  let i = 0;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.reviewer_name !== 'string' || typeof o.comment !== 'string') continue;
    const rating: 4 | 5 = o.rating === 4 ? 4 : 5;
    out.push({
      id: typeof o.id === 'string' ? o.id : `rev-${i++}`,
      reviewer_name: o.reviewer_name,
      company: typeof o.company === 'string' ? o.company : '',
      rating,
      comment: o.comment,
      date: typeof o.date === 'string' ? o.date : nowIso(),
      flagged: o.flagged === true,
    });
  }
  return out.length ? out : undefined;
}

function parseInternalNotes(raw: unknown): InternalAdminNote[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: InternalAdminNote[] = [];
  let i = 0;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.text !== 'string') continue;
    out.push({
      id: typeof o.id === 'string' ? o.id : `note-${i++}`,
      author: typeof o.author === 'string' ? o.author : 'Admin',
      text: o.text,
      at: typeof o.at === 'string' ? o.at : nowIso(),
    });
  }
  return out.length ? out : undefined;
}

function mergeMogzuDirectOptionals(r: Record<string, unknown>, base: MogzuDirectListing): MogzuDirectListing {
  const pricing_type =
    r.pricing_type === 'transparent' || r.pricing_type === 'offer_price' || r.pricing_type === 'request_for_price'
      ? r.pricing_type
      : undefined;
  const price_type =
    r.price_type === 'per_person' ||
    r.price_type === 'flat' ||
    r.price_type === 'per_hour' ||
    r.price_type === 'package'
      ? r.price_type
      : undefined;
  const listing_source =
    r.listing_source === 'vendor' || r.listing_source === 'mogzu_direct' ? r.listing_source : undefined;
  const listing_kind = r.listing_kind === 'activities' || r.listing_kind === 'services' ? r.listing_kind : undefined;
  const location_type =
    r.location_type === 'on_site' || r.location_type === 'virtual' || r.location_type === 'hybrid'
      ? r.location_type
      : undefined;
  const languages = Array.isArray(r.languages)
    ? r.languages.filter((x): x is string => typeof x === 'string')
    : undefined;
  const tags = Array.isArray(r.tags) ? r.tags.filter((x): x is string => typeof x === 'string') : undefined;
  const badgesRaw = r.badges;
  const badges = Array.isArray(badgesRaw)
    ? (badgesRaw.filter((b): b is 'Top Rated' | 'Verified' | 'Popular' | 'New' =>
        b === 'Top Rated' || b === 'Verified' || b === 'Popular' || b === 'New',
      ) as Array<'Top Rated' | 'Verified' | 'Popular' | 'New'>)
    : undefined;
  const add_ons = Array.isArray(r.add_ons)
    ? (r.add_ons.filter((a) => a && typeof a === 'object') as ListingAddOn[])
    : undefined;
  const availability_slots = Array.isArray(r.availability_slots)
    ? (r.availability_slots.filter((a) => a && typeof a === 'object') as ListingAvailabilitySlot[])
    : undefined;
  const price_packages = Array.isArray(r.price_packages)
    ? (r.price_packages.filter((p) => p && typeof p === 'object') as ListingPricePackage[])
    : undefined;
  const reviews = parseListingReviews(r.reviews);
  const internal_notes = parseInternalNotes(r.internal_notes);

  return {
    ...base,
    pricing_type: pricing_type ?? base.pricing_type,
    price_type: price_type ?? base.price_type,
    base_price: typeof r.base_price === 'number' && !Number.isNaN(r.base_price) ? r.base_price : base.base_price,
    price_packages: price_packages ?? base.price_packages,
    starting_price:
      typeof r.starting_price === 'number' && !Number.isNaN(r.starting_price) ? r.starting_price : base.starting_price,
    min_acceptable_offer:
      typeof r.min_acceptable_offer === 'number' && !Number.isNaN(r.min_acceptable_offer)
        ? r.min_acceptable_offer
        : base.min_acceptable_offer,
    offer_validity_hours:
      typeof r.offer_validity_hours === 'number' && !Number.isNaN(r.offer_validity_hours)
        ? r.offer_validity_hours
        : base.offer_validity_hours,
    response_time_hours:
      typeof r.response_time_hours === 'number' && !Number.isNaN(r.response_time_hours)
        ? r.response_time_hours
        : base.response_time_hours,
    listing_source: listing_source ?? base.listing_source,
    mogzu_direct_alias:
      typeof r.mogzu_direct_alias === 'string' ? r.mogzu_direct_alias : base.mogzu_direct_alias,
    vendor_id: r.vendor_id === null ? null : typeof r.vendor_id === 'string' ? r.vendor_id : base.vendor_id,
    vendor_name: typeof r.vendor_name === 'string' ? r.vendor_name : base.vendor_name,
    vendor_rating: typeof r.vendor_rating === 'number' && !Number.isNaN(r.vendor_rating) ? r.vendor_rating : base.vendor_rating,
    vendor_verified: typeof r.vendor_verified === 'boolean' ? r.vendor_verified : base.vendor_verified,
    city:
      r.city === 'Hyderabad' ||
      r.city === 'Mumbai' ||
      r.city === 'Bangalore' ||
      r.city === 'Delhi' ||
      r.city === 'Chennai' ||
      r.city === 'Pune'
        ? r.city
        : base.city,
    reviews: reviews ?? base.reviews,
    add_ons: add_ons ?? base.add_ons,
    availability_slots: availability_slots ?? base.availability_slots,
    badges: badges ?? base.badges,
    featured: typeof r.featured === 'boolean' ? r.featured : base.featured,
    submission_date: typeof r.submission_date === 'string' ? r.submission_date : base.submission_date,
    approval_date: typeof r.approval_date === 'string' ? r.approval_date : base.approval_date,
    approved_by: typeof r.approved_by === 'string' ? r.approved_by : base.approved_by,
    rejection_reason: typeof r.rejection_reason === 'string' ? r.rejection_reason : base.rejection_reason,
    rejection_feedback: typeof r.rejection_feedback === 'string' ? r.rejection_feedback : base.rejection_feedback,
    rejection_date: typeof r.rejection_date === 'string' ? r.rejection_date : base.rejection_date,
    internal_notes: internal_notes ?? base.internal_notes,
    listing_kind: listing_kind ?? base.listing_kind,
    location_type: location_type ?? base.location_type,
    languages: languages ?? base.languages,
    tags: tags ?? base.tags,
  };
}

function mergePartnerOptionals(r: Record<string, unknown>, base: PartnerListing): PartnerListing {
  const pricing_type =
    r.pricing_type === 'transparent' || r.pricing_type === 'offer_price' || r.pricing_type === 'request_for_price'
      ? r.pricing_type
      : undefined;
  const price_type =
    r.price_type === 'per_person' ||
    r.price_type === 'flat' ||
    r.price_type === 'per_hour' ||
    r.price_type === 'package'
      ? r.price_type
      : undefined;
  const listing_source =
    r.listing_source === 'vendor' || r.listing_source === 'mogzu_direct' ? r.listing_source : undefined;
  const listing_kind = r.listing_kind === 'activities' || r.listing_kind === 'services' ? r.listing_kind : undefined;
  const location_type =
    r.location_type === 'on_site' || r.location_type === 'virtual' || r.location_type === 'hybrid'
      ? r.location_type
      : undefined;
  const languages = Array.isArray(r.languages)
    ? r.languages.filter((x): x is string => typeof x === 'string')
    : undefined;
  const tags = Array.isArray(r.tags) ? r.tags.filter((x): x is string => typeof x === 'string') : undefined;
  const badgesRaw = r.badges;
  const badges = Array.isArray(badgesRaw)
    ? (badgesRaw.filter((b): b is 'Top Rated' | 'Verified' | 'Popular' | 'New' =>
        b === 'Top Rated' || b === 'Verified' || b === 'Popular' || b === 'New',
      ) as Array<'Top Rated' | 'Verified' | 'Popular' | 'New'>)
    : undefined;
  const add_ons = Array.isArray(r.add_ons)
    ? (r.add_ons.filter((a) => a && typeof a === 'object') as ListingAddOn[])
    : undefined;
  const availability_slots = Array.isArray(r.availability_slots)
    ? (r.availability_slots.filter((a) => a && typeof a === 'object') as ListingAvailabilitySlot[])
    : undefined;
  const price_packages = Array.isArray(r.price_packages)
    ? (r.price_packages.filter((p) => p && typeof p === 'object') as ListingPricePackage[])
    : undefined;
  const reviews = parseListingReviews(r.reviews);
  const internal_notes = parseInternalNotes(r.internal_notes);

  return {
    ...base,
    pricing_type: pricing_type ?? base.pricing_type,
    price_type: price_type ?? base.price_type,
    base_price: typeof r.base_price === 'number' && !Number.isNaN(r.base_price) ? r.base_price : base.base_price,
    price_packages: price_packages ?? base.price_packages,
    starting_price:
      typeof r.starting_price === 'number' && !Number.isNaN(r.starting_price) ? r.starting_price : base.starting_price,
    min_acceptable_offer:
      typeof r.min_acceptable_offer === 'number' && !Number.isNaN(r.min_acceptable_offer)
        ? r.min_acceptable_offer
        : base.min_acceptable_offer,
    offer_validity_hours:
      typeof r.offer_validity_hours === 'number' && !Number.isNaN(r.offer_validity_hours)
        ? r.offer_validity_hours
        : base.offer_validity_hours,
    response_time_hours:
      typeof r.response_time_hours === 'number' && !Number.isNaN(r.response_time_hours)
        ? r.response_time_hours
        : base.response_time_hours,
    listing_source: listing_source ?? base.listing_source,
    mogzu_direct_alias:
      typeof r.mogzu_direct_alias === 'string' ? r.mogzu_direct_alias : base.mogzu_direct_alias,
    vendor_id: r.vendor_id === null ? null : typeof r.vendor_id === 'string' ? r.vendor_id : base.vendor_id,
    vendor_name: typeof r.vendor_name === 'string' ? r.vendor_name : base.vendor_name,
    vendor_rating: typeof r.vendor_rating === 'number' && !Number.isNaN(r.vendor_rating) ? r.vendor_rating : base.vendor_rating,
    vendor_verified: typeof r.vendor_verified === 'boolean' ? r.vendor_verified : base.vendor_verified,
    city:
      r.city === 'Hyderabad' ||
      r.city === 'Mumbai' ||
      r.city === 'Bangalore' ||
      r.city === 'Delhi' ||
      r.city === 'Chennai' ||
      r.city === 'Pune'
        ? r.city
        : base.city,
    reviews: reviews ?? base.reviews,
    add_ons: add_ons ?? base.add_ons,
    availability_slots: availability_slots ?? base.availability_slots,
    badges: badges ?? base.badges,
    featured: typeof r.featured === 'boolean' ? r.featured : base.featured,
    submission_date: typeof r.submission_date === 'string' ? r.submission_date : base.submission_date,
    approval_date: typeof r.approval_date === 'string' ? r.approval_date : base.approval_date,
    approved_by: typeof r.approved_by === 'string' ? r.approved_by : base.approved_by,
    rejection_reason: typeof r.rejection_reason === 'string' ? r.rejection_reason : base.rejection_reason,
    rejection_feedback: typeof r.rejection_feedback === 'string' ? r.rejection_feedback : base.rejection_feedback,
    rejection_date: typeof r.rejection_date === 'string' ? r.rejection_date : base.rejection_date,
    internal_notes: internal_notes ?? base.internal_notes,
    listing_kind: listing_kind ?? base.listing_kind,
    location_type: location_type ?? base.location_type,
    languages: languages ?? base.languages,
    tags: tags ?? base.tags,
  };
}

/** Upgrade legacy rows saved before full MogzuDirectListing shape existed. */
export function normalizeMogzuDirectListing(row: unknown): MogzuDirectListing | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id.trim()) return null;
  if (r.owner_type != null && r.owner_type !== 'mogzu_direct') return null;

  const module: MogzuListingModule =
    r.module === 'dspace' || r.module === 'gifting' || r.module === 'events' ? r.module : 'gifting';

  const pricing_mode: MogzuPricingMode =
    r.pricing_mode === 'negotiable' || r.pricing_mode === 'on_request' || r.pricing_mode === 'fixed'
      ? r.pricing_mode
      : 'fixed';

  const status: MogzuDirectListingStatus =
    r.status === 'draft' ||
    r.status === 'active' ||
    r.status === 'paused' ||
    r.status === 'rejected' ||
    r.status === 'archived'
      ? r.status
      : 'draft';

  const title = typeof r.title === 'string' ? r.title : 'Untitled';
  const category = typeof r.category === 'string' ? r.category : 'General';
  const price = typeof r.price === 'number' && !Number.isNaN(r.price) ? r.price : 0;
  const price_unit = typeof r.price_unit === 'string' ? r.price_unit : 'unit';

  const description_short =
    typeof r.description_short === 'string' ? r.description_short : typeof r.description_long === 'string' ? r.description_long.slice(0, 160) : '';
  const description_long =
    typeof r.description_long === 'string' ? r.description_long : description_short || 'No description yet.';

  let images: string[] = [];
  if (Array.isArray(r.images)) {
    images = r.images.filter((x): x is string => typeof x === 'string');
  }
  const videos = Array.isArray(r.videos) ? r.videos.filter((x): x is string => typeof x === 'string') : [];

  const created_at = typeof r.created_at === 'string' ? r.created_at : nowIso();
  const updated_at = typeof r.updated_at === 'string' ? r.updated_at : nowIso();
  const buyer_detail = normalizeBuyerDetailBlock(r.buyer_detail, []);

  const base: MogzuDirectListing = {
    id: r.id,
    owner_type: 'mogzu_direct',
    module,
    title,
    description_short,
    description_long,
    images,
    videos,
    category,
    pricing_mode,
    price,
    price_unit,
    status,
    managed_by: 'mogzu_team',
    buyer_detail,
    created_at,
    updated_at,
  };
  return mergeMogzuDirectOptionals(r, base);
}

function legacyDirectNeedsMigration(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.description_short !== 'string' ||
    typeof r.description_long !== 'string' ||
    !Array.isArray(r.images) ||
    r.managed_by !== 'mogzu_team' ||
    typeof r.created_at !== 'string' ||
    typeof r.updated_at !== 'string' ||
    !r.buyer_detail ||
    typeof r.buyer_detail !== 'object'
  );
}

export function loadMogzuDirectListings(): MogzuDirectListing[] {
  ensureDefaultMogzuDirectListings();
  const parsed = safeReadJson<unknown>(MOGZU_DIRECT_LISTINGS_KEY);
  if (!Array.isArray(parsed)) return [];
  const normalized: MogzuDirectListing[] = [];
  let changed = false;
  for (const item of parsed) {
    const n = normalizeMogzuDirectListing(item);
    if (n) {
      normalized.push(n);
      if (legacyDirectNeedsMigration(item)) changed = true;
    }
  }
  if (changed && normalized.length >= 0) {
    safeWriteJson(MOGZU_DIRECT_LISTINGS_KEY, normalized);
  }
  return normalized;
}

export function saveMogzuDirectListings(rows: MogzuDirectListing[]): void {
  safeWriteJson(MOGZU_DIRECT_LISTINGS_KEY, rows);
}

export function normalizePartnerListing(row: unknown): PartnerListing | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id.trim()) return null;
  if (r.owner_type != null && r.owner_type !== 'partner') return null;
  const module: MogzuListingModule =
    r.module === 'dspace' || r.module === 'gifting' || r.module === 'events' ? r.module : 'gifting';
  const partner_id = typeof r.partner_id === 'string' ? r.partner_id : '';
  const pricing_mode: MogzuPricingMode =
    r.pricing_mode === 'negotiable' || r.pricing_mode === 'on_request' || r.pricing_mode === 'fixed'
      ? r.pricing_mode
      : 'fixed';
  const status: PartnerListingStatus =
    r.status === 'draft' ||
    r.status === 'pending_review' ||
    r.status === 'active' ||
    r.status === 'paused' ||
    r.status === 'rejected' ||
    r.status === 'archived'
      ? r.status
      : 'draft';
  const profit =
    typeof r.profit_share_percentage === 'number' && !Number.isNaN(r.profit_share_percentage)
      ? r.profit_share_percentage
      : 0;
  const images = Array.isArray(r.images) ? r.images.filter((x): x is string => typeof x === 'string') : [];
  const portfolio_links = Array.isArray(r.portfolio_links)
    ? r.portfolio_links.filter((x): x is string => typeof x === 'string')
    : [];
  const videos = Array.isArray(r.videos) ? r.videos.filter((x): x is string => typeof x === 'string') : [];
  const created_at = typeof r.created_at === 'string' ? r.created_at : nowIso();
  const updated_at = typeof r.updated_at === 'string' ? r.updated_at : nowIso();
  const buyer_detail = normalizeBuyerDetailBlock(r.buyer_detail, portfolio_links);
  const base: PartnerListing = {
    id: r.id,
    owner_type: 'partner',
    partner_id,
    module,
    title: typeof r.title === 'string' ? r.title : 'Untitled',
    description_short: typeof r.description_short === 'string' ? r.description_short : '',
    description_long:
      typeof r.description_long === 'string' ? r.description_long : typeof r.description_short === 'string' ? r.description_short : '',
    images,
    portfolio_links,
    videos,
    category: typeof r.category === 'string' ? r.category : 'General',
    pricing_mode,
    price: typeof r.price === 'number' && !Number.isNaN(r.price) ? r.price : 0,
    price_unit: typeof r.price_unit === 'string' ? r.price_unit : 'unit',
    profit_share_percentage: profit,
    status,
    buyer_detail,
    created_at,
    updated_at,
  };
  return mergePartnerOptionals(r, base);
}

function legacyPartnerListingNeedsMigration(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.description_short !== 'string' ||
    typeof r.partner_id !== 'string' ||
    !Array.isArray(r.portfolio_links) ||
    !Array.isArray(r.videos) ||
    !r.buyer_detail ||
    typeof r.buyer_detail !== 'object'
  );
}

export function loadPartnerListings(): PartnerListing[] {
  ensureDefaultPartnerListings();
  const parsed = safeReadJson<unknown>(PARTNER_LISTINGS_KEY);
  if (!Array.isArray(parsed)) return [];
  const normalized: PartnerListing[] = [];
  let changed = false;
  for (const item of parsed) {
    const n = normalizePartnerListing(item);
    if (n) {
      normalized.push(n);
      if (legacyPartnerListingNeedsMigration(item)) changed = true;
    }
  }
  if (changed) safeWriteJson(PARTNER_LISTINGS_KEY, normalized);
  return normalized;
}

export function savePartnerListings(rows: PartnerListing[]): void {
  safeWriteJson(PARTNER_LISTINGS_KEY, rows);
}

export function normalizePartnerUser(row: unknown): PartnerUser | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id.trim()) return null;
  if (r.role != null && r.role !== 'partner') return null;
  const modules: MogzuListingModule[] = Array.isArray(r.modules)
    ? r.modules.filter((m): m is MogzuListingModule => m === 'dspace' || m === 'gifting' || m === 'events')
    : [];
  const expertise = Array.isArray(r.expertise)
    ? r.expertise.filter((x): x is string => typeof x === 'string')
    : [];
  const bd = r.bank_details && typeof r.bank_details === 'object' ? (r.bank_details as Record<string, unknown>) : {};
  const status =
    r.status === 'pending' || r.status === 'active' || r.status === 'suspended' ? r.status : 'pending';
  const profit =
    typeof r.profit_share_percentage === 'number' && !Number.isNaN(r.profit_share_percentage)
      ? r.profit_share_percentage
      : 0;
  return {
    id: r.id,
    role: 'partner',
    name: typeof r.name === 'string' ? r.name : '',
    email: typeof r.email === 'string' ? r.email : '',
    phone: typeof r.phone === 'string' ? r.phone : '',
    business_name: typeof r.business_name === 'string' ? r.business_name : '',
    expertise,
    modules,
    profit_share_percentage: profit,
    bank_details: {
      account_name: typeof bd.account_name === 'string' ? bd.account_name : '',
      account_number: typeof bd.account_number === 'string' ? bd.account_number : '',
      ifsc: typeof bd.ifsc === 'string' ? bd.ifsc : '',
    },
    status,
    joined_at: typeof r.joined_at === 'string' ? r.joined_at : nowIso(),
  };
}

function legacyPartnerUserNeedsMigration(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return typeof r.joined_at !== 'string' || !r.bank_details || typeof r.bank_details !== 'object';
}

export function loadPartnerUsers(): PartnerUser[] {
  ensureDefaultPartnerUsers();
  const parsed = safeReadJson<unknown>(PARTNER_USERS_KEY);
  if (!Array.isArray(parsed)) return [];
  const normalized: PartnerUser[] = [];
  let changed = false;
  for (const item of parsed) {
    const n = normalizePartnerUser(item);
    if (n) {
      normalized.push(n);
      if (legacyPartnerUserNeedsMigration(item)) changed = true;
    }
  }
  if (changed) safeWriteJson(PARTNER_USERS_KEY, normalized);
  return normalized;
}

export function savePartnerUsers(rows: PartnerUser[]): void {
  safeWriteJson(PARTNER_USERS_KEY, rows);
}

function normalizeShortlistOption(raw: unknown): ShortlistOption | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.listing_id !== 'string' || typeof o.listing_type !== 'string') return null;
  const lt = o.listing_type;
  if (lt !== 'mogzu_direct' && lt !== 'partner' && lt !== 'vendor') return null;
  const st = o.source_type;
  const source_type =
    st === 'vendor' || st === 'mogzu_direct' ? st : undefined;
  const display_price =
    typeof o.display_price === 'number' && !Number.isNaN(o.display_price) ? o.display_price : undefined;
  return {
    id: o.id,
    listing_id: o.listing_id,
    listing_type: lt,
    title: typeof o.title === 'string' ? o.title : '',
    description: typeof o.description === 'string' ? o.description : '',
    images: strArrayFromUnknown(o.images),
    videos: strArrayFromUnknown(o.videos),
    portfolio_links: strArrayFromUnknown(o.portfolio_links),
    amenities: strArrayFromUnknown(o.amenities),
    payment_summary: typeof o.payment_summary === 'string' ? o.payment_summary : '',
    price: typeof o.price === 'number' && !Number.isNaN(o.price) ? o.price : 0,
    price_unit: typeof o.price_unit === 'string' ? o.price_unit : 'unit',
    terms_and_conditions: typeof o.terms_and_conditions === 'string' ? o.terms_and_conditions : '',
    admin_note: typeof o.admin_note === 'string' ? o.admin_note : '',
    is_recommended: o.is_recommended === true,
    corporate_selected: o.corporate_selected === true,
    source_type,
    source_id: typeof o.source_id === 'string' ? o.source_id : undefined,
    display_price,
    vendor_name: typeof o.vendor_name === 'string' ? o.vendor_name : undefined,
  };
}

function normalizeShortlistProposal(row: unknown): ShortlistProposal | null {
  if (!row || typeof row !== 'object') return null;
  const p = row as Record<string, unknown>;
  if (typeof p.id !== 'string' || typeof p.proposal_token !== 'string') return null;
  const rawOpts = p.shortlisted_options;
  const shortlisted_options: ShortlistOption[] = [];
  if (Array.isArray(rawOpts)) {
    for (const item of rawOpts) {
      const n = normalizeShortlistOption(item);
      if (n) shortlisted_options.push(n);
    }
  }
  const status = p.status;
  const st = status === 'draft' || status === 'sent' || status === 'viewed' || status === 'selection_made' ? status : 'draft';
  return {
    id: p.id,
    proposal_token: p.proposal_token,
    corporate_enquiry_id: typeof p.corporate_enquiry_id === 'string' ? p.corporate_enquiry_id : '',
    corporate_user_id: typeof p.corporate_user_id === 'string' ? p.corporate_user_id : '',
    corporate_email: typeof p.corporate_email === 'string' ? p.corporate_email : '',
    corporate_whatsapp: typeof p.corporate_whatsapp === 'string' ? p.corporate_whatsapp : '',
    created_by_admin: typeof p.created_by_admin === 'string' ? p.created_by_admin : 'admin',
    title: typeof p.title === 'string' ? p.title : '',
    message: typeof p.message === 'string' ? p.message : '',
    budget: typeof p.budget === 'number' && !Number.isNaN(p.budget) ? p.budget : 0,
    event_date: typeof p.event_date === 'string' ? p.event_date : '',
    requirements: typeof p.requirements === 'string' ? p.requirements : '',
    shortlisted_options,
    status: st,
    sent_via: Array.isArray(p.sent_via) ? p.sent_via.filter((x): x is 'email' | 'whatsapp' => x === 'email' || x === 'whatsapp') : [],
    created_at: typeof p.created_at === 'string' ? p.created_at : nowIso(),
    expires_at: typeof p.expires_at === 'string' ? p.expires_at : nowIso(),
  };
}

function shortlistOptionNeedsMigration(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return !Array.isArray(o.amenities) || typeof o.payment_summary !== 'string';
}

export function loadShortlistProposals(): ShortlistProposal[] {
  const parsed = safeReadJson<unknown>(SHORTLIST_PROPOSALS_KEY);
  if (!Array.isArray(parsed)) return [];
  let needsPersist = false;
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const opts = (item as Record<string, unknown>).shortlisted_options;
    if (Array.isArray(opts) && opts.some((o) => shortlistOptionNeedsMigration(o))) {
      needsPersist = true;
      break;
    }
  }
  const out: ShortlistProposal[] = [];
  for (const item of parsed) {
    const n = normalizeShortlistProposal(item);
    if (n) out.push(n);
  }
  if (needsPersist) {
    safeWriteJson(SHORTLIST_PROPOSALS_KEY, out);
    emitMogzuStorageChange(SHORTLIST_PROPOSALS_KEY);
  }
  return out;
}

export function saveShortlistProposals(rows: ShortlistProposal[]): void {
  safeWriteJson(SHORTLIST_PROPOSALS_KEY, rows);
  emitMogzuStorageChange(SHORTLIST_PROPOSALS_KEY);
}

export function loadMogzuOrders(): MogzuOrder[] {
  const parsed = safeReadJson<unknown>(MOGZU_ORDERS_KEY);
  return Array.isArray(parsed) ? (parsed as MogzuOrder[]) : [];
}

export function saveMogzuOrders(rows: MogzuOrder[]): void {
  safeWriteJson(MOGZU_ORDERS_KEY, rows);
  emitMogzuStorageChange(MOGZU_ORDERS_KEY);
}

/** Unified corporate catalogue row (Mogzu Direct + vendor network). See `src/utils/catalogueTypes.ts`. */
export type { CatalogueItem } from '../src/utils/catalogueTypes';


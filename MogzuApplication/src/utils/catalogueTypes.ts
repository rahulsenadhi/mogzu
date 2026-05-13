/**
 * Unified corporate service catalogue row — vendor network + Mogzu Direct.
 */
export interface CatalogueItem {
  id: string;
  /** Identifies origin for routing and badges. */
  source_type: 'vendor' | 'mogzu_direct';
  /** Present when `source_type === 'vendor'`. */
  vendor_id?: string;
  /** Display name (vendor business name or "Mogzu"). */
  vendor_name?: string;
  module: 'gifting' | 'events' | 'dspace';
  category: string;
  name: string;
  tagline?: string;
  description: string;
  photos: string[];
  /** Optional media add-on links. */
  videos?: string[];
  pricing_type:
    | 'fixed'
    | 'per_head'
    | 'package'
    | 'custom_quote'
    | 'transparent'
    | 'offer_price'
    | 'request_for_price';
  price_type?: 'per_person' | 'flat' | 'per_hour' | 'package';
  base_price?: number;
  starting_price?: number;
  min_acceptable_offer?: number;
  offer_validity_hours?: number;
  response_time_hours?: number;
  add_ons?: Array<{ name: string; price?: number }>;
  /** Human-readable price line for cards. */
  price_label?: string;
  is_mogzu_direct: boolean;
  is_available: boolean;
  rating?: number;
  city?: string;
  tags?: string[];
  /** When false, excluded from admin shortlist search for Mogzu Direct rows. Defaults to shortlistable. */
  is_shortlistable?: boolean;
}

/**
 * Mogzu vendor modules & service categories (aligned with platform service list).
 * Used in vendor onboarding — vendors multi-select where they operate.
 */

export type VendorModuleId =
  | 'spacex_meeting'
  | 'spacex_activities'
  | 'spacex_stay'
  | 'spacex_promotions'
  | 'giev_gifting'
  | 'giev_events_activity'
  | 'giev_events_services'
  | 'hey_genie';

export interface VendorServiceModule {
  id: VendorModuleId;
  label: string;
  description: string;
  categories: string[];
}

export const VENDOR_SERVICE_MODULES: VendorServiceModule[] = [
  {
    id: 'spacex_meeting',
    label: 'SpaceX — Meeting space',
    description: 'Venues for offsites, conferences, and corporate meetings',
    categories: [
      'Conference',
      'Coworking',
      'Casual / unique',
      'Corporate event spaces',
    ],
  },
  {
    id: 'spacex_activities',
    label: 'SpaceX — Activities space',
    description: 'Team experiences, sports, and engagement',
    categories: [
      'Indoor fun',
      'Outdoor adventure',
      'Sports',
      'Team building',
      'Creative & wellness',
      'Social & food',
      'Offsite',
      'Premium',
    ],
  },
  {
    id: 'spacex_stay',
    label: 'SpaceX — Stay',
    description: 'Accommodation for corporate travel and offsites',
    categories: ['Hotels', 'Bedrooms', 'Resorts'],
  },
  {
    id: 'spacex_promotions',
    label: 'SpaceX — Promotions',
    description: 'Retail and promotional touchpoints',
    categories: ['Mall', 'Theatre', 'Retail', 'Gated community', 'Social media'],
  },
  {
    id: 'giev_gifting',
    label: 'GiEv — Gifting',
    description: 'Corporate gifting and hampers',
    categories: ['Branded', 'Go local', 'Go rural'],
  },
  {
    id: 'giev_events_activity',
    label: 'GiEv — Events activity',
    description: 'Workshops, entertainment, and CSR-style experiences',
    categories: [
      'Workshops & trainings',
      'Arts & creativity',
      'Virtual games',
      'Wellness',
      'Entertainment',
      'CSR',
    ],
  },
  {
    id: 'giev_events_services',
    label: 'GiEv — Events services',
    description: 'Catering, logistics, and event operations',
    categories: [
      'Catering',
      'Audio visual rentals',
      'Transport',
      'License',
      'Themed parties',
    ],
  },
  {
    id: 'hey_genie',
    label: 'Hey Genie',
    description: 'Deals and concierge-style offers',
    categories: ['Discount coupons'],
  },
];

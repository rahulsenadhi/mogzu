import { QA_IMAGES } from '@/app/lib/qaImagery'

export type EventServiceCategory =
  | 'Entertainment'
  | 'Decor'
  | 'Catering'
  | 'Photography'
  | 'AV & Tech'
  | 'Staffing'
  | 'Activities'

export type EventServicePricingType = 'transparent' | 'offer_price' | 'request_for_price'

export type EventType =
  | 'Conference'
  | 'Team Outing'
  | 'Product Launch'
  | 'Birthday'
  | 'Networking'
  | 'Other'

export type EventServiceAddOn = {
  id: string
  name: string
  price: number
}

export type EventService = {
  id: string
  name: string
  vendorName: string
  category: EventServiceCategory
  city: string
  pricingType: EventServicePricingType
  price?: number
  originalPrice?: number
  rating: number
  ratingCount: number
  images: string[]
  included: string[]
  faqs: Array<{ q: string; a: string }>
  addOns: EventServiceAddOn[]
  availabilityDates: string[]
  supportedEventTypes: EventType[]
}

export type EventActivityListing = {
  id: number
  /** Supabase listing UUID when loaded from live catalogue */
  listingUuid?: string
  name: string
  city: string
  category: EventServiceCategory
  pricingType: EventServicePricingType
  price?: number
  originalPrice?: number
  rating: number
  ratingCount: number
  image: string
  images: string[]
  availabilityDates: string[]
  supportedEventTypes: EventType[]
}

export const EVENT_SERVICE_CATEGORIES: EventServiceCategory[] = [
  'Entertainment',
  'Decor',
  'Catering',
  'Photography',
  'AV & Tech',
  'Staffing',
  'Activities',
]

export const EVENT_TYPES: EventType[] = [
  'Conference',
  'Team Outing',
  'Product Launch',
  'Birthday',
  'Networking',
  'Other',
]

const seedDates = (startIso: string, count: number, stepDays: number) => {
  const base = new Date(`${startIso}T12:00:00`)
  if (Number.isNaN(base.getTime())) return []
  return Array.from({ length: Math.max(0, count) }).map((_, idx) => {
    const d = new Date(base)
    d.setDate(d.getDate() + idx * stepDays)
    return d.toISOString().slice(0, 10)
  })
}

const cardImages = QA_IMAGES.eventCard

export const EVENT_SERVICES: EventService[] = [
  {
    id: 'svc-ent-1',
    name: 'Live Band + Emcee Combo',
    vendorName: 'BR Group Events',
    category: 'Entertainment',
    city: 'Mumbai',
    pricingType: 'offer_price',
    originalPrice: 85000,
    price: 69000,
    rating: 4.7,
    ratingCount: 216,
    images: [cardImages[0], cardImages[1], cardImages[2], cardImages[3], cardImages[4]],
    included: ['2-hour performance', 'Sound check', 'Stage coordination', 'Basic mic setup'],
    faqs: [
      { q: 'Do you travel within the city?', a: 'Yes. Travel within city limits is included.' },
      { q: 'Can we customize the setlist?', a: 'Yes. Share your preferences 5 days before the event.' },
    ],
    addOns: [
      { id: 'addon-1', name: 'Extra 30 minutes performance', price: 12000 },
      { id: 'addon-2', name: 'LED backdrop (8x10)', price: 15000 },
      { id: 'addon-3', name: 'DJ afterparty (1 hour)', price: 18000 },
    ],
    availabilityDates: seedDates('2026-04-10', 10, 3),
    supportedEventTypes: ['Conference', 'Product Launch', 'Networking', 'Other'],
  },
  {
    id: 'svc-dec-1',
    name: 'Premium Stage + Venue Decor',
    vendorName: 'BluePetal Decor Co.',
    category: 'Decor',
    city: 'Bengaluru',
    pricingType: 'transparent',
    price: 54000,
    rating: 4.5,
    ratingCount: 142,
    images: [cardImages[1], cardImages[2], cardImages[3], cardImages[4], cardImages[0]],
    included: ['Stage backdrop', 'Entrance arch', 'Table centerpieces', 'On-site setup crew'],
    faqs: [
      { q: 'Is teardown included?', a: 'Yes, teardown is included within 2 hours post-event.' },
      { q: 'Can you match brand colors?', a: 'Yes. Provide brand guidelines and we’ll match tones.' },
    ],
    addOns: [
      { id: 'addon-4', name: 'Floral upgrade package', price: 22000 },
      { id: 'addon-5', name: 'Ambient lighting set', price: 9000 },
    ],
    availabilityDates: seedDates('2026-04-09', 12, 2),
    supportedEventTypes: ['Conference', 'Product Launch', 'Birthday', 'Other'],
  },
  {
    id: 'svc-cat-1',
    name: 'Corporate Catering (Veg + Non-Veg)',
    vendorName: 'TasteCraft Kitchens',
    category: 'Catering',
    city: 'Delhi',
    pricingType: 'request_for_price',
    rating: 4.6,
    ratingCount: 301,
    images: [cardImages[2], cardImages[3], cardImages[4], cardImages[0], cardImages[1]],
    included: ['Menu planning', 'On-site service staff', 'Buffet setup', 'Cutlery & disposables'],
    faqs: [
      { q: 'Do you support dietary restrictions?', a: 'Yes. Jain, vegan, gluten-free options available.' },
      { q: 'What is the typical lead time?', a: '3-5 days depending on pax and menu complexity.' },
    ],
    addOns: [
      { id: 'addon-6', name: 'Live counter (1)', price: 15000 },
      { id: 'addon-7', name: 'Dessert bar', price: 12000 },
    ],
    availabilityDates: seedDates('2026-04-12', 8, 4),
    supportedEventTypes: ['Conference', 'Team Outing', 'Product Launch', 'Birthday', 'Networking', 'Other'],
  },
  {
    id: 'svc-pho-1',
    name: 'Photography + Short Highlight Reel',
    vendorName: 'PixelMint Studios',
    category: 'Photography',
    city: 'Hyderabad',
    pricingType: 'transparent',
    price: 38000,
    rating: 4.4,
    ratingCount: 88,
    images: [cardImages[3], cardImages[4], cardImages[0], cardImages[1], cardImages[2]],
    included: ['1 lead photographer', 'Candid coverage', '200 edited photos', '2-min highlight reel'],
    faqs: [
      { q: 'When do we receive deliverables?', a: 'Photos in 7 days, highlight reel in 10 days.' },
      { q: 'Can you add a second shooter?', a: 'Yes. Add-on available.' },
    ],
    addOns: [
      { id: 'addon-8', name: 'Second photographer', price: 14000 },
      { id: 'addon-9', name: 'Same-day 20 photo edits', price: 7000 },
    ],
    availabilityDates: seedDates('2026-04-08', 14, 2),
    supportedEventTypes: ['Conference', 'Product Launch', 'Networking', 'Other'],
  },
  {
    id: 'svc-av-1',
    name: 'AV Setup (Mic + Projector + LED)',
    vendorName: 'StageWave AV',
    category: 'AV & Tech',
    city: 'Pune',
    pricingType: 'offer_price',
    originalPrice: 62000,
    price: 49900,
    rating: 4.3,
    ratingCount: 64,
    images: [cardImages[4], cardImages[0], cardImages[1], cardImages[2], cardImages[3]],
    included: ['2 wireless mics', 'Projector + screen', 'Basic LED wash lights', 'On-site technician'],
    faqs: [
      { q: 'Do you support hybrid events?', a: 'Yes. Streaming setup available as an add-on.' },
      { q: 'Is power backup included?', a: 'Not included by default; can be arranged.' },
    ],
    addOns: [
      { id: 'addon-10', name: 'Streaming kit + operator', price: 18000 },
      { id: 'addon-11', name: 'Extra speaker pair', price: 8000 },
    ],
    availabilityDates: seedDates('2026-04-11', 10, 3),
    supportedEventTypes: ['Conference', 'Product Launch', 'Networking', 'Other'],
  },
  {
    id: 'svc-sta-1',
    name: 'Event Staffing (Hostesses + Coordinators)',
    vendorName: 'ServePro Staffing',
    category: 'Staffing',
    city: 'Chennai',
    pricingType: 'request_for_price',
    rating: 4.2,
    ratingCount: 51,
    images: [cardImages[0], cardImages[2], cardImages[4], cardImages[1], cardImages[3]],
    included: ['Briefing & coordination', 'Uniformed staff', 'On-ground supervisor'],
    faqs: [
      { q: 'Can you staff multi-day events?', a: 'Yes. We can staff multi-day events with shifts.' },
      { q: 'Do you provide bilingual staff?', a: 'Yes, based on availability and request.' },
    ],
    addOns: [
      { id: 'addon-12', name: 'Extra supervisor', price: 6000 },
      { id: 'addon-13', name: 'Bilingual staffing package', price: 9000 },
    ],
    availabilityDates: seedDates('2026-04-10', 9, 3),
    supportedEventTypes: ['Conference', 'Team Outing', 'Product Launch', 'Networking', 'Other'],
  },
  {
    id: 'svc-act-1',
    name: 'Team-Building Activity Pack',
    vendorName: 'Bond & Build Co.',
    category: 'Activities',
    city: 'Mumbai',
    pricingType: 'transparent',
    price: 32000,
    rating: 4.8,
    ratingCount: 189,
    images: [cardImages[1], cardImages[0], cardImages[3], cardImages[2], cardImages[4]],
    included: ['2 facilitators', 'Activity props', 'Pre-event briefing', 'Post-event summary'],
    faqs: [
      { q: 'Is it suitable for mixed fitness levels?', a: 'Yes. We adapt games to your group.' },
      { q: 'Can you run it indoors?', a: 'Yes. Indoor options are available.' },
    ],
    addOns: [
      { id: 'addon-14', name: 'Extra activity module', price: 9000 },
      { id: 'addon-15', name: 'Custom branded kits', price: 11000 },
    ],
    availabilityDates: seedDates('2026-04-09', 15, 2),
    supportedEventTypes: ['Team Outing', 'Conference', 'Other'],
  },
]

export const EVENT_ACTIVITY_LISTINGS: EventActivityListing[] = [
  {
    id: 1,
    name: 'Leadership Sprint Workshop',
    city: 'Mumbai',
    category: 'Activities',
    pricingType: 'transparent',
    price: 28000,
    rating: 4.6,
    ratingCount: 132,
    image: cardImages[0],
    images: [cardImages[0], cardImages[1], cardImages[2], cardImages[3], cardImages[4]],
    availabilityDates: seedDates('2026-04-10', 10, 3),
    supportedEventTypes: ['Conference', 'Team Outing', 'Networking', 'Other'],
  },
  {
    id: 2,
    name: 'Creative Team Challenge',
    city: 'Bengaluru',
    category: 'Activities',
    pricingType: 'offer_price',
    originalPrice: 42000,
    price: 35000,
    rating: 4.5,
    ratingCount: 96,
    image: cardImages[1],
    images: [cardImages[1], cardImages[2], cardImages[3], cardImages[4], cardImages[0]],
    availabilityDates: seedDates('2026-04-09', 12, 2),
    supportedEventTypes: ['Team Outing', 'Birthday', 'Other'],
  },
  {
    id: 3,
    name: 'Corporate Wellness Activity Day',
    city: 'Hyderabad',
    category: 'Activities',
    pricingType: 'request_for_price',
    rating: 4.4,
    ratingCount: 74,
    image: cardImages[2],
    images: [cardImages[2], cardImages[3], cardImages[4], cardImages[0], cardImages[1]],
    availabilityDates: seedDates('2026-04-12', 9, 3),
    supportedEventTypes: ['Team Outing', 'Conference', 'Other'],
  },
  {
    id: 4,
    name: 'Culture & Engagement Carnival',
    city: 'Delhi',
    category: 'Entertainment',
    pricingType: 'offer_price',
    originalPrice: 72000,
    price: 61000,
    rating: 4.7,
    ratingCount: 188,
    image: cardImages[3],
    images: [cardImages[3], cardImages[4], cardImages[0], cardImages[1], cardImages[2]],
    availabilityDates: seedDates('2026-04-11', 8, 4),
    supportedEventTypes: ['Product Launch', 'Networking', 'Other'],
  },
]

export const getEventServiceById = (id: string): EventService | null => {
  const match = EVENT_SERVICES.find((s) => s.id === id)
  return match ?? null
}

export const formatInr = (value: number): string =>
  `₹${Math.max(0, Math.round(value)).toLocaleString('en-IN')}`


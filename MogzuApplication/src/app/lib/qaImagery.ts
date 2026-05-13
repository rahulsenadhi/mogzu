/**
 * Stable remote imagery for Events, Gifting, Activity Suite, and related surfaces.
 * Replaces figma:asset imports that resolve to invisible placeholders under Vite.
 */
export const QA_IMAGES = {
  brandMark:
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&q=80',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&q=80',
  portrait:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&q=80',
  vendorPortrait:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&q=80',

  /** Hero / banners */
  eventsHero:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop&q=80',
  meetingBanner:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&q=80',

  /** Event listing cards (variety) */
  eventCard: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515169067868-5380ec318866?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&q=80',
  ],

  /** Small category / tab thumbnails */
  category: {
    workshop: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80',
    art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=128&h=128&fit=crop&q=80',
    games: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128&h=128&fit=crop&q=80',
    wellness: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=128&h=128&fit=crop&q=80',
    entertainment: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=128&h=128&fit=crop&q=80',
    education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&h=128&fit=crop&q=80',
    party: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=128&h=128&fit=crop&q=80',
    csr: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=128&h=128&fit=crop&q=80',
    catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=128&h=128&fit=crop&q=80',
    audio: 'https://images.unsplash.com/photo-1470225620780-dba8ba362bca?w=128&h=128&fit=crop&q=80',
    decor: 'https://images.unsplash.com/photo-1519167758481-83f29da8a0b4?w=128&h=128&fit=crop&q=80',
    photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244ccff?w=128&h=128&fit=crop&q=80',
    security: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=128&h=128&fit=crop&q=80',
    transport: 'https://images.unsplash.com/photo-1449965408863-eaa24f87e218?w=128&h=128&fit=crop&q=80',
    tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=128&h=128&fit=crop&q=80',
    license: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=128&h=128&fit=crop&q=80',
    tabActive: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=64&h=64&fit=crop&q=80',
    tabInactive: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=64&h=64&fit=crop&q=80',
    ellipseBadge: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=64&h=64&fit=crop&q=80',
  },

  /** Activity Suite module cards */
  activitySuite: {
    spacex:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&q=80',
    event:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop&q=80',
    gifting:
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop&q=80',
    heygenie:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&q=80',
    assistant:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop&q=80',
  },

  /** Gifting hub product tiles */
  giftingProduct: [
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=600&fit=crop&q=80',
  ],

  /** Gifting shop category row */
  shopCategory: {
    apparel:
      'https://images.unsplash.com/photo-1523381210438-271e8be1f52b?w=128&h=128&fit=crop&q=80',
    bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=128&h=128&fit=crop&q=80',
    stationary:
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=128&h=128&fit=crop&q=80',
    tech: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=128&h=128&fit=crop&q=80',
    health: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=128&h=128&fit=crop&q=80',
  },

  shopBanner:
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1400&h=400&fit=crop&q=80',

  /** Event service grid card */
  serviceCard:
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop&q=80',
} as const;

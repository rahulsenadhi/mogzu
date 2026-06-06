/**
 * Mogzu public marketing copy — simple, benefit-led language for landing + managed services.
 */

export const LANDING_COPY = {
  hero: {
    badge: 'Events · Gifts · Spaces',
    titleParts: {
      line1: 'Your next',
      highlight1: 'offsite',
      connector: 'and',
      highlight2: 'gifting',
      line2: 'moment starts here.',
    },
    subtitle:
      'Discover great venues, thoughtful gifts, and team experiences — booked in one place, billed in one invoice. No chasing vendors.',
    bridgeLabel: 'Need help planning something big?',
    bridgeCta: 'Talk to our team',
  },
  modules: {
    title: 'Everything in one place.',
    subtitle: 'Pick events, gifting, or spaces — Mogzu keeps it simple from search to checkout.',
    cards: {
      giev: {
        tagline: 'Events & gifting',
        body: 'Offsites, celebrations, hampers, and swag — planned and delivered without the vendor runaround.',
      },
      dspace: {
        tagline: 'Venues & workspaces',
        body: 'Resorts, meeting rooms, and coworking spaces for teams of every size — book in minutes.',
      },
      heygenie: {
        tagline: 'Custom & concierge',
        body: 'The unusual request, the last-minute ask, the "can someone just handle this?" — we do.',
      },
    },
  },
  trending: {
    title: 'Teams are booking these now.',
    subtitle: 'Popular venues, offsites, and gift bundles — ready to explore.',
  },
  howItWorks: {
    title: 'How it works.',
    subtitle: 'Three steps. No chaos.',
    steps: [
      {
        title: 'Find what fits',
        body: 'Search by city, team size, or occasion. Venues, gifts, and experiences — all in one place.',
      },
      {
        title: 'Book in one go',
        body: 'Add catering, gifts, stay, and activities to a single cart. Your manager can approve in a tap if needed.',
      },
      {
        title: 'We handle the rest',
        body: 'Mogzu coordinates every vendor behind the scenes. You get one clean invoice when it\'s done.',
      },
    ],
  },
  faq: [
    {
      color: '#EE2A7B',
      question: 'Do I really get just one invoice?',
      answer:
        'Yes. Mogzu brings everything together — venue, catering, gifts, talent — and sends your finance team one simple bill. No spreadsheet of vendor receipts.',
    },
    {
      color: '#FF5E00',
      question: 'What can I book on Mogzu?',
      answer:
        'Corporate events and offsites (GiEv), venues and workspaces (D Space), and custom experiences or concierge requests (Hey Genie). Gifting, rentals, and talent too.',
    },
    {
      color: '#15D39D',
      question: 'Can I enquire before signing up?',
      answer:
        'Absolutely. Send us a WhatsApp message with what you need — city, dates, headcount — and our team will scope options and take it from there.',
    },
    {
      color: '#9B51E0',
      question: 'Is Mogzu only for large companies?',
      answer:
        'Not at all. Growing startups use Mogzu to skip hiring an events person. Larger teams love the approvals, budgets, and reporting built in.',
    },
  ],
  cta: {
    titleLine1: 'Stop chasing vendors.',
    titleLine2: 'Start executing.',
    subtitle: 'Finance, IT, pharma, hospitality, education — teams across India plan on Mogzu.',
    primaryLabel: 'Get started free',
    secondaryLabel: 'Enquire on WhatsApp',
  },
  demoModal: {
    title: 'Book a demo',
    subtitle: 'See Mogzu in action — venues, gifting, and one-invoice booking in a 20-minute walkthrough.',
    successTitle: "You're on the list!",
    successBody: 'Our team will reach out shortly to schedule your demo.',
  },
} as const

export type ManagedServiceCopy = {
  id: string
  title: string
  tagline: string
  description: string
  examples: string[]
  module: 'GiEv' | 'D Space' | 'Hey Genie' | 'All modules'
  category: 'events' | 'gifting' | 'talent' | 'bundle'
  featured?: boolean
}

export const MANAGED_SERVICES_COPY = {
  hero: {
    embedded: {
      headline: 'We plan it. You show up.',
      subhead:
        'Not ready to browse the platform? Tell us what you need on WhatsApp — our team books venues, vendors, gifts, and talent, then sends one invoice.',
    },
    page: {
      headline: 'Big plans? We\'ve got the team.',
      subhead:
        'Events, gifting, rentals, and talent — scoped, booked, and delivered by Mogzu. One conversation. One invoice.',
    },
  },
  audience: [
    { label: 'HR & People teams', detail: 'Offsites, town halls, culture days' },
    { label: 'Office & Admin', detail: 'Venues, rentals, team outings' },
    { label: 'Marketing & EAs', detail: 'Launches, gifting, hosts & performers' },
  ],
  audienceHeading: 'Perfect for',
  trustSignals: [
    { label: 'One invoice', detail: 'Not ten vendor bills' },
    { label: 'Trusted partners', detail: 'Same great vendors as the platform' },
    { label: 'Fast replies', detail: 'We pick up on WhatsApp within hours' },
  ],
  catalogueIntro: {
    title: 'What can we help with?',
    subtitle: 'Tap a service below — or mix a few. We\'ll figure out the rest.',
  },
  process: {
    title: 'Simple as 1-2-3',
    subtitle: 'No forms maze. No portal required. Just WhatsApp and done.',
    steps: [
      {
        step: '1',
        title: 'Tell us the plan',
        body: 'City, dates, headcount, vibe — whatever you know so far. We reply on WhatsApp.',
        accent: '#15D39D',
      },
      {
        step: '2',
        title: 'Pick your options',
        body: 'We send shortlisted venues, vendors, or gift ideas with clear pricing. You choose what works.',
        accent: '#FFD100',
      },
      {
        step: '3',
        title: 'We make it happen',
        body: 'Mogzu runs the show. You get one invoice when everything\'s wrapped.',
        accent: '#EE2A7B',
      },
    ],
  },
  form: {
    eyebrow: 'Quick enquiry',
    title: 'Tell us what you\'re planning',
    subtitle: 'Drop your details — we\'ll WhatsApp you back, usually within a few hours.',
    successTitle: 'We got it!',
    successBody: "Thanks! We'll WhatsApp you within a few hours with next steps.",
    submitLabel: 'Send enquiry',
    submittingLabel: 'Sending…',
    consent: 'We\'ll only use your number to follow up on this enquiry.',
    selectedPrefix: 'You picked:',
  },
  ctas: {
    primary: 'Start enquiry',
    secondaryWhatsapp: 'Chat on WhatsApp',
    viewAll: 'See all services',
    cardEnquire: 'Get a quote',
    cardSelected: 'Selected ✓',
  },
  services: [
    {
      id: 'end-to-end-event',
      title: 'Full event planning',
      tagline: 'You dream it. We deliver it.',
      description:
        'Offsites, AGMs, town halls, leadership meets — venue, food, decor, and on-ground team. You focus on the room; we run everything else.',
      examples: ['Team offsites', 'AGMs & town halls', 'Leadership retreats'],
      module: 'GiEv',
      category: 'events',
      featured: true,
    },
    {
      id: 'event-rentals',
      title: 'Rentals & production',
      tagline: 'Everything on stage.',
      description:
        'Stages, AV, furniture, branding, and gear — delivered, set up, and managed at your venue by our partner network.',
      examples: ['AV & staging', 'Signage & branding', 'Furniture hire'],
      module: 'D Space',
      category: 'events',
    },
    {
      id: 'corporate-gifting',
      title: 'Corporate gifting',
      tagline: 'Delight at scale.',
      description:
        'Festive hampers, welcome kits, milestone gifts, and branded swag — packed, personalised, and shipped across India.',
      examples: ['Diwali & festive', 'Welcome kits', 'Client thank-yous'],
      module: 'GiEv',
      category: 'gifting',
      featured: true,
    },
    {
      id: 'artist-management',
      title: 'Artists & hosts',
      tagline: 'Star power, sorted.',
      description:
        'Emcees, performers, speakers, and hosts for launches, awards nights, and celebrations — booked and managed by Mogzu.',
      examples: ['Emcees', 'Live acts', 'Keynote speakers'],
      module: 'Hey Genie',
      category: 'talent',
    },
    {
      id: 'karaoke',
      title: 'Karaoke & experiences',
      tagline: 'Sing. Laugh. Connect.',
      description:
        'Private karaoke, games, and interactive activations for team parties, culture weeks, and brand nights that people actually remember.',
      examples: ['Karaoke nights', 'Team parties', 'Brand activations'],
      module: 'Hey Genie',
      category: 'talent',
    },
    {
      id: 'multiple-services',
      title: 'Mix & match',
      tagline: 'The whole package.',
      description:
        'Gifting plus event plus talent across cities or quarters — one Mogzu contact, one quote, one invoice.',
      examples: ['Event + gifting', 'Multi-city', 'Quarterly calendar'],
      module: 'All modules',
      category: 'bundle',
    },
  ] satisfies ManagedServiceCopy[],
} as const

export const SERVICE_CATEGORY_LABELS: Record<
  ManagedServiceCopy['category'],
  string
> = {
  events: 'Events',
  gifting: 'Gifting',
  talent: 'Talent & fun',
  bundle: 'Mix & match',
}

export const ABOUT_COPY = {
  defaultBody:
    'Mogzu helps companies plan offsites, send gifts, and book spaces — without the vendor chaos. Browse the platform or message our team on WhatsApp; either way, you get one invoice and zero headaches.',
  servicesLink: 'See what we can book for you →',
  cta: 'Talk to our team',
} as const

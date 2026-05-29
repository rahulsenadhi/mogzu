import type { ModuleId } from '@/lib/database.types'
import type { PublicLead } from '@/lib/publicLeads'

export type EnquiryVertical = 'all' | 'gifting' | 'events'

export type LeadQuickSharePrefill = {
  id: string
  client_name: string
  client_company: string | null
  client_email: string
  client_phone: string | null
  requirement_summary: string | null
  budget_band: PublicLead['budget_band']
  timeline: PublicLead['timeline']
  source_slug: string | null
  listing_id: string | null
  preferredModule?: Extract<ModuleId, 'gifting' | 'events'>
}

export const ENQUIRY_VERTICALS: { id: EnquiryVertical; label: string }[] = [
  { id: 'all', label: 'All verticals' },
  { id: 'gifting', label: 'Gifting' },
  { id: 'events', label: 'Events' },
]

const GIFTING_HINTS = [
  'gift',
  'gifting',
  'hamper',
  'hampers',
  'corporate gift',
  'merchandise',
  'swag',
  'diwali',
  'festival kit',
]

const EVENTS_HINTS = [
  'event',
  'events',
  'celebration',
  'venue',
  'wedding',
  'conference',
  'offsite',
  'party',
  'catering',
  'activation',
  'experiential',
]

function haystack(lead: PublicLead): string {
  return [
    lead.source_slug ?? '',
    lead.requirement_summary ?? '',
    lead.client_company ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

function intakeVerticalFromMeta(metadata?: Record<string, unknown>): EnquiryVertical {
  const raw = metadata?.intake_vertical
  if (raw === 'gifting') return 'gifting'
  if (raw === 'events') return 'events'
  return 'all'
}

export function inferLeadVertical(lead: PublicLead): EnquiryVertical {
  const fromIntake = intakeVerticalFromMeta(lead.metadata)
  if (fromIntake !== 'all') return fromIntake

  const text = haystack(lead)
  const giftScore = GIFTING_HINTS.filter((h) => text.includes(h)).length
  const eventScore = EVENTS_HINTS.filter((h) => text.includes(h)).length
  if (giftScore > eventScore && giftScore > 0) return 'gifting'
  if (eventScore > giftScore && eventScore > 0) return 'events'
  const slug = (lead.source_slug ?? '').toLowerCase()
  if (slug.includes('gift') || slug.includes('giev')) return 'gifting'
  if (slug.includes('event') || slug.includes('celebration') || slug.includes('venue')) return 'events'
  return 'all'
}

export function inferModuleFromLead(
  lead: Pick<PublicLead, 'source_slug' | 'requirement_summary' | 'client_company'>,
  preferred?: Extract<ModuleId, 'gifting' | 'events'>,
): Extract<ModuleId, 'gifting' | 'events'> {
  if (preferred) return preferred
  const vertical = inferLeadVertical(lead as PublicLead)
  if (vertical === 'gifting') return 'gifting'
  if (vertical === 'events') return 'events'
  return 'events'
}

export function matchesLeadVertical(lead: PublicLead, vertical: EnquiryVertical): boolean {
  if (vertical === 'all') return true
  const inferred = inferLeadVertical(lead)
  if (inferred === vertical) return true
  if (inferred !== 'all') return false
  return true
}

export type ListingCatalogKind = 'all' | 'services' | 'products'

export function inferListingCatalogKind(
  categoryName: string | null | undefined,
  metadata: Record<string, unknown> | undefined,
): 'service' | 'product' | 'other' {
  const name = (categoryName ?? '').toLowerCase()
  const metaKind = String(metadata?.catalog_kind ?? metadata?.kind ?? metadata?.listing_kind ?? '').toLowerCase()
  if (name.includes('product') || metaKind.includes('product')) return 'product'
  if (
    name.includes('service') ||
    metaKind.includes('service') ||
    name.includes('venue') ||
    name.includes('experience') ||
    name.includes('package')
  ) {
    return 'service'
  }
  return 'other'
}

export function matchesListingCatalogFilter(
  kind: 'service' | 'product' | 'other',
  filter: ListingCatalogKind,
): boolean {
  if (filter === 'all') return true
  if (filter === 'services') return kind === 'service' || kind === 'other'
  if (filter === 'products') return kind === 'product' || kind === 'other'
  return true
}

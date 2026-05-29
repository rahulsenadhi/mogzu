/** How the enquiry reached Mogzu (staff-logged or inferred from source_slug). */
export type LeadIntakeChannel =
  | 'inbound_phone'
  | 'whatsapp'
  | 'inbound_email'
  | 'referral'
  | 'partner_intro'
  | 'walk_in'
  | 'event_meetup'
  | 'linkedin_social'
  | 'website_form'
  | 'other'

export type LeadIntakeVertical = 'gifting' | 'events' | 'unspecified'

export const LEAD_INTAKE_CHANNELS: {
  id: LeadIntakeChannel
  label: string
  sourceSlug: string
  hint: string
}[] = [
  {
    id: 'inbound_phone',
    label: 'Phone call',
    sourceSlug: 'staff_inbound_phone',
    hint: 'Inbound or outbound sales / AM call',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    sourceSlug: 'staff_whatsapp',
    hint: 'DM or business WhatsApp thread',
  },
  {
    id: 'inbound_email',
    label: 'Email',
    sourceSlug: 'staff_inbound_email',
    hint: 'Direct inbox enquiry (not web form)',
  },
  {
    id: 'referral',
    label: 'Referral',
    sourceSlug: 'staff_referral',
    hint: 'Client, colleague, or industry reference',
  },
  {
    id: 'partner_intro',
    label: 'Partner intro',
    sourceSlug: 'staff_partner_intro',
    hint: 'Partner agency or vendor introduction',
  },
  {
    id: 'walk_in',
    label: 'Walk-in / office',
    sourceSlug: 'staff_walk_in',
    hint: 'In-person at Mogzu or client office',
  },
  {
    id: 'event_meetup',
    label: 'Event / meetup',
    sourceSlug: 'staff_event_meetup',
    hint: 'Trade show, networking, hosted event',
  },
  {
    id: 'linkedin_social',
    label: 'LinkedIn / social',
    sourceSlug: 'staff_linkedin_social',
    hint: 'Social DM or comment thread',
  },
  {
    id: 'website_form',
    label: 'Website (manual log)',
    sourceSlug: 'staff_website_log',
    hint: 'Form received offline or duplicate log',
  },
  {
    id: 'other',
    label: 'Other',
    sourceSlug: 'staff_other',
    hint: 'Any channel not listed above',
  },
]

export const REFERRER_RELATIONSHIPS = [
  { value: 'existing_client', label: 'Existing client' },
  { value: 'colleague', label: 'Colleague / HR contact' },
  { value: 'partner', label: 'Partner / agency' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'personal', label: 'Personal network' },
  { value: 'other', label: 'Other' },
] as const

export type LeadSourceFilter = 'all' | LeadIntakeChannel | 'web'

export const LEAD_SOURCE_FILTERS: { id: LeadSourceFilter; label: string }[] = [
  { id: 'all', label: 'All sources' },
  { id: 'inbound_phone', label: 'Phone' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'referral', label: 'Referral' },
  { id: 'partner_intro', label: 'Partner' },
  { id: 'web', label: 'Website' },
  { id: 'other', label: 'Other' },
]

const CHANNEL_BY_SLUG = new Map(
  LEAD_INTAKE_CHANNELS.map((c) => [c.sourceSlug, c.id]),
)

const WEB_SOURCE_PREFIXES = ['mogzu_direct', 'partner_listing', 'explore', 'public_page', 'giev', 'celebration']

export function channelFromSourceSlug(sourceSlug: string | null): LeadIntakeChannel | 'web' | null {
  if (!sourceSlug) return null
  const staff = CHANNEL_BY_SLUG.get(sourceSlug)
  if (staff) return staff
  const lower = sourceSlug.toLowerCase()
  if (WEB_SOURCE_PREFIXES.some((p) => lower.includes(p)) || lower.includes('listing')) return 'web'
  if (lower.includes('phone')) return 'inbound_phone'
  if (lower.includes('referral')) return 'referral'
  if (lower.includes('partner')) return 'partner_intro'
  if (lower.includes('whatsapp')) return 'whatsapp'
  return null
}

export function channelFromMetadata(metadata: Record<string, unknown> | undefined): LeadIntakeChannel | null {
  const raw = metadata?.intake_channel
  if (typeof raw !== 'string') return null
  const hit = LEAD_INTAKE_CHANNELS.find((c) => c.id === raw)
  return hit?.id ?? null
}

export function resolveLeadChannel(
  sourceSlug: string | null,
  metadata?: Record<string, unknown>,
): LeadIntakeChannel | 'web' | null {
  return channelFromMetadata(metadata) ?? channelFromSourceSlug(sourceSlug)
}

export function formatLeadSourceLabel(
  sourceSlug: string | null,
  metadata?: Record<string, unknown>,
): string {
  const channel = resolveLeadChannel(sourceSlug, metadata)
  if (channel === 'web') return 'Website'
  if (channel) {
    const row = LEAD_INTAKE_CHANNELS.find((c) => c.id === channel)
    if (row) return row.label
  }
  if (sourceSlug) return sourceSlug.replaceAll('_', ' ')
  return 'Unknown source'
}

export function formatReferrerLine(metadata?: Record<string, unknown>): string | null {
  const name = typeof metadata?.referrer_name === 'string' ? metadata.referrer_name.trim() : ''
  const company =
    typeof metadata?.referrer_company === 'string' ? metadata.referrer_company.trim() : ''
  if (!name && !company) return null
  if (name && company) return `Ref: ${name} · ${company}`
  return `Ref: ${name || company}`
}

export function intakeVerticalFromMetadata(
  metadata?: Record<string, unknown>,
): LeadIntakeVertical | null {
  const raw = metadata?.intake_vertical
  if (raw === 'gifting' || raw === 'events' || raw === 'unspecified') return raw
  return null
}

export function matchesLeadSourceFilter(
  sourceSlug: string | null,
  metadata: Record<string, unknown> | undefined,
  filter: LeadSourceFilter,
): boolean {
  if (filter === 'all') return true
  const channel = resolveLeadChannel(sourceSlug, metadata)
  if (filter === 'web') return channel === 'web'
  return channel === filter
}

export type StaffLeadIntakePayload = {
  channel: LeadIntakeChannel
  intake_vertical: LeadIntakeVertical
  client_name: string
  client_company?: string | null
  client_email?: string | null
  client_phone?: string | null
  requirement_summary: string
  budget_band?: import('@/lib/publicLeads').BudgetBand | null
  timeline?: import('@/lib/publicLeads').Timeline | null
  referrer_name?: string | null
  referrer_company?: string | null
  referrer_relationship?: string | null
  internal_notes?: string | null
  callback_requested?: boolean
  logged_by_user_id?: string | null
  logged_by_display_name?: string | null
}

export function buildStaffLeadSubmission(payload: StaffLeadIntakePayload): {
  submission: import('@/lib/publicLeads').LeadSubmission
  error: string | null
} {
  const channelRow = LEAD_INTAKE_CHANNELS.find((c) => c.id === payload.channel)
  if (!channelRow) return { submission: {} as never, error: 'Invalid channel.' }

  const name = payload.client_name.trim()
  const phone = payload.client_phone?.trim() ?? ''
  const emailInput = payload.client_email?.trim() ?? ''

  if (!name) return { submission: {} as never, error: 'Client name is required.' }
  if (!payload.requirement_summary.trim()) {
    return { submission: {} as never, error: 'Requirement / call notes are required.' }
  }

  let email = emailInput.toLowerCase()
  if (!email) {
    if (!phone) {
      return {
        submission: {} as never,
        error: 'Add a phone number or email so we can reach this lead.',
      }
    }
    const digits = phone.replace(/\D/g, '')
    email = `lead+${digits || Date.now()}@intake.mogzu.local`
  }

  const needsReferrer =
    payload.channel === 'referral' || payload.channel === 'partner_intro'
  if (needsReferrer && !payload.referrer_name?.trim() && !payload.referrer_company?.trim()) {
    return {
      submission: {} as never,
      error: 'Referrer or partner name is required for this source.',
    }
  }

  const metadata: Record<string, unknown> = {
    intake_channel: payload.channel,
    intake_vertical: payload.intake_vertical,
    staff_logged: true,
    logged_at: new Date().toISOString(),
  }
  if (payload.logged_by_user_id) metadata.logged_by_user_id = payload.logged_by_user_id
  if (payload.logged_by_display_name) metadata.logged_by_name = payload.logged_by_display_name
  if (payload.referrer_name?.trim()) metadata.referrer_name = payload.referrer_name.trim()
  if (payload.referrer_company?.trim()) metadata.referrer_company = payload.referrer_company.trim()
  if (payload.referrer_relationship) metadata.referrer_relationship = payload.referrer_relationship
  if (payload.internal_notes?.trim()) metadata.internal_notes = payload.internal_notes.trim()
  if (payload.callback_requested) metadata.callback_requested = true

  const verticalNote =
    payload.intake_vertical === 'gifting'
      ? '[Vertical: Gifting]'
      : payload.intake_vertical === 'events'
        ? '[Vertical: Events]'
        : ''

  const summary = [verticalNote, payload.requirement_summary.trim()].filter(Boolean).join('\n')

  return {
    submission: {
      source_slug: channelRow.sourceSlug,
      client_name: name,
      client_company: payload.client_company?.trim() || null,
      client_email: email,
      client_phone: phone || null,
      requirement_summary: summary,
      budget_band: payload.budget_band ?? null,
      timeline: payload.timeline ?? null,
      honeypot: '',
      metadata,
    },
    error: null,
  }
}

import type { LucideIcon } from 'lucide-react'
import {
  CalendarCheck,
  Gift,
  Layers,
  Mic2,
  Package,
  Users,
} from 'lucide-react'
import {
  MANAGED_SERVICES_COPY,
  SERVICE_CATEGORY_LABELS,
  type ManagedServiceCopy,
} from '@/app/lib/marketingContent'
import { MARKETING_COLORS } from '@/app/components/marketing/marketingStyles'

export type ServiceCategoryId = ManagedServiceCopy['category']

export type OfflineService = ManagedServiceCopy & {
  accent: string
  icon: LucideIcon
}

const ACCENT_BY_MODULE: Record<ManagedServiceCopy['module'], string> = {
  GiEv: MARKETING_COLORS.pink,
  'D Space': MARKETING_COLORS.mint,
  'Hey Genie': MARKETING_COLORS.purple,
  'All modules': MARKETING_COLORS.orange,
}

const ICON_BY_ID: Record<string, LucideIcon> = {
  'end-to-end-event': CalendarCheck,
  'event-rentals': Package,
  'corporate-gifting': Gift,
  'artist-management': Users,
  karaoke: Mic2,
  'multiple-services': Layers,
}

export const OFFLINE_SERVICES: OfflineService[] = MANAGED_SERVICES_COPY.services.map((service) => ({
  ...service,
  accent: ACCENT_BY_MODULE[service.module],
  icon: ICON_BY_ID[service.id] ?? Layers,
}))

export const SERVICE_CATEGORIES = (
  Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategoryId, string][]
).map(([id, label]) => ({ id, label }))

export const ENQUIRY_PROCESS_STEPS = MANAGED_SERVICES_COPY.process.steps

export const TRUST_SIGNALS = MANAGED_SERVICES_COPY.trustSignals

export const SERVICE_ENQUIRY_OPTIONS = [
  ...OFFLINE_SERVICES.map((s) => ({ value: s.id, label: s.title })),
  { value: 'other', label: 'Other / not sure yet' },
] as const

export function serviceLabelForId(id: string): string {
  return SERVICE_ENQUIRY_OPTIONS.find((o) => o.value === id)?.label ?? id
}

export function servicesForCategory(categoryId: ServiceCategoryId): OfflineService[] {
  return OFFLINE_SERVICES.filter((s) => s.category === categoryId)
}

export const DEFAULT_ENQUIRY_SERVICE_ID = 'end-to-end-event'

export function featuredServices(): OfflineService[] {
  return OFFLINE_SERVICES.filter((s) => s.featured)
}

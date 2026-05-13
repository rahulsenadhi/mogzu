import type { LucideIcon } from 'lucide-react'
import {
  Car,
  Cpu,
  FileBadge2,
  Gamepad2,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Megaphone,
  Mic2,
  Monitor,
  Palette,
  PartyPopper,
  Paintbrush,
  Shield,
  Utensils,
} from 'lucide-react'

export type EventActivityCategoryId =
  | 'workshops_trainings'
  | 'arts_creativity'
  | 'virtual_games'
  | 'wellness_programs'
  | 'entertainment'
  | 'themed_parties'
  | 'csr'

export type EventActivityCategoryIconConfig = {
  id: EventActivityCategoryId
  label: string
  icon: LucideIcon
  color: string
}

export type EventServiceCategoryIconConfig = {
  label: string
  icon: LucideIcon
  color: string
}

export const EVENT_ACTIVITY_CATEGORY_ICONS: Record<EventActivityCategoryId, EventActivityCategoryIconConfig> = {
  workshops_trainings: {
    id: 'workshops_trainings',
    label: 'Workshops &\nTrainings',
    icon: GraduationCap,
    color: '#2563eb',
  },
  arts_creativity: {
    id: 'arts_creativity',
    label: 'Arts &\nCreativity',
    icon: Palette,
    color: '#2563eb',
  },
  virtual_games: {
    id: 'virtual_games',
    label: 'Virtual\ngames',
    icon: Gamepad2,
    color: '#2563eb',
  },
  wellness_programs: {
    id: 'wellness_programs',
    label: 'Wellness\nPrograms',
    icon: HeartPulse,
    color: '#2563eb',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Mic2,
    color: '#2563eb',
  },
  themed_parties: {
    id: 'themed_parties',
    label: 'Themed\nparties',
    icon: PartyPopper,
    color: '#2563eb',
  },
  csr: {
    id: 'csr',
    label: 'Corporate social\nresponsibility (CSR)',
    icon: HandHeart,
    color: '#2563eb',
  },
}

export const EVENT_SERVICE_CATEGORY_ICONS: Record<string, EventServiceCategoryIconConfig> = {
  Catering: { label: 'Catering', icon: Utensils, color: '#0f766e' },
  'Audio Visuals': { label: 'Audio Visuals', icon: Monitor, color: '#0369a1' },
  'AV & Tech': { label: 'AV & Tech', icon: Monitor, color: '#0369a1' },
  'Design & Decor': { label: 'Design & Decor', icon: Paintbrush, color: '#9333ea' },
  Decor: { label: 'Decor', icon: Paintbrush, color: '#9333ea' },
  Security: { label: 'Security', icon: Shield, color: '#dc2626' },
  Transportation: { label: 'Transportation', icon: Car, color: '#b45309' },
  Technology: { label: 'Technology', icon: Cpu, color: '#2563eb' },
  Staffing: { label: 'Staffing', icon: Shield, color: '#475569' },
  Photography: { label: 'Photography', icon: Paintbrush, color: '#7c3aed' },
  Entertainment: { label: 'Entertainment', icon: Mic2, color: '#2563eb' },
  Activities: { label: 'Activities', icon: PartyPopper, color: '#0f766e' },
  'License/Permits': { label: 'License/Permits', icon: FileBadge2, color: '#475569' },
}

export const getEventActivityCategoryConfigs = (): EventActivityCategoryIconConfig[] => [
  EVENT_ACTIVITY_CATEGORY_ICONS.workshops_trainings,
  EVENT_ACTIVITY_CATEGORY_ICONS.arts_creativity,
  EVENT_ACTIVITY_CATEGORY_ICONS.virtual_games,
  EVENT_ACTIVITY_CATEGORY_ICONS.wellness_programs,
  EVENT_ACTIVITY_CATEGORY_ICONS.entertainment,
  EVENT_ACTIVITY_CATEGORY_ICONS.themed_parties,
  EVENT_ACTIVITY_CATEGORY_ICONS.csr,
]

export const getEventServiceCategoryIconConfig = (category: string): EventServiceCategoryIconConfig => {
  return EVENT_SERVICE_CATEGORY_ICONS[category] ?? {
    label: category,
    icon: FileBadge2,
    color: '#475569',
  }
}

export const getEventIconByCategoryText = (category: string): LucideIcon => {
  const c = category.toLowerCase()
  if (c.includes('workshop') || c.includes('training')) return GraduationCap
  if (c.includes('art') || c.includes('creativity')) return Palette
  if (c.includes('virtual') || c.includes('game')) return Gamepad2
  if (c.includes('wellness')) return HeartPulse
  if (c.includes('entertainment') || c.includes('music')) return Mic2
  if (c.includes('party')) return PartyPopper
  if (c.includes('csr')) return HandHeart
  if (c.includes('catering')) return Utensils
  if (c.includes('audio') || c.includes('visual') || c.includes('av')) return Monitor
  if (c.includes('design') || c.includes('decor')) return Paintbrush
  if (c.includes('security')) return Shield
  if (c.includes('transport')) return Car
  if (c.includes('technology') || c.includes('tech')) return Cpu
  if (c.includes('license') || c.includes('permit')) return FileBadge2
  if (c.includes('staff')) return Shield
  if (c.includes('activities')) return Megaphone
  return GraduationCap
}

import type { LucideIcon } from 'lucide-react'
import {
  Brain,
  Camera,
  Car,
  Cpu,
  Crown,
  Disc3,
  DoorOpen,
  Droplet,
  Dumbbell,
  FileBadge2,
  Film,
  Flower2,
  Gamepad2,
  Globe,
  GraduationCap,
  HandHeart,
  HeartPulse,
  LayoutGrid,
  Megaphone,
  Mic2,
  Monitor,
  Music,
  Paintbrush,
  Palette,
  PartyPopper,
  Scissors,
  Shield,
  Shirt,
  Smile,
  Sparkles,
  TreePine,
  Users,
  Utensils,
  Video,
  Wand2,
  Wine,
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

export type EventActivitySubcategoryConfig = {
  id: string
  name: string
  icon: LucideIcon
  bgColor: string
  textColor: string
  activeBg: string
  activeText: string
}

export const EVENT_ACTIVITY_SUBCATEGORIES: Record<EventActivityCategoryId, EventActivitySubcategoryConfig[]> = {
  workshops_trainings: [
    { id: 'virtual', name: 'Virtual Workshop', icon: Video, bgColor: '#eff6ff', textColor: '#3b82f6', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'inperson', name: 'In-Person', icon: Users, bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
    { id: 'leadership', name: 'Leadership', icon: Crown, bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
    { id: 'teambuilding', name: 'Team Building', icon: Users, bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
  ],
  arts_creativity: [
    { id: 'painting', name: 'Painting', icon: Paintbrush, bgColor: '#fff7ed', textColor: '#ea580c', activeBg: '#ea580c', activeText: '#fff' },
    { id: 'photography', name: 'Photography', icon: Camera, bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'crafts', name: 'Crafts', icon: Scissors, bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
    { id: 'music', name: 'Music', icon: Music, bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
  ],
  virtual_games: [
    { id: 'quiz', name: 'Quiz Night', icon: Brain, bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
    { id: 'escape', name: 'Escape Room', icon: DoorOpen, bgColor: '#fff1f2', textColor: '#e11d48', activeBg: '#e11d48', activeText: '#fff' },
    { id: 'trivia', name: 'Trivia', icon: Sparkles, bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'board', name: 'Board Games', icon: LayoutGrid, bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
  ],
  wellness_programs: [
    { id: 'yoga', name: 'Yoga', icon: Flower2, bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
    { id: 'meditation', name: 'Meditation', icon: Sparkles, bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'spa', name: 'Spa & Wellness', icon: HeartPulse, bgColor: '#fff7ed', textColor: '#ea580c', activeBg: '#ea580c', activeText: '#fff' },
  ],
  entertainment: [
    { id: 'comedy', name: 'Stand-Up Comedy', icon: Smile, bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
    { id: 'livemusic', name: 'Live Music', icon: Music, bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'dj', name: 'DJ Night', icon: Disc3, bgColor: '#fff1f2', textColor: '#e11d48', activeBg: '#e11d48', activeText: '#fff' },
    { id: 'magic', name: 'Magician', icon: Wand2, bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
  ],
  themed_parties: [
    { id: 'bollywood', name: 'Bollywood', icon: Film, bgColor: '#fff7ed', textColor: '#ea580c', activeBg: '#ea580c', activeText: '#fff' },
    { id: 'costume', name: 'Costume Party', icon: Shirt, bgColor: '#fdf4ff', textColor: '#9333ea', activeBg: '#9333ea', activeText: '#fff' },
    { id: 'gala', name: 'Gala Dinner', icon: Wine, bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
    { id: 'cultural', name: 'Cultural Night', icon: Globe, bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
  ],
  csr: [
    { id: 'plantation', name: 'Tree Plantation', icon: TreePine, bgColor: '#f0fdf4', textColor: '#16a34a', activeBg: '#16a34a', activeText: '#fff' },
    { id: 'blood', name: 'Blood Donation', icon: Droplet, bgColor: '#fff1f2', textColor: '#e11d48', activeBg: '#e11d48', activeText: '#fff' },
    { id: 'skilltraining', name: 'Skill Training', icon: GraduationCap, bgColor: '#eff6ff', textColor: '#2563eb', activeBg: '#2563eb', activeText: '#fff' },
    { id: 'community', name: 'Community Service', icon: HandHeart, bgColor: '#fefce8', textColor: '#ca8a04', activeBg: '#ca8a04', activeText: '#fff' },
  ],
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
    color: '#9333ea',
  },
  virtual_games: {
    id: 'virtual_games',
    label: 'Virtual\ngames',
    icon: Gamepad2,
    color: '#6366f1',
  },
  wellness_programs: {
    id: 'wellness_programs',
    label: 'Wellness\nPrograms',
    icon: HeartPulse,
    color: '#15803d',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Mic2,
    color: '#ea580c',
  },
  themed_parties: {
    id: 'themed_parties',
    label: 'Themed\nparties',
    icon: PartyPopper,
    color: '#db2777',
  },
  csr: {
    id: 'csr',
    label: 'Corporate social\nresponsibility (CSR)',
    icon: HandHeart,
    color: '#0f766e',
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

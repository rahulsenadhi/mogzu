import { loadMogzuDirectCatalogueForAdmin } from '@/utils/mogzuDirectCatalogueAdmin';
import { loadPartnerListings } from '@/app/lib/mogzuDomain';

const KEY = 'mogzu_admin_listing_categories_v1';

export type AdminCategoryKind = 'activities' | 'services';

export interface AdminCategoryRow {
  id: string;
  name: string;
  kind: AdminCategoryKind;
  /** Lucide icon component name */
  iconKey: string;
  description: string;
  active: boolean;
  display_order: number;
}

const DEFAULT_ACTIVITIES: Omit<AdminCategoryRow, 'display_order'>[] = [
  { id: 'ac-wt', name: 'Workshops & Trainings', kind: 'activities', iconKey: 'GraduationCap', description: '', active: true },
  { id: 'ac-art', name: 'Arts & Creativity', kind: 'activities', iconKey: 'Palette', description: '', active: true },
  { id: 'ac-vg', name: 'Virtual Games', kind: 'activities', iconKey: 'Gamepad2', description: '', active: true },
  { id: 'ac-wp', name: 'Wellness Programs', kind: 'activities', iconKey: 'HeartPulse', description: '', active: true },
  { id: 'ac-ent', name: 'Entertainment', kind: 'activities', iconKey: 'Mic2', description: '', active: true },
  { id: 'ac-tp', name: 'Themed Parties', kind: 'activities', iconKey: 'PartyPopper', description: '', active: true },
  { id: 'ac-csr', name: 'CSR', kind: 'activities', iconKey: 'HandHeart', description: '', active: true },
];

const DEFAULT_SERVICES: Omit<AdminCategoryRow, 'display_order'>[] = [
  { id: 'sv-cat', name: 'Catering', kind: 'services', iconKey: 'Utensils', description: '', active: true },
  { id: 'sv-av', name: 'Audio Visuals', kind: 'services', iconKey: 'Monitor', description: '', active: true },
  { id: 'sv-dd', name: 'Design & Decor', kind: 'services', iconKey: 'Paintbrush', description: '', active: true },
  { id: 'sv-sec', name: 'Security', kind: 'services', iconKey: 'Shield', description: '', active: true },
  { id: 'sv-tr', name: 'Transportation', kind: 'services', iconKey: 'Car', description: '', active: true },
  { id: 'sv-tech', name: 'Technology', kind: 'services', iconKey: 'Cpu', description: '', active: true },
  { id: 'sv-lp', name: 'License/Permits', kind: 'services', iconKey: 'FileBadge2', description: '', active: true },
];

function seed(): AdminCategoryRow[] {
  const a = DEFAULT_ACTIVITIES.map((r, i) => ({ ...r, display_order: i }));
  const s = DEFAULT_SERVICES.map((r, i) => ({ ...r, display_order: i }));
  return [...a, ...s];
}

export function loadAdminCategories(): AdminCategoryRow[] {
  if (typeof localStorage === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p) || p.length === 0) return seed();
    return p as AdminCategoryRow[];
  } catch {
    return seed();
  }
}

export function saveAdminCategories(rows: AdminCategoryRow[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

/** Count listings whose category string matches (case-insensitive contains or exact). */
export function countListingsForCategoryName(name: string): number {
  const n = name.trim().toLowerCase();
  let c = 0;
  for (const r of loadPartnerListings()) {
    if (r.category.toLowerCase() === n || r.category.toLowerCase().includes(n) || n.includes(r.category.toLowerCase())) {
      c += 1;
    }
  }
  for (const r of loadMogzuDirectCatalogueForAdmin()) {
    if (r.category.toLowerCase() === n || r.category.toLowerCase().includes(n) || n.includes(r.category.toLowerCase())) {
      c += 1;
    }
  }
  return c;
}

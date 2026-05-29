/**
 * Admin portal layout tokens — aligned with corporate gifting shop
 * (`mogzuGiftingStyles.ts`, `mogzuGlassStyles.ts`). Use for admin, sales, and lead-ops surfaces.
 */

import {
  MOGZU_MODULE_CONTAINER,
  MOGZU_PAGE_TITLE,
  MOGZU_PAGE_SUBTITLE,
  MOGZU_CTA_GRADIENT,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { MOGZU_GLASS_HERO, MOGZU_GLASS_CARD, MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'

export { MOGZU_MODULE_CONTAINER, MOGZU_PAGE_TITLE, MOGZU_PAGE_SUBTITLE, moduleNavChipClass }

export const ADMIN_MODULE = {
  /** Same width/padding as Gifting Shop (`max-w-[1280px]`) */
  page: `${MOGZU_MODULE_CONTAINER} space-y-5`,
  hero: MOGZU_GLASS_HERO,
  card: MOGZU_GLASS_CARD,
  panel: MOGZU_GLASS_PANEL,
  title: MOGZU_PAGE_TITLE,
  subtitle: MOGZU_PAGE_SUBTITLE,
  eyebrow:
    'inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#1E4DB7]',
  sectionTitle: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  primaryBtn: `inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 ${MOGZU_CTA_GRADIENT}`,
  secondaryBtn:
    'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 active:scale-[0.98]',
  ghostBtn:
    'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60',
  input:
    'h-11 w-full rounded-xl border border-white/70 bg-white/80 px-3.5 text-sm text-slate-800 shadow-sm outline-none backdrop-blur-sm transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#93c5fd]/40',
  tableWrap: 'overflow-hidden rounded-2xl border border-white/60 bg-white/65 backdrop-blur-md shadow-[0_10px_30px_rgba(37,99,235,0.12)]',
  kanbanColumn:
    'flex flex-col rounded-2xl border border-white/60 bg-white/55 p-3 backdrop-blur-xl shadow-[0_10px_30px_rgba(37,99,235,0.12)]',
  kanbanCard:
    'cursor-pointer rounded-xl border border-white/70 bg-white/80 p-3 text-xs shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60',
  drawerOverlay: 'fixed inset-0 z-50 flex justify-end bg-slate-900/50 lg:hidden',
  drawerPanel:
    'flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl',
  drawerPanelInline:
    'sticky top-4 flex max-h-[calc(100dvh-7rem)] min-h-[480px] flex-col',
  navChip: moduleNavChipClass,
} as const

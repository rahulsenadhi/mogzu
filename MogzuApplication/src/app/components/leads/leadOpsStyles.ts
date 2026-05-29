/** Lead operations UI — extends admin module tokens (gifting shop parity). */

import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'

export const LEAD_OPS = {
  page: ADMIN_MODULE.page,
  /** Tab body inside Lead operations hub — no duplicate max-width stack */
  hubPanel: 'min-h-0 space-y-5',
  workspaceGrid:
    'grid min-h-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)] xl:grid-cols-[minmax(0,1fr)_420px]',
  listColumn: 'min-h-0 space-y-3',
  surface: ADMIN_MODULE.card,
  surfaceElevated: ADMIN_MODULE.hero,
  surfaceMuted:
    'rounded-xl border border-white/60 bg-white/55 p-4 backdrop-blur-xl shadow-[0_10px_24px_rgba(37,99,235,0.10)]',
  sectionTitle: ADMIN_MODULE.sectionTitle,
  primaryBtn: ADMIN_MODULE.primaryBtn,
  secondaryBtn: ADMIN_MODULE.secondaryBtn,
  ghostBtn: ADMIN_MODULE.ghostBtn,
  input: ADMIN_MODULE.input,
  drawerOverlay: ADMIN_MODULE.drawerOverlay,
  drawerPanel: ADMIN_MODULE.drawerPanel,
  drawerPanelInline: `${ADMIN_MODULE.card} ${ADMIN_MODULE.drawerPanelInline}`,
  modalOverlay:
    'fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4',
  modalPanel:
    'flex max-h-[min(92dvh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/60 bg-white shadow-2xl sm:rounded-2xl',
  moduleAccentBtn:
    'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
  moduleAccentGifting:
    'border-violet-200/90 bg-violet-50/90 text-violet-900 hover:border-violet-300 hover:bg-violet-100 focus-visible:ring-violet-300',
  moduleAccentEvents:
    'border-sky-200/90 bg-sky-50/90 text-sky-900 hover:border-sky-300 hover:bg-sky-100 focus-visible:ring-sky-300',
  chip:
    'inline-flex min-h-[36px] cursor-pointer items-center rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 active:scale-[0.98]',
  tableWrap: ADMIN_MODULE.tableWrap,
} as const

/** Active filter/status chip (gifting shop nav chip pattern). */
export function leadOpsChipClass(active: boolean): string {
  return ADMIN_MODULE.navChip(active)
}

/** Gifting shop module tokens — category chips, hero, cards, filters (GiftingShopPage reference). */

export const MOGZU_MODULE_CONTAINER = 'mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12'

export const MOGZU_BREADCRUMB_PILL =
  'inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]'

export const MOGZU_BREADCRUMB_LINK =
  'text-[#7b879a] font-medium transition-colors hover:text-[#2563eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/50 rounded-sm'

export const MOGZU_BREADCRUMB_CURRENT = 'text-[#0e1e3f] font-semibold tracking-tight'

export const MOGZU_PAGE_TITLE = 'text-[22px] font-bold text-[#0e1e3f] leading-none'

export const MOGZU_PAGE_SUBTITLE = 'text-[14px] text-[#64748b] leading-[1.6]'

export const MOGZU_NAV_SCROLLER =
  'flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'

export const MOGZU_FILTER_SIDEBAR =
  'bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]'

export const MOGZU_PRODUCT_CARD =
  'bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col'

export const MOGZU_HERO_BANNER =
  'group relative overflow-hidden rounded-3xl border border-white/60 h-[200px] mb-6 bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(37,99,235,0.18)]'

export const MOGZU_CTA_GRADIENT =
  'px-4 py-2 bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-xs font-semibold rounded-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60'

export const MOGZU_CHIP_ACTIVE_GRADIENT = {
  backgroundImage:
    'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
} as const

export function moduleNavChipClass(active: boolean): string {
  return active
    ? 'h-9 inline-flex items-center gap-2 px-4 rounded-full text-[14px] font-semibold transition-all duration-200 border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f] active:scale-[0.98]'
    : 'h-9 inline-flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]'
}

export function filterStatChipClass(active: boolean, tone: 'blue' | 'rose' | 'emerald' = 'blue'): string {
  const tones = {
    blue: active ? 'border-[#2563eb] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(255,255,255,0.9))]' : 'border-white/60 bg-white/55',
    rose: active ? 'border-rose-400 bg-rose-50/90' : 'border-white/60 bg-white/55',
    emerald: active ? 'border-emerald-400 bg-emerald-50/90' : 'border-white/60 bg-white/55',
  }
  return `rounded-2xl border p-4 text-left backdrop-blur-xl shadow-[0_10px_24px_rgba(37,99,235,0.10)] transition-all hover:-translate-y-0.5 ${tones[tone]}`
}

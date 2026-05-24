/** Visible demo / legacy mock banner — gifting glass style (prod-safe). */

type MogzuLegacyDemoBannerProps = {
  title?: string
  detail?: string
  className?: string
}

export function MogzuLegacyDemoBanner({
  title = 'Demo data',
  detail = 'This screen uses sample or legacy mock data. Connect Supabase for live records.',
  className = '',
}: MogzuLegacyDemoBannerProps) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-amber-200/70 bg-white/55 px-4 py-3 backdrop-blur-xl shadow-[0_10px_24px_rgba(245,158,11,0.12)] ${className}`}
    >
      <p className="text-sm font-semibold text-amber-900">{title}</p>
      <p className="mt-0.5 text-xs text-amber-800/90">{detail}</p>
    </div>
  )
}

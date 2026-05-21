/** Shown on shell/mock screens in development only. */
export function DevMockDataBanner() {
  if (!import.meta.env.DEV) return null
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
    >
      Demo data — connect Supabase for live records.
    </div>
  )
}

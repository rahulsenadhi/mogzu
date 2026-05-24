import { MogzuLegacyDemoBanner } from '@/app/components/ui/MogzuLegacyDemoBanner'

/** Shown on shell/mock screens in development only. */
export function DevMockDataBanner() {
  if (!import.meta.env.DEV) return null
  return <MogzuLegacyDemoBanner className="mb-4" />
}

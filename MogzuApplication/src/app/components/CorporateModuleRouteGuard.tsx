import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import type { CorporateAccount } from '@/lib/database.types'
import {
  getModuleCorporateState,
  type MarketplaceModuleKey,
} from '@/app/lib/platformMarketplaceSettings'

// Map frontend module key → whether corporate account has it enabled.
// Falls back to global platform settings when no corporate account is loaded.
function isCorporateModuleEnabled(
  key: MarketplaceModuleKey,
  account: CorporateAccount | null,
): boolean {
  if (!account) {
    // Non-corporate user or account not yet loaded — use global setting
    return getModuleCorporateState(key) === 'live'
  }
  const m = account.modules_enabled
  switch (key) {
    case 'events':
      return m.events
    case 'gifting':
      return m.gifting
    case 'dSpace':
      return m.spacex_coworking || m.spacex_stay
    case 'heyGenie':
      // No DB module yet — fall back to global platform setting
      return getModuleCorporateState('heyGenie') === 'live'
  }
}

export function CorporateModuleRouteGuard({
  moduleKey,
  children,
}: {
  moduleKey: MarketplaceModuleKey
  children: ReactNode
}) {
  const { corporateAccount, isLoading } = useAuth()

  // While auth is loading, let the page render (avoid premature redirect)
  if (isLoading) return <>{children}</>

  if (!isCorporateModuleEnabled(moduleKey, corporateAccount)) {
    return <Navigate to="/activitysuite" replace />
  }

  return <>{children}</>
}

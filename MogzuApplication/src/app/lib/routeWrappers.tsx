import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { CorporateModuleRouteGuard } from '@/app/components/CorporateModuleRouteGuard'
import { CorporateRoute, VendorRoute, AdminRoute } from '@/app/components/auth/ProtectedRoute'
import { VendorVerificationGate } from '@/app/components/auth/VendorVerificationGate'
import type { MarketplaceModuleKey } from '@/app/lib/platformMarketplaceSettings'

/** Authenticated corporate user; optional module feature flag. */
export function corp(children: ReactNode, moduleKey?: MarketplaceModuleKey) {
  const inner = moduleKey ? (
    <CorporateModuleRouteGuard moduleKey={moduleKey}>{children}</CorporateModuleRouteGuard>
  ) : (
    children
  )
  return <CorporateRoute>{inner}</CorporateRoute>
}

/** Authenticated vendor; blocks dashboard until admin approval when status is pending. */
export function vend(children: ReactNode) {
  return (
    <VendorRoute>
      <VendorVerificationGate>{children}</VendorVerificationGate>
    </VendorRoute>
  )
}

/** Mogzu admin portal page (with or without AdminLayout outlet parent). */
export function adminPage(children: ReactNode) {
  return <AdminRoute>{children}</AdminRoute>
}

export function redirectTo(to: string) {
  return <Navigate to={to} replace />
}

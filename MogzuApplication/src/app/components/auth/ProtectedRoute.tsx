import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth, isCorporateRole, isVendorRole, isAdminRole } from '@/lib/auth'
import { getCorporateOnboardingPath } from '@/app/lib/corporateOnboarding'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FA8D40] border-t-transparent" />
    </div>
  )
}

interface GuardProps {
  children: ReactNode
}

export function CorporateRoute({ children }: GuardProps) {
  const { isLoading, isAuthenticated, role, profile, refreshProfile } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Session exists but profile still bootstrapping — wait, don't bounce to onboarding
  if (!profile && !role) {
    void refreshProfile()
    return <FullScreenSpinner />
  }

  if (!isCorporateRole(role)) {
    if (isVendorRole(role)) return <Navigate to="/vendor/dashboard" replace />
    if (isAdminRole(role)) return <Navigate to="/admin" replace />
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const onboardingPath = getCorporateOnboardingPath(profile)
  if (
    onboardingPath &&
    !location.pathname.startsWith('/signup/corporate') &&
    location.pathname !== '/welcome'
  ) {
    return <Navigate to={onboardingPath} replace />
  }

  return <>{children}</>
}

export function VendorRoute({ children }: GuardProps) {
  const { isLoading, isAuthenticated, role, profile, refreshProfile } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Same anti-flicker guard as AdminRoute / CorporateRoute.
  if (!profile && !role) {
    void refreshProfile()
    return <FullScreenSpinner />
  }

  if (!isVendorRole(role)) {
    if (isCorporateRole(role)) return <Navigate to="/dashboard" replace />
    if (isAdminRole(role)) return <Navigate to="/admin" replace />
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: GuardProps) {
  const { isLoading, isAuthenticated, role, profile, refreshProfile } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Session exists but profile still bootstrapping after sign-in: wait
  // instead of bouncing back to /admin/login. The !profile && !role guard
  // was ineffective because activeRole always falls back to 'l1_employee'
  // when session.user exists — so role is never null mid-fetch, causing
  // AdminRoute to see isCorporateRole(role)=true and redirect to /dashboard.
  if (!profile && isAuthenticated) {
    void refreshProfile()
    return <FullScreenSpinner />
  }

  if (!isAdminRole(role)) {
    if (isCorporateRole(role)) return <Navigate to="/dashboard" replace />
    if (isVendorRole(role)) return <Navigate to="/vendor/dashboard" replace />
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

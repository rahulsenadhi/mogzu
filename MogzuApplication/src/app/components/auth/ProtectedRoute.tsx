import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth, isCorporateRole, isVendorRole, isAdminRole } from '@/lib/auth'

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
  const { isLoading, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isCorporateRole(role)) {
    if (isVendorRole(role)) return <Navigate to="/vendor/dashboard" replace />
    if (isAdminRole(role)) return <Navigate to="/admin" replace />
    // unknown role — send to login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function VendorRoute({ children }: GuardProps) {
  const { isLoading, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isVendorRole(role)) {
    if (isCorporateRole(role)) return <Navigate to="/dashboard" replace />
    if (isAdminRole(role)) return <Navigate to="/admin" replace />
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: GuardProps) {
  const { isLoading, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdminRole(role)) {
    if (isCorporateRole(role)) return <Navigate to="/dashboard" replace />
    if (isVendorRole(role)) return <Navigate to="/vendor/dashboard" replace />
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/lib/auth'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FA8D40] border-t-transparent" />
    </div>
  )
}

export function FieldAgentRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role !== 'field_agent' && role !== 'mogzu_admin') {
    if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />
    if (role === 'partner') return <Navigate to="/partner/dashboard" replace />
    if (role === 'account_manager') return <Navigate to="/am/portfolio" replace />
    if (role === 'support' || role === 'sales_agent') return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

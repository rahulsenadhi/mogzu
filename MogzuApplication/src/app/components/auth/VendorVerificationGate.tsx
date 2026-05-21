import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { VendorStatus } from '@/lib/database.types'

const PENDING: VendorStatus[] = ['pending']

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FA8D40] border-t-transparent" />
    </div>
  )
}

export function VendorVerificationGate({ children }: { children: ReactNode }) {
  const { vendorId, isLoading } = useAuth()
  const location = useLocation()
  const [status, setStatus] = useState<VendorStatus | 'unknown'>('unknown')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!vendorId) {
        if (!cancelled) {
          setStatus('unknown')
          setChecking(false)
        }
        return
      }
      const { data, error } = await supabase
        .from('vendors')
        .select('status')
        .eq('id', vendorId)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        setStatus('unknown')
      } else {
        setStatus(data.status as VendorStatus)
      }
      setChecking(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [vendorId])

  if (isLoading || checking) return <FullScreenSpinner />

  if (!vendorId) {
    return <Navigate to="/vendor/verification-pending" state={{ from: location }} replace />
  }

  if (PENDING.includes(status as VendorStatus)) {
    return <Navigate to="/vendor/verification-pending" replace />
  }

  if (status === 'rejected') {
    return <Navigate to="/vendor/welcome" replace />
  }

  return <>{children}</>
}

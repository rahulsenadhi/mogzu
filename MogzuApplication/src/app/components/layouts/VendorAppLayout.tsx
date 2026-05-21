import { Outlet } from 'react-router'
import { VendorRoute } from '@/app/components/auth/ProtectedRoute'
import { VendorVerificationGate } from '@/app/components/auth/VendorVerificationGate'

/**
 * Layout route: authenticated vendor + approval gate for nested /vendor/* routes.
 */
export default function VendorAppLayout() {
  return (
    <VendorRoute>
      <VendorVerificationGate>
        <Outlet />
      </VendorVerificationGate>
    </VendorRoute>
  )
}

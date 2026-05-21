import { Outlet } from 'react-router'
import { CorporateRoute } from '@/app/components/auth/ProtectedRoute'

/**
 * Layout route: enforces corporate auth for all nested child routes.
 * Child pages keep their own SharedSidebar/SharedHeader shells.
 */
export default function CorporateAppLayout() {
  return (
    <CorporateRoute>
      <Outlet />
    </CorporateRoute>
  )
}

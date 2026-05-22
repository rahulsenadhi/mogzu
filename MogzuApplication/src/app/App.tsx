import { RouterProvider } from 'react-router'
import { router } from '@/app/routes.tsx'
import { Toaster } from '@/app/components/ui/sonner'
import { DemoRoleProvider } from '@/app/lib/demoRole'
import { BookingDraftProvider } from '@/app/lib/bookingDraft'
import { AuthProvider } from '@/lib/auth'
import { PwaInstallPrompt } from '@/app/components/PwaInstallPrompt'
import { PushOptInBanner } from '@/app/components/PushOptInBanner'

export default function App() {
  return (
    <AuthProvider>
      <DemoRoleProvider>
        <BookingDraftProvider>
          <RouterProvider router={router} />
          <Toaster richColors closeButton position="bottom-left" visibleToasts={3} />
          <PwaInstallPrompt />
          <PushOptInBanner />
        </BookingDraftProvider>
      </DemoRoleProvider>
    </AuthProvider>
  )
}
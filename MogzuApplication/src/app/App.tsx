import { RouterProvider } from 'react-router'
import { router } from '@/app/routes.tsx'
import { Toaster } from '@/app/components/ui/sonner'
import { DemoRoleProvider } from '@/app/lib/demoRole'
import { BookingDraftProvider } from '@/app/lib/bookingDraft'

export default function App() {
  return (
    <DemoRoleProvider>
      <BookingDraftProvider>
        <RouterProvider router={router} />
        <Toaster richColors closeButton position="bottom-left" visibleToasts={3} />
      </BookingDraftProvider>
    </DemoRoleProvider>
  )
}
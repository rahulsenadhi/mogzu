import { AdminModuleBookingsPanel } from '@/app/components/admin/AdminModuleBookingsPanel'

export default function AdminEventsBookings() {
  return (
    <AdminModuleBookingsPanel
      modules={['events']}
      title="Events bookings"
      subtitle="Review and manage corporate event bookings across all vendors."
    />
  )
}

import { AdminModuleBookingsPanel } from '@/app/components/admin/AdminModuleBookingsPanel'

export default function AdminDspaceBookings() {
  return (
    <AdminModuleBookingsPanel
      modules={['spacex_coworking', 'spacex_stay']}
      title="DSpace bookings"
      subtitle="Coworking and stay reservations across the platform."
    />
  )
}

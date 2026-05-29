import { AdminModuleListingsQueuePage } from '@/app/components/admin/AdminModuleListingsQueuePage'

export default function AdminEventsPage() {
  return (
    <AdminModuleListingsQueuePage
      modules={['events']}
      title="Events listing approval"
      subtitle="Review vendor event and activity listings before they appear in the corporate catalogue."
      detailPath={(id) => `/admin/events/services/${id}`}
    />
  )
}

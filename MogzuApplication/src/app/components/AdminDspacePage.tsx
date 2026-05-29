import { AdminModuleListingsQueuePage } from '@/app/components/admin/AdminModuleListingsQueuePage'

export default function AdminDspacePage() {
  return (
    <AdminModuleListingsQueuePage
      modules={['spacex_coworking', 'spacex_stay']}
      title="DSpace listing approval"
      subtitle="Review coworking and stay listings before they go live on DSpace."
      detailPath={(id) => `/admin/dspace/spaces/${id}`}
    />
  )
}

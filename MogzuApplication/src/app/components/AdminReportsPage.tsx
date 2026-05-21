import { Clock } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'

export default function AdminReportsPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
      <AdminPageTitleRow title="Reports" />
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
        <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <h2 className="text-base font-semibold text-slate-900">Reports — in development</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admin reporting dashboards (revenue, vendor performance, corporate spend, GMV) will appear here in a future release.
        </p>
      </div>
    </div>
  )
}

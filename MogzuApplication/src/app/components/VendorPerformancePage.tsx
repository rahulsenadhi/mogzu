import { BarChart3 } from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'

export default function VendorPerformancePage() {
  return (
    <VendorAppShell activeNav="dashboard" routeSource="vendor-performance">
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">Performance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Vendor performance analytics — listing-level KPIs, inquiry-to-booking funnel, conversion trends.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h2 className="text-base font-semibold text-slate-900">Performance dashboard — in development</h2>
            <p className="mt-1 text-sm text-slate-500">
              Detailed analytics will appear here in a future release.
            </p>
          </div>
        </div>
      </main>
    </VendorAppShell>
  )
}

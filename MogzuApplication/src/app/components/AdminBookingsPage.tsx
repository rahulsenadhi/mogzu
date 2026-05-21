import { useState } from 'react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import AdminDspaceBookings from './AdminDspaceBookings'
import AdminEventsBookings from './AdminEventsBookings'

type Tab = 'events' | 'dspace'

export default function AdminBookingsPage() {
  const [tab, setTab] = useState<Tab>('events')

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
      <AdminPageTitleRow title="Bookings" />

      <div className="mt-4 mb-4 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('events')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'events'
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Events Bookings
        </button>
        <button
          type="button"
          onClick={() => setTab('dspace')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'dspace'
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          DSpace Bookings
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {tab === 'events' ? <AdminEventsBookings /> : <AdminDspaceBookings />}
      </div>
    </div>
  )
}

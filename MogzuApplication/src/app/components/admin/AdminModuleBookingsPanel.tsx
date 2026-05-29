import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import {
  applyAdminBookingStatus,
  loadAdminModuleBookings,
  type AdminBookingDisplay,
} from '@/app/lib/adminModuleBookings'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import type { BookingStatus, ModuleId } from '@/lib/database.types'

const MODULE_LABEL: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'Coworking',
  spacex_stay: 'Stay',
}

const STATUS_TABS: Array<'all' | BookingStatus> = [
  'all',
  'pending_approval',
  'pending_vendor',
  'confirmed',
  'completed',
  'cancelled',
]

type Props = {
  modules: ModuleId[]
  title: string
  subtitle?: string
}

export function AdminModuleBookingsPanel({ modules, title, subtitle }: Props) {
  const [rows, setRows] = useState<AdminBookingDisplay[]>([])
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState<'all' | BookingStatus>('all')
  const [selected, setSelected] = useState<AdminBookingDisplay | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await loadAdminModuleBookings(modules)
    setRows(result.rows)
    setUsingDemo(result.usingDemo)
    setLoading(false)
  }, [modules])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => (statusTab === 'all' ? rows : rows.filter((r) => r.status === statusTab)),
    [rows, statusTab],
  )

  const handleStatus = async (status: BookingStatus) => {
    if (!selected || selected.isDemo || usingDemo) {
      setNotice('Connect live bookings in Supabase to update status.')
      return
    }
    setBusy(true)
    const { error } = await applyAdminBookingStatus(selected.bookingId, status)
    setBusy(false)
    if (error) {
      setNotice(error)
      return
    }
    setNotice(`Booking marked ${status.replace('_', ' ')}.`)
    setSelected(null)
    await load()
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-[#0e1e3f]">{title}</h2>
      {subtitle && <p className="mb-4 text-sm text-slate-500">{subtitle}</p>}

      {usingDemo && import.meta.env.DEV && <DevMockDataBanner />}

      {notice && (
        <p
          role="status"
          className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
        >
          {notice}
        </p>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto whitespace-nowrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusTab(tab)}
            className={`h-9 rounded-lg border px-4 text-sm ${
              statusTab === tab
                ? 'border-[#2563eb] bg-[#ebf1ff] text-[#2563eb]'
                : 'border-[#e5e7eb] bg-white text-slate-600'
            }`}
          >
            {tab === 'all' ? 'All' : tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="overflow-auto rounded-xl border border-[#ececec] bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading bookings…
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No bookings match this filter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[#64748b]">
              <tr>
                <th className="px-3 py-2">Ref</th>
                <th className="py-2">Listing</th>
                <th className="py-2">Corporate</th>
                <th className="py-2">Vendor</th>
                <th className="py-2">Module</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.bookingId} className="border-t border-[#f1f5f9] hover:bg-[#fafafa]">
                  <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                  <td className="py-2">{row.title}</td>
                  <td className="py-2">{row.corporateName}</td>
                  <td className="py-2">{row.vendorName}</td>
                  <td className="py-2">{MODULE_LABEL[row.module]}</td>
                  <td className="py-2">₹{row.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2 capitalize">{row.status.replace(/_/g, ' ')}</td>
                  <td className="py-2">{row.date}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(row)
                        setNotice('')
                      }}
                      className="text-[#2563eb]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setSelected(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full overflow-auto border-l border-[#ececec] bg-white p-4 sm:w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Booking {selected.id}</h3>
              <button type="button" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <p className="text-sm">
              <strong>Listing:</strong> {selected.title}
            </p>
            <p className="text-sm">
              <strong>Corporate:</strong> {selected.corporateName}
            </p>
            <p className="text-sm">
              <strong>Vendor:</strong> {selected.vendorName}
            </p>
            <p className="text-sm">
              <strong>Booked by:</strong> {selected.userName}
            </p>
            <p className="text-sm">
              <strong>Amount:</strong> ₹{selected.amount.toLocaleString('en-IN')}
            </p>
            <p className="mb-3 text-sm capitalize">
              <strong>Status:</strong> {selected.status.replace(/_/g, ' ')} · Payment:{' '}
              {selected.paymentStatus}
            </p>

            {!selected.isDemo && (
              <Link
                to={`/bookings/${selected.bookingId}`}
                className="mb-4 inline-block text-sm text-[#2563eb]"
              >
                Open full booking detail →
              </Link>
            )}

            <div className="flex flex-wrap gap-2">
              {(['confirmed', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy || selected.status === status}
                  onClick={() => void handleStatus(status)}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-50"
                >
                  Mark {status}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

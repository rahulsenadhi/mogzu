import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { realtimeService } from '@/lib/realtime'
import type { Booking, Listing, UserProfile } from '@/lib/database.types'

type BookingWithRefs = Booking & {
  listings: Listing | null
  user_profiles: UserProfile | null
}

type TabKey = 'pending' | 'approved' | 'rejected'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function requesterName(b: BookingWithRefs): string {
  return b.user_profiles?.full_name ?? b.user_profiles?.id?.slice(0, 8) ?? 'Unknown'
}

export default function CorporateApprovalsPage() {
  const navigate = useNavigate()
  const { profile, corporateId, role } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  const [bookings, setBookings] = useState<BookingWithRefs[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionNotice, setActionNotice] = useState('')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  const canApprove = role === 'l2_manager' || role === 'l3_admin'

  const loadBookings = useCallback(async () => {
    if (!corporateId) return
    setIsLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.listByCorporate(corporateId)
    if (error) setLoadError(error.message)
    else setBookings((data ?? []) as BookingWithRefs[])
    setIsLoading(false)
  }, [corporateId])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Realtime: corporate bookings
  useEffect(() => {
    if (!corporateId) return
    return realtimeService.watchCorporateBookings<Booking>(corporateId, () => {
      loadBookings()
    })
  }, [corporateId, loadBookings])

  const byTab = useMemo(() => {
    return {
      pending: bookings.filter((b) => b.status === 'pending_approval'),
      approved: bookings.filter((b) =>
        ['pending_vendor', 'confirmed', 'completed'].includes(b.status),
      ),
      rejected: bookings.filter((b) => b.status === 'cancelled'),
    }
  }, [bookings])

  const filteredApprovals = useMemo(() => {
    const list = byTab[activeTab]
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        requesterName(b).toLowerCase().includes(q) ||
        (b.listings?.title ?? '').toLowerCase().includes(q),
    )
  }, [byTab, activeTab, searchQuery])

  const togglePick = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () => {
    if (selectedIds.size === filteredApprovals.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredApprovals.map((b) => b.id)))
  }

  useEffect(() => {
    setSelectedIds(new Set())
  }, [activeTab])

  const bulkApprove = async () => {
    if (!profile || selectedIds.size === 0) return
    setBulkBusy(true)
    setActionNotice('')
    const ids = Array.from(selectedIds)
    const results = await Promise.all(ids.map((id) => db.bookings.approve(id, profile.id)))
    const failed = results.filter((r) => r.error).length
    setBulkBusy(false)
    setSelectedIds(new Set())
    setActionNotice(
      failed === 0
        ? `Approved ${ids.length} request${ids.length !== 1 ? 's' : ''}.`
        : `Approved ${ids.length - failed} / ${ids.length}. ${failed} failed.`,
    )
    loadBookings()
  }

  if (!canApprove) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <h2 className="font-semibold text-amber-900">Manager access required</h2>
          <p className="mt-1 text-sm text-amber-800">
            Only L2 Managers and L3 Admins can review approval requests.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-4 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="bookings"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search approvals..."
        />

        <MogzuCorporateScrollSurface className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[1400px] px-8 py-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-[32px] font-semibold leading-10 text-[#0e1e3f]">Approvals</h1>
                <p className="mt-1 text-sm text-[#878e9e]">
                  Review and act on team booking requests
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-3 gap-6">
              <StatCard
                icon={<Clock className="size-6 text-amber-600" />}
                bg="bg-amber-100"
                label="Pending"
                count={byTab.pending.length}
                onClick={() => setActiveTab('pending')}
              />
              <StatCard
                icon={<CheckCircle className="size-6 text-green-600" />}
                bg="bg-green-100"
                label="Approved"
                count={byTab.approved.length}
                onClick={() => setActiveTab('approved')}
              />
              <StatCard
                icon={<XCircle className="size-6 text-red-600" />}
                bg="bg-red-100"
                label="Rejected"
                count={byTab.rejected.length}
                onClick={() => setActiveTab('rejected')}
              />
            </div>

            {actionNotice && (
              <p
                role="status"
                className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700"
              >
                {actionNotice}
              </p>
            )}

            {loadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{loadError}</p>
                <button
                  type="button"
                  onClick={loadBookings}
                  className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Main panel */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-6" role="tablist">
                    {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`-mb-[25px] border-b-2 px-2 pb-4 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'border-[#2563eb] text-[#2563eb]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === 'pending'
                          ? 'Pending Requests'
                          : tab === 'approved'
                            ? 'Approved'
                            : 'Rejected'}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search ID, name, or item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setActiveTab('pending')
                      }}
                      className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Filter className="size-4" />
                      Reset
                    </button>
                  </div>
                </div>

                {activeTab === 'pending' && selectedIds.size > 0 && (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2">
                    <p className="text-sm text-blue-700">
                      {selectedIds.size} request{selectedIds.size !== 1 ? 's' : ''} selected
                    </p>
                    <button
                      type="button"
                      onClick={bulkApprove}
                      disabled={bulkBusy}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {bulkBusy && <Loader2 className="size-3 animate-spin" />}
                      Approve selected
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="size-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        {activeTab === 'pending' && (
                          <th className="w-10 px-6 py-4">
                            <input
                              type="checkbox"
                              checked={
                                filteredApprovals.length > 0 &&
                                selectedIds.size === filteredApprovals.length
                              }
                              onChange={toggleAll}
                              className="size-4 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]/20"
                            />
                          </th>
                        )}
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Request ID
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Requested By
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Item
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApprovals.map((b) => (
                        <tr key={b.id} className="transition-colors hover:bg-gray-50/50">
                          {activeTab === 'pending' && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(b.id)}
                                onChange={() => togglePick(b.id)}
                                className="size-4 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]/20"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 text-sm font-medium text-[#2563eb]">
                            {b.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{requesterName(b)}</p>
                            {b.user_profiles?.department && (
                              <p className="text-xs text-gray-500">{b.user_profiles.department}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {b.listings?.title ?? '—'}
                            {b.purpose_note && (
                              <p className="mt-0.5 truncate text-xs text-gray-500" title={b.purpose_note}>
                                {b.purpose_note}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            ₹ {(b.total_amount ?? 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(b.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/corporate/approvals/${b.id}`)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#2563eb]"
                                title="View"
                              >
                                <Eye className="size-5" />
                              </button>
                              {activeTab === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/corporate/approvals/${b.id}`, {
                                        state: { intent: 'approve' },
                                      })
                                    }
                                    className="rounded-md p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                                    title="Approve"
                                  >
                                    <CheckCircle className="size-5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/corporate/approvals/${b.id}`, {
                                        state: { intent: 'reject' },
                                      })
                                    }
                                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    title="Reject"
                                  >
                                    <XCircle className="size-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredApprovals.length === 0 && (
                        <tr>
                          <td
                            colSpan={activeTab === 'pending' ? 7 : 6}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                          >
                            No {activeTab} requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  bg,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode
  bg: string
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-gray-200 bg-white p-6 text-left transition hover:border-[#2563eb]/30 hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={`flex size-12 items-center justify-center rounded-full ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
        </div>
      </div>
    </button>
  )
}

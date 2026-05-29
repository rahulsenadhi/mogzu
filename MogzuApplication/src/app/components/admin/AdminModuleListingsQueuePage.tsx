import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import type {
  Listing,
  ListingImage,
  ListingStatus,
  ModuleId,
  Vendor,
} from '@/lib/database.types'

type ListingWithRefs = Listing & {
  listing_images: ListingImage[]
  vendors: Pick<Vendor, 'id' | 'business_name'> | null
}

type TabKey = 'all' | 'pending' | 'approved' | 'rejected' | 'paused'

const TAB_FILTERS: Record<TabKey, ListingStatus[] | null> = {
  all: null,
  pending: ['pending_approval'],
  approved: ['active'],
  rejected: ['rejected'],
  paused: ['paused'],
}

const STATUS_BADGE: Record<ListingStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  pending_approval: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', className: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-700' },
}

const REJECT_REASONS = [
  'Images below quality standard',
  'Pricing not compliant',
  'Missing listing information',
  'Policy violation',
  'Other',
]

type Props = {
  modules: ModuleId[]
  title: string
  subtitle: string
  detailPath: (listingId: string) => string
}

export function AdminModuleListingsQueuePage({ modules, title, subtitle, detailPath }: Props) {
  const navigate = useNavigate()
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [tab, setTab] = useState<TabKey>('pending')
  const [listings, setListings] = useState<ListingWithRefs[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0])
  const [customReason, setCustomReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const tabStatuses = TAB_FILTERS[tab]
    const statuses: ListingStatus[] =
      tabStatuses ?? ['pending_approval', 'active', 'paused', 'rejected', 'draft']

    const results = await Promise.all(
      modules.flatMap((module) => statuses.map((s) => db.listings.listByModule(module, s))),
    )

    const merged: ListingWithRefs[] = []
    for (const r of results) {
      if (r.error) {
        setLoadError(r.error.message)
        continue
      }
      merged.push(...((r.data ?? []) as ListingWithRefs[]))
    }
    merged.sort((a, b) => b.created_at.localeCompare(a.created_at))
    setListings(merged)
    setSelected(new Set())
    setLoading(false)
  }, [tab, modules])

  useEffect(() => {
    void load()
  }, [load])

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () => {
    if (selected.size === listings.length) setSelected(new Set())
    else setSelected(new Set(listings.map((l) => l.id)))
  }

  const handleApproveSelected = async () => {
    if (selected.size === 0 || !profile) return
    setBusy(true)
    const ids = Array.from(selected)
    const results = await Promise.all(
      ids.map((id) =>
        db.listings.update(id, {
          status: 'active',
          metadata: {
            approvedBy: profile.id,
            approvedAt: new Date().toISOString(),
          } as unknown as Record<string, unknown>,
        }),
      ),
    )
    const failed = results.filter((r) => r.error).length
    setBusy(false)
    setNotice(
      failed === 0
        ? `Approved ${ids.length} listing${ids.length !== 1 ? 's' : ''}.`
        : `Approved ${ids.length - failed} / ${ids.length}. ${failed} failed.`,
    )
    void load()
  }

  const handleReject = async () => {
    if (!profile || selected.size === 0) return
    const reasonText = rejectReason === 'Other' ? customReason.trim() : rejectReason
    if (!reasonText) {
      setNotice('Provide a rejection reason.')
      return
    }
    setBusy(true)
    const ids = Array.from(selected)
    const results = await Promise.all(
      ids.map((id) => {
        const existing = listings.find((l) => l.id === id)
        const prevMeta = (existing?.metadata ?? {}) as Record<string, unknown>
        return db.listings.update(id, {
          status: 'rejected',
          metadata: {
            ...prevMeta,
            rejectionReason: reasonText,
            rejectedBy: profile.id,
            rejectedAt: new Date().toISOString(),
          } as unknown as Record<string, unknown>,
        })
      }),
    )
    const failed = results.filter((r) => r.error).length
    setBusy(false)
    setRejectOpen(false)
    setNotice(
      failed === 0
        ? `Rejected ${ids.length} listing${ids.length !== 1 ? 's' : ''}.`
        : `Rejected ${ids.length - failed} / ${ids.length}. ${failed} failed.`,
    )
    void load()
  }

  const pendingCount = useMemo(
    () => listings.filter((l) => l.status === 'pending_approval').length,
    [listings],
  )

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Mogzu admin access required.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-[#0e1e3f]">{title}</h1>
      <p className="mb-4 text-sm text-slate-500">{subtitle}</p>

      {!loading && listings.length === 0 && import.meta.env.DEV && <DevMockDataBanner />}

      {notice && (
        <p
          role="status"
          className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
        >
          {notice}
        </p>
      )}

      {loadError && (
        <p className="mb-3 text-sm text-rose-700">{loadError}</p>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto whitespace-nowrap">
        {(['pending', 'approved', 'rejected', 'paused', 'all'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-9 rounded-lg border px-4 text-sm ${
              tab === t
                ? 'border-[#2563eb] bg-[#ebf1ff] text-[#2563eb]'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {t === 'all' ? 'All' : t[0].toUpperCase() + t.slice(1)}
            {t === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-600">{selected.size} selected</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleApproveSelected()}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-sm text-white disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" /> Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setRejectOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 text-sm text-rose-700 disabled:opacity-50"
          >
            <XCircle className="size-4" /> Reject
          </button>
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading listings…
          </div>
        ) : listings.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No listings in this queue.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.size === listings.length && listings.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all listings"
                  />
                </th>
                <th className="py-2">Title</th>
                <th className="py-2">Vendor</th>
                <th className="py-2">Module</th>
                <th className="py-2">Price</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const badge = STATUS_BADGE[listing.status]
                return (
                  <tr key={listing.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(listing.id)}
                        onChange={() => toggleOne(listing.id)}
                        aria-label={`Select ${listing.title}`}
                      />
                    </td>
                    <td className="py-2 font-medium text-slate-900">{listing.title}</td>
                    <td className="py-2">{listing.vendors?.business_name ?? '—'}</td>
                    <td className="py-2 capitalize">{listing.module.replace(/_/g, ' ')}</td>
                    <td className="py-2">
                      {listing.base_price != null
                        ? `₹${listing.base_price.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => navigate(detailPath(listing.id))}
                        className="text-[#2563eb]"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold">Reject selected listings</h3>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {rejectReason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Custom reason"
                className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="h-9 rounded-lg border border-slate-200 px-4 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleReject()}
                className="h-9 rounded-lg bg-rose-600 px-4 text-sm text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

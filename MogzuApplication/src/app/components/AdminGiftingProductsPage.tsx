import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react'
import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'
import { LeadOpsPageHeader } from '@/app/components/leads/LeadOpsPageHeader'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type {
  Listing,
  ListingImage,
  ListingStatus,
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

type RejectFormState = {
  reason: string
  custom: string
  fields: string[]
}

const REJECT_REASONS = [
  'Images below quality standard',
  'Pricing not compliant',
  'Missing product information',
  'Prohibited item',
  'Other',
]

const FIELD_OPTIONS = [
  'Images',
  'Description',
  'Pricing',
  'Variants',
  'MOQ',
  'Delivery cities',
  'Branding',
]

function emptyRejectForm(): RejectFormState {
  return { reason: REJECT_REASONS[0], custom: '', fields: [] }
}

export default function AdminGiftingProductsPage() {
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
  const [rejectForm, setRejectForm] = useState<RejectFormState>(emptyRejectForm())

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    // listings.listByModule defaults to 'active' — need raw query for all statuses.
    // Use listPendingApproval + supplement with status fetches via listByModule per status.
    const tabStatuses = TAB_FILTERS[tab]
    if (tabStatuses) {
      const results = await Promise.all(
        tabStatuses.map((s) => db.listings.listByModule('gifting', s)),
      )
      const merged: ListingWithRefs[] = []
      for (const r of results) {
        if (r.error) {
          setLoadError(r.error.message)
          continue
        }
        merged.push(...((r.data ?? []) as ListingWithRefs[]))
      }
      setListings(merged)
    } else {
      const statuses: ListingStatus[] = ['pending_approval', 'active', 'paused', 'rejected']
      const results = await Promise.all(
        statuses.map((s) => db.listings.listByModule('gifting', s)),
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
    }
    setSelected(new Set())
    setLoading(false)
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const sameVendorSelection = useMemo(() => {
    if (selected.size === 0) return null
    const vendorIds = new Set(
      listings.filter((l) => selected.has(l.id)).map((l) => l.vendor_id),
    )
    return vendorIds.size === 1 ? Array.from(vendorIds)[0] : null
  }, [selected, listings])

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
        ? `Approved ${ids.length} product${ids.length !== 1 ? 's' : ''}.`
        : `Approved ${ids.length - failed} / ${ids.length}. ${failed} failed.`,
    )
    load()
  }

  const openReject = () => {
    if (selected.size === 0) return
    setRejectForm(emptyRejectForm())
    setRejectOpen(true)
  }

  const handleReject = async () => {
    if (!profile) return
    const reasonText =
      rejectForm.reason === 'Other' ? rejectForm.custom.trim() : rejectForm.reason
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
            rejectionFields: rejectForm.fields,
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
        ? `Rejected ${ids.length} product${ids.length !== 1 ? 's' : ''}. Vendor will be notified.`
        : `Rejected ${ids.length - failed} / ${ids.length}. ${failed} failed.`,
    )
    load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Mogzu admin access required.</p>
      </div>
    )
  }

  return (
    <div className={ADMIN_MODULE.page}>
      <LeadOpsPageHeader
        eyebrow="Gifting module"
        title="Product approval"
        description="Review vendor submissions. Approved products appear in the corporate gifting shop (same catalogue buyers see)."
        actions={
          <button
            type="button"
            onClick={() => navigate('/gifting')}
            className={LEAD_OPS.secondaryBtn}
          >
            View gifting shop
          </button>
        }
      />

      {notice ? (
        <p
          role="status"
          className={`${LEAD_OPS.surfaceMuted} text-sm text-blue-800`}
        >
          {notice}
        </p>
      ) : null}

      <div className={`${ADMIN_MODULE.card} flex gap-2 overflow-x-auto p-3`} role="tablist" aria-label="Approval status">
        {(['pending', 'approved', 'rejected', 'paused', 'all'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={ADMIN_MODULE.navChip(tab === t)}
          >
            {t === 'all' ? 'All' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-2">
          <p className="text-sm text-slate-700">
            {selected.size} selected
            {sameVendorSelection && (
              <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Same vendor — bulk approve recommended
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApproveSelected}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-3 animate-spin" />}
              <CheckCircle2 className="size-4" /> Approve
            </button>
            <button
              type="button"
              onClick={openReject}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              <XCircle className="size-4" /> Reject
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      )}

      <div className={`${ADMIN_MODULE.tableWrap} overflow-auto`}>
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No products in this tab.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === listings.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-2">Thumbnail</th>
                <th className="py-2">Product</th>
                <th className="py-2">Vendor</th>
                <th className="py-2">Pricing</th>
                <th className="py-2">Submitted</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => {
                const cover = l.listing_images?.[0]
                const badge = STATUS_BADGE[l.status]
                return (
                  <tr key={l.id} className="border-t border-[#f1f5f9] hover:bg-[#fafafa]">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={() => toggleOne(l.id)}
                      />
                    </td>
                    <td className="py-2">
                      {cover ? (
                        <img
                          src={storageService.giftImages.getUrl(cover.storage_path)}
                          alt=""
                          className="size-10 rounded object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded bg-slate-100" />
                      )}
                    </td>
                    <td className="py-2 font-medium text-slate-900">{l.title}</td>
                    <td className="py-2">{l.vendors?.business_name ?? '—'}</td>
                    <td className="py-2">{l.pricing_type}</td>
                    <td className="py-2">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/gifting/products/${l.id}`)}
                        className="text-[#2563eb]"
                      >
                        View
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Reject {selected.size} product{selected.size !== 1 ? 's' : ''}
              </h2>
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Reason
                </label>
                <select
                  value={rejectForm.reason}
                  onChange={(e) =>
                    setRejectForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  {REJECT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {rejectForm.reason === 'Other' && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Custom reason
                  </label>
                  <input
                    value={rejectForm.custom}
                    onChange={(e) =>
                      setRejectForm((f) => ({ ...f, custom: e.target.value }))
                    }
                    placeholder="Explain why"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Fields to revise
                </label>
                <div className="flex flex-wrap gap-2">
                  {FIELD_OPTIONS.map((f) => {
                    const active = rejectForm.fields.includes(f)
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() =>
                          setRejectForm((s) => ({
                            ...s,
                            fields: active
                              ? s.fields.filter((x) => x !== f)
                              : [...s.fields, f],
                          }))
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          active
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {f}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRejectOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

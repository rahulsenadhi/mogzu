import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type {
  Listing,
  ListingCategory,
  ListingImage,
  ListingStatus,
  Vendor,
} from '@/lib/database.types'

type ListingDetail = Listing & {
  listing_images: ListingImage[]
  listing_categories: ListingCategory | null
  vendors: Vendor | null
}

const REJECT_REASONS = [
  'Images below quality standard',
  'Pricing not compliant',
  'Missing product information',
  'Prohibited item',
  'Other',
]

const STATUS_BADGE: Record<ListingStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  pending_approval: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', className: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-700' },
}

export default function AdminGiftingProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.listings.getById(id)
    if (error || !data) {
      setLoadError(error?.message ?? 'Product not found.')
      setListing(null)
    } else {
      setListing(data as ListingDetail)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async () => {
    if (!listing || !profile) return
    setSubmitting(true)
    const prevMeta = (listing.metadata ?? {}) as Record<string, unknown>
    const { error } = await db.listings.update(listing.id, {
      status: 'active',
      metadata: {
        ...prevMeta,
        approvedBy: profile.id,
        approvedAt: new Date().toISOString(),
      } as Record<string, unknown>,
    })
    setSubmitting(false)
    if (error) setNotice(`Approve failed: ${error.message}`)
    else {
      setNotice('Approved. Product is now visible in the gifting shop.')
      load()
    }
  }

  const handleReject = async () => {
    if (!listing || !profile) return
    const text = rejectReason === 'Other' ? customReason.trim() : rejectReason
    if (!text) {
      setNotice('Provide a rejection reason.')
      return
    }
    setSubmitting(true)
    const prevMeta = (listing.metadata ?? {}) as Record<string, unknown>
    const { error } = await db.listings.update(listing.id, {
      status: 'rejected',
      metadata: {
        ...prevMeta,
        rejectionReason: text,
        rejectedBy: profile.id,
        rejectedAt: new Date().toISOString(),
      } as Record<string, unknown>,
    })
    setSubmitting(false)
    setRejectOpen(false)
    if (error) setNotice(`Reject failed: ${error.message}`)
    else {
      setNotice('Rejected. Vendor will be notified to revise and resubmit.')
      load()
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Mogzu admin access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (loadError || !listing) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-700">{loadError || 'Product not found.'}</p>
      </div>
    )
  }

  const md = (listing.metadata ?? {}) as {
    moq?: number
    gstPercent?: number
    bulkTiers?: { minQty: number; maxQty: number; price: number }[]
    variants?: { name: string; options: string }[]
    brandingOptions?: string[]
    leadTimeDays?: number
    packagingType?: string
    deliveryCities?: string[]
    inventory?: number
    rejectionReason?: string
    approvedAt?: string
    rejectedAt?: string
  }
  const badge = STATUS_BADGE[listing.status]
  const images = listing.listing_images ?? []

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0e1e3f]">Product approval view</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/gifting/products')}
          className="h-9 rounded border border-slate-200 px-3 text-sm"
        >
          Back
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
        >
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-[#ececec] bg-white p-4 xl:col-span-2">
          <div className="mb-3 flex items-start justify-between">
            <h2 className="text-lg font-semibold text-[#0e1e3f]">{listing.title}</h2>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {images.length > 0 && (
            <div className="mb-4 grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((img) => (
                <img
                  key={img.id}
                  src={storageService.giftImages.getUrl(img.storage_path)}
                  alt=""
                  className="h-24 w-full rounded object-cover"
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>
              <strong>Category:</strong> {listing.listing_categories?.name ?? '—'}
            </p>
            <p>
              <strong>Pricing:</strong> {listing.pricing_type}
            </p>
            <p>
              <strong>MOQ:</strong> {md.moq ?? '—'}
            </p>
            <p>
              <strong>Price:</strong>{' '}
              {listing.pricing_type === 'request_for_price' || listing.base_price == null
                ? '—'
                : `₹${listing.base_price.toLocaleString('en-IN')}`}
            </p>
            <p>
              <strong>GST:</strong> {md.gstPercent != null ? `${md.gstPercent}%` : '—'}
            </p>
            <p>
              <strong>Delivery SLA:</strong>{' '}
              {md.leadTimeDays != null ? `${md.leadTimeDays} days` : '—'}
            </p>
            <p>
              <strong>Packaging:</strong> {md.packagingType ?? '—'}
            </p>
            <p>
              <strong>Inventory:</strong> {md.inventory ?? '—'}
            </p>
            {listing.description && (
              <p className="col-span-2">
                <strong>Description:</strong> {listing.description}
              </p>
            )}
            {md.brandingOptions && md.brandingOptions.length > 0 && (
              <p className="col-span-2">
                <strong>Branding:</strong> {md.brandingOptions.join(', ')}
              </p>
            )}
            {md.deliveryCities && md.deliveryCities.length > 0 && (
              <p className="col-span-2">
                <strong>Delivery cities:</strong> {md.deliveryCities.join(', ')}
              </p>
            )}
          </div>

          {md.variants && md.variants.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Variants</h3>
              <ul className="space-y-1 text-sm">
                {md.variants.map((v, i) => (
                  <li key={i}>
                    <strong>{v.name}:</strong> {v.options}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {md.bulkTiers && md.bulkTiers.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Bulk pricing tiers</h3>
              <table className="w-full overflow-hidden rounded border border-[#e5e7eb] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-2">Min</th>
                    <th className="p-2">Max</th>
                    <th className="p-2">Price / unit</th>
                  </tr>
                </thead>
                <tbody>
                  {md.bulkTiers.map((t, i) => (
                    <tr key={i} className="border-t border-[#f1f5f9]">
                      <td className="p-2">{t.minQty}</td>
                      <td className="p-2">{t.maxQty}</td>
                      <td className="p-2">₹{t.price.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {listing.status === 'rejected' && md.rejectionReason && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                Rejection reason
              </p>
              <p className="mt-1 text-sm text-rose-800">{md.rejectionReason}</p>
              {md.rejectedAt && (
                <p className="mt-1 text-[11px] text-rose-700">
                  {new Date(md.rejectedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[#ececec] bg-white p-4">
            <h3 className="mb-2 font-semibold text-[#0e1e3f]">Vendor</h3>
            <p className="text-sm font-medium">
              {listing.vendors?.business_name ?? '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Status: {listing.vendors?.status ?? '—'}
              {listing.vendors?.city ? ` · ${listing.vendors.city}` : ''}
            </p>
          </div>

          {listing.status === 'pending_approval' && (
            <div className="rounded-xl border border-[#ececec] bg-white p-4">
              <h3 className="mb-2 font-semibold text-[#0e1e3f]">Action</h3>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                <CheckCircle2 className="size-4" /> Approve
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={submitting}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <XCircle className="size-4" /> Request changes / Reject
              </button>
            </div>
          )}
        </aside>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Reject product</h2>
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
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  {REJECT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {rejectReason === 'Other' && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Custom reason
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                    placeholder="Explain why"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              )}
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
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
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

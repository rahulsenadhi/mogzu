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
  'Missing listing information',
  'Policy violation',
  'Other',
]

const STATUS_BADGE: Record<ListingStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  pending_approval: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', className: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-700' },
}

type Props = {
  backPath: string
  pageTitle: string
}

export function AdminListingApprovalDetailPage({ backPath, pageTitle }: Props) {
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
      setLoadError(error?.message ?? 'Listing not found.')
      setListing(null)
    } else {
      setListing(data as ListingDetail)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    void load()
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
      setNotice('Approved. Listing is now visible in the catalogue.')
      void load()
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
      void load()
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
        <p className="text-sm text-rose-700">{loadError || 'Listing not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mt-3 text-sm text-[#2563eb]"
        >
          Back to queue
        </button>
      </div>
    )
  }

  const md = (listing.metadata ?? {}) as {
    rejectionReason?: string
    approvedAt?: string
    rejectedAt?: string
    capacity?: number
    amenities?: string[]
  }
  const badge = STATUS_BADGE[listing.status]
  const images = [...(listing.listing_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  )
  const cover = images[0]

  const imageUrl = (path: string) => {
    if (listing.module === 'gifting') return storageService.giftImages.getUrl(path)
    if (listing.module === 'events') return storageService.listingImages.getUrl(path)
    return storageService.spaceImages.getUrl(path)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0e1e3f]">{pageTitle}</h1>
        <button
          type="button"
          onClick={() => navigate(backPath)}
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
              <p className="text-sm text-slate-500">
                {listing.vendors?.business_name ?? 'Unknown vendor'} ·{' '}
                {listing.module.replace(/_/g, ' ')}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {cover?.storage_path && (
            <img
              src={imageUrl(cover.storage_path)}
              alt={listing.title}
              className="mb-4 h-48 w-full rounded-lg object-cover"
            />
          )}

          <p className="mb-4 text-sm text-slate-700">{listing.description ?? 'No description.'}</p>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Base price</dt>
              <dd className="font-medium">
                {listing.base_price != null
                  ? `₹${listing.base_price.toLocaleString('en-IN')}`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium">{listing.location_address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Capacity</dt>
              <dd className="font-medium">{md.capacity ?? listing.max_capacity ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="font-medium">{listing.listing_categories?.name ?? '—'}</dd>
            </div>
          </dl>

          {md.rejectionReason && (
            <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              Rejection reason: {md.rejectionReason}
            </p>
          )}
        </div>

        <aside className="space-y-3">
          {listing.status === 'pending_approval' && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleApprove()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" /> Approve listing
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setRejectOpen(true)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white text-sm font-medium text-rose-700 disabled:opacity-50"
              >
                <XCircle className="size-4" /> Reject listing
              </button>
            </>
          )}

          {listing.status === 'active' && (
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true)
                await db.listings.updateStatus(listing.id, 'paused')
                setSubmitting(false)
                setNotice('Listing paused.')
                void load()
              }}
              className="h-10 w-full rounded-lg border border-slate-200 text-sm"
            >
              Pause listing
            </button>
          )}

          {listing.status === 'paused' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleApprove()}
              className="h-10 w-full rounded-lg bg-emerald-600 text-sm text-white disabled:opacity-50"
            >
              Reactivate listing
            </button>
          )}
        </aside>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold">Reject listing</h3>
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
                disabled={submitting}
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

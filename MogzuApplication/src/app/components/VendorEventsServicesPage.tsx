import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  Megaphone,
  Plus,
  Search,
  Trash2,
  X,
  Bell,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type {
  Listing,
  ListingCategory,
  ListingImage,
  ListingStatus,
} from '@/lib/database.types'

const MODULE_ID = 'events' as const

type ListingWithImages = Listing & { listing_images: ListingImage[] }

type FormState = {
  title: string
  description: string
  categoryId: string
  minCapacity: string
  maxCapacity: string
  pricingType: Listing['pricing_type']
  basePrice: string
  priceUnit: NonNullable<Listing['price_unit']>
  locationCity: string
  cancellationPolicy: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  categoryId: '',
  minCapacity: '',
  maxCapacity: '100',
  pricingType: 'transparent',
  basePrice: '',
  priceUnit: 'per_person',
  locationCity: '',
  cancellationPolicy: '',
}

function statusBadge(s: ListingStatus): { label: string; className: string } {
  switch (s) {
    case 'active':
      return { label: 'Active', className: 'bg-emerald-50 text-emerald-700' }
    case 'draft':
      return { label: 'Draft', className: 'bg-slate-100 text-slate-600' }
    case 'paused':
      return { label: 'Paused', className: 'bg-amber-50 text-amber-800' }
    case 'pending_approval':
      return { label: 'Pending review', className: 'bg-blue-50 text-blue-700' }
    case 'rejected':
      return { label: 'Rejected', className: 'bg-rose-50 text-rose-700' }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

// ─── Form Modal ──────────────────────────────────────────────────────────────

function ListingFormModal({
  initial,
  categories,
  vendorId,
  onClose,
  onSaved,
}: {
  initial: ListingWithImages | null
  categories: ListingCategory[]
  vendorId: string
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description ?? '',
          categoryId: initial.category_id ?? categories[0]?.id ?? '',
          minCapacity: initial.min_capacity != null ? String(initial.min_capacity) : '',
          maxCapacity: String(initial.max_capacity ?? ''),
          pricingType: initial.pricing_type,
          basePrice: initial.base_price != null ? String(initial.base_price) : '',
          priceUnit: initial.price_unit ?? 'per_person',
          locationCity: initial.location_city ?? '',
          cancellationPolicy: initial.cancellation_policy ?? '',
        }
      : { ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' },
  )
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<ListingImage[]>(
    initial?.listing_images ?? [],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const totalImages = existingImages.length + imageFiles.length

  const validate = (): string => {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.categoryId) return 'Category is required.'
    const max = Number(form.maxCapacity)
    if (!max || max < 1) return 'Max capacity must be a positive number.'
    if (form.minCapacity) {
      const min = Number(form.minCapacity)
      if (!min || min < 1) return 'Min capacity must be a positive number.'
      if (min > max) return 'Min capacity cannot exceed max capacity.'
    }
    if (form.pricingType === 'transparent') {
      const p = Number(form.basePrice)
      if (!p || p <= 0) return 'Base price is required for transparent pricing.'
    }
    if (totalImages > 10) return 'Maximum 10 images allowed.'
    return ''
  }

  const removeExistingImage = async (img: ListingImage) => {
    setExistingImages((prev) => prev.filter((x) => x.id !== img.id))
    await db.listings.deleteImage(img.id)
    await storageService.listingImages.delete([img.storage_path])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    setSubmitting(true)

    const basePayload = {
      vendor_id: vendorId,
      module: MODULE_ID,
      category_id: form.categoryId || null,
      title: form.title.trim(),
      description: form.description.trim() || null,
      pricing_type: form.pricingType,
      base_price:
        form.pricingType === 'transparent' && form.basePrice
          ? Number(form.basePrice)
          : null,
      price_unit: form.pricingType === 'transparent' ? form.priceUnit : null,
      min_capacity: form.minCapacity ? Number(form.minCapacity) : null,
      max_capacity: Number(form.maxCapacity),
      location_city: form.locationCity.trim() || null,
      location_address: null,
      cancellation_policy: form.cancellationPolicy.trim() || null,
      confirmation_sla_hours: 24,
      is_mogzu_direct: false,
      metadata: {},
    }

    let listingId = initial?.id ?? ''

    if (isEdit) {
      const { error: updErr } = await db.listings.update(initial!.id, basePayload)
      if (updErr) {
        setError(updErr.message)
        setSubmitting(false)
        return
      }
    } else {
      const { data, error: insErr } = await db.listings.create({
        ...basePayload,
        status: 'draft',
      })
      if (insErr || !data) {
        setError(insErr?.message ?? 'Failed to create listing.')
        setSubmitting(false)
        return
      }
      listingId = data.id
    }

    if (imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) =>
          storageService.listingImages.upload(vendorId, listingId, file),
        ),
      )
      const successful = uploads
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => !u.error)
      if (successful.length > 0) {
        const baseOrder = existingImages.length
        await db.listings.addImages(
          successful.map(({ u, i }) => ({
            listing_id: listingId,
            storage_path: u.path,
            display_order: baseOrder + i,
          })),
        )
      }
    }

    setSubmitting(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit event listing' : 'New event listing'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Update event details, pricing, and images.'
                : 'Create a draft. Submit for admin review when ready.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g., Annual Day Celebration Package"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Event format, what's included, expected outcomes…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                {categories.length === 0 && <option value="">No categories</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Location (city)
              </label>
              <input
                value={form.locationCity}
                onChange={(e) => set('locationCity', e.target.value)}
                placeholder="e.g., Mumbai"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Min capacity
              </label>
              <input
                type="number"
                min="1"
                value={form.minCapacity}
                onChange={(e) => set('minCapacity', e.target.value)}
                placeholder="optional"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Max capacity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.maxCapacity}
                onChange={(e) => set('maxCapacity', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Pricing type
              </label>
              <select
                value={form.pricingType}
                onChange={(e) => set('pricingType', e.target.value as Listing['pricing_type'])}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="transparent">Transparent</option>
                <option value="offer">Offer</option>
                <option value="request_for_price">Request for price</option>
              </select>
            </div>

            {form.pricingType === 'transparent' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Base price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={form.basePrice}
                    onChange={(e) => set('basePrice', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Price unit
                  </label>
                  <select
                    value={form.priceUnit}
                    onChange={(e) => set('priceUnit', e.target.value as FormState['priceUnit'])}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="per_person">Per person</option>
                    <option value="flat">Flat</option>
                    <option value="per_hour">Per hour</option>
                    <option value="per_day">Per day</option>
                  </select>
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Cancellation policy
              </label>
              <textarea
                value={form.cancellationPolicy}
                onChange={(e) => set('cancellationPolicy', e.target.value)}
                rows={2}
                placeholder="e.g., Full refund up to 72h before. 50% within 24h. No refund after start."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
              <span>Images</span>
              <span className="font-normal text-slate-400">{totalImages}/10</span>
            </label>
            {existingImages.length > 0 && (
              <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={storageService.listingImages.getUrl(img.storage_path)}
                      alt=""
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            {imageFiles.length > 0 && (
              <p className="mt-1 text-[11px] text-slate-500">
                {imageFiles.length} new image{imageFiles.length !== 1 ? 's' : ''} ready to upload.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function VendorEventsServicesPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { vendorId } = useAuth()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ListingStatus>('all')
  const [sortBy, setSortBy] = useState<'created' | 'title' | 'status'>('created')

  const [listings, setListings] = useState<ListingWithImages[]>([])
  const [categories, setCategories] = useState<ListingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionNotice, setActionNotice] = useState('')

  const [editing, setEditing] = useState<ListingWithImages | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadListings = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    setLoadError('')
    const { data, error } = await db.listings.listByVendor(vendorId)
    if (error) setLoadError(error.message)
    else {
      const all = (data ?? []) as ListingWithImages[]
      setListings(all.filter((l) => l.module === MODULE_ID))
    }
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  useEffect(() => {
    db.categories.listByModule(MODULE_ID).then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [])

  // Route-driven new/edit
  useEffect(() => {
    if (loading) return
    const path = window.location.pathname
    if (path.endsWith('/new')) {
      setEditing(null)
      setShowForm(true)
      return
    }
    if (params.id) {
      const match = listings.find((l) => l.id === params.id)
      if (match) {
        setEditing(match)
        setShowForm(true)
      }
    }
  }, [loading, listings, params.id])

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = listings.filter(
      (l) =>
        (!q ||
          l.title.toLowerCase().includes(q) ||
          (l.description ?? '').toLowerCase().includes(q) ||
          (l.location_city ?? '').toLowerCase().includes(q)) &&
        (statusFilter === 'all' || l.status === statusFilter),
    )
    return [...base].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return b.created_at.localeCompare(a.created_at)
    })
  }, [listings, search, statusFilter, sortBy])

  const handleNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const handleEdit = (l: ListingWithImages) => {
    setEditing(l)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    if (window.location.pathname !== '/vendor/events') {
      navigate('/vendor/events', { replace: true })
    }
  }

  const handleSaved = () => {
    setActionNotice('Listing saved.')
    closeForm()
    loadListings()
  }

  const handleTogglePause = async (l: ListingWithImages) => {
    const next: ListingStatus = l.status === 'active' ? 'paused' : 'active'
    const { error } = await db.listings.updateStatus(l.id, next)
    if (error) setActionNotice(`Update failed: ${error.message}`)
    else {
      setActionNotice(next === 'active' ? 'Listing activated.' : 'Listing paused.')
      loadListings()
    }
  }

  const handleSubmitForReview = async (l: ListingWithImages) => {
    const { error } = await db.listings.updateStatus(l.id, 'pending_approval')
    if (error) setActionNotice(`Submit failed: ${error.message}`)
    else {
      setActionNotice('Submitted for admin approval.')
      loadListings()
    }
  }

  const handleDelete = async (l: ListingWithImages) => {
    if (l.status !== 'draft') return
    if (!window.confirm(`Delete "${l.title}"? This cannot be undone.`)) return
    setDeletingId(l.id)
    if (l.listing_images?.length) {
      await storageService.listingImages.delete(l.listing_images.map((i) => i.storage_path))
    }
    await db.listings.update(l.id, { status: 'paused' })
    setDeletingId(null)
    setActionNotice('Listing archived. Admin can purge if needed.')
    loadListings()
  }

  return (
    <>
      <VendorAppShell
        activeNav="events"
        routeSource="vendor-events-services"
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event listings"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
        headerEnd={
          <>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
              onClick={() => setActionNotice('Help center coming soon.')}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
              onClick={() => navigate('/vendor/calendar')}
              aria-label="Open calendar"
            >
              <Bell className="h-5 w-5" />
            </button>
            <VendorTopRightMenu />
          </>
        }
      >
        <main className="min-h-full w-full bg-transparent">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Event listings</h1>
                <p className="text-sm text-slate-500">
                  {loading ? 'Loading…' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNew}
                disabled={!vendorId}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add new
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              >
                <option value="all">Status: All</option>
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              >
                <option value="created">Sort: Created</option>
                <option value="title">Sort: Title</option>
                <option value="status">Sort: Status</option>
              </select>
            </div>

            {actionNotice && (
              <p
                role="status"
                className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700"
              >
                {actionNotice}
              </p>
            )}

            {loadError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{loadError}</p>
                <button
                  type="button"
                  onClick={loadListings}
                  className="mt-2 inline-flex rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                <Loader2 className="mx-auto mb-2 size-6 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">Loading events…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No event listings yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Create a listing to start receiving corporate bookings.
                </p>
                <button
                  type="button"
                  onClick={handleNew}
                  disabled={!vendorId}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Create first listing
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((l) => {
                  const badge = statusBadge(l.status)
                  const cover = l.listing_images?.[0]
                  const rejectionReason =
                    l.status === 'rejected' && l.metadata && typeof (l.metadata as Record<string, unknown>).rejection_reason === 'string'
                      ? ((l.metadata as Record<string, unknown>).rejection_reason as string)
                      : null
                  return (
                    <li
                      key={l.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:size-20">
                        {cover ? (
                          <img
                            src={storageService.listingImages.getUrl(cover.storage_path)}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-slate-300">
                            <FileText className="size-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">{l.title}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {categoryName[l.category_id ?? ''] ?? 'Uncategorized'}
                          {l.max_capacity ? ` • Up to ${l.max_capacity}` : ''}
                          {l.location_city ? ` • ${l.location_city}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Created {formatDate(l.created_at)}
                          {l.base_price != null && (
                            <span className="ml-2">
                              ₹{l.base_price.toLocaleString('en-IN')}
                              {l.price_unit ? ` / ${l.price_unit.replace('_', ' ')}` : ''}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(l)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          title="Edit"
                        >
                          <Eye className="h-4 w-4" />
                          Edit
                        </button>
                        {l.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleSubmitForReview(l)}
                            className="rounded-md bg-[#2563EB] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Submit for review
                          </button>
                        )}
                        {l.status === 'pending_approval' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await db.listings.update(l.id, { status: 'draft' })
                              loadListings()
                            }}
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Withdraw
                          </button>
                        )}
                        {l.status === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleSubmitForReview(l)}
                            className="rounded-md bg-[#2563EB] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Resubmit for review
                          </button>
                        )}
                        {(l.status === 'active' || l.status === 'paused') && (
                          <button
                            type="button"
                            onClick={() => handleTogglePause(l)}
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {l.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                        )}
                        {(l.status === 'draft' || l.status === 'rejected') && (
                          <button
                            type="button"
                            onClick={() => handleDelete(l)}
                            disabled={deletingId === l.id}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {l.status === 'rejected' && (
                        <div className="basis-full rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                          <p className="font-medium">Rejected by Mogzu review</p>
                          {rejectionReason ? (
                            <p className="mt-0.5 whitespace-pre-wrap">{rejectionReason}</p>
                          ) : (
                            <p className="mt-0.5">No reason provided. Edit the listing and resubmit.</p>
                          )}
                        </div>
                      )}
                      {l.status === 'pending_approval' && (
                        <div className="basis-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                          Awaiting Mogzu review. You can withdraw to keep editing.
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </main>
      </VendorAppShell>

      {showForm && vendorId && (
        <ListingFormModal
          initial={editing}
          categories={categories}
          vendorId={vendorId}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

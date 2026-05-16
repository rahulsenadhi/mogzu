import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type {
  Listing,
  ListingCategory,
  ListingImage,
} from '@/lib/database.types'

const MODULE_ID = 'gifting' as const

type BulkTier = { minQty: number; maxQty: number; price: number }
type Variant = { name: string; options: string }

type GiftingMetadata = {
  moq?: number
  gstPercent?: number
  bulkTiers?: BulkTier[]
  variants?: Variant[]
  brandingOptions?: string[]
  leadTimeDays?: number
  packagingType?: string
  deliveryCities?: string[]
  outOfStock?: boolean
  inventory?: number
}

type ListingWithImages = Listing & { listing_images: ListingImage[] }

type Form = {
  title: string
  description: string
  categoryId: string
  pricingType: Listing['pricing_type']
  basePrice: string
  moq: string
  gstPercent: string
  leadTimeDays: string
  packagingType: string
  inventory: string
  outOfStock: boolean
  brandingOptions: string[]
  deliveryCitiesText: string
  variantsText: string
  bulkTiers: BulkTier[]
}

const BRANDING_OPTIONS = ['Logo print', 'Embroidery', 'Engraving', 'Custom packaging']
const PACKAGING_TYPES = ['Box', 'Pouch', 'Bag', 'Custom']

function emptyForm(): Form {
  return {
    title: '',
    description: '',
    categoryId: '',
    pricingType: 'transparent',
    basePrice: '',
    moq: '1',
    gstPercent: '18',
    leadTimeDays: '7',
    packagingType: 'Box',
    inventory: '',
    outOfStock: false,
    brandingOptions: [],
    deliveryCitiesText: '',
    variantsText: '',
    bulkTiers: [],
  }
}

function listingToForm(l: ListingWithImages): Form {
  const md = (l.metadata ?? {}) as GiftingMetadata
  return {
    title: l.title,
    description: l.description ?? '',
    categoryId: l.category_id ?? '',
    pricingType: l.pricing_type,
    basePrice: l.base_price != null ? String(l.base_price) : '',
    moq: md.moq != null ? String(md.moq) : '1',
    gstPercent: md.gstPercent != null ? String(md.gstPercent) : '18',
    leadTimeDays: md.leadTimeDays != null ? String(md.leadTimeDays) : '7',
    packagingType: md.packagingType ?? 'Box',
    inventory: md.inventory != null ? String(md.inventory) : '',
    outOfStock: md.outOfStock ?? false,
    brandingOptions: md.brandingOptions ?? [],
    deliveryCitiesText: (md.deliveryCities ?? []).join(', '),
    variantsText: (md.variants ?? [])
      .map((v) => `${v.name}: ${v.options}`)
      .join('\n'),
    bulkTiers: md.bulkTiers ?? [],
  }
}

function parseVariants(text: string): Variant[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':')
      if (idx === -1) return { name: line, options: '' }
      return {
        name: line.slice(0, idx).trim(),
        options: line.slice(idx + 1).trim(),
      }
    })
}

export default function VendorGiftingProductFormPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const isEdit = Boolean(params.id)
  const { vendorId } = useAuth()

  const [form, setForm] = useState<Form>(emptyForm())
  const [categories, setCategories] = useState<ListingCategory[]>([])
  const [existingImages, setExistingImages] = useState<ListingImage[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  // Load categories
  useEffect(() => {
    db.categories.listByModule(MODULE_ID).then(({ data }) => {
      const cats = data ?? []
      setCategories(cats)
      setForm((f) => (f.categoryId ? f : { ...f, categoryId: cats[0]?.id ?? '' }))
    })
  }, [])

  // Load listing if editing
  const loadListing = useCallback(async () => {
    if (!params.id) return
    setLoading(true)
    const { data, error: loadErr } = await db.listings.getById(params.id)
    if (loadErr || !data) {
      setError(loadErr?.message ?? 'Listing not found.')
    } else {
      const l = data as ListingWithImages
      setForm(listingToForm(l))
      setExistingImages(l.listing_images ?? [])
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    loadListing()
  }, [loadListing])

  const toggleBranding = (opt: string) => {
    setForm((f) => ({
      ...f,
      brandingOptions: f.brandingOptions.includes(opt)
        ? f.brandingOptions.filter((x) => x !== opt)
        : [...f.brandingOptions, opt],
    }))
  }

  const addTier = () =>
    setForm((f) => ({
      ...f,
      bulkTiers: [...f.bulkTiers, { minQty: 1, maxQty: 10, price: 0 }],
    }))

  const updateTier = (i: number, patch: Partial<BulkTier>) =>
    setForm((f) => ({
      ...f,
      bulkTiers: f.bulkTiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }))

  const removeTier = (i: number) =>
    setForm((f) => ({ ...f, bulkTiers: f.bulkTiers.filter((_, idx) => idx !== i) }))

  const removeExistingImage = async (img: ListingImage) => {
    setExistingImages((prev) => prev.filter((x) => x.id !== img.id))
    await db.listings.deleteImage(img.id)
    await storageService.giftImages.delete([img.storage_path])
  }

  const validate = (): string => {
    if (!form.title.trim()) return 'Product name is required.'
    if (!form.categoryId) return 'Category is required.'
    if (form.pricingType === 'transparent') {
      const p = Number(form.basePrice)
      if (!p || p <= 0) return 'Base price is required for fixed pricing.'
    }
    const moq = Number(form.moq)
    if (!moq || moq < 1) return 'MOQ must be at least 1.'
    if (existingImages.length + imageFiles.length === 0) {
      return 'At least one product image is required.'
    }
    for (const t of form.bulkTiers) {
      if (t.minQty < 1 || t.maxQty < t.minQty || t.price <= 0) {
        return 'Bulk tiers: each row needs valid min/max qty and a positive price.'
      }
    }
    return ''
  }

  const handleSubmit = async (submitForReview: boolean) => {
    if (!vendorId) {
      setError('Vendor profile not found.')
      return
    }
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    setSubmitting(true)

    const metadata: GiftingMetadata = {
      moq: Number(form.moq),
      gstPercent: Number(form.gstPercent),
      bulkTiers: form.bulkTiers,
      variants: parseVariants(form.variantsText),
      brandingOptions: form.brandingOptions,
      leadTimeDays: Number(form.leadTimeDays),
      packagingType: form.packagingType,
      deliveryCities: form.deliveryCitiesText
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      outOfStock: form.outOfStock,
      inventory: form.inventory ? Number(form.inventory) : undefined,
    }

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
      price_unit: form.pricingType === 'transparent' ? ('flat' as const) : null,
      min_capacity: null,
      max_capacity: null,
      location_city: null,
      location_address: null,
      cancellation_policy: null,
      confirmation_sla_hours: 24,
      is_mogzu_direct: false,
      metadata: metadata as unknown as Record<string, unknown>,
    }

    let listingId = params.id ?? ''

    if (isEdit) {
      const nextStatus = submitForReview ? ('pending_approval' as const) : undefined
      const { error: updErr } = await db.listings.update(params.id!, {
        ...basePayload,
        ...(nextStatus ? { status: nextStatus } : {}),
      })
      if (updErr) {
        setError(updErr.message)
        setSubmitting(false)
        return
      }
    } else {
      const { data, error: insErr } = await db.listings.create({
        ...basePayload,
        status: submitForReview ? 'pending_approval' : 'draft',
      })
      if (insErr || !data) {
        setError(insErr?.message ?? 'Failed to create product.')
        setSubmitting(false)
        return
      }
      listingId = data.id
    }

    if (imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) =>
          storageService.giftImages.upload(vendorId, listingId, file),
        ),
      )
      const ok = uploads
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => !u.error)
      if (ok.length > 0) {
        const baseOrder = existingImages.length
        await db.listings.addImages(
          ok.map(({ u, i }) => ({
            listing_id: listingId,
            storage_path: u.path,
            display_order: baseOrder + i,
          })),
        )
      }
    }

    setSubmitting(false)
    setNotice(submitForReview ? 'Submitted for admin approval.' : 'Saved as draft.')
    navigate('/vendor/gifting')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0e1e3f]">
              {isEdit ? 'Edit gifting product' : 'New gifting product'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEdit
                ? 'Update details, pricing, variants, and images.'
                : 'Fill the catalogue details. Save draft or submit for review.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/vendor/gifting')}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            {notice}
          </p>
        )}

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Basic */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Basic info
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Product name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
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
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Packaging type
                </label>
                <select
                  value={form.packagingType}
                  onChange={(e) => set('packagingType', e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  {PACKAGING_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Images */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Images <span className="text-rose-500">*</span>
            </h2>
            {existingImages.length > 0 && (
              <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={storageService.giftImages.getUrl(img.storage_path)}
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
          </section>

          {/* Pricing */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Pricing & stock
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Pricing type
                </label>
                <select
                  value={form.pricingType}
                  onChange={(e) =>
                    set('pricingType', e.target.value as Listing['pricing_type'])
                  }
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="transparent">Fixed</option>
                  <option value="offer">Offer</option>
                  <option value="request_for_price">Request for price</option>
                </select>
              </div>
              {form.pricingType === 'transparent' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Price / unit (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.basePrice}
                    onChange={(e) => set('basePrice', e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  MOQ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.moq}
                  onChange={(e) => set('moq', e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  GST %
                </label>
                <select
                  value={form.gstPercent}
                  onChange={(e) => set('gstPercent', e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  {['0', '5', '12', '18', '28'].map((g) => (
                    <option key={g} value={g}>
                      {g}%
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Delivery SLA (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.leadTimeDays}
                  onChange={(e) => set('leadTimeDays', e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Inventory on hand
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.inventory}
                  onChange={(e) => set('inventory', e.target.value)}
                  placeholder="Low stock alert below 10"
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.outOfStock}
                onChange={(e) => set('outOfStock', e.target.checked)}
                className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20"
              />
              Mark as out of stock (pauses ordering without delisting)
            </label>
          </section>

          {/* Variants */}
          <section>
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
              Variants
            </h2>
            <p className="mb-2 text-xs text-slate-500">
              One per line: <code className="rounded bg-slate-100 px-1">Size: S, M, L, XL</code>
            </p>
            <textarea
              value={form.variantsText}
              onChange={(e) => set('variantsText', e.target.value)}
              rows={3}
              placeholder={'Size: S, M, L, XL\nColour: Navy, Black, Red'}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </section>

          {/* Bulk tiers */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Bulk pricing tiers
              </h2>
              <button
                type="button"
                onClick={addTier}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="size-3" /> Add tier
              </button>
            </div>
            {form.bulkTiers.length === 0 ? (
              <p className="text-xs text-slate-400">No tiers. Pricing per unit applies to all quantities.</p>
            ) : (
              <div className="space-y-2">
                {form.bulkTiers.map((t, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <input
                      type="number"
                      min="1"
                      value={t.minQty}
                      onChange={(e) => updateTier(i, { minQty: Number(e.target.value) })}
                      placeholder="Min"
                      className="col-span-3 h-9 rounded-md border border-slate-200 px-2 text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      value={t.maxQty}
                      onChange={(e) => updateTier(i, { maxQty: Number(e.target.value) })}
                      placeholder="Max"
                      className="col-span-3 h-9 rounded-md border border-slate-200 px-2 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={t.price}
                      onChange={(e) => updateTier(i, { price: Number(e.target.value) })}
                      placeholder="₹ / unit"
                      className="col-span-5 h-9 rounded-md border border-slate-200 px-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeTier(i)}
                      className="col-span-1 flex items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Branding + delivery coverage */}
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              Branding & coverage
            </h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {BRANDING_OPTIONS.map((opt) => {
                const active = form.brandingOptions.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleBranding(opt)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Delivery cities (comma-separated)
            </label>
            <input
              value={form.deliveryCitiesText}
              onChange={(e) => set('deliveryCitiesText', e.target.value)}
              placeholder="Bengaluru, Mumbai, Pune, Delhi NCR"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Orders outside these cities are blocked at checkout.
            </p>
          </section>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Submit for review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

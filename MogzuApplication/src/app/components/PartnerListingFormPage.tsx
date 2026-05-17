import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Listing, ModuleId, Partner } from '@/lib/database.types'

const MODULES: ModuleId[] = ['events', 'gifting', 'spacex_coworking', 'spacex_stay']
const PRICE_UNITS: NonNullable<Listing['price_unit']>[] = ['per_person', 'flat', 'per_hour', 'per_day']

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function PartnerListingFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const { profile, role } = useAuth()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [moduleId, setModuleId] = useState<ModuleId>('events')
  const [basePrice, setBasePrice] = useState('')
  const [priceUnit, setPriceUnit] = useState<NonNullable<Listing['price_unit']>>('flat')
  const [minCapacity, setMinCapacity] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data: p } = await db.partners.getByUserId(profile.id)
    if (!p) {
      setError('Partner record missing.')
      setLoading(false)
      return
    }
    setPartner(p as Partner)
    if (isEdit && id) {
      const { data: l, error: lErr } = await db.listings.getById(id)
      if (lErr || !l) {
        setError(lErr?.message ?? 'Listing not found.')
        setLoading(false)
        return
      }
      const listing = l as Listing
      if (listing.owner_partner_id !== p.id) {
        setError('You do not own this listing.')
        setLoading(false)
        return
      }
      setTitle(listing.title)
      setDescription(listing.description ?? '')
      setModuleId(listing.module)
      setBasePrice(listing.base_price != null ? String(listing.base_price) : '')
      setPriceUnit(listing.price_unit ?? 'flat')
      setMinCapacity(listing.min_capacity != null ? String(listing.min_capacity) : '')
      setMaxCapacity(listing.max_capacity != null ? String(listing.max_capacity) : '')
      setLocationCity(listing.location_city ?? '')
      setLocationAddress(listing.location_address ?? '')
      setCancellationPolicy(listing.cancellation_policy ?? '')
    }
    setLoading(false)
  }, [profile, isEdit, id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner) return
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      module: moduleId,
      category_id: null,
      status: 'pending_approval' as const,
      pricing_type: 'transparent' as const,
      base_price: basePrice ? Number(basePrice) : null,
      price_unit: priceUnit,
      min_capacity: minCapacity ? Number(minCapacity) : null,
      max_capacity: maxCapacity ? Number(maxCapacity) : null,
      location_city: locationCity.trim() || null,
      location_address: locationAddress.trim() || null,
      cancellation_policy: cancellationPolicy.trim() || null,
      confirmation_sla_hours: 24,
      is_mogzu_direct: false,
      metadata: {},
    }

    if (isEdit && id) {
      const { error: uErr } = await db.listings.update(id, payload)
      setSaving(false)
      if (uErr) {
        setError(uErr.message)
        return
      }
    } else {
      const { error: cErr } = await db.partnerListings.create(partner.id, payload)
      setSaving(false)
      if (cErr) {
        setError(cErr.message)
        return
      }
    }
    navigate('/partner/listings')
  }

  if (role !== 'partner' && role !== 'mogzu_admin') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Partner access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/partner/listings')}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-3.5" /> Listings
        </button>
        <span className="text-slate-300">·</span>
        <MogzuLogo className="h-7" />
        <h1 className="text-base font-semibold text-slate-900">
          {isEdit ? 'Edit listing' : 'New listing'}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Field label="Title *">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputClass} h-24 py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Module">
            <select
              className={inputClass}
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value as ModuleId)}
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price unit">
            <select
              className={inputClass}
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value as NonNullable<Listing['price_unit']>)}
            >
              {PRICE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Base price (₹)">
            <input
              type="number"
              className={inputClass}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              min="0"
            />
          </Field>
          <Field label="Location city">
            <input
              className={inputClass}
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
            />
          </Field>
          <Field label="Min capacity">
            <input
              type="number"
              className={inputClass}
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              min="0"
            />
          </Field>
          <Field label="Max capacity">
            <input
              type="number"
              className={inputClass}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              min="0"
            />
          </Field>
        </div>
        <Field label="Location address">
          <input
            className={inputClass}
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
          />
        </Field>
        <Field label="Cancellation policy">
          <textarea
            className={`${inputClass} h-16 py-2`}
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
          />
        </Field>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          New / edited listings enter Mogzu Admin approval. Revenue share rate from your partner
          agreement applies — not the standard vendor commission.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/partner/listings')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {isEdit ? 'Save changes' : 'Submit for approval'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

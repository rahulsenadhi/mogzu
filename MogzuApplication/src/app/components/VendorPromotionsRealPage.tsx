import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  Megaphone,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  Listing,
  Promotion,
  PromotionKind,
  PromotionStatus,
} from '@/lib/database.types'

const KIND_LABEL: Record<PromotionKind, string> = {
  percent_off: '% off',
  flat_off: 'Flat off',
  free_addon: 'Free add-on',
  paid_boost: 'Paid boost',
}

const STATUS_META: Record<PromotionStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  pending_payment: { label: 'Awaiting payment', className: 'bg-amber-100 text-amber-800' },
  pending_approval: { label: 'Pending approval', className: 'bg-blue-100 text-blue-700' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-700' },
  expired: { label: 'Expired', className: 'bg-slate-100 text-slate-500' },
}

type FormState = {
  kind: PromotionKind
  title: string
  description: string
  listingId: string
  value: string
  addOnName: string
  startsAt: string
  endsAt: string
  maxRedemptions: string
  paidBoostAmount: string
}

function emptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10)
  const inFortnight = new Date()
  inFortnight.setDate(inFortnight.getDate() + 14)
  return {
    kind: 'percent_off',
    title: '',
    description: '',
    listingId: '',
    value: '10',
    addOnName: '',
    startsAt: today,
    endsAt: inFortnight.toISOString().slice(0, 10),
    maxRedemptions: '',
    paidBoostAmount: '5000',
  }
}

export default function VendorPromotionsRealPage() {
  const { vendorId, profile } = useAuth()
  const [list, setList] = useState<(Promotion & { listings?: { title: string | null } })[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    const [pRes, lRes] = await Promise.all([
      db.promotions.listByVendor(vendorId),
      db.listings.listByVendor(vendorId),
    ])
    setList((pRes.data ?? []) as any)
    setListings((lRes.data ?? []) as Listing[])
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async () => {
    if (!vendorId || !profile) return
    if (!form.title.trim()) {
      setError('Title required.')
      return
    }
    setSubmitting(true)
    setError('')
    const isPaidBoost = form.kind === 'paid_boost'
    const { error: insErr } = await db.promotions.create({
      vendor_id: vendorId,
      listing_id: form.listingId || null,
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim() || null,
      value: form.kind === 'percent_off' || form.kind === 'flat_off' ? Number(form.value) : null,
      add_on_name: form.kind === 'free_addon' ? form.addOnName.trim() || null : null,
      starts_at: new Date(form.startsAt).toISOString(),
      ends_at: new Date(form.endsAt).toISOString(),
      max_redemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
      redemptions: 0,
      paid_boost_amount: isPaidBoost ? Number(form.paidBoostAmount) : null,
      paid_boost_payment_reference: null,
      status: isPaidBoost ? 'pending_payment' : 'pending_approval',
      rejection_reason: null,
      approved_by: null,
      approved_at: null,
    })
    setSubmitting(false)
    if (insErr) setError(insErr.message)
    else {
      setNotice(
        isPaidBoost
          ? 'Promotion drafted. Pay boost fee to send to admin approval.'
          : 'Promotion sent to admin approval.',
      )
      setShowForm(false)
      setForm(emptyForm())
      load()
    }
  }

  const handlePayBoost = async (p: Promotion) => {
    const ref = window.prompt('Razorpay payment id (stopgap):')
    if (!ref) return
    await db.promotions.setStatus(p.id, 'pending_approval')
    await db.promotions.setPaymentReference(p.id, ref)
    setNotice('Payment recorded. Sent to admin approval.')
    load()
  }

  if (!vendorId) {
    return (
      <VendorAppShell activeNav="promotions" routeSource="vendor-promotions-real">
        <main className="flex min-h-full items-center justify-center bg-transparent p-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
            <p className="text-sm text-amber-800">Vendor account required.</p>
          </div>
        </main>
      </VendorAppShell>
    )
  }

  return (
    <VendorAppShell activeNav="promotions" routeSource="vendor-promotions-real">
      <main className="min-h-full w-full bg-transparent">
        <section className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Megaphone className="size-5" />
                Promotions
              </h1>
              <p className="text-sm text-slate-500">
                Create % off, flat-off, free add-on, or paid-boost promotions. Admin approves
                before go-live.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm())
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <Plus className="size-4" />
              New promotion
            </button>
          </div>

          {notice && (
            <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {notice}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Sparkles className="mx-auto mb-2 size-10 text-slate-300" />
              <p className="text-sm text-slate-500">No promotions yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {KIND_LABEL[p.kind]}
                        {p.value != null ? ` · ${p.value}${p.kind === 'percent_off' ? '%' : '₹'}` : ''}
                        {p.add_on_name ? ` · ${p.add_on_name}` : ''} ·{' '}
                        {p.listings?.title ?? 'All listings'}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Valid {new Date(p.starts_at).toLocaleDateString('en-IN')} →{' '}
                        {new Date(p.ends_at).toLocaleDateString('en-IN')}
                        {p.max_redemptions != null && ` · ${p.redemptions}/${p.max_redemptions} used`}
                      </p>
                      {p.rejection_reason && (
                        <p className="mt-1 text-[11px] text-rose-700">
                          Rejected: {p.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_META[p.status].className}`}
                      >
                        {STATUS_META[p.status].label}
                      </span>
                      {p.status === 'pending_payment' && (
                        <button
                          type="button"
                          onClick={() => handlePayBoost(p)}
                          className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Pay boost ₹{p.paid_boost_amount?.toLocaleString('en-IN')}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">New promotion</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Diwali Special 20% off"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Kind
                  </label>
                  <select
                    value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value as PromotionKind })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    {(Object.keys(KIND_LABEL) as PromotionKind[]).map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Listing
                  </label>
                  <select
                    value={form.listingId}
                    onChange={(e) => setForm({ ...form, listingId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    <option value="">All my listings</option>
                    {listings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(form.kind === 'percent_off' || form.kind === 'flat_off') && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    {form.kind === 'percent_off' ? 'Percent off (%)' : 'Flat amount off (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              )}
              {form.kind === 'free_addon' && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Add-on name
                  </label>
                  <input
                    value={form.addOnName}
                    onChange={(e) => setForm({ ...form, addOnName: e.target.value })}
                    placeholder="e.g., Free welcome drink"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              )}
              {form.kind === 'paid_boost' && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Boost fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.paidBoostAmount}
                    onChange={(e) => setForm({ ...form, paidBoostAmount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                  <p className="mt-1 text-[11px] text-amber-700">
                    Boost goes to "Awaiting payment" until you pay (Razorpay stopgap).
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Starts
                  </label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ends
                  </label>
                  <input
                    type="date"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Max redemptions (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxRedemptions}
                  onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VendorAppShell>
  )
}

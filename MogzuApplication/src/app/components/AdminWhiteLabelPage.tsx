// Phase 5 Feature 4 — admin white-label partners console.

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  COMMERCIAL_MODELS,
  listPartners,
  setActive,
  slugify,
  upsertPartner,
  type CommercialModel,
  type WhiteLabelPartner,
} from '@/lib/whiteLabelPartners'

export default function AdminWhiteLabelPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [rows, setRows] = useState<WhiteLabelPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [model, setModel] = useState<CommercialModel>('revenue_share')
  const [revShare, setRevShare] = useState(15)
  const [flatFee, setFlatFee] = useState(0)
  const [perSeat, setPerSeat] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listPartners()
    setRows(data)
    if (err) setError(err)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !email.trim()) {
      setError('Business name and contact email are required.')
      return
    }
    const finalSlug = slug.trim() || slugify(businessName)
    const { error: err } = await upsertPartner({
      business_name: businessName.trim(),
      slug: finalSlug,
      contact_email: email.trim().toLowerCase(),
      commercial_model: model,
      revenue_share_pct: model === 'revenue_share' ? revShare : null,
      flat_fee_monthly: model === 'flat_infra_fee' ? flatFee : null,
      per_seat_fee: model === 'per_corporate_seat' ? perSeat : null,
    })
    if (err) setError(err)
    else {
      setBusinessName('')
      setSlug('')
      setEmail('')
      load()
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">mogzu_admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <AdminPageTitleRow
          title="White-label partners"
          totalLabel={loading ? 'Loading…' : `${rows.filter((r) => r.is_active).length} active`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Register / update partner</h2>
          <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Business name</span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Slug (URL key)</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder={slugify(businessName) || 'auto-from-name'}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Contact email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Commercial model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as CommercialModel)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {COMMERCIAL_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            {model === 'revenue_share' && (
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Revenue share %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={revShare}
                  onChange={(e) => setRevShare(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            )}
            {model === 'flat_infra_fee' && (
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Flat fee / month (INR)</span>
                <input
                  type="number"
                  min={0}
                  value={flatFee}
                  onChange={(e) => setFlatFee(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            )}
            {model === 'per_corporate_seat' && (
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Per-seat fee (INR)</span>
                <input
                  type="number"
                  min={0}
                  value={perSeat}
                  onChange={(e) => setPerSeat(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Save partner
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Partner</th>
                <th className="px-4 py-2 font-mono">Slug</th>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2 text-right">Rate</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-900">{p.business_name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-2 text-xs">{p.commercial_model}</td>
                  <td className="px-4 py-2 text-right text-xs">
                    {p.commercial_model === 'revenue_share' && `${p.revenue_share_pct ?? 0}%`}
                    {p.commercial_model === 'flat_infra_fee' && `₹${(p.flat_fee_monthly ?? 0).toLocaleString('en-IN')}/m`}
                    {p.commercial_model === 'per_corporate_seat' && `₹${(p.per_seat_fee ?? 0).toLocaleString('en-IN')}/seat`}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {p.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                        active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">
                        paused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        const { error: err } = await setActive(p.id, !p.is_active)
                        if (err) setError(err)
                        else load()
                      }}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      {p.is_active ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                    No partners registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

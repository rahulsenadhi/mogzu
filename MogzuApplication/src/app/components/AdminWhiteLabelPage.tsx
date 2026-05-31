// Phase 5 Feature 4 — admin white-label partners console.

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_MODULE_CONTAINER,
  MOGZU_PRODUCT_CARD,
  filterStatChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
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

const DEMO_PARTNERS: WhiteLabelPartner[] = [
  {
    id: 'demo-partner-1',
    slug: 'acme-events',
    business_name: 'Acme Events Co.',
    primary_color: '#2563eb',
    secondary_color: '#0e1e3f',
    logo_url: null,
    contact_email: 'partner@acme-events.com',
    contact_phone: '+91 98765 43210',
    commercial_model: 'revenue_share',
    revenue_share_pct: 18,
    flat_fee_monthly: null,
    per_seat_fee: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-partner-2',
    slug: 'globex-gifting',
    business_name: 'Globex Gifting',
    primary_color: '#7c3aed',
    secondary_color: '#1e1b4b',
    logo_url: null,
    contact_email: 'ops@globex.io',
    contact_phone: null,
    commercial_model: 'per_corporate_seat',
    revenue_share_pct: null,
    flat_fee_monthly: null,
    per_seat_fee: 299,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function AdminWhiteLabelPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [rows, setRows] = useState<WhiteLabelPartner[]>([])
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [model, setModel] = useState<CommercialModel>('revenue_share')
  const [revShare, setRevShare] = useState(15)
  const [flatFee, setFlatFee] = useState(0)
  const [perSeat, setPerSeat] = useState(0)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listPartners()
    if (data.length === 0 && !err) {
      setRows(DEMO_PARTNERS)
      setUsingDemo(true)
    } else {
      setRows(data)
      setUsingDemo(false)
    }
    if (err) setError(err)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !email.trim()) {
      setError('Business name and contact email are required.')
      return
    }
    if (usingDemo) {
      const finalSlug = slug.trim() || slugify(businessName)
      setRows((prev) => [
        {
          id: `demo-${Date.now()}`,
          slug: finalSlug,
          business_name: businessName.trim(),
          primary_color: '#2563eb',
          secondary_color: '#0e1e3f',
          logo_url: null,
          contact_email: email.trim().toLowerCase(),
          contact_phone: null,
          commercial_model: model,
          revenue_share_pct: model === 'revenue_share' ? revShare : null,
          flat_fee_monthly: model === 'flat_infra_fee' ? flatFee : null,
          per_seat_fee: model === 'per_corporate_seat' ? perSeat : null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ])
      setBusinessName('')
      setSlug('')
      setEmail('')
      return
    }
    const finalSlug = slug.trim() || slugify(businessName)
    setSaving(true)
    const { error: err } = await upsertPartner({
      business_name: businessName.trim(),
      slug: finalSlug,
      contact_email: email.trim().toLowerCase(),
      commercial_model: model,
      revenue_share_pct: model === 'revenue_share' ? revShare : null,
      flat_fee_monthly: model === 'flat_infra_fee' ? flatFee : null,
      per_seat_fee: model === 'per_corporate_seat' ? perSeat : null,
    })
    setSaving(false)
    if (err) setError(err)
    else {
      setBusinessName('')
      setSlug('')
      setEmail('')
      void load()
    }
  }

  const activeCount = rows.filter((r) => r.is_active).length

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">mogzu_admin role required.</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="White-label partners"
          totalLabel={loading ? 'Loading…' : `${activeCount} active`}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Register partners, set commercial terms, and configure branded subdomains.
        </p>
      </div>

      {usingDemo && (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-800">
          Showing demo partners — connect Supabase to persist registrations.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className={filterStatChipClass(true, 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">Total partners</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{rows.length}</p>
        </div>
        <div className={filterStatChipClass(activeCount > 0, 'emerald')}>
          <p className="text-xs uppercase tracking-wider text-emerald-700">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
      </section>

      <section className={MOGZU_FILTER_SIDEBAR}>
        <h2 className="text-base font-semibold text-[#0e1e3f]">Register / update partner</h2>
        <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Business name <span className="text-rose-600">*</span>
            </span>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={ADMIN_MODULE.input}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Slug (URL key)</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder={slugify(businessName) || 'auto-from-name'}
              className={`${ADMIN_MODULE.input} font-mono`}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Contact email <span className="text-rose-600">*</span>
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ADMIN_MODULE.input}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Commercial model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as CommercialModel)}
              className={ADMIN_MODULE.input}
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
                className={`${ADMIN_MODULE.input} tabular-nums`}
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
                className={`${ADMIN_MODULE.input} tabular-nums`}
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
                className={`${ADMIN_MODULE.input} tabular-nums`}
              />
            </label>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className={`${MOGZU_CTA_GRADIENT} inline-flex items-center justify-center gap-2 disabled:opacity-60`}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save partner'}
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60 bg-white/40 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3 font-mono">Slug</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-100/80 last:border-0 hover:bg-white/50">
                  <td className="px-4 py-3 font-semibold text-[#0e1e3f]">{p.business_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3 text-xs">{p.commercial_model}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums">
                    {p.commercial_model === 'revenue_share' && `${p.revenue_share_pct ?? 0}%`}
                    {p.commercial_model === 'flat_infra_fee' &&
                      `₹${(p.flat_fee_monthly ?? 0).toLocaleString('en-IN')}/m`}
                    {p.commercial_model === 'per_corporate_seat' &&
                      `₹${(p.per_seat_fee ?? 0).toLocaleString('en-IN')}/seat`}
                  </td>
                  <td className="px-4 py-3 text-xs">
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
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link
                        to={`/admin/white-label/${p.id}`}
                        aria-disabled={busyId === p.id}
                        className={`rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-xs text-slate-700 backdrop-blur-sm hover:border-[#93c5fd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 ${
                          busyId === p.id ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        Branding
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={async () => {
                          if (usingDemo) {
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === p.id ? { ...r, is_active: !r.is_active } : r,
                              ),
                            )
                            return
                          }
                          setBusyId(p.id)
                          const { error: err } = await setActive(p.id, !p.is_active)
                          setBusyId(null)
                          if (err) setError(err)
                          else void load()
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-xs text-slate-700 backdrop-blur-sm transition hover:border-[#93c5fd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60 disabled:opacity-60"
                      >
                        {busyId === p.id && <Loader2 className="size-3 animate-spin" />}
                        {busyId === p.id ? '…' : p.is_active ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">
                    No partners registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.slice(0, 2).map((p) => (
          <div key={`card-${p.id}`} className={`${MOGZU_PRODUCT_CARD} p-4`}>
            <p className="text-xs uppercase tracking-wider text-slate-500">Preview</p>
            <p className="mt-1 font-semibold text-[#0e1e3f]">{p.business_name}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{p.slug}.mogzu.app</p>
            <Link
              to={`/admin/white-label/${p.id}`}
              className="mt-3 inline-block text-xs font-semibold text-[#2563eb] hover:underline"
            >
              Open branding editor →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

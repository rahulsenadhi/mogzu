// Phase 5 Feature 4 — per-partner white-label detail + branding editor.

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AlertCircle, ExternalLink, Globe, Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_HERO_BANNER,
  MOGZU_MODULE_CONTAINER,
  MOGZU_PRODUCT_CARD,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import {
  COMMERCIAL_MODELS,
  getById,
  updatePartner,
  type CommercialModel,
  type WhiteLabelPartner,
} from '@/lib/whiteLabelPartners'

const DEFAULT_PRIMARY = '#2563eb'
const DEFAULT_SECONDARY = '#0e1e3f'

const DEMO_BY_ID: Record<string, WhiteLabelPartner> = {
  'demo-partner-1': {
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
  'demo-partner-2': {
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
}

function previewUrl(slug: string): string {
  return `https://${slug}.mogzu.app`
}

export default function AdminWhiteLabelDetailPage() {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [row, setRow] = useState<WhiteLabelPartner | null>(null)
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [businessName, setBusinessName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY)
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY)
  const [logoUrl, setLogoUrl] = useState('')
  const [model, setModel] = useState<CommercialModel>('revenue_share')
  const [revShare, setRevShare] = useState(15)
  const [flatFee, setFlatFee] = useState(0)
  const [perSeat, setPerSeat] = useState(0)

  const applyRow = useCallback((data: WhiteLabelPartner) => {
    setRow(data)
    setBusinessName(data.business_name)
    setContactEmail(data.contact_email)
    setContactPhone(data.contact_phone ?? '')
    setPrimary(data.primary_color || DEFAULT_PRIMARY)
    setSecondary(data.secondary_color || DEFAULT_SECONDARY)
    setLogoUrl(data.logo_url ?? '')
    setModel(data.commercial_model)
    setRevShare(data.revenue_share_pct ?? 15)
    setFlatFee(data.flat_fee_monthly ?? 0)
    setPerSeat(data.per_seat_fee ?? 0)
  }, [])

  const load = useCallback(async () => {
    if (!partnerId) return
    setLoading(true)
    setError('')
    const demo = DEMO_BY_ID[partnerId]
    if (demo) {
      applyRow(demo)
      setUsingDemo(true)
      setLoading(false)
      return
    }
    const { data, error: err } = await getById(partnerId)
    if (err) setError(err)
    if (data) {
      applyRow(data)
      setUsingDemo(false)
    }
    setLoading(false)
  }, [partnerId, applyRow])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const onSave = useCallback(async () => {
    if (!row) return
    if (usingDemo) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      return
    }
    setSaving(true)
    setError('')
    setSaved(false)
    const { error: err } = await updatePartner(row.id, {
      business_name: businessName.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      contact_phone: contactPhone.trim() || null,
      primary_color: primary,
      secondary_color: secondary,
      logo_url: logoUrl.trim() || null,
      commercial_model: model,
      revenue_share_pct: model === 'revenue_share' ? revShare : null,
      flat_fee_monthly: model === 'flat_infra_fee' ? flatFee : null,
      per_seat_fee: model === 'per_corporate_seat' ? perSeat : null,
    })
    setSaving(false)
    if (err) setError(err)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      void load()
    }
  }, [
    row,
    usingDemo,
    businessName,
    contactEmail,
    contactPhone,
    primary,
    secondary,
    logoUrl,
    model,
    revShare,
    flatFee,
    perSeat,
    load,
  ])

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <button
        type="button"
        onClick={() => navigate('/admin/white-label')}
        className="text-xs font-semibold text-[#2563eb] hover:underline"
      >
        ← Back to partners
      </button>

      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title={row?.business_name ?? 'White-label partner'}
          totalLabel={row ? (row.is_active ? 'Active' : 'Paused') : ''}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Branding editor with live subdomain preview.
        </p>
      </div>

      {usingDemo && (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-800">
          Demo partner — saves are preview-only until Supabase is connected.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : !row ? (
        <p className="py-16 text-center text-sm text-slate-500">Partner not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className={`${MOGZU_FILTER_SIDEBAR} space-y-4`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Branding</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-slate-700">Business name</span>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Contact email</span>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Contact phone</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-slate-700">Logo URL</span>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://cdn.example.com/logo.svg"
                  className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 font-mono text-sm backdrop-blur-sm"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Primary color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-white/70"
                  />
                  <input
                    type="text"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="flex-1 rounded-xl border border-white/70 bg-white/60 px-3 py-2 font-mono text-sm backdrop-blur-sm"
                  />
                </div>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Secondary color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-white/70"
                  />
                  <input
                    type="text"
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value)}
                    className="flex-1 rounded-xl border border-white/70 bg-white/60 px-3 py-2 font-mono text-sm backdrop-blur-sm"
                  />
                </div>
              </label>
            </div>

            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Commercial model</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Model</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as CommercialModel)}
                  className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
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
                    className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
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
                    className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
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
                    className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void onSave()}
                className={`inline-flex items-center gap-1.5 ${MOGZU_CTA_GRADIENT} disabled:opacity-60`}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save changes
              </button>
              {saved && <span className="text-xs font-medium text-emerald-700">Saved</span>}
            </div>
          </section>

          <section className="space-y-4">
            <div className={`${MOGZU_PRODUCT_CARD} p-4`}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Subdomain preview
              </p>
              <a
                href={previewUrl(row.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-xs font-mono text-slate-700 backdrop-blur-sm hover:border-[#93c5fd]"
              >
                <Globe className="size-3" /> {previewUrl(row.slug)}
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div
              className={`${MOGZU_HERO_BANNER} !mb-0 !h-auto min-h-[280px]`}
              style={{ '--brand-primary': primary, '--brand-secondary': secondary } as React.CSSProperties}
            >
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ background: secondary }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={businessName}
                    className="h-8 w-auto max-w-[120px] object-contain"
                  />
                ) : (
                  <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    LOGO
                  </span>
                )}
                <span className="text-sm font-semibold text-white">{businessName || 'Partner name'}</span>
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-xl font-bold" style={{ color: secondary }}>
                  Plan your next corporate event
                </h3>
                <p className="mb-4 text-sm text-slate-600">
                  Curated venues, gifting and stays — booked in minutes on your branded subdomain.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    style={{ background: primary }}
                  >
                    Get started
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border bg-white/60 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
                    style={{ borderColor: primary, color: primary }}
                  >
                    Browse catalog
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

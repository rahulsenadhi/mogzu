import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { CORP } from '@/app/lib/adminTheme'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Partner, PartnerAgreement } from '@/lib/database.types'

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function AdminPartnerAgreementPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [current, setCurrent] = useState<PartnerAgreement | null>(null)
  const [history, setHistory] = useState<PartnerAgreement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [referralPct, setReferralPct] = useState('10')
  const [resellPct, setResellPct] = useState('0')
  const [productPct, setProductPct] = useState('0')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [partnerRes, currentRes, historyRes] = await Promise.all([
      db.partners.getById(id),
      db.partnerAgreements.getCurrent(id),
      db.partnerAgreements.listHistory(id),
    ])
    if (partnerRes.error || !partnerRes.data) {
      setError(partnerRes.error?.message ?? 'Partner not found.')
      setLoading(false)
      return
    }
    setPartner(partnerRes.data as Partner)
    const cur = (currentRes.data as PartnerAgreement | null) ?? null
    setCurrent(cur)
    setHistory((historyRes.data ?? []) as PartnerAgreement[])
    if (cur) {
      setReferralPct(String(cur.referral_pct))
      setResellPct(String(cur.reseller_wholesale_pct))
      setProductPct(String(cur.product_revenue_share_pct))
      setExpiresAt(cur.expires_at ? cur.expires_at.slice(0, 10) : '')
      setNotes(cur.notes ?? '')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner || !profile) return
    setError('')
    setNotice('')

    const referral = Number(referralPct)
    const resell = Number(resellPct)
    const product = Number(productPct)
    if ([referral, resell, product].some((v) => Number.isNaN(v) || v < 0 || v > 100)) {
      setError('Each percentage must be between 0 and 100.')
      return
    }

    setSaving(true)
    const { error: insertError } = await db.partnerAgreements.create({
      partner_id: partner.id,
      referral_pct: referral,
      reseller_wholesale_pct: resell,
      product_revenue_share_pct: product,
      valid_from: new Date().toISOString(),
      expires_at: expiresAt ? new Date(`${expiresAt}T00:00:00`).toISOString() : null,
      configured_by: profile.id,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNotice('New agreement saved. Previous version archived.')
    await load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading...
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error || 'Partner not found.'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/partners')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-3.5" /> Back to partners
      </button>

      <AdminPageTitleRow title={`Agreement — ${partner.business_name || partner.full_name}`} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Current rates</h3>
        {current ? (
          <dl className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-4">
            <Stat label="Referral %" value={`${current.referral_pct}%`} />
            <Stat label="Reseller wholesale %" value={`${current.reseller_wholesale_pct}%`} />
            <Stat label="Product revenue share %" value={`${current.product_revenue_share_pct}%`} />
            <Stat label="Expires" value={fmtDate(current.expires_at)} />
          </dl>
        ) : (
          <p className="mt-2 text-xs text-slate-500">No agreement on file. Configure rates below.</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-slate-900">Update rates</h3>
        <p className="text-xs text-slate-500">
          Saving creates a new version. The previous agreement is preserved in history.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Referral %">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className={inputClass}
              value={referralPct}
              onChange={(e) => setReferralPct(e.target.value)}
            />
          </Field>
          <Field label="Reseller wholesale %">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className={inputClass}
              value={resellPct}
              onChange={(e) => setResellPct(e.target.value)}
            />
          </Field>
          <Field label="Product revenue share %">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className={inputClass}
              value={productPct}
              onChange={(e) => setProductPct(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Expires at (optional)">
          <input
            type="date"
            className={inputClass}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </Field>
        <Field label="Notes">
          <textarea
            className={`${inputClass} h-20 py-2`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes (visible to admin only)"
          />
        </Field>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: CORP.primary }}
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            Save new agreement
          </button>
        </div>
      </form>

      {history.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-100 p-4 text-sm font-semibold text-slate-900">History</h3>
          <ul className="divide-y divide-slate-100 text-xs text-slate-700">
            {history.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium text-slate-800">
                    {a.is_current ? 'Current' : 'Archived'} · referral {a.referral_pct}% ·
                    wholesale {a.reseller_wholesale_pct}% · product {a.product_revenue_share_pct}%
                  </p>
                  <p className="text-[11px] text-slate-500">
                    From {fmtDate(a.valid_from)} → {fmtDate(a.expires_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value}</dd>
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

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Loader2, Plus, ShieldAlert } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { CorporateAccount, ModuleId, Partner } from '@/lib/database.types'

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

const DEFAULT_MODULES: Record<ModuleId, boolean> = {
  events: true,
  gifting: false,
  spacex_coworking: false,
  spacex_stay: false,
}

export default function PartnerClientsPage() {
  const navigate = useNavigate()
  const { profile, role } = useAuth()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [clients, setClients] = useState<CorporateAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDomain, setFormDomain] = useState('')
  const [formPlan, setFormPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter')
  const [formNotice, setFormNotice] = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError('')
    const { data: p, error: pErr } = await db.partners.getByUserId(profile.id)
    if (pErr || !p) {
      setError(pErr?.message ?? 'No partner record found.')
      setLoading(false)
      return
    }
    setPartner(p as Partner)
    const { data: cs, error: cErr } = await db.partnerClients.listByPartner(p.id)
    if (cErr) {
      setError(cErr.message)
    } else {
      setClients((cs ?? []) as CorporateAccount[])
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner || !partner.referral_code) {
      setFormNotice('Your partner profile is missing a referral code.')
      return
    }
    if (!formName.trim()) {
      setFormNotice('Client name is required.')
      return
    }
    setSaving(true)
    setFormNotice('')
    const nowIso = new Date().toISOString()
    const { data, error: createError } = await db.corporateAccounts.create({
      name: formName.trim(),
      domain: formDomain.trim() || null,
      plan: formPlan,
      status: 'active',
      account_manager_id: null,
      modules_enabled: DEFAULT_MODULES,
      referred_by_partner_id: partner.id,
      referred_at: nowIso,
    })
    if (createError || !data) {
      setFormNotice(createError?.message ?? 'Failed to create client.')
      setSaving(false)
      return
    }
    // Capture the partner_referrals row so commission + dashboard work the
    // same as a self-service referral. If this fails the corporate is left
    // with referred_by_partner_id set but no lifecycle row — flag it loudly
    // so the partner / admin can repair, rather than silently dropping the
    // attribution that drives commission credit.
    const { error: refError } = await db.partnerReferrals.capture({
      partner_id: partner.id,
      referral_code: partner.referral_code,
      referred_corporate_id: data.id,
      signed_up_at: nowIso,
    })
    setSaving(false)
    if (refError) {
      setFormNotice(
        `Client created (${data.name}) but referral tracking failed: ${refError.message}. ` +
          'Contact admin to repair attribution before the first booking.',
      )
      setClients((prev) => [data, ...prev])
      return
    }
    setClients((prev) => [data, ...prev])
    setShowForm(false)
    setFormName('')
    setFormDomain('')
    setFormPlan('starter')
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

  if (error) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    )
  }

  // Use supabase directly here only to enable storage signed-out fallback in
  // dev; otherwise unused.
  void supabase

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/partner/dashboard')}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-3.5" /> Dashboard
        </button>
        <span className="text-slate-300">·</span>
        <MogzuLogo className="h-7" />
        <h1 className="text-base font-semibold text-slate-900">My Clients</h1>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {clients.length} client{clients.length === 1 ? '' : 's'} attached to{' '}
          {partner?.business_name || partner?.full_name}
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="size-3.5" />
          Onboard client
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Company name *</span>
              <input
                className={inputClass}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Domain</span>
              <input
                className={inputClass}
                value={formDomain}
                onChange={(e) => setFormDomain(e.target.value)}
                placeholder="acme.com"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Plan</span>
              <select
                className={inputClass}
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value as typeof formPlan)}
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
          </div>
          {formNotice && (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
              {formNotice}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="size-3 animate-spin" />}
              Create client
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {clients.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">
            No clients onboarded yet. Use the button above to add your first client.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Client</th>
                <th className="py-3 pr-3">Plan</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-4">Onboarded</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4 pr-3">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.domain ?? '—'}</p>
                  </td>
                  <td className="py-3 pr-3 capitalize text-slate-700">{c.plan}</td>
                  <td className="py-3 pr-3 capitalize text-slate-700">{c.status}</td>
                  <td className="py-3 pr-4 text-slate-500">
                    {c.referred_at ? new Date(c.referred_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

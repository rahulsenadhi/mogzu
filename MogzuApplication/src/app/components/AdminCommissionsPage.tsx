import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Plus, Trash2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Commission, ModuleId, Vendor } from '@/lib/database.types'

type CommissionWithVendor = Commission & {
  vendors: Pick<Vendor, 'business_name'> | null
}

type Scope = Commission['scope']

type FormState = {
  scope: Scope
  vendorId: string
  module: ModuleId | ''
  ratePct: string
  effectiveFrom: string
}

const MODULE_LABELS: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'Coworking',
  spacex_stay: 'Stay',
}

const ALL_MODULES: ModuleId[] = ['events', 'gifting', 'spacex_coworking', 'spacex_stay']

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return {
    scope: 'global',
    vendorId: '',
    module: '',
    ratePct: '15',
    effectiveFrom: todayIso(),
  }
}

function ratePreview(ratePct: number): { fee: number; vendor: number } {
  const fee = Math.round(1000 * (ratePct / 100))
  return { fee, vendor: 1000 - fee }
}

function scopeLabel(c: Commission, vendorName: string | null | undefined): string {
  if (c.scope === 'global') return 'Global'
  if (c.scope === 'vendor') return `Vendor: ${vendorName ?? c.vendor_id?.slice(0, 8) ?? '—'}`
  if (c.scope === 'module') return `Module: ${MODULE_LABELS[c.module as ModuleId] ?? c.module}`
  return `Category: ${c.category_id?.slice(0, 8) ?? '—'}`
}

function downloadCsv(rows: CommissionWithVendor[]) {
  const header = [
    'id',
    'scope',
    'vendor',
    'module',
    'rate_pct',
    'effective_from',
    'is_active',
    'created_at',
  ]
  const lines = rows.map((r) =>
    [
      r.id,
      r.scope,
      r.vendors?.business_name ?? r.vendor_id ?? '',
      r.module ?? '',
      (r.rate * 100).toFixed(2),
      r.effective_from,
      r.is_active ? 'true' : 'false',
      r.created_at,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `commissions-${todayIso()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminCommissionsPage() {
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [commissions, setCommissions] = useState<CommissionWithVendor[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [notice, setNotice] = useState('')

  // Date filter for export
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [cRes, vRes] = await Promise.all([db.commissions.list(), db.vendors.listActive()])
    if (cRes.error) setLoadError(cRes.error.message)
    else setCommissions((cRes.data ?? []) as CommissionWithVendor[])
    setVendors((vRes.data ?? []) as Vendor[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validate = (): string => {
    if (form.scope === 'vendor' && !form.vendorId) return 'Vendor is required.'
    if (form.scope === 'module' && !form.module) return 'Module is required.'
    const r = Number(form.ratePct)
    if (Number.isNaN(r) || r < 0 || r > 50) return 'Rate must be between 0 and 50%.'
    if (!form.effectiveFrom) return 'Effective date is required.'
    return ''
  }

  const handleSubmit = async () => {
    if (!profile) return
    const err = validate()
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitError('')
    setSubmitting(true)

    const { error } = await db.commissions.create({
      scope: form.scope,
      vendor_id: form.scope === 'vendor' ? form.vendorId : null,
      module: form.scope === 'module' ? (form.module as ModuleId) : null,
      category_id: null,
      rate: Number(form.ratePct) / 100,
      is_active: true,
      effective_from: form.effectiveFrom,
      created_by: profile.id,
    })

    setSubmitting(false)
    if (error) {
      setSubmitError(error.message)
      return
    }
    setNotice('Commission rule added. Applies to bookings created from now on.')
    setShowForm(false)
    setForm(emptyForm())
    loadAll()
  }

  const handleDeactivate = async (c: Commission) => {
    if (!window.confirm('Deactivate this commission rule?')) return
    const { error } = await db.commissions.deactivate(c.id)
    if (error) setNotice(`Failed: ${error.message}`)
    else {
      setNotice('Rule deactivated. Existing bookings unaffected.')
      loadAll()
    }
  }

  const filteredForExport = useMemo(() => {
    if (!periodFrom && !periodTo) return commissions
    const fromMs = periodFrom ? new Date(periodFrom).getTime() : -Infinity
    const toMs = periodTo ? new Date(periodTo).getTime() + 86_400_000 : Infinity
    return commissions.filter((c) => {
      const ms = new Date(c.created_at).getTime()
      return ms >= fromMs && ms <= toMs
    })
  }, [commissions, periodFrom, periodTo])

  const preview = ratePreview(Number(form.ratePct) || 0)

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-800">Mogzu admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Commission rates"
          subtitle="Set platform commission per global default, vendor, or module. Rate at time of booking is snapshotted onto each booking."
        />

        {notice && (
          <p
            role="status"
            className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
          >
            {notice}
          </p>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                From
              </label>
              <input
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                To
              </label>
              <input
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => downloadCsv(filteredForExport)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm())
              setSubmitError('')
              setShowForm(true)
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            New rule
          </button>
        </div>

        {loadError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={loadAll}
              className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No commission rules configured yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Effective from</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {scopeLabel(c, c.vendors?.business_name)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2563EB]">
                      {(c.rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.effective_from}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {c.is_active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.is_active && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(c)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Deactivate"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">New commission rule</h2>
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
                  Scope
                </label>
                <select
                  value={form.scope}
                  onChange={(e) => set('scope', e.target.value as Scope)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="global">Global default</option>
                  <option value="vendor">Specific vendor</option>
                  <option value="module">Module</option>
                </select>
              </div>

              {form.scope === 'vendor' && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Vendor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.vendorId}
                    onChange={(e) => set('vendorId', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.scope === 'module' && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Module <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.module}
                    onChange={(e) => set('module', e.target.value as ModuleId | '')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    <option value="">Select module</option>
                    {ALL_MODULES.map((m) => (
                      <option key={m} value={m}>
                        {MODULE_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={form.ratePct}
                    onChange={(e) => set('ratePct', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Effective from
                  </label>
                  <input
                    type="date"
                    value={form.effectiveFrom}
                    onChange={(e) => set('effectiveFrom', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  On a ₹1,000 booking, platform earns{' '}
                  <strong>₹{preview.fee.toLocaleString('en-IN')}</strong>, vendor receives{' '}
                  <strong>₹{preview.vendor.toLocaleString('en-IN')}</strong>.
                </p>
              </div>

              {submitError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {submitError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
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
                  Save rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

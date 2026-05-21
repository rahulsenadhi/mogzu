import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Cake,
  Calendar as CalIcon,
  Gift,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  GiftingRule,
  GiftingTriggerKind,
  Vendor,
} from '@/lib/database.types'

type FormState = {
  occasionName: string
  triggerKind: GiftingTriggerKind
  triggerDate: string
  budget: string
  requiresApproval: boolean
  scope: 'company' | 'department'
  scopeValue: string
  preferredVendorIds: string[]
}

const TRIGGER_LABEL: Record<GiftingTriggerKind, { label: string; Icon: typeof Cake }> = {
  fixed_date: { label: 'Fixed date', Icon: CalIcon },
  birthday: { label: 'Birthday', Icon: Cake },
  work_anniversary: { label: 'Work anniversary', Icon: TrendingUp },
  manual: { label: 'Manual trigger', Icon: Gift },
}

function emptyForm(): FormState {
  return {
    occasionName: '',
    triggerKind: 'fixed_date',
    triggerDate: '',
    budget: '2000',
    requiresApproval: false,
    scope: 'company',
    scopeValue: '',
    preferredVendorIds: [],
  }
}

export default function CorporateGiftingProgrammePage() {
  const navigate = useNavigate()
  const { corporateId, role } = useAuth()
  const canManage = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rules, setRules] = useState<GiftingRule[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    setLoadError('')
    const [rRes, vRes] = await Promise.all([
      db.giftingRules.listByCorporate(corporateId),
      db.vendors.listActive(),
    ])
    if (rRes.error) setLoadError(rRes.error.message)
    else setRules((rRes.data ?? []) as GiftingRule[])
    setVendors((vRes.data ?? []) as Vendor[])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm())
    setSubmitError('')
    setShowForm(true)
  }

  const openEdit = (r: GiftingRule) => {
    setEditingId(r.id)
    setForm({
      occasionName: r.occasion_name,
      triggerKind: r.trigger_kind,
      triggerDate: r.trigger_date ?? '',
      budget: String(r.budget_per_recipient),
      requiresApproval: r.requires_approval,
      scope: r.scope,
      scopeValue: r.scope_value ?? '',
      preferredVendorIds: r.preferred_vendor_ids ?? [],
    })
    setSubmitError('')
    setShowForm(true)
  }

  const validate = (): string => {
    if (!form.occasionName.trim()) return 'Occasion name is required.'
    if (form.triggerKind === 'fixed_date' && !form.triggerDate) {
      return 'Fixed-date occasions need a date.'
    }
    const b = Number(form.budget)
    if (!b || b <= 0) return 'Budget must be positive.'
    if (form.scope === 'department' && !form.scopeValue.trim()) {
      return 'Department-scoped rules need a department name.'
    }
    return ''
  }

  const handleSubmit = async () => {
    if (!corporateId) return
    const err = validate()
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitError('')
    setSubmitting(true)

    const payload = {
      corporate_id: corporateId,
      occasion_name: form.occasionName.trim(),
      trigger_kind: form.triggerKind,
      trigger_date: form.triggerKind === 'fixed_date' ? form.triggerDate : null,
      budget_per_recipient: Number(form.budget),
      requires_approval: form.requiresApproval,
      scope: form.scope,
      scope_value: form.scope === 'department' ? form.scopeValue.trim() : null,
      preferred_vendor_ids: form.preferredVendorIds,
      is_active: true,
    }

    const { error } = editingId
      ? await db.giftingRules.update(editingId, payload)
      : await db.giftingRules.create(payload)

    setSubmitting(false)
    if (error) {
      setSubmitError(error.message)
      return
    }
    setShowForm(false)
    setNotice(editingId ? 'Rule updated.' : 'Rule added.')
    load()
  }

  const handleDeactivate = async (r: GiftingRule) => {
    if (!window.confirm(`Deactivate rule "${r.occasion_name}"?`)) return
    const { error } = await db.giftingRules.deactivate(r.id)
    if (error) setNotice(`Failed: ${error.message}`)
    else {
      setNotice('Rule deactivated. Existing gifts unaffected.')
      load()
    }
  }

  const vendorById = useMemo(
    () => Object.fromEntries(vendors.map((v) => [v.id, v])),
    [vendors],
  )

  const togglePreferredVendor = (vendorId: string) => {
    setForm((f) => ({
      ...f,
      preferredVendorIds: f.preferredVendorIds.includes(vendorId)
        ? f.preferredVendorIds.filter((x) => x !== vendorId)
        : [...f.preferredVendorIds, vendorId],
    }))
  }

  if (!canManage) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">L3 Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="gifting"
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0e1e3f]">Gifting programme</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Define gifting rules: occasion, budget per recipient, auto-approve, and
                  preferred vendors. Employees see rules apply automatically when sending gifts.
                </p>
              </div>
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="size-4" /> New rule
              </button>
            </div>

            {notice && (
              <p
                role="status"
                className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
              >
                {notice}
              </p>
            )}

            {loadError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{loadError}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : rules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Gift className="mx-auto mb-3 size-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No gifting rules yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Add a rule to enable employees to send gifts for birthdays, anniversaries, or
                  fixed occasions like Diwali.
                </p>
                <button
                  type="button"
                  onClick={openNew}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="size-4" /> Create first rule
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {rules.map((r) => {
                  const meta = TRIGGER_LABEL[r.trigger_kind]
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
                        <meta.Icon className="size-5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-[#0e1e3f]">
                            {r.occasion_name}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {meta.label}
                            {r.trigger_kind === 'fixed_date' && r.trigger_date
                              ? ` · ${r.trigger_date}`
                              : ''}
                          </span>
                          {!r.is_active && (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          ₹ {r.budget_per_recipient.toLocaleString('en-IN')} per recipient ·{' '}
                          {r.requires_approval ? 'Manager approval' : 'Auto-approve'}
                          {r.scope === 'department' ? ` · Dept: ${r.scope_value}` : ' · Company-wide'}
                        </p>
                        {r.preferred_vendor_ids && r.preferred_vendor_ids.length > 0 && (
                          <p className="text-[11px] text-slate-500">
                            Preferred vendors:{' '}
                            {r.preferred_vendor_ids
                              .map((v) => vendorById[v]?.business_name ?? v.slice(0, 8))
                              .join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        {r.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(r)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Deactivate"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit rule' : 'New gifting rule'}
              </h2>
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
                  Occasion name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.occasionName}
                  onChange={(e) => set('occasionName', e.target.value)}
                  placeholder="e.g., Diwali, Birthday, 5-year anniversary"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Trigger
                  </label>
                  <select
                    value={form.triggerKind}
                    onChange={(e) =>
                      set('triggerKind', e.target.value as GiftingTriggerKind)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    {(Object.keys(TRIGGER_LABEL) as GiftingTriggerKind[]).map((k) => (
                      <option key={k} value={k}>
                        {TRIGGER_LABEL[k].label}
                      </option>
                    ))}
                  </select>
                </div>
                {form.triggerKind === 'fixed_date' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.triggerDate}
                      onChange={(e) => set('triggerDate', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Budget / recipient (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.budget}
                    onChange={(e) => set('budget', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Approval
                  </label>
                  <select
                    value={form.requiresApproval ? 'manager' : 'auto'}
                    onChange={(e) =>
                      set('requiresApproval', e.target.value === 'manager')
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    <option value="auto">Auto-approve</option>
                    <option value="manager">Manager approval</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Scope
                  </label>
                  <select
                    value={form.scope}
                    onChange={(e) => set('scope', e.target.value as 'company' | 'department')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    <option value="company">Company-wide</option>
                    <option value="department">Specific department</option>
                  </select>
                </div>
                {form.scope === 'department' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.scopeValue}
                      onChange={(e) => set('scopeValue', e.target.value)}
                      placeholder="e.g., Engineering"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Preferred vendors (optional)
                </label>
                {vendors.length === 0 ? (
                  <p className="text-xs text-slate-400">No active vendors yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {vendors.map((v) => {
                      const active = form.preferredVendorIds.includes(v.id)
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => togglePreferredVendor(v.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            active
                              ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {v.business_name}
                        </button>
                      )
                    })}
                  </div>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  Employees see only these vendors' products for this occasion. Leave empty to
                  allow all approved gifting products.
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
                  {editingId ? 'Save changes' : 'Add rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

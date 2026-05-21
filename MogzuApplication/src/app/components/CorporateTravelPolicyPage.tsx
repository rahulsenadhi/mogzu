import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Loader2, Plane, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { TravelPolicy } from '@/lib/database.types'

type FormState = {
  name: string
  roleTier: TravelPolicy['role_tier']
  module: TravelPolicy['module']
  maxNightlyRate: string
  approvedCitiesText: string
  minLeadDays: string
}

const ROLE_TIER_LABEL: Record<TravelPolicy['role_tier'], string> = {
  l1_employee: 'L1 Employee',
  l2_manager: 'L2 Manager',
  l3_admin: 'L3 Admin',
  all: 'All roles',
}

function emptyForm(): FormState {
  return {
    name: '',
    roleTier: 'l1_employee',
    module: 'spacex_stay',
    maxNightlyRate: '3000',
    approvedCitiesText: '',
    minLeadDays: '2',
  }
}

export default function CorporateTravelPolicyPage() {
  const navigate = useNavigate()
  const { corporateId, role } = useAuth()
  const canManage = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [policies, setPolicies] = useState<TravelPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    const { data } = await db.travelPolicies.listByCorporate(corporateId)
    setPolicies((data ?? []) as TravelPolicy[])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm())
    setSubmitError('')
    setShowForm(true)
  }

  const openEdit = (p: TravelPolicy) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      roleTier: p.role_tier,
      module: p.module,
      maxNightlyRate: String(p.max_nightly_rate),
      approvedCitiesText: (p.approved_cities ?? []).join(', '),
      minLeadDays: String(p.min_lead_days),
    })
    setSubmitError('')
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!corporateId) return
    if (!form.name.trim()) {
      setSubmitError('Name required.')
      return
    }
    const rate = Number(form.maxNightlyRate)
    if (!rate || rate <= 0) {
      setSubmitError('Max nightly rate must be positive.')
      return
    }
    const lead = Number(form.minLeadDays)
    if (Number.isNaN(lead) || lead < 0) {
      setSubmitError('Lead days must be non-negative.')
      return
    }
    setSubmitting(true)
    setSubmitError('')

    const payload = {
      corporate_id: corporateId,
      name: form.name.trim(),
      role_tier: form.roleTier,
      module: form.module,
      max_nightly_rate: rate,
      approved_cities: form.approvedCitiesText
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      min_lead_days: lead,
      is_active: true,
    }

    const { error } = editingId
      ? await db.travelPolicies.update(editingId, payload)
      : await db.travelPolicies.create(payload)
    setSubmitting(false)
    if (error) setSubmitError(error.message)
    else {
      setShowForm(false)
      setNotice(editingId ? 'Policy updated.' : 'Policy added.')
      load()
    }
  }

  const handleDeactivate = async (p: TravelPolicy) => {
    if (!window.confirm(`Deactivate policy "${p.name}"?`)) return
    const { error } = await db.travelPolicies.deactivate(p.id)
    if (error) setNotice(`Failed: ${error.message}`)
    else {
      setNotice('Policy deactivated.')
      load()
    }
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
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12">
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
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <Plane className="size-5" />
                  Travel & space policy
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Per-role caps on nightly rate, approved cities, and minimum booking lead time.
                  Enforced at stay and coworking search.
                </p>
              </div>
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="size-4" />
                New policy
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

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : policies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Plane className="mx-auto mb-2 size-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No policies yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Without a policy, all stay/coworking listings show without flag.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {policies.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-slate-900">
                          {p.name}
                          {!p.is_active && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              Inactive
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {ROLE_TIER_LABEL[p.role_tier]} · {p.module.replace('_', ' ')} · Max ₹
                          {p.max_nightly_rate.toLocaleString('en-IN')} / night · Lead{' '}
                          {p.min_lead_days}d
                        </p>
                        {p.approved_cities && p.approved_cities.length > 0 && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            Cities: {p.approved_cities.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        {p.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(p)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
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
                {editingId ? 'Edit policy' : 'New travel policy'}
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
                  Policy name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Standard L1 travel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Role tier
                  </label>
                  <select
                    value={form.roleTier}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, roleTier: e.target.value as FormState['roleTier'] }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    {(Object.keys(ROLE_TIER_LABEL) as FormState['roleTier'][]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_TIER_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Module
                  </label>
                  <select
                    value={form.module}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, module: e.target.value as FormState['module'] }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  >
                    <option value="spacex_stay">Stay</option>
                    <option value="spacex_coworking">Coworking</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Max nightly rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.maxNightlyRate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxNightlyRate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Min lead days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minLeadDays}
                    onChange={(e) => setForm((f) => ({ ...f, minLeadDays: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Approved cities (comma-separated, empty = any)
                </label>
                <input
                  value={form.approvedCitiesText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, approvedCitiesText: e.target.value }))
                  }
                  placeholder="Mumbai, Bengaluru, Delhi NCR, Pune"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              {submitError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {submitError}
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
                  {editingId ? 'Save' : 'Add policy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

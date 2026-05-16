import { useEffect, useMemo, useState } from 'react'
import { Plus, DollarSign, TrendingUp, Shield, AlertTriangle, Trash2, X } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth, canManageBudgets } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscribeToTable } from '@/lib/realtime'
import type { BudgetRule, ModuleId, Wallet } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Scope = BudgetRule['scope']
type Period = BudgetRule['period']

type CreateForm = {
  scope: Scope
  scope_value: string
  module: ModuleId | ''
  amount: string
  period: Period
  alert_threshold_pct: string
  requires_approval: boolean
  auto_approve_below: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'D Space – Coworking',
  spacex_stay: 'D Space – Stay',
}

const PERIOD_LABELS: Record<Period, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
}

const SCOPE_LABELS: Record<Scope, string> = {
  company: 'Company-wide',
  department: 'Department',
  individual: 'Individual',
}

function emptyForm(): CreateForm {
  return {
    scope: 'company',
    scope_value: '',
    module: '',
    amount: '',
    period: 'monthly',
    alert_threshold_pct: '80',
    requires_approval: true,
    auto_approve_below: '',
  }
}

function formatINR(n: number) {
  return `₹ ${n.toLocaleString('en-IN')}`
}

// ─── Create Rule Modal ────────────────────────────────────────────────────────

function CreateRuleModal({
  onClose,
  onSave,
  saving,
  error,
}: {
  onClose: () => void
  onSave: (form: CreateForm) => Promise<void>
  saving: boolean
  error: string
}) {
  const [form, setForm] = useState<CreateForm>(emptyForm())
  const [validationError, setValidationError] = useState('')

  const set = <K extends keyof CreateForm>(key: K, val: CreateForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) {
      setValidationError('Amount must be greater than 0.')
      return
    }
    if (form.scope !== 'company' && !form.scope_value.trim()) {
      setValidationError('Scope value is required for department or individual rules.')
      return
    }
    const alertPct = Number(form.alert_threshold_pct)
    if (Number.isNaN(alertPct) || alertPct <= 0 || alertPct > 100) {
      setValidationError('Alert threshold must be between 1 and 100.')
      return
    }
    setValidationError('')
    await onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Create budget rule</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Scope</label>
              <select
                value={form.scope}
                onChange={(e) => set('scope', e.target.value as Scope)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="company">Company-wide</option>
                <option value="department">Department</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {form.scope === 'department' ? 'Department name' : form.scope === 'individual' ? 'Employee email' : 'Scope value'}
              </label>
              <input
                type="text"
                value={form.scope_value}
                onChange={(e) => set('scope_value', e.target.value)}
                disabled={form.scope === 'company'}
                placeholder={form.scope === 'company' ? '— company-wide —' : form.scope === 'department' ? 'e.g. Marketing' : 'employee@company.com'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Module</label>
              <select
                value={form.module}
                onChange={(e) => set('module', e.target.value as ModuleId | '')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="">All modules</option>
                {(Object.keys(MODULE_LABELS) as ModuleId[]).map((m) => (
                  <option key={m} value={m}>{MODULE_LABELS[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Period</label>
              <select
                value={form.period}
                onChange={(e) => set('period', e.target.value as Period)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder="e.g. 500000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Alert at (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.alert_threshold_pct}
                onChange={(e) => set('alert_threshold_pct', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                id="requires_approval"
                checked={form.requires_approval}
                onChange={(e) => set('requires_approval', e.target.checked)}
                className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
              <label htmlFor="requires_approval" className="cursor-pointer text-sm font-medium text-slate-800">
                Require approval
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Auto-approve below (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.auto_approve_below}
                onChange={(e) => set('auto_approve_below', e.target.value)}
                placeholder="optional"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>

          {(validationError || error) && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {validationError || error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Rule Row ─────────────────────────────────────────────────────────────────

function RuleRow({
  rule,
  onDeactivate,
  deactivating,
}: {
  rule: BudgetRule
  onDeactivate: (id: string) => void
  deactivating: boolean
}) {
  const alertColor =
    rule.alert_threshold_pct >= 90
      ? 'text-rose-600'
      : rule.alert_threshold_pct >= 75
      ? 'text-amber-600'
      : 'text-slate-600'

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60">
      <td className="py-3 pl-6 pr-4">
        <div className="text-sm font-medium text-slate-900">{SCOPE_LABELS[rule.scope]}</div>
        {rule.scope_value && (
          <div className="text-xs text-slate-500">{rule.scope_value}</div>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-slate-600">
        {rule.module ? MODULE_LABELS[rule.module] : <span className="text-slate-400">All modules</span>}
      </td>
      <td className="py-3 pr-4">
        <span className="text-sm font-semibold text-slate-900">{formatINR(rule.amount)}</span>
      </td>
      <td className="py-3 pr-4">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {PERIOD_LABELS[rule.period]}
        </span>
      </td>
      <td className={`py-3 pr-4 text-sm font-medium ${alertColor}`}>
        {rule.alert_threshold_pct}%
      </td>
      <td className="py-3 pr-4 text-sm">
        {rule.requires_approval ? (
          <span className="inline-flex items-center gap-1 text-amber-700">
            <Shield className="size-3.5" />
            Required
            {rule.auto_approve_below && (
              <span className="text-slate-500">
                {' '}(auto ≤ {formatINR(rule.auto_approve_below)})
              </span>
            )}
          </span>
        ) : (
          <span className="text-slate-400">Auto-approved</span>
        )}
      </td>
      <td className="py-3 pr-6 text-right">
        <button
          type="button"
          disabled={deactivating}
          onClick={() => onDeactivate(rule.id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
          title="Deactivate rule"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CorporateBudgetPage() {
  const { corporateId, role } = useAuth()
  const canManage = canManageBudgets(role)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rules, setRules] = useState<BudgetRule[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  // Load
  const load = async () => {
    if (!corporateId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setLoadError('')
    const [rulesRes, walletRes] = await Promise.all([
      db.budgets.listByCorporate(corporateId),
      db.wallet.getByCorporate(corporateId),
    ])
    if (rulesRes.error) {
      setLoadError(rulesRes.error.message)
    } else {
      setRules(rulesRes.data ?? [])
    }
    if (!walletRes.error && walletRes.data) {
      setWallet(walletRes.data)
    }
    setIsLoading(false)
  }

  useEffect(() => { load() }, [corporateId])

  // Realtime: wallet balance updates
  useEffect(() => {
    if (!corporateId) return
    return subscribeToTable<Wallet>(`budget-wallet-${corporateId}`, {
      table: 'wallets',
      event: 'UPDATE',
      filter: `corporate_id=eq.${corporateId}`,
      onData: (payload) => {
        if (payload.new) setWallet(payload.new as Wallet)
      },
    })
  }, [corporateId])

  // Realtime: budget_rules changes
  useEffect(() => {
    if (!corporateId) return
    return subscribeToTable<BudgetRule>(`budget-rules-${corporateId}`, {
      table: 'budget_rules',
      filter: `corporate_id=eq.${corporateId}`,
      onData: () => {
        // Reload rules on any change
        db.budgets.listByCorporate(corporateId).then(({ data }) => {
          if (data) setRules(data)
        })
      },
    })
  }, [corporateId])

  // Overview metrics
  const overview = useMemo(() => {
    const totalAllocated = rules.reduce((s, r) => s + r.amount, 0)
    const approvalRequired = rules.filter((r) => r.requires_approval).length
    const alertRules = rules.filter((r) => r.alert_threshold_pct >= 90).length
    return { totalAllocated, approvalRequired, alertRules, ruleCount: rules.length }
  }, [rules])

  // Create handler
  const handleCreate = async (form: CreateForm) => {
    if (!corporateId) return
    setCreateSaving(true)
    setCreateError('')
    const { data, error } = await db.budgets.create({
      corporate_id: corporateId,
      scope: form.scope,
      scope_value: form.scope === 'company' ? null : form.scope_value.trim() || null,
      module: (form.module as ModuleId) || null,
      amount: Number(form.amount),
      period: form.period,
      alert_threshold_pct: Number(form.alert_threshold_pct),
      requires_approval: form.requires_approval,
      auto_approve_below: form.auto_approve_below ? Number(form.auto_approve_below) : null,
      is_active: true,
    })
    if (error) {
      setCreateError(error.message)
    } else if (data) {
      setRules((prev) => [...prev, data])
      setCreateOpen(false)
    }
    setCreateSaving(false)
  }

  // Deactivate handler
  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id)
    const { error } = await db.budgets.deactivate(id)
    if (!error) {
      setRules((prev) => prev.filter((r) => r.id !== id))
    }
    setDeactivatingId(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activeNav="budget"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed((c) => !c)}
          searchPlaceholder="Search budgets…"
        />

        <MogzuCorporateScrollSurface>
          <div className="mx-auto max-w-[1400px] px-8 py-6">
            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-[32px] font-semibold leading-10 text-[#0e1e3f]">Budget Management</h1>
                <p className="mt-1 text-sm text-[#878e9e]">
                  Define and manage budget rules for your organisation's Mogzu spend.
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => { setCreateError(''); setCreateOpen(true) }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1d4ed8]"
                >
                  <Plus className="size-4" />
                  Add budget rule
                </button>
              )}
            </div>

            {/* Load error */}
            {loadError && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-700">{loadError}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-2 rounded-md border border-gray-300 px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Overview cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <DollarSign className="size-5 text-[#2563eb]" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Allocated</h3>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : formatINR(overview.totalAllocated)}
                </span>
                <p className="mt-1 text-xs text-gray-400">across {overview.ruleCount} active rule{overview.ruleCount !== 1 ? 's' : ''}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <TrendingUp className="size-5 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Wallet Balance</h3>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : wallet ? formatINR(wallet.balance) : '—'}
                </span>
                <p className="mt-1 text-xs text-gray-400">available credits · real-time</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-amber-50 p-2">
                    <Shield className="size-5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Approval Required</h3>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : overview.approvalRequired}
                </span>
                <p className="mt-1 text-xs text-gray-400">rules require manager sign-off</p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50/30 p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <AlertTriangle className="size-5 text-red-600" />
                  </div>
                  <h3 className="text-sm font-medium text-red-800">High-Alert Rules</h3>
                </div>
                <span className="text-2xl font-bold text-red-700">
                  {isLoading ? '—' : overview.alertRules}
                </span>
                <p className="mt-1 text-xs text-red-500">alert threshold ≥ 90%</p>
              </div>
            </div>

            {/* Rules table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900">Active budget rules</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Rules are enforced at booking time. Bookings exceeding the rule amount require approval or are blocked.
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-gray-400">Loading budget rules…</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <DollarSign className="size-8 text-slate-200" />
                  <p className="text-sm text-slate-500">No budget rules yet.</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => { setCreateError(''); setCreateOpen(true) }}
                      className="mt-1 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
                    >
                      Add first rule
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="py-3 pl-6 pr-4">Scope</th>
                        <th className="py-3 pr-4">Module</th>
                        <th className="py-3 pr-4">Amount</th>
                        <th className="py-3 pr-4">Period</th>
                        <th className="py-3 pr-4">Alert at</th>
                        <th className="py-3 pr-4">Approval</th>
                        <th className="w-12 py-3 pr-6" />
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule) => (
                        <RuleRow
                          key={rule.id}
                          rule={rule}
                          onDeactivate={handleDeactivate}
                          deactivating={deactivatingId === rule.id}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!canManage && (
              <p className="mt-4 text-xs text-slate-400">
                Budget rules can only be created or modified by L3 Admins.
              </p>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {createOpen && (
        <CreateRuleModal
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
          saving={createSaving}
          error={createError}
        />
      )}
    </div>
  )
}

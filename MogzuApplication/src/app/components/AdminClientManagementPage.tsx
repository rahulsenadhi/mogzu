import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { db } from '@/lib/db'
import type { CorporateAccount, UserProfile, ModuleId } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = CorporateAccount['plan']
type AccountStatus = CorporateAccount['status']

type ExpandedUsers = Record<string, { loading: boolean; users: UserProfile[] }>

type CreateForm = {
  name: string
  domain: string
  plan: Plan
}

type ManageModulesTarget = {
  accountId: string
  accountName: string
  modules: Record<ModuleId, boolean>
}

type EditPlanForm = {
  accountId: string
  currentPlan: Plan
  newPlan: Plan
}

const MODULE_LABELS: Record<ModuleId, string> = {
  events: 'Events',
  gifting: 'Gifting',
  spacex_coworking: 'Coworking',
  spacex_stay: 'Stay',
}

const ALL_MODULES: ModuleId[] = ['events', 'gifting', 'spacex_coworking', 'spacex_stay']

const PLAN_STYLES: Record<Plan, string> = {
  starter: 'bg-slate-100 text-slate-700',
  growth: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-violet-100 text-violet-700',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function enabledModuleCount(modules: Record<ModuleId, boolean>) {
  return ALL_MODULES.filter((m) => modules[m]).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function emptyCreateForm(): CreateForm {
  return { name: '', domain: '', plan: 'starter' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PLAN_STYLES[plan]}`}
    >
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: AccountStatus }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="size-3" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
      <AlertTriangle className="size-3" />
      Suspended
    </span>
  )
}

function ModuleChips({ modules }: { modules: Record<ModuleId, boolean> }) {
  const enabled = ALL_MODULES.filter((m) => modules[m])
  if (enabled.length === 0) return <span className="text-xs text-slate-400">None</span>
  return (
    <div className="flex flex-wrap gap-1">
      {enabled.map((m) => (
        <span key={m} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
          {MODULE_LABELS[m]}
        </span>
      ))}
    </div>
  )
}

// ─── Create/Edit Modal ────────────────────────────────────────────────────────

function CreateClientModal({
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
  const [form, setForm] = useState<CreateForm>(emptyCreateForm())
  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setValidationError('Company name is required.')
      return
    }
    setValidationError('')
    await onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Add corporate client</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Company name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Acme Corporation"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Domain (optional)</label>
            <input
              type="text"
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              placeholder="acme.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Plan</label>
            <select
              value={form.plan}
              onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as Plan }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
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
              {saving ? 'Saving…' : 'Create client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Change Plan Modal ────────────────────────────────────────────────────────

function ChangePlanModal({
  form,
  onClose,
  onSave,
  saving,
  error,
}: {
  form: EditPlanForm
  onClose: () => void
  onSave: (newPlan: Plan) => Promise<void>
  saving: boolean
  error: string
}) {
  const [newPlan, setNewPlan] = useState<Plan>(form.newPlan)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Change plan</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New plan</label>
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value as Plan)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
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
              type="button"
              disabled={saving || newPlan === form.currentPlan}
              onClick={() => onSave(newPlan)}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Suspend Confirm Modal ────────────────────────────────────────────────────

function ManageModulesModal({
  target,
  onClose,
  onSave,
  saving,
  error,
}: {
  target: ManageModulesTarget
  onClose: () => void
  onSave: (modules: Record<ModuleId, boolean>) => Promise<void>
  saving: boolean
  error: string
}) {
  const [modules, setModules] = useState<Record<ModuleId, boolean>>({ ...target.modules })

  const toggle = (key: ModuleId) => setModules((m) => ({ ...m, [key]: !m[key] }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage modules</h2>
            <p className="text-xs text-slate-500">{target.accountName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-2 px-6 py-5">
          {ALL_MODULES.map((moduleId) => (
            <label
              key={moduleId}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
            >
              <span className="text-sm font-medium text-slate-800">{MODULE_LABELS[moduleId]}</span>
              <input
                type="checkbox"
                checked={modules[moduleId]}
                onChange={() => toggle(moduleId)}
                className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
            </label>
          ))}
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(modules)}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save modules'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuspendConfirmModal({
  account,
  onClose,
  onConfirm,
  saving,
  error,
}: {
  account: CorporateAccount
  onClose: () => void
  onConfirm: () => Promise<void>
  saving: boolean
  error: string
}) {
  const isSuspending = account.status === 'active'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {isSuspending ? 'Suspend client?' : 'Reactivate client?'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600">
            {isSuspending
              ? `Suspending "${account.name}" will block all users from accessing Mogzu until reactivated.`
              : `Reactivating "${account.name}" will restore access for all users.`}
          </p>
          {error && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onConfirm}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60 ${
                isSuspending ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {saving
                ? 'Saving…'
                : isSuspending
                ? 'Suspend'
                : 'Reactivate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminClientManagementPage() {
  const [accounts, setAccounts] = useState<CorporateAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedUsers, setExpandedUsers] = useState<ExpandedUsers>({})
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  const [suspendTarget, setSuspendTarget] = useState<CorporateAccount | null>(null)
  const [suspendSaving, setSuspendSaving] = useState(false)
  const [suspendError, setSuspendError] = useState('')

  const [planTarget, setPlanTarget] = useState<EditPlanForm | null>(null)
  const [planSaving, setPlanSaving] = useState(false)
  const [planError, setPlanError] = useState('')

  const [modulesTarget, setModulesTarget] = useState<ManageModulesTarget | null>(null)
  const [modulesSaving, setModulesSaving] = useState(false)
  const [modulesError, setModulesError] = useState('')

  const PAGE_SIZE = 10

  // Load accounts
  useEffect(() => {
    setIsLoading(true)
    db.corporateAccounts.list().then(({ data, error }) => {
      if (error) setLoadError(error.message)
      else setAccounts(data ?? [])
      setIsLoading(false)
    })
  }, [])

  // Close menus on outside click
  useEffect(() => {
    if (!openMenuId) return
    const close = () => setOpenMenuId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  // Filtered + paginated
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.domain ?? '').toLowerCase().includes(q)
    )
  }, [accounts, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  )

  useEffect(() => { setPage(1) }, [query])

  // Expand row — lazy load users
  const toggleExpand = async (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      next.add(id)
      return next
    })
    if (!expandedUsers[id]) {
      setExpandedUsers((prev) => ({ ...prev, [id]: { loading: true, users: [] } }))
      const { data } = await db.userProfiles.listByCorporate(id)
      setExpandedUsers((prev) => ({
        ...prev,
        [id]: { loading: false, users: data ?? [] },
      }))
    }
  }

  // Create
  const handleCreate = async (form: CreateForm) => {
    setCreateSaving(true)
    setCreateError('')
    const defaultModules: Record<ModuleId, boolean> = {
      events: false,
      gifting: false,
      spacex_coworking: false,
      spacex_stay: false,
    }
    const { data, error } = await db.corporateAccounts.create({
      name: form.name.trim(),
      domain: form.domain.trim() || null,
      plan: form.plan,
      status: 'active',
      account_manager_id: null,
      modules_enabled: defaultModules,
    })
    if (error) {
      setCreateError(error.message)
    } else if (data) {
      setAccounts((prev) => [data, ...prev])
      setCreateOpen(false)
    }
    setCreateSaving(false)
  }

  // Suspend / reactivate
  const handleSuspend = async () => {
    if (!suspendTarget) return
    setSuspendSaving(true)
    setSuspendError('')
    const newStatus: AccountStatus = suspendTarget.status === 'active' ? 'suspended' : 'active'
    const { data, error } = await db.corporateAccounts.update(suspendTarget.id, { status: newStatus })
    if (error) {
      setSuspendError(error.message)
    } else if (data) {
      setAccounts((prev) => prev.map((a) => (a.id === data.id ? data : a)))
      setSuspendTarget(null)
    }
    setSuspendSaving(false)
  }

  // Plan change
  const handlePlanChange = async (newPlan: Plan) => {
    if (!planTarget) return
    setPlanSaving(true)
    setPlanError('')
    const { data, error } = await db.corporateAccounts.update(planTarget.accountId, { plan: newPlan })
    if (error) {
      setPlanError(error.message)
    } else if (data) {
      setAccounts((prev) => prev.map((a) => (a.id === data.id ? data : a)))
      setPlanTarget(null)
    }
    setPlanSaving(false)
  }

  // Modules update
  const handleModulesSave = async (modules: Record<ModuleId, boolean>) => {
    if (!modulesTarget) return
    setModulesSaving(true)
    setModulesError('')
    const { data, error } = await db.corporateAccounts.updateModuleAccess(modulesTarget.accountId, modules)
    if (error) {
      setModulesError(error.message)
    } else if (data) {
      setAccounts((prev) => prev.map((a) => (a.id === data.id ? data : a)))
      setModulesTarget(null)
    }
    setModulesSaving(false)
  }

  return (
    <div className="space-y-4">
      <AdminPageTitleRow
        title="Client Management"
        totalLabel={
          <>
            <span className="font-semibold text-slate-700">{accounts.length}</span> corporate clients
          </>
        }
      />

      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or domain…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateError('')
                setCreateOpen(true)
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
            >
              <Plus className="size-4" />
              Add client
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-slate-500">Loading clients…</p>
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-rose-600">{loadError}</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <Building2 className="size-8 text-slate-300" />
              <p className="text-sm text-slate-500">
                {query ? 'No clients match your search.' : 'No corporate clients yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-10 py-3 pl-4 pr-2" />
                  <th className="py-3 pr-4">Company</th>
                  <th className="py-3 pr-4">Domain</th>
                  <th className="py-3 pr-4">Plan</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Modules</th>
                  <th className="py-3 pr-4">Since</th>
                  <th className="w-12 py-3 pr-4" />
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {paginated.map((account, idx) => {
                  const isExpanded = expandedRows.has(account.id)
                  const stripe = idx % 2 === 1
                  const userState = expandedUsers[account.id]
                  return (
                    <>
                      <tr
                        key={account.id}
                        className={`border-b border-slate-100 hover:bg-slate-50/60 ${
                          stripe ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        {/* Expand toggle */}
                        <td className="py-3 pl-4 pr-2 align-middle">
                          <button
                            type="button"
                            onClick={() => toggleExpand(account.id)}
                            className="rounded p-0.5 text-slate-400 hover:bg-slate-200/80"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </button>
                        </td>

                        {/* Company name */}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                              {initials(account.name)}
                            </div>
                            <span className="font-medium text-slate-900">{account.name}</span>
                          </div>
                        </td>

                        {/* Domain */}
                        <td className="py-3 pr-4 text-slate-500">
                          {account.domain ?? <span className="text-slate-300">—</span>}
                        </td>

                        {/* Plan */}
                        <td className="py-3 pr-4">
                          <PlanBadge plan={account.plan} />
                        </td>

                        {/* Status */}
                        <td className="py-3 pr-4">
                          <StatusBadge status={account.status} />
                        </td>

                        {/* Modules */}
                        <td className="py-3 pr-4">
                          <ModuleChips modules={account.modules_enabled} />
                        </td>

                        {/* Created */}
                        <td className="py-3 pr-4 text-slate-500">{formatDate(account.created_at)}</td>

                        {/* Actions */}
                        <td className="py-3 pr-4 align-middle">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId((prev) => (prev === account.id ? null : account.id))
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                            {openMenuId === account.id && (
                              <div
                                className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPlanTarget({
                                      accountId: account.id,
                                      currentPlan: account.plan,
                                      newPlan: account.plan,
                                    })
                                    setPlanError('')
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  Change plan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setModulesTarget({
                                      accountId: account.id,
                                      accountName: account.name,
                                      modules: account.modules_enabled,
                                    })
                                    setModulesError('')
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  Manage modules
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSuspendTarget(account)
                                    setSuspendError('')
                                    setOpenMenuId(null)
                                  }}
                                  className={`w-full border-t border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                                    account.status === 'active'
                                      ? 'text-rose-600'
                                      : 'text-emerald-600'
                                  }`}
                                >
                                  {account.status === 'active' ? 'Suspend client' : 'Reactivate client'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded users */}
                      {isExpanded && (
                        <tr key={`${account.id}-users`} className={stripe ? 'bg-slate-50/40' : 'bg-white'}>
                          <td colSpan={8} className="border-b border-slate-100 px-6 pb-4 pt-2">
                            {userState?.loading ? (
                              <p className="text-xs text-slate-400">Loading users…</p>
                            ) : !userState || userState.users.length === 0 ? (
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Users className="size-3.5" />
                                No users in this account yet.
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {userState.users.map((u) => (
                                  <div
                                    key={u.id}
                                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100/60"
                                  >
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                      {initials(u.full_name ?? 'U')}
                                    </div>
                                    <span className="text-sm font-medium text-slate-800">
                                      {u.full_name ?? '—'}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">
                                      {u.role.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs text-slate-400">{u.department ?? ''}</span>
                                    <span
                                      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                                        u.status === 'active'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-rose-50 text-rose-600'
                                      }`}
                                    >
                                      {u.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} clients
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && (
        <CreateClientModal
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
          saving={createSaving}
          error={createError}
        />
      )}

      {suspendTarget && (
        <SuspendConfirmModal
          account={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onConfirm={handleSuspend}
          saving={suspendSaving}
          error={suspendError}
        />
      )}

      {planTarget && (
        <ChangePlanModal
          form={planTarget}
          onClose={() => setPlanTarget(null)}
          onSave={handlePlanChange}
          saving={planSaving}
          error={planError}
        />
      )}

      {modulesTarget && (
        <ManageModulesModal
          target={modulesTarget}
          onClose={() => setModulesTarget(null)}
          onSave={handleModulesSave}
          saving={modulesSaving}
          error={modulesError}
        />
      )}
    </div>
  )
}

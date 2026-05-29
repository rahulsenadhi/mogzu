import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gift,
  Loader2,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import {
  buildBookingApprovalFields,
  notifyFirstApprovers,
} from '@/lib/bookingApprovalMeta'
import {
  evaluateCorporateApproval,
  listRules as listWorkflowRules,
  type ApprovalEvaluation,
} from '@/lib/approvalWorkflow'
import type {
  ApprovalWorkflowRule,
  GiftingRule,
  Listing,
  ListingImage,
  UserProfile,
} from '@/lib/database.types'

const MODULE_ID = 'gifting' as const

type ProductWithImages = Listing & { listing_images: ListingImage[] }

type StepKey = 'rule' | 'product' | 'recipient' | 'message' | 'done'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'rule', label: 'Occasion' },
  { key: 'product', label: 'Gift' },
  { key: 'recipient', label: 'Recipient' },
  { key: 'message', label: 'Message' },
]

function getMd(l: ProductWithImages): {
  moq?: number
  inventory?: number
  outOfStock?: boolean
  leadTimeDays?: number
} {
  return (l.metadata ?? {}) as Record<string, unknown>
}

function leadTimeEstimate(days: number | undefined): string {
  const d = days ?? 7
  const target = new Date()
  target.setDate(target.getDate() + d)
  return target.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function GiftingSendPage() {
  const navigate = useNavigate()
  const { profile, corporateId, role } = useAuth()
  const canSend = role === 'l1_employee' || role === 'l2_manager' || role === 'l3_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [step, setStep] = useState<StepKey>('rule')

  // Data
  const [rules, setRules] = useState<GiftingRule[]>([])
  const [workflowRules, setWorkflowRules] = useState<ApprovalWorkflowRule[]>([])
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [recipients, setRecipients] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Selections
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithImages | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState('')

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [recipientSearch, setRecipientSearch] = useState('')

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
  const [confirmedStatus, setConfirmedStatus] = useState<'pending_approval' | 'pending_vendor' | null>(null)

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    setLoadError('')

    const [rRes, pRes, uRes, wRes] = await Promise.all([
      db.giftingRules.listByCorporate(corporateId),
      db.listings.listByModule(MODULE_ID, 'active'),
      db.userProfiles.listByCorporate(corporateId),
      listWorkflowRules(corporateId),
    ])

    if (rRes.error) setLoadError(rRes.error.message)
    setRules(((rRes.data ?? []) as GiftingRule[]).filter((r) => r.is_active))
    setWorkflowRules(wRes.data ?? [])

    if (pRes.error) setLoadError(pRes.error.message)
    setProducts((pRes.data ?? []) as ProductWithImages[])

    setRecipients(((uRes.data ?? []) as UserProfile[]).filter((u) => u.id !== profile?.id))

    setLoading(false)
  }, [corporateId, profile?.id])

  useEffect(() => {
    load()
  }, [load])

  const selectedRule = useMemo(
    () => rules.find((r) => r.id === selectedRuleId) ?? null,
    [rules, selectedRuleId],
  )

  // Filter products by rule (preferred vendors), department scope on recipient, category/price
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => !((p.metadata ?? {}) as { outOfStock?: boolean }).outOfStock)
    if (selectedRule && selectedRule.preferred_vendor_ids.length > 0) {
      list = list.filter((p) => selectedRule.preferred_vendor_ids.includes(p.vendor_id))
    }
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category_id === categoryFilter)
    }
    if (maxPrice && Number(maxPrice) > 0) {
      const cap = Number(maxPrice)
      list = list.filter((p) => p.base_price != null && p.base_price <= cap)
    }
    if (selectedRule && selectedRule.budget_per_recipient > 0 && !selectedRule.requires_approval) {
      // Pre-filter to within auto-approve budget for simpler UX
      const cap = selectedRule.budget_per_recipient
      list = list.filter((p) => p.base_price == null || p.base_price <= cap * 1.5)
    }
    return list
  }, [products, selectedRule, categoryFilter, maxPrice])

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    products.forEach((p) => {
      if (p.category_id) map.set(p.category_id, p.category_id.slice(0, 8))
    })
    return Array.from(map.entries())
  }, [products])

  // Recipients filtered by department scope + search
  const filteredRecipients = useMemo(() => {
    let list = recipients
    if (selectedRule?.scope === 'department' && selectedRule.scope_value) {
      list = list.filter((u) => u.department === selectedRule.scope_value)
    }
    const q = recipientSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (u) =>
          (u.full_name ?? '').toLowerCase().includes(q) ||
          (u.department ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [recipients, selectedRule, recipientSearch])

  const approvalDecision = useMemo((): ApprovalEvaluation => {
    if (!selectedProduct) {
      return { requiresApproval: false, reason: '', requiredLevels: [] }
    }
    const price = selectedProduct.base_price ?? 0
    const workflow = evaluateCorporateApproval([], workflowRules, MODULE_ID, price)

    const reasons: string[] = []
    let giftingRequires = false

    if (!selectedRule) {
      reasons.push('No gifting occasion rule — workflow thresholds still apply.')
    } else if (selectedRule.requires_approval) {
      giftingRequires = true
      reasons.push('Gifting rule requires manager approval.')
    } else if (price > selectedRule.budget_per_recipient) {
      giftingRequires = true
      reasons.push(
        `Gift price ₹${price.toLocaleString('en-IN')} exceeds per-recipient budget ₹${selectedRule.budget_per_recipient.toLocaleString('en-IN')}.`,
      )
    }

    if (workflow.requiresApproval) reasons.push(workflow.reason)

    const requiresApproval = giftingRequires || workflow.requiresApproval
    if (!requiresApproval) {
      return {
        requiresApproval: false,
        reason: 'Within gifting budget and workflow limits — auto-approved.',
        requiredLevels: [],
      }
    }

    return {
      requiresApproval: true,
      reason: reasons.join(' '),
      requiredLevels: workflow.requiredLevels,
    }
  }, [selectedProduct, selectedRule, workflowRules])

  const next = () => {
    const order: StepKey[] = ['rule', 'product', 'recipient', 'message']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }
  const back = () => {
    const order: StepKey[] = ['rule', 'product', 'recipient', 'message']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const canAdvance = (): boolean => {
    if (step === 'rule') return true // rule is optional
    if (step === 'product') return !!selectedProduct
    if (step === 'recipient') return !!selectedRecipient
    return true
  }

  const handleSubmit = async () => {
    if (!profile || !corporateId || !selectedProduct || !selectedRecipient) return
    setSubmitting(true)
    setSubmitError('')

    const price = selectedProduct.base_price ?? 0
    const status = approvalDecision.requiresApproval ? 'pending_approval' : 'pending_vendor'

    // Commission snapshot
    let commissionRate: number | null = null
    const vRule = await db.commissions.getForVendor(selectedProduct.vendor_id)
    if (vRule.data && vRule.data.length > 0) commissionRate = vRule.data[0].rate
    else {
      const g = await db.commissions.getGlobal()
      if (g.data) commissionRate = g.data.rate
    }

    const platformFee = Math.round(price * (commissionRate ?? 0.05))
    const total = price + platformFee

    const recipientLabel = selectedRecipient.full_name ?? selectedRecipient.id.slice(0, 8)
    const composedNote = [
      `Recipient: ${recipientLabel}${selectedRecipient.department ? ` (${selectedRecipient.department})` : ''}`,
      selectedRule ? `Occasion: ${selectedRule.occasion_name}` : null,
      message.trim() ? `Message: ${message.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const { data, error } = await db.bookings.create({
      corporate_id: corporateId,
      user_id: profile.id,
      vendor_id: selectedProduct.vendor_id,
      listing_id: selectedProduct.id,
      module: MODULE_ID,
      status,
      group_size: 1,
      start_time: null,
      end_time: null,
      base_amount: price,
      add_ons_amount: 0,
      platform_fee: platformFee,
      total_amount: total,
      commission_rate: commissionRate,
      payment_method: null,
      payment_reference: null,
      payment_status: 'pending',
      ...buildBookingApprovalFields(composedNote, approvalDecision.requiredLevels),
      approved_by: null,
      approved_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      cancellation_fee: null,
      vendor_response_deadline: status === 'pending_vendor'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null,
      completed_at: null,
    })

    if (error || !data) {
      setSubmitError(error?.message ?? 'Failed to send gift.')
      setSubmitting(false)
      return
    }

    if (status === 'pending_approval' && corporateId) {
      await notifyFirstApprovers(corporateId, approvalDecision.requiredLevels, {
        bookingId: data.id,
        title: 'New gift awaiting your approval',
        body: `${selectedProduct.title} — ₹${total.toLocaleString('en-IN')} for ${recipientLabel}.`,
      })
    }

    setConfirmedBookingId(data.id)
    setConfirmedStatus(status)
    setStep('done')
    setSubmitting(false)
  }

  if (!canSend) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">Corporate role required to send gifts.</p>
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

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{loadError}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-3 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Retry
                </button>
              </div>
            ) : step === 'done' && confirmedBookingId ? (
              <ConfirmationCard
                bookingId={confirmedBookingId}
                status={confirmedStatus!}
                recipient={selectedRecipient!}
                product={selectedProduct!}
                etaLabel={leadTimeEstimate(getMd(selectedProduct!).leadTimeDays)}
                onView={() => navigate('/bookings')}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <ol className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    {STEPS.map((s, i) => {
                      const order: StepKey[] = ['rule', 'product', 'recipient', 'message']
                      const active = step === s.key
                      const done = order.indexOf(step) > i
                      return (
                        <li key={s.key} className="flex items-center gap-2">
                          <span
                            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                              done
                                ? 'bg-emerald-100 text-emerald-700'
                                : active
                                  ? 'bg-[#2563eb] text-white'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {done ? <CheckCircle2 className="size-4" /> : i + 1}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              active ? 'text-[#0e1e3f]' : 'text-slate-500'
                            }`}
                          >
                            {s.label}
                          </span>
                          {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
                        </li>
                      )
                    })}
                  </ol>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {step === 'rule' && (
                      <StepRule
                        rules={rules}
                        selectedRuleId={selectedRuleId}
                        onPick={setSelectedRuleId}
                      />
                    )}
                    {step === 'product' && (
                      <StepProduct
                        products={filteredProducts}
                        selected={selectedProduct}
                        onPick={setSelectedProduct}
                        categories={categories}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                      />
                    )}
                    {step === 'recipient' && (
                      <StepRecipient
                        recipients={filteredRecipients}
                        selected={selectedRecipient}
                        onPick={setSelectedRecipient}
                        search={recipientSearch}
                        setSearch={setRecipientSearch}
                      />
                    )}
                    {step === 'message' && (
                      <StepMessage
                        message={message}
                        setMessage={setMessage}
                        recipient={selectedRecipient!}
                        product={selectedProduct!}
                        rule={selectedRule}
                        approvalDecision={approvalDecision}
                        etaLabel={leadTimeEstimate(getMd(selectedProduct!).leadTimeDays)}
                      />
                    )}

                    {submitError && (
                      <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {submitError}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={back}
                        disabled={step === 'rule'}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Back
                      </button>
                      {step !== 'message' ? (
                        <button
                          type="button"
                          onClick={next}
                          disabled={!canAdvance()}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                        >
                          Continue <ArrowRight className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submitting && <Loader2 className="size-4 animate-spin" />}
                          Send gift
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <SummaryCard
                    product={selectedProduct}
                    recipient={selectedRecipient}
                    rule={selectedRule}
                  />
                </aside>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepRule({
  rules,
  selectedRuleId,
  onPick,
}: {
  rules: GiftingRule[]
  selectedRuleId: string | null
  onPick: (id: string | null) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Gift className="size-5 text-[#2563eb]" />
        <h2 className="text-lg font-semibold text-[#0e1e3f]">Pick an occasion</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Occasion rules pre-set budget and preferred vendors. Skip to send a standalone gift.
      </p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onPick(null)}
          className={`w-full rounded-xl border p-4 text-left transition ${
            selectedRuleId === null
              ? 'border-[#2563eb] bg-[#ebf1ff]'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="font-semibold">No occasion (standalone gift)</p>
          <p className="text-xs text-slate-500">
            No automatic budget cap — manager may need to approve.
          </p>
        </button>
        {rules.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className={`w-full rounded-xl border p-4 text-left transition ${
              selectedRuleId === r.id
                ? 'border-[#2563eb] bg-[#ebf1ff]'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="font-semibold">{r.occasion_name}</p>
            <p className="text-xs text-slate-500">
              ₹ {r.budget_per_recipient.toLocaleString('en-IN')} per recipient ·{' '}
              {r.requires_approval ? 'Manager approval' : 'Auto-approve'}
              {r.scope === 'department' ? ` · ${r.scope_value}` : ''}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepProduct({
  products,
  selected,
  onPick,
  categories,
  categoryFilter,
  setCategoryFilter,
  maxPrice,
  setMaxPrice,
}: {
  products: ProductWithImages[]
  selected: ProductWithImages | null
  onPick: (p: ProductWithImages) => void
  categories: [string, string][]
  categoryFilter: string
  setCategoryFilter: (s: string) => void
  maxPrice: string
  setMaxPrice: (s: string) => void
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-[#0e1e3f]">Pick a gift</h2>
      <div className="mb-3 flex flex-wrap gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-slate-200 px-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max ₹"
          className="h-9 w-28 rounded-md border border-slate-200 px-2 text-sm"
        />
      </div>
      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No products match your filters or selected occasion.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => {
            const cover = p.listing_images?.[0]
            const isSelected = selected?.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p)}
                className={`flex flex-col rounded-xl border bg-white text-left transition ${
                  isSelected ? 'border-[#2563eb] ring-2 ring-[#2563eb]/30' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="aspect-square overflow-hidden rounded-t-xl bg-slate-100">
                  {cover && (
                    <img
                      src={storageService.giftImages.getUrl(cover.storage_path)}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <p className="truncate text-sm font-semibold text-[#0e1e3f]">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    {p.base_price != null ? `₹${p.base_price.toLocaleString('en-IN')}` : 'Request price'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StepRecipient({
  recipients,
  selected,
  onPick,
  search,
  setSearch,
}: {
  recipients: UserProfile[]
  selected: UserProfile | null
  onPick: (u: UserProfile) => void
  search: string
  setSearch: (s: string) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Users className="size-5 text-[#2563eb]" />
        <h2 className="text-lg font-semibold text-[#0e1e3f]">Pick a recipient</h2>
      </div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or department"
          className="h-10 w-full rounded-md border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </div>
      {recipients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No matching teammates.
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-auto">
          {recipients.map((u) => {
            const isSelected = selected?.id === u.id
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onPick(u)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'border-[#2563eb] bg-[#ebf1ff]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{u.full_name ?? u.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">
                    {u.department ?? '—'} · {u.role}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function StepMessage({
  message,
  setMessage,
  recipient,
  product,
  rule,
  approvalDecision,
  etaLabel,
}: {
  message: string
  setMessage: (s: string) => void
  recipient: UserProfile
  product: ProductWithImages
  rule: GiftingRule | null
  approvalDecision: ApprovalEvaluation
  etaLabel: string
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-[#0e1e3f]">Add a personal message</h2>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        Message (max 200 characters)
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 200))}
        rows={4}
        placeholder={`Happy birthday, ${recipient.full_name ?? 'colleague'}!`}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
      />
      <p className="mt-1 text-[11px] text-slate-400">{message.length}/200</p>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
        <p>
          <strong>Gift:</strong> {product.title}
          {product.base_price != null && ` · ₹${product.base_price.toLocaleString('en-IN')}`}
        </p>
        <p>
          <strong>To:</strong> {recipient.full_name ?? recipient.id.slice(0, 8)}
          {recipient.department && ` (${recipient.department})`}
        </p>
        {rule && (
          <p>
            <strong>Occasion:</strong> {rule.occasion_name}
          </p>
        )}
        <p>
          <strong>Estimated delivery:</strong> by {etaLabel}
        </p>
      </div>

      <div
        className={`mt-4 rounded-xl border p-4 ${
          approvalDecision.requiresApproval
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}
      >
        <p className="text-sm font-semibold">
          {approvalDecision.requiresApproval
            ? 'Manager approval required'
            : 'Auto-routed to vendor'}
        </p>
        <p className="mt-1 text-xs">{approvalDecision.reason}</p>
        {approvalDecision.requiredLevels.length > 0 ? (
          <p className="mt-2 text-xs font-medium">
            Approval chain: {approvalDecision.requiredLevels.join(' → ')}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ConfirmationCard({
  bookingId,
  status,
  recipient,
  product,
  etaLabel,
  onView,
}: {
  bookingId: string
  status: 'pending_approval' | 'pending_vendor'
  recipient: UserProfile
  product: ProductWithImages
  etaLabel: string
  onView: () => void
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
      <h1 className="text-2xl font-bold text-[#0e1e3f]">Gift sent</h1>
      <p className="mt-1 text-sm text-slate-500">
        Reference: <span className="font-mono">{bookingId.slice(0, 8)}</span>
      </p>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left text-sm">
        <p>
          <strong>{product.title}</strong> for{' '}
          <strong>{recipient.full_name ?? recipient.id.slice(0, 8)}</strong>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Status:{' '}
          {status === 'pending_approval'
            ? 'Pending manager approval'
            : 'Sent to vendor for confirmation (24h SLA)'}
        </p>
        <p className="mt-1 text-xs text-slate-500">Estimated delivery: by {etaLabel}</p>
      </div>
      <button
        type="button"
        onClick={onView}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        View my orders
      </button>
    </div>
  )
}

function SummaryCard({
  product,
  recipient,
  rule,
}: {
  product: ProductWithImages | null
  recipient: UserProfile | null
  rule: GiftingRule | null
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</p>
      <div className="mt-3 space-y-2 text-sm">
        {rule ? (
          <p>
            <span className="text-slate-500">Occasion:</span> {rule.occasion_name}
          </p>
        ) : (
          <p className="text-slate-400">No occasion selected</p>
        )}
        {product ? (
          <p>
            <span className="text-slate-500">Gift:</span> {product.title}
          </p>
        ) : (
          <p className="text-slate-400">No gift selected</p>
        )}
        {recipient ? (
          <p>
            <span className="text-slate-500">To:</span>{' '}
            {recipient.full_name ?? recipient.id.slice(0, 8)}
          </p>
        ) : (
          <p className="text-slate-400">No recipient selected</p>
        )}
        {product?.base_price != null && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-lg font-bold text-[#0e1e3f]">
            ₹ {product.base_price.toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  )
}

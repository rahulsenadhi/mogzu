import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
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
import type {
  Employee,
  GiftingCampaign,
  GiftingCampaignScope,
  Listing,
  ListingImage,
  UserProfile,
} from '@/lib/database.types'

type ProductWithImages = Listing & { listing_images: ListingImage[] }

type StepKey = 'occasion' | 'gift' | 'recipients' | 'review' | 'done'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'occasion', label: 'Occasion' },
  { key: 'gift', label: 'Gift' },
  { key: 'recipients', label: 'Recipients' },
  { key: 'review', label: 'Review' },
]

export default function BulkGiftingPage() {
  const params = useParams<{ id?: string }>()
  if (params.id) return <CampaignDetail campaignId={params.id} />
  return <Wizard />
}

function Wizard() {
  const navigate = useNavigate()
  const { profile, corporateId, role } = useAuth()
  const canRun = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [step, setStep] = useState<StepKey>('occasion')

  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<(GiftingCampaign & { listings?: { title: string | null } })[]>([])

  const [occasion, setOccasion] = useState('')
  const [message, setMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithImages | null>(null)
  const [scope, setScope] = useState<GiftingCampaignScope>('all')
  const [department, setDepartment] = useState('')
  const [customEmployeeIds, setCustomEmployeeIds] = useState<Set<string>>(new Set())
  const [recipientSearch, setRecipientSearch] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [campaignId, setCampaignId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    const [pRes, eRes, uRes, hRes] = await Promise.all([
      db.listings.listByModule('gifting', 'active'),
      db.employees.listByCorporate(corporateId),
      db.userProfiles.listByCorporate(corporateId),
      db.giftingCampaigns.listByCorporate(corporateId),
    ])
    setProducts((pRes.data ?? []) as ProductWithImages[])
    setEmployees((eRes.data ?? []) as Employee[])
    setUsers((uRes.data ?? []) as UserProfile[])
    setHistory(hRes.data ?? [])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const departments = useMemo(() => {
    const set = new Set<string>()
    employees.forEach((e) => {
      if (e.department) set.add(e.department)
    })
    return Array.from(set).sort()
  }, [employees])

  const filteredEmployees = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase()
    return employees.filter((e) => {
      if (!e.is_active) return false
      if (!q) return true
      return (
        e.full_name.toLowerCase().includes(q) ||
        (e.department ?? '').toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      )
    })
  }, [employees, recipientSearch])

  const recipients = useMemo(() => {
    if (scope === 'all') return employees.filter((e) => e.is_active)
    if (scope === 'department')
      return employees.filter((e) => e.is_active && e.department === department)
    return employees.filter((e) => customEmployeeIds.has(e.id))
  }, [scope, department, customEmployeeIds, employees])

  // Match employee email → user_profile.id (so the gift booking is owned by the
  // recipient's account). Fallback: corporate L3 admin owns it if no match.
  const userByEmail = useMemo(() => {
    const map: Record<string, UserProfile> = {}
    // user_profiles has no email column locally; we look up by full_name + dept
    // as a heuristic. In prod the join is by email via Supabase auth.
    users.forEach((u) => {
      if (u.full_name) map[u.full_name.toLowerCase()] = u
    })
    return map
  }, [users])

  const totalBudget = (selectedProduct?.base_price ?? 0) * recipients.length

  const canAdvance = (): boolean => {
    if (step === 'occasion') return !!occasion.trim()
    if (step === 'gift') return !!selectedProduct
    if (step === 'recipients') return recipients.length > 0
    return true
  }

  const next = () => {
    const order: StepKey[] = ['occasion', 'gift', 'recipients', 'review']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }
  const back = () => {
    const order: StepKey[] = ['occasion', 'gift', 'recipients', 'review']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const handleSubmit = async () => {
    if (!profile || !corporateId || !selectedProduct) return
    setSubmitting(true)
    setSubmitError('')

    const price = selectedProduct.base_price ?? 0

    const { data: campaign, error: cErr } = await db.giftingCampaigns.create({
      corporate_id: corporateId,
      occasion_name: occasion.trim(),
      listing_id: selectedProduct.id,
      scope,
      scope_value: scope === 'department' ? department : null,
      message: message.trim() || null,
      budget_per_recipient: price,
      recipient_count: recipients.length,
      total_budget: totalBudget,
      status: 'pending_vendor',
      created_by: profile.id,
    })

    if (cErr || !campaign) {
      setSubmitError(cErr?.message ?? 'Failed to create campaign.')
      setSubmitting(false)
      return
    }

    // Commission snapshot once
    let commissionRate: number | null = null
    const vRule = await db.commissions.getForVendor(selectedProduct.vendor_id)
    if (vRule.data && vRule.data.length > 0) commissionRate = vRule.data[0].rate
    else {
      const g = await db.commissions.getGlobal()
      if (g.data) commissionRate = g.data.rate
    }
    const platformFee = Math.round(price * (commissionRate ?? 0.05))
    const total = price + platformFee

    // Create one booking per recipient. L3 admin owns each booking record.
    const deadlineIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    for (const emp of recipients) {
      const owner = userByEmail[emp.full_name.toLowerCase()] ?? profile
      const note = [
        `Bulk gift to ${emp.full_name}${emp.department ? ` (${emp.department})` : ''}`,
        `Occasion: ${occasion.trim()}`,
        message.trim() ? `Message: ${message.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      const { data: booking } = await db.bookings.create({
        corporate_id: corporateId,
        user_id: owner.id,
        vendor_id: selectedProduct.vendor_id,
        listing_id: selectedProduct.id,
        module: 'gifting',
        status: 'pending_vendor',
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
        purpose_note: note,
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        cancelled_at: null,
        cancellation_reason: null,
        cancellation_fee: null,
        vendor_response_deadline: deadlineIso,
        completed_at: null,
        fulfilment_stage: null,
        tracking_number: null,
        carrier: null,
        carrier_url: null,
        gifting_campaign_id: campaign.id,
      })

      // Notify recipient if their user profile exists
      if (booking && owner.id !== profile.id) {
        db.notifications.notify({
          userId: owner.id,
          type: 'gift_received',
          title: `A gift from ${profile.full_name ?? 'your team'} is on its way`,
          body: `${occasion.trim()} — ${selectedProduct.title}${message.trim() ? `. "${message.trim()}"` : ''}`,
          linkUrl: `/bookings/${booking.id}`,
        })
      }
    }

    setSubmitting(false)
    setCampaignId(campaign.id)
    setStep('done')
  }

  if (!canRun) {
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
          <div className="mx-auto max-w-5xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                <Gift className="size-5" />
                Bulk gifting
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Run a company-wide or department gifting campaign. One vendor order is created
                per recipient; track per-employee delivery from the campaign view.
              </p>
            </div>

            {step === 'done' && campaignId ? (
              <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
                <h1 className="text-xl font-bold text-[#0e1e3f]">Campaign launched</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Reference: <span className="font-mono">{campaignId.slice(0, 8)}</span>
                </p>
                <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {recipients.length} order{recipients.length !== 1 ? 's' : ''} sent to vendor ·{' '}
                  ₹{totalBudget.toLocaleString('en-IN')} total
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/corporate/bulk-gifting/${campaignId}`)}
                  className="mt-6 rounded-md bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View campaign
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <ol className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    {STEPS.map((s, i) => {
                      const order: StepKey[] = ['occasion', 'gift', 'recipients', 'review']
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
                          <span className={`text-sm font-medium ${active ? 'text-[#0e1e3f]' : 'text-slate-500'}`}>
                            {s.label}
                          </span>
                          {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
                        </li>
                      )
                    })}
                  </ol>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {step === 'occasion' && (
                      <div>
                        <h2 className="mb-2 text-lg font-semibold text-[#0e1e3f]">Occasion</h2>
                        <input
                          value={occasion}
                          onChange={(e) => setOccasion(e.target.value)}
                          placeholder="Diwali 2026 / Onboarding kit / Annual day"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                        />
                        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-slate-500">
                          Message to recipients (optional)
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                          rows={3}
                          placeholder="Thanks for an incredible year. Enjoy Diwali!"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">{message.length}/200</p>
                      </div>
                    )}

                    {step === 'gift' && (
                      <div>
                        <h2 className="mb-2 text-lg font-semibold text-[#0e1e3f]">Pick a gift</h2>
                        {products.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                            No approved gifting products available.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {products.map((p) => {
                              const cover = p.listing_images?.[0]
                              const isSelected = selectedProduct?.id === p.id
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setSelectedProduct(p)}
                                  className={`flex flex-col rounded-xl border bg-white text-left transition ${
                                    isSelected
                                      ? 'border-[#2563eb] ring-2 ring-[#2563eb]/30'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="aspect-square overflow-hidden rounded-t-xl bg-slate-100">
                                    {cover && (
                                      <img
                                        src={storageService.giftImages.getUrl(
                                          cover.storage_path,
                                        )}
                                        alt=""
                                        className="size-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 p-3">
                                    <p className="truncate text-sm font-semibold text-[#0e1e3f]">
                                      {p.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {p.base_price != null
                                        ? `₹${p.base_price.toLocaleString('en-IN')}`
                                        : 'Request price'}
                                    </p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {step === 'recipients' && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Users className="size-5 text-[#2563eb]" />
                          <h2 className="text-lg font-semibold text-[#0e1e3f]">
                            Recipient scope
                          </h2>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {(['all', 'department', 'custom'] as GiftingCampaignScope[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setScope(s)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                scope === s
                                  ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {s === 'all'
                                ? `All active employees (${employees.filter((e) => e.is_active).length})`
                                : s === 'department'
                                  ? 'Specific department'
                                  : 'Custom selection'}
                            </button>
                          ))}
                        </div>

                        {scope === 'department' && (
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                              Department
                            </label>
                            <select
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                            >
                              <option value="">Select department</option>
                              {departments.map((d) => (
                                <option key={d} value={d}>
                                  {d} (
                                  {
                                    employees.filter((e) => e.is_active && e.department === d)
                                      .length
                                  }
                                  )
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {scope === 'custom' && (
                          <div>
                            <div className="relative mb-3">
                              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                              <input
                                value={recipientSearch}
                                onChange={(e) => setRecipientSearch(e.target.value)}
                                placeholder="Search name, dept, email"
                                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm"
                              />
                            </div>
                            <ul className="max-h-72 space-y-1 overflow-auto rounded-xl border border-slate-100 p-2">
                              {filteredEmployees.slice(0, 200).map((e) => {
                                const picked = customEmployeeIds.has(e.id)
                                return (
                                  <li
                                    key={e.id}
                                    className={`flex items-center justify-between rounded-lg px-2 py-1 ${
                                      picked ? 'bg-[#ebf1ff]' : ''
                                    }`}
                                  >
                                    <label className="flex flex-1 cursor-pointer items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={picked}
                                        onChange={() =>
                                          setCustomEmployeeIds((prev) => {
                                            const next = new Set(prev)
                                            picked ? next.delete(e.id) : next.add(e.id)
                                            return next
                                          })
                                        }
                                        className="size-4"
                                      />
                                      <div>
                                        <p className="text-sm font-medium text-slate-900">
                                          {e.full_name}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                          {e.department ?? '—'} · {e.email}
                                        </p>
                                      </div>
                                    </label>
                                  </li>
                                )
                              })}
                            </ul>
                            <p className="mt-2 text-xs text-slate-500">
                              Selected: <strong>{customEmployeeIds.size}</strong>
                            </p>
                          </div>
                        )}

                        {recipients.length > 0 && (
                          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                            <strong>{recipients.length}</strong> recipient
                            {recipients.length !== 1 ? 's' : ''} will receive this gift.
                          </p>
                        )}
                      </div>
                    )}

                    {step === 'review' && selectedProduct && (
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-[#0e1e3f]">Review</h2>
                        <dl className="space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
                          <Row label="Occasion">{occasion}</Row>
                          <Row label="Gift">
                            {selectedProduct.title}{' '}
                            {selectedProduct.base_price != null &&
                              `· ₹${selectedProduct.base_price.toLocaleString('en-IN')}`}
                          </Row>
                          <Row label="Recipients">
                            {recipients.length}{' '}
                            {scope === 'all'
                              ? '(all active employees)'
                              : scope === 'department'
                                ? `(${department})`
                                : '(custom)'}
                          </Row>
                          <Row label="Total budget">
                            ₹ {totalBudget.toLocaleString('en-IN')}
                          </Row>
                          {message && <Row label="Message">{message}</Row>}
                        </dl>
                        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          Submitting sends {recipients.length} order{recipients.length !== 1 ? 's' : ''} to the
                          vendor (24h SLA each) and notifies any recipient with a user account.
                        </p>
                      </div>
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
                        disabled={step === 'occasion'}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Back
                      </button>
                      {step !== 'review' ? (
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
                          disabled={submitting || recipients.length === 0}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submitting && <Loader2 className="size-4 animate-spin" />}
                          Launch campaign
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Summary
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      {selectedProduct ? (
                        <p>
                          <span className="text-slate-500">Gift:</span> {selectedProduct.title}
                        </p>
                      ) : (
                        <p className="text-slate-400">No gift selected</p>
                      )}
                      <p>
                        <span className="text-slate-500">Recipients:</span>{' '}
                        <strong>{recipients.length}</strong>
                      </p>
                      <p className="border-t border-slate-100 pt-2 text-lg font-bold text-[#0e1e3f]">
                        ₹ {totalBudget.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Past campaigns
                    </p>
                    {history.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">No campaigns yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-xs">
                        {history.slice(0, 5).map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => navigate(`/corporate/bulk-gifting/${c.id}`)}
                              className="text-left text-[#2563eb] hover:underline"
                            >
                              {c.occasion_name} · {c.recipient_count}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </aside>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function CampaignDetail({ campaignId }: { campaignId: string }) {
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<
    (GiftingCampaign & { listings?: { title: string | null; base_price: number | null } }) | null
  >(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [cRes, bRes] = await Promise.all([
      db.giftingCampaigns.getById(campaignId),
      db.giftingCampaigns.listBookings(campaignId),
    ])
    setCampaign(cRes.data as any)
    setBookings(bRes.data ?? [])
    setLoading(false)
  }, [campaignId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!campaign) return <p className="p-12 text-center">Campaign not found.</p>

  const fulfilled = bookings.filter((b) => b.fulfilment_stage === 'delivered').length

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <button
          type="button"
          onClick={() => navigate('/corporate/bulk-gifting')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          Back to bulk gifting
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0e1e3f]">{campaign.occasion_name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {campaign.listings?.title ?? '—'} · {campaign.recipient_count} recipients · ₹{' '}
            {campaign.total_budget.toLocaleString('en-IN')} total
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <p>
              <strong className="text-slate-500">Scope:</strong> {campaign.scope}
              {campaign.scope_value ? ` (${campaign.scope_value})` : ''}
            </p>
            <p>
              <strong className="text-slate-500">Delivered:</strong> {fulfilled} /{' '}
              {bookings.length}
            </p>
            <p>
              <strong className="text-slate-500">Status:</strong> {campaign.status}
            </p>
          </div>
          {campaign.message && (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm italic text-slate-700">
              "{campaign.message}"
            </p>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Per-recipient orders
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Booking</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Fulfilment</th>
                <th className="px-4 py-2">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2">
                    <p className="font-medium text-slate-900">
                      {b.user_profiles?.full_name ?? '—'}
                    </p>
                    {b.user_profiles?.department && (
                      <p className="text-[11px] text-slate-500">{b.user_profiles.department}</p>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-[#2563eb]">
                    {b.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 text-xs">{b.status}</td>
                  <td className="px-4 py-2 text-xs">{b.fulfilment_stage ?? 'awaiting'}</td>
                  <td className="px-4 py-2 text-xs">
                    {b.tracking_number ? (
                      <a
                        href={b.carrier_url ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2563eb] hover:underline"
                      >
                        {b.tracking_number}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-[#0e1e3f]">{children}</dd>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Loader2, Plus, Share2 } from 'lucide-react'
import { LeadOpsBanner } from '@/app/components/leads/LeadOpsBanner'
import { LeadOpsEmptyState } from '@/app/components/leads/LeadOpsEmptyState'
import { LeadOpsPageHeader } from '@/app/components/leads/LeadOpsPageHeader'
import { LEAD_OPS, leadOpsChipClass } from '@/app/components/leads/leadOpsStyles'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Listing, ListingCategory, ModuleId, QuickShare } from '@/lib/database.types'
import {
  inferListingCatalogKind,
  inferModuleFromLead,
  matchesListingCatalogFilter,
  type LeadQuickSharePrefill,
  type ListingCatalogKind,
} from '@/lib/leadEnquiryVertical'
import { consumeLeadQuickSharePrefill } from '@/lib/leadOpsNavigation'
import { markLeadCatalogueSent } from '@/lib/publicLeads'

const ENQUIRY_MODULES: Extract<ModuleId, 'gifting' | 'events'>[] = ['gifting', 'events']

type ListingRow = Listing & { listing_categories?: ListingCategory | ListingCategory[] | null }


function fmt(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const BUDGET_CAP_HINT: Record<string, string> = {
  lt_50k: '50000',
  '50k_2l': '200000',
  '2l_10l': '1000000',
  '10l_plus': '',
}

function buildNoteFromLead(lead: LeadQuickSharePrefill): string {
  const lines: string[] = []
  if (lead.requirement_summary?.trim()) lines.push(lead.requirement_summary.trim())
  if (lead.client_email) lines.push(`Contact: ${lead.client_email}`)
  if (lead.client_phone) lines.push(`Phone: ${lead.client_phone}`)
  if (lead.timeline) lines.push(`Timeline: ${lead.timeline}`)
  if (lead.source_slug) lines.push(`Source: ${lead.source_slug.replaceAll('_', ' ')}`)
  lines.push(`Lead ref: ${lead.id.slice(0, 8)}`)
  return lines.join('\n')
}

type AdminQuickSharePageProps = {
  embedded?: boolean
}

export default function AdminQuickSharePage({ embedded = false }: AdminQuickSharePageProps = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, role } = useAuth()
  const isAuthorised = role === 'mogzu_admin' || role === 'support' || role === 'sales_agent'

  const [shares, setShares] = useState<QuickShare[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  // Create form state
  const [module, setModule] = useState<Extract<ModuleId, 'gifting' | 'events'>>('gifting')
  const [catalogFilter, setCatalogFilter] = useState<ListingCatalogKind>('all')
  const [clientLabel, setClientLabel] = useState('')
  const [note, setNote] = useState('')
  const [budgetCap, setBudgetCap] = useState('')
  const [expiresIn, setExpiresIn] = useState('48')
  const [listings, setListings] = useState<ListingRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loadingListings, setLoadingListings] = useState(false)
  /** When opened from /admin/leads — auto-mark catalogue sent after share is created */
  const [linkedLeadId, setLinkedLeadId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await db.quickShares.list()
    if (error) setNotice(error.message)
    else setShares((data ?? []) as QuickShare[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const applyLeadPrefill = useCallback((fromLead: LeadQuickSharePrefill) => {
    setLinkedLeadId(fromLead.id)
    setShowCreate(true)
    setClientLabel(
      [fromLead.client_name, fromLead.client_company].filter(Boolean).join(' · '),
    )
    setNote(buildNoteFromLead(fromLead))
    const cap = fromLead.budget_band ? BUDGET_CAP_HINT[fromLead.budget_band] ?? '' : ''
    if (cap) setBudgetCap(cap)
    setModule(
      inferModuleFromLead(
        {
          source_slug: fromLead.source_slug,
          requirement_summary: fromLead.requirement_summary,
          client_company: fromLead.client_company,
        },
        fromLead.preferredModule,
      ),
    )
    if (!embedded) navigate(location.pathname, { replace: true, state: {} })
  }, [embedded, location.pathname, navigate])

  useEffect(() => {
    const fromState = (location.state as { fromLead?: LeadQuickSharePrefill } | null)?.fromLead
    const fromLead = fromState ?? consumeLeadQuickSharePrefill()
    if (!fromLead) return
    applyLeadPrefill(fromLead)
  }, [location.state, applyLeadPrefill])

  const loadListings = useCallback(async (mod: Extract<ModuleId, 'gifting' | 'events'>) => {
    setLoadingListings(true)
    const { data } = await db.listings.listByModuleWithCategories(mod, 'active')
    setListings((data ?? []) as ListingRow[])
    setSelectedIds(new Set())
    setLoadingListings(false)
  }, [])

  const categoryName = (row: ListingRow): string | null => {
    const cat = row.listing_categories
    if (!cat) return null
    if (Array.isArray(cat)) return cat[0]?.name ?? null
    return cat.name ?? null
  }

  const visibleListings = useMemo(() => {
    return listings.filter((row) => {
      const kind = inferListingCatalogKind(categoryName(row), row.metadata)
      return matchesListingCatalogFilter(kind, catalogFilter)
    })
  }, [listings, catalogFilter])

  const selectAllVisible = () => {
    setSelectedIds(new Set(visibleListings.map((l) => l.id)))
  }

  useEffect(() => {
    if (showCreate) void loadListings(module)
  }, [showCreate, module, loadListings])

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (selectedIds.size === 0) {
      setNotice('Pick at least one listing.')
      return
    }
    setCreating(true)
    setNotice('')
    const expiresAt = new Date(
      Date.now() + Math.max(1, Number(expiresIn) || 48) * 60 * 60 * 1000,
    ).toISOString()
    const { data: share, error } = await db.quickShares.create(profile.id, module, {
      client_label: clientLabel.trim() || null,
      custom_note: note.trim() || null,
      budget_cap: budgetCap ? Number(budgetCap) : null,
      expires_at: expiresAt,
    })
    if (error || !share) {
      setNotice(error?.message ?? 'Failed to create share.')
      setCreating(false)
      return
    }
    const items = Array.from(selectedIds).map((listing_id, idx) => ({
      listing_id,
      display_order: idx,
    }))
    const { error: itemError } = await db.quickShares.setItems(share.id, items)
    const wasFromLead = Boolean(linkedLeadId)
    setCreating(false)
    if (itemError) {
      setNotice(`Created share but item insert failed: ${itemError.message}`)
    } else {
      let leadNote = ''
      if (linkedLeadId) {
        const { error: leadErr } = await markLeadCatalogueSent(linkedLeadId, undefined, share.id)
        if (leadErr) leadNote = ` (lead update failed: ${leadErr})`
        else setLinkedLeadId(null)
      }
      setNotice(`Share created. Token: ${share.token}${leadNote}`)
    }
    setShowCreate(false)
    setSelectedIds(new Set())
    setClientLabel('')
    setNote('')
    setBudgetCap('')
    await load()
    navigate(`/admin/quick-share/${share.id}`, {
      state: wasFromLead || embedded ? { returnToLeads: true } : undefined,
    })
  }

  if (!isAuthorised) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Quick Share is restricted to admin / support / sales agent roles.
      </div>
    )
  }

  const activeCount = shares.filter((s) => s.status === 'active').length

  const shellClass = embedded ? 'space-y-5' : LEAD_OPS.page

  return (
    <div className={shellClass}>
      {!embedded ? (
        <LeadOpsPageHeader
          eyebrow="Client catalogue"
          title="Quick Share"
          description="Select gifting or events listings, generate a share link, and let the client choose options — no login required."
          actions={
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className={LEAD_OPS.primaryBtn}
              aria-expanded={showCreate}
            >
              <Plus className="size-4" />
              {showCreate ? 'Close builder' : 'New share'}
            </button>
          }
          footer={
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{activeCount}</span> active shares ·{' '}
              <span className="font-semibold text-slate-900">{shares.length}</span> total
            </p>
          }
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{activeCount}</span> active ·{' '}
            <span className="font-semibold text-slate-900">{shares.length}</span> total
          </p>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className={LEAD_OPS.primaryBtn}
            aria-expanded={showCreate}
          >
            <Plus className="size-4" />
            {showCreate ? 'Close builder' : 'New share'}
          </button>
        </div>
      )}

      {notice ? (
        <LeadOpsBanner
          variant={
            notice.toLowerCase().includes('fail') || notice.toLowerCase().includes('error')
              ? 'error'
              : 'success'
          }
        >
          {notice}
        </LeadOpsBanner>
      ) : null}

      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className={`${LEAD_OPS.surfaceElevated} space-y-4 p-5 sm:p-6`}
        >
          {linkedLeadId ? (
            <LeadOpsBanner variant="info" title="Catalogue for lead">
              <ol className="list-decimal space-y-1 pl-4">
                <li>Choose Gifting or Events (module chips below).</li>
                <li>Tick listings to include, or use Select all visible.</li>
                <li>Generate link — the lead is marked catalogue sent automatically.</li>
              </ol>
              <Link
                to="/admin/leads?tab=inbox"
                className="mt-2 inline-block text-sm font-semibold text-[#1D4ED8] underline hover:text-[#1E3A8A]"
              >
                ← Back to lead inbox
              </Link>
            </LeadOpsBanner>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset className="lg:col-span-2">
              <legend className={LEAD_OPS.sectionTitle}>Module</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ENQUIRY_MODULES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModule(m)}
                    aria-pressed={module === m}
                    className={`${LEAD_OPS.chip} capitalize ${
                      module === m
                        ? m === 'gifting'
                          ? LEAD_OPS.moduleAccentGifting
                          : LEAD_OPS.moduleAccentEvents
                        : 'border-slate-200/90 bg-white/70 text-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Client label (admin-only)</span>
              <input
                className={LEAD_OPS.input}
                value={clientLabel}
                onChange={(e) => setClientLabel(e.target.value)}
                placeholder="Walk-in: Acme HR"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Expires in (hours)</span>
              <input
                type="number"
                min="1"
                max="720"
                className={LEAD_OPS.input}
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Budget cap ₹ (admin-only)</span>
              <input
                type="number"
                className={LEAD_OPS.input}
                value={budgetCap}
                onChange={(e) => setBudgetCap(e.target.value)}
                placeholder="optional"
              />
            </label>
            <label className="block space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Note / greeting</span>
              <input
                className={LEAD_OPS.input}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Curated picks for your event"
              />
            </label>
          </div>

          <div className={`${LEAD_OPS.surface} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Options to share</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {module} · {visibleListings.length} visible ·{' '}
                  <span className="font-semibold text-[#2563EB]">{selectedIds.size} selected</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'services', 'products'] as ListingCatalogKind[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setCatalogFilter(f)}
                    aria-pressed={catalogFilter === f}
                    className={`${leadOpsChipClass(catalogFilter === f)} min-h-[32px] capitalize`}
                  >
                    {f}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={selectAllVisible}
                  disabled={visibleListings.length === 0}
                  className={`${LEAD_OPS.secondaryBtn} min-h-[36px] px-3 text-xs disabled:opacity-40`}
                >
                  Select all visible
                </button>
                {loadingListings ? (
                  <Loader2 className="size-4 animate-spin text-slate-400" aria-label="Loading listings" />
                ) : null}
              </div>
            </div>
            <ListingPicker
              listings={visibleListings}
              selected={selectedIds}
              onToggle={toggle}
              categoryName={categoryName}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className={LEAD_OPS.secondaryBtn}>
              Cancel
            </button>
            <button type="submit" disabled={creating} className={LEAD_OPS.primaryBtn}>
              {creating ? <Loader2 className="size-4 animate-spin" /> : null}
              Generate link
            </button>
          </div>
        </form>
      ) : null}

      <div className={LEAD_OPS.tableWrap}>
        {loading ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" aria-label="Loading shares" />
            Loading...
          </div>
        ) : shares.length === 0 ? (
          <LeadOpsEmptyState
            icon={<Share2 className="size-7" aria-hidden />}
            title="No quick shares yet"
            description="Curate gifting or events listings and generate a client link for WhatsApp, email, or chat."
            action={
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className={LEAD_OPS.primaryBtn}
              >
                <Plus className="size-4" />
                New share
              </button>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Label</th>
                <th className="py-3 pr-3">Module</th>
                <th className="py-3 pr-3">Expires</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4 pr-3">
                    <p className="font-medium text-slate-900">{s.client_label ?? '—'}</p>
                    <p className="text-[11px] text-slate-500">{s.custom_note ?? ''}</p>
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{s.module}</td>
                  <td className="py-3 pr-3 text-slate-700">{fmt(s.expires_at)}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        s.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Link
                      to={`/admin/quick-share/${s.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Manage
                    </Link>
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

function ListingPicker({
  listings,
  selected,
  onToggle,
  categoryName,
}: {
  listings: ListingRow[]
  selected: Set<string>
  onToggle: (id: string) => void
  categoryName: (row: ListingRow) => string | null
}) {
  if (listings.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        No active listings in this module. Publish gifting or events listings first.
      </p>
    )
  }
  return (
    <ul className="max-h-[min(420px,50vh)] divide-y divide-slate-100 overflow-y-auto">
      {listings.map((l) => {
        const on = selected.has(l.id)
        const cat = categoryName(l)
        const kind = inferListingCatalogKind(cat, l.metadata)
        const kindLabel = kind === 'product' ? 'Product' : kind === 'service' ? 'Service' : 'Listing'
        return (
          <li key={l.id}>
            <label className="flex cursor-pointer items-center gap-3 p-4 transition hover:bg-slate-50">
            <input
              type="checkbox"
              checked={on}
              onChange={() => onToggle(l.id)}
              className="size-5 shrink-0 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{l.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                <span className="font-semibold text-slate-600">{kindLabel}</span>
                {cat ? ` · ${cat}` : ''} · {l.location_city ?? '—'} ·{' '}
                {l.base_price != null ? `₹ ${l.base_price.toLocaleString('en-IN')}` : 'on request'}
              </p>
            </div>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2, Plus } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { CORP } from '@/app/lib/adminTheme'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Listing, ModuleId, QuickShare } from '@/lib/database.types'

const MODULES: ModuleId[] = ['events', 'gifting', 'spacex_coworking', 'spacex_stay']

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

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

export default function AdminQuickSharePage() {
  const navigate = useNavigate()
  const { profile, role } = useAuth()
  const isAuthorised = role === 'mogzu_admin' || role === 'support' || role === 'sales_agent'

  const [shares, setShares] = useState<QuickShare[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  // Create form state
  const [module, setModule] = useState<ModuleId>('events')
  const [clientLabel, setClientLabel] = useState('')
  const [note, setNote] = useState('')
  const [budgetCap, setBudgetCap] = useState('')
  const [expiresIn, setExpiresIn] = useState('48')
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loadingListings, setLoadingListings] = useState(false)

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

  const loadListings = useCallback(async (mod: ModuleId) => {
    setLoadingListings(true)
    const { data } = await db.listings.listByModule(mod, 'active')
    setListings((data ?? []) as Listing[])
    setSelectedIds(new Set())
    setLoadingListings(false)
  }, [])

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
    setCreating(false)
    if (itemError) {
      setNotice(`Created share but item insert failed: ${itemError.message}`)
    } else {
      setNotice(`Share created. Token: ${share.token}`)
    }
    setShowCreate(false)
    setSelectedIds(new Set())
    setClientLabel('')
    setNote('')
    setBudgetCap('')
    await load()
    navigate(`/admin/quick-share/${share.id}`)
  }

  if (!isAuthorised) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Quick Share is restricted to admin / support / sales agent roles.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow
          title="Quick Share Catalogue"
          totalLabel={`${shares.filter((s) => s.status === 'active').length} active · ${shares.length} total`}
        />
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" /> New share
        </button>
      </div>

      {notice && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {notice}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="block space-y-1 sm:col-span-1">
              <span className="text-xs font-medium text-slate-700">Module</span>
              <select
                className={inputClass}
                value={module}
                onChange={(e) => setModule(e.target.value as ModuleId)}
              >
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-slate-700">Client label (admin-only)</span>
              <input
                className={inputClass}
                value={clientLabel}
                onChange={(e) => setClientLabel(e.target.value)}
                placeholder="Walk-in: Acme HR"
              />
            </label>
            <label className="block space-y-1 sm:col-span-1">
              <span className="text-xs font-medium text-slate-700">Expires in (hours)</span>
              <input
                type="number"
                min="1"
                max="720"
                className={inputClass}
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              />
            </label>
            <label className="block space-y-1 sm:col-span-1">
              <span className="text-xs font-medium text-slate-700">Budget cap ₹ (admin-only)</span>
              <input
                type="number"
                className={inputClass}
                value={budgetCap}
                onChange={(e) => setBudgetCap(e.target.value)}
                placeholder="optional"
              />
            </label>
            <label className="block space-y-1 sm:col-span-3">
              <span className="text-xs font-medium text-slate-700">Note / greeting</span>
              <input
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Curated picks for your event"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3 text-xs">
              <span className="font-semibold text-slate-700">
                Listings ({selectedIds.size} selected)
              </span>
              {loadingListings && <Loader2 className="size-3 animate-spin text-slate-400" />}
            </div>
            <ListingPicker listings={listings} selected={selectedIds} onToggle={toggle} />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating && <Loader2 className="size-3 animate-spin" />}
              Generate link
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading...
          </div>
        ) : shares.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No quick shares yet. Curate a few listings and generate a link to send via WhatsApp,
            Telegram, or Email.
          </p>
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
}: {
  listings: Listing[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  if (listings.length === 0) {
    return <p className="p-4 text-xs text-slate-500">No active listings in this module.</p>
  }
  return (
    <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto text-xs">
      {listings.map((l) => {
        const on = selected.has(l.id)
        return (
          <li
            key={l.id}
            className="flex cursor-pointer items-center gap-2 p-3 hover:bg-slate-50"
            onClick={() => onToggle(l.id)}
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => onToggle(l.id)}
              className="size-4"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{l.title}</p>
              <p className="truncate text-[11px] text-slate-500">
                {l.location_city ?? '—'} ·{' '}
                {l.base_price != null ? `₹ ${l.base_price.toLocaleString('en-IN')}` : 'on request'}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Cake,
  CheckCircle2,
  Loader2,
  PauseCircle,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  CelebrationEvent,
  CelebrationStatus,
  Listing,
} from '@/lib/database.types'

type Row = CelebrationEvent & {
  employees: {
    full_name: string | null
    email: string | null
    department: string | null
  } | null
  listings: { title: string | null; base_price: number | null } | null
  override: { title: string | null; base_price: number | null } | null
}

const STATUS_LABEL: Record<CelebrationStatus, string> = {
  scheduled: 'Auto fire',
  personalised: 'Personalised',
  suppressed: 'Suppressed',
  fired: 'Sent',
  failed: 'Failed',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today.getTime()) / 86_400_000)
}

export default function ManagerCelebrationsPage() {
  const navigate = useNavigate()
  const { profile, corporateId, role } = useAuth()
  const canManage = role === 'l2_manager' || role === 'l3_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Row | null>(null)

  const load = useCallback(async () => {
    if (!profile || !corporateId) return
    setLoading(true)
    const [cRes, lRes] = await Promise.all([
      db.celebrations.listForManager(profile.id),
      db.listings.listByModule('gifting', 'active'),
    ])
    setRows((cRes.data ?? []) as Row[])
    setListings((lRes.data ?? []) as Listing[])
    setLoading(false)
  }, [profile, corporateId])

  useEffect(() => {
    load()
  }, [load])

  if (!canManage) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <p className="text-sm text-amber-800">Manager access required.</p>
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

            <div className="mb-6">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                <Cake className="size-5" />
                Team celebrations
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Upcoming milestones on your team. Personalise the message or gift, or mark a
                celebration as handled externally to suppress the automated send.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Cake className="mx-auto mb-2 size-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No upcoming celebrations</p>
                <p className="mt-1 text-sm text-slate-500">
                  L3 Admin sets celebration rules; the cron seeds events 30 days out.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {rows.map((r) => {
                  const days = daysUntil(r.trigger_date)
                  const useOverride = r.listing_id_override && r.override
                  const gift = useOverride ? r.override : r.listings
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-full bg-rose-50 text-rose-700">
                        <p className="text-[10px] uppercase">
                          {new Date(r.trigger_date).toLocaleDateString('en-IN', {
                            month: 'short',
                          })}
                        </p>
                        <p className="text-lg font-bold">
                          {new Date(r.trigger_date).getDate()}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {r.employees?.full_name ?? 'Team member'}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {r.occasion_name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              r.status === 'personalised'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {STATUS_LABEL[r.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}{' '}
                          · Gift: <strong>{gift?.title ?? '—'}</strong>
                          {gift?.base_price != null && (
                            <span> · ₹{gift.base_price.toLocaleString('en-IN')}</span>
                          )}
                          {useOverride && (
                            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                              <Sparkles className="size-3" />
                              Personalised
                            </span>
                          )}
                        </p>
                        {r.manager_message && (
                          <p className="mt-1 truncate text-xs text-slate-600 italic">
                            "{r.manager_message}"
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setEditing(r)}
                          className="rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {r.status === 'personalised' ? 'Edit' : 'Personalise'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const reason = window.prompt(
                              'Mark as handled externally? Reason (optional):',
                            )
                            if (reason === null) return
                            await db.celebrations.suppress(r.id, reason || 'Handled externally')
                            load()
                          }}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Suppress
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {editing && (
        <PersonaliseModal
          event={editing}
          listings={listings}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function PersonaliseModal({
  event,
  listings,
  onClose,
  onSaved,
}: {
  event: Row
  listings: Listing[]
  onClose: () => void
  onSaved: () => void
}) {
  const [message, setMessage] = useState(event.manager_message ?? '')
  const [listingId, setListingId] = useState(event.listing_id_override ?? '')
  const [budget, setBudget] = useState(
    event.budget_override != null ? String(event.budget_override) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { error: err } = await db.celebrations.personalise(event.id, {
      manager_message: message.trim() || null,
      listing_id_override: listingId || null,
      budget_override: budget ? Number(budget) : null,
    })
    setSaving(false)
    if (err) setError(err.message)
    else onSaved()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Personalise for {event.employees?.full_name ?? 'team member'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Personal message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              rows={3}
              placeholder={`Happy birthday, ${event.employees?.full_name ?? 'colleague'}!`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
            <p className="mt-1 text-[11px] text-slate-400">{message.length}/200</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Gift override (optional)
            </label>
            <select
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            >
              <option value="">— Keep default —</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                  {l.base_price != null ? ` (₹${l.base_price.toLocaleString('en-IN')})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Budget override (₹, optional)
            </label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Upgrade within company policy"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              <CheckCircle2 className="size-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

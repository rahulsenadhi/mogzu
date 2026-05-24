// Phase 5 Feature 5 — admin global + per-corporate spend-cap policy.
//
// Lists every ai_autonomy_settings row + every corporate that lacks one.
// Admins can edit spend_cap_inr / blocked_categories / is_enabled inline.
// Bulk default action seeds the platform-wide defaults (cap 50000, no
// blocklist, disabled) into corporates that haven't set anything yet.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, AlertCircle } from 'lucide-react'
import { AdminAiNavChips } from '@/app/components/admin/AdminAiNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_MODULE_CONTAINER,
  filterStatChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import {
  listAllSettings,
  upsertSettings,
  type AiAutonomySettings,
} from '@/lib/aiAutonomy'

const DEMO_SETTINGS: AiAutonomySettings[] = [
  {
    corporate_id: 'demo-corp-1',
    is_enabled: true,
    spend_cap_inr: 75000,
    blocked_categories: ['alcohol', 'gambling'],
    updated_by: null,
    updated_at: new Date().toISOString(),
  },
  {
    corporate_id: 'demo-corp-2',
    is_enabled: false,
    spend_cap_inr: 50000,
    blocked_categories: ['weapons'],
    updated_by: null,
    updated_at: new Date().toISOString(),
  },
]

type CorpRow = { id: string; name: string }

const DEMO_CORPS: CorpRow[] = [
  { id: 'demo-corp-1', name: 'Acme Corp (demo)' },
  { id: 'demo-corp-2', name: 'Globex Industries (demo)' },
  { id: 'demo-corp-3', name: 'Unconfigured Corp (demo)' },
]

const PLATFORM_DEFAULT_CAP = 50_000

type RowDraft = {
  is_enabled: boolean
  spend_cap_inr: number
  blocked_categories: string
}

function toDraft(s: AiAutonomySettings): RowDraft {
  return {
    is_enabled: s.is_enabled,
    spend_cap_inr: s.spend_cap_inr,
    blocked_categories: s.blocked_categories.join(', '),
  }
}

export default function AdminAiPolicyPage() {
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [settings, setSettings] = useState<AiAutonomySettings[]>([])
  const [corps, setCorps] = useState<CorpRow[]>([])
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [globalCap, setGlobalCap] = useState<number>(PLATFORM_DEFAULT_CAP)
  const [globalBlocked, setGlobalBlocked] = useState('')
  const [usingDemo, setUsingDemo] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: s, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      listAllSettings(),
      corporateAccounts.list(),
    ])
    const corpRows =
      ((c ?? []) as { id: string; name: string }[]).map((r) => ({ id: r.id, name: r.name })) ?? []
    if (s.length === 0 && corpRows.length === 0 && !e1) {
      setSettings(DEMO_SETTINGS)
      setCorps(DEMO_CORPS)
      setUsingDemo(true)
      const next: Record<string, RowDraft> = {}
      for (const row of DEMO_SETTINGS) next[row.corporate_id] = toDraft(row)
      setDrafts(next)
    } else {
      setSettings(s)
      setCorps(corpRows)
      setUsingDemo(false)
      const next: Record<string, RowDraft> = {}
      for (const row of s) next[row.corporate_id] = toDraft(row)
      setDrafts(next)
    }
    if (e1 || e2?.message) setError(e1 || e2?.message || '')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const corpName = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of corps) m.set(c.id, c.name)
    return m
  }, [corps])

  const orphans = useMemo(() => {
    const set = new Set(settings.map((s) => s.corporate_id))
    return corps.filter((c) => !set.has(c.id))
  }, [corps, settings])

  const saveRow = useCallback(
    async (corporateId: string) => {
      const draft = drafts[corporateId]
      if (!draft) return
      setBusy(corporateId)
      setError('')
      const blocked_categories = draft.blocked_categories
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0)
      const { error: err } = await upsertSettings({
        corporate_id: corporateId,
        is_enabled: draft.is_enabled,
        spend_cap_inr: draft.spend_cap_inr,
        blocked_categories,
        updated_by: profile?.id ?? null,
      })
      setBusy(null)
      if (err) setError(err)
      else void load()
    },
    [drafts, profile?.id, load],
  )

  const seedOrphans = useCallback(async () => {
    setBusy('seed')
    setError('')
    const blocked_categories = globalBlocked
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0)
    for (const c of orphans) {
      await upsertSettings({
        corporate_id: c.id,
        is_enabled: false,
        spend_cap_inr: globalCap,
        blocked_categories,
        updated_by: profile?.id ?? null,
      })
    }
    setBusy(null)
    void load()
  }, [orphans, globalCap, globalBlocked, profile?.id, load])

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">mogzu_admin role required.</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="AI spend policy"
          totalLabel={
            loading ? 'Loading…' : `${settings.length} configured · ${orphans.length} unconfigured`
          }
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Global defaults and per-corporate spend caps for autonomous AI booking.
        </p>
        <div className="mt-4">
          <AdminAiNavChips active="policy" />
        </div>
      </div>

      {usingDemo && (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-800">
          Showing demo policy rows — connect Supabase to persist edits.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className={filterStatChipClass(true, 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">Configured</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{settings.length}</p>
        </div>
        <div className={filterStatChipClass(orphans.length > 0, 'rose')}>
          <p className="text-xs uppercase tracking-wider text-rose-700">Unconfigured</p>
          <p className="text-2xl font-bold text-rose-700">{orphans.length}</p>
        </div>
      </section>

      <section className={MOGZU_FILTER_SIDEBAR}>
        <h2 className="text-sm font-bold text-[#0e1e3f]">Platform defaults</h2>
        <p className="mt-1 text-xs text-slate-500">
          Used to seed unconfigured corporates. Does not retroactively change rows already set.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">Default spend cap (INR)</span>
            <input
              type="number"
              min={0}
              value={globalCap}
              onChange={(e) => setGlobalCap(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">Default blocked categories</span>
            <input
              type="text"
              value={globalBlocked}
              onChange={(e) => setGlobalBlocked(e.target.value)}
              placeholder="alcohol, gambling, weapons"
              className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy === 'seed' || orphans.length === 0}
          onClick={() => void seedOrphans()}
          className={`mt-4 ${MOGZU_CTA_GRADIENT} disabled:opacity-40`}
        >
          {busy === 'seed'
            ? 'Seeding…'
            : `Seed ${orphans.length} unconfigured corporate${orphans.length === 1 ? '' : 's'}`}
        </button>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
          <header className="border-b border-white/60 bg-white/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#0e1e3f]">
            Per-corporate overrides
          </header>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Corporate</th>
                <th className="px-4 py-3">Autonomy</th>
                <th className="px-4 py-3 text-right">Cap (INR)</th>
                <th className="px-4 py-3">Blocked categories</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => {
                const draft = drafts[s.corporate_id] ?? toDraft(s)
                const dirty =
                  draft.is_enabled !== s.is_enabled ||
                  draft.spend_cap_inr !== s.spend_cap_inr ||
                  draft.blocked_categories !== s.blocked_categories.join(', ')
                return (
                  <tr key={s.corporate_id} className="border-b border-slate-100/80 last:border-0 hover:bg-white/50">
                    <td className="px-4 py-3 font-semibold text-[#0e1e3f]">
                      {corpName.get(s.corporate_id) ?? s.corporate_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={draft.is_enabled}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [s.corporate_id]: { ...draft, is_enabled: e.target.checked },
                            }))
                          }
                        />
                        <span className="text-xs text-slate-600">
                          {draft.is_enabled ? 'Enabled' : 'Kill switch off'}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        value={draft.spend_cap_inr}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [s.corporate_id]: {
                              ...draft,
                              spend_cap_inr: parseInt(e.target.value, 10) || 0,
                            },
                          }))
                        }
                        className="w-28 rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-right text-xs backdrop-blur-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={draft.blocked_categories}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [s.corporate_id]: {
                              ...draft,
                              blocked_categories: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g. alcohol, gambling"
                        className="w-full rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-xs backdrop-blur-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busy === s.corporate_id || !dirty}
                        onClick={() => void saveRow(s.corporate_id)}
                        className={`${MOGZU_CTA_GRADIENT} !px-3 !py-1 !text-xs disabled:opacity-40`}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                )
              })}
              {settings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">
                    No corporates have configured AI autonomy yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

// Phase 5 Feature 5 — admin global + per-corporate spend-cap policy.
//
// Lists every ai_autonomy_settings row + every corporate that lacks one.
// Admins can edit spend_cap_inr / blocked_categories / is_enabled inline.
// Bulk default action seeds the platform-wide defaults (cap 50000, no
// blocklist, disabled) into corporates that haven't set anything yet.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, AlertCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import {
  listAllSettings,
  upsertSettings,
  type AiAutonomySettings,
} from '@/lib/aiAutonomy'

const PLATFORM_DEFAULT_CAP = 50_000

type CorpRow = { id: string; name: string }

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

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: s, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      listAllSettings(),
      corporateAccounts.list(),
    ])
    setSettings(s)
    setCorps(
      ((c ?? []) as { id: string; name: string }[]).map((r) => ({ id: r.id, name: r.name })),
    )
    const next: Record<string, RowDraft> = {}
    for (const row of s) next[row.corporate_id] = toDraft(row)
    setDrafts(next)
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
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="AI autonomy policy"
          totalLabel={
            loading ? 'Loading…' : `${settings.length} configured · ${orphans.length} unconfigured`
          }
        />

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Platform defaults</h2>
          <p className="mt-1 text-xs text-slate-500">
            Used to seed unconfigured corporates. Does not retroactively change rows already set.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Default spend cap (INR)
              </span>
              <input
                type="number"
                min={0}
                value={globalCap}
                onChange={(e) => setGlobalCap(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Default blocked categories
              </span>
              <input
                type="text"
                value={globalBlocked}
                onChange={(e) => setGlobalBlocked(e.target.value)}
                placeholder="alcohol, gambling, weapons"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy === 'seed' || orphans.length === 0}
            onClick={() => void seedOrphans()}
            className="mt-4 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy === 'seed'
              ? 'Seeding…'
              : `Seed ${orphans.length} unconfigured corporate${orphans.length === 1 ? '' : 's'}`}
          </button>
        </section>

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <header className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Per-corporate overrides
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Corporate</th>
                  <th className="px-4 py-2">Autonomy</th>
                  <th className="px-4 py-2 text-right">Cap (INR)</th>
                  <th className="px-4 py-2">Blocked categories</th>
                  <th className="px-4 py-2 text-right">Action</th>
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
                    <tr key={s.corporate_id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {corpName.get(s.corporate_id) ?? s.corporate_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-2">
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
                            {draft.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-2 text-right">
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
                          className="w-28 rounded-md border border-slate-200 px-2 py-1 text-right text-xs"
                        />
                      </td>
                      <td className="px-4 py-2">
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
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          disabled={busy === s.corporate_id || !dirty}
                          onClick={() => void saveRow(s.corporate_id)}
                          className="rounded-md bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {settings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                      No corporates have configured AI autonomy yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}

// Phase 4 Feature 3 — admin FX rate + margin breakdown.
//
// Read-write table of currencies + fx_rate (1 unit = N INR base). Admins
// can manually edit a rate (used when the N8N nightly refresh stalls or
// when applying a margin spread). Also surfaces fx_updated_at so we know
// staleness at a glance.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, AlertCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  listAllCurrencies,
  setCurrencyActive,
  updateCurrencyFxRate,
  type Currency,
} from '@/lib/currencies'

const BASE_INTERBANK: Record<string, number> = {
  // Indicative interbank rates as of build time. Used only to compute the
  // displayed margin against the row's stored fx_rate. The actual fx_rate
  // is the source of truth at booking time.
  INR: 1,
  USD: 83.0,
  SGD: 62.0,
  AED: 22.6,
  GBP: 104.5,
  EUR: 89.8,
}

function marginPct(code: string, fxRate: number): number | null {
  const base = BASE_INTERBANK[code]
  if (!base || base === 0) return null
  return ((fxRate - base) / base) * 100
}

function fmtMargin(pct: number | null): string {
  if (pct == null) return '—'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function fmtRelative(iso: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return 'just now'
  const mins = Math.floor(ms / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AdminFinanceFxPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'account_manager'

  const [rows, setRows] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await listAllCurrencies()
    setRows(data)
    setError(err ?? '')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin, load])

  const summary = useMemo(() => {
    const stale = rows.filter((r) => {
      if (!r.fx_updated_at) return true
      return Date.now() - new Date(r.fx_updated_at).getTime() > 36 * 60 * 60 * 1000
    }).length
    return { total: rows.length, active: rows.filter((r) => r.is_active).length, stale }
  }, [rows])

  const saveRate = useCallback(
    async (code: string) => {
      const raw = drafts[code]
      if (raw === undefined) return
      const n = parseFloat(raw)
      if (!Number.isFinite(n) || n <= 0) {
        setError(`fx_rate for ${code} must be positive`)
        return
      }
      setBusy(code)
      setError('')
      const { error: err } = await updateCurrencyFxRate(code, n)
      setBusy(null)
      if (err) setError(err)
      else {
        setDrafts((d) => {
          const next = { ...d }
          delete next[code]
          return next
        })
        void load()
      }
    },
    [drafts, load],
  )

  const toggleActive = useCallback(
    async (code: string, next: boolean) => {
      setBusy(code)
      setError('')
      const { error: err } = await setCurrencyActive(code, next)
      setBusy(null)
      if (err) setError(err)
      else void load()
    },
    [load],
  )

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / account manager role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <AdminPageTitleRow
          title="FX Rates"
          totalLabel={loading ? 'Loading…' : `${summary.active}/${summary.total} active`}
        />

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Total currencies</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-700">{summary.active}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Stale (&gt; 36h)
            </p>
            <p className="text-2xl font-bold text-amber-700">{summary.stale}</p>
          </div>
        </section>

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2 text-right">FX → INR</th>
                  <th className="px-4 py-2 text-right">Interbank</th>
                  <th className="px-4 py-2 text-right">Margin</th>
                  <th className="px-4 py-2">Updated</th>
                  <th className="px-4 py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const interbank = BASE_INTERBANK[r.code] ?? null
                  const margin = marginPct(r.code, Number(r.fx_rate))
                  const draft = drafts[r.code]
                  const isDirty = draft !== undefined && parseFloat(draft) !== Number(r.fx_rate)
                  return (
                    <tr key={r.code} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2 font-mono font-semibold text-slate-900">
                        {r.code}
                      </td>
                      <td className="px-4 py-2 text-slate-600">{r.symbol}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          step="0.0001"
                          min={0}
                          disabled={busy === r.code || r.code === 'INR'}
                          value={draft ?? Number(r.fx_rate)}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [r.code]: e.target.value }))
                          }
                          className="w-28 rounded-md border border-slate-200 px-2 py-1 text-right font-mono text-xs"
                        />
                        {isDirty && (
                          <button
                            type="button"
                            disabled={busy === r.code}
                            onClick={() => void saveRate(r.code)}
                            className="ml-2 rounded-md bg-[#2563eb] px-2 py-1 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs text-slate-500">
                        {interbank?.toFixed(2) ?? '—'}
                      </td>
                      <td
                        className={`px-4 py-2 text-right font-mono text-xs ${
                          margin == null
                            ? 'text-slate-400'
                            : margin > 1
                              ? 'text-emerald-700'
                              : margin < -1
                                ? 'text-rose-700'
                                : 'text-slate-600'
                        }`}
                      >
                        {fmtMargin(margin)}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500">
                        {fmtRelative(r.fx_updated_at)}
                      </td>
                      <td className="px-4 py-2">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={r.is_active}
                            disabled={busy === r.code || r.code === 'INR'}
                            onChange={(e) => void toggleActive(r.code, e.target.checked)}
                          />
                          <span className="text-xs text-slate-600">
                            {r.is_active ? 'Yes' : 'No'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  )
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                      No currencies configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Manual edits stamp <code>fx_updated_at</code> immediately. The N8N nightly refresh
          via <code>update_currency_fx_rates()</code> overrides these on the next run.
        </p>
      </div>
    </div>
  )
}

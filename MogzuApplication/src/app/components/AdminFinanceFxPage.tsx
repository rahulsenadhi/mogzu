// Phase 4 Feature 3 — admin FX rate + margin breakdown.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react'
import { AdminFinanceNavChips } from '@/app/components/admin/AdminFinanceNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_MODULE_CONTAINER,
  filterStatChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import {
  listAllCurrencies,
  setCurrencyActive,
  updateCurrencyFxRate,
  type Currency,
} from '@/lib/currencies'

const BASE_INTERBANK: Record<string, number> = {
  INR: 1,
  USD: 83.0,
  SGD: 62.0,
  AED: 22.6,
  GBP: 104.5,
  EUR: 89.8,
}

const DEMO_CURRENCIES: Currency[] = [
  {
    code: 'INR',
    symbol: '₹',
    decimal_places: 2,
    fx_rate: 1,
    is_active: true,
    fx_updated_at: new Date().toISOString(),
    display_order: 1,
  },
  {
    code: 'USD',
    symbol: '$',
    decimal_places: 2,
    fx_rate: 83.12,
    is_active: true,
    fx_updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    display_order: 2,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    decimal_places: 2,
    fx_rate: 62.45,
    is_active: true,
    fx_updated_at: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    display_order: 3,
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    decimal_places: 2,
    fx_rate: 22.64,
    is_active: true,
    fx_updated_at: new Date().toISOString(),
    display_order: 4,
  },
  {
    code: 'GBP',
    symbol: '£',
    decimal_places: 2,
    fx_rate: 104.8,
    is_active: false,
    fx_updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    display_order: 5,
  },
]

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
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await listAllCurrencies()
    if (data.length === 0 && !err) {
      setRows(DEMO_CURRENCIES)
      setUsingDemo(true)
    } else {
      setRows(data)
      setUsingDemo(false)
    }
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
      if (usingDemo) {
        setError('Connect Supabase currencies table to persist FX edits.')
        return
      }
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
    [drafts, load, usingDemo],
  )

  const toggleActive = useCallback(
    async (code: string, next: boolean) => {
      if (usingDemo) {
        setRows((prev) => prev.map((r) => (r.code === code ? { ...r, is_active: next } : r)))
        return
      }
      setBusy(code)
      setError('')
      const { error: err } = await setCurrencyActive(code, next)
      setBusy(null)
      if (err) setError(err)
      else void load()
    },
    [load, usingDemo],
  )

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">Admin / account manager role required.</p>
      </div>
    )
  }

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow
          title="FX rates & margin"
          totalLabel={loading ? 'Loading…' : `${summary.active}/${summary.total} active`}
        />
        <p className="mt-1 text-[14px] text-[#64748b]">
          Customer-facing FX spread vs interbank reference. N8N nightly refresh overrides manual edits.
        </p>
        <div className="mt-4">
          <AdminFinanceNavChips active="fx" />
        </div>
      </div>

      {usingDemo && (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-800">
          Showing demo FX table — wire the currencies table to persist edits.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className={filterStatChipClass(true, 'blue')}>
          <p className="text-xs uppercase tracking-wider text-slate-500">Total currencies</p>
          <p className="text-2xl font-bold text-[#0e1e3f]">{summary.total}</p>
        </div>
        <div className={filterStatChipClass(false, 'emerald')}>
          <p className="text-xs uppercase tracking-wider text-emerald-700">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{summary.active}</p>
        </div>
        <div className={filterStatChipClass(summary.stale > 0, 'rose')}>
          <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-rose-700">
            <AlertTriangle className="size-3" /> Stale (&gt; 36h)
          </p>
          <p className="text-2xl font-bold text-rose-700">{summary.stale}</p>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <section className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60 bg-white/40 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3 text-right">FX → INR</th>
                <th className="px-4 py-3 text-right">Interbank</th>
                <th className="px-4 py-3 text-right">Margin</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const interbank = BASE_INTERBANK[r.code] ?? null
                const margin = marginPct(r.code, Number(r.fx_rate))
                const draft = drafts[r.code]
                const isDirty = draft !== undefined && parseFloat(draft) !== Number(r.fx_rate)
                return (
                  <tr key={r.code} className="border-b border-slate-100/80 last:border-0 hover:bg-white/50">
                    <td className="px-4 py-3 font-mono font-semibold text-[#0e1e3f]">{r.code}</td>
                    <td className="px-4 py-3 text-slate-600">{r.symbol}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="0.0001"
                        min={0}
                        disabled={busy === r.code || r.code === 'INR'}
                        value={draft ?? Number(r.fx_rate)}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.code]: e.target.value }))}
                        className="w-28 rounded-lg border border-white/70 bg-white/60 px-2 py-1 text-right font-mono text-xs backdrop-blur-sm"
                      />
                      {isDirty && (
                        <button
                          type="button"
                          disabled={busy === r.code}
                          onClick={() => void saveRate(r.code)}
                          className="ml-2 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-2 py-1 text-xs font-semibold text-white shadow-sm"
                        >
                          Save
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-500">
                      {interbank?.toFixed(2) ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-xs ${
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
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtRelative(r.fx_updated_at)}</td>
                    <td className="px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={r.is_active}
                          disabled={busy === r.code || r.code === 'INR'}
                          onChange={(e) => void toggleActive(r.code, e.target.checked)}
                        />
                        <span className="text-xs text-slate-600">{r.is_active ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">
                    No currencies configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <p className="text-xs text-slate-500">
        Manual edits stamp <code className="rounded bg-slate-100 px-1">fx_updated_at</code> immediately. The
        N8N nightly refresh via <code className="rounded bg-slate-100 px-1">update_currency_fx_rates()</code>{' '}
        overrides these on the next run.
      </p>
    </div>
  )
}

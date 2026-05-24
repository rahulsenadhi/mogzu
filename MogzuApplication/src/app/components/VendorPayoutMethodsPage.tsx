// Phase 4 Feature 3 — vendor self-serve payout method management.
//
// Vendors add and pick their primary settlement rail + currency.
// Admins still verify via AdminVendorPayoutsPage (markVerified). Multi-
// currency support: a vendor can list multiple rails (e.g. razorpay_x for
// INR settlements + wise for USD settlements) and the booking checkout
// stamps the correct settlement_currency / settlement_fx_rate based on
// the primary method for that currency.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Star,
  Trash2,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_MODULE_CONTAINER,
  MOGZU_PAGE_SUBTITLE,
  MOGZU_PAGE_TITLE,
  MOGZU_PRODUCT_CARD,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { listCurrencies, type Currency } from '@/lib/currencies'
import {
  PAYOUT_RAILS,
  createMethod,
  listMethods,
  maskAccount,
  removeMethod,
  setPrimary,
  type PayoutRail,
  type VendorPayoutMethod,
} from '@/lib/vendorPayouts'

const RAIL_LABEL: Record<PayoutRail, string> = {
  razorpay_x: 'Razorpay X (IN)',
  wise: 'Wise (multi-currency)',
  ach: 'ACH (US)',
  fast_sg: 'FAST (SG)',
  sepa: 'SEPA (EU)',
  manual: 'Manual',
}

export default function VendorPayoutMethodsPage() {
  const { vendorId } = useAuth()
  const [methods, setMethods] = useState<VendorPayoutMethod[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [form, setForm] = useState<{
    currency: string
    rail: PayoutRail
    account_holder: string
    account_number: string
    routing_info: string
    is_primary: boolean
  }>({
    currency: 'INR',
    rail: 'razorpay_x',
    account_holder: '',
    account_number: '',
    routing_info: '',
    is_primary: false,
  })

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    setError('')
    const [{ data, error: err }, list] = await Promise.all([
      listMethods(vendorId),
      listCurrencies(),
    ])
    setMethods(data)
    setCurrencies(list)
    setError(err ?? '')
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    void load()
  }, [load])

  const addMethod = useCallback(async () => {
    if (!vendorId) return
    if (!form.account_holder.trim() || !form.account_number.trim()) {
      setError('Account holder + number are required')
      return
    }
    let routing: Record<string, unknown> = {}
    if (form.routing_info.trim()) {
      try {
        routing = JSON.parse(form.routing_info)
      } catch {
        setError('Routing info must be valid JSON ({"key":"value"}). Leave blank if none.')
        return
      }
    }
    setBusy('add')
    setError('')
    const { error: err } = await createMethod({
      vendor_id: vendorId,
      currency: form.currency,
      rail: form.rail,
      account_holder: form.account_holder.trim(),
      account_number: form.account_number.trim(),
      routing_info: routing,
      is_primary: form.is_primary,
    })
    setBusy(null)
    if (err) setError(err)
    else {
      setForm({
        currency: 'INR',
        rail: 'razorpay_x',
        account_holder: '',
        account_number: '',
        routing_info: '',
        is_primary: false,
      })
      void load()
    }
  }, [vendorId, form, load])

  const promote = useCallback(
    async (id: string) => {
      if (!vendorId) return
      setBusy(id)
      const { error: err } = await setPrimary(vendorId, id)
      setBusy(null)
      if (err) setError(err)
      else void load()
    },
    [vendorId, load],
  )

  const drop = useCallback(
    async (id: string) => {
      if (!confirm('Remove this payout method?')) return
      setBusy(id)
      const { error: err } = await removeMethod(id)
      setBusy(null)
      if (err) setError(err)
      else void load()
    },
    [load],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, VendorPayoutMethod[]>()
    for (const m of methods) {
      const arr = map.get(m.currency) ?? []
      arr.push(m)
      map.set(m.currency, arr)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [methods])

  if (!vendorId) {
    return (
      <VendorAppShell activeNav="orders" routeSource="vendor-payout-methods">
        <main className="flex min-h-full items-center justify-center bg-transparent p-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
            <p className="text-sm text-amber-800">Vendor account required.</p>
          </div>
        </main>
      </VendorAppShell>
    )
  }

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-payout-methods">
      <main className="min-h-full w-full bg-transparent">
        <section className={`${MOGZU_MODULE_CONTAINER} py-6`}>
          <div className="mb-6 rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
            <h1 className={MOGZU_PAGE_TITLE}>Payout methods</h1>
            <p className={`mt-2 max-w-2xl ${MOGZU_PAGE_SUBTITLE}`}>
              Add a rail per settlement currency. The primary method per currency receives the payout when a
              booking in that currency completes. Admin verifies before live transfers.
            </p>
          </div>

          {error && (
            <p className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/90 px-4 py-2.5 text-sm text-rose-700">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}

          <section className={`${MOGZU_FILTER_SIDEBAR} mb-6`}>
            <h2 className="mb-3 text-sm font-semibold text-[#0e1e3f]">Add new method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Rail</label>
                <select
                  value={form.rail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rail: e.target.value as PayoutRail }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                >
                  {PAYOUT_RAILS.map((r) => (
                    <option key={r} value={r}>
                      {RAIL_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Account holder</label>
                <input
                  type="text"
                  value={form.account_holder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, account_holder: e.target.value }))
                  }
                  placeholder="As on account"
                  className="mt-1 w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Account number / IBAN</label>
                <input
                  type="text"
                  value={form.account_number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, account_number: e.target.value }))
                  }
                  placeholder="e.g. 1234567890"
                  className="mt-1 w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 font-mono text-sm backdrop-blur-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Routing info (optional JSON)
                </label>
                <input
                  type="text"
                  value={form.routing_info}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, routing_info: e.target.value }))
                  }
                  placeholder='{"ifsc":"HDFC0000123"} or {"swift":"DEUTDEFF"}'
                  className="mt-1 w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 font-mono text-sm backdrop-blur-sm"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-primary"
                  checked={form.is_primary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_primary: e.target.checked }))
                  }
                />
                <label htmlFor="is-primary" className="text-xs text-slate-600">
                  Make this the primary method for {form.currency}
                </label>
              </div>
            </div>
            <button
              type="button"
              disabled={busy === 'add'}
              onClick={() => void addMethod()}
              className={`mt-4 ${MOGZU_CTA_GRADIENT} disabled:opacity-40`}
            >
              {busy === 'add' ? 'Saving…' : 'Add method'}
            </button>
          </section>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : grouped.length === 0 ? (
            <p className={`${MOGZU_PRODUCT_CARD} p-10 text-center text-sm text-slate-500`}>
              No payout methods configured yet.
            </p>
          ) : (
            <div className="space-y-5">
              {grouped.map(([currency, list]) => (
                <section key={currency} className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
                  <header className="border-b border-white/60 bg-white/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#0e1e3f]">
                    {currency} settlement
                  </header>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/60 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        <th className="px-4 py-2">Rail</th>
                        <th className="px-4 py-2">Account holder</th>
                        <th className="px-4 py-2">Account</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((m) => (
                        <tr key={m.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-2 text-slate-700">{RAIL_LABEL[m.rail]}</td>
                          <td className="px-4 py-2 text-slate-700">{m.account_holder}</td>
                          <td className="px-4 py-2 font-mono text-xs text-slate-500">
                            {maskAccount(m.account_number)}
                          </td>
                          <td className="px-4 py-2">
                            {m.verified_at ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                <CheckCircle2 className="size-3" /> Verified
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Pending verification
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="inline-flex items-center gap-2">
                              {m.is_primary ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                  <Star className="size-3" /> Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={busy === m.id}
                                  onClick={() => void promote(m.id)}
                                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Set primary
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={busy === m.id}
                                onClick={() => void drop(m.id)}
                                className="rounded-md border border-rose-200 p-1 text-rose-700 hover:bg-rose-50"
                                aria-label="Remove method"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>
    </VendorAppShell>
  )
}

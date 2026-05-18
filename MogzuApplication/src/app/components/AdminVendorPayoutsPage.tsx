// Phase 4 Feature 3 — admin vendor payout methods console.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, ShieldAlert, Trash2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { vendors as vendorsDb } from '@/lib/db'
import {
  PAYOUT_RAILS,
  createMethod,
  listMethods,
  markVerified,
  maskAccount,
  removeMethod,
  setPrimary,
  type PayoutRail,
  type VendorPayoutMethod,
} from '@/lib/vendorPayouts'

type VendorRow = { id: string; business_name: string }

export default function AdminVendorPayoutsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [methods, setMethods] = useState<VendorPayoutMethod[]>([])
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [vendorId, setVendorId] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [rail, setRail] = useState<PayoutRail>('razorpay_x')
  const [holder, setHolder] = useState('')
  const [account, setAccount] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: m, error: e1 }, vRes] = await Promise.all([
      listMethods(),
      vendorsDb.listActive(),
    ])
    setMethods(m)
    setVendors(
      ((vRes?.data ?? []) as { id: string; business_name: string }[]).map((v) => ({
        id: v.id,
        business_name: v.business_name,
      })),
    )
    if (e1) setError(e1)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const vendorName = useMemo(() => {
    const m = new Map<string, string>()
    for (const v of vendors) m.set(v.id, v.business_name)
    return m
  }, [vendors])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendorId || !holder || !account) {
      setError('Vendor, account holder, and account number are required.')
      return
    }
    const { error: err } = await createMethod({
      vendor_id: vendorId,
      currency,
      rail,
      account_holder: holder,
      account_number: account,
    })
    if (err) setError(err)
    else {
      setHolder('')
      setAccount('')
      load()
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / support role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Vendor payouts"
          totalLabel={loading ? 'Loading…' : `${methods.length} methods on file`}
        />
        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Add payout method</h2>
          <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Vendor</span>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Rail</span>
              <select
                value={rail}
                onChange={(e) => setRail(e.target.value as PayoutRail)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {PAYOUT_RAILS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Currency</span>
              <input
                type="text"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Account holder</span>
              <input
                type="text"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Account number / IBAN</span>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Add method
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Rail</th>
                <th className="px-4 py-2">Currency</th>
                <th className="px-4 py-2">Holder</th>
                <th className="px-4 py-2 font-mono">Account</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {vendorName.get(m.vendor_id) ?? m.vendor_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 text-xs">{m.rail}</td>
                  <td className="px-4 py-2 text-xs">{m.currency}</td>
                  <td className="px-4 py-2 text-xs">{m.account_holder}</td>
                  <td className="px-4 py-2 font-mono text-xs">{maskAccount(m.account_number)}</td>
                  <td className="px-4 py-2 text-xs">
                    {m.is_primary && (
                      <span className="mr-1 rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">
                        primary
                      </span>
                    )}
                    {m.verified_at ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                        verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                        pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-1">
                      {!m.is_primary && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { error: e } = await setPrimary(m.vendor_id, m.id)
                            if (e) setError(e)
                            else load()
                          }}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Set primary
                        </button>
                      )}
                      {!m.verified_at && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { error: e } = await markVerified(m.id)
                            if (e) setError(e)
                            else load()
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          <Check className="size-3" /> Verify
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Remove this payout method?')) return
                          const { error: e } = await removeMethod(m.id)
                          if (e) setError(e)
                          else load()
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {methods.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                    No payout methods recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {loading && (
          <div className="mt-6 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        )}
      </div>
    </div>
  )
}

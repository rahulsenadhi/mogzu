// Phase 3 Feature 8 — contracts list (read-only stub). Full CRUD +
// PDF generation lands in a follow-up sprint.

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { listContracts, listInvoiceRuns, type Contract, type InvoiceRun } from '@/lib/contracts'

export default function AdminContractsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [contracts, setContracts] = useState<Contract[]>([])
  const [runs, setRuns] = useState<InvoiceRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: c, error: e1 }, { data: r, error: e2 }] = await Promise.all([
      listContracts(),
      listInvoiceRuns(),
    ])
    setContracts(c)
    setRuns(r)
    if (e1 || e2) setError(e1 || e2 || '')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Contracts + invoicing"
          totalLabel={`${contracts.length} contracts · ${runs.length} invoice runs`}
        />
        {error && (
          <p className="mt-3 mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Contracts</h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {contracts.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No contracts yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="py-2 pl-4 pr-2">Name</th>
                        <th className="py-2 pr-2">Status</th>
                        <th className="py-2 pr-2">Term</th>
                        <th className="py-2 pr-4">Currency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100">
                          <td className="py-2 pl-4 pr-2 font-medium text-slate-900">{c.name}</td>
                          <td className="py-2 pr-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2 pr-2 text-xs text-slate-500">
                            {c.term_starts_on} → {c.term_ends_on ?? 'open'}
                          </td>
                          <td className="py-2 pr-4 text-xs text-slate-500">{c.currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Recent invoice runs</h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {runs.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No invoice runs yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="py-2 pl-4 pr-2">Period</th>
                        <th className="py-2 pr-2">Status</th>
                        <th className="py-2 pr-2 text-right">Subtotal</th>
                        <th className="py-2 pr-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100">
                          <td className="py-2 pl-4 pr-2 text-xs text-slate-500">
                            {r.period_starts_on} → {r.period_ends_on}
                          </td>
                          <td className="py-2 pr-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 pr-2 text-right">
                            {r.currency} {r.subtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 pr-4 text-right font-semibold">
                            {r.currency} {r.total.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <p className="mt-6 text-xs text-slate-500">
              Stub view. Full CRUD form + PDF generation lands in a Phase 3 follow-up.
              Use the create_invoice_run() RPC directly for now.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

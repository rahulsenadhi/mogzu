// Phase 3 Feature 8 — corporate-facing invoice list at /account/invoices.
//
// Lists every invoice_run tied to any contract owned by the current corp.
// Status pill + due-date + PDF link. Overdue rows surfaced first via sort.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Loader2, FileText, AlertCircle, Download } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  getInvoicePdfSignedUrl,
  listCorporateInvoices,
  type InvoiceRunWithContract,
} from '@/lib/contracts'

const STATUS_PILL: Record<InvoiceRunWithContract['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  finalised: 'bg-blue-100 text-blue-700',
  sent: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function isOverdue(run: InvoiceRunWithContract): boolean {
  if (run.status === 'paid' || run.status === 'cancelled') return false
  const dueOn = addDays(run.period_ends_on, run.contract?.payment_terms_days ?? 30)
  return dueOn < new Date().toISOString().slice(0, 10)
}

export default function BillingInvoicesPage() {
  const navigate = useNavigate()
  const { corporateId } = useAuth()
  const [rows, setRows] = useState<InvoiceRunWithContract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!corporateId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await listCorporateInvoices(corporateId)
    setRows(data)
    setError(err ?? '')
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    void load()
  }, [load])

  const outstanding = useMemo(
    () =>
      rows
        .filter((r) => r.status !== 'paid' && r.status !== 'cancelled')
        .reduce((sum, r) => sum + Number(r.total ?? 0), 0),
    [rows],
  )

  const openPdf = useCallback(async (run: InvoiceRunWithContract) => {
    if (!run.pdf_storage_path) return
    const { url, error: err } = await getInvoicePdfSignedUrl(run.pdf_storage_path)
    if (err || !url) {
      setError(err ?? 'Could not open PDF')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-['Montserrat']">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 font-medium text-[#2563eb] hover:underline"
        >
          &larr; Back to Dashboard
        </button>

        <div className="rounded-2xl border border-[#ececec] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-3xl font-bold text-[#0e1e3f]">Invoices</h1>
              <p className="font-['Inter'] text-slate-600">
                Outstanding and historical invoices for your corporate account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/account/billing')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Billing & Plan
            </button>
          </div>

          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-amber-700">Outstanding balance</p>
            <p className="text-2xl font-bold text-amber-900">
              ₹{Math.round(outstanding).toLocaleString('en-IN')}
            </p>
          </div>

          {error && (
            <p className="mb-4 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="size-4" />
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-slate-400">
              <FileText className="size-8" />
              <p className="font-['Inter'] text-sm">No invoices yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Contract</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const overdue = isOverdue(r)
                    const dueOn = addDays(
                      r.period_ends_on,
                      r.contract?.payment_terms_days ?? 30,
                    )
                    const pillClass = overdue
                      ? STATUS_PILL.overdue
                      : STATUS_PILL[r.status]
                    return (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {r.contract?.name ?? r.contract_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {r.period_starts_on} → {r.period_ends_on}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{dueOn}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          ₹{Math.round(r.total).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${pillClass}`}
                          >
                            {overdue ? 'Overdue' : r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.pdf_storage_path ? (
                            <button
                              type="button"
                              onClick={() => void openPdf(r)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="size-3" /> Download
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

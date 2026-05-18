// Phase 3 Feature 8 — printable invoice run view.
//
// Reuses the partner-statement print pattern: hidden controls bar at
// the top + a print-friendly invoice body. Admin clicks Print → the
// browser hands a PDF via Save-as-PDF. A future cron can render the
// same DOM headlessly (Puppeteer) and upload to pdf_storage_path.

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Loader2, Printer, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import {
  getContract,
  getInvoiceRun,
  listLineItems,
  updateInvoiceStatus,
  type Contract,
  type ContractLineItem,
  type InvoiceRun,
} from '@/lib/contracts'

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function AdminInvoiceRunPage() {
  const { id } = useParams<{ id: string }>()
  const { role } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support'

  const [run, setRun] = useState<InvoiceRun | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [corp, setCorp] = useState<{ name: string; address?: string | null } | null>(null)
  const [items, setItems] = useState<ContractLineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data: r, error: e1 } = await getInvoiceRun(id)
    if (e1 || !r) {
      setError(e1 ?? 'Invoice run not found')
      setLoading(false)
      return
    }
    setRun(r)
    const [{ data: c, error: e2 }, { data: lis }] = await Promise.all([
      getContract(r.contract_id),
      listLineItems(r.contract_id),
    ])
    if (e2) setError(e2)
    setContract(c)
    setItems(lis)
    if (c) {
      const { data: ca } = await corporateAccounts.getById(c.corporate_id)
      if (ca) setCorp({ name: (ca as { name: string }).name, address: (ca as { address?: string | null }).address })
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    if (isStaff) load()
  }, [isStaff, load])

  const finalise = async () => {
    if (!run) return
    const { error: err } = await updateInvoiceStatus(run.id, 'finalised', {
      sent_at: undefined,
    })
    if (err) setError(err)
    else load()
  }

  const markSent = async () => {
    if (!run) return
    const { error: err } = await updateInvoiceStatus(run.id, 'sent', {
      sent_at: new Date().toISOString(),
    })
    if (err) setError(err)
    else load()
  }

  const markPaid = async () => {
    if (!run) return
    const ref = window.prompt('Payment reference / UTR (optional)') ?? undefined
    const { error: err } = await updateInvoiceStatus(run.id, 'paid', {
      paid_at: new Date().toISOString(),
      payment_reference: ref,
    })
    if (err) setError(err)
    else load()
  }

  if (!isStaff) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / support role required.</p>
      </div>
    )
  }

  if (loading || !run || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        {error ? <p className="text-sm text-rose-700">{error}</p> : <Loader2 className="size-6 animate-spin text-slate-400" />}
      </div>
    )
  }

  const dueOn = addDays(run.period_ends_on, contract.payment_terms_days)

  return (
    <div className="min-h-screen bg-[#FFFDF9] print:bg-white">
      <style>{`@media print {
        .no-print { display: none !important; }
        body { background: white; }
      }`}</style>

      <div className="no-print mx-auto max-w-3xl px-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Invoice {run.id.slice(0, 8)}</h1>
            <p className="text-xs text-slate-500">
              Status: <span className="font-medium">{run.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {run.status === 'draft' && (
              <button
                type="button"
                onClick={finalise}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Finalise
              </button>
            )}
            {(run.status === 'finalised' || run.status === 'draft') && (
              <button
                type="button"
                onClick={markSent}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Mark sent
              </button>
            )}
            {(run.status === 'sent' || run.status === 'overdue') && (
              <button
                type="button"
                onClick={markPaid}
                className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Mark paid
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <Printer className="size-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}
      </div>

      <article className="mx-auto my-6 max-w-3xl bg-white p-10 shadow-sm print:shadow-none print:m-0 print:p-12">
        <header className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">From</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Mogzu Technologies Pvt. Ltd.</p>
            <p className="text-xs text-slate-500">Bengaluru, India</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Invoice</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
              INV-{run.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Period: {run.period_starts_on} → {run.period_ends_on}
            </p>
            <p className="text-xs text-slate-500">Due: {dueOn} (Net {contract.payment_terms_days})</p>
          </div>
        </header>

        <section className="mt-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Billed to</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{corp?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">Contract: {contract.name}</p>
        </section>

        <section className="mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Unit rate</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-xs text-slate-400">
                    No rate-card lines on contract.
                  </td>
                </tr>
              ) : (
                items.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100">
                    <td className="py-2">
                      <p className="font-medium text-slate-900">{i.description}</p>
                      <p className="text-xs text-slate-500">{i.kind}</p>
                    </td>
                    <td className="py-2 text-right text-sm">
                      {run.currency} {Number(i.unit_rate).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="mt-8 ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{run.currency} {Number(run.subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tax (GST 18%)</span>
            <span>{run.currency} {Number(run.tax_amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{run.currency} {Number(run.total).toLocaleString('en-IN')}</span>
          </div>
        </section>

        {run.payment_reference && (
          <p className="mt-6 text-xs text-slate-500">
            Payment reference: <span className="font-mono">{run.payment_reference}</span>
          </p>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Subtotal computed from completed bookings on this contract within the period window.
          GST applied at 18%. Settlement currency: {run.currency}.
        </footer>
      </article>
    </div>
  )
}

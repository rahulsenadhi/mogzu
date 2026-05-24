// Phase 3 Feature 8 — corporate-facing invoice list at /account/invoices.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, Download, FileText, Loader2, Receipt } from 'lucide-react'
import { CorporateModuleShell } from '@/app/components/layouts/CorporateModuleShell'
import { MOGZU_GLASS_PANEL } from '@/app/components/ui/mogzuGlassStyles'
import {
  MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_HERO_BANNER,
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_NAV_SCROLLER,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { useCurrency } from '@/lib/i18n/useCurrency'
import {
  getInvoicePdfSignedUrl,
  listCorporateInvoices,
  type InvoiceRunWithContract,
} from '@/lib/contracts'

const STATUS_PILL: Record<InvoiceRunWithContract['status'], string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  finalised: 'bg-blue-100 text-blue-700 border-blue-200',
  sent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  overdue: 'bg-rose-100 text-rose-700 border-rose-200',
  cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
}

type InvoiceFilter = 'all' | 'outstanding' | 'paid' | 'overdue'

const DEMO_INVOICES: InvoiceRunWithContract[] = [
  {
    id: 'demo-inv-1', contract_id: 'demo-contract-1', period_starts_on: '2026-04-01', period_ends_on: '2026-04-30',
    total: 240000, status: 'sent', pdf_storage_path: null, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z',
    contract: { id: 'demo-contract-1', name: 'Enterprise Annual Contract — Infosys', payment_terms_days: 30 },
  } as unknown as InvoiceRunWithContract,
  {
    id: 'demo-inv-2', contract_id: 'demo-contract-2', period_starts_on: '2026-03-01', period_ends_on: '2026-03-31',
    total: 185000, status: 'paid', pdf_storage_path: null, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-15T10:00:00Z',
    contract: { id: 'demo-contract-2', name: 'Growth Plan — Wipro Technologies', payment_terms_days: 15 },
  } as unknown as InvoiceRunWithContract,
  {
    id: 'demo-inv-3', contract_id: 'demo-contract-1', period_starts_on: '2026-02-01', period_ends_on: '2026-02-28',
    total: 220000, status: 'overdue', pdf_storage_path: null, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
    contract: { id: 'demo-contract-1', name: 'Enterprise Annual Contract — Infosys', payment_terms_days: 30 },
  } as unknown as InvoiceRunWithContract,
]

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
  const { formatCurrency } = useCurrency()
  const [rows, setRows] = useState<InvoiceRunWithContract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [filter, setFilter] = useState<InvoiceFilter>('all')

  const load = useCallback(async () => {
    if (!corporateId) {
      setRows(DEMO_INVOICES)
      setIsDemo(true)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await listCorporateInvoices(corporateId)
    if (data.length === 0 && !err) {
      setRows(DEMO_INVOICES)
      setIsDemo(true)
    } else {
      setRows(data)
      setIsDemo(false)
    }
    setError(err ?? '')
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const overdue = isOverdue(r)
      if (filter === 'outstanding') return r.status !== 'paid' && r.status !== 'cancelled'
      if (filter === 'paid') return r.status === 'paid'
      if (filter === 'overdue') return overdue || r.status === 'overdue'
      return true
    })
  }, [rows, filter])

  const outstanding = useMemo(
    () =>
      rows
        .filter((r) => r.status !== 'paid' && r.status !== 'cancelled')
        .reduce((sum, r) => sum + Number(r.total ?? 0), 0),
    [rows],
  )

  const counts = useMemo(
    () => ({
      all: rows.length,
      outstanding: rows.filter((r) => r.status !== 'paid' && r.status !== 'cancelled').length,
      paid: rows.filter((r) => r.status === 'paid').length,
      overdue: rows.filter((r) => isOverdue(r) || r.status === 'overdue').length,
    }),
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

  const accountNav = [
    { id: 'invoices', label: 'Invoices', icon: <Receipt className="size-4 text-[#2563eb]" />, active: true, onClick: () => navigate('/account/invoices') },
    { id: 'billing', label: 'Billing & Plan', icon: <FileText className="size-4 text-[#4f46e5]" />, active: false, onClick: () => navigate('/account/billing') },
  ]

  return (
    <CorporateModuleShell
      title="Invoices"
      subtitle={
        isDemo
          ? 'Outstanding and historical invoices · demo data'
          : 'Outstanding and historical invoices for your corporate account.'
      }
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { label: 'Account' },
        { label: 'Invoices' },
      ]}
      navChips={accountNav}
      searchPlaceholder="Search invoices"
    >
      <div className={MOGZU_HERO_BANNER}>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
        <div className="relative flex h-full flex-col justify-center px-8">
          <span className="mb-2 inline-flex w-fit rounded-full bg-[#ebf1ff] px-2.5 py-1 text-[12px] font-medium text-[#475569]">
            Contract billing
          </span>
          <h2 className="text-[24px] font-bold leading-tight text-[#0e1e3f]">Outstanding balance</h2>
          <p className="mt-2 text-[22px] font-extrabold tracking-tight text-[#0e1e3f]">
            {formatCurrency(outstanding)}
          </p>
          <button
            type="button"
            onClick={() => navigate('/account/billing')}
            className="mt-4 h-11 w-fit rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Go to Billing & Plan
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className={`w-full shrink-0 lg:w-[240px] ${MOGZU_FILTER_SIDEBAR}`}>
          <p className="text-[16px] font-semibold text-[#0e1e3f]">Filter invoices</p>
          <div className={`mt-4 ${MOGZU_NAV_SCROLLER} flex-col items-stretch whitespace-normal`}>
            {(
              [
                { id: 'all', label: 'All invoices' },
                { id: 'outstanding', label: 'Outstanding' },
                { id: 'paid', label: 'Paid' },
                { id: 'overdue', label: 'Overdue' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`${moduleNavChipClass(filter === item.id)} w-full justify-between`}
                style={filter === item.id ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
              >
                <span>{item.label}</span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {counts[item.id]}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {error && !isDemo && (
            <p className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-2.5 text-sm text-rose-700">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className={`${MOGZU_GLASS_PANEL} overflow-hidden`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <FileText className="size-10" />
                <p className="text-sm font-medium text-slate-500">No invoices match this filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/60 bg-white/40 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      <th className="px-5 py-3.5">Contract</th>
                      <th className="px-5 py-3.5">Period</th>
                      <th className="px-5 py-3.5">Due date</th>
                      <th className="px-5 py-3.5 text-right">Total</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => {
                      const overdue = isOverdue(r)
                      const dueOn = addDays(r.period_ends_on, r.contract?.payment_terms_days ?? 30)
                      const pillClass = overdue ? STATUS_PILL.overdue : STATUS_PILL[r.status]
                      return (
                        <tr key={r.id} className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-white/50">
                          <td className="px-5 py-4 font-semibold text-[#0e1e3f]">
                            {r.contract?.name ?? r.contract_id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-slate-500">
                            {r.period_starts_on} → {r.period_ends_on}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">{dueOn}</td>
                          <td className="px-5 py-4 text-right text-[18px] font-extrabold tracking-tight text-[#0e1e3f]">
                            {formatCurrency(r.total)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${pillClass}`}>
                              {overdue ? 'Overdue' : r.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {r.pdf_storage_path ? (
                              <button
                                type="button"
                                onClick={() => void openPdf(r)}
                                className={`${MOGZU_CTA_GRADIENT} inline-flex items-center gap-1.5`}
                              >
                                <Download className="size-3" /> PDF
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
    </CorporateModuleShell>
  )
}

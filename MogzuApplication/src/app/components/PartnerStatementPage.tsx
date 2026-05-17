import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2, Printer, ShieldAlert } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Partner, PartnerPayoutPeriod } from '@/lib/database.types'

type ResaleRow = {
  id: string
  total_amount: number | null
  partner_margin_amount: number | null
  completed_at: string | null
  listings?: { title: string | null } | null
  corporate_accounts?: { name: string | null } | null
}
type ProductRow = {
  id: string
  total_amount: number | null
  completed_at: string | null
  listings?: { title: string | null } | null
  corporate_accounts?: { name: string | null } | null
}
type ReferralRow = {
  id: string
  amount: number
  created_at: string
  partner_referrals?: {
    corporate_accounts?: { name: string | null } | null
  } | null
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  return `₹ ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function parsePeriod(yyyymm: string): { label: string; startIso: string; endIso: string } | null {
  if (!/^\d{6}$/.test(yyyymm)) return null
  const y = Number(yyyymm.slice(0, 4))
  const m = Number(yyyymm.slice(4, 6))
  if (m < 1 || m > 12) return null
  const start = new Date(Date.UTC(y, m - 1, 1))
  const end = new Date(Date.UTC(y, m, 1))
  const label = start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  return { label, startIso: start.toISOString(), endIso: end.toISOString() }
}

export default function PartnerStatementPage() {
  const navigate = useNavigate()
  const params = useParams<{ yyyymm: string }>()
  const { profile, role } = useAuth()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [period, setPeriod] = useState<PartnerPayoutPeriod | null>(null)
  const [resaleRows, setResaleRows] = useState<ResaleRow[]>([])
  const [productRows, setProductRows] = useState<ProductRow[]>([])
  const [referralRows, setReferralRows] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const periodInfo = params.yyyymm ? parsePeriod(params.yyyymm) : null

  const load = useCallback(async () => {
    if (!profile || !params.yyyymm || !periodInfo) {
      setError('Invalid period.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data: p, error: pErr } = await db.partners.getByUserId(profile.id)
    if (pErr || !p) {
      setError(pErr?.message ?? 'Partner record not found.')
      setLoading(false)
      return
    }
    setPartner(p as Partner)

    const [periodRes, resaleRes, productRes, referralRes] = await Promise.all([
      db.partnerPayouts.getMonth(p.id, params.yyyymm),
      db.partnerStatements.resaleBookingsForMonth(p.id, periodInfo.startIso, periodInfo.endIso),
      db.partnerStatements.productBookingsForMonth(p.id, periodInfo.startIso, periodInfo.endIso),
      db.partnerStatements.referralCommissionsForMonth(p.id, periodInfo.startIso, periodInfo.endIso),
    ])
    setPeriod((periodRes.data as PartnerPayoutPeriod | null) ?? null)
    setResaleRows(((resaleRes.data ?? []) as unknown as ResaleRow[]) ?? [])
    setProductRows(((productRes.data ?? []) as unknown as ProductRow[]) ?? [])
    setReferralRows(((referralRes.data ?? []) as unknown as ReferralRow[]) ?? [])
    setLoading(false)
  }, [profile, params.yyyymm, periodInfo])

  useEffect(() => {
    void load()
  }, [load])

  if (role !== 'partner' && role !== 'mogzu_admin') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Partner access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !partner || !periodInfo) {
    return (
      <div className="mx-auto max-w-md p-12 text-center text-sm text-rose-700">
        {error || 'Statement not available.'}
      </div>
    )
  }

  const referralCommission = referralRows.reduce((sum, r) => sum + Number(r.amount), 0)
  const resaleMargin = resaleRows.reduce(
    (sum, r) => sum + Number(r.partner_margin_amount ?? 0),
    0,
  )
  const productShare = Number(period?.product_share ?? 0)
  const grandTotal = referralCommission + resaleMargin + productShare

  return (
    <div className="bg-slate-100 min-h-screen py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl bg-white p-10 shadow-lg print:shadow-none">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            to="/partner/dashboard"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="size-3.5" /> Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Printer className="size-3" /> Print / save as PDF
          </button>
        </div>

        <header className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <MogzuLogo className="mb-2 h-8" />
            <h1 className="text-xl font-bold text-slate-900">
              {partner.business_name || partner.full_name}
            </h1>
            <p className="mt-1 text-xs text-slate-500">{partner.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Statement</p>
            <p className="text-lg font-semibold text-slate-900">{periodInfo.label}</p>
            <p className="text-xs text-slate-500">
              Period {params.yyyymm} · status{' '}
              <span className="capitalize">{period?.status ?? 'pending'}</span>
            </p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-3 gap-3 text-xs">
          <Cell label="Referral commission" value={fmtMoney(referralCommission)} />
          <Cell label="Reseller margin" value={fmtMoney(resaleMargin)} />
          <Cell label="Product revenue share" value={fmtMoney(productShare)} />
        </section>

        {referralRows.length > 0 && (
          <Block title="Referral commissions">
            <Table
              headers={['Date', 'Client', 'Amount']}
              rows={referralRows.map((r) => [
                fmtDate(r.created_at),
                r.partner_referrals?.corporate_accounts?.name ?? '—',
                fmtMoney(Number(r.amount)),
              ])}
            />
          </Block>
        )}

        {resaleRows.length > 0 && (
          <Block title="Reseller margin (per booking)">
            <Table
              headers={['Date', 'Listing', 'Client', 'Booking total', 'Margin']}
              rows={resaleRows.map((r) => [
                fmtDate(r.completed_at),
                r.listings?.title ?? '—',
                r.corporate_accounts?.name ?? '—',
                fmtMoney(r.total_amount),
                fmtMoney(r.partner_margin_amount),
              ])}
            />
          </Block>
        )}

        {productRows.length > 0 && (
          <Block title="Product revenue share (partner-owned listings)">
            <Table
              headers={['Date', 'Listing', 'Client', 'Booking total']}
              rows={productRows.map((r) => [
                fmtDate(r.completed_at),
                r.listings?.title ?? '—',
                r.corporate_accounts?.name ?? '—',
                fmtMoney(r.total_amount),
              ])}
            />
            <p className="mt-2 text-[11px] text-slate-500">
              Revenue-share line items roll up to the period total above using the agreement rate
              in effect this month.
            </p>
          </Block>
        )}

        <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
          <span className="font-semibold text-slate-900">Grand total</span>
          <span className="font-semibold text-slate-900">{fmtMoney(grandTotal)}</span>
        </footer>

        <p className="mt-6 text-[11px] text-slate-400 print:hidden">
          Powered by Mogzu · Statement generated{' '}
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number | null)[][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-700">
                  {cell ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

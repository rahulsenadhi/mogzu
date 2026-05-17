import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, Copy, FileText, Loader2, ShieldAlert, Sparkles } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  CorporateAccount,
  Listing,
  Partner,
  PartnerAgreement,
  PartnerPayoutPeriod,
  PartnerReferral,
  PartnerWallet,
  PartnerWalletTransaction,
} from '@/lib/database.types'

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  return `₹ ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export default function PartnerDashboardPage() {
  const navigate = useNavigate()
  const { profile, role, signOut } = useAuth()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [agreement, setAgreement] = useState<PartnerAgreement | null>(null)
  const [referrals, setReferrals] = useState<PartnerReferral[]>([])
  const [wallet, setWallet] = useState<PartnerWallet | null>(null)
  const [txns, setTxns] = useState<PartnerWalletTransaction[]>([])
  const [clients, setClients] = useState<CorporateAccount[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [periods, setPeriods] = useState<PartnerPayoutPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError('')

    const { data: p, error: pErr } = await db.partners.getByUserId(profile.id)
    if (pErr || !p) {
      setError(pErr?.message ?? 'No partner record found for this account.')
      setLoading(false)
      return
    }
    setPartner(p as Partner)

    const [agRes, refRes, walletRes, txRes, clientRes, listingRes, periodRes] = await Promise.all([
      db.partnerAgreements.getCurrent(p.id),
      db.partnerReferrals.listByPartner(p.id),
      db.partnerWallets.getByPartner(p.id),
      db.partnerWallets.listTransactions(p.id, 20),
      db.partnerClients.listByPartner(p.id),
      db.partnerListings.listByPartner(p.id),
      db.partnerPayouts.listLast12Months(p.id),
    ])
    setAgreement((agRes.data as PartnerAgreement | null) ?? null)
    setReferrals(((refRes.data ?? []) as PartnerReferral[]) ?? [])
    setWallet((walletRes.data as PartnerWallet | null) ?? null)
    setTxns(((txRes.data ?? []) as PartnerWalletTransaction[]) ?? [])
    setClients(((clientRes.data ?? []) as CorporateAccount[]) ?? [])
    setListings(((listingRes.data ?? []) as Listing[]) ?? [])
    setPeriods(((periodRes.data ?? []) as PartnerPayoutPeriod[]) ?? [])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(() => {
    const signedUp = referrals.length
    const activated = referrals.filter((r) => r.activated_at != null).length
    const earned = referrals.reduce((sum, r) => sum + Number(r.commission_amount ?? 0), 0)
    return { signedUp, activated, earned }
  }, [referrals])

  const liveListings = useMemo(
    () => listings.filter((l) => l.status === 'active').length,
    [listings],
  )

  const pendingPayout = useMemo(
    () =>
      periods
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.total_amount), 0),
    [periods],
  )

  // Lifetime earnings split for breakdown card.
  const lifetimeBreakdown = useMemo(() => {
    const referralCommission = txns
      .filter((t) => t.type === 'commission')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const resaleMargin = periods.reduce((sum, p) => sum + Number(p.resale_margin), 0)
    const productShare = periods.reduce((sum, p) => sum + Number(p.product_share), 0)
    return { referralCommission, resaleMargin, productShare }
  }, [txns, periods])

  // Trailing-12-month chart series. Fill empty months with zeros so the
  // x-axis stays continuous even for new partners.
  const trendData = useMemo(() => {
    const now = new Date()
    const series: {
      label: string
      yyyymm: string
      resale: number
      product: number
      total: number
    }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const yyyymm = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0')
      const period = periods.find((p) => p.period_yyyymm === yyyymm)
      series.push({
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        yyyymm,
        resale: Number(period?.resale_margin ?? 0),
        product: Number(period?.product_share ?? 0),
        total: Number(period?.total_amount ?? 0),
      })
    }
    return series
  }, [periods])

  const referralLink = partner?.referral_code
    ? `${window.location.origin}/partner-ref/${partner.referral_code}`
    : null

  const copyLink = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  if (role !== 'partner' && role !== 'mogzu_admin') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">This page is for partner accounts only.</p>
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

  if (error || !partner) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="text-sm text-slate-600">{error || 'Partner profile not found.'}</p>
        <Link
          to="/signup/partner"
          className="mt-4 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Apply to become a partner
        </Link>
      </div>
    )
  }

  if (partner.status === 'pending') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <MogzuLogo className="mx-auto mb-4 h-10" />
        <h1 className="text-lg font-semibold text-slate-900">Application under review</h1>
        <p className="mt-2 text-sm text-slate-600">
          Mogzu Admin is reviewing your application. You will receive an email with your unique
          referral code once approved.
        </p>
      </div>
    )
  }

  if (partner.status !== 'active') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <MogzuLogo className="mx-auto mb-4 h-10" />
        <h1 className="text-lg font-semibold text-slate-900 capitalize">Account {partner.status}</h1>
        {partner.rejection_reason && (
          <p className="mt-2 text-sm text-slate-600">{partner.rejection_reason}</p>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MogzuLogo className="h-9" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {partner.business_name || partner.full_name}
            </p>
            <p className="text-[11px] text-slate-500">Partner Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/partner/clients"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            My clients
          </Link>
          <Link
            to="/partner/listings"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            My listings
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-amber-50 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-indigo-600" />
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900">
            Your referral link
          </p>
        </div>
        {referralLink ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-white px-3 py-2 text-xs text-slate-800 shadow-sm">
              {referralLink}
            </code>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-600">
            Referral code not yet issued. Contact your account manager.
          </p>
        )}
      </section>

      <MarkupCard partner={partner} onChange={(next) => setPartner({ ...partner, default_markup_pct: next })} />

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Active referrals" value={stats.activated.toString()} />
        <Stat label="Reseller clients" value={clients.length.toString()} />
        <Stat label="Live listings" value={liveListings.toString()} />
        <Stat label="Wallet balance" value={fmtMoney(wallet?.balance ?? 0)} accent />
        <Stat label="Pending payout" value={fmtMoney(pendingPayout)} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Earnings breakdown (lifetime)</h3>
          <ul className="mt-3 space-y-2 text-xs">
            <BreakdownRow label="Referral commission" value={lifetimeBreakdown.referralCommission} />
            <BreakdownRow label="Reseller margin" value={lifetimeBreakdown.resaleMargin} />
            <BreakdownRow label="Product revenue share" value={lifetimeBreakdown.productShare} />
            <li className="flex items-center justify-between border-t border-slate-100 pt-2 font-semibold">
              <span className="text-slate-900">Total</span>
              <span className="text-slate-900">
                {fmtMoney(
                  lifetimeBreakdown.referralCommission +
                    lifetimeBreakdown.resaleMargin +
                    lifetimeBreakdown.productShare,
                )}
              </span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Monthly earnings (last 12)</h3>
            <p className="text-[11px] text-slate-500">Resale + product share</p>
          </div>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => `₹ ${Number(v).toLocaleString('en-IN')}`}
                  labelStyle={{ fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="resale" name="Resale margin" stackId="a" fill="#6366f1" />
                <Bar dataKey="product" name="Product share" stackId="a" fill="#f59e0b" />
                <Line dataKey="total" name="Total" stroke="#0f172a" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Monthly statements</h3>
          <p className="text-[11px] text-slate-500">Click a month to download the statement.</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {trendData
            .filter((m) => m.total > 0)
            .map((m) => (
              <Link
                key={m.yyyymm}
                to={`/partner/statements/${m.yyyymm}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
              >
                <FileText className="size-3" />
                {m.label} · {fmtMoney(m.total)}
              </Link>
            ))}
          {trendData.every((m) => m.total === 0) && (
            <p className="text-xs text-slate-500">No statements yet. Complete a booking to populate.</p>
          )}
        </div>
      </section>

      {agreement && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Current agreement</h3>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-4">
            <Stat label="Referral %" value={`${agreement.referral_pct}%`} compact />
            <Stat label="Wholesale %" value={`${agreement.reseller_wholesale_pct}%`} compact />
            <Stat label="Product share %" value={`${agreement.product_revenue_share_pct}%`} compact />
            <Stat label="Expires" value={fmtDate(agreement.expires_at)} compact />
          </div>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 p-4 text-sm font-semibold text-slate-900">
          Referrals
        </h3>
        {referrals.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">
            No referrals yet. Share your link to start earning.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {referrals.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {(r as unknown as { corporate_accounts?: { name?: string } }).corporate_accounts?.name ?? 'Corporate account'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Signed up {fmtDate(r.signed_up_at)} · attribution until {fmtDate(r.attribution_expires_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    {r.activated_at ? 'Activated' : 'Pending first booking'}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {fmtMoney(Number(r.commission_amount ?? 0))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {txns.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-100 p-4 text-sm font-semibold text-slate-900">
            Wallet activity
          </h3>
          <ul className="divide-y divide-slate-100 text-xs">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium capitalize text-slate-900">{t.type}</p>
                  <p className="text-[11px] text-slate-500">{fmtDate(t.created_at)} · {t.description ?? ''}</p>
                </div>
                <p className="font-semibold text-emerald-700">+ {fmtMoney(Number(t.amount))}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">
        ₹ {Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </span>
    </li>
  )
}

function MarkupCard({
  partner,
  onChange,
}: {
  partner: Partner
  onChange: (next: number) => void
}) {
  const [val, setVal] = useState(String(partner.default_markup_pct ?? 0))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const handleSave = async () => {
    const pct = Number(val)
    if (Number.isNaN(pct) || pct < 0 || pct > 30) {
      setNotice('Markup must be 0–30.')
      return
    }
    setSaving(true)
    setNotice('')
    const { error } = await db.partners.setDefaultMarkup(partner.id, pct)
    setSaving(false)
    if (error) {
      setNotice(error.message)
    } else {
      onChange(pct)
      setNotice('Saved.')
      setTimeout(() => setNotice(''), 2000)
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">Resale markup</p>
          <p className="text-[11px] text-slate-500">
            Applied automatically to bookings from corporates you onboarded. Allowed 0–30%.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="h-9 w-20 rounded-md border border-slate-200 px-2 text-sm shadow-sm"
          />
          <span className="text-sm text-slate-500">%</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {notice && <p className="mt-2 text-xs text-slate-600">{notice}</p>}
    </section>
  )
}

function Stat({
  label,
  value,
  accent,
  compact,
}: {
  label: string
  value: string
  accent?: boolean
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-xl border ${
        accent ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white'
      } ${compact ? 'p-2' : 'p-3'} shadow-sm`}
    >
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 ${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-900`}>
        {value}
      </p>
    </div>
  )
}

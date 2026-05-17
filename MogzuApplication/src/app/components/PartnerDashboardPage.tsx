import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, Copy, Loader2, ShieldAlert, Sparkles } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  Partner,
  PartnerAgreement,
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

    const [agRes, refRes, walletRes, txRes] = await Promise.all([
      db.partnerAgreements.getCurrent(p.id),
      db.partnerReferrals.listByPartner(p.id),
      db.partnerWallets.getByPartner(p.id),
      db.partnerWallets.listTransactions(p.id, 20),
    ])
    setAgreement((agRes.data as PartnerAgreement | null) ?? null)
    setReferrals(((refRes.data ?? []) as PartnerReferral[]) ?? [])
    setWallet((walletRes.data as PartnerWallet | null) ?? null)
    setTxns(((txRes.data ?? []) as PartnerWalletTransaction[]) ?? [])
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

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Referrals signed up" value={stats.signedUp.toString()} />
        <Stat label="Activated (first booking)" value={stats.activated.toString()} />
        <Stat label="Commission earned" value={fmtMoney(stats.earned)} />
        <Stat
          label="Wallet balance"
          value={fmtMoney(wallet?.balance ?? 0)}
          accent
        />
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

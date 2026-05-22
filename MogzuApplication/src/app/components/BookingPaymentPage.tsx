import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  Booking,
  Listing,
  Wallet as WalletRow,
} from '@/lib/database.types'

type BookingDetail = Booking & {
  listings: Listing | null
}

type Method = 'wallet' | 'card' | 'upi'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export default function BookingPaymentPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const { corporateId, profile } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [walletRow, setWalletRow] = useState<WalletRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [method, setMethod] = useState<Method>('wallet')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const load = useCallback(async () => {
    if (!params.id || !corporateId) return
    setLoading(true)
    setLoadError('')
    const [bRes, wRes] = await Promise.all([
      db.bookings.getById(params.id),
      db.wallet.getByCorporate(corporateId),
    ])
    if (bRes.error || !bRes.data) {
      setLoadError(bRes.error?.message ?? 'Booking not found.')
    } else {
      setBooking(bRes.data as BookingDetail)
    }
    setWalletRow((wRes.data ?? null) as WalletRow | null)
    setLoading(false)
  }, [params.id, corporateId])

  useEffect(() => {
    load()
  }, [load])

  const total = booking?.total_amount ?? 0
  const walletBalance = walletRow?.balance ?? 0
  const walletShort = method === 'wallet' && walletBalance < total
  const alreadyPaid = booking?.payment_status === 'paid'
  const requiresPayment = booking && ['pending_vendor', 'confirmed'].includes(booking.status)

  const handlePay = async () => {
    if (!booking || !walletRow) return
    setActionError('')

    if (method === 'wallet') {
      if (walletBalance < total) {
        setActionError(
          `Wallet balance ₹${walletBalance.toLocaleString('en-IN')} is below the booking total ₹${total.toLocaleString('en-IN')}. Top up wallet or choose a different method.`,
        )
        return
      }
    } else if (!reference.trim()) {
      setActionError('Enter the Razorpay payment id / UTR after completing the gateway flow.')
      return
    }

    setSubmitting(true)

    const ref =
      method === 'wallet'
        ? `wallet-debit-${booking.id.slice(0, 8)}`
        : reference.trim()

    // Wallet path: atomic debit RPC (single transaction, row lock,
    // balance check). Runs BEFORE marking the booking paid so a
    // race / insufficient-balance / unauthorized error blocks the
    // status flip.
    if (method === 'wallet') {
      const { error: debitErr } = await db.wallet.debitAtomic(
        walletRow.corporate_id,
        total,
        booking.id,
        `Booking payment ${booking.id.slice(0, 8)} — ${booking.listings?.title ?? ''}`,
      )
      if (debitErr) {
        setActionError(debitErr.message)
        setSubmitting(false)
        return
      }
    }

    // Mark booking as paid
    const { error: bookingErr } = await db.bookings.updateStatus(booking.id, booking.status, {
      payment_method: method,
      payment_reference: ref,
      payment_status: 'paid',
    })
    if (bookingErr) {
      setActionError(bookingErr.message)
      setSubmitting(false)
      return
    }

    setActionSuccess(
      method === 'wallet'
        ? 'Wallet debited. Booking marked paid. Receipt will be emailed once Resend is wired.'
        : 'Payment recorded. Booking marked paid. Receipt will be emailed once Resend is wired.',
    )
    setSubmitting(false)
    load()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="bookings"
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto max-w-3xl px-8 py-6">
            <button
              type="button"
              onClick={() => navigate(`/bookings/${params.id}`)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back to booking
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : loadError || !booking ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{loadError || 'Booking not found.'}</p>
              </div>
            ) : alreadyPaid ? (
              <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-2 size-10 text-emerald-500" />
                <h1 className="text-xl font-bold text-[#0e1e3f]">Already paid</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Payment method: <strong>{booking.payment_method ?? '—'}</strong>
                  <br />
                  Reference: <span className="font-mono">{booking.payment_reference ?? '—'}</span>
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  className="mt-4 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
                >
                  Back to booking
                </button>
              </div>
            ) : !requiresPayment ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="text-sm text-amber-800">
                  Booking is in <strong>{booking.status}</strong> state — not ready for payment.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h1 className="text-xl font-bold text-[#0e1e3f]">Pay for booking</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.listings?.title ?? '—'} ·{' '}
                    {formatDate(booking.start_time)} · Group {booking.group_size ?? '—'}
                  </p>
                  <div className="mt-4 flex items-baseline justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Total due</span>
                    <span className="text-2xl font-bold text-[#0e1e3f]">
                      ₹ {total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#0e1e3f]">Method</h2>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MethodTile
                      icon={<Wallet className="size-5" />}
                      label="Corporate Wallet"
                      sub={`Balance ₹${walletBalance.toLocaleString('en-IN')}`}
                      active={method === 'wallet'}
                      onClick={() => setMethod('wallet')}
                    />
                    <MethodTile
                      icon={<CreditCard className="size-5" />}
                      label="Card"
                      sub="Razorpay redirect"
                      active={method === 'card'}
                      onClick={() => setMethod('card')}
                    />
                    <MethodTile
                      icon={<Smartphone className="size-5" />}
                      label="UPI"
                      sub="Razorpay redirect"
                      active={method === 'upi'}
                      onClick={() => setMethod('upi')}
                    />
                  </div>

                  {method !== 'wallet' && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">
                        ⚠ Razorpay gateway not yet wired
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        Complete payment in your Razorpay sandbox and paste the payment id / UTR
                        below to mark the booking as paid. Real Razorpay checkout + webhook
                        confirmation lands in a follow-up sprint.
                      </p>
                      <input
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="pay_xxxxxxxxxxxxxx"
                        className="mt-3 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-mono text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  )}

                  {walletShort && method === 'wallet' && (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <p className="text-sm font-semibold text-rose-900">
                        Wallet balance below booking total
                      </p>
                      <p className="mt-1 text-xs text-rose-800">
                        ₹ {(total - walletBalance).toLocaleString('en-IN')} short. Top up wallet
                        or pick Card/UPI.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/wallet')}
                        className="mt-2 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Top up wallet
                      </button>
                    </div>
                  )}

                  {actionSuccess && (
                    <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {actionSuccess}
                    </p>
                  )}
                  {actionError && (
                    <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {actionError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={submitting || walletShort}
                    className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    Pay ₹ {total.toLocaleString('en-IN')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function MethodTile({
  icon,
  label,
  sub,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? 'border-[#2563eb] bg-[#ebf1ff]'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-full ${
          active ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {icon}
      </div>
      <p className="mt-2 font-semibold text-[#0e1e3f]">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </button>
  )
}

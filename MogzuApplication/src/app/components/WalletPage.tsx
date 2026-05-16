import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  PlusCircle,
  ShieldAlert,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { realtimeService } from '@/lib/realtime'
import type {
  Wallet as WalletRow,
  WalletTransaction,
  WalletTransactionType,
} from '@/lib/database.types'

type TopUpMethod = 'bank_transfer' | 'neft' | 'card'

const METHOD_LABEL: Record<TopUpMethod, string> = {
  bank_transfer: 'Bank Transfer',
  neft: 'NEFT / RTGS',
  card: 'Corporate Card',
}

const TYPE_LABEL: Record<WalletTransactionType, { label: string; sign: '+' | '-'; color: string }> = {
  topup: { label: 'Top-up', sign: '+', color: 'text-emerald-600' },
  credit: { label: 'Credit', sign: '+', color: 'text-emerald-600' },
  refund: { label: 'Refund', sign: '+', color: 'text-blue-600' },
  debit: { label: 'Debit', sign: '-', color: 'text-rose-600' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function WalletPage() {
  const navigate = useNavigate()
  const { corporateId, role, profile } = useAuth()

  const [walletRow, setWalletRow] = useState<WalletRow | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('10000')
  const [topUpMethod, setTopUpMethod] = useState<TopUpMethod>('bank_transfer')
  const [topUpRef, setTopUpRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [notice, setNotice] = useState('')

  const [thresholdInput, setThresholdInput] = useState('')
  const [thresholdBusy, setThresholdBusy] = useState(false)

  const canManage = role === 'l3_admin' || role === 'mogzu_admin'

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    setLoadError('')
    const [wRes, txRes] = await Promise.all([
      db.wallet.getByCorporate(corporateId),
      db.wallet.getTransactions(corporateId, 50),
    ])
    if (wRes.error) setLoadError(wRes.error.message)
    else {
      setWalletRow(wRes.data as WalletRow)
      setThresholdInput(
        (wRes.data as WalletRow)?.low_balance_threshold != null
          ? String((wRes.data as WalletRow).low_balance_threshold)
          : '',
      )
    }
    setTransactions((txRes.data ?? []) as WalletTransaction[])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!corporateId) return
    return realtimeService.watchWallet(corporateId, () => load())
  }, [corporateId, load])

  const handleTopUp = async () => {
    if (!corporateId || !walletRow || !profile) return
    const amt = Number(topUpAmount)
    if (!amt || amt <= 0) {
      setSubmitError('Enter a valid amount.')
      return
    }
    if (amt > 5_000_000) {
      setSubmitError('Amounts above ₹50,00,000 require Mogzu Admin manual approval.')
      return
    }
    setSubmitError('')
    setSubmitting(true)

    const { error: txErr } = await db.wallet.recordTransaction({
      wallet_id: walletRow.id,
      corporate_id: corporateId,
      type: 'topup',
      amount: amt,
      reference_id: topUpRef.trim() || null,
      booking_id: null,
      description: `Top-up via ${METHOD_LABEL[topUpMethod]}${topUpRef.trim() ? ` (ref ${topUpRef.trim()})` : ''}`,
    })
    if (txErr) {
      setSubmitError(txErr.message)
      setSubmitting(false)
      return
    }

    // Stopgap: bump balance now. Real flow waits for Razorpay webhook to confirm.
    await db.wallet.adjustBalance(corporateId, amt)

    setSubmitting(false)
    setTopUpOpen(false)
    setTopUpAmount('10000')
    setTopUpRef('')
    setNotice(
      `Top-up of ₹${amt.toLocaleString('en-IN')} recorded. Live flow will wait for Razorpay webhook to confirm.`,
    )
    load()
  }

  const handleSaveThreshold = async () => {
    if (!corporateId) return
    const v = Number(thresholdInput)
    if (Number.isNaN(v) || v < 0) {
      setNotice('Threshold must be a non-negative number.')
      return
    }
    setThresholdBusy(true)
    const { error } = await db.wallet.setLowBalanceThreshold(corporateId, v)
    setThresholdBusy(false)
    if (error) setNotice(`Failed: ${error.message}`)
    else {
      setNotice('Low-balance threshold updated.')
      load()
    }
  }

  if (!canManage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <h2 className="font-semibold text-amber-900">L3 Admin access required</h2>
          <p className="mt-1 text-sm text-amber-800">
            Only L3 Admins can view and manage the corporate wallet.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-4 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const balance = walletRow?.balance ?? 0
  const threshold = walletRow?.low_balance_threshold
  const lowBalance = threshold != null && balance < threshold

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#2563eb] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : !walletRow ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Wallet className="mx-auto mb-2 size-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              No wallet provisioned for this corporate account.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#0e1e3f]">Corporate Wallet</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Fund the company wallet so employees can book without personal payment methods.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTopUpOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <PlusCircle className="size-4" />
                  Top up
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2563eb]/20 bg-[#ebf1ff] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                    Available balance
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#0e1e3f]">
                    ₹ {balance.toLocaleString('en-IN')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Currency: {walletRow.currency} · Updated {formatDate(walletRow.updated_at)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Low-balance alert threshold
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={thresholdInput}
                      onChange={(e) => setThresholdInput(e.target.value)}
                      placeholder="e.g., 25000"
                      className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                    <button
                      type="button"
                      onClick={handleSaveThreshold}
                      disabled={thresholdBusy}
                      className="rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                  {lowBalance && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      <AlertTriangle className="size-3" /> Below threshold
                    </p>
                  )}
                </div>
              </div>

              {notice && (
                <p
                  role="status"
                  className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
                >
                  {notice}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-lg font-bold text-[#0e1e3f]">Transactions</h2>
                <p className="text-sm text-slate-500">
                  Last 50 wallet movements (top-ups, booking debits, refunds).
                </p>
              </div>
              {transactions.length === 0 ? (
                <p className="p-12 text-center text-sm text-slate-500">No transactions yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {transactions.map((t) => {
                    const meta = TYPE_LABEL[t.type]
                    return (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0e1e3f]">
                            {t.description ?? meta.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(t.created_at)} · {meta.label}
                            {t.reference_id && <span> · Ref {t.reference_id}</span>}
                          </p>
                        </div>
                        <span className={`font-bold ${meta.color}`}>
                          {meta.sign} ₹ {t.amount.toLocaleString('en-IN')}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {topUpOpen && walletRow && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Top up wallet</h2>
              <button
                type="button"
                onClick={() => setTopUpOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Method
                </label>
                <select
                  value={topUpMethod}
                  onChange={(e) => setTopUpMethod(e.target.value as TopUpMethod)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  {(Object.keys(METHOD_LABEL) as TopUpMethod[]).map((m) => (
                    <option key={m} value={m}>
                      {METHOD_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Reference / UTR (optional)
                </label>
                <input
                  value={topUpRef}
                  onChange={(e) => setTopUpRef(e.target.value)}
                  placeholder="e.g., UTR1234567890 or Razorpay payment id"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                ⚠ Razorpay checkout + webhook confirmation not yet wired. This stopgap records the
                transaction and credits the wallet immediately. Backend webhook will replace this
                in a future sprint.
              </p>
              {submitError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {submitError}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTopUpOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTopUp}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Initiate top-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

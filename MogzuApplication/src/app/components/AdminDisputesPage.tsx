import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  BookingDispute,
  DisputeResolution,
  DisputeStatus,
} from '@/lib/database.types'

type Row = BookingDispute & {
  bookings: {
    listings: { title: string | null } | null
    corporate_accounts: { name: string | null } | null
    vendors: { business_name: string | null } | null
    total_amount: number | null
    payment_status: string
    payment_method: string | null
    user_id?: string
    vendor_id?: string
    corporate_id?: string
  } | null
}

const STATUS_META: Record<DisputeStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-rose-100 text-rose-700' },
  investigating: { label: 'Investigating', className: 'bg-amber-100 text-amber-800' },
  awaiting_party: { label: 'Awaiting party', className: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700' },
  dismissed: { label: 'Dismissed', className: 'bg-slate-100 text-slate-600' },
}

const RESOLUTION_LABEL: Record<DisputeResolution, string> = {
  no_refund: 'No refund',
  partial_refund: 'Partial refund',
  full_refund: 'Full refund',
  vendor_penalty: 'Vendor penalty',
  no_action: 'No action',
}

export default function AdminDisputesPage() {
  const params = useParams<{ id?: string }>()
  const { role } = useAuth()
  const isSupport = role === 'support' || role === 'mogzu_admin' || role === 'account_manager'

  if (!isSupport) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Support / admin role required.</p>
      </div>
    )
  }
  if (params.id) return <DisputeDetail disputeId={params.id} />
  return <Queue />
}

function Queue() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('open')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.bookingDisputes.listQueue(
      statusFilter === 'all' ? undefined : statusFilter,
    )
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    return {
      open: rows.filter((r) => r.status === 'open').length,
      investigating: rows.filter((r) => r.status === 'investigating').length,
      resolved: rows.filter((r) => r.status === 'resolved').length,
    }
  }, [rows])

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Disputes & escalations"
          subtitle="Booking disputes raised by either party. Resolve with a refund decision and a mandatory resolution note."
        />

        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Open" value={counts.open} className="text-rose-700" />
          <Stat
            label="Investigating"
            value={counts.investigating}
            className="text-amber-700"
          />
          <Stat label="Resolved" value={counts.resolved} className="text-emerald-700" />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DisputeStatus | 'all')
            }
            className="h-9 rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value="all">Status: All</option>
            {Object.keys(STATUS_META).map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s as DisputeStatus].label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No disputes.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Raised</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Parties</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/admin/disputes/${d.id}`)}
                    className="cursor-pointer hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(d.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {d.bookings?.listings?.title ?? '—'}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {d.booking_id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="text-slate-900">{d.bookings?.corporate_accounts?.name ?? '—'}</p>
                      <p className="text-slate-500">vs {d.bookings?.vendors?.business_name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{d.reason_category}</p>
                      <p className="line-clamp-1 text-xs text-slate-500">{d.reason_body}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹ {(d.bookings?.total_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_META[d.status].className}`}
                      >
                        {STATUS_META[d.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function DisputeDetail({ disputeId }: { disputeId: string }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [dispute, setDispute] = useState<Row | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolution, setResolution] = useState<DisputeResolution>('no_action')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.bookingDisputes.getById(disputeId)
    setDispute(data as Row)
    setLoading(false)
  }, [disputeId])

  useEffect(() => {
    load()
  }, [load])

  const handleStatus = async (next: DisputeStatus) => {
    await db.bookingDisputes.setStatus(disputeId, next)
    load()
  }

  const handleResolve = async () => {
    if (!profile || !dispute) return
    if (!note.trim()) {
      setNotice('Resolution note is required.')
      return
    }
    setSubmitting(true)

    const { error } = await db.bookingDisputes.resolve(
      disputeId,
      resolution,
      note.trim(),
      profile.id,
    )
    if (error) {
      setNotice(error.message)
      setSubmitting(false)
      return
    }

    // Trigger refund if applicable
    if (
      (resolution === 'full_refund' || resolution === 'partial_refund') &&
      dispute.bookings
    ) {
      const total = dispute.bookings.total_amount ?? 0
      const fee = resolution === 'partial_refund' ? Math.round(total * 0.5) : 0
      const bookingProxy = {
        id: dispute.booking_id,
        corporate_id: dispute.bookings.corporate_id ?? '',
        total_amount: total,
        payment_status: dispute.bookings.payment_status,
        payment_method: dispute.bookings.payment_method,
      } as any
      await db.bookings.cancelWithRefund(
        bookingProxy,
        `Dispute resolution: ${RESOLUTION_LABEL[resolution]} — ${note.trim()}`,
        fee,
        profile.id,
      )
    }

    // Notify both parties
    if (dispute.bookings?.user_id) {
      db.notifications.notify({
        userId: dispute.bookings.user_id,
        type: 'system',
        title: 'Dispute resolved',
        body: `${RESOLUTION_LABEL[resolution]} — ${note.trim()}`,
        linkUrl: `/bookings/${dispute.booking_id}`,
      })
    }

    setSubmitting(false)
    setNotice('Dispute resolved + parties notified.')
    load()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!dispute) return <p className="p-12 text-center text-sm">Dispute not found.</p>

  const canResolve = !['resolved', 'dismissed'].includes(dispute.status)

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-3xl px-6 py-6">
        <button
          type="button"
          onClick={() => navigate('/admin/disputes')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          Back to queue
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Dispute {dispute.id.slice(0, 8)}
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {dispute.reason_category}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Booking{' '}
                <a
                  href={`/bookings/${dispute.booking_id}`}
                  className="font-mono text-[#2563eb] hover:underline"
                >
                  {dispute.booking_id.slice(0, 8)}
                </a>{' '}
                · {dispute.bookings?.listings?.title ?? '—'}
              </p>
            </div>
            <select
              value={dispute.status}
              onChange={(e) => handleStatus(e.target.value as DisputeStatus)}
              disabled={!canResolve}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_META[dispute.status].className}`}
            >
              {(Object.keys(STATUS_META) as DisputeStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-2">
            <p>
              <strong className="text-slate-500">Corporate:</strong>{' '}
              {dispute.bookings?.corporate_accounts?.name ?? '—'}
            </p>
            <p>
              <strong className="text-slate-500">Vendor:</strong>{' '}
              {dispute.bookings?.vendors?.business_name ?? '—'}
            </p>
            <p>
              <strong className="text-slate-500">Amount:</strong> ₹{' '}
              {(dispute.bookings?.total_amount ?? 0).toLocaleString('en-IN')}
            </p>
            <p>
              <strong className="text-slate-500">Payment:</strong>{' '}
              {dispute.bookings?.payment_status} ({dispute.bookings?.payment_method ?? '—'})
            </p>
          </div>

          <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 p-4 text-sm text-slate-800">
            {dispute.reason_body}
          </p>

          {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Evidence
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {dispute.evidence_urls.map((u, i) => (
                  <li key={i}>
                    <a
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2563eb] hover:underline"
                    >
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dispute.resolution && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-1 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="size-4" />
                Resolved: {RESOLUTION_LABEL[dispute.resolution]}
              </p>
              {dispute.resolution_note && (
                <p className="mt-1 text-sm text-emerald-800">{dispute.resolution_note}</p>
              )}
            </div>
          )}
        </div>

        {canResolve && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Resolve dispute
            </h2>

            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as DisputeResolution)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  {(Object.keys(RESOLUTION_LABEL) as DisputeResolution[]).map((r) => (
                    <option key={r} value={r}>
                      {RESOLUTION_LABEL[r]}
                    </option>
                  ))}
                </select>
                {(resolution === 'full_refund' || resolution === 'partial_refund') && (
                  <p className="mt-1 text-[11px] text-amber-800">
                    {resolution === 'partial_refund'
                      ? 'Partial = 50% refund. Wallet credit immediate, card/UPI queued for Razorpay.'
                      : 'Full refund. Wallet credit immediate, card/UPI queued for Razorpay.'}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Resolution note (required)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Logged against the booking and visible to both parties."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              {notice && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {notice}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={submitting || !note.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <AlertTriangle className="size-4" />
                  Mark resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  className = '',
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${className || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

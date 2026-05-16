import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  ShieldAlert,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  Booking,
  BookingAddOn,
  Listing,
  UserProfile,
  Vendor,
} from '@/lib/database.types'

type BookingDetail = Booking & {
  listings: Listing | null
  vendors: Vendor | null
  user_profiles: UserProfile | null
  booking_add_ons: BookingAddOn[]
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status: Booking['status']) {
  switch (status) {
    case 'pending_approval':
      return { label: 'Pending Approval', className: 'bg-amber-100 text-amber-800', Icon: Clock }
    case 'pending_vendor':
      return { label: 'Awaiting Vendor', className: 'bg-blue-100 text-blue-800', Icon: UserCheck }
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-800', Icon: CheckCircle }
    case 'completed':
      return { label: 'Completed', className: 'bg-emerald-100 text-emerald-800', Icon: CheckCircle }
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-rose-100 text-rose-700', Icon: XCircle }
    case 'disputed':
      return { label: 'Disputed', className: 'bg-rose-100 text-rose-700', Icon: ShieldAlert }
    case 'draft':
      return { label: 'Draft', className: 'bg-slate-100 text-slate-700', Icon: Clock }
  }
}

export default function CorporateApprovalDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { profile, role } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [request, setRequest] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [approvalComment, setApprovalComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canApprove = role === 'l2_manager' || role === 'l3_admin'

  const loadRequest = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setLoadError('')
    const { data, error } = await db.bookings.getById(id)
    if (error) {
      setLoadError(error.message)
      setRequest(null)
    } else {
      setRequest(data as BookingDetail)
    }
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    loadRequest()
  }, [loadRequest])

  const listIntent = (location.state as { intent?: 'approve' | 'reject' } | null)?.intent

  const canTakeAction = useMemo(
    () => request?.status === 'pending_approval' && canApprove,
    [request?.status, canApprove],
  )

  useEffect(() => {
    if (!canTakeAction || !listIntent) return
    const section = document.getElementById('corporate-approval-actions')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.requestAnimationFrame(() => {
      if (listIntent === 'approve') document.getElementById('approvalComment')?.focus()
      else document.getElementById('rejectionReason')?.focus()
    })
  }, [canTakeAction, listIntent])

  const handleApprove = async () => {
    if (!request || !canTakeAction || !profile) return
    setActionError('')
    if (!approvalComment.trim()) {
      setActionError('Approval comment is required.')
      return
    }
    setSubmitting(true)
    const { error } = await db.bookings.approve(request.id, profile.id)
    if (error) {
      setActionError(error.message)
      setSubmitting(false)
      return
    }
    db.notifications.notify({
      userId: request.user_id,
      type: 'approval_decided',
      title: 'Your booking was approved',
      body: `${request.listings?.title ?? 'Booking'} — awaiting vendor confirmation. Manager comment: ${approvalComment.trim()}`,
      linkUrl: `/bookings/${request.id}`,
    })
    setActionSuccess('Request approved. Vendor will be notified.')
    setSubmitting(false)
    loadRequest()
  }

  const handleReject = async () => {
    if (!request || !canTakeAction) return
    setActionError('')
    const reason = rejectionReason.trim()
    if (!reason) {
      setActionError('Rejection reason is required.')
      return
    }
    if (reason.length < 10) {
      setActionError('Provide at least 10 characters of context.')
      return
    }
    setSubmitting(true)
    const { error } = await db.bookings.cancel(request.id, `Rejected by manager: ${reason}`, 0)
    if (error) {
      setActionError(error.message)
      setSubmitting(false)
      return
    }
    db.notifications.notify({
      userId: request.user_id,
      type: 'booking_cancelled',
      title: 'Your booking was rejected by manager',
      body: reason,
      linkUrl: `/bookings/${request.id}`,
    })
    setActionSuccess('Request rejected. Employee will be notified.')
    setSubmitting(false)
    loadRequest()
  }

  if (!canApprove) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <h2 className="font-semibold text-amber-900">Manager access required</h2>
          <p className="mt-1 text-sm text-amber-800">
            Only L2 Managers and L3 Admins can review approval requests.
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
          <div className="mx-auto max-w-4xl px-8 py-6">
            <button
              type="button"
              onClick={() => navigate('/corporate/approvals')}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back to approvals
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{loadError}</p>
                <button
                  type="button"
                  onClick={loadRequest}
                  className="mt-3 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Retry
                </button>
              </div>
            ) : !request ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-600">Request not found.</p>
              </div>
            ) : (
              <>
                {(() => {
                  const sb = statusBadge(request.status)
                  return (
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Request {request.id.slice(0, 8)}
                          </p>
                          <h1 className="mt-1 text-2xl font-semibold text-[#0e1e3f]">
                            {request.listings?.title ?? 'Booking request'}
                          </h1>
                          <p className="mt-1 text-sm text-gray-500">
                            Submitted {formatDate(request.created_at)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${sb.className}`}
                        >
                          <sb.Icon className="size-3.5" />
                          {sb.label}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                        <DetailRow label="Requested by">
                          <p className="font-medium text-gray-900">
                            {request.user_profiles?.full_name ?? '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.user_profiles?.department ?? '—'} ·{' '}
                            {request.user_profiles?.role ?? '—'}
                          </p>
                        </DetailRow>
                        <DetailRow label="Vendor">
                          <p className="font-medium text-gray-900">
                            {request.vendors?.business_name ?? '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.vendors?.city ?? '—'}
                          </p>
                        </DetailRow>
                        <DetailRow label="Total amount">
                          <p className="text-xl font-bold text-gray-900">
                            ₹ {(request.total_amount ?? 0).toLocaleString('en-IN')}
                          </p>
                          {request.base_amount != null && (
                            <p className="text-xs text-gray-500">
                              Base ₹{request.base_amount.toLocaleString('en-IN')} + add-ons ₹
                              {request.add_ons_amount.toLocaleString('en-IN')} + fee ₹
                              {request.platform_fee.toLocaleString('en-IN')}
                            </p>
                          )}
                        </DetailRow>
                        <DetailRow label="Group size">
                          <p className="font-medium text-gray-900">
                            {request.group_size ?? '—'}
                          </p>
                        </DetailRow>
                        {request.start_time && (
                          <DetailRow label="Start time">
                            <p className="font-medium text-gray-900">
                              {formatDate(request.start_time)}
                            </p>
                          </DetailRow>
                        )}
                        {request.end_time && (
                          <DetailRow label="End time">
                            <p className="font-medium text-gray-900">
                              {formatDate(request.end_time)}
                            </p>
                          </DetailRow>
                        )}
                      </div>

                      {request.purpose_note && (
                        <div className="mt-4 rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Purpose note
                          </p>
                          <p className="mt-1 text-sm text-gray-800">{request.purpose_note}</p>
                        </div>
                      )}

                      {request.booking_add_ons && request.booking_add_ons.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Add-ons
                          </p>
                          <ul className="space-y-1 text-sm">
                            {request.booking_add_ons.map((a) => (
                              <li key={a.id} className="flex justify-between">
                                <span>
                                  {a.name} × {a.quantity}
                                </span>
                                <span>₹ {(a.price * a.quantity).toLocaleString('en-IN')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {request.approved_by && request.approved_at && (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                          <p className="text-xs font-semibold text-emerald-800">
                            Approved {formatDate(request.approved_at)}
                          </p>
                        </div>
                      )}

                      {request.status === 'cancelled' && request.cancellation_reason && (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                          <p className="text-xs font-semibold text-rose-800">
                            Rejection / cancellation
                          </p>
                          <p className="mt-1 text-sm text-rose-800">
                            {request.cancellation_reason}
                          </p>
                          {request.cancelled_at && (
                            <p className="mt-1 text-[11px] text-rose-700">
                              {formatDate(request.cancelled_at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {canTakeAction && (
                  <div
                    id="corporate-approval-actions"
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold text-[#0e1e3f]">Take action</h2>

                    {actionSuccess && (
                      <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {actionSuccess}
                      </p>
                    )}
                    {actionError && (
                      <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {actionError}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="approvalComment"
                          className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500"
                        >
                          Approval comment <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          id="approvalComment"
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          rows={3}
                          placeholder="Visible to employee on confirmation"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={submitting}
                          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submitting && <Loader2 className="size-4 animate-spin" />}
                          Approve
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="rejectionReason"
                          className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500"
                        >
                          Rejection reason <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          id="rejectionReason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          placeholder="Explain why this request is being rejected"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={submitting}
                          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                          {submitting && <Loader2 className="size-4 animate-spin" />}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

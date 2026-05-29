import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  getNextPendingLevel,
  notifyFirstApprovers,
  buildBookingApprovalFields,
  getBookingApprovalMeta,
  WORKFLOW_LEVEL_LABELS,
  type BookingApprovalMeta,
} from '@/lib/bookingApprovalMeta'
import {
  listRules as listWorkflowRules,
  resolveLevelsForAmount,
  type WorkflowLevel,
} from '@/lib/approvalWorkflow'
import { db } from '@/lib/db'
import type { ApprovalWorkflowRule, Database } from '@/lib/database.types'

type BookingRow = Database['public']['Tables']['bookings']['Row'] & {
  listings?: { title?: string | null; location?: string | null } | null
}

interface ApprovalPageState {
  category?: string
  venueName?: string
  venueLocation?: string
  bookingDate?: string
  totalAmount?: number
  bookingId?: string
}

const formatInr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

type ChainStepStatus = 'done' | 'current' | 'upcoming' | 'rejected'

type ChainStep = {
  id: string
  label: string
  sublabel: string
  status: ChainStepStatus
}

function buildApprovalChainSteps(
  meta: BookingApprovalMeta | null,
  totalAmount: number,
  workflowRules: ApprovalWorkflowRule[],
  requestStatus: 'pending' | 'rejected',
): ChainStep[] {
  const steps: ChainStep[] = [
    { id: 'requester', label: 'You', sublabel: 'Requester', status: 'done' },
  ]

  const levels: WorkflowLevel[] = meta?.requiredLevels?.length
    ? meta.requiredLevels
    : resolveLevelsForAmount(workflowRules, totalAmount)

  if (!levels.length) {
    steps.push({
      id: 'L1-fallback',
      label: WORKFLOW_LEVEL_LABELS.L1,
      sublabel: requestStatus === 'rejected' ? 'Rejected (L1)' : 'Pending (L1)',
      status: requestStatus === 'rejected' ? 'rejected' : 'current',
    })
    steps.push({
      id: 'L2-fallback',
      label: WORKFLOW_LEVEL_LABELS.L2,
      sublabel: 'Awaiting (L2)',
      status: 'upcoming',
    })
    return steps
  }

  const approved = meta?.approvedLevels ?? []
  const nextPending = meta ? getNextPendingLevel(meta) : levels[0]

  for (const level of levels) {
    if (approved.includes(level)) {
      steps.push({
        id: level,
        label: WORKFLOW_LEVEL_LABELS[level],
        sublabel: 'Approved',
        status: 'done',
      })
      continue
    }
    if (requestStatus === 'rejected' && level === nextPending) {
      steps.push({
        id: level,
        label: WORKFLOW_LEVEL_LABELS[level],
        sublabel: `Rejected (${level})`,
        status: 'rejected',
      })
      continue
    }
    if (level === nextPending) {
      steps.push({
        id: level,
        label: WORKFLOW_LEVEL_LABELS[level],
        sublabel: `Pending (${level})`,
        status: 'current',
      })
      continue
    }
    steps.push({
      id: level,
      label: WORKFLOW_LEVEL_LABELS[level],
      sublabel: `Awaiting (${level})`,
      status: 'upcoming',
    })
  }

  return steps
}

function chainConnectorClass(left: ChainStepStatus, right: ChainStepStatus): string {
  if (left === 'done' && (right === 'done' || right === 'current')) {
    return 'flex-1 h-px bg-green-200 -mt-6 min-w-[12px]'
  }
  if (left === 'rejected' || right === 'rejected') {
    return 'flex-1 h-px bg-red-200 -mt-6 min-w-[12px]'
  }
  return 'flex-1 h-px border-t border-dashed border-gray-200 -mt-6 min-w-[12px]'
}

function chainNodeClass(status: ChainStepStatus): string {
  switch (status) {
    case 'done':
      return 'w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 z-10'
    case 'current':
      return 'w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-600 shadow-[0_0_0_4px_rgba(251,191,36,0.1)] flex items-center justify-center z-10 relative'
    case 'rejected':
      return 'w-8 h-8 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center z-10'
    default:
      return 'w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 z-10'
  }
}

const formatBookingWhen = (booking: BookingRow) => {
  if (booking.start_time) {
    try {
      return new Date(booking.start_time).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return booking.start_time
    }
  }
  if (booking.created_at) {
    try {
      return new Date(booking.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return booking.created_at
    }
  }
  return '—'
}

export default function ApprovalRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { profile, corporateId } = useAuth()
  const bookingState = location.state as ApprovalPageState | undefined
  const bookingIdParam = searchParams.get('bookingId') ?? ''
  const bookingId = bookingState?.bookingId ?? bookingIdParam

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [revisionComment, setRevisionComment] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [booking, setBooking] = useState<BookingRow | null>(null)
  const [loadError, setLoadError] = useState('')
  const [usingDemo, setUsingDemo] = useState(!bookingId)
  const [workflowRules, setWorkflowRules] = useState<ApprovalWorkflowRule[]>([])

  const requestStatus =
    searchParams.get('status') === 'rejected' || booking?.status === 'cancelled'
      ? 'rejected'
      : 'pending'

  const reasonParam = searchParams.get('reason') || ''
  const rejectionReason =
    booking?.cancellation_reason ||
    reasonParam ||
    'Budget threshold exceeded for current approval policy.'

  const categoryMap: Record<string, string> = {
    conference: 'D Space',
    coworking: 'D Space',
    event: 'Events',
    activity: 'Activities',
    meeting: 'D Space',
    gifting: 'Gifting',
    events: 'Events',
    spacex_coworking: 'D Space',
    spacex_stay: 'Stay',
    default: 'D Space',
  }

  const moduleFromBooking = booking?.module
  const moduleLabel =
    (moduleFromBooking && categoryMap[moduleFromBooking]) ||
    categoryMap[bookingState?.category ?? 'default'] ||
    'D Space'

  const displayVenueName =
    booking?.listings?.title ?? bookingState?.venueName ?? 'Grand Event Venue BKC'
  const displayDate = booking
    ? formatBookingWhen(booking)
    : bookingState?.bookingDate ?? 'Oct 20, 2024 • 10:00 am'
  const displayAmount =
    booking?.total_amount != null
      ? formatInr(booking.total_amount)
      : bookingState?.totalAmount
        ? formatInr(bookingState.totalAmount)
        : '₹1,20,000'

  const displayAmountValue =
    booking?.total_amount ?? bookingState?.totalAmount ?? 120_000

  const approvalNote = useMemo(
    () => (booking ? getBookingApprovalMeta(booking) : { userNote: '', meta: null }),
    [booking],
  )

  const chainSteps = useMemo(
    () =>
      buildApprovalChainSteps(
        approvalNote.meta,
        displayAmountValue,
        workflowRules,
        requestStatus,
      ),
    [approvalNote.meta, displayAmountValue, workflowRules, requestStatus],
  )

  const chainSummary = useMemo(() => {
    const levels = approvalNote.meta?.requiredLevels?.length
      ? approvalNote.meta.requiredLevels
      : resolveLevelsForAmount(workflowRules, displayAmountValue)
    if (!levels.length) return 'manager approval (default L1 → L2)'
    return levels.map((l) => WORKFLOW_LEVEL_LABELS[l]).join(' → ')
  }, [approvalNote.meta, workflowRules, displayAmountValue])

  useEffect(() => {
    if (!corporateId) return
    void listWorkflowRules(corporateId).then((res) => {
      setWorkflowRules(res.data ?? [])
    })
  }, [corporateId])

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setUsingDemo(true)
      setBooking(null)
      return
    }
    setLoadError('')
    const { data, error: fetchError } = await db.bookings.getById(bookingId)
    if (fetchError || !data) {
      setLoadError(fetchError?.message ?? 'Could not load this request.')
      setUsingDemo(true)
      setBooking(null)
      return
    }
    setBooking(data as BookingRow)
    setUsingDemo(false)
  }, [bookingId])

  useEffect(() => {
    void loadBooking()
  }, [loadBooking])

  const handleWithdraw = async () => {
    if (bookingId && booking && profile) {
      const { error: cancelError } = await db.bookings.cancel(
        bookingId,
        'Withdrawn by requester',
        0,
      )
      if (cancelError) {
        setError(cancelError.message)
        return
      }
    }
    navigate('/bookings')
  }

  const handleResubmit = async () => {
    setError('')
    setSuccess('')

    const normalizedComment = revisionComment.trim()
    if (!normalizedComment) {
      setError('Please add a revision comment before resubmitting.')
      return
    }

    if (normalizedComment.length < 10) {
      setError('Please add at least 10 characters so approvers have enough context.')
      return
    }

    setIsSubmitting(true)

    if (bookingId && booking && corporateId) {
      const { userNote, meta } = getBookingApprovalMeta(booking)
      const composedUserNote = [
        userNote,
        `Resubmit (${new Date().toLocaleString('en-IN')}): ${normalizedComment}`,
      ]
        .filter(Boolean)
        .join('\n\n')

      const approvalFields = buildBookingApprovalFields(
        composedUserNote,
        meta?.requiredLevels ?? [],
        [],
      )

      const { error: updateError } = await db.bookings.updateStatus(bookingId, 'pending_approval', {
        purpose_note: approvalFields.purpose_note,
        required_approval_levels: approvalFields.required_approval_levels,
        approved_approval_levels: approvalFields.approved_approval_levels,
        cancellation_reason: null,
        cancelled_at: null,
        cancellation_fee: 0,
      })

      setIsSubmitting(false)
      if (updateError) {
        setError(updateError.message)
        return
      }

      const levels = meta?.requiredLevels ?? resolveLevelsForAmount(workflowRules, displayAmountValue)
      await notifyFirstApprovers(corporateId, levels, {
        bookingId,
        title: 'Revised booking awaiting your approval',
        body: `${booking.listings?.title ?? 'Booking'} — ₹${displayAmountValue.toLocaleString('en-IN')}.`,
      })

      setSuccess(
        'Revised request submitted successfully. It has been routed again for approval.',
      )
      setRevisionComment('')
      void loadBooking()
      return
    }

    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(
        'Revised request submitted successfully with your comment. It has been routed again for approval.',
      )
      setRevisionComment('')
    }, 700)
  }

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <MogzuCorporateScrollSurface className="flex items-center justify-center py-12">
          <div className="max-w-xl w-full mx-auto px-6">
            {usingDemo && (
              <div className="mb-4">
                <DevMockDataBanner message="No live booking id — showing demo approval summary from checkout state." />
              </div>
            )}
            {loadError && !usingDemo && (
              <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {loadError}
              </p>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400" />

              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-amber-500 ml-1" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {requestStatus === 'rejected' ? 'Request Rejected' : 'Sent for Approval'}
              </h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {requestStatus === 'rejected'
                  ? 'Your request was reviewed and rejected. You can revise and resubmit with additional context.'
                  : `Your booking request has been routed for ${chainSummary}.`}
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8 text-left">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                      {moduleLabel}
                    </span>
                    <h3 className="font-bold text-gray-900">{displayVenueName}</h3>
                    <p className="text-sm text-gray-500">{displayDate}</p>
                    {bookingId && (
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">Ref: {bookingId.slice(0, 8)}…</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">{displayAmount}</p>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                  Approval Chain
                </h4>
                <div className="flex items-start gap-1 overflow-x-auto pb-1">
                  {chainSteps.map((step, index) => (
                    <Fragment key={step.id}>
                      {index > 0 ? (
                        <div
                          className={chainConnectorClass(
                            chainSteps[index - 1].status,
                            step.status,
                          )}
                          aria-hidden
                        />
                      ) : null}
                      <div
                        className={`flex min-w-[76px] flex-col items-center ${
                          step.status === 'upcoming' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className={chainNodeClass(step.status)}>
                          {step.status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {step.status === 'current' ? (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                          ) : null}
                        </div>
                        <span className="mt-2 text-center text-xs font-medium text-gray-900">
                          {step.label}
                        </span>
                        <span
                          className={`text-center text-[10px] font-medium ${
                            step.status === 'rejected'
                              ? 'text-red-600'
                              : step.status === 'current'
                                ? 'text-amber-600'
                                : step.status === 'done'
                                  ? 'text-green-700'
                                  : 'text-gray-500'
                          }`}
                        >
                          {step.sublabel}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>

              {requestStatus === 'pending' && (
                <>
                  {reasonParam && (
                    <div className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-100 py-3 rounded-lg mb-8 px-4">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-800">Budget warning</p>
                        <p className="text-amber-900/90">{rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm bg-blue-50 text-blue-800 py-3 rounded-lg border border-blue-100 mb-8">
                    <Clock className="w-4 h-4" />
                    <span>
                      Estimated response time: <strong>under 4 hours</strong>
                    </span>
                  </div>
                </>
              )}

              {requestStatus === 'rejected' && (
                <div className="mb-8 text-left">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-gray-700">{rejectionReason}</p>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="revision-comment">
                    Revised request comment
                  </label>
                  <textarea
                    id="revision-comment"
                    rows={4}
                    value={revisionComment}
                    onChange={(e) => setRevisionComment(e.target.value)}
                    placeholder="Add updates to your request for approver review..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                  {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                  {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View in Bookings
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>

              {requestStatus === 'rejected' && (
                <button
                  type="button"
                  onClick={handleResubmit}
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Resubmit Revised Request'}
                </button>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => void handleWithdraw()}
                  className="text-sm text-red-500 hover:text-red-600 font-medium underline-offset-4 hover:underline"
                >
                  Withdraw Request
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

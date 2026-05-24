import { db } from './db'

type EscalateRefundFailureInput = {
  audience: 'corporate' | 'vendor'
  submitterId: string
  corporateId: string | null
  vendorId: string | null
  bookingId: string
  contextUrl: string
  contextRole: string | null
  flow: 'booker_cancel' | 'vendor_reject' | 'admin_dispute'
  resolutionNote?: string | null
  cancellationReason: string
  fee: number
  errorMessage: string
}

export async function escalateRefundFailure(
  input: EscalateRefundFailureInput,
): Promise<{ ticketId: string | null; error: string | null }> {
  const subject = `Refund processing failed (${input.flow})`
  const body = [
    `Booking: ${input.bookingId}`,
    `Flow: ${input.flow}`,
    `Reason: ${input.cancellationReason}`,
    `Fee: ₹${Math.max(0, input.fee).toLocaleString('en-IN')}`,
    input.resolutionNote ? `Resolution note: ${input.resolutionNote}` : null,
    `Gateway/DB error: ${input.errorMessage}`,
  ]
    .filter(Boolean)
    .join('\n')

  const { data, error } = await db.supportTickets.create({
    audience: input.audience,
    submitter_id: input.submitterId,
    corporate_id: input.corporateId,
    vendor_id: input.vendorId,
    category: 'Payment / refund',
    subject,
    body,
    status: 'open',
    priority: 'high',
    sla_hours: 12,
    context_url: input.contextUrl,
    context_role: input.contextRole,
    context_last_action: 'refund_failed_auto_escalation',
    context_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    assigned_to: null,
    related_booking_id: input.bookingId,
    related_payout_id: null,
    csat_score: null,
    csat_feedback: null,
    resolved_at: null,
    closed_at: null,
  })
  if (error) return { ticketId: null, error: error.message }
  return { ticketId: data?.id ?? null, error: null }
}

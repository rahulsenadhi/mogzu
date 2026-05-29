import { buildBookingApprovalFields } from '@/lib/bookingApprovalMeta'
import type { WorkflowLevel } from '@/lib/approvalWorkflow'
import { db } from '@/lib/db'
import type { ModuleId } from '@/lib/database.types'

export type CreatePendingApprovalInput = {
  corporateId: string
  userId: string
  vendorId: string
  listingId: string
  module: ModuleId
  baseAmount: number
  addOnsAmount: number
  platformFee: number
  totalAmount: number
  purposeNote?: string | null
  requiredApprovalLevels?: WorkflowLevel[]
  groupSize?: number
  startTime?: string | null
  endTime?: string | null
}

/** Persists a corporate booking awaiting manager approval. */
export async function createCorporatePendingApprovalBooking(
  input: CreatePendingApprovalInput,
): Promise<{ bookingId: string | null; error: string | null }> {
  let commissionRate: number | null = null
  const vRule = await db.commissions.getForVendor(input.vendorId)
  if (vRule.data && vRule.data.length > 0) commissionRate = vRule.data[0].rate
  else {
    const g = await db.commissions.getGlobal()
    if (g.data) commissionRate = g.data.rate
  }

  const { data, error } = await db.bookings.create({
    corporate_id: input.corporateId,
    user_id: input.userId,
    vendor_id: input.vendorId,
    listing_id: input.listingId,
    module: input.module,
    status: 'pending_approval',
    group_size: input.groupSize ?? 1,
    start_time: input.startTime ?? null,
    end_time: input.endTime ?? null,
    base_amount: input.baseAmount,
    add_ons_amount: input.addOnsAmount,
    platform_fee: input.platformFee,
    total_amount: input.totalAmount,
    commission_rate: commissionRate,
    payment_method: null,
    payment_reference: null,
    payment_status: 'pending',
    ...buildBookingApprovalFields(input.purposeNote, input.requiredApprovalLevels ?? []),
    approved_by: null,
    approved_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    cancellation_fee: null,
    vendor_response_deadline: null,
    completed_at: null,
  })

  if (error || !data) {
    return { bookingId: null, error: error?.message ?? 'Failed to create booking.' }
  }
  return { bookingId: data.id, error: null }
}

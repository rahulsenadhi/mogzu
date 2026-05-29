import { isListingUuid } from '@/app/lib/activityListingResolver'

import type { ClassicBookingFlowState } from '@/app/lib/classicBookingFlow'

import {

  buildBookingApprovalFields,

  notifyFirstApprovers,

  resolveBookingApprovalOnCreate,

} from '@/lib/bookingApprovalMeta'

import { db } from '@/lib/db'

import type { ModuleId } from '@/lib/database.types'



export type ClassicCheckoutResult = {

  bookingId: string | null

  error: string | null

  requiresApproval?: boolean

}



/** Creates a booking after classic DSpace checkout when spaceId is a listing UUID. */

export async function createClassicCheckoutBooking(input: {

  corporateId: string

  userId: string

  bookingFlow: ClassicBookingFlowState

  grandTotal: number

  paymentMethod: string

  amountPaid: number

}): Promise<ClassicCheckoutResult> {

  const listingId = input.bookingFlow.spaceId

  if (!listingId || !isListingUuid(listingId)) {

    return { bookingId: null, error: null }

  }



  const { data: listing, error: listingErr } = await db.listings.getById(listingId)

  if (listingErr || !listing?.vendor_id) {

    return { bookingId: null, error: listingErr?.message ?? 'Listing not found' }

  }



  const approval = await resolveBookingApprovalOnCreate(

    input.corporateId,

    listing.module as ModuleId,

    input.grandTotal,

  )



  let commissionRate: number | null = null

  const vRule = await db.commissions.getForVendor(listing.vendor_id)

  if (vRule.data && vRule.data.length > 0) commissionRate = vRule.data[0].rate

  else {

    const g = await db.commissions.getGlobal()

    if (g.data) commissionRate = g.data.rate

  }



  const userPurposeNote = [

    input.bookingFlow.selection.planningFor

      ? `Planning for: ${input.bookingFlow.selection.planningFor}`

      : null,

    input.bookingFlow.selection.approver

      ? `Approver: ${input.bookingFlow.selection.approver}`

      : null,

    input.bookingFlow.bookingStartDate

      ? `When: ${input.bookingFlow.bookingStartDate}`

      : null,

    input.bookingFlow.location ? `Where: ${input.bookingFlow.location}` : null,

  ]

    .filter(Boolean)

    .join('\n')



  const { data, error } = await db.bookings.create({

    corporate_id: input.corporateId,

    user_id: input.userId,

    vendor_id: listing.vendor_id,

    listing_id: listing.id,

    module: listing.module as ModuleId,

    status: approval.status,

    group_size: Math.max(1, input.bookingFlow.selection.attendees || 1),

    start_time: null,

    end_time: null,

    base_amount: input.bookingFlow.bookingBaseTotal,

    add_ons_amount: input.bookingFlow.addOnTotal,

    platform_fee: input.bookingFlow.serviceFee,

    total_amount: input.grandTotal,

    commission_rate: commissionRate,

    payment_method: input.paymentMethod,

    payment_reference: null,

    payment_status: input.amountPaid > 0 ? 'paid' : 'pending',

    ...buildBookingApprovalFields(userPurposeNote, approval.requiredLevels),

    approved_by: null,

    approved_at: null,

    cancelled_at: null,

    cancellation_reason: null,

    cancellation_fee: null,

    vendor_response_deadline:

      approval.status === 'pending_vendor'

        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        : null,

    completed_at: null,

  })



  if (error || !data) {

    return { bookingId: null, error: error?.message ?? 'Failed to create booking' }

  }



  if (approval.status === 'pending_approval') {

    await notifyFirstApprovers(input.corporateId, approval.requiredLevels, {

      bookingId: data.id,

      title: 'New booking awaiting your approval',

      body: `${input.bookingFlow.spaceName ?? listing.title ?? 'Booking'} — ₹${input.grandTotal.toLocaleString('en-IN')}.`,

    })

  }



  return {

    bookingId: data.id,

    error: null,

    requiresApproval: approval.status === 'pending_approval',

  }

}


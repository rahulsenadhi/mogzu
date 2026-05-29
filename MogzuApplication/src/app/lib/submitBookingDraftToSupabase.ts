import { isListingUuid } from '@/app/lib/activityListingResolver'

import type { BookingDraft } from '@/app/lib/bookingDraft'

import {

  buildBookingApprovalFields,

  notifyFirstApprovers,

  resolveBookingApprovalOnCreate,

} from '@/lib/bookingApprovalMeta'

import { db } from '@/lib/db'

import type { ModuleId } from '@/lib/database.types'



export type SubmitDraftResult = {

  bookingId: string | null

  error: string | null

  usedDemo: boolean

  requiresApproval?: boolean

}



/** Persists an event-activity booking draft when the listing id is a live Supabase UUID. */

export async function submitBookingDraftToSupabase(

  draft: BookingDraft,

  opts: { corporateId: string; userId: string; contactNote?: string | null },

): Promise<SubmitDraftResult> {

  const listingId = String((draft.listing as { id?: string } | null)?.id ?? '')

  if (!isListingUuid(listingId)) {

    return { bookingId: null, error: null, usedDemo: true }

  }



  const { data: listing, error: listingErr } = await db.listings.getById(listingId)

  if (listingErr || !listing?.vendor_id) {

    return {

      bookingId: null,

      error: listingErr?.message ?? 'Listing not found',

      usedDemo: true,

    }

  }



  let startTime: string | null = null

  let endTime: string | null = null

  if (draft.selected_date && draft.selected_slot?.start_time) {

    const start = new Date(`${draft.selected_date}T${draft.selected_slot.start_time}`)

    const end = draft.selected_slot.end_time

      ? new Date(`${draft.selected_date}T${draft.selected_slot.end_time}`)

      : null

    if (!Number.isNaN(start.getTime())) startTime = start.toISOString()

    if (end && !Number.isNaN(end.getTime())) endTime = end.toISOString()

  } else if (draft.request_data?.preferred_date) {

    const preferred = new Date(draft.request_data.preferred_date)

    if (!Number.isNaN(preferred.getTime())) startTime = preferred.toISOString()

  }



  const baseAmount =

    draft.calculated.base_subtotal ?? listing.base_price ?? draft.calculated.grand_total ?? 0

  const addOnsAmount = draft.calculated.addons_total ?? 0

  const platformFee = draft.calculated.platform_fee ?? 0

  const totalAmount =

    draft.calculated.grand_total ?? Math.max(0, baseAmount + addOnsAmount + platformFee)



  const userPurposeNote = [

    opts.contactNote,

    draft.request_data?.requirements

      ? `Requirements: ${draft.request_data.requirements}`

      : null,

    draft.offer_amount != null

      ? `Offer: Rs ${draft.offer_amount.toLocaleString('en-IN')}/person`

      : null,

    draft.pricing_type === 'request_for_price' ? 'Type: Request for price' : null,

  ]

    .filter(Boolean)

    .join('\n')



  const approval = await resolveBookingApprovalOnCreate(

    opts.corporateId,

    listing.module as ModuleId,

    totalAmount,

  )



  let commissionRate: number | null = null

  const vRule = await db.commissions.getForVendor(listing.vendor_id)

  if (vRule.data && vRule.data.length > 0) commissionRate = vRule.data[0].rate

  else {

    const g = await db.commissions.getGlobal()

    if (g.data) commissionRate = g.data.rate

  }



  const { data, error } = await db.bookings.create({

    corporate_id: opts.corporateId,

    user_id: opts.userId,

    vendor_id: listing.vendor_id,

    listing_id: listing.id,

    module: listing.module as ModuleId,

    status: approval.status,

    group_size: Math.max(1, draft.group_size ?? 1),

    start_time: startTime,

    end_time: endTime,

    base_amount: baseAmount,

    add_ons_amount: addOnsAmount,

    platform_fee: platformFee,

    total_amount: totalAmount,

    commission_rate: commissionRate,

    payment_method: null,

    payment_reference: null,

    payment_status: 'pending',

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

    return { bookingId: null, error: error?.message ?? 'Failed to submit booking', usedDemo: false }

  }



  if (approval.status === 'pending_approval') {

    await notifyFirstApprovers(opts.corporateId, approval.requiredLevels, {

      bookingId: data.id,

      title: 'New activity booking awaiting your approval',

      body: `${listing.title ?? 'Activity'} — ₹${totalAmount.toLocaleString('en-IN')}.`,

    })

  }



  return {

    bookingId: data.id,

    error: null,

    usedDemo: false,

    requiresApproval: approval.status === 'pending_approval',

  }

}


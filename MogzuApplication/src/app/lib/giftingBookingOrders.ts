import type {
  Booking,
  CorporateAccount,
  FulfilmentStage,
  Listing,
  UserProfile,
} from '@/lib/database.types'
import type { OrderStatus } from '@/app/lib/vendorGiftingStore'

export type GiftingBookingRow = Booking & {
  listings: Listing | null
  user_profiles: UserProfile | null
  corporate_accounts: CorporateAccount | null
  vendors?: { business_name: string | null } | null
}

export function bookingToOrderStatus(booking: Booking): OrderStatus {
  if (booking.status === 'cancelled') return 'cancelled'
  if (booking.status === 'completed') return 'delivered'
  const stage = booking.fulfilment_stage
  if (stage === 'delivered' || stage === 'returned') return 'delivered'
  if (stage === 'dispatched' || stage === 'out_for_delivery') return 'shipped'
  if (stage === 'packed') return 'processing'
  if (booking.status === 'confirmed') return 'confirmed'
  return 'pending'
}

export function orderStatusToFulfilmentStage(status: OrderStatus): FulfilmentStage | null {
  if (status === 'processing') return 'packed'
  if (status === 'shipped') return 'dispatched'
  if (status === 'delivered') return 'delivered'
  return null
}

export function formatGiftingOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function giftingRowToDisplayOrder(row: GiftingBookingRow) {
  const listingTitle = row.listings?.title ?? 'Gifting order'
  const qty = row.group_size ?? 1
  const unitPrice =
    row.base_amount != null && qty > 0
      ? Math.round(row.base_amount / qty)
      : row.total_amount != null && qty > 0
        ? Math.round(row.total_amount / qty)
        : 0

  return {
    id: row.id.slice(0, 8).toUpperCase(),
    bookingId: row.id,
    corporateName: row.corporate_accounts?.name ?? 'Corporate account',
    vendorName: row.vendors?.business_name ?? undefined,
    products: [
      {
        productId: row.listing_id,
        productName: listingTitle,
        quantity: qty,
        unitPrice,
      },
    ],
    quantity: qty,
    amount: row.total_amount ?? row.base_amount ?? 0,
    status: bookingToOrderStatus(row),
    date: formatGiftingOrderDate(row.created_at),
    contactName: row.user_profiles?.full_name ?? '—',
    contactEmail: '—',
    contactPhone: row.user_profiles?.phone ?? '—',
    deliveryAddress: row.purpose_note ?? row.listings?.location_address ?? '—',
    deliveryPartner: row.carrier ?? undefined,
    disputeFlag: row.status === 'disputed',
    timeline: [{ at: row.created_at, message: `Booking ${row.status.replace(/_/g, ' ')}` }],
    raw: row,
  }
}

export type GiftingDisplayOrder = ReturnType<typeof giftingRowToDisplayOrder>

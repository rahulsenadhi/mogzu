export type BookingStatusValue =
  | 'PENDING'
  | 'Requested'
  | 'PUBLISHED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'INQUIRY'
  | 'APPROVED'

export type BookingTypeValue = 'Inquiry' | 'Request' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Approved'

export const deriveBookingTypeFromStatus = (status: BookingStatusValue): BookingTypeValue => {
  if (status === 'INQUIRY') return 'Inquiry'
  if (status === 'Requested') return 'Request'
  if (status === 'PENDING') return 'Pending'
  if (status === 'CONFIRMED') return 'Confirmed'
  if (status === 'CANCELLED') return 'Cancelled'
  return 'Approved'
}

export const getBookingActionLabel = (status: BookingStatusValue): string => {
  if (status === 'INQUIRY' || status === 'Requested') return 'Review request'
  if (status === 'PENDING') return 'Follow up'
  if (status === 'CANCELLED') return 'View history'
  return 'View details'
}

export const isInvoiceEligibleStatus = (status: BookingStatusValue): boolean =>
  status === 'CONFIRMED' || status === 'APPROVED' || status === 'PUBLISHED'

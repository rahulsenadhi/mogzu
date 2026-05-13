export type VendorResponseDisplayStatus = 'awaiting' | 'best_offer' | 'accepted' | 'declined';

export interface VendorStatusDisplay {
  displayStatus: VendorResponseDisplayStatus;
  label: string;
  subtext: string;
  colourToken: string;
}

/**
 * Maps booking status strings to the 4-state vendor response display system.
 * Pure function: deterministic mapping, no side effects.
 */
export type BookingStatusForVendorMapping =
  | 'PENDING'
  | 'INQUIRY'
  | 'REQUESTED'
  | 'PUBLISHED'
  | 'CONFIRMED'
  | 'CANCELLED'
  // Matches the casing used in `BookingsPage.tsx` mock data.
  | 'Requested'
  | 'APPROVED';

export function mapVendorStatusFromBookingStatus(
  bookingStatus: BookingStatusForVendorMapping
): VendorStatusDisplay {
  switch (bookingStatus) {
    case 'PENDING':
    case 'INQUIRY':
      return {
        displayStatus: 'awaiting',
        label: 'Awaiting vendor response',
        subtext: 'Your enquiry was sent',
        colourToken: 'bg-gray-500',
      };

    case 'REQUESTED':
    case 'Requested':
      return {
        displayStatus: 'best_offer',
        label: "Vendor's best offer received",
        subtext: 'Review and accept the offer',
        colourToken: 'bg-orange-400',
      };

    case 'CONFIRMED':
    case 'PUBLISHED':
    case 'APPROVED':
      return {
        displayStatus: 'accepted',
        label: 'Offer accepted',
        subtext: 'Proceed to booking confirmation',
        colourToken: 'bg-green-500',
      };

    case 'CANCELLED':
      return {
        displayStatus: 'declined',
        label: 'Vendor declined',
        subtext: 'View alternatives or revise your offer',
        colourToken: 'bg-red-500',
      };

    default:
      // Fallback for unexpected runtime values (e.g. API casing drift).
      return {
        displayStatus: 'awaiting',
        label: 'Awaiting vendor response',
        subtext: 'Your enquiry was sent',
        colourToken: 'bg-gray-500',
      };
  }
}


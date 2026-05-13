export type ClassicBookingAddon = {
  key: string
  label: string
  unitPrice: number
  quantity: number
  total: number
}

export type ClassicBookingSelection = {
  planningFor: string
  attendees: number
  contactNumber: string
  selectedTeam: string
  approver: string
}

export type ClassicBookingFlowState = {
  category: string
  spaceId?: string
  spaceName: string
  spaceImage: string
  location: string
  spaceTypes: string
  rating: string
  capacityRange: string
  bookingStartDate: string
  fullDayBooking: boolean
  bookingFromTime: string
  bookingToTime: string
  durationHours: number
  bookingBaseTotal: number
  serviceFee: number
  addOns: ClassicBookingAddon[]
  addOnTotal: number
  bookingGrandTotal: number
  selection: ClassicBookingSelection
}

type MaybeState = {
  dspaceBook?: {
    category?: string
    spaceId?: string
    spaceName?: string
    spaceImage?: string
    location?: string
    spaceTypes?: string
    rating?: string
    bookingStartDate?: string
    fullDayBooking?: boolean
    bookingFromTime?: string
    bookingToTime?: string
    durationHours?: number
    bookingGrandTotal?: number
    bookingBaseTotal?: number
    addOnTotal?: number
  }
  category?: string
  bookingFlow?: Partial<ClassicBookingFlowState>
}

export const buildClassicBookingBaseState = (input?: MaybeState): ClassicBookingFlowState => {
  const incoming = input?.bookingFlow
  const dspace = input?.dspaceBook
  const category = incoming?.category ?? dspace?.category ?? input?.category ?? 'conference'
  const bookingBaseTotal = incoming?.bookingBaseTotal ?? dspace?.bookingBaseTotal ?? 66000
  const serviceFee = incoming?.serviceFee ?? Math.round(bookingBaseTotal * 0.1)
  const addOnTotal = incoming?.addOnTotal ?? dspace?.addOnTotal ?? 0
  const addOns = incoming?.addOns ?? []
  return {
    category,
    spaceId: incoming?.spaceId ?? dspace?.spaceId,
    spaceName: incoming?.spaceName ?? dspace?.spaceName ?? 'WorkHub BKC',
    spaceImage: incoming?.spaceImage ?? dspace?.spaceImage ?? '',
    location: incoming?.location ?? dspace?.location ?? 'Bandra Kurla Complex, Mumbai',
    spaceTypes: incoming?.spaceTypes ?? dspace?.spaceTypes ?? 'Co working Space, Premium and Dedicated Desk, Private Office',
    rating: incoming?.rating ?? dspace?.rating ?? '4.8',
    capacityRange: incoming?.capacityRange ?? '1-10',
    bookingStartDate: incoming?.bookingStartDate ?? dspace?.bookingStartDate ?? '',
    fullDayBooking: incoming?.fullDayBooking ?? dspace?.fullDayBooking ?? false,
    bookingFromTime: incoming?.bookingFromTime ?? dspace?.bookingFromTime ?? '09:00',
    bookingToTime: incoming?.bookingToTime ?? dspace?.bookingToTime ?? '17:00',
    durationHours: incoming?.durationHours ?? dspace?.durationHours ?? 8,
    bookingBaseTotal,
    serviceFee,
    addOns,
    addOnTotal,
    bookingGrandTotal: incoming?.bookingGrandTotal ?? dspace?.bookingGrandTotal ?? bookingBaseTotal + serviceFee + addOnTotal,
    selection: {
      planningFor: incoming?.selection?.planningFor ?? '',
      attendees: incoming?.selection?.attendees ?? 0,
      contactNumber: incoming?.selection?.contactNumber ?? '',
      selectedTeam: incoming?.selection?.selectedTeam ?? '',
      approver: incoming?.selection?.approver ?? '',
    },
  }
}

export const computeGrandTotal = (baseTotal: number, serviceFee: number, addOnsTotal: number) =>
  baseTotal + serviceFee + addOnsTotal

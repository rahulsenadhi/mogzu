import {
  loadVendorGiftingState,
  saveVendorGiftingState,
  updateVendorGiftingOrderStatus,
  type OrderStatus,
  type ProductStatus,
  type VendorGiftingState,
} from '@/app/lib/vendorGiftingStore'

export type AdminVendorStatus = 'active' | 'suspended' | 'pending_verification'

export interface AdminVendorProfile {
  id: string
  vendorName: string
  category: string
  status: AdminVendorStatus
  rating: number
  contactEmail: string
  contactPhone: string
  gstin: string
  pan: string
  bankDetails: string
  approvalHistory: Array<{ at: string; message: string }>
}

const VENDOR_PROFILES_KEY = 'mogzu_admin_gifting_vendor_profiles_v1'

const nowIso = () => new Date().toISOString()

const seededVendorProfiles = (state: VendorGiftingState): AdminVendorProfile[] => [
  {
    id: 'VEND-1',
    vendorName: state.settings.businessName,
    category: 'Mixed',
    status: 'active',
    rating: 4.6,
    contactEmail: 'vendor@mogzu.com',
    contactPhone: '+91 9999999999',
    gstin: state.settings.gstin,
    pan: state.settings.pan,
    bankDetails: state.settings.bankDetails,
    approvalHistory: [{ at: nowIso(), message: 'Vendor verified by admin' }],
  },
  {
    id: 'VEND-2',
    vendorName: 'Acme Gifting Partners',
    category: 'Bags',
    status: 'pending_verification',
    rating: 4.2,
    contactEmail: 'ops@acmegifting.com',
    contactPhone: '+91 8888888888',
    gstin: '27AAAAA1234B1Z2',
    pan: 'AAAAA1234B',
    bankDetails: 'ICICI Bank - 00012345678',
    approvalHistory: [{ at: nowIso(), message: 'Vendor onboarding initiated' }],
  },
]

export const loadAdminVendorProfiles = (): AdminVendorProfile[] => {
  const state = loadVendorGiftingState()
  try {
    const raw = localStorage.getItem(VENDOR_PROFILES_KEY)
    if (!raw) {
      const seeded = seededVendorProfiles(state)
      localStorage.setItem(VENDOR_PROFILES_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw) as AdminVendorProfile[]
  } catch {
    return seededVendorProfiles(state)
  }
}

export const saveAdminVendorProfiles = (profiles: AdminVendorProfile[]) => {
  localStorage.setItem(VENDOR_PROFILES_KEY, JSON.stringify(profiles))
}

export const getAdminGiftingState = () => loadVendorGiftingState()

export const approveProducts = (ids: string[]) => {
  const state = loadVendorGiftingState()
  const next = {
    ...state,
    products: state.products.map((p) =>
      ids.includes(p.id)
        ? {
            ...p,
            status: 'active' as ProductStatus,
            rejectionReason: undefined,
            rejectedFields: [],
            updatedAt: nowIso(),
            activityLog: [{ at: nowIso(), message: 'Approved by admin' }, ...(p.activityLog || [])],
          }
        : p,
    ),
  }
  saveVendorGiftingState(next)
  return next
}

export const rejectProduct = (id: string, reason: string) => {
  const state = loadVendorGiftingState()
  const next = {
    ...state,
    products: state.products.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'rejected' as ProductStatus,
            rejectionReason: reason,
            updatedAt: nowIso(),
            activityLog: [{ at: nowIso(), message: `Rejected by admin: ${reason}` }, ...(p.activityLog || [])],
          }
        : p,
    ),
  }
  saveVendorGiftingState(next)
  return next
}

export const requestMoreInfo = (id: string, note: string) => {
  const state = loadVendorGiftingState()
  const next = {
    ...state,
    products: state.products.map((p) =>
      p.id === id
        ? {
            ...p,
            updatedAt: nowIso(),
            activityLog: [{ at: nowIso(), message: `More info requested: ${note}` }, ...(p.activityLog || [])],
          }
        : p,
    ),
  }
  saveVendorGiftingState(next)
  return next
}

export const updateAdminOrder = (orderId: string, status: OrderStatus, deliveryPartner: string, disputeFlag: boolean) => {
  let next = updateVendorGiftingOrderStatus(orderId, status)
  next = {
    ...next,
    orders: next.orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            deliveryPartner,
            disputeFlag,
            timeline: [
              { at: nowIso(), message: deliveryPartner ? `Delivery partner assigned: ${deliveryPartner}` : 'Delivery partner cleared' },
              { at: nowIso(), message: disputeFlag ? 'Dispute flag raised by admin' : 'Dispute cleared by admin' },
              ...o.timeline,
            ],
          }
        : o,
    ),
  }
  saveVendorGiftingState(next)
  return next
}


export type PricingType = 'fixed' | 'offer' | 'request'
export type ProductStatus = 'draft' | 'pending' | 'active' | 'paused' | 'rejected'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface BulkTier {
  minQty: number
  maxQty: number
  price: number
}

export interface ProductImage {
  id: string
  url: string
  name: string
}

export interface VendorGiftingProduct {
  id: string
  vendorName?: string
  productName: string
  category: 'Apparel' | 'Bags' | 'Stationary' | 'Tech' | 'Health & Wellness'
  subCategory: string
  shortDescription: string
  longDescription: string
  tags: string[]
  primaryImage?: ProductImage
  additionalImages: ProductImage[]
  pricingType: PricingType
  pricePerUnit?: number
  originalPrice?: number
  offerPrice?: number
  moq: number
  gstPercent: 0 | 5 | 12 | 18 | 28
  bulkPricingEnabled: boolean
  bulkTiers: BulkTier[]
  brandingOptions: Array<'Logo print' | 'Embroidery' | 'Engraving' | 'Custom packaging' | 'None'>
  leadTimeDays: number
  sampleAvailable: boolean
  packagingType: 'Box' | 'Pouch' | 'Bag' | 'Custom'
  addOns: string[]
  status: ProductStatus
  rejectionReason?: string
  rejectedFields?: string[]
  createdAt: string
  updatedAt: string
  activityLog?: Array<{ at: string; message: string }>
}

export interface VendorGiftingOrder {
  id: string
  corporateName: string
  vendorName?: string
  products: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }>
  quantity: number
  amount: number
  status: OrderStatus
  date: string
  contactName: string
  contactEmail: string
  contactPhone: string
  deliveryAddress: string
  deliveryPartner?: string
  disputeFlag?: boolean
  timeline: Array<{ at: string; message: string }>
}

export interface VendorGiftingSettings {
  businessName: string
  gstin: string
  pan: string
  bankDetails: string
  logoUrl: string
  pickupDeliveryPreferences: string
  notifyEmail: boolean
  notifySms: boolean
  notifyWhatsapp: boolean
}

export interface VendorGiftingState {
  products: VendorGiftingProduct[]
  orders: VendorGiftingOrder[]
  settings: VendorGiftingSettings
}

const STORAGE_KEY = 'mogzu_vendor_gifting_state_v1'

const nowIso = () => new Date().toISOString()

const seededState: VendorGiftingState = {
  products: [
    {
      id: 'VG-1001',
      vendorName: 'Mogzu Vendor Pvt Ltd',
      productName: 'Executive Welcome Kit',
      category: 'Apparel',
      subCategory: 'T-Shirts',
      shortDescription: 'Corporate onboarding essentials in one premium kit',
      longDescription: 'Includes premium polo, bottle, notebook, and custom welcome card.',
      tags: ['welcome', 'corporate', 'onboarding'],
      primaryImage: { id: 'p1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', name: 'welcome-kit.jpg' },
      additionalImages: [{ id: 'p2', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', name: 'kit-2.jpg' }],
      pricingType: 'fixed',
      pricePerUnit: 899,
      moq: 25,
      gstPercent: 18,
      bulkPricingEnabled: true,
      bulkTiers: [
        { minQty: 25, maxQty: 100, price: 899 },
        { minQty: 101, maxQty: 300, price: 845 },
      ],
      brandingOptions: ['Logo print', 'Custom packaging'],
      leadTimeDays: 7,
      sampleAvailable: true,
      packagingType: 'Box',
      addOns: ['Gift wrap', 'Welcome card'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      activityLog: [{ at: nowIso(), message: 'Product seeded as active' }],
    },
    {
      id: 'VG-1002',
      vendorName: 'Mogzu Vendor Pvt Ltd',
      productName: 'Festive Dry Fruit Hamper',
      category: 'Health & Wellness',
      subCategory: 'Hampers',
      shortDescription: 'Seasonal festive hamper with premium dry fruits',
      longDescription: 'Curated festive gifting hamper with customization options for bulk orders.',
      tags: ['festive', 'hamper'],
      primaryImage: { id: 'p3', url: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?w=800&q=80', name: 'hamper.jpg' },
      additionalImages: [],
      pricingType: 'offer',
      originalPrice: 1299,
      offerPrice: 1099,
      moq: 20,
      gstPercent: 12,
      bulkPricingEnabled: false,
      bulkTiers: [],
      brandingOptions: ['Custom packaging'],
      leadTimeDays: 5,
      sampleAvailable: false,
      packagingType: 'Custom',
      addOns: ['Card'],
      status: 'pending',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      activityLog: [{ at: nowIso(), message: 'Product submitted for approval' }],
    },
  ],
  orders: [
    {
      id: 'ORD-8801',
      corporateName: 'Acme Technologies',
      vendorName: 'Mogzu Vendor Pvt Ltd',
      products: [{ productId: 'VG-1001', productName: 'Executive Welcome Kit', quantity: 120, unitPrice: 845 }],
      quantity: 120,
      amount: 101400,
      status: 'processing',
      date: new Date().toISOString().slice(0, 10),
      contactName: 'Riya Shah',
      contactEmail: 'riya@acme.com',
      contactPhone: '+91 9876543210',
      deliveryAddress: 'Acme HQ, Bangalore, Karnataka',
      timeline: [
        { at: nowIso(), message: 'Order created' },
        { at: nowIso(), message: 'Vendor confirmed' },
      ],
    },
  ],
  settings: {
    businessName: 'Mogzu Vendor Pvt Ltd',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    bankDetails: 'HDFC Bank - 000123456789',
    logoUrl: '',
    pickupDeliveryPreferences: 'Pickup from warehouse, delivery pan-India',
    notifyEmail: true,
    notifySms: true,
    notifyWhatsapp: false,
  },
}

export const loadVendorGiftingState = (): VendorGiftingState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seededState
    const parsed = JSON.parse(raw) as VendorGiftingState
    return parsed
  } catch {
    return seededState
  }
}

export const saveVendorGiftingState = (next: VendorGiftingState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export const upsertVendorGiftingProduct = (product: VendorGiftingProduct) => {
  const state = loadVendorGiftingState()
  const exists = state.products.some((p) => p.id === product.id)
  const products = exists
    ? state.products.map((p) =>
        p.id === product.id
          ? {
              ...product,
              vendorName: product.vendorName || p.vendorName || state.settings.businessName,
              updatedAt: nowIso(),
              activityLog: [{ at: nowIso(), message: 'Product updated by vendor' }, ...(product.activityLog || p.activityLog || [])],
            }
          : p,
      )
    : [
        {
          ...product,
          vendorName: product.vendorName || state.settings.businessName,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          activityLog: [{ at: nowIso(), message: 'Product created by vendor' }, ...(product.activityLog || [])],
        },
        ...state.products,
      ]
  const next = { ...state, products }
  saveVendorGiftingState(next)
  return next
}

export const deleteVendorGiftingProduct = (id: string) => {
  const state = loadVendorGiftingState()
  const next = { ...state, products: state.products.filter((p) => p.id !== id) }
  saveVendorGiftingState(next)
  return next
}

export const updateVendorGiftingOrderStatus = (orderId: string, status: OrderStatus) => {
  const state = loadVendorGiftingState()
  const orders = state.orders.map((o) =>
    o.id === orderId
      ? { ...o, status, timeline: [{ at: nowIso(), message: `Status updated to ${status}` }, ...o.timeline] }
      : o,
  )
  const next = { ...state, orders }
  saveVendorGiftingState(next)
  return next
}

export const saveVendorGiftingSettings = (settings: VendorGiftingSettings) => {
  const state = loadVendorGiftingState()
  const next = { ...state, settings }
  saveVendorGiftingState(next)
  return next
}


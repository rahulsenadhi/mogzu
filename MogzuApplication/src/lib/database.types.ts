// Database types — generated from Supabase schema
// Run `supabase gen types typescript` after schema changes to regenerate

export type UserRole =
  | 'l1_employee'
  | 'l2_manager'
  | 'l3_admin'
  | 'vendor'
  | 'mogzu_admin'
  | 'account_manager'
  | 'partner'
  | 'support'

export type ModuleId = 'events' | 'gifting' | 'spacex_coworking' | 'spacex_stay'

export type ListingStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'rejected'

export type BookingStatus =
  | 'draft'
  | 'pending_approval'
  | 'pending_vendor'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'disputed'

export type VendorStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export type WalletTransactionType = 'topup' | 'debit' | 'refund' | 'credit'

export interface CorporateAccount {
  id: string
  name: string
  domain: string | null
  plan: 'starter' | 'growth' | 'enterprise'
  status: 'active' | 'suspended'
  account_manager_id: string | null
  modules_enabled: Record<ModuleId, boolean>
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  corporate_id: string | null
  vendor_id: string | null
  role: UserRole
  available_roles: UserRole[]
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  department: string | null
  status: 'active' | 'deactivated'
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  user_id: string
  business_name: string
  description: string | null
  logo_url: string | null
  gst_number: string | null
  bank_account_verified: boolean
  status: VendorStatus
  rejection_reasons: string[] | null
  city: string | null
  state: string | null
  created_at: string
  updated_at: string
}

export interface VendorModule {
  vendor_id: string
  module: ModuleId
  status: 'active' | 'inactive'
}

export interface ListingCategory {
  id: string
  module: ModuleId
  name: string
  icon: string | null
  display_order: number
  is_active: boolean
  parent_id: string | null
  created_at: string
}

export interface Listing {
  id: string
  vendor_id: string
  module: ModuleId
  category_id: string | null
  title: string
  description: string | null
  status: ListingStatus
  pricing_type: 'transparent' | 'offer' | 'request_for_price'
  base_price: number | null
  price_unit: 'per_person' | 'flat' | 'per_hour' | 'per_day' | null
  min_capacity: number | null
  max_capacity: number | null
  location_city: string | null
  location_address: string | null
  cancellation_policy: string | null
  confirmation_sla_hours: number
  is_mogzu_direct: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ListingImage {
  id: string
  listing_id: string
  storage_path: string
  display_order: number
  created_at: string
}

export interface ListingAddOn {
  id: string
  listing_id: string
  name: string
  price: number
  description: string | null
}

export interface CalendarSlot {
  id: string
  vendor_id: string
  listing_id: string
  slot_type: 'available' | 'blocked' | 'booked'
  start_time: string
  end_time: string
  booking_id: string | null
  recurrence_rule: string | null
  notes: string | null
  created_at: string
}

export interface BudgetRule {
  id: string
  corporate_id: string
  scope: 'company' | 'department' | 'individual'
  scope_value: string | null
  module: ModuleId | null
  amount: number
  period: 'monthly' | 'quarterly' | 'annual'
  alert_threshold_pct: number
  requires_approval: boolean
  auto_approve_below: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  corporate_id: string
  balance: number
  currency: string
  low_balance_threshold: number | null
  updated_at: string
}

export interface WalletTransaction {
  id: string
  wallet_id: string
  corporate_id: string
  type: WalletTransactionType
  amount: number
  reference_id: string | null
  booking_id: string | null
  description: string | null
  created_at: string
}

export interface Booking {
  id: string
  corporate_id: string
  user_id: string
  vendor_id: string
  listing_id: string
  module: ModuleId
  status: BookingStatus
  group_size: number | null
  start_time: string | null
  end_time: string | null
  base_amount: number | null
  add_ons_amount: number
  platform_fee: number
  total_amount: number | null
  commission_rate: number | null
  payment_method: 'wallet' | 'card' | 'upi' | null
  payment_reference: string | null
  payment_status: PaymentStatus
  purpose_note: string | null
  approved_by: string | null
  approved_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  cancellation_fee: number | null
  vendor_response_deadline: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface BookingAddOn {
  id: string
  booking_id: string
  add_on_id: string | null
  name: string
  price: number
  quantity: number
}

export type RefundMethod = 'wallet' | 'card' | 'upi'
export type RefundStatus = 'pending' | 'processed' | 'failed'

export interface Refund {
  id: string
  booking_id: string
  corporate_id: string
  amount: number
  method: RefundMethod
  status: RefundStatus
  gateway_reference: string | null
  failure_reason: string | null
  initiated_by: string | null
  initiated_at: string
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface RoleSwitchEvent {
  id: string
  user_id: string
  from_role: UserRole
  to_role: UserRole
  switched_at: string
  user_agent: string | null
  ip_address: string | null
}

export type GiftingTriggerKind = 'fixed_date' | 'birthday' | 'work_anniversary' | 'manual'

export interface GiftingRule {
  id: string
  corporate_id: string
  occasion_name: string
  trigger_kind: GiftingTriggerKind
  trigger_date: string | null
  budget_per_recipient: number
  requires_approval: boolean
  scope: 'company' | 'department'
  scope_value: string | null
  preferred_vendor_ids: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  scope: 'global' | 'vendor' | 'module' | 'category'
  vendor_id: string | null
  module: ModuleId | null
  category_id: string | null
  rate: number
  is_active: boolean
  effective_from: string
  created_by: string | null
  created_at: string
}

// Database shape for Supabase createClient<Database>
export interface Database {
  public: {
    Tables: {
      corporate_accounts: {
        Row: CorporateAccount
        Insert: Omit<CorporateAccount, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CorporateAccount, 'id' | 'created_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      vendors: {
        Row: Vendor
        Insert: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Vendor, 'id' | 'created_at'>>
      }
      vendor_modules: {
        Row: VendorModule
        Insert: VendorModule
        Update: Partial<VendorModule>
      }
      listing_categories: {
        Row: ListingCategory
        Insert: Omit<ListingCategory, 'id' | 'created_at'>
        Update: Partial<Omit<ListingCategory, 'id' | 'created_at'>>
      }
      listings: {
        Row: Listing
        Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Listing, 'id' | 'created_at'>>
      }
      listing_images: {
        Row: ListingImage
        Insert: Omit<ListingImage, 'id' | 'created_at'>
        Update: Partial<Omit<ListingImage, 'id' | 'created_at'>>
      }
      listing_add_ons: {
        Row: ListingAddOn
        Insert: Omit<ListingAddOn, 'id'>
        Update: Partial<Omit<ListingAddOn, 'id'>>
      }
      calendar_slots: {
        Row: CalendarSlot
        Insert: Omit<CalendarSlot, 'id' | 'created_at'>
        Update: Partial<Omit<CalendarSlot, 'id' | 'created_at'>>
      }
      budget_rules: {
        Row: BudgetRule
        Insert: Omit<BudgetRule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BudgetRule, 'id' | 'created_at'>>
      }
      wallets: {
        Row: Wallet
        Insert: Omit<Wallet, 'id' | 'updated_at'>
        Update: Partial<Omit<Wallet, 'id'>>
      }
      wallet_transactions: {
        Row: WalletTransaction
        Insert: Omit<WalletTransaction, 'id' | 'created_at'>
        Update: never
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>
      }
      booking_add_ons: {
        Row: BookingAddOn
        Insert: Omit<BookingAddOn, 'id'>
        Update: Partial<Omit<BookingAddOn, 'id'>>
      }
      commissions: {
        Row: Commission
        Insert: Omit<Commission, 'id' | 'created_at'>
        Update: Partial<Omit<Commission, 'id' | 'created_at'>>
      }
      gifting_rules: {
        Row: GiftingRule
        Insert: Omit<GiftingRule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GiftingRule, 'id' | 'created_at'>>
      }
      refunds: {
        Row: Refund
        Insert: Omit<Refund, 'id' | 'created_at' | 'updated_at' | 'initiated_at'>
        Update: Partial<Omit<Refund, 'id' | 'created_at'>>
      }
      role_switch_events: {
        Row: RoleSwitchEvent
        Insert: Omit<RoleSwitchEvent, 'id' | 'switched_at'>
        Update: Partial<Omit<RoleSwitchEvent, 'id' | 'switched_at'>>
      }
    }
  }
}

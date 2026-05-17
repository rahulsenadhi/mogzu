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
  | 'sales_agent'
  | 'field_agent'

export type PermissionResource =
  | 'bookings'
  | 'listings'
  | 'partners'
  | 'vendors'
  | 'corporate_accounts'
  | 'gifting'
  | 'support'
  | 'reports'

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve'

export interface UserPermission {
  id: string
  user_id: string
  resource: PermissionResource
  action: PermissionAction
  granted_by: string | null
  created_at: string
}

export interface UserActivityEvent {
  id: string
  actor_id: string
  event_type: string
  target_table: string | null
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type QuickShareStatus = 'active' | 'expired' | 'closed'
export type QuickShareSubmissionStatus = 'pending' | 'sent' | 'paid' | 'cancelled'

export interface QuickShare {
  id: string
  created_by: string | null
  module: ModuleId
  token: string
  client_label: string | null
  custom_note: string | null
  budget_cap: number | null
  expires_at: string
  status: QuickShareStatus
  payment_link_url: string | null
  created_at: string
  updated_at: string
}

export interface QuickShareItem {
  id: string
  quick_share_id: string
  listing_id: string
  hidden: boolean
  display_order: number
  curator_note: string | null
  created_at: string
}

export interface QuickShareSubmission {
  id: string
  quick_share_id: string
  client_name: string
  client_company: string | null
  client_phone: string | null
  client_email: string | null
  selected_items: Array<{ listing_id: string; quantity?: number; note?: string }>
  client_note: string | null
  submitted_at: string
  payment_link_url: string | null
  payment_status: QuickShareSubmissionStatus
}

export interface BookingStatusEvent {
  id: string
  booking_id: string
  stage: string
  otp_code: string | null
  otp_sent_to: string | null
  otp_verified_at: string | null
  photo_path: string | null
  gps_lat: number | null
  gps_lng: number | null
  submitted_by: string | null
  submitted_at: string | null
  notes: string | null
  admin_override_reason: string | null
  created_at: string
  updated_at: string
}

export interface BookingProofRecord {
  booking_id: string
  agreed_scope: string | null
  quoted_price: number | null
  final_price: number | null
  negotiation_history: Array<{
    at: string
    party: 'corporate' | 'vendor' | 'admin'
    note: string
    price?: number
  }>
  accepted_by: string | null
  accepted_at: string | null
  accepted_ip: string | null
  accepted_user_agent: string | null
  po_document_path: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentMilestoneKind = 'advance' | 'milestone' | 'balance' | 'final_settlement'

export interface BookingPaymentMilestone {
  id: string
  booking_id: string
  kind: PaymentMilestoneKind
  percentage: number | null
  amount: number | null
  due_at: string | null
  paid_at: string | null
  paid_reference: string | null
  created_at: string
}

export type GiftingBrandingPlacement =
  | 'front_print'
  | 'back_print'
  | 'embossing'
  | 'label'
  | 'sleeve_band'

export type GiftingBrandingMethod =
  | 'screen_print'
  | 'digital_print'
  | 'embroidery'
  | 'dtf'
  | 'emboss'
  | 'laser_etch'

export type GiftingBrandingStatus = 'pending' | 'approved' | 'revision_requested'

export interface GiftingBrandingUpload {
  id: string
  corporate_id: string
  uploaded_by: string | null
  storage_path: string
  public_url: string
  original_filename: string
  mime_type: string
  file_size_bytes: number | null
  created_at: string
}

export interface GiftingBrandingSelection {
  id: string
  booking_id: string
  upload_id: string
  placement_type: GiftingBrandingPlacement
  branding_method: GiftingBrandingMethod | null
  position_notes: string | null
  approval_status: GiftingBrandingStatus
  revision_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserInvite {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  token: string
  invited_by: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
}

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
  referred_by_partner_id: string | null
  referred_at: string | null
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
  status: 'active' | 'deactivated' | 'invited'
  invited_by: string | null
  invited_at: string | null
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
  description: string | null
  created_at: string
  updated_at: string
}

export type ListingOwnerType = 'vendor' | 'partner'

export interface Listing {
  id: string
  vendor_id: string | null
  owner_type: ListingOwnerType
  owner_partner_id: string | null
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
  fulfilment_stage: FulfilmentStage | null
  tracking_number: string | null
  carrier: string | null
  carrier_url: string | null
  gifting_campaign_id: string | null
  partner_id: string | null
  partner_markup_pct: number | null
  partner_margin_amount: number | null
  partner_invoice_token: string | null
  payout_accrued_at: string | null
  created_at: string
  updated_at: string
}

export type PartnerPayoutStatus = 'pending' | 'paid' | 'on_hold'

export interface PartnerPayoutPeriod {
  id: string
  partner_id: string
  period_yyyymm: string
  resale_margin: number
  product_share: number
  total_amount: number
  status: PartnerPayoutStatus
  paid_at: string | null
  paid_by: string | null
  payout_transaction_id: string | null
  note: string | null
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

export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketAudience = 'corporate' | 'vendor'

export interface SupportTicket {
  id: string
  audience: TicketAudience
  submitter_id: string
  corporate_id: string | null
  vendor_id: string | null
  category: string
  subject: string
  body: string
  status: TicketStatus
  priority: TicketPriority
  sla_hours: number
  context_url: string | null
  context_role: string | null
  context_last_action: string | null
  context_user_agent: string | null
  assigned_to: string | null
  related_booking_id: string | null
  related_payout_id: string | null
  csat_score: number | null
  csat_feedback: string | null
  resolved_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportTicketNote {
  id: string
  ticket_id: string
  author_id: string
  body: string
  is_internal: boolean
  created_at: string
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'approval_required'
  | 'approval_decided'
  | 'payment_received'
  | 'payment_failed'
  | 'refund_initiated'
  | 'refund_failed'
  | 'reminder_24h'
  | 'gift_received'
  | 'gift_pending_approval'
  | 'support_reply'
  | 'system'

export const CRITICAL_NOTIFICATION_TYPES: NotificationType[] = [
  'booking_cancelled',
  'payment_failed',
  'refund_initiated',
  'refund_failed',
  'support_reply',
]

export type NotificationEmailStatus = 'skipped' | 'queued' | 'sent' | 'failed'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link_url: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  email_status: NotificationEmailStatus
  email_sent_at: string | null
  created_at: string
}

export interface NotificationPreference {
  user_id: string
  in_app_enabled_types: NotificationType[]
  email_enabled_types: NotificationType[]
  created_at: string
  updated_at: string
}

export interface Shortlist {
  id: string
  account_manager_id: string
  corporate_id: string
  name: string
  intro_note: string | null
  share_token: string
  expires_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface ShortlistItem {
  id: string
  shortlist_id: string
  listing_id: string
  am_note: string | null
  display_order: number
  created_at: string
}

export interface HeyGenieConfig {
  corporate_id: string
  enabled: boolean
  enabled_modules: string[]
  voice_locale: string
  wake_word_enabled: boolean
  configured_by: string | null
  created_at: string
  updated_at: string
}

export interface HeyGenieSession {
  id: string
  user_id: string
  corporate_id: string
  transcript: string
  intent: Record<string, unknown> | null
  resulting_booking_id: string | null
  modality: 'voice' | 'text'
  created_at: string
}

// ─── Partners (Sprint 19) ────────────────────────────────────────────────────

export type PartnerType = 'consultant' | 'agency' | 'reseller' | 'freelancer'
export type PartnerStatus = 'pending' | 'active' | 'paused' | 'terminated' | 'rejected'

export interface Partner {
  id: string
  user_id: string | null
  partner_type: PartnerType
  status: PartnerStatus
  full_name: string
  email: string
  phone: string | null
  business_name: string | null
  expertise: string[]
  referral_code: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  default_markup_pct: number
  created_at: string
  updated_at: string
}

export interface PartnerAgreement {
  id: string
  partner_id: string
  referral_pct: number
  reseller_wholesale_pct: number
  product_revenue_share_pct: number
  valid_from: string
  expires_at: string | null
  configured_by: string | null
  notes: string | null
  is_current: boolean
  created_at: string
}

export interface PartnerReferral {
  id: string
  partner_id: string
  referral_code: string
  referred_corporate_id: string
  signed_up_at: string
  activated_at: string | null
  first_booking_id: string | null
  attribution_expires_at: string
  commission_amount: number | null
  commission_credited_at: string | null
  created_at: string
}

export interface PartnerWallet {
  id: string
  partner_id: string
  balance: number
  currency: string
  updated_at: string
}

export interface PartnerWalletTransaction {
  id: string
  partner_wallet_id: string
  partner_id: string
  type: 'commission' | 'payout' | 'adjustment'
  amount: number
  referral_id: string | null
  booking_id: string | null
  description: string | null
  created_at: string
}

export type PromotionKind = 'percent_off' | 'flat_off' | 'free_addon' | 'paid_boost'
export type PromotionStatus =
  | 'draft'
  | 'pending_payment'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'expired'

export interface Promotion {
  id: string
  vendor_id: string
  listing_id: string | null
  kind: PromotionKind
  title: string
  description: string | null
  value: number | null
  add_on_name: string | null
  starts_at: string
  ends_at: string
  max_redemptions: number | null
  redemptions: number
  paid_boost_amount: number | null
  paid_boost_payment_reference: string | null
  status: PromotionStatus
  rejection_reason: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface EventTemplate {
  id: string
  corporate_id: string
  name: string
  description: string | null
  default_group_size: number | null
  default_budget: number | null
  preferred_vendor_ids: string[]
  preferred_listing_ids: string[]
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Wishlist {
  user_id: string
  listing_id: string
  created_at: string
}

export type ReviewStatus = 'pending_approval' | 'approved' | 'rejected' | 'hidden'
export type ReviewSource = 'booking' | 'invite'

export interface Review {
  id: string
  listing_id: string
  vendor_id: string
  reviewer_id: string | null
  reviewer_name: string | null
  booking_id: string | null
  source: ReviewSource
  rating: number
  body: string
  status: ReviewStatus
  vendor_reply: string | null
  vendor_replied_at: string | null
  rejection_reason: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface ReviewInvite {
  id: string
  vendor_id: string
  listing_id: string | null
  recipient_email: string
  recipient_name: string | null
  token: string
  used_at: string | null
  created_at: string
}

export type GiftingCampaignStatus =
  | 'draft'
  | 'pending_vendor'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type GiftingCampaignScope = 'all' | 'department' | 'custom'

export interface GiftingCampaign {
  id: string
  corporate_id: string
  occasion_name: string
  listing_id: string
  scope: GiftingCampaignScope
  scope_value: string | null
  message: string | null
  budget_per_recipient: number
  recipient_count: number
  total_budget: number
  status: GiftingCampaignStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface BookingMessageAttachment {
  url: string
  name: string
  size: number
}

export interface BookingMessage {
  id: string
  booking_id: string
  sender_id: string
  body: string
  attachments: BookingMessageAttachment[]
  read_by: string[]
  created_at: string
}

export type DisputeStatus =
  | 'open'
  | 'investigating'
  | 'awaiting_party'
  | 'resolved'
  | 'dismissed'

export type DisputeResolution =
  | 'no_refund'
  | 'partial_refund'
  | 'full_refund'
  | 'vendor_penalty'
  | 'no_action'

export interface BookingDispute {
  id: string
  booking_id: string
  raised_by: string
  reason_category: string
  reason_body: string
  status: DisputeStatus
  evidence_urls: string[]
  resolution: DisputeResolution | null
  resolution_note: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export type FulfilmentStage =
  | 'ordered'
  | 'packed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'

export interface TravelPolicy {
  id: string
  corporate_id: string
  name: string
  role_tier: 'l1_employee' | 'l2_manager' | 'l3_admin' | 'all'
  max_nightly_rate: number
  approved_cities: string[]
  min_lead_days: number
  module: 'spacex_stay' | 'spacex_coworking'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CelebrationStatus =
  | 'scheduled'
  | 'personalised'
  | 'suppressed'
  | 'fired'
  | 'failed'

export interface CelebrationEvent {
  id: string
  corporate_id: string
  gifting_rule_id: string
  employee_id: string
  manager_id: string | null
  occasion_name: string
  trigger_date: string
  status: CelebrationStatus
  default_listing_id: string | null
  listing_id_override: string | null
  budget_override: number | null
  manager_message: string | null
  personalised_at: string | null
  suppressed_at: string | null
  suppressed_reason: string | null
  fired_booking_id: string | null
  fired_at: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  corporate_id: string
  email: string
  full_name: string
  department: string | null
  role_hint: string | null
  dob: string | null
  join_date: string | null
  phone: string | null
  is_active: boolean
  imported_at: string
  created_at: string
  updated_at: string
}

export type PayoutStatus = 'scheduled' | 'processed' | 'held' | 'failed'

export interface Payout {
  id: string
  booking_id: string
  vendor_id: string
  gross_amount: number
  commission_amount: number
  net_amount: number
  commission_rate: number | null
  status: PayoutStatus
  scheduled_for: string
  processed_at: string | null
  gateway_reference: string | null
  hold_reason: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
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
      support_tickets: {
        Row: SupportTicket
        Insert: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SupportTicket, 'id' | 'created_at'>>
      }
      support_ticket_notes: {
        Row: SupportTicketNote
        Insert: Omit<SupportTicketNote, 'id' | 'created_at'>
        Update: Partial<Omit<SupportTicketNote, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
      notification_preferences: {
        Row: NotificationPreference
        Insert: Omit<NotificationPreference, 'created_at' | 'updated_at'>
        Update: Partial<Omit<NotificationPreference, 'created_at'>>
      }
      shortlists: {
        Row: Shortlist
        Insert: Omit<Shortlist, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Shortlist, 'id' | 'created_at'>>
      }
      shortlist_items: {
        Row: ShortlistItem
        Insert: Omit<ShortlistItem, 'id' | 'created_at'>
        Update: Partial<Omit<ShortlistItem, 'id' | 'created_at'>>
      }
      heygenie_config: {
        Row: HeyGenieConfig
        Insert: Omit<HeyGenieConfig, 'created_at' | 'updated_at'>
        Update: Partial<HeyGenieConfig>
      }
      heygenie_sessions: {
        Row: HeyGenieSession
        Insert: Omit<HeyGenieSession, 'id' | 'created_at'>
        Update: Partial<Omit<HeyGenieSession, 'id' | 'created_at'>>
      }
      partners: {
        Row: Partner
        Insert: Omit<Partner, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Partner, 'id' | 'created_at'>>
      }
      partner_agreements: {
        Row: PartnerAgreement
        Insert: Omit<PartnerAgreement, 'id' | 'created_at'>
        Update: Partial<Omit<PartnerAgreement, 'id' | 'created_at'>>
      }
      partner_referrals: {
        Row: PartnerReferral
        Insert: Omit<PartnerReferral, 'id' | 'created_at'>
        Update: Partial<Omit<PartnerReferral, 'id' | 'created_at'>>
      }
      partner_wallets: {
        Row: PartnerWallet
        Insert: Omit<PartnerWallet, 'id' | 'updated_at'>
        Update: Partial<Omit<PartnerWallet, 'id'>>
      }
      partner_wallet_transactions: {
        Row: PartnerWalletTransaction
        Insert: Omit<PartnerWalletTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<PartnerWalletTransaction, 'id' | 'created_at'>>
      }
      partner_payout_periods: {
        Row: PartnerPayoutPeriod
        Insert: Omit<PartnerPayoutPeriod, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PartnerPayoutPeriod, 'id' | 'created_at'>>
      }
      user_permissions: {
        Row: UserPermission
        Insert: Omit<UserPermission, 'id' | 'created_at'>
        Update: Partial<Omit<UserPermission, 'id' | 'created_at'>>
      }
      user_activity_events: {
        Row: UserActivityEvent
        Insert: Omit<UserActivityEvent, 'id' | 'created_at'>
        Update: Partial<Omit<UserActivityEvent, 'id' | 'created_at'>>
      }
      user_invites: {
        Row: UserInvite
        Insert: Omit<UserInvite, 'id' | 'created_at'>
        Update: Partial<Omit<UserInvite, 'id' | 'created_at'>>
      }
      booking_status_events: {
        Row: BookingStatusEvent
        Insert: Omit<BookingStatusEvent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BookingStatusEvent, 'id' | 'created_at'>>
      }
      booking_proof_records: {
        Row: BookingProofRecord
        Insert: Omit<BookingProofRecord, 'created_at' | 'updated_at'>
        Update: Partial<Omit<BookingProofRecord, 'booking_id' | 'created_at'>>
      }
      booking_payment_milestones: {
        Row: BookingPaymentMilestone
        Insert: Omit<BookingPaymentMilestone, 'id' | 'created_at'>
        Update: Partial<Omit<BookingPaymentMilestone, 'id' | 'created_at'>>
      }
      quick_shares: {
        Row: QuickShare
        Insert: Omit<QuickShare, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<QuickShare, 'id' | 'created_at'>>
      }
      quick_share_items: {
        Row: QuickShareItem
        Insert: Omit<QuickShareItem, 'id' | 'created_at'>
        Update: Partial<Omit<QuickShareItem, 'id' | 'created_at'>>
      }
      quick_share_submissions: {
        Row: QuickShareSubmission
        Insert: Omit<QuickShareSubmission, 'id' | 'submitted_at'>
        Update: Partial<Omit<QuickShareSubmission, 'id' | 'submitted_at'>>
      }
      gifting_branding_uploads: {
        Row: GiftingBrandingUpload
        Insert: Omit<GiftingBrandingUpload, 'id' | 'created_at'>
        Update: Partial<Omit<GiftingBrandingUpload, 'id' | 'created_at'>>
      }
      gifting_branding_selections: {
        Row: GiftingBrandingSelection
        Insert: Omit<GiftingBrandingSelection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GiftingBrandingSelection, 'id' | 'created_at'>>
      }
      promotions: {
        Row: Promotion
        Insert: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Promotion, 'id' | 'created_at'>>
      }
      event_templates: {
        Row: EventTemplate
        Insert: Omit<EventTemplate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<EventTemplate, 'id' | 'created_at'>>
      }
      wishlists: {
        Row: Wishlist
        Insert: Omit<Wishlist, 'created_at'>
        Update: Partial<Wishlist>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      review_invites: {
        Row: ReviewInvite
        Insert: Omit<ReviewInvite, 'id' | 'created_at'>
        Update: Partial<Omit<ReviewInvite, 'id' | 'created_at'>>
      }
      gifting_campaigns: {
        Row: GiftingCampaign
        Insert: Omit<GiftingCampaign, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GiftingCampaign, 'id' | 'created_at'>>
      }
      booking_messages: {
        Row: BookingMessage
        Insert: Omit<BookingMessage, 'id' | 'created_at'>
        Update: Partial<Omit<BookingMessage, 'id' | 'created_at'>>
      }
      booking_disputes: {
        Row: BookingDispute
        Insert: Omit<BookingDispute, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BookingDispute, 'id' | 'created_at'>>
      }
      travel_policies: {
        Row: TravelPolicy
        Insert: Omit<TravelPolicy, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TravelPolicy, 'id' | 'created_at'>>
      }
      celebration_events: {
        Row: CelebrationEvent
        Insert: Omit<CelebrationEvent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CelebrationEvent, 'id' | 'created_at'>>
      }
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'imported_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      payouts: {
        Row: Payout
        Insert: Omit<Payout, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payout, 'id' | 'created_at'>>
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

// Database service layer — never call supabase.from() directly in components.
// All queries go through these namespaced methods.

import { supabase } from './supabase'
import { CRITICAL_NOTIFICATION_TYPES } from './database.types'
import type {
  Booking,
  BookingAddOn,
  BudgetRule,
  CelebrationEvent,
  Employee,
  GiftingRule,
  Notification,
  NotificationPreference,
  NotificationType,
  Payout,
  Refund,
  RoleSwitchEvent,
  SupportTicket,
  SupportTicketNote,
  TravelPolicy,
  FulfilmentStage,
  BookingMessage,
  BookingDispute,
  GiftingCampaign,
  Review,
  ReviewInvite,
  ReviewStatus,
  Wishlist,
  Promotion,
  PromotionStatus,
  EventTemplate,
  Shortlist,
  ShortlistItem,
  HeyGenieConfig,
  HeyGenieSession,
  Partner,
  PartnerAgreement,
  PartnerReferral,
  PartnerStatus,
  DisputeStatus,
  DisputeResolution,
  CalendarSlot,
  Commission,
  CorporateAccount,
  Listing,
  ListingAddOn,
  ListingCategory,
  ListingImage,
  UserProfile,
  Vendor,
  VendorModule,
  Wallet,
  WalletTransaction,
  BookingStatus,
  ListingStatus,
  ModuleId,
  UserRole,
} from './database.types'

// ─── Corporate Accounts ───────────────────────────────────────────────────────

export const corporateAccounts = {
  getById: async (id: string) =>
    supabase.from('corporate_accounts').select('*').eq('id', id).single(),

  getByDomain: async (domain: string) =>
    supabase.from('corporate_accounts').select('*').eq('domain', domain).single(),

  list: async () =>
    supabase.from('corporate_accounts').select('*').order('created_at', { ascending: false }),

  listByAccountManager: async (amId: string) =>
    supabase
      .from('corporate_accounts')
      .select('*')
      .eq('account_manager_id', amId)
      .order('name'),

  create: async (
    data: Omit<CorporateAccount, 'id' | 'referred_by_partner_id' | 'referred_at' | 'created_at' | 'updated_at'> & {
      referred_by_partner_id?: string | null
      referred_at?: string | null
    },
  ) =>
    supabase
      .from('corporate_accounts')
      .insert({ referred_by_partner_id: null, referred_at: null, ...data })
      .select()
      .single(),

  update: async (id: string, data: Partial<CorporateAccount>) =>
    supabase.from('corporate_accounts').update(data).eq('id', id).select().single(),

  updateModuleAccess: async (id: string, modules: Record<ModuleId, boolean>) =>
    supabase
      .from('corporate_accounts')
      .update({ modules_enabled: modules, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export const userProfiles = {
  getById: async (id: string) =>
    supabase.from('user_profiles').select('*').eq('id', id).single(),

  getByIdMaybe: async (id: string) =>
    supabase.from('user_profiles').select('*').eq('id', id).maybeSingle(),

  listByCorporate: async (corporateId: string) =>
    supabase
      .from('user_profiles')
      .select('*')
      .eq('corporate_id', corporateId)
      .order('full_name'),

  listByRole: async (corporateId: string, role: UserRole) =>
    supabase
      .from('user_profiles')
      .select('*')
      .eq('corporate_id', corporateId)
      .eq('role', role),

  upsert: async (data: UserProfile) =>
    supabase.from('user_profiles').upsert(data).select().single(),

  upsertPartial: async (data: Partial<UserProfile> & { id: string }) =>
    supabase.from('user_profiles').upsert(data as UserProfile).select().single(),

  updateRole: async (id: string, role: UserRole) =>
    supabase.from('user_profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id),

  deactivate: async (id: string) =>
    supabase.from('user_profiles').update({ status: 'deactivated' }).eq('id', id),
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const vendors = {
  getById: async (id: string) =>
    supabase.from('vendors').select('*, vendor_modules(*)').eq('id', id).single(),

  listPending: async () =>
    supabase.from('vendors').select('*').eq('status', 'pending').order('created_at'),

  listActive: async () =>
    supabase.from('vendors').select('*').eq('status', 'active').order('business_name'),

  create: async (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('vendors').insert(data).select().single(),

  updateStatus: async (id: string, status: Vendor['status'], rejectionReasons?: string[]) =>
    supabase
      .from('vendors')
      .update({
        status,
        rejection_reasons: rejectionReasons ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  setModules: async (vendorId: string, modules: ModuleId[]) => {
    await supabase.from('vendor_modules').delete().eq('vendor_id', vendorId)
    if (modules.length === 0) return { error: null }
    return supabase.from('vendor_modules').insert(
      modules.map((module) => ({ vendor_id: vendorId, module, status: 'active' as const })),
    )
  },
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export const listings = {
  getById: async (id: string) =>
    supabase
      .from('listings')
      .select('*, listing_images(*), listing_add_ons(*), listing_categories(*), vendors(*)')
      .eq('id', id)
      .single(),

  listByModule: async (module: ModuleId, status: ListingStatus = 'active') =>
    supabase
      .from('listings')
      .select('*, listing_images(*), vendors(*)')
      .eq('module', module)
      .eq('status', status)
      .order('created_at', { ascending: false }),

  listByVendor: async (vendorId: string) =>
    supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  listPendingApproval: async () =>
    supabase
      .from('listings')
      .select('*, vendors(*), partners:owner_partner_id(id, full_name, business_name)')
      .eq('status', 'pending_approval')
      .order('created_at'),

  create: async (
    data: Omit<Listing, 'id' | 'owner_type' | 'owner_partner_id' | 'created_at' | 'updated_at'> & {
      owner_type?: Listing['owner_type']
      owner_partner_id?: string | null
    },
  ) =>
    supabase
      .from('listings')
      .insert({ owner_type: 'vendor', owner_partner_id: null, ...data })
      .select()
      .single(),

  update: async (id: string, data: Partial<Listing>) =>
    supabase
      .from('listings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

  // P3.1 — flip a listing's public visibility (anon /explore exposure).
  setPublicVisible: async (id: string, visible: boolean) =>
    supabase
      .from('listings')
      .update({ public_visible: visible, updated_at: new Date().toISOString() } as Partial<Listing>)
      .eq('id', id),

  listForPublicAdmin: async () =>
    supabase
      .from('listings')
      .select('id, title, module, status, public_visible, vendor_id, vendors(business_name)')
      .order('created_at', { ascending: false }),

  updateStatus: async (id: string, status: ListingStatus) =>
    supabase
      .from('listings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id),

  addImages: async (images: Omit<ListingImage, 'id' | 'created_at'>[]) =>
    supabase.from('listing_images').insert(images).select(),

  deleteImage: async (id: string) =>
    supabase.from('listing_images').delete().eq('id', id),

  setAddOns: async (listingId: string, addOns: Omit<ListingAddOn, 'id'>[]) => {
    await supabase.from('listing_add_ons').delete().eq('listing_id', listingId)
    if (addOns.length === 0) return { error: null }
    return supabase.from('listing_add_ons').insert(addOns).select()
  },
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export const calendar = {
  getSlotsForListing: async (listingId: string, from: string, to: string) =>
    supabase
      .from('calendar_slots')
      .select('*')
      .eq('listing_id', listingId)
      .gte('start_time', from)
      .lte('end_time', to)
      .order('start_time'),

  getBookedSlots: async (vendorId: string, from: string, to: string) =>
    supabase
      .from('calendar_slots')
      .select('*')
      .eq('vendor_id', vendorId)
      .in('slot_type', ['blocked', 'booked'])
      .gte('start_time', from)
      .lte('end_time', to),

  blockSlot: async (data: Omit<CalendarSlot, 'id' | 'created_at'>) =>
    supabase.from('calendar_slots').insert(data).select().single(),

  unblockSlot: async (id: string) =>
    supabase.from('calendar_slots').delete().eq('id', id),

  markBooked: async (slotId: string, bookingId: string) =>
    supabase
      .from('calendar_slots')
      .update({ slot_type: 'booked', booking_id: bookingId })
      .eq('id', slotId),

  deleteByBooking: async (bookingId: string) =>
    supabase.from('calendar_slots').delete().eq('booking_id', bookingId),
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = {
  getById: async (id: string) =>
    supabase
      .from('bookings')
      .select('*, listings(*), vendors(*), booking_add_ons(*), user_profiles!user_id(*)')
      .eq('id', id)
      .single(),

  listByCorporate: async (corporateId: string) =>
    supabase
      .from('bookings')
      .select('*, listings(*), vendors(*)')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false }),

  listByUser: async (userId: string) =>
    supabase
      .from('bookings')
      .select('*, listings(*), vendors(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

  listByVendor: async (vendorId: string) =>
    supabase
      .from('bookings')
      .select('*, listings(*), user_profiles!user_id(*), corporate_accounts(*)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  listPendingApproval: async (corporateId: string) =>
    supabase
      .from('bookings')
      .select('*, listings(*), user_profiles!user_id(*)')
      .eq('corporate_id', corporateId)
      .eq('status', 'pending_approval')
      .order('created_at'),

  create: async (
    data: Omit<
      Booking,
      | 'id'
      | 'partner_id'
      | 'partner_markup_pct'
      | 'partner_margin_amount'
      | 'partner_invoice_token'
      | 'payout_accrued_at'
      | 'created_at'
      | 'updated_at'
    > & {
      partner_id?: string | null
      partner_markup_pct?: number | null
      partner_margin_amount?: number | null
      partner_invoice_token?: string | null
    },
  ) =>
    supabase
      .from('bookings')
      .insert({
        partner_id: null,
        partner_markup_pct: null,
        partner_margin_amount: null,
        partner_invoice_token: null,
        payout_accrued_at: null,
        ...data,
      })
      .select()
      .single(),

  updateStatus: async (id: string, status: BookingStatus, extra?: Partial<Booking>) =>
    supabase
      .from('bookings')
      .update({ status, ...extra, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

  approve: async (id: string, approverId: string) =>
    supabase
      .from('bookings')
      .update({
        status: 'pending_vendor',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  cancel: async (id: string, reason: string, fee?: number) =>
    supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancellation_fee: fee ?? 0,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  complete: async (id: string) =>
    supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  // Marks a booking completed and schedules a payout 48h out for the vendor.
  // Net = total - (total * commission_rate snapshot). Story 6.4.
  completeWithPayout: async (
    booking: Booking,
  ): Promise<{ payoutId: string | null; error: string | null }> => {
    const completedAt = new Date().toISOString()
    const { error: bookingErr } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq('id', booking.id)
    if (bookingErr) return { payoutId: null, error: bookingErr.message }

    // Accrue partner earnings (resale margin and / or product revenue share)
    // before deciding on vendor payout. The RPC is idempotent and a no-op
    // when the booking has no partner attribution.
    await supabase.rpc('accrue_partner_earnings', { p_booking_id: booking.id })

    if (booking.payment_status !== 'paid' || !booking.total_amount) {
      return { payoutId: null, error: null }
    }
    // Partner-owned listings settle via the monthly partner payout cycle,
    // not the vendor payouts table.
    if (!booking.vendor_id) {
      return { payoutId: null, error: null }
    }

    const rate = booking.commission_rate ?? 0
    const gross = booking.total_amount
    const commission = Math.round(gross * rate)
    const net = gross - commission
    const scheduledFor = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    const { data: payout, error: payoutErr } = await supabase
      .from('payouts')
      .insert({
        booking_id: booking.id,
        vendor_id: booking.vendor_id,
        gross_amount: gross,
        commission_amount: commission,
        net_amount: net,
        commission_rate: rate,
        status: 'scheduled',
        scheduled_for: scheduledFor,
        processed_at: null,
        gateway_reference: null,
        hold_reason: null,
        failure_reason: null,
      })
      .select()
      .single()

    if (payoutErr || !payout) {
      return { payoutId: null, error: payoutErr?.message ?? 'Payout insert failed' }
    }
    return { payoutId: payout.id, error: null }
  },

  addAddOns: async (rows: Omit<BookingAddOn, 'id'>[]) =>
    rows.length === 0
      ? { data: [], error: null }
      : supabase.from('booking_add_ons').insert(rows).select(),

  // Story 4.6 — advance gifting order through fulfilment stages.
  setFulfilment: async (
    id: string,
    stage: FulfilmentStage,
    extra?: { tracking_number?: string | null; carrier?: string | null; carrier_url?: string | null },
  ) =>
    supabase
      .from('bookings')
      .update({
        fulfilment_stage: stage,
        ...(extra ?? {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  // Cancel booking and initiate refund if payment was captured.
  // Wallet refunds are processed immediately (credit + wallet_transactions);
  // card/UPI refunds are inserted as 'pending' for the Razorpay webhook to
  // mark processed asynchronously. Story 6.3.
  cancelWithRefund: async (
    booking: Booking,
    reason: string,
    fee: number,
    actorId: string,
  ): Promise<{ refundId: string | null; error: string | null }> => {
    const { error: cancelErr } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancellation_fee: fee,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
    if (cancelErr) return { refundId: null, error: cancelErr.message }

    if (booking.payment_status !== 'paid' || !booking.payment_method) {
      return { refundId: null, error: null }
    }

    const refundable = Math.max(0, (booking.total_amount ?? 0) - fee)
    if (refundable === 0) return { refundId: null, error: null }

    const isWallet = booking.payment_method === 'wallet'
    const { data: refund, error: refundErr } = await supabase
      .from('refunds')
      .insert({
        booking_id: booking.id,
        corporate_id: booking.corporate_id,
        amount: refundable,
        method: booking.payment_method,
        status: isWallet ? 'processed' : 'pending',
        gateway_reference: null,
        failure_reason: null,
        initiated_by: actorId,
        processed_at: isWallet ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (refundErr || !refund) {
      return { refundId: null, error: refundErr?.message ?? 'Refund insert failed' }
    }

    if (isWallet) {
      // Look up wallet by corporate_id then credit + log transaction.
      const { data: w } = await supabase
        .from('wallets')
        .select('*')
        .eq('corporate_id', booking.corporate_id)
        .single()
      if (w) {
        await supabase.from('wallet_transactions').insert({
          wallet_id: w.id,
          corporate_id: booking.corporate_id,
          type: 'refund',
          amount: refundable,
          reference_id: refund.id,
          booking_id: booking.id,
          description: `Refund for booking ${booking.id.slice(0, 8)}`,
        })
        await supabase
          .from('wallets')
          .update({
            balance: w.balance + refundable,
            updated_at: new Date().toISOString(),
          })
          .eq('corporate_id', booking.corporate_id)
      }
    }

    return { refundId: refund.id, error: null }
  },
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const budgets = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('budget_rules')
      .select('*')
      .eq('corporate_id', corporateId)
      .eq('is_active', true)
      .order('created_at'),

  create: async (data: Omit<BudgetRule, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('budget_rules').insert(data).select().single(),

  update: async (id: string, data: Partial<BudgetRule>) =>
    supabase
      .from('budget_rules')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id),

  deactivate: async (id: string) =>
    supabase.from('budget_rules').update({ is_active: false }).eq('id', id),
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const wallet = {
  getByCorporate: async (corporateId: string) =>
    supabase.from('wallets').select('*').eq('corporate_id', corporateId).single(),

  getTransactions: async (corporateId: string, limit = 50) =>
    supabase
      .from('wallet_transactions')
      .select('*')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false })
      .limit(limit),

  recordTransaction: async (data: Omit<WalletTransaction, 'id' | 'created_at'>) =>
    supabase.from('wallet_transactions').insert(data).select().single(),

  adjustBalance: async (corporateId: string, delta: number) => {
    const { data: w, error: fetchErr } = await supabase
      .from('wallets')
      .select('balance')
      .eq('corporate_id', corporateId)
      .single()
    if (fetchErr || !w) return { error: fetchErr ?? new Error('Wallet not found') }
    return supabase
      .from('wallets')
      .update({ balance: w.balance + delta, updated_at: new Date().toISOString() })
      .eq('corporate_id', corporateId)
  },

  setLowBalanceThreshold: async (corporateId: string, threshold: number) =>
    supabase
      .from('wallets')
      .update({ low_balance_threshold: threshold, updated_at: new Date().toISOString() })
      .eq('corporate_id', corporateId),
}

// ─── Commissions ──────────────────────────────────────────────────────────────

export const commissions = {
  getGlobal: async () =>
    supabase
      .from('commissions')
      .select('*')
      .eq('scope', 'global')
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single(),

  getForVendor: async (vendorId: string) =>
    supabase
      .from('commissions')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1),

  list: async () =>
    supabase.from('commissions').select('*, vendors(business_name)').order('created_at', { ascending: false }),

  create: async (data: Omit<Commission, 'id' | 'created_at'>) =>
    supabase.from('commissions').insert(data).select().single(),

  deactivate: async (id: string) =>
    supabase.from('commissions').update({ is_active: false }).eq('id', id),
}

// ─── Shortlists (Story 13.3) ──────────────────────────────────────────────────

export const shortlists = {
  listByAm: async (amId: string) =>
    supabase
      .from('shortlists')
      .select('*, corporate_accounts(name)')
      .eq('account_manager_id', amId)
      .order('created_at', { ascending: false }),

  getByToken: async (token: string) =>
    supabase
      .from('shortlists')
      .select('*, corporate_accounts(name)')
      .eq('share_token', token)
      .maybeSingle(),

  getById: async (id: string) =>
    supabase.from('shortlists').select('*').eq('id', id).single(),

  create: async (data: Omit<Shortlist, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('shortlists').insert(data).select().single(),

  incrementView: async (id: string) => {
    const { data } = await supabase
      .from('shortlists')
      .select('view_count')
      .eq('id', id)
      .single()
    if (!data) return { error: null }
    return supabase
      .from('shortlists')
      .update({ view_count: data.view_count + 1 })
      .eq('id', id)
  },

  listItems: async (shortlistId: string) =>
    supabase
      .from('shortlist_items')
      .select('*, listings(*, listing_images(*), vendors(business_name))')
      .eq('shortlist_id', shortlistId)
      .order('display_order'),

  addItem: async (data: Omit<ShortlistItem, 'id' | 'created_at'>) =>
    supabase.from('shortlist_items').insert(data).select().single(),

  removeItem: async (id: string) =>
    supabase.from('shortlist_items').delete().eq('id', id),
}

// ─── Hey Genie (Stories 11.1, 11.2) ───────────────────────────────────────────

export const heyGenie = {
  getConfig: async (corporateId: string) =>
    supabase
      .from('heygenie_config')
      .select('*')
      .eq('corporate_id', corporateId)
      .maybeSingle(),

  upsertConfig: async (data: Omit<HeyGenieConfig, 'created_at' | 'updated_at'>) =>
    supabase
      .from('heygenie_config')
      .upsert(data, { onConflict: 'corporate_id' })
      .select()
      .single(),

  logSession: async (data: Omit<HeyGenieSession, 'id' | 'created_at'>) =>
    supabase.from('heygenie_sessions').insert(data).select().single(),

  listSessions: async (userId: string, limit = 20) =>
    supabase
      .from('heygenie_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
}

// ─── Partners (Sprint 19 — Stories 14.1, 14.6, 14.2) ─────────────────────────

function generateReferralCode(seed: string): string {
  // Short URL-safe slug derived from partner UUID + a 4-char random suffix.
  const random = Array.from(crypto.getRandomValues(new Uint8Array(2)))
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
  return `${seed.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}${random.toUpperCase()}`
}

export const partners = {
  list: async (status?: PartnerStatus) => {
    const q = supabase.from('partners').select('*').order('created_at', { ascending: false })
    return status ? q.eq('status', status) : q
  },

  getById: async (id: string) =>
    supabase.from('partners').select('*').eq('id', id).single(),

  getByUserId: async (userId: string) =>
    supabase.from('partners').select('*').eq('user_id', userId).maybeSingle(),

  getByReferralCode: async (code: string) =>
    supabase
      .from('partners')
      .select('id, status, full_name, business_name, referral_code')
      .eq('referral_code', code)
      .eq('status', 'active')
      .maybeSingle(),

  signup: async (
    data: Omit<
      Partner,
      | 'id'
      | 'status'
      | 'referral_code'
      | 'approved_by'
      | 'approved_at'
      | 'rejection_reason'
      | 'default_markup_pct'
      | 'created_at'
      | 'updated_at'
    >,
  ) =>
    supabase
      .from('partners')
      .insert({ ...data, status: 'pending' })
      .select()
      .single(),

  approve: async (id: string, approvedBy: string, seed: string) => {
    const code = generateReferralCode(seed)
    return supabase
      .from('partners')
      .update({
        status: 'active',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        referral_code: code,
      })
      .eq('id', id)
      .select()
      .single()
  },

  setStatus: async (id: string, status: PartnerStatus, reason?: string) =>
    supabase
      .from('partners')
      .update({
        status,
        rejection_reason: status === 'rejected' || status === 'terminated' ? (reason ?? null) : null,
      })
      .eq('id', id)
      .select()
      .single(),

  update: async (id: string, data: Partial<Omit<Partner, 'id' | 'created_at'>>) =>
    supabase.from('partners').update(data).eq('id', id).select().single(),

  setDefaultMarkup: async (id: string, pct: number) =>
    supabase
      .from('partners')
      .update({ default_markup_pct: pct })
      .eq('id', id)
      .select()
      .single(),
}

export const partnerAgreements = {
  getCurrent: async (partnerId: string) =>
    supabase
      .from('partner_agreements')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('is_current', true)
      .maybeSingle(),

  listHistory: async (partnerId: string) =>
    supabase
      .from('partner_agreements')
      .select('*')
      .eq('partner_id', partnerId)
      .order('valid_from', { ascending: false }),

  create: async (data: Omit<PartnerAgreement, 'id' | 'is_current' | 'created_at'>) =>
    supabase
      .from('partner_agreements')
      .insert({ ...data, is_current: true })
      .select()
      .single(),
}

export const partnerReferrals = {
  listByPartner: async (partnerId: string) =>
    supabase
      .from('partner_referrals')
      .select('*, corporate_accounts(name)')
      .eq('partner_id', partnerId)
      .order('signed_up_at', { ascending: false }),

  getByCorporate: async (corporateId: string) =>
    supabase
      .from('partner_referrals')
      .select('*')
      .eq('referred_corporate_id', corporateId)
      .maybeSingle(),

  capture: async (data: Omit<PartnerReferral, 'id' | 'attribution_expires_at' | 'activated_at' | 'first_booking_id' | 'commission_amount' | 'commission_credited_at' | 'created_at'>) =>
    supabase
      .from('partner_referrals')
      .insert({
        ...data,
        attribution_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single(),

  // Calls the SECURITY DEFINER function that idempotently credits the
  // partner wallet on a corporate's first confirmed booking.
  creditCommission: async (corporateId: string, bookingId: string) =>
    supabase.rpc('credit_partner_commission', {
      p_corporate_id: corporateId,
      p_booking_id: bookingId,
    }),
}

export const partnerListings = {
  listByPartner: async (partnerId: string) =>
    supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('owner_type', 'partner')
      .eq('owner_partner_id', partnerId)
      .order('created_at', { ascending: false }),

  create: async (
    partnerId: string,
    data: Omit<
      Listing,
      | 'id'
      | 'owner_type'
      | 'owner_partner_id'
      | 'vendor_id'
      | 'created_at'
      | 'updated_at'
    >,
  ) =>
    supabase
      .from('listings')
      .insert({ ...data, owner_type: 'partner', owner_partner_id: partnerId, vendor_id: null })
      .select()
      .single(),
}

export const partnerClients = {
  listByPartner: async (partnerId: string) =>
    supabase
      .from('corporate_accounts')
      .select('*')
      .eq('referred_by_partner_id', partnerId)
      .order('created_at', { ascending: false }),
}

export const partnerPayouts = {
  listPending: async () =>
    supabase
      .from('partner_payout_periods')
      .select('*, partners(full_name, business_name, email)')
      .eq('status', 'pending')
      .gt('total_amount', 0)
      .order('period_yyyymm', { ascending: false }),

  listByPartner: async (partnerId: string) =>
    supabase
      .from('partner_payout_periods')
      .select('*')
      .eq('partner_id', partnerId)
      .order('period_yyyymm', { ascending: false }),

  listLast12Months: async (partnerId: string) => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const startYyyymm =
      start.getFullYear().toString() + String(start.getMonth() + 1).padStart(2, '0')
    return supabase
      .from('partner_payout_periods')
      .select('*')
      .eq('partner_id', partnerId)
      .gte('period_yyyymm', startYyyymm)
      .order('period_yyyymm', { ascending: true })
  },

  getMonth: async (partnerId: string, yyyymm: string) =>
    supabase
      .from('partner_payout_periods')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('period_yyyymm', yyyymm)
      .maybeSingle(),

  markPaid: async (periodId: string, adminId: string, note?: string) =>
    supabase.rpc('mark_partner_payout_paid', {
      p_period_id: periodId,
      p_admin_id: adminId,
      p_note: note ?? null,
    }),

  accrue: async (bookingId: string) =>
    supabase.rpc('accrue_partner_earnings', { p_booking_id: bookingId }),
}

export const partnerStatements = {
  // Resale bookings completed in [start, end) where this partner was the
  // resale partner (booking.partner_id), used to itemise the margin.
  resaleBookingsForMonth: async (partnerId: string, startIso: string, endIso: string) =>
    supabase
      .from('bookings')
      .select('id, listing_id, total_amount, partner_margin_amount, completed_at, corporate_id, listings(title), corporate_accounts(name)')
      .eq('partner_id', partnerId)
      .eq('status', 'completed')
      .gte('completed_at', startIso)
      .lt('completed_at', endIso)
      .order('completed_at', { ascending: true }),

  // Bookings against partner-owned listings completed in the window, used
  // for the product revenue-share line items.
  productBookingsForMonth: async (partnerId: string, startIso: string, endIso: string) =>
    supabase
      .from('bookings')
      .select('id, listing_id, total_amount, completed_at, corporate_id, listings!inner(title, owner_partner_id), corporate_accounts(name)')
      .eq('status', 'completed')
      .eq('listings.owner_partner_id', partnerId)
      .gte('completed_at', startIso)
      .lt('completed_at', endIso)
      .order('completed_at', { ascending: true }),

  // Referrals that activated (first booking) inside the window — the
  // referral commission ledger lives in partner_wallet_transactions.
  referralCommissionsForMonth: async (partnerId: string, startIso: string, endIso: string) =>
    supabase
      .from('partner_wallet_transactions')
      .select('id, amount, created_at, referral_id, booking_id, partner_referrals(referred_corporate_id, corporate_accounts:referred_corporate_id(name))')
      .eq('partner_id', partnerId)
      .eq('type', 'commission')
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .order('created_at', { ascending: true }),
}

// ─── Quick Share (Phase 2 Feature 1) ─────────────────────────────────────────

function generateQuickShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const quickShares = {
  list: async () =>
    supabase
      .from('quick_shares')
      .select('*')
      .order('created_at', { ascending: false }),

  getById: async (id: string) =>
    supabase.from('quick_shares').select('*').eq('id', id).single(),

  create: async (
    createdBy: string,
    module: ModuleId,
    options: {
      client_label?: string | null
      custom_note?: string | null
      budget_cap?: number | null
      expires_at?: string
    },
  ) =>
    supabase
      .from('quick_shares')
      .insert({
        created_by: createdBy,
        module,
        token: generateQuickShareToken(),
        client_label: options.client_label ?? null,
        custom_note: options.custom_note ?? null,
        budget_cap: options.budget_cap ?? null,
        ...(options.expires_at ? { expires_at: options.expires_at } : {}),
      })
      .select()
      .single(),

  setItems: async (
    quickShareId: string,
    items: { listing_id: string; display_order: number; curator_note?: string | null; hidden?: boolean }[],
  ) => {
    await supabase.from('quick_share_items').delete().eq('quick_share_id', quickShareId)
    if (items.length === 0) return { error: null }
    return supabase.from('quick_share_items').insert(
      items.map((it) => ({
        quick_share_id: quickShareId,
        listing_id: it.listing_id,
        display_order: it.display_order,
        curator_note: it.curator_note ?? null,
        hidden: it.hidden ?? false,
      })),
    )
  },

  listItems: async (quickShareId: string) =>
    supabase
      .from('quick_share_items')
      .select('*, listings(*)')
      .eq('quick_share_id', quickShareId)
      .order('display_order'),

  toggleItemHidden: async (itemId: string, hidden: boolean) =>
    supabase.from('quick_share_items').update({ hidden }).eq('id', itemId),

  close: async (id: string) =>
    supabase.from('quick_shares').update({ status: 'closed' }).eq('id', id),

  setPaymentLink: async (id: string, url: string) =>
    supabase.from('quick_shares').update({ payment_link_url: url }).eq('id', id),

  listSubmissions: async (quickShareId: string) =>
    supabase
      .from('quick_share_submissions')
      .select('*')
      .eq('quick_share_id', quickShareId)
      .order('submitted_at', { ascending: false }),

  setSubmissionPayment: async (
    submissionId: string,
    paymentLink: string | null,
    status: 'pending' | 'sent' | 'paid' | 'cancelled',
  ) =>
    supabase
      .from('quick_share_submissions')
      .update({
        payment_link_url: paymentLink,
        payment_status: status,
      })
      .eq('id', submissionId),

  // Public (anon-friendly) handle via the SECURITY DEFINER RPC.
  getByToken: async (token: string) =>
    supabase.rpc('get_quick_share_by_token', { p_token: token }),

  submit: async (
    token: string,
    payload: {
      client_name: string
      client_company: string | null
      client_phone: string | null
      client_email: string | null
      selected_items: Array<{ listing_id: string; quantity?: number; note?: string }>
      client_note: string | null
    },
  ) =>
    supabase.rpc('submit_quick_share', {
      p_token: token,
      p_client_name: payload.client_name,
      p_client_company: payload.client_company,
      p_client_phone: payload.client_phone,
      p_client_email: payload.client_email,
      p_selected_items: payload.selected_items,
      p_client_note: payload.client_note,
    }),
}

// ─── Booking status tracker (Phase 2 Feature 2 & 3) ──────────────────────────

export const bookingTracker = {
  listEvents: async (bookingId: string) =>
    supabase
      .from('booking_status_events')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true }),

  createOtp: async (
    bookingId: string,
    stage: string,
    otpCode: string,
    sentTo: string,
  ) =>
    supabase
      .from('booking_status_events')
      .insert({
        booking_id: bookingId,
        stage,
        otp_code: otpCode,
        otp_sent_to: sentTo,
      })
      .select()
      .single(),

  submitProof: async (
    eventId: string,
    data: {
      photo_path: string | null
      gps_lat: number | null
      gps_lng: number | null
      submitted_by: string
      notes?: string | null
    },
  ) =>
    supabase
      .from('booking_status_events')
      .update({
        ...data,
        submitted_at: new Date().toISOString(),
        otp_verified_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single(),

  adminOverride: async (eventId: string, reason: string) =>
    supabase
      .from('booking_status_events')
      .update({ admin_override_reason: reason })
      .eq('id', eventId)
      .select()
      .single(),

  listFieldAgentQueue: async () =>
    supabase
      .from('bookings')
      .select('id, module, status, group_size, start_time, end_time, listings(title, location_city), corporate_accounts(name)')
      .in('status', ['confirmed', 'pending_vendor'])
      .order('start_time', { ascending: true, nullsFirst: false })
      .limit(50),
}

export const bookingProof = {
  getRecord: async (bookingId: string) =>
    supabase
      .from('booking_proof_records')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle(),

  upsertRecord: async (
    bookingId: string,
    patch: Partial<{
      agreed_scope: string | null
      quoted_price: number | null
      final_price: number | null
      negotiation_history: unknown
      po_document_path: string | null
      admin_notes: string | null
    }>,
  ) =>
    supabase
      .from('booking_proof_records')
      .upsert({ booking_id: bookingId, ...patch }, { onConflict: 'booking_id' })
      .select()
      .single(),

  accept: async (
    bookingId: string,
    acceptedBy: string,
    ip: string,
    userAgent: string,
  ) =>
    supabase
      .from('booking_proof_records')
      .upsert(
        {
          booking_id: bookingId,
          accepted_by: acceptedBy,
          accepted_at: new Date().toISOString(),
          accepted_ip: ip,
          accepted_user_agent: userAgent,
        },
        { onConflict: 'booking_id' },
      )
      .select()
      .single(),

  listMilestones: async (bookingId: string) =>
    supabase
      .from('booking_payment_milestones')
      .select('*')
      .eq('booking_id', bookingId)
      .order('due_at', { ascending: true }),

  upsertMilestone: async (
    data: {
      id?: string
      booking_id: string
      kind: 'advance' | 'milestone' | 'balance' | 'final_settlement'
      percentage: number | null
      amount: number | null
      due_at: string | null
      paid_at?: string | null
      paid_reference?: string | null
    },
  ) =>
    supabase
      .from('booking_payment_milestones')
      .upsert(data)
      .select()
      .single(),
}

// ─── Sub-Users / RBAC (Phase 2 Feature 6) ────────────────────────────────────

function generateInviteToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const INTERNAL_ROLES: ReadonlyArray<UserRole> = [
  'mogzu_admin',
  'account_manager',
  'support',
  'sales_agent',
  'field_agent',
]

export const subUsers = {
  listInternal: async () =>
    supabase
      .from('user_profiles')
      .select('*')
      .in('role', INTERNAL_ROLES as unknown as string[])
      .order('created_at', { ascending: false }),

  setStatus: async (userId: string, status: 'active' | 'deactivated') =>
    supabase
      .from('user_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single(),

  setRole: async (userId: string, role: UserRole) =>
    supabase
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single(),
}

export const userInvites = {
  list: async () =>
    supabase
      .from('user_invites')
      .select('*, inviter:invited_by(full_name)')
      .order('created_at', { ascending: false }),

  create: async (
    inviterId: string,
    email: string,
    role: UserRole,
    fullName: string | null,
  ) =>
    supabase
      .from('user_invites')
      .insert({
        email: email.trim().toLowerCase(),
        role,
        full_name: fullName,
        token: generateInviteToken(),
        invited_by: inviterId,
      })
      .select()
      .single(),

  getByToken: async (token: string) =>
    supabase.rpc('get_user_invite_by_token', { p_token: token }),

  accept: async (token: string) =>
    supabase.rpc('accept_user_invite', { p_token: token }),
}

export const userPermissions = {
  listByUser: async (userId: string) =>
    supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId),

  grant: async (
    userId: string,
    resource: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'approve',
    grantedBy: string,
  ) =>
    supabase
      .from('user_permissions')
      .upsert(
        { user_id: userId, resource, action, granted_by: grantedBy },
        { onConflict: 'user_id,resource,action' },
      ),

  revoke: async (
    userId: string,
    resource: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'approve',
  ) =>
    supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('resource', resource)
      .eq('action', action),
}

export const userActivity = {
  log: async (
    actorId: string,
    eventType: string,
    targetTable?: string,
    targetId?: string | null,
    metadata?: Record<string, unknown>,
  ) =>
    supabase.from('user_activity_events').insert({
      actor_id: actorId,
      event_type: eventType,
      target_table: targetTable ?? null,
      target_id: targetId ?? null,
      metadata: metadata ?? {},
    }),

  listByActor: async (actorId: string, limit = 50) =>
    supabase
      .from('user_activity_events')
      .select('*')
      .eq('actor_id', actorId)
      .order('created_at', { ascending: false })
      .limit(limit),
}

export const partnerWallets = {
  getByPartner: async (partnerId: string) =>
    supabase
      .from('partner_wallets')
      .select('*')
      .eq('partner_id', partnerId)
      .maybeSingle(),

  listTransactions: async (partnerId: string, limit = 50) =>
    supabase
      .from('partner_wallet_transactions')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(limit),
}

// ─── Promotions (Stories 8.7, 9.6) ────────────────────────────────────────────

export const promotions = {
  listByVendor: async (vendorId: string) =>
    supabase
      .from('promotions')
      .select('*, listings(title)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  listActive: async () =>
    supabase
      .from('promotions')
      .select('*, listings(title)')
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .order('ends_at'),

  listQueue: async () =>
    supabase
      .from('promotions')
      .select('*, vendors(business_name), listings(title)')
      .eq('status', 'pending_approval')
      .order('created_at'),

  create: async (data: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('promotions').insert(data).select().single(),

  setStatus: async (
    id: string,
    status: PromotionStatus,
    extra?: { approved_by?: string; rejection_reason?: string },
  ) =>
    supabase
      .from('promotions')
      .update({
        status,
        approved_by: extra?.approved_by ?? null,
        approved_at: status === 'active' ? new Date().toISOString() : null,
        rejection_reason: extra?.rejection_reason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),
}

// ─── Event Templates (Story 3.5) ──────────────────────────────────────────────

export const eventTemplates = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('event_templates')
      .select('*')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false }),

  listActive: async (corporateId: string) =>
    supabase
      .from('event_templates')
      .select('*')
      .eq('corporate_id', corporateId)
      .eq('is_active', true)
      .order('usage_count', { ascending: false }),

  create: async (data: Omit<EventTemplate, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('event_templates').insert(data).select().single(),

  update: async (id: string, data: Partial<EventTemplate>) =>
    supabase
      .from('event_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id),

  incrementUsage: async (id: string) => {
    const { data } = await supabase
      .from('event_templates')
      .select('usage_count')
      .eq('id', id)
      .single()
    if (!data) return { error: null }
    return supabase
      .from('event_templates')
      .update({ usage_count: data.usage_count + 1 })
      .eq('id', id)
  },
}

// ─── Wishlist (Story 13.1) ────────────────────────────────────────────────────

export const wishlists = {
  listByUser: async (userId: string) =>
    supabase
      .from('wishlists')
      .select('*, listings(*, listing_images(*), vendors(business_name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

  add: async (userId: string, listingId: string) =>
    supabase
      .from('wishlists')
      .insert({ user_id: userId, listing_id: listingId })
      .select()
      .single(),

  remove: async (userId: string, listingId: string) =>
    supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId),

  isInWishlist: async (userId: string, listingId: string) =>
    supabase
      .from('wishlists')
      .select('listing_id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .eq('listing_id', listingId),
}

// ─── Reviews (Stories 8.4, 8.5, 8.6) ──────────────────────────────────────────

export const reviews = {
  listByListing: async (listingId: string) =>
    supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),

  listByVendor: async (vendorId: string) =>
    supabase
      .from('reviews')
      .select('*, listings(title)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  listQueue: async () =>
    supabase
      .from('reviews')
      .select('*, listings(title), vendors(business_name)')
      .eq('status', 'pending_approval')
      .order('created_at'),

  getByBooking: async (bookingId: string) =>
    supabase.from('reviews').select('*').eq('booking_id', bookingId).maybeSingle(),

  create: async (data: Omit<Review, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('reviews').insert(data).select().single(),

  setStatus: async (
    id: string,
    status: ReviewStatus,
    extra?: { approved_by?: string; rejection_reason?: string },
  ) =>
    supabase
      .from('reviews')
      .update({
        status,
        approved_by: extra?.approved_by ?? null,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        rejection_reason: extra?.rejection_reason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  setReply: async (id: string, reply: string) =>
    supabase
      .from('reviews')
      .update({
        vendor_reply: reply,
        vendor_replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  // Aggregate (avg + count) for approved reviews on a listing.
  // Client-side aggregation — fine for typical volumes; materialised view
  // when scale demands it.
  aggregate: async (listingId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listing_id', listingId)
      .eq('status', 'approved')
    if (error || !data) return { avg: null, count: 0, error }
    if (data.length === 0) return { avg: null, count: 0, error: null }
    const sum = data.reduce((acc: number, r: { rating: number }) => acc + (r.rating ?? 0), 0)
    return { avg: sum / data.length, count: data.length, error: null }
  },
}

export const reviewInvites = {
  listByVendor: async (vendorId: string) =>
    supabase
      .from('review_invites')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  countThisMonth: async (vendorId: string) => {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    return supabase
      .from('review_invites')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .gte('created_at', monthStart.toISOString())
  },

  create: async (data: Omit<ReviewInvite, 'id' | 'created_at'>) =>
    supabase.from('review_invites').insert(data).select().single(),
}

// ─── Gifting Campaigns (Story 4.3) ────────────────────────────────────────────

export const giftingCampaigns = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('gifting_campaigns')
      .select('*, listings(title)')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false }),

  getById: async (id: string) =>
    supabase
      .from('gifting_campaigns')
      .select('*, listings(title,base_price)')
      .eq('id', id)
      .single(),

  create: async (data: Omit<GiftingCampaign, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('gifting_campaigns').insert(data).select().single(),

  listBookings: async (campaignId: string) =>
    supabase
      .from('bookings')
      .select('*, user_profiles(full_name,department,email)')
      .eq('gifting_campaign_id', campaignId)
      .order('created_at'),
}

// ─── Booking Messages (Story 7.1) ─────────────────────────────────────────────

export const bookingMessages = {
  listByBooking: async (bookingId: string) =>
    supabase
      .from('booking_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at'),

  send: async (data: Omit<BookingMessage, 'id' | 'created_at'>) =>
    supabase.from('booking_messages').insert(data).select().single(),

  markRead: async (messageId: string, userId: string) => {
    const { data: msg } = await supabase
      .from('booking_messages')
      .select('read_by')
      .eq('id', messageId)
      .single()
    if (!msg) return { error: null }
    const next = Array.from(new Set([...(msg.read_by ?? []), userId]))
    return supabase
      .from('booking_messages')
      .update({ read_by: next })
      .eq('id', messageId)
  },

  unreadCountForUser: async (userId: string) =>
    supabase
      .from('booking_messages')
      .select('id', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .not('read_by', 'cs', `{${userId}}`),
}

// ─── Booking Disputes (Story 9.5) ─────────────────────────────────────────────

export const bookingDisputes = {
  listQueue: async (status?: DisputeStatus) => {
    let q = supabase
      .from('booking_disputes')
      .select('*, bookings(listings(title),corporate_accounts(name),vendors(business_name),total_amount,payment_status,payment_method,user_id)')
      .order('created_at', { ascending: false })
    if (status) q = q.eq('status', status)
    return q
  },

  getById: async (id: string) =>
    supabase
      .from('booking_disputes')
      .select('*, bookings(listings(title),corporate_accounts(name),vendors(business_name),total_amount,payment_status,payment_method,user_id,vendor_id,corporate_id)')
      .eq('id', id)
      .single(),

  listByBooking: async (bookingId: string) =>
    supabase
      .from('booking_disputes')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false }),

  raise: async (data: Omit<BookingDispute, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('booking_disputes').insert(data).select().single(),

  resolve: async (
    id: string,
    resolution: DisputeResolution,
    note: string,
    resolverId: string,
  ) =>
    supabase
      .from('booking_disputes')
      .update({
        status: 'resolved',
        resolution,
        resolution_note: note,
        resolved_by: resolverId,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  setStatus: async (id: string, status: DisputeStatus) =>
    supabase
      .from('booking_disputes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id),
}

// ─── Travel Policies (Story 5.5) ──────────────────────────────────────────────

export const travelPolicies = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('travel_policies')
      .select('*')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false }),

  listActiveForRole: async (corporateId: string, role: UserRole, module: 'spacex_stay' | 'spacex_coworking') =>
    supabase
      .from('travel_policies')
      .select('*')
      .eq('corporate_id', corporateId)
      .eq('is_active', true)
      .eq('module', module)
      .in('role_tier', [role, 'all']),

  create: async (data: Omit<TravelPolicy, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('travel_policies').insert(data).select().single(),

  update: async (id: string, data: Partial<TravelPolicy>) =>
    supabase
      .from('travel_policies')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id),

  deactivate: async (id: string) =>
    supabase.from('travel_policies').update({ is_active: false }).eq('id', id),
}

// ─── Support Tickets (Stories 12.1, 12.2, 12.3) ──────────────────────────────

export const supportTickets = {
  create: async (data: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('support_tickets').insert(data).select().single(),

  getById: async (id: string) =>
    supabase
      .from('support_tickets')
      .select('*, bookings(listings(title)), payouts(net_amount,scheduled_for)')
      .eq('id', id)
      .single(),

  listMine: async (userId: string) =>
    supabase
      .from('support_tickets')
      .select('*')
      .eq('submitter_id', userId)
      .order('created_at', { ascending: false }),

  listQueue: async (audience: 'corporate' | 'vendor' | 'all', status?: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed') => {
    let q = supabase
      .from('support_tickets')
      .select('*, user_profiles!support_tickets_submitter_id_fkey(full_name,department), vendors(business_name), corporate_accounts(name)')
      .order('priority', { ascending: false })
      .order('created_at')
    if (audience !== 'all') q = q.eq('audience', audience)
    if (status) q = q.eq('status', status)
    return q
  },

  update: async (id: string, data: Partial<SupportTicket>) =>
    supabase
      .from('support_tickets')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
}

export const supportTicketNotes = {
  listByTicket: async (ticketId: string) =>
    supabase
      .from('support_ticket_notes')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at'),

  create: async (data: Omit<SupportTicketNote, 'id' | 'created_at'>) =>
    supabase.from('support_ticket_notes').insert(data).select().single(),
}

// ─── Notifications (Story 7.2) ────────────────────────────────────────────────

type NotifyInput = {
  userId: string
  type: NotificationType
  title: string
  body?: string | null
  linkUrl?: string | null
  metadata?: Record<string, unknown>
}

export const notifications = {
  listByUser: async (userId: string, limit = 50) =>
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),

  unreadCount: async (userId: string) =>
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false),

  markRead: async (id: string) =>
    supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id),

  markAllRead: async (userId: string) =>
    supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false),

  // Emits a notification, respecting the recipient's preferences. Critical
  // types bypass the in-app opt-out. Email status is 'queued' if the user
  // has opted in, otherwise 'skipped' — the future Resend worker drains the
  // queue.
  notify: async (input: NotifyInput): Promise<{ error: string | null }> => {
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', input.userId)
      .maybeSingle()

    const isCritical = CRITICAL_NOTIFICATION_TYPES.includes(input.type)
    const inAppEnabled =
      isCritical ||
      !prefs ||
      (prefs.in_app_enabled_types ?? []).includes(input.type)
    if (!inAppEnabled) return { error: null }

    const emailEnabled =
      isCritical ||
      (prefs?.email_enabled_types ?? []).includes(input.type)

    const { error } = await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link_url: input.linkUrl ?? null,
      metadata: input.metadata ?? {},
      is_read: false,
      read_at: null,
      email_status: emailEnabled ? 'queued' : 'skipped',
      email_sent_at: null,
    })
    return { error: error?.message ?? null }
  },
}

export const notificationPreferences = {
  get: async (userId: string) =>
    supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),

  upsert: async (data: Omit<NotificationPreference, 'created_at' | 'updated_at'>) =>
    supabase
      .from('notification_preferences')
      .upsert(data, { onConflict: 'user_id' })
      .select()
      .single(),
}

// ─── Celebration Events (Stories 10.1, 10.2) ─────────────────────────────────

export const celebrations = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('celebration_events')
      .select('*, employees(full_name,email,department,dob,join_date), listings:default_listing_id(title)')
      .eq('corporate_id', corporateId)
      .order('trigger_date'),

  listForManager: async (managerId: string) =>
    supabase
      .from('celebration_events')
      .select('*, employees(full_name,email,department), listings:default_listing_id(title,base_price), override:listing_id_override(title,base_price)')
      .eq('manager_id', managerId)
      .in('status', ['scheduled', 'personalised'])
      .order('trigger_date'),

  create: async (data: Omit<CelebrationEvent, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('celebration_events').insert(data).select().single(),

  personalise: async (
    id: string,
    data: { manager_message?: string; listing_id_override?: string | null; budget_override?: number | null },
  ) =>
    supabase
      .from('celebration_events')
      .update({
        ...data,
        status: 'personalised',
        personalised_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  suppress: async (id: string, reason: string) =>
    supabase
      .from('celebration_events')
      .update({
        status: 'suppressed',
        suppressed_reason: reason,
        suppressed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),
}

// ─── Employees (Story 10.0) ───────────────────────────────────────────────────

export const employees = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('employees')
      .select('*')
      .eq('corporate_id', corporateId)
      .order('full_name'),

  upsertBatch: async (
    rows: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'imported_at'>[],
  ) =>
    supabase
      .from('employees')
      .upsert(rows, { onConflict: 'corporate_id,email' })
      .select(),

  deactivate: async (id: string) =>
    supabase.from('employees').update({ is_active: false }).eq('id', id),
}

// ─── Vendor Payouts (Story 6.4) ───────────────────────────────────────────────

export const payouts = {
  create: async (data: Omit<Payout, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('payouts').insert(data).select().single(),

  listByVendor: async (vendorId: string) =>
    supabase
      .from('payouts')
      .select('*, bookings(listings(title), corporate_accounts(name))')
      .eq('vendor_id', vendorId)
      .order('scheduled_for', { ascending: false }),

  listDue: async () =>
    supabase
      .from('payouts')
      .select('*, vendors(business_name, bank_account_verified)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for'),

  markProcessed: async (id: string, gatewayReference: string) =>
    supabase
      .from('payouts')
      .update({
        status: 'processed',
        gateway_reference: gatewayReference,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  hold: async (id: string, reason: string) =>
    supabase
      .from('payouts')
      .update({
        status: 'held',
        hold_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  markFailed: async (id: string, reason: string) =>
    supabase
      .from('payouts')
      .update({
        status: 'failed',
        failure_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),
}

// ─── Refunds (Story 6.3) ──────────────────────────────────────────────────────

export const refunds = {
  create: async (
    data: Omit<Refund, 'id' | 'created_at' | 'updated_at' | 'initiated_at'>,
  ) => supabase.from('refunds').insert(data).select().single(),

  listByBooking: async (bookingId: string) =>
    supabase
      .from('refunds')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false }),

  listByCorporate: async (corporateId: string) =>
    supabase
      .from('refunds')
      .select('*, bookings(listings(title))')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false }),

  markProcessed: async (id: string, gatewayReference?: string) =>
    supabase
      .from('refunds')
      .update({
        status: 'processed',
        gateway_reference: gatewayReference ?? null,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),

  markFailed: async (id: string, reason: string) =>
    supabase
      .from('refunds')
      .update({
        status: 'failed',
        failure_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),
}

// ─── Role Switch Audit (Story 1.5) ────────────────────────────────────────────

export const roleSwitchEvents = {
  log: async (data: Omit<RoleSwitchEvent, 'id' | 'switched_at'>) =>
    supabase.from('role_switch_events').insert(data).select().single(),

  listByUser: async (userId: string, limit = 50) =>
    supabase
      .from('role_switch_events')
      .select('*')
      .eq('user_id', userId)
      .order('switched_at', { ascending: false })
      .limit(limit),
}

// ─── Gifting Rules (Story 4.1) ────────────────────────────────────────────────

export const giftingRules = {
  listByCorporate: async (corporateId: string) =>
    supabase
      .from('gifting_rules')
      .select('*')
      .eq('corporate_id', corporateId)
      .order('created_at', { ascending: false }),

  create: async (data: Omit<GiftingRule, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('gifting_rules').insert(data).select().single(),

  update: async (id: string, data: Partial<GiftingRule>) =>
    supabase
      .from('gifting_rules')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

  deactivate: async (id: string) =>
    supabase.from('gifting_rules').update({ is_active: false }).eq('id', id),
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = {
  listByModule: async (module: ModuleId) =>
    supabase
      .from('listing_categories')
      .select('*')
      .eq('module', module)
      .eq('is_active', true)
      .order('display_order'),

  listAllForAdmin: async () =>
    supabase
      .from('listing_categories')
      .select('*')
      .order('module')
      .order('display_order'),

  create: async (
    data: Omit<ListingCategory, 'id' | 'created_at' | 'updated_at'>,
  ) => supabase.from('listing_categories').insert(data).select().single(),

  update: async (
    id: string,
    data: Partial<Omit<ListingCategory, 'id' | 'created_at'>>,
  ) =>
    supabase
      .from('listing_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  toggle: async (id: string, isActive: boolean) =>
    supabase
      .from('listing_categories')
      .update({ is_active: isActive })
      .eq('id', id),

  reorder: async (rows: { id: string; display_order: number }[]) => {
    for (const r of rows) {
      const { error } = await supabase
        .from('listing_categories')
        .update({ display_order: r.display_order })
        .eq('id', r.id)
      if (error) return { error }
    }
    return { error: null }
  },

  countActiveListings: async (categoryId: string) =>
    supabase.rpc('count_active_listings_for_category', { p_category_id: categoryId }),
}

// ─── Mogzu Direct Listings (Phase 2 Feature 7) ───────────────────────────────

export interface MogzuDirectListingRow {
  id: string
  module: string
  category_id: string | null
  title: string
  description: string | null
  status: string
  pricing_type: string
  base_price: number | null
  price_unit: string | null
  min_capacity: number | null
  max_capacity: number | null
  location_city: string | null
  location_address: string | null
  cancellation_policy: string | null
  confirmation_sla_hours: number
  mogzu_direct_alias: string | null
  listing_kind: string | null
  metadata: Record<string, unknown>
  images: Array<{ id: string; storage_path: string; display_order: number }>
  created_at: string
  updated_at: string
}

export interface MogzuDirectListingInput {
  module?: string
  category_id?: string | null
  title?: string
  description?: string | null
  status?: string
  pricing_type?: string
  base_price?: number | string | null
  price_unit?: string | null
  min_capacity?: number | string | null
  max_capacity?: number | string | null
  location_city?: string | null
  location_address?: string | null
  cancellation_policy?: string | null
  confirmation_sla_hours?: number | string | null
  mogzu_direct_alias?: string | null
  listing_kind?: string | null
  metadata?: Record<string, unknown>
}

export const mogzuDirect = {
  list: async (admin = false) =>
    supabase.rpc('list_mogzu_direct_listings', { p_admin: admin }),

  getById: async (id: string) =>
    supabase.rpc('get_mogzu_direct_listing', { p_id: id }),

  create: async (payload: MogzuDirectListingInput) =>
    supabase.rpc('create_mogzu_direct_listing', { p_payload: payload }),

  update: async (id: string, payload: MogzuDirectListingInput) =>
    supabase.rpc('update_mogzu_direct_listing', { p_id: id, p_payload: payload }),

  setStatus: async (id: string, status: string) =>
    supabase.rpc('set_mogzu_direct_status', { p_id: id, p_status: status }),

  remove: async (id: string) =>
    supabase.rpc('delete_mogzu_direct_listing', { p_id: id }),

  setImages: async (listingId: string, imagePaths: string[]) =>
    supabase.rpc('set_mogzu_direct_images', {
      p_listing_id: listingId,
      p_image_paths: imagePaths,
    }),
}

// ─── Exported db namespace ────────────────────────────────────────────────────

export const db = {
  corporateAccounts,
  userProfiles,
  vendors,
  listings,
  calendar,
  bookings,
  budgets,
  wallet,
  commissions,
  categories,
  celebrations,
  employees,
  giftingRules,
  notifications,
  notificationPreferences,
  payouts,
  refunds,
  roleSwitchEvents,
  supportTickets,
  supportTicketNotes,
  travelPolicies,
  bookingMessages,
  bookingDisputes,
  giftingCampaigns,
  wishlists,
  reviews,
  reviewInvites,
  promotions,
  eventTemplates,
  shortlists,
  heyGenie,
  partners,
  partnerAgreements,
  partnerReferrals,
  partnerWallets,
  partnerListings,
  partnerClients,
  partnerPayouts,
  partnerStatements,
  subUsers,
  userInvites,
  userPermissions,
  userActivity,
  bookingTracker,
  bookingProof,
  quickShares,
  mogzuDirect,
}

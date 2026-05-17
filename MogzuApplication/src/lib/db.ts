// Database service layer — never call supabase.from() directly in components.
// All queries go through these namespaced methods.

import { supabase } from './supabase'
import { CRITICAL_NOTIFICATION_TYPES } from './database.types'
import type {
  Booking,
  BookingAddOn,
  BudgetRule,
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

  create: async (data: Omit<CorporateAccount, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('corporate_accounts').insert(data).select().single(),

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
      .select('*, vendors(*)')
      .eq('status', 'pending_approval')
      .order('created_at'),

  create: async (data: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('listings').insert(data).select().single(),

  update: async (id: string, data: Partial<Listing>) =>
    supabase
      .from('listings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),

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
      .select('*, listings(*), vendors(*), booking_add_ons(*), user_profiles(*)')
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
      .select('*, listings(*), user_profiles(*), corporate_accounts(*)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  listPendingApproval: async (corporateId: string) =>
    supabase
      .from('bookings')
      .select('*, listings(*), user_profiles(*)')
      .eq('corporate_id', corporateId)
      .eq('status', 'pending_approval')
      .order('created_at'),

  create: async (data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('bookings').insert(data).select().single(),

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

    if (booking.payment_status !== 'paid' || !booking.total_amount) {
      // No payout if booking was never paid.
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

  create: async (data: Omit<ListingCategory, 'id' | 'created_at'>) =>
    supabase.from('listing_categories').insert(data).select().single(),

  update: async (id: string, data: Partial<ListingCategory>) =>
    supabase.from('listing_categories').update(data).eq('id', id),

  toggle: async (id: string, isActive: boolean) =>
    supabase.from('listing_categories').update({ is_active: isActive }).eq('id', id),
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
  employees,
  giftingRules,
  notifications,
  notificationPreferences,
  payouts,
  refunds,
  roleSwitchEvents,
  supportTickets,
  supportTicketNotes,
}

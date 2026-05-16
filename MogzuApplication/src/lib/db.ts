// Database service layer — never call supabase.from() directly in components.
// All queries go through these namespaced methods.

import { supabase } from './supabase'
import type {
  Booking,
  BookingAddOn,
  BudgetRule,
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

  addAddOns: async (rows: Omit<BookingAddOn, 'id'>[]) =>
    rows.length === 0
      ? { data: [], error: null }
      : supabase.from('booking_add_ons').insert(rows).select(),
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
}

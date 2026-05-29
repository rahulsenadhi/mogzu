import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type {
  Booking,
  BookingStatus,
  CorporateAccount,
  Listing,
  ModuleId,
  UserProfile,
  Vendor,
} from '@/lib/database.types'

export type AdminBookingRow = Booking & {
  listings: Pick<Listing, 'title' | 'location_address'> | null
  user_profiles: Pick<UserProfile, 'full_name' | 'phone'> | null
  corporate_accounts: Pick<CorporateAccount, 'name'> | null
  vendors: Pick<Vendor, 'business_name'> | null
}

export type AdminBookingDisplay = {
  id: string
  bookingId: string
  title: string
  corporateName: string
  vendorName: string
  userName: string
  amount: number
  status: BookingStatus
  paymentStatus: Booking['payment_status']
  module: ModuleId
  date: string
  isDemo: boolean
}

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function demoRow(
  id: string,
  module: ModuleId,
  status: BookingStatus,
  amount: number,
  daysAgo: number,
  title: string,
  corporate: string,
  vendor: string,
  user: string,
): AdminBookingDisplay {
  return {
    id: id.slice(0, 8).toUpperCase(),
    bookingId: id,
    title,
    corporateName: corporate,
    vendorName: vendor,
    userName: user,
    amount,
    status,
    paymentStatus: status === 'cancelled' ? 'refunded' : 'paid',
    module,
    date: new Date(daysAgoIso(daysAgo)).toLocaleDateString('en-IN'),
    isDemo: true,
  }
}

const DEMO_EVENTS: AdminBookingDisplay[] = [
  demoRow(
    'demo-ev-1',
    'events',
    'confirmed',
    125_000,
    3,
    'Product launch — rooftop venue Bandra',
    'Acme India',
    'Skyline Events',
    'Priya Sharma',
  ),
  demoRow(
    'demo-ev-2',
    'events',
    'pending_vendor',
    67_500,
    8,
    'Sales kickoff — conference hall',
    'Acme India',
    'ConfHub Worli',
    'Arjun Mehta',
  ),
  demoRow(
    'demo-ev-3',
    'events',
    'completed',
    54_200,
    18,
    'Quarterly town hall — auditorium',
    'Nova Tech',
    'Grand Hall Andheri',
    'Neha Kapoor',
  ),
]

const DEMO_DSPACE: AdminBookingDisplay[] = [
  demoRow(
    'demo-sp-1',
    'spacex_coworking',
    'confirmed',
    18_000,
    5,
    'BKC coworking — 6 desks / 2 days',
    'Acme India',
    'WorkLoft BKC',
    'Rohan Iyer',
  ),
  demoRow(
    'demo-sp-2',
    'spacex_stay',
    'confirmed',
    32_400,
    11,
    'Client visit — 2 nights Mumbai hotel',
    'Nova Tech',
    'Hospitality Inn',
    'Sneha Rao',
  ),
  demoRow(
    'demo-sp-3',
    'spacex_coworking',
    'pending_approval',
    9_500,
    2,
    'Powai coworking — 3 desks / 1 day',
    'Acme India',
    'CoSpace Powai',
    'Vikram Singh',
  ),
]

export function demoBookingsForModules(modules: ModuleId[]): AdminBookingDisplay[] {
  const set = new Set(modules)
  const rows: AdminBookingDisplay[] = []
  if (set.has('events')) rows.push(...DEMO_EVENTS)
  if (set.has('spacex_coworking') || set.has('spacex_stay')) rows.push(...DEMO_DSPACE)
  return rows.filter((r) => set.has(r.module))
}

function rowToDisplay(row: AdminBookingRow): AdminBookingDisplay {
  return {
    id: row.id.slice(0, 8).toUpperCase(),
    bookingId: row.id,
    title: row.listings?.title ?? row.purpose_note ?? 'Booking',
    corporateName: row.corporate_accounts?.name ?? '—',
    vendorName: row.vendors?.business_name ?? '—',
    userName: row.user_profiles?.full_name ?? '—',
    amount: row.total_amount ?? 0,
    status: row.status,
    paymentStatus: row.payment_status,
    module: row.module,
    date: new Date(row.created_at).toLocaleDateString('en-IN'),
    isDemo: false,
  }
}

export async function loadAdminModuleBookings(modules: ModuleId[]): Promise<{
  rows: AdminBookingDisplay[]
  usingDemo: boolean
  error: string | null
}> {
  let query = supabase
    .from('bookings')
    .select(
      '*, listings(title, location_address), user_profiles!user_id(full_name, phone), corporate_accounts(name), vendors(business_name)',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (modules.length === 1) {
    query = query.eq('module', modules[0])
  } else {
    query = query.in('module', modules)
  }

  const { data, error } = await query

  if (error) {
    return {
      rows: demoBookingsForModules(modules),
      usingDemo: true,
      error: error.message,
    }
  }

  const live = ((data ?? []) as AdminBookingRow[]).map(rowToDisplay)
  if (live.length === 0) {
    return { rows: demoBookingsForModules(modules), usingDemo: true, error: null }
  }

  return { rows: live, usingDemo: false, error: null }
}

export async function applyAdminBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ error: string | null }> {
  if (status === 'cancelled') {
    const { error } = await db.bookings.cancel(bookingId, 'Cancelled by admin')
    return { error: error?.message ?? null }
  }
  if (status === 'completed') {
    const { error } = await db.bookings.complete(bookingId)
    return { error: error?.message ?? null }
  }
  const { error } = await db.bookings.updateStatus(bookingId, status)
  return { error: error?.message ?? null }
}

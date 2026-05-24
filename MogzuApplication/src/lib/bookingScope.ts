import { db } from './db'
import type { Booking, UserProfile, UserRole } from './database.types'

type BookingScopeRow = Pick<Booking, 'id' | 'corporate_id' | 'user_id' | 'partner_id' | 'status'>

const FIELD_AGENT_ACTIVE_STATUSES: Booking['status'][] = ['pending_vendor', 'confirmed']

export async function canAccessBookingByRole(input: {
  booking: BookingScopeRow
  role: UserRole | null
  profile: UserProfile | null
  requireFieldAgentActive?: boolean
}): Promise<{ ok: boolean; reason: string | null }> {
  const { booking, role, profile, requireFieldAgentActive = false } = input

  if (!profile) {
    return { ok: false, reason: 'Authentication required.' }
  }

  if (role === 'mogzu_admin' || role === 'support') {
    return { ok: true, reason: null }
  }

  if (role === 'field_agent') {
    if (requireFieldAgentActive && !FIELD_AGENT_ACTIVE_STATUSES.includes(booking.status)) {
      return { ok: false, reason: 'Field agents can only access active bookings.' }
    }
    return { ok: true, reason: null }
  }

  if (role === 'account_manager') {
    const { data: assigned } = await db.corporateAccounts.listByAccountManager(profile.id)
    const assignedCorporateIds = new Set((assigned ?? []).map((account) => account.id))
    if (assignedCorporateIds.has(booking.corporate_id)) {
      return { ok: true, reason: null }
    }
    return { ok: false, reason: 'This booking is outside your assigned account scope.' }
  }

  if (role === 'partner') {
    const { data: partner } = await db.partners.getByUserId(profile.id)
    if (!partner?.id || booking.partner_id !== partner.id) {
      return { ok: false, reason: 'This booking is outside your referral/resale scope.' }
    }
    return { ok: true, reason: null }
  }

  if (booking.user_id === profile.id) {
    return { ok: true, reason: null }
  }

  if (profile.corporate_id && booking.corporate_id === profile.corporate_id) {
    return { ok: true, reason: null }
  }

  return { ok: false, reason: 'You do not have access to this booking.' }
}

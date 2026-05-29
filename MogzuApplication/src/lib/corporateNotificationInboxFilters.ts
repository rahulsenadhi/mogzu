import type { NotificationType } from '@/lib/database.types'

export type InboxReadFilter = 'all' | 'unread' | 'read'
export type InboxKindFilter = 'all' | 'action' | 'shared'
export type InboxCategoryFilter =
  | 'all'
  | 'approvals'
  | 'payments'
  | 'bookings'
  | 'gifting'
  | 'system'

export type CorporateInboxNotification = {
  id: string
  title: string
  message: string
  status: 'pending' | 'read'
  type: 'action' | 'shared'
  rawType: NotificationType | null
}

export type CorporateInboxFilters = {
  read: InboxReadFilter
  kind: InboxKindFilter
  category: InboxCategoryFilter
}

export const DEFAULT_CORPORATE_INBOX_FILTERS: CorporateInboxFilters = {
  read: 'all',
  kind: 'all',
  category: 'all',
}

export function hasActiveCorporateInboxFilters(filters: CorporateInboxFilters): boolean {
  return (
    filters.read !== 'all' || filters.kind !== 'all' || filters.category !== 'all'
  )
}

function matchesCategory(n: CorporateInboxNotification, category: InboxCategoryFilter): boolean {
  if (category === 'all') return true
  const title = n.title.toLowerCase()
  const t = n.rawType

  if (category === 'approvals') {
    return (
      t === 'approval_required' ||
      t === 'approval_decided' ||
      t === 'gift_pending_approval' ||
      title.includes('approval')
    )
  }
  if (category === 'payments') {
    return (
      t === 'payment_received' ||
      t === 'payment_failed' ||
      t === 'refund_initiated' ||
      t === 'refund_failed' ||
      title.includes('payment') ||
      title.includes('invoice') ||
      title.includes('refund')
    )
  }
  if (category === 'bookings') {
    return (
      t === 'booking_confirmed' ||
      t === 'booking_cancelled' ||
      t === 'reminder_24h' ||
      title.includes('booking') ||
      title.includes('enquiry')
    )
  }
  if (category === 'gifting') {
    return t === 'gift_received' || t === 'gift_pending_approval' || title.includes('gift')
  }
  if (category === 'system') {
    return t === 'system' || t === 'support_reply'
  }
  return true
}

export function applyCorporateInboxFilters(
  items: CorporateInboxNotification[],
  filters: CorporateInboxFilters,
  searchQuery: string,
): CorporateInboxNotification[] {
  const q = searchQuery.trim().toLowerCase()

  return items.filter((n) => {
    if (filters.read === 'unread' && n.status !== 'pending') return false
    if (filters.read === 'read' && n.status !== 'read') return false
    if (filters.kind !== 'all' && n.type !== filters.kind) return false
    if (!matchesCategory(n, filters.category)) return false
    if (q && !n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) {
      return false
    }
    return true
  })
}

// Realtime service — never call supabase.channel() directly in components.
// All subscriptions go through these helpers.

import { supabase } from './supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

type SubscriptionOptions<T> = {
  table: string
  event?: ChangeEvent
  filter?: string // e.g. "corporate_id=eq.some-uuid"
  onData: (payload: RealtimePostgresChangesPayload<T>) => void
  onError?: (err: Error) => void
}

// Returns an unsubscribe function — call it in useEffect cleanup.
export function subscribeToTable<T extends Record<string, unknown>>(
  channelName: string,
  options: SubscriptionOptions<T>,
): () => void {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: options.event ?? '*',
        schema: 'public',
        table: options.table,
        filter: options.filter,
      },
      (payload) => options.onData(payload as RealtimePostgresChangesPayload<T>),
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' && options.onError) {
        options.onError(new Error(`Realtime channel error on ${channelName}`))
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

// ─── Domain-specific subscriptions ───────────────────────────────────────────

export const realtimeService = {
  // Watch bookings for a corporate account (approval queue, status updates)
  watchCorporateBookings: <T extends Record<string, unknown>>(
    corporateId: string,
    onData: SubscriptionOptions<T>['onData'],
  ) =>
    subscribeToTable<T>(`corporate-bookings-${corporateId}`, {
      table: 'bookings',
      filter: `corporate_id=eq.${corporateId}`,
      onData,
    }),

  // Watch bookings for a vendor (incoming requests)
  watchVendorBookings: <T extends Record<string, unknown>>(
    vendorId: string,
    onData: SubscriptionOptions<T>['onData'],
  ) =>
    subscribeToTable<T>(`vendor-bookings-${vendorId}`, {
      table: 'bookings',
      filter: `vendor_id=eq.${vendorId}`,
      onData,
    }),

  // Watch wallet balance for a corporate account
  watchWallet: <T extends Record<string, unknown>>(
    corporateId: string,
    onData: SubscriptionOptions<T>['onData'],
  ) =>
    subscribeToTable<T>(`wallet-${corporateId}`, {
      table: 'wallets',
      event: 'UPDATE',
      filter: `corporate_id=eq.${corporateId}`,
      onData,
    }),

  // Watch calendar slots for a listing (availability updates)
  watchCalendar: <T extends Record<string, unknown>>(
    listingId: string,
    onData: SubscriptionOptions<T>['onData'],
  ) =>
    subscribeToTable<T>(`calendar-${listingId}`, {
      table: 'calendar_slots',
      filter: `listing_id=eq.${listingId}`,
      onData,
    }),

  // Watch listing_categories so consumer surfaces cascade an admin
  // enable/disable/reorder within seconds instead of waiting for a
  // page refresh. Stage 1 trigger: refetch the category list.
  watchCategories: <T extends Record<string, unknown>>(
    onData: SubscriptionOptions<T>['onData'],
  ) =>
    subscribeToTable<T>('listing-categories', {
      table: 'listing_categories',
      onData,
    }),

  // Watch listings module-scoped (used by Mogzu Direct browse + module
  // tabs to mirror new admin-side activations within seconds).
  watchListings: <T extends Record<string, unknown>>(
    module: string,
    onData: SubscriptionOptions<T>['onData'],
  ) =>
    subscribeToTable<T>(`listings-${module}`, {
      table: 'listings',
      filter: `module=eq.${module}`,
      onData,
    }),
}

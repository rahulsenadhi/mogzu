// Phase 5 Feature 4 — push notification opt-in service.
//
// The actual push fanout is handled by a server worker that reads
// user_profiles.push_subscription. This module just owns the browser
// permission dance + persists the chosen subscription endpoint.

import { supabase } from './supabase'

export type PushOptInState = 'unknown' | 'granted' | 'denied' | 'unsupported'

export function getOptInState(): PushOptInState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return 'unknown'
}

export async function requestPermission(): Promise<PushOptInState> {
  if (getOptInState() === 'unsupported') return 'unsupported'
  const result = await Notification.requestPermission()
  if (result === 'granted') return 'granted'
  if (result === 'denied') return 'denied'
  return 'unknown'
}

type StoredSubscription = {
  endpoint: string | null
  user_agent: string | null
  registered_at: string
}

export async function persistOptIn(
  userId: string,
  payload: PushSubscriptionJSON | null,
): Promise<{ error: string | null }> {
  const subscription: StoredSubscription | null = payload
    ? {
        endpoint: payload.endpoint ?? null,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent : null,
        registered_at: new Date().toISOString(),
      }
    : null
  const { error } = await supabase
    .from('user_profiles')
    .update({
      push_subscription: subscription,
      push_opt_in_at: subscription ? new Date().toISOString() : null,
    })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

export async function persistDecline(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      push_declined_at: new Date().toISOString(),
      push_subscription: null,
    })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

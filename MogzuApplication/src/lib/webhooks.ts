// Phase 4 Feature 4 — webhook endpoints + delivery queue service.
//
// signing_secret is generated client-side and shown once on create.
// The actual delivery worker (Sprint 32) consumes webhook_deliveries.

import { supabase } from './supabase'

export const AVAILABLE_EVENTS = [
  'booking.created',
  'booking.approved',
  'booking.completed',
  'invoice.paid',
  'dispute.opened',
] as const

export type WebhookEvent = (typeof AVAILABLE_EVENTS)[number]

export type WebhookEndpoint = {
  id: string
  corporate_id: string
  url: string
  signing_secret: string
  events: string[]
  is_active: boolean
  last_success_at: string | null
  last_failure_at: string | null
  failure_streak: number
  created_at: string
  updated_at: string
}

export type WebhookDelivery = {
  id: string
  endpoint_id: string
  event_type: string
  payload: Record<string, unknown>
  status: 'pending' | 'delivered' | 'failed' | 'cancelled'
  http_status_code: number | null
  response_body: string | null
  attempts: number
  next_attempt_at: string | null
  delivered_at: string | null
  created_at: string
}

export function generateSigningSecret(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `whsec_${hex}`
}

export async function listEndpoints(
  corporateId?: string,
): Promise<{ data: WebhookEndpoint[]; error: string | null }> {
  let q = supabase
    .from('webhook_endpoints')
    .select('*')
    .order('created_at', { ascending: false })
  if (corporateId) q = q.eq('corporate_id', corporateId)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as WebhookEndpoint[], error: null }
}

export async function createEndpoint(payload: {
  corporate_id: string
  url: string
  events: WebhookEvent[]
}): Promise<{ data: WebhookEndpoint | null; error: string | null }> {
  if (!/^https:\/\//.test(payload.url)) {
    return { data: null, error: 'Webhook URL must use HTTPS' }
  }
  const signing_secret = generateSigningSecret()
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .insert({
      corporate_id: payload.corporate_id,
      url: payload.url,
      events: payload.events,
      signing_secret,
    })
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as WebhookEndpoint, error: null }
}

export async function setEndpointActive(
  id: string,
  isActive: boolean,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('webhook_endpoints')
    .update({ is_active: isActive })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function listRecentDeliveries(
  endpointId: string,
  limit = 50,
): Promise<{ data: WebhookDelivery[]; error: string | null }> {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('endpoint_id', endpointId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as WebhookDelivery[], error: null }
}

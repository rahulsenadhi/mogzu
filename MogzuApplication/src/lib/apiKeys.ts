// Phase 4 Feature 4 — public API key issuance + admin lifecycle.
//
// Key format: `mzk_<32 hex>`. Only a SHA-256 hash of the full key is
// stored in the DB; the plaintext is shown to the admin exactly once
// on creation. key_prefix holds the first 8 chars after the underscore
// so the admin UI can render "mzk_…abc" without the secret.

import { supabase } from './supabase'

export type ApiKey = {
  id: string
  corporate_id: string
  name: string
  key_prefix: string
  key_hash: string
  scopes: string[]
  rate_limit_per_minute: number
  is_active: boolean
  last_used_at: string | null
  created_by: string | null
  created_at: string
  revoked_at: string | null
}

export const AVAILABLE_SCOPES = [
  'read:bookings',
  'write:bookings',
  'read:invoices',
  'read:listings',
  'read:vendors',
] as const

export type ApiKeyScope = (typeof AVAILABLE_SCOPES)[number]

export function generateApiKeySecret(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `mzk_${hex}`
}

export async function hashApiKey(plaintext: string): Promise<string> {
  const enc = new TextEncoder().encode(plaintext)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function prefixForDisplay(plaintext: string): string {
  return plaintext.slice(0, 12)
}

export async function listApiKeys(
  corporateId?: string,
): Promise<{ data: ApiKey[]; error: string | null }> {
  let q = supabase.from('api_keys').select('*').order('created_at', { ascending: false })
  if (corporateId) q = q.eq('corporate_id', corporateId)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as ApiKey[], error: null }
}

export async function createApiKey(payload: {
  corporate_id: string
  name: string
  scopes: ApiKeyScope[]
  rate_limit_per_minute?: number
  created_by?: string | null
}): Promise<{ plaintext: string | null; row: ApiKey | null; error: string | null }> {
  const plaintext = generateApiKeySecret()
  const key_hash = await hashApiKey(plaintext)
  const key_prefix = prefixForDisplay(plaintext)
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      corporate_id: payload.corporate_id,
      name: payload.name,
      key_prefix,
      key_hash,
      scopes: payload.scopes,
      rate_limit_per_minute: payload.rate_limit_per_minute ?? 100,
      created_by: payload.created_by ?? null,
    })
    .select('*')
    .single()
  if (error) return { plaintext: null, row: null, error: error.message }
  return { plaintext, row: data as ApiKey, error: null }
}

export async function revokeApiKey(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq('id', id)
  return { error: error?.message ?? null }
}

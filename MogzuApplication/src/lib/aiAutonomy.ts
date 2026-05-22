// Phase 5 Feature 5 — autonomous AI agent governance.
//
// One row per corporate. L3 admins toggle the autonomy flag and set
// the spend cap + category blocklist. Booking creation reads this row
// when an AI agent attempts an unattended action.

import { supabase } from './supabase'

export type AiAutonomySettings = {
  corporate_id: string
  is_enabled: boolean
  spend_cap_inr: number
  blocked_categories: string[]
  updated_by: string | null
  updated_at: string
}

export async function getSettings(
  corporateId: string,
): Promise<{ data: AiAutonomySettings | null; error: string | null }> {
  const { data, error } = await supabase
    .from('ai_autonomy_settings')
    .select('*')
    .eq('corporate_id', corporateId)
    .maybeSingle()
  if (error) return { data: null, error: error.message }
  return { data: (data ?? null) as AiAutonomySettings | null, error: null }
}

export async function upsertSettings(payload: {
  corporate_id: string
  is_enabled: boolean
  spend_cap_inr: number
  blocked_categories: string[]
  updated_by?: string | null
}): Promise<{ error: string | null }> {
  if (payload.spend_cap_inr < 0) return { error: 'spend_cap_inr must be >= 0' }
  const { error } = await supabase
    .from('ai_autonomy_settings')
    .upsert(payload, { onConflict: 'corporate_id' })
  return { error: error?.message ?? null }
}

export async function listAllSettings(): Promise<{
  data: AiAutonomySettings[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('ai_autonomy_settings')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AiAutonomySettings[], error: null }
}

// Pure policy check used by booking guards. Returns the reason an
// autonomous booking should be blocked, or null when it may proceed.
export function evaluatePolicy(
  settings: AiAutonomySettings | null,
  attempt: { amountInr: number; categorySlug?: string | null },
): string | null {
  if (!settings || !settings.is_enabled) return 'AI autonomy disabled for this corporate'
  if (attempt.amountInr > settings.spend_cap_inr) {
    return `Spend cap exceeded (₹${attempt.amountInr} > ₹${settings.spend_cap_inr})`
  }
  if (attempt.categorySlug && settings.blocked_categories.includes(attempt.categorySlug)) {
    return `Category "${attempt.categorySlug}" is blocked`
  }
  return null
}

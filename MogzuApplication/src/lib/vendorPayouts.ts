// Phase 4 Feature 3 — vendor payout methods + multi-currency settlement.
//
// DB-truth bookkeeping ahead of the Wise / Razorpay-X integration.
// Admins record payout methods per vendor; the booking checkout layer
// stamps settlement_currency + settlement_fx_rate so we can pay
// vendors in their native rail later without re-quoting FX.

import { supabase } from './supabase'

export const PAYOUT_RAILS = [
  'razorpay_x',
  'wise',
  'ach',
  'fast_sg',
  'sepa',
  'manual',
] as const

export type PayoutRail = (typeof PAYOUT_RAILS)[number]

export type VendorPayoutMethod = {
  id: string
  vendor_id: string
  currency: string
  rail: PayoutRail
  account_holder: string
  account_number: string
  routing_info: Record<string, unknown>
  is_primary: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export function maskAccount(acct: string): string {
  if (!acct) return ''
  if (acct.length <= 4) return acct
  return `••••${acct.slice(-4)}`
}

export async function listMethods(
  vendorId?: string,
): Promise<{ data: VendorPayoutMethod[]; error: string | null }> {
  let q = supabase
    .from('vendor_payout_methods')
    .select('*')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })
  if (vendorId) q = q.eq('vendor_id', vendorId)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as VendorPayoutMethod[], error: null }
}

export async function createMethod(payload: {
  vendor_id: string
  currency: string
  rail: PayoutRail
  account_holder: string
  account_number: string
  routing_info?: Record<string, unknown>
  is_primary?: boolean
}): Promise<{ error: string | null }> {
  if (payload.is_primary) {
    await supabase
      .from('vendor_payout_methods')
      .update({ is_primary: false })
      .eq('vendor_id', payload.vendor_id)
  }
  const { error } = await supabase.from('vendor_payout_methods').insert({
    ...payload,
    routing_info: payload.routing_info ?? {},
    is_primary: payload.is_primary ?? false,
  })
  return { error: error?.message ?? null }
}

export async function markVerified(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('vendor_payout_methods')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function setPrimary(
  vendorId: string,
  id: string,
): Promise<{ error: string | null }> {
  await supabase
    .from('vendor_payout_methods')
    .update({ is_primary: false })
    .eq('vendor_id', vendorId)
  const { error } = await supabase
    .from('vendor_payout_methods')
    .update({ is_primary: true })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function removeMethod(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('vendor_payout_methods').delete().eq('id', id)
  return { error: error?.message ?? null }
}

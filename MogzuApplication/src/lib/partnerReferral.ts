// Sprint 19 — Story 14.2
//
// First-touch attribution helper. The shareable partner link
// `/partner-ref/:code` stashes the code in sessionStorage; whoever signs the
// corporate up later (admin today, self-service later) reads it back and calls
// `attachPartnerReferral` to bind the corporate_account to a partner and open
// the 90-day commission window.

import { db } from './db'
import { supabase } from './supabase'

export const PARTNER_REFERRAL_SESSION_KEY = 'mogzu_partner_referral_code'

export function rememberPartnerReferralCode(code: string): void {
  try {
    sessionStorage.setItem(PARTNER_REFERRAL_SESSION_KEY, code)
  } catch {
    // sessionStorage may be unavailable (SSR, private mode); silently skip.
  }
}

export function readPartnerReferralCode(): string | null {
  try {
    return sessionStorage.getItem(PARTNER_REFERRAL_SESSION_KEY)
  } catch {
    return null
  }
}

export function clearPartnerReferralCode(): void {
  try {
    sessionStorage.removeItem(PARTNER_REFERRAL_SESSION_KEY)
  } catch {
    // ignore
  }
}

export type AttachOutcome =
  | { ok: true; partnerId: string; referralId: string }
  | { ok: false; reason: string }

export async function attachPartnerReferral(
  corporateId: string,
  referralCode: string,
): Promise<AttachOutcome> {
  const code = referralCode.trim().toUpperCase()
  if (!code) return { ok: false, reason: 'Empty referral code.' }

  const { data: partner, error: partnerError } = await db.partners.getByReferralCode(code)
  if (partnerError) return { ok: false, reason: partnerError.message }
  if (!partner) return { ok: false, reason: 'Referral code does not match any active partner.' }

  // Bind partner to the corporate account. The `referred_by_partner_id` is
  // a first-touch field — never overwrite if already set.
  const { error: updateError } = await supabase
    .from('corporate_accounts')
    .update({
      referred_by_partner_id: partner.id,
      referred_at: new Date().toISOString(),
    })
    .eq('id', corporateId)
    .is('referred_by_partner_id', null)

  if (updateError) return { ok: false, reason: updateError.message }

  // Insert the lifecycle row. UNIQUE (referred_corporate_id) protects against
  // duplicate captures; treat conflict as success.
  const { data: referral, error: insertError } = await db.partnerReferrals.capture({
    partner_id: partner.id,
    referral_code: code,
    referred_corporate_id: corporateId,
    signed_up_at: new Date().toISOString(),
  })
  if (insertError) {
    // Already attached on a prior signup — treat as no-op success.
    if (insertError.code === '23505') {
      return { ok: true, partnerId: partner.id, referralId: 'existing' }
    }
    return { ok: false, reason: insertError.message }
  }

  return { ok: true, partnerId: partner.id, referralId: referral.id }
}

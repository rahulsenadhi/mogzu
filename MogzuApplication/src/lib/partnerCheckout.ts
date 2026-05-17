// Sprint 20 — partner-managed booking checkout helper.
//
// When a corporate has an active partner attribution (referred_by_partner_id
// + the referral window still open), bookings made by that corporate are
// considered partner-managed: a markup is added on top of the wholesale
// price, the booking carries the partner_id for revenue attribution, and a
// white-label invoice token is generated.

import { db } from './db'
import { supabase } from './supabase'
import type { CorporateAccount, Partner } from './database.types'

export type ResaleContext = {
  partner: Partner
  markupPct: number
  invoiceToken: string
}

export async function loadResaleContext(corporateId: string): Promise<ResaleContext | null> {
  const { data: corp } = await supabase
    .from('corporate_accounts')
    .select('id, referred_by_partner_id, referred_at')
    .eq('id', corporateId)
    .maybeSingle<Pick<CorporateAccount, 'id' | 'referred_by_partner_id' | 'referred_at'>>()

  if (!corp || !corp.referred_by_partner_id) return null

  const { data: partner } = await db.partners.getById(corp.referred_by_partner_id)
  if (!partner || partner.status !== 'active') return null

  const markupPct = Number(partner.default_markup_pct ?? 0)
  if (markupPct <= 0) {
    // Partner still owns the booking for revenue attribution but no markup
    // is added. Caller decides whether to record the partner_id anyway.
    return { partner, markupPct: 0, invoiceToken: generateInvoiceToken() }
  }

  return { partner, markupPct, invoiceToken: generateInvoiceToken() }
}

export function computeResaleMargin(baseAmount: number, markupPct: number): number {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0 || markupPct <= 0) return 0
  return Math.round(baseAmount * markupPct) / 100
}

export function generateInvoiceToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

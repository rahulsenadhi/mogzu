// Plan Batch 3 slice 2 — vendor_availability_rules CRUD.
// Weekly working-hours template per vendor (optionally per-listing).
// Distinct from CalendarSlot.recurrence_rule which captures ad-hoc
// per-slot recurrence; this is a higher-level template.

import { supabase } from './supabase'
import type { VendorAvailabilityRule } from './database.types'

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(':').map((x) => Number(x))
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

export async function listRules(
  vendorId: string,
): Promise<{ data: VendorAvailabilityRule[]; error: string | null }> {
  const { data, error } = await supabase
    .from('vendor_availability_rules')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_minute')
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as VendorAvailabilityRule[], error: null }
}

export type RuleDraft = {
  day_of_week: number
  start_minute: number
  end_minute: number
  listing_id?: string | null
}

export async function createRule(
  vendorId: string,
  draft: RuleDraft,
): Promise<{ error: string | null }> {
  if (draft.start_minute >= draft.end_minute) {
    return { error: 'Start must be before end.' }
  }
  const { error } = await supabase.from('vendor_availability_rules').insert({
    vendor_id: vendorId,
    listing_id: draft.listing_id ?? null,
    day_of_week: draft.day_of_week,
    start_minute: draft.start_minute,
    end_minute: draft.end_minute,
    is_active: true,
  })
  return { error: error?.message ?? null }
}

export async function deleteRule(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('vendor_availability_rules').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// Useful client-side check: given an ISO time + rules, is it inside a working
// window for the given day? Booking submit + calendar block actions can use
// this to warn about clashes.
export function isWithinWorkingHours(
  rules: VendorAvailabilityRule[],
  when: Date,
  listingId: string | null,
): boolean {
  if (!rules.length) return true // no template = always available
  const dow = when.getDay()
  const minute = when.getHours() * 60 + when.getMinutes()
  return rules.some(
    (r) =>
      r.day_of_week === dow &&
      r.start_minute <= minute &&
      r.end_minute > minute &&
      (r.listing_id === null || r.listing_id === listingId),
  )
}

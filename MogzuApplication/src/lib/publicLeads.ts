// Phase 3 Feature 3 — public lead capture service.

import { supabase } from './supabase'

export type BudgetBand = 'lt_50k' | '50k_2L' | '2L_10L' | '10L_50L' | 'gt_50L' | 'unknown'
export type Timeline = 'asap' | 'this_month' | 'this_quarter' | 'this_year' | 'exploring'
export type LeadStatus = 'new' | 'assigned' | 'qualified' | 'converted' | 'spam' | 'closed'

export const BUDGET_BANDS: { value: BudgetBand; label: string }[] = [
  { value: 'lt_50k', label: 'Under ₹50,000' },
  { value: '50k_2L', label: '₹50,000 — ₹2L' },
  { value: '2L_10L', label: '₹2L — ₹10L' },
  { value: '10L_50L', label: '₹10L — ₹50L' },
  { value: 'gt_50L', label: 'Over ₹50L' },
  { value: 'unknown', label: 'Not sure yet' },
]

export const TIMELINES: { value: Timeline; label: string }[] = [
  { value: 'asap', label: 'ASAP' },
  { value: 'this_month', label: 'This month' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'this_year', label: 'This year' },
  { value: 'exploring', label: 'Just exploring' },
]

export type LeadSubmission = {
  listing_id?: string | null
  source_slug?: string | null
  client_name: string
  client_company?: string | null
  client_email: string
  client_phone?: string | null
  requirement_summary?: string | null
  budget_band?: BudgetBand | null
  timeline?: Timeline | null
  honeypot?: string
  turnstile_token?: string | null
  metadata?: Record<string, unknown>
}

export async function submitLead(
  payload: LeadSubmission,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('submit_public_lead', {
    p_payload: {
      ...payload,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    },
  })
  if (error) return { id: null, error: error.message }
  return { id: data as string, error: null }
}

export type PublicLead = {
  id: string
  listing_id: string | null
  source_slug: string | null
  client_name: string
  client_company: string | null
  client_email: string
  client_phone: string | null
  requirement_summary: string | null
  budget_band: BudgetBand | null
  timeline: Timeline | null
  status: LeadStatus
  assigned_agent_id: string | null
  assigned_at: string | null
  created_at: string
  updated_at: string
}

export async function listLeads(
  status?: LeadStatus,
): Promise<{ data: PublicLead[]; error: string | null }> {
  let q = supabase
    .from('public_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as PublicLead[], error: null }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('public_leads').update({ status }).eq('id', id)
  return { error: error?.message ?? null }
}

// Phase 3 Feature 3 — public lead capture service.

import {
  buildStaffLeadSubmission,
  type StaffLeadIntakePayload,
} from '@/lib/leadSources'
import type { UserProfile } from './database.types'
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
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type { StaffLeadIntakePayload }

/** Staff-only intake (phone, referral, partner, etc.) — uses submit_public_lead RPC. */
export async function createStaffLead(
  payload: StaffLeadIntakePayload,
): Promise<{ id: string | null; error: string | null }> {
  const { submission, error } = buildStaffLeadSubmission(payload)
  if (error) return { id: null, error }
  return submitLead(submission)
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

export async function updateLeadMetadata(
  id: string,
  patch: Record<string, unknown>,
): Promise<{ error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from('public_leads')
    .select('metadata')
    .eq('id', id)
    .single()
  if (fetchErr) return { error: fetchErr.message }

  const merged = {
    ...((row?.metadata as Record<string, unknown> | null) ?? {}),
    ...patch,
  }
  const { error } = await supabase.from('public_leads').update({ metadata: merged }).eq('id', id)
  return { error: error?.message ?? null }
}

const LEAD_OWNER_ROLES = ['mogzu_admin', 'account_manager', 'support', 'sales_agent'] as const

export async function listLeadOwners(): Promise<{
  data: UserProfile[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, role, status')
    .in('role', [...LEAD_OWNER_ROLES])
    .eq('status', 'active')
    .order('full_name', { ascending: true })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as UserProfile[], error: null }
}

export async function assignLeadOwner(
  id: string,
  owner: { user_id: string; display_name: string } | null,
  existing?: PublicLead,
): Promise<{ error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from('public_leads')
    .select('metadata, status')
    .eq('id', id)
    .single()
  if (fetchErr) return { error: fetchErr.message }

  const meta = {
    ...((row?.metadata as Record<string, unknown> | null) ?? {}),
    ...((existing?.metadata as Record<string, unknown> | undefined) ?? {}),
  }

  if (owner) {
    meta.owner_user_id = owner.user_id
    meta.owner_display_name = owner.display_name
    meta.owner_assigned_at = new Date().toISOString()
  } else {
    delete meta.owner_user_id
    delete meta.owner_display_name
    delete meta.owner_assigned_at
  }

  const updates: { metadata: Record<string, unknown>; status?: LeadStatus } = { metadata: meta }
  const status = (row?.status as LeadStatus) ?? existing?.status ?? 'new'
  if (owner && status === 'new') updates.status = 'assigned'

  const { error } = await supabase.from('public_leads').update(updates).eq('id', id)
  return { error: error?.message ?? null }
}

export async function markLeadCatalogueSent(
  id: string,
  _existing?: PublicLead,
  quickShareId?: string | null,
): Promise<{ error: string | null }> {
  return updateLeadMetadata(id, {
    quick_share_sent_at: new Date().toISOString(),
    ...(quickShareId ? { quick_share_id: quickShareId } : {}),
  })
}

export async function linkRelatedLead(
  primaryId: string,
  relatedId: string,
  existing?: PublicLead,
): Promise<{ error: string | null }> {
  const current = Array.isArray(existing?.metadata?.linked_lead_ids)
    ? (existing?.metadata?.linked_lead_ids as string[])
    : []
  const ids = [...new Set([...current, relatedId])]
  return updateLeadMetadata(primaryId, {
    linked_lead_ids: ids,
    primary_duplicate_id: relatedId,
  })
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  existing?: PublicLead,
): Promise<{ error: string | null }> {
  const meta = { ...(existing?.metadata ?? {}) }
  const history = Array.isArray(meta.status_history)
    ? [...(meta.status_history as Record<string, unknown>[])]
    : []
  history.push({
    from: existing?.status ?? null,
    to: status,
    at: new Date().toISOString(),
  })
  meta.status_history = history.slice(-30)

  const { error } = await supabase
    .from('public_leads')
    .update({ status, metadata: meta })
    .eq('id', id)
  return { error: error?.message ?? null }
}

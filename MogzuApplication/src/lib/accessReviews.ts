// Phase 5 Feature 6 — SOC2 quarterly access reviews + security
// questionnaires queue.

import { supabase } from './supabase'

export const REVIEW_STATUSES = ['pending', 'in_progress', 'completed', 'skipped'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export type AccessReview = {
  id: string
  scheduled_for: string
  reviewed_by: string | null
  reviewed_at: string | null
  snapshot: unknown[]
  decisions: Record<string, unknown>
  status: ReviewStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type SecurityQuestionnaire = {
  id: string
  requester_email: string
  requester_company: string | null
  source: string | null
  questionnaire_payload: Record<string, unknown>
  status: 'received' | 'auto_filled' | 'admin_review' | 'sent' | 'closed'
  filled_payload: Record<string, unknown> | null
  filled_by: string | null
  filled_at: string | null
  created_at: string
  updated_at: string
}

export async function listReviews(): Promise<{
  data: AccessReview[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('access_reviews')
    .select('*')
    .order('scheduled_for', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AccessReview[], error: null }
}

export async function createReview(
  scheduledFor: string,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('access_reviews')
    .insert({ scheduled_for: scheduledFor })
    .select('id')
    .single()
  if (error) return { id: null, error: error.message }
  return { id: (data as { id: string }).id, error: null }
}

export async function snapshotReview(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('snapshot_access_review', {
    p_review_id: id,
  })
  return { error: error?.message ?? null }
}

export async function completeReview(
  id: string,
  decisions: Record<string, unknown>,
  notes?: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('access_reviews')
    .update({
      decisions,
      notes: notes ?? null,
      status: 'completed',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function listQuestionnaires(): Promise<{
  data: SecurityQuestionnaire[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('security_questionnaires')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as SecurityQuestionnaire[], error: null }
}

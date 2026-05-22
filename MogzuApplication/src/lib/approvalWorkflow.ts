// Approval workflow routing rules (Batch 5, FRONTEND_COMPLETION_PLAN
// §4 row 30). ApprovalWorkflowPage at /settings/workflow persists rows
// here; booking-submit-side can later read these to pick the manager
// approval chain.

import { supabase } from './supabase'
import type { ApprovalWorkflowRule } from './database.types'

export type WorkflowLevel = 'L1' | 'L2' | 'L3'

export async function listRules(
  corporateId: string,
): Promise<{ data: ApprovalWorkflowRule[]; error: string | null }> {
  const { data, error } = await supabase
    .from('approval_workflow_rules')
    .select('*')
    .eq('corporate_id', corporateId)
    .eq('is_active', true)
    .order('display_order')
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as ApprovalWorkflowRule[], error: null }
}

export type RuleDraft = {
  threshold: number
  required_levels: WorkflowLevel[]
  exception_note: string | null
  display_order: number
}

export async function saveRules(
  corporateId: string,
  drafts: RuleDraft[],
): Promise<{ error: string | null }> {
  // Replace strategy: deactivate existing then insert fresh rows. Keeps
  // history (is_active=false rows) without enforcing per-row diff logic.
  const { error: deactivateErr } = await supabase
    .from('approval_workflow_rules')
    .update({ is_active: false })
    .eq('corporate_id', corporateId)
    .eq('is_active', true)
  if (deactivateErr) return { error: deactivateErr.message }

  if (drafts.length === 0) return { error: null }

  const rows = drafts.map((d, i) => ({
    corporate_id: corporateId,
    threshold: d.threshold,
    required_levels: d.required_levels,
    exception_note: d.exception_note,
    display_order: d.display_order ?? i,
    is_active: true,
  }))
  const { error: insertErr } = await supabase
    .from('approval_workflow_rules')
    .insert(rows)
  if (insertErr) return { error: insertErr.message }
  return { error: null }
}

// Resolve which approval levels a booking of `amount` rupees requires
// per the configured rules. Picks the rule with the highest threshold
// that the amount meets/exceeds. Empty rules => no approval required.
export function resolveLevelsForAmount(
  rules: ApprovalWorkflowRule[],
  amount: number,
): WorkflowLevel[] {
  if (!rules.length) return []
  const sorted = [...rules].sort((a, b) => b.threshold - a.threshold)
  const match = sorted.find((r) => amount >= r.threshold)
  return (match?.required_levels ?? []) as WorkflowLevel[]
}

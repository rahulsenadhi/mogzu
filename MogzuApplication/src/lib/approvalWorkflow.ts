// Approval workflow routing rules — `/settings/workflow` persists rows;
// booking submit paths call `evaluateCorporateApproval` to decide
// manager approval + which L1/L2/L3 chain applies.

import { supabase } from './supabase'
import type { ApprovalWorkflowRule, BudgetRule, ModuleId } from './database.types'

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

export function formatWorkflowLevels(levels: WorkflowLevel[]): string {
  if (!levels.length) return 'None'
  return levels.join(' → ')
}

export type ApprovalEvaluation = {
  requiresApproval: boolean
  reason: string
  requiredLevels: WorkflowLevel[]
}

function evaluateBudgetApproval(
  budgets: BudgetRule[],
  module: ModuleId | string | null | undefined,
  totalAmount: number,
): { requiresApproval: boolean; reason: string } {
  const matching = budgets.find((b) => b.module === null || b.module === module)
  if (!matching) {
    return { requiresApproval: false, reason: 'No budget rules configured.' }
  }
  if (!matching.requires_approval) {
    return { requiresApproval: false, reason: 'Budget rule allows direct booking.' }
  }
  if (matching.auto_approve_below != null && totalAmount <= matching.auto_approve_below) {
    return {
      requiresApproval: false,
      reason: `Under budget auto-approve threshold (₹${matching.auto_approve_below.toLocaleString('en-IN')}).`,
    }
  }
  return {
    requiresApproval: true,
    reason: 'Above budget auto-approve threshold — manager approval needed.',
  }
}

/** Combines corporate budget rules with `/settings/workflow` threshold chains. */
export function evaluateCorporateApproval(
  budgets: BudgetRule[],
  workflowRules: ApprovalWorkflowRule[],
  module: ModuleId | string | null | undefined,
  totalAmount: number,
): ApprovalEvaluation {
  const budget = evaluateBudgetApproval(budgets, module, totalAmount)
  const requiredLevels = resolveLevelsForAmount(workflowRules, totalAmount)
  const workflowRequires = requiredLevels.length > 0
  const requiresApproval = budget.requiresApproval || workflowRequires

  const reasons: string[] = []
  if (budget.requiresApproval) reasons.push(budget.reason)
  if (workflowRequires) {
    const sorted = [...workflowRules].sort((a, b) => b.threshold - a.threshold)
    const match = sorted.find((r) => totalAmount >= r.threshold)
    const exc = match?.exception_note ? ` Note: ${match.exception_note}` : ''
    reasons.push(
      `Workflow requires ${formatWorkflowLevels(requiredLevels)} for amounts ≥ ₹${(match?.threshold ?? 0).toLocaleString('en-IN')}.${exc}`,
    )
  }

  if (!requiresApproval) {
    const reason =
      budget.reason === 'No budget rules configured.' && workflowRules.length === 0
        ? 'No budget or workflow rules — goes directly to vendor confirmation.'
        : budget.reason || 'Within configured limits — goes directly to vendor confirmation.'
    return { requiresApproval: false, reason, requiredLevels: [] }
  }

  return {
    requiresApproval: true,
    reason: reasons.join(' '),
    requiredLevels,
  }
}

/** Sample amounts for the workflow settings preview panel. */
export const WORKFLOW_PREVIEW_AMOUNTS = [25_000, 75_000, 250_000] as const

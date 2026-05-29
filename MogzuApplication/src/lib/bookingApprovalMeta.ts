import { db } from '@/lib/db'
import {
  evaluateCorporateApproval,
  formatWorkflowLevels,
  listRules as listWorkflowRules,
  type WorkflowLevel,
} from '@/lib/approvalWorkflow'
import type { BudgetRule, ModuleId } from '@/lib/database.types'

/** Legacy delimiter embedded in purpose_note before dedicated approval columns. */
export const APPROVAL_PURPOSE_NOTE_MARKER = '\n---mogzu-approval---\n'

const MARKER = APPROVAL_PURPOSE_NOTE_MARKER

export type BookingApprovalMeta = {
  requiredLevels: WorkflowLevel[]
  approvedLevels: WorkflowLevel[]
}

export const WORKFLOW_LEVEL_LABELS: Record<WorkflowLevel, string> = {
  L1: 'Manager (L1)',
  L2: 'Dept head (L2)',
  L3: 'Finance (L3)',
}

export function parseBookingApprovalMeta(purposeNote: string | null | undefined): {
  userNote: string
  meta: BookingApprovalMeta | null
} {
  if (!purposeNote) return { userNote: '', meta: null }
  const idx = purposeNote.indexOf(MARKER)
  if (idx === -1) return { userNote: purposeNote.trim(), meta: null }
  const userNote = purposeNote.slice(0, idx).trim()
  try {
    const raw = JSON.parse(purposeNote.slice(idx + MARKER.length)) as BookingApprovalMeta
    if (!Array.isArray(raw.requiredLevels)) return { userNote: purposeNote.trim(), meta: null }
    return {
      userNote,
      meta: {
        requiredLevels: raw.requiredLevels,
        approvedLevels: Array.isArray(raw.approvedLevels) ? raw.approvedLevels : [],
      },
    }
  } catch {
    return { userNote: purposeNote.trim(), meta: null }
  }
}

export function serializePurposeNoteWithMeta(
  userNote: string,
  meta: BookingApprovalMeta,
): string {
  const block = `${MARKER}${JSON.stringify(meta)}`
  return userNote.trim() ? `${userNote.trim()}${block}` : block
}

/** @deprecated Use `buildBookingApprovalFields` — approval chain lives in DB columns only. */
export function buildPurposeNoteWithApproval(
  userNote: string | null | undefined,
  _requiredLevels: WorkflowLevel[],
): string | null {
  const base = userNote?.trim() ?? ''
  return base || null
}

export type BookingApprovalSource = {
  purpose_note?: string | null
  required_approval_levels?: string[] | null
  approved_approval_levels?: string[] | null
}

export type BookingApprovalFields = {
  purpose_note: string | null
  required_approval_levels: WorkflowLevel[]
  approved_approval_levels: WorkflowLevel[]
}

/** Persists approval chain on dedicated columns; purpose_note holds user text only. */
export function buildBookingApprovalFields(
  userNote: string | null | undefined,
  requiredLevels: WorkflowLevel[],
  approvedLevels: WorkflowLevel[] = [],
): BookingApprovalFields {
  const base = userNote?.trim() ?? ''
  return {
    required_approval_levels: requiredLevels,
    approved_approval_levels: approvedLevels,
    purpose_note: base || null,
  }
}

/** Prefer DB columns; fall back to embedded purpose_note JSON for older rows. */
export function getBookingApprovalMeta(booking: BookingApprovalSource): {
  userNote: string
  meta: BookingApprovalMeta | null
} {
  const fromNote = parseBookingApprovalMeta(booking.purpose_note)
  const required = (booking.required_approval_levels ?? []) as WorkflowLevel[]
  if (required.length > 0) {
    return {
      userNote: fromNote.userNote,
      meta: {
        requiredLevels: required,
        approvedLevels: (booking.approved_approval_levels ?? []) as WorkflowLevel[],
      },
    }
  }
  return fromNote
}

export function getNextPendingLevel(meta: BookingApprovalMeta): WorkflowLevel | null {
  for (const level of meta.requiredLevels) {
    if (!meta.approvedLevels.includes(level)) return level
  }
  return null
}

export function isApprovalChainComplete(meta: BookingApprovalMeta): boolean {
  return getNextPendingLevel(meta) === null
}

/** L1 → line manager (L2 role); L2/L3 → L3 admin. */
export function canRoleApproveLevel(role: string, level: WorkflowLevel): boolean {
  if (role === 'mogzu_admin') return true
  if (level === 'L1') return role === 'l2_manager'
  return role === 'l3_admin'
}

export function recordLevelApproval(
  meta: BookingApprovalMeta,
  level: WorkflowLevel,
): BookingApprovalMeta {
  if (meta.approvedLevels.includes(level)) return meta
  return { ...meta, approvedLevels: [...meta.approvedLevels, level] }
}

export function roleForWorkflowLevel(level: WorkflowLevel): 'l2_manager' | 'l3_admin' {
  return level === 'L1' ? 'l2_manager' : 'l3_admin'
}

export async function notifyApproversForLevel(
  corporateId: string,
  level: WorkflowLevel,
  payload: { bookingId: string; title: string; body: string },
): Promise<void> {
  const approverRole = roleForWorkflowLevel(level)
  const { data: approvers } = await db.userProfiles.listByRole(corporateId, approverRole)
  ;(approvers ?? []).forEach((m) => {
    void db.notifications.notify({
      userId: m.id,
      type: 'approval_required',
      title: payload.title,
      body: payload.body,
      linkUrl: `/corporate/approvals/${payload.bookingId}`,
    })
  })
}

export async function notifyFirstApprovers(
  corporateId: string,
  requiredLevels: WorkflowLevel[],
  payload: { bookingId: string; title: string; body: string },
): Promise<void> {
  const first = requiredLevels[0]
  if (!first) {
    const { data: managers } = await db.userProfiles.listByRole(corporateId, 'l2_manager')
    ;(managers ?? []).forEach((m) => {
      void db.notifications.notify({
        userId: m.id,
        type: 'approval_required',
        title: payload.title,
        body: payload.body,
        linkUrl: `/corporate/approvals/${payload.bookingId}`,
      })
    })
    return
  }
  await notifyApproversForLevel(corporateId, first, payload)
}

export function formatChainProgress(meta: BookingApprovalMeta): string {
  const parts = meta.requiredLevels.map((level) => {
    if (meta.approvedLevels.includes(level)) return `${WORKFLOW_LEVEL_LABELS[level]} ✓`
    if (getNextPendingLevel(meta) === level) return `${WORKFLOW_LEVEL_LABELS[level]} (pending)`
    return `${WORKFLOW_LEVEL_LABELS[level]}`
  })
  return parts.join(' → ')
}

export function canUserApproveBooking(
  role: string,
  booking: BookingApprovalSource,
): boolean {
  if (role === 'mogzu_admin') return true
  if (role !== 'l2_manager' && role !== 'l3_admin') return false
  const { meta } = getBookingApprovalMeta(booking)
  const pendingLevel = meta ? getNextPendingLevel(meta) : null
  if (!pendingLevel) return true
  return canRoleApproveLevel(role, pendingLevel)
}

export type ApproveBookingStepResult =
  | { ok: true; kind: 'advanced' | 'final' }
  | { ok: false; error: string; forbidden?: boolean }

/** Records one workflow step, or finalizes to `pending_vendor` when the chain is complete. */
export async function approveBookingStep(input: {
  bookingId: string
  booking: BookingApprovalSource
  corporateId: string
  requesterUserId: string
  totalAmount: number
  listingTitle: string
  approverId: string
  role: string
  approvalComment?: string
}): Promise<ApproveBookingStepResult> {
  const { userNote, meta } = getBookingApprovalMeta(input.booking)
  const pendingLevel = meta ? getNextPendingLevel(meta) : null

  if (meta && pendingLevel) {
    if (!canRoleApproveLevel(input.role, pendingLevel)) {
      return { ok: false, error: 'Your role cannot approve this step.', forbidden: true }
    }

    const updatedMeta = recordLevelApproval(meta, pendingLevel)
    const { error: noteErr } = await db.bookings.updateApprovalProgress(input.bookingId, {
      purpose_note: userNote || null,
      required_approval_levels: updatedMeta.requiredLevels,
      approved_approval_levels: updatedMeta.approvedLevels,
    })
    if (noteErr) return { ok: false, error: noteErr.message }

    if (!isApprovalChainComplete(updatedMeta)) {
      const nextLevel = getNextPendingLevel(updatedMeta)
      if (nextLevel) {
        await notifyApproversForLevel(input.corporateId, nextLevel, {
          bookingId: input.bookingId,
          title: 'Booking needs your approval',
          body: `${input.listingTitle} — ₹${input.totalAmount.toLocaleString('en-IN')} (${formatChainProgress(updatedMeta)}).`,
        })
      }
      return { ok: true, kind: 'advanced' }
    }
  }

  const { error } = await db.bookings.approve(input.bookingId, input.approverId)
  if (error) return { ok: false, error: error.message }

  const commentSuffix = input.approvalComment?.trim()
    ? ` Manager comment: ${input.approvalComment.trim()}`
    : ''
  void db.notifications.notify({
    userId: input.requesterUserId,
    type: 'approval_decided',
    title: 'Your booking was approved',
    body: `${input.listingTitle} — awaiting vendor confirmation.${commentSuffix}`,
    linkUrl: `/bookings/${input.bookingId}`,
  })

  return { ok: true, kind: 'final' }
}

export type BookingApprovalOnCreate = {
  status: 'pending_approval' | 'pending_vendor'
  requiredLevels: WorkflowLevel[]
}

/** Loads workflow rules and decides booking status + approval chain for a new booking. */
export async function resolveBookingApprovalOnCreate(
  corporateId: string,
  module: ModuleId | string,
  totalAmount: number,
): Promise<BookingApprovalOnCreate> {
  const [workflowRes, budgetRes] = await Promise.all([
    listWorkflowRules(corporateId),
    db.budgets.listByCorporate(corporateId),
  ])
  const budgets = (budgetRes.data ?? []) as BudgetRule[]
  const decision = evaluateCorporateApproval(
    budgets,
    workflowRes.data ?? [],
    module,
    totalAmount,
  )
  return {
    status: decision.requiresApproval ? 'pending_approval' : 'pending_vendor',
    requiredLevels: decision.requiredLevels,
  }
}

export { formatWorkflowLevels }

// Corporate L3 admin invites for sub-users (Story 1.2 + Batch 5 carry-over).
// Backed by public.user_invites + user_invites_with_status view.
// 72h expiry default enforced at DB layer; resend_user_invite RPC rotates
// token and refreshes expires_at.

import { supabase } from './supabase'
import type {
  UserInvite,
  UserInviteWithStatus,
  UserRole,
} from './database.types'

function randomToken(): string {
  const arr = new Uint8Array(24)
  // crypto is available in modern browsers and node ≥19; fall back to Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < arr.length; i += 1) arr[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function listInvitesByCorporate(
  corporateId: string,
): Promise<{ data: UserInviteWithStatus[]; error: string | null }> {
  const { data, error } = await supabase
    .from('user_invites_with_status')
    .select('*')
    .eq('corporate_id', corporateId)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as UserInviteWithStatus[], error: null }
}

export type InviteDraft = {
  email: string
  full_name?: string | null
  role: UserRole
  department?: string | null
}

export async function createInvite(
  corporateId: string,
  invitedBy: string,
  draft: InviteDraft,
): Promise<{ data: UserInvite | null; error: string | null }> {
  const row = {
    email: draft.email.trim().toLowerCase(),
    role: draft.role,
    full_name: draft.full_name?.trim() || null,
    department: draft.department?.trim() || null,
    corporate_id: corporateId,
    invited_by: invitedBy,
    token: randomToken(),
    // expires_at uses DB default (72h)
  }
  const { data, error } = await supabase
    .from('user_invites')
    .insert(row)
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as UserInvite, error: null }
}

export type BulkResult = {
  created: number
  skipped: { email: string; reason: string }[]
}

export async function createInvitesBulk(
  corporateId: string,
  invitedBy: string,
  drafts: InviteDraft[],
): Promise<{ result: BulkResult; error: string | null }> {
  if (drafts.length === 0) return { result: { created: 0, skipped: [] }, error: null }
  const seen = new Set<string>()
  const valid: typeof drafts = []
  const skipped: { email: string; reason: string }[] = []
  for (const d of drafts) {
    const email = d.email.trim().toLowerCase()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      skipped.push({ email: d.email, reason: 'invalid email' })
      continue
    }
    if (seen.has(email)) {
      skipped.push({ email: d.email, reason: 'duplicate in upload' })
      continue
    }
    seen.add(email)
    valid.push({ ...d, email })
  }
  if (valid.length === 0) return { result: { created: 0, skipped }, error: null }
  const rows = valid.map((d) => ({
    email: d.email,
    role: d.role,
    full_name: d.full_name?.trim() || null,
    department: d.department?.trim() || null,
    corporate_id: corporateId,
    invited_by: invitedBy,
    token: randomToken(),
  }))
  const { error } = await supabase.from('user_invites').insert(rows)
  if (error) return { result: { created: 0, skipped }, error: error.message }
  return { result: { created: rows.length, skipped }, error: null }
}

export async function resendInvite(
  inviteId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('resend_user_invite', { p_invite_id: inviteId })
  return { error: error?.message ?? null }
}

export async function revokeInvite(
  inviteId: string,
): Promise<{ error: string | null }> {
  // Mark accepted_at = past timestamp + expires_at = past so view shows expired
  // and resend RPC refuses (it checks accepted_at IS NULL).
  // Cleanest: just DELETE, RLS-gated.
  const { error } = await supabase.from('user_invites').delete().eq('id', inviteId)
  return { error: error?.message ?? null }
}

// CSV row parser. Accepts the loose corp HR CSV shape:
// "email,full_name,role,department"
// Header row optional; if first cell looks like an email, no header was sent.
export function parseInviteCsv(text: string): InviteDraft[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) return []
  const looksLikeHeader = !/^[^@\s]+@[^@\s]+\.[^@\s]+/.test(lines[0])
  const rows = looksLikeHeader ? lines.slice(1) : lines
  const out: InviteDraft[] = []
  for (const raw of rows) {
    const cells = raw.split(',').map((c) => c.trim())
    const [email, full_name, roleRaw, department] = cells
    if (!email) continue
    const role: UserRole =
      roleRaw === 'l3_admin' || roleRaw === 'l2_manager' || roleRaw === 'l1_employee'
        ? roleRaw
        : 'l1_employee'
    out.push({
      email,
      full_name: full_name || null,
      role,
      department: department || null,
    })
  }
  return out
}

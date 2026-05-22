// Headless smoke for Batch 8 — approval_workflow_rules table + user_invites
// corporate scoping. Auths as L3 admin and exercises every new path:
//   - approvalWorkflow service: listRules / saveRules round-trip
//   - userInvites service: createInvite -> listInvitesByCorporate (status view)
//     -> resend RPC -> revokeInvite delete
// Reads .env for VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY
const L3_EMAIL = 'l3test@mogzu.com'
const L3_PASSWORD = 'Mogzu@1234'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const results = []
function record(name, ok, note = '') {
  results.push({ name, ok, note })
  console.log(`${ok ? '✅' : '❌'} ${name}${note ? ` — ${note}` : ''}`)
}

// ─── Auth ─────────────────────────────────────────────────────────────────
const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
  email: L3_EMAIL,
  password: L3_PASSWORD,
})
if (authErr || !authData.session) {
  record('auth signIn', false, authErr?.message ?? 'no session')
  process.exit(1)
}
record('auth signIn', true)

const { data: profile, error: profileErr } = await supabase
  .from('user_profiles')
  .select('id, role, corporate_id')
  .eq('id', authData.user.id)
  .single()
if (profileErr || !profile?.corporate_id) {
  record('load profile', false, profileErr?.message ?? 'no corporate_id')
  process.exit(1)
}
record('load profile', true, `role=${profile.role}, corp=${profile.corporate_id.slice(0, 8)}`)

const corporateId = profile.corporate_id
const inviterId = profile.id

// ─── Cleanup any prior smoke rows ─────────────────────────────────────────
await supabase.from('approval_workflow_rules').delete().eq('corporate_id', corporateId)
await supabase.from('user_invites').delete().eq('email', 'smoke+batch8@example.com')

// ─── approval_workflow_rules ──────────────────────────────────────────────
// Mirror what ApprovalWorkflowPage saveRules() does: insert N rows.
const drafts = [
  { threshold: 0, required_levels: ['L1'], exception_note: null, display_order: 0 },
  { threshold: 50000, required_levels: ['L1', 'L2'], exception_note: null, display_order: 1 },
  {
    threshold: 200000,
    required_levels: ['L1', 'L2', 'L3'],
    exception_note: 'Smoke exception',
    display_order: 2,
  },
]
const { error: insertErr } = await supabase
  .from('approval_workflow_rules')
  .insert(drafts.map((d) => ({ corporate_id: corporateId, is_active: true, ...d })))
record('insert approval rules x3', !insertErr, insertErr?.message ?? '')

const { data: listed, error: listErr } = await supabase
  .from('approval_workflow_rules')
  .select('*')
  .eq('corporate_id', corporateId)
  .eq('is_active', true)
  .order('display_order')
record(
  'list approval rules (RLS read)',
  !listErr && listed?.length === 3,
  listErr?.message ?? `count=${listed?.length}`,
)

// Update path — touch updated_at via trigger
const targetId = listed?.[2]?.id
const { data: updated, error: updateErr } = await supabase
  .from('approval_workflow_rules')
  .update({ exception_note: 'Smoke updated' })
  .eq('id', targetId)
  .select('updated_at, created_at, exception_note')
  .single()
record(
  'update rule (trigger touches updated_at)',
  !updateErr && updated?.exception_note === 'Smoke updated' && updated.updated_at >= updated.created_at,
  updateErr?.message ?? '',
)

// resolveLevelsForAmount equivalent: pick highest-threshold rule the amount meets
function resolveLevelsForAmount(rules, amount) {
  if (!rules.length) return []
  const sorted = [...rules].sort((a, b) => b.threshold - a.threshold)
  const match = sorted.find((r) => amount >= r.threshold)
  return match?.required_levels ?? []
}
const lvls75k = resolveLevelsForAmount(listed ?? [], 75_000)
record(
  'resolveLevelsForAmount(75k) → L1+L2',
  JSON.stringify(lvls75k) === JSON.stringify(['L1', 'L2']),
  JSON.stringify(lvls75k),
)
const lvls250k = resolveLevelsForAmount(listed ?? [], 250_000)
record(
  'resolveLevelsForAmount(250k) → L1+L2+L3',
  JSON.stringify(lvls250k) === JSON.stringify(['L1', 'L2', 'L3']),
  JSON.stringify(lvls250k),
)

// Cleanup
await supabase.from('approval_workflow_rules').delete().eq('corporate_id', corporateId)

// ─── user_invites ────────────────────────────────────────────────────────
const token = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
  b.toString(16).padStart(2, '0'),
).join('')
const { data: invite, error: createInviteErr } = await supabase
  .from('user_invites')
  .insert({
    email: 'smoke+batch8@example.com',
    role: 'l1_employee',
    full_name: 'Smoke Batch8',
    department: 'QA',
    corporate_id: corporateId,
    invited_by: inviterId,
    token,
  })
  .select('id, expires_at, created_at')
  .single()
record('create invite', !createInviteErr && !!invite?.id, createInviteErr?.message ?? '')

// 72h default: expires_at - created_at ≈ 72h ± a few seconds
if (invite) {
  const deltaHours =
    (new Date(invite.expires_at).getTime() - new Date(invite.created_at).getTime()) / 36e5
  record(
    '72h default expiry',
    deltaHours > 71.9 && deltaHours < 72.1,
    `Δ=${deltaHours.toFixed(2)}h`,
  )
}

// View returns status='pending'
const { data: pendingRow, error: viewErr } = await supabase
  .from('user_invites_with_status')
  .select('*')
  .eq('id', invite.id)
  .single()
record(
  'view status=pending',
  !viewErr && pendingRow?.status === 'pending',
  viewErr?.message ?? `status=${pendingRow?.status}`,
)

// Resend RPC
const oldExpires = invite.expires_at
await new Promise((r) => setTimeout(r, 1100)) // ensure ≥1s elapsed
const { error: resendErr } = await supabase.rpc('resend_user_invite', {
  p_invite_id: invite.id,
})
record('resend_user_invite RPC', !resendErr, resendErr?.message ?? '')

const { data: afterResend } = await supabase
  .from('user_invites')
  .select('expires_at, token')
  .eq('id', invite.id)
  .single()
record(
  'resend refreshes expires_at + rotates token',
  afterResend && afterResend.token !== token && new Date(afterResend.expires_at) > new Date(oldExpires),
  `tokenChanged=${afterResend?.token !== token}, expiresLater=${new Date(afterResend?.expires_at ?? 0) > new Date(oldExpires)}`,
)

// listInvitesByCorporate equivalent
const { data: listInvites, error: listInvitesErr } = await supabase
  .from('user_invites_with_status')
  .select('*')
  .eq('corporate_id', corporateId)
record(
  'list invites by corporate (RLS read)',
  !listInvitesErr && (listInvites ?? []).some((i) => i.id === invite.id),
  listInvitesErr?.message ?? `count=${listInvites?.length}`,
)

// Revoke = delete
const { error: deleteErr } = await supabase.from('user_invites').delete().eq('id', invite.id)
record('revoke invite (delete)', !deleteErr, deleteErr?.message ?? '')

const { data: afterDelete } = await supabase
  .from('user_invites_with_status')
  .select('id')
  .eq('id', invite.id)
record('view confirms invite gone', (afterDelete ?? []).length === 0)

// ─── Negative cases ──────────────────────────────────────────────────────
// L3 cannot insert rules for a different corporate (RLS WITH CHECK should reject)
const FAKE_CORP = '00000000-0000-0000-0000-000000000000'
const { error: rlsViolation } = await supabase
  .from('approval_workflow_rules')
  .insert({
    corporate_id: FAKE_CORP,
    threshold: 0,
    required_levels: ['L1'],
    is_active: true,
  })
record(
  'RLS blocks cross-corp insert',
  rlsViolation !== null,
  rlsViolation?.code ?? rlsViolation?.message ?? 'unexpected success',
)

// ─── Summary ─────────────────────────────────────────────────────────────
await supabase.auth.signOut()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) {
  console.log('FAILED:')
  for (const f of failed) console.log(`  ${f.name} — ${f.note}`)
  process.exit(1)
}
process.exit(0)

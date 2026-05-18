// RLS smoke test — assert anon Supabase client cannot read sensitive
// tables. Run from MogzuApplication/.
//
//   node scripts/rls-smoke-test.mjs
//
// Env:
//   SUPABASE_URL       — project URL (or VITE_SUPABASE_URL)
//   SUPABASE_ANON_KEY  — anon key   (or VITE_SUPABASE_ANON_KEY)
//
// Exits 0 if all assertions pass, 1 on any failure. Safe to run against
// production (anon reads only; no writes).

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // In CI, the secrets may not be configured for fork PRs. Exit 0 with
  // a clear note so the job is green rather than blocking the PR.
  console.log('SUPABASE_URL + SUPABASE_ANON_KEY not set — RLS smoke test skipped.')
  process.exit(0)
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Tables that MUST be invisible to anonymous clients. RLS should either
// deny access (error) or return zero rows.
const DENY_ANON = [
  'corporate_accounts',
  'user_profiles',
  'bookings',
  'booking_add_ons',
  'booking_status_events',
  'booking_proof_records',
  'booking_payment_milestones',
  'booking_messages',
  'booking_disputes',
  'wallets',
  'wallet_transactions',
  'commissions',
  'payouts',
  'refunds',
  'employees',
  'role_switch_events',
  'support_tickets',
  'support_ticket_notes',
  'celebration_events',
  'gifting_rules',
  'gifting_campaigns',
  'notifications',
  'notification_preferences',
  'wishlists',
  'reviews',
  'review_invites',
  'travel_policies',
  'user_permissions',
  'user_activity_events',
  'user_invites',
  'partners',
  'partner_agreements',
  'partner_referrals',
  'partner_wallets',
  'partner_wallet_transactions',
  'partner_payout_periods',
  'shortlists',
  'shortlist_items',
  'heygenie_config',
  'heygenie_sessions',
  'quick_shares',
  'quick_share_items',
  'quick_share_submissions',
  'cms_blocks',
  'ai_agents',
  'ai_agent_kb_entries',
  'ai_agent_conversations',
  'ai_agent_messages',
  'gifting_branding_uploads',
  'gifting_branding_selections',
]

// Tables / views that SHOULD be readable by anon (catalogue + public CMS).
const ALLOW_ANON = ['listing_categories', 'cms_featured_listings', 'cms_blocks_live']

let failures = 0
let passes = 0
let missing = 0

function isMissingTableError(message) {
  const m = message.toLowerCase()
  return (
    m.includes('schema cache') ||
    m.includes('relation') && m.includes('does not exist') ||
    (m.includes('could not find') && m.includes('table'))
  )
}

async function checkDeny(table) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  if (error) {
    if (isMissingTableError(error.message)) {
      // Table absent from this environment — can't leak data that
      // doesn't exist. Warn but don't fail; flags deployment drift.
      console.log(`  ⚠️  deny  ${table} — not deployed (skipped)`)
      missing += 1
      return
    }
    const msg = error.message.toLowerCase()
    if (msg.includes('permission') || msg.includes('rls') || msg.includes('policy')) {
      console.log(`  ✅ deny  ${table} — RLS denied`)
      passes += 1
      return
    }
    console.log(`  ❌ deny  ${table} — unexpected error: ${error.message}`)
    failures += 1
    return
  }
  if (Array.isArray(data) && data.length === 0) {
    console.log(`  ✅ deny  ${table} — empty result (RLS filtered)`)
    passes += 1
    return
  }
  console.log(`  ❌ deny  ${table} — leaked ${data?.length ?? '?'} row(s) to anon`)
  failures += 1
}

async function checkAllow(table) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  if (error) {
    if (isMissingTableError(error.message)) {
      console.log(`  ⚠️  allow ${table} — not deployed (skipped)`)
      missing += 1
      return
    }
    console.log(`  ❌ allow ${table} — anon read failed: ${error.message}`)
    failures += 1
    return
  }
  console.log(`  ✅ allow ${table} — anon read ok (${data?.length ?? 0} row sampled)`)
  passes += 1
}

console.log(`RLS smoke test against ${url}`)
console.log(`  ${DENY_ANON.length} tables expected to deny anon`)
console.log(`  ${ALLOW_ANON.length} tables expected to allow anon`)
console.log('')

console.log('Deny-list:')
for (const table of DENY_ANON) {
  await checkDeny(table)
}

console.log('')
console.log('Allow-list:')
for (const table of ALLOW_ANON) {
  await checkAllow(table)
}

console.log('')
console.log(`Results: ${passes} pass / ${failures} fail / ${missing} not deployed`)
if (missing > 0) {
  console.log(
    `Note: ${missing} table(s) missing from this Supabase project. ` +
      `Run migrations (supabase/migrations/*.sql) before treating this run as authoritative.`,
  )
}
if (failures > 0) {
  console.error('RLS smoke test FAILED.')
  process.exit(1)
}
console.log('RLS smoke test PASSED.')

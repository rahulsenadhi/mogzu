// Headless smoke for Batch 10 — buffer_minutes column + vendor_availability_rules.
// Read-only checks against the live schema using L3 admin (which is NOT a
// vendor — only `authenticated read` policy applies). Vendor manages-own
// path is exercised separately via the UI smoke when a vendor account exists.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)
const supa = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const results = []
function record(name, ok, note = '') {
  results.push({ name, ok, note })
  console.log(`${ok ? '✅' : '❌'} ${name}${note ? ` — ${note}` : ''}`)
}

await supa.auth.signInWithPassword({ email: 'l3test@mogzu.com', password: 'Mogzu@1234' })

// buffer_minutes column visible in listings SELECT
const { data: listingsSample, error: listErr } = await supa
  .from('listings')
  .select('id, title, buffer_minutes')
  .limit(1)
record(
  'listings.buffer_minutes selectable',
  !listErr,
  listErr?.message ?? `sample=${listingsSample?.[0]?.buffer_minutes ?? '—'}`,
)

// vendor_availability_rules view via authenticated SELECT (empty fine)
const { data: rulesRead, error: rulesErr } = await supa
  .from('vendor_availability_rules')
  .select('id')
  .limit(1)
record(
  'vendor_availability_rules SELECT works',
  !rulesErr,
  rulesErr?.message ?? `count=${rulesRead?.length}`,
)

// L3 (non-vendor) insert MUST fail RLS
const FAKE_VENDOR = '00000000-0000-0000-0000-000000000000'
const { error: rlsErr } = await supa
  .from('vendor_availability_rules')
  .insert({
    vendor_id: FAKE_VENDOR,
    day_of_week: 1,
    start_minute: 540,
    end_minute: 1080,
    is_active: true,
  })
record(
  'RLS blocks non-vendor insert',
  rlsErr !== null,
  rlsErr?.code ?? rlsErr?.message ?? 'unexpected success',
)

// CHECK constraint guard: start < end at type level (cannot exercise without
// passing RLS) — covered via UI smoke when vendor account exists.

await supa.auth.signOut()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) {
  console.log('FAILED:')
  for (const f of failed) console.log(`  ${f.name} — ${f.note}`)
  process.exit(1)
}
process.exit(0)

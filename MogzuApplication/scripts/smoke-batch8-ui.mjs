// Headless UI smoke for Batch 8 — Playwright walkthrough of:
//   1. /settings/workflow → editor loads, threshold editable, Save persists, reload preserves
//   2. /user-management → Invites panel renders, header shows pending count
//
// Requires dev server running on http://localhost:5173 (or BASE override).
// Run:  node scripts/smoke-batch8-ui.mjs

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:5173'
const L3_EMAIL = 'l3test@mogzu.com'
const L3_PASSWORD = 'Mogzu@1234'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)
const supa = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const results = []
function record(name, ok, note = '') {
  results.push({ name, ok, note })
  console.log(`${ok ? '✅' : '❌'} ${name}${note ? ` — ${note}` : ''}`)
}

// Cleanup any leftover smoke rows before run
{
  const { data: auth } = await supa.auth.signInWithPassword({ email: L3_EMAIL, password: L3_PASSWORD })
  const { data: profile } = await supa
    .from('user_profiles')
    .select('corporate_id')
    .eq('id', auth.user.id)
    .single()
  if (profile?.corporate_id) {
    await supa.from('approval_workflow_rules').delete().eq('corporate_id', profile.corporate_id)
    await supa.from('user_invites').delete().eq('email', 'smoke+batch8ui@example.com')
  }
  await supa.auth.signOut()
}

const browser = await chromium.launch({ headless: true })
const errors = []
function attach(page, label) {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`))
  page.on('response', async (r) => {
    if (r.status() >= 400 && r.url().includes('supabase')) {
      let body = ''
      try { body = (await r.text()).slice(0, 200) } catch {}
      // Some 401s on getSession are expected pre-auth; filter on POST/PATCH/DELETE
      const m = r.request().method()
      if (m !== 'GET' || r.status() >= 500) {
        errors.push(`[${label}] HTTP ${r.status()} ${m} ${r.url()} body=${body}`)
      }
    }
  })
}

try {
  const ctx = await browser.newContext()
  await ctx.addInitScript(() => {
    try { localStorage.setItem('mogzu_corporate_onboarding_complete', 'true') } catch {}
  })
  const page = await ctx.newPage()
  attach(page, 'main')

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').first().fill(L3_EMAIL)
  await page.locator('input[type="password"]').first().fill(L3_PASSWORD)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(/\/(dashboard|welcome|signup|onboarding)/, { timeout: 15_000 })
  if (page.url().includes('/signup/corporate')) {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  }
  record('login', true, page.url())

  // ─── /settings/workflow ─────────────────────────────────────────────────
  await page.goto(`${BASE}/settings/workflow`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const heading = await page.getByRole('heading', { name: /Approval Workflow Config/i }).count()
  record('workflow page heading', heading > 0)

  // Should show 3 default rules (DEFAULT_RULES fallback since pre-cleanup empties table)
  const ruleBlocks = await page.locator('text=/^Rule \\d+$/').count()
  record('workflow default rules rendered', ruleBlocks === 3, `count=${ruleBlocks}`)

  // Threshold inputs editable (not readOnly)
  const firstThresholdInput = page.locator('input[type="number"]').first()
  const isReadOnly = await firstThresholdInput.evaluate((el) => el.readOnly)
  record('threshold input editable', !isReadOnly)

  // Bump first threshold to 12345, click Save, reload, verify persisted
  await firstThresholdInput.fill('12345')
  await page.getByRole('button', { name: /Save workflow/i }).click()
  await page.waitForTimeout(1500)
  const saveBanner = await page.getByText(/Workflow saved/i).count()
  record('save banner shown', saveBanner > 0)

  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const reloadedThresholdVal = await page.locator('input[type="number"]').first().inputValue()
  record(
    'threshold persists after reload',
    reloadedThresholdVal === '12345',
    `got=${reloadedThresholdVal}`,
  )

  // Verify against DB
  {
    const { data: auth } = await supa.auth.signInWithPassword({ email: L3_EMAIL, password: L3_PASSWORD })
    const { data: profile } = await supa
      .from('user_profiles').select('corporate_id').eq('id', auth.user.id).single()
    const { data: rules } = await supa
      .from('approval_workflow_rules')
      .select('threshold, display_order')
      .eq('corporate_id', profile.corporate_id)
      .eq('is_active', true)
      .order('display_order')
    record(
      'DB has saved rules',
      rules?.length === 3 && Number(rules[0].threshold) === 12345,
      `count=${rules?.length}, first=${rules?.[0]?.threshold}`,
    )
    await supa.auth.signOut()
  }

  // ─── /user-management ──────────────────────────────────────────────────
  await page.goto(`${BASE}/user-management`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const um = await page.getByRole('heading', { name: /User Management/i }).count()
  record('user-mgmt page heading', um > 0)

  // Invites panel header
  const invitesPanel = await page.getByRole('heading', { name: /^Invites$/ }).count()
  record('Invites panel mounted', invitesPanel > 0)

  // Seed an invite directly via Supabase + reload, expect row in panel
  {
    const { data: auth } = await supa.auth.signInWithPassword({ email: L3_EMAIL, password: L3_PASSWORD })
    const { data: profile } = await supa
      .from('user_profiles').select('corporate_id').eq('id', auth.user.id).single()
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
      b.toString(16).padStart(2, '0')).join('')
    await supa.from('user_invites').insert({
      email: 'smoke+batch8ui@example.com',
      role: 'l1_employee',
      full_name: 'Smoke UI',
      department: 'QA',
      corporate_id: profile.corporate_id,
      invited_by: auth.user.id,
      token,
    })
    await supa.auth.signOut()
  }
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const inviteRow = await page.getByText('smoke+batch8ui@example.com').count()
  record('seeded invite row visible', inviteRow > 0)

  const pendingPill = await page.locator('text=/^pending$/i').count()
  record('pending status pill rendered', pendingPill > 0)

  const resendBtn = await page.getByRole('button', { name: /^Resend$/ }).count()
  record('Resend button rendered', resendBtn > 0)
  const revokeBtn = await page.getByRole('button', { name: /^Revoke$/ }).count()
  record('Revoke button rendered', revokeBtn > 0)

  // Click Revoke → invite disappears
  await page.getByRole('button', { name: /^Revoke$/ }).first().click()
  await page.waitForTimeout(1500)
  const inviteGone = await page.getByText('smoke+batch8ui@example.com').count()
  record('Revoke removes row', inviteGone === 0)

  // Cleanup DB rules
  {
    const { data: auth } = await supa.auth.signInWithPassword({ email: L3_EMAIL, password: L3_PASSWORD })
    const { data: profile } = await supa
      .from('user_profiles').select('corporate_id').eq('id', auth.user.id).single()
    await supa.from('approval_workflow_rules').delete().eq('corporate_id', profile.corporate_id)
    await supa.auth.signOut()
  }

  await ctx.close()
} finally {
  await browser.close()
}

// Console errors as soft signal (don't fail run on every flicker)
if (errors.length > 0) {
  console.log('\n--- console / network noise (non-blocking) ---')
  for (const e of errors.slice(0, 10)) console.log(`  ${e}`)
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) {
  console.log('FAILED:')
  for (const f of failed) console.log(`  ${f.name} — ${f.note}`)
  process.exit(1)
}
process.exit(0)

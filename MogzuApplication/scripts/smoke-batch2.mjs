// Headless smoke for Batch 2 + 2b — v2 (auth-first then test gated routes).

import { chromium } from 'playwright'

const BASE = 'http://localhost:5182'
const L3_EMAIL = 'l3test@mogzu.com'
const L3_PASSWORD = 'Mogzu@1234'

const results = []
function record(name, ok, note) {
  results.push({ name, ok, note })
  console.log(`${ok ? '✅ PASS' : '❌ FAIL'} ${name}${note ? ` — ${note}` : ''}`)
}

const browser = await chromium.launch({ headless: true })

function attach(page, label, errors) {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`))
  page.on('requestfailed', (r) => {
    const reason = r.failure()?.errorText ?? ''
    if (!reason.includes('ERR_ABORTED')) {
      errors.push(`[${label}] requestfailed: ${r.url()} — ${reason}`)
    }
  })
  page.on('response', async (r) => {
    if (r.status() >= 400 && r.url().includes('supabase')) {
      let body = ''
      try { body = (await r.text()).slice(0, 200) } catch {}
      errors.push(`[${label}] HTTP ${r.status()} ${r.url()} body=${body}`)
    }
  })
}

try {
  // ─── TEST A — anon /explore/events ──────────────────────────────────────────
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const errs = []
    attach(page, 'A', errs)
    await page.goto(`${BASE}/explore/events`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    const hearts = await page.locator('button[aria-label*="wishlist" i]').count()
    if (errs.length > 0) record('A: anon explore/events', false, errs.join(' | '))
    else if (hearts > 0) record('A: anon explore/events', false, `${hearts} hearts visible (expected 0 anon)`)
    else record('A: anon explore/events', true, 'no console errors, no heart buttons')
    await ctx.close()
  }

  // ─── Authed session for B/D/E ──────────────────────────────────────────────
  // NOTE: pre-set onboarding-complete flag to bypass the (buggy) localStorage-
  // only onboarding check in src/app/lib/corporateOnboarding.ts. Real fix
  // tracked in FIXES.md OPEN BUGS.
  const ctx = await browser.newContext()
  await ctx.addInitScript(() => {
    try { localStorage.setItem('mogzu_corporate_onboarding_complete', 'true') } catch {}
  })
  const page = await ctx.newPage()
  const loginErrs = []
  attach(page, 'login', loginErrs)

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.locator('input[type="email"]').first().fill(L3_EMAIL)
  await page.locator('input[type="password"]').first().fill(L3_PASSWORD)
  await page.locator('button[type="submit"]').first().click()

  try {
    await page.waitForURL(/\/(dashboard|welcome|signup|onboarding)/, { timeout: 15_000 })
    record('B: login submit', true, `landed on ${page.url()}`)
  } catch {
    record('B: login submit', false, `still at ${page.url()}; errs: ${loginErrs.join(' | ')}`)
    await ctx.close()
    throw new Error('Auth flow blocked — skipping authed tests')
  }

  // Force into app even if redirected to onboarding flow
  if (page.url().includes('/signup/corporate')) {
    console.log('  [auth] L3 routed to onboarding; forcing /dashboard…')
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
  }

  // ─── TEST B-explore — authed /explore/events heart visible ─────────────────
  {
    const errs = []
    attach(page, 'B-explore', errs)
    await page.goto(`${BASE}/explore/events`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const hearts = await page.locator('button[aria-label*="wishlist" i]').count()
    const cards = await page.locator('li').count()
    if (errs.length > 0) record('B-explore: authed', false, errs.join(' | '))
    else if (cards === 0) record('B-explore: authed', false, 'no cards rendered — listings table likely empty')
    else if (hearts === 0) record('B-explore: authed', false, `${cards} cards but 0 hearts visible — auth may not have hydrated`)
    else record('B-explore: authed', true, `${hearts} heart button(s) on ${cards} cards`)
  }

  // ─── TEST D — authed /event-activity/9001 reviews panel ─────────────────────
  {
    const errs = []
    attach(page, 'D', errs)
    await page.goto(`${BASE}/event-activity/9001`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const reviewsH = await page.getByRole('heading', { name: 'Reviews', exact: true }).count()
    const emptyText = await page.getByText('No reviews yet', { exact: false }).count()
    const url = page.url()
    if (errs.length > 0) record('D: event-activity/9001', false, errs.join(' | '))
    else if (!url.includes('/event-activity/9001'))
      record('D: event-activity/9001', false, `redirected to ${url}`)
    else if (reviewsH === 0) record('D: event-activity/9001', false, `Reviews heading not found at ${url}`)
    else if (emptyText === 0) record('D: event-activity/9001', false, 'Reviews heading present but no "No reviews yet" empty state')
    else record('D: event-activity/9001', true, 'Reviews heading + empty state rendered')
  }

  // ─── TEST E — authed /dspace/spaces/<some-id> reviews tab ──────────────────
  {
    const errs = []
    attach(page, 'E', errs)
    await page.goto(`${BASE}/dspace/spaces/1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    // Click Reviews tab
    const tabBtn = page.getByRole('button', { name: 'Reviews', exact: true }).or(
      page.locator('button:has-text("Reviews")').first(),
    )
    try {
      await tabBtn.first().click({ timeout: 5_000 })
      await page.waitForTimeout(800)
      const emptyText = await page.getByText('No reviews yet', { exact: false }).count()
      if (errs.length > 0) record('E: dspace reviews tab', false, errs.join(' | '))
      else if (emptyText === 0) record('E: dspace reviews tab', false, 'Reviews tab clicked but empty state not visible')
      else record('E: dspace reviews tab', true, 'Reviews tab renders empty state')
    } catch (e) {
      record('E: dspace reviews tab', false, `couldn't find/click Reviews tab — ${e.message}`)
    }
  }

  await ctx.close()
} finally {
  console.log('\n─── SUMMARY ─────────────────────────────────────')
  const pass = results.filter((r) => r.ok).length
  console.log(`${pass} pass / ${results.length - pass} fail (${results.length} total)`)
  await browser.close()
}

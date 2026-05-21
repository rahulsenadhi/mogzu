// Capture pages user reported broken.
import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'

const BASE = 'http://localhost:5182'
const L3_EMAIL = 'l3test@mogzu.com'
const L3_PASSWORD = 'Mogzu@1234'

await mkdir('smoke-shots', { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => {
  try { localStorage.setItem('mogzu_corporate_onboarding_complete', 'true') } catch {}
})
const page = await ctx.newPage()

const errs = []
page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text().slice(0,300)}`) })

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill(L3_EMAIL)
await page.locator('input[type="password"]').first().fill(L3_PASSWORD)
await page.locator('button[type="submit"]').first().click()
await page.waitForURL(/\/(dashboard|signup)/, { timeout: 15000 })
console.log(`Auth landed: ${page.url()}`)

const targets = [
  ['events-home', '/events'],
  ['events-new', '/events/new'],
  ['events-classic', '/events/classic'],
  ['gifting-home', '/gifting'],
  ['gifting-shop', '/shop'],
  ['dspace-home', '/dspace'],
  ['dspace-meetings', '/dspace/meetings'],
  ['event-activity-list', '/event-activity'],
  ['event-activity-detail', '/event-activity/9001'],
]

for (const [name, url] of targets) {
  errs.length = 0
  try {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `smoke-shots/${name}.png`, fullPage: true })
    const cardCount = await page.locator('li, [role="button"]').count()
    const pricingTypeMentions = await page.getByText(/Transparent|Offer Price|Request for Price/).count()
    const enquireNow = await page.getByRole('button', { name: /enquire/i }).count()
    console.log(`${name.padEnd(24)} | url=${page.url().padEnd(45)} | cards=${cardCount} pricing-badges=${pricingTypeMentions} enquire-btns=${enquireNow} errs=${errs.length}`)
    if (errs.length > 0) console.log('  ! ' + errs.slice(0, 3).join(' | '))
  } catch (e) {
    console.log(`${name} | ERROR: ${e.message}`)
  }
}

await browser.close()

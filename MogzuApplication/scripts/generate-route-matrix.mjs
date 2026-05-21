import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const routesPath = path.join(__dirname, '../src/app/routes.tsx')
const outPath = path.join(__dirname, '../docs/frontend-route-matrix.md')
const src = fs.readFileSync(routesPath, 'utf8')

const pathRe = /path:\s*["']([^"']+)["']/g
const paths = []
let m
while ((m = pathRe.exec(src))) paths.push(m[1])

const duplicates = paths.filter((p, i) => paths.indexOf(p) !== i)
const uniqueDupes = [...new Set(duplicates)]

function classify(p) {
  if (p === '*') return { persona: 'system', guard: 'none', prd: '—', status: 'shell-mock' }
  if (p.startsWith('/admin')) return { persona: 'admin', guard: p === '/admin/login' ? 'none' : 'partial', prd: 'Epic 1.4+', status: 'shell-mock' }
  if (p.startsWith('/vendor') || p.startsWith('/signup/vendor')) return { persona: 'vendor', guard: 'partial', prd: 'Epic 1.3', status: 'shell-mock' }
  if (p.startsWith('/partner') || p.startsWith('/signup/partner') || p.startsWith('/partner-ref')) return { persona: 'partner', guard: 'none', prd: 'Partner', status: 'shell-mock' }
  if (p.startsWith('/am/')) return { persona: 'account_manager', guard: 'none', prd: 'AM', status: 'shell-mock' }
  if (
    ['/login', '/signup', '/welcome', '/auth/', '/'].some((x) => p === x || p.startsWith(x)) ||
    p.startsWith('/signup/corporate') ||
    p === '/why-mogzu' ||
    p === '/vendor-benefits' ||
    p === '/vendor-apply' ||
    p.startsWith('/p/') ||
    p.startsWith('/blog')
  )
    return { persona: 'public', guard: 'none', prd: 'Epic 1', status: 'implemented-e2e' }
  if (p === '/dashboard') return { persona: 'corporate', guard: 'CorporateRoute', prd: 'Epic 2', status: 'partial-e2e' }
  if (p === '/notifications') return { persona: 'corporate', guard: 'redirect', prd: 'Epic 2', status: 'redirect' }
  if (uniqueDupes.includes(p)) return { persona: 'corporate', guard: 'DUPLICATE', prd: 'varies', status: 'dead-route' }
  return { persona: 'corporate', guard: 'module/none', prd: 'Epic 2–8', status: 'shell-mock' }
}

const rows = paths.map((p) => {
  const c = classify(p)
  const note = uniqueDupes.includes(p) ? 'Second definition never matches (remove)' : ''
  return `| \`${p}\` | ${c.persona} | ${c.guard} | ${c.prd} | ${c.status} | ${note} |`
})

const header = `# Mogzu Frontend Route Matrix

Generated from \`src/app/routes.tsx\`. PRD baseline: **mogzu_prd_v2.md** Phase 1.

| Path | Persona | Guard (pre-audit) | PRD | Status | Notes |
|------|---------|-------------------|-----|--------|-------|
`

const footer = `

## Duplicate paths (first match wins)

${uniqueDupes.length ? uniqueDupes.map((p) => `- \`${p}\``).join('\n') : '_None detected_'}

## Totals

- Path entries parsed: **${paths.length}**
- Unique paths: **${new Set(paths).size}**
- Duplicate definitions: **${uniqueDupes.length}**

## Status legend

- **implemented-e2e** — Auth/data wired to Supabase
- **partial-e2e** — Auth works; data partly mock
- **shell-mock** — UI only (localStorage/demo)
- **dead-route** — Overwritten by earlier duplicate
- **redirect** — Alias route
`

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, header + rows.join('\n') + footer)
console.log('Wrote', outPath, 'paths:', paths.length, 'dupes:', uniqueDupes.length)

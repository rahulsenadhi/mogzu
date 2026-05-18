// One-shot apply of supabase/_combined/all_migrations_idempotent.sql
// against a project using a Supabase Personal Access Token.
//
// Usage:
//   SUPABASE_PAT=sbp_xxx PROJECT_REF=edbryqkqysptxwivdyle \
//     node scripts/apply-migrations-via-pat.mjs

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const PAT = process.env.SUPABASE_PAT
const REF = process.env.PROJECT_REF
if (!PAT || !REF) {
  console.error('SUPABASE_PAT + PROJECT_REF required')
  process.exit(2)
}

const sql = await readFile(
  resolve('supabase/_combined/all_migrations_idempotent.sql'),
  'utf8',
)

const url = `https://api.supabase.com/v1/projects/${REF}/database/query`

console.log(`Applying ${(sql.length / 1024).toFixed(1)} KB SQL to project ${REF}…`)

const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})

const text = await res.text()
console.log(`HTTP ${res.status}`)
console.log(text.slice(0, 2000))
if (!res.ok) process.exit(1)
console.log('Migrations applied.')

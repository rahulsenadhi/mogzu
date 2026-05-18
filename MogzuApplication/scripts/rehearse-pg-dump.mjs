// pg_dump rehearsal — apply the auth shim + combined migration script
// to an in-memory Postgres (pglite) and report whether the schema lands
// cleanly. The goal is to catch Supabase-specific syntax that would
// block portability to Neon / RDS before we actually commit to migrate.
//
// Usage: node scripts/rehearse-pg-dump.mjs

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp'

const SHIM = resolve('supabase/_combined/auth_shim.sql')
const MIGRATIONS = resolve('supabase/_combined/all_migrations.sql')

console.log('Starting pglite (in-memory Postgres)…')
const db = new PGlite({ extensions: { uuid_ossp } })
await db.waitReady

const shim = await readFile(SHIM, 'utf8')
const sql = await readFile(MIGRATIONS, 'utf8')

console.log('Applying auth shim…')
try {
  await db.exec(shim)
} catch (err) {
  console.error('Shim apply failed:', err.message)
  process.exit(1)
}

console.log(`Applying combined migrations (${(sql.length / 1024).toFixed(1)} KB)…`)
try {
  await db.exec(sql)
} catch (err) {
  console.error('\nMigrations failed to apply on vanilla Postgres:')
  console.error(`  ${err.message}`)
  if (err.cause) console.error(`  cause: ${err.cause}`)
  process.exit(1)
}

// Tally results.
const { rows: tables } = await db.query(
  `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`,
)
const { rows: policies } = await db.query(
  `SELECT count(*)::int AS n FROM pg_policies WHERE schemaname = 'public'`,
)
const { rows: funcs } = await db.query(
  `SELECT count(*)::int AS n FROM information_schema.routines WHERE specific_schema IN ('public','private')`,
)
const { rows: views } = await db.query(
  `SELECT count(*)::int AS n FROM information_schema.views WHERE table_schema = 'public'`,
)
const { rows: indices } = await db.query(
  `SELECT count(*)::int AS n FROM pg_indexes WHERE schemaname = 'public'`,
)

console.log('')
console.log('Rehearsal succeeded. Object counts on vanilla Postgres:')
console.log(`  Tables    : ${tables[0].n}`)
console.log(`  Views     : ${views[0].n}`)
console.log(`  Policies  : ${policies[0].n}`)
console.log(`  Functions : ${funcs[0].n}`)
console.log(`  Indexes   : ${indices[0].n}`)
console.log('')
console.log('Schema is portable to any vanilla Postgres provider given the auth shim.')

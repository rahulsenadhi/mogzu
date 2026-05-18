# Combined migrations — one-shot apply

`all_migrations.sql` concatenates every file in `supabase/migrations/`
into a single paste-ready script. Use it when:

- bootstrapping a fresh Supabase project that has no schema yet, OR
- you don't have the Supabase CLI installed / linked.

## Two flavours

- `all_migrations.sql` — strict; errors on any pre-existing object.
  Use only on a truly empty schema.
- `all_migrations_idempotent.sql` — `CREATE TABLE IF NOT EXISTS`,
  `DROP POLICY IF EXISTS` before each CREATE, `DROP TRIGGER IF EXISTS`
  before each CREATE, `CREATE OR REPLACE VIEW`. Safe to re-run against
  a partially-applied project. **Recommended for the dev project.**

  Regenerate after editing migrations:

  ```
  node scripts/make-idempotent-combined.mjs
  ```

## Apply to dev project `edbryqkqysptxwivdyle`

1. Open <https://supabase.com/dashboard/project/edbryqkqysptxwivdyle/sql/new>
2. Paste the contents of `all_migrations_idempotent.sql`
3. Click **Run** (top-right). Expected runtime: 10–30 seconds.
4. Verify in **Database → Tables** that ~50 tables exist under the
   `public` schema.
5. Run the RLS smoke test from `MogzuApplication/`:

   ```
   SUPABASE_URL=https://edbryqkqysptxwivdyle.supabase.co \
   SUPABASE_ANON_KEY=<anon key from project settings> \
     node scripts/rls-smoke-test.mjs
   ```

   Expected output: `Results: N pass / 0 fail / 0 not deployed`.

## Re-generating

```
cd MogzuApplication/supabase/migrations
{
  echo "-- Mogzu — combined migrations 01-NN"
  for f in $(ls *.sql | sort); do
    echo ""
    echo "-- ═══ ${f} ═══"
    cat "$f"
  done
} > ../_combined/all_migrations.sql
```

## Warning

`all_migrations.sql` (strict variant) is **not** idempotent. Use
`all_migrations_idempotent.sql` for any project that may already have
partial schema state. For day-to-day incremental updates keep using
`supabase db push` or apply individual migration files via the
Dashboard — neither combined script is part of the normal flow.

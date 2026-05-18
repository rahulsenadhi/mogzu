# Combined migrations — one-shot apply

`all_migrations.sql` concatenates every file in `supabase/migrations/`
into a single paste-ready script. Use it when:

- bootstrapping a fresh Supabase project that has no schema yet, OR
- you don't have the Supabase CLI installed / linked.

## Apply to dev project `edbryqkqysptxwivdyle`

1. Open <https://supabase.com/dashboard/project/edbryqkqysptxwivdyle/sql/new>
2. Paste the contents of `all_migrations.sql`
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

The combined script is **not** idempotent across full re-runs. Every
`CREATE TABLE`, `CREATE POLICY`, and `CREATE INDEX` will error on a
project that already has the schema. Use it for a clean apply only;
for incremental updates use `supabase db push` or apply individual
migration files via the Dashboard.

# Database Migration & Scalability Plan

Phase 2 Feature 10. Engineering reference for migrating off Supabase
when scale, cost, or compliance forces it. No UI ships with this feature.

> **Audit date:** 2026-05-17 · against commit `8ffbaac`.

---

## 1. Why this plan exists

Supabase gives us velocity. It does not give us an escape hatch. The
moment we depend on Supabase Auth UI flows, Supabase-only RPCs, or
Supabase Storage URLs scattered across 200+ React components, migrating
becomes a multi-quarter project rather than a two-week swap.

This plan is the contract that keeps the migration cost bounded at the
**1–2 week** target the PRD assumes.

---

## 2. Current stack (Phase 1 + 2)

| Concern   | Provider          | Where it's used                                  |
|-----------|-------------------|--------------------------------------------------|
| Database  | Supabase Postgres | `public.*` schema, RLS, RPCs, views              |
| Auth      | Supabase Auth     | Email/password, magic link, OAuth callbacks      |
| Storage   | Supabase Storage  | `vendor-images`, `gift-images`, `space-images`, `logo-uploads`, `documents` buckets |
| Realtime  | Supabase Realtime | Booking events, live status tracker, role switch |
| Edge fns  | Supabase Functions | Not used — all server logic is in Postgres RPCs |

---

## 3. Abstraction layer audit

| Layer            | File                 | Status | Notes |
|------------------|----------------------|--------|-------|
| `useAuth`        | `src/lib/auth.ts`    | ✅      | Single hook, exports `session`, `profile`, `role`, `corporateId`, `vendorId`, `signIn`, `signUp`, `signOut`, `refreshProfile`, `setActiveRole` |
| `storageService` | `src/lib/storage.ts` | ✅      | Bucket-typed helpers: `listingImages`, `giftImages`, `spaceImages`, `logos`, `documents`, `bookingProof`. Components never call `supabase.storage.*` directly |
| `db` service     | `src/lib/db.ts`      | ✅      | Domain-grouped query helpers. Phase 2 features use sibling service modules (`cms.ts`, `aiAgents.ts`, `giftingBranding.ts`) which follow the same pattern |
| `realtimeService`| `src/lib/realtime.ts`| ✅      | Components never call `supabase.channel(...)` — confirmed by grep on `src/app/components/**` |

**All four abstraction layers exist.** Migration unblocked.

---

## 4. Known leaks (must close before migrating)

**Status: clean** as of the post-Phase-2 cleanup pass. `bash
scripts/audit-abstraction-layers.sh` reports zero leaks across db / auth
/ storage / realtime.

The auth call sites that previously leaked (15 calls across 8
entry-point components — sign-in, sign-up, OAuth callback, password
reset, invite acceptance) now route through the sibling
`src/lib/authActions.ts` module, which wraps the methods not exposed by
`useAuth`: `signInWithOAuth`, `signInWithOtp`, `signInWithPassword`,
`exchangeCodeForSession`, `getSession`, `getUser`,
`resetPasswordForEmail`, `updatePassword`, `resendConfirmation`.

The two admin team pages that previously called `supabase.from()`
directly now use `db.userProfiles.getByIdMaybe` (new helper).
`db.userProfiles.upsertPartial` was added so PartnerSignUpForm can
upsert a partial profile row through the service layer.

Re-run the audit script before every Phase 3 deploy.

---

## 5. Migration practices already in force

- ✅ All schema lives in `supabase/migrations/*.sql` — portable, plain
  PostgreSQL with no Supabase-specific syntax. As of this commit there
  are 28 migrations, all checked into git.
- ✅ RLS policies are written against `auth.uid()` (Postgres function),
  not Supabase-specific helpers — they survive any Postgres host.
- ✅ RPCs are `SECURITY DEFINER` plpgsql functions in the `public`
  schema. Portable to any Postgres.
- ✅ Storage paths are stored alongside public URLs in DB rows
  (`gifting_branding_uploads.storage_path` + `public_url`), so a CDN
  swap rewrites URLs without touching DB rows.
- ✅ Realtime subscriptions ride the `postgres_changes` channel, which
  Neon/RDS expose via logical replication + a thin gateway.

---

## 6. Target option matrix

| Target           | DB    | Auth      | Storage          | Realtime               | Best for                 |
|------------------|-------|-----------|------------------|------------------------|--------------------------|
| **AWS RDS + Cognito + S3 + AppSync** | Postgres | Cognito  | S3 + CloudFront  | AppSync / API Gateway WS | Scale + India compliance |
| **Neon + Clerk + Cloudflare R2**     | Postgres (serverless) | Clerk | R2               | Soketi / Pusher          | Cost / fast cutover      |
| **PlanetScale + Auth0 + S3**         | MySQL (Vitess)         | Auth0 | S3               | Pusher                   | High write throughput    |

> ⚠️ PlanetScale forces a Postgres → MySQL rewrite. Avoid unless
> sharding is the primary driver. JSONB, GIN indexes on TEXT[], and
> `SECURITY DEFINER` RPCs all need replacement on MySQL.

**Default recommendation:** Neon for DB, keep Supabase Auth and
Storage for first 6 months post-cutover, migrate them last. Neon
accepts a `pg_dump` output verbatim and supports Postgres extensions
we already use.

---

## 7. Cutover runbook (Neon target)

T-7 days:
1. Close items 4a + 4b above. Re-run grep audit; both counts must read 0.
2. Bump abstraction modules to V2: every `supabase.*` reference in
   `auth.ts` / `storage.ts` / `db.ts` / `realtime.ts` becomes a thin
   adapter so we can stub the underlying client for tests.
3. Run `pg_dump --no-owner --no-acl --schema=public --schema=private`
   against Supabase. Confirm the dump replays cleanly into a fresh
   Neon branch.

T-1 day:
4. Snapshot Supabase storage buckets to S3/R2 (rclone).
5. Backfill `image_path` → `image_url` columns to use the new CDN
   origin via a one-shot SQL update.
6. Start dual-write window: changes still go to Supabase; a background
   replicator (Debezium / Neon's logical replication) copies them to
   Neon.

T-0 (cutover):
7. Flip `VITE_SUPABASE_URL` + key envs to point at Neon's pooler.
8. Smoke-test: login, browse listings, create a booking, upload a
   branding logo, fire a status event.
9. Disable dual-write; Supabase becomes read-only for 7 days as a
   rollback buffer, then is decommissioned.

Estimated wall-clock: **8–10 working days** with one engineer, assuming
the audit items in §4 are already closed.

---

## 8. Open risks

| Risk                                                       | Mitigation                                                  |
|------------------------------------------------------------|-------------------------------------------------------------|
| Auth migration: existing users have Supabase-hashed passwords | Stay on Supabase Auth post-DB-cutover; migrate later via reset-password flow or SSO |
| Realtime gap during cutover                                | Tolerable for 10 min; UI already falls back to polling      |
| RLS depends on `auth.uid()` returning the right shape      | Validated — Neon's `pgjwt`/`auth.uid()` shim is identical    |
| `pg_cron`, `pg_graphql` extensions                         | Not used. Confirmed by `\dx` audit at commit `8ffbaac`      |
| File URL invalidation during storage move                  | Use the public_url columns + a one-shot UPDATE, do not rely on regenerated URLs |

---

## 9. Verification

Three checks run on every push + PR via `.github/workflows/audit.yml`:

```bash
bash MogzuApplication/scripts/audit-abstraction-layers.sh   # invariants
npm --prefix MogzuApplication test                          # unit suite
npm --prefix MogzuApplication run rehearse:pgdump           # portability
```

- **Abstraction audit** fails if any component imports `supabase`
  directly or calls `supabase.from(`, `supabase.auth.`,
  `supabase.storage.`, or `supabase.channel(`, or if any of the four
  lib files (`auth.ts`, `db.ts`, `storage.ts`, `realtime.ts`) is
  missing.
- **Unit suite** runs Vitest against `src/lib/**/*.test.ts`.
- **pg_dump rehearsal** spins up an in-memory Postgres (pglite),
  applies `auth_shim.sql` + `_combined/all_migrations.sql`, and
  reports object counts. Fails if any migration uses Supabase-only
  syntax. Current baseline (2026-05-18): 63 tables · 2 views ·
  163 policies · 43 functions · 166 indexes on vanilla Postgres.

---

*Owner: engineering. Re-audit every quarter. Update §4 leak counts
when files change.*

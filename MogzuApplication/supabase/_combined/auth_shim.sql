-- Auth shim for replay against vanilla Postgres (pglite, Neon, RDS).
--
-- Supabase ships an `auth` schema with auth.users + auth.uid() + auth.role()
-- that our migrations reference. To rehearse migration portability we need
-- the same surface area without Supabase Auth running. This stub is enough
-- for DDL to apply; it's NOT a substitute for real auth at runtime.

-- Supabase ships these roles by default; vanilla Postgres / pglite do not.
-- Create them so GRANT ... TO anon/authenticated/service_role statements apply.
DO $shim$ BEGIN
  CREATE ROLE anon NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $shim$;
DO $shim$ BEGIN
  CREATE ROLE authenticated NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $shim$;
DO $shim$ BEGIN
  CREATE ROLE service_role NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $shim$;

CREATE SCHEMA IF NOT EXISTS auth;

-- uuid-ossp is loaded by migration 001; reuse its uuid_generate_v4().
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  raw_user_meta_data JSONB,
  raw_app_meta_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', TRUE), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', TRUE), ''), 'anon');
$$;

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS JSONB
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', TRUE), '')::JSONB;
$$;


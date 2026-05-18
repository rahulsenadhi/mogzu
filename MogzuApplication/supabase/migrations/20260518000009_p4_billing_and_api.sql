-- Phase 4 — SaaS subscription billing + public API key surface.
--
-- Schema-only landing for P4.2 (Subscription Billing) and P4.4
-- (Public API + Webhooks). The actual Stripe / Razorpay integration
-- and webhook delivery worker land in their respective sprints; this
-- migration gives the DB shape stable so service modules + admin UIs
-- can iterate independently of the integrations.

-- ─── Plans + Subscriptions ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'growth', 'enterprise')),
  monthly_per_seat NUMERIC(10, 2) NOT NULL DEFAULT 0,
  annual_per_seat NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'INR' REFERENCES public.currencies(code),
  feature_flags JSONB NOT NULL DEFAULT
    '{"sso_enabled": false, "ai_agents_count": 1, "custom_contracts": false, "audit_export": false}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.plans (id, name, tier, monthly_per_seat, annual_per_seat, feature_flags, display_order) VALUES
  ('free', 'Free', 'free', 0, 0,
    '{"sso_enabled": false, "ai_agents_count": 0, "custom_contracts": false, "audit_export": false}'::JSONB, 1),
  ('growth', 'Growth', 'growth', 999, 9990,
    '{"sso_enabled": false, "ai_agents_count": 1, "custom_contracts": false, "audit_export": false}'::JSONB, 2),
  ('enterprise', 'Enterprise', 'enterprise', 2499, 24990,
    '{"sso_enabled": true, "ai_agents_count": 5, "custom_contracts": true, "audit_export": true}'::JSONB, 3)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL UNIQUE REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (
    status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')
  ),
  seat_count INTEGER NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  current_period_starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  current_period_ends_on DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  -- External provider linkage (Stripe / Razorpay). Populated by the
  -- billing integration worker; null while we run on Mogzu-only
  -- bookkeeping.
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  razorpay_subscription_id TEXT,
  dunning_attempts SMALLINT NOT NULL DEFAULT 0,
  last_payment_attempt_at TIMESTAMPTZ,
  last_payment_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions (status, current_period_ends_on);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads active plans" ON public.plans;
CREATE POLICY "Anyone reads active plans" ON public.plans
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin manages plans" ON public.plans;
CREATE POLICY "Admin manages plans" ON public.plans
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Admin manages subscriptions" ON public.subscriptions;
CREATE POLICY "Admin manages subscriptions" ON public.subscriptions
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Corporate reads own subscription" ON public.subscriptions;
CREATE POLICY "Corporate reads own subscription" ON public.subscriptions
  FOR SELECT USING (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid()
    )
  );

-- ─── Public API keys + webhook endpoints ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- Only a SHA-256 prefix is stored; the full key is shown once on
  -- creation. The prefix lets admin show "mzk_…abc" without leaking
  -- the secret.
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read:bookings', 'read:invoices'],
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 100 CHECK (rate_limit_per_minute > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_corporate
  ON public.api_keys (corporate_id) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  signing_secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT
    ARRAY['booking.created', 'booking.approved', 'booking.completed', 'invoice.paid', 'dispute.opened'],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_corporate
  ON public.webhook_endpoints (corporate_id) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'delivered', 'failed', 'cancelled')
  ),
  http_status_code INTEGER,
  response_body TEXT,
  attempts SMALLINT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_queue
  ON public.webhook_deliveries (status, next_attempt_at)
  WHERE status IN ('pending', 'failed');

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages api_keys" ON public.api_keys;
CREATE POLICY "Admin manages api_keys" ON public.api_keys
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Admin manages webhook_endpoints" ON public.webhook_endpoints;
CREATE POLICY "Admin manages webhook_endpoints" ON public.webhook_endpoints
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Admin manages webhook_deliveries" ON public.webhook_deliveries;
CREATE POLICY "Admin manages webhook_deliveries" ON public.webhook_deliveries
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

-- ─── P4.3 Vendor payout methods + settlement ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_payout_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  currency TEXT NOT NULL REFERENCES public.currencies(code),
  rail TEXT NOT NULL CHECK (
    rail IN ('razorpay_x', 'wise', 'ach', 'fast_sg', 'sepa', 'manual')
  ),
  account_holder TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_info JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_payout_methods
  ON public.vendor_payout_methods (vendor_id, is_primary DESC);

CREATE TRIGGER trg_vendor_payout_methods_updated_at
  BEFORE UPDATE ON public.vendor_payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS settlement_currency TEXT REFERENCES public.currencies(code),
  ADD COLUMN IF NOT EXISTS settlement_fx_rate NUMERIC(18, 8);

ALTER TABLE public.vendor_payout_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages vendor_payout_methods" ON public.vendor_payout_methods;
CREATE POLICY "Admin manages vendor_payout_methods" ON public.vendor_payout_methods
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Vendor reads own payout methods" ON public.vendor_payout_methods;
CREATE POLICY "Vendor reads own payout methods" ON public.vendor_payout_methods
  FOR SELECT USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v WHERE v.user_id = auth.uid()
    )
  );

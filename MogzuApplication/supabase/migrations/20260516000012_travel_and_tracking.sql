-- ─── Travel & Space Policy (Story 5.5) ──────────────────────────────────────
--
-- L3 Admin defines policy tiers per role. Stay/space search enforces by
-- filtering or flagging results above max_nightly_rate or outside
-- approved_cities, and requires bookings to be initiated at least
-- min_lead_days in advance.

CREATE TABLE public.travel_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_tier TEXT NOT NULL CHECK (role_tier IN ('l1_employee', 'l2_manager', 'l3_admin', 'all')),
  max_nightly_rate NUMERIC(12, 2) NOT NULL CHECK (max_nightly_rate > 0),
  approved_cities TEXT[] DEFAULT '{}'::TEXT[],
  min_lead_days INTEGER NOT NULL DEFAULT 0,
  module TEXT NOT NULL DEFAULT 'spacex_stay'
    CHECK (module IN ('spacex_stay', 'spacex_coworking')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_travel_policies_corp ON public.travel_policies (corporate_id, role_tier, is_active);

CREATE TRIGGER trg_travel_policies_updated_at
  BEFORE UPDATE ON public.travel_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.travel_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate members read own policies"
  ON public.travel_policies
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "L3 admin manages own policies"
  ON public.travel_policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = travel_policies.corporate_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = travel_policies.corporate_id
    )
  );

-- ─── Gift Delivery Tracking (Story 4.6) ───────────────────────────────────────
--
-- Extends bookings with a fulfilment_stage for gifting orders and optional
-- carrier tracking details. Stage transitions emit notifications via the
-- shared notify helper (handled in the React app, future N8N once webhooks
-- from carriers land).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS fulfilment_stage TEXT
    CHECK (fulfilment_stage IN (
      'ordered', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'returned'
    )),
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS carrier_url TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_fulfilment
  ON public.bookings (module, fulfilment_stage)
  WHERE module = 'gifting';

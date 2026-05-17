-- ─── Promotions (Stories 8.7, 9.6) ──────────────────────────────────────────

CREATE TYPE public.promotion_kind AS ENUM ('percent_off', 'flat_off', 'free_addon', 'paid_boost');
CREATE TYPE public.promotion_status AS ENUM (
  'draft', 'pending_payment', 'pending_approval', 'active', 'rejected', 'expired'
);

CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  kind public.promotion_kind NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12, 2),
  add_on_name TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_redemptions INTEGER,
  redemptions INTEGER NOT NULL DEFAULT 0,
  paid_boost_amount NUMERIC(12, 2),
  paid_boost_payment_reference TEXT,
  status public.promotion_status NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotions_vendor ON public.promotions (vendor_id, status);
CREATE INDEX idx_promotions_queue ON public.promotions (status, created_at)
  WHERE status = 'pending_approval';
CREATE INDEX idx_promotions_active ON public.promotions (listing_id, ends_at)
  WHERE status = 'active';

CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active promotions"
  ON public.promotions
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Vendor manages own promotions"
  ON public.promotions
  FOR ALL
  USING (
    vendor_id IN (
      SELECT vendor_id FROM public.user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT vendor_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Mogzu admin manages promotions"
  ON public.promotions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

-- ─── Event Templates (Story 3.5) ─────────────────────────────────────────────

CREATE TABLE public.event_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_group_size INTEGER,
  default_budget NUMERIC(12, 2),
  preferred_vendor_ids UUID[] DEFAULT '{}'::UUID[],
  preferred_listing_ids UUID[] DEFAULT '{}'::UUID[],
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_templates_corp ON public.event_templates (corporate_id, is_active);

CREATE TRIGGER trg_event_templates_updated_at
  BEFORE UPDATE ON public.event_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate members read own templates"
  ON public.event_templates
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "L3 admin manages own templates"
  ON public.event_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = event_templates.corporate_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = event_templates.corporate_id
    )
  );

-- ─── Bulk Gifting Campaigns (Story 4.3) ─────────────────────────────────────
--
-- L3 Admin runs a bulk gifting campaign: picks an occasion, a gifting product,
-- and a recipient scope (all employees / department / custom employee list).
-- System creates one bookings row per recipient and links them under a
-- gifting_campaigns parent row. Vendor sees individual orders in their
-- existing queue but with a campaign_id reference for grouping.

CREATE TABLE public.gifting_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  occasion_name TEXT NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('all', 'department', 'custom')),
  scope_value TEXT,
  message TEXT,
  budget_per_recipient NUMERIC(12, 2) NOT NULL,
  recipient_count INTEGER NOT NULL,
  total_budget NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_vendor'
    CHECK (status IN ('draft', 'pending_vendor', 'in_progress', 'completed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifting_campaigns_corp ON public.gifting_campaigns (corporate_id, status);

CREATE TRIGGER trg_gifting_campaigns_updated_at
  BEFORE UPDATE ON public.gifting_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.gifting_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate members read own campaigns"
  ON public.gifting_campaigns
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "L3 admin manages campaigns"
  ON public.gifting_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = gifting_campaigns.corporate_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = gifting_campaigns.corporate_id
    )
  );

-- Link bookings to campaigns so the admin can drill into per-employee fulfilment.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS gifting_campaign_id UUID REFERENCES public.gifting_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_campaign
  ON public.bookings (gifting_campaign_id)
  WHERE gifting_campaign_id IS NOT NULL;

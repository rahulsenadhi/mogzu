-- Plan Batch 3 slice 2: listings buffer_minutes + vendor availability rules.
-- buffer_minutes: padding around bookable slots (5.3 acceptance).
-- vendor_availability_rules: weekly working-hours template per vendor (and
-- optionally per-listing) — drives the "default working hours" hint on
-- VendorCalendarPage. Existing CalendarSlot.recurrence_rule is for ad-hoc
-- per-slot recurrence; this is the higher-level weekly template.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS buffer_minutes INT NOT NULL DEFAULT 0
  CHECK (buffer_minutes >= 0 AND buffer_minutes <= 720);

CREATE TABLE IF NOT EXISTS public.vendor_availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_minute INT NOT NULL CHECK (start_minute BETWEEN 0 AND 1439),
  end_minute INT NOT NULL CHECK (end_minute BETWEEN 1 AND 1440),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (start_minute < end_minute)
);

CREATE INDEX IF NOT EXISTS idx_avail_rules_vendor
  ON public.vendor_availability_rules (vendor_id, day_of_week)
  WHERE is_active = true;

ALTER TABLE public.vendor_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avail_rules vendor manages own"
  ON public.vendor_availability_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = vendor_availability_rules.vendor_id
        AND v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = vendor_availability_rules.vendor_id
        AND v.user_id = auth.uid()
    )
  );

-- Authenticated corp users + admins can read so that future "show vendor
-- working hours" surfaces on the corp side work.
CREATE POLICY "avail_rules authenticated read"
  ON public.vendor_availability_rules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "avail_rules mogzu admin all"
  ON public.vendor_availability_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'mogzu_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'mogzu_admin'
    )
  );

CREATE OR REPLACE FUNCTION public.touch_vendor_availability_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_var_touch_updated_at ON public.vendor_availability_rules;
CREATE TRIGGER trg_var_touch_updated_at
  BEFORE UPDATE ON public.vendor_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.touch_vendor_availability_rules_updated_at();

NOTIFY pgrst, 'reload schema';

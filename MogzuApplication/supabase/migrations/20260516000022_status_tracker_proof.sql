-- Phase 2 — Features 2 & 3:
-- Live status tracker + proof of execution, and proof-of-conditions.
--
-- A single booking_status_events table covers all three modules; the
-- allowed stage list is module-aware but enforced in app code, not in
-- a CHECK constraint (CHECKs can't read other tables in vanilla
-- Postgres). The mandatory proof fields (otp_verified_at, photo_path,
-- gps_lat / lng) are set together at submit time, and once
-- otp_verified_at is non-null the row becomes immutable via trigger.

-- ─── booking_status_events ───────────────────────────────────────────────────

CREATE TABLE public.booking_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  otp_code TEXT,
  otp_sent_to TEXT,
  otp_verified_at TIMESTAMPTZ,
  photo_path TEXT,
  gps_lat NUMERIC(9, 6),
  gps_lng NUMERIC(9, 6),
  submitted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  notes TEXT,
  admin_override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_status_events_booking
  ON public.booking_status_events (booking_id, created_at DESC);
CREATE UNIQUE INDEX uniq_booking_status_events_stage
  ON public.booking_status_events (booking_id, stage);

CREATE TRIGGER trg_booking_status_events_updated_at
  BEFORE UPDATE ON public.booking_status_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.booking_status_events_lock_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- Once OTP-verified, only admin override + reason fields may change.
  IF OLD.otp_verified_at IS NOT NULL THEN
    IF NEW.stage <> OLD.stage
       OR NEW.otp_code IS DISTINCT FROM OLD.otp_code
       OR NEW.otp_verified_at <> OLD.otp_verified_at
       OR NEW.photo_path IS DISTINCT FROM OLD.photo_path
       OR NEW.gps_lat IS DISTINCT FROM OLD.gps_lat
       OR NEW.gps_lng IS DISTINCT FROM OLD.gps_lng
       OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
       OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
    THEN
      RAISE EXCEPTION 'booking_status_events: row is immutable after OTP verification (only admin notes may change)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_status_events_lock
  BEFORE UPDATE ON public.booking_status_events
  FOR EACH ROW EXECUTE FUNCTION public.booking_status_events_lock_verified();

ALTER TABLE public.booking_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate reads booking status events"
  ON public.booking_status_events
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.user_profiles p ON p.corporate_id = b.corporate_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Vendor reads + writes own booking status events"
  ON public.booking_status_events
  FOR ALL
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.vendors v ON v.id = b.vendor_id
      WHERE v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.vendors v ON v.id = b.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Field agent reads + writes assigned bookings"
  ON public.booking_status_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_agent'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_agent'
    )
  );

CREATE POLICY "Admin full access to status events"
  ON public.booking_status_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

-- ─── booking_proof_records (Feature 3) ───────────────────────────────────────

CREATE TABLE public.booking_proof_records (
  booking_id UUID PRIMARY KEY REFERENCES public.bookings(id) ON DELETE CASCADE,
  agreed_scope TEXT,
  quoted_price NUMERIC(12, 2),
  final_price NUMERIC(12, 2),
  negotiation_history JSONB NOT NULL DEFAULT '[]'::JSONB,
  accepted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  accepted_ip TEXT,
  accepted_user_agent TEXT,
  po_document_path TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_booking_proof_records_updated_at
  BEFORE UPDATE ON public.booking_proof_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.booking_proof_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate reads own proof record"
  ON public.booking_proof_records
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.user_profiles p ON p.corporate_id = b.corporate_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Vendor reads own booking proof record"
  ON public.booking_proof_records
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.vendors v ON v.id = b.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Booking owner accepts proof record"
  ON public.booking_proof_records
  FOR ALL
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.user_profiles p ON p.corporate_id = b.corporate_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.user_profiles p ON p.corporate_id = b.corporate_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to proof records"
  ON public.booking_proof_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

-- ─── booking_payment_milestones (Feature 3) ──────────────────────────────────

CREATE TABLE public.booking_payment_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('advance', 'milestone', 'balance', 'final_settlement')),
  percentage NUMERIC(5, 2) CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
  amount NUMERIC(12, 2),
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  paid_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_payment_milestones_booking
  ON public.booking_payment_milestones (booking_id, due_at);

ALTER TABLE public.booking_payment_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate reads own milestones"
  ON public.booking_payment_milestones
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.user_profiles p ON p.corporate_id = b.corporate_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Vendor reads own milestones"
  ON public.booking_payment_milestones
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.vendors v ON v.id = b.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manages all milestones"
  ON public.booking_payment_milestones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

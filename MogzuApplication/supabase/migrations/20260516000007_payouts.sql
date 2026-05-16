-- ─── Vendor Payouts (Story 6.4) ──────────────────────────────────────────────
--
-- Vendor receives payout = booking.total_amount - (total * commission_rate),
-- scheduled 48 hours after booking.completed_at. An N8N workflow polls
-- payouts where status='scheduled' AND scheduled_for < now() AND
-- vendors.bank_account_verified=true, fires the bank transfer via Razorpay,
-- then flips status to 'processed'. Manual override available to
-- mogzu_admin (e.g. retry, hold pending KYC).
--
-- Statuses:
--   scheduled  — waiting for 48h to elapse + vendor bank verified.
--   processed  — money transferred; gateway_reference set.
--   held       — paused (KYC issue, dispute) with hold_reason explaining.
--   failed     — gateway rejected; admin retries or escalates.

CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  gross_amount NUMERIC(12, 2) NOT NULL CHECK (gross_amount >= 0),
  commission_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount >= 0),
  commission_rate NUMERIC(5, 4),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'processed', 'held', 'failed')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  gateway_reference TEXT,
  hold_reason TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payouts_vendor_status ON public.payouts (vendor_id, status);
CREATE INDEX idx_payouts_due ON public.payouts (status, scheduled_for)
  WHERE status = 'scheduled';

CREATE TRIGGER trg_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Vendor reads own payouts
CREATE POLICY "Vendor reads own payouts"
  ON public.payouts
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT vendor_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Mogzu admin reads everything + manages
CREATE POLICY "Mogzu admin manages payouts"
  ON public.payouts
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

-- Booking completion (vendor self-mark or admin) inserts the schedule row.
CREATE POLICY "Vendor or admin inserts payout for own booking"
  ON public.payouts
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.vendor_id = p.vendor_id OR p.role = 'mogzu_admin'
    )
  );

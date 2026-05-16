-- ─── Refunds (Story 6.3) ─────────────────────────────────────────────────────
--
-- Automated refund tracking on booking cancellation.
--
-- Wallet refunds are processed immediately by the app (credit wallet +
-- write a wallet_transactions row); the refunds row is inserted with
-- status='processed'. Card/UPI refunds are inserted with status='pending'
-- and wait for the Razorpay refund webhook to mark them processed.
--
-- If refund_status='failed' the supporting N8N workflow opens a support
-- ticket automatically (workflow lands in P1 7.3).

CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  method TEXT NOT NULL CHECK (method IN ('wallet', 'card', 'upi')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'failed')),
  gateway_reference TEXT,
  failure_reason TEXT,
  initiated_by UUID REFERENCES public.user_profiles(id),
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refunds_booking ON public.refunds (booking_id);
CREATE INDEX idx_refunds_corp_status ON public.refunds (corporate_id, status);
CREATE INDEX idx_refunds_pending ON public.refunds (status) WHERE status = 'pending';

CREATE TRIGGER trg_refunds_updated_at
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Corporate members read their own refunds; vendors read refunds for their bookings
CREATE POLICY "Corporate members read own refunds"
  ON public.refunds
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendor reads refunds for own bookings"
  ON public.refunds
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.vendor_id = p.vendor_id
    )
  );

-- L3 admin / mogzu_admin can manage refunds; vendors can only initiate
-- (their booking rejection triggers a refund).
CREATE POLICY "L3 admin and mogzu_admin manage refunds"
  ON public.refunds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('l3_admin', 'mogzu_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('l3_admin', 'mogzu_admin')
    )
  );

CREATE POLICY "Vendor initiates refund on own booking"
  ON public.refunds
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.vendor_id = p.vendor_id
    )
  );

CREATE POLICY "Booking owner initiates refund (self-cancel)"
  ON public.refunds
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

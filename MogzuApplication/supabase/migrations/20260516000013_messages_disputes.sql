-- ─── Booking Messages (Story 7.1) ────────────────────────────────────────────
--
-- One thread per booking. Corporate user, vendor, and (for disputes) Mogzu
-- support can all post. Real-time via Supabase Realtime channel on the
-- booking_messages filter `booking_id=eq.<id>`. Attachments are stored in
-- the `support-evidence` bucket (or shared `vendor-images` for now) and
-- referenced as { url, name, size } objects in the attachments JSONB.

CREATE TABLE public.booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::JSONB,
  read_by UUID[] NOT NULL DEFAULT '{}'::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_messages_thread ON public.booking_messages (booking_id, created_at);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

-- Booking participants (booker + vendor staff) and support roles can read.
CREATE POLICY "Booking participants read messages"
  ON public.booking_messages
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      LEFT JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.user_id = auth.uid()
         OR b.vendor_id = p.vendor_id
         OR p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  );

-- Same set can insert. sender_id must be auth.uid().
CREATE POLICY "Booking participants post messages"
  ON public.booking_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND booking_id IN (
      SELECT b.id
      FROM public.bookings b
      LEFT JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.user_id = auth.uid()
         OR b.vendor_id = p.vendor_id
         OR p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  );

-- Sender can update own message read_by (mark-as-read).
CREATE POLICY "Recipient updates read_by"
  ON public.booking_messages
  FOR UPDATE
  USING (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      LEFT JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.user_id = auth.uid() OR b.vendor_id = p.vendor_id
    )
  )
  WITH CHECK (TRUE);

-- ─── Booking Disputes (Story 9.5) ────────────────────────────────────────────

CREATE TYPE public.dispute_status AS ENUM (
  'open', 'investigating', 'awaiting_party', 'resolved', 'dismissed'
);

CREATE TYPE public.dispute_resolution AS ENUM (
  'no_refund', 'partial_refund', 'full_refund', 'vendor_penalty', 'no_action'
);

CREATE TABLE public.booking_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reason_category TEXT NOT NULL,
  reason_body TEXT NOT NULL,
  status public.dispute_status NOT NULL DEFAULT 'open',
  evidence_urls TEXT[] DEFAULT '{}'::TEXT[],
  resolution public.dispute_resolution,
  resolution_note TEXT,
  resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_disputes_status ON public.booking_disputes (status, created_at);
CREATE INDEX idx_booking_disputes_booking ON public.booking_disputes (booking_id);

CREATE TRIGGER trg_booking_disputes_updated_at
  BEFORE UPDATE ON public.booking_disputes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.booking_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants read disputes"
  ON public.booking_disputes
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      LEFT JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.user_id = auth.uid()
         OR b.vendor_id = p.vendor_id
         OR p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  );

CREATE POLICY "Booking participants raise dispute"
  ON public.booking_disputes
  FOR INSERT
  WITH CHECK (
    raised_by = auth.uid()
    AND booking_id IN (
      SELECT b.id
      FROM public.bookings b
      LEFT JOIN public.user_profiles p ON p.id = auth.uid()
      WHERE b.user_id = auth.uid() OR b.vendor_id = p.vendor_id
    )
  );

CREATE POLICY "Support roles manage disputes"
  ON public.booking_disputes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  );

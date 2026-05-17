-- ─── Wishlist (Story 13.1) ───────────────────────────────────────────────────

CREATE TABLE public.wishlists (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX idx_wishlists_user ON public.wishlists (user_id, created_at DESC);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own wishlist"
  ON public.wishlists
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Reviews (Stories 8.4, 8.5, 8.6) ─────────────────────────────────────────

CREATE TYPE public.review_status AS ENUM (
  'pending_approval', 'approved', 'rejected', 'hidden'
);

CREATE TYPE public.review_source AS ENUM ('booking', 'invite');

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  source public.review_source NOT NULL DEFAULT 'booking',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  status public.review_status NOT NULL DEFAULT 'pending_approval',
  vendor_reply TEXT,
  vendor_replied_at TIMESTAMPTZ,
  rejection_reason TEXT,
  approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_listing ON public.reviews (listing_id, status, created_at DESC);
CREATE INDEX idx_reviews_vendor ON public.reviews (vendor_id, status);
CREATE INDEX idx_reviews_queue ON public.reviews (status, created_at) WHERE status = 'pending_approval';

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Approved reviews are public
CREATE POLICY "Anyone reads approved reviews"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved');

-- Reviewer reads own (any status)
CREATE POLICY "Reviewer reads own"
  ON public.reviews
  FOR SELECT
  USING (reviewer_id = auth.uid());

-- Reviewer submits with gated booking
CREATE POLICY "Reviewer inserts for completed booking"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND (
      source = 'invite' OR (
        booking_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = booking_id
            AND b.user_id = auth.uid()
            AND b.status = 'completed'
        )
      )
    )
  );

-- Vendor reads + replies on own reviews
CREATE POLICY "Vendor reads own reviews"
  ON public.reviews
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT vendor_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendor updates own review reply"
  ON public.reviews
  FOR UPDATE
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

-- Support roles manage moderation
CREATE POLICY "Support roles moderate reviews"
  ON public.reviews
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

-- ─── Review Invites (Story 8.5) ──────────────────────────────────────────────

CREATE TABLE public.review_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  token TEXT NOT NULL UNIQUE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_review_invites_vendor ON public.review_invites (vendor_id, created_at DESC);
CREATE INDEX idx_review_invites_token ON public.review_invites (token);

ALTER TABLE public.review_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor manages own invites"
  ON public.review_invites
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

-- Anyone with a valid token can mark used (via service-side rpc later).
CREATE POLICY "Mogzu admin reads all invites"
  ON public.review_invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

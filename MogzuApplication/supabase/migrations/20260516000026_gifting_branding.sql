-- Phase 2 Feature 4 — Gifting Auto Branding Placement Preview.
--
-- Corporate uploads a logo for a gifting order, picks one or more
-- placement options (front-print / back-print / embossing / label /
-- sleeve / band), and the admin reviews + approves before the spec is
-- handed to the vendor. Logo files live in the existing `logo-uploads`
-- storage bucket; this migration stores only the metadata + selection +
-- approval lifecycle.
--
-- Two tables on purpose:
--   * gifting_branding_uploads — the logo asset (one row per uploaded
--     file). Pre-booking uploads (before booking_id exists) are allowed
--     by storing corporate_id; the row gets linked when checkout
--     persists the booking.
--   * gifting_branding_selections — placement choices per booking. A
--     booking can request multiple placements (e.g. front print + label).
--     Each selection carries its own admin approval state.

-- ─── gifting_branding_uploads ───────────────────────────────────────────────

CREATE TABLE public.gifting_branding_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifting_branding_uploads_corporate
  ON public.gifting_branding_uploads (corporate_id, created_at DESC);

ALTER TABLE public.gifting_branding_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate reads own logo uploads"
  ON public.gifting_branding_uploads
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.corporate_id IS NOT NULL
    )
  );

CREATE POLICY "Corporate inserts own logo uploads"
  ON public.gifting_branding_uploads
  FOR INSERT
  WITH CHECK (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.corporate_id IS NOT NULL
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Admin full access to logo uploads"
  ON public.gifting_branding_uploads
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

-- ─── gifting_branding_selections ────────────────────────────────────────────

CREATE TABLE public.gifting_branding_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  upload_id UUID NOT NULL REFERENCES public.gifting_branding_uploads(id) ON DELETE RESTRICT,
  placement_type TEXT NOT NULL CHECK (
    placement_type IN ('front_print', 'back_print', 'embossing', 'label', 'sleeve_band')
  ),
  branding_method TEXT CHECK (
    branding_method IN ('screen_print', 'digital_print', 'embroidery', 'dtf', 'emboss', 'laser_etch')
  ),
  position_notes TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    approval_status IN ('pending', 'approved', 'revision_requested')
  ),
  revision_notes TEXT,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (booking_id, placement_type)
);

CREATE INDEX idx_gifting_branding_selections_booking
  ON public.gifting_branding_selections (booking_id, created_at DESC);
CREATE INDEX idx_gifting_branding_selections_pending
  ON public.gifting_branding_selections (approval_status, created_at)
  WHERE approval_status = 'pending';

CREATE TRIGGER trg_gifting_branding_selections_updated_at
  BEFORE UPDATE ON public.gifting_branding_selections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.gifting_branding_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate reads own branding selections"
  ON public.gifting_branding_selections
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.user_profiles p ON p.corporate_id = b.corporate_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Vendor reads selections for own bookings"
  ON public.gifting_branding_selections
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.vendors v ON v.id = b.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to branding selections"
  ON public.gifting_branding_selections
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

-- ─── RPCs ───────────────────────────────────────────────────────────────────

-- Corporate submits one placement choice. Same booking + placement_type
-- is updated in place so the corporate can revise before approval.
CREATE OR REPLACE FUNCTION public.submit_gifting_branding(
  p_booking_id UUID,
  p_upload_id UUID,
  p_placement_type TEXT,
  p_branding_method TEXT,
  p_position_notes TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_corporate_id UUID;
  v_booking_corp UUID;
  v_id UUID;
BEGIN
  -- Caller must belong to a corporate account.
  SELECT corporate_id INTO v_corporate_id
  FROM public.user_profiles
  WHERE id = auth.uid();

  IF v_corporate_id IS NULL THEN
    RAISE EXCEPTION 'submit_gifting_branding: caller is not in a corporate account';
  END IF;

  -- Booking must belong to caller's corporate.
  SELECT corporate_id INTO v_booking_corp
  FROM public.bookings WHERE id = p_booking_id;

  IF v_booking_corp IS DISTINCT FROM v_corporate_id THEN
    RAISE EXCEPTION 'submit_gifting_branding: booking does not belong to caller corporate';
  END IF;

  -- Upload must belong to same corporate.
  IF NOT EXISTS (
    SELECT 1 FROM public.gifting_branding_uploads
    WHERE id = p_upload_id AND corporate_id = v_corporate_id
  ) THEN
    RAISE EXCEPTION 'submit_gifting_branding: upload does not belong to caller corporate';
  END IF;

  INSERT INTO public.gifting_branding_selections (
    booking_id, upload_id, placement_type, branding_method, position_notes
  )
  VALUES (
    p_booking_id, p_upload_id, p_placement_type, p_branding_method, p_position_notes
  )
  ON CONFLICT (booking_id, placement_type) DO UPDATE
    SET upload_id = EXCLUDED.upload_id,
        branding_method = EXCLUDED.branding_method,
        position_notes = EXCLUDED.position_notes,
        approval_status = 'pending',
        revision_notes = NULL,
        reviewed_by = NULL,
        reviewed_at = NULL
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_gifting_branding(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Admin reviews a single selection. Approval is terminal (no further
-- corporate edits expected post-approval — corporate can re-submit which
-- resets back to pending; see ON CONFLICT clause above).
CREATE OR REPLACE FUNCTION public.review_gifting_branding(
  p_selection_id UUID,
  p_status TEXT,
  p_revision_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
  ) THEN
    RAISE EXCEPTION 'review_gifting_branding: caller is not admin';
  END IF;

  IF p_status NOT IN ('approved', 'revision_requested') THEN
    RAISE EXCEPTION 'review_gifting_branding: status must be approved or revision_requested';
  END IF;

  IF p_status = 'revision_requested' AND (p_revision_notes IS NULL OR length(trim(p_revision_notes)) = 0) THEN
    RAISE EXCEPTION 'review_gifting_branding: revision_notes required when requesting revision';
  END IF;

  UPDATE public.gifting_branding_selections
  SET approval_status = p_status,
      revision_notes = CASE WHEN p_status = 'revision_requested' THEN p_revision_notes ELSE NULL END,
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_selection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'review_gifting_branding: selection % not found', p_selection_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_gifting_branding(UUID, TEXT, TEXT) TO authenticated;

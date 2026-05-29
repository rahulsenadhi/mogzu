-- Dedicated approval chain columns on bookings (replaces purpose_note JSON marker over time).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS required_approval_levels TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS approved_approval_levels TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

COMMENT ON COLUMN public.bookings.required_approval_levels IS
  'Ordered L1/L2/L3 chain required before vendor handoff.';
COMMENT ON COLUMN public.bookings.approved_approval_levels IS
  'Subset of required_approval_levels already signed off.';

CREATE INDEX IF NOT EXISTS idx_bookings_pending_approval
  ON public.bookings (corporate_id, status, created_at DESC)
  WHERE status = 'pending_approval';

-- Phase 2 Feature 5 — Category management.
--
-- listing_categories already exists from the core schema; this migration
-- adds the editable description, locks the update path behind admin RLS,
-- and exposes the table for authenticated reads.

ALTER TABLE public.listing_categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TRIGGER trg_listing_categories_updated_at
  BEFORE UPDATE ON public.listing_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active categories"
  ON public.listing_categories
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin reads all categories"
  ON public.listing_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support')
    )
  );

CREATE POLICY "Admin manages categories"
  ON public.listing_categories
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

-- Count active listings under a category — used by the admin UI to gate
-- destructive actions (rename / delete) and by the corporate catalogue to
-- skip categories with no inventory.
CREATE OR REPLACE FUNCTION public.count_active_listings_for_category(p_category_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.listings
   WHERE category_id = p_category_id
     AND status = 'active';
$$;

GRANT EXECUTE ON FUNCTION public.count_active_listings_for_category(UUID) TO authenticated;

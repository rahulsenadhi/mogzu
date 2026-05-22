-- Plan Batch 8 — admin category disable cascades to consumer catalogue.
--
-- When admin flips listing_categories.is_active=false, every listing in
-- that category gets public_visible=false (and is tagged so the reverse
-- flip can restore visibility). When the category is re-enabled, only
-- listings that were hidden by THIS cascade come back; listings that
-- were independently paused stay paused.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS hidden_by_category BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.cascade_category_visibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Disable cascade: hide every listing in this category that was visible.
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    UPDATE public.listings
    SET public_visible = FALSE,
        hidden_by_category = TRUE,
        updated_at = NOW()
    WHERE category_id = NEW.id
      AND public_visible = TRUE;
    RETURN NEW;
  END IF;

  -- Re-enable cascade: restore ONLY listings hidden by THIS cascade.
  IF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
    UPDATE public.listings
    SET public_visible = TRUE,
        hidden_by_category = FALSE,
        updated_at = NOW()
    WHERE category_id = NEW.id
      AND hidden_by_category = TRUE;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cascade_category_visibility ON public.listing_categories;
CREATE TRIGGER trg_cascade_category_visibility
  AFTER UPDATE OF is_active ON public.listing_categories
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION public.cascade_category_visibility();

CREATE INDEX IF NOT EXISTS idx_listings_hidden_by_category
  ON public.listings (category_id)
  WHERE hidden_by_category = TRUE;

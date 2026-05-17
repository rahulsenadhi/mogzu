-- Phase 2 Feature 8 — CMS for public website content.
--
-- Single `cms_blocks` table covers every editable surface: hero banner,
-- feature grid card, promo banner, blog post, announcement, footer
-- column. The `kind` column tags the surface; the kind-specific extras
-- live in `payload` JSONB so we don't need a schema migration every
-- time marketing wants to add a new section type.
--
-- Scheduled publishing has no cron job. A row is "live" when:
--   status = 'published'  OR  (status = 'scheduled' AND scheduled_publish_at <= NOW())
-- The `cms_blocks_live` view encodes that rule and is the only thing the
-- public read policy exposes — drafts and future-scheduled rows stay
-- private to admins. A nightly job (or N8N) can call
-- `promote_scheduled_cms_blocks()` to flip status='scheduled' rows to
-- 'published' once their time arrives, so the audit columns
-- (published_at, published_by) stay accurate.

CREATE TABLE public.cms_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (
    kind IN (
      'hero',
      'feature_card',
      'promo_banner',
      'blog_post',
      'announcement',
      'footer_link_group'
    )
  ),
  title TEXT,
  body TEXT,
  image_path TEXT,
  image_url TEXT,
  cta_label TEXT,
  cta_href TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'scheduled', 'published', 'archived')
  ),
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cms_blocks_scheduled_requires_time CHECK (
    status <> 'scheduled' OR scheduled_publish_at IS NOT NULL
  )
);

CREATE INDEX idx_cms_blocks_kind_order
  ON public.cms_blocks (kind, display_order);
CREATE INDEX idx_cms_blocks_status_schedule
  ON public.cms_blocks (status, scheduled_publish_at)
  WHERE status IN ('scheduled', 'published');

CREATE TRIGGER trg_cms_blocks_updated_at
  BEFORE UPDATE ON public.cms_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── cms_featured_listings ──────────────────────────────────────────────────

CREATE TABLE public.cms_featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot TEXT NOT NULL CHECK (slot IN ('homepage_carousel', 'module_spotlight')),
  module TEXT CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slot, module, listing_id)
);

CREATE INDEX idx_cms_featured_listings_slot
  ON public.cms_featured_listings (slot, module, display_order);

-- ─── live view ──────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.cms_blocks_live AS
  SELECT id, slug, kind, title, body, image_path, image_url,
         cta_label, cta_href, payload, display_order,
         COALESCE(published_at, scheduled_publish_at) AS effective_at
    FROM public.cms_blocks
   WHERE status = 'published'
      OR (status = 'scheduled' AND scheduled_publish_at <= NOW());

GRANT SELECT ON public.cms_blocks_live TO anon, authenticated;

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages cms blocks"
  ON public.cms_blocks
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "Support reads cms blocks"
  ON public.cms_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

CREATE POLICY "Anyone reads featured listings"
  ON public.cms_featured_listings
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin manages featured listings"
  ON public.cms_featured_listings
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

-- ─── RPCs ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.publish_cms_block(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'publish_cms_block: admin required';
  END IF;

  UPDATE public.cms_blocks
  SET status = 'published',
      published_at = NOW(),
      published_by = auth.uid(),
      scheduled_publish_at = NULL
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'publish_cms_block: block % not found', p_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_cms_block(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.schedule_cms_block(p_id UUID, p_at TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'schedule_cms_block: admin required';
  END IF;

  IF p_at <= NOW() THEN
    RAISE EXCEPTION 'schedule_cms_block: scheduled time must be in the future';
  END IF;

  UPDATE public.cms_blocks
  SET status = 'scheduled',
      scheduled_publish_at = p_at,
      published_at = NULL,
      published_by = NULL
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'schedule_cms_block: block % not found', p_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.schedule_cms_block(UUID, TIMESTAMPTZ) TO authenticated;

CREATE OR REPLACE FUNCTION public.archive_cms_block(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'archive_cms_block: admin required';
  END IF;

  UPDATE public.cms_blocks
  SET status = 'archived',
      scheduled_publish_at = NULL
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'archive_cms_block: block % not found', p_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.archive_cms_block(UUID) TO authenticated;

-- Promote scheduled rows whose time has arrived. Idempotent; safe to call
-- from N8N every few minutes.
CREATE OR REPLACE FUNCTION public.promote_scheduled_cms_blocks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'promote_scheduled_cms_blocks: admin required';
  END IF;

  WITH promoted AS (
    UPDATE public.cms_blocks
    SET status = 'published',
        published_at = NOW()
    WHERE status = 'scheduled'
      AND scheduled_publish_at <= NOW()
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM promoted;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_scheduled_cms_blocks() TO authenticated;

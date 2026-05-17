-- Phase 2 Feature 7 — Mogzu Direct Listings on Supabase.
--
-- Mogzu publishes its own listings without a vendor approval workflow.
-- Reuses the existing `listings` table with `is_mogzu_direct = TRUE` so
-- the existing browse, booking, wishlist, and shortlist flows continue
-- to work unchanged. A well-known synthetic vendor row carries the
-- Mogzu Direct listings; admin CRUD goes through SECURITY DEFINER RPCs
-- so the vendor_id and is_mogzu_direct flag are forced server-side and
-- the caller's role is checked once per call.

-- Seed the synthetic Mogzu Direct vendor (idempotent).
INSERT INTO public.vendors (id, business_name, description, status)
VALUES (
  '00000000-0000-0000-0000-000000000d17',
  'Mogzu Direct',
  'Listings published and managed directly by the Mogzu team.',
  'active'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS mogzu_direct_alias TEXT,
  ADD COLUMN IF NOT EXISTS listing_kind TEXT;

CREATE INDEX IF NOT EXISTS idx_listings_mogzu_direct
  ON public.listings (status, created_at DESC)
  WHERE is_mogzu_direct = TRUE;

-- Admin needs to hard-delete Mogzu Direct rows (no vendor relationship to
-- preserve; booking history protected by FK ON DELETE rules elsewhere).
DROP POLICY IF EXISTS "listings_delete" ON public.listings;
CREATE POLICY "listings_delete" ON public.listings
  FOR DELETE USING (private.is_mogzu_admin());

-- ─── Helper: well-known Mogzu Direct vendor id ───────────────────────────────

CREATE OR REPLACE FUNCTION public.get_mogzu_direct_vendor_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.vendors WHERE business_name = 'Mogzu Direct' LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_mogzu_direct_vendor_id() TO authenticated;

-- ─── Admin-managed CRUD (RPC) ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_mogzu_direct_listing(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id UUID;
  v_id UUID;
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'create_mogzu_direct_listing: admin role required';
  END IF;

  SELECT id INTO v_vendor_id
    FROM public.vendors WHERE business_name = 'Mogzu Direct' LIMIT 1;
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'create_mogzu_direct_listing: Mogzu Direct vendor missing';
  END IF;

  INSERT INTO public.listings (
    vendor_id, module, category_id, title, description, status,
    pricing_type, base_price, price_unit, min_capacity, max_capacity,
    location_city, location_address, cancellation_policy, confirmation_sla_hours,
    is_mogzu_direct, mogzu_direct_alias, listing_kind, metadata
  ) VALUES (
    v_vendor_id,
    COALESCE(p_payload->>'module', 'events'),
    NULLIF(p_payload->>'category_id', '')::UUID,
    COALESCE(p_payload->>'title', 'Untitled'),
    p_payload->>'description',
    COALESCE(p_payload->>'status', 'draft'),
    COALESCE(p_payload->>'pricing_type', 'transparent'),
    NULLIF(p_payload->>'base_price', '')::NUMERIC,
    p_payload->>'price_unit',
    NULLIF(p_payload->>'min_capacity', '')::INTEGER,
    NULLIF(p_payload->>'max_capacity', '')::INTEGER,
    p_payload->>'location_city',
    p_payload->>'location_address',
    p_payload->>'cancellation_policy',
    COALESCE(NULLIF(p_payload->>'confirmation_sla_hours', '')::INTEGER, 24),
    TRUE,
    p_payload->>'mogzu_direct_alias',
    p_payload->>'listing_kind',
    COALESCE(p_payload->'metadata', '{}'::JSONB)
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_mogzu_direct_listing(JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_mogzu_direct_listing(
  p_id UUID,
  p_payload JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'update_mogzu_direct_listing: admin role required';
  END IF;

  UPDATE public.listings SET
    module = COALESCE(p_payload->>'module', module),
    category_id = COALESCE(NULLIF(p_payload->>'category_id', '')::UUID, category_id),
    title = COALESCE(p_payload->>'title', title),
    description = COALESCE(p_payload->>'description', description),
    status = COALESCE(p_payload->>'status', status),
    pricing_type = COALESCE(p_payload->>'pricing_type', pricing_type),
    base_price = COALESCE(NULLIF(p_payload->>'base_price', '')::NUMERIC, base_price),
    price_unit = COALESCE(p_payload->>'price_unit', price_unit),
    min_capacity = COALESCE(NULLIF(p_payload->>'min_capacity', '')::INTEGER, min_capacity),
    max_capacity = COALESCE(NULLIF(p_payload->>'max_capacity', '')::INTEGER, max_capacity),
    location_city = COALESCE(p_payload->>'location_city', location_city),
    location_address = COALESCE(p_payload->>'location_address', location_address),
    cancellation_policy = COALESCE(p_payload->>'cancellation_policy', cancellation_policy),
    confirmation_sla_hours = COALESCE(
      NULLIF(p_payload->>'confirmation_sla_hours', '')::INTEGER,
      confirmation_sla_hours
    ),
    mogzu_direct_alias = COALESCE(p_payload->>'mogzu_direct_alias', mogzu_direct_alias),
    listing_kind = COALESCE(p_payload->>'listing_kind', listing_kind),
    metadata = COALESCE(p_payload->'metadata', metadata),
    updated_at = NOW()
  WHERE id = p_id AND is_mogzu_direct = TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_mogzu_direct_listing(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_mogzu_direct_status(p_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'set_mogzu_direct_status: admin role required';
  END IF;
  IF p_status NOT IN ('draft', 'pending_approval', 'active', 'paused', 'rejected') THEN
    RAISE EXCEPTION 'set_mogzu_direct_status: invalid status %', p_status;
  END IF;
  UPDATE public.listings
     SET status = p_status, updated_at = NOW()
   WHERE id = p_id AND is_mogzu_direct = TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_mogzu_direct_status(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_mogzu_direct_listing(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'delete_mogzu_direct_listing: admin role required';
  END IF;
  DELETE FROM public.listings WHERE id = p_id AND is_mogzu_direct = TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_mogzu_direct_listing(UUID) TO authenticated;

-- ─── Read helpers ────────────────────────────────────────────────────────────

-- Returns Mogzu Direct rows joined with image storage paths. When
-- `p_admin = TRUE` and the caller is an admin, all statuses are returned;
-- otherwise only active rows surface (matches the listings RLS contract).
CREATE OR REPLACE FUNCTION public.list_mogzu_direct_listings(p_admin BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
  id UUID,
  module TEXT,
  category_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  pricing_type TEXT,
  base_price NUMERIC,
  price_unit TEXT,
  min_capacity INTEGER,
  max_capacity INTEGER,
  location_city TEXT,
  location_address TEXT,
  cancellation_policy TEXT,
  confirmation_sla_hours INTEGER,
  mogzu_direct_alias TEXT,
  listing_kind TEXT,
  metadata JSONB,
  images JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id, l.module, l.category_id, l.title, l.description, l.status,
    l.pricing_type, l.base_price, l.price_unit, l.min_capacity, l.max_capacity,
    l.location_city, l.location_address, l.cancellation_policy,
    l.confirmation_sla_hours, l.mogzu_direct_alias, l.listing_kind, l.metadata,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
                'id', li.id,
                'storage_path', li.storage_path,
                'display_order', li.display_order
              ) ORDER BY li.display_order)
         FROM public.listing_images li WHERE li.listing_id = l.id),
      '[]'::JSONB
    ) AS images,
    l.created_at, l.updated_at
  FROM public.listings l
  WHERE l.is_mogzu_direct = TRUE
    AND (
      (p_admin = TRUE AND private.is_mogzu_admin())
      OR l.status = 'active'
    );
$$;

GRANT EXECUTE ON FUNCTION public.list_mogzu_direct_listings(BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_mogzu_direct_listing(p_id UUID)
RETURNS TABLE (
  id UUID,
  module TEXT,
  category_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  pricing_type TEXT,
  base_price NUMERIC,
  price_unit TEXT,
  min_capacity INTEGER,
  max_capacity INTEGER,
  location_city TEXT,
  location_address TEXT,
  cancellation_policy TEXT,
  confirmation_sla_hours INTEGER,
  mogzu_direct_alias TEXT,
  listing_kind TEXT,
  metadata JSONB,
  images JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id, l.module, l.category_id, l.title, l.description, l.status,
    l.pricing_type, l.base_price, l.price_unit, l.min_capacity, l.max_capacity,
    l.location_city, l.location_address, l.cancellation_policy,
    l.confirmation_sla_hours, l.mogzu_direct_alias, l.listing_kind, l.metadata,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
                'id', li.id,
                'storage_path', li.storage_path,
                'display_order', li.display_order
              ) ORDER BY li.display_order)
         FROM public.listing_images li WHERE li.listing_id = l.id),
      '[]'::JSONB
    ) AS images,
    l.created_at, l.updated_at
  FROM public.listings l
  WHERE l.id = p_id
    AND l.is_mogzu_direct = TRUE
    AND (
      private.is_mogzu_admin()
      OR l.status = 'active'
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_mogzu_direct_listing(UUID) TO authenticated;

-- ─── Image management RPCs ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_mogzu_direct_images(
  p_listing_id UUID,
  p_image_paths TEXT[]
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_path TEXT;
  v_idx INTEGER := 0;
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'set_mogzu_direct_images: admin role required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = p_listing_id AND is_mogzu_direct = TRUE
  ) THEN
    RAISE EXCEPTION 'set_mogzu_direct_images: listing not found';
  END IF;

  DELETE FROM public.listing_images WHERE listing_id = p_listing_id;

  IF p_image_paths IS NULL THEN
    RETURN;
  END IF;

  FOREACH v_path IN ARRAY p_image_paths LOOP
    IF v_path IS NOT NULL AND length(trim(v_path)) > 0 THEN
      INSERT INTO public.listing_images (listing_id, storage_path, display_order)
      VALUES (p_listing_id, v_path, v_idx);
      v_idx := v_idx + 1;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_mogzu_direct_images(UUID, TEXT[]) TO authenticated;

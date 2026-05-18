-- Phase 3 Feature 1 (part 1) — Public Catalogue Browse foundation.
--
-- Add an explicit `public_visible` flag on listings so a vendor /
-- admin can decide which active listings appear on the unauthenticated
-- /explore routes. The existing listings_select policy allowed any
-- authenticated user to read active listings — we widen it to also
-- allow anonymous reads when public_visible = TRUE, while keeping
-- the vendor-only + admin-only branches intact.
--
-- Phase 3 P3.1 will pair this DB change with the /explore/:module
-- routes and SSR meta tags.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS public_visible BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_listings_public
  ON public.listings (module, public_visible, status)
  WHERE public_visible = TRUE AND status = 'active';

-- Update the existing select policy. Authenticated users continue to
-- see every active listing (existing behaviour); anonymous clients now
-- only see active + public_visible rows.
DROP POLICY IF EXISTS "listings_select" ON public.listings;

CREATE POLICY "listings_select" ON public.listings
  FOR SELECT USING (
    (
      auth.uid() IS NOT NULL
      AND (
        status = 'active'
        OR private.is_mogzu_admin()
        OR vendor_id = private.user_vendor_id()
      )
    )
    OR (
      auth.uid() IS NULL
      AND status = 'active'
      AND public_visible = TRUE
    )
  );

-- Mirror on listing_images so anon can see images of the listings
-- they can see.
DROP POLICY IF EXISTS "listing_images_select" ON public.listing_images;

CREATE POLICY "listing_images_select" ON public.listing_images
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM public.listings
      WHERE (
        auth.uid() IS NOT NULL
        AND (
          status = 'active'
          OR private.is_mogzu_admin()
          OR vendor_id = private.user_vendor_id()
        )
      )
      OR (
        auth.uid() IS NULL
        AND status = 'active'
        AND public_visible = TRUE
      )
    )
  );

-- Mirror on listing_add_ons.
DROP POLICY IF EXISTS "listing_add_ons_select" ON public.listing_add_ons;

CREATE POLICY "listing_add_ons_select" ON public.listing_add_ons
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM public.listings
      WHERE (
        auth.uid() IS NOT NULL
        AND (
          status = 'active'
          OR private.is_mogzu_admin()
          OR vendor_id = private.user_vendor_id()
        )
      )
      OR (
        auth.uid() IS NULL
        AND status = 'active'
        AND public_visible = TRUE
      )
    )
  );

-- Vendor business_name + cover_image are the only fields we want to
-- leak to anon (so listing cards can show "by FooVendor"). Other vendor
-- columns (bank details, contact emails) stay private. The view sits in
-- public so the anon role can SELECT from it.
CREATE OR REPLACE VIEW public.vendors_public AS
  SELECT id, business_name, description, status
    FROM public.vendors
   WHERE status = 'active';

GRANT SELECT ON public.vendors_public TO anon, authenticated;

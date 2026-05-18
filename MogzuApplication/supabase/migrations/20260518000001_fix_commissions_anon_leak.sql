-- 2026-05-18 — RLS smoke test caught the global commission row leaking
-- to anonymous clients. The original `commissions_select` policy
-- exposed any row with `scope = 'global'` to everyone (including anon)
-- because the OR branch had no auth predicate. Vendors should see
-- their own rate plus the global rate, but only when authenticated.

DROP POLICY IF EXISTS "commissions_select" ON public.commissions;

CREATE POLICY "commissions_select" ON public.commissions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      private.is_mogzu_admin()
      OR (vendor_id = private.user_vendor_id() AND scope = 'vendor')
      OR scope = 'global'
    )
  );

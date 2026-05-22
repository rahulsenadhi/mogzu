-- Plan Batch 9 — scoped RBAC for field_agent + account_manager + partner.
--
-- The base bookings_select policy covers mogzu_admin / vendor / corporate
-- L2+L3 / booking owner. Three internal/external roles still had no
-- bookings read path:
--
--   field_agent      - reads active bookings only (confirmed, pending_vendor,
--                      in_progress) so the agent queue and proof-capture
--                      flows work without exposing draft / cancelled rows.
--   account_manager  - reads bookings for the corporates they are assigned
--                      to via corporate_accounts.account_manager_id.
--   partner          - reads bookings where partner_id matches a partners
--                      row owned by the user.
--
-- Each policy is additive (FOR SELECT) so it composes with the existing
-- bookings_select policy via PostgreSQL's OR-of-policies semantics.

DROP POLICY IF EXISTS "bookings_select_field_agent" ON public.bookings;
CREATE POLICY "bookings_select_field_agent" ON public.bookings
  FOR SELECT
  USING (
    private.user_role() = 'field_agent'
    AND status IN ('confirmed', 'pending_vendor', 'in_progress')
  );

DROP POLICY IF EXISTS "bookings_select_account_manager" ON public.bookings;
CREATE POLICY "bookings_select_account_manager" ON public.bookings
  FOR SELECT
  USING (
    private.user_role() = 'account_manager'
    AND corporate_id IN (
      SELECT id FROM public.corporate_accounts
      WHERE account_manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "bookings_select_partner" ON public.bookings;
CREATE POLICY "bookings_select_partner" ON public.bookings
  FOR SELECT
  USING (
    private.user_role() = 'partner'
    AND partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- ─── Mirror onto booking_add_ons so detail views work for these roles ───────
DROP POLICY IF EXISTS "booking_add_ons_select_scoped_roles" ON public.booking_add_ons;
CREATE POLICY "booking_add_ons_select_scoped_roles" ON public.booking_add_ons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (
          (private.user_role() = 'field_agent' AND b.status IN ('confirmed','pending_vendor','in_progress'))
          OR (private.user_role() = 'account_manager' AND b.corporate_id IN (
                SELECT id FROM public.corporate_accounts WHERE account_manager_id = auth.uid()
              ))
          OR (private.user_role() = 'partner' AND b.partner_id IN (
                SELECT id FROM public.partners WHERE user_id = auth.uid()
              ))
        )
    )
  );

-- ─── Index hint for the AM scope path (corp -> bookings) ─────────────────────
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_am
  ON public.corporate_accounts (account_manager_id)
  WHERE account_manager_id IS NOT NULL;

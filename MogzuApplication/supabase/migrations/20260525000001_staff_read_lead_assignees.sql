-- Sales/support can read active staff profiles for lead assignment dropdowns.
-- NOTE: the caller-role check MUST go through private.user_role() (SECURITY
-- DEFINER, RLS-bypassing). A raw `EXISTS (SELECT FROM user_profiles ...)` inside
-- a policy ON user_profiles causes infinite recursion (Postgres 42P17) and
-- breaks every authenticated read of the table, including login profile load.

DROP POLICY IF EXISTS "Staff read lead assignees" ON public.user_profiles;
CREATE POLICY "Staff read lead assignees" ON public.user_profiles
  FOR SELECT
  USING (
    status = 'active'
    AND role IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager')
    AND private.user_role() IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager')
  );

-- account_manager may update leads (pipeline access)
DROP POLICY IF EXISTS "Staff updates leads" ON public.public_leads;
CREATE POLICY "Staff updates leads" ON public.public_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager')
    )
  );

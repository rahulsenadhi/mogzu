-- Sales/support can read active staff profiles for lead assignment dropdowns.

DROP POLICY IF EXISTS "Staff read lead assignees" ON public.user_profiles;
CREATE POLICY "Staff read lead assignees" ON public.user_profiles
  FOR SELECT
  USING (
    status = 'active'
    AND role IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager')
    AND EXISTS (
      SELECT 1 FROM public.user_profiles me
      WHERE me.id = auth.uid()
        AND me.role IN ('mogzu_admin', 'support', 'sales_agent', 'account_manager')
    )
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

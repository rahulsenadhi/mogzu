-- Allow sales/support staff to update leads (status, metadata notes) — not only mogzu_admin.

DROP POLICY IF EXISTS "Staff updates leads" ON public.public_leads;
CREATE POLICY "Staff updates leads" ON public.public_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );

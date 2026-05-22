-- Approval workflow routing rules per corporate.
-- ApprovalWorkflowPage editor at /settings/workflow persists rows here.
-- Booking submit-side reads rules to decide which manager level must approve.

CREATE TABLE IF NOT EXISTS public.approval_workflow_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  threshold NUMERIC(12, 2) NOT NULL DEFAULT 0,
  required_levels TEXT[] NOT NULL DEFAULT ARRAY['L1']::TEXT[],
  exception_note TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_awr_corp_active
  ON public.approval_workflow_rules (corporate_id, display_order)
  WHERE is_active = true;

ALTER TABLE public.approval_workflow_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_workflow_rules l3 manages own corp"
  ON public.approval_workflow_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.corporate_id = approval_workflow_rules.corporate_id
        AND p.role = 'l3_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.corporate_id = approval_workflow_rules.corporate_id
        AND p.role = 'l3_admin'
    )
  );

CREATE POLICY "approval_workflow_rules corp members read own"
  ON public.approval_workflow_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.corporate_id = approval_workflow_rules.corporate_id
    )
  );

CREATE POLICY "approval_workflow_rules mogzu admin all"
  ON public.approval_workflow_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'mogzu_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'mogzu_admin'
    )
  );

-- Touch updated_at on UPDATE.
CREATE OR REPLACE FUNCTION public.touch_approval_workflow_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_awr_touch_updated_at ON public.approval_workflow_rules;
CREATE TRIGGER trg_awr_touch_updated_at
  BEFORE UPDATE ON public.approval_workflow_rules
  FOR EACH ROW EXECUTE FUNCTION public.touch_approval_workflow_rules_updated_at();

NOTIFY pgrst, 'reload schema';

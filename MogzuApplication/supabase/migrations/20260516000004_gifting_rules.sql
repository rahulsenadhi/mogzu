-- ─── Gifting Rules (Story 4.1) ───────────────────────────────────────────────
--
-- L3 Admin configures per-occasion gifting policies: budget cap per recipient,
-- auto-approve threshold, scope (company-wide or specific department), and an
-- optional preferred-vendor list (filters gifting shop for the employee).
--
-- Occasions may be fixed-date (Diwali) or dynamic-trigger (employee birthday
-- pulled from HRMS). Fixed-date occasions carry trigger_date; dynamic
-- triggers carry trigger_kind (e.g. 'birthday', 'work_anniversary').

CREATE TABLE public.gifting_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  occasion_name TEXT NOT NULL,
  trigger_kind TEXT NOT NULL CHECK (
    trigger_kind IN ('fixed_date', 'birthday', 'work_anniversary', 'manual')
  ),
  trigger_date DATE,
  budget_per_recipient NUMERIC(12, 2) NOT NULL CHECK (budget_per_recipient > 0),
  requires_approval BOOLEAN DEFAULT FALSE,
  scope TEXT NOT NULL DEFAULT 'company' CHECK (scope IN ('company', 'department')),
  scope_value TEXT,
  preferred_vendor_ids UUID[] DEFAULT '{}'::UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifting_rules_corp_active ON public.gifting_rules (corporate_id, is_active);
CREATE INDEX idx_gifting_rules_trigger ON public.gifting_rules (trigger_kind, trigger_date);

CREATE TRIGGER trg_gifting_rules_updated_at
  BEFORE UPDATE ON public.gifting_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS

ALTER TABLE public.gifting_rules ENABLE ROW LEVEL SECURITY;

-- Corporate users can read their own corporate's rules
CREATE POLICY "Corporate members can read gifting_rules"
  ON public.gifting_rules
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Only L3 admin (and mogzu_admin) can mutate
CREATE POLICY "L3 admin can manage gifting_rules"
  ON public.gifting_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = gifting_rules.corporate_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = gifting_rules.corporate_id
    )
  );

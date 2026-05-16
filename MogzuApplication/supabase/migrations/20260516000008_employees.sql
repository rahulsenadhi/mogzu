-- ─── Corporate Employee Directory (Story 10.0) ───────────────────────────────
--
-- Separate from user_profiles (which requires a Supabase auth user). L3 Admin
-- uploads CSV to seed celebration triggers + ICP for the gifting programme.
-- When an employee later signs up, user_profiles row links by email.
--
-- Used by 10.1 (celebration triggers) for DOB / join_date evaluation.

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT,
  role_hint TEXT,
  dob DATE,
  join_date DATE,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (corporate_id, email)
);

CREATE INDEX idx_employees_corp ON public.employees (corporate_id, is_active);
CREATE INDEX idx_employees_dob ON public.employees (corporate_id, dob)
  WHERE dob IS NOT NULL;
CREATE INDEX idx_employees_join_date ON public.employees (corporate_id, join_date)
  WHERE join_date IS NOT NULL;

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Corporate members can read their corporate's employees
CREATE POLICY "Corporate members read own employees"
  ON public.employees
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Only L3 admin / mogzu_admin can write
CREATE POLICY "L3 admin manages employees"
  ON public.employees
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = employees.corporate_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('l3_admin', 'mogzu_admin')
        AND p.corporate_id = employees.corporate_id
    )
  );

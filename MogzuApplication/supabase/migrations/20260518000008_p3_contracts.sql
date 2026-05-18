-- Phase 3 Feature 8 — Contract billing + invoice generation.
--
-- Enterprise corporates pay against named contracts with line-item
-- rate cards. Invoice generation runs monthly per corporate and emits
-- one PDF aggregating contracted bookings. PDF rendering reuses the
-- partner statement infra (Sprint 21).

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  term_starts_on DATE NOT NULL,
  term_ends_on DATE,
  payment_terms_days SMALLINT NOT NULL DEFAULT 30
    CHECK (payment_terms_days IN (0, 7, 15, 30, 45, 60, 90)),
  currency TEXT NOT NULL DEFAULT 'INR' REFERENCES public.currencies(code),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'active', 'paused', 'expired', 'terminated')
  ),
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_corporate
  ON public.contracts (corporate_id, status, term_starts_on);

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contract_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (
    kind IN ('event_type', 'gift_unit', 'space_night', 'space_day', 'custom')
  ),
  description TEXT NOT NULL,
  unit_rate NUMERIC(12, 2) NOT NULL CHECK (unit_rate >= 0),
  notes TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_line_items
  ON public.contract_line_items (contract_id, display_order);

CREATE TABLE IF NOT EXISTS public.invoice_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  period_starts_on DATE NOT NULL,
  period_ends_on DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'finalised', 'sent', 'paid', 'overdue', 'cancelled')
  ),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  pdf_storage_path TEXT,
  finalised_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (contract_id, period_starts_on, period_ends_on)
);

CREATE INDEX IF NOT EXISTS idx_invoice_runs_status
  ON public.invoice_runs (status, period_ends_on);

CREATE TRIGGER trg_invoice_runs_updated_at
  BEFORE UPDATE ON public.invoice_runs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bookings may attach to a contract; pricing override happens at
-- checkout when bookings.contract_id is set.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_contract
  ON public.bookings (contract_id)
  WHERE contract_id IS NOT NULL;

-- RLS — admin manages everything; corporate L3 reads own contracts;
-- corporate L1/L2 read invoice runs to see what they'll owe.
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages contracts" ON public.contracts;
CREATE POLICY "Admin manages contracts" ON public.contracts
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Corporate reads own contracts" ON public.contracts;
CREATE POLICY "Corporate reads own contracts" ON public.contracts
  FOR SELECT USING (
    corporate_id IN (
      SELECT p.corporate_id FROM public.user_profiles p
      WHERE p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin manages contract_line_items" ON public.contract_line_items;
CREATE POLICY "Admin manages contract_line_items" ON public.contract_line_items
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Corporate reads own line items" ON public.contract_line_items;
CREATE POLICY "Corporate reads own line items" ON public.contract_line_items
  FOR SELECT USING (
    contract_id IN (
      SELECT c.id FROM public.contracts c
      JOIN public.user_profiles p ON p.corporate_id = c.corporate_id
      WHERE p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin manages invoice_runs" ON public.invoice_runs;
CREATE POLICY "Admin manages invoice_runs" ON public.invoice_runs
  FOR ALL USING (private.is_mogzu_admin()) WITH CHECK (private.is_mogzu_admin());

DROP POLICY IF EXISTS "Corporate reads own invoices" ON public.invoice_runs;
CREATE POLICY "Corporate reads own invoices" ON public.invoice_runs
  FOR SELECT USING (
    contract_id IN (
      SELECT c.id FROM public.contracts c
      JOIN public.user_profiles p ON p.corporate_id = c.corporate_id
      WHERE p.id = auth.uid()
    )
  );

-- RPC: kick off an invoice run for a contract + period. Aggregates
-- contracted bookings in the window, applies line-item rates, totals.
-- PDF rendering happens client-side (or via a future N8N step); this
-- RPC seeds the row + subtotal so the admin UI can iterate.
CREATE OR REPLACE FUNCTION public.create_invoice_run(
  p_contract_id UUID,
  p_period_starts_on DATE,
  p_period_ends_on DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_currency TEXT;
  v_subtotal NUMERIC := 0;
  v_id UUID;
BEGIN
  IF NOT private.is_mogzu_admin() THEN
    RAISE EXCEPTION 'create_invoice_run: admin required';
  END IF;

  SELECT currency INTO v_currency FROM public.contracts WHERE id = p_contract_id;
  IF v_currency IS NULL THEN
    RAISE EXCEPTION 'create_invoice_run: contract % not found', p_contract_id;
  END IF;

  -- Sum total_amount of bookings on this contract that completed in
  -- the period window. Refunds + cancellations excluded.
  SELECT COALESCE(SUM(total_amount), 0) INTO v_subtotal
  FROM public.bookings
  WHERE contract_id = p_contract_id
    AND status = 'completed'
    AND completed_at >= p_period_starts_on
    AND completed_at < p_period_ends_on + INTERVAL '1 day';

  INSERT INTO public.invoice_runs (
    contract_id, period_starts_on, period_ends_on, status,
    subtotal, tax_amount, total, currency
  )
  VALUES (
    p_contract_id, p_period_starts_on, p_period_ends_on, 'draft',
    v_subtotal, ROUND(v_subtotal * 0.18, 2), ROUND(v_subtotal * 1.18, 2), v_currency
  )
  ON CONFLICT (contract_id, period_starts_on, period_ends_on) DO UPDATE
    SET subtotal = EXCLUDED.subtotal,
        tax_amount = EXCLUDED.tax_amount,
        total = EXCLUDED.total,
        currency = EXCLUDED.currency,
        status = CASE WHEN invoice_runs.status = 'draft' THEN 'draft' ELSE invoice_runs.status END
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_invoice_run(UUID, DATE, DATE) TO authenticated;

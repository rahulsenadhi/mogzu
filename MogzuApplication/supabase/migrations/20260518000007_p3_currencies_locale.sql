-- Phase 3 Feature 7 — Multi-currency display + i18n foundation.
--
-- Display-only currency layer; real per-vendor settlement in non-INR
-- ships in P4.3 with Wise rails. P3 stores the FX rate table + the
-- per-user locale preference, and adds a formatPrice helper on the
-- client side that reads both.

CREATE TABLE IF NOT EXISTS public.currencies (
  code TEXT PRIMARY KEY CHECK (length(code) = 3),
  symbol TEXT NOT NULL,
  decimal_places SMALLINT NOT NULL DEFAULT 2,
  -- FX rate to base currency (INR). 1 unit of `code` = fx_rate INR.
  fx_rate NUMERIC(18, 8) NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  fx_updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_order SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_currencies_active
  ON public.currencies (display_order)
  WHERE is_active = TRUE;

ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads currencies" ON public.currencies;
CREATE POLICY "Anyone reads currencies" ON public.currencies
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin manages currencies" ON public.currencies;
CREATE POLICY "Admin manages currencies" ON public.currencies
  FOR ALL
  USING (private.is_mogzu_admin())
  WITH CHECK (private.is_mogzu_admin());

INSERT INTO public.currencies (code, symbol, decimal_places, fx_rate, is_active, display_order) VALUES
  ('INR', '₹', 2, 1.00000000, TRUE, 1),
  ('USD', '$', 2, 83.50000000, TRUE, 2),
  ('SGD', 'S$', 2, 62.10000000, TRUE, 3),
  ('AED', 'د.إ', 2, 22.75000000, TRUE, 4),
  ('GBP', '£', 2, 105.20000000, TRUE, 5),
  ('EUR', '€', 2, 90.40000000, TRUE, 6)
ON CONFLICT (code) DO NOTHING;

-- Per-user locale preference. Display currency + language.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en-IN',
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT REFERENCES public.currencies(code);

-- RPC for N8N nightly FX refresh (calls an external provider, then
-- calls this with the latest rates). Service-role or admin only.
CREATE OR REPLACE FUNCTION public.update_currency_fx_rates(p_rates JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_added INTEGER;
  v_code TEXT;
  v_rate NUMERIC;
BEGIN
  IF NOT (auth.role() = 'service_role' OR private.is_mogzu_admin()) THEN
    RAISE EXCEPTION 'update_currency_fx_rates: service_role or admin required';
  END IF;

  FOR v_code, v_rate IN SELECT key, value::TEXT::NUMERIC FROM jsonb_each_text(p_rates) LOOP
    UPDATE public.currencies
    SET fx_rate = v_rate, fx_updated_at = NOW()
    WHERE code = v_code;
    GET DIAGNOSTICS v_added = ROW_COUNT;
    v_count := v_count + v_added;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_currency_fx_rates(JSONB) TO authenticated;

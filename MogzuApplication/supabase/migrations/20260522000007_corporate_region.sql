-- BATCH 12 — corporate region + default currency.
--
-- The corporate signup flow currently captures countryCode at the form
-- level but never persists it. To support region-gated payment methods
-- (PayNow for SG, Mada for SA) and multi-currency display, persist a
-- two-letter ISO region + default_currency code on corporate_accounts.
-- default_currency is nullable; null means inherit the global INR default.

ALTER TABLE public.corporate_accounts
  ADD COLUMN IF NOT EXISTS region TEXT CHECK (length(region) = 2),
  ADD COLUMN IF NOT EXISTS default_currency TEXT REFERENCES public.currencies(code);

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_region
  ON public.corporate_accounts (region)
  WHERE region IS NOT NULL;

-- Seed SAR so the SA region picker option has a valid default_currency.
INSERT INTO public.currencies (code, symbol, decimal_places, fx_rate, is_active, display_order) VALUES
  ('SAR', 'ر.س', 2, 22.20000000, TRUE, 7)
ON CONFLICT (code) DO NOTHING;

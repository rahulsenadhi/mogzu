-- Phase 3 Feature 8 (follow-up) — invoice PDF + email delivery wiring.
--
-- AdminInvoiceRunPage already prints via the browser's Save-as-PDF; this
-- migration adds the headless-render pipeline on top:
--   1. New column `email_sent_at` on invoice_runs so we can track
--      delivery independently of the status field (an invoice can be
--      `sent` because someone clicked "Mark sent" but the customer
--      email hasn't fired yet — keep the two signals separate).
--   2. RPC `mark_invoice_pdf_uploaded(invoice_id, storage_path)` —
--      service_role-only writer for the n8n Puppeteer renderer.
--   3. RPC `mark_invoice_emailed(invoice_id)` — stamps email_sent_at
--      and bumps status to 'sent' if still draft/finalised.
--   4. `invoices` storage bucket (private) for the rendered PDFs.

ALTER TABLE public.invoice_runs
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- ─── Storage bucket ─────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Only mogzu_admin / support roles can read invoice PDFs via storage RLS.
-- (Customers receive a signed URL in their email, so direct bucket reads
-- are gated to staff.)
DROP POLICY IF EXISTS "Staff reads invoices bucket" ON storage.objects;
CREATE POLICY "Staff reads invoices bucket" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'invoices'
    AND private.is_mogzu_admin()
  );

DROP POLICY IF EXISTS "Service role writes invoices bucket" ON storage.objects;
CREATE POLICY "Service role writes invoices bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices'
    AND (auth.role() = 'service_role' OR private.is_mogzu_admin())
  );

-- ─── RPCs ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_invoice_pdf_uploaded(
  p_invoice_id UUID,
  p_storage_path TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    auth.role() = 'service_role'
    OR private.is_mogzu_admin()
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.invoice_runs
  SET pdf_storage_path = p_storage_path,
      updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_invoice_pdf_uploaded(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_invoice_pdf_uploaded(UUID, TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.mark_invoice_emailed(
  p_invoice_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    auth.role() = 'service_role'
    OR private.is_mogzu_admin()
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.invoice_runs
  SET email_sent_at = NOW(),
      sent_at = COALESCE(sent_at, NOW()),
      status = CASE
        WHEN status IN ('draft', 'finalised') THEN 'sent'
        ELSE status
      END,
      updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_invoice_emailed(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_invoice_emailed(UUID) TO authenticated, service_role;

-- Plan Batch 4 slice 4 — vendor KYC stub.
--
-- Pre-Persona/Onfido placeholder: vendor uploads a single identity/business
-- document to the documents bucket, status starts at 'submitted', admin
-- flips it through review/approved/rejected from the application queue.
-- vendors.kyc_status='approved' is the new gate the admin approve action
-- enforces before flipping vendor.status='active'.

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS kyc_doc_url TEXT,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (kyc_status IN ('not_started', 'submitted', 'review', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_vendors_kyc_status
  ON public.vendors (kyc_status)
  WHERE kyc_status <> 'not_started';

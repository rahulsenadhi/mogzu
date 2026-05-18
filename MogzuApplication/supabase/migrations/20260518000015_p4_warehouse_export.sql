-- Phase 4 Feature 5 — warehouse export views.
--
-- BigQuery / Snowflake / Redshift sinks pull from these views nightly
-- (n8n workflow warehouse-export.json). Each view is a flat, append-
-- only projection — joins are pre-resolved so downstream warehouse
-- tables don't need Mogzu-side semantics.

CREATE OR REPLACE VIEW public.warehouse_bookings_v1 AS
SELECT
  b.id,
  b.created_at,
  b.updated_at,
  b.corporate_id,
  ca.name AS corporate_name,
  ca.region AS corporate_region,
  b.requester_id,
  b.vendor_id,
  v.business_name AS vendor_name,
  v.region AS vendor_region,
  b.listing_id,
  l.module,
  l.title AS listing_title,
  b.status,
  b.headcount,
  b.event_date,
  b.total_amount_inr,
  b.settlement_currency,
  b.settlement_fx_rate,
  b.contract_id,
  b.created_by_agent_id,
  b.white_label_partner_id
FROM public.bookings b
LEFT JOIN public.corporate_accounts ca ON ca.id = b.corporate_id
LEFT JOIN public.vendors v ON v.id = b.vendor_id
LEFT JOIN public.listings l ON l.id = b.listing_id;

-- Wrap an admin-only access check around the view so even a
-- mis-configured warehouse sync can't leak through anon.
ALTER VIEW public.warehouse_bookings_v1 SET (security_invoker = on);

CREATE OR REPLACE VIEW public.warehouse_invoices_v1 AS
SELECT
  ir.id,
  ir.contract_id,
  c.corporate_id,
  ca.name AS corporate_name,
  ir.period_starts_on,
  ir.period_ends_on,
  ir.status,
  ir.subtotal,
  ir.tax_amount,
  ir.total,
  ir.currency,
  ir.finalised_at,
  ir.sent_at,
  ir.paid_at,
  ir.email_sent_at,
  ir.created_at,
  ir.updated_at
FROM public.invoice_runs ir
JOIN public.contracts c ON c.id = ir.contract_id
LEFT JOIN public.corporate_accounts ca ON ca.id = c.corporate_id;

ALTER VIEW public.warehouse_invoices_v1 SET (security_invoker = on);

-- Mirror RLS via base tables; only admin can SELECT from the view.
REVOKE ALL ON public.warehouse_bookings_v1 FROM PUBLIC;
REVOKE ALL ON public.warehouse_invoices_v1 FROM PUBLIC;
GRANT SELECT ON public.warehouse_bookings_v1 TO authenticated, service_role;
GRANT SELECT ON public.warehouse_invoices_v1 TO authenticated, service_role;

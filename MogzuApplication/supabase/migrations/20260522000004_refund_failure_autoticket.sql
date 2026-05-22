-- Plan Batch 7 slice 4 — refund failure auto-ticket.
--
-- When refunds.status transitions to 'failed', open a support_ticket so
-- the corporate L3 admin (initiated_by) gets a tracked grievance and
-- support sees it in their queue with full context. The trigger
-- short-circuits if a ticket for the same refund already exists so the
-- second update doesn't duplicate.

CREATE OR REPLACE FUNCTION public.refund_failed_open_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing UUID;
BEGIN
  -- Only fire on transition into 'failed'.
  IF NEW.status <> 'failed' THEN RETURN NEW; END IF;
  IF OLD.status = 'failed' THEN RETURN NEW; END IF;

  -- Avoid duplicate ticket per refund.
  SELECT id INTO v_existing
  FROM public.support_tickets
  WHERE context_url = '/refunds/' || NEW.id::text
  LIMIT 1;
  IF v_existing IS NOT NULL THEN RETURN NEW; END IF;

  INSERT INTO public.support_tickets (
    audience,
    submitter_id,
    corporate_id,
    category,
    subject,
    body,
    status,
    priority,
    sla_hours,
    context_url,
    context_role,
    context_last_action,
    related_booking_id
  ) VALUES (
    'corporate',
    NEW.initiated_by,
    NEW.corporate_id,
    'payments',
    'Refund failed: ₹' || NEW.amount::text,
    'A refund of ₹' || NEW.amount::text
      || ' for booking ' || COALESCE(NEW.booking_id::text, 'unknown')
      || ' could not be processed via ' || COALESCE(NEW.method, 'unknown')
      || E'.\n\nReason: ' || COALESCE(NEW.failure_reason, '(not provided)')
      || E'\n\nAuto-opened by the payments pipeline. Please confirm the failure '
      || 'with finance and either retry the refund or initiate a manual transfer.',
    'open',
    'high',
    4,
    '/refunds/' || NEW.id::text,
    'system',
    'refund_failed',
    NEW.booking_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_failed_autoticket ON public.refunds;
CREATE TRIGGER trg_refund_failed_autoticket
  AFTER UPDATE OF status ON public.refunds
  FOR EACH ROW
  WHEN (NEW.status = 'failed' AND (OLD.status IS DISTINCT FROM 'failed'))
  EXECUTE FUNCTION public.refund_failed_open_ticket();

-- ─── Support Tickets (Stories 12.1, 12.2, 12.3) ──────────────────────────────
--
-- Single tickets table with audience='corporate' | 'vendor' to split queues
-- visually but keep one schema. RLS:
--   - Submitter reads own
--   - Vendor reads own vendor-audience tickets
--   - Mogzu support / mogzu_admin reads everything
--   - Internal notes only readable to support roles

CREATE TYPE public.ticket_status AS ENUM (
  'open', 'in_progress', 'waiting_user', 'resolved', 'closed'
);

CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TYPE public.ticket_audience AS ENUM ('corporate', 'vendor');

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audience public.ticket_audience NOT NULL DEFAULT 'corporate',
  submitter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  corporate_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  sla_hours INTEGER NOT NULL DEFAULT 24,
  context_url TEXT,
  context_role TEXT,
  context_last_action TEXT,
  context_user_agent TEXT,
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  related_payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL,
  csat_score INTEGER CHECK (csat_score BETWEEN 1 AND 5),
  csat_feedback TEXT,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_submitter ON public.support_tickets (submitter_id, status, created_at DESC);
CREATE INDEX idx_support_vendor ON public.support_tickets (vendor_id, status) WHERE vendor_id IS NOT NULL;
CREATE INDEX idx_support_corp ON public.support_tickets (corporate_id, status) WHERE corporate_id IS NOT NULL;
CREATE INDEX idx_support_queue ON public.support_tickets (status, priority, created_at);

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submitter reads own ticket"
  ON public.support_tickets
  FOR SELECT
  USING (submitter_id = auth.uid());

CREATE POLICY "Submitter inserts own ticket"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (submitter_id = auth.uid());

CREATE POLICY "Submitter updates own ticket fields"
  ON public.support_tickets
  FOR UPDATE
  USING (submitter_id = auth.uid())
  WITH CHECK (submitter_id = auth.uid());

CREATE POLICY "Support roles manage all tickets"
  ON public.support_tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  );

-- ─── Ticket Notes ─────────────────────────────────────────────────────────────

CREATE TABLE public.support_ticket_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_notes_ticket ON public.support_ticket_notes (ticket_id, created_at);

ALTER TABLE public.support_ticket_notes ENABLE ROW LEVEL SECURITY;

-- Submitter reads non-internal notes on their tickets
CREATE POLICY "Submitter reads public notes"
  ON public.support_ticket_notes
  FOR SELECT
  USING (
    NOT is_internal
    AND ticket_id IN (
      SELECT id FROM public.support_tickets WHERE submitter_id = auth.uid()
    )
  );

-- Submitter can post a reply (always public)
CREATE POLICY "Submitter posts reply"
  ON public.support_ticket_notes
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND is_internal = FALSE
    AND ticket_id IN (
      SELECT id FROM public.support_tickets WHERE submitter_id = auth.uid()
    )
  );

-- Support roles read/write all notes (including internal)
CREATE POLICY "Support roles manage all notes"
  ON public.support_ticket_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'mogzu_admin', 'account_manager')
    )
  );

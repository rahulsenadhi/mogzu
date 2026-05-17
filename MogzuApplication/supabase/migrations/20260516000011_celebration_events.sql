-- ─── Celebration Events (Stories 10.1, 10.2) ─────────────────────────────────
--
-- One row per scheduled milestone gift per employee. N8N daily cron computes
-- the next 30 days of birthdays / work anniversaries from employees.dob /
-- employees.join_date matched against gifting_rules with trigger_kind in
-- ('birthday','work_anniversary'). Fixed-date rules (Diwali etc) bulk-insert
-- one row per active employee.
--
-- Lifecycle:
--   scheduled    — automated default will fire at trigger_date.
--   personalised — manager edited message / variant / budget; will fire.
--   suppressed   — manager marked "done externally"; will not fire.
--   fired        — celebration gift booking created (booking_id set).
--   failed       — fire attempt failed (e.g. wallet short); manual retry.

CREATE TYPE public.celebration_status AS ENUM (
  'scheduled', 'personalised', 'suppressed', 'fired', 'failed'
);

CREATE TABLE public.celebration_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  gifting_rule_id UUID NOT NULL REFERENCES public.gifting_rules(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  occasion_name TEXT NOT NULL,
  trigger_date DATE NOT NULL,
  status public.celebration_status NOT NULL DEFAULT 'scheduled',
  default_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  listing_id_override UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  budget_override NUMERIC(12, 2),
  manager_message TEXT,
  personalised_at TIMESTAMPTZ,
  suppressed_at TIMESTAMPTZ,
  suppressed_reason TEXT,
  fired_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  fired_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (corporate_id, gifting_rule_id, employee_id, trigger_date)
);

CREATE INDEX idx_celebrations_corp_date ON public.celebration_events (corporate_id, trigger_date);
CREATE INDEX idx_celebrations_manager_pending ON public.celebration_events (manager_id, status)
  WHERE status IN ('scheduled', 'personalised');
CREATE INDEX idx_celebrations_due ON public.celebration_events (status, trigger_date)
  WHERE status IN ('scheduled', 'personalised');

CREATE TRIGGER trg_celebration_events_updated_at
  BEFORE UPDATE ON public.celebration_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.celebration_events ENABLE ROW LEVEL SECURITY;

-- Corporate members can read their corporate's celebrations
CREATE POLICY "Corporate members read own celebrations"
  ON public.celebration_events
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- L3 admin / mogzu_admin / account_manager manage everything in scope
CREATE POLICY "L3 admin manages celebrations"
  ON public.celebration_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role IN ('mogzu_admin', 'account_manager')
          OR (p.role = 'l3_admin' AND p.corporate_id = celebration_events.corporate_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role IN ('mogzu_admin', 'account_manager')
          OR (p.role = 'l3_admin' AND p.corporate_id = celebration_events.corporate_id)
        )
    )
  )

-- L2 manager can personalise / suppress events where they are the manager
;
CREATE POLICY "L2 manager personalises own team celebrations"
  ON public.celebration_events
  FOR UPDATE
  USING (
    manager_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'l2_manager'
    )
  )
  WITH CHECK (
    manager_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'l2_manager'
    )
  );

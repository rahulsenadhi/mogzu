-- BATCH 14 — push notification opt-in storage.
--
-- One push endpoint per user (web push). A user can opt in from any
-- device; the latest subscription wins because Mogzu only needs one
-- reachable endpoint per account for transactional alerts (approvals,
-- booking confirmations, payout updates). NULL means opted out.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS push_subscription JSONB,
  ADD COLUMN IF NOT EXISTS push_opt_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS push_declined_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_push_subscribed
  ON public.user_profiles ((push_subscription IS NOT NULL))
  WHERE push_subscription IS NOT NULL;

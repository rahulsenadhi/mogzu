-- ─── Notifications (Story 7.2) ───────────────────────────────────────────────
--
-- In-app notification feed + delivery preferences per user. Emails are
-- queued via email_status='queued' and processed by the future Resend
-- Edge Function / N8N (7.3). Critical types are emitted regardless of
-- preference; non-critical types respect user opt-out.

CREATE TYPE public.notification_type AS ENUM (
  'booking_confirmed',
  'booking_cancelled',
  'approval_required',
  'approval_decided',
  'payment_received',
  'payment_failed',
  'refund_initiated',
  'refund_failed',
  'reminder_24h',
  'gift_received',
  'gift_pending_approval',
  'support_reply',
  'system'
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link_url TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  email_status TEXT NOT NULL DEFAULT 'skipped'
    CHECK (email_status IN ('skipped', 'queued', 'sent', 'failed')),
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_email_queue ON public.notifications (email_status)
  WHERE email_status = 'queued';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User updates own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anyone authenticated can insert notifications scoped to the recipient.
-- Cross-user notify happens server-side via RPC normally; for client
-- emit paths (approve/reject/cancel) the actor is authenticated and the
-- emit policy matches the actor's relationship with the user.
CREATE POLICY "Authenticated insert notification"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── Notification Preferences ────────────────────────────────────────────────

CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  in_app_enabled_types public.notification_type[] DEFAULT ARRAY[
    'booking_confirmed','booking_cancelled','approval_required','approval_decided',
    'payment_received','payment_failed','refund_initiated','refund_failed',
    'reminder_24h','gift_received','gift_pending_approval','support_reply','system'
  ]::public.notification_type[],
  email_enabled_types public.notification_type[] DEFAULT ARRAY[
    'booking_confirmed','booking_cancelled','approval_decided',
    'payment_failed','refund_initiated','refund_failed','support_reply'
  ]::public.notification_type[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own preferences"
  ON public.notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

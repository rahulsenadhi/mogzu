-- Per-user corporate dashboard widget visibility (syncs across devices).

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS dashboard_widgets JSONB;

COMMENT ON COLUMN public.user_profiles.dashboard_widgets IS
  'Corporate home dashboard section toggles keyed by widget id (planBanners, snappyOrderHub, etc.).';

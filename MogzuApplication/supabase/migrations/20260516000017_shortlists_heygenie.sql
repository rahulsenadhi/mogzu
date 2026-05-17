-- ─── Shortlists (Story 13.3) ─────────────────────────────────────────────────
--
-- Account Manager curates a list of listings for a specific corporate client.
-- Client opens a tokenised share link to view; AM tracks views + booking
-- attribution from the shortlist.

CREATE TABLE public.shortlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_manager_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  intro_note TEXT,
  share_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shortlists_am ON public.shortlists (account_manager_id, created_at DESC);
CREATE INDEX idx_shortlists_corp ON public.shortlists (corporate_id);
CREATE INDEX idx_shortlists_token ON public.shortlists (share_token);

CREATE TRIGGER trg_shortlists_updated_at
  BEFORE UPDATE ON public.shortlists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.shortlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shortlist_id UUID NOT NULL REFERENCES public.shortlists(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  am_note TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shortlist_id, listing_id)
);

CREATE INDEX idx_shortlist_items_list ON public.shortlist_items (shortlist_id, display_order);

ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AM manages own shortlists"
  ON public.shortlists
  FOR ALL
  USING (account_manager_id = auth.uid())
  WITH CHECK (account_manager_id = auth.uid());

CREATE POLICY "Corporate members read own shortlists"
  ON public.shortlists
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Mogzu admin reads all shortlists"
  ON public.shortlists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mogzu_admin', 'support')
    )
  );

CREATE POLICY "AM manages own shortlist_items"
  ON public.shortlist_items
  FOR ALL
  USING (
    shortlist_id IN (
      SELECT id FROM public.shortlists WHERE account_manager_id = auth.uid()
    )
  )
  WITH CHECK (
    shortlist_id IN (
      SELECT id FROM public.shortlists WHERE account_manager_id = auth.uid()
    )
  );

CREATE POLICY "Corporate members read own shortlist_items"
  ON public.shortlist_items
  FOR SELECT
  USING (
    shortlist_id IN (
      SELECT s.id FROM public.shortlists s
      JOIN public.user_profiles p ON p.corporate_id = s.corporate_id
      WHERE p.id = auth.uid()
    )
  );

-- ─── Hey Genie (Stories 11.1, 11.2) ──────────────────────────────────────────

CREATE TABLE public.heygenie_config (
  corporate_id UUID PRIMARY KEY REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  enabled_modules TEXT[] DEFAULT '{}'::TEXT[],
  voice_locale TEXT NOT NULL DEFAULT 'en-IN',
  wake_word_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  configured_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_heygenie_config_updated_at
  BEFORE UPDATE ON public.heygenie_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.heygenie_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corporate members read own heygenie_config"
  ON public.heygenie_config
  FOR SELECT
  USING (
    corporate_id IN (
      SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Mogzu admin manages heygenie_config"
  ON public.heygenie_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

CREATE TABLE public.heygenie_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  intent JSONB,
  resulting_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  modality TEXT NOT NULL DEFAULT 'text' CHECK (modality IN ('voice', 'text')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_heygenie_sessions_user ON public.heygenie_sessions (user_id, created_at DESC);

ALTER TABLE public.heygenie_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads + inserts own heygenie sessions"
  ON public.heygenie_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Mogzu admin reads all heygenie sessions"
  ON public.heygenie_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'mogzu_admin'
    )
  );

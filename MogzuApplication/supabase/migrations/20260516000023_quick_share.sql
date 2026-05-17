-- Phase 2 Feature 1 — Quick Share Catalogue (off-platform sales).
--
-- Admin curates a list of listings, generates a tokenised link, sends it
-- via WhatsApp / Telegram / Email. The recipient browses without
-- authentication and submits a lead. Public access flows through
-- SECURITY DEFINER RPCs — neither the curator's table nor the submissions
-- table is readable by anon clients directly. Budget caps are admin-only
-- and never returned over the public RPC.

CREATE TABLE public.quick_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  module TEXT NOT NULL CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  token TEXT NOT NULL UNIQUE,
  client_label TEXT,
  custom_note TEXT,
  budget_cap NUMERIC(12, 2),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'closed')),
  payment_link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quick_shares_token ON public.quick_shares (token);
CREATE INDEX idx_quick_shares_status ON public.quick_shares (status, created_at DESC);

CREATE TRIGGER trg_quick_shares_updated_at
  BEFORE UPDATE ON public.quick_shares
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quick_share_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quick_share_id UUID NOT NULL REFERENCES public.quick_shares(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  curator_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (quick_share_id, listing_id)
);

CREATE INDEX idx_quick_share_items_share
  ON public.quick_share_items (quick_share_id, display_order);

CREATE TABLE public.quick_share_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quick_share_id UUID NOT NULL REFERENCES public.quick_shares(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_phone TEXT,
  client_email TEXT,
  selected_items JSONB NOT NULL DEFAULT '[]'::JSONB,
  client_note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_link_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'sent', 'paid', 'cancelled'))
);

CREATE INDEX idx_quick_share_submissions_share
  ON public.quick_share_submissions (quick_share_id, submitted_at DESC);

ALTER TABLE public.quick_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_share_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_share_submissions ENABLE ROW LEVEL SECURITY;

-- Admin + sales agent manage the curated shares.
CREATE POLICY "Admin + sales manage quick shares"
  ON public.quick_shares
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );

CREATE POLICY "Admin + sales manage quick share items"
  ON public.quick_share_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );

CREATE POLICY "Admin + sales read submissions"
  ON public.quick_share_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );

CREATE POLICY "Admin + sales update submissions"
  ON public.quick_share_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('mogzu_admin', 'support', 'sales_agent')
    )
  );

-- ─── Public access via SECURITY DEFINER ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_quick_share_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  module TEXT,
  custom_note TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  client_label TEXT,
  items JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    qs.id,
    qs.module,
    qs.custom_note,
    qs.expires_at,
    qs.status,
    qs.client_label,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'item_id', qsi.id,
          'listing_id', qsi.listing_id,
          'curator_note', qsi.curator_note,
          'display_order', qsi.display_order,
          'title', l.title,
          'description', l.description,
          'base_price', l.base_price,
          'price_unit', l.price_unit,
          'min_capacity', l.min_capacity,
          'max_capacity', l.max_capacity,
          'location_city', l.location_city,
          'cover_image', (
            SELECT li.storage_path FROM public.listing_images li
             WHERE li.listing_id = l.id
             ORDER BY li.display_order ASC LIMIT 1
          )
        )
        ORDER BY qsi.display_order
      ) FILTER (WHERE qsi.id IS NOT NULL),
      '[]'::JSONB
    ) AS items
  FROM public.quick_shares qs
  LEFT JOIN public.quick_share_items qsi
    ON qsi.quick_share_id = qs.id AND qsi.hidden = FALSE
  LEFT JOIN public.listings l ON l.id = qsi.listing_id
  WHERE qs.token = p_token
    AND qs.status = 'active'
    AND qs.expires_at > NOW()
  GROUP BY qs.id, qs.module, qs.custom_note, qs.expires_at, qs.status, qs.client_label
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_quick_share_by_token(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_quick_share(
  p_token TEXT,
  p_client_name TEXT,
  p_client_company TEXT,
  p_client_phone TEXT,
  p_client_email TEXT,
  p_selected_items JSONB,
  p_client_note TEXT
) RETURNS UUID AS $$
DECLARE
  v_share RECORD;
  v_id UUID;
BEGIN
  IF coalesce(trim(p_client_name), '') = '' THEN
    RAISE EXCEPTION 'submit_quick_share: client_name is required';
  END IF;

  SELECT id, status, expires_at INTO v_share
    FROM public.quick_shares
   WHERE token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_quick_share: link not found';
  END IF;
  IF v_share.status <> 'active' OR v_share.expires_at <= NOW() THEN
    RAISE EXCEPTION 'submit_quick_share: link is not active';
  END IF;

  INSERT INTO public.quick_share_submissions (
    quick_share_id, client_name, client_company, client_phone, client_email,
    selected_items, client_note
  ) VALUES (
    v_share.id, p_client_name, p_client_company, p_client_phone, p_client_email,
    COALESCE(p_selected_items, '[]'::JSONB), p_client_note
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.submit_quick_share(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT)
  TO anon, authenticated;

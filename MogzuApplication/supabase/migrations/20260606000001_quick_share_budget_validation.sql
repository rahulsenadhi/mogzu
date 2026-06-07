-- Enforce admin-only budget_cap on Quick Share submissions (F1 PRD).
-- budget_cap is never exposed to anon clients via get_quick_share_by_token.

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
  v_total NUMERIC(12, 2) := 0;
  v_item JSONB;
  v_listing_id UUID;
  v_qty INT;
  v_price NUMERIC(12, 2);
BEGIN
  IF coalesce(trim(p_client_name), '') = '' THEN
    RAISE EXCEPTION 'submit_quick_share: client_name is required';
  END IF;

  SELECT id, status, expires_at, budget_cap INTO v_share
    FROM public.quick_shares
   WHERE token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_quick_share: link not found';
  END IF;
  IF v_share.status <> 'active' OR v_share.expires_at <= NOW() THEN
    RAISE EXCEPTION 'submit_quick_share: link is not active';
  END IF;

  IF v_share.budget_cap IS NOT NULL AND v_share.budget_cap > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_selected_items, '[]'::JSONB))
    LOOP
      v_listing_id := NULLIF(trim(v_item->>'listing_id'), '')::UUID;
      IF v_listing_id IS NULL THEN
        CONTINUE;
      END IF;
      v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::INT, 1));
      SELECT base_price INTO v_price
        FROM public.listings
       WHERE id = v_listing_id;
      IF v_price IS NOT NULL THEN
        v_total := v_total + (v_price * v_qty);
      END IF;
    END LOOP;

    IF v_total > v_share.budget_cap THEN
      RAISE EXCEPTION 'submit_quick_share: selection total exceeds the budget for this catalogue';
    END IF;
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

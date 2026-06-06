-- Backfill bundled client logo URLs for landing scroller.

UPDATE public.cms_blocks SET image_url = '/client-logos/icici-securities.svg', updated_at = NOW()
  WHERE slug = 'client-icici-securities' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/tesseract-apps.svg', updated_at = NOW()
  WHERE slug = 'client-tesseract-apps' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/design-democracy.svg', updated_at = NOW()
  WHERE slug = 'client-design-democracy' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/xdlinx-labs.svg', updated_at = NOW()
  WHERE slug = 'client-xdlinx-labs' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/nift.svg', updated_at = NOW()
  WHERE slug = 'client-nift' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/chilis.svg', updated_at = NOW()
  WHERE slug = 'client-chilis' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/alpha-circle.svg', updated_at = NOW()
  WHERE slug = 'client-alpha-circle' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/spoors.svg', updated_at = NOW()
  WHERE slug = 'client-spoors' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/factset.svg', updated_at = NOW()
  WHERE slug = 'client-factset' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/tapadia-diagnostics.svg', updated_at = NOW()
  WHERE slug = 'client-tapadia-diagnostics' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/jk-tourism.svg', updated_at = NOW()
  WHERE slug = 'client-jk-tourism' AND (image_url IS NULL OR image_url = '');

UPDATE public.cms_blocks SET image_url = '/client-logos/adanet-next.svg', updated_at = NOW()
  WHERE slug = 'client-adanet-next' AND (image_url IS NULL OR image_url = '');

-- Swap bundled client logos to official PNG assets; add Keerthi & Radio Bar; retire Spoors placeholder.

UPDATE public.cms_blocks SET image_url = '/client-logos/icici-securities.png', updated_at = NOW()
  WHERE slug = 'client-icici-securities';

UPDATE public.cms_blocks SET image_url = '/client-logos/tesseract-apps.png', updated_at = NOW()
  WHERE slug = 'client-tesseract-apps';

UPDATE public.cms_blocks SET image_url = '/client-logos/design-democracy.png', updated_at = NOW()
  WHERE slug = 'client-design-democracy';

UPDATE public.cms_blocks SET image_url = '/client-logos/xdlinx-labs.png', updated_at = NOW()
  WHERE slug = 'client-xdlinx-labs';

UPDATE public.cms_blocks SET image_url = '/client-logos/nift.png', updated_at = NOW()
  WHERE slug = 'client-nift';

UPDATE public.cms_blocks SET image_url = '/client-logos/chilis.png', updated_at = NOW()
  WHERE slug = 'client-chilis';

UPDATE public.cms_blocks SET image_url = '/client-logos/alpha-circle.png', updated_at = NOW()
  WHERE slug = 'client-alpha-circle';

UPDATE public.cms_blocks SET image_url = '/client-logos/factset.png', updated_at = NOW()
  WHERE slug = 'client-factset';

UPDATE public.cms_blocks SET image_url = '/client-logos/tapadia-diagnostics.png', updated_at = NOW()
  WHERE slug = 'client-tapadia-diagnostics';

UPDATE public.cms_blocks SET image_url = '/client-logos/jk-tourism.png', updated_at = NOW()
  WHERE slug = 'client-jk-tourism';

UPDATE public.cms_blocks SET image_url = '/client-logos/adanet-next.png', updated_at = NOW()
  WHERE slug = 'client-adanet-next';

UPDATE public.cms_blocks SET status = 'archived', updated_at = NOW()
  WHERE slug = 'client-spoors';

INSERT INTO public.cms_blocks (slug, kind, title, image_url, display_order, status, published_at) VALUES
  ('client-keerthi-constructions', 'client_logo', 'Keerthi Constructions', '/client-logos/keerthi-constructions.png', 8, 'published', NOW()),
  ('client-radio-bar', 'client_logo', 'Radio Bar', '/client-logos/radio-bar.png', 13, 'published', NOW())
ON CONFLICT (slug) DO UPDATE SET
  kind = EXCLUDED.kind,
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status,
  published_at = COALESCE(public.cms_blocks.published_at, EXCLUDED.published_at),
  updated_at = NOW();

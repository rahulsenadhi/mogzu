-- Landing page client logo scroller — extend CMS kind + seed clients.

ALTER TABLE public.cms_blocks DROP CONSTRAINT IF EXISTS cms_blocks_kind_check;

ALTER TABLE public.cms_blocks ADD CONSTRAINT cms_blocks_kind_check CHECK (
  kind IN (
    'hero',
    'feature_card',
    'promo_banner',
    'blog_post',
    'announcement',
    'footer_link_group',
    'client_logo'
  )
);

-- Section headline (slug home-clients)
INSERT INTO public.cms_blocks (
  slug, kind, title, body, display_order, status, published_at
) VALUES (
  'home-clients',
  'promo_banner',
  'Trusted by leading teams',
  'Corporates across finance, design, hospitality, education, and tourism plan and execute on Mogzu.',
  0,
  'published',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  kind = EXCLUDED.kind,
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status,
  published_at = COALESCE(public.cms_blocks.published_at, EXCLUDED.published_at),
  updated_at = NOW();

-- Client logo rows (bundled SVG paths; replace via /admin/cms with official PNG/SVG URLs)
INSERT INTO public.cms_blocks (slug, kind, title, image_url, display_order, status, published_at) VALUES
  ('client-icici-securities', 'client_logo', 'ICICI Securities', '/client-logos/icici-securities.svg', 1, 'published', NOW()),
  ('client-tesseract-apps', 'client_logo', 'Tesseract Apps', '/client-logos/tesseract-apps.svg', 2, 'published', NOW()),
  ('client-design-democracy', 'client_logo', 'Design Democracy', '/client-logos/design-democracy.svg', 3, 'published', NOW()),
  ('client-xdlinx-labs', 'client_logo', 'Xdlinx Labs', '/client-logos/xdlinx-labs.svg', 4, 'published', NOW()),
  ('client-nift', 'client_logo', 'NIFT', '/client-logos/nift.svg', 5, 'published', NOW()),
  ('client-chilis', 'client_logo', 'Chilis', '/client-logos/chilis.svg', 6, 'published', NOW()),
  ('client-alpha-circle', 'client_logo', 'Alpha Circle', '/client-logos/alpha-circle.svg', 7, 'published', NOW()),
  ('client-spoors', 'client_logo', 'Spoors', '/client-logos/spoors.svg', 8, 'published', NOW()),
  ('client-factset', 'client_logo', 'Factset', '/client-logos/factset.svg', 9, 'published', NOW()),
  ('client-tapadia-diagnostics', 'client_logo', 'Tapadia Diagnostics', '/client-logos/tapadia-diagnostics.svg', 10, 'published', NOW()),
  ('client-jk-tourism', 'client_logo', 'J&K Tourism', '/client-logos/jk-tourism.svg', 11, 'published', NOW()),
  ('client-adanet-next', 'client_logo', 'Adanet Next', '/client-logos/adanet-next.svg', 12, 'published', NOW())
ON CONFLICT (slug) DO UPDATE SET
  kind = EXCLUDED.kind,
  title = EXCLUDED.title,
  image_url = COALESCE(NULLIF(public.cms_blocks.image_url, ''), EXCLUDED.image_url),
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status,
  published_at = COALESCE(public.cms_blocks.published_at, EXCLUDED.published_at),
  updated_at = NOW();

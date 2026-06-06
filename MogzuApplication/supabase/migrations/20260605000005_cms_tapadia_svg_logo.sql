-- Force Tapadia client logo to bundled crisp SVG asset.

UPDATE public.cms_blocks SET
  image_url = '/client-logos/tapadia-diagnostics.svg',
  updated_at = NOW()
WHERE slug = 'client-tapadia-diagnostics';

-- Update client section headline copy.

UPDATE public.cms_blocks SET
  title = 'Trusted by leading corporates',
  updated_at = NOW()
WHERE slug = 'home-clients';

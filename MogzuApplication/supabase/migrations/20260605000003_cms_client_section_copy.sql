-- Update client section subtitle copy.

UPDATE public.cms_blocks SET
  body = 'Corporates across finance, IT, pharma, design, hospitality, education, and tourism plan and execute on Mogzu.',
  updated_at = NOW()
WHERE slug = 'home-clients';

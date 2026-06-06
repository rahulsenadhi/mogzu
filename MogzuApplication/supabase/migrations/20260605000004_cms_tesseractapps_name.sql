-- Align Tesseract Apps display name with updated wordmark.

UPDATE public.cms_blocks SET
  title = 'TesseractApps',
  updated_at = NOW()
WHERE slug = 'client-tesseract-apps';

-- Strip legacy ---mogzu-approval--- JSON from purpose_note; backfill level columns when empty.

WITH legacy AS (
  SELECT
    id,
    NULLIF(trim(split_part(purpose_note, E'\n---mogzu-approval---\n', 1)), '') AS user_note,
    CASE
      WHEN cardinality(required_approval_levels) = 0
        AND trim(split_part(purpose_note, E'\n---mogzu-approval---\n', 2)) <> ''
      THEN trim(split_part(purpose_note, E'\n---mogzu-approval---\n', 2))::jsonb
      ELSE NULL
    END AS payload
  FROM public.bookings
  WHERE purpose_note LIKE '%---mogzu-approval---%'
)
UPDATE public.bookings b
SET
  purpose_note = l.user_note,
  required_approval_levels = CASE
    WHEN cardinality(b.required_approval_levels) = 0
      AND l.payload IS NOT NULL
      AND jsonb_typeof(l.payload -> 'requiredLevels') = 'array'
    THEN ARRAY(
      SELECT jsonb_array_elements_text(l.payload -> 'requiredLevels')
    )
    ELSE b.required_approval_levels
  END,
  approved_approval_levels = CASE
    WHEN cardinality(b.approved_approval_levels) = 0
      AND l.payload IS NOT NULL
      AND jsonb_typeof(l.payload -> 'approvedLevels') = 'array'
    THEN ARRAY(
      SELECT jsonb_array_elements_text(l.payload -> 'approvedLevels')
    )
    ELSE b.approved_approval_levels
  END
FROM legacy l
WHERE b.id = l.id;

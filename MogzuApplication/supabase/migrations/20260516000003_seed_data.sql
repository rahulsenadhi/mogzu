-- Mogzu Seed Data — Migration 003
-- Initial categories and global commission rate.
-- Safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING).

-- ─── Default global commission rate (15%) ────────────────────────────────────

INSERT INTO public.commissions (scope, rate, is_active, effective_from)
VALUES ('global', 0.15, TRUE, NOW())
ON CONFLICT DO NOTHING;

-- ─── Event categories ─────────────────────────────────────────────────────────

INSERT INTO public.listing_categories (module, name, icon, display_order) VALUES
  ('events', 'Team Outing',        'users',          1),
  ('events', 'Workshop',           'book-open',      2),
  ('events', 'Celebration',        'party-popper',   3),
  ('events', 'Corporate Offsite',  'briefcase',      4),
  ('events', 'Team Building',      'handshake',      5),
  ('events', 'Wellness',           'heart-pulse',    6),
  ('events', 'Entertainment',      'music',          7),
  ('events', 'Dining Experience',  'utensils',       8)
ON CONFLICT DO NOTHING;

-- ─── Gifting categories ───────────────────────────────────────────────────────

INSERT INTO public.listing_categories (module, name, icon, display_order) VALUES
  ('gifting', 'Tech & Gadgets',    'laptop',         1),
  ('gifting', 'Stationery',        'pen-line',       2),
  ('gifting', 'Wellness',          'sparkles',       3),
  ('gifting', 'Food & Beverage',   'coffee',         4),
  ('gifting', 'Apparel',           'shirt',          5),
  ('gifting', 'Bags & Accessories','bag',            6),
  ('gifting', 'Home & Living',     'home',           7),
  ('gifting', 'Branded Hampers',   'package',        8)
ON CONFLICT DO NOTHING;

-- ─── SpaceX coworking categories ─────────────────────────────────────────────

INSERT INTO public.listing_categories (module, name, icon, display_order) VALUES
  ('spacex_coworking', 'Hot Desk',          'monitor',        1),
  ('spacex_coworking', 'Private Cabin',     'lock',           2),
  ('spacex_coworking', 'Meeting Room',      'presentation',   3),
  ('spacex_coworking', 'Event Hall',        'landmark',       4),
  ('spacex_coworking', 'Training Room',     'graduation-cap', 5),
  ('spacex_coworking', 'Board Room',        'briefcase',      6)
ON CONFLICT DO NOTHING;

-- ─── SpaceX stay categories ───────────────────────────────────────────────────

INSERT INTO public.listing_categories (module, name, icon, display_order) VALUES
  ('spacex_stay', 'Hotel',              'building-2',     1),
  ('spacex_stay', 'Serviced Apartment', 'home',           2),
  ('spacex_stay', 'Service Villa',      'tree-pine',      3),
  ('spacex_stay', 'Boutique Property',  'gem',            4)
ON CONFLICT DO NOTHING;

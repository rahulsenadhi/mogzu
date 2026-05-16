-- Mogzu RLS Policies — Migration 002
-- Run after migration 001.
-- All tables in the public schema have RLS enabled.
-- Security-definer helpers live in the private schema (not exposed via API).

-- ─── Helper functions (private schema — not exposed) ──────────────────────────

-- Returns the current user's role from user_profiles
CREATE OR REPLACE FUNCTION private.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Returns the current user's corporate_id
CREATE OR REPLACE FUNCTION private.user_corporate_id()
RETURNS UUID AS $$
  SELECT corporate_id FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Returns the current user's vendor_id
CREATE OR REPLACE FUNCTION private.user_vendor_id()
RETURNS UUID AS $$
  SELECT vendor_id FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Returns true if the current user is a Mogzu admin
CREATE OR REPLACE FUNCTION private.is_mogzu_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('mogzu_admin', 'account_manager', 'support')
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE public.corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- ─── corporate_accounts ───────────────────────────────────────────────────────

-- Mogzu admins see all; corporate users see their own account only
CREATE POLICY "corporate_accounts_select" ON public.corporate_accounts
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR id = private.user_corporate_id()
  );

CREATE POLICY "corporate_accounts_insert" ON public.corporate_accounts
  FOR INSERT WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "corporate_accounts_update" ON public.corporate_accounts
  FOR UPDATE USING (
    private.is_mogzu_admin()
    OR (id = private.user_corporate_id() AND private.user_role() = 'l3_admin')
  );

-- ─── user_profiles ────────────────────────────────────────────────────────────

-- Users see their own profile; L3 admins and Mogzu admins see their tenant's profiles
CREATE POLICY "user_profiles_select" ON public.user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() IN ('l2_manager', 'l3_admin')
    )
  );

CREATE POLICY "user_profiles_insert" ON public.user_profiles
  FOR INSERT WITH CHECK (
    -- Users can create their own profile on signup
    id = auth.uid()
    -- Or admins can create profiles for their tenant
    OR private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() = 'l3_admin'
    )
  );

CREATE POLICY "user_profiles_update" ON public.user_profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() = 'l3_admin'
    )
  );

-- ─── vendors ─────────────────────────────────────────────────────────────────

-- Vendors see their own record; Mogzu admins see all
CREATE POLICY "vendors_select" ON public.vendors
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR id = private.user_vendor_id()
    -- Active vendors are visible to corporate users for discovery
    OR status = 'active'
  );

CREATE POLICY "vendors_insert" ON public.vendors
  FOR INSERT WITH CHECK (
    -- New vendor registrations (user creates their own vendor record)
    user_id = auth.uid()
    OR private.is_mogzu_admin()
  );

CREATE POLICY "vendors_update" ON public.vendors
  FOR UPDATE USING (
    private.is_mogzu_admin()
    OR id = private.user_vendor_id()
  );

-- ─── vendor_modules ───────────────────────────────────────────────────────────

CREATE POLICY "vendor_modules_select" ON public.vendor_modules
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
    OR TRUE -- module list is public info for discovery
  );

CREATE POLICY "vendor_modules_insert" ON public.vendor_modules
  FOR INSERT WITH CHECK (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

CREATE POLICY "vendor_modules_delete" ON public.vendor_modules
  FOR DELETE USING (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

-- ─── listing_categories ───────────────────────────────────────────────────────

-- Categories are publicly readable; only Mogzu admins can modify
CREATE POLICY "listing_categories_select" ON public.listing_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "listing_categories_insert" ON public.listing_categories
  FOR INSERT WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "listing_categories_update" ON public.listing_categories
  FOR UPDATE USING (private.is_mogzu_admin());

-- ─── listings ─────────────────────────────────────────────────────────────────

-- Active listings visible to all authenticated users; vendors see their own; admins see all
CREATE POLICY "listings_select" ON public.listings
  FOR SELECT USING (
    status = 'active'
    OR private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

CREATE POLICY "listings_insert" ON public.listings
  FOR INSERT WITH CHECK (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

CREATE POLICY "listings_update" ON public.listings
  FOR UPDATE USING (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

-- ─── listing_images ───────────────────────────────────────────────────────────

CREATE POLICY "listing_images_select" ON public.listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND (l.status = 'active' OR private.is_mogzu_admin() OR l.vendor_id = private.user_vendor_id())
    )
  );

CREATE POLICY "listing_images_insert" ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND (private.is_mogzu_admin() OR l.vendor_id = private.user_vendor_id())
    )
  );

CREATE POLICY "listing_images_delete" ON public.listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND (private.is_mogzu_admin() OR l.vendor_id = private.user_vendor_id())
    )
  );

-- ─── listing_add_ons ──────────────────────────────────────────────────────────

CREATE POLICY "listing_add_ons_select" ON public.listing_add_ons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND (l.status = 'active' OR private.is_mogzu_admin() OR l.vendor_id = private.user_vendor_id())
    )
  );

CREATE POLICY "listing_add_ons_insert" ON public.listing_add_ons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND (private.is_mogzu_admin() OR l.vendor_id = private.user_vendor_id())
    )
  );

CREATE POLICY "listing_add_ons_delete" ON public.listing_add_ons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND (private.is_mogzu_admin() OR l.vendor_id = private.user_vendor_id())
    )
  );

-- ─── calendar_slots ───────────────────────────────────────────────────────────

-- Corporate users can view calendar slots to check availability
CREATE POLICY "calendar_slots_select" ON public.calendar_slots
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
    OR TRUE -- availability is public for booking discovery
  );

CREATE POLICY "calendar_slots_insert" ON public.calendar_slots
  FOR INSERT WITH CHECK (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

CREATE POLICY "calendar_slots_update" ON public.calendar_slots
  FOR UPDATE USING (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

CREATE POLICY "calendar_slots_delete" ON public.calendar_slots
  FOR DELETE USING (
    private.is_mogzu_admin()
    OR vendor_id = private.user_vendor_id()
  );

-- ─── budget_rules ─────────────────────────────────────────────────────────────

-- L3 admin manages budgets for their corp; Mogzu admin sees all
CREATE POLICY "budget_rules_select" ON public.budget_rules
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() IN ('l2_manager', 'l3_admin')
    )
    -- L1 employees see their own scope only
    OR (
      corporate_id = private.user_corporate_id()
      AND scope = 'individual'
      AND scope_value = auth.uid()::TEXT
    )
  );

CREATE POLICY "budget_rules_insert" ON public.budget_rules
  FOR INSERT WITH CHECK (
    private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() = 'l3_admin'
    )
  );

CREATE POLICY "budget_rules_update" ON public.budget_rules
  FOR UPDATE USING (
    private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() = 'l3_admin'
    )
  );

-- ─── wallets ──────────────────────────────────────────────────────────────────

CREATE POLICY "wallets_select" ON public.wallets
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() IN ('l2_manager', 'l3_admin')
    )
  );

CREATE POLICY "wallets_update" ON public.wallets
  FOR UPDATE USING (private.is_mogzu_admin());

-- ─── wallet_transactions ──────────────────────────────────────────────────────

CREATE POLICY "wallet_transactions_select" ON public.wallet_transactions
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() IN ('l2_manager', 'l3_admin')
    )
  );

CREATE POLICY "wallet_transactions_insert" ON public.wallet_transactions
  FOR INSERT WITH CHECK (private.is_mogzu_admin());

-- ─── bookings ─────────────────────────────────────────────────────────────────

-- Users see their own bookings; managers see their corp; vendors see their bookings; admins see all
CREATE POLICY "bookings_select" ON public.bookings
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR user_id = auth.uid()
    OR vendor_id = private.user_vendor_id()
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() IN ('l2_manager', 'l3_admin')
    )
  );

CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT WITH CHECK (
    -- Employees book for their own corporate account
    corporate_id = private.user_corporate_id()
    AND user_id = auth.uid()
    OR private.is_mogzu_admin()
  );

CREATE POLICY "bookings_update" ON public.bookings
  FOR UPDATE USING (
    private.is_mogzu_admin()
    -- Employee can update their own draft/pending bookings
    OR (user_id = auth.uid() AND status IN ('draft', 'pending_approval'))
    -- Manager can approve/reject bookings in their corp
    OR (
      corporate_id = private.user_corporate_id()
      AND private.user_role() IN ('l2_manager', 'l3_admin')
    )
    -- Vendor can confirm/reject bookings assigned to them
    OR vendor_id = private.user_vendor_id()
  );

-- ─── booking_add_ons ──────────────────────────────────────────────────────────

CREATE POLICY "booking_add_ons_select" ON public.booking_add_ons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND (
        private.is_mogzu_admin()
        OR b.user_id = auth.uid()
        OR b.vendor_id = private.user_vendor_id()
        OR (b.corporate_id = private.user_corporate_id() AND private.user_role() IN ('l2_manager', 'l3_admin'))
      )
    )
  );

CREATE POLICY "booking_add_ons_insert" ON public.booking_add_ons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND (b.user_id = auth.uid() OR private.is_mogzu_admin())
    )
  );

-- ─── commissions ─────────────────────────────────────────────────────────────

-- Only Mogzu admins manage commissions; vendors can see their own rate
CREATE POLICY "commissions_select" ON public.commissions
  FOR SELECT USING (
    private.is_mogzu_admin()
    OR (vendor_id = private.user_vendor_id() AND scope = 'vendor')
    OR scope = 'global'
  );

CREATE POLICY "commissions_insert" ON public.commissions
  FOR INSERT WITH CHECK (private.is_mogzu_admin());

CREATE POLICY "commissions_update" ON public.commissions
  FOR UPDATE USING (private.is_mogzu_admin());

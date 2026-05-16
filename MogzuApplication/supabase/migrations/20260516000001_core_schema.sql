-- Mogzu Core Schema — Migration 001
-- Run: supabase db push (or apply via Supabase dashboard SQL editor)

-- ─── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Private schema for security-definer functions ───────────────────────────

CREATE SCHEMA IF NOT EXISTS private;

-- ─── Corporate Accounts (tenants) ────────────────────────────────────────────

CREATE TABLE public.corporate_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  account_manager_id UUID,
  modules_enabled JSONB NOT NULL DEFAULT '{"events": true, "gifting": false, "spacex_coworking": false, "spacex_stay": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Profiles (extends auth.users) ──────────────────────────────────────

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  corporate_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  vendor_id UUID,
  role TEXT NOT NULL DEFAULT 'l1_employee' CHECK (
    role IN ('l1_employee', 'l2_manager', 'l3_admin', 'vendor', 'mogzu_admin', 'account_manager', 'partner', 'support')
  ),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Vendors ──────────────────────────────────────────────────────────────────

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  gst_number TEXT,
  bank_account_verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  rejection_reasons JSONB,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link user_profiles.vendor_id FK after vendors table exists
ALTER TABLE public.user_profiles
  ADD CONSTRAINT fk_user_profiles_vendor
  FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;

-- ─── Vendor Module Selection ──────────────────────────────────────────────────

CREATE TABLE public.vendor_modules (
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  PRIMARY KEY (vendor_id, module)
);

-- ─── Listing Categories ───────────────────────────────────────────────────────

CREATE TABLE public.listing_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module TEXT NOT NULL CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  parent_id UUID REFERENCES public.listing_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Listings ─────────────────────────────────────────────────────────────────

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  category_id UUID REFERENCES public.listing_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'pending_approval', 'active', 'paused', 'rejected')
  ),
  pricing_type TEXT NOT NULL DEFAULT 'transparent' CHECK (
    pricing_type IN ('transparent', 'offer', 'request_for_price')
  ),
  base_price NUMERIC(12, 2),
  price_unit TEXT CHECK (price_unit IN ('per_person', 'flat', 'per_hour', 'per_day')),
  min_capacity INTEGER,
  max_capacity INTEGER,
  location_city TEXT,
  location_address TEXT,
  cancellation_policy TEXT,
  confirmation_sla_hours INTEGER NOT NULL DEFAULT 24,
  is_mogzu_direct BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Listing Images ───────────────────────────────────────────────────────────

CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Listing Add-Ons ──────────────────────────────────────────────────────────

CREATE TABLE public.listing_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT
);

-- ─── Vendor Calendar Slots ────────────────────────────────────────────────────

CREATE TABLE public.calendar_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL DEFAULT 'available' CHECK (slot_type IN ('available', 'blocked', 'booked')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  booking_id UUID,
  recurrence_rule TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

CREATE INDEX idx_calendar_slots_listing_time ON public.calendar_slots (listing_id, start_time, end_time);
CREATE INDEX idx_calendar_slots_vendor_time ON public.calendar_slots (vendor_id, start_time, end_time);

-- ─── Budget Rules ─────────────────────────────────────────────────────────────

CREATE TABLE public.budget_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'company' CHECK (scope IN ('company', 'department', 'individual')),
  scope_value TEXT,
  module TEXT CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'quarterly', 'annual')),
  alert_threshold_pct INTEGER DEFAULT 80 CHECK (alert_threshold_pct BETWEEN 1 AND 100),
  requires_approval BOOLEAN DEFAULT TRUE,
  auto_approve_below NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Corporate Wallet ─────────────────────────────────────────────────────────

CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID UNIQUE NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  low_balance_threshold NUMERIC(12, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Wallet Transactions ──────────────────────────────────────────────────────

CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id),
  type TEXT NOT NULL CHECK (type IN ('topup', 'debit', 'refund', 'credit')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  reference_id TEXT,
  booking_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_corporate ON public.wallet_transactions (corporate_id, created_at DESC);

-- ─── Bookings ─────────────────────────────────────────────────────────────────

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_id UUID NOT NULL REFERENCES public.corporate_accounts(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  module TEXT NOT NULL CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'pending_approval', 'pending_vendor', 'confirmed', 'cancelled', 'completed', 'disputed')
  ),
  group_size INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  base_amount NUMERIC(12, 2),
  add_ons_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2),
  commission_rate NUMERIC(5, 4),
  payment_method TEXT CHECK (payment_method IN ('wallet', 'card', 'upi')),
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'failed')
  ),
  purpose_note TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancellation_fee NUMERIC(12, 2),
  vendor_response_deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_corporate ON public.bookings (corporate_id, status, created_at DESC);
CREATE INDEX idx_bookings_vendor ON public.bookings (vendor_id, status, created_at DESC);
CREATE INDEX idx_bookings_user ON public.bookings (user_id, created_at DESC);

-- ─── Booking Add-Ons ──────────────────────────────────────────────────────────

CREATE TABLE public.booking_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  add_on_id UUID REFERENCES public.listing_add_ons(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- ─── Commission Rates ─────────────────────────────────────────────────────────

CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'vendor', 'module', 'category')),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  module TEXT CHECK (module IN ('events', 'gifting', 'spacex_coworking', 'spacex_stay')),
  category_id UUID REFERENCES public.listing_categories(id) ON DELETE CASCADE,
  rate NUMERIC(5, 4) NOT NULL CHECK (rate BETWEEN 0 AND 1),
  is_active BOOLEAN DEFAULT TRUE,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Auto-update updated_at trigger ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_corporate_accounts_updated_at
  BEFORE UPDATE ON public.corporate_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_budget_rules_updated_at
  BEFORE UPDATE ON public.budget_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

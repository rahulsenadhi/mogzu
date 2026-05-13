import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  LayoutList,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { getVendorListingProfileIds } from '@/app/lib/vendorModuleSelection';

const STORAGE_KEY = 'mogzu_vendor_sidebar_expanded';
const LG_MIN_PX = 1024;

/**
 * Step 8 vendor shell nav — vendor type from onboarding draft/completed storage
 * (`getVendorListingProfileIds` in vendorModuleSelection.ts, same source as Step 2).
 *
 * Step 12: `/vendor/settings` is a placeholder route (see routes.tsx); replace with a real
 * settings page when built.
 */

export type VendorSidebarProps = {
  /** Match existing vendor pages: white (dashboard) vs gray (orders, etc.) */
  surface?: 'white' | 'gray';
  /**
   * Renders a fixed mobile menu control (corporate-style hamburger placement).
   * Uses a high z-index so it stacks above in-header controls when both exist.
   */
  showMobileTrigger?: boolean;
};

type VendorNavRow = {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

function readStoredExpanded(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return true;
    return v !== 'false' && v !== '0';
  } catch {
    return true;
  }
}

function writeStoredExpanded(expanded: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, expanded ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

function useIsLargeScreen() {
  const [lg, setLg] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= LG_MIN_PX : true
  );

  useLayoutEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_MIN_PX}px)`);
    const sync = () => setLg(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  return lg;
}

function pathMatches(pathname: string, base: string) {
  if (base === '/vendor/dashboard') return pathname === base;
  return pathname === base || pathname.startsWith(`${base}/`);
}

function buildVendorNavRows(pathname: string): VendorNavRow[] {
  const profiles = getVendorListingProfileIds();
  const isGift = profiles.includes('gift');
  const isActivity = profiles.includes('activity');
  const isEvent = profiles.includes('event');
  const showProducts = isGift;
  const showListings = isActivity || isEvent;

  const listingsActive = (p: string) =>
    pathMatches(p, '/vendor/listings') ||
    (showListings && isActivity && pathMatches(p, '/vendor/event-activity')) ||
    (showListings && isEvent && pathMatches(p, '/vendor/events'));

  const rows: VendorNavRow[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/vendor/dashboard',
      icon: LayoutGrid,
      isActive: (p) => pathMatches(p, '/vendor/dashboard'),
    },
  ];

  if (showProducts) {
    rows.push({
      key: 'products',
      label: 'Products',
      path: '/vendor/products',
      icon: Package,
      isActive: (p) => pathMatches(p, '/vendor/products'),
    });
  }

  if (showListings) {
    rows.push({
      key: 'listings',
      label: 'Listings',
      path: '/vendor/listings',
      icon: LayoutList,
      isActive: listingsActive,
    });
  }

  rows.push(
    {
      key: 'orders',
      label: 'Orders',
      path: '/vendor/orders',
      icon: ShoppingBag,
      isActive: (p) => pathMatches(p, '/vendor/orders'),
    },
    {
      key: 'messages',
      label: 'Messages',
      path: '/vendor/messages',
      icon: MessageSquare,
      isActive: (p) => pathMatches(p, '/vendor/messages') || pathMatches(p, '/vendor/communication'),
    },
    {
      key: 'promotions',
      label: 'Promotions',
      path: '/vendor/promotions',
      icon: Megaphone,
      isActive: (p) => pathMatches(p, '/vendor/promotions'),
    },
    {
      key: 'team',
      label: 'Team',
      path: '/vendor/team',
      icon: Users,
      isActive: (p) => pathMatches(p, '/vendor/team') || pathMatches(p, '/vendor/users'),
    },
    {
      key: 'settings',
      label: 'Settings',
      path: '/vendor/settings',
      icon: Settings,
      isActive: (p) => pathMatches(p, '/vendor/settings'),
    },
    {
      key: 'support',
      label: 'Support',
      path: '/vendor/support',
      icon: LifeBuoy,
      isActive: (p) => pathMatches(p, '/vendor/support'),
    }
  );

  return rows;
}

/**
 * Vendor shell sidebar: type-aware nav (onboarding module storage), expand/collapse,
 * localStorage, mobile overlay + trigger. Corporate rail widths w-56 / w-14.
 */
export function VendorSidebar({ surface = 'white', showMobileTrigger = true }: VendorSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.includes('onboarding') || e.key.includes('vendor')) {
        setStorageTick((t) => t + 1);
      }
    };
    const onFocus = () => setStorageTick((t) => t + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const navRows = useMemo(
    () => buildVendorNavRows(location.pathname),
    [location.pathname, storageTick]
  );

  const isLarge = useIsLargeScreen();
  const [expanded, setExpanded] = useState(readStoredExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    if (isLarge) setMobileOpen(false);
  }, [isLarge]);

  const collapsed = !expanded;

  const setExpandedPersist = useCallback((next: boolean) => {
    setExpanded(next);
    writeStoredExpanded(next);
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpandedPersist(!expanded);
  }, [expanded, setExpandedPersist]);

  const bgMain = surface === 'gray' ? 'bg-gray-50' : 'bg-white';
  const bgHeader = surface === 'gray' ? 'bg-gray-50' : 'bg-white';
  const borderTone = 'border-gray-200';

  const go = (path: string) => {
    navigate(path);
    if (!isLarge) setMobileOpen(false);
  };

  const collapsedDesktop = isLarge && collapsed;

  const mobileTrigger =
    showMobileTrigger && portalEl
      ? createPortal(
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="fixed left-4 top-[calc(0.875rem+env(safe-area-inset-top,0px))] z-[100] flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>,
          portalEl
        )
      : null;

  const backdrop =
    !isLarge && mobileOpen ? (
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
        onClick={() => setMobileOpen(false)}
      />
    ) : null;

  return (
    <>
      {mobileTrigger}
      {backdrop}
      <aside
        className={`flex h-full shrink-0 flex-col border-r ${borderTone} ${bgMain} transition-all duration-300 ease-out lg:relative lg:z-auto lg:translate-x-0 ${
          collapsed && isLarge ? 'w-14' : 'w-56'
        } fixed inset-y-0 left-0 z-[95] lg:static ${
          !isLarge ? (mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full') : ''
        }`}
      >
        <div
          className={`flex h-14 shrink-0 items-center justify-center border-b ${borderTone} ${bgHeader} ${collapsed && isLarge ? '' : 'px-3'}`}
        >
          <Link
            to="/vendor/dashboard"
            className={`flex w-full items-center justify-center ${collapsed && isLarge ? '' : 'px-2'}`}
            aria-label="Mogzu — Vendor dashboard"
            onClick={() => !isLarge && setMobileOpen(false)}
          >
            {collapsed && isLarge ? (
              <MogzuLogo variant="mark" className="h-7 w-auto max-w-[42px]" />
            ) : (
              <MogzuLogo className="h-9 w-auto max-w-[120px]" />
            )}
          </Link>
        </div>

        <div className="relative hidden shrink-0 items-center justify-end border-b border-gray-200 px-2 py-2 lg:flex">
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-transform hover:scale-110 hover:bg-gray-50"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className={`transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <nav
          className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto ${collapsedDesktop ? 'px-2 py-3' : 'px-3 py-4'}`}
        >
          {navRows.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(location.pathname);
            if (collapsedDesktop) {
              return (
                <button
                  key={item.key}
                  type="button"
                  title={item.label}
                  onClick={() => go(item.path)}
                  className={`mb-2 flex w-full items-center justify-center rounded-md px-0 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </button>
              );
            }
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => go(item.path)}
                className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 whitespace-nowrap text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { VendorTopRightMenu } from '@/app/components/layouts/VendorTopRightMenu';
import { RoleSwitcher } from '@/app/components/global/RoleSwitcher';
import { RoleBanner } from '@/app/components/global/RoleBanner';
import { useDemoRole } from '@/app/lib/demoRole';
import { RoleTopNavItems } from '@/app/components/global/RoleTopNavItems';
import { getVendorNavVisibility } from '@/app/lib/vendorModuleSelection';
import {
  applyVendorShellNavAction,
  buildVendorShellNav,
  type VendorShellNavId,
} from '@/app/lib/vendorShellNav';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';

const VENDOR_SIDEBAR_COLLAPSED_KEY = 'mogzu_vendor_sidebar_collapsed_v1';

export type VendorAppShellProps = {
  activeNav: VendorShellNavId;
  /** Shown in the header after the menu / sidebar toggle (e.g. search input). */
  headerSearch: ReactNode;
  children: ReactNode;
  /** Passed to `applyVendorShellNavAction` for routes that show a notice (e.g. reports). */
  routeSource?: string;
  onNavNotice?: (message: string) => void;
  /** Replace default bell + profile block */
  headerEnd?: ReactNode;
  /**
   * When true (default), children scroll inside the shared corporate ambient surface.
   * Set false for multi-pane layouts (e.g. communication) that manage their own scroll regions.
   */
  useScrollSurface?: boolean;
};

export function VendorAppShell({
  activeNav,
  headerSearch,
  children,
  routeSource = 'vendor-shell',
  onNavNotice,
  headerEnd,
  useScrollSurface = true,
}: VendorAppShellProps) {
  const navigate = useNavigate();
  const { setActiveRole } = useDemoRole();
  const navVisibility = useMemo(() => getVendorNavVisibility(), []);
  const navItems = useMemo(() => buildVendorShellNav(navVisibility, activeNav), [navVisibility, activeNav]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(VENDOR_SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(VENDOR_SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const handleNavClick = (id: VendorShellNavId) => {
    applyVendorShellNavAction(navigate, id, {
      routeSource,
      onNotice: onNavNotice,
    });
    setMobileOpen(false);
  };

  const defaultHeaderEnd = (
    <>
      <RoleTopNavItems className="mr-1" />
      <RoleSwitcher />
      <button
        type="button"
        aria-label="Open communication and notifications"
        onClick={() =>
          navigate('/vendor/communication', {
            state: { source: routeSource, channel: 'notifications' },
          })
        }
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
      </button>
      <VendorTopRightMenu />
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter'] text-slate-900">
      <aside
        className={`${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        } shrink-0 border-r border-gray-200 bg-white flex flex-col transition-[width] duration-200 ease-out ${
          mobileOpen ? 'fixed inset-y-0 left-0 z-50 shadow-xl' : 'hidden'
        } lg:relative lg:flex lg:shadow-none`}
      >
        <div
          className={`flex h-14 shrink-0 items-center border-b border-gray-200 bg-white ${
            sidebarCollapsed ? 'justify-center px-2' : 'px-4'
          }`}
        >
          {sidebarCollapsed ? (
            <MogzuLogo variant="mark" className="h-7 w-7" />
          ) : (
            <MogzuLogo variant="wordmark" className="h-8 max-w-[140px]" blendWhite />
          )}
        </div>
        <nav
          className={`scrollbar-hide flex-1 overflow-y-auto ${
            sidebarCollapsed ? 'space-y-1.5 p-2' : 'space-y-0.5 px-3 py-4'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                title={sidebarCollapsed ? item.label : undefined}
                onClick={() => handleNavClick(item.id)}
                className={`mb-0.5 flex w-full items-center rounded-xl text-sm font-medium transition-colors ${
                  sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 pl-2.5 pr-3 py-2.5 border-l-[3px]'
                } ${
                  item.active
                    ? sidebarCollapsed
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] shadow-sm border-l-[#2563EB]'
                    : sidebarCollapsed
                      ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-transparent'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!sidebarCollapsed ? (
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100 lg:flex"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((c) => !c)}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden />
            ) : (
              <PanelLeftClose className="h-5 w-5" aria-hidden />
            )}
          </button>
          <div className="relative min-w-0 max-w-xl flex-1">{headerSearch}</div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {headerEnd ?? defaultHeaderEnd}
          </div>
        </header>
        <RoleBanner onSwitchToCorporate={() => setActiveRole('corporate')} />
        {useScrollSurface ? (
          <MogzuCorporateScrollSurface>{children}</MogzuCorporateScrollSurface>
        ) : (
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#FFFDF9]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

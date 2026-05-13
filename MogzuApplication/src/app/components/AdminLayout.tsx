import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ChevronDown,
  Package,
  LayoutGrid,
  Users,
  AlertCircle,
  Building2,
  Store,
  ArrowLeftRight,
  Headphones,
  UserPlus,
  ListChecks,
  ShoppingBag,
  Megaphone,
  Bell,
  FileBarChart,
  Settings,
  Layers,
  Menu,
  Search,
  HelpCircle,
  LogOut,
  ClipboardList,
  Tags,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { loadMogzuDirectCatalogueForAdmin } from '@/utils/mogzuDirectCatalogueAdmin';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';
import { clearAdminSession, getAdminSession } from '@/app/lib/adminSession';
import { RoleSwitcher } from '@/app/components/global/RoleSwitcher';
import { RoleBanner } from '@/app/components/global/RoleBanner';
import { useDemoRole } from '@/app/lib/demoRole';
import { RoleTopNavItems } from '@/app/components/global/RoleTopNavItems';
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveRole } = useDemoRole();
  const [authReady, setAuthReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);
  const [layoutNotice, setLayoutNotice] = useState('');

  const isClientsRoute = location.pathname === '/admin/clients';
  const isIssuesRoute = location.pathname === '/admin/issues';
  const isProductsArea = location.pathname.startsWith('/admin/products');
  const isProductsListRoute =
    location.pathname === '/admin/products' || location.pathname === '/admin/products/new';
  const isProductCategoriesRoute = location.pathname === '/admin/products/categories';
  const isTeamsRoute = location.pathname.startsWith('/admin/teams');
  const isVendorsRoute = location.pathname === '/admin/vendors';
  const isMogzuDirectRoute = location.pathname.startsWith('/admin/mogzu-direct');
  const isPartnersRoute = location.pathname.startsWith('/admin/partners');
  const isPartnerListingsRoute = location.pathname.startsWith('/admin/partner-listings');
  const isShortlistsRoute = location.pathname.startsWith('/admin/shortlists');
  const isMogzuOrdersRoute = location.pathname === '/admin/mogzu-orders';
  const isTransactionsRoute = location.pathname === '/admin/transactions';
  const isPromotionsRoute = location.pathname === '/admin/promotions';
  const isNotificationsRoute = location.pathname === '/admin/notifications';
  const isDashboardRoute = location.pathname === '/admin' || location.pathname === '/admin/';
  const isPlatformModulesRoute = location.pathname === '/admin/platform-modules';
  const isAdminListingsRoute = location.pathname.startsWith('/admin/listings');
  const isEventCategoriesRoute = location.pathname === '/admin/categories';

  const mogzuDirectListingCount = (() => {
    try {
      return loadMogzuDirectCatalogueForAdmin().length;
    } catch {
      return 0;
    }
  })();

  useEffect(() => {
    if (!getAdminSession()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    setAuthReady(true);
  }, [navigate]);

  useEffect(() => {
    setLayoutNotice('');
  }, [location.pathname]);

  const navLink = (path: string) => () => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleSignOut = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  const NavButton = ({
    active,
    icon: Icon,
    label,
    onClick,
    indent,
    badge,
  }: {
    active?: boolean;
    icon: typeof LayoutDashboard;
    label: string;
    onClick: () => void;
    indent?: boolean;
    badge?: string | number;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
        sidebarCollapsed ? 'justify-center px-0' : `gap-3 ${indent ? 'pl-9' : 'pl-2.5'} pr-3`
      } ${
        active
          ? sidebarCollapsed
            ? 'bg-[#2563EB] text-white shadow-sm'
            : 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] shadow-sm border-l-[3px] border-l-[#2563EB]'
          : sidebarCollapsed
            ? 'text-slate-400 hover:text-slate-600'
            : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-[3px] border-l-transparent'
      }`}
    >
      <Icon className="size-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
      {!sidebarCollapsed && (
        <>
          <span className="truncate text-left flex-1">{label}</span>
          {badge != null && badge !== '' ? (
            <span className="shrink-0 rounded-full bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </button>
  );

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] text-slate-500 text-sm font-['Inter',system-ui,sans-serif]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter',system-ui,sans-serif] text-slate-800">
      <aside
        className={`${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        } shrink-0 border-r border-slate-200 bg-white flex flex-col transition-[width] duration-200 ${
          mobileOpen ? 'fixed inset-y-0 left-0 z-50 shadow-xl' : 'hidden'
        } lg:flex lg:relative lg:shadow-none`}
      >
        <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-100">
          {sidebarCollapsed ? (
            <div className="w-full flex justify-center">
              <MogzuLogo variant="mark" className="h-7 w-auto max-w-[36px]" />
            </div>
          ) : (
            <MogzuLogo variant="wordmark" className="h-8 max-w-[140px]" blendWhite />
          )}
        </div>
        <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'p-2 space-y-1.5' : 'p-3 space-y-1'}`}>
          <NavButton
            active={isDashboardRoute}
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => {
              navigate('/admin');
              setMobileOpen(false);
            }}
          />
          <NavButton
            active={isAdminListingsRoute}
            icon={ClipboardList}
            label="Listings"
            onClick={() => {
              navigate('/admin/listings');
              setMobileOpen(false);
            }}
          />
          <NavButton
            active={isEventCategoriesRoute}
            icon={Tags}
            label="Categories"
            onClick={() => {
              navigate('/admin/categories');
              setMobileOpen(false);
            }}
          />
          <NavButton
            active={isMogzuDirectRoute}
            icon={LayoutGrid}
            label="Mogzu Direct"
            badge={mogzuDirectListingCount > 99 ? '99+' : mogzuDirectListingCount}
            onClick={navLink('/admin/mogzu-direct')}
          />
          <NavButton
            active={false}
            icon={Store}
            label="Vendors"
            onClick={() => {
              toast.info('Vendors section coming soon.')
              setMobileOpen(false)
            }}
          />
          <NavButton
            active={false}
            icon={Calendar}
            label="Bookings"
            onClick={() => {
              toast.info('Bookings section coming soon.');
              setMobileOpen(false);
            }}
          />
          <NavButton
            active={false}
            icon={FileBarChart}
            label="Reports"
            onClick={() => {
              toast.info('Reports are coming soon.');
              setMobileOpen(false);
            }}
          />
          <NavButton
            active={isPlatformModulesRoute}
            icon={Layers}
            label="Platform modules"
            onClick={() => {
              navigate('/admin/platform-modules');
              setMobileOpen(false);
            }}
          />
          <button
            type="button"
            onClick={() => setProductsOpen((o) => !o)}
            className={`w-full flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : 'gap-3 pl-2.5 pr-3'
            } ${
              isProductsArea
                ? sidebarCollapsed
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-[#EEF4FF] text-[#1D4ED8] ring-1 ring-blue-100/80 border-l-[3px] border-l-[#2563EB]'
                : sidebarCollapsed
                  ? 'text-slate-400 hover:text-slate-600'
                  : 'text-slate-600 hover:bg-[#F8FAFF] border-l-[3px] border-l-transparent'
            }`}
          >
            <Package className="size-[18px] shrink-0" strokeWidth={1.75} />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">Products &amp; Teams</span>
                <ChevronDown
                  className={`size-4 transition-transform ${productsOpen ? 'rotate-0' : '-rotate-90'}`}
                />
              </>
            )}
          </button>
          {productsOpen && !sidebarCollapsed && (
            <div className="space-y-0.5 pb-1">
              <NavButton
                active={isProductsListRoute}
                icon={Package}
                label="Products"
                onClick={() => {
                  navigate('/admin/products');
                  setMobileOpen(false);
                }}
                indent
              />
              <NavButton
                active={isProductCategoriesRoute}
                icon={LayoutGrid}
                label="Categories"
                onClick={() => {
                  navigate('/admin/products/categories');
                  setMobileOpen(false);
                }}
                indent
              />
              <NavButton
                active={isTeamsRoute}
                icon={Users}
                label="Teams"
                onClick={() => {
                  navigate('/admin/teams');
                  setMobileOpen(false);
                }}
                indent
              />
            </div>
          )}
          <NavButton
            active={isIssuesRoute}
            icon={AlertCircle}
            label="Issues"
            onClick={() => {
              navigate('/admin/issues');
              setMobileOpen(false);
            }}
          />
          <NavButton
            active={isClientsRoute}
            icon={Building2}
            label="Manage Clients"
            onClick={() => {
              navigate('/admin/clients');
              setMobileOpen(false);
            }}
          />
          <NavButton active={isPartnersRoute} icon={UserPlus} label="Partners" onClick={navLink('/admin/partners')} />
          <NavButton active={isPartnerListingsRoute} icon={Users} label="Partner listings" onClick={navLink('/admin/partner-listings')} />
          <NavButton active={isShortlistsRoute} icon={ListChecks} label="Shortlists" onClick={navLink('/admin/shortlists')} />
          <NavButton active={isMogzuOrdersRoute} icon={ShoppingBag} label="Mogzu orders" onClick={navLink('/admin/mogzu-orders')} />
          <NavButton active={isTransactionsRoute} icon={ArrowLeftRight} label="Transactions" onClick={navLink('/admin/transactions')} />
          <NavButton icon={Headphones} label="Support" onClick={navLink('/communication')} />
          <NavButton active={isPromotionsRoute} icon={Megaphone} label="Paid Promotion" onClick={navLink('/admin/promotions')} />
          <NavButton
            active={isNotificationsRoute}
            icon={Bell}
            label="Notification"
            onClick={() => {
              navigate('/admin/notifications');
              setMobileOpen(false);
            }}
          />
          <NavButton
            icon={Settings}
            label="Settings"
            onClick={() => {
              setLayoutNotice('Admin console settings are coming soon — not available in this build yet.');
              setMobileOpen(false);
            }}
          />
        </nav>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="h-14 shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 shadow-sm shadow-slate-200/40 flex items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5 text-slate-600" />
          </button>
          <button
            type="button"
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search"
              className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <RoleTopNavItems className="mr-1" />
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="Help"
              onClick={() => setLayoutNotice('Admin help center is coming soon — not available in this build yet.')}
            >
              <HelpCircle className="size-5" />
            </button>
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="Notifications"
              onClick={() => {
                navigate('/admin/notifications');
                setMobileOpen(false);
              }}
            >
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                12
              </span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <RoleSwitcher />
            <button
              type="button"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200"
              onClick={() => setLayoutNotice('Admin profile and account preferences will be available in a future release.')}
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                alt=""
                className="size-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <span className="hidden sm:block text-sm font-semibold text-slate-800">James Brown</span>
              <ChevronDown className="size-4 text-slate-400 hidden sm:block" />
            </button>
          </div>
        </header>
        <RoleBanner onSwitchToCorporate={() => setActiveRole('corporate')} />

        {layoutNotice ? (
          <p
            className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:px-6"
            role="status"
          >
            {layoutNotice}
          </p>
        ) : null}

        <MogzuCorporateScrollSurface className="p-4 lg:p-6">
          <Outlet />
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

# layouts.md
Shared layout and shell components with full source.
## SharedHeader
- Path: `src/app/components/layouts/SharedHeader.tsx`
- Description: Top navigation/header used in corporate pages

### `src/app/components/layouts/SharedHeader.tsx`
```tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User } from 'lucide-react';
import svgPaths from '@/imports/svg-camfkj9vq4';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { RoleSwitcher } from '@/app/components/global/RoleSwitcher';
import { RoleBanner } from '@/app/components/global/RoleBanner';
import { RoleTopNavItems } from '@/app/components/global/RoleTopNavItems';
import { useDemoRole } from '@/app/lib/demoRole';

export type SharedHeaderBrandPlacement = 'always' | 'mobileOnly';

interface SharedHeaderProps {
  onMobileMenuToggle?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Default `mobileOnly`: hide header brand on lg+ (sidebar shows logo). Use `always` when there is no sidebar logo. */
  brandInHeader?: SharedHeaderBrandPlacement;
}

/**
 * Shared header component for consistent top navigation
 */
export function SharedHeader({
  onMobileMenuToggle,
  searchPlaceholder = 'Search bookings, events, users...',
  searchValue,
  onSearchChange,
  brandInHeader = 'mobileOnly',
}: SharedHeaderProps) {
  const navigate = useNavigate();
  const { activeRole, setActiveRole } = useDemoRole();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [userMenuOpen]);

  useEffect(() => {
    const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        navigate('/login?reason=session-timeout');
      }, SESSION_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [navigate]);

  return (
    <div className="w-full shrink-0">
      <header className="bg-white h-14 border-b border-gray-200 flex items-center gap-2 px-4 lg:px-6 flex-shrink-0 relative z-50 w-full min-w-0">
      {/* Mobile: menu | logo | spacer + search (md+) | actions */}
      {onMobileMenuToggle && (
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12h18M3 6h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <div className={brandInHeader === 'mobileOnly' ? 'lg:hidden shrink-0' : 'shrink-0'}>
        <Link
          to="/"
          className="flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40"
          aria-label="Mogzu home"
        >
          <MogzuLogo variant="mark" className="h-8 w-auto max-w-[48px]" />
        </Link>
      </div>

      {/* Search Bar — centered in remaining space on md+ */}
      <div className="flex-1 min-w-0 flex justify-center px-2">
        <div className="w-full max-w-md hidden md:block">
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" stroke="#878e9e" strokeWidth="2" fill="none" />
              <path
                d="M21 21l-4.35-4.35"
                stroke="#878e9e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue !== undefined ? searchValue : undefined}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-9 pl-10 pr-4 text-sm bg-[#f6f6f8] border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent placeholder:text-[#878e9e]"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 shrink-0 ml-auto">
        <RoleTopNavItems />

        <RoleSwitcher />

        <div className="relative" ref={userMenuRef}>
          <button
            id="shared-header-user-button"
            type="button"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-controls="shared-header-user-menu"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="group flex items-center gap-2 p-1 pr-3 rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_2px_8px_rgba(37,99,235,0.10)] hover:border-blue-200 hover:shadow-[0_8px_20px_rgba(37,99,235,0.16)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-all duration-200"
          >
            <div
              className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-700 transition-colors group-hover:bg-blue-100"
              aria-hidden
            >
              <User className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start justify-center">
              <span className="text-[13px] font-semibold text-[#0e1e3f] font-['Inter'] leading-none mb-1">James Brown</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.3px] font-['Inter'] leading-none">Corporate Admin</span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className={`ml-0.5 text-blue-300 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-500'}`}
            >
              <path d={svgPaths.p30a2f900} fill="currentColor" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div
            id="shared-header-user-menu"
            role="menu"
            aria-labelledby="shared-header-user-button"
            className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#ececec] transition-all duration-200 z-50 overflow-hidden ${
              userMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
            }`}
          >
            <div className="p-3 border-b border-[#ececec] bg-slate-50">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="size-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600"
                  aria-hidden
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0e1e3f]">James Brown</span>
                  <span className="text-[11px] text-slate-500 font-medium">james.brown@mogzu.com</span>
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/wallet');
                }}
                className="w-full bg-white border border-[#ececec] rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:border-[#2563eb] transition-colors text-left"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Wallet Balance</span>
                  <span className="text-sm font-black text-[#0e1e3f]">1,250 pts <span className="text-xs text-slate-400 font-medium">($12.50)</span></span>
                </div>
                <svg className="w-4 h-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="p-2 flex flex-col gap-0.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/my-profile');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/company-settings');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Company Settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/billing-invoices');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Billing & Invoices
              </button>
            </div>
            <div className="p-2 border-t border-[#ececec]">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/login');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 border border-transparent hover:border-red-100 hover:bg-[linear-gradient(180deg,#fff5f5_0%,#fff0f0_100%)] transition-all duration-150 w-full text-left font-semibold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
      </header>
      <RoleBanner onSwitchToCorporate={() => setActiveRole('corporate')} />
    </div>
  );
}

```

## SharedSidebar
- Path: `src/app/components/layouts/SharedSidebar.tsx`
- Description: Primary corporate left navigation sidebar

### `src/app/components/layouts/SharedSidebar.tsx`
```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import svgPaths from '@/imports/svg-camfkj9vq4';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
}

interface SharedSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeNav?: string;
}

/**
 * Shared sidebar component for consistent navigation across all pages
 */
export function SharedSidebar({
  collapsed = false,
  onToggleCollapse,
  activeNav,
}: SharedSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const readCount = () => {
      const raw = localStorage.getItem('corporateUnreadNotifications');
      const parsed = raw ? Number(raw) : 2;
      if (Number.isNaN(parsed) || parsed < 0) {
        setUnreadNotificationsCount(2);
        return;
      }
      setUnreadNotificationsCount(parsed);
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'corporateUnreadNotifications') {
        readCount();
      }
    };

    const handleFocus = () => readCount();
    const handleNotificationsUpdated = () => readCount();

    readCount();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('corporate-notifications-updated', handleNotificationsUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('corporate-notifications-updated', handleNotificationsUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    const readMessageCount = () => {
      const raw = localStorage.getItem('corporateUnreadMessages');
      const parsed = raw ? Number(raw) : 0;
      if (Number.isNaN(parsed) || parsed < 0) {
        setUnreadMessagesCount(0);
        return;
      }
      setUnreadMessagesCount(parsed);
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'corporateUnreadMessages') {
        readMessageCount();
      }
    };

    const handleFocus = () => readMessageCount();
    const handleMessagesUpdated = () => readMessageCount();

    readMessageCount();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('corporate-messages-updated', handleMessagesUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('corporate-messages-updated', handleMessagesUpdated as EventListener);
    };
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400', path: '/dashboard' },
    { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800', path: '/activitysuite' },
    { id: 'bookings', label: 'Bookings', icon: 'paf72c00', path: '/bookings' },
    { id: 'favourites', label: 'Favourites', icon: 'p27070280', path: '/favourites' },
    { id: 'users', label: 'Users', icon: 'p29193540', path: '/user-management' },
    { id: 'notification', label: 'Notification', icon: 'p4e64800', path: '/corporate/notifications' },
    { id: 'communication', label: 'Communication', icon: 'p319d300', path: '/communication' },
    { id: 'budget', label: 'Budget', icon: 'p2683f80', path: '/corporate/budget' },
    { id: 'report', label: 'Report', icon: 'p1f81a280', path: '/report' },
    { id: 'transactions', label: 'Transactions', icon: 'p2683f80', path: '/corporate/transactions' },
    { id: 'settings', label: 'Settings', icon: 'pde1bb00', path: '/company-settings' },
  ];

  // Determine active nav based on current path if not provided
  const getActiveNav = () => {
    if (activeNav) return activeNav;
    
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (
      path.startsWith('/activitysuite') ||
      path.startsWith('/activities') ||
      path.startsWith('/spacex') ||
      path.startsWith('/coworking') ||
      path.startsWith('/events') ||
      path.startsWith('/event-activity') ||
      path.startsWith('/heygenie') ||
      path.startsWith('/gifting') ||
      path.startsWith('/dspace') ||
      path.startsWith('/stay')
    )
      return 'activity';
    if (path.startsWith('/shop') || path.startsWith('/gifting-shop') || path.startsWith('/product-booking')) return 'shop';
    if (path.startsWith('/celebrations')) return 'celebrations';
    if (path.startsWith('/user-management')) return 'users';
    if (path.startsWith('/communication')) return 'communication';
    if (path.startsWith('/report')) return 'report';
    if (path.startsWith('/favourites')) return 'favourites';
    if (path.startsWith('/deals')) return 'deals';
    if (path.startsWith('/corporate/transactions')) return 'transactions';
    if (path.startsWith('/corporate/notifications')) return 'notification';
    if (path.startsWith('/corporate/approvals')) return 'bookings'; // Approvals moved under Bookings
    if (path.startsWith('/corporate/budget')) return 'budget';
    if (path.startsWith('/bookings')) return 'bookings';
    if (path.startsWith('/company-settings')) return 'settings';
    return '';
  };

  const currentActive = getActiveNav();

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px] bg-white' : 'w-[240px] bg-white'
      } flex-shrink-0 border-r border-gray-200 transition-all duration-300 fixed lg:relative z-40 h-full`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-gray-200 bg-white">
        <Link
          to="/dashboard"
          className={`flex items-center justify-center w-full ${collapsed ? '' : 'px-4'}`}
          aria-label="Mogzu — Dashboard"
        >
          {collapsed ? (
            <MogzuLogo variant="mark" className="h-7 w-auto max-w-[42px]" />
          ) : (
            <MogzuLogo variant="wordmark" className="h-8 w-auto max-w-[112px]" />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`${collapsed ? 'py-3 px-2' : 'py-3 px-3'} overflow-y-auto scrollbar-hide h-[calc(100%-3.5rem)]`}>
        {collapsed ? (
          // Collapsed view - icons only
          <>
            <div className="mb-2">
              {navItems.slice(0, 1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                  className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                    currentActive === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={svgPaths[item.icon]} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="mb-2">
              {navItems.slice(1, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'notification' || item.label.toLowerCase() === 'notification') {
                      handleNavClick({ ...item, id: 'corporate-notifications', path: '/corporate/notifications' });
                    } else if (item.id === 'favourites') {
                      handleNavClick({ ...item, path: '/favourites' });
                    } else {
                      handleNavClick(item);
                    }
                  }}
                  title={item.label}
                  className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                    currentActive === item.id || (item.id === 'notification' && currentActive === 'corporate-notifications') || (item.id === 'favourites' && currentActive === 'favourites')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className="relative">
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPaths[item.icon as keyof typeof svgPaths]} fill="currentColor" />
                    </svg>
                    {item.id === 'notification' && unreadNotificationsCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => navigate('/deals')}
                title="Deals"
                className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                  currentActive === 'deals'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </button>

              {navItems.slice(6, 7).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                  className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                    currentActive === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className="relative">
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPaths[item.icon]} fill="currentColor" />
                    </svg>
                    {item.id === 'communication' && unreadMessagesCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div>
              {navItems.slice(7).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                  className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                    currentActive === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={svgPaths[item.icon]} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        ) : (
          // Expanded view — classic density (matches pre–polish gifting sidebar)
          <>
            <div className="mb-4">
              {navItems.slice(0, 1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] text-sm font-medium transition-colors mb-0.5 ${
                    currentActive === item.id
                      ? 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] border-l-[#2563EB]'
                      : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-transparent'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 28 28" fill="none" className="shrink-0">
                    <path d={svgPaths[item.icon]} fill="currentColor" />
                  </svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mb-3 mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                Manage
              </p>
              {navItems.slice(1, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'notification' || item.label.toLowerCase() === 'notification') {
                      handleNavClick({ ...item, id: 'corporate-notifications', path: '/corporate/notifications' });
                    } else if (item.id === 'favourites') {
                      handleNavClick({ ...item, path: '/favourites' });
                    } else {
                      handleNavClick(item);
                    }
                  }}
                  className={`relative w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] text-sm font-medium transition-colors mb-0.5 ${
                    currentActive === item.id || (item.id === 'notification' && currentActive === 'notification') || (item.id === 'favourites' && currentActive === 'favourites')
                      ? 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] border-l-[#2563EB]'
                      : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                      <path d={svgPaths[item.icon as keyof typeof svgPaths]} fill="currentColor" />
                    </svg>
                    {item.id === 'notification' && unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                </button>
              ))}

              <button
                onClick={() => navigate('/deals')}
                className={`w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] text-sm font-medium transition-colors mb-0.5 ${
                  currentActive === 'deals'
                    ? 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] border-l-[#2563EB]'
                    : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-transparent'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span className="whitespace-nowrap flex-1 text-left">
                  Deals
                </span>
              </button>

              {navItems.slice(6, 7).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] text-sm font-medium transition-colors mb-0.5 ${
                    currentActive === item.id
                      ? 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] border-l-[#2563EB]'
                      : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                      <path d={svgPaths[item.icon]} fill="currentColor" />
                    </svg>
                    {item.id === 'communication' && unreadMessagesCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                Account
              </p>
              {navItems.slice(7).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] text-sm font-medium transition-colors mb-0.5 ${
                    currentActive === item.id
                      ? 'bg-[rgba(37,99,235,0.08)] text-[#1D4ED8] border-l-[#2563EB]'
                      : 'text-slate-600 hover:bg-[#F8FAFF] hover:text-slate-900 border-l-transparent'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 28 28" fill="none" className="shrink-0">
                    <path d={svgPaths[item.icon]} fill="currentColor" />
                  </svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-[4.5rem] w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 shadow-md z-50 transition-transform hover:scale-110"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className={`transform transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
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
      )}
    </aside>
  );
}

```

## MogzuCorporateScrollSurface
- Path: `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
- Description: Scrollable ambient content wrapper

### `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
```tsx
import type { ReactNode } from 'react';
import { MogzuAmbientBackdrop } from './MogzuAmbientBackdrop';

type MogzuCorporateScrollSurfaceProps = {
  children: ReactNode;
  /** Applied to the inner content wrapper (relative z-[1]) */
  className?: string;
};

/**
 * Primary scroll column for corporate workspace: cream ambient backdrop + scrollable content.
 * Use inside the flex column next to SharedSidebar (below SharedHeader).
 *
 * Inner flow wrapper ensures the backdrop’s absolute inset-0 covers the full scrollable
 * document height (not only the scrollport), so gradients don’t stop mid-page.
 */
export function MogzuCorporateScrollSurface({ children, className = '' }: MogzuCorporateScrollSurfaceProps) {
  return (
    <div className="relative isolate min-h-0 flex-1 overflow-y-auto bg-transparent">
      <div className="relative min-h-full w-full">
        <div className="pointer-events-none absolute inset-0">
          <MogzuAmbientBackdrop variant="corporate" density="full" />
        </div>
        <div className={`relative z-[1] min-h-full ${className}`.trim()}>{children}</div>
      </div>
    </div>
  );
}

```

## MogzuLogo
- Path: `src/app/components/branding/MogzuLogo.tsx`
- Description: Brand mark and wordmark logo component

### `src/app/components/branding/MogzuLogo.tsx`
```tsx
/**
 * Wordmark: colorful PNG from `public/branding/mogzu-wordmark.png`.
 * Mark: single-letter “m” monogram (no figma:asset).
 */
const WORDMARK_SRC = '/branding/mogzu-wordmark.png';
const MARK_SRC = '/branding/mogzu-mark-m.png';

export type MogzuLogoVariant = 'mark' | 'wordmark';

export interface MogzuLogoProps {
  variant?: MogzuLogoVariant;
  /** Applied to wrapper; for mark use square e.g. `h-7 w-7`; for wordmark use height + max-w */
  className?: string;
  /**
   * When true (default), wordmark uses mix-blend-multiply for white matte on light backgrounds.
   * Ignored for `variant="mark"`.
   */
  blendWhite?: boolean;
  /**
   * Wordmark image alignment inside its box. Use `center` on frosted/glass panels so the mark
   * does not sit on the left edge of a wide hit target. Default `center`.
   */
  wordmarkAlign?: 'left' | 'center';
  /** Extra classes on the wordmark `<img>` */
  imgClassName?: string;
}

/**
 * Collapsed-rail monogram uses the exact provided "m" reference asset.
 * mix-blend-multiply helps the white matte blend into light surfaces.
 */
function MogzuMarkMonogram({ className = '' }: { className?: string }) {
  const outer = `inline-flex shrink-0 items-center justify-center bg-transparent ${className}`.trim();
  return (
    <span className={outer} role="img" aria-label="Mogzu">
      <img
        src={MARK_SRC}
        alt="Mogzu"
        className="h-full w-auto max-w-full object-contain object-center mix-blend-multiply"
        draggable={false}
        decoding="async"
      />
    </span>
  );
}

export function MogzuLogo({
  variant = 'wordmark',
  className = '',
  blendWhite = true,
  wordmarkAlign = 'center',
  imgClassName = '',
}: MogzuLogoProps) {
  if (variant === 'mark') {
    return <MogzuMarkMonogram className={className} />;
  }

  const wrapper = `inline-flex items-center justify-center shrink-0 ${className}`.trim();
  const userSetsBlend = /\bmix-blend-[^\s]+/.test(imgClassName);
  const blendClass = blendWhite
    ? 'mix-blend-multiply'
    : userSetsBlend
      ? ''
      : 'mix-blend-normal';
  const objectPositionClass = wordmarkAlign === 'left' ? 'object-left' : 'object-center';

  return (
    <span className={wrapper}>
      <img
        src={WORDMARK_SRC}
        alt="Mogzu"
        className={`h-full w-auto max-w-full object-contain ${objectPositionClass} ${blendClass} ${imgClassName}`.trim()}
        draggable={false}
        decoding="async"
      />
    </span>
  );
}

```

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import svgPaths from '@/imports/svg-camfkj9vq4';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
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
  const location = useLocation();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  // Mobile drawer open state — decoupled from desktop `collapsed`. Driven by a
  // window event the header hamburger dispatches; closes on backdrop tap + nav.
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setMobileOpen((o) => !o);
    const close = () => setMobileOpen(false);
    window.addEventListener('mogzu-mobile-nav-toggle', toggle);
    window.addEventListener('mogzu-mobile-nav-close', close);
    return () => {
      window.removeEventListener('mogzu-mobile-nav-toggle', toggle);
      window.removeEventListener('mogzu-mobile-nav-close', close);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false); // close drawer after navigation
  }, [location.pathname]);

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
    { id: 'report', label: 'Report', icon: 'p1f81a280', path: '/corporate/spend-report' },
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
    if (path.startsWith('/corporate/spend-report') || path.startsWith('/report')) return 'report';
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

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}
      <aside
      className={`${
        collapsed ? 'w-[72px] bg-white' : 'w-[240px] bg-white'
      } flex-shrink-0 border-r border-gray-200 transition-transform lg:transition-all duration-300 fixed lg:relative z-40 h-full ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
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
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={currentActive === item.id ? 'page' : undefined}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                    currentActive === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={svgPaths[item.icon]} fill="currentColor" />
                  </svg>
                </Link>
              ))}
            </div>
            <div className="mb-2">
              {navItems.slice(1, 6).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={
                    currentActive === item.id || (item.id === 'notification' && currentActive === 'corporate-notifications') || (item.id === 'favourites' && currentActive === 'favourites')
                      ? 'page'
                      : undefined
                  }
                  title={item.label}
                  aria-label={item.label}
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
                </Link>
              ))}

              <Link
                to="/deals"
                aria-current={currentActive === 'deals' ? 'page' : undefined}
                title="Deals"
                aria-label="Deals"
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
              </Link>

              {navItems.slice(6, 7).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={currentActive === item.id ? 'page' : undefined}
                  title={item.label}
                  aria-label={item.label}
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
                </Link>
              ))}
            </div>
            <div>
              {navItems.slice(7).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={currentActive === item.id ? 'page' : undefined}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-full flex items-center justify-center px-0 py-2.5 rounded-xl text-xs font-medium transition-colors mb-2 ${
                    currentActive === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={svgPaths[item.icon]} fill="currentColor" />
                  </svg>
                </Link>
              ))}
            </div>
          </>
        ) : (
          // Expanded view — classic density (matches pre–polish gifting sidebar)
          <>
            <div className="mb-4">
              {navItems.slice(0, 1).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={currentActive === item.id ? 'page' : undefined}
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
                </Link>
              ))}
            </div>
            <div className="mb-3 mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                Manage
              </p>
              {navItems.slice(1, 6).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={
                    currentActive === item.id || (item.id === 'notification' && currentActive === 'notification') || (item.id === 'favourites' && currentActive === 'favourites')
                      ? 'page'
                      : undefined
                  }
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
                </Link>
              ))}

              <Link
                to="/deals"
                aria-current={currentActive === 'deals' ? 'page' : undefined}
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
              </Link>

              {navItems.slice(6, 7).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={currentActive === item.id ? 'page' : undefined}
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
                </Link>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                Account
              </p>
              {navItems.slice(7).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={currentActive === item.id ? 'page' : undefined}
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
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
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
    </>
  );
}

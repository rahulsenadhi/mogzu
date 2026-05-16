import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User } from 'lucide-react';
import svgPaths from '@/imports/svg-camfkj9vq4';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { RoleSwitcher } from '@/app/components/global/RoleSwitcher';
import { AuthRoleSwitcher } from '@/app/components/global/AuthRoleSwitcher';
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
  /** `blended` softens the bar to sit on Mogzu cream/ambient workspace (e.g. Gifting) */
  variant?: 'solid' | 'blended';
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
  variant = 'solid',
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
      <header
        className={
          variant === 'blended'
            ? 'h-14 flex items-center gap-2 px-4 lg:px-6 flex-shrink-0 relative z-50 w-full min-w-0 border-b border-slate-200/25 bg-[#fffdf9]/[0.88] backdrop-blur-sm'
            : 'bg-white h-14 border-b border-gray-200 flex items-center gap-2 px-4 lg:px-6 flex-shrink-0 relative z-50 w-full min-w-0'
        }
      >
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

        <AuthRoleSwitcher />

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

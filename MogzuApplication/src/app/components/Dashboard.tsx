import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, Gift, Package, RefreshCw, Truck, Building2 } from 'lucide-react';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar';
import svgPaths from '@/imports/svg-camfkj9vq4';
import { QA_IMAGES } from '@/app/lib/qaImagery';
import PromoBanner from '@/app/components/PromoBanner';
import ActivitySuite from '@/app/components/ActivitySuite';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';
import {
  ACTIVITY_SUITE_ID_TO_MODULE,
  getModuleCorporateState,
} from '@/app/lib/platformMarketplaceSettings';
import { usePlatformMarketplaceSettings } from '@/app/lib/usePlatformMarketplaceSettings';
import { useCorporateDashboardPreferences } from '@/app/lib/useCorporateDashboardPreferences';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { FulfilmentStage, ModuleId } from '@/lib/database.types';
import { getSubscriptionByCorporate, type SubscriptionWithPlan } from '@/lib/subscriptions';

const MODULE_BADGE_LABEL: Record<ModuleId, string> = {
  events: 'Event',
  gifting: 'Gifting',
  spacex_coworking: 'D Space',
  spacex_stay: 'Stay',
};

const MODULE_BADGE_COLOR: Record<ModuleId, string> = {
  events: '#fa8d40',
  gifting: '#34c5dc',
  spacex_coworking: '#ef4444',
  spacex_stay: '#9b51e0',
};

const FULFILMENT_STAGE_LABEL: Record<FulfilmentStage, string> = {
  ordered: 'Processing',
  packed: 'Processing',
  dispatched: 'In transit',
  out_for_delivery: 'In transit',
  delivered: 'Delivered',
  returned: 'Returned',
};

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const shortDateFmt = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' });

interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  color: string;
  bgColor: string;
}

interface ActivityCard {
  id: string;
  title: string;
  image?: string;
  icon?: 'dspace' | 'event' | 'gifting';
  color: string;
  bgColor: string;
}

interface BookingItem {
  id: string;
  date: string;
  title: string;
  description: string;
  leadBy: string;
  badge: string;
  badgeColor: string;
}

interface ShipmentRow {
  id: string;
  name: string;
  status: string;
  eta: string;
  carrier: string;
}

export default function Dashboard() {
  usePlatformMarketplaceSettings();
  const dashPrefs = useCorporateDashboardPreferences();
  const { corporateId, profile, corporateAccount } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNav, setSelectedNav] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    totalEmployees: 0,
    totalSpend: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [userRequests, setUserRequests] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [upcomingEvents, setUpcomingEvents] = useState<
    Array<{ id: string; date: string; title: string; leadBy: string }>
  >([]);
  const [orderHubShipments, setOrderHubShipments] = useState<ShipmentRow[]>([]);
  const [shipmentCounts, setShipmentCounts] = useState({ delivered: 0, inTransit: 0, processing: 0 });
  const [retryTick, setRetryTick] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);

  useEffect(() => {
    if (!corporateId) return;
    let cancelled = false;
    (async () => {
      const { data } = await getSubscriptionByCorporate(corporateId);
      if (!cancelled) setSubscription(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [corporateId, retryTick]);

  const subBanner = useMemo(() => {
    if (!subscription) return null;
    const pastDue = subscription.status === 'past_due';
    const willDowngrade = subscription.dunning_attempts >= 3;
    if (!pastDue && !willDowngrade) return null;
    return {
      title: willDowngrade ? 'Your plan will downgrade to Free soon' : 'Payment past due',
      body: willDowngrade
        ? `${subscription.dunning_attempts} retry attempts failed. Resolve billing before the 14-day window closes to keep your current plan.`
        : 'A recent payment failed. Update your billing details to avoid service interruption.',
    };
  }, [subscription]);

  useEffect(() => {
    if (!corporateId) return;
    let cancelled = false;
    (async () => {
      setIsBudgetLoading(true);
      setBudgetLoadError('');
      const [bookingsRes, pendingRes, employeesRes, profilesRes, budgetsRes] = await Promise.all([
        db.bookings.listByCorporate(corporateId),
        db.bookings.listPendingApproval(corporateId),
        db.employees.listByCorporate(corporateId),
        db.userProfiles.listByCorporate(corporateId),
        db.budgets.listByCorporate(corporateId),
      ]);
      if (cancelled) return;

      const firstErr =
        bookingsRes.error ?? pendingRes.error ?? employeesRes.error ?? profilesRes.error ?? budgetsRes.error;
      if (firstErr) {
        setBudgetLoadError(firstErr.message);
        setIsBudgetLoading(false);
        return;
      }

      const allBookings = bookingsRes.data ?? [];
      const pending = pendingRes.data ?? [];
      const employees = employeesRes.data ?? [];
      const profiles = profilesRes.data ?? [];
      const budgetRules = budgetsRes.data ?? [];
      const nameByUserId = new Map<string, string>(
        profiles.map((p) => [p.id, p.full_name ?? '—']),
      );
      const deptByUserId = new Map<string, string | null>(
        profiles.map((p) => [p.id, p.department]),
      );

      const billable = allBookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'completed',
      );
      const totalSpend = billable.reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

      setStatsData({
        totalBookings: allBookings.length,
        pendingRequests: pending.length,
        totalEmployees: employees.length,
        totalSpend,
      });

      setRecentBookings(
        allBookings.slice(0, 5).map((b) => ({
          id: b.id,
          date: dateFmt.format(new Date(b.created_at)),
          title: b.listings?.title ?? 'Booking',
          description: b.purpose_note ?? '',
          leadBy: nameByUserId.get(b.user_id) ?? '—',
          badge: MODULE_BADGE_LABEL[b.module] ?? 'Booking',
          badgeColor: MODULE_BADGE_COLOR[b.module] ?? '#4379ee',
        })),
      );

      setUserRequests(
        pending.slice(0, 5).map((b) => {
          const name =
            (b as { user_profiles?: { full_name?: string | null } | null }).user_profiles
              ?.full_name ?? nameByUserId.get(b.user_id) ?? 'Pending user';
          const amount =
            typeof b.total_amount === 'number'
              ? ` of ₹${b.total_amount.toLocaleString('en-IN')}`
              : '';
          return {
            id: b.id,
            name,
            description: `Approval needed for ${b.listings?.title ?? 'booking'}${amount}`,
          };
        }),
      );

      const nowIso = new Date().toISOString();
      setUpcomingEvents(
        allBookings
          .filter(
            (b) =>
              b.module === 'events' &&
              b.start_time &&
              b.start_time > nowIso &&
              (b.status === 'confirmed' || b.status === 'pending_vendor'),
          )
          .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
          .slice(0, 5)
          .map((b) => ({
            id: b.id,
            date: dateFmt.format(new Date(b.start_time!)),
            title: b.listings?.title ?? 'Event',
            leadBy: nameByUserId.get(b.user_id) ?? '—',
          })),
      );

      const gifting = allBookings.filter((b) => b.module === 'gifting');
      const delivered = gifting.filter((b) => b.fulfilment_stage === 'delivered').length;
      const inTransit = gifting.filter(
        (b) =>
          b.fulfilment_stage === 'dispatched' || b.fulfilment_stage === 'out_for_delivery',
      ).length;
      const processing = gifting.filter(
        (b) => b.fulfilment_stage === 'ordered' || b.fulfilment_stage === 'packed',
      ).length;
      setShipmentCounts({ delivered, inTransit, processing });

      setOrderHubShipments(
        gifting
          .filter((b) => b.fulfilment_stage && b.fulfilment_stage !== 'delivered')
          .slice(0, 5)
          .map((b) => ({
            id: b.id,
            name: b.listings?.title ?? 'Order',
            status: FULFILMENT_STAGE_LABEL[b.fulfilment_stage!] ?? 'Processing',
            eta: b.start_time ? shortDateFmt.format(new Date(b.start_time)) : '—',
            carrier: b.carrier ?? '—',
          })),
      );

      const billableForBudget = billable;
      const currentUserId = profile?.id ?? null;
      const currentDept = profile?.department ?? null;

      const personalRule = budgetRules.find(
        (r) => r.scope === 'individual' && currentUserId !== null && r.scope_value === currentUserId,
      );
      const personalSpent = personalRule
        ? billableForBudget
            .filter((b) => b.user_id === currentUserId)
            .reduce((sum, b) => sum + (b.total_amount ?? 0), 0)
        : 0;
      const personalAllocated = personalRule?.amount ?? 0;
      setPersonalBudget({
        allocated: personalAllocated,
        spent: personalSpent,
        remaining: Math.max(0, personalAllocated - personalSpent),
      });

      const departmentRule = budgetRules.find(
        (r) => r.scope === 'department' && currentDept !== null && r.scope_value === currentDept,
      );
      const departmentSpent = departmentRule
        ? billableForBudget
            .filter((b) => deptByUserId.get(b.user_id) === currentDept)
            .reduce((sum, b) => sum + (b.total_amount ?? 0), 0)
        : 0;
      const departmentAllocated = departmentRule?.amount ?? 0;
      setDepartmentBudget({
        allocated: departmentAllocated,
        spent: departmentSpent,
        remaining: Math.max(0, departmentAllocated - departmentSpent),
      });

      const moduleColorClass: Record<ModuleId, string> = {
        events: 'bg-[#9B51E0]',
        gifting: 'bg-[#15D39D]',
        spacex_coworking: 'bg-[#4379ee]',
        spacex_stay: 'bg-[#FA8D40]',
      };
      const moduleRules = budgetRules.filter((r) => r.module !== null);
      const spendByModule = new Map<ModuleId, number>();
      for (const b of billableForBudget) {
        if (b.module) spendByModule.set(b.module, (spendByModule.get(b.module) ?? 0) + (b.total_amount ?? 0));
      }
      setCategoryBudgets(
        moduleRules.slice(0, 4).map((r) => ({
          name: MODULE_BADGE_LABEL[r.module as ModuleId] ?? 'Module',
          allocated: r.amount,
          spent: spendByModule.get(r.module as ModuleId) ?? 0,
          colorClass: moduleColorClass[r.module as ModuleId] ?? 'bg-[#4379ee]',
        })),
      );

      setHasBudgetSetup(budgetRules.length > 0);
      setIsBudgetLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [corporateId, profile?.id, profile?.department, retryTick]);

  const currentPlan = corporateAccount?.plan ?? 'starter';

  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  const [budgetLoadError, setBudgetLoadError] = useState('');
  const [hasBudgetSetup, setHasBudgetSetup] = useState(false);
  const [personalBudget, setPersonalBudget] = useState({ allocated: 0, spent: 0, remaining: 0 });
  const [departmentBudget, setDepartmentBudget] = useState({ allocated: 0, spent: 0, remaining: 0 });
  const [categoryBudgets, setCategoryBudgets] = useState<
    Array<{ name: string; allocated: number; spent: number; colorClass: string }>
  >([]);

  const planBadge = useMemo(() => {
    switch (currentPlan) {
      case 'enterprise':
        return { label: 'Enterprise', color: 'bg-[#F59E0B] text-white' };
      case 'growth':
        return { label: 'Growth', color: 'bg-[#2563EB] text-white' };
      default:
        return { label: 'Starter', color: 'bg-[#FA8D40] text-white' };
    }
  }, [currentPlan]);

  const firstName = useMemo(() => {
    const full = profile?.full_name?.trim();
    if (!full) return null;
    return full.split(/\s+/)[0];
  }, [profile?.full_name]);

  const stats: StatCard[] = useMemo(
    () => [
      {
        id: 'booking',
        title: 'Total bookings',
        value: statsData.totalBookings.toLocaleString('en-IN'),
        change: 'All-time',
        color: '#4379ee',
        bgColor: '#ebf1ff',
      },
      {
        id: 'request',
        title: 'Pending approvals',
        value: statsData.pendingRequests.toLocaleString('en-IN'),
        change: 'Awaiting manager',
        color: '#fa8d40',
        bgColor: '#fff7ed',
      },
      {
        id: 'employees',
        title: 'Total employees',
        value: statsData.totalEmployees.toLocaleString('en-IN'),
        change: 'Active in directory',
        color: '#4bd17c',
        bgColor: '#f0fdf4',
      },
      {
        id: 'spend',
        title: 'Total spend',
        value: `₹${Math.round(statsData.totalSpend).toLocaleString('en-IN')}`,
        change: 'Confirmed + completed',
        color: '#34c5dc',
        bgColor: '#ecfeff',
      },
    ],
    [statsData],
  );

  const activities: ActivityCard[] = [
    {
      id: 'spacex',
      title: 'D Space',
      icon: 'dspace',
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
    {
      id: 'event',
      title: 'EVENT',
      icon: 'event',
      color: '#fa8d40',
      bgColor: '#fff7ed',
    },
    {
      id: 'gifting',
      title: 'GIFTING',
      icon: 'gifting',
      color: '#34c5dc',
      bgColor: '#ecfeff',
    },
    {
      id: 'heygenie',
      title: 'HEY GENIE',
      image: QA_IMAGES.activitySuite.heygenie,
      color: '#22c55e',
      bgColor: '#f0fdf4',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400' },
    { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800' },
    { id: 'bookings', label: 'Bookings', icon: 'paf72c00' },
    { id: 'favorites', label: 'Favorites', icon: 'p27070280' },
    { id: 'users', label: 'Users', icon: 'p29193540' },
    { id: 'notification', label: 'Notification', icon: 'p4e64800' },
    { id: 'communication', label: 'Communication', icon: 'p319d300' },
    { id: 'report', label: 'Report', icon: 'p1f81a280' },
    { id: 'transactions', label: 'Transactions', icon: 'p2683f80' },
    { id: 'settings', label: 'Settings', icon: 'pde1bb00' },
  ];

  return (
    <div className="flex h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={selectedNav === 'activity' ? 'activity' : 'dashboard'}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
        {/* Top Header */}
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
          {selectedNav === 'activity' ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <ActivitySuite />
            </div>
          ) : (
            <MogzuCorporateScrollSurface className="antialiased font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif]">
          {/* Welcome Section with decorative background */}
          <div className="relative overflow-hidden border-b border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_24px_rgba(37,99,235,0.08)]">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-8">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-[#0e1e3f] sm:text-4xl">
                  {firstName ? `Hi ${firstName}, let’s get started!` : 'Welcome back!'}
                </h1>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${planBadge.color}`}>
                  {planBadge.label} Plan
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-slate-600">
                Here&apos;s what&apos;s happening with your workspace today.
              </p>
            </div>
            {/* Decorative curved shape — Mogzu blue family */}
            <div className="pointer-events-none absolute top-0 right-0 h-full w-64 opacity-[0.12]">
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <path d="M0,100 Q50,0 100,50 T200,100 V200 H0 Z" fill="#4379ee" />
              </svg>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            {subBanner && (
              <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 p-5">
                <div>
                  <h3 className="mb-1 text-lg font-bold text-rose-900">{subBanner.title}</h3>
                  <p className="text-sm text-rose-800">{subBanner.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/account/billing')}
                  className="whitespace-nowrap rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                >
                  Update Billing
                </button>
              </div>
            )}
            {/* Conditional Plan Banners */}
            {dashPrefs.planBanners && currentPlan === 'starter' && (
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-1">Your Starter plan is active</h3>
                  <p className="text-sm text-orange-800">Upgrade to Growth or Enterprise to unlock budget rules, approvals, and HRMS sync.</p>
                </div>
                <button
                  onClick={() => navigate('/signup/corporate/access')}
                  className="px-5 py-2.5 bg-[#FA8D40] text-white text-sm font-semibold rounded-lg hover:bg-[#e67c2d] transition-colors whitespace-nowrap"
                >
                  Upgrade Now
                </button>
              </div>
            )}
            
            {dashPrefs.planBanners && currentPlan === 'enterprise' && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-1">Welcome to Enterprise Suite</h3>
                  <p className="text-sm text-amber-800">Your dedicated Success Manager, Sarah, will be in touch shortly to configure your HRMS integration.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/communication')}
                  className="px-5 py-2.5 bg-white border border-amber-300 text-amber-900 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors whitespace-nowrap shadow-sm"
                >
                  Schedule Kickoff
                </button>
              </div>
            )}

            {/* Special offers carousel — visible for all plans (see QA plan: free-trial previously hid this) */}
            {dashPrefs.promoBanner ? <PromoBanner /> : null}

            {/* You might want to try section */}
            {dashPrefs.youMightWantToTry ? (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#4379ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <h2 className="text-xl font-semibold tracking-tight text-[#0e1e3f]">You might want to try</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {activities
                  .map((activity) => {
                    const mKey = ACTIVITY_SUITE_ID_TO_MODULE[activity.id];
                    const state = mKey == null ? 'live' : getModuleCorporateState(mKey);
                    return { activity, state };
                  })
                  .filter(({ state }) => state !== 'hidden')
                  .map(({ activity, state }) => {
                    const canGo = state === 'live';
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => {
                          if (!canGo) {
                            navigate('/activitysuite');
                            return;
                          }
                          if (activity.id === 'spacex') navigate('/spacex');
                          else if (activity.id === 'gifting') navigate('/gifting');
                          else if (activity.id === 'event') navigate('/events');
                          else if (activity.id === 'heygenie') navigate('/heygenie');
                        }}
                        className={`group rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md transition-all ${
                          canGo ? 'hover:border-[#93c5fd] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)]' : 'opacity-90'
                        }`}
                      >
                        <div className="flex w-full flex-col items-center text-center">
                          <div
                            className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/70"
                            style={{
                              background: activity.bgColor,
                            }}
                          >
                            {activity.icon === 'dspace' ? (
                              <Building2 className="size-8 text-[#11b586]" strokeWidth={2} aria-hidden />
                            ) : null}
                            {activity.icon === 'event' ? (
                              <CalendarDays className="size-8 text-[#ff5e00]" strokeWidth={2} aria-hidden />
                            ) : null}
                            {activity.icon === 'gifting' ? (
                              <Gift className="size-8 text-[#9b51e0]" strokeWidth={2} aria-hidden />
                            ) : null}
                            {!activity.icon && activity.image ? (
                              <img src={activity.image} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <p
                            className={`min-h-[40px] w-full px-1 text-sm font-medium leading-5 ${
                              canGo ? 'text-slate-600 group-hover:text-[#0e1e3f]' : 'text-slate-500'
                            }`}
                          >
                            {activity.title}
                          </p>
                          {!canGo ? (
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              Coming soon
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
            ) : null}

            {/* Statistics Cards */}
            {dashPrefs.overviewStats ? (
            <div className="mb-8">
              <h2 className="mb-1 text-xl font-semibold tracking-tight text-[#0e1e3f]">Overview</h2>
              <p className="mb-4 text-sm text-slate-600">Key activity across bookings, requests, and seats.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md"
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{stat.title}</p>
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-2xl font-semibold tabular-nums tracking-tight" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 text-[#0d9668]">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d={svgPaths.pb846800} fill="currentColor" />
                        </svg>
                        <span className="text-xs font-semibold">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            ) : null}

            {/* Budget Visibility */}
            {dashPrefs.budgetVisibility ? (
            <div className="mb-8">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-[#0e1e3f]">Budget visibility</h2>
                  <p className="mt-1 text-sm text-slate-600">Personal and department usage at a glance.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/corporate/budget')}
                  className="rounded-lg border border-slate-200/70 bg-white/90 px-4 py-2 text-sm font-medium text-[#0e1e3f] shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white"
                >
                  Manage budgets
                </button>
              </div>

              {isBudgetLoading && (
                <div className="rounded-2xl border border-white/60 bg-white/65 p-6 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                  <p className="text-sm text-slate-600">Loading budget visibility…</p>
                </div>
              )}

              {!isBudgetLoading && budgetLoadError && (
                <div className="rounded-xl border border-red-200/90 bg-white/82 p-6 shadow-sm ring-1 ring-red-100/50 backdrop-blur-md">
                  <p className="text-sm text-red-700 mb-3">{budgetLoadError}</p>
                  <button
                    type="button"
                    onClick={() => setRetryTick((n) => n + 1)}
                    className="px-4 py-2 border border-red-200 rounded-md text-sm text-red-700 hover:bg-red-50"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isBudgetLoading && !budgetLoadError && !hasBudgetSetup && (
                <div className="rounded-2xl border border-white/60 bg-white/65 p-6 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                  <h3 className="mb-2 text-base font-semibold tracking-tight text-[#0e1e3f]">Budget not yet set</h3>
                  <p className="mb-4 text-sm text-slate-600">Set annual and category budgets to enable personal limit visibility.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/corporate/budget')}
                    className="px-5 py-2.5 bg-[#4379ee] text-white rounded-lg font-medium text-sm hover:bg-[#355ab8] transition-colors"
                  >
                    Start budget setup
                  </button>
                </div>
              )}

              {!isBudgetLoading && !budgetLoadError && hasBudgetSetup && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Your remaining budget</p>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-semibold tabular-nums tracking-tight text-[#0e1e3f]">
                          ₹ {personalBudget.remaining.toLocaleString('en-IN')}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          of ₹ {personalBudget.allocated.toLocaleString('en-IN')} remaining
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500">Used</p>
                        <p className="text-sm font-semibold text-[#c2410c]">
                          {personalBudget.allocated ? Math.round((personalBudget.spent / personalBudget.allocated) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-full rounded-full bg-[#FA8D40]"
                        style={{
                          width: personalBudget.allocated
                            ? `${Math.min(100, (personalBudget.spent / personalBudget.allocated) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Department consumption</p>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-semibold tabular-nums tracking-tight text-[#0e1e3f]">
                          ₹ {departmentBudget.remaining.toLocaleString('en-IN')}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Remaining vs total</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500">Consumed</p>
                        <p className="text-sm font-semibold text-[#0d9668]">
                          {departmentBudget.allocated
                            ? Math.round((departmentBudget.spent / departmentBudget.allocated) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-full rounded-full bg-[#15D39D]"
                        style={{
                          width: departmentBudget.allocated
                            ? `${Math.min(100, (departmentBudget.spent / departmentBudget.allocated) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Category spend</p>
                    <div className="space-y-3">
                      {categoryBudgets.map((c) => (
                        <div key={c.name}>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-sm font-medium text-[#0e1e3f]">{c.name}</p>
                            <p className="text-xs font-semibold tabular-nums text-slate-600">
                              ₹ {c.spent.toLocaleString('en-IN')} / {c.allocated.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                            <div
                              className={`h-full rounded-full ${c.colorClass}`}
                              style={{
                                width: c.allocated ? `${Math.min(100, (c.spent / c.allocated) * 100)}%` : '0%',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            ) : null}

            {/* Orders & deliveries hub */}
            {dashPrefs.snappyOrderHub ? (
              <div className="mb-8 rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#0e1e3f]">Orders &amp; deliveries</h2>
                    <p className="mt-1 text-sm text-slate-600">Gifting and swag shipments at a glance.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/bookings')}
                      className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-[#0e1e3f] shadow-sm hover:bg-slate-50"
                    >
                      Track orders
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/gifting-shop')}
                      className="rounded-lg bg-[#4379ee] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#355ab8]"
                    >
                      Reorder favorites
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/communication')}
                      className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-[#0e1e3f] shadow-sm hover:bg-slate-50"
                    >
                      Support
                    </button>
                  </div>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: 'Delivered', value: shipmentCounts.delivered.toString(), icon: Package, tone: 'text-emerald-700 bg-emerald-50' },
                    { label: 'In transit', value: shipmentCounts.inTransit.toString(), icon: Truck, tone: 'text-[#4379ee] bg-[#ebf1ff]' },
                    { label: 'Processing', value: shipmentCounts.processing.toString(), icon: RefreshCw, tone: 'text-amber-800 bg-amber-50' },
                  ].map(({ label, value, icon: Icon, tone }) => (
                    <div
                      key={label}
                      className={`flex flex-col items-center justify-center rounded-xl border border-slate-200/40 px-3 py-4 text-center ${tone}`}
                    >
                      <Icon className="mb-2 size-5 opacity-90" strokeWidth={1.75} aria-hidden />
                      <p className="text-2xl font-bold tabular-nums">{value}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-90">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200/50 pt-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Recent shipments</p>
                  {orderHubShipments.length > 0 ? (
                    <ul className="space-y-3">
                      {orderHubShipments.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0e1e3f]">{row.name}</p>
                            <p className="text-xs text-slate-500">
                              {row.carrier} · ETA {row.eta}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                            {row.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No active shipments.</p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Recent Activity Grid */}
            {(dashPrefs.recentBookings || dashPrefs.userRequests || dashPrefs.upcomingEvents) ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Booking */}
              {dashPrefs.recentBookings ? (
              <div className="rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-200/50 px-5 py-4">
                  <h3 className="text-base font-semibold tracking-tight text-[#0e1e3f]">Recent bookings</h3>
                  <button 
                    onClick={() => navigate('/bookings')}
                    className="text-sm text-[#4379ee] font-medium hover:text-[#355ab8]"
                  >
                    See all
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {recentBookings.length > 0 ? recentBookings.map((booking) => (
                    <div key={booking.id} className="border-b border-slate-200/40 pb-4 last:border-0 last:pb-0">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex flex-1 items-start gap-3">
                          <span className="rounded-md px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: booking.badgeColor }}>
                            {booking.badge}
                          </span>
                          <div className="flex-1">
                            <p className="mb-1 text-sm font-semibold text-[#0e1e3f]">{booking.title}</p>
                            <p className="text-xs text-slate-500">{booking.date}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          className="shrink-0 text-xs font-medium text-[#4379ee] hover:text-[#355ab8] hover:underline"
                        >
                          View
                        </button>
                      </div>
                      <p className="text-xs text-slate-600">
                        Lead by <span className="font-medium text-[#0e1e3f]">{booking.leadBy}</span>
                      </p>
                    </div>
                  )) : (
                    <div className="py-8 text-center">
                      <p className="mb-3 text-sm text-slate-600">No bookings found</p>
                      <button onClick={() => navigate('/spacex')} className="text-xs font-semibold text-[#4379ee] hover:underline">Make your first booking</button>
                    </div>
                  )}
                </div>
              </div>
              ) : null}

              {/* User Request */}
              {dashPrefs.userRequests ? (
              <div className="rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-200/50 px-5 py-4">
                  <h3 className="text-base font-semibold tracking-tight text-[#0e1e3f]">User requests</h3>
                  <span className="rounded-md bg-[#4379ee] px-2 py-1 text-xs font-semibold text-white">{userRequests.length}</span>
                </div>
                <div className="p-5 space-y-4">
                  {userRequests.length > 0 ? userRequests.map((request, index) => (
                    <div key={request.id} className={`flex items-start justify-between gap-3 pb-4 ${index !== userRequests.length - 1 ? 'border-b border-slate-200/40' : ''}`}>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-sm font-semibold text-[#0e1e3f]">{request.name}</p>
                        <p className="text-xs text-slate-600">{request.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/bookings')}
                        className="text-xs text-[#4379ee] font-medium hover:text-[#355ab8] hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  )) : (
                    <div className="py-8 text-center">
                      <p className="mb-3 text-sm text-slate-600">No pending requests</p>
                      <button onClick={() => navigate('/signup/corporate/access')} className="text-xs font-semibold text-[#4379ee] hover:underline">Add team members</button>
                    </div>
                  )}
                </div>
              </div>
              ) : null}

              {/* Upcoming Events */}
              {dashPrefs.upcomingEvents ? (
              <div className="rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-200/50 px-5 py-4">
                  <h3 className="text-base font-semibold tracking-tight text-[#0e1e3f]">Upcoming events</h3>
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="text-sm text-[#4379ee] font-medium hover:text-[#355ab8]"
                  >
                    See all
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
                    <div key={event.id} className={`pb-4 ${index !== upcomingEvents.length - 1 ? 'border-b border-slate-200/40' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#4379ee] text-white">
                            <span className="text-sm font-bold leading-none">{event.date.split(' ')[0]}</span>
                            <span className="text-[10px] font-semibold uppercase opacity-95">{event.date.split(' ')[1]}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-sm font-semibold text-[#0e1e3f]">{event.title}</p>
                            <p className="text-xs text-slate-600">
                              Lead by <span className="font-medium text-[#0e1e3f]">{event.leadBy}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/event-activity')}
                          className="text-xs text-[#4379ee] font-medium hover:text-[#355ab8] hover:underline shrink-0"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center">
                      <p className="mb-3 text-sm text-slate-600">No upcoming events</p>
                      <button onClick={() => navigate('/events')} className="text-xs font-semibold text-[#4379ee] hover:underline">Browse events</button>
                    </div>
                  )}
                </div>
              </div>
              ) : null}
            </div>
            ) : null}
          </div>
            </MogzuCorporateScrollSurface>
          )}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

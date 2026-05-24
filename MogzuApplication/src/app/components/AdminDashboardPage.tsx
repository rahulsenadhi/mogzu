import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { TrendingUp, Bell, Building2, Package, AlertCircle, Loader2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CORP } from '@/app/lib/adminTheme';
import { getAdminSession } from '@/app/lib/adminSession';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { listInvoiceRuns } from '@/lib/contracts';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';

function adminDisplayName(): string {
  const s = getAdminSession();
  if (!s?.email) return 'James Brown';
  const local = s.email.split('@')[0] ?? 'Admin';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const CHARGED_STATUSES = ['pending_approval', 'pending_vendor', 'confirmed', 'completed'] as const;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// DEMO FALLBACKS — shown when Supabase returns 0 rows for the respective slice
const DEMO_REVENUE_BY_MONTH = [
  { month: 'Jan', value: 2.2 },
  { month: 'Feb', value: 3.1 },
  { month: 'Mar', value: 2.8 },
  { month: 'Apr', value: 4.2 },
  { month: 'May', value: 3.9 },
  { month: 'Jun', value: 5.1 },
  { month: 'Jul', value: 4.8 },
  { month: 'Aug', value: 6.2 },
  { month: 'Sep', value: 5.5 },
  { month: 'Oct', value: 7.1 },
  { month: 'Nov', value: 6.8 },
  { month: 'Dec', value: 8.2 },
];

const DEMO_TO_RECEIVE = [
  { name: 'Acme Corp', invoice: 'INV-1240', amount: '₹12,400' },
  { name: 'Globex India', invoice: 'INV-4130', amount: '₹8,200' },
  { name: 'Stark Labs', invoice: 'INV-8821', amount: '₹24,990' },
];

const DEMO_TO_PAY = [
  { name: 'Fresh Catering Co.', bill: 'BL-0092', amount: '₹4,100' },
  { name: 'Urban Events', bill: 'BL-4410', amount: '₹11,500' },
  { name: 'PrintWorks', bill: 'BL-2201', amount: '₹2,850' },
];

const DEMO_LOGIN_LOG = [
  { user: 'Kapil Dev', time: '3:45 PM', ip: '106.221.181.179' },
  { user: 'Sarah Chen', time: '2:12 PM', ip: '103.45.12.88' },
  { user: 'James Brown', time: '11:03 AM', ip: '49.36.101.14' },
];

const DEMO_PENDING_ISSUES = [
  {
    id: 'demo-i-1',
    name: 'Kapil Dev',
    role: 'Client' as const,
    category: 'Gifting',
    snippet: 'Bulk order delivery window not confirmed for Mumbai office…',
    date: '12 Mar 2025',
  },
  {
    id: 'demo-i-2',
    name: 'Priya Sharma',
    role: 'Vendor' as const,
    category: 'Event',
    snippet: 'Commission statement mismatch for February invoice batch…',
    date: '11 Mar 2025',
  },
];

const DEMO_RESOLVED_ISSUES = [
  {
    id: 'demo-i-3',
    name: 'Rahul Verma',
    role: 'Client' as const,
    category: 'Space',
    snippet: 'Refund processed for cancelled booking REF-9921.',
    date: '08 Mar 2025',
  },
];

type ReceivableRow = { id: string; name: string; invoice: string; amount: string };
type PayableRow = { id: string; name: string; bill: string; amount: string };
type LoginRow = { user: string; time: string; ip: string };
type IssueRow = {
  id: string;
  name: string;
  role: 'Client' | 'Vendor';
  category: string;
  snippet: string;
  date: string;
};

type AdminStats = {
  totalUsers: number;
  totalCorporates: number;
  totalVendors: number;
  revenueLakhs: number;
  pendingIssues: number;
  activePromotions: number;
  revenueByMonth: { month: string; value: number }[];
  commissionTotalSales: number;
  commissionPending: number;
  commissionCompleted: number;
  toReceive: ReceivableRow[];
  toPay: PayableRow[];
  loginLog: LoginRow[];
  pendingIssueList: IssueRow[];
  resolvedIssueList: IssueRow[];
};

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  totalCorporates: 0,
  totalVendors: 0,
  revenueLakhs: 0,
  pendingIssues: 0,
  activePromotions: 0,
  revenueByMonth: [],
  commissionTotalSales: 0,
  commissionPending: 0,
  commissionCompleted: 0,
  toReceive: [],
  toPay: [],
  loginLog: [],
  pendingIssueList: [],
  resolvedIssueList: [],
};

function fmtInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
  oneYearAgo.setDate(1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const [
    usersCount,
    corpsCount,
    vendorsCount,
    bookingsLastYear,
    openTicketsCount,
    activePromos,
    payoutsRes,
    invoiceRunsRes,
    loginEventsRes,
    openTicketsRes,
    resolvedTicketsRes,
  ] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('corporate_accounts').select('id', { count: 'exact', head: true }),
    supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('bookings')
      .select('total_amount, created_at, status')
      .in('status', [...CHARGED_STATUSES])
      .gte('created_at', oneYearAgo.toISOString()),
    supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress', 'waiting_user']),
    db.promotions.listActive(),
    supabase.from('payouts').select('gross_amount, commission_amount, status'),
    listInvoiceRuns(),
    supabase
      .from('audit_events_unified')
      .select('actor_id, at, ip_address, action')
      .in('action', ['auth.signin', 'auth.login', 'login'])
      .order('at', { ascending: false })
      .limit(3),
    supabase
      .from('support_tickets')
      .select('id, subject, message, audience, category, created_at, user_profiles!support_tickets_submitter_id_fkey(full_name), vendors(business_name)')
      .in('status', ['open', 'in_progress', 'waiting_user'])
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('support_tickets')
      .select('id, subject, message, audience, category, updated_at, user_profiles!support_tickets_submitter_id_fkey(full_name), vendors(business_name)')
      .eq('status', 'resolved')
      .order('updated_at', { ascending: false })
      .limit(3),
  ]);

  // Revenue by month — bucket bookings into 12 month slots ending current month
  const buckets = new Map<string, number>();
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(oneYearAgo);
    d.setMonth(d.getMonth() + i);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  const bookings = (bookingsLastYear.data ?? []) as { total_amount: number | null; created_at: string }[];
  let revenueTotal = 0;
  for (const b of bookings) {
    const d = new Date(b.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (buckets.has(key)) {
      const amt = b.total_amount ?? 0;
      buckets.set(key, (buckets.get(key) ?? 0) + amt);
      revenueTotal += amt;
    }
  }
  const revenueByMonth: { month: string; value: number }[] = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(oneYearAgo);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    revenueByMonth.push({
      month: MONTH_LABELS[d.getMonth()],
      value: +((buckets.get(key) ?? 0) / 100_000).toFixed(2),
    });
  }

  // Commission aggregates from payouts
  const payouts = (payoutsRes.data ?? []) as { gross_amount: number; commission_amount: number; status: string }[];
  let commissionTotalSales = 0;
  let commissionPending = 0;
  let commissionCompleted = 0;
  for (const p of payouts) {
    commissionTotalSales += p.gross_amount ?? 0;
    if (p.status === 'processed') commissionCompleted += p.commission_amount ?? 0;
    else if (p.status === 'scheduled' || p.status === 'held') commissionPending += p.commission_amount ?? 0;
  }

  // To Receive — outstanding invoice_runs joined with contracts -> corporate_accounts
  const invoiceRuns = (invoiceRunsRes.data ?? []).filter((r) =>
    ['finalised', 'sent', 'overdue'].includes(r.status),
  );
  let toReceive: ReceivableRow[] = [];
  if (invoiceRuns.length > 0) {
    const top = invoiceRuns.sort((a, b) => b.total - a.total).slice(0, 3);
    const contractIds = Array.from(new Set(top.map((r) => r.contract_id)));
    const { data: contractsData } = await supabase
      .from('contracts')
      .select('id, corporate_id, corporate_accounts(name)')
      .in('id', contractIds);
    const contractMap = new Map<string, { corporateName: string | null }>();
    for (const c of (contractsData ?? []) as Array<{
      id: string;
      corporate_accounts: { name: string | null } | { name: string | null }[] | null;
    }>) {
      const ca = Array.isArray(c.corporate_accounts) ? c.corporate_accounts[0] : c.corporate_accounts;
      contractMap.set(c.id, { corporateName: ca?.name ?? null });
    }
    toReceive = top.map((r) => ({
      id: r.id,
      name: contractMap.get(r.contract_id)?.corporateName ?? '—',
      invoice: r.id.slice(0, 8).toUpperCase(),
      amount: fmtInr(r.total),
    }));
  }

  // To Pay — payouts.listDue style, top 3 scheduled
  const duePayouts = payouts.filter((p) => p.status === 'scheduled');
  let toPay: PayableRow[] = [];
  if (duePayouts.length > 0) {
    const { data: dueRows } = await supabase
      .from('payouts')
      .select('id, net_amount, vendors(business_name)')
      .eq('status', 'scheduled')
      .order('scheduled_for')
      .limit(3);
    toPay = ((dueRows ?? []) as Array<{
      id: string;
      net_amount: number;
      vendors: { business_name: string | null } | { business_name: string | null }[] | null;
    }>).map((row) => {
      const v = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
      return {
        id: row.id,
        name: v?.business_name ?? '—',
        bill: row.id.slice(0, 8).toUpperCase(),
        amount: fmtInr(row.net_amount),
      };
    });
  }

  // Login log — derive name from user_profiles via separate lookup
  const loginEvents = ((loginEventsRes.data ?? []) as Array<{
    actor_id: string | null;
    at: string;
    ip_address: string | null;
  }>);
  let loginLog: LoginRow[] = [];
  if (loginEvents.length > 0) {
    const actorIds = Array.from(new Set(loginEvents.map((e) => e.actor_id).filter((x): x is string => !!x)));
    let nameMap = new Map<string, string>();
    if (actorIds.length > 0) {
      const { data: profs } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', actorIds);
      for (const p of (profs ?? []) as Array<{ id: string; full_name: string | null }>) {
        nameMap.set(p.id, p.full_name ?? '—');
      }
    }
    loginLog = loginEvents.map((e) => ({
      user: e.actor_id ? nameMap.get(e.actor_id) ?? '—' : '—',
      time: fmtTime(e.at),
      ip: e.ip_address ?? '—',
    }));
  }

  // Pending + resolved issues
  type TicketRow = {
    id: string;
    subject: string | null;
    message: string | null;
    audience: 'corporate' | 'vendor';
    category: string | null;
    created_at?: string;
    updated_at?: string;
    user_profiles: { full_name: string | null } | { full_name: string | null }[] | null;
    vendors: { business_name: string | null } | { business_name: string | null }[] | null;
  };
  const mapTicket = (t: TicketRow, dateField: 'created_at' | 'updated_at'): IssueRow => {
    const up = Array.isArray(t.user_profiles) ? t.user_profiles[0] : t.user_profiles;
    const ven = Array.isArray(t.vendors) ? t.vendors[0] : t.vendors;
    const name = t.audience === 'vendor' ? ven?.business_name ?? '—' : up?.full_name ?? '—';
    return {
      id: t.id,
      name,
      role: t.audience === 'vendor' ? 'Vendor' : 'Client',
      category: t.category ?? '—',
      snippet: (t.subject ?? t.message ?? '—').slice(0, 100),
      date: fmtShortDate((dateField === 'updated_at' ? t.updated_at : t.created_at) ?? new Date().toISOString()),
    };
  };
  const pendingIssueList = ((openTicketsRes.data ?? []) as TicketRow[]).map((t) => mapTicket(t, 'created_at'));
  const resolvedIssueList = ((resolvedTicketsRes.data ?? []) as TicketRow[]).map((t) => mapTicket(t, 'updated_at'));

  const promotionsArr = activePromos.data ?? [];

  return {
    totalUsers: usersCount.count ?? 0,
    totalCorporates: corpsCount.count ?? 0,
    totalVendors: vendorsCount.count ?? 0,
    revenueLakhs: +(revenueTotal / 100_000).toFixed(1),
    pendingIssues: openTicketsCount.count ?? 0,
    activePromotions: promotionsArr.length,
    revenueByMonth,
    commissionTotalSales,
    commissionPending,
    commissionCompleted,
    toReceive,
    toPay,
    loginLog,
    pendingIssueList,
    resolvedIssueList,
  };
}

function MiniSparkline({ color, points }: { color: string; points?: number[] }) {
  const pts = points && points.length >= 2 ? points : [12, 18, 14, 22, 19, 28, 24, 32];
  const w = 72;
  const h = 28;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p - min) / (max - min || 1)) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [issueTab, setIssueTab] = useState<'pending' | 'resolved'>('pending');
  const [revenuePeriod, setRevenuePeriod] = useState('This year');

  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAdminStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load admin stats');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (location.hash === '#admin-issues') {
      const t = window.setTimeout(() => {
        document.getElementById('admin-issues')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => window.clearTimeout(t);
    }
  }, [location.hash, location.pathname]);

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayName = adminDisplayName();

  // Use real data when available, else demo fallback
  const revenueChartData = useMemo(() => {
    const hasReal = stats.revenueByMonth.some((m) => m.value > 0);
    return hasReal ? stats.revenueByMonth : DEMO_REVENUE_BY_MONTH;
  }, [stats.revenueByMonth]);

  const commissionData = useMemo(() => {
    const hasReal = stats.commissionTotalSales > 0 || stats.commissionPending > 0 || stats.commissionCompleted > 0;
    if (hasReal) {
      return [
        { name: 'Total sales', value: Math.round(stats.commissionTotalSales), fill: CORP.chartYellow },
        { name: 'Pending commissions', value: Math.round(stats.commissionPending), fill: CORP.chartOrange },
        { name: 'Completed commissions', value: Math.round(stats.commissionCompleted), fill: CORP.chartTeal },
      ];
    }
    return [
      { name: 'Total sales', value: 5000, fill: CORP.chartYellow },
      { name: 'Pending commissions', value: 500, fill: CORP.chartOrange },
      { name: 'Completed commissions', value: 100, fill: CORP.chartTeal },
    ];
  }, [stats.commissionTotalSales, stats.commissionPending, stats.commissionCompleted]);

  const toReceiveRows: { name: string; invoice: string; amount: string }[] =
    stats.toReceive.length > 0 ? stats.toReceive : DEMO_TO_RECEIVE;
  const toPayRows: { name: string; bill: string; amount: string }[] =
    stats.toPay.length > 0 ? stats.toPay : DEMO_TO_PAY;
  const loginLog = stats.loginLog.length > 0 ? stats.loginLog : DEMO_LOGIN_LOG;
  const pendingIssues = stats.pendingIssueList.length > 0 ? stats.pendingIssueList : DEMO_PENDING_ISSUES;
  const resolvedIssues = stats.resolvedIssueList.length > 0 ? stats.resolvedIssueList : DEMO_RESOLVED_ISSUES;

  const hasRealRevenue = stats.revenueByMonth.some((m) => m.value > 0);
  const hasRealCommission =
    stats.commissionTotalSales > 0 || stats.commissionPending > 0 || stats.commissionCompleted > 0;

  const usingAnyDemo =
    !hasRealRevenue ||
    !hasRealCommission ||
    stats.toReceive.length === 0 ||
    stats.toPay.length === 0 ||
    stats.loginLog.length === 0 ||
    stats.pendingIssueList.length === 0;

  const quickActions = [
    { to: '/admin/issues', label: 'Issues', Icon: AlertCircle, iconColor: '#1D4ED8', tint: '#EEF4FF' },
    { to: '/admin/clients', label: 'Clients', Icon: Building2, iconColor: '#334155', tint: '#F8FAFC' },
    { to: '/admin/products', label: 'Products', Icon: Package, iconColor: '#2563EB', tint: '#EFF6FF' },
    { to: '/admin/notifications', label: 'Notify', Icon: Bell, iconColor: '#DB2777', tint: CORP.brandRoseSoft },
  ] as const;

  const kpiCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString('en-IN'),
      accent: CORP.primary,
      accentBar: 'rose' as const,
    },
    { title: 'Total Clients', value: stats.totalCorporates.toLocaleString('en-IN'), accent: CORP.orange },
    {
      title: 'Total Vendors',
      value: stats.totalVendors.toLocaleString('en-IN'),
      accent: CORP.teal,
      accentBar: 'mint' as const,
    },
    {
      title: 'Revenue (12mo)',
      value: stats.revenueLakhs > 0 ? `₹${stats.revenueLakhs}L` : '—',
      accent: CORP.green,
      spark: true,
    },
    { title: 'Pending Issues', value: stats.pendingIssues.toLocaleString('en-IN'), accent: CORP.red },
    { title: 'Active Promotions', value: stats.activePromotions.toLocaleString('en-IN'), accent: CORP.amber },
  ];

  const sparkPoints = useMemo(
    () => revenueChartData.map((m) => m.value),
    [revenueChartData],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf1ff] via-[#f8fbff] to-[#fff2f8] px-6 py-8">

      {/* Hero header */}
      <div className="mb-6 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#1E4DB7]">
            <TrendingUp className="size-3.5" />
            Admin console
          </span>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {greetingPrefix()}, {displayName}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {todayLabel}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {quickActions.map(({ to, label, Icon, iconColor, tint }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-4 text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60"
            >
              <span
                className="flex size-11 items-center justify-center rounded-xl ring-1 ring-slate-100"
                style={{ color: iconColor, backgroundColor: tint }}
              >
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-xs text-slate-500 backdrop-blur-sm">
          <Loader2 className="size-3.5 animate-spin" />
          Loading admin stats…
        </div>
      )}
      {loadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs text-red-700 backdrop-blur-sm">
          {loadError}
        </div>
      )}
      {!loading && !loadError && usingAnyDemo && (
        <div className="mb-4">
          <DevMockDataBanner />
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 lg:gap-4 mb-6">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="group relative rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-md p-4 flex flex-col min-h-[112px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(37,99,235,0.18)] overflow-hidden"
          >
            {'accentBar' in card && card.accentBar === 'rose' && (
              <span className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-[#93C5FD]/60" aria-hidden />
            )}
            {'accentBar' in card && card.accentBar === 'mint' && (
              <span className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-[#C4B5FD]/60" aria-hidden />
            )}
            <p className="text-xs font-medium text-slate-500 mb-1">{card.title}</p>
            <div className="flex items-end justify-between gap-2 mt-auto">
              <p className="text-2xl font-bold tabular-nums" style={{ color: card.accent }}>
                {card.value}
              </p>
              {'spark' in card && card.spark && <MiniSparkline color={CORP.green} points={sparkPoints} />}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-500" />
              {loading ? '—' : 'Live'}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Performance</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold text-slate-900">Revenue</h2>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option>This year</option>
              <option>Last year</option>
              <option>Last 6 months</option>
            </select>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CORP.primary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CORP.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: CORP.slateText }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: CORP.slateText }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}L`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${CORP.border}`,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`₹${value}L`, 'Revenue']}
                />
                <ReferenceLine y={4.5} stroke="#94A3B8" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CORP.primary}
                  strokeWidth={2}
                  fill="url(#adminRevFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-slate-900">Commission Overview</h2>
            <button
              type="button"
              onClick={() => navigate('/admin/transactions')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View details
            </button>
          </div>
          <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={commissionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {commissionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="w-full space-y-2 mt-2 text-sm">
              {commissionData.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: row.fill }} />
                    {row.name}
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">{row.value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 mt-2">
        Receivables, login &amp; issues
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-md p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">To Receive</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/transactions')}
              className="text-xs font-medium text-[#2563EB] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 pr-2 font-medium">Customer</th>
                  <th className="pb-2 pr-2 font-medium">Invoice No.</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {toReceiveRows.map((row) => (
                  <tr key={row.invoice} className="border-b border-slate-50">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="size-7 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600">
                          {row.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium truncate max-w-[100px]">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-[11px]">{row.invoice}</td>
                    <td className="py-2.5 text-right font-semibold">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-md p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">To Pay</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/transactions')}
              className="text-xs font-medium text-[#2563EB] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 pr-2 font-medium">Supplier</th>
                  <th className="pb-2 pr-2 font-medium">Bill No.</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {toPayRows.map((row) => (
                  <tr key={row.bill} className="border-b border-slate-50">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="size-7 rounded-full bg-teal-100 text-[10px] font-bold flex items-center justify-center text-teal-800">
                          {row.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium truncate max-w-[100px]">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-[11px]">{row.bill}</td>
                    <td className="py-2.5 text-right font-semibold">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-md p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Login Log</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="text-xs font-medium text-[#2563EB] hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="space-y-3 text-xs flex-1">
            {loginLog.map((log) => (
              <li key={log.user + log.time} className="pb-3 border-b border-slate-50 last:border-0">
                <p className="text-slate-800 font-medium">
                  {log.user}{' '}
                  <span className="font-normal text-slate-500">logged in at {log.time}</span>
                </p>
                <p className="text-slate-400 font-mono mt-0.5">{log.ip}</p>
              </li>
            ))}
          </ul>
        </div>

        <div
          id="admin-issues"
          className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-md p-4 flex flex-col min-h-[280px] scroll-mt-4"
        >
          <div className="flex justify-end mb-2">
            <Link
              to="/admin/issues"
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View all issues
            </Link>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-0.5 mb-3">
            <button
              type="button"
              onClick={() => setIssueTab('pending')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                issueTab === 'pending' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              Pending Issues
            </button>
            <button
              type="button"
              onClick={() => setIssueTab('resolved')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                issueTab === 'resolved' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              Recently Resolved
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 max-h-[220px] pr-1">
            {(issueTab === 'pending' ? pendingIssues : resolvedIssues).map((issue) => (
              <div
                key={issue.id}
                className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="size-8 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {issue.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">{issue.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                        {issue.role}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#2563EB] font-medium">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{issue.snippet}</p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-[10px] text-slate-400">Enquiry {issue.date}</span>
                      <Link
                        to="/admin/issues"
                        className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
                      >
                        Reply
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {usingAnyDemo && !loading && (
        <p className="text-center text-[11px] italic text-slate-400 mt-6 pb-4">
          Some panels showing demo data — connect to Supabase to see live figures.
        </p>
      )}
    </div>
  );
}

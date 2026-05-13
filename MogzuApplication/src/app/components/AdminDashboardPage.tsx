import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { TrendingUp, Bell, Building2, Package, AlertCircle } from 'lucide-react';
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

const revenueByMonth = [
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

const commissionData = [
  { name: 'Total sales', value: 5000, fill: CORP.chartYellow },
  { name: 'Pending commissions', value: 500, fill: CORP.chartOrange },
  { name: 'Completed commissions', value: 100, fill: CORP.chartTeal },
];

const toReceiveRows = [
  { name: 'Acme Corp', invoice: 'INV1', amount: '₹12,400' },
  { name: 'Globex India', invoice: 'ENZOO4130', amount: '₹8,200' },
  { name: 'Stark Labs', invoice: 'INV-8821', amount: '₹24,990' },
];

const toPayRows = [
  { name: 'Fresh Catering Co.', bill: 'BL-0092', amount: '₹4,100' },
  { name: 'Urban Events', bill: 'BL-4410', amount: '₹11,500' },
  { name: 'PrintWorks', bill: 'BL-2201', amount: '₹2,850' },
];

const loginLog = [
  { user: 'Kapil Dev', time: '3:45 PM', ip: '106.221.181.179' },
  { user: 'Sarah Chen', time: '2:12 PM', ip: '103.45.12.88' },
  { user: 'James Brown', time: '11:03 AM', ip: '49.36.101.14' },
];

const pendingIssues = [
  {
    id: 1,
    name: 'Kapil Dev',
    role: 'Client' as const,
    category: 'Gifting',
    snippet: 'Bulk order delivery window not confirmed for Mumbai office…',
    date: '12 Mar 2025',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Vendor' as const,
    category: 'Event',
    snippet: 'Commission statement mismatch for February invoice batch…',
    date: '11 Mar 2025',
  },
];

const resolvedIssues = [
  {
    id: 3,
    name: 'Rahul Verma',
    role: 'Client' as const,
    category: 'Space',
    snippet: 'Refund processed for cancelled booking REF-9921.',
    date: '08 Mar 2025',
  },
];

function MiniSparkline({ color }: { color: string }) {
  const pts = [12, 18, 14, 22, 19, 28, 24, 32];
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

  const quickActions = [
    { to: '/admin/issues', label: 'Issues', Icon: AlertCircle, iconColor: '#1D4ED8', tint: '#EEF4FF' },
    { to: '/admin/clients', label: 'Clients', Icon: Building2, iconColor: '#334155', tint: '#F8FAFC' },
    { to: '/admin/products', label: 'Products', Icon: Package, iconColor: '#2563EB', tint: '#EFF6FF' },
    { to: '/admin/notifications', label: 'Notify', Icon: Bell, iconColor: '#DB2777', tint: CORP.brandRoseSoft },
  ] as const;

  return (
    <>
      <div
        className="mb-4 lg:mb-6 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white via-[#F8FAFF] to-white pl-4 pr-4 py-5 shadow-sm shadow-slate-200/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
        style={{ borderLeftWidth: 4, borderLeftColor: CORP.brandRose }}
      >
        <div>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ color: CORP.titleNavy }}
          >
            {greetingPrefix()}, {displayName}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Admin console · <span className="text-slate-600">{todayLabel}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {quickActions.map(({ to, label, Icon, iconColor, tint }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3 py-4 text-center shadow-sm shadow-slate-200/30 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/90"
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

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 lg:gap-4 mb-2">
        {[
          {
            title: 'Total Users',
            value: '175',
            delta: '+3.25 than last month',
            accent: CORP.primary,
            accentBar: 'rose' as const,
          },
          { title: 'Today Clients', value: '64', delta: '+3.25 than last month', accent: CORP.orange },
          {
            title: 'Total Vendors',
            value: '36',
            delta: '+3.25 than last month',
            accent: CORP.teal,
            accentBar: 'mint' as const,
          },
          {
            title: 'Revenue',
            value: '25',
            delta: '+3.25 than last month',
            accent: CORP.green,
            spark: true,
          },
          { title: 'Pending Issues', value: '15', delta: '+3.25 than last month', accent: CORP.red },
          { title: 'Active Promotions', value: '175', delta: '+3.25 than last month', accent: CORP.amber },
        ].map((card) => (
          <div
            key={card.title}
            className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 flex flex-col min-h-[112px] transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
          >
            {'accentBar' in card && card.accentBar === 'rose' && (
              <span
                className="absolute top-0 left-3 right-3 h-0.5 rounded-full opacity-45"
                style={{ background: '#93C5FD' }}
                aria-hidden
              />
            )}
            {'accentBar' in card && card.accentBar === 'mint' && (
              <span
                className="absolute top-0 left-3 right-3 h-0.5 rounded-full opacity-45"
                style={{ background: '#C4B5FD' }}
                aria-hidden
              />
            )}
            <p className="text-xs font-medium text-slate-500 mb-1">{card.title}</p>
            <div className="flex items-end justify-between gap-2 mt-auto">
              <p className="text-2xl font-bold tabular-nums" style={{ color: card.accent }}>
                {card.value}
              </p>
              {card.spark && <MiniSparkline color={CORP.green} />}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-0.5">
              <TrendingUp className="size-3 text-emerald-500" />
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Performance</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 lg:p-5">
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
              <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 lg:p-5 flex flex-col">
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

      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 mt-2">
        Receivables, login &amp; issues
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 flex flex-col min-h-[280px]">
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

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 flex flex-col min-h-[280px]">
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

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 flex flex-col min-h-[280px]">
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
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-4 flex flex-col min-h-[280px] scroll-mt-4"
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

      <p className="text-center text-[11px] text-slate-400 mt-6 pb-2">
        Admin console · Mogzu corporate theme · Mock data for layout preview
      </p>
    </>
  );
}

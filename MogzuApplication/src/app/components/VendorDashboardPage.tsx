import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, ChevronDown, Eye, Search } from 'lucide-react';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import imgProductThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import { VendorPerformanceStatsDrawer, type VendorPerformanceListing } from './vendor/VendorPerformanceStatsDrawer';
import { getVendorNavVisibility } from '@/app/lib/vendorModuleSelection';

const DEMO_PERF_LISTING: VendorPerformanceListing = {
  id: 'es-1',
  title: 'Corporate Conference Facilities',
  categoryLabel: 'conference',
  coverUrl:
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=200',
  status: 'Active',
  hasAddOns: true,
};

type MetricCard = { title: string; value: number; delta: string; tone: string };

const metricCards: MetricCard[] = [
  { title: 'Total Sales', value: 175, delta: '+3.25%', tone: 'from-[#EEF2FF] to-[#F8FAFF]' },
  { title: 'Today Orders', value: 64, delta: '+1.2%', tone: 'from-[#FFF7ED] to-[#FFFBF5]' },
  { title: 'Order Requests', value: 36, delta: '+3.25%', tone: 'from-[#ECFEFF] to-[#F3FAFF]' },
  { title: 'Completed Orders', value: 25, delta: '+2.1%', tone: 'from-[#ECFDF5] to-[#F7FFF9]' },
  { title: 'Pending Orders', value: 15, delta: '+3.25%', tone: 'from-[#FDF2F8] to-[#FFF8FB]' },
];

const revenueData = [
  { month: 'Jan', value: 22 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 34 },
  { month: 'Apr', value: 29 },
  { month: 'May', value: 39 },
  { month: 'Jun', value: 36 },
  { month: 'Jul', value: 47 },
];

const visitorsData = [
  { name: 'Promotion', value: 5000, color: '#FFD100' },
  { name: 'Requested', value: 500, color: '#FF8A3D' },
  { name: 'Shared', value: 100, color: '#22D3EE' },
];

const leads = [
  { id: 'L1', name: 'Kapil Dev', company: 'Mumbai moving co.', text: 'Need custom gifting for 75 employees. Looking for New Year kits.', date: 'Jul 16, 2024 18:10:32', avatarTone: 'bg-rose-100 text-rose-700' },
  { id: 'L2', name: 'Aisha Khan', company: 'Mindwave Labs', text: 'Need premium welcome kits for onboarding batch of 40.', date: 'Jul 13, 2024 09:24:12', avatarTone: 'bg-violet-100 text-violet-700' },
  { id: 'L3', name: 'Rahul Jain', company: 'Finbridge Tech', text: 'Looking for festive hampers with branded packaging.', date: 'Jul 10, 2024 12:18:07', avatarTone: 'bg-cyan-100 text-cyan-700' },
];

const orders = [
  { id: '001021', name: 'Kapil Dev', date: 'Jun 21, 2024', qty: 15, price: '₹ 1,500', status: 'Processing', avatarTone: 'bg-rose-100 text-rose-600' },
  { id: '001022', name: 'Kapil Dev', date: 'Jun 21, 2024', qty: 10, price: '₹ 1,500', status: 'Pending', avatarTone: 'bg-violet-100 text-violet-600' },
  { id: '001023', name: 'Kapil Dev', date: 'Jun 21, 2024', qty: 20, price: '₹ 4,520', status: 'Pending', avatarTone: 'bg-cyan-100 text-cyan-600' },
  { id: '001024', name: 'Kapil Dev', date: 'Jun 21, 2024', qty: 6, price: '₹ 520', status: 'Pending', avatarTone: 'bg-amber-100 text-amber-600' },
  { id: '001025', name: 'Kapil Dev', date: 'Jun 21, 2024', qty: 12, price: '₹ 4,520', status: 'Pending', avatarTone: 'bg-emerald-100 text-emerald-600' },
];

const topSellingRows = [
  { productId: '001021', name: "Women's Cotton Stretch Half Sleeve", sold: 15, stockRemaining: '₹ 1,500' },
  { productId: '001021', name: "Women's Cotton Stretch Half Sleeve", sold: 10, stockRemaining: '₹ 1,500' },
  { productId: '001021', name: "Women's Cotton Stretch Half Sleeve", sold: 20, stockRemaining: '₹ 4,520' },
  { productId: '001021', name: "Women's Cotton Stretch Half Sleeve", sold: 6, stockRemaining: '₹ 520' },
  { productId: '001021', name: "Women's Cotton Stretch Half Sleeve", sold: 12, stockRemaining: '₹ 4,520' },
];

function Sparkline({ idx }: { idx: number }) {
  const paths = [
    'M4 18 L12 13 L18 14 L24 8 L30 10',
    'M4 18 L10 16 L16 11 L22 13 L30 7',
    'M4 18 L11 17 L17 10 L23 12 L30 8',
    'M4 17 L11 14 L17 15 L23 9 L30 11',
    'M4 18 L11 16 L17 14 L23 10 L30 12',
  ];
  return (
    <svg width="36" height="22" viewBox="0 0 34 22" className="text-slate-400">
      <path d={paths[idx % paths.length]} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const navVisibility = useMemo(() => getVendorNavVisibility(), []);
  const [search, setSearch] = useState('');
  const [ordersView, setOrdersView] = useState<'upcoming' | 'latest-order' | 'latest-products' | 'top-selling'>('upcoming');
  const [uiNotice, setUiNotice] = useState('');
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const effectiveOrdersView = useMemo(() => {
    if (
      !navVisibility.showProducts &&
      (ordersView === 'latest-products' || ordersView === 'top-selling')
    ) {
      return 'upcoming' as const;
    }
    return ordersView;
  }, [navVisibility.showProducts, ordersView]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => order.name.toLowerCase().includes(search.toLowerCase()) || order.id.includes(search)),
    [search]
  );

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
    <VendorAppShell
      activeNav="dashboard"
      routeSource="vendor-dashboard"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, products, leads…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
      headerEnd={
        <>
          <button
            type="button"
            onClick={() => navigate('/vendor/calendar')}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            aria-label="Open calendar"
          >
            <Bell className="h-5 w-5" />
          </button>
          <VendorTopRightMenu />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent">
        <div className="mx-auto w-full max-w-[1280px] space-y-4 px-5 md:px-8 lg:px-12 py-6">
              {uiNotice ? (
                <p
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800"
                  role="status"
                >
                  {uiNotice}
                </p>
              ) : null}

              <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight text-[#0e1e3f] sm:text-xl">Vendor dashboard</h1>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      Snapshot of your store · <span className="text-slate-600">{todayLabel}</span>
                    </p>
                  </div>
                  {(navVisibility.showSpacex ||
                    navVisibility.showEventActivity ||
                    navVisibility.showEventsServices ||
                    navVisibility.showProducts) && (
                    <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
                      {navVisibility.showSpacex && (
                        <button
                          type="button"
                          onClick={() => navigate('/vendor/spacex')}
                          className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm"
                        >
                          Spaces
                        </button>
                      )}
                      {navVisibility.showEventActivity && (
                        <button
                          type="button"
                          onClick={() => navigate('/vendor/event-activity')}
                          className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm"
                        >
                          Activities
                        </button>
                      )}
                      {navVisibility.showEventsServices && (
                        <button
                          type="button"
                          onClick={() => navigate('/vendor/events')}
                          className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm"
                        >
                          Events
                        </button>
                      )}
                      {navVisibility.showProducts && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('/vendor/products')}
                            className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm"
                          >
                            Catalog
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/vendor/products/new')}
                            className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 sm:text-sm"
                          >
                            Add product
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(navVisibility.showEventActivity || navVisibility.showEventsServices) && (
                <div className="flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Listing performance</p>
                    <p className="text-xs text-slate-500">Views, saves, and booking requests for your featured event listing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerformanceOpen(true)}
                    className="self-start text-sm font-semibold text-[#2563eb] hover:underline sm:self-auto"
                  >
                    View details →
                  </button>
                </div>
              )}

              <section className="rounded-xl border border-slate-200/90 bg-[#F5F7FD] p-3 shadow-sm sm:p-4">
                <h2 className="mb-2 text-sm font-semibold text-slate-800">Overview</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5">
                  {metricCards.map((card, idx) => (
                    <article
                      key={card.title}
                      className={`rounded-lg border border-slate-100/90 bg-gradient-to-br ${card.tone} p-2.5 shadow-sm transition-shadow hover:shadow-md sm:p-3`}
                    >
                      <p className="text-[11px] font-medium text-slate-500">{card.title}</p>
                      <div className="mt-0.5 flex items-end justify-between gap-1">
                        <p className="text-xl font-semibold tabular-nums tracking-tight text-[#0e1e3f] sm:text-2xl sm:leading-none">
                          {card.value}
                        </p>
                        <Sparkline idx={idx} />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
                        <span className="font-medium text-emerald-600">{card.delta}</span> vs last month
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 lg:grid-cols-3 lg:gap-4">
                <article
                  className={`flex min-h-0 flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 ${
                    navVisibility.showPromotions ? 'lg:col-span-2' : 'lg:col-span-3'
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">Revenue</h3>
                      <span className="text-xs font-semibold text-emerald-600">+3.25%</span>
                      <span className="hidden text-xs text-slate-400 sm:inline">vs last year</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Revenue period controls will be available in a future release.')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm"
                    >
                      This year <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="h-40 min-h-[10rem] sm:h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                {navVisibility.showPromotions && (
                  <article className="flex min-h-0 flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">Visitors</h3>
                    <div className="h-32 min-h-[8rem] sm:h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={visitorsData}
                            dataKey="value"
                            innerRadius={36}
                            outerRadius={58}
                            paddingAngle={2}
                            cornerRadius={4}
                          >
                            {visitorsData.map((entry, i) => (
                              <Cell key={`vis-${entry.name}-${i}`} fill={entry.color} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mb-2 text-right text-xs font-semibold text-slate-800 sm:text-sm">Total: 6000</p>
                    <div className="space-y-1">
                      {visitorsData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs text-slate-600 sm:text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="shrink-0 font-medium text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                )}
              </section>

              <section className="grid gap-3 lg:grid-cols-12 lg:gap-4 lg:items-start">
                {navVisibility.showProducts && (
                  <article className="flex min-h-0 flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 lg:col-span-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">Leads</h3>
                      <button
                        type="button"
                        onClick={() => navigate('/vendor/communication')}
                        className="text-xs font-medium text-[#2563eb] hover:underline sm:text-sm"
                      >
                        View all
                      </button>
                    </div>
                    <div className="max-h-[min(42vh,320px)] space-y-2 overflow-y-auto overscroll-contain pr-1">
                      {leads.map((lead) => (
                        <div key={lead.id} className="rounded-lg border border-slate-200/90 bg-slate-50/60 p-3">
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${lead.avatarTone}`}
                            >
                              {lead.name
                                .split(' ')
                                .map((x) => x[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug text-slate-800">{lead.name}</p>
                              <p className="text-xs text-slate-500">{lead.company}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{lead.text}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2">
                            <p className="text-[10px] text-slate-400 sm:text-xs">{lead.date}</p>
                            <button
                              type="button"
                              onClick={() => navigate('/vendor/communication')}
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                )}

                <article
                  className={`flex min-h-0 flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 lg:col-span-8 ${
                    !navVisibility.showProducts ? 'lg:col-span-12' : ''
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-slate-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setOrdersView('upcoming')}
                      className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                        ordersView === 'upcoming'
                          ? 'bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-200'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      Upcoming
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersView('latest-order')}
                      className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                        ordersView === 'latest-order'
                          ? 'bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-200'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      Latest order
                    </button>
                    {navVisibility.showProducts && (
                      <button
                        type="button"
                        onClick={() => setOrdersView('latest-products')}
                        className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                          ordersView === 'latest-products'
                            ? 'bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-200'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        Latest products
                      </button>
                    )}
                    {navVisibility.showProducts && (
                      <button
                        type="button"
                        onClick={() => setOrdersView('top-selling')}
                        className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                          ordersView === 'top-selling'
                            ? 'bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-200'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        Top selling
                      </button>
                    )}
                  </div>
                  <div className="max-h-[min(46vh,400px)] overflow-auto overscroll-contain rounded-lg border border-slate-100">
                    {effectiveOrdersView === 'top-selling' ? (
                      <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                          <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-[10px] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur-sm sm:text-xs">
                            <th className="px-3 py-2.5">Product ID</th>
                            <th className="px-3 py-2.5">Customer name</th>
                            <th className="px-3 py-2.5">Sold</th>
                            <th className="px-3 py-2.5">Stock remaining</th>
                            <th className="px-3 py-2.5" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700 sm:text-sm">
                          {topSellingRows.map((row, idx) => (
                            <tr key={`${row.productId}-${idx}`} className="transition-colors hover:bg-slate-50/80">
                              <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{row.productId}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={imgProductThumb}
                                    alt={row.name}
                                    className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-slate-50 object-cover"
                                  />
                                  <span className="max-w-[200px] leading-snug text-slate-700">{row.name}</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2">{row.sold}</td>
                              <td className="whitespace-nowrap px-3 py-2">{row.stockRemaining}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => navigate('/vendor/products')}
                                  className="inline-flex rounded-md p-1.5 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full min-w-[600px] border-collapse text-left">
                        <thead>
                          <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-[10px] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur-sm sm:text-xs">
                            <th className="px-3 py-2.5">Order ID</th>
                            <th className="px-3 py-2.5">Customer name</th>
                            <th className="px-3 py-2.5">Date</th>
                            <th className="px-3 py-2.5">Qty</th>
                            <th className="px-3 py-2.5">Price</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3 py-2.5" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700 sm:text-sm">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="transition-colors hover:bg-slate-50/80">
                              <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{order.id}</td>
                              <td className="px-3 py-2 font-medium text-slate-800">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold leading-none ${order.avatarTone}`}
                                  >
                                    {order.name
                                      .split(' ')
                                      .map((x) => x[0])
                                      .join('')
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </span>
                                  <span className="truncate">{order.name}</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2">{order.date}</td>
                              <td className="whitespace-nowrap px-3 py-2">{order.qty}</td>
                              <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">{order.price}</td>
                              <td className="whitespace-nowrap px-3 py-2">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white sm:text-[11px] ${
                                    order.status === 'Processing' ? 'bg-[#4A8DFF]' : 'bg-[#F7C948]'
                                  }`}
                                >
                                  {order.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/vendor/orders/${order.id}`)}
                                  className="inline-flex rounded-md p-1.5 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </article>
              </section>
        </div>
      </main>
    </VendorAppShell>
    <VendorPerformanceStatsDrawer
      open={performanceOpen}
      onClose={() => setPerformanceOpen(false)}
      listing={DEMO_PERF_LISTING}
      onEditListing={() => {
        setPerformanceOpen(false);
        if (navVisibility.showEventsServices) navigate('/vendor/events');
        else navigate('/vendor/event-activity');
      }}
    />
    </>
  );
}

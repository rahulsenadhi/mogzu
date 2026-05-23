// Corporate transactions ledger.
//
// Reads three sources for the unified table:
//   - wallet_transactions (top-ups, debits, refunds)
//   - bookings with non-null payment_method (Mogzu Direct + card/UPI/wallet
//     reservations charged through the platform)
//   - invoice_runs paid (SaaS subscription + contract billing)
// Falls back to a small demo dataset when all three tables come back empty
// for a fresh corporate, matching the [[feedback-demo-data-fallback]]
// convention used across the dashboard surfaces.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { SharedHeader } from './layouts/SharedHeader';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  MoreVertical,
  CreditCard,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { listCorporateInvoices } from '@/lib/contracts';
import { getSubscriptionByCorporate } from '@/lib/subscriptions';

type TxRow = {
  id: string;
  date: string;
  description: string;
  category: string;
  amountInr: number;
  status: 'Completed' | 'Pending' | 'Failed';
  invoice: string | null;
  href: string | null;
};

const DEMO_TX: TxRow[] = [
  {
    id: 'TRX-DEMO-1',
    date: '2026-04-22',
    description: 'Mogzu Growth plan — monthly',
    category: 'SaaS Subscription',
    amountInr: 9999,
    status: 'Completed',
    invoice: 'INV-DEMO-04',
    href: '/account/invoices',
  },
  {
    id: 'TRX-DEMO-2',
    date: '2026-04-18',
    description: 'Wallet top-up via UPI',
    category: 'Top-up',
    amountInr: 50000,
    status: 'Completed',
    invoice: null,
    href: '/wallet',
  },
  {
    id: 'TRX-DEMO-3',
    date: '2026-04-12',
    description: 'Town-hall venue — Grand Hyatt',
    category: 'Event Booking',
    amountInr: 84500,
    status: 'Completed',
    invoice: null,
    href: '/bookings',
  },
];

const PAGE_SIZE = 10;

function fmtINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

const StatusBadge = ({ status }: { status: TxRow['status'] }) => {
  if (status === 'Completed')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
      </span>
    );
  if (status === 'Pending')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle className="w-3.5 h-3.5" /> Failed
    </span>
  );
};

function csvEscape(val: unknown): string {
  if (val == null) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows: TxRow[]) {
  const header = ['id', 'date', 'description', 'category', 'amount_inr', 'status', 'invoice'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.id, r.date, r.description, r.category, r.amountInr, r.status, r.invoice ?? '']
        .map(csvEscape)
        .join(','),
    );
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CorporateTransactionsPage() {
  const navigate = useNavigate();
  const { corporateId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [rows, setRows] = useState<TxRow[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionCost, setSubscriptionCost] = useState(0);

  useEffect(() => {
    if (!corporateId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      const [walletRes, bookingsRes, invoicesRes, subRes] = await Promise.all([
        supabase
          .from('wallet_transactions')
          .select('id, created_at, type, amount, description, booking_id')
          .eq('corporate_id', corporateId)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('bookings')
          .select('id, created_at, total_amount, payment_method, payment_status, listings(title)')
          .eq('corporate_id', corporateId)
          .not('payment_method', 'is', null)
          .order('created_at', { ascending: false })
          .limit(200),
        listCorporateInvoices(corporateId),
        getSubscriptionByCorporate(corporateId),
      ]);
      if (cancelled) return;

      const collected: TxRow[] = [];

      if (walletRes.error) setError(walletRes.error.message);
      for (const w of (walletRes.data ?? []) as Array<{
        id: string;
        created_at: string;
        type: string;
        amount: number;
        description: string | null;
        booking_id: string | null;
      }>) {
        const isCredit = w.type === 'topup' || w.type === 'refund';
        collected.push({
          id: `WLT-${w.id.slice(0, 8)}`,
          date: w.created_at.slice(0, 10),
          description: w.description ?? (isCredit ? 'Wallet credit' : 'Wallet debit'),
          category: isCredit ? 'Top-up' : 'Wallet debit',
          amountInr: Number(w.amount ?? 0),
          status: 'Completed',
          invoice: null,
          href: w.booking_id ? '/bookings' : '/wallet',
        });
      }

      for (const b of (bookingsRes.data ?? []) as Array<{
        id: string;
        created_at: string;
        total_amount: number;
        payment_method: string | null;
        payment_status: string | null;
        listings: { title: string | null } | null;
      }>) {
        const status: TxRow['status'] =
          b.payment_status === 'paid'
            ? 'Completed'
            : b.payment_status === 'failed'
              ? 'Failed'
              : 'Pending';
        collected.push({
          id: `BKG-${b.id.slice(0, 8)}`,
          date: b.created_at.slice(0, 10),
          description: b.listings?.title ?? 'Booking',
          category: 'Booking',
          amountInr: Number(b.total_amount ?? 0),
          status,
          invoice: null,
          href: '/bookings',
        });
      }

      for (const inv of invoicesRes.data) {
        const status: TxRow['status'] =
          inv.status === 'paid'
            ? 'Completed'
            : inv.status === 'cancelled'
              ? 'Failed'
              : 'Pending';
        collected.push({
          id: `INV-${inv.id.slice(0, 8)}`,
          date: inv.period_starts_on,
          description: inv.contract?.name ?? 'Contract invoice',
          category: 'Contract billing',
          amountInr: Number(inv.total ?? 0),
          status,
          invoice: inv.id.slice(0, 12),
          href: '/account/invoices',
        });
      }

      if (subRes.data?.plan) {
        const monthly =
          (subRes.data.plan.monthly_per_seat ?? 0) * (subRes.data.seat_count ?? 1);
        setSubscriptionCost(monthly);
      }

      collected.sort((a, b) => (a.date < b.date ? 1 : -1));

      if (collected.length === 0) {
        setRows(DEMO_TX);
        setUsingDemo(true);
      } else {
        setRows(collected);
        setUsingDemo(false);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [corporateId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.invoice ?? '').toLowerCase().includes(q),
    );
  }, [rows, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalItems);
  const paginated = filtered.slice(pageStart, pageEnd);

  const metrics = useMemo(() => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const ytdRows = rows.filter((r) => r.date >= yearStart && r.status !== 'Failed');
    const totalBilled = ytdRows
      .filter((r) => r.category !== 'Top-up')
      .reduce((sum, r) => sum + r.amountInr, 0);
    const platformFees = ytdRows
      .filter((r) => r.category === 'Contract billing')
      .reduce((sum, r) => sum + r.amountInr, 0);
    const upcoming = rows
      .filter((r) => r.status === 'Pending')
      .reduce((sum, r) => sum + r.amountInr, 0);
    return [
      {
        title: 'Total Billed (YTD)',
        value: fmtINR(totalBilled),
        change: usingDemo ? 'Demo data' : 'Year to date',
        trend: 'up' as const,
        icon: <Briefcase className="w-5 h-5 text-white" />,
        color: 'from-blue-600 to-blue-700',
      },
      {
        title: 'Mogzu SaaS Subscription',
        value: fmtINR(subscriptionCost),
        change: subscriptionCost > 0 ? 'Per month' : 'No plan',
        trend: 'up' as const,
        icon: <Layers className="w-5 h-5 text-blue-600" />,
        color: 'bg-white',
      },
      {
        title: 'Platform Fees (YTD)',
        value: fmtINR(platformFees),
        change: usingDemo ? 'Demo data' : 'Contract billing',
        trend: 'down' as const,
        icon: <CreditCard className="w-5 h-5 text-blue-600" />,
        color: 'bg-white',
      },
      {
        title: 'Upcoming Payments',
        value: fmtINR(upcoming),
        change: `${rows.filter((r) => r.status === 'Pending').length} pending`,
        trend: 'neutral' as const,
        icon: <Calendar className="w-5 h-5 text-blue-600" />,
        color: 'bg-white',
      },
    ];
  }, [rows, usingDemo, subscriptionCost]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="transactions"
      />

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchPlaceholder="Search transactions, invoices..."
        />

        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Corporate Transactions
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Mogzu SaaS billing, platform fees, and corporate spending.
                </p>
                {usingDemo && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Demo data — no transactions yet
                  </p>
                )}
                {error && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                    Load error: {error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={filtered.length === 0}
                  onClick={() => downloadCsv(filtered)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-40"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/wallet')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-600/20"
                >
                  <CreditCard className="w-4 h-4" />
                  Top up wallet
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 shadow-sm border ${
                    metric.color.includes('bg-white')
                      ? 'bg-white border-slate-200'
                      : `bg-gradient-to-br ${metric.color} border-transparent text-white`
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-2.5 rounded-xl ${
                        metric.color.includes('bg-white') ? 'bg-blue-50' : 'bg-white/20'
                      }`}
                    >
                      {metric.icon}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        metric.color.includes('bg-white')
                          ? metric.trend === 'up'
                            ? 'text-emerald-700 bg-emerald-50'
                            : metric.trend === 'down'
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-slate-600 bg-slate-100'
                          : 'text-white/90 bg-white/20'
                      }`}
                    >
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : null}
                      {metric.change}
                    </div>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium mb-1 ${
                        metric.color.includes('bg-white') ? 'text-slate-500' : 'text-blue-100'
                      }`}
                    >
                      {metric.title}
                    </h3>
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        metric.color.includes('bg-white') ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {loading ? '…' : metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/corporate/budget')}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 bg-white transition-colors"
                  >
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Budget</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Invoice</th>
                      <th className="px-6 py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                          Loading…
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                          No transactions match the filter.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => tx.href && navigate(tx.href)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-700">
                            {tx.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {fmtDate(tx.date)}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {tx.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900">
                            {fmtINR(tx.amountInr)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <StatusBadge status={tx.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 font-medium hover:underline">
                            {tx.invoice ?? '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tx.href) navigate(tx.href);
                              }}
                              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-white">
                <div>
                  {totalItems === 0
                    ? 'No entries'
                    : `Showing ${pageStart + 1} to ${pageEnd} of ${totalItems} entries`}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        currentPage === p
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

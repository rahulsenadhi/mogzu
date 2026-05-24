import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Loader2, Search } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { supabase } from '@/lib/supabase';

type TxRow = {
  id: string;
  date: string;
  description: string;
  category: string;
  corporate: string;
  amountInr: number;
  status: 'Completed' | 'Pending' | 'Failed';
  href: string | null;
};

const DEMO_TX: TxRow[] = [
  {
    id: 'ADM-DEMO-1',
    date: '2026-04-22',
    description: 'Acme Corp — wallet top-up',
    category: 'Wallet',
    corporate: 'Acme Corp',
    amountInr: 50000,
    status: 'Completed',
    href: '/admin/transactions',
  },
  {
    id: 'ADM-DEMO-2',
    date: '2026-04-18',
    description: 'Town-hall venue booking',
    category: 'Booking',
    corporate: 'Mindwave Labs',
    amountInr: 84500,
    status: 'Completed',
    href: '/admin/bookings',
  },
  {
    id: 'ADM-DEMO-3',
    date: '2026-04-12',
    description: 'Gifting bulk order — branded kits',
    category: 'Booking',
    corporate: 'Finbridge Tech',
    amountInr: 126000,
    status: 'Pending',
    href: '/admin/gifting/orders',
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

function statusClass(status: TxRow['status']): string {
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Pending') return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      const [walletRes, bookingsRes] = await Promise.all([
        supabase
          .from('wallet_transactions')
          .select('id, created_at, type, amount, description, corporate_id, corporate_accounts(name)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('bookings')
          .select(
            'id, created_at, total_amount, payment_method, payment_status, module, corporate_accounts(name), listings(title)',
          )
          .not('payment_method', 'is', null)
          .order('created_at', { ascending: false })
          .limit(200),
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
        corporate_accounts: { name: string | null } | { name: string | null }[] | null;
      }>) {
        const ca = Array.isArray(w.corporate_accounts) ? w.corporate_accounts[0] : w.corporate_accounts;
        const isCredit = w.type === 'topup' || w.type === 'refund' || w.type === 'credit';
        collected.push({
          id: `WLT-${w.id.slice(0, 8)}`,
          date: w.created_at.slice(0, 10),
          description: w.description ?? (isCredit ? 'Wallet credit' : 'Wallet debit'),
          category: isCredit ? 'Wallet credit' : 'Wallet debit',
          corporate: ca?.name ?? '—',
          amountInr: Number(w.amount ?? 0),
          status: 'Completed',
          href: '/admin/transactions',
        });
      }

      if (bookingsRes.error && !error) setError(bookingsRes.error.message);
      for (const b of (bookingsRes.data ?? []) as Array<{
        id: string;
        created_at: string;
        total_amount: number;
        payment_method: string | null;
        payment_status: string | null;
        module: string;
        corporate_accounts: { name: string | null } | { name: string | null }[] | null;
        listings: { title: string | null } | null;
      }>) {
        const ca = Array.isArray(b.corporate_accounts) ? b.corporate_accounts[0] : b.corporate_accounts;
        const status: TxRow['status'] =
          b.payment_status === 'paid'
            ? 'Completed'
            : b.payment_status === 'failed'
              ? 'Failed'
              : 'Pending';
        collected.push({
          id: `BKG-${b.id.slice(0, 8)}`,
          date: b.created_at.slice(0, 10),
          description: b.listings?.title ?? `${b.module} booking`,
          category: `${b.module} booking`,
          corporate: ca?.name ?? '—',
          amountInr: Number(b.total_amount ?? 0),
          status,
          href: b.module === 'gifting' ? '/admin/gifting/orders' : '/admin/bookings',
        });
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
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.corporate.toLowerCase().includes(q),
    );
  }, [rows, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const metrics = useMemo(() => {
    const completed = rows.filter((r) => r.status === 'Completed');
    const pending = rows.filter((r) => r.status === 'Pending');
    return {
      volume: completed.reduce((s, r) => s + r.amountInr, 0),
      completed: completed.length,
      pending: pending.length,
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Platform transactions" totalLabel={`${filtered.length} rows`} />

      {usingDemo && import.meta.env.DEV && (
        <DevMockDataBanner message="Showing demo transactions — Supabase wallet_transactions and paid bookings are empty." />
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed volume</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{fmtINR(metrics.volume)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.completed}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.pending}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, corporate, category…"
              className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading transactions…
          </div>
        ) : paginated.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No transactions match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4 pr-3">Reference</th>
                  <th className="py-3 pr-3">Date</th>
                  <th className="py-3 pr-3">Corporate</th>
                  <th className="py-3 pr-3">Description</th>
                  <th className="py-3 pr-3">Category</th>
                  <th className="py-3 pr-3">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="py-3 pl-4 pr-3 font-mono text-xs text-slate-600">
                      {row.href ? (
                        <Link to={row.href} className="text-[#1D4ED8] hover:underline">
                          {row.id}
                        </Link>
                      ) : (
                        row.id
                      )}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{fmtDate(row.date)}</td>
                    <td className="py-3 pr-3 text-slate-700">{row.corporate}</td>
                    <td className="py-3 pr-3 font-medium text-slate-900">{row.description}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.category}</td>
                    <td className="py-3 pr-3 font-medium text-slate-900">{fmtINR(row.amountInr)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="disabled:opacity-40"
            >
              ← Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

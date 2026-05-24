import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Loader2, Search, Plus, Eye, Trash2 } from 'lucide-react';
import {
  AdminPageTitleRow,
  AdminProductLineTabs,
  type AdminProductLine,
} from '@/app/components/admin/AdminPageChrome';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { MOCK_PRODUCTS, type MockProduct } from '@/app/lib/adminProductsMock';
import { db } from '@/lib/db';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop';

type ListingRow = {
  id: string;
  title: string;
  module: string;
  status: string;
  vendors: { business_name: string | null } | null;
};

function moduleToProductLine(module: string): AdminProductLine | null {
  if (module === 'gifting') return 'gifting';
  if (module === 'events') return 'events';
  if (module === 'spacex_coworking' || module === 'spacex_stay') return 'spacex';
  return null;
}

function mapListingToProduct(row: ListingRow): MockProduct | null {
  const vertical = moduleToProductLine(row.module);
  if (!vertical) return null;
  return {
    id: row.id,
    name: row.title,
    image: PLACEHOLDER_IMAGE,
    seller: row.vendors?.business_name ?? '—',
    category: row.module.replace(/_/g, ' '),
    qty: '—',
    price: '—',
    stock: row.status === 'active' ? 'available' : 'out',
    vertical,
  };
}

export default function AdminProductsPage() {
  const [line, setLine] = useState<AdminProductLine>('gifting');
  const [query, setQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [uiNotice, setUiNotice] = useState('');
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await db.listings.listForPublicAdmin();
      if (cancelled) return;
      const mapped = (data ?? [])
        .map((row) => mapListingToProduct(row as ListingRow))
        .filter((p): p is MockProduct => p !== null);
      if (error || mapped.length === 0) {
        setProducts(MOCK_PRODUCTS);
        setUsingMock(true);
      } else {
        setProducts(mapped);
        setUsingMock(false);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.vertical === line);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q)
      );
    }
    return list;
  }, [line, query, products]);

  const totalLabel = loading
    ? 'Loading products…'
    : `${products.length} total product${products.length === 1 ? '' : 's'}`;

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="All Products" totalLabel={totalLabel} />
      <AdminProductLineTabs value={line} onChange={setLine} />

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Loading products…
        </div>
      )}
      {!loading && usingMock && <DevMockDataBanner />}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setUiNotice('Bulk export will be available in a future release.')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2563EB] text-[#2563EB] text-sm font-semibold hover:bg-blue-50"
            >
              Bulk Export
            </button>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8]"
            >
              <Plus className="size-4" />
              Add Product
            </Link>
          </div>
        </div>
        {uiNotice && (
          <div className="px-5 pt-3">
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {uiNotice}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/80 border-b border-slate-100">
                <th className="py-3 pl-4 pr-4">Product ID</th>
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Seller</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Qty/capacity</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-slate-100 ${
                    i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  } hover:bg-slate-50/80`}
                >
                  <td className="py-3 pl-4 pr-4 font-mono text-xs text-slate-600">{p.id}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="size-10 rounded-lg object-cover border border-slate-100"
                      />
                      <span className="font-medium text-slate-900 max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{p.seller}</td>
                  <td className="py-3 pr-4 text-slate-600">{p.category}</td>
                  <td className="py-3 pr-4 text-slate-700 font-medium">{p.qty}</td>
                  <td className="py-3 pr-4 text-slate-800 font-semibold">{p.price}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.stock === 'available'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {p.stock === 'available' ? 'Available' : 'Out of stock'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setUiNotice(`View details for ${p.id} will be available in a future release.`)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="View"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUiNotice(`Delete flow for ${p.id} will be available in a future release.`)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUiNotice(`Edit flow for ${p.id} will be available in a future release.`)}
                        className="text-xs font-semibold text-[#2563EB] hover:underline px-2 py-1"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-sm text-slate-500">
            Showing {filtered.length} {usingMock ? 'in demo dataset' : 'products'}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setActivePage(n)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold ${
                  n === activePage ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

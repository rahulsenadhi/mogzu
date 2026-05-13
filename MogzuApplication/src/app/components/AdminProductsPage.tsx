import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, Plus, Eye, Trash2, Pencil } from 'lucide-react';
import {
  AdminPageTitleRow,
  AdminProductLineTabs,
  type AdminProductLine,
} from '@/app/components/admin/AdminPageChrome';
import { MOCK_PRODUCTS } from '@/app/lib/adminProductsMock';

const TOTAL_PRODUCTS_LABEL = '500 total products';

export default function AdminProductsPage() {
  const [line, setLine] = useState<AdminProductLine>('gifting');
  const [query, setQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [uiNotice, setUiNotice] = useState('');

  const filtered = useMemo(() => {
    let list = MOCK_PRODUCTS.filter((p) => p.vertical === line);
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
  }, [line, query]);

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="All Products" totalLabel={TOTAL_PRODUCTS_LABEL} />
      <AdminProductLineTabs value={line} onChange={setLine} />

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
          <span className="text-sm text-slate-500">Showing {filtered.length} in demo dataset</span>
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

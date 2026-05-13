import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Store, PartyPopper, Shirt, Backpack } from 'lucide-react';
import {
  AdminPageTitleRow,
  AdminProductLineTabs,
  type AdminProductLine,
} from '@/app/components/admin/AdminPageChrome';
import { MOCK_CATEGORY_ROWS } from '@/app/lib/adminProductsMock';

function CategoryIcon({ kind }: { kind: 'shop' | 'celebration' }) {
  return kind === 'shop' ? (
    <Store className="size-4 text-slate-500 shrink-0" />
  ) : (
    <PartyPopper className="size-4 text-slate-500 shrink-0" />
  );
}

function SubIcon({ kind }: { kind: 'shirt' | 'bag' }) {
  return kind === 'shirt' ? (
    <Shirt className="size-4 text-slate-500 shrink-0" />
  ) : (
    <Backpack className="size-4 text-slate-500 shrink-0" />
  );
}

export default function AdminProductCategoriesPage() {
  const [line, setLine] = useState<AdminProductLine>('gifting');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [uiNotice, setUiNotice] = useState('');
  const pageSize = 2;

  const filtered = useMemo(() => {
    let list = MOCK_CATEGORY_ROWS.filter((r) => r.vertical === line);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.categoryLabel.toLowerCase().includes(q) ||
          r.subLabel.toLowerCase().includes(q) ||
          r.items.some((i) => i.toLowerCase().includes(q))
      );
    }
    return list;
  }, [line, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [line]);

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Category" totalLabel="Total 30" />
      <AdminProductLineTabs value={line} onChange={setLine} />

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <button
            type="button"
            onClick={() => setUiNotice('Create category flow will be available in a future release.')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8] shrink-0"
          >
            <Plus className="size-4" />
            Create Category
          </button>
        </div>
        {uiNotice && (
          <div className="px-5 pt-3">
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {uiNotice}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/80 border-b border-slate-100">
                <th className="py-3 pl-4 pr-4">Sr No.</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Sub Category</th>
                <th className="py-3 pr-4">Items</th>
                <th className="py-3 pr-4 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row, i) => (
                <tr
                  key={row.sr}
                  className={`border-b border-slate-100 align-top ${
                    i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <td className="py-4 pl-4 pr-4 font-mono text-slate-600">{row.sr}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <CategoryIcon kind={row.categoryIcon} />
                      <span className="font-semibold text-slate-900">{row.categoryLabel}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <SubIcon kind={row.subIcon} />
                      <span className="font-medium text-slate-800">{row.subLabel}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <ul className="space-y-1 text-slate-600 text-sm">
                      {row.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    {row.action === 'add' ? (
                      <button
                        type="button"
                        onClick={() => setUiNotice(`Attribute creation for ${row.subLabel} will be available in a future release.`)}
                        className="text-sm font-semibold text-[#2563EB] hover:underline"
                      >
                        + Add Attributes
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUiNotice(`Attributes page for ${row.subLabel} will be available in a future release.`)}
                        className="text-sm font-semibold text-[#2563EB] hover:underline"
                      >
                        Go to attributes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="font-medium text-[#2563EB] disabled:text-slate-300 disabled:cursor-not-allowed hover:underline"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="font-medium text-[#2563EB] disabled:text-slate-300 disabled:cursor-not-allowed hover:underline"
            >
              Next →
            </button>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold ${
                  safePage === n
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/80'
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

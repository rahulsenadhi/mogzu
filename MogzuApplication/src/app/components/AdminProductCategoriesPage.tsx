import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Plus, Store, PartyPopper, Shirt, Backpack } from 'lucide-react';
import {
  AdminPageTitleRow,
  AdminProductLineTabs,
  type AdminProductLine,
} from '@/app/components/admin/AdminPageChrome';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { MOCK_CATEGORY_ROWS, type MockCategoryRow } from '@/app/lib/adminProductsMock';
import { db } from '@/lib/db';
import type { ListingCategory, ModuleId } from '@/lib/database.types';

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

function moduleToProductLine(module: ModuleId): AdminProductLine | null {
  if (module === 'gifting') return 'gifting';
  if (module === 'events') return 'events';
  if (module === 'spacex_coworking' || module === 'spacex_stay') return 'spacex';
  return null;
}

function mapCategoriesToRows(categories: ListingCategory[]): MockCategoryRow[] {
  const parents = categories.filter((c) => c.parent_id == null);
  return parents.flatMap((parent, idx) => {
    const vertical = moduleToProductLine(parent.module);
    if (!vertical) return [];
    const children = categories.filter((c) => c.parent_id === parent.id);
    if (children.length === 0) {
      return [{
        sr: String(idx + 1).padStart(4, '0'),
        categoryLabel: parent.name,
        categoryIcon: 'shop' as const,
        subLabel: parent.name,
        subIcon: 'shirt' as const,
        items: parent.description ? [parent.description] : ['—'],
        action: 'add' as const,
        vertical,
      }];
    }
    return children.map((child, childIdx) => ({
      sr: String(idx * 10 + childIdx + 1).padStart(4, '0'),
      categoryLabel: parent.name,
      categoryIcon: (childIdx % 2 === 0 ? 'shop' : 'celebration') as 'shop' | 'celebration',
      subLabel: child.name,
      subIcon: (childIdx % 2 === 0 ? 'shirt' : 'bag') as 'shirt' | 'bag',
      items: child.description ? [child.description] : ['—'],
      action: (childIdx % 2 === 0 ? 'add' : 'goto') as 'add' | 'goto',
      vertical,
    }));
  });
}

export default function AdminProductCategoriesPage() {
  const [line, setLine] = useState<AdminProductLine>('gifting');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [uiNotice, setUiNotice] = useState('');
  const [rows, setRows] = useState<MockCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const pageSize = 2;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await db.categories.listAllForAdmin();
      if (cancelled) return;
      const mapped = mapCategoriesToRows((data ?? []) as ListingCategory[]);
      if (error || mapped.length === 0) {
        setRows(MOCK_CATEGORY_ROWS);
        setUsingMock(true);
      } else {
        setRows(mapped);
        setUsingMock(false);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = rows.filter((r) => r.vertical === line);
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
  }, [line, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [line]);

  const totalLabel = loading
    ? 'Loading categories…'
    : `Total ${filtered.length}`;

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Category" totalLabel={totalLabel} />
      <AdminProductLineTabs value={line} onChange={setLine} />

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Loading categories…
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
                  key={`${row.sr}-${row.subLabel}`}
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

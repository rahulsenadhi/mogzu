import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { GitCompare, X } from 'lucide-react';
import { clearCompareIds, getCompareIds, removeCompareId, subscribeListingSession } from '@/app/lib/listingSessionState';
import { findCatalogueItemById } from '@/utils/listingResolve';

export function CompareStickyBar() {
  const navigate = useNavigate();
  const [ids, setIds] = useState(() => getCompareIds());
  const [showHint, setShowHint] = useState(false);

  useEffect(() => subscribeListingSession(() => setIds([...getCompareIds()])), []);

  useEffect(() => {
    if (ids.length !== 1) return;
    if (sessionStorage.getItem('mogzu_compare_hint_shown')) return;
    sessionStorage.setItem('mogzu_compare_hint_shown', '1');
    setShowHint(true);
    const id = window.setTimeout(() => setShowHint(false), 3000);
    return () => window.clearTimeout(id);
  }, [ids]);

  if (ids.length === 0) return null;

  const canCompare = ids.length >= 2;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-4 pt-2 lg:px-6"
      role="region"
      aria-label="Compare selection"
    >
      <div className="pointer-events-auto flex w-full max-w-[1100px] translate-y-0 animate-[slideUp_0.25s_ease-out] flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }`}</style>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <GitCompare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {ids.length} {ids.length === 1 ? 'listing' : 'listings'} selected
            </p>
            <p className="text-xs text-slate-500">
              {canCompare ? 'Open compare to review side-by-side.' : 'Add at least one more listing to compare.'}
            </p>
          </div>
          {showHint ? (
            <div className="hidden sm:block rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
              Check 1 more listing to compare side by side
            </div>
          ) : null}
          <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
            {ids.slice(0, 3).map((id) => {
              const item = findCatalogueItemById(id);
              const img = item?.photos?.[0];
              return (
                <div key={id} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white shadow hover:bg-slate-700"
                    aria-label={`Remove ${item?.name ?? id} from compare`}
                    onClick={() => setIds(removeCompareId(id))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            {ids.length < 3 ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-400">
                {3 - ids.length} slot{3 - ids.length === 1 ? '' : 's'}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pl-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              clearCompareIds();
              setIds([]);
            }}
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!canCompare}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={() => navigate('/compare')}
          >
            Compare now
          </button>
        </div>
      </div>
    </div>
  );
}

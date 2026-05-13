import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Sparkles } from 'lucide-react';
import {
  MOGZU_DIRECT_LISTINGS_KEY,
  MOGZU_DOMAIN_STORAGE_EVENT,
  PARTNER_LISTINGS_KEY,
} from '@/app/lib/mogzuDomain';
import type { MogzuListingModule } from '@/app/lib/mogzuDomain';
import {
  getMergedCatalogue,
  MOGZU_DIRECT_CATALOGUE_KEY,
  MOGZU_VENDOR_LISTINGS_KEY,
} from '@/utils/catalogueUtils';

type ActiveNav = 'shop' | 'activity' | 'spacex';

const MODULE_LABEL: Record<MogzuListingModule, string> = {
  gifting: 'Gifting',
  dspace: 'D Space',
  events: 'Events',
};

/** Case-insensitive: listing category must include one of these substrings. */
export function listingCategoryMatchesIncludes(
  category: string,
  includes: string[],
  extras?: string[]
): boolean {
  const haystack = [category, ...(extras ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return includes.some((inc) => haystack.includes(inc.trim().toLowerCase()));
}

export function CorporateMogzuPicksSection({
  module,
  activeNav = 'activity',
  categoryIncludes,
  titleOverride,
  renderMode = 'split',
}: {
  module: MogzuListingModule;
  activeNav?: ActiveNav;
  /** When set, only listings whose `category` matches one of these substrings (case-insensitive). */
  categoryIncludes?: string[];
  /** Replaces the default section heading when provided. */
  titleOverride?: string;
  /** `split` keeps source bands; `unified` shows one merged strip without source labels. */
  renderMode?: 'split' | 'unified';
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const onStorage = (e: Event) => {
      const d = (e as CustomEvent<{ key?: string }>).detail;
      if (
        !d?.key ||
        d.key === MOGZU_DIRECT_LISTINGS_KEY ||
        d.key === PARTNER_LISTINGS_KEY ||
        d.key === MOGZU_VENDOR_LISTINGS_KEY ||
        d.key === MOGZU_DIRECT_CATALOGUE_KEY
      )
        bump();
    };
    window.addEventListener(MOGZU_DOMAIN_STORAGE_EVENT, onStorage as EventListener);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener(MOGZU_DOMAIN_STORAGE_EVENT, onStorage as EventListener);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const { directRows, partnerRows, unifiedRows } = useMemo(() => {
    const catOk = (i: { category: string; name: string; tagline?: string; description: string; tags?: string[]; videos?: string[] }) =>
      !categoryIncludes?.length ||
      listingCategoryMatchesIncludes(i.category, categoryIncludes, [
        i.name,
        i.tagline ?? '',
        i.description,
        ...(i.tags ?? []),
        ...(i.videos ?? []),
      ]);
    const merged = getMergedCatalogue().filter(
      (i) => i.module === module && i.is_available && catOk(i),
    );
    const direct = merged.filter((i) => i.source_type === 'mogzu_direct').slice(0, 8);
    const partner = merged.filter((i) => i.source_type === 'vendor').slice(0, 8);
    const unified = merged.slice(0, 12);
    return { directRows: direct, partnerRows: partner, unifiedRows: unified };
  }, [module, tick, categoryIncludes]);

  if (renderMode === 'unified' && unifiedRows.length === 0) return null;
  if (renderMode === 'split' && directRows.length === 0 && partnerRows.length === 0) return null;

  const sectionTitle =
    titleOverride?.trim() ||
    (module === 'gifting'
      ? 'Mogzu picks for gifting'
      : module === 'dspace'
        ? 'Mogzu picks for workspaces'
        : 'Mogzu picks for events');

  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden ${
        activeNav === 'shop' ? 'mx-6 my-4' : 'max-w-7xl mx-auto px-6 py-4'
      }`}
      aria-label={renderMode === 'unified' ? 'Service listings' : 'Mogzu Direct and partner listings'}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <Sparkles className="size-4 text-amber-500 shrink-0" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-800">{sectionTitle}</h2>
        <span className="text-xs text-slate-500">Curated by Mogzu · {MODULE_LABEL[module]}</span>
      </div>
      <div className="p-4 space-y-5">
        {renderMode === 'unified' ? (
          <div>
            <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
              {unifiedRows.map((l) => (
                <Link
                  key={l.id}
                  to={
                    l.source_type === 'mogzu_direct'
                      ? `/browse/mogzu-direct/${l.module}/${encodeURIComponent(l.id)}`
                      : `/browse/partner-listing/${encodeURIComponent(l.id)}`
                  }
                  className="snap-start shrink-0 w-[220px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-slate-100">
                    {l.photos[0] ? (
                      <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{l.name}</p>
                    <p className="text-xs text-slate-600">{l.price_label ?? '—'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            {directRows.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Mogzu Direct</h3>
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {directRows.map((l) => (
                    <Link
                      key={l.id}
                      to={`/browse/mogzu-direct/${l.module}/${encodeURIComponent(l.id)}`}
                      className="snap-start shrink-0 w-[220px] rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all overflow-hidden"
                    >
                      <div className="aspect-[16/10] bg-slate-100">
                        {l.photos[0] ? (
                          <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No image</div>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-semibold text-blue-700">Mogzu Direct</p>
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{l.name}</p>
                        <p className="text-xs text-slate-600">{l.price_label ?? '—'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {partnerRows.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Partner offers</h3>
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {partnerRows.map((l) => (
                    <Link
                      key={l.id}
                      to={`/browse/partner-listing/${encodeURIComponent(l.id)}`}
                      className="snap-start shrink-0 w-[220px] rounded-xl border border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm transition-all overflow-hidden"
                    >
                      <div className="aspect-[16/10] bg-slate-100">
                        {l.photos[0] ? (
                          <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No image</div>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-semibold text-violet-700">Partner</p>
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{l.name}</p>
                        <p className="text-xs text-slate-600">{l.price_label ?? '—'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

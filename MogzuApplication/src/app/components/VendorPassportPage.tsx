import { useEffect, useMemo, useState } from 'react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Search, Filter, Star, MoreVertical, Heart, ShieldCheck } from 'lucide-react';
import {
  CORPORATE_VENDOR_DIRECTORY_UPDATED_EVENT,
  loadCorporateApprovedVendors,
  type CorporateVendorTab,
} from '@/app/lib/corporateVendorDirectoryStorage';

interface SavedVendor {
  id: string;
  name: string;
  category: 'SpaceX' | 'Events' | 'Gifting';
  /** When set, vendor appears under each listed tab */
  categories?: CorporateVendorTab[];
  rating: number;
  lastBooked: string;
  totalSpend: string;
  image: string;
  preferred: boolean;
  notes: string;
  verified: boolean;
}

const seedVendors: SavedVendor[] = [
  {
    id: 'v1',
    name: 'Grand Horizon Venues',
    category: 'SpaceX',
    rating: 4.8,
    lastBooked: 'Oct 12, 2023',
    totalSpend: '₹4,50,000',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=400',
    preferred: true,
    notes: 'Great for annual company offsites. Contact point: Rahul.',
    verified: true,
  },
  {
    id: 'v2',
    name: 'Elite Gifting Co.',
    category: 'Gifting',
    rating: 4.6,
    lastBooked: 'Dec 05, 2023',
    totalSpend: '₹1,20,000',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=400',
    preferred: false,
    notes: 'Reliable Diwali hampers. Need 3 weeks lead time.',
    verified: true,
  },
  {
    id: 'v3',
    name: 'Pulse Team Building',
    category: 'Events',
    rating: 4.9,
    lastBooked: 'Aug 22, 2023',
    totalSpend: '₹85,000',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400',
    preferred: true,
    notes: 'Excellent drum circle facilitators. Highly engaging.',
    verified: false,
  },
];

export default function VendorPassportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [corpTick, setCorpTick] = useState(0);
  const [preferredOverrides, setPreferredOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const bump = () => setCorpTick((n) => n + 1);
    window.addEventListener(CORPORATE_VENDOR_DIRECTORY_UPDATED_EVENT, bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener(CORPORATE_VENDOR_DIRECTORY_UPDATED_EVENT, bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const mergedVendors = useMemo((): SavedVendor[] => {
    const fromAdmin: SavedVendor[] = loadCorporateApprovedVendors().map((c) => ({
      id: `corp-${c.onboardingId}`,
      name: c.businessName,
      category: c.categories[0],
      categories: c.categories,
      rating: 5,
      lastBooked: '—',
      totalSpend: '—',
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=400',
      preferred: false,
      notes: [c.servicesSummary, c.city, c.email].filter(Boolean).join(' · '),
      verified: true,
    }));
    return [...fromAdmin, ...seedVendors];
  }, [corpTick]);

  const vendors = useMemo(
    () =>
      mergedVendors.map((v) => ({
        ...v,
        preferred: preferredOverrides[v.id] ?? v.preferred,
      })),
    [mergedVendors, preferredOverrides]
  );

  const togglePreferred = (id: string) => {
    const base = mergedVendors.find((v) => v.id === id);
    const current = preferredOverrides[id] ?? base?.preferred ?? false;
    setPreferredOverrides((p) => ({ ...p, [id]: !current }));
  };

  const filteredVendors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list =
      activeTab === 'All'
        ? vendors
        : vendors.filter((v) =>
            v.categories?.length
              ? v.categories.includes(activeTab as CorporateVendorTab)
              : v.category === activeTab
          );
    if (q) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.notes.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vendors, activeTab, searchQuery]);

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <MogzuCorporateScrollSurface>
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Passport</h1>
                <p className="text-gray-500 mt-1">
                  Your approved and preferred vendor directory across all verticals. Admin-approved partners appear here
                  automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUiNotice('Directory export will be available once export integration is enabled.')}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Export Directory
              </button>
            </div>
            {uiNotice ? (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {uiNotice}
              </p>
            ) : null}

            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {['All', 'SpaceX', 'Events', 'Gifting'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'SpaceX' ? 'D Space' : tab}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vendors..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white shadow-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setUiNotice('Advanced vendor filters will be available in a future release.')}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-40">
                    <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {(vendor.categories?.length ? vendor.categories : [vendor.category]).map((cat) => (
                        <span
                          key={cat}
                          className={`px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md ${
                            cat === 'SpaceX'
                              ? 'bg-indigo-500/80'
                              : cat === 'Events'
                                ? 'bg-emerald-500/80'
                                : 'bg-rose-500/80'
                          }`}
                        >
                          {cat === 'SpaceX' ? 'D Space' : cat}
                        </span>
                      ))}
                      {vendor.verified && (
                        <span className="px-1.5 py-1 rounded bg-blue-500/80 backdrop-blur-md flex items-center justify-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePreferred(vendor.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-colors"
                      title={vendor.preferred ? 'Remove from preferred' : 'Mark as preferred'}
                    >
                      <Heart
                        className={`w-4 h-4 ${vendor.preferred ? 'fill-red-500 text-red-500' : 'text-white'}`}
                      />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{vendor.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-400 mt-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-medium text-white">{vendor.rating} avg rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Total Spend</p>
                        <p className="text-sm font-semibold text-gray-900">{vendor.totalSpend}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Last Booked</p>
                        <p className="text-sm font-semibold text-gray-900">{vendor.lastBooked}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">Internal Notes</p>
                      <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100">
                        {vendor.notes}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setUiNotice(`Booking flow for ${vendor.name} will be available in a future release.`)
                        }
                        className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        Book Again
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUiNotice(`More actions for ${vendor.name} will be available in a future release.`)
                        }
                        className="w-10 flex items-center justify-center border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

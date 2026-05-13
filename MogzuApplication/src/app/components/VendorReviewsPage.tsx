import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Search, Star } from 'lucide-react';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgProductThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';

type SubTab = 'profile' | 'products';

type Review = {
  id: string;
  reviewerName: string;
  time: string;
  text: string;
  overall: number; // 1..5
  categories: { professionalism: number; quality: number; pricing: number };
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx + 1 <= Math.round(value);
        return (
          <Star
            key={idx}
            className={`h-3.5 w-3.5 ${filled ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-transparent text-[#E5E7EB]'}`}
          />
        );
      })}
    </div>
  );
}

function RatingBars({ value }: { value: number }) {
  // Static distribution, roughly matching screenshot (5:4, 4:3, 3:2, 2:1, 1:0)
  const buckets = [
    { label: '5', percent: value >= 4.5 ? 100 : value >= 4 ? 85 : 60 },
    { label: '4', percent: value >= 4 ? 85 : 70 },
    { label: '3', percent: value >= 3.5 ? 70 : 45 },
    { label: '2', percent: value >= 3 ? 35 : 25 },
    { label: '1', percent: value >= 2 ? 10 : 5 },
  ];

  return (
    <div className="space-y-1">
      {buckets.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="w-2 text-[10px] text-slate-500">{b.label}</span>
          <div className="h-1.5 w-24 rounded bg-slate-100">
            <div className="h-1.5 rounded bg-[#F59E0B]" style={{ width: `${b.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState<SubTab>('profile');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const profileReviews: Review[] = [
    {
      id: 'r1',
      reviewerName: 'Micheli',
      time: '16 Jul, 2024 18:10',
      text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
      overall: 4,
      categories: { professionalism: 4, quality: 4, pricing: 3 },
    },
    {
      id: 'r2',
      reviewerName: 'Micheli',
      time: '16 Jul, 2024 18:10',
      text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
      overall: 4,
      categories: { professionalism: 4, quality: 4, pricing: 3 },
    },
  ];

  const productReviews = [
    {
      id: 'pr1',
      productId: '9132476921',
      productName: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
      author: 'Micheli',
      time: 'Today 18:10',
      excerpt:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
      rating: 3.7,
    },
    {
      id: 'pr2',
      productId: '9132476921',
      productName: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
      author: 'Micheli',
      time: '16 Jul, 2024 18:10',
      excerpt:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
      rating: 3.7,
    },
    {
      id: 'pr3',
      productId: '9132476921',
      productName: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
      author: 'Micheli',
      time: '16 Jul, 2024 18:10',
      excerpt:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
      rating: 3.7,
    },
    {
      id: 'pr4',
      productId: '9132476921',
      productName: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
      author: 'Micheli',
      time: '16 Jul, 2024 18:10',
      excerpt:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
      rating: 3.7,
    },
  ];

  const filteredProductReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productReviews;
    return productReviews.filter((p) => p.productName.toLowerCase().includes(q) || p.productId.includes(q));
  }, [search]);

  const shownProductReviews = showAll ? filteredProductReviews : filteredProductReviews.slice(0, 2);

  return (
    <VendorAppShell
      activeNav="reviews"
      routeSource="vendor-reviews"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
      headerEnd={
        <>
          <button
            type="button"
            aria-label="Open communication and notifications"
            onClick={() =>
              navigate('/vendor/communication', {
                state: { source: 'vendor-reviews-header', channel: 'notifications' },
              })
            }
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
          </button>
          <VendorTopRightMenu />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent">
        <div className="px-4 py-4 sm:px-6">
            {uiNotice ? (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {uiNotice}
              </p>
            ) : null}
            <div className="flex items-center gap-3 mb-5">
              <button
                type="button"
                onClick={() => setSubTab('profile')}
                className={`rounded-full border px-6 py-2 text-sm font-medium transition ${
                  subTab === 'profile'
                    ? 'border-[#2563eb] bg-white text-[#2563eb] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setSubTab('products')}
                className={`rounded-full border px-6 py-2 text-sm font-medium transition ${
                  subTab === 'products'
                    ? 'border-[#2563eb] bg-white text-[#2563eb] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Products
              </button>
            </div>

            {subTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Reviews</h2>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={imgAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">James Brown</p>
                      <p className="text-sm text-slate-500">Manufacturer</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-xs text-slate-500">Total Reviews</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">10.0k</p>
                      <p className="text-xs text-slate-500 mt-1">+3.25% from last month</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Average rating</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-2xl font-bold text-slate-900">3.7</p>
                        <Stars value={3.7} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Outstanding feedback</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Overall rating</p>
                      <div className="mt-2 space-y-1">
                        {['5', '4', '3', '2', '1'].map((n, idx) => (
                          <div key={n} className="flex items-center gap-2">
                            <span className="w-2 text-xs text-slate-600">{n}</span>
                            <div className="h-2.5 w-24 rounded bg-slate-100">
                              <div className="h-2.5 rounded bg-[#F59E0B]" style={{ width: `${[100, 85, 60, 35, 15][idx]}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Rating distribution</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-500">Professionalism</p>
                      <div className="mt-1">
                        <Stars value={4} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">4.0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-500">Quality</p>
                      <div className="mt-1">
                        <Stars value={4} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">4.0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-500">Pricing</p>
                      <div className="mt-1">
                        <Stars value={3} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">3.0</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {profileReviews.map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img src={imgAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-slate-900">{r.reviewerName}</p>
                            <p className="text-xs text-slate-500 mt-1">{r.time}</p>
                          </div>
                        </div>

                        <div className="min-w-[180px]">
                          <p className="text-xs text-slate-500">Overall</p>
                          <div className="mt-2 flex items-center gap-3">
                            <p className="text-sm font-semibold text-slate-900">{r.overall}.0</p>
                            <Stars value={r.overall} />
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>Professionalism</span>
                              <Stars value={r.categories.professionalism} />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>Quality</span>
                              <Stars value={r.categories.quality} />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>Pricing</span>
                              <Stars value={r.categories.pricing} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-600 leading-relaxed">{r.text}</p>

                      <div className="mt-4 flex flex-wrap gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => setUiNotice(`Public comment opened for ${r.reviewerName}'s review.`)}
                          className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Public comment
                        </button>
                        <button
                          type="button"
                          onClick={() => setUiNotice(`Private message opened for ${r.reviewerName}.`)}
                          className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Private message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTab === 'products' && (
              <div className="max-w-5xl mx-auto">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Reviews</h2>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUiNotice('Product review filters will be available once advanced filters are enabled.')}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Filter
                    </button>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Sorting options will be available once advanced sorting is enabled.')}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Sort by
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {shownProductReviews.map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 p-4 bg-gradient-to-r from-[#F5FAFF] to-white border-r border-slate-100">
                          <div className="flex items-center gap-3">
                            <img src={imgProductThumb} alt="" className="h-14 w-14 rounded-lg object-cover bg-white border border-slate-100" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-400">Product ID: {p.productId}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{p.productName}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <img src={imgAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{p.author}</p>
                              <p className="text-xs text-slate-500 mt-1">{p.time}</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-5 p-4">
                          <p className="text-sm text-slate-600 leading-relaxed">{p.excerpt}</p>
                        </div>

                        <div className="col-span-3 p-4 border-l border-slate-100 bg-slate-50">
                          <p className="text-xs text-slate-500">Average rating</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{p.rating}</p>
                          <div className="mt-2">
                            <RatingBars value={p.rating} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="rounded-full border border-[#2563EB] bg-white px-8 py-2 text-sm font-medium text-[#2563EB] hover:bg-[#ebf1ff]"
                  >
                    {showAll ? 'View less' : 'View all'}
                  </button>
                </div>
              </div>
            )}
        </div>
      </main>
    </VendorAppShell>
  );
}


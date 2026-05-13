import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Eye, HelpCircle, Megaphone, Percent, Plus, Search, X } from 'lucide-react';
import imgMeetingThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import {
  loadVendorPromoAds,
  saveVendorPromoAds,
  type VendorPromoAd,
} from '@/app/lib/vendorPromotionAdsStorage';

type MainTab = 'ads' | 'discount';

type DiscountRow = {
  id: string;
  code: string;
  name: string;
  percentOff: number;
  startAt: string;
  endAt: string;
  productsToOffer: string;
  limitUsers: number;
  rateEnabled: boolean;
};

const initialDiscounts: DiscountRow[] = [
  {
    id: 'd1',
    code: 'SUMMERSALE40',
    name: 'SUMMER SALE',
    percentOff: 50,
    startAt: 'Jun 21, 2024 18:10:32',
    endAt: 'Jun 24, 2024 18:10:32',
    productsToOffer: 'All',
    limitUsers: 100,
    rateEnabled: true,
  },
  {
    id: 'd2',
    code: 'SUMMERSALE40',
    name: 'SUMMER SALE',
    percentOff: 50,
    startAt: 'Jun 21, 2024 18:10:32',
    endAt: 'Jun 24, 2024 18:10:32',
    productsToOffer: 'All',
    limitUsers: 100,
    rateEnabled: false,
  },
];

function formatTotal(n: number) {
  return String(n).padStart(3, '0');
}

export default function VendorPromotionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>('ads');
  const [ads, setAds] = useState<VendorPromoAd[]>(() => loadVendorPromoAds());
  const [discounts, setDiscounts] = useState<DiscountRow[]>(initialDiscounts);
  const [previewAd, setPreviewAd] = useState<VendorPromoAd | null>(null);
  const [previewDiscount, setPreviewDiscount] = useState<DiscountRow | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newPercentOff, setNewPercentOff] = useState('');
  const [newStartAt, setNewStartAt] = useState('');
  const [newEndAt, setNewEndAt] = useState('');
  const [newProductsToOffer, setNewProductsToOffer] = useState('');
  const [newLimitUsers, setNewLimitUsers] = useState('');
  const [newRateEnabled, setNewRateEnabled] = useState(false);

  useEffect(() => {
    saveVendorPromoAds(ads);
  }, [ads]);

  const filteredAds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ads;
    return ads.filter(
      (a) => a.headline.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [ads, search]);

  const openEdit = useCallback(
    (ad: VendorPromoAd) => {
      navigate(`/vendor/promotions/offer?adId=${encodeURIComponent(ad.id)}`);
    },
    [navigate]
  );

  const resetDiscountModal = () => {
    setEditingDiscountId(null);
    setNewCode('');
    setNewName('');
    setNewPercentOff('');
    setNewStartAt('');
    setNewEndAt('');
    setNewProductsToOffer('');
    setNewLimitUsers('');
    setNewRateEnabled(false);
  };

  const openAddDiscount = () => {
    resetDiscountModal();
    setDiscountModalOpen(true);
  };

  const openEditDiscount = (d: DiscountRow) => {
    setEditingDiscountId(d.id);
    setNewCode(d.code);
    setNewName(d.name);
    setNewPercentOff(String(d.percentOff));
    setNewStartAt(d.startAt);
    setNewEndAt(d.endAt);
    setNewProductsToOffer(d.productsToOffer);
    setNewLimitUsers(String(d.limitUsers));
    setNewRateEnabled(d.rateEnabled);
    setDiscountModalOpen(true);
  };

  const addDiscount = () => {
    const code = newCode.trim().toUpperCase();
    const name = newName.trim();
    const pct = Number(newPercentOff);
    const startAt = newStartAt.trim();
    const endAt = newEndAt.trim();
    const productsToOffer = newProductsToOffer.trim() || 'All';
    const limitUsers = Number(newLimitUsers);

    if (
      !code ||
      !name ||
      Number.isNaN(pct) ||
      pct <= 0 ||
      !startAt ||
      !endAt ||
      Number.isNaN(limitUsers) ||
      limitUsers <= 0
    )
      return;

    const row: DiscountRow = {
      id: editingDiscountId ?? `d-${Date.now()}`,
      code,
      name,
      percentOff: pct,
      startAt,
      endAt,
      productsToOffer,
      limitUsers,
      rateEnabled: newRateEnabled,
    };

    setDiscounts((prev) => {
      const idx = prev.findIndex((x) => x.id === row.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = row;
        return next;
      }
      return [row, ...prev];
    });

    setDiscountModalOpen(false);
    resetDiscountModal();
  };

  return (
    <>
      <VendorAppShell
        activeNav="promotion"
        routeSource="vendor-promotions"
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
        headerEnd={
          <>
            <button
              type="button"
              onClick={() => setUiNotice('Help docs will be available in a future release.')}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Open communication and notifications"
              onClick={() =>
                navigate('/vendor/communication', {
                  state: { source: 'vendor-promotions-header', channel: 'notifications' },
                })
              }
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
                12
              </span>
            </button>
            <VendorTopRightMenu />
          </>
        }
      >
        <main className="min-h-full w-full bg-transparent">
          <div className="p-4 sm:p-6">
            {uiNotice ? (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {uiNotice}
              </p>
            ) : null}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMainTab('ads')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  mainTab === 'ads'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <Megaphone className="h-4 w-4" />
                Ads
              </button>
              <button
                type="button"
                onClick={() => setMainTab('discount')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  mainTab === 'discount'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <Percent className="h-4 w-4" />
                Discount
              </button>
            </div>

            {mainTab === 'ads' && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">Active ad&apos;s</h1>
                    <p className="text-sm text-slate-500">Total {formatTotal(filteredAds.length)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/promotions/ad-campaign')}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add new ad
                  </button>
                </div>

                {filteredAds.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                    <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No active ads yet</p>
                    <p className="mt-1 text-sm text-slate-500">Create your first ad to reach more customers.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/vendor/promotions/ad-campaign')}
                      className="mt-4 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      + Add new ad
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {filteredAds.map((ad) => (
                      <li
                        key={ad.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                      >
                        <img
                          src={ad.imageDataUrl || imgMeetingThumb}
                          alt=""
                          className="h-20 w-28 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-slate-900">{ad.headline}</h2>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                ad.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {ad.status}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{ad.description}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-6 sm:gap-8">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Impressions</p>
                            <p className="text-sm font-semibold text-slate-800">{ad.impressions}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Clicks</p>
                            <p className="text-sm font-semibold text-slate-800">{ad.clicks}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Contacts</p>
                            <p className="text-sm font-semibold text-slate-800">{ad.contacts}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => setPreviewAd(ad)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(ad)}
                            className="text-sm font-medium text-[#2563EB] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {mainTab === 'discount' && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">Discount</h1>
                    <p className="text-sm text-slate-500">Discount Total {formatTotal(discounts.length)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddDiscount}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add discount
                  </button>
                </div>

                {discounts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                    <Percent className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-600">No discount codes yet.</p>
                    <button
                      type="button"
                      onClick={openAddDiscount}
                      className="mt-4 text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      Add your first discount
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="grid grid-cols-10 items-center bg-white px-4 py-2 text-xs font-medium text-slate-400">
                      <div>coupon code</div>
                      <div className="truncate">coupon name</div>
                      <div>discount</div>
                      <div className="truncate">start date</div>
                      <div className="truncate">end date</div>
                      <div className="truncate">products to offer</div>
                      <div>limit users</div>
                      <div>rate</div>
                      <div>view</div>
                      <div className="text-right">edit</div>
                    </div>

                    {discounts.map((d) => (
                      <div
                        key={d.id}
                        className="grid grid-cols-10 items-center gap-2 px-4 py-3 text-sm text-slate-700"
                      >
                        <div className="min-w-0 truncate font-mono font-semibold text-slate-900">{d.code}</div>
                        <div className="min-w-0 truncate font-medium text-slate-900">{d.name}</div>
                        <div className="font-medium text-slate-900">{d.percentOff}%</div>
                        <div className="min-w-0 truncate text-slate-500">{d.startAt}</div>
                        <div className="min-w-0 truncate text-slate-500">{d.endAt}</div>
                        <div className="min-w-0 truncate text-slate-500">{d.productsToOffer}</div>
                        <div className="text-slate-600">{d.limitUsers}</div>

                        <div className="flex items-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={d.rateEnabled}
                            onClick={() =>
                              setDiscounts((prev) =>
                                prev.map((x) => (x.id === d.id ? { ...x, rateEnabled: !x.rateEnabled } : x))
                              )
                            }
                            className={`relative h-5 w-10 rounded-full transition ${
                              d.rateEnabled ? 'bg-emerald-500/90' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                d.rateEnabled ? 'left-5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewDiscount(d)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => openEditDiscount(d)}
                            className="text-sm font-medium text-[#2563EB] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </VendorAppShell>

      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Ad preview</h3>
              <button
                type="button"
                onClick={() => setPreviewAd(null)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={previewAd.imageDataUrl || imgMeetingThumb}
              alt=""
              className="mb-4 h-40 w-full rounded-lg object-cover"
            />
            <p className="font-semibold text-slate-900">{previewAd.headline}</p>
            <p className="mt-2 text-sm text-slate-600">{previewAd.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-md bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Impressions</p>
                <p className="font-semibold">{previewAd.impressions}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Clicks</p>
                <p className="font-semibold">{previewAd.clicks}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Contacts</p>
                <p className="font-semibold">{previewAd.contacts}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPreviewAd(null)}
              className="mt-6 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {previewDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Discount preview</h3>
              <button
                type="button"
                onClick={() => setPreviewDiscount(null)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-mono text-sm font-semibold text-slate-900">{previewDiscount.code}</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{previewDiscount.name}</p>
              <p className="mt-2 text-sm text-slate-600">{previewDiscount.percentOff}% off</p>
              <p className="mt-1 text-sm text-slate-600">
                {previewDiscount.startAt} → {previewDiscount.endAt}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Products to offer</p>
                  <p className="font-medium text-slate-800">{previewDiscount.productsToOffer}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Limit users</p>
                  <p className="font-medium text-slate-800">{previewDiscount.limitUsers}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex h-2 w-2 rounded-full ${previewDiscount.rateEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <p className="text-sm text-slate-600">
                  Rate: {previewDiscount.rateEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewDiscount(null)}
              className="mt-6 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {discountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingDiscountId ? 'Edit discount' : 'Add discount'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setDiscountModalOpen(false);
                  resetDiscountModal();
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-sm font-medium text-slate-700">Coupon code</label>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="SUMMER25"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Coupon name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="SUMMER SALE"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Percent off</label>
            <input
              type="number"
              min={1}
              max={100}
              value={newPercentOff}
              onChange={(e) => setNewPercentOff(e.target.value)}
              placeholder="15"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Start date</label>
            <input
              value={newStartAt}
              onChange={(e) => setNewStartAt(e.target.value)}
              placeholder="Jun 21, 2024 18:10:32"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">End date</label>
            <input
              value={newEndAt}
              onChange={(e) => setNewEndAt(e.target.value)}
              placeholder="Jun 24, 2024 18:10:32"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Products to offer</label>
            <input
              value={newProductsToOffer}
              onChange={(e) => setNewProductsToOffer(e.target.value)}
              placeholder="All"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Limit users</label>
            <input
              type="number"
              min={1}
              value={newLimitUsers}
              onChange={(e) => setNewLimitUsers(e.target.value)}
              placeholder="100"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">Rate</p>
                <p className="text-xs text-slate-500">Enable the rate toggle for this discount</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={newRateEnabled}
                onClick={() => setNewRateEnabled((v) => !v)}
                className={`relative h-5 w-10 rounded-full transition ${
                  newRateEnabled ? 'bg-emerald-500/90' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    newRateEnabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDiscountModalOpen(false);
                  resetDiscountModal();
                }}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addDiscount}
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

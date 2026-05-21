import { useMemo, useState } from 'react';
import { ChevronLeft, Eye, ListFilter, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import {
  upsertCorporateAdminPromotion,
  type CorporateAdminPromotion,
} from '@/app/lib/corporateAdminPromotionsStorage';

type PromoTab = 'ads' | 'discount' | 'banner';

type AdRow = {
  id: string;
  promoId: string;
  headline: string;
  module: 'SpaceX' | 'Event' | 'Gifting';
  budget: string;
  paidBy: string;
  period: string;
  status: boolean;
};

type DiscountRow = {
  id: string;
  coupon: string;
  couponName: string;
  discount: string;
  startDate: string;
  endDate: string;
  clientName: string;
  sector: 'Gifting' | 'Event';
  status: boolean;
};

type BannerRow = {
  id: string;
  image: string;
  subCategory: string;
  type: string;
  dateLabel: string;
  dateValue: string;
  vendorName: string;
  sector: 'SpaceX' | 'Gifting' | 'Events';
  status: boolean;
};

// DEMO DATA — swap for Supabase query when real data exists
const DEMO_DATA_ADS: AdRow[] = [
  {
    id: 'ad-1',
    promoId: '0102',
    headline: 'Featured: Executive Boardroom BKC',
    module: 'SpaceX',
    budget: '₹12,500',
    paidBy: 'Smartworks Mumbai',
    period: 'Start: 10 May 2026 09:00\nEnd: 24 May 2026 23:59',
    status: true,
  },
  {
    id: 'ad-2',
    promoId: '0103',
    headline: 'Townhall AV Production Kit — 20% off',
    module: 'Event',
    budget: '₹8,000',
    paidBy: 'PrismWave Technologies',
    period: 'Start: 12 May 2026 00:00\nEnd: 31 May 2026 23:59',
    status: true,
  },
  {
    id: 'ad-3',
    promoId: '0104',
    headline: 'Diwali Premium Gift Hampers',
    module: 'Gifting',
    budget: '₹18,000',
    paidBy: 'GiftBasket Co.',
    period: 'Start: 15 May 2026 00:00\nEnd: 30 Jun 2026 23:59',
    status: false,
  },
];
const AD_ROWS = DEMO_DATA_ADS;

// DEMO DATA — swap for Supabase query when real data exists
const DEMO_DATA_DISCOUNTS: DiscountRow[] = [
  {
    id: 'd-1',
    coupon: 'DIWALI25',
    couponName: 'Diwali Hamper Sale',
    discount: '25%',
    startDate: '15 May 2026 00:00',
    endDate: '30 Jun 2026 23:59',
    clientName: 'Acme Corp',
    sector: 'Gifting',
    status: true,
  },
  {
    id: 'd-2',
    coupon: 'TEAMOFFSITE15',
    couponName: 'Q2 Team Offsite',
    discount: '15%',
    startDate: '12 May 2026 00:00',
    endDate: '15 Jun 2026 23:59',
    clientName: 'Tata Digital',
    sector: 'Event',
    status: true,
  },
  {
    id: 'd-3',
    coupon: 'WELCOMEKIT40',
    couponName: 'New Hire Welcome Kits',
    discount: '40%',
    startDate: '01 May 2026 00:00',
    endDate: '31 May 2026 23:59',
    clientName: 'Razorpay',
    sector: 'Gifting',
    status: false,
  },
];
const DISCOUNT_ROWS = DEMO_DATA_DISCOUNTS;

// DEMO DATA — swap for Supabase query when real data exists
const DEMO_DATA_BANNERS: BannerRow[] = [
  {
    id: 'b-1',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&h=80&fit=crop&q=80',
    subCategory: 'Conference Rooms',
    type: 'Hero banner',
    dateLabel: 'Live until',
    dateValue: '31 May 2026',
    vendorName: 'Smartworks Mumbai',
    sector: 'SpaceX',
    status: true,
  },
  {
    id: 'b-2',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=120&h=80&fit=crop&q=80',
    subCategory: 'Festival Gifting',
    type: 'Sidebar banner',
    dateLabel: 'Live until',
    dateValue: '30 Jun 2026',
    vendorName: 'GiftBasket Co.',
    sector: 'Gifting',
    status: true,
  },
];
const BANNER_ROWS = DEMO_DATA_BANNERS;

function moduleClass(module: AdRow['module']) {
  if (module === 'SpaceX') return 'bg-orange-50 text-orange-600 border-orange-200';
  if (module === 'Event') return 'bg-rose-50 text-rose-600 border-rose-200';
  return 'bg-emerald-50 text-emerald-600 border-emerald-200';
}

export default function AdminPaidPromotionsPage() {
  const [tab, setTab] = useState<PromoTab>('ads');
  const [query, setQuery] = useState('');
  const [ads, setAds] = useState<AdRow[]>(AD_ROWS);
  const [discounts, setDiscounts] = useState<DiscountRow[]>(DISCOUNT_ROWS);
  const [banners, setBanners] = useState<BannerRow[]>(BANNER_ROWS);
  const [bannerCategory, setBannerCategory] = useState<'Dashboard' | 'Gifting' | 'Events' | 'SpaceX'>('SpaceX');
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [bannerFormMode, setBannerFormMode] = useState<'create' | 'edit'>('create');
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerSector, setBannerSector] = useState('SpaceX');
  const [bannerSubCategory, setBannerSubCategory] = useState('Meetings space');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerButtonText, setBannerButtonText] = useState('View Offers');
  const [bannerVendor, setBannerVendor] = useState('');
  const [bannerType, setBannerType] = useState('Offer');
  const [bannerStatus, setBannerStatus] = useState(true);
  const [bannerImage, setBannerImage] = useState('');
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [couponType, setCouponType] = useState<'price' | 'percent'>('percent');
  const [couponCode, setCouponCode] = useState('SUMMERSALE40');
  const [couponName, setCouponName] = useState('SUMMER SALE');
  const [discountValue, setDiscountValue] = useState('50%');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [noEndDate, setNoEndDate] = useState(false);
  const [limitUses, setLimitUses] = useState(false);
  const [productScope, setProductScope] = useState<'categories' | 'all'>('categories');
  const [uiNotice, setUiNotice] = useState('');

  const filteredAds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ads;
    return ads.filter((r) => r.headline.toLowerCase().includes(q) || r.paidBy.toLowerCase().includes(q) || r.module.toLowerCase().includes(q));
  }, [ads, query]);

  const filteredDiscounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return discounts;
    return discounts.filter((r) => r.coupon.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q) || r.sector.toLowerCase().includes(q));
  }, [discounts, query]);

  const toggleAdStatus = (id: string) => setAds((prev) => prev.map((row) => (row.id === id ? { ...row, status: !row.status } : row)));
  const toggleDiscountStatus = (id: string) => setDiscounts((prev) => prev.map((row) => (row.id === id ? { ...row, status: !row.status } : row)));
  const toggleBannerStatus = (id: string) => setBanners((prev) => prev.map((row) => (row.id === id ? { ...row, status: !row.status } : row)));

  const openCreateBanner = () => {
    setBannerFormMode('create');
    setEditingBannerId(null);
    setBannerSector('SpaceX');
    setBannerSubCategory('Meetings space');
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerButtonText('View Offers');
    setBannerVendor('');
    setBannerType('Offer');
    setBannerStatus(true);
    setBannerImage('');
    setBannerFormOpen(true);
  };

  const openEditBanner = (row: BannerRow) => {
    setBannerFormMode('edit');
    setEditingBannerId(row.id);
    setBannerSector(row.sector);
    setBannerSubCategory(row.subCategory);
    setBannerTitle(`Special offer on ${row.subCategory}`);
    setBannerSubtitle('Book your next event with us and choose from a variety of tailored event packages, that ...');
    setBannerButtonText('View Offers');
    setBannerVendor(row.vendorName);
    setBannerType(row.type);
    setBannerStatus(row.status);
    setBannerImage(row.image);
    setBannerFormOpen(true);
  };

  const saveBanner = () => {
    const payload: BannerRow = {
      id: editingBannerId ?? `b-${Date.now()}`,
      image:
        bannerImage ||
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=120&h=80&fit=crop',
      subCategory: bannerSubCategory || 'Meetings space',
      type: bannerType || 'Offer',
      dateLabel: bannerFormMode === 'create' ? 'Create on' : 'End date',
      dateValue: 'Jun 24, 2024 18:10:32',
      vendorName: bannerVendor || 'Kapil Dev',
      sector: (bannerSector as BannerRow['sector']) || 'SpaceX',
      status: bannerStatus,
    };

    setBanners((prev) =>
      bannerFormMode === 'edit'
        ? prev.map((b) => (b.id === editingBannerId ? payload : b))
        : [payload, ...prev]
    );
    if (bannerStatus) {
      const sector: CorporateAdminPromotion['sector'] =
        bannerSector === 'Gifting' ? 'Gifting' : bannerSector === 'Events' ? 'Events' : 'SpaceX';
      const promo: CorporateAdminPromotion = {
        id: payload.id,
        sector,
        title: bannerTitle.trim() || `Offer · ${bannerSubCategory}`,
        subtitle: bannerSubtitle.trim() || 'Limited-time partner promotion curated by Mogzu.',
        image: payload.image,
        vendorName: payload.vendorName,
        subCategory: payload.subCategory,
        createdAt: Date.now(),
        active: true,
      };
      upsertCorporateAdminPromotion(promo);
    }
    setBannerFormOpen(false);
  };

  const StatusToggle = ({
    checked,
    onToggle,
  }: {
    checked: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-6 min-w-[54px] items-center rounded-full px-1 transition ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
      aria-label={checked ? 'Deactivate' : 'Activate'}
    >
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-slate-700 transition ${
          checked ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
      <span className={`ml-1 text-[9px] font-semibold ${checked ? 'text-white' : 'text-slate-600'}`}>
        {checked ? 'ON' : 'OFF'}
      </span>
    </button>
  );

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Paid Promotion" totalLabel={`${tab === 'ads' ? filteredAds.length : filteredDiscounts.length} total`} />

      <div className="rounded-2xl border border-slate-200 bg-[#ECEFF6] p-4">
        {showDiscountForm ? (
          <div className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={() => setShowDiscountForm(false)}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              <ChevronLeft className="size-4" />
              Special discount on products
            </button>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Select the type of coupon you want to offer</p>
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCouponType('price')}
                  className={`rounded border px-4 py-2 text-xs ${
                    couponType === 'price' ? 'border-[#2563EB] bg-[#EEF4FF] text-[#1D4ED8]' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ₹ Price Discount
                </button>
                <button
                  type="button"
                  onClick={() => setCouponType('percent')}
                  className={`rounded border px-4 py-2 text-xs ${
                    couponType === 'percent' ? 'border-[#2563EB] bg-[#EEF4FF] text-[#1D4ED8]' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  % Percentage Discount
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="md:col-span-2 text-xs text-slate-600">
                  Coupon code
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="md:col-span-2 text-xs text-slate-600">
                  Coupon Name
                  <input value={couponName} onChange={(e) => setCouponName(e.target.value)} className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="md:col-span-2 text-xs text-slate-600">
                  Discount amount
                  <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-xs text-slate-600">
                  Start date
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-xs text-slate-600">
                  End date
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={noEndDate} className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm disabled:bg-slate-100" />
                  <span className="mt-1 inline-flex items-center gap-2 text-[11px] text-slate-500">
                    <input type="checkbox" checked={noEndDate} onChange={(e) => setNoEndDate(e.target.checked)} />
                    Do not set end date
                  </span>
                </label>
                <div className="md:col-span-2 text-xs text-slate-600">
                  Select products for offer
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" checked={productScope === 'categories'} onChange={() => setProductScope('categories')} />
                      Select product/category
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" checked={productScope === 'all'} onChange={() => setProductScope('all')} />
                      Offer on all product available
                    </label>
                  </div>
                </div>
                <label className="md:col-span-2 inline-flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={limitUses} onChange={(e) => setLimitUses(e.target.checked)} />
                  Limit the total number of users for this coupon
                </label>
                <label className="md:col-span-2 text-xs text-slate-600">
                  Terms and conditions
                  <div className="mt-1 rounded border border-dashed border-slate-300 p-4 text-center text-[11px] text-slate-400">
                    Click to add file or drag and drop file here
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <button type="button" onClick={() => setShowDiscountForm(false)} className="rounded-full border border-slate-300 px-8 py-2 text-sm text-slate-600 hover:bg-slate-100">
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscountForm(false);
                  setUiNotice('Discount draft saved for review (demo).');
                }}
                className="rounded-full bg-[#2563EB] px-10 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setTab('ads')} className={`rounded-full border px-4 py-1.5 text-sm ${tab === 'ads' ? 'border-[#2563EB] bg-[#EEF4FF] text-[#1D4ED8]' : 'border-slate-300 bg-white text-slate-600'}`}>Ads</button>
          <button type="button" onClick={() => setTab('discount')} className={`rounded-full border px-4 py-1.5 text-sm ${tab === 'discount' ? 'border-[#2563EB] bg-[#EEF4FF] text-[#1D4ED8]' : 'border-slate-300 bg-white text-slate-600'}`}>Discount</button>
          <button type="button" onClick={() => setTab('banner')} className={`rounded-full border px-4 py-1.5 text-sm ${tab === 'banner' ? 'border-[#2563EB] bg-[#EEF4FF] text-[#1D4ED8]' : 'border-slate-300 bg-white text-slate-600'}`}>Promotional banners</button>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-slate-900">{tab === 'ads' ? 'All ad’s' : tab === 'discount' ? 'Discount' : 'Promotional banners'}</h3>
            <p className="text-xs text-slate-500">Total {tab === 'ads' ? filteredAds.length.toString().padStart(2, '0') : filteredDiscounts.length.toString().padStart(2, '0')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUiNotice('Advanced filters will be available in a future release.')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              <SlidersHorizontal className="size-4" />
              Filter
            </button>
            <button
              type="button"
              onClick={() => setUiNotice('Sorting controls will be available in a future release.')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              <ListFilter className="size-4" />
              Sort by
            </button>
            <button
              type="button"
              onClick={() => {
                if (tab === 'discount') setShowDiscountForm(true);
                if (tab === 'banner') openCreateBanner();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <Plus className="size-4" />
              {tab === 'ads' ? 'Add new ad' : tab === 'discount' ? 'Add discount' : 'Create banner'}
            </button>
          </div>
        </div>
        {uiNotice && (
          <p className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            {uiNotice}
          </p>
        )}

        <div className="mb-4 max-w-sm">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
        </div>

        {tab === 'ads' && filteredAds.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No paid ad promotions yet.</p>
        )}
        {tab === 'ads' && filteredAds.length > 0 && (
          <div className="space-y-2">
            {filteredAds.map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-2 rounded-md bg-white px-3 py-2 text-xs text-slate-600">
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Promotion ID</p>
                  <p className="font-semibold">{row.promoId}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-[10px] text-slate-400">Headline</p>
                  <p className="text-sm font-medium text-slate-800">{row.headline}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Module</p>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${moduleClass(row.module)}`}>{row.module}</span>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Price</p>
                  <p className="text-sm font-medium text-slate-700">{row.budget}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400">Paid by</p>
                  <p className="text-sm">{row.paidBy}</p>
                </div>
                <div className="col-span-2 whitespace-pre-line">
                  <p className="text-[10px] text-slate-400">Period</p>
                  <p>{row.period}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Status</p>
                  <StatusToggle checked={row.status} onToggle={() => toggleAdStatus(row.id)} />
                </div>
                <div className="col-span-1 flex items-center justify-end gap-3">
                  <Eye className="size-4 text-slate-400" />
                  <Trash2 className="size-4 text-slate-400" />
                  <button type="button" onClick={() => setUiNotice(`Ad edit flow for ${row.promoId} will be available in a future release.`)} className="text-[#2563EB] hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'discount' && filteredDiscounts.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No discount coupons yet.</p>
        )}
        {tab === 'discount' && filteredDiscounts.length > 0 && (
          <div className="space-y-2">
            {filteredDiscounts.map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-2 rounded-md bg-white px-3 py-2 text-xs text-slate-600">
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400">Coupon code</p>
                  <p className="font-semibold">{row.coupon}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400">Coupon Name</p>
                  <p className="text-sm font-medium text-slate-800">{row.couponName}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Discount</p>
                  <p>{row.discount}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400">Start date</p>
                  <p>{row.startDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400">End date</p>
                  <p>{row.endDate}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Client name</p>
                  <p>{row.clientName}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-400">Sector</p>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">{row.sector}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <StatusToggle checked={row.status} onToggle={() => toggleDiscountStatus(row.id)} />
                  <Eye className="size-4 text-slate-400" />
                  <Trash2 className="size-4 text-slate-400" />
                  <button type="button" onClick={() => setUiNotice(`Discount edit flow for ${row.coupon} will be available in a future release.`)} className="text-[#2563EB] hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'banner' && (
          <div>
            <div className="mb-4 flex items-center border-b border-slate-200 text-xs text-slate-500">
              {(['Dashboard', 'Gifting', 'Events', 'SpaceX'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBannerCategory(item)}
                  className={`-mb-px border-b-2 px-4 py-2 ${
                    bannerCategory === item
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {banners.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No banners yet.</p>
            )}
            <div className="space-y-2">
              {banners.map((row) => (
                <div key={row.id} className="grid grid-cols-12 items-center gap-2 rounded-md bg-white px-3 py-2 text-xs text-slate-600">
                  <div className="col-span-2 flex items-center gap-3">
                    <img src={row.image} alt="" className="h-8 w-14 rounded border border-slate-200 object-cover" />
                    <div>
                      <p className="text-[10px] text-slate-400">Sub-category</p>
                      <p className="text-sm text-slate-800">{row.subCategory}</p>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <p className="text-[10px] text-slate-400">Type</p>
                    <p className="text-sm">{row.type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400">{row.dateLabel}</p>
                    <p>{row.dateValue}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400">Vendor Name</p>
                    <p className="text-sm">{row.vendorName}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-[10px] text-slate-400">Sector</p>
                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">{row.sector}</span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400">Status</p>
                    <StatusToggle checked={row.status} onToggle={() => toggleBannerStatus(row.id)} />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <Eye className="size-4 text-slate-400" />
                    <Trash2 className="size-4 text-slate-400" />
                    <button type="button" onClick={() => openEditBanner(row)} className="text-[#2563EB] hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {bannerFormOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="text-2xl font-medium text-slate-700">
                {bannerFormMode === 'create' ? 'Create Promotional Banner' : 'Edit Promotional Banner'}
              </h3>
              <button type="button" onClick={() => setBannerFormOpen(false)} className="text-xl text-slate-500 hover:text-slate-700">
                ×
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-700">
                  Category/Sector
                  <select value={bannerSector} onChange={(e) => setBannerSector(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm">
                    <option value="SpaceX">D Space</option>
                    <option>Gifting</option>
                    <option>Events</option>
                  </select>
                </label>
                <label className="text-xs text-slate-700">
                  Sub-category
                  <select value={bannerSubCategory} onChange={(e) => setBannerSubCategory(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm">
                    <option>Meetings space</option>
                    <option>Activity space</option>
                  </select>
                </label>
              </div>

              <div className="mt-4">
                <p className="mb-1 text-xs text-slate-700">Banner Image</p>
                <div className="rounded border border-dashed border-slate-300 p-3">
                  {bannerImage ? (
                    <div className="relative h-20 overflow-hidden rounded border border-slate-200">
                      <img src={bannerImage} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setBannerImage('')} className="absolute right-1 top-1 rounded bg-black/60 px-1 text-xs text-white">×</button>
                    </div>
                  ) : (
                    <div className="flex h-14 items-center justify-center text-xs text-slate-400">
                      Click to add image or drag and drop file here
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs text-slate-700">
                  Banner Title
                  <input value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Shekar Nair" className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="block text-xs text-slate-700">
                  Subtitle
                  <input value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} placeholder="Add subtitle" className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="block text-xs text-slate-700">
                  Button text
                  <input value={bannerButtonText} onChange={(e) => setBannerButtonText(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" />
                </label>
                <label className="block text-xs text-slate-700">
                  Banner By (vendor name)
                  <select value={bannerVendor} onChange={(e) => setBannerVendor(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm">
                    <option value="">Select name</option>
                    <option>Kapil Dev</option>
                    <option>Shekar Nair</option>
                  </select>
                </label>
                <label className="block text-xs text-slate-700">
                  Banner Type
                  <select value={bannerType} onChange={(e) => setBannerType(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm">
                    <option>Offer</option>
                    <option>Campaign</option>
                  </select>
                </label>

                <div>
                  <p className="mb-1 text-xs text-slate-700">Status</p>
                  <StatusToggle checked={bannerStatus} onToggle={() => setBannerStatus((v) => !v)} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button type="button" onClick={() => setBannerFormOpen(false)} className="rounded-full border border-slate-400 px-8 py-2 text-sm text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" onClick={saveBanner} className="rounded-full bg-[#2563EB] px-8 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
                {bannerFormMode === 'create' ? 'Create banner' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

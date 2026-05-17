import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type {
  MogzuDirectListing,
  MogzuListingModule,
  MogzuPricingMode,
} from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectCatalogueForAdmin,
  refreshMogzuDirectCatalogueAsync,
  saveMogzuDirectCatalogueForAdmin,
} from '@/utils/mogzuDirectCatalogueAdmin';
import PricingTypeSelector, { type PricingTypeSelectorValue } from '@/app/components/ui/PricingTypeSelector';

const MODULES: { value: MogzuListingModule; label: string }[] = [
  { value: 'dspace', label: 'DSpace' },
  { value: 'gifting', label: 'Gifting' },
  { value: 'events', label: 'Events' },
];

const PRICING: { value: MogzuPricingMode; label: string }[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'on_request', label: 'On request' },
];

const STATUSES: { value: MogzuDirectListing['status']; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
];

const PAYMENT_PRESETS = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'net_banking', label: 'Net banking' },
  { id: 'neft_rtgs', label: 'NEFT / RTGS' },
  { id: 'gateway', label: 'Payment gateway' },
] as const;

function parseImages(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MogzuDirectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [module, setModule] = useState<MogzuListingModule>('gifting');
  const [category, setCategory] = useState('');
  const [descriptionShort, setDescriptionShort] = useState('');
  const [descriptionLong, setDescriptionLong] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [videosText, setVideosText] = useState('');
  const [pricingMode, setPricingMode] = useState<MogzuPricingMode>('fixed');
  const [price, setPrice] = useState('0');
  const [priceUnit, setPriceUnit] = useState('unit');
  const [status, setStatus] = useState<MogzuDirectListing['status']>('draft');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [portfolioLinksText, setPortfolioLinksText] = useState('');
  const [portfolioCaptionsText, setPortfolioCaptionsText] = useState('');
  const [policiesText, setPoliciesText] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [paymentPresetOn, setPaymentPresetOn] = useState<Record<string, boolean>>({});
  const [paymentCustomText, setPaymentCustomText] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);
  const [pricingSetup, setPricingSetup] = useState<PricingTypeSelectorValue>({
    pricing_type: 'transparent',
    price_type: 'flat',
    base_price: 0,
  });

  useEffect(() => {
    if (!isEdit || !id) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    void refreshMogzuDirectCatalogueAsync().then((fresh) => {
      if (cancelled) return;
      const row = fresh.find((r) => r.id === id) ?? loadMogzuDirectCatalogueForAdmin().find((r) => r.id === id);
      hydrate(row);
    });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const hydrate = (row: MogzuDirectListing | undefined) => {
    if (!row) {
      setError('Listing not found.');
      setLoaded(true);
      return;
    }
    setTitle(row.title);
    setModule(row.module);
    setCategory(row.category);
    setDescriptionShort(row.description_short);
    setDescriptionLong(row.description_long);
    setImagesText(row.images.join('\n'));
    setVideosText((row as { videos?: string[] }).videos?.join('\n') ?? '');
    setPricingMode(row.pricing_mode);
    setPrice(String(row.price));
    setPriceUnit(row.price_unit);
    setPricingSetup(
      row.pricing_mode === 'on_request'
        ? { pricing_type: 'request_for_price', response_time_hours: row.response_time_hours ?? 24 }
        : row.pricing_mode === 'negotiable'
          ? {
              pricing_type: 'offer_price',
              price_type: row.price_type ?? 'flat',
              starting_price: row.starting_price ?? row.price,
              min_acceptable_offer: row.min_acceptable_offer ?? Math.max(0, Math.round(row.price * 0.85)),
              offer_validity_hours: row.offer_validity_hours ?? 48,
            }
          : {
              pricing_type: 'transparent',
              price_type: row.price_type ?? 'flat',
              base_price: row.base_price ?? row.price,
            },
    );
    setStatus(row.status);
    const bd = row.buyer_detail;
    setAmenitiesText(bd.amenities.join('\n'));
    setPortfolioLinksText(bd.portfolio_links.join('\n'));
    setPortfolioCaptionsText(bd.portfolio_captions.join('\n'));
    setPoliciesText(bd.policies.join('\n'));
    setPaymentTerms(bd.payment_terms);
    const presets: Record<string, boolean> = {};
    for (const p of PAYMENT_PRESETS) {
      presets[p.id] = bd.payment_methods.includes(p.id);
    }
    const extraMethods = bd.payment_methods.filter(
      (m) => !PAYMENT_PRESETS.some((p) => p.id === m),
    );
    setPaymentPresetOn(presets);
    setPaymentCustomText(extraMethods.join('\n'));
    setLoaded(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Enter a valid price.');
      return;
    }
    const now = new Date().toISOString();
    const images = parseImages(imagesText);
    const videos = parseLines(videosText);
    const paymentMethods = [
      ...PAYMENT_PRESETS.filter((p) => paymentPresetOn[p.id]).map((p) => p.id),
      ...parseLines(paymentCustomText),
    ];
    const buyer_detail = {
      amenities: parseLines(amenitiesText),
      portfolio_links: parseLines(portfolioLinksText),
      portfolio_captions: parseLines(portfolioCaptionsText),
      policies: parseLines(policiesText),
      payment_methods: paymentMethods,
      payment_terms: paymentTerms.trim(),
    };
    const list = loadMogzuDirectCatalogueForAdmin();

    const mappedPricingMode: MogzuPricingMode =
      pricingSetup.pricing_type === 'offer_price'
        ? 'negotiable'
        : pricingSetup.pricing_type === 'request_for_price'
          ? 'on_request'
          : 'fixed';
    const priceFromSetup =
      pricingSetup.pricing_type === 'offer_price'
        ? pricingSetup.starting_price ?? priceNum
        : pricingSetup.pricing_type === 'transparent'
          ? pricingSetup.base_price ?? priceNum
          : 0;

    if (isEdit && id) {
      const next = list.map((row) =>
        row.id === id
          ? {
              ...row,
              title: title.trim(),
              module,
              category: category.trim() || 'General',
              description_short: descriptionShort.trim(),
              description_long: descriptionLong.trim() || descriptionShort.trim(),
              images,
              videos,
              pricing_mode: mappedPricingMode,
              pricing_type: pricingSetup.pricing_type,
              price_type: pricingSetup.price_type,
              base_price: pricingSetup.base_price,
              starting_price: pricingSetup.starting_price,
              min_acceptable_offer: pricingSetup.min_acceptable_offer,
              offer_validity_hours: pricingSetup.offer_validity_hours,
              response_time_hours: pricingSetup.response_time_hours,
              price: priceFromSetup,
              price_unit: priceUnit.trim() || 'unit',
              status,
              buyer_detail,
              updated_at: now,
            }
          : row
      );
      saveMogzuDirectCatalogueForAdmin(next);
    } else {
      const newRow: MogzuDirectListing = {
        id: crypto.randomUUID(),
        owner_type: 'mogzu_direct',
        module,
        title: title.trim(),
        description_short: descriptionShort.trim(),
        description_long: descriptionLong.trim() || descriptionShort.trim(),
        images,
        videos,
        category: category.trim() || 'General',
        pricing_mode: mappedPricingMode,
        pricing_type: pricingSetup.pricing_type,
        price_type: pricingSetup.price_type,
        base_price: pricingSetup.base_price,
        starting_price: pricingSetup.starting_price,
        min_acceptable_offer: pricingSetup.min_acceptable_offer,
        offer_validity_hours: pricingSetup.offer_validity_hours,
        response_time_hours: pricingSetup.response_time_hours,
        price: priceFromSetup,
        price_unit: priceUnit.trim() || 'unit',
        status,
        managed_by: 'mogzu_team',
        buyer_detail,
        created_at: now,
        updated_at: now,
      };
      saveMogzuDirectCatalogueForAdmin([...list, newRow]);
    }
    navigate('/admin/mogzu-direct');
  };

  if (!loaded) {
    return (
      <div className="text-sm text-slate-500" style={{ color: CORP.slateText }}>
        Loading…
      </div>
    );
  }

  if (isEdit && error && !title) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <Link to="/admin/mogzu-direct" className="text-sm font-semibold text-blue-600 hover:underline">
          Back to Mogzu Direct
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/mogzu-direct')}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
      <AdminPageTitleRow
        title={isEdit ? 'Edit Mogzu Direct listing' : 'Add Mogzu Direct listing'}
        totalLabel=""
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-4 max-w-3xl"
      >
        {error ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <label className="block text-xs font-medium text-slate-600">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
            placeholder="Listing title"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-medium text-slate-600">
            Module
            <select
              value={module}
              onChange={(e) => setModule(e.target.value as MogzuListingModule)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              {MODULES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
              placeholder="e.g. Venue, Apparel"
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          Short description
          <textarea
            value={descriptionShort}
            onChange={(e) => setDescriptionShort(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm resize-y"
          />
        </label>

        <label className="block text-xs font-medium text-slate-600">
          Full description
          <textarea
            value={descriptionLong}
            onChange={(e) => setDescriptionLong(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm resize-y"
          />
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
          <p className="text-xs font-semibold text-slate-800">Buyer listing details</p>
          <p className="text-[11px] text-slate-500">
            Shown on the corporate listing page (amenities, portfolio, policies, payment). Hints:{' '}
            {module === 'dspace'
              ? 'Wi‑Fi, projector, parking, room layouts.'
              : module === 'events'
                ? 'Duration, group size, inclusions, safety / cancellation.'
                : 'MOQ, lead time, customisation, delivery.'}
          </p>
          <label className="block text-xs font-medium text-slate-600">
            Amenities (one per line)
            <textarea
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
              placeholder={'High-speed Wi-Fi\nProjector and screen'}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Portfolio links (URLs — case studies, PDFs, external galleries)
            <textarea
              value={portfolioLinksText}
              onChange={(e) => setPortfolioLinksText(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-xs resize-y"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Portfolio captions (optional — one per line, aligns with links above)
            <textarea
              value={portfolioCaptionsText}
              onChange={(e) => setPortfolioCaptionsText(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            T&amp;C / policies (one per line)
            <textarea
              value={policiesText}
              onChange={(e) => setPoliciesText(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
            />
          </label>
          <div>
            <span className="block text-xs font-medium text-slate-600 mb-2">Accepted payment methods</span>
            <div className="flex flex-wrap gap-3">
              {PAYMENT_PRESETS.map((p) => (
                <label key={p.id} className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(paymentPresetOn[p.id])}
                    onChange={(e) =>
                      setPaymentPresetOn((prev) => ({ ...prev, [p.id]: e.target.checked }))
                    }
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <label className="block text-xs font-medium text-slate-600 mt-2">
              Other methods (one per line)
              <textarea
                value={paymentCustomText}
                onChange={(e) => setPaymentCustomText(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
                placeholder="Net 30 corporate billing"
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-slate-600">
            Payment terms
            <textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
              placeholder="e.g. 100% advance to confirm booking"
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          Image URLs (one per line)
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm resize-y font-mono text-xs"
            placeholder="https://..."
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Video URLs (optional, one per line)
          <textarea
            value={videosText}
            onChange={(e) => setVideosText(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm resize-y font-mono text-xs"
            placeholder="https://..."
          />
        </label>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-600">Pricing setup</label>
          <PricingTypeSelector value={pricingSetup} onChange={setPricingSetup} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-medium text-slate-600">
            Price (legacy sync)
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={pricingSetup.pricing_type === 'request_for_price'}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm disabled:opacity-50"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Price unit
            <input
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
              placeholder="hour, unit, person…"
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MogzuDirectListing['status'])}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            style={{ backgroundColor: CORP.primary }}
          >
            {isEdit ? 'Save changes' : 'Create listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/mogzu-direct')}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

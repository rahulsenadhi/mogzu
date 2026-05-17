import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type { ListingAvailabilitySlot, MogzuDirectListing, MogzuListingModule, MogzuPricingMode } from '@/app/lib/mogzuDomain';
import {
  loadMogzuDirectCatalogueForAdmin,
  refreshMogzuDirectCatalogueAsync,
  saveMogzuDirectCatalogueForAdmin,
} from '@/utils/mogzuDirectCatalogueAdmin';
import PricingTypeSelector, { type PricingTypeSelectorValue } from '@/app/components/ui/PricingTypeSelector';
import { GhostCTAButton, SecondaryCTAButton } from '@/app/components/ui/ListingButtons';
import { loadAdminCategories } from '@/utils/adminCategoriesStorage';

const MODULES: { value: MogzuListingModule; label: string }[] = [
  { value: 'events', label: 'Events' },
  { value: 'gifting', label: 'Gifting' },
  { value: 'dspace', label: 'DSpace' },
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

function parseAvailability(text: string): ListingAvailabilitySlot[] {
  const out: ListingAvailabilitySlot[] = [];
  for (const line of text.split(/\r?\n/)) {
    const raw = line.trim();
    if (!raw) continue;
    const p = raw.split(/[|,]/).map((s) => s.trim());
    if (p.length >= 4) {
      out.push({
        date: p[0],
        start_time: p[1],
        end_time: p[2],
        slots_available: Number(p[3]) || 0,
      });
    }
  }
  return out;
}

const STEPS = [
  { id: 1, title: 'Identity', subtitle: 'Alias & category' },
  { id: 2, title: 'Details & Media', subtitle: 'Descriptions & assets' },
  { id: 3, title: 'Pricing', subtitle: 'Pricing model' },
  { id: 4, title: 'Availability', subtitle: 'Slots' },
  { id: 5, title: 'Review & Publish', subtitle: 'Preview & go live' },
] as const;

export default function MogzuDirectWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isNew = location.pathname.endsWith('/new');
  const isEdit = Boolean(id) && !isNew;

  const [step, setStep] = useState(1);
  const [alias, setAlias] = useState('');
  const [module, setModule] = useState<MogzuListingModule>('events');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [descriptionShort, setDescriptionShort] = useState('');
  const [descriptionLong, setDescriptionLong] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [videosText, setVideosText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [portfolioLinksText, setPortfolioLinksText] = useState('');
  const [portfolioCaptionsText, setPortfolioCaptionsText] = useState('');
  const [policiesText, setPoliciesText] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [paymentPresetOn, setPaymentPresetOn] = useState<Record<string, boolean>>({});
  const [paymentCustomText, setPaymentCustomText] = useState('');
  const [pricingSetup, setPricingSetup] = useState<PricingTypeSelectorValue>({
    pricing_type: 'transparent',
    price_type: 'flat',
    base_price: 0,
  });
  const [price, setPrice] = useState('0');
  const [priceUnit, setPriceUnit] = useState('unit');
  const [availabilityText, setAvailabilityText] = useState(
    `${new Date().toISOString().slice(0, 10)},09:00,18:00,4`,
  );
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);

  const categoryOptions = useMemo(() => {
    const rows = loadAdminCategories().filter((c) => c.active);
    return rows.map((c) => c.name);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) {
      setLoaded(true);
      return;
    }
    void refreshMogzuDirectCatalogueAsync();
    const list = loadMogzuDirectCatalogueForAdmin();
    const row = list.find((r) => r.id === id);
    if (!row) {
      setError('Listing not found.');
      setLoaded(true);
      return;
    }
    setAlias(row.mogzu_direct_alias ?? row.title);
    setTitle(row.title);
    setModule(row.module);
    setCategory(row.category);
    setDescriptionShort(row.description_short);
    setDescriptionLong(row.description_long);
    setImagesText(row.images.join('\n'));
    setVideosText(row.videos?.join('\n') ?? '');
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
    setPrice(String(row.price));
    setPriceUnit(row.price_unit);
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
    const extraMethods = bd.payment_methods.filter((m) => !PAYMENT_PRESETS.some((p) => p.id === m));
    setPaymentPresetOn(presets);
    setPaymentCustomText(extraMethods.join('\n'));
    setAvailabilityText(
      row.availability_slots?.length
        ? row.availability_slots.map((s) => `${s.date},${s.start_time},${s.end_time},${s.slots_available}`).join('\n')
        : availabilityText,
    );
    setLoaded(true);
  }, [id, isEdit]);

  const validateStep = (s: number): boolean => {
    setError('');
    if (s === 1) {
      if (!alias.trim()) {
        setError('Alias is required.');
        return false;
      }
      if (!category.trim()) {
        setError('Category is required.');
        return false;
      }
    }
    if (s === 2) {
      if (!descriptionShort.trim() || !descriptionLong.trim()) {
        setError('Short and full description are required.');
        return false;
      }
      if (parseImages(imagesText).length === 0) {
        setError('Add at least one image URL.');
        return false;
      }
    }
    return true;
  };

  const buildListing = (status: MogzuDirectListing['status']): MogzuDirectListing => {
    const images = parseImages(imagesText);
    const videos = parseLines(videosText);
    const priceNum = Number(price);
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
    const now = new Date().toISOString();
    const availability_slots = parseAvailability(availabilityText);
    const base: MogzuDirectListing = {
      id: isEdit && id ? id : crypto.randomUUID(),
      owner_type: 'mogzu_direct',
      module,
      title: title.trim() || alias.trim(),
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
      listing_source: 'mogzu_direct',
      mogzu_direct_alias: alias.trim(),
      vendor_id: null,
      vendor_verified: true,
      vendor_name: alias.trim(),
      availability_slots,
      created_at: now,
      updated_at: now,
    };
    return base;
  };

  const persist = (listing: MogzuDirectListing) => {
    const list = loadMogzuDirectCatalogueForAdmin();
    if (isEdit && id) {
      const next = list.map((row) =>
        row.id === id ? { ...listing, created_at: row.created_at, updated_at: new Date().toISOString() } : row,
      );
      saveMogzuDirectCatalogueForAdmin(next);
    } else {
      saveMogzuDirectCatalogueForAdmin([...list, { ...listing, created_at: new Date().toISOString() }]);
    }
  };

  const handlePublish = () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    const listing = buildListing('active');
    persist(listing);
    toast.success('Mogzu Direct listing published.');
    navigate('/admin/mogzu-direct');
  };

  const handleDraft = () => {
    const listing = buildListing('draft');
    persist(listing);
    toast.success('Draft saved.');
    navigate('/admin/mogzu-direct');
  };

  if (!loaded) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  if (isEdit && error && !title) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <Link to="/admin/mogzu-direct" className="text-sm font-semibold text-blue-600 hover:underline">
          Back
        </Link>
      </div>
    );
  }

  const previewImages = parseImages(imagesText);
  const cover = previewImages[0] ?? 'https://placehold.co/400x240?text=Preview';

  return (
    <div className="space-y-6 max-w-4xl">
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
      <AdminPageTitleRow title={isNew ? 'Create Mogzu Direct listing' : 'Edit Mogzu Direct listing'} totalLabel="" />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id < step && !validateStep(step)) return;
              setStep(s.id);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
              step === s.id ? 'border-[#2563EB] bg-blue-50 text-[#1D4ED8]' : 'border-slate-200 text-slate-600'
            }`}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        {step === 1 ? (
          <>
            <label className="block text-sm font-medium text-slate-700">
              Alias
              <input
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  setTitle((t) => t || e.target.value);
                }}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                placeholder="e.g. Mogzu Catering Co."
              />
            </label>
            <p className="text-xs text-slate-500">Shown to corporate clients as the vendor-facing name.</p>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type (from module)
              <input
                value={module === 'events' ? 'Activities / Services (Events)' : module}
                readOnly
                className="mt-1 h-10 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Module
              <select
                value={module}
                onChange={(e) => setModule(e.target.value as MogzuListingModule)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              >
                {MODULES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label className="block text-sm font-medium">Listing title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <label className="block text-sm font-medium">Short description</label>
            <textarea
              rows={2}
              value={descriptionShort}
              onChange={(e) => setDescriptionShort(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="block text-sm font-medium">Full description</label>
            <textarea
              rows={5}
              value={descriptionLong}
              onChange={(e) => setDescriptionLong(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="block text-sm font-medium">Image URLs (one per line)</label>
            <textarea
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
            />
            <label className="block text-sm font-medium">Video URLs (optional)</label>
            <textarea
              rows={2}
              value={videosText}
              onChange={(e) => setVideosText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
            />
            <p className="text-xs font-semibold text-slate-800">Buyer details</p>
            <textarea
              rows={2}
              placeholder="Amenities (one per line)"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              placeholder="Portfolio links"
              value={portfolioLinksText}
              onChange={(e) => setPortfolioLinksText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
            />
            <textarea
              rows={2}
              placeholder="Policies (one per line)"
              value={policiesText}
              onChange={(e) => setPoliciesText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              placeholder="Payment terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <PricingTypeSelector value={pricingSetup} onChange={setPricingSetup} />
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                Price (sync)
                <input
                  type="number"
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label className="text-sm">
                Price unit
                <input
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <label className="block text-sm font-medium mb-1">Availability slots (one per line)</label>
            <p className="text-xs text-slate-500 mb-2">Format: date,start,end,slots — e.g. 2026-04-10,09:00,18:00,4</p>
            <textarea
              rows={8}
              value={availabilityText}
              onChange={(e) => setAvailabilityText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
            />
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-2">How this looks to corporate users (grid)</p>
              <div className="w-[220px] rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="aspect-[16/10] bg-slate-100">
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">{title || alias || 'Title'}</p>
                  <p className="text-xs text-slate-600">{pricingSetup.pricing_type}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-2">How this looks to corporate users (detail)</p>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{title || alias}</h3>
                <p className="text-sm text-slate-600 line-clamp-4">{descriptionLong || descriptionShort}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePublish}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: CORP.primary }}
              >
                Publish Immediately
              </button>
              <GhostCTAButton onClick={handleDraft}>Save as Draft</GhostCTAButton>
            </div>
          </div>
        ) : null}

        {step < 5 ? (
          <div className="flex justify-between pt-4">
            <SecondaryCTAButton
              type="button"
              className="!h-10"
              disabled={step <= 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </SecondaryCTAButton>
            <SecondaryCTAButton
              type="button"
              className="!h-10"
              onClick={() => {
                if (!validateStep(step)) return;
                setStep((s) => Math.min(5, s + 1));
              }}
            >
              Next
            </SecondaryCTAButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

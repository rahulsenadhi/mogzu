import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type { MogzuListingModule, MogzuPricingMode, PartnerListing } from '@/app/lib/mogzuDomain';
import {
  loadPartnerListings,
  loadPartnerUsers,
  savePartnerListings,
} from '@/app/lib/mogzuDomain';

const MODULES: MogzuListingModule[] = ['dspace', 'gifting', 'events'];
const PRICING: MogzuPricingMode[] = ['fixed', 'negotiable', 'on_request'];
const STATUSES: PartnerListing['status'][] = ['draft', 'pending_review', 'active', 'paused'];

const PAYMENT_PRESETS = [
  { id: 'UPI', label: 'UPI' },
  { id: 'Bank transfer', label: 'Bank transfer' },
  { id: 'Credit card', label: 'Credit card' },
  { id: 'Corporate invoice', label: 'Corporate invoice' },
  { id: 'Cheque', label: 'Cheque' },
] as const;

function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminPartnerListingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [partnerId, setPartnerId] = useState('');
  const [title, setTitle] = useState('');
  const [module, setModule] = useState<MogzuListingModule>('gifting');
  const [category, setCategory] = useState('');
  const [descriptionShort, setDescriptionShort] = useState('');
  const [descriptionLong, setDescriptionLong] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [portfolioText, setPortfolioText] = useState('');
  const [videosText, setVideosText] = useState('');
  const [pricingMode, setPricingMode] = useState<MogzuPricingMode>('fixed');
  const [price, setPrice] = useState('0');
  const [priceUnit, setPriceUnit] = useState('unit');
  const [profitPct, setProfitPct] = useState('10');
  const [status, setStatus] = useState<PartnerListing['status']>('draft');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [portfolioCaptionsText, setPortfolioCaptionsText] = useState('');
  const [policiesText, setPoliciesText] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [paymentPresetOn, setPaymentPresetOn] = useState<Record<string, boolean>>({});
  const [paymentCustomText, setPaymentCustomText] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);

  const partners = loadPartnerUsers();

  useEffect(() => {
    if (!isEdit || !id) {
      if (partners[0]) setPartnerId(partners[0].id);
      setLoaded(true);
      return;
    }
    const list = loadPartnerListings();
    const row = list.find((r) => r.id === id);
    if (!row) {
      setError('Listing not found.');
      setLoaded(true);
      return;
    }
    setPartnerId(row.partner_id);
    setTitle(row.title);
    setModule(row.module);
    setCategory(row.category);
    setDescriptionShort(row.description_short);
    setDescriptionLong(row.description_long);
    setImagesText(row.images.join('\n'));
    setPortfolioText(row.portfolio_links.join('\n'));
    setVideosText(row.videos.join('\n'));
    setPricingMode(row.pricing_mode);
    setPrice(String(row.price));
    setPriceUnit(row.price_unit);
    setProfitPct(String(row.profit_share_percentage));
    setStatus(row.status);
    const bd = row.buyer_detail;
    setAmenitiesText(bd.amenities.join('\n'));
    setPortfolioCaptionsText(bd.portfolio_captions.join('\n'));
    setPoliciesText(bd.policies.join('\n'));
    setPaymentTerms(bd.payment_terms);
    const presets: Record<string, boolean> = {};
    for (const p of PAYMENT_PRESETS) presets[p.id] = bd.payment_methods.includes(p.id);
    const extra = bd.payment_methods.filter((m) => !PAYMENT_PRESETS.some((p) => p.id === m));
    setPaymentPresetOn(presets);
    setPaymentCustomText(extra.join('\n'));
    setLoaded(true);
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!partnerId) {
      setError('Select a partner.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const priceNum = Number(price);
    const pct = Number(profitPct);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      setError('Profit share must be 0–100.');
      return;
    }
    const now = new Date().toISOString();
    const list = loadPartnerListings();
    const plinks = parseLines(portfolioText);
    const payment_methods = [
      ...PAYMENT_PRESETS.filter((p) => paymentPresetOn[p.id]).map((p) => p.id),
      ...parseLines(paymentCustomText),
    ];
    const buyer_detail = {
      amenities: parseLines(amenitiesText),
      portfolio_links: plinks,
      portfolio_captions: parseLines(portfolioCaptionsText),
      policies: parseLines(policiesText),
      payment_methods,
      payment_terms: paymentTerms.trim(),
    };

    if (isEdit && id) {
      const next = list.map((row) =>
        row.id === id
          ? {
              ...row,
              partner_id: partnerId,
              title: title.trim(),
              module,
              category: category.trim() || 'General',
              description_short: descriptionShort.trim(),
              description_long: descriptionLong.trim() || descriptionShort.trim(),
              images: parseLines(imagesText),
              portfolio_links: plinks,
              videos: parseLines(videosText),
              pricing_mode: pricingMode,
              price: pricingMode === 'on_request' ? 0 : priceNum,
              price_unit: priceUnit.trim() || 'unit',
              profit_share_percentage: pct,
              status,
              buyer_detail,
              updated_at: now,
            }
          : row
      );
      savePartnerListings(next);
    } else {
      const newRow: PartnerListing = {
        id: `pl-${Date.now()}`,
        owner_type: 'partner',
        partner_id: partnerId,
        module,
        title: title.trim(),
        description_short: descriptionShort.trim(),
        description_long: descriptionLong.trim() || descriptionShort.trim(),
        images: parseLines(imagesText),
        portfolio_links: plinks,
        videos: parseLines(videosText),
        category: category.trim() || 'General',
        pricing_mode: pricingMode,
        price: pricingMode === 'on_request' ? 0 : priceNum,
        price_unit: priceUnit.trim() || 'unit',
        profit_share_percentage: pct,
        status,
        buyer_detail,
        created_at: now,
        updated_at: now,
      };
      savePartnerListings([...list, newRow]);
    }
    navigate('/admin/partner-listings');
  };

  if (!loaded) return <p className="text-sm text-slate-500">Loading…</p>;
  if (isEdit && error && !title) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => navigate('/admin/partner-listings')} className="text-sm text-blue-600 hover:underline">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/partner-listings')}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <AdminPageTitleRow title={isEdit ? 'Edit partner listing' : 'Add partner listing'} totalLabel="" />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 max-w-3xl"
      >
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <label className="text-xs font-medium text-slate-600 block">
          Partner
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Select partner</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.business_name || p.name} ({p.email})
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600 block">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-xs font-medium text-slate-600 block">
            Module
            <select
              value={module}
              onChange={(e) => setModule(e.target.value as MogzuListingModule)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Category
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
        </div>

        <label className="text-xs font-medium text-slate-600 block">
          Short description
          <textarea value={descriptionShort} onChange={(e) => setDescriptionShort(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y" />
        </label>
        <label className="text-xs font-medium text-slate-600 block">
          Long description / T&amp;C
          <textarea value={descriptionLong} onChange={(e) => setDescriptionLong(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y" />
        </label>

        <label className="text-xs font-medium text-slate-600 block">
          Image URLs (one per line)
          <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs resize-y" />
        </label>
        <label className="text-xs font-medium text-slate-600 block">
          Portfolio links (one per line)
          <textarea value={portfolioText} onChange={(e) => setPortfolioText(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs resize-y" />
        </label>
        <label className="text-xs font-medium text-slate-600 block">
          Video URLs (one per line)
          <textarea value={videosText} onChange={(e) => setVideosText(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-xs resize-y" />
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-800">Buyer listing details</p>
          <label className="text-xs font-medium text-slate-600 block">
            Amenities (one per line)
            <textarea
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Portfolio captions (optional — one per line, matches portfolio links order)
            <textarea
              value={portfolioCaptionsText}
              onChange={(e) => setPortfolioCaptionsText(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            T&amp;C / policies (one per line)
            <textarea
              value={policiesText}
              onChange={(e) => setPoliciesText(e.target.value)}
              rows={3}
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
              />
            </label>
          </div>
          <label className="text-xs font-medium text-slate-600 block">
            Payment terms
            <textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <label className="text-xs font-medium text-slate-600 block">
            Pricing
            <select
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as MogzuPricingMode)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              {PRICING.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Price
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={pricingMode === 'on_request'}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm disabled:opacity-50"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Unit
            <input value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Profit %
            <input type="number" min={0} max={100} value={profitPct} onChange={(e) => setProfitPct(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
        </div>

        <label className="text-xs font-medium text-slate-600 block">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PartnerListing['status'])}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: CORP.primary }}>
            Save
          </button>
          <button type="button" onClick={() => navigate('/admin/partner-listings')} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

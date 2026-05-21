import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { BookingHandoffPayload } from '@/app/types/bookingHandoff';

export type ListingPricingType = 'transparent' | 'offer_price' | 'request_for_price';
export type ListingPriceType = 'per_person' | 'flat' | 'per_hour' | 'package';

export type PriceBlockListing = {
  pricing_type: ListingPricingType;
  price_type?: ListingPriceType;
  base_price?: number;
  starting_price?: number;
  offer_validity_hours?: number;
  response_time_hours?: number;
  add_ons?: Array<{ name: string; price?: number }>;
  group_size_min?: number;
  group_size_max?: number;
  duration_options?: string[];
  selected_date?: string;
  selected_slot?: string;
};

export type OfferSubmitPayload = {
  offer_amount: number;
  group_size: number;
  duration: string;
  add_ons: string[];
  date?: string;
  slot?: string;
  estimated_total: number;
};

export type RequestSubmitPayload = {
  group_size: number;
  preferred_date: string;
  add_ons: string[];
  requirements: string;
};

export type PriceBlockBookingContext = {
  listingId: string;
  listingName: string;
  image?: string;
  city?: string;
  vendor_name?: string;
  rating?: number;
};

interface PriceBlockProps {
  listing: PriceBlockListing;
  onBookNow?: () => void;
  /** Return `false` to cancel navigation after offer confirmation. */
  onOfferSubmit?: (payload: OfferSubmitPayload) => void | boolean;
  onRequestSubmit?: (payload: RequestSubmitPayload) => void;
  /** When set with `onProceedToBooking`, corporate booking summary receives full payload. */
  bookingContext?: PriceBlockBookingContext;
  onProceedToBooking?: (payload: BookingHandoffPayload) => void;
  onDraftChange?: (patch: {
    group_size?: number;
    duration?: string;
    selected_addons?: Array<{ name: string; price: number | null; negotiable: boolean }>;
    offer_amount?: number | null;
    request_data?: { requirements: string | null; preferred_date: string | null };
    calculated?: { base_subtotal: number; addons_total: number; platform_fee: number; grand_total: number };
  }) => void;
  compact?: boolean;
}

const PRICE_TYPE_LABEL: Record<ListingPriceType, string> = {
  per_person: 'person',
  flat: 'event',
  per_hour: 'hour',
  package: 'package',
};

function formatInr(value: number): string {
  return `Rs ${Math.max(0, Math.round(value)).toLocaleString('en-IN')}`;
}

function useAnimatedNumber(target: number, durationMs = 300): number {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    const start = display;
    const end = target;
    if (start === end) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - (1 - p) * (1 - p);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return display;
}

export function getPricingBadgeConfig(pricingType: string): { label: string; className: string } {
  if (pricingType === 'transparent') {
    return { label: 'Transparent', className: 'bg-green-100 text-green-700 border border-green-200' };
  }
  if (pricingType === 'offer_price') {
    return { label: 'Offer Price', className: 'bg-amber-100 text-amber-700 border border-amber-200' };
  }
  return { label: 'Price on Request', className: 'bg-blue-100 text-blue-700 border border-blue-200' };
}

export function getPricingSummaryLine(listing: PriceBlockListing): string {
  const unit = listing.price_type ? PRICE_TYPE_LABEL[listing.price_type] : 'unit';
  if (listing.pricing_type === 'transparent') {
    return `${formatInr(listing.base_price ?? 0)} / ${unit}`;
  }
  if (listing.pricing_type === 'offer_price') {
    return `From ${formatInr(listing.starting_price ?? 0)} / ${unit}`;
  }
  return 'Price on Request';
}

export function getPricingCtaLabel(pricingType: string): string {
  if (pricingType === 'transparent') return 'Book Now';
  if (pricingType === 'offer_price') return 'Make an Offer';
  return 'Request Price';
}

export default function PriceBlock({
  listing,
  onBookNow,
  onOfferSubmit,
  onRequestSubmit,
  bookingContext,
  onProceedToBooking,
  onDraftChange,
  compact = false,
}: PriceBlockProps) {
  const navigate = useNavigate();
  const pricingType = listing.pricing_type;
  const basePrice = listing.base_price ?? 0;
  const startingPrice = listing.starting_price ?? 0;
  const responseHours = listing.response_time_hours ?? 24;
  const offerValidity = listing.offer_validity_hours ?? 48;
  const addons = listing.add_ons ?? [];
  const minGroup = Math.max(1, listing.group_size_min ?? 10);
  const maxGroup = Math.max(minGroup, listing.group_size_max ?? 500);
  const durationOptions = listing.duration_options?.length ? listing.duration_options : ['2 hours', '4 hours', 'Full day'];
  const defaultDuration = durationOptions[0];
  const defaultPriceType = listing.price_type ?? 'per_person';

  const [expanded, setExpanded] = useState(!compact);
  const [groupSize, setGroupSize] = useState(Math.min(Math.max(minGroup, 25), maxGroup));
  const [duration, setDuration] = useState(defaultDuration);
  const [selectedAddonNames, setSelectedAddonNames] = useState<string[]>([]);
  const [offerAmount, setOfferAmount] = useState(startingPrice ? String(startingPrice) : '');
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const [showOfferConfirm, setShowOfferConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestGroupSize, setRequestGroupSize] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestRequirements, setRequestRequirements] = useState('');
  const [requestErrors, setRequestErrors] = useState<{ group?: string; date?: string; requirements?: string }>({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [flashTotal, setFlashTotal] = useState(false)

  const buildListingSnapshot = (): BookingHandoffPayload['listing'] | null =>
    bookingContext
      ? {
          id: bookingContext.listingId,
          name: bookingContext.listingName,
          image: bookingContext.image,
          city: bookingContext.city,
          vendor_name: bookingContext.vendor_name,
          rating: bookingContext.rating,
        }
      : null;

  const selectedAddons = useMemo(
    () => addons.filter((a) => selectedAddonNames.includes(a.name)),
    [addons, selectedAddonNames],
  );

  const addonPriceTotal = useMemo(
    () =>
      selectedAddons.reduce((sum, addon) => {
        if (pricingType === 'request_for_price') return sum;
        return sum + (addon.price ?? 0);
      }, 0),
    [selectedAddons, pricingType],
  );

  const offerPerUnit = Math.max(0, Number(offerAmount) || 0);
  const unitPrice = pricingType === 'offer_price' ? offerPerUnit : basePrice;
  const baseTotalRaw = defaultPriceType === 'flat' || defaultPriceType === 'package' ? unitPrice : unitPrice * groupSize;
  const feeRaw = Math.round((baseTotalRaw + addonPriceTotal) * 0.05);
  const grandTotalRaw = baseTotalRaw + addonPriceTotal + feeRaw;

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const lastDraftSigRef = useRef('')
  useEffect(() => {
    const payload = {
      group_size: groupSize,
      duration,
      selected_addons: selectedAddons.map((addon) => ({
        name: addon.name,
        price: addon.price ?? null,
        negotiable: pricingType === 'offer_price' || pricingType === 'request_for_price',
      })),
      offer_amount: pricingType === 'offer_price' ? offerPerUnit : null,
      calculated: {
        base_subtotal: baseTotalRaw,
        addons_total: addonPriceTotal,
        platform_fee: feeRaw,
        grand_total: grandTotalRaw,
      },
    }
    // Dedup: parents pass inline `listing` + `onDraftChange` props; without
    // a signature guard the effect re-fires every render on identical data
    // and produces an infinite loop.
    const sig = JSON.stringify(payload)
    if (sig === lastDraftSigRef.current) return
    lastDraftSigRef.current = sig
    onDraftChange?.(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupSize, duration, selectedAddons, pricingType, offerPerUnit, baseTotalRaw, addonPriceTotal, feeRaw, grandTotalRaw]);

  useEffect(() => {
    setFlashTotal(true)
    const id = window.setTimeout(() => setFlashTotal(false), 620)
    return () => window.clearTimeout(id)
  }, [grandTotalRaw])

  const baseTotal = useAnimatedNumber(baseTotalRaw);
  const addonTotal = useAnimatedNumber(addonPriceTotal);
  const feeTotal = useAnimatedNumber(feeRaw);
  const grandTotal = useAnimatedNumber(grandTotalRaw);

  const hasDateAndSlot = Boolean(listing.selected_date && listing.selected_slot);
  const offerSubmitEnabled = hasDateAndSlot && offerPerUnit > 0;

  const toggleAddon = (name: string) =>
    setSelectedAddonNames((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  const openExpandedFromCompact = () => {
    if (compact) setExpanded(true);
  };

  const renderAddons = () => (
    <div className="space-y-2">
      {addons.map((addon) => (
        <label key={addon.name} className="flex items-start justify-between gap-2 text-sm text-slate-700 cursor-pointer">
          <span className="inline-flex items-start gap-2">
            <input
              type="checkbox"
              checked={selectedAddonNames.includes(addon.name)}
              onChange={() => toggleAddon(addon.name)}
              className="mt-0.5"
            />
            <span>{addon.name}</span>
          </span>
          {pricingType === 'request_for_price' ? null : (
            <span className="text-right">
              {formatInr(addon.price ?? 0)}
              {pricingType === 'offer_price' ? <span className="ml-1 text-xs text-slate-500">(negotiable)</span> : null}
            </span>
          )}
        </label>
      ))}
    </div>
  );

  const submitRequest = async () => {
    const nextErrors: { group?: string; date?: string; requirements?: string } = {};
    const parsedGroup = Number(requestGroupSize);
    if (!parsedGroup || parsedGroup <= 0) nextErrors.group = 'Enter a valid positive group size.';
    if (!requestDate) {
      nextErrors.date = 'Preferred date is required.';
    } else {
      const d = new Date(`${requestDate}T00:00:00`);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (d <= now) nextErrors.date = 'Please select a future date.';
    }
    if (requestRequirements.trim().length < 20) {
      nextErrors.requirements = 'Please provide at least 20 characters.';
    }
    setRequestErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setRequestLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const payload: RequestSubmitPayload = {
      group_size: parsedGroup,
      preferred_date: requestDate,
      add_ons: selectedAddonNames,
      requirements: requestRequirements.trim(),
    };
    onRequestSubmit?.(payload);
    onDraftChange?.({
      group_size: payload.group_size,
      selected_addons: selectedAddons.map((addon) => ({
        name: addon.name,
        price: addon.price ?? null,
        negotiable: true,
      })),
      request_data: {
        preferred_date: payload.preferred_date,
        requirements: payload.requirements,
      },
    });
    const snap = buildListingSnapshot();
    if (onProceedToBooking && snap) {
      onProceedToBooking({
        listing: snap,
        pricing_type: 'request_for_price',
        price_type: defaultPriceType,
        group_size: payload.group_size,
        duration: defaultDuration,
        selected_date: payload.preferred_date,
        selected_slot: undefined,
        add_on_names: [...selectedAddonNames],
        request: payload,
        created_at: new Date().toISOString(),
      });
    }
    setRequestLoading(false);
    setShowRequestModal(false);
    setToast(`Request sent! You'll receive a custom quote within ${responseHours} hours.`);
  };

  if (compact && !expanded) {
    return (
      <button
        type="button"
        onClick={openExpandedFromCompact}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{getPricingSummaryLine(listing)}</span>
        <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
          {getPricingCtaLabel(pricingType)} →
        </span>
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      {pricingType === 'transparent' && (
        <>
          <div className="text-2xl font-bold text-slate-900">{getPricingSummaryLine(listing)}</div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Group Size</p>
            <input
              type="range"
              min={minGroup}
              max={maxGroup}
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-600">{groupSize} people</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Duration</p>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm">
              {durationOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Add-ons</p>
            {renderAddons()}
          </div>
          <div className="border-t border-b border-slate-100 py-3 space-y-1 text-sm text-slate-700">
            <div className="flex justify-between"><span>Base</span><span>{formatInr(baseTotal)}</span></div>
            <div className="flex justify-between"><span>Add-ons</span><span>{formatInr(addonTotal)}</span></div>
            <div className="flex justify-between">
              <span>Platform fee ({'5%'})</span>
              <span className="inline-flex items-center gap-1">{formatInr(feeTotal)}<button type="button" onClick={() => setShowFeeInfo((p) => !p)} className="text-xs text-blue-600">What's this?</button></span>
            </div>
            {showFeeInfo ? (
              <p className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-500">
                This is Mogzu&apos;s 5% platform fee for facilitating the booking.
              </p>
            ) : null}
          </div>
          <div className={`flex items-center justify-between rounded-md px-1 ${flashTotal ? 'corp-total-flash' : ''}`}>
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-xl font-bold text-blue-600">{formatInr(grandTotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const snap = buildListingSnapshot();
              if (onProceedToBooking && snap) {
                onProceedToBooking({
                  listing: snap,
                  pricing_type: 'transparent',
                  price_type: defaultPriceType,
                  group_size: groupSize,
                  duration,
                  selected_date: listing.selected_date,
                  selected_slot: listing.selected_slot,
                  add_on_names: [...selectedAddonNames],
                  base_total: baseTotalRaw,
                  addon_total: addonPriceTotal,
                  platform_fee: feeRaw,
                  grand_total: grandTotalRaw,
                  created_at: new Date().toISOString(),
                });
                return;
              }
              onBookNow?.();
              if (!onBookNow) navigate('/request-to-book', { state: { category: listing.category ?? 'conference', from: 'price-block' } });
            }}
            disabled={!hasDateAndSlot}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Book Now →
          </button>
          {!hasDateAndSlot ? <p className="text-[11px] text-slate-500">Disabled until date + slot selected.</p> : null}
        </>
      )}

      {pricingType === 'offer_price' && (
        <>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-slate-900">{getPricingSummaryLine(listing)}</p>
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">Offer Price</span>
            <p className="text-xs text-slate-500">Prices may vary - submit your offer and the vendor will respond.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Your Offer</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rs</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                placeholder="Enter offer"
              />
            </div>
            <p className="mt-1 text-[12px] italic text-slate-500">Starting from {formatInr(startingPrice)} / {PRICE_TYPE_LABEL[defaultPriceType]} - higher offers get faster response.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Group Size</p>
            <input type="range" min={minGroup} max={maxGroup} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} className="w-full accent-blue-600" />
            <p className="text-xs text-slate-600">{groupSize} people</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Duration</p>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm">
              {durationOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Add-ons</p>
            {renderAddons()}
          </div>
          <div className="border-t border-b border-slate-100 py-3 space-y-1 text-sm text-slate-700">
            <div className="flex justify-between"><span>Your Offer</span><span>{formatInr(baseTotal)}</span></div>
            <div className="flex justify-between"><span>Add-ons</span><span>{formatInr(addonTotal)} <span className="text-xs text-slate-500">(negotiable)</span></span></div>
            <div className="flex justify-between"><span>Platform fee (5%)</span><span className="inline-flex items-center gap-1">{formatInr(feeTotal)}<Info className="h-3.5 w-3.5 text-slate-400" /></span></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Estimated</span>
            <span className="text-xl font-bold text-blue-600">{formatInr(grandTotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowOfferConfirm(true)}
            disabled={!offerSubmitEnabled}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Submit Offer →
          </button>
          {!offerSubmitEnabled ? <p className="text-[11px] text-slate-500">Active after offer amount and date + slot selection.</p> : null}
        </>
      )}

      {pricingType === 'request_for_price' && (
        <>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-slate-900">Price on Request</p>
            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">Price on Request</span>
            <p className="text-xs text-slate-500">Pricing is tailored to your event requirements.</p>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <Info className="h-4 w-4 text-slate-500" />
              <span>Vendor responds within {responseHours} hours</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Add-ons you may need</p>
            {renderAddons()}
          </div>
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="w-full rounded-lg border border-blue-600 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Request Price →
          </button>
        </>
      )}

      {showOfferConfirm ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3">
            <h4 className="text-lg font-semibold text-slate-900">Confirm Your Offer</h4>
            <p className="text-sm text-slate-700">{formatInr(offerPerUnit)} × {groupSize} pax = {formatInr(baseTotalRaw)}</p>
            <p className="text-sm text-slate-700">Add-ons: {selectedAddonNames.length ? selectedAddonNames.join(', ') : 'None'} (neg.)</p>
            <p className="text-sm text-slate-700">Date: {listing.selected_date ?? 'Not selected'} Time: {listing.selected_slot ?? 'Not selected'}</p>
            <p className="text-xs text-slate-500">Offer held for {offerValidity} hours after acceptance.</p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => {
                  const payload: OfferSubmitPayload = {
                    offer_amount: offerPerUnit,
                    group_size: groupSize,
                    duration,
                    add_ons: selectedAddonNames,
                    date: listing.selected_date,
                    slot: listing.selected_slot,
                    estimated_total: grandTotalRaw,
                  };
                  const offerOk = onOfferSubmit ? onOfferSubmit(payload) !== false : true;
                  if (!offerOk) return;
                  const snap = buildListingSnapshot();
                  if (onProceedToBooking && snap) {
                    onProceedToBooking({
                      listing: snap,
                      pricing_type: 'offer_price',
                      price_type: defaultPriceType,
                      group_size: groupSize,
                      duration,
                      selected_date: listing.selected_date,
                      selected_slot: listing.selected_slot,
                      add_on_names: [...selectedAddonNames],
                      base_total: baseTotalRaw,
                      addon_total: addonPriceTotal,
                      platform_fee: feeRaw,
                      grand_total: grandTotalRaw,
                      offer: payload,
                      created_at: new Date().toISOString(),
                    });
                  } else {
                    navigate('/request-to-book', { state: { category: listing.category ?? 'conference', from: 'price-block-offer' } });
                  }
                  setShowOfferConfirm(false);
                }}
              >
                Confirm & Send Offer →
              </button>
              <button type="button" onClick={() => setShowOfferConfirm(false)} className="w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                ← Back - Edit Offer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showRequestModal ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">Request a Price</h4>
              <button type="button" onClick={() => setShowRequestModal(false)} className="rounded-md p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Group Size
              <input type="number" value={requestGroupSize} onChange={(e) => setRequestGroupSize(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm" />
              {requestErrors.group ? <span className="mt-1 block text-[11px] text-red-600">{requestErrors.group}</span> : null}
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Preferred Date
              <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm" />
              {requestErrors.date ? <span className="mt-1 block text-[11px] text-red-600">{requestErrors.date}</span> : null}
            </label>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Add-ons needed</p>
              {renderAddons()}
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Your Requirements
              <textarea
                value={requestRequirements}
                onChange={(e) => setRequestRequirements(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                placeholder="E.g. Team building for 50 people, prefer outdoor activities, budget around Rs 800/person, date flexible in April."
              />
              {requestErrors.requirements ? <span className="mt-1 block text-[11px] text-red-600">{requestErrors.requirements}</span> : null}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="corp-micro rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => setRequestRequirements((p) => `${p ? `${p}\n` : ''}Group size: `)}
              >
                Include group size
              </button>
              <button
                type="button"
                className="corp-micro rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => setRequestRequirements((p) => `${p ? `${p}\n` : ''}Date: flexible / fixed on [...]`)}
              >
                Mention date flexibility
              </button>
              <button
                type="button"
                className="corp-micro rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => setRequestRequirements((p) => `${p ? `${p}\n` : ''}Budget: Rs `)}
              >
                Share your budget
              </button>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={submitRequest}
                disabled={requestLoading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                {requestLoading ? 'Sending...' : 'Send Price Request →'}
              </button>
              <button type="button" onClick={() => setShowRequestModal(false)} className="w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}

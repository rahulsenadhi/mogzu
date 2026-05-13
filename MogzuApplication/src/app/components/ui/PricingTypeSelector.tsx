import { CheckCircle2, BadgeIndianRupee, Handshake, FileText } from 'lucide-react';
import type { ListingPriceType, ListingPricingType } from './PriceBlock';

export type PricingTypeSelectorValue = {
  pricing_type: ListingPricingType;
  price_type?: ListingPriceType;
  base_price?: number;
  starting_price?: number;
  min_acceptable_offer?: number;
  offer_validity_hours?: number;
  response_time_hours?: number;
};

interface PricingTypeSelectorProps {
  value: PricingTypeSelectorValue;
  onChange: (next: PricingTypeSelectorValue) => void;
}

const OPTIONS: Array<{
  id: ListingPricingType;
  title: string;
  body: string;
  Icon: typeof BadgeIndianRupee;
}> = [
  {
    id: 'transparent',
    title: 'Transparent',
    body: 'Fixed price, fully visible to clients.',
    Icon: BadgeIndianRupee,
  },
  {
    id: 'offer_price',
    title: 'Offer Price',
    body: 'Set a starting price. Accept custom offers.',
    Icon: Handshake,
  },
  {
    id: 'request_for_price',
    title: 'Request for Price',
    body: 'No price shown. Receive custom quote requests.',
    Icon: FileText,
  },
];

const PRICE_TYPES: ListingPriceType[] = ['per_person', 'flat', 'per_hour', 'package'];

export default function PricingTypeSelector({ value, onChange }: PricingTypeSelectorProps) {
  const selected = value.pricing_type;

  const setType = (pricingType: ListingPricingType) => {
    if (pricingType === 'transparent') {
      onChange({
        pricing_type: 'transparent',
        price_type: value.price_type ?? 'per_person',
        base_price: value.base_price ?? 0,
      });
      return;
    }
    if (pricingType === 'offer_price') {
      onChange({
        pricing_type: 'offer_price',
        price_type: value.price_type ?? 'per_person',
        starting_price: value.starting_price ?? 0,
        min_acceptable_offer: value.min_acceptable_offer ?? 0,
        offer_validity_hours: value.offer_validity_hours ?? 48,
      });
      return;
    }
    onChange({
      pricing_type: 'request_for_price',
      response_time_hours: value.response_time_hours ?? 24,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {OPTIONS.map(({ id, title, body, Icon }) => {
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setType(id)}
              className={`relative rounded-xl border p-3 text-left transition-all duration-150 ${
                active
                  ? 'border-2 border-[#2563eb] bg-blue-50/70 scale-[1.02]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {active ? <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-[#2563eb]" /> : null}
              <Icon className={`mb-2 h-5 w-5 ${active ? 'text-[#2563eb]' : 'text-slate-500'}`} />
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="mt-1 text-xs text-slate-600">{body}</p>
            </button>
          );
        })}
      </div>

      <div
        className="overflow-hidden transition-all duration-250 ease-in-out"
        style={{ maxHeight: selected ? 260 : 0 }}
      >
        {selected === 'transparent' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 grid gap-2 md:grid-cols-3">
            <label className="text-xs font-medium text-slate-700">
              Price type
              <select
                value={value.price_type ?? 'per_person'}
                onChange={(e) => onChange({ ...value, price_type: e.target.value as ListingPriceType })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              >
                {PRICE_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-700">
              Base price
              <input
                type="number"
                min={0}
                value={value.base_price ?? 0}
                onChange={(e) => onChange({ ...value, base_price: Number(e.target.value) })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
            <div className="text-xs text-slate-500 flex items-end pb-1">
              Optional price packages can be added in a later step.
            </div>
          </div>
        ) : null}

        {selected === 'offer_price' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 grid gap-2 md:grid-cols-2">
            <label className="text-xs font-medium text-slate-700">
              Price type
              <select
                value={value.price_type ?? 'per_person'}
                onChange={(e) => onChange({ ...value, price_type: e.target.value as ListingPriceType })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              >
                {['per_person', 'flat', 'per_hour'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-700">
              Starting price
              <input
                type="number"
                min={0}
                value={value.starting_price ?? 0}
                onChange={(e) => onChange({ ...value, starting_price: Number(e.target.value) })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              Minimum you'll accept - not shown to clients
              <input
                type="number"
                min={0}
                value={value.min_acceptable_offer ?? 0}
                onChange={(e) => onChange({ ...value, min_acceptable_offer: Number(e.target.value) })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              Offer validity (hours)
              <input
                type="number"
                min={1}
                value={value.offer_validity_hours ?? 48}
                onChange={(e) => onChange({ ...value, offer_validity_hours: Number(e.target.value) })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
          </div>
        ) : null}

        {selected === 'request_for_price' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <label className="text-xs font-medium text-slate-700">
              How quickly will you respond to requests?
              <input
                type="number"
                min={1}
                value={value.response_time_hours ?? 24}
                onChange={(e) => onChange({ ...value, response_time_hours: Number(e.target.value) })}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm md:max-w-[220px]"
              />
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

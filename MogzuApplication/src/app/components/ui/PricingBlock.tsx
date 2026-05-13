import { Lock, FileText, CheckCircle2, XCircle, Info } from 'lucide-react';

export type PricingMode = 'negotiable' | 'on_request' | 'fixed';

interface PricingBlockProps {
  mode: PricingMode;
  price: string;
  priceUnit: string;
  onSubmitOffer?: (offerAmount: string, message: string) => void;
  onRequestPrice?: () => void;
  onCheckAvailability?: () => void;
}

export function PricingBlock({
  mode,
  price,
  priceUnit,
  onSubmitOffer,
  onRequestPrice,
  onCheckAvailability,
}: PricingBlockProps) {
  if (mode === 'on_request') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 w-full flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-300">— — —</span>
          </div>
          <p className="text-sm text-gray-500">Pricing available on request</p>
        </div>
        <button
          onClick={onRequestPrice}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Request price
        </button>
      </div>
    );
  }

  if (mode === 'fixed') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 w-full flex flex-col gap-4">
        <div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-3xl font-bold text-gray-900">{price}</span>
            <span className="text-sm text-gray-500 mb-1">{priceUnit}</span>
          </div>
          <div className="flex items-start gap-2 mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <Lock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600">
              <span className="font-medium">Price is fixed</span> — negotiation disabled by this vendor
            </p>
          </div>
        </div>
        <button
          onClick={onCheckAvailability}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Check availability
        </button>
      </div>
    );
  }

  // mode === 'negotiable'
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 w-full flex flex-col gap-4">
      <div>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          <span className="text-sm text-gray-500 mb-1">{priceUnit}</span>
        </div>
        <p className="text-xs text-green-600 font-medium">Price is negotiable</p>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Offer price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
            <input 
              type="text" 
              placeholder="e.g. 50,000" 
              className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Message to vendor</label>
          <textarea 
            placeholder="Add context for your offer..." 
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          ></textarea>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={() => onSubmitOffer?.('0', '')}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Submit offer
        </button>
        <button
          onClick={onCheckAvailability}
          className="w-full bg-white border border-blue-600 text-blue-600 rounded-lg py-2.5 font-medium hover:bg-blue-50 transition-colors"
        >
          Check availability
        </button>
      </div>
    </div>
  );
}

export type VendorResponseState = 'awaiting' | 'best_offer' | 'accepted' | 'declined';

interface VendorStatusBannerProps {
  status: VendorResponseState;
  comment?: string;
}

export function VendorStatusBanner({ status, comment }: VendorStatusBannerProps) {
  const getBannerConfig = () => {
    switch (status) {
      case 'awaiting':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <Info className="w-5 h-5 text-yellow-600" />,
          title: 'Awaiting vendor response',
          titleColor: 'text-yellow-800'
        };
      case 'best_offer':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          title: 'Best offer received',
          titleColor: 'text-blue-800'
        };
      case 'accepted':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          title: 'Offer accepted',
          titleColor: 'text-green-800'
        };
      case 'declined':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          title: 'Offer declined',
          titleColor: 'text-red-800'
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`mt-4 rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col gap-3`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <h4 className={`text-sm font-semibold ${config.titleColor}`}>{config.title}</h4>
      </div>
      {comment && (
        <div className="bg-white/60 rounded-lg p-3 text-sm text-gray-700">
          <span className="font-medium text-xs text-gray-500 uppercase tracking-wide block mb-1">Vendor Comment</span>
          {comment}
        </div>
      )}
    </div>
  );
}
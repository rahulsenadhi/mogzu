import {
  mapVendorStatusFromBookingStatus,
  type VendorResponseDisplayStatus,
} from '../../utils/vendorStatusMap';

export interface VendorStatusBadgeProps {
  status: VendorResponseDisplayStatus;
}

export function VendorStatusBadge({ status }: VendorStatusBadgeProps) {
  const { label, subtext, colourToken } = {
    awaiting: mapVendorStatusFromBookingStatus('PENDING'),
    best_offer: mapVendorStatusFromBookingStatus('REQUESTED'),
    accepted: mapVendorStatusFromBookingStatus('CONFIRMED'),
    declined: mapVendorStatusFromBookingStatus('CANCELLED'),
  }[status];

  return (
    <div className="flex flex-col">
      <span
        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${colourToken} text-white`}
      >
        {label}
      </span>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
  );
}


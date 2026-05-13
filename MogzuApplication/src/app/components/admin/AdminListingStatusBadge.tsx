import type { MogzuDirectListing, PartnerListing } from '@/app/lib/mogzuDomain';

type Status = PartnerListing['status'] | MogzuDirectListing['status'];

const label = (s: Status): string => {
  if (s === 'pending_review') return 'Pending';
  if (s === 'draft') return 'Draft';
  if (s === 'active') return 'Active';
  if (s === 'paused') return 'Paused';
  if (s === 'rejected') return 'Rejected';
  if (s === 'archived') return 'Archived';
  return String(s);
};

const pillClass = (s: Status): string => {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
  if (s === 'pending_review') return 'bg-amber-50 text-amber-900 border border-amber-100';
  if (s === 'draft') return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (s === 'paused') return 'bg-blue-50 text-blue-800 border border-blue-100';
  if (s === 'rejected') return 'bg-rose-50 text-rose-800 border border-rose-100';
  if (s === 'archived') return 'bg-slate-200 text-slate-700 border border-slate-300';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

export default function AdminListingStatusBadge({
  status,
  size = 'md',
}: {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sz = size === 'lg' ? 'text-sm px-3 py-1' : size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sz} ${pillClass(status)}`}
    >
      {label(status)}
    </span>
  );
}

export function adminStatusLabel(status: Status): string {
  return label(status);
}

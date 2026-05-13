import type { ReactNode } from 'react';

export type AdminProductLine = 'gifting' | 'events' | 'spacex';

const TABS: { id: AdminProductLine; label: string }[] = [
  { id: 'gifting', label: 'Gifting' },
  { id: 'events', label: 'Events' },
  { id: 'spacex', label: 'D Space' },
];

export function AdminPageTitleRow({
  title,
  totalLabel,
  className = '',
}: {
  title: string;
  totalLabel: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      <span className="text-sm text-slate-500">{totalLabel}</span>
    </div>
  );
}

export function AdminProductLineTabs({
  value,
  onChange,
  className = '',
}: {
  value: AdminProductLine;
  onChange: (v: AdminProductLine) => void;
  className?: string;
}) {
  return (
    <div className={`flex border-b border-slate-200 gap-8 ${className}`} role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          id={`admin-product-line-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            value === tab.id
              ? 'text-[#2563EB] border-[#2563EB]'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Map data field "Event" / UI Events tab to product line key */
export function issueCategoryToProductLine(
  c: 'Gifting' | 'Event' | 'SpaceX'
): AdminProductLine {
  if (c === 'Gifting') return 'gifting';
  if (c === 'Event') return 'events';
  return 'spacex';
}

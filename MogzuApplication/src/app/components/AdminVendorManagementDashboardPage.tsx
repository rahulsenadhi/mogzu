import {
  Box,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { useNavigate } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ADMIN_PENDING_LISTINGS_KEY,
  ADMIN_PENDING_LISTINGS_UPDATED_EVENT,
  loadPendingListings,
  type AdminPendingListing,
} from '@/app/lib/adminVendorListingQueueStorage';
import {
  ADMIN_PENDING_VENDORS_KEY,
  ADMIN_PENDING_VENDORS_UPDATED_EVENT,
  approvePendingVendorForCorporate,
  loadPendingVendors,
  syncPendingVendorFromOnboardingCompleted,
  type AdminPendingVendor,
} from '@/app/lib/adminVendorQueueStorage';
import { approvePendingListingForCorporate } from '@/app/lib/adminVendorListingQueueStorage';

type OverviewCard = {
  title: string;
  value: string;
  delta: string;
  tone: string;
};

const overviewCards: OverviewCard[] = [
  { title: 'Total Vendors', value: '175', delta: '+3.25', tone: 'bg-blue-50' },
  { title: 'Total Shops', value: '64', delta: '+3.25', tone: 'bg-amber-50' },
  { title: 'Total Products', value: '36', delta: '+3.25', tone: 'bg-cyan-50' },
  { title: 'Total Orders', value: '25', delta: '+3.25', tone: 'bg-emerald-50' },
  { title: 'Pending Approvals', value: '15', delta: '+3.25', tone: 'bg-rose-50' },
];

const orderCards = [
  { label: 'Pending', icon: Clock3 },
  { label: 'Confirmed', icon: CheckCircle2 },
  { label: 'Processing', icon: Box },
  { label: 'Delivered', icon: PackageCheck },
  { label: 'On the way', icon: Truck },
  { label: 'Pickup', icon: ShoppingBag },
  { label: 'Cancelled', icon: XCircle },
];

const categoryRows = [
  { label: 'Category 1', amount: '₹50,000.00', color: 'bg-cyan-400' },
  { label: 'Category 2', amount: '₹25,000.00', color: 'bg-emerald-400' },
  { label: 'Category 3', amount: '₹15,000.00', color: 'bg-rose-400' },
  { label: 'Category 4', amount: '₹7,000.00', color: 'bg-amber-300' },
  { label: 'Category 5', amount: '₹3,000.00', color: 'bg-violet-300' },
];

function formatSubmitted(ts: number) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

export default function AdminVendorManagementDashboardPage() {
  const navigate = useNavigate();
  const [salesRange, setSalesRange] = useState<'day' | 'month' | 'year'>('year');
  const [pendingPartners, setPendingPartners] = useState<AdminPendingVendor[]>([]);
  const [pendingListings, setPendingListings] = useState<AdminPendingListing[]>([]);

  useEffect(() => {
    const sync = () => {
      syncPendingVendorFromOnboardingCompleted();
      setPendingPartners(loadPendingVendors());
      setPendingListings(loadPendingListings());
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_PENDING_VENDORS_KEY || e.key === ADMIN_PENDING_LISTINGS_KEY) sync();
    };
    const onVendorQueueUpdated = () => sync();
    const onListingsUpdated = () => sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    window.addEventListener(ADMIN_PENDING_VENDORS_UPDATED_EVENT, onVendorQueueUpdated);
    window.addEventListener(ADMIN_PENDING_LISTINGS_UPDATED_EVENT, onListingsUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
      window.removeEventListener(ADMIN_PENDING_VENDORS_UPDATED_EVENT, onVendorQueueUpdated);
      window.removeEventListener(ADMIN_PENDING_LISTINGS_UPDATED_EVENT, onListingsUpdated);
    };
  }, []);

  const overviewCardsLive = useMemo(
    () =>
      overviewCards.map((card) =>
        card.title === 'Pending Approvals'
          ? { ...card, value: String(pendingPartners.length) }
          : card
      ),
    [pendingPartners.length]
  );

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Vendor Management Dashboard" totalLabel="" />

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Partners pending approval</h3>
        <p className="mb-3 text-xs text-slate-500">
          Approve a partner to add them to the corporate Vendor Passport directory (search). Frontend-only queue.
        </p>
        {pendingPartners.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No pending partner applications yet. Complete vendor onboarding from the partner flow to see rows here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Business</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPartners.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-800">{row.businessName}</p>
                      <p className="text-xs text-slate-500">ID {row.onboardingId}</p>
                      {row.servicesSummary ? (
                        <p className="mt-1 max-w-md text-xs text-slate-600 line-clamp-2" title={row.servicesSummary}>
                          {row.servicesSummary}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-slate-800">{row.fullName}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                      <p className="text-xs text-slate-500">{row.phone}</p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {row.city}
                      {row.stateRegion ? `, ${row.stateRegion}` : ''}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{formatSubmitted(row.submittedAt)}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                        Pending approval
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          approvePendingVendorForCorporate(row.onboardingId);
                          setPendingPartners(loadPendingVendors());
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Listings pending review</h3>
        <p className="mb-3 text-xs text-slate-500">
          Approve a listing to surface it on corporate browse (D Space / Activities / Gifting Shop by profile). Frontend-only queue.
        </p>
        {pendingListings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No listings awaiting review. Submit a listing from the partner listing form to see rows here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Listing</th>
                  <th className="px-3 py-2">Partner</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingListings.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-800">{row.listingTitle}</p>
                      <p className="text-xs text-slate-500">Listing {row.listingId}</p>
                      <p className="mt-1 max-w-md text-xs text-slate-600 line-clamp-2" title={row.shortDescription}>
                        {row.shortDescription}
                      </p>
                      {row.listingProfileIds ? (
                        <p className="mt-1 text-[11px] text-slate-500">Profiles: {row.listingProfileIds}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-slate-800">{row.businessName}</p>
                      <p className="text-xs text-slate-500">Onboarding {row.onboardingId}</p>
                      {row.vendorEmail ? <p className="text-xs text-slate-500">{row.vendorEmail}</p> : null}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{row.location}</td>
                    <td className="px-3 py-2.5 text-slate-600">{formatSubmitted(row.submittedAt)}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-900">
                        Pending review
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          approvePendingListingForCorporate(row.listingId);
                          setPendingListings(loadPendingListings());
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-[#ECEFF6] p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Overview</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {overviewCardsLive.map((card) => (
            <article key={card.title} className={`rounded-lg border border-white/80 p-3 ${card.tone}`}>
              <p className="text-[11px] text-slate-500">{card.title}</p>
              <p className="mt-1 text-3xl font-semibold text-[#2563EB]">{card.value}</p>
              <p className="mt-1 text-[11px] text-emerald-600">{card.delta} <span className="text-slate-400">than last month</span></p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[54%_24%_22%]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Order Analytics</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orderCards.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate('/admin/vendors/order-analytics')}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-left hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-200 px-1 text-xs font-semibold text-slate-600">
                    351
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Product Sales</h3>
            <div className="flex rounded border border-slate-200 text-[10px]">
              <button
                type="button"
                onClick={() => setSalesRange('day')}
                className={`border-r border-slate-200 px-2 py-0.5 ${salesRange === 'day' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500'}`}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setSalesRange('month')}
                className={`border-r border-slate-200 px-2 py-0.5 ${salesRange === 'month' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500'}`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setSalesRange('year')}
                className={`${salesRange === 'year' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500'} px-2 py-0.5`}
              >
                Year
              </button>
            </div>
          </div>
          <div className="relative h-52 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="absolute left-8 right-3 top-10 h-px border-t border-dashed border-blue-300" />
            <svg viewBox="0 0 220 130" className="h-full w-full">
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                points="8,70 48,74 88,80 128,58 168,64 208,52"
              />
            </svg>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Category Wise Product Sales</h3>
          <div className="space-y-1.5 text-[11px]">
            {categoryRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${row.color}`} />
                  <span className="text-slate-500">{row.label}</span>
                </div>
                <span className="text-slate-600">{row.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <div className="relative h-36 w-36 rounded-full" style={{ background: 'conic-gradient(#7DD3FC 0deg 180deg, #4ADE80 180deg 270deg, #FB7185 270deg 318deg, #FBBF24 318deg 345deg, #C4B5FD 345deg 360deg)' }}>
              <div className="absolute inset-6 rounded-full bg-white" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

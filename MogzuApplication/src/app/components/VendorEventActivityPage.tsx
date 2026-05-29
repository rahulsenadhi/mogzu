import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BarChart2, Bell, Calendar, Eye, FileText, HelpCircle, Loader2, Megaphone, Plus, Search, Trash2, X } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import { DevMockDataBanner } from './global/DevMockDataBanner';
import { VendorRejectionFeedbackDrawer, type VendorRejectionListing } from './vendor/VendorRejectionFeedbackDrawer';
import { VendorPerformanceStatsDrawer, type VendorPerformanceListing } from './vendor/VendorPerformanceStatsDrawer';
import type { RejectionReasonCategory } from '@/app/lib/vendorRejectionChecklist';
import { isListingUuid } from '@/app/lib/activityListingResolver';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';

const COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=200';

type VendorEventActivity = {
  id: string;
  title: string;
  category: 'Indoor Fun' | 'Outdoor Adventure' | 'Sports' | 'Team Building' | 'Wellness';
  teamSize: number;
  pricePerUnitLabel: string;
  status: 'Active' | 'Draft' | 'Paused' | 'Rejected' | 'Pending';
  createdAt: string;
  coverUrl: string;
  hasAddOns?: boolean;
  resubmission_notes?: string;
  rejection?: {
    submissionDate: string;
    rejectionDate: string;
    reasonCategory: RejectionReasonCategory;
    rejectionReason?: string;
  };
};

const MODULE_ID = 'events' as const;

type ListingWithImages = Listing & { listing_images?: ListingImage[] };

const ACTIVITY_CATEGORIES: VendorEventActivity['category'][] = [
  'Indoor Fun',
  'Outdoor Adventure',
  'Sports',
  'Team Building',
  'Wellness',
];

const DEMO_VENDOR_ACTIVITIES: VendorEventActivity[] = [
  {
    id: 'ea-1',
    title: 'Corporate Escape Rooms',
    category: 'Indoor Fun',
    teamSize: 10,
    pricePerUnitLabel: '₹2,000/hr per team',
    status: 'Active',
    createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 9)),
    coverUrl: COVER_PLACEHOLDER,
    hasAddOns: true,
  },
  {
    id: 'ea-2',
    title: 'Team Mini-Golf Challenge',
    category: 'Outdoor Adventure',
    teamSize: 15,
    pricePerUnitLabel: '₹1,800/hr per team',
    status: 'Draft',
    createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)),
    coverUrl: COVER_PLACEHOLDER,
    hasAddOns: true,
  },
  {
    id: 'ea-rejected-1',
    title: 'Leadership Workshop Sprint',
    category: 'Team Building',
    teamSize: 24,
    pricePerUnitLabel: '₹3,500/hr per team',
    status: 'Rejected',
    createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)),
    coverUrl: COVER_PLACEHOLDER,
    hasAddOns: false,
    rejection: {
      submissionDate: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 6)),
      rejectionDate: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)),
      reasonCategory: 'Missing Media',
      rejectionReason:
        'Please upload at least three high-resolution photos of your venue and one cover image in landscape orientation.',
    },
  },
];

function listingStatusLabel(status: ListingStatus): VendorEventActivity['status'] {
  switch (status) {
    case 'active':
      return 'Active';
    case 'draft':
      return 'Draft';
    case 'paused':
      return 'Paused';
    case 'rejected':
      return 'Rejected';
    case 'pending_approval':
      return 'Pending';
  }
}

function mapActivityCategory(raw: unknown): VendorEventActivity['category'] {
  if (typeof raw === 'string' && ACTIVITY_CATEGORIES.includes(raw as VendorEventActivity['category'])) {
    return raw as VendorEventActivity['category'];
  }
  return 'Indoor Fun';
}

function listingToVendorActivity(l: ListingWithImages): VendorEventActivity {
  const meta = (l.metadata ?? {}) as Record<string, unknown>;
  const cover =
    (l.listing_images ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => storageService.listingImages.getUrl(img.storage_path))
      .find(Boolean) ?? COVER_PLACEHOLDER;
  const unit =
    l.price_unit === 'per_hour' ? '/hr' : l.price_unit === 'per_person' ? '/person' : '';
  const pricePerUnitLabel =
    l.base_price != null
      ? `₹${l.base_price.toLocaleString('en-IN')}${unit} per team`
      : 'On request';
  const row: VendorEventActivity = {
    id: l.id,
    title: l.title,
    category: mapActivityCategory(meta.activityCategory ?? meta.category),
    teamSize: l.max_capacity ?? 10,
    pricePerUnitLabel,
    status: listingStatusLabel(l.status),
    createdAt: formatDate(new Date(l.created_at)),
    coverUrl: cover,
    hasAddOns: meta.hasAddOns === true,
    resubmission_notes:
      typeof meta.resubmission_notes === 'string' ? meta.resubmission_notes : undefined,
  };
  if (l.status === 'rejected') {
    row.rejection = {
      submissionDate:
        typeof meta.submissionDate === 'string'
          ? meta.submissionDate
          : formatDate(new Date(l.created_at)),
      rejectionDate:
        typeof meta.rejectionDate === 'string'
          ? meta.rejectionDate
          : formatDate(new Date(l.updated_at)),
      reasonCategory:
        (typeof meta.reasonCategory === 'string'
          ? meta.reasonCategory
          : 'Other') as RejectionReasonCategory,
      rejectionReason:
        typeof meta.rejectionReason === 'string' ? meta.rejectionReason : undefined,
    };
  }
  return row;
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function VendorEventActivityPage() {
  const navigate = useNavigate();
  const { vendorId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const createFormRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);
  const [activities, setActivities] = useState<VendorEventActivity[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | VendorEventActivity['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VendorEventActivity['category']>('all');

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [category, setCategory] = useState<VendorEventActivity['category']>('Indoor Fun');
  const [teamSize, setTeamSize] = useState<string>('10');
  const [teamSizeError, setTeamSizeError] = useState('');
  const [pricePerUnitLabel, setPricePerUnitLabel] = useState('₹2,000/hr');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [previewTitle, setPreviewTitle] = useState<string>('');

  const [requestsNotice, setRequestsNotice] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [enquiries, setEnquiries] = useState<
    Array<{
      id: string;
      listingTitle: string;
      bookerName: string;
      corporateName: string;
      status: string;
      createdAt: string;
      amount: number | null;
    }>
  >([]);
  const [usingDemoEnquiries, setUsingDemoEnquiries] = useState(false);
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [rejectionListing, setRejectionListing] = useState<VendorRejectionListing | null>(null);
  const [performanceListing, setPerformanceListing] = useState<VendorPerformanceListing | null>(null);

  const toRejectionListing = (a: VendorEventActivity): VendorRejectionListing | null => {
    if (a.status !== 'Rejected' || !a.rejection) return null;
    return {
      id: a.id,
      title: a.title,
      categoryLabel: a.category,
      coverUrl: a.coverUrl,
      submissionDate: a.rejection.submissionDate,
      rejectionDate: a.rejection.rejectionDate,
      reasonCategory: a.rejection.reasonCategory,
      rejectionReason: a.rejection.rejectionReason,
      resubmission_notes: a.resubmission_notes,
    };
  };

  const toPerformanceListing = (a: VendorEventActivity): VendorPerformanceListing => ({
    id: a.id,
    title: a.title,
    categoryLabel: a.category,
    coverUrl: a.coverUrl,
    status: a.status,
    hasAddOns: a.hasAddOns,
  });

  const clearVendorQuery = () => {
    if (searchParams.get('rejection') || searchParams.get('stats')) setSearchParams({});
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities.filter(
      (a) =>
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || a.status === statusFilter) &&
        (categoryFilter === 'all' || a.category === categoryFilter),
    );
  }, [activities, search, statusFilter, categoryFilter]);

  useEffect(() => {
    const r = searchParams.get('rejection');
    const st = searchParams.get('stats');
    if (!activities.length) return;
    if (r) {
      const row = activities.find((x) => x.id === r);
      const mapped = row ? toRejectionListing(row) : null;
      if (mapped) {
        setRejectionListing(mapped);
        setRejectionOpen(true);
        setPerformanceOpen(false);
      }
    }
    if (st) {
      const row = activities.find((x) => x.id === st);
      if (row) {
        setPerformanceListing(toPerformanceListing(row));
        setPerformanceOpen(true);
        setRejectionOpen(false);
      }
    }
  }, [searchParams, activities]);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    if (!vendorId) {
      setActivities(DEMO_VENDOR_ACTIVITIES);
      setUsingDemo(true);
      setLoading(false);
      return;
    }
    const { data, error } = await db.listings.listByVendor(vendorId);
    if (error) {
      setLoadError('Unable to load vendor event activities right now. Please retry.');
      setActivities(DEMO_VENDOR_ACTIVITIES);
      setUsingDemo(true);
    } else {
      const rows = ((data ?? []) as ListingWithImages[]).filter((l) => l.module === MODULE_ID);
      if (rows.length > 0) {
        setActivities(rows.map(listingToVendorActivity));
        setUsingDemo(false);
      } else {
        setActivities(DEMO_VENDOR_ACTIVITIES);
        setUsingDemo(true);
      }
    }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const resetForm = () => {
    setTitle('');
    setCategory('Indoor Fun');
    setTeamSize('10');
    setPricePerUnitLabel('₹2,000/hr');
    setTitleError('');
    setTeamSizeError('');
    setSubmitError('');
    setSubmitSuccess('');
  };

  const validate = () => {
    let ok = true;
    setTitleError('');
    setTeamSizeError('');
    setSubmitError('');
    setSubmitSuccess('');

    const t = title.trim();
    if (!t) {
      setTitleError('Please enter an activity title.');
      ok = false;
    }

    const cap = Number(teamSize);
    if (!teamSize || Number.isNaN(cap) || cap < 1) {
      setTeamSizeError('Team size must be a positive number.');
      ok = false;
    }

    if (!ok) setSubmitError('Fix the highlighted fields and try again.');
    return ok;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    if (vendorId) {
      const { data, error } = await db.listings.create({
        vendor_id: vendorId,
        module: MODULE_ID,
        category_id: null,
        title: title.trim(),
        description: null,
        pricing_type: 'transparent',
        base_price: null,
        price_unit: 'per_hour',
        min_capacity: 1,
        max_capacity: Number(teamSize),
        location_city: null,
        location_address: null,
        cancellation_policy: null,
        confirmation_sla_hours: 24,
        buffer_minutes: 0,
        is_mogzu_direct: false,
        status: 'draft',
        metadata: {
          activityCategory: category,
          category,
          pricePerUnitLabel: pricePerUnitLabel.trim() || '₹2,000/hr per team',
        },
      });
      if (error || !data) {
        setSubmitError(error?.message ?? 'Unable to create this activity right now. Please retry.');
        setSubmitting(false);
        return;
      }
      await loadActivities();
      setSubmitSuccess('Activity created as draft. Submit for review when ready.');
      setSubmitting(false);
      resetForm();
      return;
    }

    window.setTimeout(() => {
      const row: VendorEventActivity = {
        id: `ea-${Date.now()}`,
        title: title.trim(),
        category,
        teamSize: Number(teamSize),
        pricePerUnitLabel: pricePerUnitLabel.trim() || '₹2,000/hr per team',
        status: 'Active',
        createdAt: formatDate(new Date()),
        coverUrl: COVER_PLACEHOLDER,
        hasAddOns: true,
      };

      setActivities((prev) => [row, ...prev]);
      setSubmitSuccess('Activity created. Enquiries will show up in Requests (demo).');
      setSubmitting(false);
      resetForm();
    }, 400);
  };

  const handleRetryLoad = () => {
    loadActivities();
  };

  const patchLocalActivity = (id: string, patch: Partial<VendorEventActivity>) => {
    setActivities((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const updateListingStatus = async (
    id: string,
    status: ListingStatus,
    localPatch: Partial<VendorEventActivity>,
    successMsg: string,
  ) => {
    if (isListingUuid(id)) {
      const { error } = await db.listings.updateStatus(id, status);
      if (error) {
        setSubmitError(error.message);
        return;
      }
      setSubmitSuccess(successMsg);
      await loadActivities();
      return;
    }
    patchLocalActivity(id, localPatch);
    setSubmitSuccess(successMsg);
  };

  const submitForReview = (id: string) =>
    updateListingStatus(id, 'pending_approval', { status: 'Pending' }, 'Submitted for admin review.');

  const withdrawFromReview = (id: string) =>
    updateListingStatus(id, 'draft', { status: 'Draft' }, 'Withdrawn to draft.');

  const resubmitListing = (id: string) =>
    updateListingStatus(
      id,
      'pending_approval',
      { status: 'Pending', rejection: undefined },
      'Resubmitted for review.',
    );

  const openRequests = useCallback(async () => {
    setRequestsNotice('');
    setRequestError('');
    setRequestLoading(true);

    if (!vendorId) {
      setEnquiries([]);
      setUsingDemoEnquiries(true);
      setRequestsNotice('Sign in as a vendor to review live booking enquiries.');
      setRequestLoading(false);
      return;
    }

    const { data, error } = await db.bookings.listByVendor(vendorId);
    if (error) {
      setRequestError('We could not load booking enquiries. Please retry.');
      setEnquiries([]);
      setRequestLoading(false);
      return;
    }

    const rows = (data ?? []).filter((b) => {
      const listing = b.listings as { module?: string; title?: string } | null;
      return listing?.module === MODULE_ID && b.status === 'pending_vendor';
    });

    if (rows.length === 0) {
      setEnquiries([]);
      setUsingDemoEnquiries(false);
      setRequestsNotice('No enquiries pending right now.');
    } else {
      setEnquiries(
        rows.map((b) => {
          const listing = b.listings as { title?: string } | null;
          const profile = b.user_profiles as { full_name?: string } | null;
          const corp = b.corporate_accounts as { name?: string } | null;
          return {
            id: b.id,
            listingTitle: listing?.title ?? 'Event activity',
            bookerName: profile?.full_name ?? 'Corporate booker',
            corporateName: corp?.name ?? 'Corporate account',
            status: b.status,
            createdAt: formatDate(new Date(b.created_at)),
            amount: b.total_amount ?? null,
          };
        }),
      );
      setUsingDemoEnquiries(false);
      setRequestsNotice(`${rows.length} enquir${rows.length === 1 ? 'y' : 'ies'} awaiting your response.`);
    }
    setRequestLoading(false);
  }, [vendorId]);

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setSubmitSuccess('Activity removed (demo).');
  };
  const duplicateActivity = (id: string) =>
    setActivities((prev) => {
      const src = prev.find((x) => x.id === id);
      if (!src) return prev;
      return [{ ...src, id: `ea-${Date.now()}`, title: `${src.title} (Copy)`, status: 'Draft', createdAt: formatDate(new Date()) }, ...prev];
    });
  const togglePauseActivate = async (id: string) => {
    const row = activities.find((x) => x.id === id);
    if (!row) return;
    if (vendorId && isListingUuid(id)) {
      const next: ListingStatus = row.status === 'Active' ? 'paused' : 'active';
      const { error } = await db.listings.updateStatus(id, next);
      if (error) {
        setSubmitError(error.message);
        return;
      }
      await loadActivities();
      return;
    }
    setActivities((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: x.status === 'Active' ? 'Paused' : 'Active' } : x)),
    );
  };

  const closePreview = () => setPreviewTitle('');

  return (
    <>
      <VendorAppShell
        activeNav="event-activity"
        routeSource="vendor-event-activity"
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
        headerEnd={
          <>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
              onClick={() => setSubmitError('Help is not wired in this demo screen yet.')}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Open communication and notifications"
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
              onClick={() =>
                navigate('/vendor/communication', {
                  state: { source: 'vendor-event-activity-header', channel: 'notifications' },
                })
              }
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
                3
              </span>
            </button>
            <VendorTopRightMenu />
          </>
        }
      >
        <main className="min-h-full w-full bg-transparent">
          {uiNotice ? (
            <p
              className="border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:px-6"
              role="status"
            >
              {uiNotice}
            </p>
          ) : null}

          {usingDemo && !loading ? <DevMockDataBanner /> : null}

          <div className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === 'catalog'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Activities
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('requests');
                  openRequests();
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === 'requests'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Enquiries
              </button>
            </div>

            {activeTab === 'catalog' && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">Events activity</h1>
                    <p className="text-sm text-slate-500">
                      {loading ? 'Loading…' : `Total ${filtered.length}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError('');
                      setSubmitSuccess('');
                      setTitle('');
                      setTitleError('');
                      setTeamSize('10');
                      setTeamSizeError('');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                    <option value="all">Status: All</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                    <option value="all">Category: All</option>
                    <option value="Indoor Fun">Indoor Fun</option>
                    <option value="Outdoor Adventure">Outdoor Adventure</option>
                    <option value="Sports">Sports</option>
                    <option value="Team Building">Team Building</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>

                {loading ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100" />
                    <p className="text-sm font-medium text-slate-700">Loading event activities…</p>
                  </div>
                ) : loadError ? (
                  <div className="rounded-lg border border-red-200 bg-white p-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-red-50 p-2">
                        <X className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-700">{loadError}</p>
                        <p className="mt-1 text-xs text-slate-500">Try again to refresh the listing.</p>
                        <button
                          type="button"
                          onClick={handleRetryLoad}
                          className="mt-3 inline-flex rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                    <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No activities found</p>
                    <p className="mt-1 text-sm text-slate-500">Create one to start receiving corporate enquiries.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {filtered.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900 truncate">{a.title}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                a.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : a.status === 'Draft'
                                    ? 'bg-slate-50 text-slate-600'
                                    : a.status === 'Rejected'
                                      ? 'bg-red-50 text-red-800'
                                      : a.status === 'Pending'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {a.status === 'Pending' ? 'Pending review' : a.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {a.category} • Team size: {a.teamSize}
                          </p>
                          <p className="text-[11px] text-slate-400">{a.createdAt}</p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3 items-center">
                          {a.status === 'Rejected' && a.rejection ? (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectionListing(toRejectionListing(a)!);
                                setRejectionOpen(true);
                              }}
                              className="text-xs font-semibold text-[#2563eb] hover:underline"
                            >
                              View Reason
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              setPerformanceListing(toPerformanceListing(a));
                              setPerformanceOpen(true);
                            }}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
                            title="View Performance Stats"
                            aria-label="View Performance Stats"
                          >
                            <BarChart2 className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewTitle(a.title)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Preview"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {(a.status === 'Active' || a.status === 'Paused') && (
                            <button
                              type="button"
                              onClick={() => togglePauseActivate(a.id)}
                              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                              title={a.status === 'Active' ? 'Pause' : 'Activate'}
                            >
                              {a.status === 'Active' ? 'Pause' : 'Activate'}
                            </button>
                          )}
                          {a.status === 'Draft' && (
                            <button
                              type="button"
                              onClick={() => submitForReview(a.id)}
                              className="rounded-md bg-[#2563EB] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Submit for review
                            </button>
                          )}
                          {a.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => withdrawFromReview(a.id)}
                              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                              title="Withdraw"
                            >
                              Withdraw
                            </button>
                          )}
                          {a.status === 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => resubmitListing(a.id)}
                              className="rounded-md bg-[#2563EB] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Resubmit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => duplicateActivity(a.id)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Duplicate"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            disabled={a.status !== 'Draft' && a.status !== 'Rejected'}
                            onClick={() => deleteActivity(a.id)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                            title="Remove (demo)"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div ref={createFormRef} className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-semibold text-slate-900">Add activity</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Used for corporate “events activity” enquiries (demo).
                  </p>

                  {submitError && (
                    <p className="mt-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="status">
                      {submitError}
                    </p>
                  )}
                  {submitSuccess && (
                    <p className="mt-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2" role="status">
                      {submitSuccess}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Title*</label>
                      <input
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setTitleError('');
                          setSubmitError('');
                          setSubmitSuccess('');
                        }}
                        placeholder="e.g., Team Building Escape Challenge"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      {titleError && <p className="mt-1 text-[11px] text-red-700">{titleError}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Category*</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as VendorEventActivity['category'])}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      >
                        <option value="Indoor Fun">Indoor Fun</option>
                        <option value="Outdoor Adventure">Outdoor Adventure</option>
                        <option value="Sports">Sports</option>
                        <option value="Team Building">Team Building</option>
                        <option value="Wellness">Wellness</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Team size*</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={teamSize}
                        onChange={(e) => {
                          setTeamSize(e.target.value);
                          setTeamSizeError('');
                          setSubmitError('');
                          setSubmitSuccess('');
                        }}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      {teamSizeError && <p className="mt-1 text-[11px] text-red-700">{teamSizeError}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Price label</label>
                      <input
                        value={pricePerUnitLabel}
                        onChange={(e) => setPricePerUnitLabel(e.target.value)}
                        placeholder="e.g., ₹2,000/hr per team"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={submitting}
                      className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submitting ? 'Saving…' : 'Create activity'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'requests' && (
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">Booking enquiries</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review pending event activity bookings from corporate clients.
                </p>

                {usingDemoEnquiries && !requestLoading ? <DevMockDataBanner /> : null}

                {requestLoading ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                    <Loader2 className="mx-auto mb-3 size-8 animate-spin text-[#2563EB]" />
                    <p className="text-sm font-medium text-slate-700">Loading enquiries…</p>
                  </div>
                ) : requestError ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
                    <p className="text-sm font-medium text-red-700">{requestError}</p>
                    <button
                      type="button"
                      onClick={openRequests}
                      className="mt-3 inline-flex rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    {requestsNotice ? (
                      <p className="text-sm text-slate-700">{requestsNotice}</p>
                    ) : (
                      <p className="text-sm text-slate-500">Choose “Enquiries” to load your request list.</p>
                    )}

                    {enquiries.length > 0 ? (
                      <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {enquiries.map((enq) => (
                          <li key={enq.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{enq.listingTitle}</p>
                              <p className="text-xs text-slate-500">
                                {enq.bookerName} · {enq.corporateName} · {enq.createdAt}
                              </p>
                              {enq.amount != null ? (
                                <p className="mt-1 text-xs font-medium text-[#2563EB]">
                                  ₹{enq.amount.toLocaleString('en-IN')}
                                </p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(`/vendor/booking-requests/${enq.id}`)}
                              className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Review
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </VendorAppShell>

      <VendorRejectionFeedbackDrawer
        open={rejectionOpen}
        onClose={() => {
          setRejectionOpen(false);
          clearVendorQuery();
        }}
        listing={rejectionListing}
        onEditResubmit={(listingId, notes) => {
          setActivities((prev) => {
            const row = prev.find((x) => x.id === listingId);
            if (row) {
              setTitle(row.title);
              setCategory(row.category);
              setTeamSize(String(row.teamSize));
              setPricePerUnitLabel(row.pricePerUnitLabel);
            }
            return prev.map((x) =>
              x.id === listingId ? { ...x, resubmission_notes: notes, status: 'Draft' as const, rejection: undefined } : x,
            );
          });
          createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onToast={(msg) => setSubmitSuccess(msg)}
      />
      <VendorPerformanceStatsDrawer
        open={performanceOpen}
        onClose={() => {
          setPerformanceOpen(false);
          clearVendorQuery();
        }}
        listing={performanceListing}
        onEditListing={(listingId) => {
          const row = activities.find((x) => x.id === listingId);
          if (row) {
            setTitle(row.title);
            setCategory(row.category);
            setTeamSize(String(row.teamSize));
            setPricePerUnitLabel(row.pricePerUnitLabel);
          }
          createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      {previewTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Activity preview</h3>
              <button
                type="button"
                onClick={closePreview}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-900">{previewTitle}</p>
            <p className="mt-2 text-sm text-slate-600">
              This is a demo preview screen. In the next iteration, we’ll show full activity details and booking settings.
            </p>
            <button
              type="button"
              onClick={closePreview}
              className="mt-6 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}


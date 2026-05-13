import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BarChart2, Bell, Calendar, Eye, FileText, HelpCircle, Megaphone, Plus, Search, Trash2, X } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import { VendorRejectionFeedbackDrawer, type VendorRejectionListing } from './vendor/VendorRejectionFeedbackDrawer';
import { VendorPerformanceStatsDrawer, type VendorPerformanceListing } from './vendor/VendorPerformanceStatsDrawer';
import type { RejectionReasonCategory } from '@/app/lib/vendorRejectionChecklist';

const COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=200';

type VendorEventService = {
  id: string;
  title: string;
  category: 'conference' | 'corporate-events' | 'workshops';
  capacity: number;
  status: 'Active' | 'Draft' | 'Paused' | 'Rejected';
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

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function VendorEventsServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const createFormRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [services, setServices] = useState<VendorEventService[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | VendorEventService['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VendorEventService['category']>('all');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VendorEventService['category']>('conference');
  const [capacity, setCapacity] = useState<string>('100');

  const [description, setDescription] = useState(''); // currently informational (future wiring)
  const [capacityError, setCapacityError] = useState('');
  const [titleError, setTitleError] = useState('');

  const [requestsNotice, setRequestsNotice] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [rejectionListing, setRejectionListing] = useState<VendorRejectionListing | null>(null);
  const [performanceListing, setPerformanceListing] = useState<VendorPerformanceListing | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter(
      (s) =>
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.status.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || s.status === statusFilter) &&
        (categoryFilter === 'all' || s.category === categoryFilter),
    );
  }, [services, search, statusFilter, categoryFilter]);

  const toRejectionListing = (s: VendorEventService): VendorRejectionListing | null => {
    if (s.status !== 'Rejected' || !s.rejection) return null;
    return {
      id: s.id,
      title: s.title,
      categoryLabel: s.category.replace(/-/g, ' '),
      coverUrl: s.coverUrl,
      submissionDate: s.rejection.submissionDate,
      rejectionDate: s.rejection.rejectionDate,
      reasonCategory: s.rejection.reasonCategory,
      rejectionReason: s.rejection.rejectionReason,
      resubmission_notes: s.resubmission_notes,
    };
  };

  const toPerformanceListing = (s: VendorEventService): VendorPerformanceListing => ({
    id: s.id,
    title: s.title,
    categoryLabel: s.category.replace(/-/g, ' '),
    coverUrl: s.coverUrl,
    status: s.status,
    hasAddOns: s.hasAddOns,
  });

  const clearVendorQuery = () => {
    if (searchParams.get('rejection') || searchParams.get('stats')) setSearchParams({});
  };

  useEffect(() => {
    const r = searchParams.get('rejection');
    const st = searchParams.get('stats');
    if (!services.length) return;
    if (r) {
      const row = services.find((x) => x.id === r);
      const mapped = row ? toRejectionListing(row) : null;
      if (mapped) {
        setRejectionListing(mapped);
        setRejectionOpen(true);
        setPerformanceOpen(false);
      }
    }
    if (st) {
      const row = services.find((x) => x.id === st);
      if (row) {
        setPerformanceListing(toPerformanceListing(row));
        setPerformanceOpen(true);
        setRejectionOpen(false);
      }
    }
  }, [searchParams, services]);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    const t = window.setTimeout(() => {
      // Demo fetch: either show a list or an error.
      const fail = Math.random() < 0.08;
      if (fail) {
        setLoadError('Unable to load your event services right now. Please retry.');
        setLoading(false);
        return;
      }

      setServices([
        {
          id: 'es-1',
          title: 'Corporate Conference Facilities',
          category: 'conference',
          capacity: 250,
          status: 'Active',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 18)),
          coverUrl: COVER_PLACEHOLDER,
          hasAddOns: true,
        },
        {
          id: 'es-2',
          title: 'Boardroom + AV Package',
          category: 'corporate-events',
          capacity: 80,
          status: 'Draft',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)),
          coverUrl: COVER_PLACEHOLDER,
          hasAddOns: true,
        },
        {
          id: 'es-rejected-1',
          title: 'Rooftop Networking Mixer',
          category: 'corporate-events',
          capacity: 120,
          status: 'Rejected',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)),
          coverUrl: COVER_PLACEHOLDER,
          hasAddOns: false,
          rejection: {
            submissionDate: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)),
            rejectionDate: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)),
            reasonCategory: 'Incomplete Information',
            rejectionReason:
              'The description needs more detail on AV inclusions and catering options. Please also confirm fire capacity for the terrace.',
          },
        },
      ]);
      setLoading(false);
    }, 650);

    return () => window.clearTimeout(t);
  }, []);

  const resetForm = () => {
    setTitle('');
    setCategory('conference');
    setCapacity('100');
    setDescription('');
    setTitleError('');
    setCapacityError('');
    setSubmitError('');
    setSubmitSuccess('');
  };

  const validate = () => {
    let ok = true;
    setSubmitError('');
    setSubmitSuccess('');
    setTitleError('');
    setCapacityError('');

    const t = title.trim();
    if (!t) {
      setTitleError('Please enter a title for the service.');
      ok = false;
    }

    const cap = Number(capacity);
    if (!capacity || Number.isNaN(cap) || cap < 1) {
      setCapacityError('Capacity must be a positive number.');
      ok = false;
    }

    if (!ok) setSubmitError('Fix the highlighted fields and try again.');
    return ok;
  };

  const submit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setRequestsNotice('');
    setRequestError('');

    window.setTimeout(() => {
      const cap = Number(capacity);
      const now = new Date();
      const row: VendorEventService = {
        id: `es-${now.getTime()}`,
        title: title.trim(),
        category,
        capacity: cap,
        status: 'Active',
        createdAt: formatDate(now),
        coverUrl: COVER_PLACEHOLDER,
        hasAddOns: true,
      };
      setServices((prev) => [row, ...prev]);
      setSubmitSuccess('Event service created. You can pause or edit it in a future release.');
      setSubmitting(false);
      setTitle('');
      setCapacity('100');
      setDescription('');
    }, 900);
  };

  const handleRetryLoad = () => {
    setLoading(true);
    setLoadError('');
    setServices([]);
    setSubmitError('');
    setSubmitSuccess('');
    // Re-run fetch
    const t = window.setTimeout(() => {
      setServices([
        {
          id: 'es-1',
          title: 'Corporate Conference Facilities',
          category: 'conference',
          capacity: 250,
          status: 'Active',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 18)),
          coverUrl: COVER_PLACEHOLDER,
          hasAddOns: true,
        },
      ]);
      setLoading(false);
    }, 650);
  };

  const openRequests = () => {
    setRequestsNotice('');
    setRequestLoading(true);
    setRequestError('');

    window.setTimeout(() => {
      // Demo: sometimes show empty, sometimes show error.
      const r = Math.random();
      if (r < 0.12) {
        setRequestError('We could not load booking requests. Please retry.');
        setRequestLoading(false);
        return;
      }
      if (r < 0.35) {
        setRequestsNotice('No pending booking requests right now.');
        setRequestLoading(false);
        return;
      }
      setRequestsNotice('2 booking requests are ready to review (demo).');
      setRequestLoading(false);
    }, 750);
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setSubmitSuccess('Service removed (demo).');
  };
  const duplicateService = (id: string) =>
    setServices((prev) => {
      const src = prev.find((x) => x.id === id);
      if (!src) return prev;
      return [{ ...src, id: `es-${Date.now()}`, title: `${src.title} (Copy)`, status: 'Draft', createdAt: formatDate(new Date()) }, ...prev];
    });
  const togglePauseActivate = (id: string) =>
    setServices((prev) => prev.map((x) => (x.id === id ? { ...x, status: x.status === 'Active' ? 'Paused' : 'Active' } : x)));

  return (
    <VendorAppShell
      activeNav="events-services"
      routeSource="vendor-events-services"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event services"
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
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            onClick={() => navigate('/vendor/calendar')}
            aria-label="Open calendar"
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

        <div className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === 'services'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Services
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

            {activeTab === 'services' && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">Event services</h1>
                    <p className="text-sm text-slate-500">{loading ? 'Loading…' : `Total ${filtered.length}`}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError('');
                      setSubmitSuccess('');
                      setTitle('');
                      setCapacity('100');
                      setDescription('');
                      setTitleError('');
                      setCapacityError('');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add new
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                    <option value="all">Status: All</option>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                    <option value="all">Category: All</option>
                    <option value="conference">conference</option>
                    <option value="corporate-events">corporate-events</option>
                    <option value="workshops">workshops</option>
                  </select>
                </div>

                {loading ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100" />
                    <p className="text-sm font-medium text-slate-700">Loading event services…</p>
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
                    <p className="text-sm font-medium text-slate-700">No event services found</p>
                    <p className="mt-1 text-sm text-slate-500">Create a service to start receiving enquiries.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {filtered.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900 truncate">{s.title}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                s.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : s.status === 'Draft'
                                    ? 'bg-slate-50 text-slate-600'
                                    : s.status === 'Rejected'
                                      ? 'bg-red-50 text-red-800'
                                      : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {s.category.replace('-', ' ')} • Capacity: {s.capacity}
                          </p>
                          <p className="text-[11px] text-slate-400">{s.createdAt}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3 items-center">
                          {s.status === 'Rejected' && s.rejection ? (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectionListing(toRejectionListing(s)!);
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
                              setPerformanceListing(toPerformanceListing(s));
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
                            onClick={() => setSubmitSuccess(`Preview opened for: ${s.title} (demo).`)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Preview"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePauseActivate(s.id)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            title={s.status === 'Active' ? 'Pause' : 'Activate'}
                          >
                            {s.status === 'Active' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateService(s.id)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Duplicate"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            disabled={s.status !== 'Draft'}
                            onClick={() => deleteService(s.id)}
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
                  <h2 className="text-sm font-semibold text-slate-900">Create event service</h2>
                  <p className="mt-1 text-xs text-slate-500">Used for corporate event enquiries and bookings (demo).</p>

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
                      <label className="block text-xs font-medium text-slate-700 mb-1">Service title*</label>
                      <input
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setTitleError('');
                          setSubmitError('');
                          setSubmitSuccess('');
                        }}
                        placeholder="e.g., Corporate Conference Facilities"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      {titleError && <p className="mt-1 text-[11px] text-red-700">{titleError}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Category*</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as VendorEventService['category'])}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      >
                        <option value="conference">conference</option>
                        <option value="corporate-events">corporate-events</option>
                        <option value="workshops">workshops</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Capacity (seats)*</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={capacity}
                        onChange={(e) => {
                          setCapacity(e.target.value);
                          setCapacityError('');
                          setSubmitError('');
                          setSubmitSuccess('');
                        }}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      {capacityError && <p className="mt-1 text-[11px] text-red-700">{capacityError}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional details shown in enquiry summaries (demo)"
                        rows={3}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
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
                      {submitting ? 'Saving…' : 'Create service'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'requests' && (
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">Booking enquiries</h2>
                <p className="mt-1 text-xs text-slate-500">Review and respond to corporate event requests (demo).</p>

                {requestLoading ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
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
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setRequestsNotice('Accepted (demo). The corporate portal will be notified in a future release.')}
                        className="flex-1 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Review & accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestsNotice('Declined (demo). You can submit a counter-offer later.')}
                        className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </main>
      <VendorRejectionFeedbackDrawer
        open={rejectionOpen}
        onClose={() => {
          setRejectionOpen(false);
          clearVendorQuery();
        }}
        listing={rejectionListing}
        onEditResubmit={(listingId, notes) => {
          setServices((prev) => {
            const row = prev.find((x) => x.id === listingId);
            if (row) {
              setTitle(row.title);
              setCategory(row.category);
              setCapacity(String(row.capacity));
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
          const row = services.find((x) => x.id === listingId);
          if (row) {
            setTitle(row.title);
            setCategory(row.category);
            setCapacity(String(row.capacity));
          }
          createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
    </VendorAppShell>
  );
}


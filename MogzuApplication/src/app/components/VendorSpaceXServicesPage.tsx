import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Calendar, Eye, FileText, HelpCircle, Megaphone, Plus, Search, Trash2, X } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';

type VendorSpaceListing = {
  id: string;
  title: string;
  category: 'conference' | 'corporate-events' | 'casual';
  capacity: number;
  pricingType: 'transparent' | 'offer' | 'on_request';
  status: 'Active' | 'Draft' | 'Paused';
  createdAt: string;
};

type BookingRequest = {
  id: string;
  serviceTitle: string;
  date: string;
  teamSize: number;
  status: 'Pending' | 'Accepted' | 'Declined';
};

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function VendorSpaceXServicesPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [listings, setListings] = useState<VendorSpaceListing[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | VendorSpaceListing['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VendorSpaceListing['category']>('all');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'created'>('created');

  const [listTitle, setListTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [category, setCategory] = useState<VendorSpaceListing['category']>('conference');
  const [capacity, setCapacity] = useState<string>('100');
  const [capacityError, setCapacityError] = useState('');
  const [pricingType, setPricingType] = useState<VendorSpaceListing['pricingType']>('transparent');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestsNotice, setRequestsNotice] = useState('');
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const [previewTitle, setPreviewTitle] = useState<string>('');
  const closePreview = () => setPreviewTitle('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = listings.filter(
      (s) =>
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.status.toLowerCase().includes(q) ||
          String(s.capacity).includes(q)) &&
        (statusFilter === 'all' || s.status === statusFilter) &&
        (categoryFilter === 'all' || s.category === categoryFilter),
    );
    return [...base].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [listings, search, statusFilter, categoryFilter, sortBy]);

  useEffect(() => {
    setLoading(true);
    setLoadError('');

    const t = window.setTimeout(() => {
      const fail = Math.random() < 0.08;
      if (fail) {
        setLoadError('Unable to load your spaces right now. Please retry.');
        setLoading(false);
        return;
      }

      setListings([
        {
          id: 'sx-1',
          title: 'Premium Conference Rooms',
          category: 'conference',
          capacity: 120,
          pricingType: 'transparent',
          status: 'Active',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 11)),
        },
        {
          id: 'sx-2',
          title: 'Corporate Event Venue (AV Included)',
          category: 'corporate-events',
          capacity: 350,
          pricingType: 'offer',
          status: 'Draft',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 6)),
        },
      ]);
      setLoading(false);
    }, 650);

    return () => window.clearTimeout(t);
  }, []);

  const resetForm = () => {
    setListTitle('');
    setTitleError('');
    setCategory('conference');
    setCapacity('100');
    setCapacityError('');
    setPricingType('transparent');
    setSubmitError('');
    setSubmitSuccess('');
  };

  const validate = () => {
    let ok = true;
    setTitleError('');
    setCapacityError('');
    setSubmitError('');
    setSubmitSuccess('');

    const t = listTitle.trim();
    if (!t) {
      setTitleError('Please enter a space title.');
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

  const submitListing = () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    window.setTimeout(() => {
      if (Math.random() < 0.12) {
        setSubmitError('Unable to create the listing right now. Please retry.');
        setSubmitting(false);
        return;
      }

      const cap = Number(capacity);
      const row: VendorSpaceListing = {
        id: `sx-${Date.now()}`,
        title: listTitle.trim(),
        category,
        capacity: cap,
        pricingType,
        status: 'Active',
        createdAt: formatDate(new Date()),
      };

      setListings((prev) => [row, ...prev]);
      setSubmitSuccess('Space listing created. Enquiries will show up in Requests (demo).');
      setSubmitting(false);
      resetForm();
    }, 900);
  };

  const handleRetryLoad = () => {
    setLoading(true);
    setLoadError('');
    setListings([]);

    const t = window.setTimeout(() => {
      setListings([
        {
          id: 'sx-1',
          title: 'Premium Conference Rooms',
          category: 'conference',
          capacity: 120,
          pricingType: 'transparent',
          status: 'Active',
          createdAt: formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 11)),
        },
      ]);
      setLoading(false);
    }, 650);
  };

  const openRequests = () => {
    setRequestLoading(true);
    setRequestError('');
    setRequestsNotice('');
    setRequests([]);

    window.setTimeout(() => {
      const r = Math.random();
      if (r < 0.12) {
        setRequestError('Unable to load booking requests right now. Please retry.');
        setRequestLoading(false);
        return;
      }
      if (r < 0.35) {
        setRequestsNotice('No pending booking requests right now.');
        setRequestLoading(false);
        return;
      }

      setRequests([
        {
          id: 'br-1',
          serviceTitle: 'Premium Conference Rooms',
          date: 'Jul 15, 2024',
          teamSize: 60,
          status: 'Pending',
        },
        {
          id: 'br-2',
          serviceTitle: 'Corporate Event Venue (AV Included)',
          date: 'Jul 22, 2024',
          teamSize: 180,
          status: 'Pending',
        },
      ]);
      setRequestsNotice('2 booking requests ready to review (demo).');
      setRequestLoading(false);
    }, 750);
  };

  const updateRequestStatus = (id: string, status: BookingRequest['status']) => {
    setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    setRequestsNotice(
      status === 'Accepted'
        ? 'Request accepted (demo). The corporate portal will be notified in a future release.'
        : status === 'Declined'
          ? 'Request declined (demo). The corporate portal will be notified in a future release.'
          : 'Request updated (demo).',
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((s) => s.id !== id));
    setSubmitSuccess('Listing removed (demo).');
  };
  const togglePauseActivate = (id: string) =>
    setListings((prev) => prev.map((row) => row.id === id ? { ...row, status: row.status === 'Active' ? 'Paused' : 'Active' } : row));
  const duplicateListing = (id: string) =>
    setListings((prev) => {
      const src = prev.find((x) => x.id === id);
      if (!src) return prev;
      return [{ ...src, id: `sx-${Date.now()}`, title: `${src.title} (Copy)`, status: 'Draft', createdAt: formatDate(new Date()) }, ...prev];
    });

  return (
    <>
      <VendorAppShell
        activeNav="spacex"
        routeSource="vendor-spacex-services"
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search D Space listings"
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
                onClick={() => setActiveTab('listings')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === 'listings'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Spaces
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
                Requests
              </button>
            </div>

            {activeTab === 'listings' && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">D Space listings</h1>
                    <p className="text-sm text-slate-500">
                      {loading ? 'Loading…' : `Total ${filtered.length}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError('');
                      setSubmitSuccess('');
                      setListTitle('');
                      setTitleError('');
                      setCategory('conference');
                      setCapacity('100');
                      setCapacityError('');
                      setPricingType('transparent');
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
                  </select>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                    <option value="all">Category: All</option>
                    <option value="conference">conference</option>
                    <option value="corporate-events">corporate-events</option>
                    <option value="casual">casual</option>
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                    <option value="created">Sort: Created</option>
                    <option value="title">Sort: Title</option>
                    <option value="status">Sort: Status</option>
                  </select>
                </div>

                {loading ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100" />
                    <p className="text-sm font-medium text-slate-700">Loading spaces…</p>
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
                    <p className="text-sm font-medium text-slate-700">No spaces found</p>
                    <p className="mt-1 text-sm text-slate-500">Create a listing to start receiving corporate bookings.</p>
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
                                    : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {s.category} • Capacity {s.capacity}
                          </p>
                          <p className="text-[11px] text-slate-400">{s.createdAt}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3 items-center">
                          <button
                            type="button"
                            onClick={() => setPreviewTitle(s.title)}
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
                            onClick={() => duplicateListing(s.id)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Duplicate"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            disabled={s.status !== 'Draft'}
                            onClick={() => deleteListing(s.id)}
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

                <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-semibold text-slate-900">Create space listing</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Used for corporate space bookings (demo).
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
                      <label className="block text-xs font-medium text-slate-700 mb-1">Listing title*</label>
                      <input
                        value={listTitle}
                        onChange={(e) => {
                          setListTitle(e.target.value);
                          setTitleError('');
                          setSubmitError('');
                          setSubmitSuccess('');
                        }}
                        placeholder="e.g., Executive Meeting Spaces"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                      {titleError && <p className="mt-1 text-[11px] text-red-700">{titleError}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Category*</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as VendorSpaceListing['category'])}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      >
                        <option value="conference">conference</option>
                        <option value="corporate-events">corporate-events</option>
                        <option value="casual">casual</option>
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
                      <label className="block text-xs font-medium text-slate-700 mb-1">Pricing type</label>
                      <select
                        value={pricingType}
                        onChange={(e) => setPricingType(e.target.value as VendorSpaceListing['pricingType'])}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      >
                        <option value="transparent">transparent</option>
                        <option value="offer">offer</option>
                        <option value="on_request">on_request</option>
                      </select>
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
                      onClick={submitListing}
                      disabled={submitting}
                      className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submitting ? 'Saving…' : 'Create listing'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'requests' && (
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">Space booking enquiries</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review and accept/decline corporate booking requests (demo).
                </p>

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
                      <p className="text-sm text-slate-500">Choose “Requests” to load your request list.</p>
                    )}

                    <div className="mt-4 space-y-3">
                      {requests.map((r) => (
                        <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{r.serviceTitle}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {r.date} • Team size {r.teamSize}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-xs font-semibold rounded-full px-2 py-1 inline-block ${
                                  r.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-800'
                                    : r.status === 'Accepted'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {r.status}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(r.id, 'Accepted')}
                              disabled={r.status !== 'Pending'}
                              className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(r.id, 'Declined')}
                              disabled={r.status !== 'Pending'}
                              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </VendorAppShell>

      {previewTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Listing preview</h3>
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
              Demo preview screen. In the next iteration, we’ll add full booking configuration + media details.
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


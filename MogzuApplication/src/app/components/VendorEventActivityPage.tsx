import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BarChart2, Bell, Calendar, Eye, FileText, HelpCircle, Megaphone, Plus, Search, Trash2, X } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import { VendorRejectionFeedbackDrawer, type VendorRejectionListing } from './vendor/VendorRejectionFeedbackDrawer';
import { VendorPerformanceStatsDrawer, type VendorPerformanceListing } from './vendor/VendorPerformanceStatsDrawer';
import type { RejectionReasonCategory } from '@/app/lib/vendorRejectionChecklist';

const COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=200';

type VendorEventActivity = {
  id: string;
  title: string;
  category: 'Indoor Fun' | 'Outdoor Adventure' | 'Sports' | 'Team Building' | 'Wellness';
  teamSize: number;
  pricePerUnitLabel: string;
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

export default function VendorEventActivityPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const createFormRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
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

  useEffect(() => {
    setLoading(true);
    setLoadError('');

    const t = window.setTimeout(() => {
      const fail = Math.random() < 0.08;
      if (fail) {
        setLoadError('Unable to load vendor event activities right now. Please retry.');
        setLoading(false);
        return;
      }

      setActivities([
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
            rejectionReason: 'Please upload at least three high-resolution photos of your venue and one cover image in landscape orientation.',
          },
        },
      ]);

      // Sometimes start empty (demo)
      if (Math.random() < 0.15) setActivities([]);
      setLoading(false);
    }, 650);

    return () => window.clearTimeout(t);
  }, []);

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

  const submit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    window.setTimeout(() => {
      if (Math.random() < 0.12) {
        setSubmitError('Unable to create this activity right now. Please retry.');
        setSubmitting(false);
        return;
      }

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
    }, 900);
  };

  const handleRetryLoad = () => {
    setLoading(true);
    setLoadError('');
    setActivities([]);
    const t = window.setTimeout(() => {
      setActivities([
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
      ]);
      setLoading(false);
    }, 650);
  };

  const openRequests = () => {
    setRequestsNotice('');
    setRequestError('');
    setRequestLoading(true);

    window.setTimeout(() => {
      const r = Math.random();
      if (r < 0.12) {
        setRequestError('We could not load booking enquiries. Please retry.');
        setRequestLoading(false);
        return;
      }
      if (r < 0.35) {
        setRequestsNotice('No enquiries pending right now.');
        setRequestLoading(false);
        return;
      }
      setRequestsNotice('3 enquiries ready to review (demo).');
      setRequestLoading(false);
    }, 750);
  };

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
  const togglePauseActivate = (id: string) =>
    setActivities((prev) => prev.map((x) => (x.id === id ? { ...x, status: x.status === 'Active' ? 'Paused' : 'Active' } : x)));

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
                                      : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {a.status}
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
                          <button
                            type="button"
                            onClick={() => togglePauseActivate(a.id)}
                            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            title={a.status === 'Active' ? 'Pause' : 'Activate'}
                          >
                            {a.status === 'Active' ? 'Pause' : 'Activate'}
                          </button>
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
                            disabled={a.status !== 'Draft'}
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
                <p className="mt-1 text-xs text-slate-500">Review and respond to vendor event activity enquiries (demo).</p>

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
                        onClick={() => setRequestsNotice('Declined (demo). You can send a counter-offer later.')}
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


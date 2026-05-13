import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Bell, ChevronLeft, HelpCircle, Search, Trash2, X } from 'lucide-react';
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
  title: string;
  date: string;
  teamSize: number;
  status: 'Pending' | 'Accepted' | 'Declined';
};

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function VendorSpaceXDetailsPage() {
  const navigate = useNavigate();
  const { spaceId = 'sx-1' } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [space, setSpace] = useState<VendorSpaceListing | null>(null);

  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [requestsNotice, setRequestsNotice] = useState('');

  const [responseNotice, setResponseNotice] = useState('');
  const [helpNotice, setHelpNotice] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        String(r.teamSize).includes(q) ||
        r.date.toLowerCase().includes(q),
    );
  }, [requests, search]);

  const fetchAll = () => {
    setLoading(true);
    setLoadError('');
    setSpace(null);
    setRequests([]);
    setResponseNotice('');
    setHelpNotice('');

    window.setTimeout(() => {
      const fail = Math.random() < 0.08;
      if (fail) {
        setLoadError('Unable to load this space listing. Please retry.');
        setLoading(false);
        return;
      }

      const now = new Date();
      setSpace({
        id: spaceId,
        title: `D Space listing for ${spaceId.toString()}`,
        category: 'conference',
        capacity: 120,
        pricingType: 'transparent',
        status: 'Active',
        createdAt: formatDate(now),
      });
      setLoading(false);
    }, 650);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId]);

  useEffect(() => {
    if (!space) return;
    setRequestsLoading(true);
    setRequestsError('');
    setRequestsNotice('');

    const t = window.setTimeout(() => {
      const fail = Math.random() < 0.1;
      if (fail) {
        setRequestsError('Could not load booking requests for this listing.');
        setRequestsLoading(false);
        return;
      }

      const empty = Math.random() < 0.2;
      if (empty) {
        setRequestsNotice('No booking requests for this space right now.');
        setRequestsLoading(false);
        return;
      }

      setRequests([
        {
          id: 'br-1',
          title: space.title,
          date: 'Jul 15, 2024',
          teamSize: 60,
          status: 'Pending',
        },
        {
          id: 'br-2',
          title: space.title,
          date: 'Jul 22, 2024',
          teamSize: 180,
          status: 'Pending',
        },
      ]);
      setRequestsNotice('');
      setRequestsLoading(false);
    }, 750);

    return () => window.clearTimeout(t);
  }, [space]);

  const retry = () => {
    fetchAll();
  };

  const updateRequestStatus = (id: string, status: BookingRequest['status']) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setResponseNotice(
      status === 'Accepted'
        ? 'Request accepted (demo). The corporate portal will be updated in a future release.'
        : status === 'Declined'
          ? 'Request declined (demo). The corporate portal will be updated in a future release.'
          : 'Request updated (demo).',
    );
  };

  const removeRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setResponseNotice('Request removed from this vendor queue (demo).');
  };

  return (
    <VendorAppShell
      activeNav="spacex"
      routeSource="vendor-spacex-details"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <button
            type="button"
            className="absolute left-1 top-1/2 z-[1] -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-gray-100"
            onClick={() => navigate('/vendor/spacex')}
            aria-label="Back to spaces"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Search className="pointer-events-none absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-[4.25rem] pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
      headerEnd={
        <>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            onClick={() => setHelpNotice('In the next release, you’ll add messages and schedule options for each request.')}
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
                state: { source: 'vendor-spacex-details-header', channel: 'notifications' },
              })
            }
          >
            <Bell className="h-5 w-5" />
          </button>
          <VendorTopRightMenu />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent">
        {helpNotice ? (
          <p className="border-b border-slate-100 bg-white px-4 py-2 text-xs text-slate-600 sm:px-6" role="status">
            {helpNotice}
          </p>
        ) : null}
        {uiNotice ? (
          <p
            className="border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:px-6"
            role="status"
          >
            {uiNotice}
          </p>
        ) : null}

        <div className="p-4 sm:p-6">
            {loading ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100" />
                <p className="text-sm font-medium text-slate-700">Loading space listing…</p>
              </div>
            ) : loadError ? (
              <div className="rounded-lg border border-red-200 bg-white p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-red-50 p-2">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">{loadError}</p>
                    <button
                      type="button"
                      onClick={retry}
                      className="mt-3 inline-flex rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            ) : !space ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-sm font-medium text-slate-700">Space listing not found.</p>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/spacex')}
                  className="mt-4 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Back to Spaces
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">{space.title}</h1>
                    <p className="text-sm text-slate-500">
                      {space.category.replace('-', ' ')} • Capacity: {space.capacity}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{space.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResponseNotice('Pricing settings editing will be enabled in a future release.')}
                      className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/vendor/communication')}
                      className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Message
                    </button>
                  </div>
                </div>

                {responseNotice && (
                  <p className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-800" role="status">
                    {responseNotice}
                  </p>
                )}

                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">Booking enquiries</h2>
                    <div className="text-xs text-slate-500">
                      {requests.length ? `${requests.length} request${requests.length !== 1 ? 's' : ''}` : '—'}
                    </div>
                  </div>

                  {requestsLoading ? (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                      <p className="text-sm font-medium text-slate-700">Loading enquiries…</p>
                    </div>
                  ) : requestsError ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
                      <p className="text-sm font-medium text-red-700">{requestsError}</p>
                      <button
                        type="button"
                        onClick={retry}
                        className="mt-3 inline-flex rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Retry
                      </button>
                    </div>
                  ) : requestsNotice && requests.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                      <p className="text-sm font-medium text-slate-700">{requestsNotice}</p>
                      <p className="mt-1 text-xs text-slate-500">Check back after your next corporate marketing update.</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {filteredRequests.map((r) => (
                        <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {r.date} • Team size {r.teamSize}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                                  r.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-800'
                                    : r.status === 'Accepted'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
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
                            <button
                              type="button"
                              onClick={() => removeRequest(r.id)}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                              title="Remove (demo)"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredRequests.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                          <p className="text-sm font-medium text-slate-700">No enquiries match your search.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      </main>
    </VendorAppShell>
  );
}


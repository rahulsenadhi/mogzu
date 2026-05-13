import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { CheckCircle, XCircle, Clock, Search, Filter, Eye } from 'lucide-react';
import { VendorStatusBadge } from '/components/ui/VendorStatusBadge.tsx';
import { mapVendorStatusFromBookingStatus } from '/utils/vendorStatusMap.ts';

export default function CorporateApprovalsPage() {
  const navigate = useNavigate();
  const seededApprovals = [
    { id: 'REQ-8821', user: 'Rahul Sharma', department: 'Design', amount: 25000, date: '12 Jul 2024', status: 'pending', description: 'D Space - Coworking BKC' },
    { id: 'REQ-8822', user: 'Sneha Patel', department: 'Engineering', amount: 45000, date: '11 Jul 2024', status: 'pending', description: 'Event - Annual Team Meetup' },
    { id: 'REQ-8810', user: 'Amit Kumar', department: 'Sales', amount: 15000, date: '05 Jul 2024', status: 'approved', description: 'Gifting - Client Hampers' },
    { id: 'REQ-8805', user: 'Priya Singh', department: 'Marketing', amount: 80000, date: '01 Jul 2024', status: 'rejected', description: 'Event - Product Launch Venue' }
  ];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [approvals, setApprovals] = useState(seededApprovals);

  const loadApprovals = () => {
    setIsLoading(true);
    setLoadError('');

    const timer = window.setTimeout(() => {
      if (Math.random() < 0.12) {
        setLoadError('Unable to load approvals right now. Please retry.');
        setIsLoading(false);
        return;
      }

      setApprovals(seededApprovals);
      setIsLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = loadApprovals();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredApprovals = useMemo(() => {
    const byStatus = approvals.filter(app => app.status === activeTab);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((item) =>
      item.id.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }, [approvals, activeTab, searchQuery]);

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="bookings"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search approvals..." />

        <MogzuCorporateScrollSurface>
          <div className="max-w-[1400px] mx-auto px-8 py-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-[32px] font-semibold text-[#0e1e3f] leading-10">Approvals</h1>
                <p className="text-sm text-[#878e9e] mt-1">Manage and review booking requests from your team</p>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                      <VendorStatusBadge
                        status={mapVendorStatusFromBookingStatus('PENDING').displayStatus}
                      />
                    <h3 className="text-2xl font-bold text-gray-900">12</h3>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pending')}
                    className="flex items-center gap-2 p-1.5 text-gray-400 hover:text-[#2563eb] rounded-md hover:bg-blue-50 transition-colors mt-4"
                    aria-label="Show pending requests in the list below"
                    title="View details"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-medium">View details</span>
                  </button>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                      <VendorStatusBadge
                        status={mapVendorStatusFromBookingStatus('CONFIRMED').displayStatus}
                      />
                    <h3 className="text-2xl font-bold text-gray-900">45</h3>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('approved')}
                    className="flex items-center gap-2 p-1.5 text-gray-400 hover:text-[#2563eb] rounded-md hover:bg-blue-50 transition-colors mt-4"
                    aria-label="Show approved requests in the list below"
                    title="View details"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-medium">View details</span>
                  </button>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                      <VendorStatusBadge
                        status={mapVendorStatusFromBookingStatus('CANCELLED').displayStatus}
                      />
                    <h3 className="text-2xl font-bold text-gray-900">3</h3>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rejected')}
                    className="flex items-center gap-2 p-1.5 text-gray-400 hover:text-[#2563eb] rounded-md hover:bg-blue-50 transition-colors mt-4"
                    aria-label="Show rejected requests in the list below"
                    title="View details"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-medium">View details</span>
                  </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-6" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'pending'}
                      className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors -mb-[25px] ${activeTab === 'pending' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setActiveTab('pending')}
                    >
                      Pending Requests
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'approved'}
                      className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors -mb-[25px] ${activeTab === 'approved' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setActiveTab('approved')}
                    >
                      Approved
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'rejected'}
                      className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors -mb-[25px] ${activeTab === 'rejected' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setActiveTab('rejected')}
                    >
                      Rejected
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search ID or Name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveTab('pending');
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {isLoading && (
                  <div className="px-6 py-8 text-sm text-gray-500">Loading approvals...</div>
                )}
                {!isLoading && loadError && (
                  <div className="px-6 py-8">
                    <p className="text-sm text-gray-700 mb-3">{loadError}</p>
                    <button
                      type="button"
                      onClick={loadApprovals}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!isLoading && !loadError && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApprovals.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-[#2563eb]">{item.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{item.user}</p>
                          <p className="text-xs text-gray-500">{item.department}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">₹ {item.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/corporate/approvals/${item.id}`)}
                              className="p-1.5 text-gray-400 hover:text-[#2563eb] rounded-md hover:bg-blue-50 transition-colors"
                              aria-label={`View approval ${item.id}`}
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {activeTab === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/corporate/approvals/${item.id}`, {
                                      state: { intent: 'approve', requestId: item.id },
                                    })
                                  }
                                  className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                  aria-label={`Open approval ${item.id} to approve`}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/corporate/approvals/${item.id}`, {
                                      state: { intent: 'reject', requestId: item.id },
                                    })
                                  }
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                  aria-label={`Open approval ${item.id} to reject`}
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredApprovals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                          No {activeTab} approvals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                )}
              </div>
            </div>

          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
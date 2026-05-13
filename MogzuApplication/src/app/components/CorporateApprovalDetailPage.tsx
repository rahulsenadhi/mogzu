import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ArrowLeft, CheckCircle, Clock, UserCheck, XCircle } from 'lucide-react';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalRequest {
  id: string;
  user: string;
  department: string;
  amount: number;
  date: string;
  status: ApprovalStatus;
  description: string;
  justification: string;
  budgetImpact: string;
  approverComment?: string;
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'REQ-8821',
    user: 'Rahul Sharma',
    department: 'Design',
    amount: 25000,
    date: '12 Jul 2024',
    status: 'pending',
    description: 'D Space - Coworking BKC',
    justification: 'Team needs a collaborative offsite space for product workshop.',
    budgetImpact: 'Within department monthly allocation.',
  },
  {
    id: 'REQ-8822',
    user: 'Sneha Patel',
    department: 'Engineering',
    amount: 45000,
    date: '11 Jul 2024',
    status: 'pending',
    description: 'Event - Annual Team Meetup',
    justification: 'Cross-functional alignment event for Q3 planning.',
    budgetImpact: 'Consumes 35% of remaining quarterly budget.',
  },
  {
    id: 'REQ-8810',
    user: 'Amit Kumar',
    department: 'Sales',
    amount: 15000,
    date: '05 Jul 2024',
    status: 'approved',
    description: 'Gifting - Client Hampers',
    justification: 'Enterprise client retention initiative.',
    budgetImpact: 'Low impact on sales discretionary budget.',
  },
  {
    id: 'REQ-8805',
    user: 'Priya Singh',
    department: 'Marketing',
    amount: 80000,
    date: '01 Jul 2024',
    status: 'rejected',
    description: 'Event - Product Launch Venue',
    justification: 'Premium venue proposal for launch event.',
    budgetImpact: 'Exceeds remaining monthly allocation.',
  },
];

export default function CorporateApprovalDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [delegateTo, setDelegateTo] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequest = () => {
    setIsLoading(true);
    setLoadError('');
    setActionError('');
    setActionSuccess('');

    const timer = window.setTimeout(() => {
      if (searchParams.get('error') === '1' || Math.random() < 0.1) {
        setLoadError('Failed to load request details. Please try again.');
        setRequest(null);
        setIsLoading(false);
        return;
      }

      const found = MOCK_APPROVALS.find((item) => item.id === id);
      setRequest(found ?? null);
      setIsLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = loadRequest();
    return cleanup;
  }, [id, searchParams]);

  const listIntent = (location.state as { intent?: 'approve' | 'reject' } | null)?.intent;

  useEffect(() => {
    if (!request || request.status !== 'pending' || !listIntent) return;
    const section = document.getElementById('corporate-approval-actions');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.requestAnimationFrame(() => {
      if (listIntent === 'approve') {
        document.getElementById('approvalComment')?.focus();
      } else {
        document.getElementById('rejectionReason')?.focus();
      }
    });
  }, [request?.id, request?.status, listIntent]);

  const canTakeAction = useMemo(() => request?.status === 'pending', [request?.status]);

  const handleApprove = () => {
    if (!request || !canTakeAction) return;
    setActionError('');
    setActionSuccess('');
    if (!approvalComment.trim()) {
      setActionError('Approval comment is required for employee visibility.');
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccess('Request approved successfully.');
      setRequest({ ...request, status: 'approved', approverComment: approvalComment.trim() });
    }, 700);
  };

  const handleReject = () => {
    if (!request || !canTakeAction) return;
    setActionError('');
    setActionSuccess('');

    if (!rejectionReason.trim()) {
      setActionError('Rejection reason is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccess('Request rejected and reason captured.');
      setRequest({ ...request, status: 'rejected' });
    }, 700);
  };

  const handleDelegate = () => {
    if (!request || !canTakeAction) return;
    setActionError('');
    setActionSuccess('');

    if (!delegateTo.trim()) {
      setActionError('Select an approver to delegate.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccess(`Request delegated to ${delegateTo}.`);
    }, 700);
  };

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="bookings"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search approvals..."
        />

        <MogzuCorporateScrollSurface>
          <div className="max-w-5xl mx-auto px-6 py-6">
            <button
              type="button"
              onClick={() => navigate('/corporate/approvals')}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to approvals
            </button>

            {isLoading && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-sm text-gray-500">
                Loading approval details...
              </div>
            )}

            {!isLoading && loadError && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <p className="text-sm text-gray-700 mb-4">{loadError}</p>
                <button
                  type="button"
                  onClick={loadRequest}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && !request && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <p className="text-sm text-gray-700 mb-4">No approval request found for this ID.</p>
                <button
                  type="button"
                  onClick={() => navigate('/corporate/approvals')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Return to approvals
                </button>
              </div>
            )}

            {!isLoading && !loadError && request && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">{request.id}</h1>
                      <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700">
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase">Requested by</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{request.user}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase">Department</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{request.department}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase">Amount</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">₹ {request.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Request context</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Justification</p>
                      <p className="text-sm text-gray-700 mt-1">{request.justification}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Budget impact</p>
                      <p className="text-sm text-gray-700 mt-1">{request.budgetImpact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Submitted on</p>
                      <p className="text-sm text-gray-700 mt-1">{request.date}</p>
                    </div>
                  </div>
                </div>

                <div
                  id="corporate-approval-actions"
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval actions</h2>

                  {!canTakeAction && (
                    <p className="text-sm text-gray-500 mb-4">
                      This request is already {request.status}. No further action is available.
                    </p>
                  )}

                  {actionError && (
                    <div className="mb-4 p-3 border border-gray-200 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{actionError}</p>
                    </div>
                  )}

                  {actionSuccess && (
                    <div className="mb-4 p-3 border border-gray-200 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{actionSuccess}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700" htmlFor="approvalComment">
                        Approval comment (mandatory when approving)
                      </label>
                      <textarea
                        id="approvalComment"
                        rows={3}
                        value={approvalComment}
                        onChange={(e) => setApprovalComment(e.target.value)}
                        placeholder="Add approval note for employee visibility"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!canTakeAction}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700" htmlFor="rejectionReason">
                        Rejection reason (mandatory when rejecting)
                      </label>
                      <textarea
                        id="rejectionReason"
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Add reason for employee visibility"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!canTakeAction}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-gray-700" htmlFor="delegateTo">
                        Delegate to approver
                      </label>
                      <select
                        id="delegateTo"
                        value={delegateTo}
                        onChange={(e) => setDelegateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!canTakeAction}
                      >
                        <option value="">Select approver</option>
                        <option value="Sarah Jenkins">Sarah Jenkins (L2 Manager)</option>
                        <option value="Michael Chen">Michael Chen (L3 HR)</option>
                        <option value="Priya Mehta">Priya Mehta (L3 Purchase Head)</option>
                      </select>
                    </div>
                  </div>

                  {request.approverComment && (
                    <div className="mt-4 p-3 border border-gray-200 bg-gray-50 rounded-md">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Latest approver comment</p>
                      <p className="text-sm text-gray-700 mt-1">{request.approverComment}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={!canTakeAction || isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isSubmitting ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={!canTakeAction || isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleDelegate}
                      disabled={!canTakeAction || isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      Delegate
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval timeline</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-500" />
                      Request submitted by employee
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-500" />
                      Awaiting L2/L3 action
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

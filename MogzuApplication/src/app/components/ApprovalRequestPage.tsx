import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react';

export default function ApprovalRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestStatus = searchParams.get('status') === 'rejected' ? 'rejected' : 'pending';
  const reasonParam = searchParams.get('reason') || '';
  const rejectionReason =
    reasonParam || 'Budget threshold exceeded for current approval policy.';

  const handleWithdraw = () => {
    navigate('/bookings');
  };

  const handleResubmit = () => {
    setError('');
    setSuccess('');

    const normalizedComment = revisionComment.trim();
    if (!normalizedComment) {
      setError('Please add a revision comment before resubmitting.');
      return;
    }

    if (normalizedComment.length < 10) {
      setError('Please add at least 10 characters so approvers have enough context.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess('Revised request submitted successfully with your comment. It has been routed again for approval.');
      setRevisionComment('');
    }, 700);
  };
  
  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <MogzuCorporateScrollSurface className="flex items-center justify-center py-12">
          <div className="max-w-xl w-full mx-auto px-6">
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center relative overflow-hidden">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400" />
              
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-amber-500 ml-1" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {requestStatus === 'rejected' ? 'Request Rejected' : 'Sent for Approval'}
              </h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {requestStatus === 'rejected'
                  ? 'Your request was reviewed and rejected. You can revise and resubmit with additional context.'
                  : 'Your booking request has been routed to your department head based on the current workflow rules.'}
              </p>

              {/* Booking Summary Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8 text-left">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">D Space</span>
                    <h3 className="font-bold text-gray-900">Grand Event Venue BKC</h3>
                    <p className="text-sm text-gray-500">Oct 20, 2024 • 10:00 am</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">₹1,20,000</p>
                  </div>
                </div>

              {/* Approval Chain Visual */}
                <h4 className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wider">Approval Chain</h4>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-900 mt-2">You</span>
                    <span className="text-[10px] text-gray-500">Requester</span>
                  </div>
                  
                  <div className="flex-1 h-px bg-green-200 -mt-6"></div>
                  
                  <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center z-10 relative ${
                    requestStatus === 'rejected'
                      ? 'bg-red-100 border-red-300 text-red-600'
                      : 'bg-amber-100 border-amber-300 text-amber-600 shadow-[0_0_0_4px_rgba(251,191,36,0.1)]'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {requestStatus !== 'rejected' && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></div>
                    )}
                    </div>
                    <span className="text-xs font-medium text-gray-900 mt-2">Sarah Jenkins</span>
                    <span className={`text-[10px] font-medium ${requestStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {requestStatus === 'rejected' ? 'Rejected (L1)' : 'Pending (L1)'}
                    </span>
                  </div>
                  
                  <div className="flex-1 h-px bg-gray-200 -mt-6 border-dashed border-t"></div>
                  
                  <div className="flex flex-col items-center opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 z-10">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-900 mt-2">Finance Team</span>
                    <span className="text-[10px] text-gray-500">Awaiting (L2)</span>
                  </div>
                </div>
              </div>

              {requestStatus === 'pending' && (
                <>
                  {reasonParam && (
                    <div className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-100 py-3 rounded-lg mb-8 px-4">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-800">Budget warning</p>
                        <p className="text-amber-900/90">{rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 text-blue-800 py-3 rounded-lg border border-blue-100 mb-8">
                    <Clock className="w-4 h-4" />
                    <span>Estimated response time: <strong>under 4 hours</strong></span>
                  </div>
                </>
              )}

              {requestStatus === 'rejected' && (
                <div className="mb-8 text-left">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Rejection Reason</p>
                    <p className="text-sm text-gray-700">{rejectionReason}</p>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="revision-comment">
                    Revised request comment
                  </label>
                  <textarea
                    id="revision-comment"
                    rows={4}
                    value={revisionComment}
                    onChange={(e) => setRevisionComment(e.target.value)}
                    placeholder="Add updates to your request for approver review..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                  {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                  {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/bookings')}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View in Bookings
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>

              {requestStatus === 'rejected' && (
                <button
                  onClick={handleResubmit}
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Resubmit Revised Request'}
                </button>
              )}
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleWithdraw}
                  className="text-sm text-red-500 hover:text-red-600 font-medium underline-offset-4 hover:underline"
                >
                  Withdraw Request
                </button>
              </div>
            </div>

          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
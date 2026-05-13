import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ChevronLeft, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export default function CancelBookingPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reason, setReason] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  
  // Mock data
  const bookingTotal = 120000;
  const policy = "Moderate (5 days)";
  const refundAmount = 120000; // Full refund

  if (isCancelled) {
    return (
      <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
        <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <MogzuCorporateScrollSurface className="flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
              <p className="text-gray-500 mb-8">
                Your cancellation has been processed and the vendor has been notified. A refund of <strong>₹{refundAmount.toLocaleString()}</strong> will be credited back to your original payment method in 5-7 business days.
              </p>
              <button 
                onClick={() => navigate('/bookings')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Return to Bookings
              </button>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <MogzuCorporateScrollSurface className="py-10">
          <div className="max-w-2xl mx-auto px-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Booking
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancel Booking</h1>
            <p className="text-gray-500 mb-8">Review the cancellation policy and provide a reason for cancelling this booking.</p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=200" 
                  className="w-20 h-20 rounded-lg object-cover" 
                  alt="Venue" 
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Grand Event Venue BKC</h3>
                  <p className="text-sm text-gray-500">Ref: BK-2024-0091</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">Oct 20, 2024 • 10:00 am</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                  <FileText className="w-4 h-4" />
                  Vendor Cancellation Policy: {policy}
                </div>
                <p className="text-sm text-blue-700">
                  You are cancelling more than 5 days before the event. You are eligible for a 100% refund of the booking amount minus the platform fee.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Booking Amount paid</span>
                  <span>₹{bookingTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Platform Fee (Non-refundable)</span>
                  <span>- ₹0</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Refund Amount</span>
                  <span>₹{refundAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="schedule">Schedule changed/Date no longer works</option>
                  <option value="budget">Budget restrictions</option>
                  <option value="alternative">Found an alternative vendor</option>
                  <option value="event_cancelled">Event was cancelled entirely</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {reason === 'other' && (
                <div className="mb-8">
                  <textarea 
                    placeholder="Please specify your reason..." 
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1"
                >
                  Keep Booking
                </button>
                <button 
                  disabled={!reason}
                  onClick={() => setIsCancelled(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
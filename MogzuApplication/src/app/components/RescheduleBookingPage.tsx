import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Calendar as CalendarIcon, ChevronLeft, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export default function RescheduleBookingPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isRequested, setIsRequested] = useState(false);
  
  if (isRequested) {
    return (
      <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
        <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <MogzuCorporateScrollSurface className="flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reschedule Requested</h1>
              <p className="text-gray-500 mb-8">
                Your request to reschedule to <strong>{selectedDate}</strong> has been sent to the vendor. They must confirm availability before the change is finalized.
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => navigate('/bookings')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Return to Bookings
                </button>
              </div>
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reschedule Booking</h1>
            <p className="text-gray-500 mb-8">Request a new date for your existing booking. The vendor will need to confirm the change.</p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Date</p>
                  <p className="text-lg font-semibold text-gray-900 line-through text-gray-400">Oct 20, 2024</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-300" />
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">New Date</p>
                  <p className={`text-lg font-semibold ${selectedDate ? 'text-blue-600' : 'text-gray-300'}`}>
                    {selectedDate || 'Select a date'}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select new date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Important Note</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Submitting this request does not guarantee the new date. If the vendor declines or is unavailable, your original booking will remain active unless you choose to cancel it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button 
                  disabled={!selectedDate}
                  onClick={() => setIsRequested(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
                >
                  Request Reschedule
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
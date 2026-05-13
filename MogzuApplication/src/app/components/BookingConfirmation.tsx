import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { CheckCircle } from 'lucide-react';
import { setCorpVendorEnquiryBookingConfirmed } from '@/app/lib/corpVendorEnquiryStorage';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'conference';
  const paymentTiming = location.state?.paymentTiming as 'full' | 'partial' | undefined;
  const amountPaid = typeof location.state?.amountPaid === 'number' ? location.state.amountPaid : null;
  const remainingAmount = typeof location.state?.remainingAmount === 'number' ? location.state.remainingAmount : null;
  const vendorOrderId =
    typeof location.state?.vendorOrderId === 'string' ? location.state.vendorOrderId : undefined;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isInvoiceSending, setIsInvoiceSending] = useState(false);

  const bookingId = '001021';
  const syncedVendorOrderRef = useRef(false);

  useEffect(() => {
    if (!vendorOrderId || syncedVendorOrderRef.current) return;
    syncedVendorOrderRef.current = true;
    setCorpVendorEnquiryBookingConfirmed(vendorOrderId);
  }, [vendorOrderId]);

  const handleDownloadFile = (fileType: 'po' | 'invoice' | 'receipt') => {
    setActionError('');
    setActionSuccess('');
    try {
      const ext = fileType === 'receipt' ? 'pdf' : 'txt';
      const lines = [
        `Booking ID: ${bookingId}`,
        `File: ${fileType.toUpperCase()}`,
        `Venue: NESCO IT Park`,
        `Total: ₹ 25,000`,
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookingId}-${fileType}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setActionSuccess(`${fileType.toUpperCase()} downloaded successfully.`);
    } catch {
      setActionError(`Unable to download ${fileType.toUpperCase()}. Please try again.`);
    }
  };

  const handleSendInvoiceEmail = () => {
    setActionError('');
    setActionSuccess('');
    setIsInvoiceSending(true);
    setTimeout(() => {
      setIsInvoiceSending(false);
      setActionSuccess('GST invoice generated and email sent successfully.');
    }, 700);
  };

  const handleAddToCalendar = () => {
    setActionError('');
    setActionSuccess('');
    try {
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mogzu//Booking//EN',
        'BEGIN:VEVENT',
        `UID:${bookingId}@mogzu`,
        'SUMMARY:Mogzu Booking - NESCO IT Park',
        'LOCATION:Goregaon (East), Mumbai',
        'DTSTART:20240628T090000',
        'DTEND:20240629T170000',
        'END:VEVENT',
        'END:VCALENDAR',
      ];
      const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookingId}-booking.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setActionSuccess('Calendar invite downloaded successfully.');
    } catch {
      setActionError('Unable to create calendar invite. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Page Content */}
        <MogzuCorporateScrollSurface className="flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {category === 'conference' ? 'Conference Room Booked!' :
                 category === 'casual' ? 'Space Reserved!' :
                 category === 'corporate' ? 'Event Space Confirmed!' :
                 'Booking Confirmed!'}
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                {category === 'conference' ? 'Your conference room has been successfully reserved.' :
                 category === 'casual' ? 'Your casual meeting space is ready for you.' :
                 category === 'corporate' ? 'Your event space booking is confirmed.' :
                 'Your booking has been successfully confirmed.'}
              </p>
              <p className="text-base text-gray-500 mb-8">
                Booking ID: <span className="font-semibold text-gray-900">{bookingId}</span>
              </p>
              {vendorOrderId ? (
                <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 mb-6">
                  Linked vendor enquiry <span className="font-semibold">{vendorOrderId}</span> is updated to
                  confirmed — the vendor sees the same on Orders.
                </p>
              ) : null}

              {(actionError || actionSuccess) && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
                  {actionError && <p className="text-sm text-gray-700">{actionError}</p>}
                  {actionSuccess && <p className="text-sm text-gray-700">{actionSuccess}</p>}
                </div>
              )}

              {/* Booking Details Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Venue:</span>
                    <span className="text-sm font-medium text-gray-900">NESCO IT Park</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium text-gray-900">Goregaon (East), Mumbai</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-in:</span>
                    <span className="text-sm font-medium text-gray-900">Jun 28, 2024 • 09:00 am</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-out:</span>
                    <span className="text-sm font-medium text-gray-900">Jun 29, 2024 • 05:00 pm</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-base font-bold text-green-600">₹ 25,000</span>
                  </div>
                </div>
              </div>

              {paymentTiming === 'partial' && amountPaid !== null && remainingAmount !== null && (
                <div className="bg-white rounded-xl border border-amber-200 p-6 mb-6 text-left shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Partial payment received</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid (advance)</span>
                      <span className="font-medium">₹ {amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Remaining balance</span>
                      <span className="font-medium">₹ {remainingAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => navigate('/booking-payment', { state: { category }})}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                    >
                      Pay remaining balance
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={() => handleDownloadFile('po')}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PO
                </button>
                <button
                  onClick={() => handleDownloadFile('invoice')}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  GST Invoice
                </button>
                <button
                  onClick={() => handleDownloadFile('receipt')}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Payment Receipt
                </button>
                <button
                  onClick={handleAddToCalendar}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add to Calendar
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/bookings')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={handleSendInvoiceEmail}
                  disabled={isInvoiceSending}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {isInvoiceSending ? 'Sending Invoice...' : 'Email GST Invoice'}
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>

              {/* Additional Info */}
              <p className="text-sm text-gray-500 mt-8">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
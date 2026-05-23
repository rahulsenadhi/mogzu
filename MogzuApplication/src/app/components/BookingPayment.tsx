import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, Upload, ChevronDown, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import imgImage25005 from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { buildClassicBookingBaseState, computeGrandTotal } from '@/app/lib/classicBookingFlow';
import { useAuth } from '@/lib/auth';

const REGIONAL_METHODS: Record<string, { id: string; label: string; hint: string }> = {
  SG: { id: 'paynow', label: 'PayNow', hint: 'Singapore real-time transfer' },
  SA: { id: 'mada', label: 'Mada', hint: 'Saudi Arabia debit network' },
  AE: { id: 'mada', label: 'Mada', hint: 'GCC debit network' },
};

export default function BookingPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { corporateAccount } = useAuth();
  const region = corporateAccount?.region ?? 'IN';
  const regionalMethod = REGIONAL_METHODS[region] ?? null;
  const category = location.state?.category || 'default';
  const bookingFlow = buildClassicBookingBaseState(location.state);
  const vendorOrderIdFromOffer =
    typeof location.state?.vendorOrderId === 'string' ? location.state.vendorOrderId : undefined;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vendor');
  const [paymentTiming, setPaymentTiming] = useState<'full' | 'partial'>('full');
  const [saveCard, setSaveCard] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [paymentFailureReason, setPaymentFailureReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPaymentFingerprint, setLastPaymentFingerprint] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [walletBalance] = useState(5000);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  // Coupon: demo-only validation + feedback.
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [signatureCleared, setSignatureCleared] = useState(false);
  const [messageToolbarNotice, setMessageToolbarNotice] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  // Provide category-specific content
  const getPaymentContent = () => {
    switch (category) {
      case 'activity':
        return {
          title: 'Corporate Activity Suite',
          types: 'Team Building, Wellness, Workshop',
          capacity: '5-100 participants',
          basePrice: 20000,
          serviceFee: 2000,
          dateLabel1: 'Event date',
          dateVal1: 'Jul 15, 2024 • 09:00 am',
          dateLabel2: 'End time',
          dateVal2: 'Jul 15, 2024 • 05:00 pm',
          basePriceLabel: '₹ 20,000 × 1 day',
        };
      case 'promotion':
        return {
          title: 'Exclusive Vendor Deal',
          types: 'Promotional Bundles',
          capacity: '1-10 units',
          basePrice: 5000,
          serviceFee: 500,
          dateLabel1: 'Start date',
          dateVal1: 'Aug 01, 2024',
          dateLabel2: 'Valid until',
          dateVal2: 'Oct 01, 2024',
          basePriceLabel: '₹ 5,000 × 1 bundle',
        };
      case 'stay':
        return {
          title: 'Executive Hotel Stay',
          types: 'Single, Double, Suite',
          capacity: '1-50 guests',
          basePrice: 12000,
          serviceFee: 1200,
          dateLabel1: 'Check-in date',
          dateVal1: 'Sep 10, 2024 • 02:00 pm',
          dateLabel2: 'Check-out date',
          dateVal2: 'Sep 15, 2024 • 11:00 am',
          basePriceLabel: '₹ 12,000 × 5 nights',
        };
      case 'event':
        return {
          title: 'Industry Tech Summit',
          types: 'General, VIP, Backstage',
          capacity: '1-200 attendees',
          basePrice: 15000,
          serviceFee: 1500,
          dateLabel1: 'Event date',
          dateVal1: 'Oct 20, 2024 • 10:00 am',
          dateLabel2: 'End date',
          dateVal2: 'Oct 22, 2024 • 06:00 pm',
          basePriceLabel: '₹ 15,000 × 3 days',
        };
      case 'gifting':
        return {
          title: 'Premium Gifting Partner',
          types: 'Welcome Kit, Festive Hamper, Executive Gift',
          capacity: '10-500 items',
          basePrice: 8000,
          serviceFee: 800,
          dateLabel1: 'Order date',
          dateVal1: 'Nov 01, 2024',
          dateLabel2: 'Delivery date',
          dateVal2: 'Nov 10, 2024',
          basePriceLabel: '₹ 8,000 × 1 order',
        };
      case 'conference':
        return {
          title: 'Professional Conference Center',
          types: 'Boardroom, Conference Hall, Training Room',
          capacity: '4-30 people',
          basePrice: 15000,
          serviceFee: 1500,
          dateLabel1: 'Check-in date',
          dateVal1: 'Jun 28, 2024 • 09:00 am',
          dateLabel2: 'Check-out date',
          dateVal2: 'Jun 28, 2024 • 05:00 pm',
          basePriceLabel: '₹ 15,000 × 1 day',
        };
      case 'casual':
        return {
          title: 'Creative Lounge Space',
          types: 'Lounge, Café-Style, Terrace',
          capacity: '2-15 people',
          basePrice: 5000,
          serviceFee: 500,
          dateLabel1: 'Check-in date',
          dateVal1: 'Jun 28, 2024 • 10:00 am',
          dateLabel2: 'Check-out date',
          dateVal2: 'Jun 28, 2024 • 02:00 pm',
          basePriceLabel: '₹ 5,000 × 1 day',
        };
      case 'corporate':
        return {
          title: 'Grand Event Venue',
          types: 'Banquet Hall, Event Hall, Auditorium',
          capacity: '20-100 people',
          basePrice: 45000,
          serviceFee: 4500,
          dateLabel1: 'Event start',
          dateVal1: 'Jun 28, 2024 • 08:00 am',
          dateLabel2: 'Event end',
          dateVal2: 'Jun 29, 2024 • 10:00 pm',
          basePriceLabel: '₹ 45,000 × 2 days',
        };
      default:
        // coworking
        return {
          title: 'WorkHub BKC',
          types: 'Co working Space, Premium and Dedicated Desk, Private Office',
          capacity: '1-10',
          basePrice: 24000,
          serviceFee: 1000,
          dateLabel1: 'Check-in date',
          dateVal1: 'Jun 28, 2024 • 09:00 am',
          dateLabel2: 'Check-out date',
          dateVal2: 'Jun 28, 2024 • 05:00 pm',
          basePriceLabel: '₹ 3000 × 8 hr',
        };
    }
  };

  const content = getPaymentContent();
  const grandTotal = computeGrandTotal(
    bookingFlow.bookingBaseTotal || content.basePrice,
    bookingFlow.serviceFee || content.serviceFee,
    bookingFlow.addOnTotal || 0
  );
  const partialAmount = Math.round(grandTotal * 0.2); // 20% advance
  const summaryName = bookingFlow.spaceName || content.title;
  const summaryTypes = bookingFlow.spaceTypes || content.types;
  const summaryImage = bookingFlow.spaceImage || imgImage25005;

  // Demo-only budget thresholds (kept in sync with BookingReview/ApprovalRequestPage).
  const personalRemainingBudget = 200000;
  const departmentRemainingBudget = 500000;
  const effectiveAmount = paymentTiming === 'full' ? grandTotal : partialAmount;
  const isPersonalLimitExceeded = effectiveAmount > personalRemainingBudget;
  const isDepartmentBudgetExceeded = effectiveAmount > departmentRemainingBudget;
  const isBudgetBlocked = isPersonalLimitExceeded || isDepartmentBudgetExceeded;

  const handleApplyCoupon = () => {
    if (isApplyingCoupon) return;
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim();
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }

    setIsApplyingCoupon(true);
    setTimeout(() => {
      // Demo coupon rule
      if (code.toUpperCase() === 'MOGZU10') {
        setCouponSuccess('Coupon applied successfully.');
      } else {
        setCouponError('Invalid coupon code.');
      }
      setIsApplyingCoupon(false);
    }, 450);
  };

  const handleClearSignatureCanvas = () => {
    setSignatureCleared(true);
    setTimeout(() => setSignatureCleared(false), 1200);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  if (isTimeout) {
    return (
      <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
        <SharedSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />
          <MogzuCorporateScrollSurface className="flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-6">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-amber-600" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment timeout</h1>
                <p className="text-lg text-gray-600 mb-8">
                  The bank authorization took too long. Please check status before retrying.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => navigate('/bookings')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                  >
                    Check status
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTimeout(false)}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                  >
                    Retry payment
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/communication')}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  if (isFailed) {
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
                {/* Failure Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                  </div>
                </div>

                {/* Failure Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Booking unsuccessful
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  {paymentFailureReason
                    ? `Payment failed: ${paymentFailureReason}`
                    : 'Something went wrong while processing your request.'} Your payment has not been charged.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setIsFailed(false);
                      setIsProcessing(false);
                      setPaymentFailureReason('');
                    }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => navigate('/communication')}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Page Content */}
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            {/* Back Button and Title */}
            <div className="mb-6">
              <button 
                onClick={() => navigate('/booking-review', { state: location.state })}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-lg font-semibold">Request to book</span>
              </button>

              {/* Progress Steps */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">Step 1:</span>
                <span className="text-gray-900 font-medium">Booking details</span>
                <span className="text-gray-400">------</span>
                <span className="text-gray-500">Step 2:</span>
                <span className="text-gray-900 font-medium">Add ons</span>
                <span className="text-gray-400">------</span>
                <span className="text-gray-500">Step 3:</span>
                <span className="text-gray-900 font-medium">Review details</span>
                <span className="text-gray-400">------</span>
                <span className="text-gray-500">Step 4:</span>
                <span className="text-green-600 font-medium">Pay</span>
              </div>
            </div>

            {duplicateError && (
              <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">{duplicateError}</p>
              </div>
            )}

            {showWalletPrompt && (
              <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Corporate wallet balance is insufficient for this booking.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Available balance: ₹ {walletBalance.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="px-4 py-2 border border-[#2563eb] text-[#2563eb] rounded-md text-sm font-medium hover:bg-[#ebf1ff]"
                  >
                    Top up wallet
                  </button>
                </div>
              </div>
            )}

            {isBudgetBlocked && (
              <div className="mb-4 p-4 bg-white border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Budget enforcement
                </p>
                <p className="text-sm text-amber-900">
                  {isPersonalLimitExceeded
                    ? 'Exceeds your approved limit. Contact your manager.'
                    : 'Budget exhausted. Requests blocked until reset or admin increases limit. Send for Approval to continue.'}
                </p>
              </div>
            )}

            <div className="flex flex-col xl:flex-row gap-6">
              {/* Left Column - Payment Form */}
              <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                {/* Payment Options */}
                <div className="mb-6">
                  {/* Vendor Payment Terms Block */}
                  <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Terms of Payment (Set by Venue In-charge)</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 100% advance payment required for immediate confirmation.</p>
                      <p>• Credit payment permitted strictly for approved corporate accounts.</p>
                      <p>• Digital PO copy mandatory for all credit bookings.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setPaymentTiming('full')}
                      className={`flex-1 rounded-lg p-4 transition-all ${
                        paymentTiming === 'full'
                          ? 'border-2 border-green-500 bg-green-50'
                          : 'border-2 border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">Pay now (₹ {grandTotal.toLocaleString('en-IN')})</p>
                          <p className="text-sm text-green-600 font-medium">Get 15% off</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentTiming('partial')}
                      className={`flex-1 rounded-lg p-4 transition-all ${
                        paymentTiming === 'partial'
                          ? 'border-2 border-green-500 bg-green-50'
                          : 'border-2 border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <p className="text-lg font-semibold text-gray-900 mb-1">Pay ₹ {partialAmount.toLocaleString('en-IN')} now</p>
                      <p className="text-sm text-gray-600">and remaining later</p>
                    </button>
                  </div>

                  {/* PO Payment */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="radio"
                        id="po-payment"
                        name="payment-method"
                        className="w-4 h-4 text-[#2563eb]"
                        checked={paymentMethod === 'po'}
                        onChange={() => setPaymentMethod('po')}
                      />
                      <label htmlFor="po-payment" className="text-base font-medium text-gray-900 cursor-pointer">
                        Pay with Purchase Order (PO)
                      </label>
                    </div>

                    {paymentMethod === 'po' && (
                      <div className="ml-6 space-y-4 animate-in fade-in duration-200 bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded">Corporate Credit Flow</span>
                          <span className="text-xs text-gray-500">Mandatory Compliance</span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PO/WO Number <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="Enter PO/WO Number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        {/* File Upload Area */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Scan Copy of WO/PO <span className="text-red-500">*</span></label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2563eb] transition-colors bg-gray-50/50">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 bg-[#ebf1ff] rounded-full flex items-center justify-center">
                                <Upload className="w-5 h-5 text-[#2563eb]" />
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Drag and drop files here or <span className="text-[#2563eb] cursor-pointer font-medium hover:underline">Browse</span>
                              </p>
                              <p className="text-[11px] text-gray-500">PDF or Images up to 10MB</p>
                            </div>
                          </div>
                        </div>

                        {/* Digital Signature */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Digital Signature <span className="text-red-500">*</span></label>
                          <div className="border border-gray-300 rounded-lg h-24 bg-gray-50 relative">
                            <p className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs italic pointer-events-none">Sign here using mouse or touch</p>
                          </div>
                          <div className="flex justify-end mt-1">
                            <button
                              type="button"
                              onClick={handleClearSignatureCanvas}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Clear Canvas
                            </button>
                          </div>
                          {signatureCleared && (
                            <p className="text-[11px] text-gray-500 mt-1">Signature canvas cleared.</p>
                          )}
                        </div>

                        {/* OTP Confirmation */}
                        <div className="pt-2 border-t border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-1">OTP Confirmation <span className="text-red-500">*</span></label>
                          <div className="flex gap-3">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4].map((i) => (
                                <input key={i} type="text" maxLength={1} className="w-10 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium" />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              Send OTP
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            OTP sent to registered Mobile/Email for PO confirmation
                          </p>
                          {otpSent && (
                            <p className="text-[11px] text-green-600 mt-1">OTP sent successfully.</p>
                          )}
                        </div>

                        {/* T&C Checkbox */}
                        <div className="flex items-start gap-2 pt-3 mt-1">
                          <input type="checkbox" id="vendor-tc" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <label htmlFor="vendor-tc" className="text-xs text-gray-600 leading-snug">
                            I accept the <a href="#" className="text-blue-600 hover:underline font-medium">Service Provider T&C</a> and acknowledge liability for the credit amount requested in this Purchase Order.
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Payment */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="radio"
                        id="card-payment"
                        name="payment-method"
                        className="w-4 h-4 text-[#2563eb]"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <label htmlFor="card-payment" className="text-base font-medium text-gray-900 cursor-pointer">
                        Pay with Card
                      </label>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="ml-6 animate-in fade-in duration-200">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-4">Card details</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Card Number</label>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Name on card</label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Expiry date</label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">CVV</label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  maxLength={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Save Card Details */}
                        <div className="flex items-center gap-2 mt-4">
                          <input
                            type="checkbox"
                            id="save-card"
                            className="w-4 h-4 text-[#2563eb] rounded"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                          />
                          <label htmlFor="save-card" className="text-sm text-gray-700 cursor-pointer">
                            Save card details (for later use)
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UPI Payment */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="radio"
                        id="upi-payment"
                        name="payment-method"
                        className="w-4 h-4 text-[#2563eb]"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <label htmlFor="upi-payment" className="text-base font-medium text-gray-900 cursor-pointer">
                        UPI payment
                      </label>
                    </div>

                    {paymentMethod === 'upi' && (
                      <div className="ml-6 space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">UPI ID</label>
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* QR Code Option */}
                        <div className="border border-gray-300 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-900">Or scan QR code to pay</p>
                          </div>
                          <div className="flex justify-center">
                            <div className="w-40 h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <p className="text-xs text-gray-500 text-center px-4">QR Code will appear here after confirming</p>
                            </div>
                          </div>
                        </div>

                        {/* Popular UPI Apps */}
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Pay with UPI apps</p>
                          <div className="grid grid-cols-4 gap-3">
                            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                              <button
                                key={app}
                                type="button"
                                onClick={() => setSelectedUpiApp(app)}
                                className={`border rounded-lg p-3 transition-colors ${
                                  selectedUpiApp === app
                                    ? 'border-[#2563eb] bg-[#ebf1ff]'
                                    : 'border-gray-300 hover:border-[#2563eb] hover:bg-[#ebf1ff]'
                                }`}
                              >
                                <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-1"></div>
                                <p className="text-xs text-gray-700 text-center">{app}</p>
                              </button>
                            ))}
                          </div>
                          {selectedUpiApp && (
                            <p className="text-xs text-gray-600 mt-2">
                              Selected app: <span className="font-medium">{selectedUpiApp}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {regionalMethod && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="radio"
                          id={`${regionalMethod.id}-payment`}
                          name="payment-method"
                          className="w-4 h-4 text-[#2563eb]"
                          checked={paymentMethod === regionalMethod.id}
                          onChange={() => setPaymentMethod(regionalMethod.id)}
                        />
                        <label
                          htmlFor={`${regionalMethod.id}-payment`}
                          className="text-base font-medium text-gray-900 cursor-pointer"
                        >
                          Pay with {regionalMethod.label}
                        </label>
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          {region}
                        </span>
                      </div>
                      {paymentMethod === regionalMethod.id && (
                        <div className="ml-6 animate-in fade-in duration-200">
                          <div className="bg-emerald-50 border border-emerald-200/60 rounded-lg p-4">
                            <p className="text-sm font-medium text-emerald-900">
                              {regionalMethod.label} checkout
                            </p>
                            <p className="text-xs text-emerald-800 mt-1">
                              {regionalMethod.hint}. You will be redirected to the {regionalMethod.label}{' '}
                              flow after confirming.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empanelled Vendor */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="radio"
                        id="empanelled-vendor"
                        name="payment-method"
                        className="w-4 h-4 text-[#2563eb]"
                        checked={paymentMethod === 'empanelled'}
                        onChange={() => setPaymentMethod('empanelled')}
                      />
                      <label htmlFor="empanelled-vendor" className="text-base font-medium text-gray-900 cursor-pointer">
                        Empanelled vendor
                      </label>
                    </div>

                    {paymentMethod === 'empanelled' && (
                      <div className="ml-6 space-y-4 animate-in fade-in duration-200">
                        <div className="bg-[#ebf1ff] border border-blue-200/50 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-[#2563eb] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-[#1e3a8a]">Empanelled Vendor Payment</p>
                              <p className="text-xs text-[#1e40af] mt-1">
                                Payment will be processed through your organization's empanelled vendor agreement. No immediate payment required.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Select Vendor</label>
                          <div className="relative">
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="">Choose empanelled vendor</option>
                              <option value="vendor1">ABC Corporate Services Pvt Ltd</option>
                              <option value="vendor2">XYZ Event Solutions</option>
                              <option value="vendor3">Premium Spaces India</option>
                              <option value="vendor4">Corporate Hub Services</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Vendor Agreement Number</label>
                          <input
                            type="text"
                            placeholder="Enter agreement number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Cost Center / Department</label>
                          <input
                            type="text"
                            placeholder="Enter cost center code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Approval Manager Email</label>
                          <input
                            type="email"
                            placeholder="manager@company.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Booking confirmation will be sent to this email for approval</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Routing Workflow */}
                <div className="mt-8 mb-6 p-5 border border-amber-200 bg-amber-50/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Approval Workflow</h3>
                      <p className="text-xs text-gray-600 mb-4">Your current role (Level 2) requires Level 3 management approval for this transaction value.</p>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Route Request To</label>
                        <div className="relative">
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white">
                            <option value="">Select Level 3 Manager...</option>
                            <option value="sarah">Sarah Jenkins (VP Operations)</option>
                            <option value="michael">Michael Chen (Director of Finance)</option>
                            <option value="amanda">Amanda Roberts (Head of Procurement)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message for Host */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Message for host</label>
                  <div className="border border-gray-300 rounded-md">
                    <div className="flex items-center gap-2 p-2 border-b border-gray-300">
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Attachments: file picker will be available in a future release.')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <line x1="12" y1="5" x2="12" y2="19" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Bold formatting will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded font-bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Italic formatting will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Underline formatting will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded underline"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Text size controls will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        T<sub>T</sub>
                      </button>
                      <div className="w-px h-4 bg-gray-300" />
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Alignment controls will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        ≡
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Bulleted lists will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        •
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageToolbarNotice('Numbered lists will be available when the rich-text editor ships.')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        1.
                      </button>
                    </div>
                    {messageToolbarNotice && (
                      <p
                        className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-200"
                        role="status"
                      >
                        {messageToolbarNotice}
                      </p>
                    )}
                    <textarea
                      placeholder="Add Message"
                      rows={4}
                      className="w-full p-3 resize-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="w-full xl:w-[340px] space-y-6">
                {/* Space Card */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex gap-3 mb-4">
                    <img 
                      src={summaryImage} 
                      alt="NESCO IT Park" 
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{summaryName}</h3>
                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">4.5 ★</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{summaryTypes}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Goregaon (East) Mumbai</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>{content.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900">Date and time</h4>
                    <button
                      onClick={() => navigate('/booking-review', { state: location.state })}
                      className="text-[#2563eb] text-sm font-medium hover:text-[#1d4ed8]"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">{content.dateLabel1}</p>
                      <p className="text-sm text-gray-900">{bookingFlow.bookingStartDate || content.dateVal1}</p>
                    </div>
                    <div className="w-full h-px bg-gray-200" />
                    <div>
                      <p className="text-xs text-gray-500">Time slot</p>
                      <p className="text-sm text-gray-900">
                        {bookingFlow.fullDayBooking
                          ? 'Full day'
                          : `${bookingFlow.bookingFromTime} - ${bookingFlow.bookingToTime}`}
                      </p>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="mt-4">
                    <label className="block text-sm text-gray-700 mb-2">Coupon code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 border border-[#2563eb] text-[#2563eb] rounded-md text-sm font-medium hover:bg-[#ebf1ff] disabled:opacity-60"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {(couponError || couponSuccess) && (
                      <p
                        className={`text-xs font-medium mt-2 ${
                          couponError ? 'text-[#ef4444]' : 'text-[#16a34a]'
                        }`}
                      >
                        {couponError || couponSuccess}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Price</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Base</span>
                      <span>₹ {bookingFlow.bookingBaseTotal.toLocaleString('en-IN')}</span>
                    </div>
                    {bookingFlow.addOns.length === 0 ? (
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Add-ons</span>
                        <span>₹ 0</span>
                      </div>
                    ) : (
                      bookingFlow.addOns.map((item) => (
                        <div key={item.key} className="flex justify-between text-sm text-gray-700">
                          <span>{item.label} × {item.quantity}</span>
                          <span>₹ {item.total.toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Processing / Service fee</span>
                      <span>₹ {bookingFlow.serviceFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-px bg-gray-200 my-2" />
                    <div className="flex justify-between text-base font-semibold text-gray-900">
                      <span>Total</span>
                      <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Free cancellation up to 24 hours prior to event
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 mb-12">
              <button
                onClick={() => navigate('/booking-review', { state: location.state })}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium text-base transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/booking-review', { state: location.state })}
                  className="px-8 py-3 border-2 border-[#e5e7eb] text-[#0e1e3f] rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const effectiveAmount = paymentTiming === 'full' ? grandTotal : partialAmount;

                    // Demo thresholds aligned with BookingReview budget messaging.
                    const personalRemainingBudget = 200000;
                    const departmentRemainingBudget = 500000;

                    let reason = '';
                    if (effectiveAmount > departmentRemainingBudget) {
                      reason =
                        'Budget exhausted. Requests blocked until reset or admin increases limit. Your request has been flagged for approval.';
                    } else if (effectiveAmount > personalRemainingBudget) {
                      reason = 'Exceeds your approved limit. Contact your manager.';
                    }

                    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
                    navigate(`/booking-approval-request${query}`, {
                      state: {
                        category,
                        venueName: bookingFlow.spaceName || content.title,
                        venueLocation: bookingFlow.location,
                        bookingDate: bookingFlow.bookingStartDate || content.dateVal1,
                        totalAmount: grandTotal,
                      },
                    });
                  }}
                  className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium text-base hover:bg-blue-50 transition-colors"
                >
                  Send for Approval
                </button>
                <button 
                  onClick={() => {
                    if (isProcessing) {
                      return;
                    }

                    const effectiveAmount = paymentTiming === 'full' ? grandTotal : partialAmount;
                    const fingerprint = `${paymentMethod}-${paymentTiming}-${effectiveAmount}`;
                    if (lastPaymentFingerprint === fingerprint) {
                      setDuplicateError('Duplicate payment attempt blocked. Please check status or modify payment details.');
                      return;
                    }

                    if (paymentMethod === 'vendor' && walletBalance < effectiveAmount) {
                      setShowWalletPrompt(true);
                      return;
                    }

                    setDuplicateError('');
                    setShowWalletPrompt(false);
                    setIsProcessing(true);

                    setLastPaymentFingerprint(fingerprint);
                    navigate('/booking-success', {
                      state: {
                        category,
                        bookingFlow,
                        paymentTiming,
                        amountPaid: effectiveAmount,
                        remainingAmount: Math.max(0, grandTotal - effectiveAmount),
                        vendorOrderId: vendorOrderIdFromOffer,
                      },
                    });
                  }}
                  className="px-12 py-3 bg-[#2563eb] text-white rounded-lg font-medium text-base hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isProcessing || isBudgetBlocked}
                >
                  {isProcessing ? 'Processing payment...' : 'Confirm & pay'}
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
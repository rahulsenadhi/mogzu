import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, ChevronDown, Star, MapPin, Users } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import imgImage25005 from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { buildClassicBookingBaseState, computeGrandTotal } from '@/app/lib/classicBookingFlow';

export default function BookingReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'default';
  const bookingFlow = buildClassicBookingBaseState(location.state);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Provide category-specific content
  const getReviewContent = () => {
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
          types: 'Private Meeting, Dedicated Desk, Private Office',
          capacity: '1-10 seats',
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

  const content = getReviewContent();
  const grandTotal = computeGrandTotal(
    bookingFlow.bookingBaseTotal || content.basePrice,
    bookingFlow.serviceFee || content.serviceFee,
    bookingFlow.addOnTotal || 0
  );
  const summaryName = bookingFlow.spaceName || content.title;
  const summaryTypes = bookingFlow.spaceTypes || content.types;
  const summaryCapacity = bookingFlow.capacityRange || content.capacity;
  const summaryImage = bookingFlow.spaceImage || imgImage25005;
  const summaryRating = bookingFlow.rating || '4.5';
  const remainingQuarterlyBudget = 200000;
  const departmentRemainingBudget = 500000;
  const remainingAfter = Math.max(0, remainingQuarterlyBudget - grandTotal);
  const isPersonalLimitExceeded = grandTotal > remainingQuarterlyBudget;
  const isDepartmentBudgetExceeded = grandTotal > departmentRemainingBudget;
  const percentUsed = Math.min(100, (grandTotal / remainingQuarterlyBudget) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            {/* Back Button and Title */}
            <div className="mb-6">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#0e1e3f] hover:text-[#2563eb] mb-4"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <h1 className="text-[32px] font-semibold text-[#0e1e3f] leading-10">Request to book</h1>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 1:</span>
                <span className="text-sm text-[#22c55e]">Booking details</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 2:</span>
                <span className="text-sm text-[#22c55e]">Add ons</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 3:</span>
                <span className="text-sm text-[#2563eb] font-medium">Review details</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 4:</span>
                <span className="text-sm text-[#959595]">Pay</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
              {/* Left Column - Review Details */}
              <div className="bg-white rounded-lg p-8">
                {/* Booking Details */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-[#0e1e3f] mb-6">Booking details</h2>
                  <div className="space-y-4">
                    <div className="flex">
                      <span className="text-base text-[#878e9e] w-32">Planned for:</span>
                      <span className="text-base text-[#0e1e3f] font-medium">{bookingFlow.selection.planningFor || 'Not selected'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-base text-[#878e9e] w-32">Attendees:</span>
                      <span className="text-base text-[#0e1e3f] font-medium">{bookingFlow.selection.attendees || '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-base text-[#878e9e] w-32">Team:</span>
                      <span className="text-base text-[#0e1e3f] font-medium">{bookingFlow.selection.selectedTeam || '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-base text-[#878e9e] w-32">Contact:</span>
                      <span className="text-base text-[#0e1e3f] font-medium">{bookingFlow.selection.contactNumber || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Add ons */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-[#0e1e3f] mb-6">Add ons</h2>
                  <div className="space-y-4">
                    {bookingFlow.addOns.length === 0 ? (
                      <p className="text-sm text-[#878e9e]">No add-ons selected.</p>
                    ) : (
                      bookingFlow.addOns.map((item) => (
                        <div key={item.key} className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect width="16" height="16" rx="3" fill="#2563eb" />
                                <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base text-[#0e1e3f] font-medium">{item.label}</p>
                              <p className="text-sm text-[#878e9e]">₹{item.unitPrice}/unit</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base text-[#0e1e3f] font-medium">× {item.quantity} units</p>
                            <p className="text-sm text-[#878e9e]">₹{item.total.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Equipments */}
                <div>
                  <h2 className="text-xl font-semibold text-[#0e1e3f] mb-6">Equipments</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {bookingFlow.addOns.filter((item) => !['coffee_tea', 'drinking_water'].includes(item.key)).length === 0 ? (
                      <p className="text-sm text-[#878e9e] col-span-3">No equipment selected.</p>
                    ) : (
                      bookingFlow.addOns
                        .filter((item) => !['coffee_tea', 'drinking_water'].includes(item.key))
                        .map((item) => (
                          <div key={item.key} className="flex items-center gap-2">
                            <span className="text-sm text-[#0e1e3f]">{item.label} ({item.quantity})</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="bg-white rounded-lg p-6">
                {/* Space Details */}
                <div className="mb-6">
                  <div className="relative rounded-md overflow-hidden mb-4">
                    <img 
                      src={summaryImage} 
                      alt="NESCO IT Park" 
                      className="w-full h-[154px] object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-[#22c55e] px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="text-white text-base font-normal">{summaryRating}</span>
                      <Star className="w-[18px] h-[18px] fill-white text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-[#0e1e3f] mb-1">{summaryName}</h3>
                  <p className="text-sm text-[#878e9e] mb-3">
                    {summaryTypes}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-[#878e9e]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-[22px] h-[22px]" />
                      <span>Goregaon (East), Mumbai</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#878e9e] mt-2">
                    <Users className="w-[22px] h-[22px]" />
                    <span>{summaryCapacity}</span>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-[#0e1e3f]">Date and time</h4>
                    <button
                      onClick={() => navigate('/request-to-book', { state: location.state })}
                      className="text-sm text-[#2563eb] font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-[#878e9e] mb-1">Start date</p>
                      <p className="text-base text-[#0e1e3f]">{bookingFlow.bookingStartDate || content.dateVal1}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#878e9e] mb-1">Time slot</p>
                      <p className="text-base text-[#0e1e3f]">
                        {bookingFlow.fullDayBooking
                          ? 'Full day'
                          : `${bookingFlow.bookingFromTime} - ${bookingFlow.bookingToTime}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-lg font-semibold text-[#0e1e3f] mb-4">Price</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg text-[#475569]">
                      <span>Base</span>
                      <span>₹ {bookingFlow.bookingBaseTotal.toLocaleString('en-IN')}</span>
                    </div>
                    {bookingFlow.addOns.map((item) => (
                      <div key={item.key} className="flex justify-between text-lg text-[#475569]">
                        <span>{item.label} × {item.quantity}</span>
                        <span>₹ {item.total.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg text-[#475569]">
                      <span>Processing / Service fee</span>
                      <span>₹ {bookingFlow.serviceFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xl font-medium text-[#0e1e3f] pt-2 border-t border-[#e5e7eb]">
                      <span>Total</span>
                      <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#878e9e] mt-4">
                    Free cancellation up to 24 hours prior to event
                  </p>

                  {/* Inline Budget Check */}
                  <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Budget status</span>
                      <span className="text-sm font-medium text-amber-600">
                        ₹{remainingAfter.toLocaleString('en-IN')} of ₹{remainingQuarterlyBudget.toLocaleString('en-IN')} remaining
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPersonalLimitExceeded ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${percentUsed}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This booking uses <strong>{((grandTotal / remainingQuarterlyBudget) * 100).toFixed(1)}%</strong> of your remaining quarterly budget.
                    </p>
                    {isPersonalLimitExceeded && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        Exceeds your approved limit. Contact your manager.
                      </p>
                    )}
                    {!isPersonalLimitExceeded && isDepartmentBudgetExceeded && (
                      <p className="text-xs text-amber-700 mt-1 font-medium">
                        Budget exhausted. Requests blocked until reset or admin increases limit.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 mb-12">
              <button
                onClick={() => navigate('/booking-addons', { state: location.state })}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium text-base transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 border-2 border-[#e5e7eb] text-[#0e1e3f] rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/booking-payment', { state: { ...location.state, bookingFlow } })}
                  disabled={isPersonalLimitExceeded}
                  className="px-12 py-3 bg-[#2563eb] text-white rounded-lg font-medium text-base hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
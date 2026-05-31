// LEGACY — classic booking flow (RequestToBook → AddOns → Review → Payment).
// Superseded by the unified BookingFlow + BookingPayment chain. Kept routed
// for back-compat with deep links from notification emails. Do not extend.
// Plan to retire once email templates updated to point at /book/:id directly.
import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ChevronLeft, ChevronDown, Star, MapPin, Users, AlertCircle } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { MogzuLegacyDemoBanner } from '@/app/components/ui/MogzuLegacyDemoBanner';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgImage25005 from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { appendCorpVendorEnquiry, getCorporateCompanyDisplayName } from '@/app/lib/corpVendorEnquiryStorage';
import { buildClassicBookingBaseState, computeGrandTotal } from '@/app/lib/classicBookingFlow';

/** Passed from SpaceDetailPage when using Book Now → /dspace/book/:id */
type DspaceBookNavState = {
  from?: string
  category?: string
  spaceId?: string
  spaceName?: string
  spaceImage?: string
  location?: string
  spaceTypes?: string
  rating?: string
  bookingStartDate?: string
  fullDayBooking?: boolean
  bookingFromTime?: string
  bookingToTime?: string
  durationHours?: number
  selectedBookingAddons?: string[]
  bookingGrandTotal?: number
  bookingBaseTotal?: number
  addOnTotal?: number
}

export default function RequestToBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeBookSpaceId } = useParams<{ id: string }>();
  const dspaceNav = location.state as DspaceBookNavState | undefined;
  const isFromSpaceDetail = dspaceNav?.from === 'space-detail';
  const spaceIdDecoded = routeBookSpaceId ? decodeURIComponent(routeBookSpaceId) : '';
  const category = String(dspaceNav?.category ?? (location.state as { category?: string } | undefined)?.category ?? 'conference');
  const [planningFor, setPlanningFor] = useState('');
  const [attendees, setAttendees] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [approver, setApprover] = useState('');
  const [isFailed, setIsFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    planningFor?: string;
    attendees?: string;
    contactNumber?: string;
  }>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Category-specific content (must be defined before validateForm)
  const getCategoryContent = () => {
    switch (category) {
      case 'activity':
        return {
          title: 'Activity Booking',
          workspaceLabel: 'What type of activity?*',
          workspaceOptions: [
            { value: 'team-building', label: 'Team Building' },
            { value: 'wellness', label: 'Wellness & Yoga' },
            { value: 'workshop', label: 'Skill Workshop' },
          ],
          seatsLabel: 'How many participants?*',
          seatsPlaceholder: 'Number of participants',
          seatsMax: 100,
          spaceTypes: 'Team Building, Wellness, Workshop',
          capacityRange: '5-100 people',
          spaceName: 'Corporate Activity Suite',
        };
      case 'promotion':
        return {
          title: 'Claim Promotion / Deal',
          workspaceLabel: 'Select promotional package*',
          workspaceOptions: [
            { value: 'standard', label: 'Standard Package' },
            { value: 'premium', label: 'Premium Bundle' },
          ],
          seatsLabel: 'Quantity*',
          seatsPlaceholder: 'Number of packages',
          seatsMax: 10,
          spaceTypes: 'Promotional Bundles',
          capacityRange: '1-10 units',
          spaceName: 'Exclusive Vendor Deal',
        };
      case 'stay':
        return {
          title: 'Corporate Stay Booking',
          workspaceLabel: 'What type of room?*',
          workspaceOptions: [
            { value: 'single', label: 'Single Executive' },
            { value: 'double', label: 'Double Sharing' },
            { value: 'suite', label: 'Premium Suite' },
          ],
          seatsLabel: 'How many guests?*',
          seatsPlaceholder: 'Number of guests',
          seatsMax: 50,
          spaceTypes: 'Single, Double, Suite',
          capacityRange: '1-50 guests',
          spaceName: 'Executive Hotel Stay',
        };
      case 'event':
        return {
          title: 'Event Ticket Booking',
          workspaceLabel: 'Select Ticket Type*',
          workspaceOptions: [
            { value: 'general', label: 'General Admission' },
            { value: 'vip', label: 'VIP Pass' },
            { value: 'backstage', label: 'Backstage Access' },
          ],
          seatsLabel: 'How many tickets?*',
          seatsPlaceholder: 'Number of tickets',
          seatsMax: 200,
          spaceTypes: 'General, VIP, Backstage',
          capacityRange: '1-200 attendees',
          spaceName: 'Industry Tech Summit',
        };
      case 'gifting':
        return {
          title: 'Corporate Gifting Order',
          workspaceLabel: 'Select Gift Hamper*',
          workspaceOptions: [
            { value: 'welcome', label: 'Welcome Kit' },
            { value: 'festive', label: 'Festive Hamper' },
            { value: 'premium', label: 'Premium Executive Gift' },
          ],
          seatsLabel: 'How many hampers?*',
          seatsPlaceholder: 'Number of hampers',
          seatsMax: 500,
          spaceTypes: 'Welcome Kit, Festive Hamper, Executive Gift',
          capacityRange: '10-500 items',
          spaceName: 'Premium Gifting Partner',
        };
      case 'conference':
        return {
          title: 'Conference Room Booking',
          workspaceLabel: 'What type of conference room do you need?*',
          workspaceOptions: [
            { value: 'boardroom', label: 'Executive Boardroom' },
            { value: 'conference-hall', label: 'Conference Hall' },
            { value: 'training-room', label: 'Training Room' },
            { value: 'seminar-room', label: 'Seminar Room' },
          ],
          seatsLabel: 'How many attendees?*',
          seatsPlaceholder: 'Number of attendees (Max: 30)',
          seatsMax: 30,
          spaceTypes: 'Boardroom, Conference Hall, Training Room, Seminar Room',
          capacityRange: '4-30 people',
          spaceName: 'Professional Conference Center'
        };
      case 'casual':
        return {
          title: 'Casual Meeting Space Booking',
          workspaceLabel: 'What type of space do you need?*',
          workspaceOptions: [
            { value: 'lounge', label: 'Lounge Room' },
            { value: 'cafe-style', label: 'Café-Style Room' },
            { value: 'terrace', label: 'Terrace Seating' },
            { value: 'creative-studio', label: 'Creative Studio' },
          ],
          seatsLabel: 'How many people?*',
          seatsPlaceholder: 'Number of people (Max: 15)',
          seatsMax: 15,
          spaceTypes: 'Lounge, Café-Style, Terrace, Creative Studio',
          capacityRange: '2-15 people',
          spaceName: 'Creative Lounge Space'
        };
      case 'corporate':
        return {
          title: 'Corporate Event Space Booking',
          workspaceLabel: 'What type of event space do you need?*',
          workspaceOptions: [
            { value: 'banquet-hall', label: 'Banquet Hall' },
            { value: 'event-hall', label: 'Event Hall' },
            { value: 'auditorium', label: 'Mini Auditorium' },
            { value: 'function-room', label: 'Function Room' },
          ],
          seatsLabel: 'How many attendees?*',
          seatsPlaceholder: 'Number of attendees (Max: 100)',
          seatsMax: 100,
          spaceTypes: 'Banquet Hall, Event Hall, Auditorium, Function Room',
          capacityRange: '20-100 people',
          spaceName: 'Grand Event Venue'
        };
      default: // coworking
        return {
          title: 'Co-Working Space Booking',
          workspaceLabel: 'What type of workspace do you need?*',
          workspaceOptions: [
            { value: 'hot-desk', label: 'Hot Desk' },
            { value: 'dedicated-desk', label: 'Dedicated Desk' },
            { value: 'private-office', label: 'Private Office' },
            { value: 'meeting-room', label: 'Meeting Room' },
          ],
          seatsLabel: 'How many seats do you need?*',
          seatsPlaceholder: 'Number of seats (Max: 50)',
          seatsMax: 50,
          spaceTypes: 'Hot Desk, Dedicated Desk, Private Office, Meeting Rooms',
          capacityRange: '1-50 seats',
          spaceName: 'WorkHub BKC'
        };
    }
  };

  const content = getCategoryContent();

  const validateForm = () => {
    const nextErrors: { planningFor?: string; attendees?: string; contactNumber?: string } = {};

    if (!planningFor.trim()) {
      nextErrors.planningFor = 'Please select a booking type.';
    }

    const attendeesCount = Number(attendees);
    if (!attendees.trim() || Number.isNaN(attendeesCount) || attendeesCount < 1) {
      nextErrors.attendees = 'Please enter a valid attendee count.';
    } else if (attendeesCount > content.seatsMax) {
      nextErrors.attendees = `Attendees cannot exceed ${content.seatsMax}.`;
    }

    const phone = contactNumber.replace(/\D/g, '');
    if (phone.length !== 10) {
      nextErrors.contactNumber = 'Please enter a valid 10-digit contact number.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const formattedBookingDate = (() => {
    if (!dspaceNav?.bookingStartDate) return 'Jun 28, 2024';
    const d = new Date(`${dspaceNav.bookingStartDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return dspaceNav.bookingStartDate;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  const bookingDurationLabel = (() => {
    if (!isFromSpaceDetail || dspaceNav?.durationHours == null) return '3 Months';
    if (dspaceNav.fullDayBooking) return 'Full day (8h rate)';
    const fromT = dspaceNav.bookingFromTime ?? '09:00';
    const toT = dspaceNav.bookingToTime ?? '17:00';
    return `${dspaceNav.durationHours.toFixed(1)} hours (${fromT}–${toT})`;
  })();

  const summarySpaceName = isFromSpaceDetail && dspaceNav?.spaceName ? dspaceNav.spaceName : content.spaceName;
  const summarySpaceTypes = isFromSpaceDetail && dspaceNav?.spaceTypes ? dspaceNav.spaceTypes : content.spaceTypes;
  const summaryLocation = isFromSpaceDetail && dspaceNav?.location ? dspaceNav.location : 'Bandra Kurla Complex, Mumbai';
  const summaryRating = isFromSpaceDetail && dspaceNav?.rating ? dspaceNav.rating : '4.8';
  const summaryImage = isFromSpaceDetail && dspaceNav?.spaceImage ? dspaceNav.spaceImage : imgImage25005;

  const handleBackToSpaceOrHistory = () => {
    if (isFromSpaceDetail && spaceIdDecoded) {
      navigate(`/dspace/spaces/${encodeURIComponent(spaceIdDecoded)}`, { state: { category } });
      return;
    }
    navigate(-1);
  };

  const handleFooterBack = () => {
    if (isFromSpaceDetail && spaceIdDecoded) {
      navigate(`/dspace/spaces/${encodeURIComponent(spaceIdDecoded)}`, { state: { category } });
      return;
    }
    navigate('/bookings');
  };

  const handleEditBookingContext = () => {
    if (isFromSpaceDetail && spaceIdDecoded) {
      navigate(`/dspace/spaces/${encodeURIComponent(spaceIdDecoded)}`, { state: { category } });
      return;
    }
    navigate('/booking-flow');
  };

  if (isFailed) {
    return (
      <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
        <SharedSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader
            onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            searchPlaceholder="Search"
          />
          <MogzuCorporateScrollSurface className="flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-5 md:px-8 py-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Booking unsuccessful
                </h1>
                <p className="text-base text-gray-600 mb-8">
                  Something went wrong while processing your request. Your payment has not been charged.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsFailed(false)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/communication')}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
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
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search"
        />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <MogzuLegacyDemoBanner
              className="mb-4"
              title="Legacy booking flow"
              detail="This classic RequestToBook chain is kept for deep-link compatibility. Prefer the unified /book flow for new bookings."
            />
            {/* Back Button and Title */}
            <div className="mb-4 lg:mb-5">
              <button 
                type="button"
                onClick={handleBackToSpaceOrHistory}
                className="flex items-center gap-2 text-[#0e1e3f] hover:text-[#2563eb] mb-2 lg:mb-3"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <h1 className="text-xl lg:text-2xl font-semibold text-[#0e1e3f] leading-tight">{content.title}</h1>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center gap-2 lg:gap-3 mb-5 lg:mb-6 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 1:</span>
                <span className="text-xs lg:text-sm text-[#2563eb] font-medium">Booking details</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 2:</span>
                <span className="text-xs lg:text-sm text-[#959595]">Add ons</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 3:</span>
                <span className="text-xs lg:text-sm text-[#959595]">Review details</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 4:</span>
                <span className="text-xs lg:text-sm text-[#959595]">Pay</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
              {/* Left Column - Form */}
              <div className="bg-white rounded-lg p-4 md:p-5 lg:p-6">
                <h2 className="text-lg font-semibold text-[#0e1e3f] mb-5">Booking details</h2>
                
                {/* What type of workspace */}
                <div className="mb-4">
                  <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                    {content.workspaceLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={planningFor}
                      onChange={(e) => {
                        setPlanningFor(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, planningFor: undefined }));
                      }}
                      className="w-full pl-3 pr-9 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                    >
                      <option value="">Select {category === 'conference' ? 'room' : category === 'corporate' ? 'space' : 'type'}</option>
                      {content.workspaceOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                  </div>
                  {fieldErrors.planningFor && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.planningFor}</p>
                  )}
                </div>

                {/* How many seats */}
                <div className="mb-4">
                  <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                    {content.seatsLabel}
                  </label>
                  <input
                    type="number"
                    placeholder={content.seatsPlaceholder}
                    value={attendees}
                    onChange={(e) => {
                      setAttendees(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, attendees: undefined }));
                    }}
                    min="1"
                    max={content.seatsMax}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  />
                  {fieldErrors.attendees && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.attendees}</p>
                  )}
                </div>

                {/* Contact number */}
                <div className="mb-4">
                  <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                    Contact number*
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-28">
                      <div className="flex items-center gap-2 px-3 py-2.5 border border-[#e5e7eb] rounded-lg bg-white">
                        <span className="text-xl">🇮🇳</span>
                        <span className="text-sm text-[#0e1e3f]">+91</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#959595] ml-auto" />
                      </div>
                    </div>
                    <input
                      type="tel"
                      placeholder="9862"
                      value={contactNumber}
                      onChange={(e) => {
                        setContactNumber(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, contactNumber: undefined }));
                      }}
                      className="flex-1 px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </div>
                  {fieldErrors.contactNumber && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.contactNumber}</p>
                  )}
                </div>

                {/* Select the team */}
                <div className="mb-4">
                  <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                    Select the team
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                    >
                      <option value="">select from team</option>
                      <option value="team1">Team 1</option>
                      <option value="team2">Team 2</option>
                      <option value="team3">Team 3</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                  </div>
                </div>

                {/* Who needs to approve this booking */}
                <div>
                  <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                    Who needs to approve this booking?
                  </label>
                  <div className="relative">
                    <select
                      value={approver}
                      onChange={(e) => setApprover(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                    >
                      <option value="">select team member</option>
                      <option value="manager1">Manager 1</option>
                      <option value="manager2">Manager 2</option>
                      <option value="manager3">Manager 3</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="bg-white rounded-lg p-5 lg:sticky lg:top-6 lg:self-start">
                {/* Space Details */}
                <div className="mb-5">
                  <div className="relative rounded-md overflow-hidden mb-3">
                    <img 
                      src={summaryImage} 
                      alt={summarySpaceName} 
                      className="w-full h-[130px] object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#22c55e] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="text-white text-sm font-normal">{summaryRating}</span>
                      <Star className="w-[15px] h-[15px] fill-white text-white" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-[#0e1e3f] mb-1">
                    {summarySpaceName}
                  </h3>
                  <p className="text-xs text-[#878e9e] mb-2">
                    {summarySpaceTypes}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#878e9e]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-[18px] h-[18px]" />
                      <span>{summaryLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#878e9e] mt-1.5">
                    <Users className="w-[18px] h-[18px]" />
                    <span>{content.capacityRange}</span>
                  </div>
                </div>

                {/* Date and Duration */}
                <div className="mb-5 pb-5 border-b border-[#e5e7eb]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-semibold text-[#0e1e3f]">
                      {isFromSpaceDetail ? 'Booking date & time' : 'Membership period'}
                    </h4>
                    <button
                      type="button"
                      onClick={handleEditBookingContext}
                      className="text-xs text-[#2563eb] font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-[#878e9e] mb-0.5">Start date</p>
                      <p className="text-sm text-[#0e1e3f]">{formattedBookingDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#878e9e] mb-0.5">Duration</p>
                      <p className="text-sm text-[#0e1e3f]">{bookingDurationLabel}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-base font-semibold text-[#0e1e3f] mb-3">Price</h4>
                  <div className="space-y-1.5">
                    {isFromSpaceDetail && typeof dspaceNav?.bookingGrandTotal === 'number' ? (
                      <>
                        <div className="flex justify-between text-sm text-[#475569]">
                          <span>
                            {dspaceNav.fullDayBooking
                              ? 'Day rate'
                              : `Base (${(dspaceNav.durationHours ?? 0).toFixed(1)} h)`}
                          </span>
                          <span>₹{(dspaceNav.bookingBaseTotal ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                        {(dspaceNav.addOnTotal ?? 0) > 0 ? (
                          <div className="flex justify-between text-sm text-[#475569]">
                            <span>Add-ons</span>
                            <span>₹{(dspaceNav.addOnTotal ?? 0).toLocaleString('en-IN')}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between text-base font-medium text-[#0e1e3f] pt-2 border-t border-[#e5e7eb]">
                          <span>Total</span>
                          <span>₹{dspaceNav.bookingGrandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm text-[#475569]">
                          <span>₹22,000 x 3 months</span>
                          <span>₹66,000</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#475569]">
                          <span>Service fee</span>
                          <span>₹6,600</span>
                        </div>
                        <div className="flex justify-between text-base font-medium text-[#0e1e3f] pt-2 border-t border-[#e5e7eb]">
                          <span>Total</span>
                          <span>₹72,600</span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#878e9e] mt-3">
                    {isFromSpaceDetail
                      ? 'Cancellation and changes follow the venue policy shown on the listing.'
                      : 'Free cancellation up to 7 days prior to start date'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-5 mb-8">
              <button
                type="button"
                onClick={handleFooterBack}
                className="flex items-center justify-center sm:justify-start gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium text-base transition-colors order-2 sm:order-1"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 border-2 border-[#e5e7eb] text-[#0e1e3f] rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!validateForm()) {
                      return;
                    }
                    const baseFlow = buildClassicBookingBaseState({
                      category,
                      dspaceBook: dspaceNav,
                    });
                    const normalizedAddOnTotal =
                      typeof baseFlow.addOnTotal === 'number'
                        ? baseFlow.addOnTotal
                        : 0;
                    const nextFlow = {
                      ...baseFlow,
                      selection: {
                        planningFor,
                        attendees: Number(attendees),
                        contactNumber,
                        selectedTeam,
                        approver,
                      },
                      capacityRange: content.capacityRange,
                      bookingGrandTotal: computeGrandTotal(
                        baseFlow.bookingBaseTotal,
                        baseFlow.serviceFee,
                        normalizedAddOnTotal
                      ),
                    };
                    const catContent = getCategoryContent();
                    appendCorpVendorEnquiry({
                      corporateCompanyName: getCorporateCompanyDisplayName(),
                      requirementSummary: `Corporate booking request — ${catContent.title}. Space: ${summarySpaceName}. Type: ${planningFor}. Phone: ${contactNumber}. Team: ${selectedTeam || '—'}. Approver: ${approver || '—'}.`,
                      requestedDate: formattedBookingDate,
                      durationLabel: bookingDurationLabel,
                      headcountOrQty: Number(attendees),
                      offerAmountDisplay: null,
                      productId: 0,
                      productName: summarySpaceName,
                      source: 'request-to-book',
                    });
                    navigate('/booking-addons', {
                      state: {
                        category,
                        bookingFlow: nextFlow,
                        ...(isFromSpaceDetail && spaceIdDecoded
                          ? { dspaceBook: dspaceNav, spaceId: spaceIdDecoded }
                          : {}),
                      },
                    });
                  }}
                  className="px-12 py-3 bg-[#2563eb] text-white rounded-lg font-medium text-base hover:bg-[#1d4ed8] transition-colors"
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
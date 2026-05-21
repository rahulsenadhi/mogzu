import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ChevronLeft, MapPin, Users, Edit, Flag, Loader2 } from 'lucide-react';
import svgPaths from '@/imports/svg-camfkj9vq4';
import imgImage25005 from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { isInvoiceEligibleStatus } from '@/app/lib/bookingStatus';
import { BookingMessagesPanel } from './global/BookingMessagesPanel';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Booking, Listing } from '@/lib/database.types';

type RealBooking = Booking & { listings: Listing | null };

const DISPUTE_CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'service_quality', label: 'Service quality' },
  { value: 'refund', label: 'Refund issue' },
  { value: 'vendor_no_show', label: 'Vendor no-show' },
  { value: 'payment', label: 'Payment issue' },
  { value: 'other', label: 'Other' },
];

interface BookingDetail {
  id: string;
  bookingId: string;
  plannedFor: string;
  attendees: number;
  team: string;
  contact: string;
  vendorContact: {
    name: string;
    phone: string;
    email: string;
  };
  venue: {
    name: string;
    rating: number;
    description: string;
    location: string;
    capacity: string;
    image: string;
  };
  addOns: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  equipments: string[];
  dateTime: {
    checkIn: string;
    checkOut: string;
  };
  price: {
    basePrice: number;
    hours: number;
    processing: number;
    total: number;
  };
  bookingStatus: {
    requestApprovedBy: string;
    approvedOn: string;
    vendorReply: string;
    vendorReplyOn: string;
    currentStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'INQUIRY' | 'APPROVED' | 'Requested' | 'PUBLISHED';
  };
  paymentStatus: {
    budgetAllocated: number;
    paymentType: 'Card' | 'PO' | 'UPI' | 'Empanelled' | 'None';
    status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'NOT REQUIRED';
  };
}

// Mock booking data
const mockBookingData: BookingDetail = {
  id: '1',
  bookingId: '1240909',
  plannedFor: 'Meeting',
  attendees: 10,
  team: 'Design team',
  contact: '8902888889',
  vendorContact: {
    name: 'NESCO Venue Team',
    phone: '+91 90210 33445',
    email: 'venue.team@nesco-demo.com',
  },
  venue: {
    name: 'NESCO IT Park',
    rating: 4.5,
    description: 'Co-working Membership, Dedicated Desk, Private Office, Full Floor Office',
    location: 'Goregaon (East) Mumbai',
    capacity: '1-10',
    image: imgImage25005
  },
  addOns: [
    {
      name: 'Coffee & Tea',
      description: 'For per person',
      icon: 'coffee'
    },
    {
      name: 'Drinking Water',
      description: 'For per person',
      icon: 'water'
    }
  ],
  equipments: [
    'Projector (1)',
    'Chairs (15)',
    'Table (1)',
    'Whiteboard (1)',
    'Pens (10)',
    'Notepads (10)',
    'Mic (1)',
    'Speaker (1)'
  ],
  dateTime: {
    checkIn: 'Jun 28, 2024 • 09:00 am',
    checkOut: 'Jun 29, 2024 • 05:00 pm'
  },
  price: {
    basePrice: 3000,
    hours: 8,
    processing: 1000,
    total: 25000
  },
  bookingStatus: {
    requestApprovedBy: 'Kapil Dev',
    approvedOn: 'On 20 Jun 2024',
    vendorReply: 'Confirmed by vendor',
    vendorReplyOn: 'On 23 Jun 2024',
    currentStatus: 'CONFIRMED'
  },
  paymentStatus: {
    budgetAllocated: 15000,
    paymentType: 'Card',
    status: 'PAID'
  }
};

export default function BookingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const { profile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [realBooking, setRealBooking] = useState<RealBooking | null>(null);
  const [realLoading, setRealLoading] = useState(false);

  const [raiseOpen, setRaiseOpen] = useState(false);
  const [raiseCategory, setRaiseCategory] = useState<string>('service_quality');
  const [raiseBody, setRaiseBody] = useState('');
  const [raiseSubmitting, setRaiseSubmitting] = useState(false);
  const [raiseError, setRaiseError] = useState('');
  const [raiseSuccess, setRaiseSuccess] = useState(false);

  const loadReal = useCallback(async () => {
    if (!id) return;
    setRealLoading(true);
    const { data, error } = await db.bookings.getById(id);
    if (!error && data) setRealBooking(data as RealBooking);
    setRealLoading(false);
  }, [id]);

  useEffect(() => {
    loadReal();
  }, [loadReal]);

  const handleRaiseDispute = async () => {
    if (!realBooking || !profile) return;
    const body = raiseBody.trim();
    if (body.length < 20) {
      setRaiseError('At least 20 characters of context.');
      return;
    }
    setRaiseSubmitting(true);
    setRaiseError('');
    const { error } = await db.bookingDisputes.raise({
      booking_id: realBooking.id,
      raised_by: profile.id,
      reason_category: raiseCategory,
      reason_body: body,
      status: 'open',
      evidence_urls: [],
      resolution: null,
      resolution_note: null,
      resolved_by: null,
      resolved_at: null,
    });
    setRaiseSubmitting(false);
    if (error) {
      setRaiseError(error.message);
      return;
    }
    setRaiseSuccess(true);
    setRaiseBody('');
    setTimeout(() => {
      setRaiseOpen(false);
      setRaiseSuccess(false);
    }, 1500);
  };

  const passedBooking = location.state?.booking;

  const booking = useMemo(() => {
    // If we have a passed booking, generate context-aware data
    if (passedBooking) {
      const basePrice = passedBooking.price;
      const attendees = passedBooking.attendance;
      const plannedFor = passedBooking.name;
      const bookingId = passedBooking.id;
      
      let currentStatus = passedBooking.status;
      let paymentStatus: BookingDetail['paymentStatus']['status'] = 'PENDING';
      let paymentType: BookingDetail['paymentStatus']['paymentType'] = 'None';
      let vendorReply = 'Awaiting vendor reply';
      let requestApprovedBy = 'Pending Approval';
      
      // Generate status logic based on passed booking type/status
      if (currentStatus === 'CONFIRMED' || currentStatus === 'PUBLISHED') {
        paymentStatus = 'PAID';
        paymentType = 'Card';
        vendorReply = 'Confirmed by vendor';
        requestApprovedBy = passedBooking.assignTo;
      } else if (currentStatus === 'INQUIRY') {
        paymentStatus = 'NOT REQUIRED';
        vendorReply = 'Inquiry sent to vendor';
        requestApprovedBy = 'N/A';
      } else if (currentStatus === 'CANCELLED') {
        paymentStatus = 'REFUNDED';
        vendorReply = 'Cancelled';
        requestApprovedBy = passedBooking.assignTo;
      } else if (currentStatus === 'APPROVED') {
        paymentStatus = 'PENDING';
        paymentType = 'PO';
        vendorReply = 'Approved, awaiting payment';
        requestApprovedBy = passedBooking.assignTo;
      } else if (currentStatus === 'Requested' || currentStatus === 'PENDING') {
        paymentStatus = 'PENDING';
        vendorReply = 'Awaiting response';
        requestApprovedBy = 'Awaiting Approval';
      }

      return {
        ...mockBookingData,
        id: bookingId,
        bookingId: bookingId,
        plannedFor: plannedFor,
        attendees: attendees,
        venue: {
          ...mockBookingData.venue,
          name: passedBooking.venue.split(',')[0],
          location: passedBooking.venue
        },
        dateTime: {
          checkIn: passedBooking.fromDate,
          checkOut: passedBooking.toDate
        },
        price: {
          basePrice: basePrice,
          hours: 8,
          processing: Math.round(basePrice * 0.05),
          total: basePrice + Math.round(basePrice * 0.05)
        },
        bookingStatus: {
          requestApprovedBy,
          approvedOn: passedBooking.fromDate, // simplified mock date
          vendorReply,
          vendorReplyOn: passedBooking.fromDate, // simplified mock date
          currentStatus
        },
        paymentStatus: {
          budgetAllocated: basePrice + 5000,
          paymentType,
          status: paymentStatus
        }
      } as BookingDetail;
    }
    
    // Fallback if accessed directly via URL without state
    return {
      ...mockBookingData,
      bookingId: id || mockBookingData.bookingId
    };
  }, [passedBooking, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PUBLISHED':
        return 'bg-teal-500 text-white';
      case 'APPROVED':
        return 'bg-purple-500 text-white';
      case 'PENDING':
      case 'Requested':
        return 'bg-orange-400 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      case 'INQUIRY':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500 text-white';
      case 'PENDING':
        return 'bg-orange-400 text-white';
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-500 text-white';
      case 'NOT REQUIRED':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleDownloadPdf = () => {
    // Demo-only: route to invoices list instead of generating a real PDF.
    navigate('/billing-invoices', { state: { bookingId: booking.bookingId } });
  };

  const handleContactSupport = () => {
    navigate('/communication', { state: { bookingId: booking.bookingId } });
  };

  const handleRespondWithQuote = () => {
    const cat = (passedBooking?.category as string | undefined) ?? booking.venue.description.toLowerCase().includes('event') ? 'event' : 'conference';
    navigate('/booking-review', { state: { category: cat, bookingId: booking.bookingId } });
  };

  const handleMarkUnavailable = () => {
    navigate('/bookings', { state: { bookingId: booking.bookingId, reason: 'unavailable' } });
  };

  const handleApproveRequest = () => {
    const cat = (passedBooking?.category as string | undefined) ?? 'conference';
    navigate('/booking-payment', { state: { category: cat, bookingId: booking.bookingId } });
  };

  const handleDeclineRequest = () => {
    navigate('/bookings', { state: { bookingId: booking.bookingId, reason: 'declined' } });
  };

  const handleFollowUpWithVendor = () => {
    navigate('/communication', { state: { bookingId: booking.bookingId, action: 'follow-up' } });
  };

  const handleMessageVendor = () => {
    navigate('/communication', { state: { bookingId: booking.bookingId, vendor: 'vendor', action: 'post-booking' } });
  };

  const handleCallVendor = () => {
    navigate('/communication', { state: { bookingId: booking.bookingId, vendor: 'vendor', channel: 'callback' } });
  };

  const handleEmailVendor = () => {
    navigate('/communication', { state: { bookingId: booking.bookingId, vendor: 'vendor', channel: 'email' } });
  };

  const handleEmailInvoice = () => {
    navigate('/billing-invoices', { state: { bookingId: booking.bookingId, action: 'email' } });
  };

  const enquiryEdgeState = searchParams.get('enquiryState') || '';
  const showNudge = enquiryEdgeState === 'no-response-24h';
  const isVendorWithdrawn = enquiryEdgeState === 'vendor-withdrawn';
  const isDuplicateEnquiry = enquiryEdgeState === 'duplicate';
  const isOfferExpired = enquiryEdgeState === 'offer-expired';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader 
          searchPlaceholder="Search bookings..." 
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Page Content */}
        <MogzuCorporateScrollSurface className="p-6 lg:p-8">
          {(() => {
            const isInvoiceView =
              location.state?.fromTab === 'Invoices' || isInvoiceEligibleStatus(booking.bookingStatus.currentStatus);
            return (
          <div className="max-w-[1200px] mx-auto">
            {/* Top Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <button 
                onClick={() => navigate('/bookings')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#2563eb] transition-colors w-fit"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Bookings</span>
              </button>
              
              <div className="flex flex-wrap gap-3">
                {isInvoiceView && (
                  <button
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 bg-white border border-[#2563eb] text-[#2563eb] rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                )}
                <button
                  onClick={
                    isInvoiceView
                      ? () =>
                          navigate('/booking-payment', {
                            state: { category: 'conference', bookingId: booking.bookingId },
                          })
                      : handleContactSupport
                  }
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {isInvoiceView ? 'Pay Invoice' : 'Contact Support'}
                </button>
                {realBooking && (
                  <button
                    onClick={() => setRaiseOpen(true)}
                    className="px-4 py-2 bg-white border border-rose-300 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Flag className="w-4 h-4" />
                    Raise a dispute
                  </button>
                )}
              </div>
            </div>

            {/* Header Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#0e1e3f]">
                    {isInvoiceView ? `Invoice INV-${booking.bookingId}` : `Booking #${booking.bookingId}`}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.bookingStatus.currentStatus)}`}>
                    {booking.bookingStatus.currentStatus}
                  </span>
                </div>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                  {booking.plannedFor} 
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
                  {booking.venue.name}
                </p>
              </div>
              
              <div className="flex items-center gap-6 sm:gap-8 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-[#0e1e3f]">₹ {booking.price.total.toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-[#0e1e3f]">{booking.dateTime.checkIn.split(' •')[0]}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (Main Details) */}
              <div className="lg:col-span-2 space-y-6">
                {(showNudge || isVendorWithdrawn || isDuplicateEnquiry || isOfferExpired) && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-[#0e1e3f] mb-4">Enquiry Updates</h2>

                    {showNudge && (
                      <div className="mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-700">
                          No vendor response yet (24+ hours). A reminder has been sent automatically.
                        </p>
                      </div>
                    )}

                    {isVendorWithdrawn && (
                      <div className="mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-700 mb-3">
                          This listing was withdrawn by the vendor after your enquiry.
                        </p>
                        <button
                          onClick={handleMarkUnavailable}
                          className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View alternatives
                        </button>
                      </div>
                    )}

                    {isDuplicateEnquiry && (
                      <div className="mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-700">
                          Duplicate enquiry detected for this listing. Please use your existing thread to continue.
                        </p>
                      </div>
                    )}

                    {isOfferExpired && (
                      <div className="mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-700 mb-3">
                          The vendor offer has expired. Request a refreshed quote to continue.
                        </p>
                        <button
                          onClick={handleDeclineRequest}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          Request new offer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isInvoiceView && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-[#0e1e3f] mb-6 border-b border-slate-100 pb-4">Invoice Breakdown</h2>
                    
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between items-center py-3 border-b border-slate-50">
                        <span className="text-slate-600 text-sm">Base Price ({booking.price.hours} hours)</span>
                        <span className="font-semibold text-[#0e1e3f]">₹ {(booking.price.basePrice * booking.price.hours).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-50">
                        <span className="text-slate-600 text-sm">Processing Fee</span>
                        <span className="font-semibold text-[#0e1e3f]">₹ {booking.price.processing.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-50">
                        <span className="text-slate-600 text-sm">GST (18%)</span>
                        <span className="font-semibold text-[#0e1e3f]">₹ {Math.round(booking.price.total * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 bg-slate-50 px-5 rounded-xl mt-4 border border-slate-100">
                        <span className="font-bold text-[#0e1e3f]">Total Billed</span>
                        <span className="text-xl font-bold text-[#2563eb]">₹ {Math.round(booking.price.total * 1.18).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                      <div>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">Billed To</p>
                        <p className="font-bold text-[#0e1e3f] text-sm">{booking.team}</p>
                        <p className="text-sm text-slate-600 mt-1">Contact: {booking.contact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">Payment Status</p>
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase mt-1 ${getPaymentStatusColor(booking.paymentStatus.status)}`}>
                          {booking.paymentStatus.status}
                        </span>
                        <p className="text-sm text-slate-600 mt-2 font-medium">Via {booking.paymentStatus.paymentType}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-[#0e1e3f] mb-6">Booking Details</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Attendees</p>
                          <p className="font-bold text-[#0e1e3f] flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-slate-400" />
                            {booking.attendees} People
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Team</p>
                          <p className="font-bold text-[#0e1e3f] text-sm">{booking.team}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Check In / Out</p>
                          <p className="font-bold text-[#0e1e3f] text-sm">{booking.dateTime.checkIn}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{booking.dateTime.checkOut}</p>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-[#0e1e3f] mb-4">Venue Information</h3>
                        <div className="flex flex-col sm:flex-row gap-5">
                          <img src={booking.venue.image} alt={booking.venue.name} className="w-full sm:w-28 h-32 sm:h-28 rounded-xl object-cover shadow-sm" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-[#0e1e3f] text-base">{booking.venue.name}</p>
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                {booking.venue.rating} ★
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mb-2.5">
                              <MapPin className="w-3.5 h-3.5" /> {booking.venue.location}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">{booking.venue.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                      <h2 className="text-lg font-bold text-[#0e1e3f] mb-6">Requirements & Add-ons</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Included Equipment</h3>
                          <ul className="space-y-2.5">
                            {booking.equipments.map((eq, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                                {eq}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Requested Add-ons</h3>
                          <div className="space-y-3">
                            {booking.addOns.map((addon, i) => (
                              <div key={i} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#2563eb] flex-shrink-0">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#0e1e3f]">{addon.name}</p>
                                  <p className="text-xs text-slate-500 font-medium mt-0.5">{addon.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
              </div>

              {/* Right Column (Actions & Status) */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-sm font-bold text-[#0e1e3f] uppercase tracking-wider mb-5">Actions</h2>
                  
                  <div className="space-y-3">
                    {(location.state?.fromTab === 'Booking Inquiry' || location.state?.fromTab === 'Booking Inquiries' || booking.bookingStatus.currentStatus === 'INQUIRY') && (
                      <>
                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">This is an active inquiry. Respond to the client to proceed with booking.</p>
                        <button
                          onClick={handleRespondWithQuote}
                          className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Respond with Quote
                        </button>
                        <button
                          onClick={handleMarkUnavailable}
                          className="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                        >
                          Mark as Unavailable
                        </button>
                      </>
                    )}
                    
                    {(location.state?.fromTab === 'Booking Request' || location.state?.fromTab === 'Booking Requests' || booking.bookingStatus.currentStatus === 'Requested') && (
                      <>
                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">Client has requested to book. Awaiting your approval.</p>
                        <button
                          onClick={handleApproveRequest}
                          className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={handleDeclineRequest}
                          className="w-full py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                          Decline Request
                        </button>
                      </>
                    )}

                    {(location.state?.fromTab === 'Pending' || booking.bookingStatus.currentStatus === 'PENDING') && (
                      <>
                        <button
                          onClick={handleFollowUpWithVendor}
                          className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Follow up with Vendor
                        </button>
                        <button 
                          onClick={() => navigate('/cancel-booking')}
                          className="w-full py-2.5 bg-white border-2 border-slate-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {(booking.bookingStatus.currentStatus === 'CONFIRMED' || booking.bookingStatus.currentStatus === 'PUBLISHED') && (
                      <>
                        <button 
                          onClick={() => navigate('/reschedule-booking')}
                          className="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                        >
                          Modify Booking
                        </button>
                        <button 
                          onClick={() => navigate('/cancel-booking')}
                          className="w-full py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    
                    {isInvoiceView && (
                      <>
                        <button
                          onClick={handleEmailInvoice}
                          className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Invoice
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {(booking.bookingStatus.currentStatus === 'CONFIRMED' || booking.bookingStatus.currentStatus === 'PUBLISHED') && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-bold text-[#0e1e3f] uppercase tracking-wider mb-5">Vendor Contact</h2>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-bold text-[#0e1e3f]">{booking.vendorContact.name}</p>
                      <p className="text-xs text-slate-600 font-medium">Phone: {booking.vendorContact.phone}</p>
                      <p className="text-xs text-slate-600 font-medium">Email: {booking.vendorContact.email}</p>
                    </div>
                    <div className="space-y-2.5">
                      <button
                        onClick={handleMessageVendor}
                        className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Message Vendor
                      </button>
                      <button
                        onClick={handleCallVendor}
                        className="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                      >
                        Request Call Back
                      </button>
                      <button
                        onClick={handleEmailVendor}
                        className="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                      >
                        Email Vendor
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-sm font-bold text-[#0e1e3f] uppercase tracking-wider mb-5">Status Timeline</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#2563eb] ring-4 ring-blue-50 z-10" />
                        <div className="w-0.5 h-full bg-slate-100 mt-2" />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-bold text-[#0e1e3f]">Created</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">{booking.bookingStatus.approvedOn || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {booking.bookingStatus.vendorReply && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 z-10" />
                          <div className="w-0.5 h-full bg-slate-100 mt-2" />
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-bold text-[#0e1e3f]">Vendor Reply</p>
                          <p className="text-sm font-medium text-slate-600 mt-1">{booking.bookingStatus.vendorReply}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1">{booking.bookingStatus.vendorReplyOn || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ring-4 z-10 ${
                          booking.bookingStatus.currentStatus === 'CONFIRMED' || booking.bookingStatus.currentStatus === 'PUBLISHED' ? 'bg-emerald-500 ring-emerald-50' :
                          booking.bookingStatus.currentStatus === 'CANCELLED' ? 'bg-red-500 ring-red-50' : 'bg-orange-400 ring-orange-50'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0e1e3f]">Current Status</p>
                        <p className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">{booking.bookingStatus.currentStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {realBooking && (
              <div className="mt-6">
                <BookingMessagesPanel
                  bookingId={realBooking.id}
                  vendorId={realBooking.vendor_id}
                />
              </div>
            )}
          </div>
            );
          })()}
        </MogzuCorporateScrollSurface>
      </div>

      {raiseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Flag className="size-5 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-900">Raise a dispute</h3>
            </div>

            {raiseSuccess ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Dispute submitted. Support will reach out shortly.
              </p>
            ) : (
              <>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Category
                </label>
                <select
                  value={raiseCategory}
                  onChange={(e) => setRaiseCategory(e.target.value)}
                  className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  {DISPUTE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  What went wrong?
                </label>
                <textarea
                  value={raiseBody}
                  onChange={(e) => setRaiseBody(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue in at least 20 characters."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />

                {raiseError && (
                  <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {raiseError}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRaiseOpen(false);
                      setRaiseError('');
                    }}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRaiseDispute}
                    disabled={raiseSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    {raiseSubmitting && <Loader2 className="size-4 animate-spin" />}
                    Submit dispute
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { ChevronRight, MapPin, Users, Star, Clock, Calendar, Shield, Heart, Share2, Check, Info, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { QA_IMAGES } from '../lib/qaImagery';
import PriceBlock from './ui/PriceBlock';
import type { ListingBuyerDetailBlock } from '@/app/lib/mogzuDomain';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import { getWishlistIds, toggleWishlistId } from '@/app/lib/listingSessionState';
import { useBookingDraft } from '@/app/lib/bookingDraft';

interface ResponseStatusBannerProps {
  status: 'awaiting' | 'best_offer' | 'accepted' | 'declined';
  comment?: string;
  eventId?: number;
}

function ResponseStatusBanner({ status, comment, eventId }: ResponseStatusBannerProps) {
  const navigate = useNavigate();

  const getBannerConfig = () => {
    switch (status) {
      case 'awaiting':
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: <Info className="w-5 h-5 text-slate-600" />,
          title: 'Awaiting vendor response',
          titleColor: 'text-slate-800',
          subtext: 'Your enquiry was sent. Vendors typically respond within 4 hours.',
          displayComment: '—'
        };
      case 'best_offer':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          title: 'Best offer received',
          titleColor: 'text-blue-800',
          cta: 'Accept offer'
        };
      case 'accepted':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          title: 'Offer accepted',
          titleColor: 'text-green-800'
        };
      case 'declined':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          title: 'Offer declined',
          titleColor: 'text-red-800',
          cta: 'View alternatives'
        };
    }
  };

  const config = getBannerConfig();
  const displayComment = config.displayComment || comment || "The vendor has not provided a comment yet.";

  return (
    <div className={`mt-3 rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col gap-3 transition-all duration-300`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {config.icon}
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>{config.title}</h4>
        </div>
        {config.subtext && (
          <p className="text-[11px] text-slate-500 ml-7">{config.subtext}</p>
        )}
      </div>
      
      <div className="bg-white/60 rounded-lg p-3 text-sm text-gray-700 border border-black/5">
        <span className="font-medium text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Vendor Comment</span>
        <p className="text-xs leading-relaxed">{displayComment}</p>
      </div>

      {config.cta && (
        <button
          type="button"
          onClick={() => {
            if (status === 'best_offer') {
              navigate('/booking-flow', {
                state: { source: 'event-detail', eventId, acceptedOffer: true },
              });
              return;
            }
            if (status === 'declined') {
              navigate('/event-activity');
            }
          }}
          className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            status === 'best_offer'
              ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          {config.cta}
        </button>
      )}
    </div>
  );
}

const defaultEventListingBuyerDetail: ListingBuyerDetailBlock = {
  amenities: ['AV equipment', 'High-speed WiFi', 'Catering available', 'Air conditioning'],
  portfolio_links: [],
  portfolio_captions: [],
  policies: ['ID required for all attendees', 'Outside catering subject to venue approval'],
  payment_methods: ['Credit Card', 'UPI', 'Corporate invoice'],
  payment_terms: 'Pay 25% advance to confirm · remaining balance due 3 days before the event',
};

// Re-using the data from EventActivityPage for simplicity
const eventActivities: Array<{
  id: number;
  title: string;
  description: string;
  location: string;
  capacity: string;
  rating: number;
  price: string;
  host: string;
  hostNote: string;
  image: string;
  galleryImages?: string[];
  buyer_detail?: ListingBuyerDetailBlock;
}> = [
  {
    id: 1,
    title: 'The Business of Personal Training',
    description: 'Elevate Your Personal Training Skills',
    location: 'Goregaon (East) Mumbai',
    capacity: 'Max: 500   Min: 300',
    rating: 4.5,
    price: '₹15,000',
    host: 'Michiel',
    hostNote: '33% of attendees are repeat customers',
    image: QA_IMAGES.eventCard[0],
    buyer_detail: defaultEventListingBuyerDetail,
  },
  // Adding just one item for demonstration, we can fallback to this if not found.
];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [liked, setLiked] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [pricingFeedback, setPricingFeedback] = useState('');
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingDateError, setBookingDateError] = useState('');
  const [isBookingDateUnavailable, setIsBookingDateUnavailable] = useState(false);
  const [gridUiNotice, setGridUiNotice] = useState<string | null>(null);
  const [bookingSticky, setBookingSticky] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [imageTransitioning, setImageTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate information');
  const [reportNotes, setReportNotes] = useState('');
  const [dateHintPulse, setDateHintPulse] = useState(false)
  const [dateHintText, setDateHintText] = useState('')
  const [heartAnim, setHeartAnim] = useState<'in' | 'out' | null>(null)
  const loadListingTimerRef = useRef<number | null>(null);
  const { bookingDraft, setDraftPartial, clearDraft } = useBookingDraft();

  const loadListing = () => {
    setIsLoading(true);
    setLoadError('');
    if (loadListingTimerRef.current) window.clearTimeout(loadListingTimerRef.current);
    loadListingTimerRef.current = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === '1') {
        setLoadError('Unable to load event listing details. Please retry.');
      }
      setIsLoading(false);
    }, 700);
  };

  useEffect(() => {
    loadListing();
    return () => {
      if (loadListingTimerRef.current) window.clearTimeout(loadListingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    if (!bookingStartDate) {
      setIsBookingDateUnavailable(false);
      return;
    }

    // Demo availability rule: mark some dates as unavailable deterministically.
    const parsed = new Date(`${bookingStartDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      setIsBookingDateUnavailable(false);
      return;
    }

    const day = parsed.getDate();
    setIsBookingDateUnavailable(day % 7 === 0);
  }, [bookingStartDate]);

  useEffect(() => {
    const onScroll = () => setBookingSticky(window.scrollY > 280);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const validateBookingStartDate = () => {
    if (!bookingSlot) {
      setBookingDateError('Please choose a time slot.');
      setDateHintText('Select a date to see available time slots')
      setDateHintPulse(true)
      document.getElementById('booking-start-date-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => setDateHintPulse(false), 1300)
      window.setTimeout(() => setDateHintText(''), 3000)
      return false;
    }
    setBookingDateError('');
    if (!bookingStartDate) {
      setBookingDateError('Please select a start date.');
      setDateHintText('Select a date to see available time slots')
      setDateHintPulse(true)
      document.getElementById('booking-start-date-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => setDateHintPulse(false), 1300)
      window.setTimeout(() => setDateHintText(''), 3000)
      return false;
    }
    if (isBookingDateUnavailable) {
      setBookingDateError('This listing is unavailable on the selected date. Choose another date.');
      return false;
    }
    return true;
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback('Link copied to clipboard.');
      } else {
        setShareFeedback('Copy is not supported in this browser.');
      }
    } catch {
      setShareFeedback('Unable to copy link right now.');
    }
  };

  const activity = eventActivities.find((a) => a.id === parseInt(id || '1')) || eventActivities[0];
  const listingId = String(activity.id);
  const pricingType =
    (location.state as { pricing_type?: 'transparent' | 'offer_price' | 'request_for_price' } | null)?.pricing_type ??
    (activity.id % 3 === 0 ? 'request_for_price' : activity.id % 2 === 0 ? 'transparent' : 'offer_price');
  const eventBuyerDetail = activity.buyer_detail ?? defaultEventListingBuyerDetail;
  const galleryImages = activity.galleryImages ?? [];
  const allGallery = [activity.image, ...galleryImages];

  useEffect(() => {
    setMainImage(activity.image);
    setLiked(getWishlistIds().includes(listingId));
  }, [activity.image, listingId]);

  useEffect(() => {
    setDraftPartial({
      listing: {
        id: listingId,
        title: activity.title,
        image: activity.image,
        city: activity.location,
        vendor_name: activity.host,
        rating: activity.rating,
        response_time_hours: 24,
        min_acceptable_offer: Number(activity.price.replace(/[^\d]/g, '')) || 0,
      },
      pricing_type: pricingType,
      status: 'draft',
    });
    if (bookingDraft.listing && String((bookingDraft.listing as { id?: string }).id) === listingId) {
      setBookingStartDate(bookingDraft.selected_date ?? '');
      if (bookingDraft.selected_slot) {
        setBookingSlot(`${bookingDraft.selected_slot.start_time}-${bookingDraft.selected_slot.end_time}`);
      }
    }
  }, [listingId, activity.title, activity.image, activity.location, activity.host, activity.rating, pricingType, setDraftPartial]);

  useEffect(() => {
    if (!shareFeedback) return;
    const id = window.setTimeout(() => setShareFeedback(''), 2000);
    return () => window.clearTimeout(id);
  }, [shareFeedback]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex((p) => (p + 1) % allGallery.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((p) => (p - 1 + allGallery.length) % allGallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, allGallery.length]);

  const reviewRows = [
    { stars: 5, pct: 68 },
    { stars: 4, pct: 24 },
    { stars: 3, pct: 6 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 0 },
  ];
  const [showReviewBars, setShowReviewBars] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowReviewBars(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'tc', label: 'T&C' },
    { id: 'payment', label: 'Payment' },
  ];

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader
          onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchPlaceholder="Search events..."
        />

        <MogzuCorporateScrollSurface>
          {isLoading && (
            <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-4">
                  <div className="h-[280px] rounded-xl corp-shimmer" />
                  <div className="h-6 w-[60%] rounded-full corp-shimmer" />
                  <div className="h-4 w-[90%] rounded-full corp-shimmer" />
                  <div className="h-4 w-[70%] rounded-full corp-shimmer" />
                </div>
                <div className="rounded-xl border border-[#ececec] p-5 bg-white space-y-3">
                  <div className="h-5 w-28 rounded-full corp-shimmer" />
                  <div className="h-10 w-full rounded-lg corp-shimmer" />
                  <div className="h-10 w-full rounded-lg corp-shimmer" />
                  <div className="h-10 w-full rounded-lg corp-shimmer" />
                </div>
              </div>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <div className="bg-white rounded-lg border border-[#ececec] p-6">
                <p className="text-sm text-[#475569] mb-4">{loadError}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={loadListing}
                    className="px-4 py-2 border border-[#ececec] text-[#0e1e3f] rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearDraft();
                      navigate('/event-activity');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Back to results
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !loadError && (
          <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-6 corp-page-enter">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Home
              </button>
              <span className="text-[#878e9e]">/</span>
              <button
                type="button"
                onClick={() => navigate('/event-activity')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Activities
              </button>
              <span className="text-[#878e9e]">/</span>
              <button type="button" className="text-[#2563eb] hover:underline shrink-0" onClick={() => navigate('/event-activity')}>
                Workshops & Trainings
              </button>
              <span className="text-[#878e9e]">/</span>
              <span className="text-[#878e9e] break-words min-w-0">{activity.title}</span>
            </div>

            {gridUiNotice ? (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {gridUiNotice}
              </p>
            ) : null}

            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2 md:col-span-1">
                <div className="w-full h-96 rounded-lg overflow-hidden relative">
                  <ImageWithFallback
                    src={mainImage || activity.image}
                    alt={activity.title}
                    className={`w-full h-full object-cover cursor-zoom-in transition-opacity duration-[250ms] ${imageTransitioning ? 'opacity-0' : 'opacity-100'}`}
                    onClick={() => {
                      setLightboxIndex(allGallery.findIndex((x) => x === (mainImage || activity.image)));
                      setLightboxOpen(true);
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full h-48 rounded-lg overflow-hidden relative"
                    onClick={() => {
                      const next = galleryImages[idx - 1] ?? activity.image;
                      setImageTransitioning(true);
                      window.setTimeout(() => {
                        setMainImage(next);
                        setImageTransitioning(false);
                      }, 130);
                    }}
                  >
                    <ImageWithFallback
                      src={galleryImages[idx - 1] ?? activity.image}
                      alt={`${activity.title} gallery ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              {/* Left Column - Details */}
              <div>
                <div className="bg-white rounded-lg mb-6 shadow-sm border border-[#ececec]">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-[#4379ee] text-white rounded-full text-xs font-semibold">
                            Event Space
                          </span>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-[#FFCC47] text-[#FFCC47]" />
                            <span className="font-semibold text-[#0e1e3f]">{activity.rating} (128)</span>
                          </div>
                        </div>
                        <h1 className="corp-h1 text-[#0e1e3f] mb-2">
                          {activity.title}
                        </h1>
                        <p className="corp-body text-[#878e9e] leading-[1.7]">{activity.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLiked((prev) => !prev);
                            toggleWishlistId(listingId);
                            setHeartAnim(liked ? 'out' : 'in')
                            window.setTimeout(() => setHeartAnim(null), 180)
                          }}
                          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            liked ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-gray-100 text-[#878e9e] hover:bg-gray-200'
                          } ${heartAnim === 'in' ? 'corp-heart-pop-in' : ''} ${heartAnim === 'out' ? 'corp-heart-pop-out' : ''}`}
                        >
                          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={handleShare}
                          aria-label="Copy page link"
                          className="w-10 h-10 rounded-full bg-gray-100 text-[#878e9e] hover:bg-gray-200 flex items-center justify-center transition-all"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                      {shareFeedback && (
                      <p className="text-xs text-[#475569] mt-2" role="status">
                          Copied! ✓
                      </p>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="border-t border-[#ececec]">
                    <div className="flex gap-6 px-6 overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={selectedTab === tab.id}
                          onClick={() => setSelectedTab(tab.id)}
                          className={`pb-3 pt-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            selectedTab === tab.id
                              ? 'text-[#2563eb]'
                              : 'text-[#878e9e] hover:text-[#475569]'
                          }`}
                        >
                          {tab.label}
                          {selectedTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563eb]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {selectedTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-[#ececec]">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Location</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{activity.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Users className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Capacity</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{activity.capacity}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Clock className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Host</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{activity.host}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-3">About this space</h2>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            Experience the best event space for your corporate needs. Located in {activity.location}, this venue is perfect for your team. Our professional staff will ensure your event runs smoothly.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'amenities' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Highlights</h2>
                          <div className="grid grid-cols-2 gap-3">
                            {eventBuyerDetail.amenities.map((highlight, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-[#0e1e3f]">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'portfolio' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Past Events</h2>
                        <div className="mb-4 space-y-2">
                          {reviewRows.map((row) => (
                            <div key={row.stars} className="grid grid-cols-[36px_1fr_40px] items-center gap-2 text-xs">
                              <span className="text-slate-600">{row.stars}★</span>
                              <div className="h-1.5 rounded bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded bg-[#2563eb] transition-all duration-[600ms] ease-out"
                                  style={{ width: showReviewBars ? `${row.pct}%` : '0%' }}
                                />
                              </div>
                              <span className="text-right text-slate-500">{row.pct}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-40 rounded-lg overflow-hidden relative group">
                              <ImageWithFallback
                                src={galleryImages[item - 1] ?? activity.image}
                                alt={`Portfolio ${item}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'tc' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Terms & Conditions</h2>
                          <div className="space-y-2">
                            {eventBuyerDetail.policies.map((line) => (
                              <div key={line} className="flex items-start gap-2">
                                <Shield className="w-5 h-5 text-[#fa8d40] flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-[#0e1e3f]">{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-6 border-t border-[#ececec]">
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Cancellation Policy</h2>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            Free cancellation up to 48 hours before the scheduled time. Cancellations made within 24-48 hours will incur a 50% fee. No-shows or cancellations within 24 hours are non-refundable.
                          </p>
                        </div>
                      </div>
                    )}



                    {selectedTab === 'payment' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Payment Options & Terms</h2>
                        {eventBuyerDetail.payment_terms.trim() ? (
                          <p className="text-sm text-[#475569] mb-4 whitespace-pre-wrap">{eventBuyerDetail.payment_terms}</p>
                        ) : null}
                        {formatBuyerPaymentSummary(eventBuyerDetail) ? (
                          <p className="text-xs text-[#878e9e] mb-4">{formatBuyerPaymentSummary(eventBuyerDetail)}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-3">
                          {eventBuyerDetail.payment_methods.map((m) => (
                            <div
                              key={m}
                              className="h-10 px-4 border border-gray-200 rounded bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-600"
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">More events</h2>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Explore other event spaces and activities for your team.
                  </p>
                <div className="relative mb-4">
                  <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="min-w-[220px] snap-start rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-800">Similar listing {n}</p>
                        <p className="mt-1 text-xs text-slate-500">Popular with enterprise teams</p>
                      </div>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#FFFDF9] to-transparent" />
                </div>
                  <button
                    type="button"
                    onClick={() => navigate('/event-activity')}
                    className="w-full py-2 px-4 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View all events
                  </button>
                </div>
              </div>

              {/* Right Column - Booking Card */}
              <div>
                <div className={`rounded-lg p-5 border border-[#ececec] sticky top-6 transition-all duration-[250ms] ${bookingSticky ? 'shadow-md bg-white/90 backdrop-blur-md' : 'bg-white shadow-sm'}`}>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-3">Booking Status</h3>
                    
                    <div className="flex flex-col gap-3">
                    <div id="booking-start-date-field" className={`flex flex-col gap-1.5 rounded-lg transition-all ${dateHintPulse ? 'ring-2 ring-[#2563eb]/30' : ''}`}>
                      <label className="text-xs font-medium text-[#0e1e3f]">Start Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={bookingStartDate}
                          onChange={(e) => {
                            setBookingStartDate(e.target.value);
                            setBookingDateError('');
                            setDraftPartial({ selected_date: e.target.value || null });
                          }}
                          className="w-full px-3 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#878e9e] pointer-events-none" />
                      </div>
                      {bookingDateError && (
                        <p className="text-[10px] text-red-600 font-medium">{bookingDateError}</p>
                      )}
                      {!bookingDateError && isBookingDateUnavailable && (
                        <p className="text-[10px] text-[#475569] font-medium">
                          This listing is unavailable on the selected date. Please choose another date.
                        </p>
                      )}
                      {dateHintText ? <p className="text-[13px] italic text-slate-500">{dateHintText}</p> : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-[#0e1e3f]">Time Slot</label>
                      {bookingStartDate ? (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: '10:00-13:00', label: '10:00 - 13:00', disabled: false },
                          { id: '14:00-17:00', label: '14:00 - 17:00', disabled: false },
                          { id: '18:00-21:00', label: '18:00 - 21:00', disabled: true },
                        ].map((slot) => {
                          const selected = bookingSlot === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={slot.disabled}
                              onClick={() => {
                                setBookingSlot(slot.id);
                                setBookingDateError('');
                                const [start_time, end_time] = slot.id.split('-');
                                setDraftPartial({
                                  selected_slot: { start_time: start_time ?? '', end_time: end_time ?? '', slots_available: slot.disabled ? 0 : 12 },
                                });
                              }}
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                slot.disabled
                                  ? 'border-slate-200 text-slate-400 line-through cursor-not-allowed'
                                  : selected
                                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                    : 'bg-transparent border-[#2563EB] text-[#2563EB] hover:bg-blue-50'
                              }`}
                            >
                              {selected ? <Check className="h-3 w-3" /> : null}
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">Select a date to see available slots.</p>
                      )}
                      {bookingStartDate && isBookingDateUnavailable ? (
                        <p className="text-[11px] text-slate-500">No availability on this date. Try selecting another date.</p>
                      ) : null}
                    </div>

                      <PriceBlock
                        listing={{
                          pricing_type: pricingType,
                          price_type: 'flat',
                          base_price: Number(activity.price.replace(/[^\d]/g, '')) || 15000,
                          starting_price: Number(activity.price.replace(/[^\d]/g, '')) || 15000,
                          offer_validity_hours: 48,
                          add_ons: [
                            { name: 'DJ Setup', price: 8000 },
                            { name: 'Photography', price: 12000 },
                            { name: 'Custom Decor', price: 15000 },
                          ],
                          group_size_min: 50,
                          group_size_max: 500,
                          duration_options: ['3 hours', '5 hours', 'Full day'],
                          selected_date: bookingStartDate,
                          selected_slot: bookingSlot,
                        }}
                        bookingContext={{
                          listingId,
                          listingName: activity.title,
                          image: activity.image,
                          city: activity.location.split(',')[0]?.trim() || activity.location,
                          vendor_name: activity.host,
                          rating: activity.rating,
                        }}
                        onProceedToBooking={(payload) => {
                          if (payload.pricing_type !== 'request_for_price' && !validateBookingStartDate()) return;
                          const now = new Date()
                          const refPrefix = payload.pricing_type === 'request_for_price' ? 'RFQ' : 'MGZ'
                          const generatedRef = `#${refPrefix}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
                          setDraftPartial({
                            pricing_type: payload.pricing_type,
                            selected_date: payload.selected_date ?? null,
                            selected_slot: payload.selected_slot
                              ? (() => {
                                  const [start_time, end_time] = payload.selected_slot.split('-')
                                  return { start_time: start_time ?? '', end_time: end_time ?? '', slots_available: 12 }
                                })()
                              : null,
                            group_size: payload.group_size,
                            duration: payload.duration,
                            selected_addons: payload.add_on_names.map((name) => ({ name, price: null, negotiable: payload.pricing_type !== 'transparent' })),
                            offer_amount: payload.offer?.offer_amount ?? null,
                            request_data: payload.request
                              ? { requirements: payload.request.requirements, preferred_date: payload.request.preferred_date }
                              : null,
                            calculated: {
                              base_subtotal: payload.base_total ?? null,
                              addons_total: payload.addon_total ?? null,
                              platform_fee: payload.platform_fee ?? null,
                              grand_total: payload.grand_total ?? null,
                            },
                            status: payload.pricing_type === 'request_for_price' ? 'submitted' : 'draft',
                            booking_reference: payload.pricing_type === 'request_for_price' ? generatedRef : null,
                            submitted_at: payload.pricing_type === 'request_for_price' ? now.toISOString() : null,
                          })
                          if (payload.pricing_type === 'request_for_price') {
                            navigate('/booking-confirmation')
                            return
                          }
                          navigate('/booking/new', { state: { booking: payload } });
                        }}
                        onOfferSubmit={(payload) => {
                          if (!validateBookingStartDate()) return false;
                          setPricingFeedback(`Offer submitted: Rs ${payload.offer_amount.toLocaleString('en-IN')} for ${payload.group_size} pax.`);
                          return true;
                        }}
                        onDraftChange={(patch) => {
                          setDraftPartial({
                            group_size: patch.group_size ?? bookingDraft.group_size,
                            duration: patch.duration ?? bookingDraft.duration,
                            selected_addons: patch.selected_addons ?? bookingDraft.selected_addons,
                            offer_amount: patch.offer_amount ?? bookingDraft.offer_amount,
                            request_data: patch.request_data ?? bookingDraft.request_data,
                            calculated: patch.calculated
                              ? {
                                  base_subtotal: patch.calculated.base_subtotal,
                                  addons_total: patch.calculated.addons_total,
                                  platform_fee: patch.calculated.platform_fee,
                                  grand_total: patch.calculated.grand_total,
                                }
                              : bookingDraft.calculated,
                          });
                        }}
                      />
                      {pricingFeedback && (
                        <p className="text-xs text-[#475569] mt-2">{pricingFeedback}</p>
                      )}

                      <div className="space-y-3">
                        <ResponseStatusBanner
                          status="awaiting"
                          eventId={activity.id}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#ececec] space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#0e1e3f]">
                      <Calendar className="w-4 h-4 text-[#4379ee]" />
                      <span>Flexible booking dates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0e1e3f]">
                      <Shield className="w-4 h-4 text-[#4379ee]" />
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0e1e3f]">
                      <Users className="w-4 h-4 text-[#4379ee]" />
                      <span>Group discounts available</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#ececec]">
                    <p className="text-xs text-[#878e9e] mb-3">Need help with booking?</p>
                    <button
                      type="button"
                      onClick={() => navigate('/communication', { state: { source: 'event-detail', eventId: activity.id, vendor: 'vendor', channel: 'pre-enquiry-message' } })}
                      className="w-full py-2.5 mb-2 border border-[#d0d6e2] text-[#0e1e3f] font-semibold rounded-lg hover:bg-[#f8fafc] transition-all"
                    >
                      Message Vendor
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/communication', { state: { source: 'event-detail', eventId: activity.id } })}
                      className="w-full py-2.5 border border-[#4379ee] text-[#4379ee] font-semibold rounded-lg hover:bg-[#eff6ff] transition-all"
                    >
                      Contact Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="w-full py-2.5 text-xs text-slate-500 hover:underline"
                    >
                      Report Listing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </MogzuCorporateScrollSurface>
      </div>
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          <button
            type="button"
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((p) => (p - 1 + allGallery.length) % allGallery.length);
            }}
          >
            ‹
          </button>
          <img
            src={allGallery[lightboxIndex] ?? activity.image}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((p) => (p + 1) % allGallery.length);
            }}
          >
            ›
          </button>
        </div>
      ) : null}
      {reportOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Report this listing</h3>
            <select className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option>Inaccurate information</option>
              <option>Inappropriate content</option>
              <option>Duplicate listing</option>
              <option>Pricing issue</option>
              <option>Other</option>
            </select>
            <textarea className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm" rows={3} value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} placeholder="Optional notes" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full px-4 py-2 text-sm text-slate-600" onClick={() => setReportOpen(false)}>Cancel</button>
              <button
                type="button"
                className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setReportOpen(false);
                  setGridUiNotice("Thank you. We'll review this within 48 hours.");
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
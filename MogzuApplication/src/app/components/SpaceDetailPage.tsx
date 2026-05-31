import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import { Calendar, ChevronDown, ChevronRight, MapPin, Share2, Star, Users, DoorOpen, Wifi, Armchair, Landmark, Projector, PresentationIcon, Coffee, GlassWater, Plug, X, ChevronLeft, Info, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { PricingBlock, PricingMode } from './ui/PricingBlock';
import { useAuth } from '@/lib/auth';
import { ListingReviewsPanel } from './global/ListingReviewsPanel';
import { WishlistHeart } from './global/WishlistHeart';
import { DevMockDataBanner } from './global/DevMockDataBanner';
import { isListingUuid, resolveSpacexListing } from '@/app/lib/activityListingResolver';
import { storageService } from '@/lib/storage';
import type { Listing, ListingImage } from '@/lib/database.types';

interface ResponseStatusBannerProps {
  status: 'awaiting' | 'best_offer' | 'accepted' | 'declined';
  comment?: string;
  spaceCategory?: string;
}

function ResponseStatusBanner({ status, comment, spaceCategory }: ResponseStatusBannerProps) {
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
  const displayComment =
    config.displayComment || comment || 'The vendor has not provided a comment yet.';

  return (
    <div className={`mt-4 rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col gap-3 transition-all duration-300`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {config.icon}
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>{config.title}</h4>
        </div>
        {config.subtext && (
          <p className="text-xs text-slate-500 ml-7">{config.subtext}</p>
        )}
      </div>
      <div className="bg-white/60 rounded-lg p-3 text-sm text-gray-700 border border-black/5">
        <span className="font-medium text-xs text-gray-500 uppercase tracking-wide block mb-1">Vendor Comment</span>
        <p className="text-xs leading-relaxed">{displayComment}</p>
      </div>
      {config.cta && (
        <button
          type="button"
          onClick={() => {
            if (status === 'best_offer') {
              navigate('/request-to-book', {
                state: {
                  from: 'space-detail',
                  category: spaceCategory ?? 'conference',
                  acceptedOffer: true,
                },
              });
              return;
            }
            if (status === 'declined') {
              navigate('/dspace/classic');
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
import svgPaths from '@/imports/svg-xho44kfymu';
import amenitySvgPaths from '@/imports/svg-5il4em561b';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { ListingBuyerDetailBlock } from '@/app/lib/mogzuDomain';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import imgImage24942 from 'figma:asset/a2d70e478b49b8a04eda4940674c1f35d2cd299c.png';
import imgImage24943 from 'figma:asset/1cb5a990c5a73e3fafbb9d205f74d50d7d0f6056.png';
import imgImage25019 from 'figma:asset/d6b1dbea45fb15d7573094d18fec6b35a898e849.png';
import imgImage25016 from 'figma:asset/e1b968e2d2b76deae093e435dc330376fb277042.png';
import imgImage25017 from 'figma:asset/f040f9835288462146cbf4f10cd1010f4e33caca.png';
import imgImage24941 from 'figma:asset/47ec72e60aebad8d4eca4378fed0778d1a644ebb.png';
import imgImage25018 from 'figma:asset/f1a5e802ee56c308d5184b492c7d6f9a36cd18d9.png';

export type SpaceListingNavSnapshot = {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: string;
  price: string;
  rating: string;
  image: string;
  tags?: string[];
};

function inferSpaceCategoryFromRouteId(id: string | undefined): 'conference' | 'casual' | 'corporate' | undefined {
  if (!id) return undefined;
  const decoded = decodeURIComponent(id).toLowerCase();
  if (decoded.startsWith('conf')) return 'conference';
  if (decoded.startsWith('corp')) return 'corporate';
  if (decoded.startsWith('casual') || /^cas\d/.test(decoded)) return 'casual';
  return undefined;
}

function listingGalleryUrls(l: Listing & { listing_images?: ListingImage[] }): string[] {
  return (l.listing_images ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => storageService.spaceImages.getUrl(img.storage_path))
    .filter((url) => Boolean(url));
}

function listingToSpaceSnapshot(l: Listing & { listing_images?: ListingImage[] }): SpaceListingNavSnapshot {
  const meta = (l.metadata ?? {}) as Record<string, unknown>;
  const imgs = listingGalleryUrls(l);
  const image = imgs[0] ?? '';
  const capacity =
    l.min_capacity != null && l.max_capacity != null
      ? `${l.min_capacity}-${l.max_capacity}`
      : l.max_capacity != null
        ? `Up to ${l.max_capacity}`
        : '—';
  const priceSuffix =
    l.price_unit === 'per_day' ? '/day' : l.price_unit === 'per_hour' ? '/hour' : '';
  const price =
    l.base_price != null
      ? `₹${l.base_price.toLocaleString('en-IN')}${priceSuffix}`
      : 'On request';
  const rating = typeof meta.rating === 'number' ? meta.rating.toFixed(1) : 'New';
  const rawTags = meta.tags;
  const tags = Array.isArray(rawTags) ? rawTags.filter((t): t is string => typeof t === 'string') : undefined;
  return {
    id: l.id,
    name: l.title,
    type: typeof meta.spaceType === 'string' ? meta.spaceType : 'Workspace',
    location: l.location_city ?? l.location_address ?? '',
    capacity,
    price,
    rating,
    image,
    tags,
  };
}

export default function SpaceDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const isVendorOrAdmin = profile?.role === 'vendor' || profile?.role === 'mogzu_admin';
  const { id: routeSpaceId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navState = location.state as { category?: string; space?: SpaceListingNavSnapshot } | undefined;
  const qCat = searchParams.get('category');
  const categoryFromQuery =
    qCat === 'conference' || qCat === 'casual' || qCat === 'corporate' ? qCat : undefined;
  const categoryFromState =
    navState?.category === 'conference' || navState?.category === 'casual' || navState?.category === 'corporate'
      ? navState.category
      : undefined;
  const category =
    categoryFromState ||
    categoryFromQuery ||
    inferSpaceCategoryFromRouteId(routeSpaceId) ||
    'conference';
  const [liveListing, setLiveListing] = useState<(Listing & { listing_images?: ListingImage[] }) | null>(null);
  const [usingDemoListing, setUsingDemoListing] = useState(false);
  const spaceListing = useMemo(() => {
    if (liveListing) return listingToSpaceSnapshot(liveListing);
    return navState?.space ?? null;
  }, [liveListing, navState?.space]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vendorPricingMode, setVendorPricingMode] = useState<PricingMode>('fixed');
  const [draftPricingMode, setDraftPricingMode] = useState<PricingMode>('negotiable');
  const [draftPaymentMode, setDraftPaymentMode] = useState<'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway'>('gateway');
  const [draftPaymentTerm, setDraftPaymentTerm] = useState<'advance_100' | 'partial_50' | 'net_30'>('advance_100');
  const [publishFeedback, setPublishFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingDateError, setBookingDateError] = useState('');
  const [isBookingDateUnavailable, setIsBookingDateUnavailable] = useState(false);
  const [bookingFromTime, setBookingFromTime] = useState('09:00');
  const [bookingToTime, setBookingToTime] = useState('17:00');
  const [fullDayBooking, setFullDayBooking] = useState(false);
  const [selectedBookingAddons, setSelectedBookingAddons] = useState<string[]>([]);
  const [requestPriceModalOpen, setRequestPriceModalOpen] = useState(false);
  const [requestPriceNotes, setRequestPriceNotes] = useState('');
  const [pricingSidebarNotice, setPricingSidebarNotice] = useState('');
  const loadListing = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === '1') {
      setLoadError('Unable to load listing details right now. Please retry.');
      setIsLoading(false);
      return;
    }
    if (!routeSpaceId) {
      setLiveListing(null);
      setUsingDemoListing(!navState?.space);
      setIsLoading(false);
      return;
    }
    try {
      const listing = await resolveSpacexListing(routeSpaceId);
      if (listing) {
        setLiveListing(listing);
        setUsingDemoListing(false);
      } else if (navState?.space) {
        setLiveListing(null);
        setUsingDemoListing(true);
      } else {
        setLiveListing(null);
        setUsingDemoListing(true);
      }
    } catch {
      setLoadError('Unable to load listing details right now. Please retry.');
    }
    setIsLoading(false);
  }, [routeSpaceId, navState?.space]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  useEffect(() => {
    if (!bookingStartDate) {
      setIsBookingDateUnavailable(false);
      return;
    }

    // Demo availability rule: mark some dates as unavailable deterministically.
    // Using midday time avoids timezone edge cases when parsing YYYY-MM-DD.
    const parsed = new Date(`${bookingStartDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      setIsBookingDateUnavailable(false);
      return;
    }

    const day = parsed.getDate();
    setIsBookingDateUnavailable(day % 7 === 0);
  }, [bookingStartDate]);

  useEffect(() => {
    setPricingSidebarNotice('');
  }, [vendorPricingMode]);

  // Thread the real Supabase listing's pricing_type into the booking sidebar.
  // Mock fallback keeps the 'fixed' default (transparent), never negotiable.
  useEffect(() => {
    if (!liveListing) return;
    const mode: PricingMode =
      liveListing.pricing_type === 'offer'
        ? 'negotiable'
        : liveListing.pricing_type === 'request_for_price'
          ? 'on_request'
          : 'fixed';
    setVendorPricingMode(mode);
    setDraftPricingMode(mode);
  }, [liveListing]);

  useEffect(() => {
    const raw = localStorage.getItem('vendorSpaceListingConfig');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        pricingMode?: PricingMode;
        paymentMode?: 'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway';
        paymentTerm?: 'advance_100' | 'partial_50' | 'net_30';
      };
      if (parsed.pricingMode) {
        setVendorPricingMode(parsed.pricingMode);
        setDraftPricingMode(parsed.pricingMode);
      }
      if (parsed.paymentMode) {
        setDraftPaymentMode(parsed.paymentMode);
      }
      if (parsed.paymentTerm) {
        setDraftPaymentTerm(parsed.paymentTerm);
      }
    } catch {
      // Ignore malformed localStorage payload and keep defaults.
    }
  }, []);

  const handlePublishListingConfig = () => {
    setVendorPricingMode(draftPricingMode);
    localStorage.setItem(
      'vendorSpaceListingConfig',
      JSON.stringify({
        pricingMode: draftPricingMode,
        paymentMode: draftPaymentMode,
        paymentTerm: draftPaymentTerm,
        publishedAt: new Date().toISOString(),
      })
    );
    setPublishFeedback('Published. Corporate users will now see updated pricing type and payment terms.');
  };

  // Category-specific content
  const getCategoryContent = () => {
    switch (category) {
      case 'conference':
        return {
          name: 'Professional Conference Center',
          type: 'Conference Rooms',
          description: 'Experience premium conference facilities at our Professional Conference Center in Bandra Kurla Complex. Our modern meeting spaces offer flexible room configurations including boardroom setup, U-shape, classroom, and theater style. Equipped with state-of-the-art AV equipment, high-speed WiFi, and professional amenities to ensure your meetings and presentations run flawlessly.',
          capacity: '4-30 people',
          basePrice: '₹3,500',
          priceUnit: '/hour',
          amenities: [
            { icon: 'projector', label: 'Projector & Screen' },
            { icon: 'whiteboard', label: 'Whiteboard' },
            { icon: 'wifi', label: 'High-Speed WiFi' },
            { icon: 'chairs', label: 'Executive Seating' },
            { icon: 'ac', label: 'Climate Control' },
            { icon: 'coffee', label: 'Tea & Coffee' },
            { icon: 'water', label: 'Purified Water' },
            { icon: 'access', label: 'Secure Access' },
          ],
          included: [
            { icon: Wifi, label: 'High-speed WiFi' },
            { icon: Projector, label: 'Projector & Screen' },
            { icon: Coffee, label: 'Tea & Coffee' },
            { icon: GlassWater, label: 'Drinking Water' },
            { icon: Armchair, label: 'Executive Chairs' },
            { icon: Plug, label: 'Power Outlets' },
          ],
          host: {
            name: 'Priya Sharma',
            role: 'Conference Manager',
            description: 'Welcome to our Professional Conference Center! With over 8 years of experience in corporate event management, I ensure every meeting runs smoothly. Our state-of-the-art facilities and professional support team are dedicated to making your conference experience seamless and productive.',
          },
          policies: [
            'Professional attire required for all attendees',
            'No outside catering without prior approval',
            'Equipment must be handled by authorized personnel only',
            'Conference rooms must be vacated 15 minutes before booking end time',
            'Maximum capacity limits must be strictly observed',
            'Recording and photography require prior consent',
          ],
          paymentTerms: [
            'Pay ₹1,000 advance to confirm your conference room booking',
            'Balance payment due 48 hours before the scheduled meeting',
            'Hourly bookings can be extended subject to availability',
            'Corporate invoicing available with NET 30 payment terms',
            'All major payment methods accepted including corporate cards',
          ],
          cancellationPolicy: 'Full refund for cancellations made 48 hours before booking. 50% refund for cancellations within 24-48 hours.',
          reviewMetrics: [
            { label: 'Overall', rating: 5.0, icon: 'users' },
            { label: 'Audio/Visual', rating: 4.8, icon: 'projector' },
            { label: 'Room Setup', rating: 4.7, icon: 'layout' },
            { label: 'Staff Support', rating: 4.9, icon: 'support' },
            { label: 'Value', rating: 4.5, icon: 'value' },
          ],
        };
      case 'casual':
        return {
          name: 'Creative Lounge Space',
          type: 'Casual Meeting Spaces',
          description: 'Welcome to our Creative Lounge Space in the heart of BKC. Perfect for informal meetings, brainstorming sessions, and creative collaborations. Our relaxed café-style environment features comfortable lounge seating, flexible spaces, and a creative atmosphere designed to inspire innovation and foster meaningful connections.',
          capacity: '2-15 people',
          basePrice: '₹1,800',
          priceUnit: '/hour',
          amenities: [
            { icon: 'lounge', label: 'Lounge Seating' },
            { icon: 'cafe', label: 'Café Tables' },
            { icon: 'wifi', label: 'High-Speed WiFi' },
            { icon: 'speaker', label: 'Bluetooth Audio' },
            { icon: 'coffee', label: 'Coffee Bar' },
            { icon: 'water', label: 'Refreshments' },
            { icon: 'whiteboard', label: 'Creative Boards' },
            { icon: 'natural', label: 'Natural Light' },
          ],
          included: [
            { icon: Wifi, label: 'High-speed WiFi' },
            { icon: Armchair, label: 'Lounge Seating' },
            { icon: Coffee, label: 'Coffee & Snacks' },
            { icon: GlassWater, label: 'Refreshments' },
            { icon: PresentationIcon, label: 'Creative Boards' },
            { icon: Plug, label: 'Power Outlets' },
          ],
          host: {
            name: 'Arjun Mehta',
            role: 'Community Lead',
            description: 'Hey there! Welcome to our Creative Lounge. I\'m passionate about building vibrant creative communities and fostering collaboration. Our casual space is perfect for brainstorming, informal meetings, and networking. Feel free to make yourself at home!',
          },
          policies: [
            'Casual and smart casual attire welcome',
            'Outside food and beverages allowed',
            'Keep noise levels considerate of other users',
            'Flexible booking extensions available',
            'Photography and content creation welcome',
            'Networking and collaboration encouraged',
          ],
          paymentTerms: [
            'Pay ₹500 advance to secure your casual space booking',
            'Remaining balance can be paid on arrival',
            'Flexible hourly rates with discounts for longer bookings',
            'Walk-in bookings subject to availability',
            'All payment methods accepted including UPI and cards',
          ],
          cancellationPolicy: 'Free cancellation up to 6 hours before booking. No refund for cancellations within 6 hours.',
          reviewMetrics: [
            { label: 'Overall', rating: 5.0, icon: 'users' },
            { label: 'Ambiance', rating: 4.9, icon: 'ambiance' },
            { label: 'Comfort', rating: 4.8, icon: 'comfort' },
            { label: 'Service', rating: 4.7, icon: 'service' },
            { label: 'Value', rating: 4.6, icon: 'value' },
          ],
        };
      case 'corporate':
        return {
          name: 'Grand Event Venue',
          type: 'Corporate Event Spaces',
          description: 'Host unforgettable corporate events at our Grand Event Venue in Bandra Kurla Complex. Our versatile event spaces accommodate 20-100 attendees with flexible configurations for banquets, town halls, product launches, and corporate celebrations. Premium AV equipment, professional sound systems, and dedicated event support ensure your event exceeds expectations.',
          capacity: '20-100 people',
          basePrice: '₹25,000',
          priceUnit: '/day',
          amenities: [
            { icon: 'stage', label: 'Event Stage' },
            { icon: 'sound', label: 'Sound System' },
            { icon: 'projector', label: 'LED Display' },
            { icon: 'banquet', label: 'Banquet Seating' },
            { icon: 'catering', label: 'Catering Kitchen' },
            { icon: 'wifi', label: 'High-Speed WiFi' },
            { icon: 'parking', label: 'Parking Space' },
            { icon: 'support', label: 'Event Support' },
          ],
          included: [
            { icon: Wifi, label: 'High-speed WiFi' },
            { icon: Projector, label: 'LED Display' },
            { icon: Coffee, label: 'Refreshments' },
            { icon: GlassWater, label: 'Beverages' },
            { icon: Armchair, label: 'Banquet Seating' },
            { icon: Plug, label: 'Full AV Setup' },
          ],
          host: {
            name: 'Vikram Patel',
            role: 'Event Director',
            description: 'Welcome to our Grand Event Venue! With 12+ years managing corporate events for Fortune 500 companies, I lead our experienced team in delivering world-class events. From product launches to annual conferences, we handle every detail with precision and professionalism.',
          },
          policies: [
            'Formal corporate event protocol applies',
            'Dedicated event manager assigned to each booking',
            'Professional catering services required for large events',
            'Sound checks and rehearsals can be scheduled in advance',
            'Full venue access available day before for setup',
            'Security and parking arrangements included',
          ],
          paymentTerms: [
            'Pay ₹5,000 advance to confirm your event venue booking',
            '50% payment due 2 weeks before the event date',
            'Final balance due 3 days before the event',
            'Corporate billing and invoicing available',
            'Customized payment plans for recurring corporate events',
          ],
          cancellationPolicy: 'Cancellations 30+ days before: 90% refund. 15-30 days: 50% refund. Less than 15 days: No refund.',
          reviewMetrics: [
            { label: 'Overall', rating: 5.0, icon: 'users' },
            { label: 'Event Coordination', rating: 4.9, icon: 'coordination' },
            { label: 'Venue Setup', rating: 4.8, icon: 'venue' },
            { label: 'Tech Support', rating: 4.7, icon: 'tech' },
            { label: 'Value', rating: 4.6, icon: 'value' },
          ],
        };
      default: // coworking
        return {
          name: 'WorkHub BKC',
          type: 'Coworking Space',
          description: 'Experience premium coworking at WorkHub BKC in Bandra Kurla Complex, Mumbai\'s premier business district. Our modern workspace offers flexible seating options including hot desks, dedicated desks, and private offices. Enjoy high-speed internet, contemporary design, and a vibrant community of professionals in a productive environment.',
          capacity: '5-50 seats',
          basePrice: '₹15,000',
          priceUnit: '/month',
          amenities: [
            { icon: 'wifi', label: 'High-Speed WiFi' },
            { icon: 'chairs', label: 'Ergonomic Seating' },
            { icon: 'desk', label: 'Private Desks' },
            { icon: 'meeting', label: 'Meeting Rooms' },
            { icon: 'printing', label: 'Printing & Scanning' },
            { icon: 'coffee', label: 'Pantry & Beverages' },
            { icon: 'water', label: 'Purified Water' },
            { icon: 'access', label: '24/7 Access' },
          ],
          included: [
            { icon: Wifi, label: 'High-speed WiFi' },
            { icon: DoorOpen, label: '24/7 Access' },
            { icon: PresentationIcon, label: 'Meeting Room Credits' },
            { icon: Coffee, label: 'Unlimited Tea & Coffee' },
            { icon: Armchair, label: 'Ergonomic Furniture' },
            { icon: Plug, label: 'Printing & Scanning' },
          ],
          host: {
            name: 'Rajesh Kumar',
            role: 'Community Manager at WorkHub BKC',
            description: 'Welcome to WorkHub BKC! We\'re dedicated to creating a vibrant coworking community in Mumbai\'s premier business district. Our space offers flexible workspace solutions with premium amenities, networking opportunities, and 24/7 access to support your team\'s productivity.',
          },
          policies: [
            'Professional workspace etiquette expected',
            'Desk bookings can be modified with 24-hour notice',
            'Meeting room credits included with membership',
            'Quiet zones must be respected during business hours',
            'Guest passes available for members',
            'Community events and networking sessions included',
          ],
          paymentTerms: [
            'Pay ₹1,000 advance to secure your coworking membership',
            'Monthly membership fees due on the 1st of each month',
            'Flexible payment plans available for longer commitments',
            'Corporate memberships available for teams of 5+',
            'All major payment methods and online transfers accepted',
          ],
          cancellationPolicy: 'Monthly memberships require 30 days notice. Pro-rated refunds available for advance payments.',
          reviewMetrics: [
            { label: 'Overall', rating: 5.0, icon: 'users' },
            { label: 'Amenities', rating: 4.8, icon: 'amenities' },
            { label: 'Community', rating: 4.9, icon: 'community' },
            { label: 'Location', rating: 4.7, icon: 'location' },
            { label: 'Value', rating: 4.6, icon: 'value' },
          ],
        };
    }
  };

  const content = getCategoryContent();
  const parseInr = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0;
  const hourlyRate = useMemo(() => {
    if (liveListing?.base_price != null) {
      if (liveListing.price_unit === 'per_day') {
        return Math.max(1, Math.round(liveListing.base_price / 8));
      }
      return Math.max(1, Math.round(liveListing.base_price));
    }
    return Math.max(1, Math.round(parseInr(content.basePrice)));
  }, [liveListing, content.basePrice]);
  const dayRate = Math.round(hourlyRate * 8);
  const bookingAddons = [
    { id: 'av', label: 'AV Setup', amount: 2500 },
    { id: 'refreshments', label: 'Refreshments', amount: 1800 },
    { id: 'extra_support', label: 'On-site support', amount: 2200 },
  ];
  const addOnTotal = selectedBookingAddons.reduce((sum, id) => {
    const found = bookingAddons.find((item) => item.id === id);
    return sum + (found?.amount ?? 0);
  }, 0);
  const minutesFrom = (() => {
    const [h, m] = bookingFromTime.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  })();
  const minutesTo = (() => {
    const [h, m] = bookingToTime.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  })();
  const durationHours = fullDayBooking ? 8 : Math.max(0, (minutesTo - minutesFrom) / 60);
  const bookingBaseTotal = fullDayBooking ? dayRate : Math.round(durationHours * hourlyRate);
  const bookingGrandTotal = bookingBaseTotal + addOnTotal;

  const displayName = spaceListing?.name ?? content.name;
  const displayLocation = spaceListing?.location ?? 'Bandra Kurla Complex, Mumbai';
  const displayCapacity = spaceListing?.capacity ?? content.capacity;
  const displayType = spaceListing?.type ?? content.type;
  const displayRating = spaceListing?.rating ?? '4.8';
  const displayDescription = liveListing?.description ?? content.description;
  const listingPriceLine = spaceListing?.price;
  const bookingListingId =
    liveListing?.id ??
    (routeSpaceId && isListingUuid(routeSpaceId) ? routeSpaceId : navState?.space?.id);
  const canBookLive = Boolean(bookingListingId && isListingUuid(bookingListingId));
  const wishlistListingId = bookingListingId ?? routeSpaceId ?? 'space-1';

  /** Maps mock space tabs to the same buyer-detail shape used by Mogzu Direct / partner listings (Wave 4 alignment). */
  const listingBuyerDetailShape: ListingBuyerDetailBlock = useMemo(
    () => ({
      amenities: content.included.map((i) => i.label),
      portfolio_links: [],
      portfolio_captions: [],
      policies: [...content.policies],
      payment_methods: ['UPI', 'Card', 'Net banking', 'Corporate invoice'],
      payment_terms: content.paymentTerms.slice(0, 2).join(' · '),
    }),
    [category],
  );

  const fallbackGalleryImages = [
    "https://images.unsplash.com/photo-1504297050568-910d24c426d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZSUyMGludGVyaW9yfGVufDF8fHx8MTc3MDQ4MzkwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1623679799651-ad774745c6fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3MDU1MTI1MHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1639485529326-a12df10446c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBtZWV0aW5nJTIwcm9vbXxlbnwxfHx8fDE3NzA0NzU3MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1560204717-850e441065fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBsb3VuZ2UlMjBhcmVhfGVufDF8fHx8MTc3MDU1MTI1MXww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ];
  const liveGalleryUrls = liveListing ? listingGalleryUrls(liveListing) : [];
  const galleryImages =
    liveGalleryUrls.length > 0
      ? liveGalleryUrls.length >= 5
        ? liveGalleryUrls.slice(0, 5)
        : [...liveGalleryUrls, ...fallbackGalleryImages].slice(0, 5)
      : spaceListing?.image
        ? [spaceListing.image, ...fallbackGalleryImages.slice(1)]
        : fallbackGalleryImages;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'policies', label: 'T&C / Policies' },
    { id: 'payment', label: 'Payment' },
  ];

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

  useEffect(() => {
    if (!shareFeedback) return;
    const id = window.setTimeout(() => setShareFeedback(''), 5000);
    return () => window.clearTimeout(id);
  }, [shareFeedback]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="spacex"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {isLoading && (
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
              <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
                <p className="text-sm text-[#878e9e]">Loading listing details...</p>
              </div>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
              <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
                <p className="text-sm text-[#475569] mb-4">{loadError}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={loadListing}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#0e1e3f] rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dspace/classic')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Back to results
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !loadError && (
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Activity Suite
              </button>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <button
                type="button"
                onClick={() => navigate('/dspace/classic')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                D Space
              </button>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <span className="text-[#878e9e] break-words min-w-0">{displayType}</span>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <span className="text-[#878e9e] break-words min-w-0">{displayName}</span>
            </div>

            {usingDemoListing && !isLoading && !loadError && <DevMockDataBanner />}

            {/* Title and Actions Row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0e1e3f] mb-1">{displayName}</h1>
                <div className="flex items-center gap-2 text-sm text-[#878e9e]">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#FFCC47] text-[#FFCC47]" />
                    {displayRating} (234)
                  </span>
                  <span>•</span>
                  <span>{displayLocation}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <WishlistHeart listingId={wishlistListingId} variant="inline" />
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Copy page link"
                  className="p-2 border border-[#e5e7eb] rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="w-5 h-5 text-[#878e9e]" />
                </button>
              </div>
            </div>
            {shareFeedback && (
              <p className="text-xs text-[#475569] mb-3" role="status">
                {shareFeedback}
              </p>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              {/* Left Column */}
              <div>
                {/* Image Gallery */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-2 md:h-56">
                    {/* Large Main Image */}
                    <div className="relative rounded-lg overflow-hidden cursor-pointer h-48 md:h-full min-h-0">
                      <ImageWithFallback 
                        src={galleryImages[0]} 
                        alt={`${displayName} main`} 
                        className="w-full h-full object-cover"
                        onClick={() => openLightbox(0)}
                      />
                    </div>
                    
                    {/* Smaller Gallery Images */}
                    <div className="grid grid-cols-2 gap-2 md:h-full min-h-0">
                      <div className="relative rounded-lg overflow-hidden cursor-pointer">
                        <ImageWithFallback src={galleryImages[1]} alt={`${displayName} gallery 1`} className="w-full h-full object-cover" onClick={() => openLightbox(1)} />
                      </div>
                      <div className="relative rounded-lg overflow-hidden cursor-pointer">
                        <ImageWithFallback src={galleryImages[2]} alt={`${displayName} gallery 2`} className="w-full h-full object-cover" onClick={() => openLightbox(2)} />
                      </div>
                      <div className="relative rounded-lg overflow-hidden cursor-pointer">
                        <ImageWithFallback src={galleryImages[3]} alt={`${displayName} gallery 3`} className="w-full h-full object-cover" onClick={() => openLightbox(3)} />
                      </div>
                      <div className="relative rounded-lg overflow-hidden cursor-pointer">
                        <ImageWithFallback src={galleryImages[4]} alt={`${displayName} gallery 4`} className="w-full h-full object-cover" onClick={() => openLightbox(4)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg mb-4">
                  <div className="border-b border-[#e5e7eb]">
                    <div className="flex gap-6 px-6">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={selectedTab === tab.id}
                          onClick={() => setSelectedTab(tab.id)}
                          className={`pb-2.5 pt-3 text-sm font-medium transition-colors relative ${
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

                  {/* Tab Content */}
                  <div className="p-5">
                    {selectedTab === 'overview' && (
                      <>
                        {/* Description */}
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-2.5">{displayName}</h2>
                        <p className="text-sm text-[#475569] leading-relaxed mb-3">
                          {displayDescription}
                        </p>

                        {/* Location and Details */}
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5 text-[#475569]">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{displayLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#475569]">
                            <DoorOpen className="w-4 h-4" />
                            <span className="text-sm">{displayType}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#475569]">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{displayCapacity}</span>
                          </div>
                        </div>

                        {/* View on map */}
                        <button
                          type="button"
                          onClick={() => window.open('https://maps.google.com/?q=Bandra+Kurla+Complex,+Mumbai', '_blank')}
                          className="flex items-center gap-1.5 text-[#2563eb] text-sm font-medium hover:underline mb-6"
                        >
                          <MapPin className="w-4 h-4" />
                          View on map
                        </button>

                        {/* Pricing */}
                        <div className="mb-5">
                          <p className="text-sm text-[#878e9e] mb-1">Starting at</p>
                          <p className="text-xl font-semibold text-[#0e1e3f]">
                            {listingPriceLine ?? `${content.basePrice}${content.priceUnit}`}
                          </p>
                        </div>

                        <div className="mb-5 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setSelectedTab('reviews')}
                            className="text-sm text-blue-600 font-medium hover:underline"
                          >
                            See full ratings breakdown
                          </button>
                        </div>
                      </>
                    )}

                    {selectedTab === 'amenities' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-5">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                          {content.amenities.map((amenity, index) => {
                            // Map amenity icons to SVG paths
                            const getAmenitySvg = (icon: string) => {
                              switch(icon) {
                                case 'wifi':
                                case 'projector':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 48 48"><path d={amenitySvgPaths.p3463a900} fill="#FA8D40" /></svg>;
                                case 'chairs':
                                case 'lounge':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 48 48"><path d={amenitySvgPaths.pae45b00} fill="#FA8D40" /></svg>;
                                case 'desk':
                                case 'cafe':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 49 49"><path d={amenitySvgPaths.p34538c0} fill="#FA8D40" /></svg>;
                                case 'meeting':
                                case 'whiteboard':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 49 49"><path d={amenitySvgPaths.p33e8d100} fill="#FA8D40" /></svg>;
                                case 'printing':
                                case 'stage':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 48 48"><path d={amenitySvgPaths.p31261ab0} fill="#FA8D40" /></svg>;
                                case 'coffee':
                                case 'sound':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 49 49"><path d={amenitySvgPaths.p2e4ebcc0} fill="#FA8D40" /></svg>;
                                case 'water':
                                case 'banquet':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 32 32">
                                    <path d={amenitySvgPaths.p11ca82c0} stroke="#FA8D40" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d={amenitySvgPaths.p1f657d00} fill="#FA8D40" />
                                    <path d={amenitySvgPaths.p2714a900} stroke="#FA8D40" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>;
                                case 'access':
                                case 'ac':
                                case 'speaker':
                                case 'catering':
                                case 'parking':
                                case 'support':
                                case 'natural':
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 48 48"><path d={amenitySvgPaths.p27d2b380} fill="#FA8D40" /></svg>;
                                default:
                                  return <svg className="w-full h-full" fill="none" viewBox="0 0 48 48"><path d={amenitySvgPaths.p3463a900} fill="#FA8D40" /></svg>;
                              }
                            };
                            
                            return (
                              <div key={index} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12">
                                  {getAmenitySvg(amenity.icon)}
                                </div>
                                <p className="text-sm text-[#475569] text-center">{amenity.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'reviews' && routeSpaceId && (
                      <ListingReviewsPanel
                        listingId={routeSpaceId}
                        className="bg-transparent border-0 shadow-none p-0"
                      />
                    )}

                    {selectedTab === 'portfolio' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-5">Meet the host</h2>
                        
                        <div className="flex items-start gap-12">
                          {/* Host Avatar and Info - Left Side */}
                          <div className="flex items-start gap-4 flex-1">
                            <ImageWithFallback 
                              src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3MDUxNzg1NXww&ixlib=rb-4.1.0&q=80&w=1080"
                              alt={content.host.name}
                              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-[#0e1e3f] mb-1">{content.host.name}</h3>
                              <p className="text-sm text-[#878e9e] mb-3">{content.host.role}</p>
                              <p className="text-sm text-[#475569] leading-relaxed mb-5">
                                {content.host.description}
                              </p>
                              <p className="text-sm">
                                <span className="text-[#878e9e]">Contact:</span>{' '}
                                <span className="text-[#0e1e3f]">+91 98765 43210</span>
                              </p>
                            </div>
                          </div>

                          {/* Stats Section - Right Side */}
                          <div className="flex flex-col gap-5 w-[120px] flex-shrink-0">
                            {/* Reviews */}
                            <div>
                              <p className="text-xl font-semibold text-[#0e1e3f] leading-7 mb-1">234</p>
                              <p className="text-sm text-[#475569]">Reviews</p>
                            </div>
                            
                            {/* Rating */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xl font-semibold text-[#0e1e3f] leading-7">4.8</p>
                                <Star className="w-5 h-5 fill-[#FFCC47] text-[#FFCC47]" />
                              </div>
                              <p className="text-sm text-[#475569]">Rating</p>
                            </div>
                            
                            {/* Months Hosting */}
                            <div>
                              <p className="text-xl font-semibold text-[#0e1e3f] leading-7 mb-1">36</p>
                              <p className="text-sm text-[#475569]">Months Operating</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'policies' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-3">Privacy Policy</h2>
                        <p className="text-sm text-[#475569] leading-relaxed mb-5">
                          This Privacy Policy governs the manner in which this website collects, uses, maintains and 
                          discloses information collected from users of this Site.
                        </p>

                        <h3 className="text-base font-semibold text-[#0e1e3f] mb-3">General Policy</h3>
                        <ul className="space-y-2 mb-6">
                          {content.policies.map((policy, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-[#475569]">
                              <span className="text-[#878e9e] mt-1">•</span>
                              <span>{policy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}



                    {selectedTab === 'payment' && (
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <h2 className="text-lg font-semibold text-[#0e1e3f]">Payment</h2>
                          <span className="inline-flex items-center justify-center h-8 px-3 bg-amber-50 border border-amber-300 rounded-full text-sm font-normal text-slate-900">
                            Book now pay later
                          </span>
                        </div>

                        {/* Payment Terms */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Terms</h3>
                          <ul className="space-y-3">
                            {content.paymentTerms.map((term, index) => (
                              <li key={index} className="flex items-start gap-2 text-base text-slate-600 leading-relaxed">
                                <span className="text-slate-500 mt-1">•</span>
                                <span>{term}</span>
                              </li>
                            ))}
                          </ul>
                          {formatBuyerPaymentSummary(listingBuyerDetailShape) ? (
                            <p className="text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
                              <span className="font-medium text-slate-800">Buyer-facing summary: </span>
                              {formatBuyerPaymentSummary(listingBuyerDetailShape)}
                            </p>
                          ) : null}
                        </div>

                        {/* Available Payment Methods */}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-6">Available payment methods</h3>
                          
                          {/* Card Payment */}
                          <div className="mb-6">
                            <h4 className="text-base font-semibold text-slate-600 mb-4">Card payment</h4>
                            <div className="flex items-center gap-4">
                              <img src={imgImage24942} alt="Visa" className="h-[31px] w-auto" />
                              <img src={imgImage24943} alt="Mastercard" className="h-[31px] w-auto" />
                              <img src={imgImage25019} alt="PayPal" className="h-[31px] w-auto" />
                              <img src={imgImage25016} alt="RuPay" className="h-[31px] w-auto" />
                            </div>
                          </div>

                          {/* UPI Payment */}
                          <div className="mb-6">
                            <h4 className="text-base font-semibold text-slate-600 mb-4">UPI Payment</h4>
                            <div className="flex items-center gap-4">
                              <img src={imgImage25017} alt="Google Pay" className="h-[38px] w-auto" />
                              <img src={imgImage24941} alt="PhonePe" className="h-[38px] w-auto" />
                              <img src={imgImage25018} alt="Paytm" className="h-[31px] w-auto" />
                            </div>
                          </div>

                          {/* Cancellation Policy */}
                          <p className="text-base text-slate-600 leading-relaxed">
                            <span className="text-slate-500">Cancellation policy: </span>
                            {content.cancellationPolicy}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">More spaces</h2>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Browse other venues and workspace listings.
                  </p>
                  <div className="relative mb-4">
                    <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() =>
                            navigate(`/dspace/spaces/${encodeURIComponent(`${category}-${n}`)}`, {
                              state: { category },
                            })
                          }
                          className="min-w-[220px] snap-start rounded-lg border border-slate-200 bg-white p-3 text-left"
                        >
                          <p className="text-sm font-semibold text-slate-800">Related {displayType} {n}</p>
                          <p className="mt-1 text-xs text-slate-500">Similar capacity and amenities</p>
                        </button>
                      ))}
                    </div>
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#FFFDF9] to-transparent" />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dspace/classic')}
                    className="w-full py-2 px-4 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View all spaces
                  </button>
                </div>
              </div>

              {/* Right Sidebar - Booking Card */}
              <div>
                <div className="bg-white rounded-lg p-4 sticky top-6">
                  {/* Vendor-only pricing controls — hidden for corporate employees */}
                  {isVendorOrAdmin && (
                  <div className="mb-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <p className="text-[11px] font-semibold text-slate-700 mb-2">Vendor Pricing Publish Controls</p>
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setDraftPricingMode('fixed')}
                        className={`px-3 py-2 rounded-md text-xs font-semibold border transition-colors ${
                          draftPricingMode === 'fixed'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Book Now (Transparent Price)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftPricingMode('negotiable')}
                        className={`px-3 py-2 rounded-md text-xs font-semibold border transition-colors ${
                          draftPricingMode === 'negotiable'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Offer Price (Open Negotiation)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftPricingMode('on_request')}
                        className={`px-3 py-2 rounded-md text-xs font-semibold border transition-colors ${
                          draftPricingMode === 'on_request'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        On Request
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={draftPaymentMode}
                        onChange={(e) => setDraftPaymentMode(e.target.value as 'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway')}
                        className="px-2 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="gateway">Razorpay Gateway</option>
                        <option value="wallet">Corporate Credit</option>
                        <option value="net_banking">Net Banking</option>
                        <option value="neft_rtgs">NEFT / RTGS</option>
                      </select>
                      <select
                        value={draftPaymentTerm}
                        onChange={(e) => setDraftPaymentTerm(e.target.value as 'advance_100' | 'partial_50' | 'net_30')}
                        className="px-2 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="advance_100">100% Advance</option>
                        <option value="partial_50">50% Advance + Balance</option>
                        <option value="net_30">Net 30</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handlePublishListingConfig}
                      className="w-full px-3 py-2 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Publish to Corporate Portal
                    </button>
                    {publishFeedback && <p className="mt-2 text-[10px] text-slate-600">{publishFeedback}</p>}
                  </div>
                  )}

                  {/* Variant B: On Request Pricing */}
                  {vendorPricingMode === 'on_request' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-3xl font-bold text-slate-300">— — —</span>
                        </div>
                        <p className="text-sm text-slate-500">Pricing available on request</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={!bookingStartDate || isBookingDateUnavailable}
                          onClick={() => {
                            if (!bookingStartDate) {
                              setBookingDateError('Please select a start date.');
                              return;
                            }
                            if (isBookingDateUnavailable) {
                              setBookingDateError('Please select a different date. This date is unavailable.');
                              return;
                            }
                            setRequestPriceModalOpen(true);
                          }}
                          className="w-full bg-white border border-blue-600 text-blue-600 py-3 rounded-lg font-medium text-sm transition-all shadow-sm hover:bg-blue-50 disabled:opacity-60 disabled:hover:bg-white"
                        >
                          Request price
                        </button>
                        {pricingSidebarNotice && vendorPricingMode === 'on_request' && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-2 mt-2" role="status">
                            {pricingSidebarNotice}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Variant A & C: Transparent Pricing (Negotiable or Fixed) */}
                  {(vendorPricingMode === 'fixed' || vendorPricingMode === 'negotiable') && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                      
                      {/* Clear Pricing Header */}
                      <div>
                        {listingPriceLine ? (
                          <>
                            <p className="text-2xl font-bold text-slate-900">{listingPriceLine}</p>
                            <p className="text-xs text-slate-500 mt-0.5">+ applicable taxes</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-bold text-slate-900">{content.basePrice}</span>
                              <span className="text-sm text-slate-500 font-medium">{content.priceUnit}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">+ applicable taxes</p>
                          </>
                        )}
                      </div>

                      {/* Variant A: Offer Price Input (Only for Negotiable) */}
                      {vendorPricingMode === 'negotiable' && (
                        <div className="flex flex-col gap-2 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">%</div>
                            <label className="text-sm font-semibold text-blue-900">Offer Price</label>
                          </div>
                          <p className="text-xs text-blue-700 leading-snug">The vendor is open to negotiation. Submit a reasonable bid for your booking.</p>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
                            <input
                              type="number"
                              placeholder="Enter your bid amount"
                              className="w-full pl-7 pr-3 py-2.5 border border-blue-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Standard Booking Details */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-slate-700">Start Date</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={bookingStartDate}
                              onChange={(e) => {
                                setBookingStartDate(e.target.value);
                                setBookingDateError('');
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                          {bookingDateError && (
                            <p className="text-[10px] text-red-600 font-medium">{bookingDateError}</p>
                          )}
                          {!bookingDateError && isBookingDateUnavailable && (
                            <p className="text-[10px] text-[#475569] font-medium">
                              This listing is unavailable on the selected date. Please choose another date.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-slate-700">Duration</label>
                          <div className="relative">
                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                              <option>1 Month</option>
                              <option>3 Months</option>
                              <option>6 Months</option>
                              <option>12 Months</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-slate-700">Full Day</label>
                            <button
                              type="button"
                              onClick={() => setFullDayBooking((prev) => !prev)}
                              className={`h-6 w-12 rounded-full transition-colors ${fullDayBooking ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-white transition-transform ${fullDayBooking ? 'translate-x-6' : 'translate-x-0.5'}`}
                              />
                            </button>
                          </div>
                          {!fullDayBooking ? (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500">From</label>
                                <input
                                  type="time"
                                  value={bookingFromTime}
                                  onChange={(e) => setBookingFromTime(e.target.value)}
                                  className="mt-1 w-full px-2 py-2 border border-slate-200 rounded-md text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">To</label>
                                <input
                                  type="time"
                                  value={bookingToTime}
                                  onChange={(e) => setBookingToTime(e.target.value)}
                                  className="mt-1 w-full px-2 py-2 border border-slate-200 rounded-md text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600">Using full-day rate</p>
                          )}
                          <p className="mt-2 text-[11px] text-slate-500">Live duration: {durationHours.toFixed(1)} hour(s)</p>
                        </div>

                        <div className="rounded-lg border border-slate-200 p-3">
                          <label className="text-xs font-medium text-slate-700 mb-2 block">Add-ons</label>
                          <div className="space-y-2">
                            {bookingAddons.map((addon) => (
                              <label key={addon.id} className="flex items-center justify-between text-xs text-slate-700">
                                <span className="inline-flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedBookingAddons.includes(addon.id)}
                                    onChange={() =>
                                      setSelectedBookingAddons((prev) =>
                                        prev.includes(addon.id)
                                          ? prev.filter((id) => id !== addon.id)
                                          : [...prev, addon.id]
                                      )
                                    }
                                  />
                                  {addon.label}
                                </span>
                                <span>₹{addon.amount.toLocaleString('en-IN')}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-slate-700">Team Size</label>
                          <div className="relative">
                            <input type="number" min="1" max="10" placeholder="Number of seats" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Primary CTA & Notes depending on mode */}
                      <div className="flex flex-col gap-2 mt-2">
                        {vendorPricingMode === 'negotiable' ? (
                          <>
                            <button
                              type="button"
                              disabled={!bookingStartDate || isBookingDateUnavailable}
                              onClick={() => {
                                if (!bookingStartDate) {
                                  setBookingDateError('Please select a start date.');
                                  return;
                                }
                                if (isBookingDateUnavailable) {
                                  setBookingDateError('Please select a different date. This date is unavailable.');
                                  return;
                                }
                                setPricingSidebarNotice(
                                  'Your offer was submitted for vendor review. Watch this thread for their response.',
                                );
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 text-white py-3 rounded-lg font-medium text-sm transition-all shadow-sm"
                            >
                              Submit Offer
                            </button>
                            {pricingSidebarNotice && vendorPricingMode === 'negotiable' && (
                              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-2" role="status">
                                {pricingSidebarNotice}
                              </p>
                            )}
                            <p className="text-[10px] text-center text-slate-500">Vendor will review your offer and respond</p>
                          </>
                        ) : (
                          <>
                            {/* Variant C: Transparent & Fixed CTA */}
                            <button
                              type="button"
                              disabled={!bookingStartDate || isBookingDateUnavailable}
                              onClick={() => {
                                if (!bookingStartDate) {
                                  setBookingDateError('Please select a start date.');
                                  return;
                                }
                                if (isBookingDateUnavailable) {
                                  setBookingDateError('Please select a different date. This date is unavailable.');
                                  return;
                                }
                                if (canBookLive && bookingListingId) {
                                  navigate(`/book/space/${encodeURIComponent(bookingListingId)}`);
                                  return;
                                }
                            const bookingId = routeSpaceId ? encodeURIComponent(routeSpaceId) : 'space-1';
                            navigate(`/dspace/book/${bookingId}`, {
                              state: {
                                category,
                                from: 'space-detail',
                                spaceId: routeSpaceId ?? bookingId,
                                spaceName: displayName,
                                spaceImage: galleryImages[0],
                                location: displayLocation,
                                spaceTypes: displayType,
                                rating: displayRating,
                                bookingStartDate,
                                fullDayBooking,
                                bookingFromTime,
                                bookingToTime,
                                durationHours,
                                selectedBookingAddons,
                                bookingGrandTotal,
                                bookingBaseTotal,
                                addOnTotal,
                              },
                            });
                              }}
                              className="w-full bg-[#fa8d40] hover:bg-[#ea7c2e] disabled:opacity-60 disabled:hover:bg-[#fa8d40] text-white py-3 rounded-lg font-medium text-sm transition-all shadow-sm"
                            >
                              Book Now
                            </button>
                            <p className="text-[10px] text-center text-slate-500">You won't be charged yet</p>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'space-detail', category, vendor: 'vendor', channel: 'pre-enquiry-message' } })}
                          className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-medium text-sm hover:bg-slate-50 transition-all"
                        >
                          Message Vendor
                        </button>
                      </div>

                      {/* What's Included */}
                      <div className="py-4 border-y border-slate-200">
                        <h3 className="text-xs font-semibold text-slate-900 mb-3">What's included</h3>
                        <div className="flex flex-col gap-2.5">
                          {content.included.map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <div key={index} className="flex items-start gap-2">
                                <Icon className="w-4 h-4 text-[#fa8d40] flex-shrink-0" />
                                <span className="text-xs text-slate-600 leading-tight">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{fullDayBooking ? 'Day rate' : `Hourly (${durationHours.toFixed(1)}h)`}</span>
                          <span className="font-medium">₹{bookingBaseTotal.toLocaleString('en-IN')}</span>
                        </div>
                        {selectedBookingAddons.length > 0 ? (
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Add-ons</span>
                            <span className="font-medium">₹{addOnTotal.toLocaleString('en-IN')}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between text-sm pt-2 mt-1 border-t border-slate-200 font-bold text-slate-900">
                          <span>Total (Live)</span>
                          <span>₹{bookingGrandTotal.toLocaleString('en-IN')}</span>
                        </div>
                        {vendorPricingMode === 'negotiable' && (
                          <p className="text-[10px] text-blue-600 text-right font-medium">*Total will adjust based on accepted offer</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vendor response banner — only shown after user submits an offer */}
                  {pricingSidebarNotice && vendorPricingMode === 'negotiable' && (
                    <ResponseStatusBanner
                      status="best_offer"
                      spaceCategory={category}
                      comment="Thank you for your interest! We have evaluated your request and provided our best terms."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-12" />
          </div>
          )}
        </MogzuCorporateScrollSurface>
      </div>

      {requestPriceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Request for Price</h3>
            <p className="mt-1 text-sm text-slate-600">Share any requirements before we send your request.</p>
            <textarea
              className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm"
              rows={3}
              value={requestPriceNotes}
              onChange={(e) => setRequestPriceNotes(e.target.value)}
              placeholder="Optional notes"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm text-slate-600"
                onClick={() => setRequestPriceModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setRequestPriceModalOpen(false);
                  setRequestPriceNotes('');
                  setPricingSidebarNotice('Price request sent to the vendor. You will be notified when they respond.');
                }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-3xl">
            <ImageWithFallback
              src={galleryImages[currentImageIndex]}
              alt="Gallery"
              className="w-full max-h-screen object-contain"
            />
            <button
              type="button"
              aria-label="Close gallery"
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-600 hover:text-gray-900"
              onClick={closeLightbox}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute top-1/2 left-4 bg-white rounded-full p-2 text-gray-600 hover:text-gray-900"
              onClick={prevImage}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute top-1/2 right-4 bg-white rounded-full p-2 text-gray-600 hover:text-gray-900"
              onClick={nextImage}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
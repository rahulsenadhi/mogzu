import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, MapPin, Users, Star, Search, Building2, LayoutGrid, Store, Clapperboard, ShoppingBag, Megaphone, Share2, Tv, House, type LucideIcon } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import svgPaths from '@/imports/svg-xho44kfymu';
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf';
import svgPathsPromo from '@/imports/svg-fnlmb1lvit';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgImage25047 from "figma:asset/51fa0cc66bad8138d0fe7bdc52b6e0ad31133041.png";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PromotionBookingFlow } from './PromotionBookingFlow';
import { buildUnsplashKeywordImage, getListingSlideImages, getPriceDisplayParts } from './dspaceCardUtils';
import {
  CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT,
  loadCorporateAdminPromotions,
} from '@/app/lib/corporateAdminPromotionsStorage';

interface Promotion {
  id: number;
  title: string;
  description: string;
  location: string;
  dimensions: string;
  footfall: string;
  rating: number;
  price: string;
  category: 'All' | 'Mall' | 'Theatres' | 'Retail' | 'Ads' | 'Social Media' | 'OTT' | 'Gated Community';
  image: string;
}

const promotions: Promotion[] = [
  { id: 1, title: 'Phoenix mall advertising', description: 'Get eyeballs with distinctly noticeable flex and', location: 'Goregaon (Ravi) Mumbai', dimensions: '7 days x 4 hrs/day', footfall: '4000+', rating: 4.5, price: '₹7,000/hr', category: 'Mall', image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=300&fit=crop&q=80' },
  { id: 2, title: 'Phoenix mall advertising', description: 'Get eyeballs with distinctly noticeable flex and', location: 'Goregaon (Ravi) Mumbai', dimensions: '7 days x 4 hrs/day', footfall: '4000+', rating: 4.7, price: '₹7,000/hr', category: 'Mall', image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=300&fit=crop&q=80' },
  { id: 3, title: 'Phoenix mall advertising', description: 'Get eyeballs with distinctly noticeable flex and', location: 'Goregaon (Ravi) Mumbai', dimensions: '7 days x 4 hrs/day', footfall: '4000+', rating: 4.6, price: '₹7,000/hr', category: 'Mall', image: 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=400&h=300&fit=crop&q=80' },
  { id: 4, title: 'Phoenix mall advertising', description: 'Get eyeballs with distinctly noticeable flex and', location: 'Goregaon (Ravi) Mumbai', dimensions: '7 days x 4 hrs/day', footfall: '4000+', rating: 4.8, price: '₹7,000/hr', category: 'Mall', image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=300&fit=crop&q=80' },
  { id: 5, title: 'Phoenix mall advertising', description: 'Get eyeballs with distinctly noticeable flex and', location: 'Goregaon (Ravi) Mumbai', dimensions: '7 days x 4 hrs/day', footfall: '4000+', rating: 4.5, price: '₹7,000/hr', category: 'Mall', image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=300&fit=crop&q=80' },
  { id: 6, title: 'Phoenix mall advertising', description: 'Get eyeballs with distinctly noticeable flex and', location: 'Goregaon (Ravi) Mumbai', dimensions: '7 days x 4 hrs/day', footfall: '4000+', rating: 4.9, price: '₹7,000/hr', category: 'Mall', image: 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=400&h=300&fit=crop&q=80' },
  { id: 7, title: 'Cinema screen advertising', description: 'High impact advertising on big screens', location: 'Andheri (West) Mumbai', dimensions: '30 sec x 10 shows', footfall: '2000+', rating: 4.7, price: '₹15,000/show', category: 'Theatres', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop&q=80' },
  { id: 8, title: 'Retail store display', description: 'Premium display space in high-traffic area', location: 'Bandra (West) Mumbai', dimensions: '7 days x 8 hrs/day', footfall: '5000+', rating: 4.6, price: '₹5,000/hr', category: 'Retail', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80' },
  { id: 9, title: 'Hotel lobby advertising', description: 'Premium placement in 5-star hotel lobby', location: 'BKC Mumbai', dimensions: '30 days continuous', footfall: '3000+', rating: 4.8, price: '₹12,000/hr', category: 'Ads', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80' },
  { id: 10, title: 'Premium Society Gate Branding', description: 'High-visibility advertising at gated community entrance', location: 'Powai Mumbai', dimensions: '30 days x 24/7', footfall: '5000+', rating: 4.9, price: '₹8,500/hr', category: 'Gated Community', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&q=80' },
  { id: 11, title: 'Society Notice Board Ads', description: 'Strategic placement in high-end residential complex', location: 'Worli Mumbai', dimensions: '30 days continuous', footfall: '3500+', rating: 4.7, price: '₹6,000/hr', category: 'Gated Community', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80' },
  { id: 12, title: 'Clubhouse Digital Display', description: 'Premium digital screens in exclusive society clubhouse', location: 'Juhu Mumbai', dimensions: '30 days x 12 hrs/day', footfall: '4500+', rating: 4.8, price: '₹9,500/hr', category: 'Gated Community', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80' },
];

export default function PromotionsPage() {
  const navigate = useNavigate();
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Mall' | 'Theatres' | 'Retail' | 'Ads' | 'Social Media' | 'OTT' | 'Gated Community'>('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAdTypes, setSelectedAdTypes] = useState<string[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedAdSize, setSelectedAdSize] = useState<string | null>(null);
  const [selectedVisibilityHours, setSelectedVisibilityHours] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [minFootfall, setMinFootfall] = useState(0);
  const [priceRange, setPriceRange] = useState(20000);
  const [bookingPromotion, setBookingPromotion] = useState<Promotion | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [adminPromos, setAdminPromos] = useState(() =>
    loadCorporateAdminPromotions().filter((p) => p.active),
  );

  useEffect(() => {
    const sync = () => setAdminPromos(loadCorporateAdminPromotions().filter((p) => p.active));
    sync();
    window.addEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const filteredPromotions = selectedCategory === 'All' 
    ? promotions 
    : promotions.filter(p => p.category === selectedCategory);

  const toggleAdType = (type: string) => {
    setSelectedAdTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const togglePlacement = (placement: string) => {
    setSelectedPlacement(prev =>
      prev.includes(placement)
        ? prev.filter(p => p !== placement)
        : [...prev, placement]
    );
  };

  const goToPrevCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0;
      return { ...prev, [cardId]: (current - 1 + total) % total };
    });
  };

  const goToNextCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0;
      return { ...prev, [cardId]: (current + 1) % total };
    });
  };

  const toggleVisibilityHours = (hours: string) => {
    setSelectedVisibilityHours(prev =>
      prev.includes(hours)
        ? prev.filter(h => h !== hours)
        : [...prev, hours]
    );
  };

  const promotionCategoryMeta: Record<
    Promotion['category'],
    { icon: LucideIcon; color: string }
  > = {
    All: { icon: LayoutGrid, color: '#475569' },
    Mall: { icon: Store, color: '#0369A1' },
    Theatres: { icon: Clapperboard, color: '#9333EA' },
    Retail: { icon: ShoppingBag, color: '#0F766E' },
    Ads: { icon: Megaphone, color: '#DC2626' },
    'Social Media': { icon: Share2, color: '#0284C7' },
    OTT: { icon: Tv, color: '#7C3AED' },
    'Gated Community': { icon: House, color: '#15803D' },
  };

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Booking Flow Modal */}
      {bookingPromotion && (
        <PromotionBookingFlow
          promotion={bookingPromotion}
          step={bookingStep}
          onClose={() => {
            setBookingPromotion(null);
            setBookingStep(1);
          }}
          onBack={() => setBookingStep(prev => Math.max(1, prev - 1))}
          onNext={() => setBookingStep(prev => Math.min(4, prev + 1))}
        />
      )}

      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={false} 
        activeNav="activity"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader variant="blended" searchPlaceholder="Search promotions..." />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {adminPromos.length > 0 ? (
            <div className="border-b border-[#ececec] bg-gradient-to-r from-[#eef2ff] to-white">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">
                  Featured by Mogzu (admin)
                </p>
                <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
                  {adminPromos.map((p) => (
                    <article
                      key={p.id}
                      className="min-w-[260px] max-w-[280px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <img
                          src={p.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-semibold text-slate-500">{p.sector}</p>
                        <h3 className="mt-0.5 text-sm font-semibold text-[#0e1e3f] line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{p.subtitle}</p>
                        <p className="mt-2 text-[11px] text-slate-500">{p.vendorName}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {/* Breadcrumb */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button
                  onClick={() => navigate("/activitysuite")}
                  className="font-medium text-[#7b879a] transition-colors hover:text-[#2563eb]"
                >
                  Activity Suite
                </button>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#a0aec0]">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="font-semibold tracking-tight text-[#0e1e3f]">D Space</span>
              </div>
            </div>
          </div>

          {/* Page Title and Tabs */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-2">
              <div className="flex items-center gap-4">
                <h1 className="text-[22px] font-bold leading-none text-[#0e1e3f]">
                  D Space
                </h1>
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => navigate("/dspace")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Home
                  </button>
                  <button
                    onClick={() => navigate("/spacex")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.p11a5d600}
                        fill="#0F766E"
                      />
                    </svg>
                    Meetings
                  </button>
                  <button
                    onClick={() => navigate("/activities")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.p9bd8700}
                        fill="#B45309"
                      />
                    </svg>
                    Activities
                  </button>
                  <button
                    onClick={() => navigate("/stay")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.p30609c00}
                        fill="#7C3AED"
                      />
                    </svg>
                    Stay
                  </button>
                  <button
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-[#2563eb] px-4 text-[14px] font-semibold text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition-all duration-200 active:scale-[0.98]"
                    style={{
                      backgroundImage:
                        "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.pd9fb4c0}
                        fill="#DC2626"
                      />
                    </svg>
                    Promotions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="max-w-7xl mx-auto px-6 pt-5">
            <div className="group relative mb-6 h-[200px] overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-[0_18px_40px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <div
                className="relative min-w-full h-[200px]"
                style={{
                  background: "linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 100%), linear-gradient(90deg, rgb(24, 85, 218) 0%, rgb(24, 85, 218) 100%)",
                }}
              >
                {/* Background Pattern */}
                <div className="absolute h-full right-0 top-0 w-[42%] mix-blend-hard-light overflow-hidden">
                  <img
                    src={imgImage25047}
                    alt=""
                    className="h-full w-auto object-cover"
                  />
                </div>

                <div className="relative flex h-full items-center px-8 py-7 sm:px-10">
                  <div className="max-w-2xl">
                    {/* Vendor Badge */}
                    <div className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="#fbbf24"
                        />
                        <text
                          x="12"
                          y="16"
                          fontSize="14"
                          textAnchor="middle"
                          fill="white"
                          fontWeight="bold"
                        >
                          !
                        </text>
                      </svg>
                      <span className="text-[9px] font-semibold text-[#0e1e3f] uppercase tracking-wide">
                        By for group
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="mb-1.5 text-[24px] font-bold leading-tight text-white drop-shadow-md">
                      Special offer on Promotions
                    </h3>
                    
                    {/* Description */}
                    <p className="mb-4 max-w-xl text-[14px] leading-[1.6] text-white/90 line-clamp-2 drop-shadow-sm">
                      Rush your next event with us and choose from a variety of talented event packages, then ensure a seamless process and all-inclusive services.
                    </p>
                    
                    {/* CTA Button */}
                    <button className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                      <span>View offer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="max-w-7xl mx-auto mb-5 px-6 py-1">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {(['All', 'Mall', 'Theatres', 'Retail', 'Ads', 'Social Media', 'OTT', 'Gated Community'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                    category === 'Gated Community' ? 'min-w-[70px] max-w-[90px]' : 'min-w-[70px]'
                  } ${
                    selectedCategory === category
                      ? 'border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                      : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                  }`}
                  style={
                    selectedCategory === category
                      ? {
                          backgroundImage:
                            "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                        }
                      : undefined
                  }
                >
                  {(() => {
                    const { icon: CategoryIcon, color } = promotionCategoryMeta[category];
                    return (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <CategoryIcon className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />
                      </span>
                    );
                  })()}
                  <span className={`font-medium ${category === 'Gated Community' ? 'text-[12px] leading-tight whitespace-normal text-center' : 'text-[14px]'}`}>{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Filters and Listings */}
          <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 pb-6 sm:px-6 lg:flex-row">
            {/* Left Sidebar - Filters */}
            <aside className="w-full flex-shrink-0 lg:w-[240px] lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-2xl border border-white/60 bg-white/55 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.16)] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">
                    Filters
                  </h3>
                  <button 
                    onClick={() => {
                      setSearchLocation('');
                      setSelectedDate('');
                      setSelectedAdTypes([]);
                      setSelectedPlacement([]);
                      setSelectedDuration(null);
                      setSelectedAdSize(null);
                      setSelectedVisibilityHours([]);
                      setSelectedRating(null);
                      setMinFootfall(0);
                      setPriceRange(20000);
                    }}
                    className="text-[13px] font-medium text-[#4379ee] hover:text-[#3568dd]"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-5 border-t border-slate-200/70 pt-3">
                  {/* Ad Type Filter */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Ad Type
                    </h4>
                    <div className="space-y-2">
                      {['Banner', 'Hoarding', 'LED Screen', 'Standee', 'Kiosk', 'Wall Wrap'].map((type) => (
                        <label key={type} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAdTypes.includes(type)}
                            onChange={() => toggleAdType(type)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#0e1e3f]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Placement Type Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Placement Type
                    </h4>
                    <div className="space-y-2">
                      {['Indoor', 'Outdoor', 'High Traffic', 'Premium Location'].map((placement) => (
                        <label key={placement} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPlacement.includes(placement)}
                            onChange={() => togglePlacement(placement)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#0e1e3f]">{placement}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Duration Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Campaign Duration
                    </h4>
                    <div className="space-y-2">
                      {['1 Week', '2 Weeks', '1 Month', '3 Months', '6 Months'].map((duration) => (
                        <label key={duration} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="duration"
                            checked={selectedDuration === duration}
                            onChange={() => setSelectedDuration(duration)}
                            className="mt-0.5 h-4 w-4 border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#0e1e3f]">{duration}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Ad Size Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Ad Size
                    </h4>
                    <div className="space-y-2">
                      {['Small (10x5 ft)', 'Medium (20x10 ft)', 'Large (40x20 ft)', 'Extra Large (60x30 ft)'].map((size) => (
                        <label key={size} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="adSize"
                            checked={selectedAdSize === size}
                            onChange={() => setSelectedAdSize(size)}
                            className="mt-0.5 h-4 w-4 border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#0e1e3f]">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Visibility Hours Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Visibility Hours
                    </h4>
                    <div className="space-y-2">
                      {['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 'Evening (6 PM - 12 AM)', '24/7'].map((hours) => (
                        <label key={hours} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedVisibilityHours.includes(hours)}
                            onChange={() => toggleVisibilityHours(hours)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#0e1e3f]">{hours}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Customer Rating Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Customer Rating
                    </h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === rating}
                            onChange={() => setSelectedRating(rating)}
                            className="mt-0.5 h-4 w-4 border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <div className="flex items-center gap-1">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-gray-300" />
                            ))}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Min Footfall Slider */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Min Daily Footfall
                      </h4>
                      <span className="text-xs text-[#878e9e]">{minFootfall.toLocaleString()}+</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={minFootfall}
                      onChange={(e) => setMinFootfall(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4379ee]"
                    />
                    <div className="flex justify-between text-[10px] text-[#878e9e] mt-1">
                      <span>0</span>
                      <span>50K</span>
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Budget Range
                      </h4>
                      <span className="text-xs text-[#878e9e]">₹{priceRange.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="500000"
                      step="5000"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4379ee]"
                    />
                    <div className="flex justify-between text-[10px] text-[#878e9e] mt-1">
                      <span>₹5K</span>
                      <span>₹5L</span>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Location
                    </h4>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#878e9e]" />
                      <input
                        type="text"
                        placeholder="Enter city or area"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full rounded-lg border border-white/70 bg-white/65 py-2 pl-9 pr-2.5 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                      />
                    </div>
                  </div>

                  {/* Start Date Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">
                      Campaign Start Date
                    </h4>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>
                  <p className="mt-4 w-full rounded-xl border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] leading-5 text-[#475569]">
                    Filters apply instantly. Combine placement, duration, and budget for better promotion matches.
                  </p>
                </div>
              </div>
            </aside>

            {/* Listings Grid */}
            <div className="flex-1 min-w-0">
              {/* Top Filters (above listings) */}
              <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white pl-10 pr-3 text-[14px] text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <input
                  type="date"
                  className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-3">
                  <span className="text-[13px] font-medium text-[#0e1e3f]">Budget</span>
                  <span className="text-[13px] text-[#64748b]">₹{priceRange.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation('')
                    setSelectedDate('')
                  }}
                  className="h-10 rounded-xl border border-[#e5e7eb] bg-white/70 px-4 text-sm font-medium text-[#0e1e3f] transition-colors hover:border-[#93c5fd]"
                >
                  Clear
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-[16px] font-semibold text-[#0e1e3f]">
                  Trending promotions space
                </h2>
                <p className="text-xs text-[#878e9e] mt-1">
                  Discover high-impact advertising opportunities across malls, theatres, retail spaces, and gated communities
                </p>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {filteredPromotions.map((promo) => {
                  const cardId = String(promo.id)
                  const slideImages = getListingSlideImages(
                    promo.image,
                    buildUnsplashKeywordImage(`${promo.category} advertising ${promo.location}`),
                    buildUnsplashKeywordImage(`${promo.title} billboard marketing`),
                    imgImage25047,
                  )
                  const activeIndex = cardImageIndexById[cardId] ?? 0
                  const activeImage = slideImages[activeIndex] || imgImage25047
                  const priceDisplay = getPriceDisplayParts(promo.price)

                  return (
                  <div
                    key={promo.id}
                    className="group flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)]"
                  >
                    <div className="relative h-44 sm:h-48">
                      <ImageWithFallback
                        src={activeImage}
                        alt={promo.title || 'Promotion'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {slideImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Previous image for ${promo.title}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              goToPrevCardImage(cardId, slideImages.length)
                            }}
                            className="absolute left-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm transition-colors hover:bg-white"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            aria-label={`Next image for ${promo.title}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              goToNextCardImage(cardId, slideImages.length)
                            }}
                            className="absolute right-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm transition-colors hover:bg-white"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-2.5 left-1/2 z-[2] inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1">
                            {slideImages.slice(0, 5).map((_, dotIdx) => (
                              <span
                                key={`${promo.id}-${dotIdx}`}
                                className={`h-1.5 rounded-full transition-all ${dotIdx === activeIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/55'}`}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}
                      <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-[0_6px_16px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all hover:bg-white">
                        <Heart className="h-4 w-4 text-[#878e9e]" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e1e3f] shadow-[0_6px_16px_rgba(15,23,42,0.16)] backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-[#FFCC47] text-[#FFCC47]" />
                            {promo.rating}
                          </div>
                          <div className="rounded-md bg-[#4379ee] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(15,23,42,0.16)]">
                            {promo.category}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-[14px]">
                      <h3 className="mb-1 line-clamp-1 text-[15px] font-semibold leading-tight text-[#0e1e3f]">{promo.title || 'Promotion space'}</h3>
                      <p className="mb-2.5 line-clamp-2 text-[12px] text-[#878e9e]">{promo.description || 'Targeted brand visibility in premium spaces.'}</p>
                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#fa8d40]">{promo.dimensions || 'Flexible duration'}</span>
                        <span className="rounded-md bg-[#f0f9ff] px-2 py-0.5 text-[10px] font-semibold text-[#0c4a6e]">{promo.footfall || 'High footfall'}</span>
                      </div>
                      <div className="mb-1.5 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{promo.location || 'Location on request'}</span>
                      </div>
                      <div className="mb-3 flex items-start gap-3 text-[12px] text-[#878e9e]">
                        <div className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                          </svg>
                          <span>{promo.dimensions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{promo.footfall}</span>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-[#e2e8f0] pt-2.5">
                        <div>
                          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-[#878e9e]">Starting at</p>
                          <p className="text-[20px] font-extrabold leading-none tracking-tight text-[#0e1e3f]">
                            {priceDisplay.amount}
                            {priceDisplay.unit ? (
                              <span className="ml-1 text-[12px] font-semibold text-[#64748b]">
                                {priceDisplay.unit}
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setBookingPromotion(promo);
                            setBookingStep(1);
                          }}
                          className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-5 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
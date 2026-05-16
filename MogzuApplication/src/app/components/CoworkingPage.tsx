import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Search, MapPin, Users, ChevronDown, Star, Heart, AlertCircle, Grid3x3, Flame, BriefcaseBusiness, Building2, Coffee, Laptop } from 'lucide-react';
import svgPaths from '@/imports/svg-camfkj9vq4';
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgMogzuM from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildUnsplashKeywordImage, getListingSlideImages, getPriceDisplayParts } from './dspaceCardUtils';

interface CoworkingSpace {
  id: string;
  name: string;
  location: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  capacity: string;
  price: number;
  priceUnit: string;
  amenities: string[];
  type: 'Hot Desk' | 'Dedicated Desk' | 'Private Office' | 'Meeting Room';
  featured: boolean;
  availableFrom: string;
  tags: string[];
  promoted?: boolean;
  offer?: string;
}

const mockCoworkingSpaces: CoworkingSpace[] = [
  {
    id: '1',
    name: 'WeWork BKC',
    location: 'Bandra Kurla Complex',
    city: 'Mumbai',
    rating: 4.8,
    reviews: 245,
    image: 'modern coworking space desks',
    capacity: '1-50',
    price: 8000,
    priceUnit: 'month',
    amenities: ['High-Speed WiFi', 'Meeting Rooms', 'Cafeteria', 'Parking', 'Printer'],
    type: 'Dedicated Desk',
    featured: true,
    availableFrom: 'Immediate',
    tags: ['modern', 'high-speed wifi', 'meeting rooms'],
    promoted: true,
    offer: '20% off'
  },
  {
    id: '2',
    name: 'Awfis Andheri',
    location: 'Andheri East',
    city: 'Mumbai',
    rating: 4.6,
    reviews: 180,
    image: 'shared workspace desks computers',
    capacity: '1-30',
    price: 6500,
    priceUnit: 'month',
    amenities: ['WiFi', 'Meeting Rooms', 'Unlimited Coffee', 'Lockers', 'AC'],
    type: 'Hot Desk',
    featured: false,
    availableFrom: 'Immediate',
    tags: ['shared', 'wifi', 'meeting rooms'],
    promoted: false
  },
  {
    id: '3',
    name: 'Innov8 Connaught Place',
    location: 'Connaught Place',
    city: 'Delhi',
    rating: 4.9,
    reviews: 320,
    image: 'private office cabin workspace',
    capacity: '1-100',
    price: 15000,
    priceUnit: 'month',
    amenities: ['Premium WiFi', 'Private Cabins', 'Cafe', 'Gym', 'Lounge'],
    type: 'Private Office',
    featured: true,
    availableFrom: 'Immediate',
    tags: ['private', 'premium wifi', 'cabin'],
    promoted: true,
    offer: '10% off'
  },
  {
    id: '4',
    name: '91Springboard Koramangala',
    location: 'Koramangala',
    city: 'Bangalore',
    rating: 4.7,
    reviews: 290,
    image: 'startup office workspace bangalore',
    capacity: '1-40',
    price: 7000,
    priceUnit: 'month',
    amenities: ['WiFi', 'Event Space', 'Cafeteria', 'Gaming Zone', 'Printer'],
    type: 'Dedicated Desk',
    featured: false,
    availableFrom: 'From Feb 15',
    tags: ['startup', 'wifi', 'event space'],
    promoted: false
  },
  {
    id: '5',
    name: 'Regus Gurgaon',
    location: 'Cyber City',
    city: 'Gurgaon',
    rating: 4.5,
    reviews: 150,
    image: 'conference room meeting space',
    capacity: '1-20',
    price: 500,
    priceUnit: 'hour',
    amenities: ['WiFi', 'Projector', 'Whiteboard', 'Tea/Coffee', 'AC'],
    type: 'Meeting Room',
    featured: false,
    availableFrom: 'Immediate',
    tags: ['conference', 'wifi', 'projector'],
    promoted: false
  },
  {
    id: '6',
    name: 'CoWrks Powai',
    location: 'Powai',
    city: 'Mumbai',
    rating: 4.6,
    reviews: 210,
    image: 'flexible coworking office space',
    capacity: '1-60',
    price: 9000,
    priceUnit: 'month',
    amenities: ['WiFi', 'Phone Booths', 'Cafe', 'Terrace', 'Parking'],
    type: 'Private Office',
    featured: true,
    availableFrom: 'Immediate',
    tags: ['flexible', 'wifi', 'phone booths'],
    promoted: true,
    offer: '15% off'
  },
  {
    id: '7',
    name: 'The Office Pass Pune',
    location: 'Viman Nagar',
    city: 'Pune',
    rating: 4.4,
    reviews: 95,
    image: 'coworking hot desk open space',
    capacity: '1-25',
    price: 5500,
    priceUnit: 'month',
    amenities: ['WiFi', 'Meeting Room', 'Coffee', 'Lockers', 'Reception'],
    type: 'Hot Desk',
    featured: false,
    availableFrom: 'Immediate',
    tags: ['hot desk', 'wifi', 'meeting room'],
    promoted: false
  },
  {
    id: '8',
    name: 'IndiQube Whitefield',
    location: 'Whitefield',
    city: 'Bangalore',
    rating: 4.8,
    reviews: 275,
    image: 'premium workspace private cabin',
    capacity: '1-80',
    price: 12000,
    priceUnit: 'month',
    amenities: ['Premium WiFi', 'Video Conferencing', 'Cafeteria', 'Gym', 'Parking'],
    type: 'Private Office',
    featured: true,
    availableFrom: 'Immediate',
    tags: ['premium', 'wifi', 'video conferencing'],
    promoted: true,
    offer: '25% off'
  },
  {
    id: '9',
    name: 'myHQ Salt Lake',
    location: 'Salt Lake City',
    city: 'Kolkata',
    rating: 4.3,
    reviews: 120,
    image: 'dedicated desk coworking kolkata',
    capacity: '1-35',
    price: 6000,
    priceUnit: 'month',
    amenities: ['WiFi', 'Meeting Room', 'Tea/Coffee', 'Parking', 'AC'],
    type: 'Dedicated Desk',
    featured: false,
    availableFrom: 'From Feb 10',
    tags: ['dedicated', 'wifi', 'meeting room'],
    promoted: false
  }
];

export default function CoworkingPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('Any Capacity');
  const [priceRange, setPriceRange] = useState('Any Price');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);

  const cities = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Gurgaon', 'Pune', 'Kolkata'];
  const types = ['All Types', 'Hot Desk', 'Dedicated Desk', 'Private Office', 'Meeting Room'];
  const capacities = ['Any Capacity', '1-10', '11-25', '26-50', '51-100', '100+'];
  const priceRanges = ['Any Price', 'Under ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹15,000', 'Above ₹15,000'];

  const categories: Array<{ id: string; label: string; iconKey: string; color: string }> = [
    { id: 'all', label: 'All Spaces', iconKey: 'all', color: '#475569' },
    { id: 'hot-desk', label: 'Hot Desk', iconKey: 'hot-desk', color: '#EA580C' },
    { id: 'dedicated-desk', label: 'Dedicated Desk', iconKey: 'dedicated-desk', color: '#0369A1' },
    { id: 'private-office', label: 'Private Office', iconKey: 'private-office', color: '#7C3AED' },
    { id: 'meeting-room', label: 'Meeting Room', iconKey: 'meeting-room', color: '#0F766E' },
  ];

  const renderCategoryIcon = (iconKey: string, color: string) => {
    if (iconKey === 'all') return <Grid3x3 className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />;
    if (iconKey === 'hot-desk') return <Flame className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />;
    if (iconKey === 'dedicated-desk') return <BriefcaseBusiness className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />;
    if (iconKey === 'private-office') return <Building2 className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />;
    return <Laptop className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filteredSpaces = mockCoworkingSpaces.filter(space => {
    if (selectedCity !== 'All Cities' && space.city !== selectedCity) return false;
    if (selectedType !== 'All Types' && space.type !== selectedType) return false;
    if (selectedCategory !== 'all') {
      const categoryMap: { [key: string]: string } = {
        'hot-desk': 'Hot Desk',
        'dedicated-desk': 'Dedicated Desk',
        'private-office': 'Private Office',
        'meeting-room': 'Meeting Room',
      };
      if (space.type !== categoryMap[selectedCategory]) return false;
    }
    if (selectedCapacity !== 'Any Capacity') {
      const capacityMatch = space.capacity.match(/\d+/g);
      const maxCapacity = capacityMatch ? Number(capacityMatch[capacityMatch.length - 1]) : null;
      if (maxCapacity === null) return false;
      if (selectedCapacity === '1-10' && !(maxCapacity >= 1 && maxCapacity <= 10)) return false;
      if (selectedCapacity === '11-25' && !(maxCapacity >= 11 && maxCapacity <= 25)) return false;
      if (selectedCapacity === '26-50' && !(maxCapacity >= 26 && maxCapacity <= 50)) return false;
      if (selectedCapacity === '51-100' && !(maxCapacity >= 51 && maxCapacity <= 100)) return false;
      if (selectedCapacity === '100+' && !(maxCapacity >= 100)) return false;
    }
    if (priceRange !== 'Any Price') {
      const numericPrice = Number(space.price);
      if (priceRange === 'Under ₹5,000' && !(numericPrice < 5000)) return false;
      if (priceRange === '₹5,000 - ₹10,000' && !(numericPrice >= 5000 && numericPrice <= 10000)) return false;
      if (priceRange === '₹10,000 - ₹15,000' && !(numericPrice >= 10000 && numericPrice <= 15000)) return false;
      if (priceRange === 'Above ₹15,000' && !(numericPrice > 15000)) return false;
    }
    if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !space.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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

  const scrollCategories = (direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader variant="blended" searchValue={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search coworking spaces" />

        {/* Page Content */}
        <MogzuCorporateScrollSurface>
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
                    onClick={() => navigate("/dspace")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-[#2563eb] px-4 text-[14px] font-semibold text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition-all duration-200 active:scale-[0.98]"
                    style={{
                      backgroundImage:
                        "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPathsSpaceX.p11a5d600} fill="#0F766E" />
                    </svg>
                    Meetings
                  </button>
                  <button
                    onClick={() => navigate("/activities")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPathsSpaceX.p9bd8700} fill="#B45309" />
                    </svg>
                    Activities
                  </button>
                  <button
                    onClick={() => navigate("/stay")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPathsSpaceX.p30609c00} fill="#7C3AED" />
                    </svg>
                    Stay
                  </button>
                  <button
                    onClick={() => navigate("/promotions")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPathsSpaceX.pd9fb4c0} fill="#DC2626" />
                    </svg>
                    Promotions
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Hero Banner */}
            <div className="group relative mb-6 h-[200px] overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-[0_18px_40px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
              <div className="relative z-10 flex h-full flex-col justify-center px-7 py-5 text-[#0e1e3f] sm:px-8">
                <h1 className="text-[28px] font-bold leading-tight tracking-tight">
                  Find Your Perfect Coworking Space
                </h1>
                <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-[#64748b] line-clamp-2">
                  Flexible workspaces designed for modern teams and professionals.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                    Browse Spaces
                  </button>
                  <button className="inline-flex h-11 items-center rounded-full border border-[#cfd9ef] bg-white/80 px-6 text-[14px] font-semibold text-[#475569] backdrop-blur-sm transition-all duration-200 hover:bg-white active:scale-[0.98]">
                    Schedule a Tour
                  </button>
                </div>
              </div>
              <div className="absolute -right-8 -top-10 h-56 w-56 rounded-full bg-[#dbeafe]/70 blur-3xl" />
              <div className="absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-[#bfdbfe]/45 blur-2xl" />
            </div>

            {/* D Space Meeting Subcategories */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => navigate('/spacex')}
                  className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <Users className="h-4.5 w-4.5" color="#0F766E" strokeWidth={2.2} />
                  </span>
                  <span className="text-[14px] font-medium">Conference</span>
                </button>
                <button
                  className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition-all duration-200 whitespace-nowrap active:scale-[0.98]"
                  style={{
                    backgroundImage:
                      "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                  }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <Laptop className="h-4.5 w-4.5" color="#0369A1" strokeWidth={2.2} />
                  </span>
                  <span className="text-[14px] font-semibold">Co Working</span>
                </button>
                <button
                  onClick={() => navigate('/spacex')}
                  className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <Coffee className="h-4.5 w-4.5" color="#B45309" strokeWidth={2.2} />
                  </span>
                  <span className="text-[14px] font-medium">Casual</span>
                </button>
                <button
                  onClick={() => navigate('/spacex')}
                  className="h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <BriefcaseBusiness className="h-4.5 w-4.5" color="#DC2626" strokeWidth={2.2} />
                  </span>
                  <span className="text-[14px] font-medium">Corporate Events Space</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-5 py-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="h-8 w-8 shrink-0 rounded-full border border-slate-300/40 bg-white/70 text-[#475569] backdrop-blur-sm transition-colors hover:border-[#93c5fd] hover:text-[#0e1e3f]"
                  aria-label="Scroll categories left"
                >
                  <span className="text-sm">‹</span>
                </button>
                <div
                  ref={categoryScrollRef}
                  className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                        selectedCategory === category.id
                          ? "border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]"
                          : "border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]"
                      }`}
                      style={
                        selectedCategory === category.id
                          ? {
                              backgroundImage:
                                "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                            }
                          : undefined
                      }
                    >
                      <span className="flex h-5 w-5 items-center justify-center">
                        {renderCategoryIcon(category.iconKey, category.color)}
                      </span>
                      <span className="text-[14px] font-medium">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="h-8 w-8 shrink-0 rounded-full border border-slate-300/40 bg-white/70 text-[#475569] backdrop-blur-sm transition-colors hover:border-[#93c5fd] hover:text-[#0e1e3f]"
                  aria-label="Scroll categories right"
                >
                  <span className="text-sm">›</span>
                </button>
              </div>
            </div>

            {/* Filters and Content */}
            <div className="pb-6 flex flex-col gap-4 lg:flex-row">
              {/* Left Sidebar - Filters */}
              <aside className="w-full flex-shrink-0 lg:w-[240px] lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-2xl border border-white/60 bg-white/55 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.16)] backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[16px] font-semibold text-[#0e1e3f]">
                      Filters
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCity('All Cities');
                        setSelectedType('All Types');
                        setSelectedCapacity('Any Capacity');
                        setPriceRange('Any Price');
                      }}
                      className="text-[13px] font-medium text-[#4379ee] hover:text-[#3568dd]"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-5 border-t border-slate-200/70 pt-3">
                    <div>
                      <h4 className="mb-2.5 text-xs font-semibold text-[#0e1e3f]">City</h4>
                      <div className="relative">
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 pr-8 text-xs text-[#0e1e3f] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                        >
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#878e9e]" />
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-4">
                      <h4 className="mb-2.5 text-xs font-semibold text-[#0e1e3f]">Space Type</h4>
                      <div className="relative">
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 pr-8 text-xs text-[#0e1e3f] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                        >
                          {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#878e9e]" />
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-4">
                      <h4 className="mb-2.5 text-xs font-semibold text-[#0e1e3f]">Capacity</h4>
                      <div className="relative">
                        <select
                          value={selectedCapacity}
                          onChange={(e) => setSelectedCapacity(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 pr-8 text-xs text-[#0e1e3f] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                        >
                          {capacities.map(capacity => (
                            <option key={capacity} value={capacity}>{capacity}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#878e9e]" />
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-4">
                      <h4 className="mb-2.5 text-xs font-semibold text-[#0e1e3f]">Price Range</h4>
                      <div className="relative">
                        <select
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 pr-8 text-xs text-[#0e1e3f] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                        >
                          {priceRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#878e9e]" />
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Content - Grid */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Top Filters (above listings) */}
                <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search coworking spaces"
                      className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white pl-10 pr-3 text-[14px] text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  >
                    {priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Header */}
                <div className="mb-3">
                  <h2 className="text-[16px] font-semibold text-[#0e1e3f]">
                    Trending Coworking Spaces
                  </h2>
                  <p className="text-xs text-[#878e9e]">
                    Showing {filteredSpaces.length} result{filteredSpaces.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Coworking Spaces Grid */}
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
              {isError ? (
                <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/65 py-16 text-center backdrop-blur-md">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0e1e3f]">
                    Something went wrong
                  </h3>
                  <p className="mb-4 max-w-xs text-sm text-[#878e9e]">
                    We couldn't load results. Please check your connection and try again.
                  </p>
                  <button
                    onClick={() => setIsError(false)}
                    className="px-6 py-2 bg-destructive text-white rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-md"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredSpaces.length > 0 ? (
                filteredSpaces.map((space) => {
                  const cardId = String(space.id)
                  const primaryImage = `https://source.unsplash.com/800x600/?${encodeURIComponent(space.image || 'coworking office')}`
                  const slideImages = getListingSlideImages(
                    primaryImage,
                    buildUnsplashKeywordImage(`${space.type} coworking ${space.city}`),
                    buildUnsplashKeywordImage(`${space.name} workspace`),
                    imgMogzuM,
                  )
                  const activeIndex = cardImageIndexById[cardId] ?? 0
                  const activeImage = slideImages[activeIndex] || imgMogzuM
                  const priceDisplay = getPriceDisplayParts(space.price, space.priceUnit)

                  return (
                  <div
                    key={space.id}
                    className="group flex min-h-[380px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)]"
                    onClick={() => navigate(`/coworking/${space.id}`)}
                  >
                    <div className="relative h-44 sm:h-48">
                      <ImageWithFallback
                        src={activeImage}
                        alt={space.name || 'Coworking space'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {slideImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Previous image for ${space.name}`}
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
                            aria-label={`Next image for ${space.name}`}
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
                                key={`${space.id}-${dotIdx}`}
                                className={`h-1.5 rounded-full transition-all ${dotIdx === activeIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/55'}`}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(space.id);
                        }}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-[0_6px_16px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all hover:bg-white"
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(space.id) ? 'fill-red-500 text-red-500' : 'text-[#878e9e]'}`} />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e1e3f] shadow-[0_6px_16px_rgba(15,23,42,0.16)] backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-[#FFCC47] text-[#FFCC47]" />
                            {space.rating}
                          </div>
                          <div className="rounded-md bg-[#4379ee] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(15,23,42,0.16)]">
                            {space.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-[14px]">
                      <h3 className="mb-1 line-clamp-1 text-[15px] font-semibold leading-tight text-[#0e1e3f]">
                        {space.name || 'Coworking Space'}
                      </h3>
                      <p className="mb-2.5 line-clamp-2 text-[12px] text-[#878e9e]">
                        Flexible coworking setup with modern amenities for productive teams.
                      </p>

                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        {(space.amenities || []).slice(0, 3).map((amenity, idx) => (
                          <span
                            key={`${space.id}-amenity-${idx}`}
                            className="rounded-md bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#fa8d40]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="mb-1.5 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{space.location ? `${space.location}, ${space.city}` : 'Location on request'}</span>
                      </div>
                      <div className="mb-3 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{space.capacity || 'Capacity on request'}</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[#e2e8f0] pt-2.5">
                        <div>
                          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-[#878e9e]">
                            Starting at
                          </p>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coworking/${space.id}`);
                          }}
                          className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-5 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                )})
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0e1e3f]">
                    No coworking spaces found
                  </h3>
                  <p className="mb-4 text-sm text-[#878e9e]">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
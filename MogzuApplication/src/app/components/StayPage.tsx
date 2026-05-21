import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, MapPin, Users, Star, BedDouble, Home, Building2, TreePine, Search } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import svgPaths from '@/imports/svg-xho44kfymu';
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgImage24995 from "figma:asset/3fd0634bc82e44a536b4f08060cd6f224c13e9e8.png";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildUnsplashKeywordImage, getListingSlideImages, getPriceDisplayParts } from './dspaceCardUtils';

interface Stay {
  id: number;
  name: string;
  description: string;
  location: string;
  capacity: string;
  rating: number;
  price: string;
  category: 'Bedrooms' | 'Hostels' | 'Hotels' | 'Resorts';
  image: string;
  amenities: string[];
}

const stays: Stay[] = [
  // Bedrooms
  { id: 1, name: 'Cozy Private Bedroom', description: 'Comfortable private room with modern amenities and workspace', location: 'Goregaon (East) Mumbai', capacity: '1-2', rating: 4.5, price: '₹2,500/night', category: 'Bedrooms', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Parking'] },
  { id: 2, name: 'Luxury Master Suite', description: 'Spacious master bedroom with attached bathroom and balcony', location: 'Bandra West, Mumbai', capacity: '1-2', rating: 4.7, price: '₹3,500/night', category: 'Bedrooms', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Parking', 'AC'] },
  { id: 3, name: 'Modern Studio Room', description: 'Contemporary studio with kitchenette and city views', location: 'Powai, Mumbai', capacity: '1-2', rating: 4.6, price: '₹3,000/night', category: 'Bedrooms', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'AC'] },
  { id: 4, name: 'Garden View Bedroom', description: 'Peaceful room with garden access and natural lighting', location: 'Juhu, Mumbai', capacity: '1-2', rating: 4.4, price: '₹2,800/night', category: 'Bedrooms', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Garden'] },
  { id: 5, name: 'Executive Bedroom', description: 'Business-friendly room with work desk and high-speed internet', location: 'BKC, Mumbai', capacity: '1-2', rating: 4.8, price: '₹4,000/night', category: 'Bedrooms', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Parking', 'AC'] },
  { id: 6, name: 'Beach View Bedroom', description: 'Room with stunning sea views and beach access', location: 'Marine Drive, Mumbai', capacity: '1-2', rating: 4.9, price: '₹5,000/night', category: 'Bedrooms', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Sea View'] },

  // Hostels
  { id: 7, name: 'Backpacker Haven Hostel', description: 'Affordable dormitory with shared facilities and lounge', location: 'Colaba, Mumbai', capacity: '8-40', rating: 4.3, price: '₹800/night', category: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Common Area'] },
  { id: 8, name: 'Urban Stay Hostel', description: 'Modern hostel with private pods and co-working space', location: 'Bandra, Mumbai', capacity: '10-50', rating: 4.4, price: '₹1,200/night', category: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Workspace'] },
  { id: 9, name: 'Traveler\'s Hub Hostel', description: 'Budget-friendly accommodation with rooftop cafe', location: 'Andheri, Mumbai', capacity: '12-60', rating: 4.2, price: '₹900/night', category: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Rooftop'] },
  { id: 10, name: 'Youth Hostel Mumbai', description: 'Clean dormitories with 24/7 security and kitchen', location: 'Juhu, Mumbai', capacity: '15-80', rating: 4.5, price: '₹1,000/night', category: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Kitchen'] },
  { id: 11, name: 'Beach Hostel Mumbai', description: 'Beachside hostel with ocean views and surfboard storage', location: 'Versova, Mumbai', capacity: '10-45', rating: 4.6, price: '₹1,100/night', category: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Beach Access'] },
  { id: 12, name: 'Artist\'s Hostel', description: 'Creative space for artists and digital nomads', location: 'Khar, Mumbai', capacity: '8-35', rating: 4.7, price: '₹1,300/night', category: 'Hostels', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Art Studio'] },

  // Hotels
  { id: 13, name: 'Grand Plaza Hotel', description: 'Luxury hotel with premium amenities and concierge', location: 'BKC, Mumbai', capacity: '2-4', rating: 4.8, price: '₹12,000/night', category: 'Hotels', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Parking', 'Pool'] },
  { id: 14, name: 'Business Suites Hotel', description: 'Corporate hotel with meeting rooms and restaurant', location: 'Lower Parel, Mumbai', capacity: '2-4', rating: 4.7, price: '₹10,000/night', category: 'Hotels', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Meeting Rooms'] },
  { id: 15, name: 'Boutique Stay Hotel', description: 'Stylish boutique rooms with personalized service', location: 'Colaba, Mumbai', capacity: '2-4', rating: 4.6, price: '₹9,000/night', category: 'Hotels', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant'] },
  { id: 16, name: 'Airport Transit Hotel', description: 'Convenient hotel near airport with shuttle service', location: 'Andheri, Mumbai', capacity: '2-4', rating: 4.5, price: '₹8,000/night', category: 'Hotels', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Shuttle'] },
  { id: 17, name: 'Heritage Palace Hotel', description: 'Colonial-era hotel with vintage charm and gardens', location: 'Fort, Mumbai', capacity: '2-4', rating: 4.9, price: '₹15,000/night', category: 'Hotels', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Gardens'] },
  { id: 18, name: 'Skyline Tower Hotel', description: 'Modern high-rise with rooftop pool and city views', location: 'Worli, Mumbai', capacity: '2-4', rating: 4.7, price: '₹11,000/night', category: 'Hotels', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Rooftop Pool'] },

  // Resorts
  { id: 19, name: 'Beach Paradise Resort', description: 'Beachfront property with water sports and spa', location: 'Alibaug', capacity: '2-200', rating: 4.9, price: '₹18,000/night', category: 'Resorts', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Spa', 'Beach'] },
  { id: 20, name: 'Mountain View Resort', description: 'Hill station retreat with adventure activities', location: 'Lonavala', capacity: '2-150', rating: 4.8, price: '₹16,000/night', category: 'Resorts', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Adventure'] },
  { id: 21, name: 'Wellness Spa Resort', description: 'Luxury wellness resort with yoga and treatments', location: 'Karjat', capacity: '2-100', rating: 4.9, price: '₹20,000/night', category: 'Resorts', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Yoga', 'Spa'] },
  { id: 22, name: 'Golf Course Resort', description: 'Premium resort with 18-hole golf course', location: 'Pune', capacity: '2-200', rating: 4.8, price: '₹22,000/night', category: 'Resorts', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Golf'] },
  { id: 23, name: 'Lake View Resort', description: 'Scenic lakeside resort with boating and camping', location: 'Pawna Lake', capacity: '2-120', rating: 4.7, price: '₹14,000/night', category: 'Resorts', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Boating'] },
  { id: 24, name: 'Forest Retreat Resort', description: 'Eco-friendly resort nestled in nature', location: 'Matheran', capacity: '2-80', rating: 4.8, price: '₹15,000/night', category: 'Resorts', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Nature'] },
];

export default function StayPage() {
  const navigate = useNavigate();
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<'Bedrooms' | 'Hostels' | 'Hotels' | 'Resorts'>('Bedrooms');
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const filteredStays = stays.filter((stay) => stay.category === selectedCategory);

  const stayCategoryMeta: Record<Stay['category'], { color: string }> = {
    Bedrooms: { color: '#7C3AED' },
    Hostels: { color: '#0EA5A4' },
    Hotels: { color: '#0369A1' },
    Resorts: { color: '#15803D' },
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
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

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={false} 
        activeNav="activity"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader variant="blended" searchPlaceholder="Search stays..." />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-[1280px] mx-auto px-6 py-3">
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
                <span className="font-semibold tracking-tight text-[#0e1e3f]">Stay</span>
              </div>
            </div>
          </div>

          {/* Page Title and Tabs */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-[1280px] mx-auto px-6 py-2">
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
                        d={svgPathsSpaceX.p30609c00}
                        fill="#7C3AED"
                      />
                    </svg>
                    Stay
                  </button>
                  <button
                    onClick={() => navigate("/promotions")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
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
          <div className="max-w-[1280px] mx-auto px-6 pt-5">
            <div className="group relative mb-6 h-[200px] overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-[0_18px_40px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <div
                className="relative min-w-full h-[200px]"
                style={{
                  background:
                    "linear-gradient(135deg, #FA8D40 0%, #FF6B9D 50%, #8B5CF6 100%)",
                }}
              >
                {/* Background Pattern */}
                <div className="absolute flex h-full items-center justify-center right-0 top-0 w-1/2 mix-blend-soft-light overflow-hidden">
                  <div className="transform rotate-180 scale-y-[-1] h-full">
                    <img
                      src={imgImage24995}
                      alt=""
                      className="h-full w-auto object-cover opacity-20"
                    />
                  </div>
                </div>

                <div className="relative flex h-full items-center px-8 py-7 sm:px-10">
                  <div className="max-w-2xl">
                    {/* Vendor Badge */}
                    <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
                      <svg
                        width="14"
                        height="14"
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
                      <span className="text-[10px] font-semibold text-[#0e1e3f] uppercase tracking-wide">
                        Mogzu Stays
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="mb-1.5 text-[24px] font-bold leading-tight text-white drop-shadow-md">
                      Extended Stay Packages - Save 25%
                    </h3>
                    
                    {/* Description */}
                    <p className="mb-4 max-w-xl text-[14px] leading-[1.6] text-white/90 line-clamp-2 drop-shadow-sm">
                      Book accommodations for 7+ nights and get exclusive 25% discount on all stay categories. Perfect for team offsites, training programs, and extended workshops. Includes complimentary breakfast!
                    </p>
                    
                    {/* CTA Button */}
                    <button className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                      <span>View Offer</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="max-w-[1280px] mx-auto mb-5 px-6 py-1">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setSelectedCategory('Bedrooms')}
                className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                  selectedCategory === 'Bedrooms'
                    ? 'border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={
                  selectedCategory === 'Bedrooms'
                    ? {
                        backgroundImage:
                          "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                      }
                    : undefined
                }
              >
                <BedDouble className="w-4 h-4" color={stayCategoryMeta.Bedrooms.color} strokeWidth={2.2} />
                <span className="text-[14px] font-medium">Bedrooms</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Hostels')}
                className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                  selectedCategory === 'Hostels'
                    ? 'border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={
                  selectedCategory === 'Hostels'
                    ? {
                        backgroundImage:
                          "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                      }
                    : undefined
                }
              >
                <Home className="w-4 h-4" color={stayCategoryMeta.Hostels.color} strokeWidth={2.2} />
                <span className="text-[14px] font-medium">Hostels</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Hotels')}
                className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                  selectedCategory === 'Hotels'
                    ? 'border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={
                  selectedCategory === 'Hotels'
                    ? {
                        backgroundImage:
                          "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                      }
                    : undefined
                }
              >
                <Building2 className="w-4 h-4" color={stayCategoryMeta.Hotels.color} strokeWidth={2.2} />
                <span className="text-[14px] font-medium">Hotels</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Resorts')}
                className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                  selectedCategory === 'Resorts'
                    ? 'border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                    : 'border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]'
                }`}
                style={
                  selectedCategory === 'Resorts'
                    ? {
                        backgroundImage:
                          "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                      }
                    : undefined
                }
              >
                <TreePine className="w-4 h-4" color={stayCategoryMeta.Resorts.color} strokeWidth={2.2} />
                <span className="text-[14px] font-medium">Resorts</span>
              </button>
            </div>
          </div>

          {/* Main Content - Filters and Listings */}
          <div className="max-w-[1280px] mx-auto flex flex-col gap-4 px-4 pb-6 sm:px-6 lg:flex-row">
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
                      setPriceRange({ min: '', max: '' });
                      setSelectedRating(null);
                      setSelectedAmenities([]);
                      setGuestCount('');
                      setCheckInDate('');
                      setCheckOutDate('');
                    }}
                    className="text-[13px] font-medium text-[#4379ee] hover:text-[#3568dd]"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-5 border-t border-slate-200/70 pt-3">
                  {/* Location Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-[#878e9e]" />
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Location
                      </h4>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Bandra, Mumbai"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>

                  {/* Price Range Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Price Range (₹/night)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr]">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                      />
                      <span className="text-xs text-[#878e9e] flex items-center">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Star className="w-3.5 h-3.5 text-[#878e9e]" />
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Minimum Rating
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <label key={rating} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === rating}
                            onChange={() => setSelectedRating(rating)}
                            className="mt-0.5 h-3.5 w-3.5 border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="flex items-center gap-1 text-sm leading-5 text-[#0e1e3f]">
                            {rating}+ <Star className="h-[14px] w-[14px] fill-yellow-400 text-yellow-400" />
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4m0 4v2a4 4 0 008 0v-2m-4 0h4a4 4 0 000-8h-4a4 4 0 000 8zm0 0h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2a2 2 0 012-2zm-4 0h4a2 2 0 002 2v2a2 2 0 00-2 2h-4a2 2 0 000-8zm0 0h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2a2 2 0 012-2z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Amenities
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {['WiFi', 'Parking', 'AC', 'Garden', 'Common Area', 'Workspace', 'Rooftop', 'Kitchen', 'Beach Access', 'Art Studio', 'Pool', 'Meeting Rooms', 'Restaurant', 'Shuttle', 'Spa', 'Adventure', 'Yoga', 'Nature'].map((amenity) => (
                        <label key={amenity} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-[#4379ee] focus:ring-[#4379ee]"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#0e1e3f]">
                            {amenity}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Guest Count Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Users className="w-3.5 h-3.5 text-[#878e9e]" />
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Guest Count
                      </h4>
                    </div>
                    <input
                      type="number"
                      placeholder="e.g., 2"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>

                  {/* Check-in Date Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Check-in Date
                      </h4>
                    </div>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>

                  {/* Check-out Date Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Check-out Date
                      </h4>
                    </div>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>
                  <p className="mt-4 w-full rounded-xl border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] leading-5 text-[#475569]">
                    Filters apply instantly. Refine location, dates, and stay amenities to narrow results quickly.
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
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="number"
                    placeholder="Guests"
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white pl-10 pr-3 text-[14px] text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  />
                </div>
                <input
                  type="date"
                  className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
                <input
                  type="date"
                  className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {filteredStays.map((stay) => {
                  const cardId = String(stay.id)
                  const slideImages = getListingSlideImages(
                    stay.image,
                    buildUnsplashKeywordImage(`${stay.category} stay ${stay.location}`),
                    buildUnsplashKeywordImage(`${stay.name} hotel room`),
                    imgImage24995,
                  )
                  const activeIndex = cardImageIndexById[cardId] ?? 0
                  const activeImage = slideImages[activeIndex] || imgImage24995
                  const priceDisplay = getPriceDisplayParts(stay.price)

                  return (
                  <div
                    key={stay.id}
                    className="group flex min-h-[380px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)]"
                  >
                    <div className="relative h-44 sm:h-48">
                      <ImageWithFallback
                        src={activeImage}
                        alt={stay.name || "Stay"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {slideImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Previous image for ${stay.name}`}
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
                            aria-label={`Next image for ${stay.name}`}
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
                                key={`${stay.id}-${dotIdx}`}
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
                            {stay.rating}
                          </div>
                          <div className="rounded-md bg-[#4379ee] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(15,23,42,0.16)]">
                            {stay.category}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-[14px]">
                      <h3 className="mb-1 line-clamp-1 text-[15px] font-semibold leading-tight text-[#0e1e3f]">
                        {stay.name || "Stay option"}
                      </h3>
                      <p className="mb-2.5 line-clamp-2 text-[12px] text-[#878e9e]">
                        {stay.description || "Comfortable stay curated for teams and corporate travel."}
                      </p>
                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        {stay.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={`${stay.id}-${amenity}`}
                            className="rounded-md bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#fa8d40]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <div className="mb-1.5 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{stay.location || "Location on request"}</span>
                      </div>
                      <div className="mb-3 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{stay.capacity || "Capacity on request"}</span>
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
                        <button className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-5 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]">
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              {filteredStays.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0e1e3f]">No stays found</h3>
                  <p className="mb-4 text-sm text-[#878e9e]">Try adjusting filters to see more options.</p>
                </div>
              ) : null}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
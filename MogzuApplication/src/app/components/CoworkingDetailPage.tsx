import { useNavigate, useParams } from 'react-router';
import { ChevronRight, MapPin, Users, Star, Wifi, Coffee, Printer, Car, Video, Phone, Mail, Shield, Calendar, Clock, Share2, Check } from 'lucide-react';
import { WishlistHeart } from './global/WishlistHeart';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import svgPaths from '@/imports/svg-camfkj9vq4';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgMogzuM from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useState } from 'react';

interface CoworkingDetail {
  id: string;
  name: string;
  location: string;
  city: string;
  rating: number;
  reviews: number;
  images: string[];
  capacity: string;
  price: number;
  priceUnit: string;
  description: string;
  amenities: Array<{
    name: string;
    icon: string;
  }>;
  type: string;
  availableFrom: string;
  operatingHours: string;
  contactPerson: {
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  policies: string[];
  features: string[];
  nearbyTransport: string[];
}

const mockCoworkingDetail: CoworkingDetail = {
  id: '1',
  name: 'WeWork BKC',
  location: 'Bandra Kurla Complex, C-20, G Block',
  city: 'Mumbai',
  rating: 4.8,
  reviews: 245,
  images: [
    'modern coworking space open desks',
    'coworking cafe lounge area',
    'private office cabin workspace',
    'meeting room coworking space'
  ],
  capacity: '1-50',
  price: 8000,
  priceUnit: 'month',
  description: 'WeWork BKC offers a premium coworking experience in Mumbai\'s business hub. Our flexible workspace features hot desks, dedicated desks, and private offices perfect for freelancers, startups, and enterprises. Join a vibrant community of innovators, enjoy high-speed internet, complimentary refreshments, and access to modern meeting rooms. With 24/7 access, regular networking events, and a professional atmosphere, WeWork BKC is designed to help you work smarter and grow faster.',
  amenities: [
    { name: 'High-Speed WiFi (100 Mbps)', icon: 'wifi' },
    { name: 'Meeting Rooms', icon: 'video' },
    { name: 'Unlimited Coffee & Tea', icon: 'coffee' },
    { name: 'Secure Parking', icon: 'car' },
    { name: 'Printer & Scanner', icon: 'printer' },
    { name: '24/7 Access', icon: 'clock' },
    { name: 'Phone Booths', icon: 'phone' },
    { name: 'Security & Reception', icon: 'shield' }
  ],
  type: 'Dedicated Desk',
  availableFrom: 'Immediate',
  operatingHours: '24/7 Access',
  contactPerson: {
    name: 'Rahul Mehta',
    role: 'Community Manager',
    phone: '+91 98765 43210',
    email: 'rahul.mehta@wework.com'
  },
  policies: [
    'Professional behavior expected at all times',
    'Guest policy: Maximum 2 guests per member per day',
    'Business casual dress code recommended',
    'Keep noise levels minimal in quiet zones',
    'Clean desk policy - keep your workspace tidy',
    'No outside food in meeting rooms',
    'Book meeting rooms in advance through app'
  ],
  features: [
    'Ergonomic Chairs & Desks',
    'Natural Lighting',
    'Climate Control AC',
    'Backup Power Supply',
    'Filtered Water Dispenser',
    'Free Tea & Coffee',
    'Community Events',
    'Networking Sessions',
    'Breakout Areas',
    'Mail Handling Service',
    'IT Support',
    'Daily Housekeeping',
    'Locker Facility',
    'High-Speed Elevators',
    'Bike Parking',
    'Wellness Room'
  ],
  nearbyTransport: [
    'BKC Metro Station - 5 min walk',
    'Kurla Railway Station - 15 min drive',
    'Mumbai International Airport - 30 min drive',
    'Multiple bus stops within 200m'
  ]
};

export default function CoworkingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const space = mockCoworkingDetail;

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'wifi':
        return <Wifi className="w-5 h-5" />;
      case 'coffee':
        return <Coffee className="w-5 h-5" />;
      case 'printer':
        return <Printer className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'clock':
        return <Clock className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const [selectedTab, setSelectedTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'policies', label: 'T&C / Policies' },
    { id: 'payment', label: 'Payment' },
  ];

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="dashboard"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Dashboard
              </button>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <button
                type="button"
                onClick={() => navigate('/coworking')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Coworking Spaces
              </button>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <span className="text-[#878e9e] break-words min-w-0">{space.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Section - Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-[#ececec]">
                  <div className="p-6 border-b border-[#ececec]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-[#4379ee] text-white rounded-full text-xs font-semibold">
                            {space.type}
                          </span>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-[#FFCC47] text-[#FFCC47]" />
                            <span className="font-semibold text-[#0e1e3f]">{space.rating} ({space.reviews})</span>
                          </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[#0e1e3f] mb-2">
                          {space.name}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-[#878e9e]">
                          <MapPin className="w-4 h-4" />
                          {space.location}, {space.city}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <WishlistHeart
                          listingId={String(id ?? space.id)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-100 text-[#878e9e] hover:bg-gray-200"
                        />
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
                        {shareFeedback}
                      </p>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-[#ececec]">
                    <div className="flex gap-6 px-6 overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          type="button"
                          key={tab.id}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-6 border-b border-[#ececec]">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Users className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Capacity</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{space.capacity}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Available</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{space.availableFrom}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Clock className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Hours</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{space.operatingHours}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-3">About this space</h2>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            {space.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'amenities' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Amenities</h2>
                          <div className="grid grid-cols-2 gap-4">
                            {space.amenities.map((amenity, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center text-[#4379ee]">
                                  {getAmenityIcon(amenity.icon)}
                                </div>
                                <span className="text-sm text-[#475569]">{amenity.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#ececec]">
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Features & Services</h2>
                          <div className="grid grid-cols-2 gap-3">
                            {space.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-[#475569]">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'portfolio' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Gallery</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {space.images.map((img, item) => (
                            <div key={item} className="h-48 rounded-lg overflow-hidden relative group">
                              <ImageWithFallback
                                src={`https://source.unsplash.com/600x400/?${encodeURIComponent(img)}`}
                                alt={`${space.name} — gallery photo ${item + 1} of ${space.images.length}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'policies' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">House Rules</h2>
                          <div className="space-y-2">
                            {space.policies.map((policy, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Shield className="w-5 h-5 text-[#fa8d40] flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-[#0e1e3f]">{policy}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}



                    {selectedTab === 'payment' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Payment Terms</h2>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-0.5">•</span>
                            <span>Monthly memberships billed on the 1st of each month</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-0.5">•</span>
                            <span>2 months security deposit required for private offices</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Booking Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-[#ececec] p-6 sticky top-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
                  <div className="mb-6">
                    <p className="text-sm text-[#878e9e] mb-1">Starting at</p>
                    <p className="text-3xl font-bold text-[#0e1e3f]">₹{space.price.toLocaleString()}<span className="text-lg text-[#878e9e] font-normal">/{space.priceUnit}</span></p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/request-to-book')}
                    className="w-full py-3 bg-[#2563eb] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors mb-3"
                  >
                    Request to Book
                  </button>
                  <button type="button" className="w-full py-3 bg-white border border-[#2563eb] text-[#2563eb] font-medium rounded-lg hover:bg-[#ebf1ff] transition-colors mb-6">
                    Schedule a Tour
                  </button>

                  <div className="pt-6 border-t border-[#ececec]">
                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-[#0e1e3f]">{space.contactPerson.name}</p>
                        <p className="text-xs text-[#878e9e]">{space.contactPerson.role}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#475569]">
                        <Phone className="w-4 h-4 text-[#878e9e]" />
                        <span>{space.contactPerson.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#475569]">
                        <Mail className="w-4 h-4 text-[#878e9e]" />
                        <span className="text-xs">{space.contactPerson.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#ececec]">
                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-4">Nearby Transport</h3>
                    <ul className="space-y-3">
                      {space.nearbyTransport.map((transport, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#475569]">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#878e9e]" />
                          <span>{transport}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ChevronDown, ChevronLeft, Bell, HelpCircle, ShoppingCart, Star, Phone, Mail, Info, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { WishlistHeart } from './global/WishlistHeart';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { PricingBlock, PricingMode } from './ui/PricingBlock';

interface ResponseStatusBannerProps {
  status: 'awaiting' | 'best_offer' | 'accepted' | 'declined';
  comment?: string;
  productId?: number;
}

function ResponseStatusBanner({ status, comment, productId }: ResponseStatusBannerProps) {
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
              navigate('/booking-payment', {
                state: { source: 'product-booking-new', productId, acceptedOffer: true },
              });
              return;
            }
            if (status === 'declined') {
              navigate('/gifting-shop');
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
import svgPaths from '@/imports/svg-a80j978jey';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgVendorAvatar from 'figma:asset/7bcd959136aa61a068368faa607954cce703cb3a.png';
import { apparelProducts, getRelatedProducts } from '../data/apparelProducts';
import RelatedProducts from './RelatedProducts';
import svgPathsDashboard from '@/imports/svg-camfkj9vq4';

interface ProductDetails {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  images: string[];
  minQty: { tier1: number; tier2: number; tier3: number };
  pricePerUnit: { tier1: number; tier2: number; tier3: number };
  colors: { name: string; hex: string }[];
  specifications: {
    materialComposition: string;
    pattern: string;
    fitType: string;
    sleeveType: string;
    collarStyle: string;
    length: string;
    countryOfOrigin: string;
  };
  additionalInfo: string[];
}

export default function ProductBookingPage() {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNav, setSelectedNav] = useState('activity');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState('description');
  const [zipCode, setZipCode] = useState('');
  const [vendorNotice, setVendorNotice] = useState('');
  const [cardNotice, setCardNotice] = useState('');
  const [deliveryNotice, setDeliveryNotice] = useState('');
  const [gridUiNotice, setGridUiNotice] = useState<string | null>(null);
  const [specNotice, setSpecNotice] = useState('');
  const [reviewsNotice, setReviewsNotice] = useState('');

  // Size quantities
  const [sizeQuantities, setSizeQuantities] = useState({
    XS: 0,
    Small: 0,
    Medium: 0,
    Large: 0,
    XL: 0,
    '2XL': 0,
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'p2ab88b80' },
    { id: 'activity', label: 'Activity Suite', icon: 'p414b380' },
    { id: 'bookings', label: 'Bookings', icon: 'paf72c00' },
    { id: 'favorites', label: 'Favorites', icon: 'p27070280' },
    { id: 'users', label: 'Users', icon: 'p29193540' },
    { id: 'notification', label: 'Notification', icon: 'p3e2aee80' },
    { id: 'communication', label: 'Communication', icon: 'p319d300' },
    { id: 'report', label: 'Report', icon: 'p1f81a280' },
    { id: 'transactions', label: 'Transactions', icon: 'p2683f80' },
    { id: 'settings', label: 'Settings', icon: 'p32caf6b0' },
  ];

  const product: ProductDetails = {
    id: 1,
    name: 'Printed Round Neck Cotton Blend Black T-Shirt',
    brand: 'Rodlen',
    price: 300,
    rating: 4.7,
    reviews: 128,
    description: `This Bella + Canvas Unisex Poly-Cotton Short-Sleeve T-Shirt is a must have for everyone's closets. With a retail fit, super soft cotton/polyester jersey blend, and a subtle but strong reminder to stay humble and kind — this tee is nothing short of perfect.

BELLA+CANVAS also uses sustainable manufacturing processes with Blue Sign certified dyes, efficient dye houses that adhere to the state of California's EPA regulations around waste water treatment and usage, and cutting facilities in Los Angeles that run on partial solar power with comprehensive recycling and fabric scrap programs.`,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHRzaGlydCUyMGdyYXBoaWN8ZW58MXx8fHwxNzM5MzgwNzk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx0c2hpcnQlMjBkZXRhaWx8ZW58MXx8fHwxNzcwNjQyODIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxibGFjayUyMHRzaGlydHxlbnwxfHx8fDE3MzkzODA4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    minQty: { tier1: 25, tier2: 50, tier3: 100 },
    pricePerUnit: { tier1: 600, tier2: 380, tier3: 300 },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#2563eb' },
      { name: 'Navy', hex: '#1e3a8a' },
    ],
    specifications: {
      materialComposition: 'Cotton',
      pattern: 'Graphic',
      fitType: 'Relaxed Fit',
      sleeveType: 'Half Sleeve',
      collarStyle: 'Collarless',
      length: 'Standard Length',
      countryOfOrigin: 'India',
    },
    additionalInfo: [
      'Fit Description: Boyfriend fit – Overall Loose fit on Body',
      'Print Type: Graphic Print',
      'Fabric Description: Single Jersey, 100% Cotton Classic, Mid-weight jersey fabric comprising 100% cotton',
      'Neck: Round Neck',
      'Style: Wear this T-shirt with your favorite jeans and sneakers for a comfortable casual outfit',
      'Item dimensions: 30 × 25 × 3 Centimeters',
    ],
  };

  const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);

  const handleSizeQuantityChange = (size: string, value: number) => {
    setSizeQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, value),
    }));
  };

  return (
    <div className="flex min-h-screen h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar Navigation */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search " />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb */}
          <div className="bg-white border-b border-[#ececec]">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-[#4379ee] hover:underline"
                >
                  Activity Suite
                </button>
                <ChevronDown className="w-4 h-4 text-[#878e9e] rotate-[-90deg]" />
                <button type="button" onClick={() => navigate('/gifting')} className="text-[#4379ee] hover:underline">
                  Gifting
                </button>
                <ChevronDown className="w-4 h-4 text-[#878e9e] rotate-[-90deg]" />
                <button
                  type="button"
                  onClick={() => navigate('/gifting-shop')}
                  className="text-[#4379ee] hover:underline"
                >
                  Shop
                </button>
                <ChevronDown className="w-4 h-4 text-[#878e9e] rotate-[-90deg]" />
                <span className="text-[#0e1e3f]">Apparel</span>
                <ChevronDown className="w-4 h-4 text-[#878e9e] rotate-[-90deg]" />
                <span className="text-[#878e9e]">Rodlen</span>
              </div>
            </div>
          </div>

          {/* Product Content - This is the reorganized section */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            {gridUiNotice ? (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {gridUiNotice}
              </p>
            ) : null}
            {/* Product Overview - Better organized 2-column layout */}
            <div className="grid grid-cols-[1fr_400px] gap-6 mb-6">
              {/* Left Column - Product visuals and details */}
              <div className="space-y-6">
                {/* Image Gallery Card */}
                <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Thumbnails */}
                      <div className="flex flex-col gap-3">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`View product image ${index + 1}`}
                            onClick={() => setSelectedImage(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden transition-all border-2 flex-shrink-0 ${
                              selectedImage === index ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20' : 'border-[#e5e7eb]'
                            }`}
                          >
                            <img src={image} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      {/* Main Image */}
                      <div className="flex-1 bg-[#f9fafb] rounded-xl overflow-hidden">
                        <img
                          src={product.images[selectedImage]}
                          alt={product.name}
                          className="w-full h-[500px] object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info Card */}
                <div className="bg-white rounded-xl border border-[#ececec] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-[#ebf1ff] text-[#2563eb] text-sm font-semibold rounded-lg">
                          {product.brand}
                        </span>
                        <span className="px-3 py-1 bg-[#dcfce7] text-[#16a34a] text-sm font-semibold rounded-lg flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Vendor
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-[#0e1e3f] mb-2 leading-tight">{product.name}</h1>
                      <p className="text-sm text-[#64748b]">Customizable with your company logo and branding options</p>
                    </div>
                    <WishlistHeart
                      listingId={String(product.id)}
                      className="p-2.5 hover:bg-[#f1f5f9] rounded-lg transition-colors"
                    />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 pb-6 border-b border-[#ececec]">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="18" height="18" viewBox="0 0 32 32" fill="none">
                          <path d={svgPaths.p1f20c3c0} fill={i < Math.floor(product.rating) ? '#FFCC47' : '#e5e7eb'} />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-[#0e1e3f]">{product.rating}/5.0</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTab('reviews')}
                      className="text-sm text-[#2563eb] font-medium underline hover:no-underline"
                    >
                      ({product.reviews} customer reviews)
                    </button>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-4 gap-3 py-6 border-b border-[#ececec]">
                    <div className="text-center p-4 bg-[#f9fafb] rounded-xl">
                      <div className="text-3xl mb-2">📦</div>
                      <p className="text-xs text-[#64748b] mb-1">Min Order</p>
                      <p className="text-base font-bold text-[#0e1e3f]">{product.minQty.tier1}</p>
                      <p className="text-xs text-[#64748b]">pieces</p>
                    </div>
                    <div className="text-center p-4 bg-[#f9fafb] rounded-xl">
                      <div className="text-3xl mb-2">🚚</div>
                      <p className="text-xs text-[#64748b] mb-1">Delivery</p>
                      <p className="text-base font-bold text-[#0e1e3f]">7-10</p>
                      <p className="text-xs text-[#64748b]">days</p>
                    </div>
                    <div className="text-center p-4 bg-[#f9fafb] rounded-xl">
                      <div className="text-3xl mb-2">🎨</div>
                      <p className="text-xs text-[#64748b] mb-1">Colors</p>
                      <p className="text-base font-bold text-[#0e1e3f]">{product.colors.length}</p>
                      <p className="text-xs text-[#64748b]">options</p>
                    </div>
                    <div className="text-center p-4 bg-[#f9fafb] rounded-xl">
                      <div className="text-3xl mb-2">✨</div>
                      <p className="text-xs text-[#64748b] mb-1">Custom</p>
                      <p className="text-base font-bold text-[#0e1e3f]">Logo</p>
                      <p className="text-xs text-[#64748b]">available</p>
                    </div>
                  </div>

                  {/* Product Options */}
                  <div className="space-y-6 pt-6">
                    {/* Color Selection */}
                    <div>
                      <label className="text-sm font-bold text-[#0e1e3f] mb-3 block">
                        Select Color
                        <span className="ml-2 text-[#64748b] font-normal text-sm">
                          ({product.colors[selectedColor].name} selected)
                        </span>
                      </label>
                      <div className="flex gap-3">
                        {product.colors.map((color, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedColor(index)}
                            className={`w-16 h-16 rounded-xl border-2 transition-all hover:scale-105 ${
                              selectedColor === index
                                ? 'border-[#2563eb] ring-4 ring-[#2563eb]/20 scale-105'
                                : 'border-[#e5e7eb] hover:border-[#2563eb]/50'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {selectedColor === index && (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Helpful Info */}
                    <div className="bg-[#ebf1ff] border-2 border-[#2563eb]/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0e1e3f] mb-1">🎯 Corporate Bulk Ordering Made Easy</p>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            Available in all sizes from XS to 5XL. You'll specify size quantities and customization details in the next step.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Sticky pricing and action panel */}
              <div className="space-y-4">
                {/* Pricing Card - Sticky */}
                <div className="bg-white rounded-xl border-2 border-[#ececec] overflow-hidden sticky top-6">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-6 py-4">
                    <p className="text-sm text-blue-100 mb-1">Corporate Pricing</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">₹{product.price}</span>
                      <span className="text-lg text-blue-100">/piece</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* New Pricing & Status Section */}
                    <div className="flex flex-col gap-3">
                      <PricingBlock
                        mode="negotiable"
                        price={`₹${product.price}`}
                        priceUnit="/piece"
                        onSubmitOffer={(offer, message) => {
                          setVendorNotice(
                            `Offer of ₹${offer} submitted${message.trim() ? ' with your note.' : '.'} The vendor will review it.`,
                          );
                        }}
                        onCheckAvailability={() => {
                          setVendorNotice('Checking availability with the vendor…');
                          window.setTimeout(() => {
                            setVendorNotice(
                              'Availability check sent. Watch the response status below for updates.',
                            );
                          }, 1200);
                        }}
                      />
                      {vendorNotice && (
                        <p className="text-xs text-[#0e1e3f] bg-[#f0f9ff] border border-[#2563eb]/20 rounded-lg px-3 py-2">
                          {vendorNotice}
                        </p>
                      )}

                      <div className="space-y-3">
                        <ResponseStatusBanner 
                          status="awaiting" 
                        />
                        <ResponseStatusBanner 
                          status="best_offer" 
                          comment="Thank you for your inquiry! We've prepared our best corporate offer based on your volume requirements. This offer is valid for 48 hours."
                        />
                        <ResponseStatusBanner 
                          status="accepted" 
                          comment="Your offer of ₹280 per piece has been accepted. We look forward to fulfilling this order for your corporate event."
                        />
                        <ResponseStatusBanner 
                          status="declined" 
                          comment="We appreciate your offer, but we are unable to meet that price point for the specified volume at this time. Please see our alternatives or adjust the quantity for better pricing."
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#ececec]">
                      <h4 className="text-sm font-bold text-[#0e1e3f] mb-3 flex items-center gap-2">
                        <span>📊</span>
                        Choose size quantities
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {Object.entries(sizeQuantities).map(([size, qty]) => (
                          <div key={size} className="space-y-1">
                            <label className="text-[10px] text-[#64748b] font-bold uppercase">{size}</label>
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => handleSizeQuantityChange(size, parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-[#e5e7eb] rounded-lg text-xs text-[#0e1e3f] focus:outline-none focus:border-[#2563eb]"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
                        <span className="text-xs font-bold text-[#64748b]">Total Quantity</span>
                        <span className="text-sm font-bold text-[#2563eb]">{totalQuantity} units</span>
                      </div>
                    </div>

                    {/* Save Badge */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#dcfce7] border border-[#16a34a]/30 rounded-xl">
                      <svg className="w-5 h-5 text-[#16a34a] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-[#16a34a]">Save up to 50% on bulk orders</span>
                    </div>

                    {/* Volume Pricing */}
                    <div>
                      <h4 className="text-sm font-bold text-[#0e1e3f] mb-3 flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        Volume Discount Tiers
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-[#f9fafb] rounded-lg">
                          <span className="text-sm text-[#64748b] font-medium">{product.minQty.tier1}-{product.minQty.tier2 - 1} units</span>
                          <span className="text-sm font-bold text-[#0e1e3f]">₹{product.pricePerUnit.tier1}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#dcfce7] rounded-lg">
                          <span className="text-sm text-[#16a34a] font-medium">{product.minQty.tier2}-{product.minQty.tier3 - 1} units</span>
                          <span className="text-sm font-bold text-[#16a34a]">₹{product.pricePerUnit.tier2} ↓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#ebf1ff] rounded-lg">
                          <span className="text-sm text-[#2563eb] font-medium">{product.minQty.tier3}+ units</span>
                          <span className="text-sm font-bold text-[#2563eb]">₹{product.pricePerUnit.tier3} ↓↓</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCardNotice(
                            'Custom quote: we will open a guided flow here. Use Request Quote below to message the vendor now.',
                          )
                        }
                        className="w-full mt-3 text-sm text-[#2563eb] font-semibold hover:underline flex items-center justify-center gap-1"
                      >
                        Need 500+ units? Request custom quote →
                      </button>
                    </div>

                    {/* Delivery Check */}
                    <div className="pt-6 border-t border-[#ececec]">
                      <label className="text-sm font-bold text-[#0e1e3f] mb-3 block flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        Check Delivery
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter PIN code"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="flex-1 px-4 py-2.5 border-2 border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const pin = zipCode.trim();
                            if (!pin) {
                              setDeliveryNotice('Please enter a PIN code to check delivery.');
                              return;
                            }
                            setDeliveryNotice(`Checking delivery for PIN ${pin}…`);
                            window.setTimeout(() => {
                              setDeliveryNotice(
                                `Delivery to ${pin} is usually 7–10 business days for this SKU. Final dates are confirmed at checkout.`,
                              );
                            }, 900);
                          }}
                          className="px-5 py-2.5 bg-[#f1f5f9] text-[#0e1e3f] rounded-lg text-sm font-semibold hover:bg-[#e2e8f0] transition-colors"
                        >
                          Check
                        </button>
                      </div>
                      {deliveryNotice && (
                        <p className="text-xs text-[#475569] mt-2" role="status">
                          {deliveryNotice}
                        </p>
                      )}
                    </div>

                    {/* CTAs */}
                    <div className="space-y-3 pt-6 border-t border-[#ececec]">
                      <button
                        type="button"
                        onClick={() => navigate('/booking-flow')}
                        className="w-full px-6 py-4 bg-[#2563eb] text-white rounded-xl text-base font-bold hover:bg-[#1d4ed8] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Start Bulk Order
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/communication', {
                            state: {
                              source: 'product-booking-new',
                              vendor: 'vendor',
                              channel: 'pre-enquiry-message',
                              action: 'request-quote',
                            },
                          })
                        }
                        className="w-full px-6 py-3.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-xl text-base font-bold hover:bg-[#ebf1ff] transition-colors flex items-center justify-center gap-2"
                      >
                        💬 Request Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardNotice('Saved for later. Open this listing again from your workspace when you are ready.')}
                        className="w-full px-6 py-3 bg-white border border-[#ececec] text-[#0e1e3f] rounded-xl text-sm font-semibold hover:bg-[#f9fafb] transition-colors"
                      >
                        Save for Later
                      </button>
                      {cardNotice && (
                        <p className="text-xs text-[#475569] text-center pt-1" role="status">
                          {cardNotice}
                        </p>
                      )}
                    </div>

                    {/* Trust Signals */}
                    <div className="pt-6 border-t border-[#ececec] space-y-3">
                      {[
                        { icon: '✓', text: '100% Quality Guaranteed', color: 'text-[#16a34a]' },
                        { icon: '👤', text: 'Dedicated Account Manager', color: 'text-[#2563eb]' },
                        { icon: '💳', text: 'Flexible Payment Terms', color: 'text-[#8b5cf6]' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                            <span className={`text-sm font-bold ${item.color}`}>{item.icon}</span>
                          </div>
                          <span className="text-sm text-[#475569]">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Vendor Card */}
                <div className="bg-white rounded-xl border border-[#ececec] p-5">
                  <h4 className="text-sm font-bold text-[#0e1e3f] mb-4 flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    Need Help?
                  </h4>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-[#f9fafb] rounded-lg">
                    <img src={imgVendorAvatar} alt="Vendor" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0e1e3f]">Michiel</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                        <span className="text-xs text-[#16a34a] font-medium">Online Now</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/communication', {
                          state: {
                            source: 'product-booking-new',
                            vendor: 'vendor',
                            channel: 'callback',
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-[#f1f5f9] text-[#0e1e3f] rounded-lg text-sm font-semibold hover:bg-[#e2e8f0] transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      +91-9876254321
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/communication', {
                          state: {
                            source: 'product-booking-new',
                            vendor: 'vendor',
                            channel: 'email',
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-[#f1f5f9] text-[#0e1e3f] rounded-lg text-sm font-semibold hover:bg-[#e2e8f0] transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section - Reorganized for better UX */}
            <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden mb-6">
              {/* Tab Navigation */}
              <div className="flex gap-1 border-b-2 border-[#ececec] px-6 bg-[#f9fafb]">
                {[
                  { id: 'description', label: '📄 Description', icon: '📄' },
                  { id: 'specifications', label: '🔧 Specifications', icon: '🔧' },
                  { id: 'reviews', label: '⭐ Reviews', icon: '⭐' },
                  { id: 'vendor', label: '🏢 Vendor Info', icon: '🏢' },
                  { id: 'payment', label: '💳 Payment Terms', icon: '💳' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                      selectedTab === tab.id
                        ? 'text-[#2563eb] bg-white'
                        : 'text-[#64748b] hover:text-[#0e1e3f]'
                    }`}
                  >
                    {tab.label}
                    {selectedTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2563eb] rounded-t-lg" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {selectedTab === 'description' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-[#0e1e3f] mb-4 flex items-center gap-3">
                      <span>📄</span>
                      Product Description
                    </h3>
                    <p className="text-base text-[#475569] leading-relaxed mb-8 whitespace-pre-line">
                      {product.description}
                    </p>

                    <h4 className="text-xl font-bold text-[#0e1e3f] mb-4 flex items-center gap-2">
                      <span>✨</span>
                      Key Features
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {product.additionalInfo.map((info, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-[#f9fafb] rounded-xl hover:bg-[#f1f5f9] transition-colors">
                          <svg className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-[#475569] leading-relaxed">{info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'specifications' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-[#0e1e3f] mb-6 flex items-center gap-3">
                      <span>🔧</span>
                      Technical Specifications
                    </h3>
                    <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
                      {Object.entries(product.specifications).map(([key, value], index) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between p-4 ${
                            index % 2 === 0 ? 'bg-[#f9fafb]' : 'bg-white'
                          }`}
                        >
                          <span className="text-sm font-semibold text-[#64748b] capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-bold text-[#0e1e3f]">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Size Chart CTA */}
                    <div className="mt-8 p-6 bg-[#ebf1ff] border-2 border-[#2563eb]/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#2563eb] flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-base font-bold text-[#0e1e3f] mb-1">📏 Need sizing help?</p>
                            <p className="text-sm text-[#475569]">View our detailed size chart and measurement guide</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSpecNotice('Size chart and measurement guide will open here in a full modal.')
                          }
                          className="px-6 py-3 bg-[#2563eb] text-white rounded-xl text-sm font-bold hover:bg-[#1d4ed8] shadow-lg hover:shadow-xl transition-all"
                        >
                          View Size Chart →
                        </button>
                      </div>
                      {specNotice && (
                        <p className="text-xs text-[#1e40af] mt-3 text-center" role="status">
                          {specNotice}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div className="grid grid-cols-[1fr_380px] gap-8">
                    <div>
                      {reviewsNotice && (
                        <p className="text-sm text-[#475569] mb-4 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg" role="status">
                          {reviewsNotice}
                        </p>
                      )}
                      <h3 className="text-2xl font-bold text-[#0e1e3f] mb-6 flex items-center gap-3">
                        <span>⭐</span>
                        Customer Reviews
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          {
                            name: 'Priya Sharma',
                            date: 'January 15, 2026',
                            rating: 5,
                            verified: true,
                            review: 'Excellent quality t-shirts! We ordered 100 pieces for our company event and everyone loved them. The printing quality is top-notch and the fabric is very comfortable. Delivery was on time as promised. Highly recommended for corporate gifting!',
                            helpful: 24,
                          },
                          {
                            name: 'Rajesh Kumar',
                            date: 'January 10, 2026',
                            rating: 5,
                            verified: true,
                            review: 'Great experience with Rodlen. The customization options are fantastic and the team was very helpful throughout the ordering process. The t-shirts look professional and our logo came out perfectly.',
                            helpful: 18,
                          },
                          {
                            name: 'Anita Desai',
                            date: 'January 5, 2026',
                            rating: 4,
                            verified: true,
                            review: 'Very good quality product. The only reason for 4 stars instead of 5 is that the delivery took slightly longer than expected. But the quality makes up for it. Would order again.',
                            helpful: 12,
                          },
                        ].map((review, index) => (
                          <div key={index} className="bg-white rounded-xl border border-[#ececec] p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                                  {review.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-[#0e1e3f]">{review.name}</h4>
                                    {review.verified && (
                                      <span className="px-2 py-0.5 bg-[#dcfce7] text-[#16a34a] text-xs rounded-full font-semibold flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#64748b]">{review.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} width="16" height="16" viewBox="0 0 32 32" fill="none">
                                    <path
                                      d={svgPaths.p1f20c3c0}
                                      fill={i < review.rating ? '#FFCC47' : '#e5e7eb'}
                                    />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-[#475569] leading-relaxed mb-3">{review.review}</p>
                            <div className="flex items-center gap-4 pt-3 border-t border-[#ececec]">
                              <button
                                type="button"
                                onClick={() => setReviewsNotice('Thanks — your feedback helps other buyers.')}
                                className="flex items-center gap-2 text-xs text-[#64748b] hover:text-[#2563eb] font-medium transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                👍 Helpful ({review.helpful})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rating Sidebar */}
                    <div>
                      <div className="bg-white rounded-xl border border-[#ececec] p-6 sticky top-6">
                        <h4 className="text-lg font-bold text-[#0e1e3f] mb-4">Overall Rating</h4>
                        
                        <div className="text-center mb-6 pb-6 border-b border-[#ececec]">
                          <div className="text-6xl font-bold text-[#0e1e3f] mb-2">{product.rating}</div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} width="24" height="24" viewBox="0 0 32 32" fill="none">
                                <path d={svgPaths.p1f20c3c0} fill="#FFCC47" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-[#64748b] font-medium">Based on 128 reviews</p>
                        </div>

                        <div className="space-y-3 mb-6">
                          {[
                            { stars: 5, percentage: 78, count: 100 },
                            { stars: 4, percentage: 15, count: 19 },
                            { stars: 3, percentage: 5, count: 6 },
                            { stars: 2, percentage: 2, count: 3 },
                            { stars: 1, percentage: 0, count: 0 },
                          ].map((item) => (
                            <div key={item.stars} className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-[#0e1e3f] w-6">{item.stars}★</span>
                              <div className="flex-1 bg-[#f1f5f9] rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-[#FFCC47] h-full rounded-full transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-[#64748b] w-8 text-right">{item.count}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setReviewsNotice('Review form will open here so you can rate this product and add photos.')
                          }
                          className="w-full px-6 py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-[#1d4ed8] transition-colors shadow-lg hover:shadow-xl"
                        >
                          ✍️ Write a Review
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'vendor' && (
                  <div className="max-w-5xl mx-auto">
                    <h3 className="text-2xl font-bold text-[#0e1e3f] mb-6 flex items-center gap-3">
                      <span>🏢</span>
                      About the Vendor
                    </h3>
                    
                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-2xl border border-[#ececec] p-8 mb-6">
                      <div className="flex items-start gap-6 mb-8">
                        <img src={imgVendorAvatar} alt="Rodlen" className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl" />
                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-[#0e1e3f] mb-2">Rodlen Corporate Gifting</h4>
                          <p className="text-base text-[#64748b] mb-3">Premium Corporate Apparel Supplier</p>
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-[#dcfce7] text-[#16a34a] text-sm rounded-xl font-bold flex items-center gap-2 shadow-sm">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified Vendor
                            </span>
                            <span className="text-sm text-[#64748b] font-medium">🏆 Since 2015 (9+ years)</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                          <p className="text-4xl font-bold text-[#2563eb] mb-2">98%</p>
                          <p className="text-sm text-[#64748b] font-medium">Customer Satisfaction</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                          <p className="text-4xl font-bold text-[#2563eb] mb-2">2,500+</p>
                          <p className="text-sm text-[#64748b] font-medium">Orders Completed</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                          <p className="text-4xl font-bold text-[#2563eb] mb-2">&lt; 2 hrs</p>
                          <p className="text-sm text-[#64748b] font-medium">Response Time</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h5 className="text-base font-bold text-[#0e1e3f] mb-3 flex items-center gap-2">
                            <span>📖</span>
                            Company Overview
                          </h5>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            Rodlen is a leading manufacturer and supplier of premium corporate apparel and gifting solutions. 
                            With over 8 years of experience, we specialize in bulk orders for corporations, startups, and 
                            enterprises across India. Our state-of-the-art manufacturing facility ensures high-quality products 
                            with fast turnaround times.
                          </p>
                        </div>

                        <div>
                          <h5 className="text-base font-bold text-[#0e1e3f] mb-3 flex items-center gap-2">
                            <span>✨</span>
                            Specializations
                          </h5>
                          <div className="grid grid-cols-3 gap-3">
                            {['Corporate T-Shirts', 'Custom Printing', 'Bulk Orders', 'Logo Embroidery', 'Fast Delivery', 'Quality Assurance'].map((spec) => (
                              <div key={spec} className="px-4 py-3 bg-white border border-[#ececec] text-[#475569] text-sm font-semibold rounded-xl text-center hover:border-[#2563eb] transition-colors">
                                {spec}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-base font-bold text-[#0e1e3f] mb-3 flex items-center gap-2">
                            <span>🏅</span>
                            Certifications
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            {['ISO 9001:2015 Certified', 'Make in India Certified', 'OEKO-TEX Standard 100'].map((cert, index) => (
                              <div key={cert} className="flex items-center gap-3 text-sm text-[#475569] bg-white border border-[#ececec] rounded-xl p-4">
                                <svg className="w-6 h-6 text-[#16a34a] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{cert}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#ececec] p-6">
                      <h4 className="text-lg font-bold text-[#0e1e3f] mb-4 flex items-center gap-2">
                        <span>📍</span>
                        Business Address
                      </h4>
                      <p className="text-sm text-[#475569] mb-4 leading-relaxed">
                        Rodlen Corporate Solutions Pvt. Ltd.<br />
                        Plot No. 45, Sector 18, Industrial Area<br />
                        Gurugram, Haryana - 122015, India
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-[#475569] p-3 bg-[#f9fafb] rounded-lg">
                          <Phone className="w-4 h-4 text-[#2563eb]" />
                          <span className="font-medium">+91-9876254321</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#475569] p-3 bg-[#f9fafb] rounded-lg">
                          <Mail className="w-4 h-4 text-[#2563eb]" />
                          <span className="font-medium">sales@rodlen.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'payment' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-[#0e1e3f] mb-6 flex items-center gap-3">
                      <span>💳</span>
                      Payment Terms & Methods
                    </h3>
                    
                    {/* Payment Methods */}
                    <div className="bg-[#f9fafb] rounded-2xl border border-[#ececec] p-8 mb-6">
                      <h4 className="text-lg font-bold text-[#0e1e3f] mb-6 flex items-center gap-2">
                        <span>💰</span>
                        Accepted Payment Methods
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: 'Cards', icon: '💳', items: ['Visa', 'Mastercard', 'RuPay', 'Amex'] },
                          { name: 'UPI & Wallets', icon: '📱', items: ['GPay', 'PhonePe', 'Paytm'] },
                          { name: 'Banking', icon: '🏦', items: ['NEFT', 'RTGS', 'Cheque', 'DD'] },
                        ].map((method, index) => (
                          <div key={index} className="p-6 bg-white border-2 border-[#ececec] rounded-xl text-center hover:border-[#2563eb] transition-colors">
                            <div className="text-4xl mb-3">{method.icon}</div>
                            <h5 className="text-base font-bold text-[#0e1e3f] mb-2">{method.name}</h5>
                            <p className="text-xs text-[#64748b] leading-relaxed">{method.items.join(', ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <h4 className="text-lg font-bold text-[#0e1e3f] mb-4 flex items-center gap-2">
                      <span>📋</span>
                      Payment Terms
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-gradient-to-br from-[#ebf1ff] to-white border-2 border-[#2563eb] rounded-2xl">
                        <div className="w-14 h-14 rounded-xl bg-[#2563eb] flex items-center justify-center mb-4">
                          <span className="text-3xl">💯</span>
                        </div>
                        <h5 className="text-lg font-bold text-[#0e1e3f] mb-2">100% Advance</h5>
                        <p className="text-sm text-[#64748b] leading-relaxed">
                          For orders below ₹50,000<br/>
                          <span className="text-xs">Full payment required at time of booking</span>
                        </p>
                      </div>
                      <div className="p-6 bg-white border-2 border-[#ececec] rounded-2xl hover:border-[#2563eb] transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-[#f1f5f9] flex items-center justify-center mb-4">
                          <span className="text-3xl">⚡</span>
                        </div>
                        <h5 className="text-lg font-bold text-[#0e1e3f] mb-2">50% Advance</h5>
                        <p className="text-sm text-[#64748b] leading-relaxed">
                          For orders above ₹50,000<br/>
                          <span className="text-xs">Balance payment before delivery</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-xl border border-[#ececec] p-8">
              <h3 className="text-2xl font-bold text-[#0e1e3f] mb-6 flex items-center gap-3">
                <span>🔗</span>
                You May Also Like
              </h3>
              <RelatedProducts products={getRelatedProducts(product.id)} />
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

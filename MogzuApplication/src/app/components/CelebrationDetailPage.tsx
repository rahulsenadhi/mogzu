import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Share2, Star, ChevronRight, Info, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { WishlistHeart } from './global/WishlistHeart';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PricingBlock, PricingMode } from './ui/PricingBlock';
import { resolveGiftingListing } from '@/app/lib/activityListingResolver';

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
              navigate('/celebration-booking-flow', {
                state: { source: 'celebration-detail', productId, acceptedOffer: true },
              });
              return;
            }
            if (status === 'declined') {
              navigate('/celebrations');
            }
          }}
          className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            status === 'best_offer'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          {config.cta}
        </button>
      )}
    </div>
  );
}

// Mock product data (same as CelebrationsPage)
const mockProducts = [
  {
    id: 1,
    name: 'Premium Birthday Hamper',
    occasion: 'Birthday',
    description: 'Luxurious birthday gift box with gourmet treats and personalized card. Perfect for celebrating birthdays in style with premium quality items.',
    image: 'https://images.unsplash.com/photo-1698369233438-0743853be7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwaGFtcGVyJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1698369233438-0743853be7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwaGFtcGVyJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGdpZnQlMjBib3glMjBkZXRhaWx8ZW58MXx8fHwxNzM5NTU3NDAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwaGFtcGVyJTIwY2hvY29sYXRlfGVufDF8fHx8MTczOTU1NzQxNXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1606800052052-c9cc5a2b53ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwcGFja2FnaW5nJTIwYm94fGVufDF8fHx8MTczOTU1NzQyMnww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    price: 1299,
    moq: 10,
    variants: [
      { id: 1, name: 'Standard', price: 1299 },
      { id: 2, name: 'Deluxe', price: 1799 },
      { id: 3, name: 'Premium', price: 2499 }
    ],
    colors: ['Red', 'Blue', 'Gold', 'Silver'],
    contents: [
      { name: 'Gourmet Chocolates', quantity: '200g' },
      { name: 'Premium Cookies', quantity: '150g' },
      { name: 'Birthday Card', quantity: '1 pc' },
      { name: 'Decorative Box', quantity: '1 pc' },
      { name: 'Scented Candle', quantity: '1 pc' },
      { name: 'Greeting Banner', quantity: '1 pc' }
    ],
    weight: '1.2 kg',
    ingredients: 'Chocolates (Cocoa, Sugar, Milk), Cookies (Flour, Butter, Sugar), Premium Packaging',
    expiry: '45 days from manufacturing',
    attributes: [
      { name: 'Fragrance', value: 'Vanilla & Lavender' },
      { name: 'Burn Time', value: '8 hours' },
      { name: 'Type', value: 'Gift Hamper' }
    ],
    brandingTypes: ['Sticker', 'Sleeve', 'UV Print', 'Laser Engraving'],
    brandingPlacements: ['Front', 'Top', 'Side', 'Inner Lid'],
    packagingOptions: [
      { name: 'Standard Box', price: 0 },
      { name: 'Kraft Box', price: 50 },
      { name: 'Premium Box', price: 150 },
      { name: 'Wooden Box', price: 300 }
    ],
    greetingCards: [
      { name: 'Birthday Wishes', price: 0 },
      { name: 'Happy Birthday', price: 0 },
      { name: 'Custom Message', price: 50 }
    ],
    bulkPricing: [
      { quantity: '10-49', price: 1299, discount: '0%' },
      { quantity: '50-99', price: 1169, discount: '10%' },
      { quantity: '100-249', price: 1039, discount: '20%' },
      { quantity: '250+', price: 909, discount: '30%' }
    ]
  }
];

export default function CelebrationDetailPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const product = mockProducts.find(p => p.id === Number(routeId)) || mockProducts[0];

  const [liveListingId, setLiveListingId] = useState<string | undefined>();
  const [liveVendorId, setLiveVendorId] = useState<string | undefined>();
  const [livePricingType, setLivePricingType] = useState<'transparent' | 'offer' | 'request_for_price' | undefined>();
  const [usingDemoCatalog, setUsingDemoCatalog] = useState(true);

  useEffect(() => {
    if (!routeId) {
      setLiveListingId(undefined);
      setLiveVendorId(undefined);
      setLivePricingType(undefined);
      setUsingDemoCatalog(true);
      return;
    }
    let cancelled = false;
    void resolveGiftingListing(routeId).then((row) => {
      if (cancelled) return;
      if (row?.id && row.vendor_id) {
        setLiveListingId(row.id);
        setLiveVendorId(row.vendor_id);
        setLivePricingType(row.pricing_type);
        setUsingDemoCatalog(false);
        return;
      }
      setLiveListingId(undefined);
      setLiveVendorId(undefined);
      setLivePricingType(undefined);
      setUsingDemoCatalog(true);
    });
    return () => {
      cancelled = true;
    };
  }, [routeId]);

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedBranding, setSelectedBranding] = useState(product.brandingTypes[0]);
  const [selectedPlacement, setSelectedPlacement] = useState(product.brandingPlacements[0]);
  const [selectedPackaging, setSelectedPackaging] = useState(product.packagingOptions[0]);
  const [selectedCard, setSelectedCard] = useState(product.greetingCards[0]);
  const [quantity, setQuantity] = useState(product.moq);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [vendorNotice, setVendorNotice] = useState('');

  const calculatePrice = () => {
    const bulkTier = product.bulkPricing.find(tier => {
      const [min, max] = tier.quantity.split('-').map(q => parseInt(q.replace('+', '')) || Infinity);
      return quantity >= min && (max ? quantity <= max : true);
    }) || product.bulkPricing[0];

    const basePrice = bulkTier.price;
    const packagingPrice = selectedPackaging.price;
    const cardPrice = selectedCard.price;
    
    return (basePrice + packagingPrice + cardPrice) * quantity;
  };

  const handleProceedToBooking = () => {
    const bookingData = {
      product: {
        name: product.name,
        image: product.image,
        occasion: product.occasion,
      },
      variant: selectedVariant,
      color: selectedColor,
      branding: selectedBranding,
      placement: selectedPlacement,
      packaging: selectedPackaging,
      greetingCard: selectedCard,
      quantity,
      logo: logoFile,
      totalPrice: calculatePrice(),
      ...(liveListingId && liveVendorId
        ? { listingId: liveListingId, vendorId: liveVendorId, module: 'gifting' as const }
        : {}),
    };

    localStorage.setItem('celebrationBooking', JSON.stringify(bookingData));
    navigate('/celebration-booking-flow');
  };

  const handleMessageVendor = () => {
    navigate('/communication', {
      state: {
        source: 'celebration-detail',
        productId: product.id,
        vendor: 'vendor',
        channel: 'pre-enquiry-message',
      },
    });
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

  useEffect(() => {
    if (!shareFeedback) return;
    const id = window.setTimeout(() => setShareFeedback(''), 5000);
    return () => window.clearTimeout(id);
  }, [shareFeedback]);

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="celebrations"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Page Content */}
        <MogzuCorporateScrollSurface>
          <div className="max-w-7xl mx-auto px-6 py-6">
            {usingDemoCatalog ? <DevMockDataBanner /> : null}
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm mb-6 min-w-0">
              <button type="button" onClick={() => navigate('/dashboard')} className="text-[#4379ee] hover:underline shrink-0">
                Activity Suite
              </button>
              <ChevronRight className="w-4 h-4 text-[#878e9e] shrink-0" />
              <button type="button" onClick={() => navigate('/gifting')} className="text-[#4379ee] hover:underline shrink-0">
                Gifting
              </button>
              <ChevronRight className="w-4 h-4 text-[#878e9e] shrink-0" />
              <button type="button" onClick={() => navigate('/celebrations')} className="text-[#4379ee] hover:underline shrink-0">
                Celebrations
              </button>
              <ChevronRight className="w-4 h-4 text-[#878e9e] shrink-0" />
              <span className="text-[#878e9e] break-words min-w-0">{product.name}</span>
            </div>

            {/* Title and Actions Row */}
            <div className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-[#0e1e3f] mb-2">{product.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FFCC47] text-[#FFCC47]" />
                      4.8 (234)
                    </span>
                    <span>•</span>
                    <span className="bg-[#2563eb] text-white text-xs font-semibold px-3 py-1 rounded-lg">
                      {product.occasion}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <WishlistHeart
                    listingId={String(product.id)}
                    className="p-2.5 border border-[#ececec] rounded-lg transition-colors hover:bg-gray-50 text-[#64748b]"
                  />
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Copy page link"
                    className="p-2.5 border border-[#ececec] rounded-lg hover:bg-gray-50 text-[#64748b]"
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

            {/* Main Content Grid - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Image Gallery Card */}
                <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col-reverse lg:flex-row gap-4">
                      {/* Thumbnails */}
                      <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 shrink-0">
                        {product.images.map((image, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden transition-all border-2 flex-shrink-0 ${
                              selectedImage === index ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20' : 'border-[#e5e7eb]'
                            }`}
                          >
                            <ImageWithFallback
                              src={image}
                              alt={`${product.name} — gallery image ${index + 1} of ${product.images.length}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>

                      {/* Main Image */}
                      <div className="flex-1 bg-[#f9fafb] rounded-xl overflow-hidden">
                        <ImageWithFallback
                          src={product.images[selectedImage]}
                          alt={product.name}
                          className="w-full h-96 object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info Card */}
                <div className="bg-white rounded-xl border border-[#ececec]">
                  <div className="border-b border-[#ececec]">
                    <div className="flex gap-8 px-6">
                      {['overview', 'amenities', 'portfolio', 'policies', 'payment'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setSelectedTab(tab)}
                          className={`pb-4 pt-5 text-sm font-medium transition-colors relative capitalize ${
                            selectedTab === tab
                              ? 'text-[#2563eb]'
                              : 'text-[#64748b] hover:text-[#0e1e3f]'
                          }`}
                        >
                          {tab === 'overview' && 'Overview'}
                          {tab === 'amenities' && 'Amenities'}
                          {tab === 'portfolio' && 'Portfolio'}
                          {tab === 'policies' && 'T&C'}
                          {tab === 'payment' && 'Payment'}
                          {selectedTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563eb] rounded-t-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {selectedTab === 'overview' && (
                      <>
                        <h2 className="text-sm font-semibold text-[#0e1e3f] mb-2">{product.name}</h2>
                        <p className="text-xs text-[#475569] leading-relaxed mb-3">
                          {product.description}
                        </p>

                        {/* Product Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                          <div className="bg-[#f9fafb] rounded-lg p-2.5">
                            <p className="text-[10px] text-[#878e9e] mb-0.5">Weight</p>
                            <p className="text-xs font-semibold text-[#0e1e3f]">{product.weight}</p>
                          </div>
                          <div className="bg-[#f9fafb] rounded-lg p-2.5">
                            <p className="text-[10px] text-[#878e9e] mb-0.5">Shelf Life</p>
                            <p className="text-xs font-semibold text-[#0e1e3f]">{product.expiry}</p>
                          </div>
                          <div className="bg-[#f9fafb] rounded-lg p-2.5">
                            <p className="text-[10px] text-[#878e9e] mb-0.5">Min Order Quantity</p>
                            <p className="text-xs font-semibold text-[#0e1e3f]">{product.moq} units</p>
                          </div>
                          <div className="bg-[#f9fafb] rounded-lg p-2.5">
                            <p className="text-[10px] text-[#878e9e] mb-0.5">Occasion</p>
                            <p className="text-xs font-semibold text-[#0e1e3f]">{product.occasion}</p>
                          </div>
                        </div>

                        {/* What's Inside */}
                        <div className="mb-3">
                          <h3 className="text-xs font-semibold text-[#0e1e3f] mb-1.5">What's Inside</h3>
                          <div className="bg-[#f9fafb] rounded-lg p-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {product.contents.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <span className="text-green-600 mt-0.5 text-[10px]">✓</span>
                                  <div>
                                    <div className="text-xs font-medium text-[#0e1e3f]">{item.name}</div>
                                    <div className="text-[10px] text-[#878e9e]">{item.quantity}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <h3 className="text-xs font-semibold text-[#0e1e3f] mb-1.5">Ingredients</h3>
                          <p className="text-xs text-[#475569] leading-relaxed">{product.ingredients}</p>
                        </div>

                        {/* Product Attributes */}
                        {product.attributes.length > 0 && (
                          <div className="mt-3">
                            <h3 className="text-xs font-semibold text-[#0e1e3f] mb-1.5">Additional Details</h3>
                            <div className="space-y-1.5">
                              {product.attributes.map((attr, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-[#f0f0f0] last:border-0">
                                  <span className="text-[#878e9e]">{attr.name}:</span>
                                  <span className="font-medium text-[#0e1e3f]">{attr.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}



                    {selectedTab === 'amenities' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#0e1e3f]">Product Amenities</h2>
                        <div className="grid grid-cols-2 gap-3">
                          {['Premium Packaging', 'Custom Branding', 'Greeting Cards', 'Pan-India Delivery'].map((amenity, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5 text-[10px]">✓</span>
                              <span className="text-sm text-[#475569]">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'portfolio' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#0e1e3f]">Portfolio & Past Deliveries</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-32 rounded-lg overflow-hidden relative group">
                              <ImageWithFallback
                                src={`https://images.unsplash.com/photo-1549465220-1a8b9238cd48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGdpZnQlMjBib3glMjBkZXRhaWx8ZW58MXx8fHwxNzM5NTU3NDAyfDA&ixlib=rb-4.1.0&q=80&w=1080`}
                                alt={`Portfolio ${item}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'policies' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#0e1e3f]">Terms & Conditions</h2>
                        <div className="space-y-2">
                          {[
                            'Minimum order quantity applies.',
                            'Orders once placed cannot be cancelled.',
                            'Custom branding requires 5-7 days of processing time.',
                            'Delivery times may vary depending on the location.'
                          ].map((policy, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-[#475569]">
                              <span className="text-[#878e9e] mt-1">•</span>
                              <span>{policy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'payment' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#0e1e3f]">Payment Terms</h2>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-1">•</span>
                            <span>100% advance payment required for custom branded orders</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-1">•</span>
                            <span>50% advance for non-customized bulk orders</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sticky Booking Card */}
              <div>
                <div className="sticky top-6">
                  <div className="bg-white rounded-lg border border-[#e5e7eb] p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-[#0e1e3f] mb-3">Booking Status</h3>
                      
                      <div className="flex flex-col gap-3">
                        <PricingBlock
                          mode={
                            livePricingType === 'offer'
                              ? 'negotiable'
                              : livePricingType === 'request_for_price'
                                ? 'on_request'
                                : 'fixed'
                          }
                          price={`₹${selectedVariant.price}`}
                          priceUnit=""
                          onSubmitOffer={(offer, message) => {
                            setVendorNotice(
                              `Offer of ₹${offer} submitted${message.trim() ? ' with your note.' : '.'} The vendor will review it.`,
                            );
                          }}
                          onCheckAvailability={() => {
                            setVendorNotice('Checking availability with the vendor…');
                            window.setTimeout(() => {
                              setVendorNotice(
                                'Availability check sent. Watch the booking status below for updates.',
                              );
                            }, 1200);
                          }}
                        />
                        {vendorNotice && (
                          <p className="text-xs text-[#0e1e3f] bg-[#f0f9ff] border border-[#2563eb]/20 rounded-lg px-3 py-2" role="status">
                            {vendorNotice}
                          </p>
                        )}

                        <div className="space-y-3">
                          <ResponseStatusBanner
                            status="awaiting"
                            productId={product.id}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-[#f9fafb] rounded-lg p-3 mb-5">
                      <div className="space-y-1.5 mb-2.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#878e9e]">Quantity:</span>
                          <span className="font-semibold text-[#0e1e3f]">{quantity} units</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#878e9e]">Unit Price:</span>
                          <span className="font-semibold text-[#0e1e3f]">₹{selectedVariant.price}</span>
                        </div>
                        {selectedPackaging.price > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-[#878e9e]">Packaging:</span>
                            <span className="font-semibold text-[#0e1e3f]">+₹{selectedPackaging.price}</span>
                          </div>
                        )}
                        {selectedCard.price > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-[#878e9e]">Greeting Card:</span>
                            <span className="font-semibold text-[#0e1e3f]">+₹{selectedCard.price}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2.5 border-t border-[#e5e7eb]">
                        <div className="flex justify-between">
                          <span className="text-xs font-semibold text-[#0e1e3f]">Total Price:</span>
                          <span className="text-lg font-bold text-[#0e1e3f]">₹{calculatePrice().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={handleProceedToBooking}
                        className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Proceed to Booking
                      </button>
                      <button
                        type="button"
                        onClick={handleMessageVendor}
                        className="w-full px-5 py-2.5 border border-[#e5e7eb] text-[#0e1e3f] rounded-lg text-sm font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        Message Vendor
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/celebrations')}
                        className="w-full px-5 py-2.5 border-2 border-[#e5e7eb] text-[#475569] rounded-lg text-sm font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        Back to Catalog
                      </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-5 pt-5 border-t border-[#e5e7eb] space-y-2.5">
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Free shipping on bulk orders</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Corporate invoicing available</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Dedicated account manager</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">More celebration products</h2>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Browse the catalog for more gifting and celebration options.
              </p>
              <button
                type="button"
                onClick={() => navigate('/celebrations')}
                className="w-full py-2 px-4 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                View all products
              </button>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
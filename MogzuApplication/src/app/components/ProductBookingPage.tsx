import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Search, ChevronDown, ChevronLeft, Bell, HelpCircle, ShoppingCart, Star, Phone, Mail, Upload, Book, Package, Info, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PricingBlock, PricingMode } from './ui/PricingBlock';
import svgPaths from '@/imports/svg-a80j978jey';
import svgPathsDashboard from '@/imports/svg-camfkj9vq4';
import { QA_IMAGES } from '../lib/qaImagery';
import { apparelProducts, getRelatedProducts } from '../data/apparelProducts';
import { bagsProducts } from '../data/bagsProducts';
import { techProducts } from '../data/techProducts';
import { wellnessProducts } from '../data/wellnessProducts';
import { stationeryProducts } from '../data/stationeryProducts';
import RelatedProducts from './RelatedProducts';
import {
  appendCorpVendorEnquiry,
  CORP_VENDOR_ENQUIRY_UPDATED_EVENT,
  getCorporateCompanyDisplayName,
  getLatestCorpVendorEnquiryForProduct,
} from '@/app/lib/corpVendorEnquiryStorage';
import {
  findVendorCatalogProductByQuery,
  VENDOR_CATALOG_UPDATED_EVENT,
} from '@/app/lib/vendorProductsCatalogStorage';
import type { ListingBuyerDetailBlock } from '../../../utils/mogzuDataTypes';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import { useAuth } from '@/lib/auth';
import { uploadBrandingLogo, PLACEMENT_OPTIONS, type PlacementType } from '@/lib/giftingBranding';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { resolveGiftingListing } from '@/app/lib/activityListingResolver';

const imgAvatar = QA_IMAGES.avatar;
const imgVendorAvatar = QA_IMAGES.vendorPortrait;

interface ResponseStatusBannerProps {
  status: 'awaiting' | 'best_offer' | 'accepted' | 'declined';
  comment?: string;
  productId?: number;
  vendorOrderId?: string;
}

function ResponseStatusBanner({ status, comment, productId, vendorOrderId }: ResponseStatusBannerProps) {
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
                state: {
                  source: 'product-booking',
                  productId,
                  acceptedOffer: true,
                  vendorOrderId,
                  category: 'gifting',
                },
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

type ProductCategory = 'apparel' | 'bags' | 'tech' | 'wellness' | 'stationery';

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
  const location = useLocation();
  const { corporateId, user } = useAuth();

  // Get category and productId from URL params
  const [searchParams] = useSearchParams();
  const category = (searchParams.get('category') || 'apparel') as ProductCategory;
  const idParam = searchParams.get('id') || '1';
  const productId = /^\d+$/.test(idParam) ? parseInt(idParam, 10) : 1;
  const errorMode = searchParams.get('error') === '1';
  const vcatParam = searchParams.get('vcat')?.trim();
  const vskuParam = searchParams.get('vsku')?.trim();

  // When navigated from listings, we may already have the product payload available.
  // This avoids empty booking pages if the product id doesn't exist in the demo datasets.
  const stateProduct = (location.state as any)?.product as any | undefined;
  const stateVendorCatalogId = (location.state as { vendorCatalogId?: string })?.vendorCatalogId?.trim();
  const stateVendorSku = (location.state as { vendorCatalogProductId?: string })?.vendorCatalogProductId?.trim();
  const stateListingId = (location.state as { listingId?: string })?.listingId;
  const stateVendorId = (location.state as { vendorId?: string })?.vendorId;

  const [liveListingId, setLiveListingId] = useState<string | undefined>(stateListingId);
  const [liveVendorId, setLiveVendorId] = useState<string | undefined>(stateVendorId);
  const usingDemoCatalog = !liveListingId || !liveVendorId;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNav, setSelectedNav] = useState('activity');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'tc', label: 'T&C' },
    { id: 'payment', label: 'Payment' },
  ];

  const [selectedTab, setSelectedTab] = useState('overview');
  const [ratingsFeedback, setRatingsFeedback] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<{ date: string; days: number } | null>(null);
  const [deliveryZipError, setDeliveryZipError] = useState('');
  const [isDeliveryUnavailable, setIsDeliveryUnavailable] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'po' | 'card' | 'upi' | 'empanelled'>('po');
  const [paymentTiming, setPaymentTiming] = useState<'full' | 'partial'>('full');
  const [saveCard, setSaveCard] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  const [priceNotice, setPriceNotice] = useState('');
  const [vendorNotice, setVendorNotice] = useState('');
  const [vendorCatalogTick, setVendorCatalogTick] = useState(0);
  const [vendorPoliciesOpen, setVendorPoliciesOpen] = useState(true);

  useEffect(() => {
    const onCat = () => setVendorCatalogTick((n) => n + 1);
    window.addEventListener(VENDOR_CATALOG_UPDATED_EVENT, onCat);
    return () => window.removeEventListener(VENDOR_CATALOG_UPDATED_EVENT, onCat);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void resolveGiftingListing(idParam).then((row) => {
      if (cancelled) return;
      if (row?.id && row.vendor_id) {
        setLiveListingId(row.id);
        setLiveVendorId(row.vendor_id);
        return;
      }
      if (!stateListingId || !stateVendorId) {
        setLiveListingId(undefined);
        setLiveVendorId(undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [idParam, stateListingId, stateVendorId]);

  // Listing detail load simulation + guardrails
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setLoadError('');

    const timer = setTimeout(() => {
      if (errorMode) {
        setLoadError('Unable to load product details right now. Please try again.');
      }
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [category, productId, errorMode]);
  
  // Customization modal states
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [requestSampleBook, setRequestSampleBook] = useState(false);
  
  // Customization states
  const [showCustomization, setShowCustomization] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploadId, setLogoUploadId] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPosition, setLogoPosition] = useState<PlacementType | string>('front_print');
  const [brandingMethod, setBrandingMethod] = useState<string>('screen-print');
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Size quantities - dynamic based on category
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  
  // Non-sized quantity (for categories without size options)
  const [bulkQuantity, setBulkQuantity] = useState<number>(25);
  
  // Price calculation states
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<{
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    tier: 'tier1' | 'tier2' | 'tier3';
    discount: number;
  } | null>(null);
  
  // Get category-specific configuration
  const categoryConfig = useMemo(() => {
    const configs: Record<ProductCategory, any> = {
      apparel: {
        sizeOptions: ['XS', 'Small', 'Medium', 'Large', 'XL', '2XL'],
        colorLabel: 'Color',
        brandingMethods: [
          { id: 'screen-print', label: 'Screen Printing', price: '+₹50/pc', popular: true },
          { id: 'embroidery', label: 'Embroidery', price: '+₹120/pc', premium: true },
          { id: 'vinyl', label: 'Vinyl Transfer', price: '+₹80/pc', popular: false },
          { id: 'dtg', label: 'DTG Printing', price: '+₹100/pc', popular: false },
        ],
        logoPositions: [
          { id: 'center-chest', label: 'Center Chest' },
          { id: 'left-chest', label: 'Left Chest' },
          { id: 'back', label: 'Back' },
          { id: 'sleeve', label: 'Sleeve' },
        ],
      },
      bags: {
        sizeOptions: [],
        colorLabel: 'Color / Material',
        brandingMethods: [
          { id: 'embossing', label: 'Embossing', price: '+₹100/pc', premium: true },
          { id: 'debossing', label: 'Debossing', price: '+₹100/pc', premium: true },
          { id: 'screen-print', label: 'Screen Print', price: '+₹60/pc', popular: true },
          { id: 'metal-badge', label: 'Metal Badge', price: '+₹150/pc', premium: true },
        ],
        logoPositions: [
          { id: 'front', label: 'Front Panel' },
          { id: 'side', label: 'Side Panel' },
          { id: 'strap', label: 'Strap' },
          { id: 'interior', label: 'Interior Label' },
        ],
      },
      tech: {
        sizeOptions: [],
        colorLabel: 'Color / Finish',
        brandingMethods: [
          { id: 'laser-engraving', label: 'Laser Engraving', price: '+₹80/pc', popular: true },
          { id: 'uv-print', label: 'UV Printing', price: '+₹70/pc', popular: true },
          { id: 'sticker', label: 'Premium Sticker', price: '+₹30/pc', popular: false },
          { id: 'metal-plate', label: 'Metal Plate', price: '+₹120/pc', premium: true },
        ],
        logoPositions: [
          { id: 'back', label: 'Back Surface' },
          { id: 'lid', label: 'Lid/Cover' },
          { id: 'side', label: 'Side Panel' },
          { id: 'packaging', label: 'Packaging Only' },
        ],
      },
      wellness: {
        sizeOptions: ['Small', 'Medium', 'Large'],
        colorLabel: 'Fragrance / Color',
        brandingMethods: [
          { id: 'sticker', label: 'Custom Label', price: '+₹20/pc', popular: true },
          { id: 'uv-print', label: 'UV Printing', price: '+₹50/pc', popular: true },
          { id: 'packaging', label: 'Custom Packaging', price: '+₹100/pc', premium: true },
          { id: 'sleeve', label: 'Sleeve Branding', price: '+₹40/pc', popular: false },
        ],
        logoPositions: [
          { id: 'label', label: 'Product Label' },
          { id: 'box', label: 'Box/Packaging' },
          { id: 'sleeve', label: 'Sleeve' },
          { id: 'insert', label: 'Package Insert' },
        ],
      },
      stationery: {
        sizeOptions: [],
        colorLabel: 'Color',
        brandingMethods: [
          { id: 'foil-stamping', label: 'Foil Stamping', price: '+₹30/pc', premium: true },
          { id: 'embossing', label: 'Embossing', price: '+₹25/pc', premium: true },
          { id: 'uv-print', label: 'UV Printing', price: '+₹20/pc', popular: true },
          { id: 'screen-print', label: 'Screen Print', price: '+₹15/pc', popular: true },
        ],
        logoPositions: [
          { id: 'cover', label: 'Cover' },
          { id: 'spine', label: 'Spine' },
          { id: 'back', label: 'Back Cover' },
          { id: 'inside', label: 'Inside Page' },
        ],
      },
    };
    return configs[category];
  }, [category]);

  // Initialize size quantities when config changes
  useMemo(() => {
    if (categoryConfig.sizeOptions.length > 0) {
      const initialSizes: Record<string, number> = {};
      categoryConfig.sizeOptions.forEach((size: string) => {
        initialSizes[size] = 0;
      });
      setSizeQuantities(initialSizes);
    }
  }, [categoryConfig]);

  // Get product data based on category
  const rawProduct = useMemo(() => {
    let fromDataset: any | undefined;
    switch (category) {
      case 'bags':
        fromDataset = bagsProducts.find((p) => p.id === productId);
        break;
      case 'tech':
        fromDataset = techProducts.find((p) => p.id === productId);
        break;
      case 'wellness':
        fromDataset = wellnessProducts.find((p) => p.id === productId);
        break;
      case 'stationery':
        fromDataset = stationeryProducts.find((p) => p.id === productId);
        break;
      default:
        fromDataset = apparelProducts.find((p) => p.id === productId);
        break;
    }
    return fromDataset || stateProduct || null;
  }, [category, productId, stateProduct]);

  // Transform product data to unified format
  const product = useMemo(() => {
    if (!rawProduct) return null;
    if (category === 'apparel') {
      const p = rawProduct as any;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        rating: p.rating || 4.7,
        reviews: 128,
        description: p.description || '',
        images: [p.image, p.image, p.image],
        minQty: { tier1: p.moq || 25, tier2: 50, tier3: 100 },
        pricePerUnit: { tier1: p.price, tier2: p.price * 0.9, tier3: p.price * 0.8 },
        colors: p.colors?.map((c: string) => ({ name: c, hex: c === 'Black' ? '#000000' : c === 'White' ? '#ffffff' : c === 'Navy' ? '#1e3a8a' : c === 'Grey' ? '#6b7280' : '#2563eb' })) || [],
        specifications: p.specifications || {},
        additionalInfo: p.features || [],
      };
    } else {
      const p = rawProduct as any;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        rating: p.rating || 4.7,
        reviews: 128,
        description: p.description || '',
        images: [p.image, p.image, p.image],
        minQty: { tier1: p.moq || 25, tier2: p.moq ? p.moq * 2 : 50, tier3: p.moq ? p.moq * 4 : 100 },
        pricePerUnit: { tier1: p.price, tier2: p.price * 0.9, tier3: p.price * 0.8 },
        colors: p.colors?.map((c: string) => ({ name: c, hex: c === 'Black' ? '#000000' : c === 'White' ? '#ffffff' : c === 'Navy' ? '#1e3a8a' : c === 'Grey' ? '#6b7280' : c === 'Blue' ? '#2563eb' : '#ef4444' })) || [],
        specifications: p.specs ? Object.fromEntries(p.specs.map((s: string, i: number) => [`spec${i}`, s])) : (p.material ? { material: p.material, ...(p.capacity && { capacity: p.capacity }) } : {}),
        additionalInfo: p.features || p.specs || [],
      };
    }
  }, [rawProduct, category]);

  const vendorCatalogRow = useMemo(() => {
    const idQ = vcatParam || stateVendorCatalogId;
    const skuQ = vskuParam || stateVendorSku;
    if (idQ || skuQ) {
      return findVendorCatalogProductByQuery({ id: idQ, productId: skuQ });
    }
    return findVendorCatalogProductByQuery({ id: String(productId) });
  }, [vcatParam, vskuParam, stateVendorCatalogId, stateVendorSku, productId, vendorCatalogTick]);

  const vendorBuyerDetail: ListingBuyerDetailBlock | null = vendorCatalogRow?.buyer_detail ?? null;
  const vendorDetailRich = Boolean(
    vendorBuyerDetail &&
      (vendorBuyerDetail.policies.length > 0 ||
        vendorBuyerDetail.payment_methods.length > 0 ||
        vendorBuyerDetail.payment_terms.trim() ||
        vendorBuyerDetail.portfolio_links.length > 0 ||
        vendorBuyerDetail.amenities.length > 0),
  );

  const [enquiryRev, setEnquiryRev] = useState(0);
  useEffect(() => {
    const h = () => setEnquiryRev((n) => n + 1);
    window.addEventListener(CORP_VENDOR_ENQUIRY_UPDATED_EVENT, h);
    return () => window.removeEventListener(CORP_VENDOR_ENQUIRY_UPDATED_EVENT, h);
  }, []);
  const latestCorpVendorEnquiry = useMemo(
    () => (product ? getLatestCorpVendorEnquiryForProduct(product.id) : undefined),
    [product, enquiryRev],
  );

  // Get related products from the same category
  const relatedProducts = useMemo(() => {
    let categoryProducts: any[] = [];
    
    switch (category) {
      case 'bags':
        categoryProducts = bagsProducts;
        break;
      case 'tech':
        categoryProducts = techProducts;
        break;
      case 'wellness':
        categoryProducts = wellnessProducts;
        break;
      case 'stationery':
        categoryProducts = stationeryProducts;
        break;
      default:
        categoryProducts = apparelProducts;
    }
    
    // Filter out current product and get up to 4 related items
    // Add category info for proper routing
    return categoryProducts
      .filter((p: any) => p.id !== productId)
      .slice(0, 4)
      .map((p: any) => ({ ...p, routeCategory: category }));
  }, [category, productId]);

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

  const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);

  // Calculate price based on quantity and tier
  const calculatePrice = (quantity: number) => {
    if (quantity < product.minQty.tier1) {
      setPriceNotice(
        `Minimum order quantity is ${product.minQty.tier1} units. Please increase your quantity.`,
      );
      return null;
    }

    setPriceNotice('');

    let tier: 'tier1' | 'tier2' | 'tier3' = 'tier1';
    let pricePerUnit = product.pricePerUnit.tier1;

    if (quantity >= product.minQty.tier3) {
      tier = 'tier3';
      pricePerUnit = product.pricePerUnit.tier3;
    } else if (quantity >= product.minQty.tier2) {
      tier = 'tier2';
      pricePerUnit = product.pricePerUnit.tier2;
    }

    const totalPrice = pricePerUnit * quantity;
    const discount = tier === 'tier3' ? 20 : tier === 'tier2' ? 10 : 0;

    setCalculatedPrice({
      quantity,
      pricePerUnit,
      totalPrice,
      tier,
      discount
    });
    setShowPriceBreakdown(true);
  };

  // Handle Check Price button click
  const handleCheckPrice = () => {
    const quantity = categoryConfig.sizeOptions.length > 0 ? totalQuantity : bulkQuantity;
    calculatePrice(quantity);
  };

  const handleRetryLoad = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('error');
    const qs = params.toString();
    navigate(`/product-booking${qs ? `?${qs}` : ''}`);
  };

  const goToGiftingBookingFlow = () => {
    if (!product) return;
    const qty = categoryConfig.sizeOptions.length > 0 ? totalQuantity : bulkQuantity;
    let breakdown: { size: string; quantity: number }[];
    if (categoryConfig.sizeOptions.length > 0) {
      breakdown = categoryConfig.sizeOptions
        .map((s: string) => ({ size: s, quantity: sizeQuantities[s] ?? 0 }))
        .filter((x) => x.quantity > 0);
      if (breakdown.length === 0) {
        const first = categoryConfig.sizeOptions[0] || 'M';
        breakdown = [{ size: first, quantity: Math.max(product.minQty.tier1, qty || product.minQty.tier1) }];
      }
    } else {
      breakdown = [{ size: 'Standard', quantity: Math.max(product.minQty.tier1, bulkQuantity) }];
    }
    const totalFromBreakdown = breakdown.reduce((s, x) => s + x.quantity, 0);
    const colorName = product.colors[selectedColor]?.name || product.colors[0]?.name || 'Black';
    navigate('/booking-flow', {
      state: {
        product: {
          id: product.id,
          category,
          name: product.name,
          brand: product.brand,
          location: 'India',
          rating: product.rating,
          basePrice: product.pricePerUnit.tier1,
          brandingPrice: 50,
          processingFee: 1000,
          gst: 18,
          image: product.images[0],
          moq: product.minQty.tier1,
          colors: product.colors.map((co) => co.name),
          sizes: categoryConfig.sizeOptions.length > 0 ? categoryConfig.sizeOptions : ['Standard'],
          vendor: product.brand,
          ...(liveListingId && liveVendorId
            ? { listingId: liveListingId, vendorId: liveVendorId }
            : {}),
        },
        customization: {
          productQty: totalFromBreakdown,
          sizeBreakdown: breakdown,
          selectedColors: [colorName],
          uploadedLogo: logoPreview || null,
          logoFileName: logoFile?.name || '',
          logoUploadId,
          brandingMethod,
          brandingPosition: logoPosition,
          requestSample: requestSampleBook,
        },
      },
    });
  };

  // Initialize bulkQuantity with product's minimum quantity
  useEffect(() => {
    if (product && product.minQty) {
      setBulkQuantity(product.minQty.tier1);
    }
  }, [product]);

  // Category-specific reviews
  const categoryReviews = useMemo(() => {
    const reviewsByCategory: Record<ProductCategory, any[]> = {
      apparel: [
        {
          name: 'Priya Sharma',
          role: 'HR Manager, Tech Corp',
          date: 'January 15, 2026',
          rating: 5,
          verified: true,
          review: 'Excellent quality apparel! We ordered 100 pieces for our company event and everyone loved them. The printing quality is top-notch and the fabric is very comfortable. Delivery was on time as promised. Highly recommended for corporate gifting!',
          helpful: 24,
          images: 3,
        },
        {
          name: 'Rajesh Kumar',
          role: 'Procurement Lead, StartupXYZ',
          date: 'January 10, 2026',
          rating: 5,
          verified: true,
          review: 'Great experience with customization. The fabric quality exceeded expectations and our logo embroidery came out perfectly. The fit is true to size and the team loved the professional look.',
          helpful: 18,
          images: 0,
        },
        {
          name: 'Anita Desai',
          role: 'Event Coordinator',
          date: 'January 5, 2026',
          rating: 4,
          verified: true,
          review: 'Very good quality product. The fabric is breathable and comfortable even in warm weather. The only reason for 4 stars is that the delivery took slightly longer than expected. But the quality makes up for it.',
          helpful: 12,
          images: 2,
        },
        {
          name: 'Vikram Mehta',
          role: 'Admin Manager, Enterprise Inc',
          date: 'December 28, 2025',
          rating: 5,
          verified: true,
          review: 'Perfect for corporate events! We\'ve been ordering apparel for the past 2 years and they never disappoint. Consistent quality, great color options, and excellent branding work.',
          helpful: 31,
          images: 0,
        },
        {
          name: 'Sneha Patel',
          role: 'Office Manager',
          date: 'December 20, 2025',
          rating: 4,
          verified: false,
          review: 'Good quality at reasonable price. The fabric is soft and durable. Sizing is accurate. Would recommend for bulk orders.',
          helpful: 8,
          images: 1,
        },
      ],
      bags: [
        {
          name: 'Amit Verma',
          role: 'IT Manager, InfoSystems Ltd',
          date: 'January 18, 2026',
          rating: 5,
          verified: true,
          review: 'Outstanding laptop bags! Ordered 50 units for our tech team. The material is durable, water-resistant, and the compartments are perfectly designed. Our employees love the USB charging port feature.',
          helpful: 32,
          images: 4,
        },
        {
          name: 'Kavita Singh',
          role: 'HR Director, Global Tech',
          date: 'January 12, 2026',
          rating: 5,
          verified: true,
          review: 'These bags are perfect for employee gifting! The quality is premium and the branding came out beautifully. The padded laptop compartment provides excellent protection. Worth every penny.',
          helpful: 21,
          images: 2,
        },
        {
          name: 'Suresh Patel',
          role: 'Procurement Manager',
          date: 'January 8, 2026',
          rating: 4,
          verified: true,
          review: 'Very practical and well-made bags. Multiple compartments make organization easy. Sturdy zippers and quality stitching. Only minor issue was color variation in one batch, but vendor resolved it promptly.',
          helpful: 15,
          images: 3,
        },
        {
          name: 'Neha Gupta',
          role: 'Office Administrator',
          date: 'January 3, 2026',
          rating: 5,
          verified: true,
          review: 'Excellent corporate gift choice! The bags look professional and are highly functional. Employees actually use them daily. The customization options are great for brand visibility.',
          helpful: 19,
          images: 1,
        },
        {
          name: 'Ravi Krishnan',
          role: 'Operations Head',
          date: 'December 27, 2025',
          rating: 5,
          verified: false,
          review: 'High-quality bags at competitive pricing. The material feels premium and the build quality is solid. Perfect for both daily commute and travel.',
          helpful: 11,
          images: 0,
        },
      ],
      tech: [
        {
          name: 'Deepak Rao',
          role: 'CTO, CloudFirst Technologies',
          date: 'January 20, 2026',
          rating: 5,
          verified: true,
          review: 'Fantastic tech accessories! Ordered power banks and wireless chargers for our team. Battery life is impressive, fast charging works perfectly, and the build quality is excellent. Our team uses them daily!',
          helpful: 38,
          images: 5,
        },
        {
          name: 'Meera Reddy',
          role: 'IT Procurement Lead',
          date: 'January 14, 2026',
          rating: 5,
          verified: true,
          review: 'Best tech gift we\'ve given to employees! The devices are reliable, well-designed, and actually useful. Great compatibility with all phones. Branding looks professional and premium.',
          helpful: 26,
          images: 3,
        },
        {
          name: 'Arjun Malhotra',
          role: 'Product Manager',
          date: 'January 9, 2026',
          rating: 4,
          verified: true,
          review: 'Really good quality tech products. Fast charging capability is a standout feature. Battery capacity matches specifications. Packaging is premium which makes it perfect for gifting. Would have given 5 stars if delivery was faster.',
          helpful: 17,
          images: 2,
        },
        {
          name: 'Sanjana Iyer',
          role: 'HR Manager, Digital Solutions',
          date: 'January 2, 2026',
          rating: 5,
          verified: true,
          review: 'Perfect corporate tech gifts! Employees were thrilled with the quality. These are practical, useful gadgets that people actually appreciate. The wireless charging feature is a huge plus.',
          helpful: 22,
          images: 4,
        },
        {
          name: 'Karthik Nair',
          role: 'Admin Executive',
          date: 'December 25, 2025',
          rating: 5,
          verified: false,
          review: 'Excellent value for money. The tech accessories perform as advertised. Great build quality and reliable performance. Highly recommended for bulk corporate orders.',
          helpful: 14,
          images: 1,
        },
      ],
      wellness: [
        {
          name: 'Dr. Aisha Khan',
          role: 'Wellness Head, HealthFirst Corp',
          date: 'January 22, 2026',
          rating: 5,
          verified: true,
          review: 'Outstanding wellness gift hampers! Our employees loved the thoughtful selection of items. The quality is premium and the packaging is beautiful. Perfect for showing employee appreciation and promoting workplace wellness.',
          helpful: 41,
          images: 6,
        },
        {
          name: 'Pooja Menon',
          role: 'HR Director, WellBeing Inc',
          date: 'January 16, 2026',
          rating: 5,
          verified: true,
          review: 'Exceptional wellness products! The quality of each item is top-notch. Employees appreciated the focus on health and self-care. The aromatherapy items and stress relief products were particularly popular.',
          helpful: 28,
          images: 4,
        },
        {
          name: 'Ramesh Shetty',
          role: 'People Operations Manager',
          date: 'January 11, 2026',
          rating: 4,
          verified: true,
          review: 'Very good wellness gift set. The variety is excellent and everything feels premium. Packaging is elegant. The only improvement could be more customization options for the gift selection.',
          helpful: 19,
          images: 3,
        },
        {
          name: 'Lakshmi Iyer',
          role: 'Employee Engagement Lead',
          date: 'January 6, 2026',
          rating: 5,
          verified: true,
          review: 'Perfect for employee wellness initiatives! The products are carefully curated and high quality. Our team loved the yoga accessories and healthy snack options. Great way to show we care about their wellbeing.',
          helpful: 25,
          images: 5,
        },
        {
          name: 'Mohit Kapoor',
          role: 'Office Manager',
          date: 'December 29, 2025',
          rating: 5,
          verified: false,
          review: 'Impressive wellness gifts! Quality products that actually promote health and relaxation. The presentation is professional and the items are practical. Employees genuinely appreciated these gifts.',
          helpful: 16,
          images: 2,
        },
      ],
      stationery: [
        {
          name: 'Anjali Deshmukh',
          role: 'Office Administrator, Creative Hub',
          date: 'January 21, 2026',
          rating: 5,
          verified: true,
          review: 'Premium stationery collection! The notebooks have excellent paper quality, smooth writing experience, and elegant design. Perfect for professional gifting. Our clients loved receiving these branded stationery sets.',
          helpful: 35,
          images: 4,
        },
        {
          name: 'Vivek Sharma',
          role: 'Marketing Manager',
          date: 'January 15, 2026',
          rating: 5,
          verified: true,
          review: 'Outstanding quality stationery! The pens write smoothly, the notebooks are well-bound, and the branding looks professional. Great for client gifting and employee welcome kits.',
          helpful: 23,
          images: 3,
        },
        {
          name: 'Shruti Joshi',
          role: 'HR Executive',
          date: 'January 10, 2026',
          rating: 4,
          verified: true,
          review: 'Very good quality stationery items. Paper quality is excellent, no bleed-through. The custom branding adds a professional touch. Slightly higher price but worth it for the quality.',
          helpful: 18,
          images: 2,
        },
        {
          name: 'Aditya Kulkarni',
          role: 'Procurement Officer',
          date: 'January 4, 2026',
          rating: 5,
          verified: true,
          review: 'Perfect for corporate gifting! The stationery sets look premium and professional. Great attention to detail in packaging. Employees and clients both appreciate receiving these thoughtful gifts.',
          helpful: 27,
          images: 5,
        },
        {
          name: 'Nisha Pillai',
          role: 'Executive Assistant',
          date: 'December 26, 2025',
          rating: 5,
          verified: false,
          review: 'Excellent stationery products! Superior paper quality, elegant design, and durable construction. The branded items create a cohesive professional image. Highly recommended.',
          helpful: 13,
          images: 1,
        },
      ],
    };
    
    return reviewsByCategory[category] || reviewsByCategory.apparel;
  }, [category]);

  // Category-specific vendor descriptions
  const vendorDescription = useMemo(() => {
    const descriptions: Record<ProductCategory, string> = {
      apparel: 'Rodlen is a leading supplier of premium corporate apparel with over 8 years of experience. We specialize in high-quality custom branded clothing for corporations, startups, and enterprises across India. Our extensive apparel collection includes t-shirts, polos, hoodies, jackets, and more, all available with professional branding options like embroidery, screen printing, and heat transfer.',
      bags: 'Rodlen specializes in premium corporate bags and accessories designed for professional use. With 8+ years of expertise, we provide durable, functional bags including laptop bags, backpacks, tote bags, and travel accessories. Our products combine quality materials with practical design, perfect for employee gifting and client appreciation programs.',
      tech: 'Rodlen is your trusted partner for corporate tech accessories and gadgets. We offer a curated selection of premium tech products including power banks, wireless chargers, USB drives, Bluetooth speakers, and smart devices. All items are tested for quality and performance, with options for custom branding to enhance your corporate identity.',
      wellness: 'Rodlen specializes in corporate wellness gifts that promote employee health and wellbeing. Our thoughtfully curated wellness collections include yoga accessories, aromatherapy products, healthy snack hampers, fitness trackers, and self-care items. We help organizations show genuine care for their team\'s physical and mental wellness.',
      stationery: 'Rodlen offers premium corporate stationery solutions for professional gifting. Our extensive range includes high-quality notebooks, elegant pens, desk organizers, planners, and complete stationery sets. Perfect for client gifts, employee welcome kits, and conference giveaways. All items available with custom branding and elegant packaging.',
    };
    
    return descriptions[category] || descriptions.apparel;
  }, [category]);

  // Category-specific vendor specializations
  const vendorSpecializations = useMemo(() => {
    const specs: Record<ProductCategory, string[]> = {
      apparel: ['Custom Apparel', 'Embroidery', 'Screen Printing', 'Bulk Orders', 'All Sizes Available', 'Fast Turnaround'],
      bags: ['Laptop Bags', 'Custom Branding', 'Durable Materials', 'Bulk Discounts', 'Corporate Orders', 'Quality Tested'],
      tech: ['Tech Accessories', 'Latest Gadgets', 'Quality Certified', 'Custom Branding', 'Bulk Pricing', 'Warranty Support'],
      wellness: ['Wellness Products', 'Curated Hampers', 'Premium Quality', 'Custom Packaging', 'Health Focused', 'Employee Care'],
      stationery: ['Premium Stationery', 'Custom Branding', 'Elegant Design', 'Bulk Orders', 'Gift Packaging', 'Professional Quality'],
    };
    
    return specs[category] || specs.apparel;
  }, [category]);

  const handleSizeQuantityChange = (size: string, value: number) => {
    setSizeQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, value),
    }));
  };

  const calculateDeliveryEstimate = (zip: string) => {
    if (zip.length !== 6) {
      setDeliveryEstimate(null);
      setIsDeliveryUnavailable(false);
      setDeliveryZipError('Please enter a valid 6-digit delivery pin code.');
      return;
    }

    // Clear errors once we have a valid-length PIN.
    setDeliveryZipError('');
    setIsDeliveryUnavailable(false);
    
    // Metro cities get faster delivery
    const metroCities = ['110', '400', '560', '600', '700', '800']; // Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad
    const isMetro = metroCities.some(code => zip.startsWith(code));

    // Demo: some PIN ranges are treated as temporarily unavailable.
    const zipNum = Number(zip);
    if (!Number.isNaN(zipNum) && zipNum % 13 === 0) {
      setDeliveryEstimate(null);
      setIsDeliveryUnavailable(true);
      setDeliveryZipError('Delivery is currently unavailable for the selected pin code. Please try another PIN.');
      return;
    }
    
    const businessDays = isMetro ? 5 : 7;
    const today = new Date();
    let deliveryDate = new Date(today);
    let daysAdded = 0;
    
    // Add business days (skip weekends)
    while (daysAdded < businessDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const dayOfWeek = deliveryDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sunday (0) and Saturday (6)
        daysAdded++;
      }
    }
    
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    setDeliveryEstimate({ date: formattedDate, days: businessDays });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoUploadError(null);

    // Always show local preview immediately so the UI is responsive even
    // before the network round-trip resolves.
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Persist to Supabase Storage + record metadata when the buyer is signed
    // into a corporate account. Anonymous demo sessions fall back to the
    // local-only preview (no upload row, no selection row).
    if (!corporateId || !user?.id) return;
    setLogoUploading(true);
    const { data, error } = await uploadBrandingLogo(corporateId, user.id, file);
    setLogoUploading(false);
    if (error) {
      setLogoUploadError(error);
      setLogoUploadId(null);
      return;
    }
    if (data) {
      setLogoUploadId(data.id);
      // Prefer the public URL so the preview survives a page reload.
      setLogoPreview(data.public_url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen h-screen bg-[#FFFDF9] overflow-hidden">
        <SharedSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader
            onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            searchPlaceholder="Search "
          />
          <MogzuCorporateScrollSurface>
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
                <p className="text-sm text-[#878e9e]">Loading product details...</p>
              </div>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen h-screen bg-[#FFFDF9] overflow-hidden">
        <SharedSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader
            onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            searchPlaceholder="Search "
          />
          <MogzuCorporateScrollSurface>
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
                <p className="text-sm text-[#475569] mb-4">{loadError}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleRetryLoad}
                    className="px-5 py-2.5 border border-[#e5e7eb] text-[#0e1e3f] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/gifting-shop')}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Back to shop
                  </button>
                </div>
              </div>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen h-screen bg-[#FFFDF9] overflow-hidden">
        <SharedSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader
            onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            searchPlaceholder="Search "
          />
          <MogzuCorporateScrollSurface>
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0e1e3f] mb-2">Product unavailable</h2>
                <p className="text-sm text-[#878e9e] mb-5">
                  We couldn't find that item. Please return to the shop and pick another product.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/gifting-shop')}
                  className="px-6 py-2.5 bg-[#2563eb] text-white rounded-md text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                >
                  Browse products
                </button>
              </div>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

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
          {usingDemoCatalog ? (
            <div className="max-w-7xl mx-auto px-6 pt-4">
              <DevMockDataBanner />
            </div>
          ) : null}
          {/* Breadcrumb */}
          <div className="bg-white border-b border-[#ececec]">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs min-w-0">
                <button type="button" onClick={() => navigate('/dashboard')} className="text-[#4379ee] hover:underline shrink-0">
                  Activity Suite
                </button>
                <ChevronDown className="w-3 h-3 text-[#878e9e] rotate-[-90deg] shrink-0" />
                <button type="button" onClick={() => navigate('/gifting')} className="text-[#4379ee] hover:underline shrink-0">
                  Gifting
                </button>
                <ChevronDown className="w-3 h-3 text-[#878e9e] rotate-[-90deg] shrink-0" />
                <button type="button" onClick={() => navigate('/gifting-shop')} className="text-[#4379ee] hover:underline shrink-0">
                  Shop
                </button>
                <ChevronDown className="w-3 h-3 text-[#878e9e] rotate-[-90deg] shrink-0" />
                <span className="text-[#0e1e3f] break-words min-w-0">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <ChevronDown className="w-3 h-3 text-[#878e9e] rotate-[-90deg] shrink-0" />
                <span className="text-[#878e9e] break-words min-w-0">Rodlen</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-6">
              {/* Left - Product Images */}
              <div>
                <div className="bg-white rounded-lg overflow-hidden mb-3">
                  <ImageWithFallback
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-72 object-cover"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`rounded-lg overflow-hidden transition-all ${
                        selectedImage === index ? 'ring-2 ring-[#2563eb]' : ''
                      }`}
                    >
                      <ImageWithFallback src={image} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right - Product Info */}
              <div>
                <p className="text-xs text-[#878e9e] mb-1">{product.brand}</p>
                <h1 className="text-lg font-semibold text-[#0e1e3f] mb-1.5">{product.name}</h1>
                <p className="text-xs text-[#475569] mb-3">With Your Choice of Color, and Logo at Artwork</p>

                {/* Rating */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 32 32" fill="none">
                        <path d={svgPaths.p1f20c3c0} fill="#FFCC47" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-[#475569]">{product.rating} out of {product.reviews}</span>
                  <button
                    type="button"
                    onClick={() => setRatingsFeedback('Detailed ratings will be available soon. You can still proceed with vendor chat for references.')}
                    className="text-xs text-[#2563eb] underline font-medium"
                  >
                    See ratings
                  </button>
                </div>
                {ratingsFeedback && (
                  <p className="text-[10px] text-[#475569] mb-2">{ratingsFeedback}</p>
                )}

                {/* Price */}
                <div className="mb-3">
                  <span className="text-xl font-bold text-[#0e1e3f]">₹{product.price}</span>
                  <div className="mt-1 text-xs text-[#475569]">
                    <p>
                      Get special offer{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'chat' } })}
                        className="text-[#2563eb] underline"
                      >
                        Chat now
                      </button>
                    </p>
                  </div>
                </div>

                {vendorCatalogRow && vendorDetailRich && vendorBuyerDetail ? (
                  <div className="mb-3 rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setVendorPoliciesOpen((o) => !o)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold text-[#0e1e3f] hover:bg-slate-50"
                    >
                      <span>Vendor catalogue · policies &amp; payment</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${vendorPoliciesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {vendorPoliciesOpen ? (
                      <div className="px-3 pb-3 pt-0 space-y-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-500">
                          Linked row: {vendorCatalogRow.name} · SKU {vendorCatalogRow.productId}
                        </p>
                        {vendorBuyerDetail.amenities.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Amenities</p>
                            <ul className="text-xs text-[#475569] space-y-0.5 list-disc list-inside">
                              {vendorBuyerDetail.amenities.map((a) => (
                                <li key={a}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {vendorBuyerDetail.policies.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Policies</p>
                            <ul className="text-xs text-[#475569] space-y-0.5 list-disc list-inside">
                              {vendorBuyerDetail.policies.map((p) => (
                                <li key={p}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {vendorBuyerDetail.portfolio_links.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Portfolio</p>
                            <ul className="text-xs space-y-1">
                              {vendorBuyerDetail.portfolio_links.map((url) => (
                                <li key={url}>
                                  <a href={url} className="text-[#2563eb] underline break-all" target="_blank" rel="noreferrer">
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div>
                          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-1">Payment</p>
                          {vendorBuyerDetail.payment_methods.length > 0 ? (
                            <p className="text-xs text-[#475569]">{vendorBuyerDetail.payment_methods.join(', ')}</p>
                          ) : null}
                          {vendorBuyerDetail.payment_terms.trim() ? (
                            <p className="text-xs text-[#475569] mt-1 whitespace-pre-wrap">{vendorBuyerDetail.payment_terms}</p>
                          ) : null}
                          {formatBuyerPaymentSummary(vendorBuyerDetail) ? (
                            <p className="text-[10px] text-slate-500 mt-2">{formatBuyerPaymentSummary(vendorBuyerDetail)}</p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Quantity Pricing */}
                <div className="mb-3 bg-white rounded-lg border border-[#ececec] p-3">
                  <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Quantity</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#878e9e]">{product.minQty.tier1}-{product.minQty.tier2 - 1}</span>
                      <span className="text-[#0e1e3f] font-medium">₹{product.pricePerUnit.tier1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#878e9e]">{product.minQty.tier2}-{product.minQty.tier3 - 1}</span>
                      <span className="text-[#0e1e3f] font-medium">₹{product.pricePerUnit.tier2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#878e9e]">More than {product.minQty.tier3}</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomizeModal(true)}
                        className="text-[#2563eb] font-medium underline text-xs"
                      >
                        Get a quote
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-[#0e1e3f] mb-2">{categoryConfig.colorLabel}</h3>
                    <div className="flex gap-2">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSelectedColor(index);
                            setSelectedImage(0); // Reset to first image when color changes
                          }}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === index ? 'border-[#2563eb]' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimate Delivery Date */}
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-[#0e1e3f] mb-1.5">Estimate delivery date</h3>
                  <p className="text-xs text-[#878e9e] mb-2">Enter your delivery pin code for estimated date</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter zip code"
                      value={zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setZipCode(value);
                        if (value.length === 6) {
                          calculateDeliveryEstimate(value);
                        } else {
                          setDeliveryEstimate(null);
                          setDeliveryZipError('');
                          setIsDeliveryUnavailable(false);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-[#dde2e4] rounded-md text-xs text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                    <button
                      type="button"
                      onClick={() => calculateDeliveryEstimate(zipCode)}
                      className="px-3 py-2 bg-[#2563eb] text-white rounded-md font-medium text-xs hover:bg-[#1d4ed8] transition-colors"
                    >
                      Check
                    </button>
                  </div>

                  {deliveryZipError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-red-700 font-medium">
                        {isDeliveryUnavailable ? deliveryZipError : deliveryZipError}
                      </p>
                    </div>
                  )}
                  
                  {deliveryEstimate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-green-900">
                            Expected Delivery: <span className="font-bold">{deliveryEstimate.date}</span>
                          </p>
                          <p className="text-xs text-green-700 mt-0.5">
                            {deliveryEstimate.days} business days from order confirmation
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vendor Contact */}
                <div className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-[#ececec]">
                  {/* Determine if chat with vendor or Mogzu agent based on product category */}
                  {(category === 'apparel' || category === 'bags') ? (
                    // Chat with Vendor
                    <>
                      <div className="flex items-center gap-2.5 flex-1">
                        <img src={imgVendorAvatar} alt="Michiel" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-xs font-semibold text-[#0e1e3f]">Michiel</p>
                          <p className="text-xs text-[#878e9e]">Vendor Representative</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'chat', vendor: 'vendor' } })}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white text-xs font-medium rounded-md hover:bg-[#1d4ed8] transition-colors min-w-[90px]"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'callback', vendor: 'vendor' } })}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#2563eb] text-[#2563eb] text-xs font-medium rounded-md hover:bg-[#eff6ff] transition-colors min-w-[90px]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Callback
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'email', vendor: 'vendor' } })}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#2563eb] text-[#2563eb] text-xs font-medium rounded-md hover:bg-[#eff6ff] transition-colors min-w-[90px]"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </button>
                      </div>
                    </>
                  ) : (
                    // Chat with Mogzu Agent
                    <>
                      <div className="flex items-center gap-2.5 flex-1">
                        <img src={imgAvatar} alt="Mogzu Agent" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-xs font-semibold text-[#0e1e3f]">Mogzu Support</p>
                          <p className="text-xs text-[#878e9e]">Customer Care Agent</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'chat', vendor: 'mogzu-agent' } })}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#ff6b2c] text-white text-xs font-medium rounded-md hover:bg-[#e55a1f] transition-colors min-w-[90px]"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'callback', vendor: 'mogzu-agent' } })}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#ff6b2c] text-[#ff6b2c] text-xs font-medium rounded-md hover:bg-[#fff5f0] transition-colors min-w-[90px]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Callback
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'email', vendor: 'mogzu-agent' } })}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#ff6b2c] text-[#ff6b2c] text-xs font-medium rounded-md hover:bg-[#fff5f0] transition-colors min-w-[90px]"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Customise Button */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomizeModal(true)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white rounded-lg text-sm font-semibold hover:from-[#ff5722] hover:to-[#ff6b35] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Customise with Your Logo
                  </button>
                </div>

                {/* Action Buttons */}
                <div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goToGiftingBookingFlow}
                      disabled={zipCode.length === 6 && !deliveryEstimate}
                      className="flex-1 px-4 py-2 bg-[#2563eb] text-white rounded-full text-sm font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:hover:bg-[#2563eb]"
                    >
                      Start order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCartNotice('Added to cart. Continue shopping in Shop or start your order when ready.');
                      }}
                      className="flex-1 px-4 py-2 bg-white border border-[#ececec] text-[#0e1e3f] rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Add to cart
                    </button>
                  </div>
                  {cartNotice && (
                    <p className="text-xs text-emerald-700 mt-2 text-center">{cartNotice}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mb-6">
              <div className="flex gap-6 border-b border-[#ececec] mb-4" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`product-booking-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === tab.id}
                    aria-controls={`product-booking-panel-${tab.id}`}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`pb-2 text-sm font-medium transition-colors ${
                      selectedTab === tab.id
                        ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                        : 'text-[#878e9e]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {selectedTab === 'overview' && (
                <div
                  role="tabpanel"
                  id="product-booking-panel-overview"
                  aria-labelledby="product-booking-tab-overview"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Description</h3>
                    <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line mb-4">
                      {product.description}
                    </p>

                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Product specifications</h3>
                    <div className="space-y-1.5">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex border-b border-[#ececec] pb-1.5">
                          <span className="w-1/2 text-xs text-[#0e1e3f] capitalize font-medium">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="w-1/2 text-xs text-[#475569]">{value}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-sm font-semibold text-[#0e1e3f] mt-4 mb-2">Additional information</h3>
                    <ul className="space-y-1.5">
                      {product.additionalInfo.map((info, index) => (
                        <li key={index} className="text-xs text-[#475569] pl-3 relative before:content-['•'] before:absolute before:left-0">
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add details for price */}
                  <div className="bg-white rounded-lg border border-[#ececec] p-4 h-fit shadow-sm">
                    <div className="bg-[#f6f6f8] -mx-4 -mt-4 px-3 py-2.5 mb-3 opacity-80">
                      <h3 className="text-sm font-medium text-[#0e1e3f]">Vendor Response Status</h3>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                      <PricingBlock
                        mode="negotiable"
                        price={`₹${product.price}`}
                        priceUnit="/piece"
                        onSubmitOffer={(offer, message) => {
                          const qty =
                            categoryConfig.sizeOptions.length > 0
                              ? Math.max(totalQuantity, product.minQty.tier1)
                              : Math.max(bulkQuantity, product.minQty.tier1);
                          appendCorpVendorEnquiry({
                            corporateCompanyName: getCorporateCompanyDisplayName(),
                            requirementSummary:
                              message.trim() ||
                              `Negotiated offer for ${product.name} (${category}). Vendor list price reference: ₹${product.price}/unit.`,
                            requestedDate: 'Flexible (confirm with vendor)',
                            durationLabel: 'Per order / shipment window',
                            headcountOrQty: qty,
                            offerAmountDisplay: `₹${offer} (negotiable)`,
                            productId: product.id,
                            productName: product.name,
                            source: 'product-booking-offer',
                          });
                          setVendorNotice(
                            `Offer of ₹${offer} submitted${message.trim() ? ' with your note.' : '.'} The vendor will review it.`,
                          );
                        }}
                        onCheckAvailability={() => {
                          setVendorNotice('Checking availability with the vendor…');
                          const qty =
                            categoryConfig.sizeOptions.length > 0
                              ? Math.max(totalQuantity, product.minQty.tier1)
                              : Math.max(bulkQuantity, product.minQty.tier1);
                          appendCorpVendorEnquiry({
                            corporateCompanyName: getCorporateCompanyDisplayName(),
                            requirementSummary: `Availability check for ${product.name} (${category}).`,
                            requestedDate: 'Flexible (confirm with vendor)',
                            durationLabel: '—',
                            headcountOrQty: qty,
                            offerAmountDisplay: null,
                            productId: product.id,
                            productName: product.name,
                            source: 'product-booking-availability',
                          });
                          window.setTimeout(() => {
                            setVendorNotice(
                              'Availability check sent. Watch the response status below for updates.',
                            );
                          }, 1200);
                        }}
                      />
                      {vendorNotice && (
                        <p
                          className="text-xs text-[#0e1e3f] bg-[#f0f9ff] border border-[#2563eb]/20 rounded-md px-3 py-2"
                          role="status"
                        >
                          {vendorNotice}
                        </p>
                      )}

                      <div className="space-y-3">
                        <ResponseStatusBanner
                          status={latestCorpVendorEnquiry?.responseStatus ?? 'awaiting'}
                          comment={latestCorpVendorEnquiry?.vendorComment}
                          productId={product.id}
                          vendorOrderId={latestCorpVendorEnquiry?.vendorOrderId}
                        />
                        {latestCorpVendorEnquiry?.bookingConfirmedAt ? (
                          <p
                            className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2"
                            role="status"
                          >
                            Booking confirmed — reference {latestCorpVendorEnquiry.vendorOrderId}. Vendor has the
                            same status on their order.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="bg-[#f6f6f8] -mx-4 px-3 py-2.5 mb-3 opacity-80">
                      <h3 className="text-sm font-medium text-[#0e1e3f]">Add details for price</h3>
                    </div>

                    <div className="space-y-3 mb-3">
                      <p className="text-xs text-[#878e9e]">
                        Min Quantity: <span className="text-[#ef4444] font-semibold">{product.minQty.tier1}</span>
                      </p>
                      
                      {categoryConfig.sizeOptions.length > 0 && (
                        <>
                          <p className="text-xs font-semibold text-[#0e1e3f]">Choose size quantities</p>
                          <div className="grid grid-cols-3 gap-2">
                            {categoryConfig.sizeOptions.map((size: string) => (
                              <div key={size} className="space-y-1">
                                <label className="text-xs text-[#0e1e3f] font-medium">{size}</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={sizeQuantities[size] || 0}
                                  onChange={(e) => handleSizeQuantityChange(size, parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 border-b border-[#ececec] text-xs text-[#878e9e] focus:outline-none focus:border-[#2563eb]"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[#0e1e3f]">
                            Total: <span className="font-semibold">{totalQuantity}</span>
                          </p>
                        </>
                      )}
                      
                      {categoryConfig.sizeOptions.length === 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#0e1e3f]">Quantity</p>
                          <input
                            type="number"
                            min={product.minQty.tier1}
                            value={bulkQuantity}
                            onChange={(e) => setBulkQuantity(parseInt(e.target.value) || product.minQty.tier1)}
                            className="w-full px-3 py-2 border border-[#ececec] rounded-md text-xs text-[#0e1e3f] focus:outline-none focus:border-[#2563eb]"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckPrice}
                      className="w-full px-4 py-2 bg-[#2563eb] text-white rounded-full text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
                    >
                      Check Price
                    </button>
                    {priceNotice && (
                      <p className="text-xs text-[#b45309] mt-2 text-center">{priceNotice}</p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowCustomizeModal(true)}
                      className="w-full mt-2 text-xs text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors font-medium"
                    >
                      Customize
                    </button>

                    {/* Price Breakdown Display */}
                    {showPriceBreakdown && calculatedPrice && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] rounded-lg border border-[#2563eb]/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-[#0e1e3f]">Price Breakdown</h4>
                          <span className="px-2 py-1 bg-[#2563eb] text-white text-[10px] font-bold rounded">
                            {calculatedPrice.tier === 'tier3' ? 'TIER 3' : calculatedPrice.tier === 'tier2' ? 'TIER 2' : 'TIER 1'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#475569]">Quantity:</span>
                            <span className="font-semibold text-[#0e1e3f]">{calculatedPrice.quantity} units</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#475569]">Price per unit:</span>
                            <span className="font-semibold text-[#0e1e3f]">₹{calculatedPrice.pricePerUnit.toFixed(2)}</span>
                          </div>
                          {calculatedPrice.discount > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-[#475569]">Discount:</span>
                              <span className="font-semibold text-[#16a34a]">{calculatedPrice.discount}% OFF</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-[#2563eb]/20">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-[#0e1e3f]">Total Price:</span>
                              <span className="font-bold text-[#2563eb] text-lg">₹{calculatedPrice.totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tier Information */}
                        <div className="bg-white/60 rounded p-2">
                          <p className="text-[10px] text-[#475569] mb-1 font-medium">Unlock better pricing:</p>
                          <div className="space-y-1">
                            {calculatedPrice.tier !== 'tier2' && (
                              <p className="text-[10px] text-[#0e1e3f]">
                                • Order {product.minQty.tier2}+ units: Save 10%
                              </p>
                            )}
                            {calculatedPrice.tier !== 'tier3' && (
                              <p className="text-[10px] text-[#0e1e3f]">
                                • Order {product.minQty.tier3}+ units: Save 20%
                              </p>
                            )}
                            {calculatedPrice.tier === 'tier3' && (
                              <p className="text-[10px] text-[#16a34a] font-semibold">
                                ✓ Maximum discount unlocked!
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === 'amenities' && (
                <div
                  role="tabpanel"
                  id="product-booking-panel-amenities"
                  aria-labelledby="product-booking-tab-amenities"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Specifications</h3>
                    <div className="space-y-1.5">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex border-b border-[#ececec] pb-1.5">
                          <span className="w-1/2 text-xs text-[#0e1e3f] capitalize font-medium">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="w-1/2 text-xs text-[#475569]">{value as React.ReactNode}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-sm font-semibold text-[#0e1e3f] mt-4 mb-2">Additional Information</h3>
                    <ul className="space-y-1.5">
                      {product.additionalInfo.map((info, index) => (
                        <li key={index} className="text-xs text-[#475569] pl-3 relative before:content-['•'] before:absolute before:left-0">
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedTab === 'portfolio' && (
                <div
                  role="tabpanel"
                  id="product-booking-panel-portfolio"
                  aria-labelledby="product-booking-tab-portfolio"
                  className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-[#0e1e3f] mb-6">About the Vendor</h3>
                    
                    <div className="bg-white rounded-xl border border-[#ececec] p-6 mb-6">
                      <div className="flex items-start gap-4 mb-6">
                        <img src={imgVendorAvatar} alt="Rodlen" className="w-16 h-16 rounded-full" />
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-[#0e1e3f] mb-1">Rodlen Corporate Gifting</h4>
                          <p className="text-base text-[#878e9e] mb-2">Premium Corporate Gifting Solutions</p>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-[#dcfce7] text-[#16a34a] text-sm rounded-full font-medium">
                              Verified Vendor
                            </span>
                            <span className="text-sm text-[#878e9e]">Since 2015</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-[#ececec]">
                        <div>
                          <p className="text-2xl font-bold text-[#2563eb] mb-1">98%</p>
                          <p className="text-sm text-[#878e9e]">Customer Satisfaction</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#2563eb] mb-1">2,500+</p>
                          <p className="text-sm text-[#878e9e]">Orders Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#2563eb] mb-1">&lt; 2 hrs</p>
                          <p className="text-sm text-[#878e9e]">Average Response Time</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-base font-semibold text-[#0e1e3f] mb-2">Company Overview</h5>
                          <p className="text-base text-[#475569] leading-relaxed">
                            {vendorDescription}
                          </p>
                        </div>

                        <div>
                          <h5 className="text-base font-semibold text-[#0e1e3f] mb-2">Specialization</h5>
                          <div className="flex flex-wrap gap-2">
                            {vendorSpecializations.map((spec) => (
                              <span key={spec} className="px-3 py-1.5 bg-[#f1f5f9] text-[#475569] text-sm rounded-lg">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-base font-semibold text-[#0e1e3f] mb-2">Certifications</h5>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-base text-[#475569]">
                              <svg className="w-5 h-5 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              ISO 9001:2015 Certified
                            </li>
                            <li className="flex items-center gap-2 text-base text-[#475569]">
                              <svg className="w-5 h-5 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Make in India Certified
                            </li>
                            <li className="flex items-center gap-2 text-base text-[#475569]">
                              <svg className="w-5 h-5 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              SEDEX Ethical Trade Certified
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-base font-semibold text-[#0e1e3f] mb-2">Service Capacity</h5>
                          <p className="text-base text-[#475569]">
                            Production Capacity: <span className="font-medium text-[#0e1e3f]">10,000+ units/month</span><br />
                            Minimum Order Quantity: <span className="font-medium text-[#0e1e3f]">25 pieces</span><br />
                            Lead Time: <span className="font-medium text-[#0e1e3f]">7-10 business days</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#ececec] p-6">
                      <h4 className="text-lg font-semibold text-[#0e1e3f] mb-4">Business Address</h4>
                      <p className="text-base text-[#475569] mb-4">
                        Rodlen Corporate Solutions Pvt. Ltd.<br />
                        Plot No. 45, Sector 18, Industrial Area<br />
                        Gurugram, Haryana - 122015<br />
                        India
                      </p>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-base text-[#475569]">
                          <Phone className="w-4 h-4" />
                          +91-9876254321
                        </p>
                        <p className="flex items-center gap-2 text-base text-[#475569]">
                          <Mail className="w-4 h-4" />
                          sales@rodlen.com
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-white rounded-xl border border-[#ececec] p-6 sticky top-6">
                      <h4 className="text-lg font-semibold text-[#0e1e3f] mb-4">Contact Vendor</h4>
                      <div className="space-y-4 mb-6">
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'vendor-message' } })}
                          className="w-full px-6 py-3 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors"
                        >
                          Send Message
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'vendor-callback' } })}
                          className="w-full px-6 py-3 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Request Callback
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'vendor-quote' } })}
                          className="w-full px-6 py-3 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Request Quote
                        </button>
                      </div>

                      <div className="pt-6 border-t border-[#ececec]">
                        <h5 className="text-base font-semibold text-[#0e1e3f] mb-3">Business Hours</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#878e9e]">Monday - Friday</span>
                            <span className="text-[#0e1e3f]">9:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#878e9e]">Saturday</span>
                            <span className="text-[#0e1e3f]">10:00 AM - 4:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#878e9e]">Sunday</span>
                            <span className="text-[#ef4444]">Closed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'tc' && (
                <div
                  role="tabpanel"
                  id="product-booking-panel-tc"
                  aria-labelledby="product-booking-tab-tc"
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl border border-[#ececec] p-6">
                    <h3 className="text-xl font-bold text-[#0e1e3f] mb-6">Terms & Conditions</h3>
                    <div className="space-y-4 text-sm text-[#475569]">
                      <div className="mb-4">
                        <h4 className="font-bold text-[#0e1e3f] mb-2">1. Order Placement & Modifications</h4>
                        <p>All orders are subject to acceptance by Mogzu. Once an order is placed and the digital proof is approved, it enters production and cannot be modified or canceled without incurring fees for work already completed.</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-[#0e1e3f] mb-2">2. Minimum Order Quantities (MOQ)</h4>
                        <p>Products are subject to the Minimum Order Quantities specified on the listing. Requests below MOQ may be accommodated at the vendor's discretion with applicable surcharge fees.</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-[#0e1e3f] mb-2">3. Production & Delivery</h4>
                        <p>Estimated production and delivery timelines begin only after written approval of the digital artwork proof and receipt of the required deposit. We are not responsible for delays caused by carrier disruptions, customs, or unforeseen circumstances.</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-[#0e1e3f] mb-2">4. Returns & Claims</h4>
                        <p>Custom branded merchandise cannot be returned or exchanged unless there is a material defect or a printing error that significantly deviates from the approved digital proof. Claims must be submitted within 7 days of order receipt.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'payment' && (
                <div
                  role="tabpanel"
                  id="product-booking-panel-payment"
                  aria-labelledby="product-booking-tab-payment"
                  className="space-y-6"
                >
                  {/* Payment Terms Section */}
                  <div className="bg-white rounded-lg border border-[#ececec] p-4">
                    <h3 className="text-base font-semibold text-[#0e1e3f] mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Payment Terms & Conditions
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Accepted Payment Methods */}
                      <div>
                        <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Accepted Payment Methods
                        </h4>
                        <div className="space-y-2">
                          {[
                            { method: 'Purchase Order (PO)', desc: 'For empanelled corporate clients', badge: 'PO', color: '#4379ee' },
                            { method: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex, RuPay', badge: 'CARD', color: '#10b981' },
                            { method: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm', badge: 'UPI', color: '#8b5cf6' },
                            { method: 'Net Banking', desc: 'All major banks supported', badge: 'BANK', color: '#f59e0b' },
                            { method: 'Corporate Credit', desc: 'For pre-approved companies', badge: 'CREDIT', color: '#ef4444' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-[#f8fafc] rounded-lg border border-[#e2e5ed] hover:border-[#4379ee]/30 transition-all">
                              <div className="w-12 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                                <span className="text-[9px] font-bold tracking-wide" style={{ color: item.color }}>{item.badge}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#0e1e3f]">{item.method}</p>
                                <p className="text-[10px] text-[#878e9e] leading-tight">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Schedule */}
                      <div>
                        <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Payment Schedule Options
                        </h4>
                        <div className="space-y-2">
                          <div className="p-2.5 bg-[#f0fdf4] rounded-lg border border-[#86efac] hover:border-[#16a34a] transition-all">
                            <div className="flex items-center gap-1.5 mb-1">
                              <p className="text-xs font-semibold text-[#0e1e3f]">Full Payment Upfront</p>
                              <span className="px-1.5 py-0.5 bg-[#16a34a] text-white text-[9px] font-bold rounded uppercase tracking-wide">15% OFF</span>
                            </div>
                            <p className="text-[10px] text-[#475569] leading-tight mb-1">Pay 100% at order placement</p>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <p className="text-[10px] text-[#16a34a] font-semibold">Best Price Guaranteed</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-[#fffbeb] rounded-lg border border-[#fde68a] hover:border-[#f59e0b] transition-all">
                            <div className="flex items-center gap-1.5 mb-1">
                              <p className="text-xs font-semibold text-[#0e1e3f]">Partial Payment (50-50)</p>
                              <span className="px-1.5 py-0.5 bg-[#f59e0b] text-white text-[9px] font-bold rounded uppercase tracking-wide">POPULAR</span>
                            </div>
                            <p className="text-[10px] text-[#475569] leading-tight mb-1">50% upfront, 50% before delivery</p>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <p className="text-[10px] text-[#d97706] font-semibold">Flexible Payment Option</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e5ed] hover:border-[#4379ee] transition-all">
                            <p className="text-xs font-semibold text-[#0e1e3f] mb-1">Corporate Credit (30-60 Days)</p>
                            <p className="text-[10px] text-[#475569] leading-tight mb-1">Available for approved corporate accounts</p>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <p className="text-[10px] text-[#4379ee] font-semibold">Credit Verification Required</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="mt-4 pt-4 border-t border-[#e2e5ed]">
                      <h4 className="text-xs font-semibold text-[#0e1e3f] mb-3">Terms & Conditions</h4>
                      <div className="grid md:grid-cols-2 gap-x-4 gap-y-3">
                        {[
                          {
                            title: 'Order Cancellation',
                            items: [
                              'Free cancellation within 24 hours of order',
                              '50% refund if cancelled before production',
                              'No refund after production starts'
                            ]
                          },
                          {
                            title: 'Refund Policy',
                            items: [
                              'Refunds processed within 5-7 business days',
                              'Credited to original payment method',
                              'Quality issues: Full refund + replacement'
                            ]
                          },
                          {
                            title: 'Late Payment',
                            items: [
                              '2% late fee after grace period',
                              'Grace period: 5 business days',
                              'Delivery held until payment cleared'
                            ]
                          },
                          {
                            title: 'Invoice & GST',
                            items: [
                              'GST invoice provided with all orders',
                              'Input tax credit eligible',
                              'Tax compliance certificate available'
                            ]
                          },
                        ].map((section, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <h5 className="text-[10px] font-semibold text-[#0e1e3f] flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#4379ee]/10 flex items-center justify-center">
                                <svg className="w-2 h-2 text-[#4379ee]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              {section.title}
                            </h5>
                            <ul className="space-y-1 ml-4.5">
                              {section.items.map((item, i) => (
                                <li key={i} className="text-[10px] text-[#475569] leading-relaxed relative before:content-[''] before:absolute before:-left-2.5 before:top-[6px] before:w-1 before:h-1 before:rounded-full before:bg-[#cbd5e1]">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security & Trust */}
                    <div className="mt-4 pt-4 border-t border-[#e2e5ed]">
                      <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2.5">Security & Trust</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'SSL Secured', desc: '256-bit encryption', icon: 'lock' },
                          { label: 'PCI DSS Compliant', desc: 'Level 1 certified', icon: 'shield' },
                          { label: 'Fraud Protection', desc: '3D Secure enabled', icon: 'check-shield' },
                          { label: 'Money-Back Guarantee', desc: 'Quality Guaranteed', icon: 'badge' },
                        ].map((trust, idx) => (
                          <div key={idx} className="flex items-start gap-2 px-2 py-2 bg-[#f8fafc] rounded-lg border border-[#e2e5ed]">
                            <div className="w-6 h-6 rounded bg-[#4379ee]/10 flex items-center justify-center flex-shrink-0">
                              {trust.icon === 'lock' && (
                                <svg className="w-4 h-4 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              )}
                              {trust.icon === 'shield' && (
                                <svg className="w-4 h-4 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              )}
                              {trust.icon === 'check-shield' && (
                                <svg className="w-4 h-4 text-[#4379ee]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {trust.icon === 'badge' && (
                                <svg className="w-4 h-4 text-[#4379ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-[#0e1e3f] leading-tight">{trust.label}</p>
                              <p className="text-[9px] text-[#878e9e] leading-tight mt-0.5">{trust.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Support */}
                    <div className="mt-4 p-3 bg-gradient-to-br from-[#ebf1ff] to-[#f8fafc] rounded-lg border border-[#4379ee]/20">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#4379ee] to-[#3568dd] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#0e1e3f] mb-0.5">Payment Support Available</p>
                          <p className="text-[10px] text-[#475569] leading-relaxed mb-2">Our dedicated team is ready to assist with payment queries and concerns.</p>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate('/communication', { state: { source: 'product-booking', category, channel: 'support' } })}
                              className="px-3 py-1.5 bg-[#4379ee] text-white rounded-lg text-[10px] font-semibold hover:bg-[#3568dd] transition-all shadow-sm"
                            >
                              Contact Support
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/assistance', { state: { source: 'product-booking', category, topic: 'payment-faq' } })}
                              className="px-3 py-1.5 bg-white border border-[#e2e5ed] text-[#475569] rounded-lg text-[10px] font-semibold hover:border-[#4379ee] hover:text-[#4379ee] transition-all"
                            >
                              View FAQ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment section removed - will come later in booking flow */}
                </div>
              )}
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-xl border border-[#ececec] p-8 mb-6">
              <h3 className="text-2xl font-semibold text-[#0e1e3f] mb-6">
                Related {
                  category === 'apparel' ? 'Apparel' :
                  category === 'bags' ? 'Bags' :
                  category === 'tech' ? 'Tech Accessories' :
                  category === 'wellness' ? 'Wellness Items' :
                  category === 'stationery' ? 'Stationery Items' : 'Products'
                }
              </h3>
              <RelatedProducts products={relatedProducts} />
            </div>
          </div>

          {/* Customization Modal */}
          {showCustomizeModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-[#ececec] px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0e1e3f]">Customize Your Product</h2>
                    <p className="text-sm text-[#878e9e] mt-0.5">Upload your logo and choose branding options</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close customization"
                    onClick={() => setShowCustomizeModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
                    {/* Left Column - Mock Display */}
                    <div>
                      <h3 className="text-base font-semibold text-[#0e1e3f] mb-3">Preview</h3>
                      
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-4 border border-gray-200">
                          <div className="text-center mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">Live Preview</h4>
                            <p className="text-xs text-gray-600">See your logo on the product</p>
                          </div>
                          
                          <div className="relative bg-white rounded-lg p-3 shadow-inner">
                            <img
                              src={product.images[selectedImage]}
                              alt={product.name}
                              className="w-full h-[300px] object-cover rounded-lg"
                            />
                            
                            {/* Logo Overlay */}
                            {logoPreview && (
                              <div
                                className={`absolute ${
                                  // Apparel positions
                                  (category === 'apparel' && logoPosition === 'center-chest') ? 'top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                  (category === 'apparel' && logoPosition === 'left-chest') ? 'top-1/4 left-1/4 -translate-x-1/2' :
                                  (category === 'apparel' && logoPosition === 'sleeve') ? 'top-1/4 right-1/4 translate-x-1/2' :
                                  // Bags positions
                                  (category === 'bags' && logoPosition === 'front') ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                  (category === 'bags' && logoPosition === 'side') ? 'top-1/3 right-1/4' :
                                  (category === 'bags' && logoPosition === 'strap') ? 'top-1/4 left-1/2 -translate-x-1/2' :
                                  (category === 'bags' && logoPosition === 'interior') ? 'bottom-1/4 left-1/2 -translate-x-1/2' :
                                  // Tech positions
                                  (category === 'tech' && logoPosition === 'back') ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                  (category === 'tech' && logoPosition === 'lid') ? 'top-1/3 left-1/2 -translate-x-1/2' :
                                  (category === 'tech' && logoPosition === 'side') ? 'top-1/2 right-1/4' :
                                  // Wellness & Stationery positions
                                  (logoPosition === 'label' || logoPosition === 'cover') ? 'top-1/3 left-1/2 -translate-x-1/2' :
                                  (logoPosition === 'box' || logoPosition === 'spine') ? 'top-1/2 right-1/4' :
                                  (logoPosition === 'sleeve' || logoPosition === 'inside') ? 'bottom-1/3 left-1/2 -translate-x-1/2' :
                                  // Default
                                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                                } ${
                                  logoSize === 'small'
                                    ? 'w-16 h-16'
                                    : logoSize === 'medium'
                                    ? 'w-24 h-24'
                                    : 'w-32 h-32'
                                } bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-xl border-2 border-dashed border-blue-500 animate-pulse`}
                              >
                                <img
                                  src={logoPreview}
                                  alt="Logo preview"
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full shadow-lg">
                                  {logoSize.toUpperCase()}
                                </div>
                              </div>
                            )}
                            
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <div className="w-24 h-24 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white/80 backdrop-blur-sm">
                                  <div>
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500 font-medium">Upload logo</p>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>

                        {/* Position Indicators */}
                        <div className="flex justify-center gap-3 mt-3">
                          <div className="text-center">
                            <div className={`w-10 h-10 rounded-lg border-2 ${logoPosition === 'center-chest' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} flex items-center justify-center mb-1`}>
                              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <p className="text-xs text-[#878e9e]">Center</p>
                          </div>
                          <div className="text-center">
                            <div className={`w-12 h-12 rounded-lg border-2 ${logoPosition === 'left-chest' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} flex items-center justify-center mb-1`}>
                              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                            </div>
                            <p className="text-xs text-[#878e9e]">Left</p>
                          </div>
                          <div className="text-center">
                            <div className={`w-12 h-12 rounded-lg border-2 ${logoPosition === 'back' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} flex items-center justify-center mb-1`}>
                              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <p className="text-xs text-[#878e9e]">Back</p>
                          </div>
                          <div className="text-center">
                            <div className={`w-12 h-12 rounded-lg border-2 ${logoPosition === 'sleeve' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} flex items-center justify-center mb-1`}>
                              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                            <p className="text-xs text-[#878e9e]">Sleeve</p>
                          </div>
                        </div>
                      </div>

                      {/* Branding Method Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <h4 className="text-sm font-semibold text-[#0e1e3f] mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          {categoryConfig.brandingMethods.find((m: any) => m.id === brandingMethod)?.label || 'Select Method'}
                        </h4>
                        <p className="text-xs text-[#475569] leading-relaxed mb-2">
                          {category === 'apparel' && brandingMethod === 'screen-print' && 'Durable, cost-effective for bulk orders. Best for simple logos with 1-4 colors. Vibrant colors that last through many washes.'}
                          {category === 'apparel' && brandingMethod === 'embroidery' && 'Premium, professional look with raised texture. Perfect for polo shirts and caps. Extremely durable and adds perceived value.'}
                          {category === 'apparel' && brandingMethod === 'vinyl' && 'Great for small quantities and detailed designs. Smooth finish, works well on dark fabrics. Quick turnaround time.'}
                          {category === 'apparel' && brandingMethod === 'dtg' && 'Direct-to-garment printing for photo-quality, full-color designs. Ideal for complex artwork and gradients. Soft feel, no texture.'}
                          
                          {category === 'bags' && brandingMethod === 'embossing' && 'Raised lettering creates a sophisticated, premium look. Perfect for leather and premium materials. Long-lasting and elegant.'}
                          {category === 'bags' && brandingMethod === 'debossing' && 'Indented branding for a subtle, professional appearance. Works excellently on leather and synthetic materials. Highly durable.'}
                          {category === 'bags' && brandingMethod === 'screen-print' && 'Vibrant, cost-effective printing for fabric bags. Great for colorful logos and bulk orders. Weather-resistant finish.'}
                          {category === 'bags' && brandingMethod === 'metal-badge' && 'Premium metal plate with engraved logo. Adds luxury appeal and brand prestige. Extremely durable and scratch-resistant.'}
                          
                          {category === 'tech' && brandingMethod === 'laser-engraving' && 'Permanent, precise etching on metal and plastic surfaces. Professional finish that won\'t fade. Perfect for tech products.'}
                          {category === 'tech' && brandingMethod === 'uv-print' && 'Full-color printing with high detail and durability. Works on various materials. Resistant to scratching and fading.'}
                          {category === 'tech' && brandingMethod === 'sticker' && 'High-quality vinyl stickers with lamination. Cost-effective and easy to apply. Great for packaging or product surface.'}
                          {category === 'tech' && brandingMethod === 'metal-plate' && 'Premium metal nameplate with custom engraving. Adds professional touch. Extremely durable and high-end look.'}
                          
                          {category === 'wellness' && brandingMethod === 'sticker' && 'Custom printed labels for product branding. Easy to apply, colorful designs. Perfect for bottles, boxes, and packaging.'}
                          {category === 'wellness' && brandingMethod === 'uv-print' && 'Direct printing on containers and packaging. High-quality, full-color results. Waterproof and durable finish.'}
                          {category === 'wellness' && brandingMethod === 'packaging' && 'Fully customized packaging with your brand identity. Premium unboxing experience. Includes printed box, inserts, and sleeves.'}
                          {category === 'wellness' && brandingMethod === 'sleeve' && 'Printed sleeve that wraps around product. Easy to apply, professional look. Great for temporary branding.'}
                          
                          {category === 'stationery' && brandingMethod === 'foil-stamping' && 'Metallic foil creates a luxurious, premium appearance. Available in gold, silver, and colors. Perfect for corporate gifting.'}
                          {category === 'stationery' && brandingMethod === 'embossing' && 'Raised design adds tactile dimension and elegance. Works beautifully on covers and cards. Professional finish.'}
                          {category === 'stationery' && brandingMethod === 'uv-print' && 'Full-color printing with glossy or matte finish. High detail reproduction. Cost-effective for bulk orders.'}
                          {category === 'stationery' && brandingMethod === 'screen-print' && 'Vibrant, durable printing for notebooks and folders. Excellent for simple logos. Long-lasting colors.'}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs font-medium text-[#0e1e3f] mb-1">Durability</p>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1.5 w-full rounded-full ${
                                    i < (['embroidery', 'laser-engraving', 'metal-badge', 'embossing', 'debossing'].includes(brandingMethod) ? 5 : 
                                         ['screen-print', 'foil-stamping'].includes(brandingMethod) ? 4 : 3)
                                      ? 'bg-green-500'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#0e1e3f] mb-1">Detail Quality</p>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1.5 w-full rounded-full ${
                                    i < (['dtg', 'uv-print', 'laser-engraving', 'foil-stamping'].includes(brandingMethod) ? 5 : 
                                         ['vinyl', 'metal-badge', 'packaging'].includes(brandingMethod) ? 4 : 3)
                                      ? 'bg-blue-500'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Customization Options */}
                    <div className="space-y-4">
                      {/* Logo Upload */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Upload Logo</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-gray-50">
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                              {logoPreview ? (
                                <div className="relative">
                                  <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain rounded-lg border border-gray-200" />
                                  <button
                                    type="button"
                                    aria-label="Remove logo"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setLogoPreview('');
                                      setLogoFile(null);
                                      setLogoUploadId(null);
                                      setLogoUploadError(null);
                                    }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-[#0e1e3f]">
                                  {logoPreview ? 'Change Logo' : 'Click to upload'}
                                </p>
                                <p className="text-xs text-[#878e9e]">PNG, JPG, SVG up to 5MB</p>
                                {logoUploading && (
                                  <p className="text-xs text-blue-600 mt-1">Uploading to Mogzu…</p>
                                )}
                                {logoUploadId && !logoUploading && (
                                  <p className="text-xs text-[#16a34a] mt-1">✓ Saved · pending admin approval</p>
                                )}
                                {logoUploadError && (
                                  <p className="text-xs text-red-600 mt-1">{logoUploadError}</p>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        {logoFile && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs text-green-700 font-medium">✓ {logoFile.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Logo Position */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Logo Position</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {categoryConfig.logoPositions.map((pos: any) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setLogoPosition(pos.id)}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                logoPosition === pos.id
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <p className="text-sm font-medium text-[#0e1e3f]">{pos.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Logo Size */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Logo Size</h3>
                        <div className="flex gap-2">
                          {[
                            { id: 'small', label: 'Small', size: '2"×2"' },
                            { id: 'medium', label: 'Medium', size: '3"×3"' },
                            { id: 'large', label: 'Large', size: '4"×4"' },
                          ].map((size) => (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => setLogoSize(size.id as any)}
                              className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                                logoSize === size.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <p className="text-sm font-medium text-[#0e1e3f]">{size.label}</p>
                              <p className="text-xs text-[#878e9e]">{size.size}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Branding Method */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Branding Method</h3>
                        <div className="space-y-2">
                          {categoryConfig.brandingMethods.map((method: any) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setBrandingMethod(method.id)}
                              className={`w-full p-2.5 rounded-lg border-2 transition-all flex items-center justify-between ${
                                brandingMethod === method.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  brandingMethod === method.id ? 'border-blue-500' : 'border-gray-300'
                                }`}>
                                  {brandingMethod === method.id && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-medium text-[#0e1e3f] flex items-center gap-2">
                                    {method.label}
                                    {method.popular && (
                                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Popular</span>
                                    )}
                                    {method.premium && (
                                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Premium</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{method.price}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2">Special Instructions (Optional)</h3>
                        <textarea
                          placeholder="Any special requirements for logo placement or customization..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                      </div>

                      {/* Sample Book Request */}
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#ff6b35] to-[#ff5722] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-[#0e1e3f] mb-1">Order Gift Sample</h3>
                            <p className="text-xs text-[#475569] leading-snug">
                              Test quality before bulk orders
                            </p>
                          </div>
                        </div>
                        
                        {/* Sample Type Options */}
                        <div className="grid gap-2">
                          {/* Plain Sample Option */}
                          <div 
                            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              requestSampleBook && !logoPreview
                                ? 'bg-gradient-to-br from-[#fff5f2] to-white border-[#ff6b35] shadow-md'
                                : 'bg-gray-50 border-gray-200 hover:border-[#ff6b35]/40 hover:shadow-sm'
                            }`}
                            onClick={() => setRequestSampleBook(true)}
                          >
                            <div className="relative p-2.5 flex items-center gap-2">
                              <input
                                type="radio"
                                id="samplePlain"
                                name="sampleType"
                                checked={requestSampleBook && !logoPreview}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRequestSampleBook(true);
                                  }
                                }}
                                className="w-4 h-4 text-[#ff6b35] cursor-pointer accent-[#ff6b35] flex-shrink-0"
                              />
                              <div className="flex items-center justify-center w-8 h-8 bg-[#fff5f2] rounded-lg flex-shrink-0">
                                <svg className="w-4 h-4 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[#0e1e3f]">Plain Sample</h4>
                                <p className="text-xs text-[#475569]">₹{Math.round((product.pricePerUnit || 0) * 1.2)} • 100% Refundable</p>
                              </div>
                            </div>
                          </div>

                          {/* Sample with Logo Option */}
                          <div 
                            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                              logoPreview
                                ? requestSampleBook && logoPreview
                                  ? 'bg-gradient-to-br from-[#fff5f2] to-white border-[#ff6b35] shadow-md cursor-pointer'
                                  : 'bg-gray-50 border-gray-200 hover:border-[#ff6b35]/40 hover:shadow-sm cursor-pointer'
                                : 'bg-gray-50/50 border-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                            onClick={() => logoPreview && setRequestSampleBook(true)}
                          >
                            {logoPreview && (
                              <div className="absolute top-0 right-0 px-2 py-0.5 bg-gradient-to-r from-[#ff6b35] to-[#ff5722] text-white text-[10px] font-bold rounded-bl-lg">
                                RECOMMENDED
                              </div>
                            )}
                            <div className="relative p-2.5 flex items-center gap-2">
                              <input
                                type="radio"
                                id="sampleWithLogo"
                                name="sampleType"
                                checked={requestSampleBook && logoPreview}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRequestSampleBook(true);
                                  }
                                }}
                                disabled={!logoPreview}
                                className="w-4 h-4 text-[#ff6b35] cursor-pointer accent-[#ff6b35] disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                              />
                              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                                logoPreview 
                                  ? 'bg-gradient-to-br from-[#fff5f2] to-[#ffe8df]' 
                                  : 'bg-gray-100'
                              }`}>
                                <svg className={`w-4 h-4 ${logoPreview ? 'text-[#ff6b35]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-xs font-bold ${logoPreview ? 'text-[#0e1e3f]' : 'text-gray-400'}`}>
                                  Branded Sample
                                </h4>
                                <p className={`text-xs ${logoPreview ? 'text-[#475569]' : 'text-gray-400'}`}>
                                  {logoPreview ? `₹${Math.round((product.pricePerUnit || 0) * 1.5)} • 50% Refundable` : 'Upload logo to unlock'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* No Sample Option */}
                          <div 
                            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              !requestSampleBook
                                ? 'bg-white border-[#0e1e3f]/20 shadow-sm'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setRequestSampleBook(false)}
                          >
                            <div className="relative p-2.5 flex items-center gap-2">
                              <input
                                type="radio"
                                id="noSample"
                                name="sampleType"
                                checked={!requestSampleBook}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRequestSampleBook(false);
                                  }
                                }}
                                className="w-4 h-4 text-[#0e1e3f] cursor-pointer accent-[#0e1e3f] flex-shrink-0"
                              />
                              <div className="flex items-center justify-center w-8 h-8 bg-[#f0f4ff] rounded-lg flex-shrink-0">
                                <svg className="w-4 h-4 text-[#0e1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[#0e1e3f]">Skip Sample</h4>
                                <p className="text-xs text-[#475569]">Direct to bulk order</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {requestSampleBook && (
                          <div className="mt-3 p-3 bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-xl border border-[#ff6b35]/30">
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-[#ff6b35] rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs font-bold text-[#0e1e3f] mb-1">
                                  {logoPreview ? 'Branded Sample Confirmed' : 'Sample Confirmed'}
                                </h4>
                                <p className="text-xs text-[#475569] mb-2">
                                  Delivery: <strong>3-5 days</strong>
                                </p>
                                <div className="grid grid-cols-3 gap-1.5">
                                  <div className="flex items-center gap-1 bg-white rounded p-1.5">
                                    <svg className="w-3 h-3 text-[#ff6b35] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <p className="text-xs font-semibold text-[#0e1e3f]">Free Ship</p>
                                  </div>
                                  <div className="flex items-center gap-1 bg-white rounded p-1.5">
                                    <svg className="w-3 h-3 text-[#ff6b35] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <p className="text-xs font-semibold text-[#0e1e3f]">Verified</p>
                                  </div>
                                  {logoPreview && (
                                    <div className="flex items-center gap-1 bg-white rounded p-1.5">
                                      <svg className="w-3 h-3 text-[#ff6b35] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                      </svg>
                                      <p className="text-xs font-semibold text-[#0e1e3f]">Branded</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowCustomizeModal(false)}
                          className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomizeModal(false);
                            // Handle customization save - could navigate to booking flow
                            // navigate('/booking-flow');
                          }}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#ff5722] text-white rounded-lg font-semibold hover:from-[#ff5722] hover:to-[#ff4500] transition-all shadow-md text-sm"
                        >
                          {logoFile ? 'Apply Customization' : 'Skip for Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
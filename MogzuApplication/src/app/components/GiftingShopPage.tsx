import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search, ChevronDown, HelpCircle, ShoppingBag, Pencil, Laptop, Heart, AlertCircle, Home, Sparkles, PartyPopper, Package, CreditCard, MapPin, Gift } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import svgPaths from '@/imports/svg-7abza1ocgz';
import svgPathsNew from '@/imports/svg-2ktbhf3ulz';
import svgPathsDashboard from '@/imports/svg-camfkj9vq4';
import { QA_IMAGES } from '../lib/qaImagery';

const imgImage24995 = QA_IMAGES.shopBanner;
const imgImage25010 = QA_IMAGES.shopCategory.bags;
const imgImage24998 = QA_IMAGES.shopCategory.stationary;
const imgImage25001 = QA_IMAGES.shopCategory.tech;
const imgImage25002 = QA_IMAGES.shopCategory.health;
import { apparelProducts, getProductsByCategory } from '../data/apparelProducts';
import { bagsProducts, getBagsByCategory } from '../data/bagsProducts';
import { stationeryProducts, getStationeryByCategory } from '../data/stationeryProducts';
import { techProducts, getTechByCategory } from '../data/techProducts';
import { wellnessProducts, getWellnessByCategory } from '../data/wellnessProducts';
import RelatedProducts from './RelatedProducts';
import {
  approvedGiftListingToApparelProduct,
  approvedGiftListingToPartnerBagProduct,
  approvedGiftListingToPartnerTechProduct,
  approvedGiftListingToPartnerStationeryProduct,
  approvedGiftListingToPartnerWellnessProduct,
  CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT,
  listingProfileIncludes,
  loadCorporateApprovedListings,
  inferPartnerGiftCategoryAndSubcategory,
} from '@/app/lib/corporateApprovedListingsStorage';
import { matchesPriceRange, matchesSourceFilter, parsePriceLike, type CatalogueSourceFilter } from '@/utils/filterContracts';

export default function GiftingShopPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNav, setSelectedNav] = useState('activity');
  const [activeTab, setActiveTab] = useState('shop');
  const [isError, setIsError] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low_high' | 'price_high_low' | 'rating_high_low'>('recommended');
  const [pricingTypeFilter, setPricingTypeFilter] = useState<'all' | 'transparent' | 'offer' | 'on_request'>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<'all' | 'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway'>('all');
  const [paymentTermFilter, setPaymentTermFilter] = useState<'all' | 'advance_100' | 'partial_50' | 'net_30'>('all');
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<string>('all');
  const [occasionFilter, setOccasionFilter] = useState<string>('all');
  const [injectedOccasionFilter, setInjectedOccasionFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<CatalogueSourceFilter>('all');
  const [canonicalBudgetMin, setCanonicalBudgetMin] = useState('');
  const [canonicalBudgetMax, setCanonicalBudgetMax] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [gridUiNotice, setGridUiNotice] = useState<string | null>(null);
  const [corpListingTick, setCorpListingTick] = useState(0);
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});

  useEffect(() => {
    const bump = () => setCorpListingTick((n) => n + 1);
    window.addEventListener(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT, bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT, bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const partnerGiftListingsFromAdmin = useMemo(
    () => loadCorporateApprovedListings().filter((l) => listingProfileIncludes(l.listingProfileIds, 'gift')),
    [corpListingTick],
  );

  const partnerApparelFromAdmin = useMemo(
    () =>
      partnerGiftListingsFromAdmin
        .filter((l) => inferPartnerGiftCategoryAndSubcategory(l).category === 'apparel')
        .map(approvedGiftListingToApparelProduct),
    [partnerGiftListingsFromAdmin],
  );

  const partnerBagsFromAdmin = useMemo(
    () =>
      partnerGiftListingsFromAdmin
        .filter((l) => inferPartnerGiftCategoryAndSubcategory(l).category === 'bags')
        .map(approvedGiftListingToPartnerBagProduct),
    [partnerGiftListingsFromAdmin],
  );

  const partnerTechFromAdmin = useMemo(
    () =>
      partnerGiftListingsFromAdmin
        .filter((l) => inferPartnerGiftCategoryAndSubcategory(l).category === 'tech')
        .map(approvedGiftListingToPartnerTechProduct),
    [partnerGiftListingsFromAdmin],
  );

  const partnerStationeryFromAdmin = useMemo(
    () =>
      partnerGiftListingsFromAdmin
        .filter((l) => inferPartnerGiftCategoryAndSubcategory(l).category === 'stationery')
        .map(approvedGiftListingToPartnerStationeryProduct),
    [partnerGiftListingsFromAdmin],
  );

  const partnerWellnessFromAdmin = useMemo(
    () =>
      partnerGiftListingsFromAdmin
        .filter((l) => inferPartnerGiftCategoryAndSubcategory(l).category === 'health')
        .map(approvedGiftListingToPartnerWellnessProduct),
    [partnerGiftListingsFromAdmin],
  );

  const getProductSlideImages = (product: unknown): string[] => {
    const base: string[] = [];
    if (product && typeof product === 'object') {
      const maybeImage = (product as { image?: unknown }).image;
      if (typeof maybeImage === 'string' && maybeImage.trim()) base.push(maybeImage);
      const maybeImages = (product as { images?: unknown }).images;
      if (Array.isArray(maybeImages)) {
        maybeImages.forEach((img) => {
          if (typeof img === 'string' && img.trim()) base.push(img);
        });
      }
    }
    base.push(imgImage24995, imgImage25010, imgImage24998, imgImage25001, imgImage25002);
    return Array.from(new Set(base.filter(Boolean)));
  };

  const goToPrevCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0;
      const next = (current - 1 + total) % total;
      return { ...prev, [cardId]: next };
    });
  };

  const goToNextCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0;
      const next = (current + 1) % total;
      return { ...prev, [cardId]: next };
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400' },
    { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800' },
    { id: 'bookings', label: 'Bookings', icon: 'paf72c00' },
    { id: 'favorites', label: 'Favorites', icon: 'p27070280' },
    { id: 'users', label: 'Users', icon: 'p29193540' },
    { id: 'notification', label: 'Notification', icon: 'p4e64800' },
    { id: 'communication', label: 'Communication', icon: 'p319d300' },
    { id: 'report', label: 'Report', icon: 'p1f81a280' },
    { id: 'transactions', label: 'Transactions', icon: 'p2683f80' },
    { id: 'settings', label: 'Settings', icon: 'pde1bb00' },
  ];

  const categories = [
    { id: 'apparel', name: 'Apparel', type: 'svg', icon: 'p12156400' },
    { id: 'bags', name: 'Bags', type: 'image', icon: imgImage25010 },
    { id: 'stationary', name: 'Stationary', type: 'image', icon: imgImage24998 },
    { id: 'tech', name: 'Tech', type: 'image', icon: imgImage25001 },
    { id: 'health', name: 'Health & wellness', type: 'image', icon: imgImage25002 },
  ];

  // Apparel subcategories - shown when apparel is selected
  const apparelSubcategories = [
    { 
      id: 'tshirts', 
      name: 'T-Shirts', 
      count: 45,
      types: ['Round Neck', 'Polo', 'Full Sleeve', 'Dry-Fit'],
      bgColor: '#dbeafe',
      textColor: '#1e40af',
      activeBg: '#2563eb',
      activeText: '#ffffff'
    },
    { 
      id: 'hoodies', 
      name: 'Hoodies', 
      count: 28,
      types: ['Pullover', 'Zipper', 'Sweatshirt'],
      bgColor: '#e9d5ff',
      textColor: '#6b21a8',
      activeBg: '#9333ea',
      activeText: '#ffffff'
    },
    { 
      id: 'jackets', 
      name: 'Jackets', 
      count: 18,
      types: ['Softshell', 'Windcheater', 'Bomber', 'Puffer'],
      bgColor: '#fed7aa',
      textColor: '#c2410c',
      activeBg: '#ea580c',
      activeText: '#ffffff'
    },
    { 
      id: 'workwear', 
      name: 'Workwear', 
      count: 22,
      types: ['Formal Shirts', 'Trousers', 'Blazers'],
      bgColor: '#d1fae5',
      textColor: '#065f46',
      activeBg: '#059669',
      activeText: '#ffffff'
    },
    { 
      id: 'caps', 
      name: 'Caps', 
      count: 24,
      types: ['Baseball', 'Snapback', 'Bucket'],
      bgColor: '#fce7f3',
      textColor: '#9f1239',
      activeBg: '#e11d48',
      activeText: '#ffffff'
    },
    { 
      id: 'bottomwear', 
      name: 'Bottom Wear', 
      count: 15,
      types: ['Track Pants', 'Joggers'],
      bgColor: '#cffafe',
      textColor: '#0e7490',
      activeBg: '#0891b2',
      activeText: '#ffffff'
    },
    { 
      id: 'customsets', 
      name: 'Custom Sets', 
      count: 12,
      types: ['Uniform Sets', 'Team Kits'],
      bgColor: '#fef3c7',
      textColor: '#92400e',
      activeBg: '#d97706',
      activeText: '#ffffff'
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState('apparel');
  const [selectedApparelSubcategory, setSelectedApparelSubcategory] = useState<string>('all');
  const [selectedBagSubcategory, setSelectedBagSubcategory] = useState<string>('all');
  const [selectedStationerySubcategory, setSelectedStationerySubcategory] = useState<string>('all');
  const [selectedTechSubcategory, setSelectedTechSubcategory] = useState<string>('all');
  const [selectedWellnessSubcategory, setSelectedWellnessSubcategory] = useState<string>('all');
  
  // Wellness subcategories - shown when wellness is selected
  const wellnessSubcategories = [
    { 
      id: 'hampers', 
      name: 'Hampers', 
      count: 2,
      bgColor: '#fef3c7',
      textColor: '#92400e',
      activeBg: '#d97706',
      activeText: '#ffffff'
    },
    { 
      id: 'aromatherapy', 
      name: 'Aromatherapy', 
      count: 2,
      bgColor: '#e9d5ff',
      textColor: '#6b21a8',
      activeBg: '#9333ea',
      activeText: '#ffffff'
    },
    { 
      id: 'candles', 
      name: 'Candles', 
      count: 3,
      bgColor: '#fed7aa',
      textColor: '#c2410c',
      activeBg: '#ea580c',
      activeText: '#ffffff'
    },
    { 
      id: 'diffusers', 
      name: 'Diffusers', 
      count: 2,
      bgColor: '#d1fae5',
      textColor: '#065f46',
      activeBg: '#059669',
      activeText: '#ffffff'
    },
    { 
      id: 'herbaltea', 
      name: 'Herbal Tea', 
      count: 2,
      bgColor: '#d9f99d',
      textColor: '#65a30d',
      activeBg: '#84cc16',
      activeText: '#ffffff'
    },
    { 
      id: 'yogamats', 
      name: 'Yoga Mats', 
      count: 2,
      bgColor: '#dbeafe',
      textColor: '#1e40af',
      activeBg: '#2563eb',
      activeText: '#ffffff'
    },
    { 
      id: 'bottles', 
      name: 'Bottles', 
      count: 1,
      bgColor: '#cffafe',
      textColor: '#0e7490',
      activeBg: '#0891b2',
      activeText: '#ffffff'
    },
    { 
      id: 'fitnessbands', 
      name: 'Fitness Bands', 
      count: 1,
      bgColor: '#fce7f3',
      textColor: '#9f1239',
      activeBg: '#e11d48',
      activeText: '#ffffff'
    },
    { 
      id: 'skincarekits', 
      name: 'Skincare Kits', 
      count: 1,
      bgColor: '#fecaca',
      textColor: '#991b1b',
      activeBg: '#dc2626',
      activeText: '#ffffff'
    },
    { 
      id: 'bathbodysets', 
      name: 'Bath/Body Sets', 
      count: 1,
      bgColor: '#e0e7ff',
      textColor: '#4338ca',
      activeBg: '#6366f1',
      activeText: '#ffffff'
    },
    { 
      id: 'healthkits', 
      name: 'Health Kits', 
      count: 1,
      bgColor: '#ede9fe',
      textColor: '#7c3aed',
      activeBg: '#8b5cf6',
      activeText: '#ffffff'
    },
  ];
  
  // Tech subcategories - shown when tech is selected
  const techSubcategories = [
    { 
      id: 'powerbanks', 
      name: 'Power Banks', 
      count: 3,
      bgColor: '#dbeafe',
      textColor: '#1e40af',
      activeBg: '#2563eb',
      activeText: '#ffffff'
    },
    { 
      id: 'speakers', 
      name: 'Bluetooth Speakers', 
      count: 2,
      bgColor: '#e9d5ff',
      textColor: '#6b21a8',
      activeBg: '#9333ea',
      activeText: '#ffffff'
    },
    { 
      id: 'earbuds', 
      name: 'Earbuds', 
      count: 2,
      bgColor: '#fed7aa',
      textColor: '#c2410c',
      activeBg: '#ea580c',
      activeText: '#ffffff'
    },
    { 
      id: 'smartbottles', 
      name: 'Smart Bottles', 
      count: 1,
      bgColor: '#d1fae5',
      textColor: '#065f46',
      activeBg: '#059669',
      activeText: '#ffffff'
    },
    { 
      id: 'wirelesschargers', 
      name: 'Wireless Chargers', 
      count: 2,
      bgColor: '#fce7f3',
      textColor: '#9f1239',
      activeBg: '#e11d48',
      activeText: '#ffffff'
    },
    { 
      id: 'pendrives', 
      name: 'Pendrives', 
      count: 2,
      bgColor: '#cffafe',
      textColor: '#0e7490',
      activeBg: '#0891b2',
      activeText: '#ffffff'
    },
    { 
      id: 'techkits', 
      name: 'Tech Kits', 
      count: 1,
      bgColor: '#fef3c7',
      textColor: '#92400e',
      activeBg: '#d97706',
      activeText: '#ffffff'
    },
    { 
      id: 'smartclocks', 
      name: 'Smart Clocks', 
      count: 1,
      bgColor: '#fecaca',
      textColor: '#991b1b',
      activeBg: '#dc2626',
      activeText: '#ffffff'
    },
    { 
      id: 'laptopstands', 
      name: 'Laptop Stands', 
      count: 1,
      bgColor: '#e0e7ff',
      textColor: '#4338ca',
      activeBg: '#6366f1',
      activeText: '#ffffff'
    },
    { 
      id: 'desklamps', 
      name: 'Desk Lamps', 
      count: 1,
      bgColor: '#d9f99d',
      textColor: '#65a30d',
      activeBg: '#84cc16',
      activeText: '#ffffff'
    },
  ];
  
  // Stationery subcategories - shown when stationery is selected
  const stationerySubcategories = [
    { 
      id: 'notebooks', 
      name: 'Notebooks', 
      count: 4,
      bgColor: '#dbeafe',
      textColor: '#1e40af',
      activeBg: '#2563eb',
      activeText: '#ffffff'
    },
    { 
      id: 'diaries', 
      name: 'Diaries', 
      count: 2,
      bgColor: '#e9d5ff',
      textColor: '#6b21a8',
      activeBg: '#9333ea',
      activeText: '#ffffff'
    },
    { 
      id: 'pens', 
      name: 'Pens', 
      count: 2,
      bgColor: '#fed7aa',
      textColor: '#c2410c',
      activeBg: '#ea580c',
      activeText: '#ffffff'
    },
    { 
      id: 'organizers', 
      name: 'Desk Organizers', 
      count: 1,
      bgColor: '#d1fae5',
      textColor: '#065f46',
      activeBg: '#059669',
      activeText: '#ffffff'
    },
    { 
      id: 'calendars', 
      name: 'Calendars', 
      count: 1,
      bgColor: '#fce7f3',
      textColor: '#9f1239',
      activeBg: '#e11d48',
      activeText: '#ffffff'
    },
    { 
      id: 'stickynotes', 
      name: 'Sticky Notes', 
      count: 1,
      bgColor: '#cffafe',
      textColor: '#0e7490',
      activeBg: '#0891b2',
      activeText: '#ffffff'
    },
    { 
      id: 'kits', 
      name: 'Stationery Kits', 
      count: 1,
      bgColor: '#fef3c7',
      textColor: '#92400e',
      activeBg: '#d97706',
      activeText: '#ffffff'
    },
    { 
      id: 'leatherdiaries', 
      name: 'Premium Leather Diaries', 
      count: 1,
      bgColor: '#fecaca',
      textColor: '#991b1b',
      activeBg: '#dc2626',
      activeText: '#ffffff'
    },
    { 
      id: 'metalpens', 
      name: 'Metal Pens', 
      count: 1,
      bgColor: '#e0e7ff',
      textColor: '#4338ca',
      activeBg: '#6366f1',
      activeText: '#ffffff'
    },
    { 
      id: 'writingsets', 
      name: 'Executive Writing Sets', 
      count: 1,
      bgColor: '#d9f99d',
      textColor: '#65a30d',
      activeBg: '#84cc16',
      activeText: '#ffffff'
    },
    { 
      id: 'deskaccessories', 
      name: 'Desk Accessories', 
      count: 1,
      bgColor: '#fbcfe8',
      textColor: '#9f1239',
      activeBg: '#ec4899',
      activeText: '#ffffff'
    },
  ];
  
  // Bags subcategories - shown when bags is selected
  const bagsSubcategories = [
    { 
      id: 'laptop', 
      name: 'Laptop Bags', 
      count: 5,
      bgColor: '#dbeafe',
      textColor: '#1d4ed8',
      activeBg: '#3b82f6',
      activeText: '#ffffff'
    },
    { 
      id: 'backpacks', 
      name: 'Backpacks', 
      count: 5,
      bgColor: '#ede9fe',
      textColor: '#7c3aed',
      activeBg: '#8b5cf6',
      activeText: '#ffffff'
    },
    { 
      id: 'tote', 
      name: 'Tote Bags', 
      count: 5,
      bgColor: '#fce7f3',
      textColor: '#db2777',
      activeBg: '#ec4899',
      activeText: '#ffffff'
    },
    { 
      id: 'sling', 
      name: 'Sling Bags', 
      count: 5,
      bgColor: '#fed7aa',
      textColor: '#ea580c',
      activeBg: '#f97316',
      activeText: '#ffffff'
    },
    { 
      id: 'duffel', 
      name: 'Duffel Bags', 
      count: 4,
      bgColor: '#d1fae5',
      textColor: '#059669',
      activeBg: '#10b981',
      activeText: '#ffffff'
    },
    { 
      id: 'travelkits', 
      name: 'Travel Kits', 
      count: 4,
      bgColor: '#cffafe',
      textColor: '#0891b2',
      activeBg: '#06b6d4',
      activeText: '#ffffff'
    },
    { 
      id: 'leather', 
      name: 'Premium Leather', 
      count: 3,
      bgColor: '#e0e7ff',
      textColor: '#4338ca',
      activeBg: '#6366f1',
      activeText: '#ffffff'
    },
    { 
      id: 'ecofriendly', 
      name: 'Eco-Friendly', 
      count: 4,
      bgColor: '#d9f99d',
      textColor: '#65a30d',
      activeBg: '#84cc16',
      activeText: '#ffffff'
    },
    { 
      id: 'drawstring', 
      name: 'Drawstring', 
      count: 3,
      bgColor: '#fef3c7',
      textColor: '#ca8a04',
      activeBg: '#eab308',
      activeText: '#ffffff'
    },
  ];

  const initialCategoryFilters = apparelSubcategories.reduce<Record<string, boolean>>((acc, subcategory) => {
    acc[subcategory.id] = false
    return acc
  }, {})

  const apparelBrandingOptions = Array.from(
    new Set(
      [...partnerApparelFromAdmin, ...apparelProducts]
        .flatMap((product) => product.branding || [])
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const initialApparelBrandingFilters = apparelBrandingOptions.reduce<Record<string, boolean>>((acc, option) => {
    acc[option] = false
    return acc
  }, {})

  const initialBagTypeFilters = bagsSubcategories.reduce<Record<string, boolean>>((acc, subcategory) => {
    acc[subcategory.id] = false
    return acc
  }, {})

  const [filters, setFilters] = useState({
    categories: initialCategoryFilters,
    fabricType: {
      'Cotton': false,
      'Dry-Fit': false,
      'Poly-Cotton': false,
    },
    apparelBranding: initialApparelBrandingFilters,
    brands: { adidas: false, puma: false, nike: false, reebok: false },
    priceMin: '',
    priceMax: '',
    minQuantity: '',
    // Bags-specific filters
    bagTypes: initialBagTypeFilters,
    material: {
      'Nylon': false,
      'Polyester': false,
      'Canvas': false,
      'Leather': false,
      'Vegan Leather': false,
      'Jute': false,
      'Cotton': false,
    },
    capacity: {
      'Small': false,
      'Medium': false,
      'Large': false,
      'XL': false,
    },
    laptopFit: {
      '13"': false,
      '15.6"': false,
      '17"': false,
    },
    features: {
      'Water Resistant': false,
      'USB Port': false,
      'Anti-theft': false,
      'Padded': false,
      'Trolley Strap': false,
      'Lightweight': false,
    },
    bagBranding: {
      'Embroidery': false,
      'Screen Print': false,
      'Metal Tag': false,
      'Embossing': false,
    },
    bagColors: {
      'Black': false,
      'Grey': false,
      'Navy Blue': false,
      'Brown': false,
      'Beige': false,
    },
    // Stationery-specific filters
    stationeryType: {
      'Notebook': false,
      'Diary': false,
      'Pen': false,
      'Kit': false,
      'Desk Organizer': false,
      'Calendar': false,
      'Sticky Notes': false,
    },
    stationeryMaterial: {
      'Paper': false,
      'Leather': false,
      'Metal': false,
      'PU': false,
      'Wood': false,
    },
    paperGSM: {
      '70': false,
      '80': false,
      '100': false,
      '120': false,
      '300': false,
    },
    pageType: {
      'Ruled': false,
      'Unruled': false,
      'Dotted': false,
      'Grid': false,
    },
    binding: {
      'Hardbound': false,
      'Softbound': false,
      'Wiro': false,
      'Spiral': false,
    },
    stationeryBranding: {
      'UV Print': false,
      'Foil Stamping': false,
      'Embossing': false,
      'Screen Print': false,
      'Metal Tag': false,
      'Laser Engraving': false,
    },
    stationeryColors: {
      'Black': false,
      'Brown': false,
      'Tan': false,
      'Blue': false,
      'Grey': false,
      'White': false,
    },
    delivery: {
      '2-3 days': false,
      '4-7 days': false,
      '7-10 days': false,
    },
    // Tech-specific filters
    techType: {
      'Power Bank': false,
      'Speaker': false,
      'Earbuds': false,
      'Kit': false,
      'Smart Bottle': false,
      'Wireless Charger': false,
      'Pendrive': false,
      'Smart Clock': false,
      'Laptop Stand': false,
      'Desk Lamp': false,
    },
    battery: {
      '3000-5000': false,
      '5000-10000': false,
      '10000-20000': false,
      '20000+': false,
    },
    power: {
      '5W': false,
      '10W': false,
      '15W': false,
      '20W': false,
    },
    connectivity: {
      'BT4.0': false,
      'BT5.0': false,
      'Type-C': false,
      'Wireless': false,
    },
    techFeatures: {
      'Fast Charge': false,
      'Waterproof': false,
      'LED Display': false,
      'Touch Control': false,
      'Noise Cancelling': false,
    },
    techBranding: {
      'Laser Engraving': false,
      'UV Print': false,
      'Metal Plate': false,
    },
    warranty: {
      '3M': false,
      '6M': false,
      '1Y': false,
    },
    techColors: {
      'Black': false,
      'White': false,
      'Metallic': false,
    },
    // Wellness-specific filters
    wellnessType: {
      'Hampers': false,
      'Candles': false,
      'Tea': false,
      'Yoga': false,
      'Aromatherapy': false,
      'Diffusers': false,
      'Bottles': false,
      'Fitness Bands': false,
      'Skincare': false,
      'Bath/Body': false,
      'Health Kits': false,
    },
    wellnessMaterial: {
      'Soy Wax': false,
      'Essential Oils': false,
      'Steel': false,
      'TPE': false,
      'Natural': false,
      'Plastic': false,
      'Natural Rubber': false,
    },
    wellnessBenefit: {
      'Relax': false,
      'Sleep': false,
      'Energy': false,
    },
    fragrance: {
      'Lavender': false,
      'Sandalwood': false,
      'Vanilla': false,
      'Multiple': false,
    },
    wellnessBranding: {
      'Sticker': false,
      'UV Print': false,
      'Laser Engraving': false,
      'Sleeve': false,
      'Screen Print': false,
    },
    wellnessPrice: {
      '<300': false,
      '300-599': false,
      '600-999': false,
      '1000+': false,
    },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    fabricType: true,
    apparelBranding: true,
    price: true,
    minQuantity: true,
    brand: true,
    // Bags filter sections
    bagType: true,
    material: true,
    capacity: true,
    laptopFit: true,
    features: true,
    bagBranding: true,
    bagColors: true,
    // Stationery filter sections
    stationeryType: true,
    stationeryMaterial: true,
    paperGSM: true,
    pageType: true,
    binding: true,
    stationeryBranding: true,
    stationeryColors: true,
    delivery: true,
    // Tech filter sections
    techType: true,
    battery: true,
    power: true,
    connectivity: true,
    techFeatures: true,
    techBranding: true,
    warranty: true,
    techColors: true,
    // Wellness filter sections
    wellnessType: true,
    wellnessMaterial: true,
    wellnessBenefit: true,
    fragrance: true,
    wellnessBranding: true,
    wellnessPrice: true,
  });

  const handleBrandChange = (brand: 'adidas' | 'puma' | 'nike' | 'reebok') => {
    setFilters(prev => ({
      ...prev,
      brands: {
        ...prev.brands,
        [brand]: !prev.brands[brand]
      }
    }));
  };

  const handleSubCategoryChange = (subcategoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [subcategoryId]: !prev.categories[subcategoryId as keyof typeof prev.categories]
      }
    }));
  };

  const handleFabricTypeChange = (fabric: string) => {
    setFilters(prev => ({
      ...prev,
      fabricType: {
        ...prev.fabricType,
        [fabric]: !prev.fabricType[fabric]
      }
    }));
  };

  const handleApparelBrandingChange = (branding: string) => {
    setFilters(prev => ({
      ...prev,
      apparelBranding: {
        ...prev.apparelBranding,
        [branding]: !prev.apparelBranding[branding as keyof typeof prev.apparelBranding]
      }
    }));
  };

  // Bags filter handlers
  const handleBagTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      bagTypes: {
        ...prev.bagTypes,
        [type]: !prev.bagTypes[type as keyof typeof prev.bagTypes]
      }
    }));
  };

  const handleMaterialChange = (material: string) => {
    setFilters(prev => ({
      ...prev,
      material: {
        ...prev.material,
        [material]: !prev.material[material as keyof typeof prev.material]
      }
    }));
  };

  const handleCapacityChange = (capacity: string) => {
    setFilters(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        [capacity]: !prev.capacity[capacity as keyof typeof prev.capacity]
      }
    }));
  };

  const handleLaptopFitChange = (fit: string) => {
    setFilters(prev => ({
      ...prev,
      laptopFit: {
        ...prev.laptopFit,
        [fit]: !prev.laptopFit[fit as keyof typeof prev.laptopFit]
      }
    }));
  };

  const handleFeaturesChange = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature as keyof typeof prev.features]
      }
    }));
  };

  const handleBagBrandingChange = (branding: string) => {
    setFilters(prev => ({
      ...prev,
      bagBranding: {
        ...prev.bagBranding,
        [branding]: !prev.bagBranding[branding as keyof typeof prev.bagBranding]
      }
    }));
  };

  const handleBagColorsChange = (color: string) => {
    setFilters(prev => ({
      ...prev,
      bagColors: {
        ...prev.bagColors,
        [color]: !prev.bagColors[color as keyof typeof prev.bagColors]
      }
    }));
  };

  // Stationery filter handlers
  const handleStationeryTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      stationeryType: {
        ...prev.stationeryType,
        [type]: !prev.stationeryType[type as keyof typeof prev.stationeryType]
      }
    }));
  };

  const handleStationeryMaterialChange = (material: string) => {
    setFilters(prev => ({
      ...prev,
      stationeryMaterial: {
        ...prev.stationeryMaterial,
        [material]: !prev.stationeryMaterial[material as keyof typeof prev.stationeryMaterial]
      }
    }));
  };

  const handlePaperGSMChange = (gsm: string) => {
    setFilters(prev => ({
      ...prev,
      paperGSM: {
        ...prev.paperGSM,
        [gsm]: !prev.paperGSM[gsm as keyof typeof prev.paperGSM]
      }
    }));
  };

  const handlePageTypeChange = (pageType: string) => {
    setFilters(prev => ({
      ...prev,
      pageType: {
        ...prev.pageType,
        [pageType]: !prev.pageType[pageType as keyof typeof prev.pageType]
      }
    }));
  };

  const handleBindingChange = (binding: string) => {
    setFilters(prev => ({
      ...prev,
      binding: {
        ...prev.binding,
        [binding]: !prev.binding[binding as keyof typeof prev.binding]
      }
    }));
  };

  const handleStationeryBrandingChange = (branding: string) => {
    setFilters(prev => ({
      ...prev,
      stationeryBranding: {
        ...prev.stationeryBranding,
        [branding]: !prev.stationeryBranding[branding as keyof typeof prev.stationeryBranding]
      }
    }));
  };

  const handleStationeryColorsChange = (color: string) => {
    setFilters(prev => ({
      ...prev,
      stationeryColors: {
        ...prev.stationeryColors,
        [color]: !prev.stationeryColors[color as keyof typeof prev.stationeryColors]
      }
    }));
  };

  const handleDeliveryChange = (delivery: string) => {
    setFilters(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [delivery]: !prev.delivery[delivery as keyof typeof prev.delivery]
      }
    }));
  };

  // Tech filter handlers
  const handleTechTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      techType: {
        ...prev.techType,
        [type]: !prev.techType[type as keyof typeof prev.techType]
      }
    }));
  };

  const handleBatteryChange = (battery: string) => {
    setFilters(prev => ({
      ...prev,
      battery: {
        ...prev.battery,
        [battery]: !prev.battery[battery as keyof typeof prev.battery]
      }
    }));
  };

  const handlePowerChange = (power: string) => {
    setFilters(prev => ({
      ...prev,
      power: {
        ...prev.power,
        [power]: !prev.power[power as keyof typeof prev.power]
      }
    }));
  };

  const handleConnectivityChange = (connectivity: string) => {
    setFilters(prev => ({
      ...prev,
      connectivity: {
        ...prev.connectivity,
        [connectivity]: !prev.connectivity[connectivity as keyof typeof prev.connectivity]
      }
    }));
  };

  const handleTechFeaturesChange = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      techFeatures: {
        ...prev.techFeatures,
        [feature]: !prev.techFeatures[feature as keyof typeof prev.techFeatures]
      }
    }));
  };

  const handleTechBrandingChange = (branding: string) => {
    setFilters(prev => ({
      ...prev,
      techBranding: {
        ...prev.techBranding,
        [branding]: !prev.techBranding[branding as keyof typeof prev.techBranding]
      }
    }));
  };

  const handleWarrantyChange = (warranty: string) => {
    setFilters(prev => ({
      ...prev,
      warranty: {
        ...prev.warranty,
        [warranty]: !prev.warranty[warranty as keyof typeof prev.warranty]
      }
    }));
  };

  const handleTechColorsChange = (color: string) => {
    setFilters(prev => ({
      ...prev,
      techColors: {
        ...prev.techColors,
        [color]: !prev.techColors[color as keyof typeof prev.techColors]
      }
    }));
  };

  // Wellness filter handlers
  const handleWellnessTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      wellnessType: {
        ...prev.wellnessType,
        [type]: !prev.wellnessType[type as keyof typeof prev.wellnessType]
      }
    }));
  };

  const handleWellnessMaterialChange = (material: string) => {
    setFilters(prev => ({
      ...prev,
      wellnessMaterial: {
        ...prev.wellnessMaterial,
        [material]: !prev.wellnessMaterial[material as keyof typeof prev.wellnessMaterial]
      }
    }));
  };

  const handleWellnessBenefitChange = (benefit: string) => {
    setFilters(prev => ({
      ...prev,
      wellnessBenefit: {
        ...prev.wellnessBenefit,
        [benefit]: !prev.wellnessBenefit[benefit as keyof typeof prev.wellnessBenefit]
      }
    }));
  };

  const handleFragranceChange = (fragrance: string) => {
    setFilters(prev => ({
      ...prev,
      fragrance: {
        ...prev.fragrance,
        [fragrance]: !prev.fragrance[fragrance as keyof typeof prev.fragrance]
      }
    }));
  };

  const handleWellnessBrandingChange = (branding: string) => {
    setFilters(prev => ({
      ...prev,
      wellnessBranding: {
        ...prev.wellnessBranding,
        [branding]: !prev.wellnessBranding[branding as keyof typeof prev.wellnessBranding]
      }
    }));
  };

  const handleWellnessPriceChange = (price: string) => {
    setFilters(prev => ({
      ...prev,
      wellnessPrice: {
        ...prev.wellnessPrice,
        [price]: !prev.wellnessPrice[price as keyof typeof prev.wellnessPrice]
      }
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleClearAll = () => {
    setFilters({
      categories: initialCategoryFilters,
      fabricType: {
        'Cotton': false,
        'Dry-Fit': false,
        'Poly-Cotton': false,
      },
      apparelBranding: initialApparelBrandingFilters,
      brands: { adidas: false, puma: false, nike: false, reebok: false },
      priceMin: '',
      priceMax: '',
      minQuantity: '',
      // Reset bags filters
      bagTypes: initialBagTypeFilters,
      material: {
        'Nylon': false,
        'Polyester': false,
        'Canvas': false,
        'Leather': false,
        'Vegan Leather': false,
        'Jute': false,
        'Cotton': false,
      },
      capacity: {
        'Small': false,
        'Medium': false,
        'Large': false,
        'XL': false,
      },
      laptopFit: {
        '13"': false,
        '15.6"': false,
        '17"': false,
      },
      features: {
        'Water Resistant': false,
        'USB Port': false,
        'Anti-theft': false,
        'Padded': false,
        'Trolley Strap': false,
        'Lightweight': false,
      },
      bagBranding: {
        'Embroidery': false,
        'Screen Print': false,
        'Metal Tag': false,
        'Embossing': false,
      },
      bagColors: {
        'Black': false,
        'Grey': false,
        'Navy Blue': false,
        'Brown': false,
        'Beige': false,
      },
      // Reset stationery filters
      stationeryType: {
        'Notebook': false,
        'Diary': false,
        'Pen': false,
        'Kit': false,
        'Desk Organizer': false,
        'Calendar': false,
        'Sticky Notes': false,
      },
      stationeryMaterial: {
        'Paper': false,
        'Leather': false,
        'Metal': false,
        'PU': false,
        'Wood': false,
      },
      paperGSM: {
        '70': false,
        '80': false,
        '100': false,
        '120': false,
        '300': false,
      },
      pageType: {
        'Ruled': false,
        'Unruled': false,
        'Dotted': false,
        'Grid': false,
      },
      binding: {
        'Hardbound': false,
        'Softbound': false,
        'Wiro': false,
        'Spiral': false,
      },
      stationeryBranding: {
        'UV Print': false,
        'Foil Stamping': false,
        'Embossing': false,
        'Screen Print': false,
        'Metal Tag': false,
        'Laser Engraving': false,
      },
      stationeryColors: {
        'Black': false,
        'Brown': false,
        'Tan': false,
        'Blue': false,
        'Grey': false,
        'White': false,
      },
      delivery: {
        '2-3 days': false,
        '4-7 days': false,
        '7-10 days': false,
      },
      // Reset tech filters
      techType: {
        'Power Bank': false,
        'Speaker': false,
        'Earbuds': false,
        'Kit': false,
        'Smart Bottle': false,
        'Wireless Charger': false,
        'Pendrive': false,
        'Smart Clock': false,
        'Laptop Stand': false,
        'Desk Lamp': false,
      },
      battery: {
        '3000-5000': false,
        '5000-10000': false,
        '10000-20000': false,
        '20000+': false,
      },
      power: {
        '5W': false,
        '10W': false,
        '15W': false,
        '20W': false,
      },
      connectivity: {
        'BT4.0': false,
        'BT5.0': false,
        'Type-C': false,
        'Wireless': false,
      },
      techFeatures: {
        'Fast Charge': false,
        'Waterproof': false,
        'LED Display': false,
        'Touch Control': false,
        'Noise Cancelling': false,
      },
      techBranding: {
        'Laser Engraving': false,
        'UV Print': false,
        'Metal Plate': false,
      },
      warranty: {
        '3M': false,
        '6M': false,
        '1Y': false,
      },
      techColors: {
        'Black': false,
        'White': false,
        'Metallic': false,
      },
      // Reset wellness filters
      wellnessType: {
        'Hampers': false,
        'Candles': false,
        'Tea': false,
        'Yoga': false,
        'Aromatherapy': false,
        'Diffusers': false,
        'Bottles': false,
        'Fitness Bands': false,
        'Skincare': false,
        'Bath/Body': false,
        'Health Kits': false,
      },
      wellnessMaterial: {
        'Soy Wax': false,
        'Essential Oils': false,
        'Steel': false,
        'TPE': false,
        'Natural': false,
        'Plastic': false,
        'Natural Rubber': false,
      },
      wellnessBenefit: {
        'Relax': false,
        'Sleep': false,
        'Energy': false,
      },
      fragrance: {
        'Lavender': false,
        'Sandalwood': false,
        'Vanilla': false,
        'Multiple': false,
      },
      wellnessBranding: {
        'Sticker': false,
        'UV Print': false,
        'Laser Engraving': false,
        'Sleeve': false,
        'Screen Print': false,
      },
      wellnessPrice: {
        '<300': false,
        '300-599': false,
        '600-999': false,
        '1000+': false,
      },
    });
    setSearchQuery('');
  };

  const removeFilter = (type: string, value: string, parent?: string) => {
    if (type === 'brand') {
      handleBrandChange(value as 'adidas' | 'puma' | 'nike' | 'reebok');
    } else if (type === 'fabric') {
      handleFabricTypeChange(value);
    } else if (type === 'apparelBranding') {
      handleApparelBrandingChange(value);
    } else if (type === 'category') {
      handleSubCategoryChange(value);
    } else if (type === 'price') {
      setFilters(prev => ({ ...prev, priceMin: '', priceMax: '' }));
    } else if (type === 'minQty') {
      setFilters(prev => ({ ...prev, minQuantity: '' }));
    } else if (type === 'bagType') {
      handleBagTypeChange(value);
    } else if (type === 'material') {
      handleMaterialChange(value);
    } else if (type === 'capacity') {
      handleCapacityChange(value);
    } else if (type === 'laptopFit') {
      handleLaptopFitChange(value);
    } else if (type === 'feature') {
      handleFeaturesChange(value);
    } else if (type === 'bagBranding') {
      handleBagBrandingChange(value);
    } else if (type === 'bagColor') {
      handleBagColorsChange(value);
    } else if (type === 'stationeryType') {
      handleStationeryTypeChange(value);
    } else if (type === 'stationeryMaterial') {
      handleStationeryMaterialChange(value);
    } else if (type === 'paperGSM') {
      handlePaperGSMChange(value);
    } else if (type === 'pageType') {
      handlePageTypeChange(value);
    } else if (type === 'binding') {
      handleBindingChange(value);
    } else if (type === 'stationeryBranding') {
      handleStationeryBrandingChange(value);
    } else if (type === 'stationeryColor') {
      handleStationeryColorsChange(value);
    } else if (type === 'delivery') {
      handleDeliveryChange(value);
    } else if (type === 'techType') {
      handleTechTypeChange(value);
    } else if (type === 'battery') {
      handleBatteryChange(value);
    } else if (type === 'power') {
      handlePowerChange(value);
    } else if (type === 'connectivity') {
      handleConnectivityChange(value);
    } else if (type === 'techFeature') {
      handleTechFeaturesChange(value);
    } else if (type === 'techBranding') {
      handleTechBrandingChange(value);
    } else if (type === 'warranty') {
      handleWarrantyChange(value);
    } else if (type === 'techColor') {
      handleTechColorsChange(value);
    } else if (type === 'wellnessType') {
      handleWellnessTypeChange(value);
    } else if (type === 'wellnessMaterial') {
      handleWellnessMaterialChange(value);
    } else if (type === 'wellnessBenefit') {
      handleWellnessBenefitChange(value);
    } else if (type === 'fragrance') {
      handleFragranceChange(value);
    } else if (type === 'wellnessBranding') {
      handleWellnessBrandingChange(value);
    } else if (type === 'wellnessPrice') {
      handleWellnessPriceChange(value);
    }
  };

  // Get active filters for display as tags
  const getActiveFilters = () => {
    const active: Array<{ type: string; label: string; value: string; parent?: string }> = [];
    
    // Categories
    Object.entries(filters.categories).forEach(([category, isActive]) => {
      if (isActive) {
        const label = apparelSubcategories.find((subcategory) => subcategory.id === category)?.name ?? category;
        active.push({ type: 'category', label, value: category });
      }
    });

    // Fabric Type
    Object.entries(filters.fabricType).forEach(([fabric, isActive]) => {
      if (isActive) {
        active.push({ type: 'fabric', label: fabric, value: fabric });
      }
    });

    Object.entries(filters.apparelBranding).forEach(([branding, isActive]) => {
      if (isActive) {
        active.push({ type: 'apparelBranding', label: branding, value: branding });
      }
    });

    // Brands
    Object.entries(filters.brands).forEach(([brand, isActive]) => {
      if (isActive) {
        active.push({ type: 'brand', label: brand.charAt(0).toUpperCase() + brand.slice(1), value: brand });
      }
    });

    // Bags filters
    Object.entries(filters.bagTypes).forEach(([bagType, isActive]) => {
      if (isActive) {
        const label = bagsSubcategories.find((subcategory) => subcategory.id === bagType)?.name ?? bagType;
        active.push({ type: 'bagType', label, value: bagType });
      }
    });

    Object.entries(filters.material).forEach(([material, isActive]) => {
      if (isActive) {
        active.push({ type: 'material', label: material, value: material });
      }
    });

    Object.entries(filters.capacity).forEach(([capacity, isActive]) => {
      if (isActive) {
        active.push({ type: 'capacity', label: capacity, value: capacity });
      }
    });

    Object.entries(filters.laptopFit).forEach(([fit, isActive]) => {
      if (isActive) {
        active.push({ type: 'laptopFit', label: fit, value: fit });
      }
    });

    Object.entries(filters.features).forEach(([feature, isActive]) => {
      if (isActive) {
        active.push({ type: 'feature', label: feature, value: feature });
      }
    });

    Object.entries(filters.bagBranding).forEach(([branding, isActive]) => {
      if (isActive) {
        active.push({ type: 'bagBranding', label: branding, value: branding });
      }
    });

    Object.entries(filters.bagColors).forEach(([color, isActive]) => {
      if (isActive) {
        active.push({ type: 'bagColor', label: color, value: color });
      }
    });

    // Stationery filters
    Object.entries(filters.stationeryType).forEach(([type, isActive]) => {
      if (isActive) {
        active.push({ type: 'stationeryType', label: type, value: type });
      }
    });

    Object.entries(filters.stationeryMaterial).forEach(([material, isActive]) => {
      if (isActive) {
        active.push({ type: 'stationeryMaterial', label: material, value: material });
      }
    });

    Object.entries(filters.paperGSM).forEach(([gsm, isActive]) => {
      if (isActive) {
        active.push({ type: 'paperGSM', label: `${gsm} GSM`, value: gsm });
      }
    });

    Object.entries(filters.pageType).forEach(([pageType, isActive]) => {
      if (isActive) {
        active.push({ type: 'pageType', label: pageType, value: pageType });
      }
    });

    Object.entries(filters.binding).forEach(([binding, isActive]) => {
      if (isActive) {
        active.push({ type: 'binding', label: binding, value: binding });
      }
    });

    Object.entries(filters.stationeryBranding).forEach(([branding, isActive]) => {
      if (isActive) {
        active.push({ type: 'stationeryBranding', label: branding, value: branding });
      }
    });

    Object.entries(filters.stationeryColors).forEach(([color, isActive]) => {
      if (isActive) {
        active.push({ type: 'stationeryColor', label: color, value: color });
      }
    });

    Object.entries(filters.delivery).forEach(([delivery, isActive]) => {
      if (isActive) {
        active.push({ type: 'delivery', label: delivery, value: delivery });
      }
    });

    // Tech filters
    Object.entries(filters.techType).forEach(([type, isActive]) => {
      if (isActive) {
        active.push({ type: 'techType', label: type, value: type });
      }
    });

    Object.entries(filters.battery).forEach(([battery, isActive]) => {
      if (isActive) {
        active.push({ type: 'battery', label: `${battery} mAh`, value: battery });
      }
    });

    Object.entries(filters.power).forEach(([power, isActive]) => {
      if (isActive) {
        active.push({ type: 'power', label: power, value: power });
      }
    });

    Object.entries(filters.connectivity).forEach(([connectivity, isActive]) => {
      if (isActive) {
        active.push({ type: 'connectivity', label: connectivity, value: connectivity });
      }
    });

    Object.entries(filters.techFeatures).forEach(([feature, isActive]) => {
      if (isActive) {
        active.push({ type: 'techFeature', label: feature, value: feature });
      }
    });

    Object.entries(filters.techBranding).forEach(([branding, isActive]) => {
      if (isActive) {
        active.push({ type: 'techBranding', label: branding, value: branding });
      }
    });

    Object.entries(filters.warranty).forEach(([warranty, isActive]) => {
      if (isActive) {
        active.push({ type: 'warranty', label: warranty, value: warranty });
      }
    });

    Object.entries(filters.techColors).forEach(([color, isActive]) => {
      if (isActive) {
        active.push({ type: 'techColor', label: color, value: color });
      }
    });

    // Wellness filters
    Object.entries(filters.wellnessType).forEach(([type, isActive]) => {
      if (isActive) {
        active.push({ type: 'wellnessType', label: type, value: type });
      }
    });

    Object.entries(filters.wellnessMaterial).forEach(([material, isActive]) => {
      if (isActive) {
        active.push({ type: 'wellnessMaterial', label: material, value: material });
      }
    });

    Object.entries(filters.wellnessBenefit).forEach(([benefit, isActive]) => {
      if (isActive) {
        active.push({ type: 'wellnessBenefit', label: benefit, value: benefit });
      }
    });

    Object.entries(filters.fragrance).forEach(([fragrance, isActive]) => {
      if (isActive) {
        active.push({ type: 'fragrance', label: fragrance, value: fragrance });
      }
    });

    Object.entries(filters.wellnessBranding).forEach(([branding, isActive]) => {
      if (isActive) {
        active.push({ type: 'wellnessBranding', label: branding, value: branding });
      }
    });

    Object.entries(filters.wellnessPrice).forEach(([price, isActive]) => {
      if (isActive) {
        active.push({ type: 'wellnessPrice', label: price, value: price });
      }
    });

    return active;
  };

  // Filter products based on active filters and selected category/subcategory
  const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
  const hasBrandingMatch = (productBranding: string[] = [], activeBranding: string[]) => {
    if (activeBranding.length === 0) return true
    const normalizedProductBranding = productBranding.map((value) => normalizeToken(value))
    return activeBranding.some((option) => {
      const normalizedOption = normalizeToken(option)
      return normalizedProductBranding.some(
        (brandingValue) => brandingValue.includes(normalizedOption) || normalizedOption.includes(brandingValue),
      )
    })
  }

  const filteredProducts = selectedCategory === 'health'
    ? [...partnerWellnessFromAdmin, ...wellnessProducts].filter(product => {
        // Filter by selected wellness subcategory
        if (selectedWellnessSubcategory !== 'all' && product.subcategory !== selectedWellnessSubcategory) {
          return false;
        }

        // Search filter
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Wellness Type filter
        const activeTypes = Object.entries(filters.wellnessType)
          .filter(([_, isActive]) => isActive)
          .map(([type]) => type);
        
        if (activeTypes.length > 0 && !activeTypes.includes(product.type)) {
          return false;
        }

        // Material filter
        const activeMaterials = Object.entries(filters.wellnessMaterial)
          .filter(([_, isActive]) => isActive)
          .map(([material]) => material);
        
        if (activeMaterials.length > 0 && !activeMaterials.includes(product.material)) {
          return false;
        }

        // Wellness Benefit filter
        const activeBenefits = Object.entries(filters.wellnessBenefit)
          .filter(([_, isActive]) => isActive)
          .map(([benefit]) => benefit);
        
        if (activeBenefits.length > 0 && !activeBenefits.some(benefit => product.wellnessBenefit.includes(benefit))) {
          return false;
        }

        // Fragrance filter
        const activeFragrances = Object.entries(filters.fragrance)
          .filter(([_, isActive]) => isActive)
          .map(([fragrance]) => fragrance);
        
        if (activeFragrances.length > 0 && product.fragrance && !activeFragrances.includes(product.fragrance)) {
          return false;
        }

        // Branding filter
        const activeBranding = Object.entries(filters.wellnessBranding)
          .filter(([_, isActive]) => isActive)
          .map(([branding]) => branding);
        
        if (!hasBrandingMatch(product.branding, activeBranding)) {
          return false;
        }

        // Price filter
        const activePriceRanges = Object.entries(filters.wellnessPrice)
          .filter(([_, isActive]) => isActive)
          .map(([price]) => price);
        
        if (activePriceRanges.length > 0) {
          const priceMatch = activePriceRanges.some(range => {
            if (range === '<300') return product.price < 300;
            if (range === '300-599') return product.price >= 300 && product.price <= 599;
            if (range === '600-999') return product.price >= 600 && product.price <= 999;
            if (range === '1000+') return product.price >= 1000;
            return false;
          });
          if (!priceMatch) return false;
        }

        // Delivery filter
        const activeDelivery = Object.entries(filters.delivery)
          .filter(([_, isActive]) => isActive)
          .map(([delivery]) => delivery);
        
        if (activeDelivery.length > 0 && !activeDelivery.includes(product.eta)) {
          return false;
        }

        return true;
      })
    : selectedCategory === 'tech'
    ? [...partnerTechFromAdmin, ...techProducts].filter(product => {
        // Filter by selected tech subcategory
        if (selectedTechSubcategory !== 'all' && product.subcategory !== selectedTechSubcategory) {
          return false;
        }

        // Search filter
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Tech Type filter
        const activeTypes = Object.entries(filters.techType)
          .filter(([_, isActive]) => isActive)
          .map(([type]) => type);
        
        if (activeTypes.length > 0 && !activeTypes.includes(product.type)) {
          return false;
        }

        // Battery filter
        const activeBatteries = Object.entries(filters.battery)
          .filter(([_, isActive]) => isActive)
          .map(([battery]) => battery);
        
        if (activeBatteries.length > 0 && product.batteryMah) {
          const batteryMatch = activeBatteries.some(range => {
            if (range === '3000-5000') return product.batteryMah! >= 3000 && product.batteryMah! <= 5000;
            if (range === '5000-10000') return product.batteryMah! > 5000 && product.batteryMah! <= 10000;
            if (range === '10000-20000') return product.batteryMah! > 10000 && product.batteryMah! <= 20000;
            if (range === '20000+') return product.batteryMah! > 20000;
            return false;
          });
          if (!batteryMatch) return false;
        }

        // Power filter
        const activePower = Object.entries(filters.power)
          .filter(([_, isActive]) => isActive)
          .map(([power]) => power);
        
        if (activePower.length > 0 && product.outputPower && !activePower.includes(product.outputPower)) {
          return false;
        }

        // Connectivity filter
        const activeConnectivity = Object.entries(filters.connectivity)
          .filter(([_, isActive]) => isActive)
          .map(([conn]) => conn);
        
        if (activeConnectivity.length > 0) {
          const hasMatch = activeConnectivity.some(conn => {
            if (product.bluetoothVersion && conn.startsWith('BT')) {
              return product.bluetoothVersion === conn;
            }
            if (product.connectivity) {
              return product.connectivity.includes(conn);
            }
            if (product.chargingType) {
              return product.chargingType.includes(conn);
            }
            return false;
          });
          if (!hasMatch) return false;
        }

        // Features filter
        const activeFeatures = Object.entries(filters.techFeatures)
          .filter(([_, isActive]) => isActive)
          .map(([feature]) => feature);
        
        if (activeFeatures.length > 0 && !activeFeatures.some(feature => product.features.includes(feature))) {
          return false;
        }

        // Branding filter
        const activeBranding = Object.entries(filters.techBranding)
          .filter(([_, isActive]) => isActive)
          .map(([branding]) => branding);
        
        if (!hasBrandingMatch(product.branding, activeBranding)) {
          return false;
        }

        // Warranty filter
        const activeWarranty = Object.entries(filters.warranty)
          .filter(([_, isActive]) => isActive)
          .map(([warranty]) => warranty);
        
        if (activeWarranty.length > 0 && !activeWarranty.includes(product.warranty)) {
          return false;
        }

        // Color filter
        const activeColors = Object.entries(filters.techColors)
          .filter(([_, isActive]) => isActive)
          .map(([color]) => color);
        
        if (activeColors.length > 0 && !activeColors.some(color => product.colors.includes(color))) {
          return false;
        }

        // Delivery filter
        const activeDelivery = Object.entries(filters.delivery)
          .filter(([_, isActive]) => isActive)
          .map(([delivery]) => delivery);
        
        if (activeDelivery.length > 0 && !activeDelivery.includes(product.eta)) {
          return false;
        }

        // Price filter
        if (filters.priceMin && product.price < parseInt(filters.priceMin)) {
          return false;
        }
        if (filters.priceMax && product.price > parseInt(filters.priceMax)) {
          return false;
        }

        return true;
      })
    : selectedCategory === 'stationary'
    ? [...partnerStationeryFromAdmin, ...stationeryProducts].filter(product => {
        // Filter by selected stationery subcategory
        if (selectedStationerySubcategory !== 'all' && product.subcategory !== selectedStationerySubcategory) {
          return false;
        }

        // Search filter
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Stationery Type filter
        const activeTypes = Object.entries(filters.stationeryType)
          .filter(([_, isActive]) => isActive)
          .map(([type]) => type);
        
        if (activeTypes.length > 0 && !activeTypes.includes(product.type)) {
          return false;
        }

        // Material filter
        const activeMaterials = Object.entries(filters.stationeryMaterial)
          .filter(([_, isActive]) => isActive)
          .map(([material]) => material);
        
        if (activeMaterials.length > 0 && !activeMaterials.includes(product.material)) {
          return false;
        }

        // Paper GSM filter
        const activeGSM = Object.entries(filters.paperGSM)
          .filter(([_, isActive]) => isActive)
          .map(([gsm]) => gsm);
        
        if (activeGSM.length > 0 && product.paperGSM && !activeGSM.includes(product.paperGSM)) {
          return false;
        }

        // Page Type filter
        const activePageTypes = Object.entries(filters.pageType)
          .filter(([_, isActive]) => isActive)
          .map(([pageType]) => pageType);
        
        if (activePageTypes.length > 0 && product.pageType && !activePageTypes.includes(product.pageType)) {
          return false;
        }

        // Binding filter
        const activeBindings = Object.entries(filters.binding)
          .filter(([_, isActive]) => isActive)
          .map(([binding]) => binding);
        
        if (activeBindings.length > 0 && product.binding && !activeBindings.includes(product.binding)) {
          return false;
        }

        // Branding filter
        const activeBranding = Object.entries(filters.stationeryBranding)
          .filter(([_, isActive]) => isActive)
          .map(([branding]) => branding);
        
        if (!hasBrandingMatch(product.branding, activeBranding)) {
          return false;
        }

        // Colour filter
        const activeColors = Object.entries(filters.stationeryColors)
          .filter(([_, isActive]) => isActive)
          .map(([color]) => color);
        
        if (activeColors.length > 0 && !activeColors.some(color => product.colors.includes(color))) {
          return false;
        }

        // Delivery filter
        const activeDelivery = Object.entries(filters.delivery)
          .filter(([_, isActive]) => isActive)
          .map(([delivery]) => delivery);
        
        if (activeDelivery.length > 0 && !activeDelivery.includes(product.eta)) {
          return false;
        }

        // Price filter
        if (filters.priceMin && product.price < parseInt(filters.priceMin)) {
          return false;
        }
        if (filters.priceMax && product.price > parseInt(filters.priceMax)) {
          return false;
        }

        return true;
      })
    : selectedCategory === 'bags' 
    ? [...partnerBagsFromAdmin, ...bagsProducts].filter(bag => {
        // Bag Type filter
        const activeBagTypes = Object.entries(filters.bagTypes)
          .filter(([_, isActive]) => isActive)
          .map(([bagType]) => bagType);

        if (activeBagTypes.length > 0 && !activeBagTypes.includes(bag.subcategory)) {
          return false;
        }

        // Filter by selected bag subcategory
        if (selectedBagSubcategory !== 'all' && bag.subcategory !== selectedBagSubcategory) {
          return false;
        }

        // Search filter
        if (searchQuery && !bag.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !bag.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Material filter
        const activeMaterials = Object.entries(filters.material)
          .filter(([_, isActive]) => isActive)
          .map(([material]) => material.toLowerCase());
        
        if (activeMaterials.length > 0 && !activeMaterials.some(material => bag.material.toLowerCase().includes(material))) {
          return false;
        }

        // Capacity filter
        const activeCapacities = Object.entries(filters.capacity)
          .filter(([_, isActive]) => isActive)
          .map(([capacity]) => capacity);
        
        if (activeCapacities.length > 0 && !activeCapacities.includes(bag.capacity)) {
          return false;
        }

        // Laptop Fit filter
        const activeLaptopFits = Object.entries(filters.laptopFit)
          .filter(([_, isActive]) => isActive)
          .map(([fit]) => fit);
        
        if (activeLaptopFits.length > 0 && bag.laptopFit && !activeLaptopFits.includes(bag.laptopFit)) {
          return false;
        }

        // Features filter
        const activeFeatures = Object.entries(filters.features)
          .filter(([_, isActive]) => isActive)
          .map(([feature]) => feature);
        
        if (activeFeatures.length > 0 && !activeFeatures.every(feature => bag.features.includes(feature))) {
          return false;
        }

        // Bag Branding filter
        const activeBagBranding = Object.entries(filters.bagBranding)
          .filter(([_, isActive]) => isActive)
          .map(([branding]) => branding);
        
        if (!hasBrandingMatch(bag.branding, activeBagBranding)) {
          return false;
        }

        // Bag Colors filter
        const activeBagColors = Object.entries(filters.bagColors)
          .filter(([_, isActive]) => isActive)
          .map(([color]) => color);
        
        if (activeBagColors.length > 0 && !activeBagColors.some(color => bag.colors.includes(color))) {
          return false;
        }

        // Price filter
        if (filters.priceMin && bag.price < parseInt(filters.priceMin)) {
          return false;
        }
        if (filters.priceMax && bag.price > parseInt(filters.priceMax)) {
          return false;
        }

        // Minimum quantity filter
        if (filters.minQuantity && bag.moq < parseInt(filters.minQuantity)) {
          return false;
        }

        return true;
      })
    : [...partnerApparelFromAdmin, ...apparelProducts].filter(product => {
        // Category filter
        const activeCategories = Object.entries(filters.categories)
          .filter(([_, isActive]) => isActive)
          .map(([category]) => category);

        if (activeCategories.length > 0 && !activeCategories.includes(product.subcategory)) {
          return false;
        }

        // Filter by selected apparel subcategory
        if (selectedApparelSubcategory !== 'all' && product.subcategory !== selectedApparelSubcategory) {
          return false;
        }

        // Search filter
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Brand filter
        const activeBrands = Object.entries(filters.brands)
          .filter(([_, isActive]) => isActive)
          .map(([brand]) => brand);
        
        if (activeBrands.length > 0 && !activeBrands.some(brand => product.brand.toLowerCase() === brand)) {
          return false;
        }

        // Fabric Type filter
        const activeFabrics = Object.entries(filters.fabricType)
          .filter(([_, isActive]) => isActive)
          .map(([fabric]) => fabric.toLowerCase())    
        if (activeFabrics.length > 0 && !activeFabrics.some(fabric => product.fabric.toLowerCase().includes(fabric))) {
          return false;
        }

        // Apparel Branding filter
        const activeApparelBranding = Object.entries(filters.apparelBranding)
          .filter(([_, isActive]) => isActive)
          .map(([branding]) => branding)

        if (!hasBrandingMatch(product.branding, activeApparelBranding)) {
          return false
        }

        // Delivery filter
        const activeDelivery = Object.entries(filters.delivery)
          .filter(([_, isActive]) => isActive)
          .map(([delivery]) => delivery)

        if (activeDelivery.length > 0) {
          const deliveryValue = typeof (product as { eta?: unknown }).eta === 'string' ? (product as { eta: string }).eta : product.delivery
          if (!activeDelivery.includes(deliveryValue)) {
            return false
          }
        }

        // Price filter
        if (filters.priceMin && product.price < parseInt(filters.priceMin)) {
          return false;
        }
        if (filters.priceMax && product.price > parseInt(filters.priceMax)) {
          return false;
        }

        // Minimum quantity filter
        if (filters.minQuantity && product.moq < parseInt(filters.minQuantity)) {
          return false;
        }

        return true;
      });

  type DisplayProduct = (typeof filteredProducts)[number] & {
    pricingType?: 'transparent' | 'offer' | 'on_request';
    paymentMode?: 'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway';
    paymentTerm?: 'advance_100' | 'partial_50' | 'net_30';
  };

  const getPricingTypeLabel = (value?: DisplayProduct['pricingType']) =>
    value === 'transparent' ? 'Book Now' : value === 'offer' ? 'Offer Price' : 'On Request';
  const getPaymentModeLabel = (value?: DisplayProduct['paymentMode']) =>
    value === 'wallet' ? 'Corporate Credit' : value === 'net_banking' ? 'Net Banking' : value === 'neft_rtgs' ? 'NEFT/RTGS' : 'Gateway';
  const getPaymentTermLabel = (value?: DisplayProduct['paymentTerm']) =>
    value === 'advance_100' ? '100% Advance' : value === 'partial_50' ? '50% + Balance' : 'Net 30';

  const publishedConfig = (() => {
    try {
      const raw = localStorage.getItem('vendorSpaceListingConfig');
      if (!raw) return null;
      return JSON.parse(raw) as {
        pricingMode?: 'fixed' | 'negotiable' | 'on_request';
        paymentMode?: 'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway';
        paymentTerm?: 'advance_100' | 'partial_50' | 'net_30';
      };
    } catch {
      return null;
    }
  })();

  const displayProducts = useMemo(() => {
    const enriched: DisplayProduct[] = filteredProducts.map((product, index) => {
      const fallbackPricingType: DisplayProduct['pricingType'] =
        index % 3 === 0 ? 'transparent' : index % 3 === 1 ? 'offer' : 'on_request';
      const fallbackPaymentMode: DisplayProduct['paymentMode'] =
        index % 4 === 0 ? 'gateway' : index % 4 === 1 ? 'wallet' : index % 4 === 2 ? 'net_banking' : 'neft_rtgs';
      const fallbackPaymentTerm: DisplayProduct['paymentTerm'] =
        index % 3 === 0 ? 'advance_100' : index % 3 === 1 ? 'partial_50' : 'net_30';

      const publishedPricingType: DisplayProduct['pricingType'] =
        publishedConfig?.pricingMode === 'fixed'
          ? 'transparent'
          : publishedConfig?.pricingMode === 'negotiable'
          ? 'offer'
          : publishedConfig?.pricingMode === 'on_request'
          ? 'on_request'
          : undefined;

      if (index < 4) {
        return {
          ...product,
          pricingType: publishedPricingType || fallbackPricingType,
          paymentMode: publishedConfig?.paymentMode || fallbackPaymentMode,
          paymentTerm: publishedConfig?.paymentTerm || fallbackPaymentTerm,
        };
      }

      return {
        ...product,
        pricingType: fallbackPricingType,
        paymentMode: fallbackPaymentMode,
        paymentTerm: fallbackPaymentTerm,
      };
    });

    const filtered = enriched.filter((product) => {
      if (pricingTypeFilter !== 'all' && product.pricingType !== pricingTypeFilter) return false;
      if (paymentModeFilter !== 'all' && product.paymentMode !== paymentModeFilter) return false;
      if (paymentTermFilter !== 'all' && product.paymentTerm !== paymentTermFilter) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_low_high') return a.price - b.price;
      if (sortBy === 'price_high_low') return b.price - a.price;
      if (sortBy === 'rating_high_low') return b.rating - a.rating;
      return 0;
    });
  }, [filteredProducts, paymentModeFilter, paymentTermFilter, pricingTypeFilter, publishedConfig, sortBy]);

  const giftingMasterCategories = [
    'Premium Gift Hampers',
    'Branded Merchandise / Swag',
    'Tech Accessories',
    'Wellness & Self-care',
    'Gourmet & Food Gifts',
    'Apparel & Clothing',
    'Stationery & Office',
    'Experiential Gifts',
    'Personalised Gifts',
    'Eco-friendly Gifts',
    'Festival Specials',
  ];

  const occasionOptions = [
    'Employee Onboarding',
    'Festive Gifting',
    'Milestone Rewards',
    'Client Appreciation',
    'Event Giveaways',
  ];

  useEffect(() => {
    const state = (location.state || {}) as { occasion?: string; preselectedOccasion?: string }
    const query = new URLSearchParams(location.search)
    const rawOccasion = (state.occasion || state.preselectedOccasion || query.get('occasion') || '').trim()
    if (!rawOccasion) return

    const normalized = rawOccasion.toLowerCase()
    const mappedOccasion =
      normalized.includes('diwali') || normalized.includes('festival')
        ? 'Festive Gifting'
        : normalized.includes('work anniversary') || normalized.includes('milestone') || normalized.includes('anniversary')
          ? 'Milestone Rewards'
          : normalized.includes('onboard') || normalized.includes('joiner')
            ? 'Employee Onboarding'
            : normalized.includes('client')
              ? 'Client Appreciation'
              : 'Event Giveaways'

    setOccasionFilter(mappedOccasion)
    setInjectedOccasionFilter(mappedOccasion)
  }, [location.search, location.state]);

  const postFilterProducts = useMemo(() => {
    const partnerIds = new Set<string>([
      ...partnerApparelFromAdmin.map((p) => String(p.id)),
      ...partnerBagsFromAdmin.map((p) => String(p.id)),
      ...partnerStationeryFromAdmin.map((p) => String(p.id)),
      ...partnerTechFromAdmin.map((p) => String(p.id)),
      ...partnerWellnessFromAdmin.map((p) => String(p.id)),
    ]);

    const resolveCanonicalCategory = (product: DisplayProduct): string => {
      if (selectedCategory === 'apparel') return 'Apparel & Clothing';
      if (selectedCategory === 'stationary') return 'Stationery & Office';
      if (selectedCategory === 'tech') return 'Tech Accessories';
      if (selectedCategory === 'health') return 'Wellness & Self-care';
      const blob = `${product.name} ${String((product as { description?: unknown }).description ?? '')}`.toLowerCase();
      if (blob.includes('hamper')) return 'Premium Gift Hampers';
      if (blob.includes('eco') || blob.includes('jute')) return 'Eco-friendly Gifts';
      return 'Branded Merchandise / Swag';
    };

    const resolveOccasion = (product: DisplayProduct): string => {
      const blob = `${product.name} ${String((product as { description?: unknown }).description ?? '')}`.toLowerCase();
      if (blob.includes('festival') || blob.includes('festive') || blob.includes('diwali')) return 'Festive Gifting';
      if (blob.includes('welcome') || blob.includes('onboard')) return 'Employee Onboarding';
      if (blob.includes('reward') || blob.includes('achievement')) return 'Milestone Rewards';
      if (blob.includes('client') || blob.includes('premium')) return 'Client Appreciation';
      return 'Event Giveaways';
    };

    return displayProducts.filter((product) => {
      const canonicalCategory = resolveCanonicalCategory(product);
      if (masterCategoryFilter !== 'all' && canonicalCategory !== masterCategoryFilter) return false;
      const mappedOccasion = resolveOccasion(product);
      if (occasionFilter !== 'all' && mappedOccasion !== occasionFilter) return false;

      const isVendorPartner = partnerIds.has(String(product.id));
      if (!matchesSourceFilter(sourceFilter, !isVendorPartner)) return false;

      const min = canonicalBudgetMin ? Number(canonicalBudgetMin) : undefined;
      const max = canonicalBudgetMax ? Number(canonicalBudgetMax) : undefined;
      const price = parsePriceLike((product as { price?: unknown }).price ?? null);
      return matchesPriceRange(price, min, max);
    });
  }, [
    canonicalBudgetMax,
    canonicalBudgetMin,
    displayProducts,
    masterCategoryFilter,
    occasionFilter,
    partnerApparelFromAdmin,
    partnerBagsFromAdmin,
    partnerStationeryFromAdmin,
    partnerTechFromAdmin,
    partnerWellnessFromAdmin,
    selectedCategory,
    sourceFilter,
  ]);

  return (
    <div className="flex min-h-screen h-screen mogzu-module-shell-bg overflow-hidden">
      {/* Left Sidebar Navigation */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="shop"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb + tabs: no filled band — shows Mogzu scroll backdrop through */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-2 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button onClick={() => navigate('/dashboard')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">
                  Dashboard
                </button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <button onClick={() => navigate('/gifting')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">
                  Gifting
                </button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <span className="text-[#0e1e3f] font-semibold tracking-tight">Shop</span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-[22px] font-bold text-[#0e1e3f] leading-none">Gifting</h1>
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {/* Home Button */}
                  <button
                    onClick={() => navigate('/gifting')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Home className="w-5 h-5 text-[#2563eb]" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('shop')}
                    className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                      activeTab === 'shop'
                        ? 'font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]'
                        : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5'
                    }`}
                    style={
                      activeTab === 'shop'
                        ? {
                            backgroundImage:
                              'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                          }
                        : {}
                    }
                  >
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                      <path d={svgPaths.p1b8af0} fill={activeTab === 'shop' ? '#2563eb' : '#64748b'} />
                    </svg>
                    <span>Shop</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('celebrations');
                      navigate('/gifting/celebrations');
                    }}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <PartyPopper className="w-5 h-5 text-[#FF5E00]" />
                    <span>Celebrations</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('combo');
                      navigate('/gifting/combo');
                    }}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Package className="w-5 h-5 text-[#0ea5e9]" />
                    <span>Combo</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('egift');
                      navigate('/gifting/e-gift');
                    }}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <CreditCard className="w-5 h-5 text-[#9B51E0]" />
                    <span>E-gift</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('golocal');
                      navigate('/gifting/go-local');
                    }}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <MapPin className="w-5 h-5 text-[#15D39D]" />
                    <span>Go-local</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('baskets');
                      navigate('/gifting/baskets');
                    }}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Gift className="w-5 h-5 text-[#d4a000]" />
                    <span>Baskets</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pt-6">
            <div className="group relative overflow-hidden rounded-3xl border border-white/60 h-[200px] mb-6 bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(37,99,235,0.18)]">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
              <div className="relative flex h-[200px]">
                <div className="w-[55%] px-8 py-6 flex flex-col justify-center">
                  <div className="inline-flex items-center rounded-full bg-[#ebf1ff] text-[#475569] px-2.5 py-1 text-[12px] font-medium mb-3 w-fit">
                    ⭐ By BR group
                  </div>
                  <h3 className="text-[24px] font-bold text-[#0e1e3f] leading-tight line-clamp-2">
                    Special offer on Work Anniversary gifts
                  </h3>
                  <p className="text-[14px] text-[#64748b] leading-[1.6] mt-2 mb-5 max-w-[380px]">
                    Book your next event with us and choose from tailored packages designed for seamless delivery and all-inclusive services.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/product-booking')}
                    className="h-11 px-6 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[14px] font-semibold shadow-[0_10px_22px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:scale-[0.98] transition-all w-fit"
                  >
                    View offer
                  </button>
                </div>
                <div className="w-[45%] relative overflow-hidden">
                  <img src={imgImage24995} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            {/* Category Icons */}
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 mb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    if (category.id === 'apparel') {
                      setSelectedApparelSubcategory('all');
                    } else if (category.id === 'bags') {
                      setSelectedBagSubcategory('all');
                    } else if (category.id === 'stationary') {
                      setSelectedStationerySubcategory('all');
                    } else if (category.id === 'tech') {
                      setSelectedTechSubcategory('all');
                    } else if (category.id === 'health') {
                      setSelectedWellnessSubcategory('all');
                    }
                  }}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                    selectedCategory === category.id
                      ? "border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.2)] text-[#0e1e3f]"
                      : "border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]"
                  }`}
                  style={
                    selectedCategory === category.id
                      ? {
                          backgroundImage:
                            'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                        }
                      : {}
                  }
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center ${
                      category.id === 'apparel'
                        ? 'text-[#4f46e5]'
                        : category.id === 'bags'
                          ? 'text-[#FF5E00]'
                          : category.id === 'stationary'
                            ? 'text-[#0ea5e9]'
                            : category.id === 'tech'
                              ? 'text-[#9B51E0]'
                              : 'text-[#15D39D]'
                    }`}
                  >
                    {category.id === 'apparel' ? (
                      <svg className="w-full h-full" fill="none" viewBox="0 0 36 36">
                        <path 
                          d={svgPathsNew[category.icon]} 
                          fill="currentColor"
                        />
                      </svg>
                    ) : category.id === 'bags' ? (
                      <ShoppingBag 
                        size={24} 
                        className="w-full h-full" 
                        strokeWidth={2}
                      />
                    ) : category.id === 'stationary' ? (
                      <Pencil 
                        size={24} 
                        className="w-full h-full" 
                        strokeWidth={2}
                      />
                    ) : category.id === 'tech' ? (
                      <Laptop 
                        size={24} 
                        className="w-full h-full" 
                        strokeWidth={2}
                      />
                    ) : category.id === 'health' ? (
                      <Heart 
                        size={24} 
                        className="w-full h-full" 
                        strokeWidth={2}
                      />
                    ) : null}
                  </div>
                  <span className={`text-[14px] ${selectedCategory === category.id ? 'font-semibold' : 'font-medium'}`}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Apparel Subcategories - Only shown when Apparel is selected */}
            {selectedCategory === 'apparel' && (
              <div className="mb-5 overflow-x-auto pb-2">
                <div className="flex gap-2 justify-start min-w-max">
                  <button
                    onClick={() => setSelectedApparelSubcategory('all')}
                    className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border ${
                      selectedApparelSubcategory === 'all'
                        ? "bg-[#2563eb] border-[#2563eb] text-white shadow-md"
                        : "bg-white border-[#e5e7eb] text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]"
                    }`}
                  >
                    All Products
                  </button>
                  {apparelSubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedApparelSubcategory(subcategory.id)}
                      className="h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border shadow-sm"
                      style={{
                        backgroundColor: selectedApparelSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        borderColor: selectedApparelSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        color: selectedApparelSubcategory === subcategory.id 
                          ? subcategory.activeText 
                          : subcategory.textColor,
                      }}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bags Subcategories - Only shown when Bags is selected */}
            {selectedCategory === 'bags' && (
              <div className="mb-5 overflow-x-auto pb-2">
                <div className="flex gap-2 justify-start min-w-max px-2">
                  <button
                    onClick={() => setSelectedBagSubcategory('all')}
                    className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border ${
                      selectedBagSubcategory === 'all'
                        ? "bg-[#2563eb] border-[#2563eb] text-white shadow-md"
                        : "bg-white border-[#e5e7eb] text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]"
                    }`}
                  >
                    All Bags
                  </button>
                  {bagsSubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedBagSubcategory(subcategory.id)}
                      className="h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border shadow-sm"
                      style={{
                        backgroundColor: selectedBagSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        borderColor: selectedBagSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        color: selectedBagSubcategory === subcategory.id 
                          ? subcategory.activeText 
                          : subcategory.textColor,
                      }}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stationery Subcategories - Only shown when Stationery is selected */}
            {selectedCategory === 'stationary' && (
              <div className="mb-5 overflow-x-auto pb-2">
                <div className="flex gap-2 justify-start min-w-max px-2">
                  <button
                    onClick={() => setSelectedStationerySubcategory('all')}
                    className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border ${
                      selectedStationerySubcategory === 'all'
                        ? "bg-[#2563eb] border-[#2563eb] text-white shadow-md"
                        : "bg-white border-[#e5e7eb] text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]"
                    }`}
                  >
                    All Stationery
                  </button>
                  {stationerySubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedStationerySubcategory(subcategory.id)}
                      className="h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border shadow-sm"
                      style={{
                        backgroundColor: selectedStationerySubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        borderColor: selectedStationerySubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        color: selectedStationerySubcategory === subcategory.id 
                          ? subcategory.activeText 
                          : subcategory.textColor,
                      }}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Subcategories - Only shown when Tech is selected */}
            {selectedCategory === 'tech' && (
              <div className="mb-5 overflow-x-auto pb-2">
                <div className="flex gap-2 justify-start min-w-max px-2">
                  <button
                    onClick={() => setSelectedTechSubcategory('all')}
                    className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border ${
                      selectedTechSubcategory === 'all'
                        ? "bg-[#2563eb] border-[#2563eb] text-white shadow-md"
                        : "bg-white border-[#e5e7eb] text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]"
                    }`}
                  >
                    All Tech
                  </button>
                  {techSubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedTechSubcategory(subcategory.id)}
                      className="h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border shadow-sm"
                      style={{
                        backgroundColor: selectedTechSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        borderColor: selectedTechSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        color: selectedTechSubcategory === subcategory.id 
                          ? subcategory.activeText 
                          : subcategory.textColor,
                      }}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wellness Subcategories - Only shown when Wellness is selected */}
            {selectedCategory === 'health' && (
              <div className="mb-5 overflow-x-auto pb-2">
                <div className="flex gap-2 justify-start min-w-max px-2">
                  <button
                    onClick={() => setSelectedWellnessSubcategory('all')}
                    className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border ${
                      selectedWellnessSubcategory === 'all'
                        ? "bg-[#2563eb] border-[#2563eb] text-white shadow-md"
                        : "bg-white border-[#e5e7eb] text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]"
                    }`}
                  >
                    All Wellness
                  </button>
                  {wellnessSubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedWellnessSubcategory(subcategory.id)}
                      className="h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border shadow-sm"
                      style={{
                        backgroundColor: selectedWellnessSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        borderColor: selectedWellnessSubcategory === subcategory.id 
                          ? subcategory.activeBg 
                          : subcategory.bgColor,
                        color: selectedWellnessSubcategory === subcategory.id 
                          ? subcategory.activeText 
                          : subcategory.textColor,
                      }}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid with Filters */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pb-6 flex gap-4">
            {/* Left Sidebar - Filters */}
            <aside className="w-[240px] flex-shrink-0">
              <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">Filters</h3>
                  <button className="text-[13px] font-medium text-[#4379ee] underline" onClick={handleClearAll}>Clear all</button>
                </div>

                {selectedCategory === 'health' ? (
                  // Wellness Filters
                  <>
                    {/* Type */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('wellnessType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.wellnessType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.wellnessType && (
                        <div className="space-y-2">
                          {Object.keys(filters.wellnessType).map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.wellnessType[type as keyof typeof filters.wellnessType]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleWellnessTypeChange(type)} 
                              />
                              <span className="text-sm text-[#475569]">{type}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Material */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('wellnessMaterial')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Material</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.wellnessMaterial ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.wellnessMaterial && (
                        <div className="space-y-2">
                          {Object.keys(filters.wellnessMaterial).map((material) => (
                            <label key={material} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.wellnessMaterial[material as keyof typeof filters.wellnessMaterial]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleWellnessMaterialChange(material)} 
                              />
                              <span className="text-sm text-[#475569]">{material}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Wellness Benefit */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('wellnessBenefit')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Wellness Benefit</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.wellnessBenefit ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.wellnessBenefit && (
                        <div className="space-y-2">
                          {Object.keys(filters.wellnessBenefit).map((benefit) => (
                            <label key={benefit} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.wellnessBenefit[benefit as keyof typeof filters.wellnessBenefit]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleWellnessBenefitChange(benefit)} 
                              />
                              <span className="text-sm text-[#475569]">{benefit}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fragrance */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('fragrance')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Fragrance</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.fragrance ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.fragrance && (
                        <div className="space-y-2">
                          {Object.keys(filters.fragrance).map((fragrance) => (
                            <label key={fragrance} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.fragrance[fragrance as keyof typeof filters.fragrance]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleFragranceChange(fragrance)} 
                              />
                              <span className="text-sm text-[#475569]">{fragrance}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Branding */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('wellnessBranding')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Branding</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.wellnessBranding ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.wellnessBranding && (
                        <div className="space-y-2">
                          {Object.keys(filters.wellnessBranding).map((branding) => (
                            <label key={branding} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.wellnessBranding[branding as keyof typeof filters.wellnessBranding]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleWellnessBrandingChange(branding)} 
                              />
                              <span className="text-sm text-[#475569]">{branding}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('wellnessPrice')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Price</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.wellnessPrice ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.wellnessPrice && (
                        <div className="space-y-2">
                          {Object.keys(filters.wellnessPrice).map((price) => (
                            <label key={price} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.wellnessPrice[price as keyof typeof filters.wellnessPrice]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleWellnessPriceChange(price)} 
                              />
                              <span className="text-sm text-[#475569]">₹{price}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delivery */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('delivery')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Delivery</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.delivery ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.delivery && (
                        <div className="space-y-2">
                          {Object.keys(filters.delivery).map((delivery) => (
                            <label key={delivery} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.delivery[delivery as keyof typeof filters.delivery]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleDeliveryChange(delivery)} 
                              />
                              <span className="text-sm text-[#475569]">{delivery}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedCategory === 'tech' ? (
                  // Tech Filters
                  <>
                    {/* Type */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('techType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.techType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.techType && (
                        <div className="space-y-2">
                          {Object.keys(filters.techType).map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.techType[type as keyof typeof filters.techType]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleTechTypeChange(type)} 
                              />
                              <span className="text-sm text-[#475569]">{type}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Battery */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('battery')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Battery (mAh)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.battery ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.battery && (
                        <div className="space-y-2">
                          {Object.keys(filters.battery).map((battery) => (
                            <label key={battery} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.battery[battery as keyof typeof filters.battery]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleBatteryChange(battery)} 
                              />
                              <span className="text-sm text-[#475569]">{battery}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Power */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('power')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Power</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.power ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.power && (
                        <div className="space-y-2">
                          {Object.keys(filters.power).map((power) => (
                            <label key={power} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.power[power as keyof typeof filters.power]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handlePowerChange(power)} 
                              />
                              <span className="text-sm text-[#475569]">{power}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Connectivity */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('connectivity')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Connectivity</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.connectivity ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.connectivity && (
                        <div className="space-y-2">
                          {Object.keys(filters.connectivity).map((conn) => (
                            <label key={conn} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.connectivity[conn as keyof typeof filters.connectivity]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleConnectivityChange(conn)} 
                              />
                              <span className="text-sm text-[#475569]">{conn}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('techFeatures')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Features</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.techFeatures ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.techFeatures && (
                        <div className="space-y-2">
                          {Object.keys(filters.techFeatures).map((feature) => (
                            <label key={feature} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.techFeatures[feature as keyof typeof filters.techFeatures]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleTechFeaturesChange(feature)} 
                              />
                              <span className="text-sm text-[#475569]">{feature}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Branding */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('techBranding')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Branding</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.techBranding ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.techBranding && (
                        <div className="space-y-2">
                          {Object.keys(filters.techBranding).map((branding) => (
                            <label key={branding} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.techBranding[branding as keyof typeof filters.techBranding]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleTechBrandingChange(branding)} 
                              />
                              <span className="text-sm text-[#475569]">{branding}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Warranty */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('warranty')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Warranty</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.warranty ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.warranty && (
                        <div className="space-y-2">
                          {Object.keys(filters.warranty).map((warranty) => (
                            <label key={warranty} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.warranty[warranty as keyof typeof filters.warranty]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleWarrantyChange(warranty)} 
                              />
                              <span className="text-sm text-[#475569]">{warranty}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colour */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('techColors')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Colour</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.techColors ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.techColors && (
                        <div className="space-y-2">
                          {Object.keys(filters.techColors).map((color) => (
                            <label key={color} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.techColors[color as keyof typeof filters.techColors]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleTechColorsChange(color)} 
                              />
                              <span className="text-sm text-[#475569]">{color}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Price</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.price && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="₹100"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMin}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                          />
                          <input
                            type="text"
                            placeholder="₹1000"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMax}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Delivery */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('delivery')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Delivery</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.delivery ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.delivery && (
                        <div className="space-y-2">
                          {Object.keys(filters.delivery).map((delivery) => (
                            <label key={delivery} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.delivery[delivery as keyof typeof filters.delivery]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleDeliveryChange(delivery)} 
                              />
                              <span className="text-sm text-[#475569]">{delivery}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedCategory === 'stationary' ? (
                  // Stationery Filters
                  <>
                    {/* Type */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('stationeryType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.stationeryType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.stationeryType && (
                        <div className="space-y-2">
                          {Object.keys(filters.stationeryType).map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.stationeryType[type as keyof typeof filters.stationeryType]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleStationeryTypeChange(type)} 
                              />
                              <span className="text-sm text-[#475569]">{type}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Material */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('stationeryMaterial')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Material</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.stationeryMaterial ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.stationeryMaterial && (
                        <div className="space-y-2">
                          {Object.keys(filters.stationeryMaterial).map((material) => (
                            <label key={material} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.stationeryMaterial[material as keyof typeof filters.stationeryMaterial]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleStationeryMaterialChange(material)} 
                              />
                              <span className="text-sm text-[#475569]">{material}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Paper GSM */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('paperGSM')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Paper GSM</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.paperGSM ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.paperGSM && (
                        <div className="space-y-2">
                          {Object.keys(filters.paperGSM).map((gsm) => (
                            <label key={gsm} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.paperGSM[gsm as keyof typeof filters.paperGSM]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handlePaperGSMChange(gsm)} 
                              />
                              <span className="text-sm text-[#475569]">{gsm}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Page Type */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('pageType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Page Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.pageType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.pageType && (
                        <div className="space-y-2">
                          {Object.keys(filters.pageType).map((pageType) => (
                            <label key={pageType} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.pageType[pageType as keyof typeof filters.pageType]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handlePageTypeChange(pageType)} 
                              />
                              <span className="text-sm text-[#475569]">{pageType}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Binding */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('binding')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Binding</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.binding ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.binding && (
                        <div className="space-y-2">
                          {Object.keys(filters.binding).map((binding) => (
                            <label key={binding} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.binding[binding as keyof typeof filters.binding]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleBindingChange(binding)} 
                              />
                              <span className="text-sm text-[#475569]">{binding}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Branding */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('stationeryBranding')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Branding</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.stationeryBranding ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.stationeryBranding && (
                        <div className="space-y-2">
                          {Object.keys(filters.stationeryBranding).map((branding) => (
                            <label key={branding} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.stationeryBranding[branding as keyof typeof filters.stationeryBranding]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleStationeryBrandingChange(branding)} 
                              />
                              <span className="text-sm text-[#475569]">{branding}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colour */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('stationeryColors')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Colour</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.stationeryColors ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.stationeryColors && (
                        <div className="space-y-2">
                          {Object.keys(filters.stationeryColors).map((color) => (
                            <label key={color} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.stationeryColors[color as keyof typeof filters.stationeryColors]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleStationeryColorsChange(color)} 
                              />
                              <span className="text-sm text-[#475569]">{color}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Price</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.price && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="₹100"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMin}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                          />
                          <input
                            type="text"
                            placeholder="₹1000"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMax}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Delivery */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('delivery')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Delivery</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.delivery ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.delivery && (
                        <div className="space-y-2">
                          {Object.keys(filters.delivery).map((delivery) => (
                            <label key={delivery} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.delivery[delivery as keyof typeof filters.delivery]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleDeliveryChange(delivery)} 
                              />
                              <span className="text-sm text-[#475569]">{delivery}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedCategory === 'bags' ? (
                  // Bags Filters
                  <>
                    {/* Bag Type */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleSection('bagType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Bag Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.bagType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.bagType && (
                        <div className="space-y-2">
                          {bagsSubcategories.map((subcategory) => (
                            <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(filters.bagTypes[subcategory.id as keyof typeof filters.bagTypes])}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                onChange={() => handleBagTypeChange(subcategory.id)}
                              />
                              <span className="text-sm text-[#475569]">{subcategory.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Material */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('material')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Material</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.material ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.material && (
                        <div className="space-y-2">
                          {Object.keys(filters.material).map((material) => (
                            <label key={material} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.material[material as keyof typeof filters.material]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleMaterialChange(material)} 
                              />
                              <span className="text-sm text-[#475569]">{material}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Capacity */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('capacity')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Capacity</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.capacity ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.capacity && (
                        <div className="space-y-2">
                          {Object.keys(filters.capacity).map((capacity) => (
                            <label key={capacity} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.capacity[capacity as keyof typeof filters.capacity]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleCapacityChange(capacity)} 
                              />
                              <span className="text-sm text-[#475569]">{capacity}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Laptop Fit */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('laptopFit')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Laptop Fit</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.laptopFit ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.laptopFit && (
                        <div className="space-y-2">
                          {Object.keys(filters.laptopFit).map((fit) => (
                            <label key={fit} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.laptopFit[fit as keyof typeof filters.laptopFit]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleLaptopFitChange(fit)} 
                              />
                              <span className="text-sm text-[#475569]">{fit}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('features')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Features</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.features ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.features && (
                        <div className="space-y-2">
                          {Object.keys(filters.features).map((feature) => (
                            <label key={feature} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.features[feature as keyof typeof filters.features]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleFeaturesChange(feature)} 
                              />
                              <span className="text-sm text-[#475569]">{feature}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Branding */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('bagBranding')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Branding</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.bagBranding ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.bagBranding && (
                        <div className="space-y-2">
                          {Object.keys(filters.bagBranding).map((branding) => (
                            <label key={branding} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.bagBranding[branding as keyof typeof filters.bagBranding]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleBagBrandingChange(branding)} 
                              />
                              <span className="text-sm text-[#475569]">{branding}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colour */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('bagColors')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Colour</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.bagColors ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.bagColors && (
                        <div className="space-y-2">
                          {Object.keys(filters.bagColors).map((color) => (
                            <label key={color} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={filters.bagColors[color as keyof typeof filters.bagColors]} 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                onChange={() => handleBagColorsChange(color)} 
                              />
                              <span className="text-sm text-[#475569]">{color}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Price</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.price && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="₹100"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMin}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                          />
                          <input
                            type="text"
                            placeholder="₹1000"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMax}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Minimum Quantity */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('minQuantity')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Minimum Quantity</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.minQuantity ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.minQuantity && (
                        <>
                          <div className="text-xs text-[#878e9e] mb-1">No minimum qty</div>
                          <input
                            type="text"
                            placeholder="Type qty"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.minQuantity}
                            onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
                          />
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  // Apparel Filters
                  <>
                    {/* Category */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('category')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Category</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.category ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.category && (
                        <div className="space-y-2 text-sm">
                          {apparelSubcategories.map((subcategory) => (
                            <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(filters.categories[subcategory.id as keyof typeof filters.categories])}
                                className="w-[18px] h-[18px] rounded border-gray-300 text-blue-600"
                                onChange={() => handleSubCategoryChange(subcategory.id)}
                              />
                              <span className="text-sm text-[#475569]">{subcategory.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fabric Type */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('fabricType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Fabric Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.fabricType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.fabricType && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.fabricType.Cotton} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleFabricTypeChange('Cotton')} />
                            <span className="text-sm text-[#475569]">Cotton</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.fabricType['Dry-Fit']} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleFabricTypeChange('Dry-Fit')} />
                            <span className="text-sm text-[#475569]">Dry-Fit</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.fabricType['Poly-Cotton']} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleFabricTypeChange('Poly-Cotton')} />
                            <span className="text-sm text-[#475569]">Poly-Cotton</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Price</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.price && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="₹100"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMin}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                          />
                          <input
                            type="text"
                            placeholder="₹1000"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.priceMax}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Minimum Quantity */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('minQuantity')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Minimum Quantity</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.minQuantity ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.minQuantity && (
                        <>
                          <div className="text-xs text-[#878e9e] mb-1">No minimum qty</div>
                          <input
                            type="text"
                            placeholder="Type qty"
                            className="w-full px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                            value={filters.minQuantity}
                            onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
                          />
                        </>
                      )}
                    </div>

                    {/* Brand */}
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleSection('brand')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Brand</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.brand ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.brand && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.brands.adidas} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleBrandChange('adidas')} />
                            <span className="text-sm text-[#475569]">Adidas</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.brands.puma} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleBrandChange('puma')} />
                            <span className="text-sm text-[#475569]">Puma</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.brands.nike} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleBrandChange('nike')} />
                            <span className="text-sm text-[#475569]">Nike</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={filters.brands.reebok} className="w-4 h-4 rounded border-gray-300 text-blue-600" onChange={() => handleBrandChange('reebok')} />
                            <span className="text-sm text-[#475569]">Reebok</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Branding */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleSection('apparelBranding')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Branding</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.apparelBranding ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.apparelBranding && (
                        <div className="space-y-2">
                          {Object.keys(filters.apparelBranding).map((branding) => (
                            <label key={branding} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.apparelBranding[branding as keyof typeof filters.apparelBranding]}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                onChange={() => handleApparelBrandingChange(branding)}
                              />
                              <span className="text-sm text-[#475569]">{branding}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delivery */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleSection('delivery')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Delivery</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.delivery ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.delivery && (
                        <div className="space-y-2">
                          {Object.keys(filters.delivery).map((delivery) => (
                            <label key={delivery} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.delivery[delivery as keyof typeof filters.delivery]}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                onChange={() => handleDeliveryChange(delivery)}
                              />
                              <span className="text-sm text-[#475569]">{delivery}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <p className="mt-4 rounded-xl border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] text-[#475569]">
                  Filters apply instantly as you select options
                </p>
              </div>
            </aside>

            {/* Right - Products Grid */}
            <div className="flex-1">
              {gridUiNotice ? (
                <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {gridUiNotice}
                </p>
              ) : null}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[13px] text-[#878e9e]">Sort by:</span>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters((prev) => !prev)}
                    className="h-10 flex items-center gap-2 px-4 text-sm font-medium text-[#0e1e3f] bg-white/70 border border-[#e5e7eb] rounded-xl hover:border-[#93c5fd] transition-all"
                  >
                    {showAdvancedFilters ? 'Compress Filters' : 'Expand Filters'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Active Filter Tags */}
              {(getActiveFilters().length > 0 || (injectedOccasionFilter && occasionFilter === injectedOccasionFilter)) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {injectedOccasionFilter && occasionFilter === injectedOccasionFilter && (
                    <button
                      onClick={() => {
                        setOccasionFilter('all')
                        setInjectedOccasionFilter(null)
                      }}
                      className="inline-flex items-center gap-1.5 h-7 px-3 bg-white border border-[#d1d5db] rounded-md text-[12px] text-[#475569] hover:bg-gray-50 transition-colors"
                    >
                      <span>{`Occasion: ${injectedOccasionFilter}`}</span>
                      <svg width="12" height="12" className="ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  {getActiveFilters().map((filter, index) => (
                    <button
                      key={index}
                      onClick={() => removeFilter(filter.type, filter.value, filter.parent)}
                      className="inline-flex items-center gap-1.5 h-7 px-3 bg-white border border-[#d1d5db] rounded-md text-[12px] text-[#475569] hover:bg-gray-50 transition-colors"
                    >
                      <span>{filter.label}</span>
                      <svg width="12" height="12" className="ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                <select
                  value={masterCategoryFilter}
                  onChange={(e) => setMasterCategoryFilter(e.target.value)}
                  className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                >
                  <option value="all">Category: All</option>
                  {giftingMasterCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={occasionFilter}
                  onChange={(e) => {
                    setOccasionFilter(e.target.value)
                    if (injectedOccasionFilter && e.target.value !== injectedOccasionFilter) {
                      setInjectedOccasionFilter(null)
                    }
                  }}
                  className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                >
                  <option value="all">Occasion: All</option>
                  {occasionOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recommended' | 'price_low_high' | 'price_high_low' | 'rating_high_low')}
                  className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price_low_high">Sort: Price Low-High</option>
                  <option value="price_high_low">Sort: Price High-Low</option>
                  <option value="rating_high_low">Sort: Rating</option>
                </select>
              </div>
              {showAdvancedFilters && (
                <>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value as CatalogueSourceFilter)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    >
                      <option value="all">Source: All</option>
                      <option value="mogzu">Source: ✦ By Mogzu</option>
                      <option value="vendor">Source: Vendor Partners</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={canonicalBudgetMin}
                      onChange={(e) => setCanonicalBudgetMin(e.target.value)}
                      placeholder="Budget min (₹)"
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    />
                    <input
                      type="number"
                      min={0}
                      value={canonicalBudgetMax}
                      onChange={(e) => setCanonicalBudgetMax(e.target.value)}
                      placeholder="Budget max (₹)"
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    />
                  </div>
                </>
              )}
              <p className="mb-3 text-[13px] text-[#878e9e]">
                Showing {postFilterProducts.length} result{postFilterProducts.length === 1 ? '' : 's'}
              </p>

              {showAdvancedFilters && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <select
                    value={pricingTypeFilter}
                    onChange={(e) => setPricingTypeFilter(e.target.value as 'all' | 'transparent' | 'offer' | 'on_request')}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Pricing Type: All</option>
                    <option value="transparent">Book Now (Transparent)</option>
                    <option value="offer">Offer Price (Negotiable)</option>
                    <option value="on_request">On Request</option>
                  </select>
                  <select
                    value={paymentModeFilter}
                    onChange={(e) => setPaymentModeFilter(e.target.value as 'all' | 'wallet' | 'net_banking' | 'neft_rtgs' | 'gateway')}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Payment Mode: All</option>
                    <option value="gateway">Razorpay Gateway</option>
                    <option value="wallet">Corporate Credit</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="neft_rtgs">NEFT / RTGS</option>
                  </select>
                  <select
                    value={paymentTermFilter}
                    onChange={(e) => setPaymentTermFilter(e.target.value as 'all' | 'advance_100' | 'partial_50' | 'net_30')}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Payment Terms: All</option>
                    <option value="advance_100">100% Advance</option>
                    <option value="partial_50">50% Advance + Balance</option>
                    <option value="net_30">Net 30</option>
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {isError ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-[#ececec]">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0e1e3f] mb-2">
                      Something went wrong
                    </h3>
                    <p className="text-sm text-[#878e9e] mb-4 max-w-xs mx-auto">
                      We couldn't load results. Please check your connection and try again.
                    </p>
                    <button
                      onClick={() => setIsError(false)}
                      className="px-6 py-2 bg-destructive text-white rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-md"
                    >
                      Retry
                    </button>
                  </div>
                ) : postFilterProducts.length > 0 ? (
                  postFilterProducts.map((product) => {
                    const slideImages = getProductSlideImages(product)
                    const cardId = String(product.id)
                    const activeIndex = cardImageIndexById[cardId] ?? 0
                    const activeImage = slideImages[activeIndex] || imgImage24995
                    return (
                    <div
                      key={product.id}
                      className="bg-white/65 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition-all group h-full flex flex-col"
                    >
                    <div className="relative">
                      <img src={activeImage} alt={product.name} className="w-full h-52 object-cover saturate-110 transition-opacity duration-500" />
                      {slideImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label={`Previous image for ${product.name}`}
                            onClick={() => goToPrevCardImage(cardId, slideImages.length)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-[2] w-7 h-7 rounded-full bg-white/90 border border-[#dbe3f2] text-[#334155] text-sm font-bold shadow-sm hover:bg-white transition-colors"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            aria-label={`Next image for ${product.name}`}
                            onClick={() => goToNextCardImage(cardId, slideImages.length)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-[2] w-7 h-7 rounded-full bg-white/90 border border-[#dbe3f2] text-[#334155] text-sm font-bold shadow-sm hover:bg-white transition-colors"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-[2] inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-1">
                            {slideImages.slice(0, 5).map((_, dotIdx) => (
                              <span
                                key={dotIdx}
                                className={`h-1.5 rounded-full transition-all ${dotIdx === activeIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/55'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setGridUiNotice(`Wishlist for "${product.name}" will be available in a future release.`)
                        }
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>

                      {/* Compare Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setGridUiNotice(`Compare for "${product.name}" will be available in a future release.`)
                        }
                        className="absolute top-2.5 left-2.5 h-7 px-2.5 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-semibold text-[#334155] hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0] inline-flex items-center"
                      >
                        Compare
                      </button>
                      
                      {/* Rating Badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-[#16a34a] text-white text-[10px] font-semibold px-2.5 h-6 rounded-full inline-flex items-center gap-1 shadow-md">
                        <span>{product.rating}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>

                      {/* Category-specific Eco/Premium Badges */}
                      <div className="absolute bottom-2.5 left-2.5 flex gap-1">
                        {'isEco' in product && product.isEco && (
                          <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded border border-green-200">
                            Eco
                          </div>
                        )}
                        {'isPremium' in product && product.isPremium && (
                          <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded border border-amber-200">
                            Premium
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">{product.brand}</p>
                        <p className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#878e9e] mb-2 line-clamp-2 min-h-[28px]">
                          {'description' in product && typeof product.description === 'string' && product.description.trim()
                            ? product.description
                            : selectedCategory === 'apparel'
                              ? 'Corporate-ready apparel for internal teams and client gifting.'
                              : selectedCategory === 'bags'
                                ? 'Functional bag options for events, onboarding, and campaigns.'
                                : selectedCategory === 'stationary'
                                  ? 'Desk essentials tailored for corporate utility gifting.'
                                  : selectedCategory === 'tech'
                                    ? 'High-utility tech accessories for modern workforce kits.'
                                    : 'Wellness gifting options that support employee engagement.'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#bfdbfe] bg-[linear-gradient(90deg,rgba(239,246,255,0.9),rgba(219,234,254,0.85))] p-2 mb-2.5 shadow-[0_4px_14px_rgba(37,99,235,0.10)]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563eb] mb-1">MOQ</p>
                        <p className="text-[12px] text-[#334155]">
                          Minimum order quantity: <span className="font-bold text-[#0e1e3f]">{'minQty' in product ? product.minQty : product.moq} pieces</span>
                        </p>
                      </div>

                      <div className="mt-auto pt-2.5 border-t border-[#ececec] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-1">Starting at</p>
                          <p className="text-[22px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">
                            {typeof product.price === 'number' ? `Rs ${product.price}` : 'On Request'}
                          </p>
                          {typeof product.price === 'number' && (
                            <p className="text-[10px] text-[#64748b] mt-1">per piece</p>
                          )}
                        </div>
                      <button 
                        onClick={() => {
                          const viewedKey = 'mogzu_gifting_viewed'
                          const raw = sessionStorage.getItem(viewedKey)
                          const parsed = raw ? (JSON.parse(raw) as string[]) : []
                          const next = [String(product.id), ...parsed.filter((id) => id !== String(product.id))].slice(0, 8)
                          sessionStorage.setItem(viewedKey, JSON.stringify(next))
                          // Map selectedCategory to the correct URL category name
                          const categoryMap: Record<string, string> = {
                            'apparel': 'apparel',
                            'bags': 'bags',
                            'stationary': 'stationery',
                            'tech': 'tech',
                            'health': 'wellness'
                          };
                          const urlCategory = categoryMap[selectedCategory] || 'apparel';
                          navigate(`/product-booking?category=${urlCategory}&id=${product.id}`, {
                            state: { product },
                          });
                        }}
                        className="px-4 py-2 bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-xs font-semibold rounded-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)]"
                      >
                        Enquire Now
                      </button>
                      </div>
                    </div>
                    </div>
                  )})
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-[#ececec]">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-[#2563eb]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0e1e3f] mb-2">No items found</h3>
                    <p className="text-sm text-[#878e9e] mb-4 max-w-xs mx-auto">
                      Try adjusting filters or search to see more gifting options.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-6 py-2 bg-[#2563eb] text-white rounded-full text-sm font-medium hover:bg-[#1d4ed8] transition-all shadow-md"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
            </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
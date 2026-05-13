import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Search, ChevronDown, Bell, HelpCircle, ChevronLeft, MapPin, Star, Filter, X, ShoppingCart, AlertCircle } from 'lucide-react';
import svgPaths from '@/imports/svg-a80j978jey';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';

export default function ApparelPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [isError, setIsError] = useState(false);

  // Filter states
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedGSM, setSelectedGSM] = useState<string[]>([]);
  const [selectedFit, setSelectedFit] = useState<string[]>([]);
  const [selectedBranding, setSelectedBranding] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);

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

  // Subcategories
  const subcategories = [
    { id: 'all', label: 'All Apparel', count: 156 },
    { id: 't-shirts', label: 'T-Shirts', count: 45, types: ['Round', 'Polo', 'Full Sleeve', 'Dry-Fit'] },
    { id: 'hoodies', label: 'Hoodies', count: 28, types: ['Pullover', 'Zipper', 'Sweatshirt'] },
    { id: 'jackets', label: 'Jackets', count: 22, types: ['Softshell', 'Windcheater', 'Bomber', 'Puffer'] },
    { id: 'workwear', label: 'Workwear', count: 18, types: ['Formal Shirts', 'Trousers', 'Blazers'] },
    { id: 'caps', label: 'Caps', count: 15, types: ['Baseball', 'Snapback', 'Bucket'] },
    { id: 'bottom-wear', label: 'Bottom Wear', count: 12, types: ['Track Pants', 'Joggers'] },
    { id: 'custom-sets', label: 'Custom Sets', count: 16, types: ['Uniform Sets', 'Team Kits'] },
  ];

  // Filter options
  const filters = {
    gender: ['Men', 'Women', 'Unisex'],
    types: ['T-shirt', 'Hoodie', 'Jacket', 'Cap', 'Formal', 'Bottom Wear'],
    fabrics: ['Cotton', 'Poly-Cotton', 'Polyester', 'Dry-Fit', 'Fleece'],
    gsm: ['120-150', '160-180', '200+'],
    fit: ['Regular', 'Slim', 'Oversized'],
    branding: ['Print', 'Embroidery', 'DTF', 'Sublimation', 'Patch'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Grey', hex: '#9CA3AF' },
      { name: 'Blue', hex: '#2563EB' },
      { name: 'Red', hex: '#EF4444' },
      { name: 'Navy', hex: '#1E3A8A' },
      { name: 'Green', hex: '#16A34A' },
      { name: 'Custom', hex: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    ],
    priceRange: ['<200', '200-399', '400-799', '800+'],
    delivery: ['2-3 days', '4-7 days', '7-10 days']
  };

  // Mock products
  const products = [
    {
      id: 1,
      name: 'Premium Cotton Round Neck T-Shirt',
      category: 't-shirts',
      type: 'Round Neck',
      brand: 'RodZen',
      price: 299,
      moq: 10,
      rating: 4.5,
      reviews: 128,
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
      fabric: 'Cotton',
      gsm: '160-180',
      fit: 'Regular',
      colors: ['Black', 'White', 'Navy'],
      delivery: '4-7 days',
      gender: 'Unisex'
    },
    {
      id: 2,
      name: 'Polo Collar Premium T-Shirt',
      category: 't-shirts',
      type: 'Polo',
      brand: 'StylePro',
      price: 399,
      moq: 10,
      rating: 4.7,
      reviews: 95,
      location: 'Delhi',
      image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400',
      fabric: 'Poly-Cotton',
      gsm: '180-200',
      fit: 'Slim',
      colors: ['White', 'Blue', 'Grey'],
      delivery: '4-7 days',
      gender: 'Men'
    },
    {
      id: 3,
      name: 'Pullover Hoodie with Kangaroo Pocket',
      category: 'hoodies',
      type: 'Pullover',
      brand: 'WarmWear',
      price: 799,
      moq: 15,
      rating: 4.8,
      reviews: 156,
      location: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      fabric: 'Fleece',
      gsm: '280-300',
      fit: 'Oversized',
      colors: ['Black', 'Grey', 'Navy'],
      delivery: '7-10 days',
      gender: 'Unisex'
    },
    {
      id: 4,
      name: 'Zipper Hoodie Premium Quality',
      category: 'hoodies',
      type: 'Zipper',
      brand: 'ComfortZone',
      price: 899,
      moq: 15,
      rating: 4.6,
      reviews: 87,
      location: 'Pune',
      image: 'https://images.unsplash.com/photo-1620799140188-3b2a7c2e0e27?w=400',
      fabric: 'Fleece',
      gsm: '300+',
      fit: 'Regular',
      colors: ['Black', 'Red', 'Blue'],
      delivery: '7-10 days',
      gender: 'Unisex'
    },
    {
      id: 5,
      name: 'Windcheater Jacket Water Resistant',
      category: 'jackets',
      type: 'Windcheater',
      brand: 'OutdoorPro',
      price: 1299,
      moq: 20,
      rating: 4.9,
      reviews: 203,
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      fabric: 'Polyester',
      gsm: '200+',
      fit: 'Regular',
      colors: ['Black', 'Navy', 'Green'],
      delivery: '7-10 days',
      gender: 'Men'
    },
    {
      id: 6,
      name: 'Bomber Jacket Premium Leather',
      category: 'jackets',
      type: 'Bomber',
      brand: 'UrbanStyle',
      price: 1899,
      moq: 20,
      rating: 4.7,
      reviews: 112,
      location: 'Delhi',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      fabric: 'Leather',
      gsm: '250+',
      fit: 'Slim',
      colors: ['Black', 'Brown'],
      delivery: '7-10 days',
      gender: 'Men'
    },
    {
      id: 7,
      name: 'Formal Shirt Cotton Blend',
      category: 'workwear',
      type: 'Formal Shirt',
      brand: 'OfficePro',
      price: 599,
      moq: 10,
      rating: 4.4,
      reviews: 78,
      location: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      fabric: 'Cotton',
      gsm: '140-160',
      fit: 'Slim',
      colors: ['White', 'Blue', 'Grey'],
      delivery: '4-7 days',
      gender: 'Men'
    },
    {
      id: 8,
      name: 'Baseball Cap Adjustable',
      category: 'caps',
      type: 'Baseball',
      brand: 'CapStyle',
      price: 199,
      moq: 10,
      rating: 4.3,
      reviews: 145,
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
      fabric: 'Cotton',
      gsm: '160-180',
      fit: 'Regular',
      colors: ['Black', 'White', 'Red', 'Blue'],
      delivery: '2-3 days',
      gender: 'Unisex'
    },
    {
      id: 9,
      name: 'Track Pants Slim Fit',
      category: 'bottom-wear',
      type: 'Track Pants',
      brand: 'SportFit',
      price: 499,
      moq: 10,
      rating: 4.5,
      reviews: 92,
      location: 'Pune',
      image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400',
      fabric: 'Polyester',
      gsm: '180-200',
      fit: 'Slim',
      colors: ['Black', 'Grey', 'Navy'],
      delivery: '4-7 days',
      gender: 'Men'
    },
    {
      id: 10,
      name: 'Dry-Fit Full Sleeve T-Shirt',
      category: 't-shirts',
      type: 'Dry-Fit',
      brand: 'ActiveWear',
      price: 449,
      moq: 10,
      rating: 4.6,
      reviews: 134,
      location: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400',
      fabric: 'Dry-Fit',
      gsm: '140-160',
      fit: 'Regular',
      colors: ['Black', 'Blue', 'Grey'],
      delivery: '4-7 days',
      gender: 'Unisex'
    },
    {
      id: 11,
      name: 'Corporate Uniform Set',
      category: 'custom-sets',
      type: 'Uniform Set',
      brand: 'UniformPro',
      price: 1499,
      moq: 25,
      rating: 4.8,
      reviews: 67,
      location: 'Delhi',
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400',
      fabric: 'Poly-Cotton',
      gsm: '160-180',
      fit: 'Regular',
      colors: ['Navy', 'Black', 'Grey'],
      delivery: '7-10 days',
      gender: 'Unisex'
    },
    {
      id: 12,
      name: 'Team Kit Sports Set',
      category: 'custom-sets',
      type: 'Team Kit',
      brand: 'TeamWear',
      price: 1299,
      moq: 25,
      rating: 4.7,
      reviews: 89,
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400',
      fabric: 'Dry-Fit',
      gsm: '160-180',
      fit: 'Regular',
      colors: ['Blue', 'Red', 'Green'],
      delivery: '7-10 days',
      gender: 'Unisex'
    }
  ];

  // Toggle filter function
  const toggleFilter = (filterArray: string[], setFilter: (val: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  // Filter products based on selections
  const filteredProducts = products.filter(product => {
    // Subcategory filter
    if (selectedSubcategory !== 'all' && product.category !== selectedSubcategory) return false;
    
    // Gender filter
    if (selectedGender.length > 0 && !selectedGender.includes(product.gender)) return false;
    
    // Fabric filter
    if (selectedFabrics.length > 0 && !selectedFabrics.includes(product.fabric)) return false;
    
    // GSM filter
    if (selectedGSM.length > 0 && !selectedGSM.includes(product.gsm)) return false;
    
    // Fit filter
    if (selectedFit.length > 0 && !selectedFit.includes(product.fit)) return false;
    
    // Color filter
    if (selectedColors.length > 0) {
      const hasColor = product.colors.some(color => selectedColors.includes(color));
      if (!hasColor) return false;
    }
    
    // Price filter
    if (selectedPriceRange.length > 0) {
      const matchesPrice = selectedPriceRange.some(range => {
        if (range === '<200') return product.price < 200;
        if (range === '200-399') return product.price >= 200 && product.price <= 399;
        if (range === '400-799') return product.price >= 400 && product.price <= 799;
        if (range === '800+') return product.price >= 800;
        return false;
      });
      if (!matchesPrice) return false;
    }
    
    // Delivery filter
    if (selectedDelivery.length > 0 && !selectedDelivery.includes(product.delivery)) return false;
    
    return true;
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedGender([]);
    setSelectedTypes([]);
    setSelectedFabrics([]);
    setSelectedGSM([]);
    setSelectedFit([]);
    setSelectedBranding([]);
    setSelectedColors([]);
    setSelectedPriceRange([]);
    setSelectedDelivery([]);
    setSelectedSubcategory('all');
  };

  const activeFiltersCount = 
    selectedGender.length + 
    selectedTypes.length + 
    selectedFabrics.length + 
    selectedGSM.length + 
    selectedFit.length + 
    selectedBranding.length + 
    selectedColors.length + 
    selectedPriceRange.length + 
    selectedDelivery.length;

  return (
    <div className="flex min-h-screen h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="shop"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search apparel..." />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            {/* Header */}
            <div className="mb-6">
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#0e1e3f] mb-4 hover:text-[#2563eb] transition-colors">
                <ChevronLeft className="w-6 h-6" />
                <span className="text-2xl font-medium">Apparel Master</span>
              </button>
              <p className="text-base text-[#878e9e]">Discover premium corporate apparel with custom branding options</p>
            </div>

            {/* Subcategories Tabs */}
            <div className="mb-6 bg-white rounded-xl border border-[#ececec] p-4">
              <div className="flex gap-3 flex-wrap">
                {subcategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubcategory(cat.id)}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubcategory === cat.id
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-[#f9fafb] text-[#878e9e] hover:bg-[#eff6ff]'
                    }`}
                  >
                    {cat.label} <span className="ml-1">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-[280px_1fr] gap-6">
              {/* Left Filters Panel */}
              {showFilters && (
                <div className="bg-white rounded-xl border border-[#ececec] p-6 h-fit sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-[#0e1e3f]" />
                      <h3 className="text-lg font-semibold text-[#0e1e3f]">Filters</h3>
                      {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 bg-[#2563eb] text-white text-xs rounded-full">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-[#ef4444] hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin">
                    {/* Gender Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Gender</h4>
                      <div className="space-y-2">
                        {filters.gender.map((gender) => (
                          <label key={gender} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedGender.includes(gender)}
                              onChange={() => toggleFilter(selectedGender, setSelectedGender, gender)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">{gender}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Fabric Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Fabric</h4>
                      <div className="space-y-2">
                        {filters.fabrics.map((fabric) => (
                          <label key={fabric} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFabrics.includes(fabric)}
                              onChange={() => toggleFilter(selectedFabrics, setSelectedFabrics, fabric)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">{fabric}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* GSM Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">GSM</h4>
                      <div className="space-y-2">
                        {filters.gsm.map((gsm) => (
                          <label key={gsm} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedGSM.includes(gsm)}
                              onChange={() => toggleFilter(selectedGSM, setSelectedGSM, gsm)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">{gsm}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Fit Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Fit Type</h4>
                      <div className="space-y-2">
                        {filters.fit.map((fit) => (
                          <label key={fit} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFit.includes(fit)}
                              onChange={() => toggleFilter(selectedFit, setSelectedFit, fit)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">{fit}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Branding Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Branding</h4>
                      <div className="space-y-2">
                        {filters.branding.map((brand) => (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedBranding.includes(brand)}
                              onChange={() => toggleFilter(selectedBranding, setSelectedBranding, brand)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Color Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Colour</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {filters.colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => toggleFilter(selectedColors, setSelectedColors, color.name)}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                              selectedColors.includes(color.name) ? 'border-[#2563eb]' : 'border-[#ececec]'
                            }`}
                            style={{ background: color.hex }}
                            title={color.name}
                          >
                            {selectedColors.includes(color.name) && (
                              <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Price</h4>
                      <div className="space-y-2">
                        {filters.priceRange.map((range) => (
                          <label key={range} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPriceRange.includes(range)}
                              onChange={() => toggleFilter(selectedPriceRange, setSelectedPriceRange, range)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">₹{range}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Filter */}
                    <div className="border-t border-[#ececec] pt-6">
                      <h4 className="text-sm font-medium text-[#0e1e3f] mb-3">Delivery</h4>
                      <div className="space-y-2">
                        {filters.delivery.map((delivery) => (
                          <label key={delivery} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedDelivery.includes(delivery)}
                              onChange={() => toggleFilter(selectedDelivery, setSelectedDelivery, delivery)}
                              className="w-4 h-4 rounded border-[#ececec]"
                            />
                            <span className="text-sm text-[#878e9e]">{delivery}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Products Grid */}
              <div>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0e1e3f]">
                      {filteredProducts.length} Products Found
                    </h2>
                    <p className="text-sm text-[#878e9e] mt-1">
                      {selectedSubcategory !== 'all' 
                        ? subcategories.find(c => c.id === selectedSubcategory)?.label 
                        : 'All Categories'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#ececec] rounded-lg text-sm text-[#878e9e] hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isError ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-[#ececec] shadow-sm">
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
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => navigate('/booking-flow')}
                        className="bg-white rounded-xl border border-[#ececec] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      >
                      <div className="relative h-64">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white rounded-full text-xs font-medium text-[#0e1e3f] shadow">
                          MOQ: {product.moq}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs text-[#878e9e] mb-1">{product.brand}</p>
                            <h3 className="text-base font-medium text-[#0e1e3f] mb-2 line-clamp-2">
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                            <span className="text-sm font-medium text-[#0e1e3f]">{product.rating}</span>
                          </div>
                          <span className="text-xs text-[#878e9e]">({product.reviews} reviews)</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#878e9e] mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{product.location}</span>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-2 py-1 bg-[#f9fafb] rounded text-xs text-[#878e9e]">
                            {product.fabric}
                          </span>
                          <span className="px-2 py-1 bg-[#f9fafb] rounded text-xs text-[#878e9e]">
                            {product.gsm} GSM
                          </span>
                          <span className="px-2 py-1 bg-[#f9fafb] rounded text-xs text-[#878e9e]">
                            {product.fit}
                          </span>
                        </div>

                        {/* Color Options */}
                        <div className="flex items-center gap-1 mb-4">
                          {product.colors.slice(0, 4).map((color, idx) => (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded-full border border-[#ececec] ${
                                color === 'Black' ? 'bg-black' :
                                color === 'White' ? 'bg-white' :
                                color === 'Navy' ? 'bg-[#1e3a8a]' :
                                color === 'Grey' ? 'bg-gray-400' :
                                color === 'Red' ? 'bg-red-600' :
                                color === 'Blue' ? 'bg-blue-600' :
                                color === 'Green' ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-xs text-[#878e9e] ml-1">+{product.colors.length - 4}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#ececec]">
                          <div>
                            <p className="text-sm text-[#878e9e]">Starting from</p>
                            <p className="text-xl font-semibold text-[#0e1e3f]">
                              ₹{product.price}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>

                {/* No Results */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-semibold text-[#0e1e3f] mb-2">No products found</h3>
                    <p className="text-base text-[#878e9e] mb-6">
                      Try adjusting your filters or search criteria
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-3 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors"
                    >
                      Clear All Filters
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

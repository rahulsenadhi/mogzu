import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

// Comprehensive Apparel Master Filter Component
export default function ApparelMasterFilters() {
  const [filters, setFilters] = useState({
    // Categories with subcategories
    categories: {
      'T-Shirts': false,
      'Hoodies': false,
      'Jackets': false,
      'Workwear': false,
      'Caps': false,
      'Bottom Wear': false,
      'Custom Sets': false,
    },
    // Gender filter
    gender: {
      'Men': false,
      'Women': false,
      'Unisex': false,
    },
    // Type filter
    type: {
      'T-shirt': false,
      'Hoodie': false,
      'Jacket': false,
      'Cap': false,
      'Formal': false,
    },
    // Fabric filter
    fabric: {
      'Cotton': false,
      'Poly-Cotton': false,
      'Polyester': false,
      'Dry-Fit': false,
      'Fleece': false,
    },
    // GSM filter
    gsm: {
      '120-150': false,
      '160-180': false,
      '200+': false,
    },
    // Fit filter
    fit: {
      'Regular': false,
      'Slim': false,
      'Oversized': false,
    },
    // Branding filter
    branding: {
      'Print': false,
      'Embroidery': false,
      'DTF': false,
      'Sublimation': false,
      'Patch': false,
    },
    // Colour filter
    colour: {
      'Black': false,
      'White': false,
      'Grey': false,
      'Blue': false,
      'Red': false,
      'Custom': false,
    },
    // Price filter
    priceRange: {
      '<200': false,
      '200-399': false,
      '400-799': false,
      '800+': false,
    },
    // Delivery filter
    delivery: {
      '2-3 days': false,
      '4-7 days': false,
      '7-10 days': false,
    },
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    gender: true,
    type: false,
    fabric: true,
    gsm: false,
    fit: false,
    branding: false,
    colour: false,
    priceRange: true,
    delivery: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleFilterChange = (section: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [value]: !prev[section][value as keyof typeof prev[typeof section]]
      }
    }));
  };

  const handleClearAll = () => {
    const clearedFilters: any = {};
    Object.keys(filters).forEach(key => {
      clearedFilters[key] = {};
      Object.keys(filters[key as keyof typeof filters]).forEach(subKey => {
        clearedFilters[key][subKey] = false;
      });
    });
    setFilters(clearedFilters);
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach(section => {
      Object.values(section).forEach(value => {
        if (value) count++;
      });
    });
    return count;
  };

  const renderFilterSection = (
    title: string,
    sectionKey: keyof typeof filters,
    expandKey: keyof typeof expandedSections
  ) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(expandKey)}
        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            expandedSections[expandKey] ? '' : '-rotate-90'
          }`}
        />
      </button>
      {expandedSections[expandKey] && (
        <div className="space-y-2">
          {Object.keys(filters[sectionKey]).map(option => (
            <label key={option} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[sectionKey][option as keyof typeof filters[typeof sectionKey]]}
                onChange={() => handleFilterChange(sectionKey, option)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-[#475569] group-hover:text-[#0e1e3f] transition-colors">
                {option}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-4 border border-[#ececec]">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[#878e9e]">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-0.5 bg-[#4379ee] text-white text-xs font-medium rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs font-medium text-[#4379ee] hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Filter Sections */}
      {renderFilterSection('Category', 'categories', 'category')}
      {renderFilterSection('Gender', 'gender', 'gender')}
      {renderFilterSection('Type', 'type', 'type')}
      {renderFilterSection('Fabric', 'fabric', 'fabric')}
      {renderFilterSection('GSM', 'gsm', 'gsm')}
      {renderFilterSection('Fit', 'fit', 'fit')}
      {renderFilterSection('Branding', 'branding', 'branding')}
      {renderFilterSection('Colour', 'colour', 'colour')}
      {renderFilterSection('Price Range', 'priceRange', 'priceRange')}
      {renderFilterSection('Delivery', 'delivery', 'delivery')}
    </div>
  );
}

// Product Card Component with all essential fields
export function ProductCard({ product }: { product: any }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(product.moq || 25);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const colors = product.colors || ['black', 'white', 'grey', 'blue', 'red'];

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#ececec] hover:shadow-xl transition-all duration-300">
      <div className="relative group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Quick View Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount && (
            <span className="px-2 py-1 bg-[#ef4444] text-white text-xs font-bold rounded-md">
              {product.discount}% OFF
            </span>
          )}
          {product.bestSeller && (
            <span className="px-2 py-1 bg-[#8b5cf6] text-white text-xs font-bold rounded-md">
              Bestseller
            </span>
          )}
        </div>

        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>{product.rating || 4.5}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#878e9e]">{product.brand}</span>
          <span className="text-xs text-[#4379ee] bg-[#ebf1ff] px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Fabric & GSM Info */}
        <div className="flex gap-2 mb-3">
          <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md">
            {product.fabric || 'Cotton'}
          </span>
          <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md">
            {product.gsm || '180'} GSM
          </span>
          <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md">
            {product.fit || 'Regular'} Fit
          </span>
        </div>

        {/* Color Swatches */}
        <div className="mb-3">
          <p className="text-xs text-[#878e9e] mb-1.5">Colors:</p>
          <div className="flex gap-1.5">
            {colors.slice(0, 5).map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? 'border-[#4379ee] scale-110'
                    : 'border-[#e5e7eb] hover:border-[#94a3b8]'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {colors.length > 5 && (
              <button className="w-6 h-6 rounded-full border-2 border-[#e5e7eb] flex items-center justify-center text-xs text-[#64748b] hover:border-[#4379ee]">
                +{colors.length - 5}
              </button>
            )}
          </div>
        </div>

        {/* Size Selector */}
        <div className="mb-3">
          <p className="text-xs text-[#878e9e] mb-1.5">Sizes:</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.slice(0, 4).map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedSize === size
                    ? 'bg-[#4379ee] text-white'
                    : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                {size}
              </button>
            ))}
            <button className="px-2 py-1 text-xs font-medium bg-[#f1f5f9] text-[#64748b] rounded-md hover:bg-[#e2e8f0]">
              +All
            </button>
          </div>
        </div>

        {/* Branding Options */}
        <div className="mb-3">
          <p className="text-xs text-[#878e9e] mb-1.5">Branding:</p>
          <div className="flex flex-wrap gap-1.5">
            {['Print', 'Emb.', 'DTF'].map(type => (
              <span
                key={type}
                className="px-2 py-0.5 text-xs font-medium bg-[#fef3c7] text-[#92400e] rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Price & MOQ */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#e5e7eb]">
          <div>
            <p className="text-xs text-[#878e9e]">Starting at</p>
            <p className="text-lg font-bold text-[#0e1e3f]">
              ₹{product.price}
              <span className="text-xs font-normal text-[#878e9e]">/piece</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#878e9e]">MOQ</p>
            <p className="text-sm font-semibold text-[#4379ee]">{product.moq || 25} pcs</p>
          </div>
        </div>

        {/* Bulk Pricing */}
        <div className="mb-3 p-2 bg-[#f0fdf4] rounded-lg">
          <p className="text-xs font-medium text-[#15803d] mb-1">Bulk Pricing:</p>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-[#166534]">
            <div>50+: ₹{Math.round(product.price * 0.9)}</div>
            <div>100+: ₹{Math.round(product.price * 0.85)}</div>
            <div>500+: ₹{Math.round(product.price * 0.8)}</div>
          </div>
        </div>

        {/* Delivery ETA */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-[#64748b]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h5l3 3v5h-2" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span>Delivery: {product.delivery || '7-10 days'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2.5 bg-[#4379ee] text-white text-sm font-semibold rounded-lg hover:bg-[#3568dd] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Customize & Order
          </button>
        </div>
      </div>
    </div>
  );
}

// Color Swatch Component
export function ColourSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  const colorMap: { [key: string]: string } = {
    black: '#000000',
    white: '#FFFFFF',
    grey: '#9CA3AF',
    blue: '#3B82F6',
    red: '#EF4444',
    green: '#10B981',
    yellow: '#F59E0B',
    navy: '#1E3A8A',
    maroon: '#7F1D1D',
  };

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full border-2 transition-all ${
        selected
          ? 'border-[#4379ee] scale-110 shadow-lg'
          : 'border-[#e5e7eb] hover:border-[#94a3b8]'
      }`}
      style={{ backgroundColor: colorMap[color.toLowerCase()] || color }}
      title={color}
    />
  );
}

// Size Selector Component
export function SizeSelector({
  sizes,
  selected,
  onChange
}: {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(size => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            selected === size
              ? 'bg-[#4379ee] text-white shadow-md'
              : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

// Branding Type Chips Component
export function BrandingTypeChips({
  types,
  selected,
  onChange
}: {
  types: string[];
  selected: string[];
  onChange: (type: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {types.map(type => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
            selected.includes(type)
              ? 'bg-[#4379ee] text-white shadow-md'
              : 'bg-white border border-[#e5e7eb] text-[#64748b] hover:border-[#4379ee]'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

// Quantity Selector Component
export function QuantitySelector({
  value,
  min,
  onChange
}: {
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 flex items-center justify-center bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
        disabled={value <= min}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(min, parseInt(e.target.value) || min))}
        className="w-20 px-3 py-2 text-center text-sm font-medium border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
        min={min}
      />
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 flex items-center justify-center bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span className="text-sm text-[#64748b]">
        Min: {min}
      </span>
    </div>
  );
}

// Bulk Pricing Table Component
export function BulkPricingTable({ tiers }: { tiers: Array<{ qty: number; price: number }> }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <div className="bg-[#f9fafb] px-4 py-2 border-b border-[#e5e7eb]">
        <h4 className="text-sm font-semibold text-[#0e1e3f]">Bulk Pricing Tiers</h4>
      </div>
      <div className="divide-y divide-[#e5e7eb]">
        {tiers.map((tier, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-[#f9fafb] transition-colors">
            <span className="text-sm text-[#64748b]">
              {tier.qty}+ pieces
            </span>
            <span className="text-sm font-semibold text-[#0e1e3f]">
              ₹{tier.price}/piece
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Packaging Selector Component
export function PackagingSelector({
  selected,
  onChange
}: {
  selected: string;
  onChange: (type: string) => void;
}) {
  const options = [
    { id: 'standard', name: 'Standard', price: 0, desc: 'Poly bag packaging' },
    { id: 'premium', name: 'Premium', price: 25, desc: 'Branded box with tissue' },
    { id: 'eco', name: 'Eco-Friendly', price: 15, desc: 'Recyclable packaging' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`p-3 text-left rounded-lg border-2 transition-all ${
            selected === option.id
              ? 'border-[#4379ee] bg-[#ebf1ff]'
              : 'border-[#e5e7eb] hover:border-[#4379ee]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-[#0e1e3f]">{option.name}</span>
            {option.price > 0 && (
              <span className="text-xs font-medium text-[#64748b]">+₹{option.price}</span>
            )}
          </div>
          <p className="text-xs text-[#64748b]">{option.desc}</p>
        </button>
      ))}
    </div>
  );
}

// Price Summary Component
export function PriceSummary({
  basePrice,
  quantity,
  branding,
  packaging
}: {
  basePrice: number;
  quantity: number;
  branding: number;
  packaging: number;
}) {
  const subtotal = basePrice * quantity;
  const brandingCost = branding * quantity;
  const packagingCost = packaging * quantity;
  const total = subtotal + brandingCost + packagingCost;
  const gst = total * 0.18;
  const grandTotal = total + gst;

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
      <h4 className="text-sm font-semibold text-[#0e1e3f] mb-3">Price Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#64748b]">Base Price ({quantity} pcs)</span>
          <span className="font-medium text-[#0e1e3f]">₹{subtotal.toFixed(2)}</span>
        </div>
        {brandingCost > 0 && (
          <div className="flex justify-between">
            <span className="text-[#64748b]">Branding</span>
            <span className="font-medium text-[#0e1e3f]">₹{brandingCost.toFixed(2)}</span>
          </div>
        )}
        {packagingCost > 0 && (
          <div className="flex justify-between">
            <span className="text-[#64748b]">Packaging</span>
            <span className="font-medium text-[#0e1e3f]">₹{packagingCost.toFixed(2)}</span>
          </div>
        )}
        <div className="h-px bg-[#e5e7eb] my-2" />
        <div className="flex justify-between">
          <span className="text-[#64748b]">Subtotal</span>
          <span className="font-medium text-[#0e1e3f]">₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748b]">GST (18%)</span>
          <span className="font-medium text-[#0e1e3f]">₹{gst.toFixed(2)}</span>
        </div>
        <div className="h-px bg-[#e5e7eb] my-2" />
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-[#0e1e3f]">Grand Total</span>
          <span className="text-lg font-bold text-[#4379ee]">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

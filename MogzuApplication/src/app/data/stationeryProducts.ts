export interface StationeryProduct {
  id: number;
  mogzuListingId?: string;
  name: string;
  subcategory: 'notebooks' | 'diaries' | 'pens' | 'organizers' | 'calendars' | 'stickynotes' | 'kits' | 'leatherdiaries' | 'metalpens' | 'writingsets' | 'deskaccessories';
  brand: string;
  price: number;
  priceOnRequest?: boolean;
  moq: number;
  eta: string;
  type: string;
  material: string;
  paperGSM?: string;
  pageType?: string;
  binding?: string;
  branding: string[];
  colors: string[];
  size?: string;
  pages?: number;
  coverMaterial?: string;
  texture?: string;
  bookmark?: boolean;
  elastic?: boolean;
  penLoop?: boolean;
  backPocket?: boolean;
  brandingPlacement?: string[];
  brandingArea?: string;
  packaging?: string[];
  rating: number;
  image: string;
  description: string;
  specs: string[];
  bulkPricing?: { qty: number; price: number }[];
}

export const stationeryProducts: StationeryProduct[] = [
  // Notebooks (12 products)
  {
    id: 1,
    name: 'Premium A5 Hardbound Notebook',
    subcategory: 'notebooks',
    brand: 'NoteMaster',
    price: 149,
    moq: 50,
    eta: '4-7 days',
    type: 'Notebook',
    material: 'Paper',
    paperGSM: '80',
    pageType: 'Ruled',
    binding: 'Hardbound',
    branding: ['UV Print', 'Foil Stamping', 'Embossing'],
    colors: ['Black', 'Blue', 'Grey'],
    size: 'A5',
    pages: 200,
    coverMaterial: 'PU Leather',
    texture: 'Smooth',
    bookmark: true,
    elastic: true,
    penLoop: true,
    backPocket: false,
    brandingPlacement: ['Front Cover', 'Back Cover'],
    brandingArea: '8×5 cm',
    packaging: ['Individual Box', 'Bulk Pack'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop&q=80',
    description: 'Premium hardbound notebook with PU leather cover, perfect for corporate gifting.',
    specs: ['200 Pages', 'A5 Size'],
    bulkPricing: [
      { qty: 50, price: 149 },
      { qty: 100, price: 139 },
      { qty: 500, price: 129 }
    ]
  },
  {
    id: 2,
    name: 'Eco-Friendly Kraft Paper Notebook A5',
    subcategory: 'notebooks',
    brand: 'GreenWrite',
    price: 89,
    moq: 100,
    eta: '2-3 days',
    type: 'Notebook',
    material: 'Paper',
    paperGSM: '70',
    pageType: 'Ruled',
    binding: 'Spiral',
    branding: ['Screen Print', 'Sticker'],
    colors: ['Brown', 'Tan'],
    size: 'A5',
    pages: 120,
    coverMaterial: 'Kraft Paper',
    texture: 'Textured',
    bookmark: false,
    elastic: false,
    penLoop: false,
    backPocket: false,
    brandingPlacement: ['Front Cover'],
    brandingArea: '6×4 cm',
    packaging: ['Shrink Wrap', 'Bulk Pack'],
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop&q=80',
    description: 'Sustainable kraft paper notebook with eco-friendly materials.',
    specs: ['120 Pages', 'Spiral Binding'],
    bulkPricing: [
      { qty: 100, price: 89 },
      { qty: 250, price: 79 },
      { qty: 500, price: 69 }
    ]
  },
  {
    id: 3,
    name: 'A4 Executive Wiro Notebook Premium',
    subcategory: 'notebooks',
    brand: 'OfficeElite',
    price: 199,
    moq: 30,
    eta: '4-7 days',
    type: 'Notebook',
    material: 'Paper',
    paperGSM: '100',
    pageType: 'Ruled',
    binding: 'Wiro',
    branding: ['UV Print', 'Embossing', 'Metal Tag'],
    colors: ['Black', 'Grey', 'Blue'],
    size: 'A4',
    pages: 180,
    coverMaterial: 'Leatherette',
    texture: 'Textured',
    bookmark: true,
    elastic: false,
    penLoop: true,
    backPocket: true,
    brandingPlacement: ['Front Cover', 'Spine'],
    brandingArea: '10×6 cm',
    packaging: ['Individual Box', 'Gift Wrap'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=400&fit=crop&q=80',
    description: 'Executive A4 notebook with premium leatherette finish and wiro binding.',
    specs: ['180 Pages', 'A4 Size'],
    bulkPricing: [
      { qty: 30, price: 199 },
      { qty: 100, price: 189 },
      { qty: 300, price: 179 }
    ]
  },
  {
    id: 4,
    name: 'Dotted Grid Bullet Journal A5',
    subcategory: 'notebooks',
    brand: 'BulletPro',
    price: 169,
    moq: 50,
    eta: '4-7 days',
    type: 'Notebook',
    material: 'Paper',
    paperGSM: '120',
    pageType: 'Dotted',
    binding: 'Hardbound',
    branding: ['Foil Stamping', 'UV Print'],
    colors: ['Black', 'Grey', 'Tan'],
    size: 'A5',
    pages: 160,
    coverMaterial: 'PU Leather',
    texture: 'Smooth',
    bookmark: true,
    elastic: true,
    penLoop: true,
    backPocket: true,
    brandingPlacement: ['Front Cover', 'Back Cover'],
    brandingArea: '7×5 cm',
    packaging: ['Individual Box'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&q=80',
    description: 'Premium bullet journal with dotted pages, perfect for planning and creativity.',
    specs: ['Dotted Pages', '160 Pages'],
    bulkPricing: [
      { qty: 50, price: 169 },
      { qty: 100, price: 159 },
      { qty: 300, price: 149 }
    ]
  },

  // Diaries (10 products)
  {
    id: 5,
    name: '2025 Executive Diary A5 Dated',
    subcategory: 'diaries',
    brand: 'TimePlanner',
    price: 249,
    moq: 25,
    eta: '7-10 days',
    type: 'Diary',
    material: 'Leather',
    paperGSM: '80',
    pageType: 'Ruled',
    binding: 'Hardbound',
    branding: ['Foil Stamping', 'Embossing', 'Metal Tag'],
    colors: ['Black', 'Brown', 'Blue'],
    size: 'A5',
    pages: 365,
    coverMaterial: 'Genuine Leather',
    texture: 'Textured',
    bookmark: true,
    elastic: true,
    penLoop: true,
    backPocket: true,
    brandingPlacement: ['Front Cover', 'Spine'],
    brandingArea: '8×5 cm',
    packaging: ['Premium Box', 'Gift Wrap'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1531346590978-09495a46e74c?w=400&h=400&fit=crop&q=80',
    description: 'Luxury executive diary with genuine leather cover and dated pages for 2025.',
    specs: ['Dated 2025', 'Leather Cover'],
    bulkPricing: [
      { qty: 25, price: 249 },
      { qty: 50, price: 239 },
      { qty: 100, price: 229 }
    ]
  },
  {
    id: 6,
    name: 'Undated Personal Organizer Diary',
    subcategory: 'diaries',
    brand: 'OrganizerPro',
    price: 199,
    moq: 40,
    eta: '4-7 days',
    type: 'Diary',
    material: 'PU',
    paperGSM: '80',
    pageType: 'Ruled',
    binding: 'Hardbound',
    branding: ['UV Print', 'Embossing'],
    colors: ['Black', 'Grey', 'Brown'],
    size: 'A5',
    pages: 200,
    coverMaterial: 'PU Leather',
    texture: 'Smooth',
    bookmark: true,
    elastic: true,
    penLoop: true,
    backPocket: false,
    brandingPlacement: ['Front Cover'],
    brandingArea: '7×4 cm',
    packaging: ['Individual Box'],
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop&q=80',
    description: 'Undated diary perfect for personal organization and planning.',
    specs: ['Undated', 'PU Cover'],
    bulkPricing: [
      { qty: 40, price: 199 },
      { qty: 100, price: 189 },
      { qty: 250, price: 179 }
    ]
  },

  // Pens (8 products)
  {
    id: 7,
    name: 'Premium Metal Ballpoint Pen Set',
    subcategory: 'pens',
    brand: 'WriteMaster',
    price: 299,
    moq: 20,
    eta: '7-10 days',
    type: 'Pen',
    material: 'Metal',
    branding: ['Laser Engraving', 'Metal Tag'],
    colors: ['Black', 'Grey'],
    brandingPlacement: ['Barrel', 'Clip'],
    brandingArea: '4×0.5 cm',
    packaging: ['Premium Box', 'Velvet Pouch'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop&q=80',
    description: 'Premium metal ballpoint pen with laser engraving capability.',
    specs: ['Metal Body', 'Gift Box'],
    bulkPricing: [
      { qty: 20, price: 299 },
      { qty: 50, price: 279 },
      { qty: 100, price: 259 }
    ]
  },
  {
    id: 8,
    name: 'Corporate Gel Pen - Premium Finish',
    subcategory: 'pens',
    brand: 'ExecWrite',
    price: 149,
    moq: 50,
    eta: '4-7 days',
    type: 'Pen',
    material: 'Metal',
    branding: ['Laser Engraving', 'UV Print'],
    colors: ['Black', 'Blue', 'Grey'],
    brandingPlacement: ['Barrel'],
    brandingArea: '3×0.5 cm',
    packaging: ['Individual Box', 'Bulk Pack'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1565022536102-b6b1e5d88188?w=400&h=400&fit=crop&q=80',
    description: 'Corporate gel pen with smooth writing experience and premium finish.',
    specs: ['Gel Ink', 'Metal Finish'],
    bulkPricing: [
      { qty: 50, price: 149 },
      { qty: 100, price: 139 },
      { qty: 250, price: 129 }
    ]
  },

  // Desk Organizers (6 products)
  {
    id: 9,
    name: 'Wooden Desk Organizer with Pen Holder',
    subcategory: 'organizers',
    brand: 'DeskMate',
    price: 399,
    moq: 15,
    eta: '7-10 days',
    type: 'Desk Organizer',
    material: 'Wood',
    branding: ['Laser Engraving', 'Metal Tag'],
    colors: ['Brown', 'Tan'],
    brandingPlacement: ['Front Panel'],
    brandingArea: '6×3 cm',
    packaging: ['Individual Box'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=400&fit=crop&q=80',
    description: 'Premium wooden desk organizer with multiple compartments.',
    specs: ['Wooden', 'Multi-compartment'],
    bulkPricing: [
      { qty: 15, price: 399 },
      { qty: 50, price: 379 },
      { qty: 100, price: 359 }
    ]
  },

  // Calendars (5 products)
  {
    id: 10,
    name: '2025 Table Calendar Premium',
    subcategory: 'calendars',
    brand: 'CalendarPro',
    price: 179,
    moq: 30,
    eta: '4-7 days',
    type: 'Calendar',
    material: 'Paper',
    paperGSM: '300',
    branding: ['UV Print', 'Foil Stamping'],
    colors: ['White', 'Grey'],
    brandingPlacement: ['Cover', 'Each Page'],
    brandingArea: '8×4 cm',
    packaging: ['Individual Box'],
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=400&fit=crop&q=80',
    description: '2025 premium table calendar with customization options on each page.',
    specs: ['2025 Calendar', 'Table Top'],
    bulkPricing: [
      { qty: 30, price: 179 },
      { qty: 100, price: 169 },
      { qty: 250, price: 159 }
    ]
  },

  // Sticky Notes (4 products)
  {
    id: 11,
    name: 'Premium Sticky Notes Set - 5 Colors',
    subcategory: 'stickynotes',
    brand: 'StickyPro',
    price: 79,
    moq: 100,
    eta: '2-3 days',
    type: 'Sticky Notes',
    material: 'Paper',
    branding: ['Screen Print', 'UV Print'],
    colors: ['Yellow', 'Pink', 'Blue', 'Green', 'Orange'],
    brandingPlacement: ['Cover'],
    brandingArea: '5×3 cm',
    packaging: ['Shrink Wrap', 'Individual Box'],
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop&q=80',
    description: 'Set of 5 colorful sticky note pads with customization options.',
    specs: ['5 Colors', '100 Sheets Each'],
    bulkPricing: [
      { qty: 100, price: 79 },
      { qty: 250, price: 69 },
      { qty: 500, price: 59 }
    ]
  },

  // Stationery Kits (6 products)
  {
    id: 12,
    name: 'Executive Stationery Gift Hamper',
    subcategory: 'kits',
    brand: 'GiftMaster',
    price: 599,
    moq: 10,
    eta: '7-10 days',
    type: 'Kit',
    material: 'Mixed',
    branding: ['UV Print', 'Embossing', 'Metal Tag'],
    colors: ['Black', 'Brown'],
    brandingPlacement: ['All Items'],
    brandingArea: 'Variable',
    packaging: ['Premium Gift Box'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1622548839430-c2f8d2f1b06e?w=400&h=400&fit=crop&q=80',
    description: 'Complete executive stationery hamper with notebook, pen, and accessories.',
    specs: ['Complete Set', 'Gift Box'],
    bulkPricing: [
      { qty: 10, price: 599 },
      { qty: 25, price: 579 },
      { qty: 50, price: 559 }
    ]
  },

  // Premium Leather Diaries (5 products)
  {
    id: 13,
    name: 'Genuine Leather Executive Diary A5',
    subcategory: 'leatherdiaries',
    brand: 'LeatherLux',
    price: 899,
    moq: 10,
    eta: '7-10 days',
    type: 'Diary',
    material: 'Leather',
    paperGSM: '100',
    pageType: 'Ruled',
    binding: 'Hardbound',
    branding: ['Embossing', 'Foil Stamping', 'Metal Tag'],
    colors: ['Black', 'Brown', 'Tan'],
    size: 'A5',
    pages: 200,
    coverMaterial: 'Genuine Leather',
    texture: 'Textured',
    bookmark: true,
    elastic: true,
    penLoop: true,
    backPocket: true,
    brandingPlacement: ['Front Cover', 'Spine'],
    brandingArea: '8×5 cm',
    packaging: ['Premium Box', 'Luxury Gift Wrap'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400&h=400&fit=crop&q=80',
    description: 'Handcrafted genuine leather diary with premium paper quality.',
    specs: ['Genuine Leather', 'Handcrafted'],
    bulkPricing: [
      { qty: 10, price: 899 },
      { qty: 25, price: 879 },
      { qty: 50, price: 849 }
    ]
  },

  // Metal Pens (4 products)
  {
    id: 14,
    name: 'Luxury Metal Fountain Pen',
    subcategory: 'metalpens',
    brand: 'PenCraft',
    price: 799,
    moq: 10,
    eta: '7-10 days',
    type: 'Pen',
    material: 'Metal',
    branding: ['Laser Engraving'],
    colors: ['Black', 'Silver'],
    brandingPlacement: ['Barrel', 'Cap'],
    brandingArea: '4×0.5 cm',
    packaging: ['Luxury Box', 'Velvet Pouch'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop&q=80',
    description: 'Luxury metal fountain pen with smooth writing experience.',
    specs: ['Fountain Pen', 'Metal Body'],
    bulkPricing: [
      { qty: 10, price: 799 },
      { qty: 25, price: 779 },
      { qty: 50, price: 749 }
    ]
  },

  // Executive Writing Sets (3 products)
  {
    id: 15,
    name: 'Premium Executive Writing Set',
    subcategory: 'writingsets',
    brand: 'ExecutiveGifts',
    price: 1299,
    moq: 5,
    eta: '7-10 days',
    type: 'Kit',
    material: 'Metal',
    branding: ['Laser Engraving', 'Metal Tag'],
    colors: ['Black', 'Silver'],
    brandingPlacement: ['All Items'],
    brandingArea: 'Variable',
    packaging: ['Premium Gift Box'],
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1565022536102-b6b1e5d88188?w=400&h=400&fit=crop&q=80',
    description: 'Premium writing set with fountain pen, ballpoint pen, and letter opener.',
    specs: ['Complete Set', 'Premium Box'],
    bulkPricing: [
      { qty: 5, price: 1299 },
      { qty: 10, price: 1249 },
      { qty: 25, price: 1199 }
    ]
  },

  // Desk Accessories (5 products)
  {
    id: 16,
    name: 'Executive Desk Accessories Set',
    subcategory: 'deskaccessories',
    brand: 'DeskPro',
    price: 899,
    moq: 10,
    eta: '7-10 days',
    type: 'Desk Accessory',
    material: 'Metal',
    branding: ['Laser Engraving', 'Metal Tag'],
    colors: ['Black', 'Silver'],
    brandingPlacement: ['Each Item'],
    brandingArea: '5×3 cm',
    packaging: ['Premium Box'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=400&fit=crop&q=80',
    description: 'Complete desk accessories set including pen stand, calendar block, and memo holder.',
    specs: ['Complete Set', '3 Accessories'],
    bulkPricing: [
      { qty: 10, price: 899 },
      { qty: 25, price: 869 },
      { qty: 50, price: 839 }
    ]
  },
];

export const getStationeryByCategory = (category: string) => {
  if (category === 'all') return stationeryProducts;
  return stationeryProducts.filter(product => product.subcategory === category);
};

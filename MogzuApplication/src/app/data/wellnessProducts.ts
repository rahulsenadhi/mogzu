export interface WellnessProduct {
  id: number;
  name: string;
  subcategory: 'hampers' | 'aromatherapy' | 'candles' | 'diffusers' | 'herbaltea' | 'yogamats' | 'bottles' | 'fitnessbands' | 'skincarekits' | 'bathbodysets' | 'healthkits';
  brand: string;
  price: number;
  moq: number;
  eta: string;
  type: string;
  material: string;
  wellnessBenefit: string[];
  fragrance?: string;
  colors: string[];
  branding: string[];
  brandingPlacement?: string[];
  ingredients?: string[];
  shelfLife?: string;
  waxType?: string;
  burnTime?: string;
  jarMaterial?: string;
  diffuserCapacity?: string;
  teaType?: string;
  yogaMatThickness?: string;
  bottleCapacity?: string;
  packaging?: string;
  rating: number;
  image: string;
  description: string;
  specs: string[];
  isEco?: boolean;
  isPremium?: boolean;
  bulkPricing?: { qty: number; price: number }[];
}

export const wellnessProducts: WellnessProduct[] = [
  // Hampers (3 products)
  {
    id: 1,
    name: 'Premium Wellness Gift Hamper Deluxe',
    subcategory: 'hampers',
    brand: 'WellnessBox',
    price: 1499,
    moq: 10,
    eta: '7-10 days',
    type: 'Hampers',
    material: 'Mixed',
    wellnessBenefit: ['Relax', 'Sleep'],
    colors: ['Natural', 'White'],
    branding: ['Sticker', 'UV Print', 'Sleeve'],
    brandingPlacement: ['Box Lid', 'Sleeve'],
    ingredients: ['Candles', 'Tea', 'Aromatherapy Oil', 'Body Lotion'],
    shelfLife: '12 months',
    packaging: 'Premium Gift Box',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80',
    description: 'Complete wellness hamper with candles, herbal tea, aromatherapy, and body care products.',
    specs: ['10 Items', 'Gift Box', 'Premium'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 10, price: 1499 },
      { qty: 25, price: 1449 },
      { qty: 50, price: 1399 }
    ]
  },
  {
    id: 2,
    name: 'Corporate Wellness Hamper Essential',
    subcategory: 'hampers',
    brand: 'OfficeWell',
    price: 899,
    moq: 15,
    eta: '4-7 days',
    type: 'Hampers',
    material: 'Mixed',
    wellnessBenefit: ['Energy', 'Relax'],
    colors: ['Natural'],
    branding: ['Sticker', 'UV Print'],
    brandingPlacement: ['Box'],
    ingredients: ['Green Tea', 'Diffuser', 'Stress Ball', 'Notebook'],
    shelfLife: '12 months',
    packaging: 'Gift Box',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop&q=80',
    description: 'Essential wellness hamper perfect for corporate gifting.',
    specs: ['6 Items', 'Gift Box', 'Corporate'],
    isPremium: false,
    isEco: true,
    bulkPricing: [
      { qty: 15, price: 899 },
      { qty: 30, price: 869 },
      { qty: 50, price: 839 }
    ]
  },

  // Aromatherapy (3 products)
  {
    id: 3,
    name: 'Lavender Essential Oil Pure 30ml',
    subcategory: 'aromatherapy',
    brand: 'AromaBliss',
    price: 399,
    moq: 30,
    eta: '2-3 days',
    type: 'Aromatherapy',
    material: 'Essential Oils',
    wellnessBenefit: ['Relax', 'Sleep'],
    fragrance: 'Lavender',
    colors: ['Purple'],
    branding: ['Sticker', 'UV Print'],
    brandingPlacement: ['Bottle Label'],
    ingredients: ['Pure Lavender Oil'],
    shelfLife: '24 months',
    packaging: 'Glass Bottle',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80',
    description: 'Pure lavender essential oil for relaxation and better sleep.',
    specs: ['30ml', 'Pure', 'Lavender'],
    isEco: true,
    bulkPricing: [
      { qty: 30, price: 399 },
      { qty: 50, price: 379 },
      { qty: 100, price: 359 }
    ]
  },
  {
    id: 4,
    name: 'Sandalwood Essential Oil Premium 30ml',
    subcategory: 'aromatherapy',
    brand: 'AromaBliss',
    price: 599,
    moq: 25,
    eta: '4-7 days',
    type: 'Aromatherapy',
    material: 'Essential Oils',
    wellnessBenefit: ['Relax', 'Energy'],
    fragrance: 'Sandalwood',
    colors: ['Brown'],
    branding: ['Sticker', 'Laser Engraving'],
    brandingPlacement: ['Bottle Label', 'Box'],
    ingredients: ['Pure Sandalwood Oil'],
    shelfLife: '24 months',
    packaging: 'Glass Bottle',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1611689037241-d8dfe4280f2e?w=400&h=400&fit=crop&q=80',
    description: 'Premium sandalwood essential oil with calming properties.',
    specs: ['30ml', 'Premium', 'Sandalwood'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 25, price: 599 },
      { qty: 50, price: 579 },
      { qty: 100, price: 549 }
    ]
  },

  // Candles (4 products)
  {
    id: 5,
    name: 'Lavender Soy Wax Candle 200g',
    subcategory: 'candles',
    brand: 'CandleGlow',
    price: 299,
    moq: 30,
    eta: '2-3 days',
    type: 'Candles',
    material: 'Soy Wax',
    wellnessBenefit: ['Relax', 'Sleep'],
    fragrance: 'Lavender',
    colors: ['Purple', 'White'],
    branding: ['Sticker', 'UV Print'],
    brandingPlacement: ['Jar', 'Box'],
    waxType: 'Soy Wax',
    burnTime: '40 hours',
    jarMaterial: 'Glass',
    shelfLife: '18 months',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1602874801006-22d8e2cd5440?w=400&h=400&fit=crop&q=80',
    description: 'Handcrafted soy wax candle with lavender fragrance for relaxation.',
    specs: ['200g', 'Soy Wax', '40h Burn'],
    isEco: true,
    bulkPricing: [
      { qty: 30, price: 299 },
      { qty: 50, price: 279 },
      { qty: 100, price: 259 }
    ]
  },
  {
    id: 6,
    name: 'Vanilla Soy Wax Candle Premium 250g',
    subcategory: 'candles',
    brand: 'CandleGlow',
    price: 399,
    moq: 25,
    eta: '4-7 days',
    type: 'Candles',
    material: 'Soy Wax',
    wellnessBenefit: ['Relax'],
    fragrance: 'Vanilla',
    colors: ['Cream', 'White'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Jar', 'Lid'],
    waxType: 'Soy Wax',
    burnTime: '50 hours',
    jarMaterial: 'Glass',
    shelfLife: '18 months',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1588328639384-fb3ee88b5f3e?w=400&h=400&fit=crop&q=80',
    description: 'Premium vanilla scented candle with extended burn time.',
    specs: ['250g', 'Premium', '50h Burn'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 25, price: 399 },
      { qty: 50, price: 379 },
      { qty: 100, price: 359 }
    ]
  },
  {
    id: 7,
    name: 'Sandalwood Soy Candle Luxury 300g',
    subcategory: 'candles',
    brand: 'LuxeGlow',
    price: 549,
    moq: 20,
    eta: '7-10 days',
    type: 'Candles',
    material: 'Soy Wax',
    wellnessBenefit: ['Relax', 'Energy'],
    fragrance: 'Sandalwood',
    colors: ['Brown', 'Gold'],
    branding: ['Laser Engraving', 'UV Print', 'Sticker'],
    brandingPlacement: ['Jar', 'Lid', 'Box'],
    waxType: 'Soy Wax',
    burnTime: '60 hours',
    jarMaterial: 'Glass',
    shelfLife: '18 months',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop&q=80',
    description: 'Luxury sandalwood candle with premium glass jar and long burn time.',
    specs: ['300g', 'Luxury', '60h Burn'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 20, price: 549 },
      { qty: 40, price: 529 },
      { qty: 80, price: 499 }
    ]
  },

  // Diffusers (3 products)
  {
    id: 8,
    name: 'Reed Diffuser Lavender 100ml',
    subcategory: 'diffusers',
    brand: 'AromaHome',
    price: 449,
    moq: 25,
    eta: '4-7 days',
    type: 'Diffusers',
    material: 'Essential Oils',
    wellnessBenefit: ['Relax', 'Sleep'],
    fragrance: 'Lavender',
    colors: ['Purple', 'Clear'],
    branding: ['Sticker', 'UV Print'],
    brandingPlacement: ['Bottle', 'Box'],
    diffuserCapacity: '100ml',
    shelfLife: '12 months',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop&q=80',
    description: 'Reed diffuser with natural lavender fragrance, lasts 2-3 months.',
    specs: ['100ml', 'Reed', 'Lavender'],
    isEco: true,
    bulkPricing: [
      { qty: 25, price: 449 },
      { qty: 50, price: 429 },
      { qty: 100, price: 399 }
    ]
  },
  {
    id: 9,
    name: 'Ultrasonic Aroma Diffuser 300ml',
    subcategory: 'diffusers',
    brand: 'TechAroma',
    price: 899,
    moq: 15,
    eta: '7-10 days',
    type: 'Diffusers',
    material: 'Plastic',
    wellnessBenefit: ['Relax', 'Sleep'],
    fragrance: 'Multiple',
    colors: ['White', 'Wood'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Base'],
    diffuserCapacity: '300ml',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop&q=80',
    description: 'Electric ultrasonic diffuser with LED lights and timer function.',
    specs: ['300ml', 'Ultrasonic', 'LED'],
    isPremium: true,
    bulkPricing: [
      { qty: 15, price: 899 },
      { qty: 30, price: 869 },
      { qty: 50, price: 839 }
    ]
  },

  // Herbal Tea (3 products)
  {
    id: 10,
    name: 'Green Tea Premium Loose Leaf 100g',
    subcategory: 'herbaltea',
    brand: 'TeaBliss',
    price: 249,
    moq: 40,
    eta: '2-3 days',
    type: 'Tea',
    material: 'Natural',
    wellnessBenefit: ['Energy', 'Relax'],
    colors: ['Green', 'Natural'],
    branding: ['Sticker', 'Sleeve'],
    brandingPlacement: ['Tin', 'Sleeve'],
    teaType: 'Green Tea',
    ingredients: ['Pure Green Tea Leaves'],
    shelfLife: '12 months',
    packaging: 'Tin',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop&q=80',
    description: 'Premium loose leaf green tea rich in antioxidants.',
    specs: ['100g', 'Green Tea', 'Loose Leaf'],
    isEco: true,
    bulkPricing: [
      { qty: 40, price: 249 },
      { qty: 80, price: 229 },
      { qty: 150, price: 209 }
    ]
  },
  {
    id: 11,
    name: 'Chamomile Herbal Tea Organic 50g',
    subcategory: 'herbaltea',
    brand: 'TeaBliss',
    price: 299,
    moq: 30,
    eta: '4-7 days',
    type: 'Tea',
    material: 'Natural',
    wellnessBenefit: ['Relax', 'Sleep'],
    colors: ['Yellow', 'Natural'],
    branding: ['Sticker', 'UV Print'],
    brandingPlacement: ['Box', 'Pouch'],
    teaType: 'Herbal Tea',
    ingredients: ['Organic Chamomile Flowers'],
    shelfLife: '12 months',
    packaging: 'Premium Box',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1597318112874-f58cd0ec29ce?w=400&h=400&fit=crop&q=80',
    description: 'Organic chamomile tea for relaxation and better sleep.',
    specs: ['50g', 'Organic', 'Chamomile'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 30, price: 299 },
      { qty: 60, price: 279 },
      { qty: 100, price: 259 }
    ]
  },

  // Yoga Mats (2 products)
  {
    id: 12,
    name: 'TPE Yoga Mat Premium 6mm',
    subcategory: 'yogamats',
    brand: 'YogaFit',
    price: 799,
    moq: 15,
    eta: '4-7 days',
    type: 'Yoga',
    material: 'TPE',
    wellnessBenefit: ['Energy'],
    colors: ['Purple', 'Blue', 'Pink'],
    branding: ['Laser Engraving', 'Screen Print'],
    brandingPlacement: ['Surface', 'Strap'],
    yogaMatThickness: '6mm',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop&q=80',
    description: 'Premium TPE yoga mat with non-slip surface and carrying strap.',
    specs: ['6mm', 'TPE', 'Non-Slip'],
    isEco: true,
    bulkPricing: [
      { qty: 15, price: 799 },
      { qty: 30, price: 769 },
      { qty: 50, price: 739 }
    ]
  },
  {
    id: 13,
    name: 'Natural Rubber Yoga Mat Eco 8mm',
    subcategory: 'yogamats',
    brand: 'EcoYoga',
    price: 1299,
    moq: 10,
    eta: '7-10 days',
    type: 'Yoga',
    material: 'Natural Rubber',
    wellnessBenefit: ['Energy'],
    colors: ['Natural', 'Green'],
    branding: ['Laser Engraving'],
    brandingPlacement: ['Surface'],
    yogaMatThickness: '8mm',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop&q=80',
    description: 'Eco-friendly natural rubber yoga mat with superior grip.',
    specs: ['8mm', 'Rubber', 'Eco'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 10, price: 1299 },
      { qty: 25, price: 1249 },
      { qty: 50, price: 1199 }
    ]
  },

  // Bottles (2 products)
  {
    id: 14,
    name: 'Stainless Steel Water Bottle 750ml',
    subcategory: 'bottles',
    brand: 'HydroLife',
    price: 399,
    moq: 30,
    eta: '2-3 days',
    type: 'Bottles',
    material: 'Steel',
    wellnessBenefit: ['Energy'],
    colors: ['Silver', 'Black', 'Blue'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Body'],
    bottleCapacity: '750ml',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&q=80',
    description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours.',
    specs: ['750ml', 'Steel', 'Insulated'],
    isEco: true,
    bulkPricing: [
      { qty: 30, price: 399 },
      { qty: 60, price: 379 },
      { qty: 100, price: 359 }
    ]
  },

  // Fitness Bands (2 products)
  {
    id: 15,
    name: 'Smart Fitness Band Activity Tracker',
    subcategory: 'fitnessbands',
    brand: 'FitTrack',
    price: 1299,
    moq: 15,
    eta: '7-10 days',
    type: 'Fitness Bands',
    material: 'Silicone',
    wellnessBenefit: ['Energy'],
    colors: ['Black', 'Blue'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Strap', 'Box'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop&q=80',
    description: 'Smart fitness band with heart rate monitor and sleep tracking.',
    specs: ['Heart Rate', 'Sleep Track', 'Waterproof'],
    isPremium: true,
    bulkPricing: [
      { qty: 15, price: 1299 },
      { qty: 30, price: 1249 },
      { qty: 50, price: 1199 }
    ]
  },

  // Skincare Kits (2 products)
  {
    id: 16,
    name: 'Natural Skincare Gift Set Premium',
    subcategory: 'skincarekits',
    brand: 'PureGlow',
    price: 999,
    moq: 15,
    eta: '4-7 days',
    type: 'Skincare',
    material: 'Natural',
    wellnessBenefit: ['Relax'],
    colors: ['White', 'Natural'],
    branding: ['Sticker', 'UV Print'],
    brandingPlacement: ['Box', 'Bottles'],
    ingredients: ['Face Wash', 'Moisturizer', 'Serum', 'Face Mask'],
    shelfLife: '24 months',
    packaging: 'Gift Box',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop&q=80',
    description: 'Complete natural skincare set with cleanser, moisturizer, and serum.',
    specs: ['4 Products', 'Natural', 'Gift Set'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 15, price: 999 },
      { qty: 30, price: 969 },
      { qty: 50, price: 939 }
    ]
  },

  // Bath/Body Sets (2 products)
  {
    id: 17,
    name: 'Luxury Bath & Body Gift Set',
    subcategory: 'bathbodysets',
    brand: 'SpaLux',
    price: 799,
    moq: 20,
    eta: '4-7 days',
    type: 'Bath/Body',
    material: 'Natural',
    wellnessBenefit: ['Relax', 'Sleep'],
    fragrance: 'Lavender',
    colors: ['Purple', 'White'],
    branding: ['Sticker', 'UV Print', 'Sleeve'],
    brandingPlacement: ['Box', 'Bottles'],
    ingredients: ['Body Wash', 'Body Lotion', 'Scrub', 'Bath Salts'],
    shelfLife: '18 months',
    packaging: 'Premium Gift Box',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop&q=80',
    description: 'Luxury bath and body set with lavender fragrance for relaxation.',
    specs: ['4 Items', 'Lavender', 'Premium'],
    isPremium: true,
    isEco: true,
    bulkPricing: [
      { qty: 20, price: 799 },
      { qty: 40, price: 769 },
      { qty: 80, price: 739 }
    ]
  },

  // Health Kits (2 products)
  {
    id: 18,
    name: 'Complete Health & Wellness Kit',
    subcategory: 'healthkits',
    brand: 'HealthPro',
    price: 1499,
    moq: 10,
    eta: '7-10 days',
    type: 'Health Kits',
    material: 'Mixed',
    wellnessBenefit: ['Energy', 'Relax'],
    colors: ['White', 'Blue'],
    branding: ['Sticker', 'UV Print', 'Laser Engraving'],
    brandingPlacement: ['Box', 'Items'],
    ingredients: ['Supplements', 'Fitness Band', 'Water Bottle', 'Towel'],
    shelfLife: '12 months',
    packaging: 'Premium Box',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400&h=400&fit=crop&q=80',
    description: 'Complete health kit with fitness accessories and wellness products.',
    specs: ['6 Items', 'Complete', 'Premium'],
    isPremium: true,
    bulkPricing: [
      { qty: 10, price: 1499 },
      { qty: 25, price: 1449 },
      { qty: 50, price: 1399 }
    ]
  },
];

export const getWellnessByCategory = (category: string) => {
  if (category === 'all') return wellnessProducts;
  return wellnessProducts.filter(product => product.subcategory === category);
};

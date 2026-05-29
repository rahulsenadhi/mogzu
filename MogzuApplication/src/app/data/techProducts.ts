export interface TechProduct {
  id: number;
  mogzuListingId?: string;
  name: string;
  subcategory: 'powerbanks' | 'speakers' | 'earbuds' | 'smartbottles' | 'wirelesschargers' | 'pendrives' | 'techkits' | 'smartclocks' | 'laptopstands' | 'desklamps';
  brand: string;
  price: number;
  moq: number;
  eta: string;
  type: string;
  batteryMah?: number;
  outputPower?: string;
  chargingType?: string;
  bluetoothVersion?: string;
  ipRating?: string;
  playtime?: string;
  weight?: string;
  compatibility?: string[];
  material: string;
  warranty: string;
  colors: string[];
  features: string[];
  branding: string[];
  brandingPlacement?: string[];
  capacity?: string;
  connectivity?: string;
  rating: number;
  image: string;
  description: string;
  specs: string[];
  bulkPricing?: { qty: number; price: number }[];
}

export const techProducts: TechProduct[] = [
  // Power Banks (5 products)
  {
    id: 1,
    name: 'Premium 10000mAh Fast Charge Power Bank',
    subcategory: 'powerbanks',
    brand: 'PowerPro',
    price: 799,
    moq: 25,
    eta: '4-7 days',
    type: 'Power Bank',
    batteryMah: 10000,
    outputPower: '20W',
    chargingType: 'Type-C',
    connectivity: 'Type-C',
    ipRating: 'IP54',
    weight: '220g',
    compatibility: ['Android', 'iOS', 'Tablets'],
    material: 'Aluminum Alloy',
    warranty: '1Y',
    colors: ['Black', 'White', 'Metallic'],
    features: ['Fast Charge', 'LED Display', 'Dual Output'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Front Panel', 'Back Panel'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop&q=80',
    description: 'High-capacity power bank with fast charging and LED display for corporate gifting.',
    specs: ['10000mAh', '20W Fast Charge', 'LED Display'],
    bulkPricing: [
      { qty: 25, price: 799 },
      { qty: 50, price: 749 },
      { qty: 100, price: 699 }
    ]
  },
  {
    id: 2,
    name: 'Compact 5000mAh Wireless Power Bank',
    subcategory: 'powerbanks',
    brand: 'ChargeMate',
    price: 599,
    moq: 30,
    eta: '2-3 days',
    type: 'Power Bank',
    batteryMah: 5000,
    outputPower: '10W',
    chargingType: 'Wireless',
    connectivity: 'Wireless',
    weight: '150g',
    compatibility: ['Android', 'iOS'],
    material: 'Plastic',
    warranty: '6M',
    colors: ['Black', 'White'],
    features: ['Wireless Charging', 'Compact Design'],
    branding: ['UV Print', 'Laser Engraving'],
    brandingPlacement: ['Front Panel'],
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=400&h=400&fit=crop&q=80',
    description: 'Compact wireless power bank perfect for on-the-go charging.',
    specs: ['5000mAh', 'Wireless', '10W'],
    bulkPricing: [
      { qty: 30, price: 599 },
      { qty: 50, price: 579 },
      { qty: 100, price: 549 }
    ]
  },
  {
    id: 3,
    name: 'Executive 20000mAh Power Bank with Display',
    subcategory: 'powerbanks',
    brand: 'PowerElite',
    price: 1299,
    moq: 20,
    eta: '7-10 days',
    type: 'Power Bank',
    batteryMah: 20000,
    outputPower: '20W',
    chargingType: 'Type-C',
    connectivity: 'Type-C',
    ipRating: 'IP55',
    weight: '350g',
    compatibility: ['Android', 'iOS', 'Tablets', 'Laptops'],
    material: 'Aluminum',
    warranty: '1Y',
    colors: ['Black', 'Metallic'],
    features: ['Fast Charge', 'LED Display', 'Triple Output'],
    branding: ['Laser Engraving', 'Metal Plate'],
    brandingPlacement: ['Front Panel', 'Side'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=400&h=400&fit=crop&q=80',
    description: 'Premium high-capacity power bank with triple output ports.',
    specs: ['20000mAh', '20W', 'Triple Output'],
    bulkPricing: [
      { qty: 20, price: 1299 },
      { qty: 50, price: 1249 },
      { qty: 100, price: 1199 }
    ]
  },

  // Bluetooth Speakers (4 products)
  {
    id: 4,
    name: 'Portable Bluetooth Speaker 5.0',
    subcategory: 'speakers',
    brand: 'SoundWave',
    price: 899,
    moq: 20,
    eta: '4-7 days',
    type: 'Speaker',
    batteryMah: 2000,
    outputPower: '10W',
    bluetoothVersion: 'BT5.0',
    ipRating: 'IPX7',
    playtime: '12 hours',
    weight: '280g',
    compatibility: ['Android', 'iOS', 'Laptop'],
    material: 'ABS Plastic',
    warranty: '1Y',
    colors: ['Black', 'White', 'Metallic'],
    features: ['Waterproof', 'Long Battery Life', 'HD Sound'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Front Grille', 'Back Panel'],
    connectivity: 'BT5.0',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&q=80',
    description: 'Waterproof Bluetooth speaker with 12 hours playtime.',
    specs: ['BT5.0', '10W', '12h Playtime'],
    bulkPricing: [
      { qty: 20, price: 899 },
      { qty: 50, price: 849 },
      { qty: 100, price: 799 }
    ]
  },
  {
    id: 5,
    name: 'Mini Wireless Speaker BT4.0',
    subcategory: 'speakers',
    brand: 'MiniSound',
    price: 499,
    moq: 30,
    eta: '2-3 days',
    type: 'Speaker',
    batteryMah: 1200,
    outputPower: '5W',
    bluetoothVersion: 'BT4.0',
    playtime: '6 hours',
    weight: '150g',
    compatibility: ['Android', 'iOS'],
    material: 'Plastic',
    warranty: '6M',
    colors: ['Black', 'White'],
    features: ['Compact', 'Portable'],
    branding: ['UV Print'],
    brandingPlacement: ['Top Panel'],
    connectivity: 'BT4.0',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop&q=80',
    description: 'Compact Bluetooth speaker perfect for travel and events.',
    specs: ['BT4.0', '5W', '6h Playtime'],
    bulkPricing: [
      { qty: 30, price: 499 },
      { qty: 50, price: 479 },
      { qty: 100, price: 449 }
    ]
  },

  // Earbuds (3 products)
  {
    id: 6,
    name: 'TWS Earbuds BT5.0 with Charging Case',
    subcategory: 'earbuds',
    brand: 'AudioPro',
    price: 1199,
    moq: 15,
    eta: '4-7 days',
    type: 'Earbuds',
    batteryMah: 500,
    bluetoothVersion: 'BT5.0',
    playtime: '20 hours',
    weight: '50g',
    compatibility: ['Android', 'iOS'],
    material: 'ABS Plastic',
    warranty: '1Y',
    colors: ['Black', 'White'],
    features: ['Touch Control', 'Voice Assistant', 'Deep Bass'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Charging Case'],
    connectivity: 'BT5.0',
    ipRating: 'IPX5',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&q=80',
    description: 'True wireless earbuds with charging case and touch controls.',
    specs: ['BT5.0', 'Touch Control', '20h Battery'],
    bulkPricing: [
      { qty: 15, price: 1199 },
      { qty: 30, price: 1149 },
      { qty: 50, price: 1099 }
    ]
  },
  {
    id: 7,
    name: 'Noise Cancelling Earbuds Premium',
    subcategory: 'earbuds',
    brand: 'SilentPro',
    price: 1799,
    moq: 10,
    eta: '7-10 days',
    type: 'Earbuds',
    batteryMah: 600,
    bluetoothVersion: 'BT5.0',
    playtime: '24 hours',
    weight: '60g',
    compatibility: ['Android', 'iOS'],
    material: 'Premium ABS',
    warranty: '1Y',
    colors: ['Black', 'White', 'Metallic'],
    features: ['Noise Cancelling', 'Touch Control', 'Waterproof'],
    branding: ['Laser Engraving'],
    brandingPlacement: ['Charging Case'],
    connectivity: 'BT5.0',
    ipRating: 'IPX6',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop&q=80',
    description: 'Premium earbuds with active noise cancellation.',
    specs: ['Noise Cancelling', 'BT5.0', '24h Battery'],
    bulkPricing: [
      { qty: 10, price: 1799 },
      { qty: 25, price: 1749 },
      { qty: 50, price: 1699 }
    ]
  },

  // Smart Bottles (2 products)
  {
    id: 8,
    name: 'Smart Temperature Display Bottle 500ml',
    subcategory: 'smartbottles',
    brand: 'HydroSmart',
    price: 699,
    moq: 25,
    eta: '4-7 days',
    type: 'Smart Bottle',
    capacity: '500ml',
    material: 'Stainless Steel',
    warranty: '1Y',
    colors: ['Black', 'White', 'Metallic'],
    features: ['LED Display', 'Temperature Sensor', 'Insulated'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Body', 'Lid'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&q=80',
    description: 'Insulated smart bottle with LED temperature display.',
    specs: ['500ml', 'LED Display', 'Temperature Sensor'],
    bulkPricing: [
      { qty: 25, price: 699 },
      { qty: 50, price: 669 },
      { qty: 100, price: 639 }
    ]
  },

  // Wireless Chargers (3 products)
  {
    id: 9,
    name: '15W Fast Wireless Charging Pad',
    subcategory: 'wirelesschargers',
    brand: 'ChargeFast',
    price: 599,
    moq: 30,
    eta: '2-3 days',
    type: 'Wireless Charger',
    outputPower: '15W',
    connectivity: 'Wireless',
    material: 'Aluminum',
    warranty: '1Y',
    colors: ['Black', 'White', 'Metallic'],
    features: ['Fast Charge', 'LED Indicator', 'Non-Slip'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Top Surface'],
    compatibility: ['Android', 'iOS'],
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1591290619762-c588f7262a5c?w=400&h=400&fit=crop&q=80',
    description: 'Fast wireless charging pad with LED indicator.',
    specs: ['15W', 'Wireless', 'Fast Charge'],
    bulkPricing: [
      { qty: 30, price: 599 },
      { qty: 50, price: 579 },
      { qty: 100, price: 549 }
    ]
  },
  {
    id: 10,
    name: '3-in-1 Wireless Charging Station',
    subcategory: 'wirelesschargers',
    brand: 'ChargeHub',
    price: 1299,
    moq: 15,
    eta: '7-10 days',
    type: 'Wireless Charger',
    outputPower: '20W',
    connectivity: 'Wireless',
    material: 'Aluminum',
    warranty: '1Y',
    colors: ['Black', 'White'],
    features: ['Fast Charge', 'LED Display', '3-in-1'],
    branding: ['Laser Engraving'],
    brandingPlacement: ['Base'],
    compatibility: ['Android', 'iOS', 'Smartwatch', 'Earbuds'],
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop&q=80',
    description: 'Charge phone, watch, and earbuds simultaneously.',
    specs: ['3-in-1', '20W', 'LED Display'],
    bulkPricing: [
      { qty: 15, price: 1299 },
      { qty: 30, price: 1249 },
      { qty: 50, price: 1199 }
    ]
  },

  // Pendrives (3 products)
  {
    id: 11,
    name: 'Premium Metal Pendrive 32GB USB 3.0',
    subcategory: 'pendrives',
    brand: 'DataPro',
    price: 399,
    moq: 50,
    eta: '2-3 days',
    type: 'Pendrive',
    capacity: '32GB',
    connectivity: 'Type-C',
    material: 'Metal',
    warranty: '1Y',
    colors: ['Black', 'Metallic'],
    features: ['USB 3.0', 'High Speed', 'Compact'],
    branding: ['Laser Engraving'],
    brandingPlacement: ['Body'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=400&fit=crop&q=80',
    description: 'Premium metal pendrive with USB 3.0 high-speed transfer.',
    specs: ['32GB', 'USB 3.0', 'Metal Body'],
    bulkPricing: [
      { qty: 50, price: 399 },
      { qty: 100, price: 379 },
      { qty: 250, price: 359 }
    ]
  },
  {
    id: 12,
    name: 'Type-C OTG Pendrive 64GB Dual Drive',
    subcategory: 'pendrives',
    brand: 'DualDrive',
    price: 599,
    moq: 30,
    eta: '4-7 days',
    type: 'Pendrive',
    capacity: '64GB',
    connectivity: 'Type-C',
    material: 'Metal',
    warranty: '1Y',
    colors: ['Black', 'Metallic'],
    features: ['Dual Connector', 'OTG Support', 'USB 3.0'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Body'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1570486820404-9f06d7d1b95a?w=400&h=400&fit=crop&q=80',
    description: 'Dual connector pendrive for phones and computers.',
    specs: ['64GB', 'Type-C + USB', 'OTG'],
    bulkPricing: [
      { qty: 30, price: 599 },
      { qty: 50, price: 579 },
      { qty: 100, price: 549 }
    ]
  },

  // Tech Kits (2 products)
  {
    id: 13,
    name: 'Executive Tech Gift Hamper Premium',
    subcategory: 'techkits',
    brand: 'TechGift',
    price: 2499,
    moq: 10,
    eta: '7-10 days',
    type: 'Kit',
    material: 'Mixed',
    warranty: '1Y',
    colors: ['Black'],
    features: ['Complete Set', 'Premium Packaging'],
    branding: ['Laser Engraving', 'UV Print', 'Metal Plate'],
    brandingPlacement: ['All Items'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop&q=80',
    description: 'Complete tech gift set including power bank, earbuds, and accessories.',
    specs: ['Complete Set', 'Premium Box', '5 Items'],
    bulkPricing: [
      { qty: 10, price: 2499 },
      { qty: 25, price: 2399 },
      { qty: 50, price: 2299 }
    ]
  },

  // Smart Clocks (2 products)
  {
    id: 14,
    name: 'Wireless Charging Alarm Clock with Display',
    subcategory: 'smartclocks',
    brand: 'TimeSmart',
    price: 899,
    moq: 20,
    eta: '4-7 days',
    type: 'Smart Clock',
    outputPower: '10W',
    connectivity: 'Wireless',
    material: 'ABS Plastic',
    warranty: '1Y',
    colors: ['Black', 'White'],
    features: ['Wireless Charging', 'LED Display', 'Alarm'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Front Panel'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1563260797-cb5cd70254c8?w=400&h=400&fit=crop&q=80',
    description: 'Smart alarm clock with wireless phone charging.',
    specs: ['Wireless Charger', 'LED Display', 'Alarm'],
    bulkPricing: [
      { qty: 20, price: 899 },
      { qty: 50, price: 869 },
      { qty: 100, price: 839 }
    ]
  },

  // Laptop Stands (2 products)
  {
    id: 15,
    name: 'Aluminum Foldable Laptop Stand Ergonomic',
    subcategory: 'laptopstands',
    brand: 'ErgoStand',
    price: 799,
    moq: 15,
    eta: '4-7 days',
    type: 'Laptop Stand',
    material: 'Aluminum',
    warranty: '1Y',
    colors: ['Black', 'Metallic'],
    features: ['Foldable', 'Ergonomic', 'Non-Slip'],
    branding: ['Laser Engraving'],
    brandingPlacement: ['Base'],
    compatibility: ['All Laptops', 'Tablets'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop&q=80',
    description: 'Ergonomic foldable laptop stand for better posture.',
    specs: ['Aluminum', 'Foldable', 'Ergonomic'],
    bulkPricing: [
      { qty: 15, price: 799 },
      { qty: 30, price: 769 },
      { qty: 50, price: 739 }
    ]
  },

  // Desk Lamps (2 products)
  {
    id: 16,
    name: 'LED Desk Lamp with Wireless Charging',
    subcategory: 'desklamps',
    brand: 'LightPro',
    price: 999,
    moq: 15,
    eta: '4-7 days',
    type: 'Desk Lamp',
    outputPower: '10W',
    connectivity: 'Wireless',
    material: 'ABS + Metal',
    warranty: '1Y',
    colors: ['Black', 'White'],
    features: ['Wireless Charging', 'Touch Control', 'Dimmable'],
    branding: ['Laser Engraving', 'UV Print'],
    brandingPlacement: ['Base'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop&q=80',
    description: 'LED desk lamp with integrated wireless phone charging.',
    specs: ['LED', 'Wireless Charger', 'Dimmable'],
    bulkPricing: [
      { qty: 15, price: 999 },
      { qty: 30, price: 969 },
      { qty: 50, price: 939 }
    ]
  },
];

export const getTechByCategory = (category: string) => {
  if (category === 'all') return techProducts;
  return techProducts.filter(product => product.subcategory === category);
};

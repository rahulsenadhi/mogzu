import type { AdminProductLine } from '@/app/components/admin/AdminPageChrome';

export type MockProduct = {
  id: string;
  name: string;
  image: string;
  seller: string;
  category: string;
  qty: string;
  price: string;
  stock: 'available' | 'out';
  vertical: AdminProductLine;
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'POD30908147',
    name: "Women's Cotton Stretch Half Sleeve",
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop',
    seller: 'Kapil Dev',
    category: 'Apparel',
    qty: '2000',
    price: '₹400 per/unit',
    stock: 'available',
    vertical: 'gifting',
  },
  {
    id: 'POD30908148',
    name: 'Corporate Gift Hamper — Premium',
    image:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=80&h=80&fit=crop',
    seller: 'Urban Events',
    category: 'Hampers',
    qty: '150',
    price: '₹2,499 per/unit',
    stock: 'available',
    vertical: 'gifting',
  },
  {
    id: 'POD30908149',
    name: 'LED Desk Lamp Pro',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&h=80&fit=crop',
    seller: 'Bright Co',
    category: 'Electronics',
    qty: '0',
    price: '₹899 per/unit',
    stock: 'out',
    vertical: 'gifting',
  },
  {
    id: 'EVT8821001',
    name: 'Annual Townhall — Stage Package',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&h=80&fit=crop',
    seller: 'Fresh Catering Co.',
    category: 'Events',
    qty: '12',
    price: '₹85,000 flat',
    stock: 'available',
    vertical: 'events',
  },
  {
    id: 'EVT8821002',
    name: 'Team Offsite — Day Pass',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=80&h=80&fit=crop',
    seller: 'Northwind',
    category: 'Experiences',
    qty: '500',
    price: '₹1,200 per/person',
    stock: 'available',
    vertical: 'events',
  },
  {
    id: 'EVT8821003',
    name: 'Live band — 5-piece corporate gala',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&h=80&fit=crop',
    seller: 'SoundHouse Entertainment',
    category: 'Live band',
    qty: '8',
    price: 'From ₹85,000 / event',
    stock: 'available',
    vertical: 'events',
  },
  {
    id: 'EVT8821004',
    name: 'Hosted karaoke lounge — 3-hour session',
    image:
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=80&h=80&fit=crop',
    seller: 'Mic Drop Events',
    category: 'Karaoke',
    qty: '24',
    price: '₹45,000 / session',
    stock: 'available',
    vertical: 'events',
  },
  {
    id: 'SPX440021',
    name: 'Meeting Room — BKC 12 Seater',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop',
    seller: 'Smart works',
    category: 'Space',
    qty: '1',
    price: '₹4,500 per/day',
    stock: 'available',
    vertical: 'spacex',
  },
  {
    id: 'SPX440022',
    name: 'Hot Desk — Monthly',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=80&h=80&fit=crop',
    seller: 'Acme Ltd',
    category: 'Coworking',
    qty: '40',
    price: '₹8,999 per/month',
    stock: 'available',
    vertical: 'spacex',
  },
];

export type MockCategoryRow = {
  sr: string;
  categoryLabel: string;
  categoryIcon: 'shop' | 'celebration';
  subLabel: string;
  subIcon: 'shirt' | 'bag';
  items: string[];
  action: 'add' | 'goto';
  vertical: AdminProductLine;
};

export const MOCK_CATEGORY_ROWS: MockCategoryRow[] = [
  {
    sr: '0001',
    categoryLabel: 'Shop',
    categoryIcon: 'shop',
    subLabel: 'Apparel',
    subIcon: 'shirt',
    items: [
      'T-shirt',
      'Hoodies & Pullovers',
      'Outerwear & Fleece',
      'Pants',
      'Sweaters & Blazers',
      'Dress and Work Shirts',
      'Accessories',
    ],
    action: 'add',
    vertical: 'gifting',
  },
  {
    sr: '0002',
    categoryLabel: 'Celebrations',
    categoryIcon: 'celebration',
    subLabel: 'Bags',
    subIcon: 'bag',
    items: ['Sling bags', 'Laptop bags'],
    action: 'goto',
    vertical: 'gifting',
  },
  {
    sr: '0003',
    categoryLabel: 'Venues',
    categoryIcon: 'shop',
    subLabel: 'Conference',
    subIcon: 'shirt',
    items: ['Ballroom A', 'Rooftop deck'],
    action: 'add',
    vertical: 'events',
  },
  {
    sr: '0004',
    categoryLabel: 'Workspaces',
    categoryIcon: 'celebration',
    subLabel: 'Meeting rooms',
    subIcon: 'bag',
    items: ['4 seater', '8 seater', 'Board room'],
    action: 'goto',
    vertical: 'spacex',
  },
];

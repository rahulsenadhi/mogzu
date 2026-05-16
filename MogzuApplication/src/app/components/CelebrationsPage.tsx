import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Search, ChevronDown, Heart, GitCompare, Home, ShoppingBag, Sparkles, PartyPopper, Building2, WandSparkles, Package, CreditCard, MapPin, Gift } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import imgImage24995 from "figma:asset/3fd0634bc82e44a536b4f08060cd6f224c13e9e8.png";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CelebrationProduct {
  id: number;
  name: string;
  occasion: string;
  subcategory: string;
  description: string;
  image: string;
  price: number;
  moq: number;
  eta: string;
  hamperType: string;
  contents: string[];
  branding: string[];
  packaging: string[];
  budget: string;
  delivery: string;
  specs: string[];
  badge?: string;
}

const celebrationProducts: CelebrationProduct[] = [
  // Birthday
  {
    id: 1,
    name: 'Premium Birthday Hamper',
    occasion: 'Birthday',
    subcategory: 'Birthday',
    description: 'Luxurious birthday gift box with gourmet treats and personalized card',
    image: 'https://images.unsplash.com/photo-1698369233438-0743853be7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwaGFtcGVyJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1299,
    moq: 10,
    eta: '2-3 days',
    hamperType: 'Chocolates',
    contents: ['Gourmet Chocolates', 'Premium Cookies', 'Birthday Card', 'Decorative Box'],
    branding: ['Sticker', 'UV Print'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Contains 8 items', 'Premium packaging'],
    badge: 'Bestseller'
  },
  {
    id: 2,
    name: 'Birthday Sweets Box',
    occasion: 'Birthday',
    subcategory: 'Birthday',
    description: 'Traditional sweets hamper perfect for birthday celebrations',
    image: 'https://images.unsplash.com/photo-1684813114206-867e17b5b697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXdhbGklMjBmZXN0aXZhbCUyMGhhbXBlciUyMHN3ZWV0c3xlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 799,
    moq: 20,
    eta: '1 day',
    hamperType: 'Sweets',
    contents: ['Mixed Sweets', 'Dry Fruits', 'Gift Wrap'],
    branding: ['Sticker', 'Sleeve'],
    packaging: ['Standard', 'Kraft'],
    budget: '500-999',
    delivery: '1 day',
    specs: ['1kg sweets', 'Eco-friendly packaging']
  },
  // Anniversary
  {
    id: 3,
    name: 'Romantic Anniversary Hamper',
    occasion: 'Anniversary',
    subcategory: 'Anniversary',
    description: 'Elegant anniversary gift with premium chocolates and wine accessories',
    image: 'https://images.unsplash.com/photo-1641317136698-284db1e10c1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbm5pdmVyc2FyeSUyMGdpZnQlMjBsdXh1cnklMjBoYW1wZXJ8ZW58MXx8fHwxNzcwODM5MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1899,
    moq: 5,
    eta: '2-3 days',
    hamperType: 'Chocolates',
    contents: ['Belgian Chocolates', 'Wine Accessories', 'Scented Candle', 'Anniversary Card'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Premium', 'Wooden'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Luxury packaging', '10 premium items'],
    badge: 'Premium'
  },
  {
    id: 4,
    name: 'Anniversary Celebration Box',
    occasion: 'Anniversary',
    subcategory: 'Anniversary',
    description: 'Complete anniversary celebration kit with decorative items',
    image: 'https://images.unsplash.com/photo-1698369233438-0743853be7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwaGFtcGVyJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1499,
    moq: 10,
    eta: '2-3 days',
    hamperType: 'Office',
    contents: ['Photo Frame', 'Desk Accessories', 'Personalized Mug', 'Gift Card'],
    branding: ['Sticker', 'UV Print'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Customizable', 'Corporate friendly']
  },
  // Welcome Kits
  {
    id: 5,
    name: 'Corporate Welcome Kit',
    occasion: 'Welcome',
    subcategory: 'Welcome Kits',
    description: 'Professional welcome kit for new employees with branded items',
    image: 'https://images.unsplash.com/photo-1769576501201-8d775cc04815?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB3ZWxjb21lJTIwa2l0JTIwZ2lmdHxlbnwxfHx8fDE3NzA4MzkyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 899,
    moq: 50,
    eta: '4-7 days',
    hamperType: 'Office',
    contents: ['Notebook', 'Pen Set', 'Water Bottle', 'Tote Bag', 'Welcome Note'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Standard', 'Kraft'],
    budget: '500-999',
    delivery: '4-7',
    specs: ['Fully branded', '5 office essentials'],
    badge: 'Corporate'
  },
  {
    id: 6,
    name: 'Premium Welcome Hamper',
    occasion: 'Welcome',
    subcategory: 'Welcome Kits',
    description: 'High-end welcome gift with tech accessories and wellness items',
    image: 'https://images.unsplash.com/photo-1769805222413-9422a0027c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJld2VsbCUyMGdpZnQlMjBjb3Jwb3JhdGUlMjBoYW1wZXJ8ZW58MXx8fHwxNzcwODM5Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1599,
    moq: 25,
    eta: '4-7 days',
    hamperType: 'Wellness',
    contents: ['Wireless Earbuds', 'Desk Organizer', 'Green Tea', 'Stress Ball', 'Welcome Card'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Premium', 'Wooden'],
    budget: '1000+',
    delivery: '4-7',
    specs: ['Tech accessories', 'Premium quality']
  },
  // Farewell
  {
    id: 7,
    name: 'Farewell Appreciation Hamper',
    occasion: 'Farewell',
    subcategory: 'Farewell',
    description: 'Thoughtful farewell gift expressing gratitude and best wishes',
    image: 'https://images.unsplash.com/photo-1769805222413-9422a0027c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJld2VsbCUyMGdpZnQlMjBjb3Jwb3JhdGUlMjBoYW1wZXJ8ZW58MXx8fHwxNzcwODM5Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1199,
    moq: 10,
    eta: '2-3 days',
    hamperType: 'Office',
    contents: ['Photo Album', 'Personalized Plaque', 'Gourmet Snacks', 'Farewell Card'],
    branding: ['Laser', 'UV Print'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Personalized', 'Memory keepsake']
  },
  // Diwali
  {
    id: 8,
    name: 'Grand Diwali Hamper',
    occasion: 'Diwali',
    subcategory: 'Diwali',
    description: 'Traditional Diwali hamper with sweets, dry fruits, and diyas',
    image: 'https://images.unsplash.com/photo-1684813114206-867e17b5b697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXdhbGklMjBmZXN0aXZhbCUyMGhhbXBlciUyMHN3ZWV0c3xlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1499,
    moq: 50,
    eta: '4-7 days',
    hamperType: 'Sweets',
    contents: ['Premium Sweets', 'Dry Fruits', 'Decorative Diyas', 'Diwali Card'],
    branding: ['Sticker', 'Sleeve'],
    packaging: ['Premium', 'Kraft'],
    budget: '1000+',
    delivery: '4-7',
    specs: ['Festival special', '2kg hamper'],
    badge: 'Festive'
  },
  {
    id: 9,
    name: 'Corporate Diwali Gift Box',
    occasion: 'Diwali',
    subcategory: 'Diwali',
    description: 'Professional Diwali hamper suitable for corporate gifting',
    image: 'https://images.unsplash.com/photo-1698369233438-0743853be7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwaGFtcGVyJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzA4MzkyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 999,
    moq: 100,
    eta: '4-7 days',
    hamperType: 'Office',
    contents: ['Chocolate Box', 'Dry Fruits', 'Desk Calendar', 'Greeting Card'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Premium'],
    budget: '500-999',
    delivery: '4-7',
    specs: ['Corporate branded', 'Bulk discounts']
  },
  // Christmas
  {
    id: 10,
    name: 'Christmas Joy Hamper',
    occasion: 'Christmas',
    subcategory: 'Christmas',
    description: 'Festive Christmas gift box with chocolates and decorations',
    image: 'https://images.unsplash.com/photo-1698369233438-0743853be7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBnaWZ0JTIwaGFtcGVyJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzcwODM5MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1299,
    moq: 30,
    eta: '2-3 days',
    hamperType: 'Chocolates',
    contents: ['Assorted Chocolates', 'Christmas Ornaments', 'Candy Canes', 'Festive Card'],
    branding: ['Sticker', 'UV Print'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Christmas themed', '10 festive items'],
    badge: 'Festive'
  },
  // New Year
  {
    id: 11,
    name: 'New Year Celebration Box',
    occasion: 'New Year',
    subcategory: 'New Year',
    description: 'Welcome the new year with this exciting celebration hamper',
    image: 'https://images.unsplash.com/photo-1637590957181-8893af2a8344?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5ZWFyJTIwY2VsZWJyYXRpb24lMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc3MDgzOTI3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1199,
    moq: 25,
    eta: '2-3 days',
    hamperType: 'Chocolates',
    contents: ['Premium Chocolates', 'Champagne Flutes', 'Party Poppers', 'New Year Card'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Party essentials', 'Celebration ready']
  },
  // Holi
  {
    id: 12,
    name: 'Colorful Holi Hamper',
    occasion: 'Holi',
    subcategory: 'Holi',
    description: 'Vibrant Holi celebration kit with organic colors and sweets',
    image: 'https://images.unsplash.com/photo-1635792367888-a0719f0b7078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xpJTIwZmVzdGl2YWwlMjBjb2xvcnMlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzA4MzkyNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 699,
    moq: 50,
    eta: '2-3 days',
    hamperType: 'Sweets',
    contents: ['Organic Colors', 'Gujiya', 'Thandai Mix', 'Water Balloons', 'Holi Card'],
    branding: ['Sticker', 'Sleeve'],
    packaging: ['Kraft'],
    budget: '500-999',
    delivery: '2-3',
    specs: ['Eco-friendly colors', 'Complete celebration kit'],
    badge: 'Festive'
  },
  // Eid
  {
    id: 13,
    name: 'Eid Mubarak Hamper',
    occasion: 'Eid',
    subcategory: 'Eid',
    description: 'Traditional Eid gift box with dates, sweets, and prayer items',
    image: 'https://images.unsplash.com/photo-1607940471713-a9376f150a0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWQlMjBjZWxlYnJhdGlvbiUyMGdpZnQlMjBib3h8ZW58MXx8fHwxNzcwODM5Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 899,
    moq: 40,
    eta: '2-3 days',
    hamperType: 'Sweets',
    contents: ['Premium Dates', 'Baklava', 'Sweets', 'Prayer Mat', 'Eid Card'],
    branding: ['Sticker', 'Sleeve'],
    packaging: ['Premium', 'Kraft'],
    budget: '500-999',
    delivery: '2-3',
    specs: ['Traditional items', 'Cultural celebration']
  },
  // Rakhi
  {
    id: 14,
    name: 'Raksha Bandhan Special',
    occasion: 'Rakhi',
    subcategory: 'Rakhi',
    description: 'Complete Rakhi celebration hamper with designer rakhi and sweets',
    image: 'https://images.unsplash.com/photo-1693040529947-20f023bb7f76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWtzaGElMjBiYW5kaGFuJTIwZ2lmdCUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MDgzOTI4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 599,
    moq: 30,
    eta: '1 day',
    hamperType: 'Sweets',
    contents: ['Designer Rakhi', 'Sweets Box', 'Dry Fruits', 'Roli Chawal', 'Greeting Card'],
    branding: ['Sticker'],
    packaging: ['Standard', 'Kraft'],
    budget: '500-999',
    delivery: '1 day',
    specs: ['Traditional design', 'Complete set']
  },
  // Women's Day
  {
    id: 15,
    name: "Women's Day Wellness Hamper",
    occasion: "Women's Day",
    subcategory: "Women's Day",
    description: 'Empowering gift box celebrating women with wellness and self-care items',
    image: 'https://images.unsplash.com/photo-1611673242344-995a4fe8034f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRheSUyMGNlbGVicmF0aW9uJTIwZ2lmdHxlbnwxfHx8fDE3NzA4MzkyNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1399,
    moq: 20,
    eta: '2-3 days',
    hamperType: 'Wellness',
    contents: ['Aromatherapy Candle', 'Tea Collection', 'Face Mask', 'Journal', 'Empowerment Card'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '2-3',
    specs: ['Self-care items', 'Wellness focused']
  },
  // Valentine's Day
  {
    id: 16,
    name: "Valentine's Chocolate Box",
    occasion: "Valentine's Day",
    subcategory: "Valentine's Day",
    description: 'Romantic Valentine gift with premium chocolates and roses',
    image: 'https://images.unsplash.com/photo-1629610306962-a8aa73153d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWxlbnRpbmUlMjBkYXklMjBjaG9jb2xhdGUlMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc3MDgzOTI3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 999,
    moq: 15,
    eta: '1 day',
    hamperType: 'Chocolates',
    contents: ['Belgian Chocolates', 'Preserved Rose', 'Love Note', 'Gift Box'],
    branding: ['Sticker', 'UV Print'],
    packaging: ['Premium'],
    budget: '500-999',
    delivery: '1 day',
    specs: ['Romantic packaging', '12 chocolate pieces'],
    badge: 'Romantic'
  },
  // Recognition & Awards
  {
    id: 17,
    name: 'Achievement Recognition Hamper',
    occasion: 'Recognition',
    subcategory: 'Recognition & Awards',
    description: 'Premium recognition gift for employee achievements and awards',
    image: 'https://images.unsplash.com/photo-1708014116024-bfd31805142d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNvZ25pdGlvbiUyMGF3YXJkJTIwdHJvcGh5JTIwZ2lmdHxlbnwxfHx8fDE3NzA4MzkyODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1799,
    moq: 10,
    eta: '4-7 days',
    hamperType: 'Office',
    contents: ['Crystal Trophy', 'Certificate Frame', 'Premium Pen', 'Achievement Card'],
    branding: ['Laser', 'UV Print'],
    packaging: ['Premium', 'Wooden'],
    budget: '1000+',
    delivery: '4-7',
    specs: ['Personalized trophy', 'Professional gift']
  },
  // Year-End
  {
    id: 18,
    name: 'Year-End Appreciation Box',
    occasion: 'Year-End',
    subcategory: 'Year-End',
    description: 'Corporate year-end gift expressing gratitude to employees',
    image: 'https://images.unsplash.com/photo-1733978281127-c01eb45c8b10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZWFyJTIwZW5kJTIwY29ycG9yYXRlJTIwZ2lmdCUyMGhhbXBlcnxlbnwxfHx8fDE3NzA4MzkyODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1599,
    moq: 50,
    eta: '4-7 days',
    hamperType: 'Office',
    contents: ['Planner 2025', 'Premium Snacks', 'Coffee Mug', 'Thank You Note', 'Desk Accessories'],
    branding: ['UV Print', 'Laser'],
    packaging: ['Premium'],
    budget: '1000+',
    delivery: '4-7',
    specs: ['Corporate gift', 'Bulk available']
  },
  // Custom Hampers
  {
    id: 19,
    name: 'Custom Luxury Hamper',
    occasion: 'Custom',
    subcategory: 'Custom Hampers',
    description: 'Fully customizable luxury hamper with your choice of items',
    image: 'https://images.unsplash.com/photo-1641317136698-284db1e10c1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbm5pdmVyc2FyeSUyMGdpZnQlMjBsdXh1cnklMjBoYW1wZXJ8ZW58MXx8fHwxNzcwODM5MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 2499,
    moq: 10,
    eta: '4-7 days',
    hamperType: 'Office',
    contents: ['Choose Your Items', 'Custom Branding', 'Premium Packaging'],
    branding: ['Sticker', 'Sleeve', 'UV Print', 'Laser'],
    packaging: ['Standard', 'Kraft', 'Premium', 'Wooden'],
    budget: '1000+',
    delivery: '4-7',
    specs: ['Fully customizable', 'No minimum on items'],
    badge: 'Custom'
  },
  {
    id: 20,
    name: 'Build Your Own Hamper',
    occasion: 'Custom',
    subcategory: 'Custom Hampers',
    description: 'Create a personalized hamper from our curated selection',
    image: 'https://images.unsplash.com/photo-1769576501201-8d775cc04815?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB3ZWxjb21lJTIwa2l0JTIwZ2lmdHxlbnwxfHx8fDE3NzA4MzkyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1999,
    moq: 15,
    eta: '4-7 days',
    hamperType: 'Wellness',
    contents: ['Customizable Contents', 'Your Brand Logo', 'Choose Packaging'],
    branding: ['Sticker', 'Sleeve', 'UV Print', 'Laser'],
    packaging: ['Standard', 'Kraft', 'Premium', 'Wooden'],
    budget: '1000+',
    delivery: '4-7',
    specs: ['Personalized selection', 'Flexible options']
  }
];

export default function CelebrationsPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { preselectedOccasion?: string } };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState('festivals');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [topOccasionFilter, setTopOccasionFilter] = useState('all');
  const [topHamperTypeFilter, setTopHamperTypeFilter] = useState('all');
  const [topDeliveryFilter, setTopDeliveryFilter] = useState('all');
  const [canonicalBudgetMin, setCanonicalBudgetMin] = useState('');
  const [canonicalBudgetMax, setCanonicalBudgetMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low_high' | 'price_high_low' | 'newest'>('recommended');
  const [selectedFilters, setSelectedFilters] = useState({
    occasion: [] as string[],
    hamperType: [] as string[],
    branding: [] as string[],
    packaging: [] as string[],
    budget: [] as string[],
    delivery: [] as string[]
  });
  const [gridUiNotice, setGridUiNotice] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    occasion: true,
    hamperType: true,
    branding: true,
    packaging: true,
    budget: true,
    delivery: true
  });

  const subcategories = [
    'All',
    'Birthday',
    'Anniversary',
    'Welcome Kits',
    'Farewell',
    'Diwali',
    'Christmas',
    'New Year',
    'Holi',
    'Eid',
    'Rakhi',
    "Women's Day",
    "Valentine's Day",
    'Recognition & Awards',
    'Year-End',
    'Custom Hampers'
  ];

  const categoryScopedProducts = useMemo(() => {
    const mainCategorySubcats = getMainCategorySubcategories(selectedMainCategory)
    let scoped = celebrationProducts.filter((product) => mainCategorySubcats.includes(product.subcategory))

    if (selectedSubcategory !== 'All') {
      scoped = scoped.filter((product) => product.subcategory === selectedSubcategory)
    }

    return scoped
  }, [selectedMainCategory, selectedSubcategory])

  const filterOptions = useMemo(() => {
    const uniqueSorted = (values: string[]) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))

    return {
      occasion: uniqueSorted(categoryScopedProducts.map((product) => product.occasion)),
      hamperType: uniqueSorted(categoryScopedProducts.map((product) => product.hamperType)),
      branding: uniqueSorted(categoryScopedProducts.flatMap((product) => product.branding)),
      packaging: uniqueSorted(categoryScopedProducts.flatMap((product) => product.packaging)),
      budget: uniqueSorted(categoryScopedProducts.map((product) => product.budget)),
      delivery: uniqueSorted(categoryScopedProducts.map((product) => product.delivery)),
    }
  }, [categoryScopedProducts])

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      occasion: [],
      hamperType: [],
      branding: [],
      packaging: [],
      budget: [],
      delivery: []
    });
    setSearchQuery('')
    setSortBy('recommended')
    setSelectedSubcategory('All')
    setTopOccasionFilter('all')
    setTopHamperTypeFilter('all')
    setTopDeliveryFilter('all')
    setCanonicalBudgetMin('')
    setCanonicalBudgetMax('')
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  function getMainCategorySubcategories(mainCat: string) {
    const categoryMap: Record<string, string[]> = {
      festivals: ['Diwali', 'Christmas', 'New Year', 'Holi', 'Eid', 'Rakhi'],
      personal: ['Birthday', 'Anniversary', "Women's Day", "Valentine's Day"],
      corporate: ['Welcome Kits', 'Farewell', 'Recognition & Awards', 'Year-End'],
      custom: ['Custom Hampers']
    };
    return categoryMap[mainCat] || [];
  }

  const getSubcategoryTone = (subcategory: string) => {
    const toneMap: Record<string, { bgColor: string; textColor: string; activeBg: string; activeText: string }> = {
      Diwali: { bgColor: '#fce7f3', textColor: '#9f1239', activeBg: '#e11d48', activeText: '#ffffff' },
      Christmas: { bgColor: '#cffafe', textColor: '#0e7490', activeBg: '#0891b2', activeText: '#ffffff' },
      'New Year': { bgColor: '#fef3c7', textColor: '#92400e', activeBg: '#d97706', activeText: '#ffffff' },
      Holi: { bgColor: '#d9f99d', textColor: '#65a30d', activeBg: '#84cc16', activeText: '#ffffff' },
      Eid: { bgColor: '#e0e7ff', textColor: '#4338ca', activeBg: '#6366f1', activeText: '#ffffff' },
      Rakhi: { bgColor: '#fbcfe8', textColor: '#9f1239', activeBg: '#ec4899', activeText: '#ffffff' },
      Birthday: { bgColor: '#dbeafe', textColor: '#1e40af', activeBg: '#2563eb', activeText: '#ffffff' },
      Anniversary: { bgColor: '#e9d5ff', textColor: '#6b21a8', activeBg: '#9333ea', activeText: '#ffffff' },
      "Women's Day": { bgColor: '#ede9fe', textColor: '#7c3aed', activeBg: '#8b5cf6', activeText: '#ffffff' },
      "Valentine's Day": { bgColor: '#fecaca', textColor: '#991b1b', activeBg: '#dc2626', activeText: '#ffffff' },
      'Welcome Kits': { bgColor: '#fed7aa', textColor: '#c2410c', activeBg: '#ea580c', activeText: '#ffffff' },
      Farewell: { bgColor: '#d1fae5', textColor: '#065f46', activeBg: '#059669', activeText: '#ffffff' },
      'Recognition & Awards': { bgColor: '#d1fae5', textColor: '#065f46', activeBg: '#10b981', activeText: '#ffffff' },
      'Year-End': { bgColor: '#cffafe', textColor: '#0e7490', activeBg: '#06b6d4', activeText: '#ffffff' },
      'Custom Hampers': { bgColor: '#fef3c7', textColor: '#ca8a04', activeBg: '#eab308', activeText: '#ffffff' },
    }
    return toneMap[subcategory] || { bgColor: '#e5e7eb', textColor: '#475569', activeBg: '#2563eb', activeText: '#ffffff' }
  }

  const filteredProducts = useMemo(() => {
    let filtered = categoryScopedProducts

    // Apply filters
    if (topOccasionFilter !== 'all') {
      filtered = filtered.filter((p) => p.occasion === topOccasionFilter)
    }
    if (topHamperTypeFilter !== 'all') {
      filtered = filtered.filter((p) => p.hamperType === topHamperTypeFilter)
    }
    if (topDeliveryFilter !== 'all') {
      filtered = filtered.filter((p) => p.delivery === topDeliveryFilter)
    }
    if (canonicalBudgetMin) {
      filtered = filtered.filter((p) => p.price >= Number(canonicalBudgetMin))
    }
    if (canonicalBudgetMax) {
      filtered = filtered.filter((p) => p.price <= Number(canonicalBudgetMax))
    }

    if (selectedFilters.occasion.length > 0) {
      filtered = filtered.filter(p => selectedFilters.occasion.includes(p.occasion));
    }
    if (selectedFilters.hamperType.length > 0) {
      filtered = filtered.filter(p => selectedFilters.hamperType.includes(p.hamperType));
    }
    if (selectedFilters.branding.length > 0) {
      filtered = filtered.filter(p =>
        p.branding.some(b => selectedFilters.branding.includes(b))
      );
    }
    if (selectedFilters.packaging.length > 0) {
      filtered = filtered.filter(p =>
        p.packaging.some(pkg => selectedFilters.packaging.includes(pkg))
      );
    }
    if (selectedFilters.budget.length > 0) {
      filtered = filtered.filter(p => selectedFilters.budget.includes(p.budget));
    }
    if (selectedFilters.delivery.length > 0) {
      filtered = filtered.filter(p => selectedFilters.delivery.includes(p.delivery));
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery) ||
        p.occasion.toLowerCase().includes(normalizedQuery) ||
        p.subcategory.toLowerCase().includes(normalizedQuery)
      );
    }

    if (sortBy === 'price_low_high') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high_low') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [canonicalBudgetMax, canonicalBudgetMin, categoryScopedProducts, selectedFilters, searchQuery, sortBy, topDeliveryFilter, topHamperTypeFilter, topOccasionFilter]);

  const getCelebrationSlideImages = (product: CelebrationProduct): string[] => {
    return Array.from(new Set([product.image, imgImage24995].filter(Boolean)))
  }

  const goToPrevCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      const next = (current - 1 + total) % total
      return { ...prev, [cardId]: next }
    })
  }

  const goToNextCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      const next = (current + 1) % total
      return { ...prev, [cardId]: next }
    })
  }

  useEffect(() => {
    setSelectedFilters((prev) => ({
      occasion: prev.occasion.filter((value) => filterOptions.occasion.includes(value)),
      hamperType: prev.hamperType.filter((value) => filterOptions.hamperType.includes(value)),
      branding: prev.branding.filter((value) => filterOptions.branding.includes(value)),
      packaging: prev.packaging.filter((value) => filterOptions.packaging.includes(value)),
      budget: prev.budget.filter((value) => filterOptions.budget.includes(value)),
      delivery: prev.delivery.filter((value) => filterOptions.delivery.includes(value)),
    }))
  }, [filterOptions])

  const activeFilterLabels = [
    searchQuery.trim() ? `Search: ${searchQuery.trim()}` : null,
    selectedSubcategory !== 'All' ? `Subcategory: ${selectedSubcategory}` : null,
    sortBy !== 'recommended' ? `Sort: ${sortBy}` : null,
    topOccasionFilter !== 'all' ? `Top Occasion: ${topOccasionFilter}` : null,
    topHamperTypeFilter !== 'all' ? `Top Type: ${topHamperTypeFilter}` : null,
    topDeliveryFilter !== 'all' ? `Top Delivery: ${topDeliveryFilter}` : null,
    canonicalBudgetMin ? `Budget min: ₹${canonicalBudgetMin}` : null,
    canonicalBudgetMax ? `Budget max: ₹${canonicalBudgetMax}` : null,
    ...selectedFilters.occasion.map((value) => `Occasion: ${value}`),
    ...selectedFilters.hamperType.map((value) => `Type: ${value}`),
    ...selectedFilters.branding.map((value) => `Branding: ${value}`),
    ...selectedFilters.packaging.map((value) => `Packaging: ${value}`),
    ...selectedFilters.budget.map((value) => `Budget: ${value}`),
    ...selectedFilters.delivery.map((value) => `Delivery: ${value}`),
  ].filter(Boolean) as string[]

  // Apply preselected occasion coming from Gifting/celebrations CTAs
  useEffect(() => {
    const occasion = location.state?.preselectedOccasion;
    if (!occasion) return;

    // Map incoming occasion labels to main category + subcategory
    let main = selectedMainCategory;
    let sub = selectedSubcategory;

    const o = occasion.toLowerCase();

    if (o.includes('diwali')) {
      main = 'festivals';
      sub = 'Diwali';
    } else if (o.includes('christmas')) {
      main = 'festivals';
      sub = 'Christmas';
    } else if (o.includes('new year')) {
      main = 'festivals';
      sub = 'New Year';
    } else if (o.includes('eid')) {
      main = 'festivals';
      sub = 'Eid';
    } else if (o.includes('holi')) {
      main = 'festivals';
      sub = 'Holi';
    } else if (o.includes('birthday')) {
      main = 'personal';
      sub = 'Birthday';
    } else if (o.includes('anniversary')) {
      main = 'personal';
      sub = 'Anniversary';
    } else if (o.includes('welcome')) {
      main = 'corporate';
      sub = 'Welcome Kits';
    } else if (o.includes('farewell') || o.includes('retirement')) {
      main = 'corporate';
      sub = 'Farewell';
    } else if (o.includes('recognition')) {
      main = 'corporate';
      sub = 'Recognition & Awards';
    } else if (o.includes('year-end') || o.includes('year end')) {
      main = 'corporate';
      sub = 'Year-End';
    } else if (o.includes('custom')) {
      main = 'custom';
      sub = 'Custom Hampers';
    }

    setSelectedMainCategory(main);
    setSelectedSubcategory(sub);
  }, [location.state, selectedMainCategory, selectedSubcategory]);

  return (
    <div className="flex h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="celebrations"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search celebrations" />

        {/* Page Content */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb + tabs — transparent strip over scroll backdrop */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-2 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button onClick={() => navigate('/dashboard')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">
                  Dashboard
                </button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <button onClick={() => navigate('/gifting')} className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors">
                  Gifting
                </button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <span className="text-[#0e1e3f] font-semibold tracking-tight">Celebrations</span>
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
                    Home
                  </button>

                  <button
                    onClick={() => navigate('/gifting/shop')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#4f46e5]" />
                    Shop
                  </button>

                  <button
                    type="button"
                    aria-current="page"
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-semibold transition-all duration-200 border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]"
                    style={{
                      backgroundImage:
                        'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                    }}
                  >
                    <PartyPopper className="w-5 h-5 text-[#FF5E00]" />
                    Celebrations
                  </button>

                  <button
                    onClick={() => navigate('/gifting/combo')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Package className="w-5 h-5 text-[#0ea5e9]" />
                    Combo
                  </button>

                  <button
                    onClick={() => navigate('/gifting/e-gift')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <CreditCard className="w-5 h-5 text-[#9B51E0]" />
                    E-gift
                  </button>

                  <button
                    onClick={() => navigate('/gifting/go-local')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <MapPin className="w-5 h-5 text-[#15D39D]" />
                    Go-local
                  </button>

                  <button
                    onClick={() => navigate('/gifting/baskets')}
                    className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Gift className="w-5 h-5 text-[#d4a000]" />
                    Baskets
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Carousel */}
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className="group relative overflow-hidden rounded-3xl border border-white/60 h-[200px] mb-3 bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(37,99,235,0.18)]">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
              <div className="relative flex h-[200px]">
                <div className="w-[55%] px-8 py-6 flex flex-col justify-center">
                  <div className="inline-flex items-center rounded-full bg-[#ebf1ff] text-[#475569] px-2.5 py-1 text-[12px] font-medium mb-3 w-fit">
                    ⭐ Featured Celebration Offers
                  </div>
                  <h3 className="text-[24px] font-bold text-[#0e1e3f] leading-tight line-clamp-2">
                    Special Festival Hampers - Up to 30% Off
                  </h3>
                  <p className="text-[14px] text-[#64748b] leading-[1.6] mt-2 mb-5 max-w-[380px]">
                    Celebrate every occasion with curated celebration hampers crafted for teams, clients, and milestone moments.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/gifting/shop')}
                    className="h-11 px-6 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[14px] font-semibold shadow-[0_10px_22px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:scale-[0.98] transition-all w-fit"
                  >
                    View offers
                  </button>
                </div>
                <div className="w-[45%] relative overflow-hidden">
                  <img src={imgImage24995} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-2 overflow-x-auto overflow-y-visible py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => {
                  setSelectedMainCategory('festivals');
                  setSelectedSubcategory('All');
                }}
                className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all whitespace-nowrap border-[1.5px] ${
                  selectedMainCategory === 'festivals'
                    ? 'font-semibold border-[#2563eb] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)] text-[#0e1e3f]'
                    : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
                style={
                  selectedMainCategory === 'festivals'
                    ? {
                        backgroundImage:
                          'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                      }
                    : {}
                }
              >
                <span className="text-[14px] leading-none" aria-hidden>🪔</span>
                Festivals
              </button>
              <button
                onClick={() => {
                  setSelectedMainCategory('personal');
                  setSelectedSubcategory('All');
                }}
                className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all whitespace-nowrap border-[1.5px] ${
                  selectedMainCategory === 'personal'
                    ? 'font-semibold border-[#2563eb] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)] text-[#0e1e3f]'
                    : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
                style={
                  selectedMainCategory === 'personal'
                    ? {
                        backgroundImage:
                          'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                      }
                    : {}
                }
              >
                <Heart className="w-4 h-4 text-[#9B51E0]" />
                Personal
              </button>
              <button
                onClick={() => {
                  setSelectedMainCategory('corporate');
                  setSelectedSubcategory('All');
                }}
                className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all whitespace-nowrap border-[1.5px] ${
                  selectedMainCategory === 'corporate'
                    ? 'font-semibold border-[#2563eb] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)] text-[#0e1e3f]'
                    : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
                style={
                  selectedMainCategory === 'corporate'
                    ? {
                        backgroundImage:
                          'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                      }
                    : {}
                }
              >
                <Building2 className="w-4 h-4 text-[#0ea5e9]" />
                Corporate
              </button>
              <button
                onClick={() => {
                  setSelectedMainCategory('custom');
                  setSelectedSubcategory('All');
                }}
                className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all whitespace-nowrap border-[1.5px] ${
                  selectedMainCategory === 'custom'
                    ? 'font-semibold border-[#2563eb] shadow-[1px_2px_6px_0px_rgba(0,0,0,0.16)] text-[#0e1e3f]'
                    : 'font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
                style={
                  selectedMainCategory === 'custom'
                    ? {
                        backgroundImage:
                          'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
                      }
                    : {}
                }
              >
                <WandSparkles className="w-4 h-4 text-[#d4a000]" />
                Custom
              </button>
            </div>
          </div>

          {/* Subcategories - Horizontal Scrollable */}
          <div className="max-w-7xl mx-auto px-6 pb-6">
            <div className="mb-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => setSelectedSubcategory('All')}
                  className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border ${
                    selectedSubcategory === 'All'
                      ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-md'
                      : 'bg-white border-[#e5e7eb] text-[#475569] hover:border-[#4379ee] hover:text-[#4379ee]'
                  }`}
                >
                  All {selectedMainCategory.charAt(0).toUpperCase() + selectedMainCategory.slice(1)}
                </button>
                {getMainCategorySubcategories(selectedMainCategory).map((subcategory) => {
                  const tone = getSubcategoryTone(subcategory)
                  const isActive = selectedSubcategory === subcategory

                  return (
                    <button
                      key={subcategory}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className="h-8 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap border shadow-sm"
                      style={{
                        backgroundColor: isActive ? tone.activeBg : tone.bgColor,
                        borderColor: isActive ? tone.activeBg : tone.bgColor,
                        color: isActive ? tone.activeText : tone.textColor,
                      }}
                    >
                      {subcategory}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex gap-4">
              {/* Filters Sidebar - Always Visible */}
              <aside className="w-[240px] flex-shrink-0">
                <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-semibold text-[#0e1e3f]">Filters</h3>
                    <button
                      onClick={clearAllFilters}
                      className="text-[13px] font-medium text-[#4379ee] underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Occasion Filter */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleSection('occasion')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Occasion</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.occasion ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.occasion && (
                        <div className="space-y-2">
                          {filterOptions.occasion.map(option => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFilters.occasion.includes(option)}
                                onChange={() => toggleFilter('occasion', option)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                              />
                              <span className="text-sm text-[#475569]">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hamper Type Filter */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleSection('hamperType')}
                        className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                      >
                        <span>Hamper Type</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.hamperType ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.hamperType && (
                        <div className="space-y-2">
                          {filterOptions.hamperType.map(option => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFilters.hamperType.includes(option)}
                                onChange={() => toggleFilter('hamperType', option)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                              />
                              <span className="text-sm text-[#475569]">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {showAdvancedFilters && (
                      <>
                        {/* Branding Filter */}
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSection('branding')}
                            className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                          >
                            <span>Branding</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.branding ? '' : '-rotate-90'}`} />
                          </button>
                          {expandedSections.branding && (
                            <div className="space-y-2">
                              {filterOptions.branding.map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters.branding.includes(option)}
                                    onChange={() => toggleFilter('branding', option)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-sm text-[#475569]">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Packaging Filter */}
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSection('packaging')}
                            className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                          >
                            <span>Packaging</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.packaging ? '' : '-rotate-90'}`} />
                          </button>
                          {expandedSections.packaging && (
                            <div className="space-y-2">
                              {filterOptions.packaging.map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters.packaging.includes(option)}
                                    onChange={() => toggleFilter('packaging', option)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-sm text-[#475569]">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Budget Filter */}
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSection('budget')}
                            className="w-full flex items-center justify-between text-sm font-medium text-[#0e1e3f] mb-2"
                          >
                            <span>Budget</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.budget ? '' : '-rotate-90'}`} />
                          </button>
                          {expandedSections.budget && (
                            <div className="space-y-2">
                              {filterOptions.budget.map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters.budget.includes(option)}
                                    onChange={() => toggleFilter('budget', option)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-sm text-[#475569]">₹{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delivery Filter */}
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
                              {filterOptions.delivery.map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters.delivery.includes(option)}
                                    onChange={() => toggleFilter('delivery', option)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-sm text-[#475569]">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="mt-4 rounded-xl border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] text-[#475569]">
                    Filters apply instantly as you select options
                  </p>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1 min-w-0">
                {gridUiNotice ? (
                  <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    {gridUiNotice}
                  </p>
                ) : null}
                {/* Results Header */}
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="relative w-full md:w-96">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search celebrations, occasions, hampers..."
                      className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
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

                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
                <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <select
                    value={selectedMainCategory}
                    onChange={(e) => {
                      setSelectedMainCategory(e.target.value)
                      setSelectedSubcategory('All')
                    }}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="festivals">Category: Festivals</option>
                    <option value="personal">Category: Personal</option>
                    <option value="corporate">Category: Corporate</option>
                    <option value="custom">Category: Custom</option>
                  </select>
                  <select
                    value={topOccasionFilter}
                    onChange={(e) => setTopOccasionFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Occasion: All</option>
                    {filterOptions.occasion.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="price_low_high">Sort: Price Low-High</option>
                    <option value="price_high_low">Sort: Price High-Low</option>
                    <option value="newest">Sort: Newest</option>
                  </select>
                </div>
                {showAdvancedFilters && (
                  <>
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                    <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                      <select
                        value={topHamperTypeFilter}
                        onChange={(e) => setTopHamperTypeFilter(e.target.value)}
                        className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                      >
                        <option value="all">Hamper Type: All</option>
                        {filterOptions.hamperType.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <select
                        value={topDeliveryFilter}
                        onChange={(e) => setTopDeliveryFilter(e.target.value)}
                        className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                      >
                        <option value="all">Delivery: Any</option>
                        {filterOptions.delivery.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
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

                <div className="mb-3">
                  <p className="text-[13px] text-[#878e9e]">
                    Showing {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
                  </p>
                </div>
                {activeFilterLabels.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {activeFilterLabels.map((label) => (
                      <span key={label} className="h-7 inline-flex items-center px-3 text-[12px] bg-white border border-[#d1d5db] rounded-md text-[#475569]">
                        {label}
                      </span>
                    ))}
                    <button onClick={clearAllFilters} className="h-7 inline-flex items-center px-3 text-[12px] rounded-md border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]">
                      Clear filters
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{filteredProducts.map(product => {
                    const slideImages = getCelebrationSlideImages(product)
                    const imageIndex = cardImageIndexById[String(product.id)] ?? 0
                    const activeImage = slideImages[imageIndex] ?? product.image

                    return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/celebrations/${product.id}`)}
                      className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden shadow-[0_10px_30px_rgba(37,99,235,0.14)] hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] hover:border-[#93c5fd] transition-all duration-300 cursor-pointer group motion-safe:hover:-translate-y-1 motion-reduce:transform-none h-full flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative h-52 bg-[#f1f5f9] overflow-hidden">
                        <ImageWithFallback
                          src={activeImage}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.badge && (
                          <div className="absolute top-3 left-3 bg-[#ff6b35] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                            {product.badge}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGridUiNotice(`Wishlist for "${product.name}" will be available in a future release.`);
                            }}
                            className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0]"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGridUiNotice(`Compare for "${product.name}" will be available in a future release.`);
                            }}
                            className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all shadow border border-[#e2e8f0]"
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-[#4379ee] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                            {product.occasion}
                          </span>
                        </div>
                        {slideImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                goToPrevCardImage(String(product.id), slideImages.length)
                              }}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-[2] w-7 h-7 rounded-full bg-white/90 border border-[#dbe3f2] text-[#334155] text-sm font-bold shadow-sm hover:bg-white transition-colors"
                              aria-label={`Previous image for ${product.name}`}
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                goToNextCardImage(String(product.id), slideImages.length)
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-[2] w-7 h-7 rounded-full bg-white/90 border border-[#dbe3f2] text-[#334155] text-sm font-bold shadow-sm hover:bg-white transition-colors"
                              aria-label={`Next image for ${product.name}`}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3 flex-1 flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#878e9e] mb-1 truncate">{product.occasion}</p>
                        <h3 className="text-sm font-semibold text-[#0e1e3f] mb-1 line-clamp-2 min-h-[36px]">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#878e9e] mb-2 line-clamp-2 min-h-[28px]">
                          {product.description}
                        </p>
                        
                        {/* MOQ Highlight */}
                        <div className="rounded-xl border border-[#bfdbfe] bg-[linear-gradient(90deg,rgba(239,246,255,0.9),rgba(219,234,254,0.85))] p-2.5 mb-3 shadow-[0_4px_14px_rgba(37,99,235,0.10)]">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563eb] mb-1">MOQ</p>
                          <p className="text-[12px] text-[#334155]">
                            Minimum order quantity: <span className="font-bold text-[#0e1e3f]">{product.moq} pieces</span>
                          </p>
                        </div>

                        {/* Pricing Section */}
                        <div className="mt-auto pt-2.5 border-t border-[#ececec] flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b] mb-1">Starting at</p>
                            <p className="text-[22px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">Rs {product.price}</p>
                            <p className="text-[10px] text-[#64748b] mt-1">per piece</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/celebrations/${product.id}`)
                            }}
                            className="px-4 py-2 bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-xs font-semibold rounded-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.24)]"
                          >
                            Enquire Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-2xl border border-[#e2e8f0]">
                    <div className="w-20 h-20 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                    </div>
                    <p className="text-[#64748b] mb-6 text-lg font-medium">No items found</p>
                    <button
                      onClick={clearAllFilters}
                      className="px-8 py-3 bg-[#4379ee] text-white rounded-xl font-semibold hover:bg-[#3568dd] transition-colors shadow-md"
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
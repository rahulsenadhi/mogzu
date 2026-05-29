// Comprehensive Apparel Product Database for all 7 subcategories

export interface Product {
  id: number;
  /** Supabase listing UUID when surfaced from corporate-approved partner catalogue */
  mogzuListingId?: string;
  name: string;
  category: string;
  subcategory: string;
  type: string;
  brand: string;
  price: number;
  image: string;
  images: string[]; // Multiple images per product
  rating: number;
  reviews: number;
  description: string;
  fabric: string;
  gsm: number;
  fit: string;
  colors: string[];
  sizes: string[];
  moq: number;
  delivery: string;
  branding: string[];
  gender: string;
  discount?: number;
  bestSeller?: boolean;
  relatedProducts?: number[]; // IDs of related products
}

export const apparelProducts: Product[] = [
  // T-SHIRTS - Round Neck
  {
    id: 1,
    name: "Premium Round Neck Corporate T-Shirt",
    category: "T-Shirts",
    subcategory: "tshirts",
    type: "Round Neck",
    brand: "Adidas",
    price: 350,
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3VuZCUyMG5lY2slMjB0c2hpcnQlMjBwbGFpbnxlbnwxfHx8fDE3NzA2NTkzMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3VuZCUyMG5lY2slMjB0c2hpcnQlMjBwbGFpbnxlbnwxfHx8fDE3NzA2NTkzMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1739001411231-4fc0f4140259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0LXNoaXJ0JTIwbW9ja3VwfGVufDF8fHx8MTc3MDY1OTMxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.7,
    reviews: 234,
    description: "High-quality cotton round neck t-shirt perfect for corporate branding. Soft, breathable fabric with reinforced stitching.",
    fabric: "Cotton",
    gsm: 180,
    fit: "Regular",
    colors: ["black", "white", "grey", "navy", "maroon"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    moq: 25,
    delivery: "7-10 days",
    branding: ["Print", "Embroidery", "DTF"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [2, 3, 8],
  },
  // T-SHIRTS - Polo
  {
    id: 2,
    name: "Classic Business Polo Shirt with Logo",
    category: "T-Shirts",
    subcategory: "tshirts",
    type: "Polo",
    brand: "Puma",
    price: 550,
    image: "https://images.unsplash.com/photo-1763771444795-85740205e3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBvbG8lMjBzaGlydCUyMGFwcGFyZWx8ZW58MXx8fHwxNzcwNjU5MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1763771444795-85740205e3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBvbG8lMjBzaGlydCUyMGFwcGFyZWx8ZW58MXx8fHwxNzcwNjU5MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1704138161405-b4164c58f213?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwb2xvJTIwc2hpcnQlMjBhcHBhcmVsfGVufDF8fHx8MTc3MDYzODEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.8,
    reviews: 189,
    description: "Premium polo shirt with collar and button placket. Ideal for corporate events and team uniforms.",
    fabric: "Poly-Cotton",
    gsm: 200,
    fit: "Slim",
    colors: ["black", "white", "blue", "grey"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    moq: 20,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print", "Patch"],
    gender: "Men",
    discount: 15,
    relatedProducts: [1, 11, 14],
  },
  // T-SHIRTS - Full Sleeve
  {
    id: 3,
    name: "Full Sleeve Corporate T-Shirt",
    category: "T-Shirts",
    subcategory: "tshirts",
    type: "Full Sleeve",
    brand: "Nike",
    price: 450,
    image: "https://images.unsplash.com/photo-1618591552964-837a5a315fb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25nJTIwc2xlZXZlJTIwc2hpcnQlMjBjb3Jwb3JhdGV8ZW58MXx8fHwxNzcwNjU5MzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1618591552964-837a5a315fb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25nJTIwc2xlZXZlJTIwc2hpcnQlMjBjb3Jwb3JhdGV8ZW58MXx8fHwxNzcwNjU5MzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.6,
    reviews: 156,
    description: "Comfortable full sleeve t-shirt with custom branding options. Perfect for cooler weather corporate events.",
    fabric: "Cotton",
    gsm: 180,
    fit: "Regular",
    colors: ["black", "navy", "grey", "white"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 25,
    delivery: "7-10 days",
    branding: ["Print", "Embroidery"],
    gender: "Unisex",
    relatedProducts: [1, 4, 5],
  },
  // T-SHIRTS - Dry-Fit
  {
    id: 4,
    name: "Performance Dry-Fit T-Shirt",
    category: "T-Shirts",
    subcategory: "tshirts",
    type: "Dry-Fit",
    brand: "Reebok",
    price: 480,
    image: "https://images.unsplash.com/photo-1564316800929-be17a69d6966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB0c2hpcnQlMjBhcHBhcmVsfGVufDF8fHx8MTc3MDYzODEyNnww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1564316800929-be17a69d6966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB0c2hpcnQlMjBhcHBhcmVsfGVufDF8fHx8MTc3MDYzODEyNnww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.9,
    reviews: 312,
    description: "Moisture-wicking dry-fit technology for active corporate teams. Lightweight and quick-drying.",
    fabric: "Dry-Fit",
    gsm: 140,
    fit: "Regular",
    colors: ["black", "blue", "red", "grey", "white"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    moq: 30,
    delivery: "7-10 days",
    branding: ["Sublimation", "DTF", "Print"],
    gender: "Unisex",
    bestSeller: true,
    discount: 10,
    relatedProducts: [1, 5, 6],
  },

  // HOODIES - Pullover
  {
    id: 5,
    name: "Classic Pullover Hoodie",
    category: "Hoodies",
    subcategory: "hoodies",
    type: "Pullover",
    brand: "Adidas",
    price: 950,
    image: "https://images.unsplash.com/photo-1552738352-a077028e482c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWxsb3ZlciUyMHN3ZWF0c2hpcnQlMjBjYXN1YWx8ZW58MXx8fHwxNzcwNjU5MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1552738352-a077028e482c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWxsb3ZlciUyMHN3ZWF0c2hpcnQlMjBjYXN1YWx8ZW58MXx8fHwxNzcwNjU5MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.7,
    reviews: 201,
    description: "Cozy pullover hoodie with kangaroo pocket. Perfect for team building events and casual corporate wear.",
    fabric: "Fleece",
    gsm: 280,
    fit: "Regular",
    colors: ["black", "grey", "navy", "maroon"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    moq: 15,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print", "Patch"],
    gender: "Unisex",
    relatedProducts: [6, 7, 8],
  },
  // HOODIES - Zipper
  {
    id: 6,
    name: "Premium Zipper Hoodie",
    category: "Hoodies",
    subcategory: "hoodies",
    type: "Zipper",
    brand: "Nike",
    price: 1050,
    image: "https://images.unsplash.com/photo-1746186237160-671e8d6d2a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6aXBwZXIlMjBob29kaWUlMjBhdGhsZXRpY3xlbnwxfHx8fDE3NzA2NTkzMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1746186237160-671e8d6d2a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6aXBwZXIlMjBob29kaWUlMjBhdGhsZXRpY3xlbnwxfHx8fDE3NzA2NTkzMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.8,
    reviews: 178,
    description: "Full-zip hoodie with side pockets. Versatile and comfortable for corporate gifting.",
    fabric: "Fleece",
    gsm: 300,
    fit: "Regular",
    colors: ["black", "grey", "navy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 15,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [5, 7, 9],
  },
  // HOODIES - Sweatshirt
  {
    id: 7,
    name: "Corporate Crew Neck Sweatshirt",
    category: "Hoodies",
    subcategory: "hoodies",
    type: "Sweatshirt",
    brand: "Puma",
    price: 850,
    image: "https://images.unsplash.com/photo-1722926628555-252c1c0258bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGhvb2RpZSUyMHN3ZWF0c2hpcnR8ZW58MXx8fHwxNzcwNjM4MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1722926628555-252c1c0258bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGhvb2RpZSUyMHN3ZWF0c2hpcnR8ZW58MXx8fHwxNzcwNjM4MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1631541909061-71e349d1f203?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBzd2VhdGVyJTIwcHVsbG92ZXJ8ZW58MXx8fHwxNzcwNjM4MTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.6,
    reviews: 145,
    description: "Classic crew neck sweatshirt without hood. Professional look with comfortable fit.",
    fabric: "Cotton Blend",
    gsm: 260,
    fit: "Regular",
    colors: ["black", "grey", "navy", "white"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    moq: 18,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print", "Patch"],
    gender: "Unisex",
    relatedProducts: [5, 6, 1],
  },

  // JACKETS - Bomber
  {
    id: 8,
    name: "Classic Bomber Jacket",
    category: "Jackets",
    subcategory: "jackets",
    type: "Bomber",
    brand: "Reebok",
    price: 1800,
    image: "https://images.unsplash.com/photo-1762344686263-23b39789bf55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib21iZXIlMjBqYWNrZXQlMjBjYXN1YWwlMjB3ZWFyfGVufDF8fHx8MTc3MDY1OTMxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1762344686263-23b39789bf55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib21iZXIlMjBqYWNrZXQlMjBjYXN1YWwlMjB3ZWFyfGVufDF8fHx8MTc3MDY1OTMxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.9,
    reviews: 89,
    description: "Stylish bomber jacket with ribbed collar and cuffs. Perfect for executive team uniforms.",
    fabric: "Polyester",
    gsm: 220,
    fit: "Slim",
    colors: ["black", "navy", "olive", "maroon"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 10,
    delivery: "7-10 days",
    branding: ["Embroidery", "Patch"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [9, 10, 11],
  },
  // JACKETS - Windcheater
  {
    id: 9,
    name: "Sport Windcheater Jacket",
    category: "Jackets",
    subcategory: "jackets",
    type: "Windcheater",
    brand: "Adidas",
    price: 1600,
    image: "https://images.unsplash.com/photo-1761064921602-887c8975cf3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kYnJlYWtlciUyMGphY2tldCUyMG91dGRvb3J8ZW58MXx8fHwxNzcwNjU5MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1761064921602-887c8975cf3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kYnJlYWtlciUyMGphY2tldCUyMG91dGRvb3J8ZW58MXx8fHwxNzcwNjU5MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.7,
    reviews: 134,
    description: "Lightweight windcheater with water-resistant coating. Ideal for outdoor corporate events.",
    fabric: "Polyester",
    gsm: 180,
    fit: "Regular",
    colors: ["black", "navy", "grey", "blue"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 12,
    delivery: "7-10 days",
    branding: ["Print", "Embroidery"],
    gender: "Unisex",
    relatedProducts: [8, 10, 6],
  },
  // JACKETS - Puffer
  {
    id: 10,
    name: "Premium Puffer Jacket",
    category: "Jackets",
    subcategory: "jackets",
    type: "Puffer",
    brand: "Nike",
    price: 2200,
    image: "https://images.unsplash.com/photo-1768492262895-808e2d6b6850?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWZmZXIlMjBqYWNrZXQlMjB3aW50ZXIlMjB3ZWFyfGVufDF8fHx8MTc3MDY1OTMyMHww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1768492262895-808e2d6b6850?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWZmZXIlMjBqYWNrZXQlMjB3aW50ZXIlMjB3ZWFyfGVufDF8fHx8MTc3MDY1OTMyMHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.8,
    reviews: 97,
    description: "Insulated puffer jacket for cold weather. Premium quality with down filling.",
    fabric: "Polyester",
    gsm: 300,
    fit: "Regular",
    colors: ["black", "navy", "grey"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 10,
    delivery: "7-10 days",
    branding: ["Embroidery", "Patch"],
    gender: "Unisex",
    discount: 20,
    relatedProducts: [8, 9, 13],
  },
  // JACKETS - Softshell
  {
    id: 11,
    name: "Softshell Tech Jacket",
    category: "Jackets",
    subcategory: "jackets",
    type: "Softshell",
    brand: "Puma",
    price: 1950,
    image: "https://images.unsplash.com/photo-1515736076039-a3ca66043b27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwY29ycG9yYXRlJTIwZmxlZWNlJTIwamFja2V0fGVufDF8fHx8MTc3MDYzODEyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1515736076039-a3ca66043b27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwY29ycG9yYXRlJTIwZmxlZWNlJTIwamFja2V0fGVufDF8fHx8MTc3MDYzODEyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.9,
    reviews: 112,
    description: "Technical softshell jacket with breathable fabric. Perfect for active corporate teams.",
    fabric: "Softshell",
    gsm: 240,
    fit: "Slim",
    colors: ["black", "navy", "grey", "charcoal"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 12,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [8, 9, 2],
  },

  // WORKWEAR - Formal Shirts
  {
    id: 12,
    name: "Executive Formal Shirt",
    category: "Workwear",
    subcategory: "workwear",
    type: "Formal Shirts",
    brand: "Nike",
    price: 750,
    image: "https://images.unsplash.com/photo-1768696082783-4313d98341ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBzaGlydCUyMGJ1c2luZXNzJTIwYXR0aXJlfGVufDF8fHx8MTc3MDY1OTMxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1768696082783-4313d98341ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBzaGlydCUyMGJ1c2luZXNzJTIwYXR0aXJlfGVufDF8fHx8MTc3MDY1OTMxNXww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1634136922909-28674948b516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNhc3VhbCUyMHNoaXJ0JTIwbWVufGVufDF8fHx8MTc3MDYzODEyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.7,
    reviews: 167,
    description: "Premium formal shirt with wrinkle-free fabric. Perfect for corporate uniforms.",
    fabric: "Cotton",
    gsm: 120,
    fit: "Slim",
    colors: ["white", "blue", "grey", "pink"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 20,
    delivery: "7-10 days",
    branding: ["Embroidery"],
    gender: "Men",
    relatedProducts: [13, 14, 2],
  },
  // WORKWEAR - Trousers
  {
    id: 13,
    name: "Professional Business Trousers",
    category: "Workwear",
    subcategory: "workwear",
    type: "Trousers",
    brand: "Adidas",
    price: 1200,
    image: "https://images.unsplash.com/photo-1551528747-2e87852af0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGJ1c2luZXNzJTIwcGFudHN8ZW58MXx8fHwxNzcwNjU5MzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1551528747-2e87852af0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGJ1c2luZXNzJTIwcGFudHN8ZW58MXx8fHwxNzcwNjU5MzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.6,
    reviews: 143,
    description: "Tailored business trousers with comfortable fit. Available in multiple sizes.",
    fabric: "Poly-Cotton",
    gsm: 180,
    fit: "Regular",
    colors: ["black", "navy", "grey", "charcoal"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    moq: 15,
    delivery: "7-10 days",
    branding: ["Embroidery"],
    gender: "Men",
    relatedProducts: [12, 14, 10],
  },
  // WORKWEAR - Blazers
  {
    id: 14,
    name: "Corporate Blazer Jacket",
    category: "Workwear",
    subcategory: "workwear",
    type: "Blazers",
    brand: "Reebok",
    price: 2500,
    image: "https://images.unsplash.com/photo-1770364019396-36ae51854520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGF6ZXIlMjBwcm9mZXNzaW9uYWwlMjBhdHRpcmV8ZW58MXx8fHwxNzcwNjU5MzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1770364019396-36ae51854520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGF6ZXIlMjBwcm9mZXNzaW9uYWwlMjBhdHRpcmV8ZW58MXx8fHwxNzcwNjU5MzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1592878849122-facb97520f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrJTIwamFja2V0JTIwYmxhemVyJTIwY29ycG9yYXRlfGVufDF8fHx8MTc3MDYzODEyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.9,
    reviews: 78,
    description: "Premium blazer for executive teams. Tailored fit with professional finish.",
    fabric: "Wool Blend",
    gsm: 300,
    fit: "Slim",
    colors: ["black", "navy", "charcoal"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 10,
    delivery: "7-10 days",
    branding: ["Embroidery"],
    gender: "Men",
    bestSeller: true,
    discount: 15,
    relatedProducts: [12, 13, 11],
  },

  // CAPS - Baseball
  {
    id: 15,
    name: "Classic Baseball Cap",
    category: "Caps",
    subcategory: "caps",
    type: "Baseball",
    brand: "Puma",
    price: 280,
    image: "https://images.unsplash.com/photo-1765875485201-0fca8c027f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMGNhcCUyMGJyYW5kZWQlMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NzA2NTkzMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1765875485201-0fca8c027f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMGNhcCUyMGJyYW5kZWQlMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NzA2NTkzMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.5,
    reviews: 289,
    description: "Classic baseball cap with adjustable strap. Perfect for corporate branding.",
    fabric: "Cotton",
    gsm: 160,
    fit: "Regular",
    colors: ["black", "navy", "white", "red", "grey"],
    sizes: ["One Size"],
    moq: 50,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [16, 17, 1],
  },
  // CAPS - Snapback
  {
    id: 16,
    name: "Premium Snapback Cap",
    category: "Caps",
    subcategory: "caps",
    type: "Snapback",
    brand: "Nike",
    price: 320,
    image: "https://images.unsplash.com/photo-1706542560952-d21ea5d44264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmFwYmFjayUyMGNhcCUyMGhlYWR3ZWFyfGVufDF8fHx8MTc3MDY1OTMxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1706542560952-d21ea5d44264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmFwYmFjayUyMGNhcCUyMGhlYWR3ZWFyfGVufDF8fHx8MTc3MDY1OTMxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.7,
    reviews: 234,
    description: "Trendy snapback cap with flat brim. Ideal for youth corporate events.",
    fabric: "Cotton Blend",
    gsm: 180,
    fit: "Regular",
    colors: ["black", "navy", "white", "grey"],
    sizes: ["One Size"],
    moq: 40,
    delivery: "7-10 days",
    branding: ["Embroidery", "Patch"],
    gender: "Unisex",
    relatedProducts: [15, 17, 4],
  },
  // CAPS - Bucket
  {
    id: 17,
    name: "Trendy Bucket Hat",
    category: "Caps",
    subcategory: "caps",
    type: "Bucket",
    brand: "Adidas",
    price: 350,
    image: "https://images.unsplash.com/photo-1749816221041-15b9013a0f14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWNrZXQlMjBoYXQlMjBjYXN1YWwlMjB3ZWFyfGVufDF8fHx8MTc3MDY1OTMyMHww&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1749816221041-15b9013a0f14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWNrZXQlMjBoYXQlMjBjYXN1YWwlMjB3ZWFyfGVufDF8fHx8MTc3MDY1OTMyMHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.4,
    reviews: 156,
    description: "Stylish bucket hat for outdoor corporate events. Provides excellent sun protection.",
    fabric: "Cotton",
    gsm: 150,
    fit: "Regular",
    colors: ["black", "beige", "navy", "olive"],
    sizes: ["S/M", "L/XL"],
    moq: 30,
    delivery: "7-10 days",
    branding: ["Embroidery", "Print"],
    gender: "Unisex",
    discount: 10,
    relatedProducts: [15, 16, 7],
  },

  // BOTTOM WEAR - Track Pants
  {
    id: 18,
    name: "Athletic Track Pants",
    category: "Bottom Wear",
    subcategory: "bottomwear",
    type: "Track Pants",
    brand: "Reebok",
    price: 650,
    image: "https://images.unsplash.com/photo-1715609104589-97585b210c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2dnZXJzJTIwdHJhY2slMjBwYW50cyUyMHNwb3J0c3dlYXJ8ZW58MXx8fHwxNzcwNjU5MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1715609104589-97585b210c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2dnZXJzJTIwdHJhY2slMjBwYW50cyUyMHNwb3J0c3dlYXJ8ZW58MXx8fHwxNzcwNjU5MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.6,
    reviews: 198,
    description: "Comfortable track pants with elastic waistband. Perfect for sports events and casual wear.",
    fabric: "Polyester",
    gsm: 180,
    fit: "Regular",
    colors: ["black", "navy", "grey", "blue"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 25,
    delivery: "7-10 days",
    branding: ["Print", "Embroidery"],
    gender: "Unisex",
    relatedProducts: [19, 4, 6],
  },
  // BOTTOM WEAR - Joggers
  {
    id: 19,
    name: "Premium Jogger Pants",
    category: "Bottom Wear",
    subcategory: "bottomwear",
    type: "Joggers",
    brand: "Nike",
    price: 750,
    image: "https://images.unsplash.com/photo-1715609104589-97585b210c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2dnZXJzJTIwdHJhY2slMjBwYW50cyUyMHNwb3J0c3dlYXJ8ZW58MXx8fHwxNzcwNjU5MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1715609104589-97585b210c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2dnZXJzJTIwdHJhY2slMjBwYW50cyUyMHNwb3J0c3dlYXJ8ZW58MXx8fHwxNzcwNjU5MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.8,
    reviews: 223,
    description: "Stylish joggers with tapered fit and cuffed ankles. Great for team building activities.",
    fabric: "Cotton Blend",
    gsm: 200,
    fit: "Slim",
    colors: ["black", "grey", "navy", "maroon"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 20,
    delivery: "7-10 days",
    branding: ["Print", "Embroidery"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [18, 5, 7],
  },

  // CUSTOM SETS - Uniform Sets
  {
    id: 20,
    name: "Complete Corporate Uniform Set",
    category: "Custom Sets",
    subcategory: "customsets",
    type: "Uniform Sets",
    brand: "Puma",
    price: 1800,
    image: "https://images.unsplash.com/photo-1566827886031-7d0f288f76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwd29yayUyMHVuaWZvcm0lMjBzaGlydHxlbnwxfHx8fDE3NzA2MzgxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1566827886031-7d0f288f76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwd29yayUyMHVuaWZvcm0lMjBzaGlydHxlbnwxfHx8fDE3NzA2MzgxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.9,
    reviews: 145,
    description: "Complete uniform set including shirt and trousers. Customizable with company branding.",
    fabric: "Poly-Cotton",
    gsm: 180,
    fit: "Regular",
    colors: ["navy", "black", "grey"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 10,
    delivery: "7-10 days",
    branding: ["Embroidery", "Patch"],
    gender: "Unisex",
    bestSeller: true,
    relatedProducts: [21, 12, 13],
  },
  // CUSTOM SETS - Team Kits
  {
    id: 21,
    name: "Sports Team Kit Bundle",
    category: "Custom Sets",
    subcategory: "customsets",
    type: "Team Kits",
    brand: "Adidas",
    price: 1500,
    image: "https://images.unsplash.com/photo-1566827886031-7d0f288f76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwd29yayUyMHVuaWZvcm0lMjBzaGlydHxlbnwxfHx8fDE3NzA2MzgxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1566827886031-7d0f288f76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwd29yayUyMHVuaWZvcm0lMjBzaGlydHxlbnwxfHx8fDE3NzA2MzgxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    rating: 4.7,
    reviews: 167,
    description: "Complete team kit including jersey, shorts, and cap. Perfect for corporate sports events.",
    fabric: "Dry-Fit",
    gsm: 150,
    fit: "Regular",
    colors: ["blue", "red", "green", "black"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    moq: 15,
    delivery: "7-10 days",
    branding: ["Sublimation", "Print"],
    gender: "Unisex",
    relatedProducts: [20, 4, 18],
  },
];

// Helper function to get related products
export const getRelatedProducts = (productId: number, limit: number = 4): Product[] => {
  const product = apparelProducts.find(p => p.id === productId);
  if (!product || !product.relatedProducts) return [];
  
  return product.relatedProducts
    .map(id => apparelProducts.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, limit) as Product[];
};

// Helper function to filter products by category
export const getProductsByCategory = (category: string): Product[] => {
  return apparelProducts.filter(p => p.subcategory === category);
};

// Helper function to filter products by subcategory type
export const getProductsByType = (type: string): Product[] => {
  return apparelProducts.filter(p => p.type === type);
};

export type ComboMock = {
  id: string
  tab_type: 'combo'
  name: string
  sub_category: 'Welcome Kits' | 'Festive Hampers' | 'Wellness Bundles' | 'Tech Combos' | 'Premium Sets' | 'Custom Combos'
  vendor_name: string
  is_mogzu_direct: boolean
  images: string[]
  included_items: string[]
  bundle_price: number
  savings_pct: number
  pricing_tiers: Array<{ min_qty: number; max_qty: number | null; price_per_set: number | null }>
  moq: number
  rating: number
  review_count: number
  featured: boolean
  status: 'active'
  occasion: string[]
  customizable: true
  delivery_days: number
  description: string
}

export type EgiftMock = {
  id: string
  tab_type: 'egift'
  name: string
  card_type: 'gift_card' | 'experience' | 'dining' | 'shopping' | 'gaming' | 'custom'
  sub_category: 'Gift Cards' | 'Experience Vouchers' | 'Food & Dining' | 'Shopping Credits' | 'OTT & Gaming' | 'Custom'
  vendor_name: string
  is_mogzu_direct: boolean
  images: string[]
  denominations: number[]
  validity_months: 3 | 6 | 12
  delivery_method: 'both'
  brand_logo_url: string
  design_templates: string[]
  rating: number
  review_count: number
  featured: boolean
  status: 'active'
}

export type GoLocalMock = {
  id: string
  tab_type: 'golocal'
  name: string
  category: string
  sub_category: 'Handicrafts' | 'Artisan Food' | 'Handmade Apparel' | 'Regional Art' | 'Natural & Organic' | 'Cultural Gifts'
  vendor_name: string
  images: string[]
  price: number
  price_type: 'per_piece'
  moq: number
  rating: number
  review_count: number
  featured: boolean
  status: 'active'
  occasion: string[]
  delivery_days: number
  customizable: boolean
  description: string
  artisan_name: string
  artisan_city: string
  craft_type: string
  artisan_story: string
  artisan_image: string
  certifications: string[]
  state_of_origin: string
}

export type BasketMock = {
  id: string
  tab_type: 'baskets'
  name: string
  sub_category: 'Gourmet Food' | 'Wellness Spa' | 'Corporate Premium' | 'Festival Special' | 'Dry Fruits & Nuts' | 'Custom Basket'
  vendor_name: string
  images: string[]
  price: number
  price_type: 'per_basket'
  moq: number
  rating: number
  review_count: number
  featured: boolean
  status: 'active'
  occasion: string[]
  delivery_days: number
  customizable: boolean
  description: string
  basket_contents: string[]
  total_weight_kg: number
  packaging_type: 'standard' | 'premium' | 'luxury'
  dimensions: string
}

export type CelebrationCollectionMock = {
  id: string
  tab_type: 'celebrations'
  occasion: string
  gradient_from: string
  gradient_to: string
  curated_count: number
  category_tags: string[]
  product_ids: number[]
}

// MOCK: Gifting — Combo tab [Step 3B]
export const giftingComboProducts: ComboMock[] = [
  {
    id: 'GIFT-COMBO-01',
    tab_type: 'combo',
    name: 'Onboard Essentials Welcome Combo',
    sub_category: 'Welcome Kits',
    vendor_name: 'Urban Welcome Co.',
    is_mogzu_direct: true,
    images: [
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1080&q=80',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1080&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&q=80',
    ],
    included_items: ['A5 notebook', 'Metal pen', 'Laptop sleeve', 'Insulated bottle'],
    bundle_price: 1899,
    savings_pct: 18,
    pricing_tiers: [
      { min_qty: 25, max_qty: 50, price_per_set: 1899 },
      { min_qty: 51, max_qty: 100, price_per_set: 1799 },
      { min_qty: 101, max_qty: 250, price_per_set: 1699 },
      { min_qty: 251, max_qty: null, price_per_set: null },
    ],
    moq: 25,
    rating: 4.8,
    review_count: 164,
    featured: true,
    status: 'active',
    occasion: ['Employee Welcome', 'Onboarding'],
    customizable: true,
    delivery_days: 8,
    description: 'A premium onboarding bundle curated for new employees. Includes practical desk and commute essentials with full logo branding support.',
  },
  {
    id: 'GIFT-COMBO-02',
    tab_type: 'combo',
    name: 'Grand Festive Delight Hamper',
    sub_category: 'Festive Hampers',
    vendor_name: 'Saffron Hampers India',
    is_mogzu_direct: false,
    images: [
      'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1080&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1080&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1080&q=80',
    ],
    included_items: ['Dry fruit jar set', 'Premium sweets box', 'Scented candle', 'Greeting card'],
    bundle_price: 2499,
    savings_pct: 20,
    pricing_tiers: [
      { min_qty: 25, max_qty: 50, price_per_set: 2499 },
      { min_qty: 51, max_qty: 100, price_per_set: 2369 },
      { min_qty: 101, max_qty: 250, price_per_set: 2249 },
      { min_qty: 251, max_qty: null, price_per_set: null },
    ],
    moq: 25,
    rating: 4.7,
    review_count: 118,
    featured: true,
    status: 'active',
    occasion: ['Diwali', 'Festivals', 'New Year'],
    customizable: true,
    delivery_days: 10,
    description: 'A festive gifting combo designed for large corporate celebrations. Built for premium unboxing and cultural relevance across offices.',
  },
  {
    id: 'GIFT-COMBO-03',
    tab_type: 'combo',
    name: 'Mind & Body Wellness Bundle',
    sub_category: 'Wellness Bundles',
    vendor_name: 'Serene Wellness Labs',
    is_mogzu_direct: true,
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1080&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1080&q=80',
    ],
    included_items: ['Aroma diffuser', 'Herbal tea kit', 'Yoga strap', 'Self-care journal'],
    bundle_price: 2099,
    savings_pct: 16,
    pricing_tiers: [
      { min_qty: 25, max_qty: 50, price_per_set: 2099 },
      { min_qty: 51, max_qty: 100, price_per_set: 1999 },
      { min_qty: 101, max_qty: 250, price_per_set: 1899 },
      { min_qty: 251, max_qty: null, price_per_set: null },
    ],
    moq: 25,
    rating: 4.9,
    review_count: 92,
    featured: false,
    status: 'active',
    occasion: ['Work Anniversary', "Women's Day", 'Recognition'],
    customizable: true,
    delivery_days: 7,
    description: 'Thoughtfully bundled wellness products to support employee well-being. Works well for annual wellness drives and appreciation campaigns.',
  },
  {
    id: 'GIFT-COMBO-04',
    tab_type: 'combo',
    name: 'Tech Productivity Combo Set',
    sub_category: 'Tech Combos',
    vendor_name: 'ByteNest Corporate',
    is_mogzu_direct: false,
    images: [
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1080&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&q=80',
      'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1080&q=80',
    ],
    included_items: ['Power bank', 'Wireless mouse', 'Type-C hub', 'Cable organizer'],
    bundle_price: 2799,
    savings_pct: 22,
    pricing_tiers: [
      { min_qty: 25, max_qty: 50, price_per_set: 2799 },
      { min_qty: 51, max_qty: 100, price_per_set: 2659 },
      { min_qty: 101, max_qty: 250, price_per_set: 2529 },
      { min_qty: 251, max_qty: null, price_per_set: null },
    ],
    moq: 25,
    rating: 4.6,
    review_count: 135,
    featured: true,
    status: 'active',
    occasion: ['Employee Welcome', 'Recognition', 'Birthday'],
    customizable: true,
    delivery_days: 9,
    description: 'A practical technology bundle for hybrid teams and leadership gifts. Designed around daily productivity and reliable quality.',
  },
  {
    id: 'GIFT-COMBO-05',
    tab_type: 'combo',
    name: 'Executive Premium Signature Set',
    sub_category: 'Premium Sets',
    vendor_name: 'Regal Corporate Gifting',
    is_mogzu_direct: true,
    images: [
      'https://images.unsplash.com/photo-1456327102063-fb5054efe647?w=1080&q=80',
      'https://images.unsplash.com/photo-1455885666463-9fb9b6f5d799?w=1080&q=80',
      'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1080&q=80',
    ],
    included_items: ['Leather diary', 'Executive pen', 'Desk organizer', 'Premium mug'],
    bundle_price: 3299,
    savings_pct: 19,
    pricing_tiers: [
      { min_qty: 25, max_qty: 50, price_per_set: 3299 },
      { min_qty: 51, max_qty: 100, price_per_set: 3149 },
      { min_qty: 101, max_qty: 250, price_per_set: 2999 },
      { min_qty: 251, max_qty: null, price_per_set: null },
    ],
    moq: 25,
    rating: 4.9,
    review_count: 88,
    featured: true,
    status: 'active',
    occasion: ['Work Anniversary', 'Retirement', 'Recognition'],
    customizable: true,
    delivery_days: 12,
    description: 'A polished premium set made for CXO gifting and milestone recognition. Curated for long-term utility and elevated brand recall.',
  },
  {
    id: 'GIFT-COMBO-06',
    tab_type: 'combo',
    name: 'Build-Your-Own Custom Combo',
    sub_category: 'Custom Combos',
    vendor_name: 'Mogzu Curations',
    is_mogzu_direct: true,
    images: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1080&q=80',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1080&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&q=80',
    ],
    included_items: ['Category selection', 'Branding options', 'Packaging options', 'Dispatch support'],
    bundle_price: 1599,
    savings_pct: 12,
    pricing_tiers: [
      { min_qty: 25, max_qty: 50, price_per_set: 1599 },
      { min_qty: 51, max_qty: 100, price_per_set: 1529 },
      { min_qty: 101, max_qty: 250, price_per_set: 1459 },
      { min_qty: 251, max_qty: null, price_per_set: null },
    ],
    moq: 25,
    rating: 4.5,
    review_count: 73,
    featured: false,
    status: 'active',
    occasion: ['Custom Occasion', 'Birthday', 'Festivals'],
    customizable: true,
    delivery_days: 6,
    description: 'A flexible custom-combo option for teams with varied gifting goals. Choose products, branding depth, and delivery windows in one flow.',
  },
]

// MOCK: Gifting — E-gift tab [Step 3C]
export const giftingEgiftCards: EgiftMock[] = [
  {
    id: 'GIFT-EGIFT-01',
    tab_type: 'egift',
    name: 'Amazon Corporate Gift Card',
    card_type: 'gift_card',
    sub_category: 'Gift Cards',
    vendor_name: 'Amazon Pay Corporate',
    is_mogzu_direct: true,
    images: ['https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1080&q=80'],
    denominations: [500, 1000, 2000, 5000],
    validity_months: 12,
    delivery_method: 'both',
    brand_logo_url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=300&q=80',
    design_templates: ['Template A', 'Template B', 'Template C'],
    rating: 4.8,
    review_count: 220,
    featured: true,
    status: 'active',
  },
  {
    id: 'GIFT-EGIFT-02',
    tab_type: 'egift',
    name: 'Adventure Experience Voucher',
    card_type: 'experience',
    sub_category: 'Experience Vouchers',
    vendor_name: 'ThrillPass India',
    is_mogzu_direct: false,
    images: ['https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1080&q=80'],
    denominations: [500, 1000, 2000, 5000],
    validity_months: 6,
    delivery_method: 'both',
    brand_logo_url: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=300&q=80',
    design_templates: ['Template A', 'Template B', 'Template C'],
    rating: 4.6,
    review_count: 96,
    featured: false,
    status: 'active',
  },
  {
    id: 'GIFT-EGIFT-03',
    tab_type: 'egift',
    name: 'Foodie Dining Wallet',
    card_type: 'dining',
    sub_category: 'Food & Dining',
    vendor_name: 'DineSphere',
    is_mogzu_direct: true,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&q=80'],
    denominations: [500, 1000, 2000, 5000],
    validity_months: 6,
    delivery_method: 'both',
    brand_logo_url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=300&q=80',
    design_templates: ['Template A', 'Template B', 'Template C'],
    rating: 4.7,
    review_count: 132,
    featured: true,
    status: 'active',
  },
  {
    id: 'GIFT-EGIFT-04',
    tab_type: 'egift',
    name: 'Retail Shopping Credits Pass',
    card_type: 'shopping',
    sub_category: 'Shopping Credits',
    vendor_name: 'CityMall Credits',
    is_mogzu_direct: false,
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&q=80'],
    denominations: [500, 1000, 2000, 5000],
    validity_months: 12,
    delivery_method: 'both',
    brand_logo_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80',
    design_templates: ['Template A', 'Template B', 'Template C'],
    rating: 4.5,
    review_count: 87,
    featured: false,
    status: 'active',
  },
  {
    id: 'GIFT-EGIFT-05',
    tab_type: 'egift',
    name: 'Gaming and OTT Rewards Card',
    card_type: 'gaming',
    sub_category: 'OTT & Gaming',
    vendor_name: 'PlayStream Rewards',
    is_mogzu_direct: true,
    images: ['https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1080&q=80'],
    denominations: [500, 1000, 2000, 5000],
    validity_months: 3,
    delivery_method: 'both',
    brand_logo_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&q=80',
    design_templates: ['Template A', 'Template B', 'Template C'],
    rating: 4.6,
    review_count: 104,
    featured: true,
    status: 'active',
  },
  {
    id: 'GIFT-EGIFT-06',
    tab_type: 'egift',
    name: 'Custom Branded E-Gift Pass',
    card_type: 'custom',
    sub_category: 'Custom',
    vendor_name: 'Mogzu Digital Gifts',
    is_mogzu_direct: true,
    images: ['https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1080&q=80'],
    denominations: [500, 1000, 2000, 5000],
    validity_months: 12,
    delivery_method: 'both',
    brand_logo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80',
    design_templates: ['Template A', 'Template B', 'Template C'],
    rating: 4.9,
    review_count: 61,
    featured: true,
    status: 'active',
  },
]

// MOCK: Gifting — Go-local tab [Step 3D]
export const giftingGoLocalProducts: GoLocalMock[] = [
  {
    id: 'GIFT-LOCAL-01',
    tab_type: 'golocal',
    name: 'Pochampally Weave Desk Runner Set',
    category: 'Textiles',
    sub_category: 'Handicrafts',
    vendor_name: 'Telangana Loom Studio',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1080&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1080&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1080&q=80',
    ],
    price: 799,
    price_type: 'per_piece',
    moq: 30,
    rating: 4.8,
    review_count: 44,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 9,
    customizable: true,
    description: 'Handwoven desk textile set inspired by Pochampally patterns for premium office gifting.',
    artisan_name: 'Ramesh Bolla',
    artisan_city: 'Hyderabad',
    craft_type: 'Pochampally weave',
    artisan_story: 'Ramesh works with a family weaving cluster preserving Pochampally motifs. Each piece is woven on handlooms and finished with corporate color accents.',
    artisan_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1080&q=80',
    certifications: ['GI Tag'],
    state_of_origin: 'Telangana',
  },
  {
    id: 'GIFT-LOCAL-02',
    tab_type: 'golocal',
    name: 'Jaipur Block Print Utility Pouches',
    category: 'Textiles',
    sub_category: 'Artisan Food',
    vendor_name: 'Pink City Crafts',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1080&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1080&q=80',
    ],
    price: 549,
    price_type: 'per_piece',
    moq: 50,
    rating: 4.5,
    review_count: 39,
    featured: false,
    status: 'active',
    occasion: [],
    delivery_days: 7,
    customizable: true,
    description: 'Printed utility pouches with authentic Jaipur block patterns, suitable for welcome kits.',
    artisan_name: 'Meera Solanki',
    artisan_city: 'Jaipur',
    craft_type: 'Block print fabric',
    artisan_story: 'Meera collaborates with local block printers and natural dye units in Jaipur. Her workshop combines heritage patterns with utility-first modern products.',
    artisan_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1080&q=80',
    certifications: [],
    state_of_origin: 'Rajasthan',
  },
  {
    id: 'GIFT-LOCAL-03',
    tab_type: 'golocal',
    name: 'Lucknow Chikankari File Folder',
    category: 'Apparel',
    sub_category: 'Handmade Apparel',
    vendor_name: 'Awadhi Handcrafts',
    images: [
      'https://images.unsplash.com/photo-1467043153537-a4fba2cd39ef?w=1080&q=80',
      'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1080&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1080&q=80',
    ],
    price: 999,
    price_type: 'per_piece',
    moq: 20,
    rating: 4.7,
    review_count: 31,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 11,
    customizable: false,
    description: 'Elegant chikankari embroidered folders crafted for senior leadership gifting.',
    artisan_name: 'Sana Rizvi',
    artisan_city: 'Lucknow',
    craft_type: 'Chikankari embroidery',
    artisan_story: 'Sana leads a women-led embroidery group that specializes in traditional chikankari stitches. Their work supports local livelihoods and heritage preservation.',
    artisan_image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=1080&q=80',
    certifications: ['Handloom Mark'],
    state_of_origin: 'Uttar Pradesh',
  },
  {
    id: 'GIFT-LOCAL-04',
    tab_type: 'golocal',
    name: 'Kanjivaram Motif Silk Gift Sleeve',
    category: 'Art',
    sub_category: 'Regional Art',
    vendor_name: 'South Loom Circle',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1080&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1080&q=80',
    ],
    price: 1299,
    price_type: 'per_piece',
    moq: 25,
    rating: 4.6,
    review_count: 22,
    featured: false,
    status: 'active',
    occasion: [],
    delivery_days: 12,
    customizable: true,
    description: 'Silk sleeves inspired by Kanjivaram motifs for premium boxed gifting presentations.',
    artisan_name: 'Arun Narayanan',
    artisan_city: 'Chennai',
    craft_type: 'Kanjivaram silk',
    artisan_story: 'Arun sources silk from Kanchipuram weavers and adapts motifs for corporate gifting formats. Every run is hand-finished and quality checked.',
    artisan_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80',
    certifications: ['GI Tag'],
    state_of_origin: 'Tamil Nadu',
  },
  {
    id: 'GIFT-LOCAL-05',
    tab_type: 'golocal',
    name: 'Bandhani Organic Gift Wrap Set',
    category: 'Lifestyle',
    sub_category: 'Natural & Organic',
    vendor_name: 'Saurashtra Colorworks',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1080&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1080&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1080&q=80',
    ],
    price: 459,
    price_type: 'per_piece',
    moq: 60,
    rating: 4.4,
    review_count: 27,
    featured: false,
    status: 'active',
    occasion: [],
    delivery_days: 6,
    customizable: true,
    description: 'Reusable bandhani wrap cloths with natural dyes for sustainable gifting programs.',
    artisan_name: 'Devang Trivedi',
    artisan_city: 'Rajkot',
    craft_type: 'Bandhani tie-dye',
    artisan_story: 'Devang belongs to a traditional tie-dye family and now trains younger artisans on eco-dye methods. His products reduce single-use packaging waste.',
    artisan_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1080&q=80',
    certifications: ['Organic Certified'],
    state_of_origin: 'Gujarat',
  },
  {
    id: 'GIFT-LOCAL-06',
    tab_type: 'golocal',
    name: 'Warli Art Framed Desk Tile',
    category: 'Art',
    sub_category: 'Cultural Gifts',
    vendor_name: 'Coastal Folk Studio',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1080&q=80',
      'https://images.unsplash.com/photo-1455885666463-9fb9b6f5d799?w=1080&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80',
    ],
    price: 1499,
    price_type: 'per_piece',
    moq: 15,
    rating: 4.9,
    review_count: 19,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 10,
    customizable: false,
    description: 'Hand-painted Warli desk artwork mounted in minimalist frames for executive gifts.',
    artisan_name: 'Nisha Patkar',
    artisan_city: 'Mumbai',
    craft_type: 'Warli art painting',
    artisan_story: 'Nisha curates Warli artists from the Maharashtra coast and adapts folk motifs into contemporary desk decor. Every tile is hand-painted in small batches.',
    artisan_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080&q=80',
    certifications: [],
    state_of_origin: 'Maharashtra',
  },
]

// MOCK: Gifting — Baskets tab [Step 3E]
export const giftingBasketsProducts: BasketMock[] = [
  {
    id: 'GIFT-BASKET-01',
    tab_type: 'baskets',
    name: 'Gourmet Sampler Basket',
    sub_category: 'Gourmet Food',
    vendor_name: 'Taste Crate Co.',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1080&q=80',
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1080&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1080&q=80',
    ],
    price: 1899,
    price_type: 'per_basket',
    moq: 20,
    rating: 4.7,
    review_count: 84,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 7,
    customizable: true,
    description: 'Curated gourmet basket with artisanal snacks and premium preserves.',
    basket_contents: ['Roasted almonds', 'Cheese crackers', 'Fruit preserve', 'Dark chocolate bites'],
    total_weight_kg: 1.2,
    packaging_type: 'premium',
    dimensions: '30x20x15 cm',
  },
  {
    id: 'GIFT-BASKET-02',
    tab_type: 'baskets',
    name: 'Wellness Spa Restore Basket',
    sub_category: 'Wellness Spa',
    vendor_name: 'Calm Nest Essentials',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1080&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1080&q=80',
      'https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=1080&q=80',
    ],
    price: 2199,
    price_type: 'per_basket',
    moq: 15,
    rating: 4.8,
    review_count: 58,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 8,
    customizable: true,
    description: 'Relaxation-focused spa basket with self-care products for employee wellbeing.',
    basket_contents: ['Body lotion', 'Aroma candle', 'Bath salts', 'Face mask set'],
    total_weight_kg: 1.0,
    packaging_type: 'luxury',
    dimensions: '28x18x14 cm',
  },
  {
    id: 'GIFT-BASKET-03',
    tab_type: 'baskets',
    name: 'Corporate Signature Premium Basket',
    sub_category: 'Corporate Premium',
    vendor_name: 'Executive Hampers India',
    images: [
      'https://images.unsplash.com/photo-1456327102063-fb5054efe647?w=1080&q=80',
      'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1080&q=80',
      'https://images.unsplash.com/photo-1455885666463-9fb9b6f5d799?w=1080&q=80',
    ],
    price: 3299,
    price_type: 'per_basket',
    moq: 10,
    rating: 4.9,
    review_count: 47,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 10,
    customizable: true,
    description: 'Premium corporate basket designed for board-level and client appreciation gifting.',
    basket_contents: ['Leather notebook', 'Premium pen', 'Coffee blend', 'Desk accessory'],
    total_weight_kg: 1.8,
    packaging_type: 'luxury',
    dimensions: '34x24x16 cm',
  },
  {
    id: 'GIFT-BASKET-04',
    tab_type: 'baskets',
    name: 'Festival Cheer Celebration Basket',
    sub_category: 'Festival Special',
    vendor_name: 'Festive Lane Gifts',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1080&q=80',
      'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1080&q=80',
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1080&q=80',
    ],
    price: 2599,
    price_type: 'per_basket',
    moq: 20,
    rating: 4.6,
    review_count: 66,
    featured: false,
    status: 'active',
    occasion: [],
    delivery_days: 9,
    customizable: true,
    description: 'Festive basket with sweets, decor accents, and celebration essentials.',
    basket_contents: ['Traditional sweets', 'Decor lights', 'Tea box', 'Greeting card'],
    total_weight_kg: 2.1,
    packaging_type: 'premium',
    dimensions: '32x22x15 cm',
  },
  {
    id: 'GIFT-BASKET-05',
    tab_type: 'baskets',
    name: 'Dry Fruits and Nuts Reserve Basket',
    sub_category: 'Dry Fruits & Nuts',
    vendor_name: 'Nutri Harvest Co.',
    images: [
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1080&q=80',
      'https://images.unsplash.com/photo-1514996937319-344454492b37?w=1080&q=80',
      'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=1080&q=80',
    ],
    price: 2399,
    price_type: 'per_basket',
    moq: 25,
    rating: 4.7,
    review_count: 73,
    featured: false,
    status: 'active',
    occasion: [],
    delivery_days: 6,
    customizable: false,
    description: 'Healthy dry-fruit basket for festive and wellness-centric gifting campaigns.',
    basket_contents: ['Almond jar', 'Cashew jar', 'Pistachio jar', 'Date bites'],
    total_weight_kg: 2.4,
    packaging_type: 'standard',
    dimensions: '30x20x14 cm',
  },
  {
    id: 'GIFT-BASKET-06',
    tab_type: 'baskets',
    name: 'Custom Build Basket Program',
    sub_category: 'Custom Basket',
    vendor_name: 'Mogzu Basket Studio',
    images: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1080&q=80',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1080&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&q=80',
    ],
    price: 1699,
    price_type: 'per_basket',
    moq: 25,
    rating: 4.5,
    review_count: 41,
    featured: true,
    status: 'active',
    occasion: [],
    delivery_days: 5,
    customizable: true,
    description: 'Flexible custom basket program with selectable products and packaging tiers.',
    basket_contents: ['Custom note', 'Any four chosen items', 'Brand sleeve', 'Dispatch insert'],
    total_weight_kg: 0.9,
    packaging_type: 'standard',
    dimensions: '26x18x12 cm',
  },
]

// MOCK: Gifting — Celebrations tab [Step 3F]
export const giftingCelebrationCollections: CelebrationCollectionMock[] = [
  {
    id: 'GIFT-CELEB-01',
    tab_type: 'celebrations',
    occasion: 'Diwali',
    gradient_from: '#F97316',
    gradient_to: '#EF4444',
    curated_count: 42,
    category_tags: ['Stationary', 'Baskets', 'Apparel'],
    product_ids: [1, 2, 5, 8],
  },
  {
    id: 'GIFT-CELEB-02',
    tab_type: 'celebrations',
    occasion: 'Work Anniversary',
    gradient_from: '#2563EB',
    gradient_to: '#7C3AED',
    curated_count: 38,
    category_tags: ['Tech', 'Apparel', 'Bags'],
    product_ids: [3, 6, 11, 12],
  },
  {
    id: 'GIFT-CELEB-03',
    tab_type: 'celebrations',
    occasion: 'New Year',
    gradient_from: '#1F2937',
    gradient_to: '#7C3AED',
    curated_count: 30,
    category_tags: ['Stationary', 'Tech', 'Wellness'],
    product_ids: [4, 9, 10, 14],
  },
  {
    id: 'GIFT-CELEB-04',
    tab_type: 'celebrations',
    occasion: 'Employee Welcome',
    gradient_from: '#14B8A6',
    gradient_to: '#22C55E',
    curated_count: 28,
    category_tags: ['Bags', 'Stationary', 'Apparel'],
    product_ids: [1, 7, 15, 20],
  },
  {
    id: 'GIFT-CELEB-05',
    tab_type: 'celebrations',
    occasion: 'Birthday',
    gradient_from: '#EC4899',
    gradient_to: '#F43F5E',
    curated_count: 24,
    category_tags: ['Wellness', 'Baskets', 'Combo'],
    product_ids: [2, 13, 16, 18],
  },
  {
    id: 'GIFT-CELEB-06',
    tab_type: 'celebrations',
    occasion: 'Retirement',
    gradient_from: '#6366F1',
    gradient_to: '#7C3AED',
    curated_count: 22,
    category_tags: ['Premium', 'Tech', 'Stationary'],
    product_ids: [10, 11, 12, 14],
  },
  {
    id: 'GIFT-CELEB-07',
    tab_type: 'celebrations',
    occasion: 'Festivals',
    gradient_from: '#EAB308',
    gradient_to: '#F97316',
    curated_count: 35,
    category_tags: ['Apparel', 'Baskets', 'Go-local'],
    product_ids: [5, 8, 17, 21],
  },
  {
    id: 'GIFT-CELEB-08',
    tab_type: 'celebrations',
    occasion: 'Custom Occasion',
    gradient_from: '#6B7280',
    gradient_to: '#374151',
    curated_count: 0,
    category_tags: [],
    product_ids: [],
  },
]

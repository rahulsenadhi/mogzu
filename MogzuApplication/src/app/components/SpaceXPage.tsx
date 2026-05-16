import { useState, useEffect, useRef, useMemo } from "react";
import {
  Heart,
  Search,
  ChevronDown,
  Bell,
  HelpCircle,
  AlertCircle,
  Presentation,
  Laptop,
  Coffee,
  BriefcaseBusiness,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { SharedHeader } from "@/app/components/layouts/SharedHeader";
import { SharedSidebar } from "@/app/components/layouts/SharedSidebar";
import { MogzuCorporateScrollSurface } from "@/app/components/layouts/MogzuCorporateScrollSurface";
import svgPaths from "@/imports/svg-5pj2l0pukf";
import svgPathsDashboard from "@/imports/svg-camfkj9vq4";
import imgImage24995 from "figma:asset/3fd0634bc82e44a536b4f08060cd6f224c13e9e8.png";
import imgImage25005 from "figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png";
import imgImage25007 from "figma:asset/07c8952b54b010f56d8dedbe611346c3e0384a3b.png";
import imgImage25008 from "figma:asset/e86ee56e31648a90ae897a074b51582d25968c53.png";
import imgImage25009 from "figma:asset/85f8405bbdca7cd653bfb58f8c08eb0e78585f53.png";
import imgImage25011 from "figma:asset/2f238fd555e3e760d62115f9495ea2deaffb72ac.png";
import imgImage25012 from "figma:asset/ddec98fa7df4d4b69822408e80184d4bd050344a.png";
import imgImage25013 from "figma:asset/6c98c861b6f30e5c598ad8734daaa36949354422.png";
import imgImage24998 from "figma:asset/294456aa8a1d6b512aeefabc774fbfd6e9dbfc27.png";
import imgImage25002 from "figma:asset/307efb5199e265739a92e15692c03f34215a6b46.png";
import imgAnastasiaCruickshank from "figma:asset/38cb5953a61ae8377e8fd76312ea593096d863c4.png";
import imgImage24877 from "figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png";
import imgAvatar from "figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png";

import { CompareWidget, CompareItem } from "@/app/components/ui/CompareWidget";
import {
  CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT,
  listingProfileIncludes,
  loadCorporateApprovedListings,
} from "@/app/lib/corporateApprovedListingsStorage";
import {
  CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT,
  loadActiveCorporatePromotionsForSector,
} from "@/app/lib/corporateAdminPromotionsStorage";
import { matchesPriceRange, matchesSourceFilter, parsePriceLike, type CatalogueSourceFilter } from "@/utils/filterContracts";
import { buildUnsplashKeywordImage, getListingSlideImages, getPriceDisplayParts } from "./dspaceCardUtils";

type SpaceXCategoryTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

interface SpaceCard {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: string[];
  capacity: string;
  price: string;
  rating: string;
  image: string;
  promoted?: boolean;
  offer?: string;
  category: "conference" | "casual" | "corporate";
  pricingType?: "transparent" | "offer" | "on_request";
  paymentMode?: "wallet" | "net_banking" | "neft_rtgs" | "gateway";
  paymentTerm?: "advance_100" | "partial_50" | "net_30";
}

export default function SpaceXPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<
    "meetings" | "activities" | "stay" | "promotions"
  >("meetings");
  const [selectedCategory, setSelectedCategory] =
    useState("casual");
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);
  const [selectedNav, setSelectedNav] = useState("activity");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Filter states
  const [amenities, setAmenities] = useState({
    wifi: true,
    printing: false,
    meetingRooms: false,
    phoneBooths: false,
    lounge: false,
    parking: false,
  });

  const [quality, setQuality] = useState({
    premium: true,
    professional: false,
    standard: false,
    budgetFriendly: false,
  });

  const [layout, setLayout] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
  });

  const [ratings, setRatings] = useState({
    fiveStar: true,
    fourStar: false,
    threeStar: false,
    twoStar: false,
    oneStar: false,
  });

  // Search filter states
  const [searchLocation, setSearchLocation] = useState("");
  const [searchAttendees, setSearchAttendees] = useState("");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState<"all" | "wallet" | "net_banking" | "neft_rtgs" | "gateway">("all");
  const [paymentTermFilter, setPaymentTermFilter] = useState<"all" | "advance_100" | "partial_50" | "net_30">("all");
  const [pricingTypeFilter, setPricingTypeFilter] = useState<"all" | "transparent" | "offer" | "on_request">("all");
  const [sortBy, setSortBy] = useState<"recommended" | "price_low_high" | "price_high_low" | "rating_high_low" | "distance_nearest">("recommended");
  const [moduleFilter, setModuleFilter] = useState<"all" | "dspace" | "events" | "gifting">("dspace");
  const [masterCategoryFilter, setMasterCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<CatalogueSourceFilter>("all");

  // Capacity filter states
  const [capacityMin, setCapacityMin] = useState("");
  const [capacityMax, setCapacityMax] = useState("");

  // Price filter states
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Compare state
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [compareLimitNotice, setCompareLimitNotice] = useState("");
  const [bannerActionNotice, setBannerActionNotice] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isError, setIsError] = useState(false);
  const [likedSpaces, setLikedSpaces] = useState<Record<string, boolean>>({});
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});
  const [corpListingTick, setCorpListingTick] = useState(0);
  const [corpPromoTick, setCorpPromoTick] = useState(0);
  const isConferenceLikeCategory =
    selectedCategory === "conference" || selectedCategory === "coworking";

  useEffect(() => {
    const bumpListings = () => setCorpListingTick((n) => n + 1);
    const bumpPromos = () => setCorpPromoTick((n) => n + 1);
    window.addEventListener(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT, bumpListings);
    window.addEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, bumpPromos);
    window.addEventListener("focus", bumpListings);
    return () => {
      window.removeEventListener(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT, bumpListings);
      window.removeEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, bumpPromos);
      window.removeEventListener("focus", bumpListings);
    };
  }, []);

  // Category-specific banners
  const getBanners = () => {
    const adminPromos = loadActiveCorporatePromotionsForSector("SpaceX").map((p, i) => ({
      id: 900 + i,
      title: p.title,
      description: p.subtitle,
      vendor: p.vendorName,
    }));

    if (isConferenceLikeCategory) {
      return [
        ...adminPromos,
        {
          id: 1,
          title: "Professional Conference Facilities",
          description:
            "Premium boardrooms and conference halls equipped with state-of-the-art AV systems, video conferencing, and professional amenities. Perfect for formal meetings, presentations, and corporate events.",
          vendor: "Mogzu Conference",
        },
        {
          id: 2,
          title: "Executive Meeting Spaces",
          description:
            "Impress your clients and stakeholders with sophisticated conference rooms. Full technical support, catering services, and elegant settings for productive business meetings.",
          vendor: "SpaceHub Pro",
        },
        {
          id: 3,
          title: "Book Your Conference Room",
          description:
            "From intimate boardrooms to large conference halls. Professional setup, high-speed WiFi, presentation equipment, and dedicated support for seamless meetings.",
          vendor: "Mogzu Business",
        },
      ];
    } else if (selectedCategory === "casual") {
      return [
        ...adminPromos,
        {
          id: 1,
          title: "Casual Meeting Spaces",
          description:
            "Book relaxed, informal meeting rooms perfect for brainstorming, team discussions, and creative sessions. Comfortable settings with modern amenities for productive conversations.",
          vendor: "Mogzu Meetings",
        },
        {
          id: 2,
          title: "Flexible Meeting Solutions",
          description:
            "Host your casual corporate meetings in inspiring spaces. From small huddle rooms to collaborative lounges, find the perfect spot for your team to connect.",
          vendor: "SpaceHub",
        },
        {
          id: 3,
          title: "Book Your Meeting Space Today",
          description:
            "Affordable hourly and daily rates for casual meeting rooms. Modern facilities, refreshments included, and easy booking process for hassle-free meetings.",
          vendor: "Mogzu Connect",
        },
      ];
    } else {
      // corporate
      return [
        ...adminPromos,
        {
          id: 1,
          title: "Premium Event Venues",
          description:
            "Host unforgettable corporate events in stunning venues. From product launches to team celebrations, banquet halls to rooftop spaces with full event management support.",
          vendor: "Mogzu Events",
        },
        {
          id: 2,
          title: "Corporate Event Excellence",
          description:
            "Make your corporate events memorable with premium venues, professional catering, AV equipment, and customizable setups. Perfect for conferences, galas, and team building events.",
          vendor: "SpaceHub Events",
        },
        {
          id: 3,
          title: "Book Your Event Space",
          description:
            "Flexible event spaces for 50-500+ attendees. Complete event solutions including staging, sound systems, catering, and dedicated event coordinators.",
          vendor: "Mogzu Celebrations",
        },
      ];
    }
  };

  const banners = useMemo(() => getBanners(), [selectedCategory, corpPromoTick]);

  useEffect(() => {
    setBannerActionNotice("");
  }, [currentSlide, selectedCategory]);

  useEffect(() => {
    if (compareList.length < 3) {
      setCompareLimitNotice("");
    }
  }, [compareList.length]);

  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  const staticSpaces: SpaceCard[] = [
    // CONFERENCE SPACES (Formal)
    {
      id: "conf1",
      name: "Executive Boardroom BKC",
      type: "Executive Boardroom",
      location: "Bandra Kurla Complex, Mumbai",
      tags: ["WIFI", "VIDEO CONFERENCING", "WHITEBOARD", "CATERING"],
      capacity: "12-20",
      price: "₹5,000/hr",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1769771744699-7b73a101b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBmb3JtYWx8ZW58MXx8fHwxNzcwNTU0Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      promoted: true,
      offer: "15% OFF",
    },
    {
      id: "conf2",
      name: "Grand Conference Hall",
      type: "Conference Hall",
      location: "Nariman Point, Mumbai",
      tags: ["PROJECTOR", "WIFI", "STAGE", "RECORDING"],
      capacity: "50-100",
      price: "₹15,000/hr",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1633431303895-8236f0a04b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwaGFsbCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MDU1NDI3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      promoted: false,
    },
    {
      id: "conf3",
      name: "Corporate Training Center",
      type: "Training Room",
      location: "Lower Parel, Mumbai",
      tags: ["PROJECTOR", "WIFI", "WHITEBOARD", "CATERING"],
      capacity: "25-40",
      price: "₹8,000/hr",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1762176263996-a0713a49ee4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0cmFpbmluZyUyMHJvb218ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      offer: "10% OFF",
    },
    {
      id: "conf4",
      name: "Premium Boardroom Worli",
      type: "Executive Boardroom",
      location: "Worli, Mumbai",
      tags: ["VIDEO CONFERENCING", "WIFI", "PREMIUM SEATING", "REFRESHMENTS"],
      capacity: "10-16",
      price: "₹4,500/hr",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1769771744699-7b73a101b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBmb3JtYWx8ZW58MXx8fHwxNzcwNTU0Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      promoted: true,
    },
    {
      id: "conf5",
      name: "Seminar Hall Andheri",
      type: "Seminar Room",
      location: "Andheri (East), Mumbai",
      tags: ["PROJECTOR", "WIFI", "STAGE", "PARKING"],
      capacity: "30-60",
      price: "₹10,000/hr",
      rating: "4.6",
      image: "https://images.unsplash.com/photo-1633431303895-8236f0a04b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwaGFsbCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MDU1NDI3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
    },
    {
      id: "conf6",
      name: "Tech Conference Room",
      type: "Conference Hall",
      location: "Powai, Mumbai",
      tags: ["WIFI", "DUAL SCREENS", "VIDEO CONFERENCING", "WHITEBOARD"],
      capacity: "18-30",
      price: "₹6,500/hr",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1762176263996-a0713a49ee4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0cmFpbmluZyUyMHJvb218ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      promoted: true,
      offer: "20% OFF",
    },
    {
      id: "conf7",
      name: "Business Hub Meeting Room",
      type: "Conference Hall",
      location: "Fort, Mumbai",
      tags: ["PROJECTOR", "WIFI", "CATERING", "SECRETARY SERVICE"],
      capacity: "15-25",
      price: "₹5,500/hr",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1769771744699-7b73a101b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBmb3JtYWx8ZW58MXx8fHwxNzcwNTU0Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
    },
    {
      id: "conf8",
      name: "Leadership Summit Room",
      type: "Executive Boardroom",
      location: "Bandra (West), Mumbai",
      tags: ["LUXURY SEATING", "VIDEO CONFERENCING", "WIFI", "BAR"],
      capacity: "10-18",
      price: "₹7,000/hr",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1633431303895-8236f0a04b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwaGFsbCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MDU1NDI3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      offer: "12% OFF",
    },
    {
      id: "conf9",
      name: "Corporate Center Goregaon",
      type: "Seminar Room",
      location: "Goregaon (East), Mumbai",
      tags: ["MULTIPLE ROOMS", "WIFI", "CATERING", "PARKING"],
      capacity: "40-80",
      price: "₹12,000/hr",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1762176263996-a0713a49ee4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0cmFpbmluZyUyMHJvb218ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "conference",
      promoted: true,
    },

    // CASUAL SPACES (Non-formal)
    {
      id: "cas1",
      name: "The Hub Lounge",
      type: "Premium Lounge",
      location: "Bandra (West), Mumbai",
      tags: ["WIFI", "REFRESHMENTS", "COMFORTABLE SEATING"],
      capacity: "4-8",
      price: "₹800/hr",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1758519288355-fe5b6fcc9f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjByb29tfGVufDF8fHx8MTc3MDU1MzQxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
      promoted: true,
      offer: "20% OFF",
    },
    {
      id: "cas2",
      name: "Connect Cafe BKC",
      type: "Premium Lounge",
      location: "Bandra Kurla Complex, Mumbai",
      tags: ["COFFEE BAR", "COMFORTABLE SEATING", "WIFI"],
      capacity: "6-12",
      price: "₹1,200/hr",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1748261500463-d15e624baf8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmZvcm1hbCUyMGNvcnBvcmF0ZSUyMG1lZXRpbmclMjBzcGFjZXxlbnwxfHx8fDE3NzA1NTM0MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
    },
    {
      id: "cas3",
      name: "Creative Corner Andheri",
      type: "Huddle Space",
      location: "Andheri (West), Mumbai",
      tags: ["WHITEBOARD", "PROJECTOR", "WIFI"],
      capacity: "5-10",
      price: "₹900/hr",
      rating: "4.6",
      image: "https://images.unsplash.com/photo-1751607217088-82bacdf70270?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWV0aW5nJTIwbG91bmdlfGVufDF8fHx8MTc3MDU1MzQxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
      offer: "15% OFF",
    },
    {
      id: "cas4",
      name: "Collab Space Powai",
      type: "Discussion Room",
      location: "Powai, Mumbai",
      tags: ["NATURAL LIGHT", "WIFI", "REFRESHMENTS"],
      capacity: "8-15",
      price: "₹1,500/hr",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1765366417044-9e84ce8ec942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWxheGVkJTIwb2ZmaWNlJTIwbWVldGluZyUyMGFyZWF8ZW58MXx8fHwxNzcwNTUzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
      promoted: true,
    },
    {
      id: "cas5",
      name: "Meeting Nest Malad",
      type: "Huddle Space",
      location: "Malad (West), Mumbai",
      tags: ["SOUNDPROOF", "TV SCREEN", "WIFI"],
      capacity: "3-6",
      price: "₹750/hr",
      rating: "4.5",
      image: "https://images.unsplash.com/photo-1759310610372-c547611af808?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRpc2N1c3Npb24lMjByb29tfGVufDF8fHx8MTc3MDU1MzQxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
    },
    {
      id: "cas6",
      name: "Workshop Studio Lower Parel",
      type: "Discussion Room",
      location: "Lower Parel, Mumbai",
      tags: ["MOVABLE FURNITURE", "WHITEBOARD", "WIFI"],
      capacity: "10-20",
      price: "₹1,800/hr",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1568992688243-52608227497d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aXZlJTIwd29ya3NwYWNlJTIwbWVldGluZ3xlbnwxfHx8fDE3NzA1NTM0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
      offer: "10% OFF",
    },
    {
      id: "cas7",
      name: "Quick Meet Vikhroli",
      type: "Huddle Space",
      location: "Vikhroli (East), Mumbai",
      tags: ["VIDEO CONFERENCING", "SNACKS", "WIFI"],
      capacity: "4-8",
      price: "₹600/hr",
      rating: "4.4",
      image: "https://images.unsplash.com/photo-1676277755239-c160872ccca3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMHRlYW0lMjBtZWV0aW5nJTIwcm9vbXxlbnwxfHx8fDE3NzA1NTM0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
      promoted: true,
      offer: "25% OFF",
    },
    {
      id: "cas8",
      name: "Think Tank Andheri",
      type: "Discussion Room",
      location: "Andheri (East), Mumbai",
      tags: ["COMFORTABLE SEATING", "REFRESHMENTS", "WIFI"],
      capacity: "6-12",
      price: "₹1,100/hr",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1503418895522-46f9804cda40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMG1lZXRpbmclMjBzcGFjZXxlbnwxfHx8fDE3NzA1NTM0MTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
    },
    {
      id: "cas9",
      name: "Inspire Room Worli",
      type: "Collaboration Hub",
      location: "Worli, Mumbai",
      tags: ["PANORAMIC VIEW", "PROJECTOR", "WIFI"],
      capacity: "10-18",
      price: "₹2,000/hr",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1758519288355-fe5b6fcc9f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjByb29tfGVufDF8fHx8MTc3MDU1MzQxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "casual",
      promoted: true,
    },

    // CORPORATE EVENT SPACES
    {
      id: "corp1",
      name: "Grand Ballroom BKC",
      type: "Grand Ballroom",
      location: "Bandra Kurla Complex, Mumbai",
      tags: ["STAGE", "CATERING", "WIFI", "PARKING"],
      capacity: "200-400",
      price: "₹50,000/day",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1762765684665-6b6855bb6fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5xdWV0JTIwaGFsbCUyMGV2ZW50JTIwdmVudWV8ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      promoted: true,
      offer: "15% OFF",
    },
    {
      id: "corp2",
      name: "Skyline Rooftop",
      type: "Premium Event Hall",
      location: "Lower Parel, Mumbai",
      tags: ["PANORAMIC VIEWS", "BAR", "CATERING", "DJ SETUP"],
      capacity: "100-200",
      price: "₹40,000/day",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1767096684353-a979c6fe02ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mdG9wJTIwZXZlbnQlMjB2ZW51ZSUyMGNvcnBvcmF0ZXxlbnwxfHx8fDE3NzA1NTQyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      promoted: true,
    },
    {
      id: "corp3",
      name: "Celebration Hall Worli",
      type: "Function Room",
      location: "Worli, Mumbai",
      tags: ["AV EQUIPMENT", "CATERING", "VALET PARKING", "WIFI"],
      capacity: "150-300",
      price: "₹45,000/day",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1762765684665-6b6855bb6fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5xdWV0JTIwaGFsbCUyMGV2ZW50JTIwdmVudWV8ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      offer: "10% OFF",
    },
    {
      id: "corp4",
      name: "Premium Event Space",
      type: "Premium Event Hall",
      location: "Andheri (West), Mumbai",
      tags: ["LED WALL", "STAGE", "CATERING", "GREEN ROOM"],
      capacity: "100-250",
      price: "₹35,000/day",
      rating: "4.6",
      image: "https://images.unsplash.com/photo-1767096684353-a979c6fe02ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb290dG9wJTIwZXZlbnQlMjB2ZW51ZSUyMGNvcnBvcmF0ZXxlbnwxfHx8fDE3NzA1NTQyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
    },
    {
      id: "corp5",
      name: "Corporate Celebration Center",
      type: "Event Space",
      location: "Powai, Mumbai",
      tags: ["MODULAR SETUP", "CATERING", "WIFI", "AMPLE PARKING"],
      capacity: "80-180",
      price: "₹30,000/day",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1762765684665-6b6855bb6fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5xdWV0JTIwaGFsbCUyMGV2ZW50JTIwdmVudWV8ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      promoted: true,
      offer: "20% OFF",
    },
    {
      id: "corp6",
      name: "Elegance Banquet",
      type: "Grand Ballroom",
      location: "Goregaon (East), Mumbai",
      tags: ["LUXURY DECOR", "CATERING", "BAR SERVICE", "PARKING"],
      capacity: "250-500",
      price: "₹60,000/day",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1767096684353-a979c6fe02ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb290dG9wJTIwZXZlbnQlMjB2ZW51ZSUyMGNvcnBvcmF0ZXxlbnwxfHx8fDE3NzA1NTQyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      offer: "12% OFF",
    },
    {
      id: "corp7",
      name: "Vista Terrace Events",
      type: "Function Room",
      location: "Bandra (West), Mumbai",
      tags: ["OUTDOOR SPACE", "CATERING", "LIVE MUSIC SETUP", "WIFI"],
      capacity: "60-150",
      price: "₹28,000/day",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1762765684665-6b6855bb6fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5xdWV0JTIwaGFsbCUyMGV2ZW50JTIwdmVudWV8ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
    },
    {
      id: "corp8",
      name: "Summit Conference & Events",
      type: "Function Room",
      location: "Nariman Point, Mumbai",
      tags: ["FLEXIBLE LAYOUT", "AV EQUIPMENT", "CATERING", "VALET"],
      capacity: "120-300",
      price: "₹48,000/day",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1767096684353-a979c6fe02ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb290dG9wJTIwZXZlbnQlMjB2ZW51ZSUyMGNvcnBvcmF0ZXxlbnwxfHx8fDE3NzA1NTQyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      promoted: true,
    },
    {
      id: "corp9",
      name: "Royal Celebrations",
      type: "Grand Ballroom",
      location: "Malad (West), Mumbai",
      tags: ["PREMIUM AMENITIES", "FULL CATERING", "STAGE", "PARKING"],
      capacity: "300-600",
      price: "₹70,000/day",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1762765684665-6b6855bb6fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5xdWV0JTIwaGFsbCUyMGV2ZW50JTIwdmVudWV8ZW58MXx8fHwxNzcwNTU0Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "corporate",
      offer: "18% OFF",
    },
  ];

  const partnerSpaceCards = useMemo((): SpaceCard[] => {
    return loadCorporateApprovedListings()
      .filter((l) => listingProfileIncludes(l.listingProfileIds, "space"))
      .map((l) => {
        const text = `${l.listingTitle} ${l.shortDescription}`.toLowerCase();
        let category: SpaceCard["category"] = "casual";
        if (/conference|boardroom|seminar|training/.test(text)) category = "conference";
        else if (/ballroom|banquet|gala|event venue|function|auditorium/.test(text))
          category = "corporate";
        return {
          id: `adm-${l.listingId}`,
          name: l.listingTitle,
          type: "Partner listing",
          location: l.location,
          tags: ["PARTNER", "APPROVED", l.businessName.toUpperCase().slice(0, 16)],
          capacity: "On request",
          price: "On request",
          rating: "New",
          image:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          category,
          promoted: true,
          offer: "New partner",
        };
      });
  }, [corpListingTick]);

  const spaces: SpaceCard[] = useMemo(
    () => [...partnerSpaceCards, ...staticSpaces],
    [partnerSpaceCards, staticSpaces]
  );

  const categories: SpaceXCategoryTab[] = [
    {
      id: "conference",
      label: "Conference",
      icon: Presentation,
      color: "#0F766E",
    },
    {
      id: "coworking",
      label: "Co Working",
      icon: BriefcaseBusiness,
      color: "#0369A1",
    },
    {
      id: "casual",
      label: "Casual",
      icon: Coffee,
      color: "#B45309",
    },
    {
      id: "corporate",
      label: "Corporate Events Space",
      icon: CalendarDays,
      color: "#DC2626",
    },
  ];


  // Clear all filters function
  const clearAllFilters = () => {
    setAmenities({
      wifi: false,
      printing: false,
      meetingRooms: false,
      phoneBooths: false,
      lounge: false,
      parking: false,
    });
    setQuality({
      premium: false,
      professional: false,
      standard: false,
      budgetFriendly: false,
    });
    setLayout({
      option1: false,
      option2: false,
      option3: false,
      option4: false,
    });
    setRatings({
      fiveStar: false,
      fourStar: false,
      threeStar: false,
      twoStar: false,
      oneStar: false,
    });
    setCapacityMin("");
    setCapacityMax("");
    setPriceMin("");
    setPriceMax("");
    setSearchLocation("");
    setSearchAttendees("");
    setSearchCheckIn("");
    setSearchCheckOut("");
    setPaymentModeFilter("all");
    setPaymentTermFilter("all");
    setPricingTypeFilter("all");
    setSortBy("recommended");
    setModuleFilter("dspace");
    setMasterCategoryFilter("all");
    setSourceFilter("all");
    setCurrentPage(1);
  };

  const getPaymentModeLabel = (mode: SpaceCard["paymentMode"]) => {
    switch (mode) {
      case "wallet":
        return "Corporate Credit";
      case "net_banking":
        return "Net Banking";
      case "neft_rtgs":
        return "NEFT/RTGS";
      case "gateway":
      default:
        return "Gateway";
    }
  };

  const getPaymentTermLabel = (term: SpaceCard["paymentTerm"]) => {
    switch (term) {
      case "advance_100":
        return "100% Advance";
      case "partial_50":
        return "50% + Balance";
      case "net_30":
      default:
        return "Net 30";
    }
  };

  const getPricingTypeLabel = (pricingType: SpaceCard["pricingType"]) => {
    switch (pricingType) {
      case "transparent":
        return "Book Now";
      case "offer":
        return "Offer Price";
      case "on_request":
      default:
        return "On Request";
    }
  };

  // Get category-specific amenities
  const getAmenitiesOptions = () => {
    if (isConferenceLikeCategory) {
      return [
        { key: "wifi", label: "High-Speed WiFi" },
        { key: "printing", label: "Projector & Screen" },
        { key: "meetingRooms", label: "Video Conferencing" },
        { key: "phoneBooths", label: "Whiteboard/Flipchart" },
        { key: "lounge", label: "Catering Available" },
        { key: "parking", label: "Parking Facility" },
      ];
    } else if (selectedCategory === "casual") {
      return [
        { key: "wifi", label: "WiFi Access" },
        { key: "printing", label: "TV/Display Screen" },
        { key: "meetingRooms", label: "Whiteboard" },
        { key: "phoneBooths", label: "Natural Light" },
        { key: "lounge", label: "Refreshments/Coffee" },
        { key: "parking", label: "Comfortable Seating" },
      ];
    } else {
      // corporate
      return [
        { key: "wifi", label: "WiFi & Internet" },
        { key: "printing", label: "Stage & AV Setup" },
        { key: "meetingRooms", label: "Full Catering" },
        { key: "phoneBooths", label: "Bar Service" },
        { key: "lounge", label: "Valet Parking" },
        { key: "parking", label: "Sound System" },
      ];
    }
  };

  // Get category-specific room types
  const getRoomTypes = () => {
    if (isConferenceLikeCategory) {
      return [
        { key: "premium", label: "Executive Boardroom", badge: "Premium" },
        { key: "professional", label: "Conference Hall", badge: "Professional" },
        { key: "standard", label: "Training Room", badge: "Standard" },
        { key: "budgetFriendly", label: "Seminar Room", badge: "Budget" },
      ];
    } else if (selectedCategory === "casual") {
      return [
        { key: "premium", label: "Premium Lounge", badge: "Premium" },
        { key: "professional", label: "Discussion Room", badge: "Professional" },
        { key: "standard", label: "Huddle Space", badge: "Standard" },
        { key: "budgetFriendly", label: "Café Style Room", badge: "Budget" },
      ];
    } else {
      // corporate
      return [
        { key: "premium", label: "Grand Ballroom", badge: "Luxury" },
        { key: "professional", label: "Event Hall", badge: "Premium" },
        { key: "standard", label: "Function Room", badge: "Standard" },
        { key: "budgetFriendly", label: "Activity Space", badge: "Budget" },
      ];
    }
  };

  // Get category-specific layout options
  const getLayoutOptions = () => {
    if (isConferenceLikeCategory) {
      return [
        { key: "option1", label: "Boardroom" },
        { key: "option2", label: "U-Shape" },
        { key: "option3", label: "Classroom" },
        { key: "option4", label: "Theater" },
      ];
    } else if (selectedCategory === "casual") {
      return [
        { key: "option1", label: "Lounge Seating" },
        { key: "option2", label: "Café Style" },
        { key: "option3", label: "Outdoor" },
        { key: "option4", label: "Indoor" },
      ];
    } else {
      // corporate
      return [
        { key: "option1", label: "Theater" },
        { key: "option2", label: "Banquet" },
        { key: "option3", label: "Cluster" },
        { key: "option4", label: "Standing" },
      ];
    }
  };

  // Get category-specific capacity range
  const getCapacityRange = () => {
    if (isConferenceLikeCategory) {
      return { min: 4, max: 30, label: "4 - 30 people" };
    } else if (selectedCategory === "casual") {
      return { min: 2, max: 15, label: "2 - 15 people" };
    } else {
      // corporate
      return { min: 20, max: 100, label: "20 - 100 people" };
    }
  };

  // Get category-specific price range
  const getPriceRange = () => {
    if (isConferenceLikeCategory) {
      return { min: 0, max: 20000, label: "₹0 - ₹20,000/hr", increment: 500 };
    } else if (selectedCategory === "casual") {
      return { min: 0, max: 5000, label: "₹0 - ₹5,000/hr", increment: 50 };
    } else {
      // corporate
      return { min: 0, max: 100000, label: "₹0 - ₹1,00,000/day", increment: 2000 };
    }
  };

  // Helper function to parse capacity range
  const parseCapacity = (capacityStr: string): { min: number; max: number } => {
    const parts = capacityStr.split("-");
    return {
      min: parseInt(parts[0]) || 0,
      max: parseInt(parts[1]) || 999,
    };
  };

  // Helper function to parse price
  const parsePrice = (priceStr: string): number => {
    return parseInt(priceStr.replace(/[₹,\/hrdaymo]/g, "")) || 0;
  };

  const publishedConfig = (() => {
    try {
      const raw = localStorage.getItem("vendorSpaceListingConfig");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        pricingMode?: "fixed" | "negotiable" | "on_request";
        paymentMode?: "wallet" | "net_banking" | "neft_rtgs" | "gateway";
        paymentTerm?: "advance_100" | "partial_50" | "net_30";
      };
      return parsed;
    } catch {
      return null;
    }
  })();

  const enrichedSpaces: SpaceCard[] = spaces.map((space, index) => {
    const pricingFallback: SpaceCard["pricingType"] =
      index % 3 === 0 ? "transparent" : index % 3 === 1 ? "offer" : "on_request";
    const paymentModeFallback: SpaceCard["paymentMode"] =
      index % 4 === 0 ? "gateway" : index % 4 === 1 ? "wallet" : index % 4 === 2 ? "net_banking" : "neft_rtgs";
    const paymentTermFallback: SpaceCard["paymentTerm"] =
      index % 3 === 0 ? "advance_100" : index % 3 === 1 ? "partial_50" : "net_30";

    const publishedPricingType: SpaceCard["pricingType"] =
      publishedConfig?.pricingMode === "fixed"
        ? "transparent"
        : publishedConfig?.pricingMode === "negotiable"
        ? "offer"
        : publishedConfig?.pricingMode === "on_request"
        ? "on_request"
        : undefined;

    // Apply latest vendor published configuration for promoted spaces in same category.
    if (space.promoted && space.category === selectedCategory) {
      return {
        ...space,
        pricingType: publishedPricingType || pricingFallback,
        paymentMode: publishedConfig?.paymentMode || paymentModeFallback,
        paymentTerm: publishedConfig?.paymentTerm || paymentTermFallback,
      };
    }

    return {
      ...space,
      pricingType: pricingFallback,
      paymentMode: paymentModeFallback,
      paymentTerm: paymentTermFallback,
    };
  });

  // Filter spaces based on all active filters
  const filteredSpaces = enrichedSpaces.filter((space) => {
    if (moduleFilter !== "all" && moduleFilter !== "dspace") return false;

    // Category filter - ALWAYS filter by selected category
    if (space.category !== selectedCategory) {
      return false;
    }

    const dspaceCategoryHints: Record<string, string[]> = {
      "Conference & Boardroom": ["conference", "boardroom", "meeting"],
      "Event Hall & Banquet": ["event hall", "banquet", "ballroom"],
      "Rooftop & Terrace": ["rooftop", "terrace"],
      "Outdoor & Lawn": ["outdoor", "lawn", "garden"],
      "Co-working & Studio": ["cowork", "studio", "workspace"],
      "Farmhouse & Resort": ["farmhouse", "resort"],
      "Hotel Banquet": ["hotel", "banquet"],
      "Unique & Offbeat Venues": ["unique", "offbeat", "creative"],
    };
    if (masterCategoryFilter !== "all") {
      const blob = `${space.name} ${space.type} ${space.tags.join(" ")}`.toLowerCase();
      const hints = dspaceCategoryHints[masterCategoryFilter] ?? [];
      if (!hints.some((hint) => blob.includes(hint))) return false;
    }

    // Location filter
    if (searchLocation && !space.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }

    if (searchCheckIn && searchCheckOut) {
      if (new Date(searchCheckIn).getTime() > new Date(searchCheckOut).getTime()) return false;
    }

    // Attendees/Capacity filter from search
    if (searchAttendees) {
      const attendees = parseInt(searchAttendees);
      const spaceCapacity = parseCapacity(space.capacity);
      if (attendees < spaceCapacity.min || attendees > spaceCapacity.max) {
        return false;
      }
    }

    // Capacity range filter from sidebar
    if (capacityMin || capacityMax) {
      const spaceCapacity = parseCapacity(space.capacity);
      const minCap = capacityMin ? parseInt(capacityMin) : 0;
      const maxCap = capacityMax ? parseInt(capacityMax) : 999;
      if (spaceCapacity.max < minCap || spaceCapacity.min > maxCap) {
        return false;
      }
    }

    // Price range filter
    if (priceMin || priceMax) {
      const spacePrice = parsePrice(space.price);
      const minPrice = priceMin ? parseInt(priceMin) : 0;
      const maxPrice = priceMax ? parseInt(priceMax) : 999999;
      if (spacePrice < minPrice || spacePrice > maxPrice) {
        return false;
      }
    }

    if (!matchesPriceRange(parsePriceLike(space.price), priceMin ? Number(priceMin) : undefined, priceMax ? Number(priceMax) : undefined)) {
      return false;
    }

    const isLegacyMogzu = /^(conf|cas|corp)/.test(space.id);
    if (!matchesSourceFilter(sourceFilter, isLegacyMogzu)) return false;

    if (paymentModeFilter !== "all" && space.paymentMode !== paymentModeFilter) {
      return false;
    }

    if (paymentTermFilter !== "all" && space.paymentTerm !== paymentTermFilter) {
      return false;
    }

    if (pricingTypeFilter !== "all" && space.pricingType !== pricingTypeFilter) {
      return false;
    }

    // Rating filter
    const ratingFiltersActive = Object.values(ratings).some((v) => v);
    if (ratingFiltersActive) {
      const spaceRating = parseFloat(space.rating);
      const matchesRating =
        (ratings.fiveStar && spaceRating >= 4.5) ||
        (ratings.fourStar && spaceRating >= 4.0 && spaceRating < 4.5) ||
        (ratings.threeStar && spaceRating >= 3.0 && spaceRating < 4.0) ||
        (ratings.twoStar && spaceRating >= 2.0 && spaceRating < 3.0) ||
        (ratings.oneStar && spaceRating < 2.0);
      if (!matchesRating) return false;
    }

    // Amenities filter (check tags - category-specific matching)
    const amenitiesActive = Object.values(amenities).some((v) => v);
    if (amenitiesActive) {
      const spaceTags = space.tags.map((t) => t.toLowerCase());
      let hasMatchingAmenity = false;

      if (isConferenceLikeCategory) {
        hasMatchingAmenity =
          (amenities.wifi && spaceTags.some((t) => t.includes("wifi"))) ||
          (amenities.printing && spaceTags.some((t) => t.includes("projector") || t.includes("screen") || t.includes("dual"))) ||
          (amenities.meetingRooms && spaceTags.some((t) => t.includes("video") || t.includes("conferencing"))) ||
          (amenities.phoneBooths && spaceTags.some((t) => t.includes("whiteboard"))) ||
          (amenities.lounge && spaceTags.some((t) => t.includes("catering"))) ||
          (amenities.parking && spaceTags.some((t) => t.includes("recording")));
      } else if (selectedCategory === "casual") {
        hasMatchingAmenity =
          (amenities.wifi && spaceTags.some((t) => t.includes("wifi"))) ||
          (amenities.printing && spaceTags.some((t) => t.includes("projector") || t.includes("screen") || t.includes("tv"))) ||
          (amenities.meetingRooms && spaceTags.some((t) => t.includes("whiteboard"))) ||
          (amenities.phoneBooths && spaceTags.some((t) => t.includes("video") || t.includes("conferencing"))) ||
          (amenities.lounge && spaceTags.some((t) => t.includes("refreshments") || t.includes("coffee") || t.includes("snacks"))) ||
          (amenities.parking && spaceTags.some((t) => t.includes("comfortable") || t.includes("seating")));
      } else {
        // corporate
        hasMatchingAmenity =
          (amenities.wifi && spaceTags.some((t) => t.includes("wifi"))) ||
          (amenities.printing && spaceTags.some((t) => t.includes("av") || t.includes("stage") || t.includes("led"))) ||
          (amenities.meetingRooms && spaceTags.some((t) => t.includes("catering"))) ||
          (amenities.phoneBooths && spaceTags.some((t) => t.includes("bar"))) ||
          (amenities.lounge && spaceTags.some((t) => t.includes("valet") || t.includes("parking"))) ||
          (amenities.parking && spaceTags.some((t) => t.includes("green") || t.includes("room")));
      }
      
      if (!hasMatchingAmenity) return false;
    }

    // Quality/Room Type filter (filter by space type)
    const qualityFiltersActive = Object.values(quality).some((v) => v);
    if (qualityFiltersActive) {
      const spaceType = space.type.toLowerCase();
      let matchesQuality = false;

      if (isConferenceLikeCategory) {
        matchesQuality =
          (quality.premium && (spaceType.includes("executive") || spaceType.includes("boardroom"))) ||
          (quality.professional && (spaceType.includes("conference") || spaceType.includes("professional"))) ||
          (quality.standard && (spaceType.includes("training") || spaceType.includes("meeting"))) ||
          (quality.budgetFriendly && (spaceType.includes("seminar") || spaceType.includes("center")));
      } else if (selectedCategory === "casual") {
        matchesQuality =
          (quality.premium && (spaceType.includes("lounge") || spaceType.includes("collaboration"))) ||
          (quality.professional && (spaceType.includes("discussion") || spaceType.includes("workshop"))) ||
          (quality.standard && (spaceType.includes("huddle") || spaceType.includes("brainstorm") || spaceType.includes("creative") || spaceType.includes("small group"))) ||
          (quality.budgetFriendly && (spaceType.includes("express") || spaceType.includes("nest") || spaceType.includes("quick")));
      } else {
        // corporate
        matchesQuality =
          (quality.premium && (spaceType.includes("ballroom") || spaceType.includes("banquet") || spaceType.includes("grand"))) ||
          (quality.professional && (spaceType.includes("event hall") || spaceType.includes("premium") || spaceType.includes("rooftop"))) ||
          (quality.standard && (spaceType.includes("function") || spaceType.includes("multi-purpose") || spaceType.includes("terrace"))) ||
          (quality.budgetFriendly && (spaceType.includes("event space") || spaceType.includes("celebration")));
      }
      
      if (!matchesQuality) return false;
    }

    // Layout/Event setup filter
    const layoutFiltersActive = Object.values(layout).some((v) => v);
    if (layoutFiltersActive) {
      const selectedLayoutLabels = getLayoutOptions()
        .filter(({ key }) => layout[key as keyof typeof layout])
        .map(({ label }) => label.toLowerCase());
      const blob = `${space.name} ${space.type} ${space.tags.join(" ")}`.toLowerCase();
      const matchesLayout = selectedLayoutLabels.some((label) => {
        const tokens = label.split(/[^a-z0-9]+/).filter((token) => token.length > 2);
        return tokens.some((token) => blob.includes(token));
      });
      if (!matchesLayout) return false;
    }

    return true;
  });

  const sortedSpaces = [...filteredSpaces].sort((a, b) => {
    if (sortBy === "price_low_high") return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === "price_high_low") return parsePrice(b.price) - parsePrice(a.price);
    if (sortBy === "rating_high_low") return parseFloat(b.rating) - parseFloat(a.rating);
    if (sortBy === "distance_nearest") return a.location.localeCompare(b.location);
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedSpaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSpaces = sortedSpaces.slice(startIndex, endIndex);

  const goToPrevCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0;
      return { ...prev, [cardId]: (current - 1 + total) % total };
    });
  };

  const goToNextCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0;
      return { ...prev, [cardId]: (current + 1) % total };
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToSpaceListingDetail = (space: SpaceCard) => {
    const q = new URLSearchParams({ category: space.category });
    navigate(`/dspace/classic/spaces/${encodeURIComponent(space.id)}?${q.toString()}`, {
      state: {
        category: space.category,
        space: {
          id: space.id,
          name: space.name,
          type: space.type,
          location: space.location,
          capacity: space.capacity,
          price: space.price,
          rating: space.rating,
          image: space.image,
          tags: space.tags,
        },
      },
    });
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "p1d971400" },
    {
      id: "activity",
      label: "Activity Suite",
      icon: "p2c29c800",
    },
    { id: "bookings", label: "Bookings", icon: "paf72c00" },
    { id: "favorites", label: "Favorites", icon: "p27070280" },
    { id: "users", label: "Users", icon: "p29193540" },
    {
      id: "notification",
      label: "Notification",
      icon: "p4e64800",
    },
    {
      id: "communication",
      label: "Communication",
      icon: "p319d300",
    },
    { id: "report", label: "Report", icon: "p1f81a280" },
    {
      id: "transactions",
      label: "Transactions",
      icon: "p2683f80",
    },
    { id: "settings", label: "Settings", icon: "pde1bb00" },
  ];

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Left Sidebar Navigation */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="spacex"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button
                  onClick={() => navigate("/activitysuite")}
                  className="text-[#7b879a] font-medium hover:text-[#2563eb] transition-colors"
                >
                  Activity Suite
                </button>
                <ChevronDown className="w-4 h-4 text-[#a0aec0] rotate-[-90deg]" />
                <span className="text-[#0e1e3f] font-semibold tracking-tight">D Space</span>
              </div>
            </div>
          </div>

          {/* D Space header with tabs */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-2">
              <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold text-[#0e1e3f] leading-none">
                D Space
              </h1>
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => navigate("/dspace")}
                  className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Home
                </button>
                <button
                  onClick={() => setSelectedTab("meetings")}
                  className={`h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] ${
                    selectedTab === "meetings"
                      ? "font-semibold border-[1.5px] border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]"
                      : "font-medium border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5"
                  }`}
                  style={
                    selectedTab === "meetings"
                      ? {
                          backgroundImage:
                            "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                        }
                      : {}
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                  >
                    <path
                      d={svgPaths.p11a5d600}
                      fill={
                        selectedTab === "meetings"
                          ? "#2563EB"
                          : "#4F46E5"
                      }
                    />
                  </svg>
                  Meetings
                </button>
                <button
                  onClick={() => navigate("/activities")}
                  className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                  >
                    <path
                      d={svgPaths.p9bd8700}
                      fill="#FF5E00"
                    />
                  </svg>
                  Activities
                </button>
                <button
                  onClick={() => navigate("/stay")}
                  className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                  >
                    <path
                      d={svgPaths.p30609c00}
                      fill="#15D39D"
                    />
                  </svg>
                  Stay
                </button>
                <button
                  onClick={() => navigate("/promotions")}
                  className="h-9 flex items-center gap-2 px-4 rounded-full text-[14px] font-medium transition-all duration-200 border-[1.5px] border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                  >
                    <path
                      d={svgPaths.pd9fb4c0}
                      fill="#9B51E0"
                    />
                  </svg>
                  Promotions
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Banner Carousel */}
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className="group relative overflow-hidden rounded-3xl border border-white/60 h-[200px] mb-6 bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(37,99,235,0.18)]">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
              <div className="relative h-[200px] overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="min-w-full relative h-full"
                    style={{}}
                  >
                    {/* Background Pattern */}
                    <div className="absolute flex h-full items-center justify-center right-0 top-0 w-1/2 mix-blend-hard-light overflow-hidden">
                      <div className="transform rotate-180 scale-y-[-1] h-full">
                        <img
                          src={imgImage24995}
                          alt=""
                          className="h-full w-auto object-cover opacity-30"
                        />
                      </div>
                    </div>

                    <div className="relative h-full px-8 py-6 flex items-center justify-between">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="#fbbf24"
                            />
                            <text
                              x="12"
                              y="16"
                              fontSize="14"
                              textAnchor="middle"
                              fill="white"
                              fontWeight="bold"
                            >
                              !
                            </text>
                          </svg>
                          <span className="text-[12px] font-medium text-[#475569]">
                            By {banner.vendor}
                          </span>
                        </div>
                        <h3 className="text-[24px] font-bold text-[#0e1e3f] leading-tight line-clamp-2 mb-1.5">
                          {banner.title}
                        </h3>
                        <p className="text-[14px] text-[#64748b] leading-[1.6] mb-5 max-w-[560px] line-clamp-2">
                          {banner.description}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setBannerActionNotice(
                              `Offer “${banner.title}”: full details and booking will open here in a future release.`,
                            )
                          }
                          className="h-11 px-6 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[14px] font-semibold shadow-[0_10px_22px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                        >
                          View offer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`transition-all rounded-full ${
                      index === currentSlide
                        ? "w-6 h-1.5 bg-[#4379ee]"
                        : "w-1.5 h-1.5 bg-[#cbd5e1]"
                    }`}
                  />
                ))}
              </div>
              </div>

              {bannerActionNotice && (
                <div
                  className="px-4 py-2.5 bg-[#eff6ff] border-t border-[#bfdbfe] text-xs text-[#1e40af] leading-relaxed"
                  role="status"
                >
                  {bannerActionNotice}
                </div>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="max-w-7xl mx-auto px-6 py-1 mb-5">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.id === "coworking") {
                      navigate("/coworking");
                    } else {
                      setSelectedCategory(category.id);
                      clearAllFilters();
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
                            "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                        }
                      : undefined
                  }
                >
                  {(() => {
                    const CategoryIcon = category.icon;
                    return (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <CategoryIcon className="h-4.5 w-4.5" color={category.color} strokeWidth={2.2} />
                      </span>
                    );
                  })()}
                  <span className={`text-[14px] ${selectedCategory === category.id ? "font-semibold" : "font-medium"}`}>
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters and Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 flex flex-col lg:flex-row gap-4">
            {/* Left Sidebar - Filters */}
            <aside className="w-full lg:w-[240px] flex-shrink-0">
              <div className="bg-white/55 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_16px_36px_rgba(37,99,235,0.16)]">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">
                    Filters
                  </h3>
                  <button 
                    onClick={clearAllFilters}
                    className="text-[13px] font-medium text-[#4379ee] underline hover:text-[#3568dd]"
                  >
                    Clear all
                  </button>
                </div>

                <div className="border-t border-slate-200/70 pt-3">
                  {/* Amenities */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">
                      Amenities
                    </h4>
                    <div className="space-y-2">
                      {getAmenitiesOptions().map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-start gap-2 cursor-pointer group"
                        >
                          <div className="w-4 h-4 flex-shrink-0">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              {amenities[
                                key as keyof typeof amenities
                              ] ? (
                                <>
                                  <path
                                    d={svgPaths.p1a9bcb00}
                                    fill="#4379EE"
                                  />
                                  <path
                                    d={svgPaths.p6e92a00}
                                    fill="white"
                                  />
                                </>
                              ) : (
                                <path
                                  d={svgPaths.p3df62560}
                                  fill="#E3E3E5"
                                />
                              )}
                            </svg>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              amenities[
                                key as keyof typeof amenities
                              ]
                            }
                            onChange={(e) => {
                              setAmenities({
                                ...amenities,
                                [key]: e.target.checked,
                              });
                              setCurrentPage(1);
                            }}
                            className="sr-only"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#475569] group-hover:text-[#0e1e3f]">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#e2e5ed] my-3" />

                  {/* Quality */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">
                      {selectedCategory === "corporate" ? "Space Type" : "Room Type"}
                    </h4>
                    <div className="space-y-2">
                      {getRoomTypes().map(({ key, label, badge }) => (
                        <label
                          key={key}
                          className="flex items-start gap-2 cursor-pointer group"
                        >
                          <div className="w-4 h-4 flex-shrink-0">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              {quality[
                                key as keyof typeof quality
                              ] ? (
                                <>
                                  <path
                                    d={svgPaths.p443b100}
                                    fill="#4379EE"
                                  />
                                  <path
                                    d={svgPaths.p7735d80}
                                    fill="#4379EE"
                                  />
                                </>
                              ) : (
                                <path
                                  d={svgPaths.p443b100}
                                  fill="#E3E3E5"
                                />
                              )}
                            </svg>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              quality[
                                key as keyof typeof quality
                              ]
                            }
                            onChange={(e) => {
                              setQuality({
                                ...quality,
                                [key]: e.target.checked,
                              });
                              setCurrentPage(1);
                            }}
                            className="sr-only"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#475569] group-hover:text-[#0e1e3f] flex-1">
                            {label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            badge === "Luxury" ? "bg-[#fef3c7] text-[#92400e]" :
                            badge === "Premium" ? "bg-[#dbeafe] text-[#1e40af]" :
                            badge === "Professional" ? "bg-[#e0e7ff] text-[#4338ca]" :
                            badge === "Standard" ? "bg-[#f1f5f9] text-[#475569]" :
                            "bg-[#dcfce7] text-[#166534]"
                          }`}>
                            {badge}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#e2e5ed] my-3" />

                  {/* Layout/Setup */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">
                      {isConferenceLikeCategory ? "Room Layout" : selectedCategory === "casual" ? "Ambience" : "Event Setup"}
                    </h4>
                    <div className="space-y-2">
                      {getLayoutOptions().map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-start gap-2 cursor-pointer group"
                        >
                          <div className="w-4 h-4 flex-shrink-0">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              {layout[
                                key as keyof typeof layout
                              ] ? (
                                <>
                                  <path
                                    d={svgPaths.p443b100}
                                    fill="#4379EE"
                                  />
                                  <path
                                    d={svgPaths.p7735d80}
                                    fill="#4379EE"
                                  />
                                </>
                              ) : (
                                <path
                                  d={svgPaths.p443b100}
                                  fill="#E3E3E5"
                                />
                              )}
                            </svg>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              layout[
                                key as keyof typeof layout
                              ]
                            }
                            onChange={(e) => {
                              setLayout({
                                ...layout,
                                [key]: e.target.checked,
                              });
                              setCurrentPage(1);
                            }}
                            className="sr-only"
                          />
                          <span className="min-w-0 break-words text-xs leading-5 text-[#475569] group-hover:text-[#0e1e3f]">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#e2e5ed] my-3" />

                  {/* Customer Ratings */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">
                      Customer Ratings
                    </h4>
                    <div className="space-y-2">
                      {[
                        { key: "fiveStar", stars: 5, label: "& up" },
                        { key: "fourStar", stars: 4, label: "& up" },
                        { key: "threeStar", stars: 3, label: "& up" },
                        { key: "twoStar", stars: 2, label: "& up" },
                        { key: "oneStar", stars: 1, label: "& up" },
                      ].map(({ key, stars, label }) => (
                        <label
                          key={key}
                          className="flex items-start gap-2 cursor-pointer group min-w-0"
                        >
                          <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              {ratings[
                                key as keyof typeof ratings
                              ] ? (
                                <>
                                  <path
                                    d={svgPaths.p443b100}
                                    fill="#4379EE"
                                  />
                                  <path
                                    d={svgPaths.p7735d80}
                                    fill="#4379EE"
                                  />
                                </>
                              ) : (
                                <path
                                  d={svgPaths.p443b100}
                                  fill="#E3E3E5"
                                />
                              )}
                            </svg>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              ratings[
                                key as keyof typeof ratings
                              ]
                            }
                            onChange={(e) => {
                              setRatings({
                                ...ratings,
                                [key]: e.target.checked,
                              });
                              setCurrentPage(1);
                            }}
                            className="sr-only"
                          />
                          <div className="min-w-0 flex flex-wrap items-center gap-1.5">
                            <div className="flex shrink-0 gap-1">
                              {[...Array(stars)].map((_, i) => (
                                <svg
                                  key={i}
                                  width="14"
                                  height="14"
                                  viewBox="0 0 21 20"
                                  fill="none"
                                >
                                  <path
                                    d={svgPaths.p1f6e1200}
                                    fill="#FFCC47"
                                  />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm leading-5 text-[#475569]">{label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#e2e5ed] my-3" />

                  {/* Capacity */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-2">
                      Seating Capacity
                    </h4>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={capacityMin}
                        onChange={(e) => {
                          setCapacityMin(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full h-10 px-3 text-[13px] border border-slate-200/80 rounded-xl bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/25"
                      />
                      <span className="text-xs text-[#94A3B8]">
                        -
                      </span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={capacityMax}
                        onChange={(e) => {
                          setCapacityMax(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full h-10 px-3 text-[13px] border border-slate-200/80 rounded-xl bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/25"
                      />
                    </div>
                    <div className="mt-1 rounded-lg border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] text-[#475569]">
                      {getCapacityRange().label}
                    </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCapacityMin("2");
                          setCapacityMax("15");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        2 - 15
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapacityMin("16");
                          setCapacityMax("50");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        16 - 50
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapacityMin("51");
                          setCapacityMax("100");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        51 - 100
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapacityMin("100");
                          setCapacityMax("");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        100+
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        setCapacityMin("");
                        setCapacityMax("");
                        setCurrentPage(1);
                      }}
                      className="text-sm font-medium text-[#475569] underline hover:text-[#0e1e3f] mt-2 inline-flex"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="border-t border-[#e2e5ed] my-4" />

                  {/* Price */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#0e1e3f] mb-3">
                      {selectedCategory === "corporate" ? "Price (per day)" : "Price (per hour)"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={(e) => {
                          setPriceMin(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full h-10 px-3 text-[13px] border border-slate-200/80 rounded-xl bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/25"
                      />
                      <span className="text-xs text-[#94A3B8]">
                        -
                      </span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={(e) => {
                          setPriceMax(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full h-10 px-3 text-[13px] border border-slate-200/80 rounded-xl bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#4379ee]/25"
                      />
                    </div>
                    <div className="mt-1 rounded-lg border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] text-[#475569]">
                      {getPriceRange().label}
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPriceMin("0");
                          setPriceMax("5000");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        0 - 5k
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceMin("5001");
                          setPriceMax("10000");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        5k - 10k
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceMin("10001");
                          setPriceMax("20000");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        10k - 20k
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceMin("20000");
                          setPriceMax("");
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-[#dbe3f2] bg-white text-[12px] font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0e1e3f] transition-colors"
                      >
                        20k+
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        setPriceMin("");
                        setPriceMax("");
                        setCurrentPage(1);
                      }}
                      className="text-sm font-medium text-[#475569] underline hover:text-[#0e1e3f] mt-2 inline-flex"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="mt-4 w-full rounded-xl border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] leading-5 text-[#475569]">
                    Filters apply instantly as you select options
                  </p>
                </div>
              </div>
            </aside>

            {/* Right Content - Search and Grid */}
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by location"
                    className="w-full h-10 pl-10 pr-4 text-[14px] placeholder:text-[#878e9e] bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 justify-start md:justify-end">
                  <span className="text-[13px] text-[#878e9e]">Sort by:</span>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters((prev) => !prev)}
                    className="h-10 flex items-center gap-2 px-4 text-sm font-medium text-[#0e1e3f] bg-white/70 border border-[#e5e7eb] rounded-xl hover:border-[#93c5fd] transition-all"
                  >
                    {showAdvancedFilters ? "Compress Filters" : "Expand Filters"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Spaces Header + Filters */}
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#0e1e3f]">
                  {isConferenceLikeCategory 
                    ? "Trending Conference Spaces" 
                    : selectedCategory === "casual" 
                    ? "Trending Casual Meeting Spaces" 
                    : "Trending Corporate Event Venues"}
                </h2>
                <p className="text-xs text-[#878e9e]">
                  Showing {filteredSpaces.length} result{filteredSpaces.length !== 1 ? 's' : ''} {filteredSpaces.length !== spaces.length ? `(filtered from ${spaces.length})` : ''}
                </p>
                <div className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Campaign filters</div>
                <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value as "all" | "dspace" | "events" | "gifting")}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="dspace">Module: Dspace</option>
                    <option value="all">Module: All</option>
                    <option value="events">Module: Events</option>
                    <option value="gifting">Module: Gifting</option>
                  </select>
                  <select
                    value={masterCategoryFilter}
                    onChange={(e) => setMasterCategoryFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Category: All</option>
                    <option value="Conference & Boardroom">Conference & Boardroom</option>
                    <option value="Event Hall & Banquet">Event Hall & Banquet</option>
                    <option value="Rooftop & Terrace">Rooftop & Terrace</option>
                    <option value="Outdoor & Lawn">Outdoor & Lawn</option>
                    <option value="Co-working & Studio">Co-working & Studio</option>
                    <option value="Farmhouse & Resort">Farmhouse & Resort</option>
                    <option value="Hotel Banquet">Hotel Banquet</option>
                    <option value="Unique & Offbeat Venues">Unique & Offbeat Venues</option>
                  </select>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as CatalogueSourceFilter)}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Source: All</option>
                    <option value="mogzu">Source: ✦ By Mogzu</option>
                    <option value="vendor">Source: Vendor Partners</option>
                  </select>
                </div>
                {showAdvancedFilters && (
                  <>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Commercial filters</div>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "recommended" | "price_low_high" | "price_high_low" | "rating_high_low" | "distance_nearest")}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="price_low_high">Sort: Price Low-High</option>
                    <option value="price_high_low">Sort: Price High-Low</option>
                    <option value="rating_high_low">Sort: Rating</option>
                    <option value="distance_nearest">Sort: Distance</option>
                  </select>
                  <select
                    value={pricingTypeFilter}
                    onChange={(e) => setPricingTypeFilter(e.target.value as "all" | "transparent" | "offer" | "on_request")}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Pricing Type: All</option>
                    <option value="transparent">Book Now (Transparent)</option>
                    <option value="offer">Offer Price (Negotiable)</option>
                    <option value="on_request">On Request</option>
                  </select>
                  <select
                    value={paymentModeFilter}
                    onChange={(e) => setPaymentModeFilter(e.target.value as "all" | "wallet" | "net_banking" | "neft_rtgs" | "gateway")}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Payment Mode: All</option>
                    <option value="gateway">Razorpay Gateway</option>
                    <option value="wallet">Corporate Credit</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="neft_rtgs">NEFT / RTGS</option>
                  </select>
                  </div>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <select
                    value={paymentTermFilter}
                    onChange={(e) => setPaymentTermFilter(e.target.value as "all" | "advance_100" | "partial_50" | "net_30")}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  >
                    <option value="all">Payment Terms: All</option>
                    <option value="advance_100">100% Advance</option>
                    <option value="partial_50">50% Advance + Balance</option>
                    <option value="net_30">Net 30</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Attendees"
                    value={searchAttendees}
                    onChange={(e) => setSearchAttendees(e.target.value)}
                    className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={searchCheckIn}
                      onChange={(e) => setSearchCheckIn(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    />
                    <input
                      type="date"
                      value={searchCheckOut}
                      onChange={(e) => setSearchCheckOut(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-white/70 rounded-lg bg-white/65 backdrop-blur-md transition-all duration-200 hover:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                    />
                  </div>
                  </div>
                  </>
                )}
              </div>

              {compareLimitNotice && (
                <p
                  className="text-xs text-amber-900 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 mb-4"
                  role="status"
                >
                  {compareLimitNotice}
                </p>
              )}

              {/* Spaces Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                {isError ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
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
                ) : paginatedSpaces.length > 0 ? (
                  paginatedSpaces.map((space) => {
                  const cardId = String(space.id)
                  const slideImages = getListingSlideImages(
                    space.image,
                    buildUnsplashKeywordImage(`${space.name} ${space.location}`),
                    buildUnsplashKeywordImage(`${space.type} workspace ${space.category}`),
                    imgImage24995,
                    imgImage25005,
                    imgImage25007,
                  )
                  const activeIndex = cardImageIndexById[cardId] ?? 0
                  const activeImage = slideImages[activeIndex] || imgImage24995
                  const priceDisplay = getPriceDisplayParts(space.price)

                  return (
                  <div
                    key={space.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => goToSpaceListingDetail(space)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToSpaceListingDetail(space);
                      }
                    }}
                    className="group flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 backdrop-blur-md shadow-[0_10px_30px_rgba(37,99,235,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)] cursor-pointer"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={activeImage}
                        alt={space.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {slideImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Previous image for ${space.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              goToPrevCardImage(cardId, slideImages.length);
                            }}
                            className="absolute left-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm transition-colors hover:bg-white"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            aria-label={`Next image for ${space.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              goToNextCardImage(cardId, slideImages.length);
                            }}
                            className="absolute right-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm transition-colors hover:bg-white"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-2.5 left-1/2 z-[2] inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1">
                            {slideImages.slice(0, 5).map((_, dotIdx) => (
                              <span
                                key={`${space.id}-${dotIdx}`}
                                className={`h-1.5 rounded-full transition-all ${dotIdx === activeIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/55'}`}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}

                      {/* Heart Button - Top Right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLikedSpaces((prev) => ({
                            ...prev,
                            [space.id]: !prev[space.id],
                          }));
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full hover:bg-white transition-all shadow-sm z-10"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedSpaces[space.id] ? 'text-[#ff6b35]' : 'text-[#878e9e]'
                          }`}
                        />
                      </button>

                      {/* Compare Button - Top Left */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (compareList.length >= 3 && !compareList.find(i => i.id === space.id)) {
                            setCompareLimitNotice(
                              "You can compare up to 3 spaces. Remove one from the compare bar below to add another.",
                            );
                            return;
                          }
                          if (compareList.find(i => i.id === space.id)) {
                            setCompareList(prev => prev.filter(i => i.id !== space.id));
                          } else {
                            setCompareLimitNotice("");
                            setCompareList(prev => [...prev, { id: space.id, name: space.name, image: space.image, type: space.type }]);
                          }
                        }}
                        className={`absolute top-2 left-2 h-8 px-3 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-semibold transition-all shadow-[0_6px_16px_rgba(15,23,42,0.16)] z-10 inline-flex items-center ${
                          compareList.find(i => i.id === space.id) 
                            ? 'text-blue-600 border border-blue-600 bg-blue-50' 
                            : 'text-[#475569] hover:bg-white'
                        }`}
                      >
                        {compareList.find(i => i.id === space.id) ? 'Added to Compare' : 'Compare'}
                      </button>

                      {/* Bottom Overlay Bar - Corporate Style */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                        <div className="flex items-center justify-between">
                          {/* Left - Rating and Status Badges */}
                          <div className="flex items-center gap-1.5">
                            {/* Rating Badge */}
                            <div className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[#0e1e3f] rounded-md text-[10px] font-semibold flex items-center gap-0.5 shadow-[0_6px_14px_rgba(15,23,42,0.14)]">
                              <svg
                                width="8"
                                height="8"
                                viewBox="0 0 21 20"
                                fill="none"
                              >
                                <path
                                  d={svgPaths.p1f6e1200}
                                  fill="#FFCC47"
                                />
                              </svg>
                              {space.rating}
                            </div>

                            {/* Promoted Badge */}
                            {space.promoted && (
                              <div className="px-2 py-0.5 bg-[#ff6b35] text-white rounded-md text-[8px] font-bold uppercase tracking-wide shadow-[0_6px_14px_rgba(234,88,12,0.28)]">
                                Promoted
                              </div>
                            )}
                          </div>

                          {/* Right - Offer Badge */}
                          {space.offer && (
                            <div className="px-2 py-0.5 bg-[#fbbf24] text-white rounded-md text-[10px] font-bold shadow-[0_6px_14px_rgba(245,158,11,0.28)]">
                              {space.offer}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-[14px]">
                      <h3 className="text-[15px] font-semibold text-[#0e1e3f] leading-tight mb-1">
                        {space.name}
                      </h3>
                      <p className="text-[12px] text-[#878e9e] mb-2.5 line-clamp-1">
                        {space.type}
                      </p>
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        {space.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#fff7ed] text-[#fa8d40] text-[10px] font-semibold rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-[#ebf1ff] text-[#2563eb] text-[10px] font-semibold rounded-md">
                          {getPricingTypeLabel(space.pricingType)}
                        </span>
                        <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#0e1e3f] text-[10px] font-semibold rounded-md">
                          {getPaymentModeLabel(space.paymentMode)}
                        </span>
                        <span className="px-2 py-0.5 bg-[#fff7ed] text-[#fa8d40] text-[10px] font-semibold rounded-md">
                          {getPaymentTermLabel(space.paymentTerm)}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-[#878e9e] mb-1.5">
                        <svg
                          width="8"
                          height="10"
                          viewBox="0 0 18 24"
                          fill="none"
                        >
                          <path
                            d={svgPaths.p7c19b40}
                            fill="currentColor"
                          />
                        </svg>
                        <span className="line-clamp-1">
                          {space.location}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-[#878e9e] mb-4">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="9"
                            cy="7"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{space.capacity}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#878e9e] mb-0.5">
                            Starting at
                          </p>
                          <p className="text-[20px] leading-none font-extrabold tracking-tight text-[#0e1e3f]">
                            {priceDisplay.amount}
                            {priceDisplay.unit ? (
                              <span className="ml-1 text-[12px] font-semibold text-[#64748b]">
                                {priceDisplay.unit}
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSpaceListingDetail(space);
                          }}
                          className="h-11 px-5 bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white text-[13px] font-semibold rounded-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_10px_22px_rgba(37,99,235,0.28)]"
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                )})
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0e1e3f] mb-2">
                      No spaces found
                    </h3>
                    <p className="text-sm text-[#878e9e] mb-4">
                      Try adjusting your filters to see more results
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-[#4379ee] text-white rounded-full text-sm font-medium hover:bg-[#3568dd] transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredSpaces.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 py-4 mt-auto">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-[#0e1e3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#4379ee] text-white shadow-sm"
                              : "hover:bg-gray-100 text-[#475569]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="w-8 h-8 flex items-center justify-center text-[#878e9e] text-xs">
                          ...
                        </span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#475569] text-xs font-medium transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-[#0e1e3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {compareList.length > 0 && (
        <CompareWidget 
          items={compareList} 
          onRemoveItem={(id) => setCompareList(prev => prev.filter(item => item.id !== id))} 
          onClearAll={() => setCompareList([])} 
        />
      )}
    </div>
  );
}
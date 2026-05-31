import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Users, MapPin, Grid3x3, Gamepad2, Mountain, Trophy, UsersRound, Palette, Sparkles, UtensilsCrossed, MonitorPlay, Plane, Crown, AlertCircle, type LucideIcon } from 'lucide-react';
import { WishlistHeart } from './global/WishlistHeart';
import svgPaths from '@/imports/svg-xho44kfymu';
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgImage24995 from "figma:asset/3fd0634bc82e44a536b4f08060cd6f224c13e9e8.png";
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import dashboardSvgPaths from '../../imports/svg-camfkj9vq4';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildUnsplashKeywordImage, getListingSlideImages, getPriceDisplayParts } from './dspaceCardUtils';
import {
  approvedActivityListingToActivityRow,
  CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT,
  listingProfileIncludes,
  loadCorporateApprovedListings,
} from '@/app/lib/corporateApprovedListingsStorage';
import {
  CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT,
  loadActiveCorporatePromotionsForSector,
} from '@/app/lib/corporateAdminPromotionsStorage';
import { db } from '@/lib/db';
import type { Listing, ListingImage } from '@/lib/database.types';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400', path: '/dashboard' },
  { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800', path: '/activitysuite' },
  { id: 'bookings', label: 'Bookings', icon: 'paf72c00', path: '/bookings' },
  { id: 'favorites', label: 'Favorites', icon: 'p27070280', path: '/favourites' },
  { id: 'users', label: 'Users', icon: 'p29193540', path: '/user-management' },
  { id: 'notification', label: 'Notification', icon: 'p4e64800', path: '/corporate/notifications' },
  { id: 'communication', label: 'Communication', icon: 'p319d300', path: '/communication' },
  { id: 'report', label: 'Report', icon: 'p1f81a280', path: '/corporate/spend-report' },
  { id: 'transactions', label: 'Transactions', icon: 'p2683f80', path: '/corporate/transactions' },
  { id: 'settings', label: 'Settings', icon: 'pde1bb00', path: '/settings/workflow' },
];

interface Activity {
  id: number;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  teamSize: string;
  image: string;
  location: string;
  rating: number;
  price: string;
}

function uuidToNumber(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function listingToActivity(l: Listing & { listing_images?: ListingImage[] }): Activity {
  const meta = (l.metadata ?? {}) as Record<string, unknown>;
  const rawTags = meta.tags;
  const tags = Array.isArray(rawTags) ? rawTags.filter((t): t is string => typeof t === 'string') : [];
  const category = typeof meta.category === 'string' ? meta.category : 'Activity';
  const teamSize =
    l.min_capacity != null && l.max_capacity != null
      ? `${l.min_capacity}-${l.max_capacity} people`
      : l.max_capacity != null
        ? `Up to ${l.max_capacity} people`
        : 'Any team size';
  const rating = typeof meta.rating === 'number' ? meta.rating : 4.5;
  const priceLabel =
    l.base_price != null
      ? `₹${l.base_price.toLocaleString('en-IN')}${l.price_unit ? `/${l.price_unit.replace('_', ' ')}` : ''}`
      : 'On request';
  return {
    id: uuidToNumber(l.id),
    category,
    subcategory: l.title,
    description: l.description ?? '',
    tags,
    teamSize,
    location: l.location_city ?? l.location_address ?? '',
    rating,
    price: priceLabel,
    image: l.title.toLowerCase(),
  };
}

// DEMO FALLBACK — shows when Supabase returns 0 rows
// Remove this fallback once real listings exist in Supabase
const DEMO_DATA_ACTIVITIES: Activity[] = [
  // Indoor Fun
  { id: 1, category: 'Indoor Fun', subcategory: 'Bowling Alley', description: 'Corporate-friendly bowling lanes for fun team competitions', tags: ['bowling', 'indoor', 'games'], teamSize: '2-50 people', location: 'Andheri West, Mumbai', rating: 4.7, price: '₹2,500/hr', image: 'bowling alley indoor corporate' },
  { id: 2, category: 'Indoor Fun', subcategory: 'Trampoline Park', description: 'High-energy trampoline activities for team bonding', tags: ['trampoline', 'fitness', 'fun'], teamSize: '5-80 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹3,000/hr', image: 'trampoline park indoor' },
  { id: 3, category: 'Indoor Fun', subcategory: 'Indoor Cricket', description: 'Box cricket or net cricket for corporate tournaments', tags: ['cricket', 'sports', 'indoor'], teamSize: '6-24 people', location: 'Powai, Mumbai', rating: 4.5, price: '₹2,000/hr', image: 'indoor cricket box cricket' },
  { id: 4, category: 'Indoor Fun', subcategory: 'Pool & Snooker Lounge', description: 'Recreational pool tables for casual team hangouts', tags: ['pool', 'snooker', 'games'], teamSize: '2-20 people', location: 'Lower Parel, Mumbai', rating: 4.4, price: '₹1,500/hr', image: 'pool snooker lounge' },
  { id: 5, category: 'Indoor Fun', subcategory: 'VR Arcade', description: 'Immersive virtual reality experiences and simulators', tags: ['vr', 'tech', 'gaming'], teamSize: '2-20 people', location: 'Worli, Mumbai', rating: 4.8, price: '₹3,500/hr', image: 'vr arcade virtual reality' },
  { id: 6, category: 'Indoor Fun', subcategory: 'Laser Tag Arena', description: 'Futuristic laser tag missions for corporate teams', tags: ['laser tag', 'indoor', 'team'], teamSize: '6-30 people', location: 'Goregaon, Mumbai', rating: 4.6, price: '₹2,800/hr', image: 'laser tag arena indoor' },
  { id: 7, category: 'Indoor Fun', subcategory: 'Escape Room', description: 'Theme-based puzzle rooms for problem-solving teamwork', tags: ['escape room', 'brain games'], teamSize: '2-12 people', location: 'Malad, Mumbai', rating: 4.7, price: '₹2,000/hr', image: 'escape room puzzle game' },
  { id: 8, category: 'Indoor Fun', subcategory: 'Board Game Cafe', description: 'Relaxed space with 100+ board games for team bonding', tags: ['board games', 'cafe'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.5, price: '₹800/hr', image: 'board game cafe' },
  { id: 9, category: 'Indoor Fun', subcategory: 'Indoor Mini Golf', description: 'Fun and competitive mini-golf tracks', tags: ['mini golf', 'indoor'], teamSize: '4-30 people', location: 'Andheri, Mumbai', rating: 4.3, price: '₹1,800/hr', image: 'indoor mini golf' },
  { id: 10, category: 'Indoor Fun', subcategory: 'Arcade Gaming Zone', description: 'Retro & modern arcade games for all ages', tags: ['arcade', 'gaming', 'fun'], teamSize: '4-50 people', location: 'Phoenix Mall, Mumbai', rating: 4.4, price: '₹1,200/hr', image: 'arcade gaming zone' },
  { id: 11, category: 'Indoor Fun', subcategory: 'Karaoke Rooms', description: 'Private karaoke lounges for fun singing sessions', tags: ['karaoke', 'music'], teamSize: '4-20 people', location: 'Juhu, Mumbai', rating: 4.6, price: '₹2,200/hr', image: 'karaoke room lounge' },
  { id: 12, category: 'Indoor Fun', subcategory: 'Indoor Archery Range', description: 'Safe indoor archery for skill challenge', tags: ['archery', 'indoor'], teamSize: '4-20 people', location: 'Thane, Mumbai', rating: 4.5, price: '₹1,800/hr', image: 'indoor archery range' },

  // Outdoor Adventure
  { id: 13, category: 'Outdoor Adventure', subcategory: 'Paintball Arena', description: 'Combat-style paintball matches for teams', tags: ['paintball', 'outdoor'], teamSize: '6-40 people', location: 'Virar, Mumbai', rating: 4.7, price: '₹3,500/hr', image: 'paintball arena outdoor' },
  { id: 14, category: 'Outdoor Adventure', subcategory: 'Go Karting', description: 'High-speed kart racing for corporate groups', tags: ['karting', 'racing'], teamSize: '4-30 people', location: 'Navi Mumbai', rating: 4.8, price: '₹4,000/hr', image: 'go kart racing track' },
  { id: 15, category: 'Outdoor Adventure', subcategory: 'Zipline Park', description: 'Thrilling zipline rides in natural settings', tags: ['zipline', 'adventure'], teamSize: '4-40 people', location: 'Lonavala', rating: 4.9, price: '₹3,000/hr', image: 'zipline adventure park' },
  { id: 16, category: 'Outdoor Adventure', subcategory: 'Rock Climbing Wall', description: 'Outdoor climbing for fitness & challenge', tags: ['rock climbing', 'fitness'], teamSize: '4-20 people', location: 'Thane', rating: 4.6, price: '₹2,500/hr', image: 'outdoor rock climbing wall' },
  { id: 17, category: 'Outdoor Adventure', subcategory: 'Obstacle Course', description: 'Military-style outdoor team obstacle challenges', tags: ['team building', 'obstacles'], teamSize: '6-60 people', location: 'Khopoli', rating: 4.7, price: '₹5,000/hr', image: 'outdoor obstacle course' },
  { id: 18, category: 'Outdoor Adventure', subcategory: 'Quad Biking', description: 'ATV driving across dirt terrains', tags: ['atv', 'outdoor'], teamSize: '4-20 people', location: 'Lonavala', rating: 4.8, price: '₹3,500/hr', image: 'quad bike atv riding' },
  { id: 19, category: 'Outdoor Adventure', subcategory: 'Trekking Zone', description: 'Nature treks ideal for team bonding', tags: ['trekking', 'nature'], teamSize: '5-50 people', location: 'Matheran', rating: 4.6, price: '₹2,000/person', image: 'group trekking nature' },
  { id: 20, category: 'Outdoor Adventure', subcategory: 'Camping & Bonfire', description: 'Overnight camping with activities', tags: ['camping', 'team outing'], teamSize: '10-100 people', location: 'Pawna Lake', rating: 4.8, price: '₹3,500/person', image: 'camping bonfire team' },
  { id: 21, category: 'Outdoor Adventure', subcategory: 'Rifle Shooting', description: 'Target practice sessions outdoors', tags: ['shooting', 'outdoor'], teamSize: '4-15 people', location: 'Karjat', rating: 4.7, price: '₹2,800/hr', image: 'rifle shooting range outdoor' },

  // Sports
  { id: 22, category: 'Sports', subcategory: 'Football Turf', description: 'Size varies for 5v5–11v11 matches', tags: ['football', 'sports'], teamSize: '10-30 people', location: 'Andheri, Mumbai', rating: 4.5, price: '₹2,500/hr', image: 'football turf field' },
  { id: 23, category: 'Sports', subcategory: 'Box Cricket Ground', description: 'Outdoor box cricket matches', tags: ['cricket', 'sports'], teamSize: '6-20 people', location: 'Malad, Mumbai', rating: 4.4, price: '₹2,000/hr', image: 'box cricket ground' },
  { id: 24, category: 'Sports', subcategory: 'Badminton Courts', description: '1–6 courts available for bookings', tags: ['badminton', 'sports'], teamSize: '2-20 people', location: 'Powai, Mumbai', rating: 4.6, price: '₹800/hr', image: 'badminton court indoor' },
  { id: 25, category: 'Sports', subcategory: 'Tennis Courts', description: 'Courts for friendly tournaments', tags: ['tennis', 'sports'], teamSize: '4-10 people', location: 'BKC, Mumbai', rating: 4.7, price: '₹1,500/hr', image: 'tennis court outdoor' },
  { id: 26, category: 'Sports', subcategory: 'Table Tennis Studios', description: 'TT tables for tournaments', tags: ['tt', 'sports'], teamSize: '2-10 people', location: 'Lower Parel', rating: 4.5, price: '₹600/hr', image: 'table tennis studio' },
  { id: 27, category: 'Sports', subcategory: 'Basketball Court', description: 'Full or half courts for corporate games', tags: ['basketball', 'sports'], teamSize: '6-20 people', location: 'Goregaon, Mumbai', rating: 4.6, price: '₹2,000/hr', image: 'basketball court indoor' },
  { id: 28, category: 'Sports', subcategory: 'Volleyball Court', description: 'Sand or indoor courts', tags: ['volleyball', 'sports'], teamSize: '6-20 people', location: 'Juhu, Mumbai', rating: 4.4, price: '₹1,800/hr', image: 'volleyball court' },
  { id: 29, category: 'Sports', subcategory: 'Skating Rink', description: 'Indoor/outdoor skating activities', tags: ['skating', 'sports'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.5, price: '₹1,200/hr', image: 'skating rink indoor' },
  { id: 30, category: 'Sports', subcategory: 'Golf Course', description: 'Driving ranges + putting challenges', tags: ['golf', 'corporate'], teamSize: '4-20 people', location: 'Chembur, Mumbai', rating: 4.8, price: '₹5,000/hr', image: 'golf course driving range' },
  { id: 31, category: 'Sports', subcategory: 'Fitness Studio', description: 'Yoga, Pilates, Zumba spaces', tags: ['fitness', 'yoga'], teamSize: '4-40 people', location: 'Worli, Mumbai', rating: 4.7, price: '₹3,000/hr', image: 'fitness studio yoga' },

  // Team Building
  { id: 32, category: 'Team Building', subcategory: 'Human Foosball Arena', description: 'Giant human-sized foosball', tags: ['team building', 'games'], teamSize: '8-20 people', location: 'Thane', rating: 4.6, price: '₹4,000/hr', image: 'human foosball game' },
  { id: 33, category: 'Team Building', subcategory: 'Relay Racing Track', description: 'Competition-style relay races', tags: ['relay', 'team building'], teamSize: '8-40 people', location: 'Navi Mumbai', rating: 4.5, price: '₹3,500/hr', image: 'relay race track' },
  { id: 34, category: 'Team Building', subcategory: 'Blindfold Maze', description: 'Trust-based navigation challenges', tags: ['trust', 'team building'], teamSize: '6-20 people', location: 'Lonavala', rating: 4.7, price: '₹2,500/hr', image: 'team building blindfold activity' },
  { id: 35, category: 'Team Building', subcategory: 'Cooking Challenge Kitchen', description: 'Fun cooking competitions', tags: ['cooking', 'workshop'], teamSize: '6-20 people', location: 'Bandra, Mumbai', rating: 4.8, price: '₹4,500/hr', image: 'cooking workshop team building' },
  { id: 36, category: 'Team Building', subcategory: 'Hackathon Room', description: 'Rooms for innovation sprints', tags: ['tech', 'hackathon'], teamSize: '6-50 people', location: 'BKC, Mumbai', rating: 4.6, price: '₹6,000/hr', image: 'hackathon room workspace' },
  { id: 37, category: 'Team Building', subcategory: 'Corporate Game Arena', description: 'Minute-to-win-it game zone', tags: ['games', 'team building'], teamSize: '6-50 people', location: 'Andheri, Mumbai', rating: 4.5, price: '₹3,500/hr', image: 'corporate team building games' },

  // Creative Workshops
  { id: 38, category: 'Creative Workshops', subcategory: 'Art & Painting Studio', description: 'Guided painting sessions', tags: ['art', 'painting'], teamSize: '4-25 people', location: 'Khar, Mumbai', rating: 4.7, price: '₹2,500/hr', image: 'art painting studio workshop' },
  { id: 39, category: 'Creative Workshops', subcategory: 'Pottery Studio', description: 'Hands-on pottery workshops', tags: ['pottery', 'craft'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹2,800/hr', image: 'pottery studio workshop' },
  { id: 40, category: 'Creative Workshops', subcategory: 'DIY Craft Workshop', description: 'Crafts like candles, soaps, wood art', tags: ['craft', 'creative'], teamSize: '4-20 people', location: 'Juhu, Mumbai', rating: 4.5, price: '₹2,200/hr', image: 'diy craft workshop' },
  { id: 41, category: 'Creative Workshops', subcategory: 'Mixology Lab', description: 'Bartending & mixology activities', tags: ['mixology', 'workshop'], teamSize: '4-20 people', location: 'Lower Parel', rating: 4.8, price: '₹3,500/hr', image: 'mixology bartending workshop' },
  { id: 42, category: 'Creative Workshops', subcategory: 'Photography Studio', description: 'Pro photography training', tags: ['photography', 'creative'], teamSize: '4-15 people', location: 'Andheri, Mumbai', rating: 4.6, price: '₹3,000/hr', image: 'photography studio workshop' },
  { id: 43, category: 'Creative Workshops', subcategory: 'Dance Studio', description: 'Dance-based team activity', tags: ['dance', 'studio'], teamSize: '6-30 people', location: 'Worli, Mumbai', rating: 4.7, price: '₹2,500/hr', image: 'dance studio workshop' },

  // Wellness
  { id: 44, category: 'Wellness', subcategory: 'Yoga Studio', description: 'Corporate yoga sessions', tags: ['yoga', 'wellness'], teamSize: '5-50 people', location: 'Bandra, Mumbai', rating: 4.8, price: '₹3,000/hr', image: 'corporate yoga studio' },
  { id: 45, category: 'Wellness', subcategory: 'Meditation Hall', description: 'Mindfulness & guided meditation', tags: ['meditation', 'wellness'], teamSize: '5-50 people', location: 'Juhu, Mumbai', rating: 4.7, price: '₹2,500/hr', image: 'meditation hall wellness' },
  { id: 46, category: 'Wellness', subcategory: 'Spa & Massage Centre', description: 'Relaxation & stress-relief sessions', tags: ['spa', 'wellness'], teamSize: '2-20 people', location: 'Marine Drive', rating: 4.9, price: '₹5,000/hr', image: 'spa massage wellness center' },
  { id: 47, category: 'Wellness', subcategory: 'Sound Healing Room', description: 'Tibetan bowl or gong therapy', tags: ['sound healing'], teamSize: '5-50 people', location: 'Powai, Mumbai', rating: 4.6, price: '₹3,500/hr', image: 'sound healing therapy room' },

  // Social & Food
  { id: 48, category: 'Social & Food', subcategory: 'Microbrewery with Games', description: 'Beer + games + music', tags: ['brewery', 'social'], teamSize: '10-60 people', location: 'Lower Parel', rating: 4.7, price: '₹4,500/hr', image: 'microbrewery games social' },
  { id: 49, category: 'Social & Food', subcategory: "Chef's Table Venue", description: 'Premium cooking + dining', tags: ['chef table', 'food'], teamSize: '6-20 people', location: 'BKC, Mumbai', rating: 4.9, price: '₹8,000/hr', image: 'chef table dining experience' },
  { id: 50, category: 'Social & Food', subcategory: 'Wine Tasting Room', description: 'Sommelier-led sessions', tags: ['wine tasting', 'luxury'], teamSize: '4-20 people', location: 'Worli, Mumbai', rating: 4.8, price: '₹6,000/hr', image: 'wine tasting room' },
  { id: 51, category: 'Social & Food', subcategory: 'Coffee Brewing Workshop', description: 'Hands-on barista workshop', tags: ['coffee', 'workshop'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹2,500/hr', image: 'coffee brewing barista workshop' },

  // Virtual & Tech
  { id: 52, category: 'Virtual & Tech', subcategory: 'VR Experience Room', description: 'Immersive VR team games', tags: ['vr', 'gaming'], teamSize: '4-15 people', location: 'Andheri, Mumbai', rating: 4.8, price: '₹4,000/hr', image: 'vr experience room gaming' },
  { id: 53, category: 'Virtual & Tech', subcategory: 'AR Escape Game', description: 'Augmented reality team puzzles', tags: ['ar', 'escape room'], teamSize: '3-10 people', location: 'Malad, Mumbai', rating: 4.7, price: '₹3,500/hr', image: 'augmented reality escape room' },
  { id: 54, category: 'Virtual & Tech', subcategory: 'Racing Simulator', description: 'Realistic racing cockpit setup', tags: ['simulator', 'racing'], teamSize: '2-10 people', location: 'Phoenix Mall', rating: 4.6, price: '₹2,800/hr', image: 'racing simulator cockpit' },
  { id: 55, category: 'Virtual & Tech', subcategory: 'Flight Simulator', description: 'Pro flight training sim', tags: ['flight simulator'], teamSize: '2-6 people', location: 'BKC, Mumbai', rating: 4.9, price: '₹5,000/hr', image: 'flight simulator cockpit' },

  // Offsites & Retreats
  { id: 56, category: 'Offsites & Retreats', subcategory: 'Adventure Resort', description: 'Corporate-friendly outdoor resort', tags: ['resort', 'offsite'], teamSize: '15-300 people', location: 'Lonavala', rating: 4.8, price: '₹8,000/person', image: 'adventure resort outdoor' },
  { id: 57, category: 'Offsites & Retreats', subcategory: 'Farm Stay', description: 'Organic farm experience', tags: ['farm stay', 'nature'], teamSize: '10-100 people', location: 'Karjat', rating: 4.7, price: '₹5,000/person', image: 'farm stay organic nature' },
  { id: 58, category: 'Offsites & Retreats', subcategory: 'Nature Retreat', description: 'Forest/hill retreats', tags: ['retreat', 'nature'], teamSize: '10-200 people', location: 'Matheran', rating: 4.8, price: '₹7,000/person', image: 'nature retreat forest hills' },
  { id: 59, category: 'Offsites & Retreats', subcategory: 'Beach Retreat', description: 'Coastal offsites', tags: ['beach', 'resort'], teamSize: '10-200 people', location: 'Alibaug', rating: 4.9, price: '₹9,000/person', image: 'beach resort retreat' },

  // Premium Activities
  { id: 60, category: 'Premium Activities', subcategory: 'Yacht Experience', description: 'Half/Full day yacht rides', tags: ['yacht', 'luxury'], teamSize: '6-25 people', location: 'Gateway of India', rating: 4.9, price: '₹25,000/hr', image: 'yacht luxury experience' },
  { id: 61, category: 'Premium Activities', subcategory: 'Sailing Club', description: 'Sailing lessons + races', tags: ['sailing', 'water'], teamSize: '4-20 people', location: 'Colaba, Mumbai', rating: 4.8, price: '₹15,000/hr', image: 'sailing club yacht' },
  { id: 62, category: 'Premium Activities', subcategory: 'Hot Air Balloon Ride', description: 'Early morning ballooning', tags: ['balloon', 'luxury'], teamSize: '2-12 people', location: 'Lonavala', rating: 4.9, price: '₹12,000/person', image: 'hot air balloon ride' },
  { id: 63, category: 'Premium Activities', subcategory: 'Horse Riding Club', description: 'Horse riding lessons & trails', tags: ['horse riding'], teamSize: '4-20 people', location: 'Mahalaxmi', rating: 4.7, price: '₹3,500/hr', image: 'horse riding club outdoor' },
  { id: 64, category: 'Premium Activities', subcategory: 'Helicopter Ride', description: 'City helicopter tours', tags: ['helicopter', 'luxury'], teamSize: '2-6 people', location: 'Juhu Aerodrome', rating: 4.9, price: '₹35,000/hr', image: 'helicopter ride city tour' },
];

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [listingCatalogTick, setListingCatalogTick] = useState(0);
  const [corpPromoTick, setCorpPromoTick] = useState(0);
  const selectedNav = 'activity';

  useEffect(() => {
    const bump = () => setListingCatalogTick((n) => n + 1);
    const bumpPromo = () => setCorpPromoTick((n) => n + 1);
    window.addEventListener(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT, bump);
    window.addEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, bumpPromo);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener(CORPORATE_APPROVED_LISTINGS_UPDATED_EVENT, bump);
      window.removeEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, bumpPromo);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const [supabaseActivities, setSupabaseActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setActivitiesLoading(true);
      setActivitiesError(null);
      const { data, error } = await db.listings.listByModule('events', 'active');
      if (cancelled) return;
      if (error) {
        setActivitiesError(error.message);
        setSupabaseActivities([]);
      } else {
        setSupabaseActivities((data ?? []).map(listingToActivity));
      }
      setActivitiesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activities = useMemo((): Activity[] => {
    const partner = loadCorporateApprovedListings()
      .filter(
        (l) =>
          listingProfileIncludes(l.listingProfileIds, 'activity') ||
          listingProfileIncludes(l.listingProfileIds, 'event')
      )
      .map(approvedActivityListingToActivityRow);
    const finalData = supabaseActivities.length > 0 ? supabaseActivities : DEMO_DATA_ACTIVITIES;
    return [...partner, ...finalData];
  }, [listingCatalogTick, supabaseActivities]);

  const eventsPromos = useMemo(
    () => loadActiveCorporatePromotionsForSector('Events'),
    [corpPromoTick, listingCatalogTick]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchAttendees, setSearchAttendees] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = 9;
  
  // Additional filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [gridUiNotice, setGridUiNotice] = useState<string | null>(null);
  const [cardImageIndexById, setCardImageIndexById] = useState<Record<string, number>>({});

  const categories = ['All', ...Array.from(new Set(activities.map(a => a.category)))];

  // Activity promotional banners
  const bannerOfferCategory: Record<number, string> = {
    1: 'Team Building',
    2: 'Outdoor Adventure',
    3: 'Wellness',
  };

  const banners = [
    {
      id: 1,
      title: "Weekend Team Building Special - 20% OFF",
      description: "Book any team building activity package for weekends and save 20%! From paintball to escape rooms, make your team bonding memorable. Valid for groups of 10+.",
      vendor: "Mogzu Activities",
    },
    {
      id: 2,
      title: "Premium Adventure Package - Early Bird Offer",
      description: "Experience the thrill! Get exclusive access to our premium adventure activities including zipline, rock climbing, and quad biking. Book 2 weeks in advance for best rates.",
      vendor: "Adventure Hub",
    },
    {
      id: 3,
      title: "Corporate Wellness Programs",
      description: "Invest in your team's well-being with our curated wellness activities. Yoga, meditation, and spa packages designed for corporate teams. Flexible scheduling available.",
      vendor: "Mogzu Wellness",
    },
  ];

  // Auto-slide functionality
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

  const parsePrice = (price: string): number => {
    const match = price.replace(/,/g, '').match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const parseTeamSize = (teamSize: string): { min: number; max: number } => {
    const match = teamSize.match(/(\d+)\s*-\s*(\d+)/);
    if (match) return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
    const single = teamSize.match(/(\d+)/);
    const n = single ? parseInt(single[1], 10) : 0;
    return { min: n, max: n };
  };

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = selectedCategory === 'All' || activity.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      activity.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !searchLocation || activity.location.toLowerCase().includes(searchLocation.toLowerCase());

    const attendees = searchAttendees ? parseInt(searchAttendees, 10) : NaN;
    const ts = parseTeamSize(activity.teamSize);
    const matchesAttendees = !Number.isFinite(attendees) || (attendees >= ts.min && attendees <= ts.max);

    const priceNum = parsePrice(activity.price);
    const minP = priceRange.min ? parseInt(priceRange.min, 10) : NaN;
    const maxP = priceRange.max ? parseInt(priceRange.max, 10) : NaN;
    const matchesMin = !Number.isFinite(minP) || priceNum >= minP;
    const matchesMax = !Number.isFinite(maxP) || priceNum <= maxP;

    const matchesRating = selectedRating == null || activity.rating >= selectedRating;

    const haystack = `${activity.category} ${activity.subcategory} ${activity.tags.join(' ')}`.toLowerCase();
    const matchesFeatures =
      selectedFeatures.length === 0 || selectedFeatures.every(f => haystack.includes(f));

    return (
      matchesCategory &&
      matchesSearch &&
      matchesLocation &&
      matchesAttendees &&
      matchesMin &&
      matchesMax &&
      matchesRating &&
      matchesFeatures
    );
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPrevCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      return { ...prev, [cardId]: (current - 1 + total) % total }
    })
  }

  const goToNextCardImage = (cardId: string, total: number) => {
    setCardImageIndexById((prev) => {
      const current = prev[cardId] ?? 0
      return { ...prev, [cardId]: (current + 1) % total }
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const categoryMeta: Record<
    string,
    { icon: LucideIcon; color: string }
  > = {
    'All': { icon: Grid3x3, color: '#475569' },
    'Indoor Fun': { icon: Gamepad2, color: '#6366F1' },
    'Outdoor Adventure': { icon: Mountain, color: '#0D9488' },
    'Sports': { icon: Trophy, color: '#B45309' },
    'Team Building': { icon: UsersRound, color: '#0F766E' },
    'Creative Workshops': { icon: Palette, color: '#9333EA' },
    'Wellness': { icon: Sparkles, color: '#15803D' },
    'Social & Food': { icon: UtensilsCrossed, color: '#C2410C' },
    'Virtual & Tech': { icon: MonitorPlay, color: '#0369A1' },
    'Offsites & Retreats': { icon: Plane, color: '#047857' },
    'Premium Activities': { icon: Crown, color: '#A16207' },
  };

  const getCategoryMeta = (category: string) =>
    categoryMeta[category] || { icon: Grid3x3, color: '#475569' };

  // Get related image URL for activities
  const getActivityImageUrl = (activityId: number) => {
    // Map activity IDs to specific Unsplash images
    const imageMap: { [key: number]: string } = {
      // Indoor Fun
      1: 'https://images.unsplash.com/photo-1671427478429-3cfa4f905769?w=400&h=300&fit=crop&q=80',
      2: 'https://images.unsplash.com/photo-1751235641041-d5037f5ceb87?w=400&h=300&fit=crop&q=80',
      3: 'https://images.unsplash.com/photo-1540747913346-19e32778e8e5?w=400&h=300&fit=crop&q=80',
      4: 'https://images.unsplash.com/photo-1707916041849-927236f6b4c8?w=400&h=300&fit=crop&q=80',
      5: 'https://images.unsplash.com/photo-1708924401329-bb17acf6c16b?w=400&h=300&fit=crop&q=80',
      6: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400&h=300&fit=crop&q=80',
      7: 'https://images.unsplash.com/photo-1761207850889-75d5765d33c0?w=400&h=300&fit=crop&q=80',
      8: 'https://images.unsplash.com/photo-1559149811-7f3865354317?w=400&h=300&fit=crop&q=80',
      9: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&h=300&fit=crop&q=80',
      10: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=300&fit=crop&q=80',
      11: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop&q=80',
      12: 'https://images.unsplash.com/photo-1589889564639-c6566805e027?w=400&h=300&fit=crop&q=80',
      
      // Outdoor Adventure
      13: 'https://images.unsplash.com/photo-1765605898507-598a7cafe61e?w=400&h=300&fit=crop&q=80',
      14: 'https://images.unsplash.com/photo-1695227667418-e9cada1f9bd3?w=400&h=300&fit=crop&q=80',
      15: 'https://images.unsplash.com/photo-1763236606584-b9690beab73c?w=400&h=300&fit=crop&q=80',
      16: 'https://images.unsplash.com/photo-1701804341348-7144aac38085?w=400&h=300&fit=crop&q=80',
      17: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop&q=80',
      18: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80',
      19: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop&q=80',
      20: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop&q=80',
      21: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop&q=80',
      
      // Sports
      22: 'https://images.unsplash.com/photo-1712418516923-527799fb2bec?w=400&h=300&fit=crop&q=80',
      23: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop&q=80',
      24: 'https://images.unsplash.com/photo-1624024834874-2a1611305604?w=400&h=300&fit=crop&q=80',
      25: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=400&h=300&fit=crop&q=80',
      26: 'https://images.unsplash.com/photo-1593786481241-85f612a9d5e9?w=400&h=300&fit=crop&q=80',
      27: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&q=80',
      28: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop&q=80',
      29: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=400&h=300&fit=crop&q=80',
      30: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop&q=80',
      31: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop&q=80',
      
      // Team Building
      32: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop&q=80',
      33: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&h=300&fit=crop&q=80',
      34: 'https://images.unsplash.com/photo-1647188098588-0a1f1a13732d?w=400&h=300&fit=crop&q=80',
      35: 'https://images.unsplash.com/photo-1581098078547-8c5f38f8df01?w=400&h=300&fit=crop&q=80',
      36: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&q=80',
      37: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop&q=80',
      
      // Creative Workshops
      38: 'https://images.unsplash.com/photo-1609875133537-f46ea040efca?w=400&h=300&fit=crop&q=80',
      39: 'https://images.unsplash.com/photo-1763824371988-8c8eb3d13eff?w=400&h=300&fit=crop&q=80',
      40: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop&q=80',
      41: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop&q=80',
      42: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&q=80',
      43: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=300&fit=crop&q=80',
      
      // Wellness
      44: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&q=80',
      45: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&q=80',
      46: 'https://images.unsplash.com/photo-1760882206955-f4e8321cc9f4?w=400&h=300&fit=crop&q=80',
      47: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop&q=80',
      
      // Social & Food
      48: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=400&h=300&fit=crop&q=80',
      49: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&q=80',
      50: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&q=80',
      51: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80',
      
      // Virtual & Tech
      52: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=300&fit=crop&q=80',
      53: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=300&fit=crop&q=80',
      54: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=300&fit=crop&q=80',
      55: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop&q=80',
      
      // Offsites & Retreats
      56: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=80',
      57: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80',
      58: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80',
      59: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80',
      
      // Premium Activities
      60: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=300&fit=crop&q=80',
      61: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80',
      62: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop&q=80',
      63: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=300&fit=crop&q=80',
      64: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&q=80',
    };
    
    // Return mapped image or fallback to a default
    return imageMap[activityId] || `https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop&q=80`;
  };

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      {/* Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          {/* Breadcrumb */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="font-medium text-[#7b879a] transition-colors hover:text-[#2563eb]"
                >
                  Activity Suite
                </button>
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-[#a0aec0]" />
                <span className="font-semibold tracking-tight text-[#0e1e3f]">Activities</span>
              </div>
            </div>
          </div>

          {eventsPromos.length > 0 ? (
            <div className="border-b border-violet-100 bg-violet-50/80">
              <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-800 mb-2">
                  Featured — from Mogzu admin
                </p>
                <div className="flex flex-wrap gap-3">
                  {eventsPromos.map((p) => (
                    <div
                      key={p.id}
                      className="flex max-w-md items-start gap-3 rounded-xl border border-violet-200 bg-white px-3 py-2 shadow-sm"
                    >
                      {p.image ? (
                        <img src={p.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0e1e3f] line-clamp-2">{p.title}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{p.subtitle}</p>
                        <p className="text-[10px] text-violet-700 mt-1">{p.vendorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Page Title */}
          <div className="border-b border-slate-300/[0.1] bg-transparent">
            <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-2">
              <div className="flex items-center gap-4">
                <h1 className="text-[22px] font-bold leading-none text-[#0e1e3f]">
                  D Space
                </h1>
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => navigate("/dspace")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Home
                  </button>
                  <button
                    onClick={() => navigate("/spacex")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.p11a5d600}
                        fill="#0F766E"
                      />
                    </svg>
                    Meetings
                  </button>
                  <button
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-[#2563eb] px-4 text-[14px] font-semibold text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition-all duration-200 active:scale-[0.98]"
                    style={{
                      backgroundImage:
                        "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.p9bd8700}
                        fill="#B45309"
                      />
                    </svg>
                    Activities
                  </button>
                  <button
                    onClick={() => navigate("/stay")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.p30609c00}
                        fill="#7C3AED"
                      />
                    </svg>
                    Stay
                  </button>
                  <button
                    onClick={() => navigate("/promotions")}
                    className="h-9 flex items-center gap-2 rounded-full border-[1.5px] border-slate-300/25 bg-white/[0.12] px-4 text-[14px] font-medium text-[#475569] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] active:scale-[0.98]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <path
                        d={svgPathsSpaceX.pd9fb4c0}
                        fill="#DC2626"
                      />
                    </svg>
                    Promotions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Carousel */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pt-5">
            <div className="group relative mb-6 h-[200px] overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-[0_18px_40px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="relative min-w-full h-[200px]"
                    style={{
                      background:
                        "linear-gradient(135deg, #FA8D40 0%, #FF6B9D 50%, #8B5CF6 100%)",
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute flex h-full items-center justify-center right-0 top-0 w-1/2 mix-blend-soft-light overflow-hidden">
                      <div className="transform rotate-180 scale-y-[-1] h-full">
                        <img
                          src={imgImage24995}
                          alt=""
                          className="h-full w-auto object-cover opacity-20"
                        />
                      </div>
                    </div>

                    <div className="relative flex h-full items-center px-8 py-7 sm:px-10">
                      <div className="max-w-2xl">
                        {/* Vendor Badge */}
                        <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
                          <svg
                            width="14"
                            height="14"
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
                          <span className="text-[10px] font-semibold text-[#0e1e3f] uppercase tracking-wide">
                            {banner.vendor}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="mb-1.5 text-[24px] font-bold leading-tight text-white drop-shadow-md">
                          {banner.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="mb-4 max-w-xl text-[14px] leading-[1.6] text-white/90 line-clamp-2 drop-shadow-sm">
                          {banner.description}
                        </p>
                        
                        {/* CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cat = bannerOfferCategory[banner.id];
                            if (cat && categories.includes(cat)) {
                              setSelectedCategory(cat);
                              setCurrentPage(1);
                            }
                          }}
                          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          <span>View Offer</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => goToSlide(index)}
                    className={`transition-all rounded-full ${
                      index === currentSlide
                        ? "w-6 h-1.5 bg-white shadow-md"
                        : "w-1.5 h-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 mb-5 py-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="h-8 w-8 shrink-0 rounded-full border border-slate-300/40 bg-white/70 text-[#475569] backdrop-blur-sm transition-colors hover:border-[#93c5fd] hover:text-[#0e1e3f]"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="mx-auto size-4" aria-hidden />
              </button>
              <div
                ref={categoryScrollRef}
                className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`h-9 flex items-center gap-2 rounded-full border-[1.5px] px-4 transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:scale-[0.98] ${
                      selectedCategory === category
                        ? "border-[#2563eb] text-[#0e1e3f] shadow-[0_10px_24px_rgba(37,99,235,0.2)]"
                        : "border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd]"
                    }`}
                    style={
                      selectedCategory === category
                        ? {
                            backgroundImage:
                              "linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)",
                          }
                        : undefined
                    }
                  >
                    {(() => {
                      const { icon: CategoryIcon, color } = getCategoryMeta(category);
                      return (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          <CategoryIcon className="h-4.5 w-4.5" color={color} strokeWidth={2.2} />
                        </span>
                      );
                    })()}
                    <span className="text-[14px] font-medium">
                      {category}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="h-8 w-8 shrink-0 rounded-full border border-slate-300/40 bg-white/70 text-[#475569] backdrop-blur-sm transition-colors hover:border-[#93c5fd] hover:text-[#0e1e3f]"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="mx-auto size-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Filters and Content */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 pb-6 flex flex-col gap-4 lg:flex-row">
            {/* Left Sidebar - Filters */}
            <aside className="w-full flex-shrink-0 lg:w-[240px] lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-2xl border border-white/60 bg-white/55 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.16)] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0e1e3f]">
                    Filters
                  </h3>
                  <button 
                    onClick={() => {
                      setSearchLocation('');
                      setSearchAttendees('');
                      setSearchDate('');
                      setPriceRange({ min: '', max: '' });
                      setSelectedRating(null);
                      setSelectedFeatures([]);
                      setCurrentPage(1);
                    }}
                    className="text-[13px] font-medium text-[#4379ee] hover:text-[#3568dd]"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-5 border-t border-slate-200/70 pt-3">
                  {/* Location Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-[#878e9e]" />
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Location
                      </h4>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Bandra, Mumbai"
                      value={searchLocation}
                      onChange={(e) => {
                        setSearchLocation(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>

                  {/* Team Size Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Users className="w-3.5 h-3.5 text-[#878e9e]" />
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Team Size
                      </h4>
                    </div>
                    <input
                      type="number"
                      placeholder="Number of people"
                      value={searchAttendees}
                      onChange={(e) => {
                        setSearchAttendees(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>

                  {/* Price Range Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Price Range (₹/hr)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr]">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => {
                          setPriceRange({ ...priceRange, min: e.target.value });
                          setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                      />
                      <span className="text-xs text-[#878e9e] flex items-center">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => {
                          setPriceRange({ ...priceRange, max: e.target.value });
                          setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Minimum Rating
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === rating}
                            onChange={() => {
                              setSelectedRating(rating);
                              setCurrentPage(1);
                            }}
                            className="w-3.5 h-3.5 text-[#4379ee] border-[#ececec] focus:ring-[#4379ee]/20"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#0e1e3f]">{rating}+</span>
                            <svg className="w-3 h-3 text-[#FFCC47] fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Activity Type Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Activity Type
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {['Indoor', 'Outdoor', 'Adventure', 'Wellness', 'Tech', 'Sports'].map((feature) => (
                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.toLowerCase())}
                            onChange={(e) => {
                              const value = feature.toLowerCase();
                              if (e.target.checked) {
                                setSelectedFeatures([...selectedFeatures, value]);
                              } else {
                                setSelectedFeatures(selectedFeatures.filter(f => f !== value));
                              }
                              setCurrentPage(1);
                            }}
                            className="w-3.5 h-3.5 text-[#4379ee] border-[#ececec] rounded focus:ring-[#4379ee]/20"
                          />
                          <span className="text-xs text-[#0e1e3f] group-hover:text-[#4379ee]">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="pt-4 border-t border-[#ececec]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-[#0e1e3f]">
                        Preferred Date
                      </h4>
                    </div>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => {
                        setSearchDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-white/70 bg-white/65 px-2.5 py-2 text-xs text-[#0e1e3f] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content - Grid */}
            <div className="flex-1 flex min-w-0 flex-col">
              {gridUiNotice ? (
                <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {gridUiNotice}
                </p>
              ) : null}

              {/* Top Filters (above listings) */}
              <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white pl-10 pr-3 text-[14px] text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="number"
                    placeholder="Team size"
                    className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white pl-10 pr-3 text-[14px] text-[#0e1e3f] placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                    value={searchAttendees}
                    onChange={(e) => {
                      setSearchAttendees(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <input
                  type="date"
                  className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#4379ee]/20"
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value)
                    setCurrentPage(1)
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation('')
                    setSearchAttendees('')
                    setSearchDate('')
                    setCurrentPage(1)
                  }}
                  className="h-10 rounded-xl border border-[#e5e7eb] bg-white/70 px-4 text-sm font-medium text-[#0e1e3f] transition-colors hover:border-[#93c5fd]"
                >
                  Clear
                </button>
              </div>
              {/* Results Header */}
              <div className="mb-3">
                <h2 className="text-[16px] font-semibold text-[#0e1e3f]">
                  Trending Activities
                </h2>
                <p className="text-xs text-[#878e9e]">
                  Showing {filteredActivities.length} result{filteredActivities.length !== 1 ? 's' : ''} {filteredActivities.length !== activities.length ? `(filtered from ${activities.length})` : ''}
                </p>
              </div>

              {/* Activities Grid */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {activitiesLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`activity-skeleton-${idx}`} className="overflow-hidden rounded-2xl border border-white/60 bg-white/65 p-3 backdrop-blur-md">
                      <div className="h-44 rounded-lg corp-shimmer sm:h-48" />
                      <div className="mt-3 h-4 w-[70%] rounded-full corp-shimmer" />
                      <div className="mt-2 h-3 w-[50%] rounded-full corp-shimmer" />
                      <div className="mt-3 h-3.5 w-[40%] rounded-full corp-shimmer" />
                    </div>
                  ))
                ) : activitiesError ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 py-12 text-center">
                    <p className="text-sm font-medium text-rose-700">Couldn't load activities</p>
                    <p className="mt-1 text-xs text-rose-600">{activitiesError}</p>
                  </div>
                ) : isError ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/65 py-16 text-center backdrop-blur-md">
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
                ) : paginatedActivities.length > 0 ? (
                  paginatedActivities.map((activity) => {
                  const cardId = String(activity.id)
                  const slideImages = getListingSlideImages(
                    getActivityImageUrl(activity.id),
                    buildUnsplashKeywordImage(`${activity.subcategory} ${activity.location}`),
                    buildUnsplashKeywordImage(`${activity.image} team activity`),
                    imgImage24995,
                    imgImage24877,
                  )
                  const activeIndex = cardImageIndexById[cardId] ?? 0
                  const activeImage = slideImages[activeIndex] || imgImage24995
                  const priceDisplay = getPriceDisplayParts(activity.price)

                  return (
                  <div
                    key={activity.id}
                    className="group flex min-h-[380px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.22)]"
                    onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                  >
                    <div className="relative h-44 sm:h-48">
                      <ImageWithFallback
                        src={activeImage}
                        alt={activity.subcategory}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {slideImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Previous image for ${activity.subcategory}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              goToPrevCardImage(cardId, slideImages.length)
                            }}
                            className="absolute left-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm transition-colors hover:bg-white"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            aria-label={`Next image for ${activity.subcategory}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              goToNextCardImage(cardId, slideImages.length)
                            }}
                            className="absolute right-2.5 top-1/2 z-[2] h-7 w-7 -translate-y-1/2 rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm transition-colors hover:bg-white"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-2.5 left-1/2 z-[2] inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1">
                            {slideImages.slice(0, 5).map((_, dotIdx) => (
                              <span
                                key={`${activity.id}-${dotIdx}`}
                                className={`h-1.5 rounded-full transition-all ${dotIdx === activeIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/55'}`}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}

                      <WishlistHeart listingId={String(activity.id)} />

                      {/* Bottom Overlay Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                        <div className="flex items-center justify-between">
                          {/* Rating Badge */}
                          <div className="flex items-center gap-0.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e1e3f] shadow-[0_6px_16px_rgba(15,23,42,0.16)] backdrop-blur-sm">
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 21 20"
                              fill="none"
                            >
                              <path
                                d="M10.5 0L13.6329 6.56434L21 7.60081L15.75 12.6857L17.0257 20L10.5 16.5643L3.97434 20L5.25 12.6857L0 7.60081L7.36712 6.56434L10.5 0Z"
                                fill="#FFCC47"
                              />
                            </svg>
                            {activity.rating}
                          </div>

                          {/* Category Badge */}
                          <div className="rounded-md bg-[#4379ee] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(15,23,42,0.16)]">
                            {activity.category}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-[14px]">
                      <h3 className="mb-1 line-clamp-1 text-[15px] font-semibold leading-tight text-[#0e1e3f]">
                        {activity.subcategory || "Activity"}
                      </h3>
                      <p className="mb-2.5 line-clamp-2 text-[12px] text-[#878e9e]">
                        {activity.description || "Curated activity experiences for teams."}
                      </p>
                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        {activity.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#fa8d40]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mb-1.5 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">
                          {activity.location}
                        </span>
                      </div>
                      <div className="mb-3 flex items-start gap-1.5 text-[12px] text-[#878e9e]">
                        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{activity.teamSize}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-[#e2e8f0] pt-2.5">
                        <div>
                          <p className="mb-0.5 text-[10px] uppercase tracking-wide text-[#878e9e]">
                            Starting at
                          </p>
                          <p className="text-[20px] font-extrabold leading-none tracking-tight text-[#0e1e3f]">
                            {priceDisplay.amount}
                            {priceDisplay.unit ? (
                              <span className="ml-1 text-[12px] font-semibold text-[#64748b]">
                                {priceDisplay.unit}
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <button
                          className="h-11 rounded-lg bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-5 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
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
                      No activities found
                    </h3>
                    <p className="text-sm text-[#878e9e] mb-4">
                      Try adjusting your filters to see more results
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchLocation('');
                        setSearchAttendees('');
                        setSearchDate('');
                        setSearchQuery('');
                        setPriceRange({ min: '', max: '' });
                        setSelectedRating(null);
                        setSelectedFeatures([]);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 bg-[#4379ee] text-white rounded-full text-sm font-medium hover:bg-[#3568dd] transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredActivities.length > 0 && (
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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
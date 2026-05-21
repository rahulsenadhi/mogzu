import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Users, Star, Clock, Calendar, Shield, Share2, ChevronRight, Check, Info, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { WishlistHeart } from './global/WishlistHeart';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { PricingBlock, PricingMode } from './ui/PricingBlock';

interface ResponseStatusBannerProps {
  status: 'awaiting' | 'best_offer' | 'accepted' | 'declined';
  comment?: string;
  activityId?: number;
}

function ResponseStatusBanner({ status, comment, activityId }: ResponseStatusBannerProps) {
  const navigate = useNavigate();

  const getBannerConfig = () => {
    switch (status) {
      case 'awaiting':
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: <Info className="w-5 h-5 text-slate-600" />,
          title: 'Awaiting vendor response',
          titleColor: 'text-slate-800',
          subtext: 'Your enquiry was sent. Vendors typically respond within 4 hours.',
          displayComment: '—'
        };
      case 'best_offer':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          title: 'Best offer received',
          titleColor: 'text-blue-800',
          cta: 'Accept offer'
        };
      case 'accepted':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          title: 'Offer accepted',
          titleColor: 'text-green-800'
        };
      case 'declined':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          title: 'Offer declined',
          titleColor: 'text-red-800',
          cta: 'View alternatives'
        };
    }
  };

  const config = getBannerConfig();
  const displayComment = config.displayComment || comment || "The vendor has not provided a comment yet.";

  return (
    <div className={`mt-3 rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col gap-3 transition-all duration-300`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {config.icon}
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>{config.title}</h4>
        </div>
        {config.subtext && (
          <p className="text-[11px] text-slate-500 ml-7">{config.subtext}</p>
        )}
      </div>
      
      <div className="bg-white/60 rounded-lg p-3 text-sm text-gray-700 border border-black/5">
        <span className="font-medium text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Vendor Comment</span>
        <p className="text-xs leading-relaxed">{displayComment}</p>
      </div>

      {config.cta && (
        <button
          type="button"
          onClick={() => {
            if (status === 'best_offer') {
              navigate('/request-to-book', {
                state: {
                  from: 'activity-detail',
                  category: 'activity',
                  acceptedOffer: true,
                },
              });
              return;
            }
            if (status === 'declined') {
              navigate('/dashboard/activities');
            }
          }}
          className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            status === 'best_offer'
              ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          {config.cta}
        </button>
      )}
    </div>
  );
}

interface Activity {
  id: number;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  teamSize: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  fullDescription?: string;
  duration?: string;
  highlights?: string[];
  included?: string[];
  requirements?: string[];
}

const activities: Activity[] = [
  // Indoor Fun
  { id: 1, category: 'Indoor Fun', subcategory: 'Bowling Alley', description: 'Corporate-friendly bowling lanes for fun team competitions', tags: ['bowling', 'indoor', 'games'], teamSize: '2-50 people', location: 'Andheri West, Mumbai', rating: 4.7, price: '₹2,500/hr', image: 'bowling alley indoor corporate', duration: '2-3 hours', highlights: ['Professional bowling lanes', 'Scoring system', 'Party area', 'Food & beverages'], included: ['Lane rental', 'Bowling shoes', 'Scoring system', 'Basic refreshments'], requirements: ['Closed-toe shoes mandatory', 'Advance booking required'] },
  { id: 2, category: 'Indoor Fun', subcategory: 'Trampoline Park', description: 'High-energy trampoline activities for team bonding', tags: ['trampoline', 'fitness', 'fun'], teamSize: '5-80 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹3,000/hr', image: 'trampoline park indoor', duration: '1-2 hours', highlights: ['Multiple trampoline zones', 'Foam pit', 'Dodgeball court', 'Safety briefing'], included: ['Entry tickets', 'Safety gear', 'Instructor supervision', 'Locker facilities'], requirements: ['Grip socks mandatory', 'Health declaration form'] },
  { id: 3, category: 'Indoor Fun', subcategory: 'Indoor Cricket', description: 'Box cricket or net cricket for corporate tournaments', tags: ['cricket', 'sports', 'indoor'], teamSize: '6-24 people', location: 'Powai, Mumbai', rating: 4.5, price: '₹2,000/hr', image: 'indoor cricket box cricket', duration: '1-2 hours', highlights: ['Synthetic turf', 'Cricket equipment', 'Umpire available', 'Tournament format'], included: ['Ground rental', 'Cricket equipment', 'Scoreboard', 'Drinking water'], requirements: ['Sports shoes required', 'Own team jerseys optional'] },
  { id: 4, category: 'Indoor Fun', subcategory: 'Pool & Snooker Lounge', description: 'Recreational pool tables for casual team hangouts', tags: ['pool', 'snooker', 'games'], teamSize: '2-20 people', location: 'Lower Parel, Mumbai', rating: 4.4, price: '₹1,500/hr', image: 'pool snooker lounge', duration: '2-4 hours', highlights: ['Premium tables', 'Professional cues', 'Lounge seating', 'Bar service'], included: ['Table rental', 'Cues & chalk', 'Triangle rack', 'Refreshments'], requirements: ['18+ age limit', 'Proper attire required'] },
  { id: 5, category: 'Indoor Fun', subcategory: 'VR Arcade', description: 'Immersive virtual reality experiences and simulators', tags: ['vr', 'tech', 'gaming'], teamSize: '2-20 people', location: 'Worli, Mumbai', rating: 4.8, price: '₹3,500/hr', image: 'vr arcade virtual reality', duration: '1-2 hours', highlights: ['Latest VR headsets', 'Multiple game zones', 'Racing simulators', 'Team competitions'], included: ['VR equipment', 'Game credits', 'Instructor support', 'Photo booth'], requirements: ['Age 10+', 'No motion sickness issues'] },
  { id: 6, category: 'Indoor Fun', subcategory: 'Laser Tag Arena', description: 'Futuristic laser tag missions for corporate teams', tags: ['laser tag', 'indoor', 'team'], teamSize: '6-30 people', location: 'Goregaon, Mumbai', rating: 4.6, price: '₹2,800/hr', image: 'laser tag arena indoor', duration: '1.5-2 hours', highlights: ['Multi-level arena', 'Team missions', 'Score tracking', 'Party zone'], included: ['Laser equipment', 'Safety vest', 'Mission briefing', 'Score cards'], requirements: ['Comfortable clothing', 'No pregnant participants'] },
  { id: 7, category: 'Indoor Fun', subcategory: 'Escape Room', description: 'Theme-based puzzle rooms for problem-solving teamwork', tags: ['escape room', 'brain games'], teamSize: '2-12 people', location: 'Malad, Mumbai', rating: 4.7, price: '₹2,000/hr', image: 'escape room puzzle game', duration: '1 hour', highlights: ['Multiple themes', 'Challenging puzzles', 'Team building', 'Photo opportunities'], included: ['Room booking', 'Game master', 'Hints system', 'Team photo'], requirements: ['No kids under 10', 'Punctuality required'] },
  { id: 8, category: 'Indoor Fun', subcategory: 'Board Game Cafe', description: 'Relaxed space with 100+ board games for team bonding', tags: ['board games', 'cafe'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.5, price: '₹800/hr', image: 'board game cafe', duration: '2-4 hours', highlights: ['100+ game collection', 'Cozy ambiance', 'Food & drinks', 'Game guidance'], included: ['Game library access', 'Seating area', 'Game instructor', 'Snacks menu'], requirements: ['Food order minimum', 'Handle games with care'] },
  { id: 9, category: 'Indoor Fun', subcategory: 'Indoor Mini Golf', description: 'Fun and competitive mini-golf tracks', tags: ['mini golf', 'indoor'], teamSize: '4-30 people', location: 'Andheri, Mumbai', rating: 4.3, price: '₹1,800/hr', image: 'indoor mini golf', duration: '1-2 hours', highlights: ['9-hole course', 'Themed obstacles', 'Score cards', 'Competition format'], included: ['Golf equipment', 'Score tracking', 'Photography area', 'Refreshments'], requirements: ['Comfortable shoes', 'Follow course rules'] },
  { id: 10, category: 'Indoor Fun', subcategory: 'Arcade Gaming Zone', description: 'Retro & modern arcade games for all ages', tags: ['arcade', 'gaming', 'fun'], teamSize: '4-50 people', location: 'Phoenix Mall, Mumbai', rating: 4.4, price: '₹1,200/hr', image: 'arcade gaming zone', duration: '2-3 hours', highlights: ['100+ game machines', 'Racing games', 'Dance games', 'Prize redemption'], included: ['Game credits', 'Redemption tickets', 'Seating area', 'Party space'], requirements: ['Supervision for kids', 'No outside food'] },
  { id: 11, category: 'Indoor Fun', subcategory: 'Karaoke Rooms', description: 'Private karaoke lounges for fun singing sessions', tags: ['karaoke', 'music'], teamSize: '4-20 people', location: 'Juhu, Mumbai', rating: 4.6, price: '₹2,200/hr', image: 'karaoke room lounge', duration: '2-4 hours', highlights: ['Private rooms', 'Latest sound system', '1000+ songs', 'Food service'], included: ['Room booking', 'Music system', 'Microphones', 'Song library'], requirements: ['Minimum 2 hours booking', 'Food order mandatory'] },
  { id: 12, category: 'Indoor Fun', subcategory: 'Indoor Archery Range', description: 'Safe indoor archery for skill challenge', tags: ['archery', 'indoor'], teamSize: '4-20 people', location: 'Thane, Mumbai', rating: 4.5, price: '₹1,800/hr', image: 'indoor archery range', duration: '1-2 hours', highlights: ['Professional equipment', 'Safety training', 'Target practice', 'Competition mode'], included: ['Archery equipment', 'Safety gear', 'Instructor', 'Score cards'], requirements: ['Age 12+', 'Safety briefing mandatory'] },

  // Outdoor Adventure
  { id: 13, category: 'Outdoor Adventure', subcategory: 'Paintball Arena', description: 'Combat-style paintball matches for teams', tags: ['paintball', 'outdoor'], teamSize: '6-40 people', location: 'Virar, Mumbai', rating: 4.7, price: '₹3,500/hr', image: 'paintball arena outdoor', duration: '2-3 hours', highlights: ['Large outdoor arena', 'Multiple game modes', 'Safety equipment', 'Team battles'], included: ['Paintball markers', 'Safety gear', 'Paint rounds', 'Referee'], requirements: ['Age 16+', 'Closed shoes mandatory'] },
  { id: 14, category: 'Outdoor Adventure', subcategory: 'Go Karting', description: 'High-speed kart racing for corporate groups', tags: ['karting', 'racing'], teamSize: '4-30 people', location: 'Navi Mumbai', rating: 4.8, price: '₹4,000/hr', image: 'go kart racing track', duration: '1-2 hours', highlights: ['Professional track', 'Racing karts', 'Timing system', 'Podium ceremony'], included: ['Kart rental', 'Helmet & gloves', 'Race timing', 'Safety briefing'], requirements: ['Age 15+', 'Valid ID required'] },
  { id: 15, category: 'Outdoor Adventure', subcategory: 'Zipline Park', description: 'Thrilling zipline rides in natural settings', tags: ['zipline', 'adventure'], teamSize: '4-40 people', location: 'Lonavala', rating: 4.9, price: '₹3,000/hr', image: 'zipline adventure park', duration: '2-3 hours', highlights: ['Multiple zipline courses', 'Scenic views', 'Safety systems', 'Photo opportunities'], included: ['Safety harness', 'Helmet', 'Instructor guidance', 'Insurance'], requirements: ['Weight limit 120kg', 'Health declaration'] },
  { id: 16, category: 'Outdoor Adventure', subcategory: 'Rock Climbing Wall', description: 'Outdoor climbing for fitness & challenge', tags: ['rock climbing', 'fitness'], teamSize: '4-20 people', location: 'Thane', rating: 4.6, price: '₹2,500/hr', image: 'outdoor rock climbing wall', duration: '2-3 hours', highlights: ['Various difficulty levels', 'Safety equipment', 'Expert instructors', 'Team challenges'], included: ['Climbing gear', 'Safety harness', 'Instructor', 'Chalk bag'], requirements: ['Age 10+', 'Fitness assessment'] },
  { id: 17, category: 'Outdoor Adventure', subcategory: 'Obstacle Course', description: 'Military-style outdoor team obstacle challenges', tags: ['team building', 'obstacles'], teamSize: '6-60 people', location: 'Khopoli', rating: 4.7, price: '₹5,000/hr', image: 'outdoor obstacle course', duration: '3-4 hours', highlights: ['15+ obstacles', 'Team challenges', 'Timing system', 'Certificates'], included: ['Course access', 'Safety briefing', 'Instructor support', 'First aid'], requirements: ['Fitness level moderate', 'Sports attire'] },
  { id: 18, category: 'Outdoor Adventure', subcategory: 'Quad Biking', description: 'ATV driving across dirt terrains', tags: ['atv', 'outdoor'], teamSize: '4-20 people', location: 'Lonavala', rating: 4.8, price: '₹3,500/hr', image: 'quad bike atv riding', duration: '1-2 hours', highlights: ['Off-road terrain', 'Powerful ATVs', 'Guided trails', 'Scenic routes'], included: ['ATV rental', 'Helmet', 'Safety gear', 'Trail guide'], requirements: ['Valid license', 'Age 18+'] },
  { id: 19, category: 'Outdoor Adventure', subcategory: 'Trekking Zone', description: 'Nature treks ideal for team bonding', tags: ['trekking', 'nature'], teamSize: '5-50 people', location: 'Matheran', rating: 4.6, price: '₹2,000/person', image: 'group trekking nature', duration: '4-6 hours', highlights: ['Scenic trails', 'Nature exploration', 'Team bonding', 'Photography'], included: ['Trek guide', 'Trail map', 'First aid kit', 'Water supply'], requirements: ['Trekking shoes', 'Fitness level moderate'] },
  { id: 20, category: 'Outdoor Adventure', subcategory: 'Camping & Bonfire', description: 'Overnight camping with activities', tags: ['camping', 'team outing'], teamSize: '10-100 people', location: 'Pawna Lake', rating: 4.8, price: '₹3,500/person', image: 'camping bonfire team', duration: 'Full day/night', highlights: ['Lakeside camping', 'Bonfire night', 'Team activities', 'Stargazing'], included: ['Tent accommodation', 'Meals', 'Bonfire setup', 'Activity coordinator'], requirements: ['Sleeping bags optional', 'Weather dependent'] },
  { id: 21, category: 'Outdoor Adventure', subcategory: 'Rifle Shooting', description: 'Target practice sessions outdoors', tags: ['shooting', 'outdoor'], teamSize: '4-15 people', location: 'Karjat', rating: 4.7, price: '₹2,800/hr', image: 'rifle shooting range outdoor', duration: '1-2 hours', highlights: ['Professional range', 'Various firearms', 'Expert trainers', 'Safety protocols'], included: ['Rifle rental', 'Ammunition', 'Safety equipment', 'Instructor'], requirements: ['Age 18+', 'ID proof mandatory'] },

  // Sports
  { id: 22, category: 'Sports', subcategory: 'Football Turf', description: 'Size varies for 5v5–11v11 matches', tags: ['football', 'sports'], teamSize: '10-30 people', location: 'Andheri, Mumbai', rating: 4.5, price: '₹2,500/hr', image: 'football turf field', duration: '1-2 hours', highlights: ['Quality turf', 'Floodlights', 'Changing rooms', 'Referee available'], included: ['Turf booking', 'Footballs', 'Bibs', 'Water cooler'], requirements: ['Football shoes', 'Team jerseys optional'] },
  { id: 23, category: 'Sports', subcategory: 'Box Cricket Ground', description: 'Outdoor box cricket matches', tags: ['cricket', 'sports'], teamSize: '6-20 people', location: 'Malad, Mumbai', rating: 4.4, price: '₹2,000/hr', image: 'box cricket ground', duration: '1-2 hours', highlights: ['Box cricket setup', 'Cricket equipment', 'Scoreboard', 'Covered area'], included: ['Ground booking', 'Cricket gear', 'Score tracking', 'Umpire'], requirements: ['Cricket shoes', 'Sports attire'] },
  { id: 24, category: 'Sports', subcategory: 'Badminton Courts', description: '1–6 courts available for bookings', tags: ['badminton', 'sports'], teamSize: '2-20 people', location: 'Powai, Mumbai', rating: 4.6, price: '₹800/hr', image: 'badminton court indoor', duration: '1-2 hours', highlights: ['Wooden flooring', 'Lighting', 'Multiple courts', 'Air-conditioned'], included: ['Court booking', 'Shuttlecocks', 'Score system', 'Water'], requirements: ['Non-marking shoes', 'Own rackets preferred'] },
  { id: 25, category: 'Sports', subcategory: 'Tennis Courts', description: 'Courts for friendly tournaments', tags: ['tennis', 'sports'], teamSize: '4-10 people', location: 'BKC, Mumbai', rating: 4.7, price: '₹1,500/hr', image: 'tennis court outdoor', duration: '1-2 hours', highlights: ['Clay courts', 'Floodlights', 'Ball machine', 'Coaching available'], included: ['Court booking', 'Tennis balls', 'Net setup', 'Water'], requirements: ['Tennis shoes', 'Rackets (rental available)'] },
  { id: 26, category: 'Sports', subcategory: 'Table Tennis Studios', description: 'TT tables for tournaments', tags: ['tt', 'sports'], teamSize: '2-10 people', location: 'Lower Parel', rating: 4.5, price: '₹600/hr', image: 'table tennis studio', duration: '1-2 hours', highlights: ['Professional tables', 'Air-conditioned', 'Tournament setup', 'Coaching'], included: ['Table booking', 'TT balls', 'Score cards', 'Rackets (rental)'], requirements: ['Sports shoes', 'Comfortable clothing'] },
  { id: 27, category: 'Sports', subcategory: 'Basketball Court', description: 'Full or half courts for corporate games', tags: ['basketball', 'sports'], teamSize: '6-20 people', location: 'Goregaon, Mumbai', rating: 4.6, price: '₹2,000/hr', image: 'basketball court indoor', duration: '1-2 hours', highlights: ['Indoor court', 'Quality flooring', 'Hoops', 'Scoreboard'], included: ['Court booking', 'Basketballs', 'Bibs', 'First aid'], requirements: ['Basketball shoes', 'Sports attire'] },
  { id: 28, category: 'Sports', subcategory: 'Volleyball Court', description: 'Sand or indoor courts', tags: ['volleyball', 'sports'], teamSize: '6-20 people', location: 'Juhu, Mumbai', rating: 4.4, price: '₹1,800/hr', image: 'volleyball court', duration: '1-2 hours', highlights: ['Beach volleyball', 'Net setup', 'Floodlights', 'Changing rooms'], included: ['Court booking', 'Volleyball', 'Net', 'Score system'], requirements: ['Comfortable attire', 'Beach shoes optional'] },
  { id: 29, category: 'Sports', subcategory: 'Skating Rink', description: 'Indoor/outdoor skating activities', tags: ['skating', 'sports'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.5, price: '₹1,200/hr', image: 'skating rink indoor', duration: '1-2 hours', highlights: ['Smooth rink', 'Music system', 'Safety gear', 'Instructor'], included: ['Rink access', 'Skates rental', 'Safety pads', 'Locker'], requirements: ['Age 5+', 'Safety briefing'] },
  { id: 30, category: 'Sports', subcategory: 'Golf Course', description: 'Driving ranges + putting challenges', tags: ['golf', 'corporate'], teamSize: '4-20 people', location: 'Chembur, Mumbai', rating: 4.8, price: '₹5,000/hr', image: 'golf course driving range', duration: '2-3 hours', highlights: ['Driving range', 'Putting green', 'Pro shop', 'Coaching'], included: ['Range balls', 'Club rental', 'Instructor', 'Refreshments'], requirements: ['Golf attire', 'Booking in advance'] },
  { id: 31, category: 'Sports', subcategory: 'Fitness Studio', description: 'Yoga, Pilates, Zumba spaces', tags: ['fitness', 'yoga'], teamSize: '4-40 people', location: 'Worli, Mumbai', rating: 4.7, price: '₹3,000/hr', image: 'fitness studio yoga', duration: '1-2 hours', highlights: ['Spacious studio', 'Yoga mats', 'Sound system', 'Air conditioning'], included: ['Studio booking', 'Mats & props', 'Instructor', 'Water'], requirements: ['Comfortable clothing', 'Own mat optional'] },

  // Team Building
  { id: 32, category: 'Team Building', subcategory: 'Human Foosball Arena', description: 'Giant human-sized foosball', tags: ['team building', 'games'], teamSize: '8-20 people', location: 'Thane', rating: 4.6, price: '₹4,000/hr', image: 'human foosball game', duration: '1-2 hours', highlights: ['Unique experience', 'Team coordination', 'Fun gameplay', 'Photography'], included: ['Arena setup', 'Safety gear', 'Referee', 'Score tracking'], requirements: ['Comfortable clothing', 'Team spirit!'] },
  { id: 33, category: 'Team Building', subcategory: 'Relay Racing Track', description: 'Competition-style relay races', tags: ['relay', 'team building'], teamSize: '8-40 people', location: 'Navi Mumbai', rating: 4.5, price: '₹3,500/hr', image: 'relay race track', duration: '2-3 hours', highlights: ['Multiple race formats', 'Timing system', 'Team medals', 'Coaching'], included: ['Track access', 'Equipment', 'Timer', 'Medals'], requirements: ['Sports shoes', 'Fitness level basic'] },
  { id: 34, category: 'Team Building', subcategory: 'Blindfold Maze', description: 'Trust-based navigation challenges', tags: ['trust', 'team building'], teamSize: '6-20 people', location: 'Lonavala', rating: 4.7, price: '₹2,500/hr', image: 'team building blindfold activity', duration: '1-2 hours', highlights: ['Trust building', 'Communication', 'Problem solving', 'Debriefing'], included: ['Maze setup', 'Blindfolds', 'Facilitator', 'Certificates'], requirements: ['Team mindset', 'Open communication'] },
  { id: 35, category: 'Team Building', subcategory: 'Cooking Challenge Kitchen', description: 'Fun cooking competitions', tags: ['cooking', 'workshop'], teamSize: '6-20 people', location: 'Bandra, Mumbai', rating: 4.8, price: '₹4,500/hr', image: 'cooking workshop team building', duration: '2-3 hours', highlights: ['Professional kitchen', 'Chef guidance', 'Team competition', 'Meal included'], included: ['Ingredients', 'Equipment', 'Chef instructor', 'Recipes'], requirements: ['Aprons provided', 'Hygiene protocols'] },
  { id: 36, category: 'Team Building', subcategory: 'Hackathon Room', description: 'Rooms for innovation sprints', tags: ['tech', 'hackathon'], teamSize: '6-50 people', location: 'BKC, Mumbai', rating: 4.6, price: '₹6,000/hr', image: 'hackathon room workspace', duration: '4-8 hours', highlights: ['Tech infrastructure', 'Whiteboards', 'High-speed internet', 'Power backups'], included: ['Room booking', 'WiFi', 'Projectors', 'Refreshments'], requirements: ['Own laptops', 'Advance booking'] },
  { id: 37, category: 'Team Building', subcategory: 'Corporate Game Arena', description: 'Minute-to-win-it game zone', tags: ['games', 'team building'], teamSize: '6-50 people', location: 'Andheri, Mumbai', rating: 4.5, price: '₹3,500/hr', image: 'corporate team building games', duration: '2-3 hours', highlights: ['Multiple game stations', 'Team challenges', 'Score system', 'Prizes'], included: ['Game equipment', 'Facilitator', 'Score tracking', 'Trophies'], requirements: ['Comfortable clothing', 'Team participation'] },

  // Creative Workshops
  { id: 38, category: 'Creative Workshops', subcategory: 'Art & Painting Studio', description: 'Guided painting sessions', tags: ['art', 'painting'], teamSize: '4-25 people', location: 'Khar, Mumbai', rating: 4.7, price: '₹2,500/hr', image: 'art painting studio workshop', duration: '2-3 hours', highlights: ['Canvas painting', 'Art supplies', 'Expert guidance', 'Take home artwork'], included: ['Canvas & materials', 'Instructor', 'Aprons', 'Refreshments'], requirements: ['No prior experience', 'Open mindset'] },
  { id: 39, category: 'Creative Workshops', subcategory: 'Pottery Studio', description: 'Hands-on pottery workshops', tags: ['pottery', 'craft'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹2,800/hr', image: 'pottery studio workshop', duration: '2-3 hours', highlights: ['Pottery wheels', 'Clay modeling', 'Expert potter', 'Kiln firing'], included: ['Clay & tools', 'Wheel access', 'Instructor', 'Firing service'], requirements: ['Comfortable clothes', 'Short nails preferred'] },
  { id: 40, category: 'Creative Workshops', subcategory: 'DIY Craft Workshop', description: 'Crafts like candles, soaps, wood art', tags: ['craft', 'creative'], teamSize: '4-20 people', location: 'Juhu, Mumbai', rating: 4.5, price: '₹2,200/hr', image: 'diy craft workshop', duration: '2-3 hours', highlights: ['Multiple craft options', 'Materials provided', 'Expert guidance', 'Take home crafts'], included: ['All materials', 'Tools', 'Instructor', 'Packaging'], requirements: ['Choose craft type', 'Advance booking'] },
  { id: 41, category: 'Creative Workshops', subcategory: 'Photography Workshop', description: 'Learn professional photography', tags: ['photography', 'skill'], teamSize: '4-15 people', location: 'Colaba, Mumbai', rating: 4.7, price: '₹3,000/hr', image: 'photography workshop class', duration: '3-4 hours', highlights: ['Camera basics', 'Outdoor shoot', 'Photo editing', 'Portfolio review'], included: ['Instructor', 'Shooting locations', 'Editing tips', 'Certificate'], requirements: ['Own camera/phone', 'Interest in photography'] },
  { id: 42, category: 'Creative Workshops', subcategory: 'Music Jamming Session', description: 'Collaborative music sessions', tags: ['music', 'jamming'], teamSize: '4-15 people', location: 'Versova, Mumbai', rating: 4.6, price: '₹2,500/hr', image: 'music jam session studio', duration: '2-3 hours', highlights: ['Music studio', 'Instruments', 'Sound engineer', 'Recording'], included: ['Studio booking', 'Instruments', 'Engineer support', 'Audio recording'], requirements: ['Basic music knowledge', 'Passion for music'] },
  { id: 43, category: 'Creative Workshops', subcategory: 'Dance Workshop', description: 'Bollywood, contemporary, or salsa', tags: ['dance', 'fitness'], teamSize: '6-30 people', location: 'Andheri, Mumbai', rating: 4.7, price: '₹2,800/hr', image: 'dance workshop class', duration: '1-2 hours', highlights: ['Professional studio', 'Expert choreographer', 'Music system', 'Video recording'], included: ['Studio booking', 'Instructor', 'Music', 'Water'], requirements: ['Comfortable clothes', 'Dance shoes optional'] },

  // Wellness
  { id: 44, category: 'Wellness', subcategory: 'Corporate Yoga Session', description: 'Stress relief yoga for teams', tags: ['yoga', 'wellness'], teamSize: '4-50 people', location: 'Multiple locations', rating: 4.8, price: '₹2,500/hr', image: 'corporate yoga class', duration: '1-2 hours', highlights: ['Certified instructor', 'All levels welcome', 'Stress relief', 'Flexibility'], included: ['Yoga mats', 'Instructor', 'Music', 'Breathing exercises'], requirements: ['Empty stomach', 'Comfortable clothes'] },
  { id: 45, category: 'Wellness', subcategory: 'Meditation & Mindfulness', description: 'Guided meditation sessions', tags: ['meditation', 'wellness'], teamSize: '4-40 people', location: 'Worli, Mumbai', rating: 4.7, price: '₹2,000/hr', image: 'meditation mindfulness session', duration: '1 hour', highlights: ['Expert guidance', 'Calm environment', 'Stress management', 'Mental clarity'], included: ['Meditation space', 'Cushions', 'Instructor', 'Materials'], requirements: ['Quiet participation', 'Open mind'] },
  { id: 46, category: 'Wellness', subcategory: 'Spa & Massage Packages', description: 'Group spa experiences', tags: ['spa', 'relaxation'], teamSize: '4-20 people', location: 'Juhu, Mumbai', rating: 4.9, price: '₹5,000/person', image: 'spa massage wellness', duration: '2-3 hours', highlights: ['Luxury spa', 'Multiple treatments', 'Relaxation area', 'Refreshments'], included: ['Spa treatments', 'Robes & towels', 'Refreshments', 'Steam/sauna'], requirements: ['Advance booking', 'Health disclosure'] },
  { id: 47, category: 'Wellness', subcategory: 'Sound Healing Session', description: 'Therapeutic sound bath experience', tags: ['sound healing', 'wellness'], teamSize: '4-30 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹3,000/hr', image: 'sound healing therapy', duration: '1-2 hours', highlights: ['Singing bowls', 'Gong therapy', 'Relaxation', 'Energy healing'], included: ['Sound equipment', 'Yoga mats', 'Practitioner', 'Aromatherapy'], requirements: ['Comfortable clothes', 'No health issues'] },

  // Social & Food
  { id: 48, category: 'Social & Food', subcategory: 'Brewery Tour & Tasting', description: 'Craft beer tasting experience', tags: ['brewery', 'social'], teamSize: '6-30 people', location: 'Lower Parel, Mumbai', rating: 4.7, price: '₹2,500/person', image: 'brewery tour tasting', duration: '2-3 hours', highlights: ['Brewery tour', 'Beer tasting', 'Food pairing', 'Expert guidance'], included: ['Tour', 'Beer samples', 'Snacks', 'Tasting notes'], requirements: ['Age 21+', 'Valid ID'] },
  { id: 49, category: 'Social & Food', subcategory: 'Fine Dining Experience', description: 'Multi-course gourmet meals', tags: ['dining', 'food'], teamSize: '4-50 people', location: 'BKC, Mumbai', rating: 4.8, price: '₹5,000/person', image: 'fine dining restaurant', duration: '2-3 hours', highlights: ['Chef\'s special', 'Wine pairing', 'Elegant ambiance', 'Private dining'], included: ['Multi-course meal', 'Beverages', 'Service', 'Dessert'], requirements: ['Dress code', 'Advance booking'] },
  { id: 50, category: 'Social & Food', subcategory: 'Wine Tasting Event', description: 'Curated wine selection', tags: ['wine', 'tasting'], teamSize: '6-25 people', location: 'Colaba, Mumbai', rating: 4.7, price: '₹3,500/person', image: 'wine tasting event', duration: '2 hours', highlights: ['Wine selection', 'Sommelier guidance', 'Cheese pairing', 'Education'], included: ['Wine samples', 'Food pairing', 'Expert', 'Glassware'], requirements: ['Age 21+', 'ID mandatory'] },
  { id: 51, category: 'Social & Food', subcategory: 'Coffee Tasting Workshop', description: 'Barista-led coffee experience', tags: ['coffee', 'workshop'], teamSize: '4-20 people', location: 'Bandra, Mumbai', rating: 4.6, price: '₹1,500/person', image: 'coffee tasting workshop', duration: '2 hours', highlights: ['Coffee varieties', 'Brewing methods', 'Latte art', 'Roasting info'], included: ['Coffee samples', 'Materials', 'Barista', 'Snacks'], requirements: ['Coffee interest', 'Note taking optional'] },

  // Virtual & Tech
  { id: 52, category: 'Virtual & Tech', subcategory: 'VR Team Experience', description: 'Virtual reality team challenges', tags: ['vr', 'tech'], teamSize: '4-20 people', location: 'Worli, Mumbai', rating: 4.8, price: '₹4,000/hr', image: 'vr team experience', duration: '1-2 hours', highlights: ['Latest VR tech', 'Multiplayer games', 'Team missions', 'Leaderboards'], included: ['VR equipment', 'Game access', 'Instructor', 'Photos'], requirements: ['Age 10+', 'No motion sickness'] },
  { id: 53, category: 'Virtual & Tech', subcategory: 'AR Treasure Hunt', description: 'Augmented reality adventure', tags: ['ar', 'tech'], teamSize: '6-40 people', location: 'Multiple locations', rating: 4.6, price: '₹3,000/hr', image: 'ar augmented reality game', duration: '2-3 hours', highlights: ['AR technology', 'Outdoor adventure', 'Team challenges', 'Prizes'], included: ['AR app access', 'Devices', 'Facilitator', 'Prizes'], requirements: ['Smartphones', 'Internet'] },
  { id: 54, category: 'Virtual & Tech', subcategory: 'Gaming Tournament', description: 'E-sports competition setup', tags: ['gaming', 'esports'], teamSize: '6-30 people', location: 'Andheri, Mumbai', rating: 4.7, price: '₹3,500/hr', image: 'esports gaming tournament', duration: '2-4 hours', highlights: ['Gaming PCs', 'Popular games', 'Tournaments', 'Streaming'], included: ['PC setup', 'Games', 'Tournament format', 'Prizes'], requirements: ['Gaming interest', 'Fair play'] },
  { id: 55, category: 'Virtual & Tech', subcategory: 'Racing/Flight Simulator', description: 'Professional simulators', tags: ['simulator', 'tech'], teamSize: '2-15 people', location: 'Navi Mumbai', rating: 4.8, price: '₹4,500/hr', image: 'racing flight simulator', duration: '1-2 hours', highlights: ['Pro simulators', 'Realistic experience', 'Multiple tracks', 'Leaderboard'], included: ['Simulator access', 'VR headset', 'Instructor', 'Photos'], requirements: ['Age 12+', 'No motion sickness'] },

  // Offsites & Retreats
  { id: 56, category: 'Offsites & Retreats', subcategory: 'Resort Day Package', description: 'Full day resort experience', tags: ['resort', 'offsite'], teamSize: '20-200 people', location: 'Lonavala', rating: 4.8, price: '₹4,500/person', image: 'resort day package', duration: 'Full day', highlights: ['Resort facilities', 'Activities', 'Meals', 'Conference room'], included: ['Breakfast/lunch', 'Activities', 'Meeting space', 'WiFi'], requirements: ['Advance booking', 'Minimum group'] },
  { id: 57, category: 'Offsites & Retreats', subcategory: 'Farm Stay Retreat', description: 'Rustic farm experience', tags: ['farm', 'nature'], teamSize: '15-80 people', location: 'Karjat', rating: 4.7, price: '₹3,500/person', image: 'farm stay retreat', duration: 'Full day/overnight', highlights: ['Farm activities', 'Organic meals', 'Nature walks', 'Team building'], included: ['Accommodation', 'Meals', 'Activities', 'Guide'], requirements: ['Outdoor clothing', 'Insect repellent'] },
  { id: 58, category: 'Offsites & Retreats', subcategory: 'Nature Retreat', description: 'Wilderness camping experience', tags: ['nature', 'camping'], teamSize: '10-50 people', location: 'Matheran', rating: 4.9, price: '₹4,000/person', image: 'nature wilderness retreat', duration: '2 days/1 night', highlights: ['Mountain views', 'Camping', 'Trekking', 'Bonfire'], included: ['Tents', 'Meals', 'Activities', 'Guide'], requirements: ['Fitness level moderate', 'Weather dependent'] },
  { id: 59, category: 'Offsites & Retreats', subcategory: 'Beach Offsite', description: 'Coastal team retreat', tags: ['beach', 'offsite'], teamSize: '15-100 people', location: 'Alibaug', rating: 4.7, price: '₹3,800/person', image: 'beach offsite retreat', duration: 'Full day', highlights: ['Beach access', 'Water sports', 'BBQ', 'Team activities'], included: ['Beach resort', 'Meals', 'Activities', 'Transportation'], requirements: ['Swimming clothes', 'Sunscreen'] },

  // Premium Activities
  { id: 60, category: 'Premium Activities', subcategory: 'Yacht Party', description: 'Luxury yacht experience', tags: ['yacht', 'premium'], teamSize: '10-50 people', location: 'Gateway of India', rating: 4.9, price: '₹15,000/person', image: 'luxury yacht party', duration: '3-4 hours', highlights: ['Private yacht', 'Food & drinks', 'Music system', 'Scenic cruise'], included: ['Yacht rental', 'Catering', 'Crew', 'Entertainment'], requirements: ['Advance booking', 'Dress code'] },
  { id: 61, category: 'Premium Activities', subcategory: 'Sailing Experience', description: 'Learn to sail session', tags: ['sailing', 'water sports'], teamSize: '4-20 people', location: 'Mumbai Harbor', rating: 4.7, price: '₹5,000/person', image: 'sailing boat experience', duration: '2-3 hours', highlights: ['Professional sailors', 'Hands-on learning', 'Safety equipment', 'Scenic views'], included: ['Sailboat', 'Instructor', 'Safety gear', 'Refreshments'], requirements: ['Swimming ability', 'Life jackets provided'] },
  { id: 62, category: 'Premium Activities', subcategory: 'Hot Air Balloon', description: 'Sunrise hot air balloon ride', tags: ['balloon', 'adventure'], teamSize: '4-16 people', location: 'Lonavala', rating: 4.9, price: '₹12,000/person', image: 'hot air balloon ride', duration: '3-4 hours', highlights: ['Sunrise flight', 'Aerial views', 'Champagne toast', 'Certificate'], included: ['Balloon ride', 'Pickup/drop', 'Breakfast', 'Photos'], requirements: ['Weather dependent', 'Early morning'] },
  { id: 63, category: 'Premium Activities', subcategory: 'Horse Riding', description: 'Equestrian experience', tags: ['horses', 'riding'], teamSize: '4-15 people', location: 'Aamby Valley', rating: 4.6, price: '₹3,500/person', image: 'horse riding equestrian', duration: '2-3 hours', highlights: ['Horse riding', 'Expert trainers', 'Scenic trails', 'Photo ops'], included: ['Horse rental', 'Instructor', 'Safety gear', 'Training'], requirements: ['Comfortable clothes', 'Closed shoes'] },
  { id: 64, category: 'Premium Activities', subcategory: 'Helicopter Joy Ride', description: 'Aerial city tour', tags: ['helicopter', 'premium'], teamSize: '2-6 people', location: 'Juhu Aerodrome', rating: 4.9, price: '₹18,000/person', image: 'helicopter ride tour', duration: '15-30 minutes', highlights: ['Aerial views', 'City landmarks', 'Professional pilot', 'Photos'], included: ['Helicopter ride', 'Safety briefing', 'Photos', 'Certificate'], requirements: ['Weight limit', 'Weather dependent'] },
];

const getActivityImageUrl = (activityId: number) => {
  const imageMap: { [key: number]: string } = {
    1: 'https://images.unsplash.com/photo-1671427478429-3cfa4f905769?w=800&h=500&fit=crop&q=80',
    2: 'https://images.unsplash.com/photo-1751235641041-d5037f5ceb87?w=800&h=500&fit=crop&q=80',
    3: 'https://images.unsplash.com/photo-1540747913346-19e32778e8e5?w=800&h=500&fit=crop&q=80',
    4: 'https://images.unsplash.com/photo-1707916041849-927236f6b4c8?w=800&h=500&fit=crop&q=80',
    5: 'https://images.unsplash.com/photo-1708924401329-bb17acf6c16b?w=800&h=500&fit=crop&q=80',
    6: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800&h=500&fit=crop&q=80',
    7: 'https://images.unsplash.com/photo-1761207850889-75d5765d33c0?w=800&h=500&fit=crop&q=80',
    8: 'https://images.unsplash.com/photo-1559149811-7f3865354317?w=800&h=500&fit=crop&q=80',
    9: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=500&fit=crop&q=80',
    10: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=500&fit=crop&q=80',
    11: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop&q=80',
    12: 'https://images.unsplash.com/photo-1589889564639-c6566805e027?w=800&h=500&fit=crop&q=80',
    13: 'https://images.unsplash.com/photo-1765605898507-598a7cafe61e?w=800&h=500&fit=crop&q=80',
    14: 'https://images.unsplash.com/photo-1695227667418-e9cada1f9bd3?w=800&h=500&fit=crop&q=80',
    15: 'https://images.unsplash.com/photo-1763236606584-b9690beab73c?w=800&h=500&fit=crop&q=80',
    16: 'https://images.unsplash.com/photo-1701804341348-7144aac38085?w=800&h=500&fit=crop&q=80',
    17: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop&q=80',
    18: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&q=80',
    19: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=500&fit=crop&q=80',
    20: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=500&fit=crop&q=80',
    21: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=500&fit=crop&q=80',
    22: 'https://images.unsplash.com/photo-1712418516923-527799fb2bec?w=800&h=500&fit=crop&q=80',
    23: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=500&fit=crop&q=80',
    24: 'https://images.unsplash.com/photo-1624024834874-2a1611305604?w=800&h=500&fit=crop&q=80',
    25: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&h=500&fit=crop&q=80',
    26: 'https://images.unsplash.com/photo-1593786481241-85f612a9d5e9?w=800&h=500&fit=crop&q=80',
    27: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=500&fit=crop&q=80',
    28: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=500&fit=crop&q=80',
    29: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&h=500&fit=crop&q=80',
    30: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=500&fit=crop&q=80',
    31: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop&q=80',
    32: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=500&fit=crop&q=80',
    33: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=500&fit=crop&q=80',
    34: 'https://images.unsplash.com/photo-1647188098588-0a1f1a13732d?w=800&h=500&fit=crop&q=80',
    35: 'https://images.unsplash.com/photo-1581098078547-8c5f38f8df01?w=800&h=500&fit=crop&q=80',
    36: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&q=80',
    37: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=500&fit=crop&q=80',
    38: 'https://images.unsplash.com/photo-1609875133537-f46ea040efca?w=800&h=500&fit=crop&q=80',
    39: 'https://images.unsplash.com/photo-1763824371988-8c8eb3d13eff?w=800&h=500&fit=crop&q=80',
    40: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=500&fit=crop&q=80',
    41: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=500&fit=crop&q=80',
    42: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=500&fit=crop&q=80',
    43: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=500&fit=crop&q=80',
    44: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop&q=80',
    45: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop&q=80',
    46: 'https://images.unsplash.com/photo-1760882206955-f4e8321cc9f4?w=800&h=500&fit=crop&q=80',
    47: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=500&fit=crop&q=80',
    48: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&h=500&fit=crop&q=80',
    49: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80',
    50: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=500&fit=crop&q=80',
    51: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop&q=80',
    52: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=500&fit=crop&q=80',
    53: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&h=500&fit=crop&q=80',
    54: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=500&fit=crop&q=80',
    55: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=500&fit=crop&q=80',
    56: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80',
    57: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&q=80',
    58: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop&q=80',
    59: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop&q=80',
    60: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop&q=80',
    61: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop&q=80',
    62: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=500&fit=crop&q=80',
    63: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&h=500&fit=crop&q=80',
    64: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop&q=80',
  };
  return imageMap[activityId] || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=500&fit=crop&q=80';
};

export default function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [vendorNotice, setVendorNotice] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  const activity = activities.find((a) => a.id === parseInt(id || '0'));

  if (!activity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0e1e3f] mb-2">Activity not found</h2>
          <button
            type="button"
            onClick={() => navigate('/dashboard/activities')}
            className="text-[#4379ee] hover:underline"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'tc', label: 'T&C' },
    { id: 'payment', label: 'Payment' },
  ];

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback('Link copied to clipboard.');
      } else {
        setShareFeedback('Copy is not supported in this browser.');
      }
    } catch {
      setShareFeedback('Unable to copy link right now.');
    }
  };

  useEffect(() => {
    if (!shareFeedback) return;
    const id = window.setTimeout(() => setShareFeedback(''), 5000);
    return () => window.clearTimeout(id);
  }, [shareFeedback]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="activity"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search activities..." />

        <MogzuCorporateScrollSurface>
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Dashboard
              </button>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <button
                type="button"
                onClick={() => navigate('/dashboard/activities')}
                className="text-[#2563eb] hover:underline shrink-0"
              >
                Activities
              </button>
              <ChevronRight className="w-3 h-3 text-[#878e9e] shrink-0" />
              <span className="text-[#878e9e] break-words min-w-0">{activity.subcategory}</span>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2 md:col-span-1">
                <ImageWithFallback
                  src={getActivityImageUrl(activity.id)}
                  alt={activity.subcategory}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-4">
                <ImageWithFallback
                  src={getActivityImageUrl(activity.id + 1)}
                  alt={activity.subcategory}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <ImageWithFallback
                  src={getActivityImageUrl(activity.id + 2)}
                  alt={activity.subcategory}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <ImageWithFallback
                  src={getActivityImageUrl(activity.id + 3)}
                  alt={activity.subcategory}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <ImageWithFallback
                  src={getActivityImageUrl(activity.id + 4)}
                  alt={activity.subcategory}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              {/* Left Column - Details */}
              <div>
                <div className="bg-white rounded-lg mb-6 shadow-sm border border-[#ececec]">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-[#4379ee] text-white rounded-full text-xs font-semibold">
                            {activity.category}
                          </span>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-[#FFCC47] text-[#FFCC47]" />
                            <span className="font-semibold text-[#0e1e3f]">{activity.rating} (128)</span>
                          </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[#0e1e3f] mb-2">
                          {activity.subcategory}
                        </h1>
                        <p className="text-sm text-[#878e9e]">{activity.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <WishlistHeart
                          listingId={String(activity.id)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-100 text-[#878e9e] hover:bg-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleShare}
                          aria-label="Copy page link"
                          className="w-10 h-10 rounded-full bg-gray-100 text-[#878e9e] hover:bg-gray-200 flex items-center justify-center transition-all"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {shareFeedback && (
                      <p className="text-xs text-[#475569] mt-2" role="status">
                        {shareFeedback}
                      </p>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="border-t border-[#ececec]">
                    <div className="flex gap-6 px-6 overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedTab(tab.id)}
                          className={`pb-3 pt-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            selectedTab === tab.id
                              ? 'text-[#2563eb]'
                              : 'text-[#878e9e] hover:text-[#475569]'
                          }`}
                        >
                          {tab.label}
                          {selectedTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563eb]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {selectedTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-[#ececec]">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Location</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{activity.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Users className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Team Size</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{activity.teamSize}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                              <Clock className="w-5 h-5 text-[#4379ee]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#878e9e] mb-1">Duration</p>
                              <p className="text-sm font-semibold text-[#0e1e3f]">{activity.duration}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-3">About this activity</h2>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            {activity.fullDescription || `Experience the best ${activity.subcategory.toLowerCase()} for your corporate team building needs. Located in the heart of ${activity.location.split(',')[0]}, this activity is perfect for teams of ${activity.teamSize}. Our professional staff will ensure your team has a productive and engaging time.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'amenities' && (
                      <div className="space-y-6">
                        {activity.highlights && activity.highlights.length > 0 && (
                          <div>
                            <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Activity Highlights</h2>
                            <div className="grid grid-cols-2 gap-3">
                              {activity.highlights.map((highlight, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-[#0e1e3f]">{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {activity.included && activity.included.length > 0 && (
                          <div className="pt-6 border-t border-[#ececec]">
                            <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">What's Included</h2>
                            <div className="space-y-2">
                              {activity.included.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Check className="w-5 h-5 text-[#4379ee] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-[#0e1e3f]">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTab === 'portfolio' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Past Events</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-40 rounded-lg overflow-hidden relative group">
                              <ImageWithFallback
                                src={getActivityImageUrl(activity.id + item + 5)}
                                alt={`Portfolio ${item}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'tc' && (
                      <div className="space-y-6">
                        {activity.requirements && activity.requirements.length > 0 && (
                          <div>
                            <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Requirements</h2>
                            <div className="space-y-2">
                              {activity.requirements.map((req, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Shield className="w-5 h-5 text-[#fa8d40] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-[#0e1e3f]">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="pt-6 border-t border-[#ececec]">
                          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Cancellation Policy</h2>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            Free cancellation up to 48 hours before the scheduled activity time. Cancellations made within 24-48 hours will incur a 50% fee. No-shows or cancellations within 24 hours are non-refundable.
                          </p>
                        </div>
                      </div>
                    )}



                    {selectedTab === 'payment' && (
                      <div>
                        <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Payment Options & Terms</h2>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-0.5">•</span>
                            <span>Pay 25% advance to confirm your booking</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-0.5">•</span>
                            <span>Remaining balance due 3 days before the event</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[#475569]">
                            <span className="text-[#878e9e] mt-0.5">•</span>
                            <span>Corporate invoicing available for eligible companies</span>
                          </li>
                        </ul>
                        <div className="flex gap-3">
                          <div className="h-10 px-4 border border-[#ececec] rounded bg-[#f7f9fc] flex items-center justify-center text-sm font-medium text-[#475569]">Credit Card</div>
                          <div className="h-10 px-4 border border-[#ececec] rounded bg-[#f7f9fc] flex items-center justify-center text-sm font-medium text-[#475569]">UPI</div>
                          <div className="h-10 px-4 border border-[#ececec] rounded bg-[#f7f9fc] flex items-center justify-center text-sm font-medium text-[#475569]">Net Banking</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg p-6 border border-[#ececec] shadow-sm">
                  <h2 className="text-lg font-semibold text-[#0e1e3f] mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#fff7ed] text-[#fa8d40] text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">More activities</h2>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Browse the full catalog for more team experiences.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/activities')}
                    className="w-full py-2 px-4 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View all activities
                  </button>
                </div>
              </div>

              {/* Right Column - Booking Card */}
              <div>
                <div className="bg-white rounded-lg p-5 border border-[#ececec] shadow-sm sticky top-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#0e1e3f] mb-3">Booking Status</h3>
                    
                    <div className="flex flex-col gap-3">
                      <PricingBlock
                        mode="negotiable"
                        price={activity.price}
                        priceUnit=""
                        onSubmitOffer={(offer, message) => {
                          setVendorNotice(
                            `Offer of ₹${offer} submitted${message.trim() ? ' with your note.' : '.'} The vendor will review it.`,
                          );
                        }}
                        onCheckAvailability={() => {
                          setVendorNotice('Checking availability with the vendor…');
                          window.setTimeout(() => {
                            setVendorNotice(
                              'Availability check sent. Watch the booking status below for updates.',
                            );
                          }, 1200);
                        }}
                      />
                      {vendorNotice && (
                        <p className="text-xs text-[#0e1e3f] bg-[#f0f9ff] border border-[#2563eb]/20 rounded-lg px-3 py-2" role="status">
                          {vendorNotice}
                        </p>
                      )}

                      <div className="space-y-3">
                        <ResponseStatusBanner
                          status="awaiting"
                          activityId={activity.id}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#ececec] space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#0e1e3f]">
                      <Calendar className="w-4 h-4 text-[#4379ee]" />
                      <span>Flexible booking dates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0e1e3f]">
                      <Shield className="w-4 h-4 text-[#4379ee]" />
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0e1e3f]">
                      <Users className="w-4 h-4 text-[#4379ee]" />
                      <span>Group discounts available</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#ececec]">
                    <p className="text-xs text-[#878e9e] mb-3">Need help with booking?</p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/communication', {
                          state: {
                            source: 'activity-detail',
                            channel: 'support',
                            activityId: activity.id,
                            activityName: activity.subcategory,
                          },
                        })
                      }
                      className="w-full py-2.5 border border-[#4379ee] text-[#4379ee] font-semibold rounded-lg hover:bg-[#eff6ff] transition-all"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Users, Clock, MapPin, Check, ChevronRight, AlertCircle } from 'lucide-react';

interface Activity {
  id: number;
  category: string;
  subcategory: string;
  location: string;
  price: string;
  teamSize: string;
  duration?: string;
}

const activities: Activity[] = [
  { id: 1, category: 'Indoor Fun', subcategory: 'Bowling Alley', location: 'Andheri West, Mumbai', price: '₹2,500/hr', teamSize: '2-50 people', duration: '2-3 hours' },
  { id: 2, category: 'Indoor Fun', subcategory: 'Trampoline Park', location: 'Bandra, Mumbai', price: '₹3,000/hr', teamSize: '5-80 people', duration: '1-2 hours' },
  { id: 3, category: 'Indoor Fun', subcategory: 'Indoor Cricket', location: 'Powai, Mumbai', price: '₹2,000/hr', teamSize: '6-24 people', duration: '1-2 hours' },
  { id: 4, category: 'Indoor Fun', subcategory: 'Pool & Snooker Lounge', location: 'Lower Parel, Mumbai', price: '₹1,500/hr', teamSize: '2-20 people', duration: '2-4 hours' },
  { id: 5, category: 'Indoor Fun', subcategory: 'VR Arcade', location: 'Worli, Mumbai', price: '₹3,500/hr', teamSize: '2-20 people', duration: '1-2 hours' },
  { id: 6, category: 'Indoor Fun', subcategory: 'Laser Tag Arena', location: 'Goregaon, Mumbai', price: '₹2,800/hr', teamSize: '6-30 people', duration: '1.5-2 hours' },
  { id: 7, category: 'Indoor Fun', subcategory: 'Escape Room', location: 'Malad, Mumbai', price: '₹2,000/hr', teamSize: '2-12 people', duration: '1 hour' },
  { id: 8, category: 'Indoor Fun', subcategory: 'Board Game Cafe', location: 'Bandra, Mumbai', price: '₹800/hr', teamSize: '4-20 people', duration: '2-4 hours' },
  { id: 9, category: 'Indoor Fun', subcategory: 'Indoor Mini Golf', location: 'Andheri, Mumbai', price: '₹1,800/hr', teamSize: '4-30 people', duration: '1-2 hours' },
  { id: 10, category: 'Indoor Fun', subcategory: 'Arcade Gaming Zone', location: 'Phoenix Mall, Mumbai', price: '₹1,200/hr', teamSize: '4-50 people', duration: '2-3 hours' },
  { id: 11, category: 'Indoor Fun', subcategory: 'Karaoke Rooms', location: 'Juhu, Mumbai', price: '₹2,200/hr', teamSize: '4-20 people', duration: '2-4 hours' },
  { id: 12, category: 'Indoor Fun', subcategory: 'Indoor Archery Range', location: 'Thane, Mumbai', price: '₹1,800/hr', teamSize: '4-20 people', duration: '1-2 hours' },
  { id: 13, category: 'Outdoor Adventure', subcategory: 'Paintball Arena', location: 'Virar, Mumbai', price: '₹3,500/hr', teamSize: '6-40 people', duration: '2-3 hours' },
  { id: 14, category: 'Outdoor Adventure', subcategory: 'Go Karting', location: 'Navi Mumbai', price: '₹4,000/hr', teamSize: '4-30 people', duration: '1-2 hours' },
  { id: 15, category: 'Outdoor Adventure', subcategory: 'Zipline Park', location: 'Lonavala', price: '₹3,000/hr', teamSize: '4-40 people', duration: '2-3 hours' },
  { id: 16, category: 'Outdoor Adventure', subcategory: 'Rock Climbing Wall', location: 'Thane', price: '₹2,500/hr', teamSize: '4-20 people', duration: '2-3 hours' },
  { id: 17, category: 'Outdoor Adventure', subcategory: 'Obstacle Course', location: 'Khopoli', price: '₹5,000/hr', teamSize: '6-60 people', duration: '3-4 hours' },
  { id: 18, category: 'Outdoor Adventure', subcategory: 'Quad Biking', location: 'Lonavala', price: '₹3,500/hr', teamSize: '4-20 people', duration: '1-2 hours' },
  { id: 19, category: 'Outdoor Adventure', subcategory: 'Trekking Zone', location: 'Matheran', price: '₹2,000/person', teamSize: '5-50 people', duration: '4-6 hours' },
  { id: 20, category: 'Outdoor Adventure', subcategory: 'Camping & Bonfire', location: 'Pawna Lake', price: '₹3,500/person', teamSize: '10-100 people', duration: 'Full day/night' },
  { id: 21, category: 'Outdoor Adventure', subcategory: 'Rifle Shooting', location: 'Karjat', price: '₹2,800/hr', teamSize: '4-15 people', duration: '1-2 hours' },
  { id: 22, category: 'Sports', subcategory: 'Football Turf', location: 'Andheri, Mumbai', price: '₹2,500/hr', teamSize: '10-30 people', duration: '1-2 hours' },
  { id: 23, category: 'Sports', subcategory: 'Box Cricket Ground', location: 'Malad, Mumbai', price: '₹2,000/hr', teamSize: '6-20 people', duration: '1-2 hours' },
  { id: 24, category: 'Sports', subcategory: 'Badminton Courts', location: 'Powai, Mumbai', price: '₹800/hr', teamSize: '2-20 people', duration: '1-2 hours' },
  { id: 25, category: 'Sports', subcategory: 'Tennis Courts', location: 'BKC, Mumbai', price: '₹1,500/hr', teamSize: '4-10 people', duration: '1-2 hours' },
  { id: 26, category: 'Sports', subcategory: 'Table Tennis Studios', location: 'Lower Parel', price: '₹600/hr', teamSize: '2-10 people', duration: '1-2 hours' },
  { id: 27, category: 'Sports', subcategory: 'Basketball Court', location: 'Goregaon, Mumbai', price: '₹2,000/hr', teamSize: '6-20 people', duration: '1-2 hours' },
  { id: 28, category: 'Sports', subcategory: 'Volleyball Court', location: 'Juhu, Mumbai', price: '₹1,800/hr', teamSize: '6-20 people', duration: '1-2 hours' },
  { id: 29, category: 'Sports', subcategory: 'Skating Rink', location: 'Bandra, Mumbai', price: '₹1,200/hr', teamSize: '4-20 people', duration: '1-2 hours' },
  { id: 30, category: 'Sports', subcategory: 'Golf Course', location: 'Chembur, Mumbai', price: '₹5,000/hr', teamSize: '4-20 people', duration: '2-3 hours' },
  { id: 31, category: 'Sports', subcategory: 'Fitness Studio', location: 'Worli, Mumbai', price: '₹3,000/hr', teamSize: '4-40 people', duration: '1-2 hours' },
  { id: 32, category: 'Team Building', subcategory: 'Human Foosball Arena', location: 'Thane', price: '₹4,000/hr', teamSize: '8-20 people', duration: '1-2 hours' },
  { id: 33, category: 'Team Building', subcategory: 'Relay Racing Track', location: 'Navi Mumbai', price: '₹3,500/hr', teamSize: '8-40 people', duration: '2-3 hours' },
  { id: 34, category: 'Team Building', subcategory: 'Blindfold Maze', location: 'Lonavala', price: '₹2,500/hr', teamSize: '6-20 people', duration: '1-2 hours' },
  { id: 35, category: 'Team Building', subcategory: 'Cooking Challenge Kitchen', location: 'Bandra, Mumbai', price: '₹4,500/hr', teamSize: '6-20 people', duration: '2-3 hours' },
  { id: 36, category: 'Team Building', subcategory: 'Hackathon Room', location: 'BKC, Mumbai', price: '₹6,000/hr', teamSize: '6-50 people', duration: '4-8 hours' },
  { id: 37, category: 'Team Building', subcategory: 'Corporate Game Arena', location: 'Andheri, Mumbai', price: '₹3,500/hr', teamSize: '6-50 people', duration: '2-3 hours' },
  { id: 38, category: 'Creative Workshops', subcategory: 'Art & Painting Studio', location: 'Khar, Mumbai', price: '₹2,500/hr', teamSize: '4-25 people', duration: '2-3 hours' },
  { id: 39, category: 'Creative Workshops', subcategory: 'Pottery Studio', location: 'Bandra, Mumbai', price: '₹2,800/hr', teamSize: '4-20 people', duration: '2-3 hours' },
  { id: 40, category: 'Creative Workshops', subcategory: 'DIY Craft Workshop', location: 'Juhu, Mumbai', price: '₹2,200/hr', teamSize: '4-20 people', duration: '2-3 hours' },
  { id: 41, category: 'Creative Workshops', subcategory: 'Photography Workshop', location: 'Colaba, Mumbai', price: '₹3,000/hr', teamSize: '4-15 people', duration: '3-4 hours' },
  { id: 42, category: 'Creative Workshops', subcategory: 'Music Jamming Session', location: 'Versova, Mumbai', price: '₹2,500/hr', teamSize: '4-15 people', duration: '2-3 hours' },
  { id: 43, category: 'Creative Workshops', subcategory: 'Dance Workshop', location: 'Andheri, Mumbai', price: '₹2,800/hr', teamSize: '6-30 people', duration: '1-2 hours' },
  { id: 44, category: 'Wellness', subcategory: 'Corporate Yoga Session', location: 'Multiple locations', price: '₹2,500/hr', teamSize: '4-50 people', duration: '1-2 hours' },
  { id: 45, category: 'Wellness', subcategory: 'Meditation & Mindfulness', location: 'Worli, Mumbai', price: '₹2,000/hr', teamSize: '4-40 people', duration: '1 hour' },
  { id: 46, category: 'Wellness', subcategory: 'Spa & Massage Packages', location: 'Juhu, Mumbai', price: '₹5,000/person', teamSize: '4-20 people', duration: '2-3 hours' },
  { id: 47, category: 'Wellness', subcategory: 'Sound Healing Session', location: 'Bandra, Mumbai', price: '₹3,000/hr', teamSize: '4-30 people', duration: '1-2 hours' },
  { id: 48, category: 'Social & Food', subcategory: 'Brewery Tour & Tasting', location: 'Lower Parel, Mumbai', price: '₹2,500/person', teamSize: '6-30 people', duration: '2-3 hours' },
  { id: 49, category: 'Social & Food', subcategory: 'Fine Dining Experience', location: 'BKC, Mumbai', price: '₹5,000/person', teamSize: '4-50 people', duration: '2-3 hours' },
  { id: 50, category: 'Social & Food', subcategory: 'Wine Tasting Event', location: 'Colaba, Mumbai', price: '₹3,500/person', teamSize: '6-25 people', duration: '2 hours' },
  { id: 51, category: 'Social & Food', subcategory: 'Coffee Tasting Workshop', location: 'Bandra, Mumbai', price: '₹1,500/person', teamSize: '4-20 people', duration: '2 hours' },
  { id: 52, category: 'Virtual & Tech', subcategory: 'VR Team Experience', location: 'Worli, Mumbai', price: '₹4,000/hr', teamSize: '4-20 people', duration: '1-2 hours' },
  { id: 53, category: 'Virtual & Tech', subcategory: 'AR Treasure Hunt', location: 'Multiple locations', price: '₹3,000/hr', teamSize: '6-40 people', duration: '2-3 hours' },
  { id: 54, category: 'Virtual & Tech', subcategory: 'Gaming Tournament', location: 'Andheri, Mumbai', price: '₹3,500/hr', teamSize: '6-30 people', duration: '2-4 hours' },
  { id: 55, category: 'Virtual & Tech', subcategory: 'Racing/Flight Simulator', location: 'Navi Mumbai', price: '₹4,500/hr', teamSize: '2-15 people', duration: '1-2 hours' },
  { id: 56, category: 'Offsites & Retreats', subcategory: 'Resort Day Package', location: 'Lonavala', price: '₹4,500/person', teamSize: '20-200 people', duration: 'Full day' },
  { id: 57, category: 'Offsites & Retreats', subcategory: 'Farm Stay Retreat', location: 'Karjat', price: '₹3,500/person', teamSize: '15-80 people', duration: 'Full day/overnight' },
  { id: 58, category: 'Offsites & Retreats', subcategory: 'Nature Retreat', location: 'Matheran', price: '₹4,000/person', teamSize: '10-50 people', duration: '2 days/1 night' },
  { id: 59, category: 'Offsites & Retreats', subcategory: 'Beach Offsite', location: 'Alibaug', price: '₹3,800/person', teamSize: '15-100 people', duration: 'Full day' },
  { id: 60, category: 'Premium Activities', subcategory: 'Yacht Party', location: 'Gateway of India', price: '₹15,000/person', teamSize: '10-50 people', duration: '3-4 hours' },
  { id: 61, category: 'Premium Activities', subcategory: 'Sailing Experience', location: 'Mumbai Harbor', price: '₹5,000/person', teamSize: '4-20 people', duration: '2-3 hours' },
  { id: 62, category: 'Premium Activities', subcategory: 'Hot Air Balloon', location: 'Lonavala', price: '₹12,000/person', teamSize: '4-16 people', duration: '3-4 hours' },
  { id: 63, category: 'Premium Activities', subcategory: 'Horse Riding', location: 'Aamby Valley', price: '₹3,500/person', teamSize: '4-15 people', duration: '2-3 hours' },
  { id: 64, category: 'Premium Activities', subcategory: 'Helicopter Joy Ride', location: 'Juhu Aerodrome', price: '₹18,000/person', teamSize: '2-6 people', duration: '15-30 minutes' },
];

export default function ActivityBookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFailed, setIsFailed] = useState(false);

  const activity = activities.find((a) => a.id === parseInt(id || '0'));

  // Step 1: Date, Time & Participants
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [numParticipants, setNumParticipants] = useState('');
  const [duration, setDuration] = useState('');

  // Step 2: Additional Requirements
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [addOns, setAddOns] = useState<string[]>([]);

  // Step 3: Contact Information
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  if (!activity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0e1e3f] mb-2">Activity not found</h2>
          <button
            onClick={() => navigate('/dashboard/activities')}
            className="text-[#4379ee] hover:underline"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Date & Time', icon: Calendar },
    { number: 2, title: 'Requirements', icon: Users },
    { number: 3, title: 'Contact Info', icon: MapPin },
    { number: 4, title: 'Review', icon: Check },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Simulate random failure 20% of the time
      if (Math.random() < 0.2) {
        setIsFailed(true);
        return;
      }
      // Submit booking
      navigate('/dashboard/activities');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/dashboard/activities/${id}`);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return bookingDate && bookingTime && numParticipants && duration;
    }
    if (currentStep === 2) {
      return true; // Optional fields
    }
    if (currentStep === 3) {
      return contactName && contactEmail && contactPhone && companyName;
    }
    return true;
  };

  if (isFailed) {
    return (
      <div className="flex h-screen bg-[#f5f7fa] overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-[#f5f7fa] flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-6">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                {/* Failure Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                  </div>
                </div>

                {/* Failure Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Booking unsuccessful
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Something went wrong while processing your request. Your payment has not been charged.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsFailed(false)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/communication')}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Header */}
      <div className="bg-white border-b border-[#ececec]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#4379ee] hover:text-[#3568dd] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Activity Info Banner */}
        <div className="bg-white rounded-lg p-4 border border-[#ececec] mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#0e1e3f] mb-1">{activity.subcategory}</h1>
              <div className="flex items-center gap-4 text-sm text-[#878e9e]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{activity.teamSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.duration}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#878e9e] mb-1">Starting at</p>
              <p className="text-2xl font-bold text-[#0e1e3f]">{activity.price}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep >= step.number
                      ? 'bg-[#4379ee] text-white'
                      : 'bg-gray-200 text-[#878e9e]'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <p
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number ? 'text-[#0e1e3f]' : 'text-[#878e9e]'
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > step.number ? 'bg-[#4379ee]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg p-8 border border-[#ececec]">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#0e1e3f] mb-6">Select Date, Time & Participants</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Preferred Time *
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  >
                    <option value="">Select time slot</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Number of Participants *
                  </label>
                  <input
                    type="number"
                    value={numParticipants}
                    onChange={(e) => setNumParticipants(e.target.value)}
                    placeholder="Enter number of participants"
                    min="1"
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                  <p className="text-xs text-[#878e9e] mt-1">Allowed: {activity.teamSize}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Duration *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  >
                    <option value="">Select duration</option>
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="full-day">Full day</option>
                    <option value="overnight">Overnight</option>
                  </select>
                  <p className="text-xs text-[#878e9e] mt-1">Typical duration: {activity.duration}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#0e1e3f] mb-6">Additional Requirements & Preferences</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any specific requests or customizations..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Dietary Restrictions (if food is included)
                  </label>
                  <input
                    type="text"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="Vegetarian, vegan, allergies, etc."
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Accessibility Requirements
                  </label>
                  <input
                    type="text"
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                    placeholder="Wheelchair access, special assistance, etc."
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-3">
                    Add-ons (Optional)
                  </label>
                  <div className="space-y-2">
                    {['Photography', 'Video Coverage', 'Custom Branding', 'Extended Hours', 'Catering'].map((addon) => (
                      <label key={addon} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addOns.includes(addon)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddOns([...addOns, addon]);
                            } else {
                              setAddOns(addOns.filter((a) => a !== addon));
                            }
                          }}
                          className="w-4 h-4 text-[#4379ee] border-gray-300 rounded focus:ring-[#4379ee]"
                        />
                        <span className="text-sm text-[#0e1e3f]">{addon}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-[#0e1e3f] mb-6">Contact Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0e1e3f] mb-2">
                    Billing Address
                  </label>
                  <textarea
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter billing address"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-[#ececec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-bold text-[#0e1e3f] mb-6">Review Your Booking</h2>
              <div className="space-y-6">
                {/* Activity Details */}
                <div className="pb-4 border-b border-[#ececec]">
                  <h3 className="text-sm font-semibold text-[#878e9e] mb-3">ACTIVITY DETAILS</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Activity</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{activity.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Location</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{activity.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Date</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">
                        {new Date(bookingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Time</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{bookingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Participants</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{numParticipants} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Duration</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{duration} {duration === '1' ? 'hour' : duration.includes('-') ? '' : 'hours'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Requirements */}
                {(specialRequests || dietaryRestrictions || accessibility || addOns.length > 0) && (
                  <div className="pb-4 border-b border-[#ececec]">
                    <h3 className="text-sm font-semibold text-[#878e9e] mb-3">ADDITIONAL REQUIREMENTS</h3>
                    <div className="space-y-2">
                      {specialRequests && (
                        <div>
                          <span className="text-sm text-[#878e9e]">Special Requests:</span>
                          <p className="text-sm text-[#0e1e3f] mt-1">{specialRequests}</p>
                        </div>
                      )}
                      {dietaryRestrictions && (
                        <div>
                          <span className="text-sm text-[#878e9e]">Dietary Restrictions:</span>
                          <p className="text-sm text-[#0e1e3f] mt-1">{dietaryRestrictions}</p>
                        </div>
                      )}
                      {accessibility && (
                        <div>
                          <span className="text-sm text-[#878e9e]">Accessibility:</span>
                          <p className="text-sm text-[#0e1e3f] mt-1">{accessibility}</p>
                        </div>
                      )}
                      {addOns.length > 0 && (
                        <div>
                          <span className="text-sm text-[#878e9e]">Add-ons:</span>
                          <p className="text-sm text-[#0e1e3f] mt-1">{addOns.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="pb-4 border-b border-[#ececec]">
                  <h3 className="text-sm font-semibold text-[#878e9e] mb-3">CONTACT INFORMATION</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Name</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{contactName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Email</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{contactEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Phone</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{contactPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Company</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{companyName}</span>
                    </div>
                    {billingAddress && (
                      <div>
                        <span className="text-sm text-[#878e9e]">Billing Address:</span>
                        <p className="text-sm text-[#0e1e3f] mt-1">{billingAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-semibold text-[#878e9e] mb-3">PRICING ESTIMATE</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#878e9e]">Base Price</span>
                      <span className="text-sm font-medium text-[#0e1e3f]">{activity.price}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#ececec]">
                      <span className="text-base font-semibold text-[#0e1e3f]">Total (Estimated)</span>
                      <span className="text-lg font-bold text-[#4379ee]">{activity.price}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#878e9e] mt-3">
                    * Final pricing will be confirmed by our team based on your requirements
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-[#ececec]">
            <button
              onClick={handleBack}
              className="px-6 py-3 border-2 border-[#ececec] text-[#0e1e3f] font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-[#4379ee] text-white font-semibold rounded-lg hover:bg-[#3568dd] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentStep === 4 ? 'Confirm Booking' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

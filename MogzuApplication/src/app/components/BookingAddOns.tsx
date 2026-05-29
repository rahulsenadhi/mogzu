import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ChevronLeft, Star, MapPin, Users, Coffee, GlassWater, Projector, Armchair, Table2, Presentation, PenTool, NotebookPen, Mic, Speaker } from 'lucide-react';
import imgImage25005 from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { MogzuLegacyDemoBanner } from '@/app/components/ui/MogzuLegacyDemoBanner';
import { buildClassicBookingBaseState, computeGrandTotal, type ClassicBookingAddon } from '@/app/lib/classicBookingFlow';

export default function BookingAddOns() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'conference';
  const flowBase = buildClassicBookingBaseState(location.state);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const coffeePreset = flowBase.addOns.find((a) => a.key === 'coffee_tea');
  const waterPreset = flowBase.addOns.find((a) => a.key === 'drinking_water');
  const [coffeeAndTea, setCoffeeAndTea] = useState(Boolean(coffeePreset));
  const [coffeeQuantity, setCoffeeQuantity] = useState(coffeePreset?.quantity ?? 1);
  const [drinkingWater, setDrinkingWater] = useState(Boolean(waterPreset));
  const [waterQuantity, setWaterQuantity] = useState(waterPreset?.quantity ?? 1);

  const [equipment, setEquipment] = useState<Record<string, {selected: boolean, quantity: number}>>({});
  const [addMoreHint, setAddMoreHint] = useState('');

  const handleEquipmentChange = (key: string, selected: boolean) => {
    setEquipment(prev => ({
      ...prev,
      [key]: { quantity: prev[key]?.quantity || 1, selected }
    }));
  };

  const handleEquipmentQuantityChange = (key: string, quantity: number) => {
    setEquipment(prev => ({
      ...prev,
      [key]: { selected: prev[key]?.selected || false, quantity }
    }));
  };

  const coffeeRate = 50;
  const waterRate = 20;

  const handleAddMore = () => {
    const selectedEquipmentKeys = Object.entries(equipment)
      .filter(([, value]) => value?.selected)
      .map(([key]) => key);

    const hasCoffee = coffeeAndTea;
    const hasWater = drinkingWater;

    // "Add more" is treated as increasing quantities for whichever add-ons are selected.
    if (hasCoffee) setCoffeeQuantity((q) => Math.min(q + 1, 20));
    if (hasWater) setWaterQuantity((q) => Math.min(q + 1, 50));

    if (!hasCoffee && !hasWater && selectedEquipmentKeys.length > 0) {
      const firstKey = selectedEquipmentKeys[0];
      setAddMoreHint('');
      setEquipment((prev) => {
        const current = prev[firstKey];
        if (!current) return prev;
        return {
          ...prev,
          [firstKey]: {
            ...current,
            quantity: Math.min(current.quantity + 1, 20),
          },
        };
      });
      return;
    }

    if (hasCoffee || hasWater) {
      setAddMoreHint('');
      return;
    }

    if (!hasCoffee && !hasWater && selectedEquipmentKeys.length === 0) {
      setAddMoreHint('Select at least one add-on before adding more.');
    }
  };

  // Category-specific equipment options
  const getCategoryContent = () => {
    switch (category) {
      case 'activity':
        return {
          title: 'Corporate Activity Suite',
          types: 'Team Building, Wellness, Workshop',
          capacity: '5-100 participants',
          basePrice: 20000,
          serviceFee: 2000,
          addons: [
            { key: 'photography', label: 'Event Photography', icon: Projector, price: 500 },
            { key: 'catering', label: 'Refreshment Box', icon: Coffee, price: 150 },
            { key: 'certificates', label: 'Completion Certificates', icon: NotebookPen, price: 20 },
          ]
        };
      case 'promotion':
        return {
          title: 'Exclusive Vendor Deal',
          types: 'Promotional Bundles',
          capacity: '1-10 units',
          basePrice: 5000,
          serviceFee: 500,
          addons: [
            { key: 'custom_branding', label: 'Custom Brand Logo', icon: PenTool, price: 50 },
            { key: 'express_delivery', label: 'Express Delivery', icon: MapPin, price: 200 },
          ]
        };
      case 'stay':
        return {
          title: 'Executive Hotel Stay',
          types: 'Single, Double, Suite',
          capacity: '1-50 guests',
          basePrice: 12000,
          serviceFee: 1200,
          addons: [
            { key: 'airport_transfer', label: 'Airport Transfer', icon: MapPin, price: 800 },
            { key: 'late_checkout', label: 'Late Checkout', icon: Table2, price: 500 },
          ]
        };
      case 'event':
        return {
          title: 'Industry Tech Summit',
          types: 'General, VIP, Backstage',
          capacity: '1-200 attendees',
          basePrice: 15000,
          serviceFee: 1500,
          addons: [
            { key: 'parking', label: 'VIP Parking', icon: MapPin, price: 200 },
            { key: 'drink_coupons', label: 'Drink Coupons', icon: GlassWater, price: 100 },
            { key: 'merchandise', label: 'Event Merchandise', icon: NotebookPen, price: 300 },
          ]
        };
      case 'gifting':
        return {
          title: 'Premium Gifting Partner',
          types: 'Welcome Kit, Festive Hamper, Executive Gift',
          capacity: '10-500 items',
          basePrice: 8000,
          serviceFee: 800,
          addons: [
            { key: 'custom_branding', label: 'Custom Brand Logo', icon: PenTool, price: 50 },
            { key: 'express_delivery', label: 'Express Delivery', icon: MapPin, price: 200 },
            { key: 'greeting_card', label: 'Personalized Greeting Card', icon: NotebookPen, price: 30 },
          ]
        };
      case 'conference':
        return {
          title: 'Professional Conference Center',
          types: 'Boardroom, Conference Hall, Training Room',
          capacity: '4-30 people',
          basePrice: 15000,
          serviceFee: 1500,
          addons: [
            { key: 'projector', label: 'Projector & Screen', icon: Projector, price: 100 },
            { key: 'whiteboard', label: 'Whiteboard', icon: PenTool, price: 100 },
            { key: 'chairs', label: 'Executive Chairs', icon: Armchair, price: 50 },
            { key: 'notepads', label: 'Notepads & Pens', icon: NotebookPen, price: 50 },
            { key: 'mic', label: 'Wireless Mic', icon: Mic, price: 100 },
            { key: 'speaker', label: 'Conference Speakers', icon: Speaker, price: 100 },
          ]
        };
      case 'casual':
        return {
          title: 'Creative Lounge Space',
          types: 'Lounge, Café-Style, Terrace',
          capacity: '2-15 people',
          basePrice: 5000,
          serviceFee: 500,
          addons: [
            { key: 'chairs', label: 'Lounge Seating', icon: Armchair, price: 50 },
            { key: 'table', label: 'Café Tables', icon: Table2, price: 100 },
            { key: 'speaker', label: 'Bluetooth Speaker', icon: Speaker, price: 100 },
            { key: 'whiteboard', label: 'Creative Board', icon: PenTool, price: 100 },
          ]
        };
      case 'corporate':
        return {
          title: 'Grand Event Venue',
          types: 'Banquet Hall, Event Hall, Auditorium',
          capacity: '20-100 people',
          basePrice: 45000,
          serviceFee: 4500,
          addons: [
            { key: 'projector', label: 'LED Display / Projector', icon: Projector, price: 200 },
            { key: 'mic', label: 'Stage Microphones', icon: Mic, price: 150 },
            { key: 'speaker', label: 'Sound System', icon: Speaker, price: 200 },
            { key: 'chairs', label: 'Banquet Seating', icon: Armchair, price: 30 },
            { key: 'table', label: 'Event Tables', icon: Table2, price: 80 },
            { key: 'whiteboard', label: 'Presentation Board', icon: Presentation, price: 100 },
          ]
        };
      default:
        // coworking
        return {
          title: 'WorkHub BKC',
          types: 'Hot Desk, Dedicated Desk, Private Office, Meeting Rooms',
          capacity: '5-50 seats',
          basePrice: 66000,
          serviceFee: 6600,
          addons: [
            { key: 'projector', label: 'Projector & Screen', icon: Projector, price: 100 },
            { key: 'chairs', label: 'Extra Chairs', icon: Armchair, price: 50 },
            { key: 'table', label: 'Meeting Table', icon: Table2, price: 100 },
            { key: 'whiteboard', label: 'Whiteboard', icon: PenTool, price: 100 },
          ]
        };
    }
  };

  const content = getCategoryContent();
  const categoryEquipment = content.addons;

  const basePrice = flowBase.bookingBaseTotal || content.basePrice;
  const serviceFee = flowBase.serviceFee || content.serviceFee;
  const summaryImage = flowBase.spaceImage || imgImage25005;
  const summaryName = flowBase.spaceName || content.title;
  const summaryTypes = flowBase.spaceTypes || content.types;
  const summaryLocation = flowBase.location || 'Bandra Kurla Complex, Mumbai';
  const summaryCapacity = flowBase.capacityRange || content.capacity;
  const summaryRating = flowBase.rating || '4.8';

  const equipmentTotal = content.addons.reduce((total, addon) => {
    const equip = equipment[addon.key];
    return total + (equip?.selected ? addon.price * (equip.quantity || 1) : 0);
  }, 0);

  const addOnsTotal =
    (coffeeAndTea ? coffeeRate * coffeeQuantity : 0) + (drinkingWater ? waterRate * waterQuantity : 0);
  const grandTotal = computeGrandTotal(basePrice, serviceFee, addOnsTotal + equipmentTotal);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <MogzuLegacyDemoBanner
              className="mb-4"
              title="Classic booking flow"
              detail="Legacy DSpace checkout (request → add-ons → review → payment). Prefer /book/space/:id for live Supabase bookings."
            />
            {/* Back Button and Title */}
            <div className="mb-4 lg:mb-6">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#0e1e3f] hover:text-[#2563eb] mb-3 lg:mb-4"
              >
                <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7" />
              </button>
              <h1 className="text-2xl lg:text-[32px] font-semibold text-[#0e1e3f] leading-tight lg:leading-10">Request to book</h1>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center gap-2 lg:gap-3 mb-6 lg:mb-8 overflow-x-auto pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 1:</span>
                <span className="text-sm text-[#959595]">Booking details</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 2:</span>
                <span className="text-sm text-[#22c55e] font-medium">Add ons</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 3:</span>
                <span className="text-sm text-[#959595]">Review details</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0e1e3f]">Step 4:</span>
                <span className="text-sm text-[#959595]">Pay</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              {/* Left Column - Add-ons Selection */}
              <div className="bg-white rounded-lg p-4 md:p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-[#0e1e3f] mb-6">Select additional items</h2>

                {/* Coffee & Tea */}
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-[#e5e7eb]">
                  <div className="flex items-center h-6 mt-1">
                    <input
                      type="checkbox"
                      id="coffee-tea"
                      checked={coffeeAndTea}
                      onChange={(e) => setCoffeeAndTea(e.target.checked)}
                      className="w-5 h-5 text-[#2563eb] border-[#e5e7eb] rounded focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <Coffee className="w-6 h-6 text-[#0e1e3f]" />
                    <div className="flex-1">
                      <label htmlFor="coffee-tea" className="block text-base font-medium text-[#0e1e3f] cursor-pointer">
                        Coffee & Tea
                      </label>
                      <p className="text-sm text-[#878e9e]">For per person • ₹{coffeeRate}/unit</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[#475569] font-medium">Units:</label>
                        <select
                          value={coffeeQuantity}
                          onChange={(e) => setCoffeeQuantity(parseInt(e.target.value))}
                          disabled={!coffeeAndTea}
                          className="w-20 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-base font-semibold text-[#0e1e3f]">₹{coffeeAndTea ? coffeeRate * coffeeQuantity : 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drinking Water */}
                <div className="flex items-start gap-4 mb-6 pb-5 border-b border-[#e5e7eb]">
                  <div className="flex items-center h-6 mt-1">
                    <input
                      type="checkbox"
                      id="drinking-water"
                      checked={drinkingWater}
                      onChange={(e) => setDrinkingWater(e.target.checked)}
                      className="w-5 h-5 text-[#2563eb] border-[#e5e7eb] rounded focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <GlassWater className="w-6 h-6 text-[#0e1e3f]" />
                    <div className="flex-1">
                      <label htmlFor="drinking-water" className="block text-base font-medium text-[#0e1e3f] cursor-pointer">
                        Drinking Water
                      </label>
                      <p className="text-sm text-[#878e9e]">For per person • ₹{waterRate}/unit</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[#475569] font-medium">Units:</label>
                        <select
                          value={waterQuantity}
                          onChange={(e) => setWaterQuantity(parseInt(e.target.value))}
                          disabled={!drinkingWater}
                          className="w-20 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          {[...Array(50)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-base font-semibold text-[#0e1e3f]">₹{drinkingWater ? waterRate * waterQuantity : 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category-specific equipment options */}
                {categoryEquipment.map(item => {
                  const IconComponent = item.icon;
                  return (
                  <div key={item.key} className="flex items-start gap-4 mb-5 pb-5 border-b border-[#e5e7eb]">
                    <div className="flex items-center h-6 mt-1">
                      <input
                        type="checkbox"
                        id={item.key}
                        checked={equipment[item.key as keyof typeof equipment]?.selected || false}
                        onChange={(e) => handleEquipmentChange(item.key, e.target.checked)}
                        className="w-5 h-5 text-[#2563eb] border-[#e5e7eb] rounded focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-[#f8fafc] rounded-full text-[#2563eb]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={item.key} className="block text-base font-medium text-[#0e1e3f] cursor-pointer">
                          {item.label}
                        </label>
                        <p className="text-sm text-[#878e9e]">For per person • ₹{item.price}/unit</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-[#475569] font-medium">Units:</label>
                          <select
                            value={equipment[item.key as keyof typeof equipment]?.quantity || 1}
                            onChange={(e) => handleEquipmentQuantityChange(item.key, parseInt(e.target.value))}
                            disabled={!(equipment[item.key as keyof typeof equipment]?.selected || false)}
                            className="w-20 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            {[...Array(20)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-base font-semibold text-[#0e1e3f]">₹{(equipment[item.key as keyof typeof equipment]?.selected || false) ? item.price * (equipment[item.key as keyof typeof equipment]?.quantity || 1) : 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}

                {/* Add more button */}
                <div>
                  <button
                    type="button"
                    onClick={handleAddMore}
                    className="px-6 py-2 border-2 border-[#2563eb] text-[#2563eb] rounded-lg font-medium text-base hover:bg-[#2563eb]/5 transition-colors"
                  >
                    Add more
                  </button>
                  {addMoreHint && (
                    <p className="text-sm text-amber-700 mt-2">{addMoreHint}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="bg-white rounded-lg p-6">
                {/* Space Details */}
                <div className="mb-6">
                  <div className="relative rounded-md overflow-hidden mb-4">
                    <img
                      src={summaryImage}
                      alt={summaryName}
                      className="w-full h-[154px] object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-[#22c55e] px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="text-white text-base font-normal">{summaryRating}</span>
                      <Star className="w-[18px] h-[18px] fill-white text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-[#0e1e3f] mb-1">{summaryName}</h3>
                  <p className="text-sm text-[#878e9e] mb-3">
                    {summaryTypes}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-[#878e9e]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-[22px] h-[22px]" />
                      <span>{summaryLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#878e9e] mt-2">
                    <Users className="w-[22px] h-[22px]" />
                    <span>{summaryCapacity}</span>
                  </div>
                </div>

                {/* Date and Duration */}
                <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-[#0e1e3f]">Membership period</h4>
                    <button
                      onClick={() => navigate('/request-to-book', { state: location.state })}
                      type="button"
                      className="text-sm text-[#2563eb] font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-[#878e9e] mb-1">Start date</p>
                      <p className="text-base text-[#0e1e3f]">Jun 28, 2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#878e9e] mb-1">Duration</p>
                      <p className="text-base text-[#0e1e3f]">3 Months</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-lg font-semibold text-[#0e1e3f] mb-4">Price</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg text-[#475569]">
                      <span>₹{basePrice.toLocaleString('en-IN')} Base</span>
                      <span>₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    {coffeeAndTea && (
                      <div className="flex justify-between text-lg text-[#475569]">
                        <span>Coffee & Tea × {coffeeQuantity}</span>
                        <span>₹ {coffeeRate * coffeeQuantity}</span>
                      </div>
                    )}
                    {drinkingWater && (
                      <div className="flex justify-between text-lg text-[#475569]">
                        <span>Drinking Water × {waterQuantity}</span>
                        <span>₹ {waterRate * waterQuantity}</span>
                      </div>
                    )}
                    {content.addons.map((addon) => {
                      const equip = equipment[addon.key as keyof typeof equipment];
                      if (equip?.selected) {
                        return (
                          <div key={addon.key} className="flex justify-between text-lg text-[#475569]">
                            <span>{addon.label} × {equip.quantity}</span>
                            <span>₹ {addon.price * (equip.quantity || 1)}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                    <div className="flex justify-between text-lg text-[#475569]">
                      <span>Service fee</span>
                      <span>₹{serviceFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xl font-medium text-[#0e1e3f] pt-2 border-t border-[#e5e7eb]">
                      <span>Total</span>
                      <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#878e9e] mt-4">
                    Free cancellation up to 7 days prior to start date
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 mb-12">
                <button
                  onClick={() => navigate('/request-to-book', { state: location.state })}
                className="flex items-center justify-center sm:justify-start gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium text-base transition-colors order-2 sm:order-1"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 border-2 border-[#e5e7eb] text-[#0e1e3f] rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const composedAddons: ClassicBookingAddon[] = []
                    if (coffeeAndTea) {
                      composedAddons.push({
                        key: 'coffee_tea',
                        label: 'Coffee & Tea',
                        unitPrice: coffeeRate,
                        quantity: coffeeQuantity,
                        total: coffeeRate * coffeeQuantity,
                      })
                    }
                    if (drinkingWater) {
                      composedAddons.push({
                        key: 'drinking_water',
                        label: 'Drinking Water',
                        unitPrice: waterRate,
                        quantity: waterQuantity,
                        total: waterRate * waterQuantity,
                      })
                    }
                    content.addons.forEach((addon) => {
                      const equip = equipment[addon.key]
                      if (!equip?.selected) return
                      composedAddons.push({
                        key: addon.key,
                        label: addon.label,
                        unitPrice: addon.price,
                        quantity: equip.quantity || 1,
                        total: addon.price * (equip.quantity || 1),
                      })
                    })
                    const updatedFlow = {
                      ...flowBase,
                      addOns: composedAddons,
                      addOnTotal: composedAddons.reduce((sum, item) => sum + item.total, 0),
                      bookingBaseTotal: basePrice,
                      serviceFee,
                      bookingGrandTotal: grandTotal,
                    }
                    navigate('/booking-review', {
                      state: {
                        ...location.state,
                        bookingFlow: updatedFlow,
                        category,
                      },
                    })
                  }}
                  className="px-12 py-3 bg-[#2563eb] text-white rounded-lg font-medium text-base hover:bg-[#1d4ed8] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
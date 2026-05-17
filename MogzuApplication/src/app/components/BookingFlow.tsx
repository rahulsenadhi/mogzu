import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Search, ChevronDown, Bell, HelpCircle, ChevronLeft, MapPin, Users, Upload, X, Check, FileText, Package, Truck, CreditCard, Gift, Share2, Plus, Calendar } from 'lucide-react';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import { appendUnifiedBooking } from '@/app/lib/bookingRecordsStorage';
import { deriveBookingTypeFromStatus } from '@/app/lib/bookingStatus';

interface Recipient {
  name: string;
  email: string;
  size: string;
  sendDate: string;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface GiftingBookingProductPayload {
  id?: number;
  category?: string;
  name?: string;
  brand?: string;
  location?: string;
  rating?: number;
  basePrice?: number;
  brandingPrice?: number;
  processingFee?: number;
  gst?: number;
  image?: string;
  moq?: number;
  colors?: string[];
  sizes?: string[];
  vendor?: string;
}

interface GiftingBookingCustomizationPayload {
  productQty?: number;
  sizeBreakdown?: SizeQuantity[];
  selectedColors?: string[];
  uploadedLogo?: string | null;
  logoFileName?: string;
  logoUploadId?: string | null;
  brandingMethod?: string;
  brandingPosition?: string;
  requestSample?: boolean;
}

interface GiftingBookingLocationState {
  product?: GiftingBookingProductPayload;
  customization?: GiftingBookingCustomizationPayload;
}

const defaultBookingProduct = {
  id: 1,
  category: 'apparel',
  name: 'Printed Round Neck Cotton Blend Black T-Shirt',
  brand: 'RodZen',
  location: 'Goregaon (East) Mumbai',
  rating: 4.5,
  basePrice: 300,
  brandingPrice: 50,
  processingFee: 1000,
  gst: 18,
  image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHRzaGlydCUyMGdyYXBoaWN8ZW58MXx8fHwxNzM5MzgwNzk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  moq: 10,
  colors: ['Black', 'White', 'Navy', 'Grey'],
  sizes: ['S', 'M', 'L', 'XL'],
  vendor: 'Mogzu Gifting',
};

export default function BookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingState = location.state as GiftingBookingLocationState | null;
  const productData = bookingState?.product ?? null;
  const customizationFromPdp = bookingState?.customization;

  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [recipientToolMessage, setRecipientToolMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Company size configuration
  const [companySize, setCompanySize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Step 1: Buying Details
  const [plannedFor, setPlannedFor] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [approver, setApprover] = useState('');

  // Step 2: Customization & Branding (hydrate from product page when provided)
  const [productQty, setProductQty] = useState(
    () => customizationFromPdp?.productQty ?? 10
  );
  const [sizeBreakdown, setSizeBreakdown] = useState<SizeQuantity[]>(() => {
    if (customizationFromPdp?.sizeBreakdown?.length) {
      return customizationFromPdp.sizeBreakdown;
    }
    return [
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 4 },
      { size: 'L', quantity: 3 },
      { size: 'XL', quantity: 1 },
    ];
  });
  const [selectedColors, setSelectedColors] = useState<string[]>(
    () => customizationFromPdp?.selectedColors ?? ['Black']
  );
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(
    () => customizationFromPdp?.uploadedLogo ?? null
  );
  const [logoFileName, setLogoFileName] = useState(
    () => customizationFromPdp?.logoFileName ?? ''
  );
  const [brandingMethod, setBrandingMethod] = useState(
    () => customizationFromPdp?.brandingMethod ?? 'screen-print'
  );
  const [brandingPosition, setBrandingPosition] = useState(
    () => customizationFromPdp?.brandingPosition ?? 'center-chest'
  );
  const [requestSample, setRequestSample] = useState(
    () => customizationFromPdp?.requestSample ?? false
  );

  // Step 3: Greetings & Recipients
  const [greetingMethod, setGreetingMethod] = useState('we-send'); // 'we-send' or 'you-send'
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: '', email: '', size: 'M', sendDate: '' }
  ]);

  // Step 4: Delivery Details
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryAddress2, setDeliveryAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Step 6: Payment
  const [paymentOption, setPaymentOption] = useState('pay-now'); // 'pay-now' or 'pay-partial'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'vendor'
  const [cardType, setCardType] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [messageForHost, setMessageForHost] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400' },
    { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800' },
    { id: 'bookings', label: 'Bookings', icon: 'paf72c00' },
    { id: 'favorites', label: 'Favorites', icon: 'p27070280' },
    { id: 'users', label: 'Users', icon: 'p29193540' },
    { id: 'notification', label: 'Notification', icon: 'p4e64800' },
    { id: 'communication', label: 'Communication', icon: 'p319d300' },
    { id: 'report', label: 'Report', icon: 'p1f81a280' },
    { id: 'transactions', label: 'Transactions', icon: 'p2683f80' },
    { id: 'settings', label: 'Settings', icon: 'pde1bb00' },
  ];

  const product = productData
    ? { ...defaultBookingProduct, ...productData }
    : defaultBookingProduct;

  const moq = product.moq;

  // Calculate pricing
  const getCurrentPrice = () => {
    if (productQty >= 100) return 240;
    if (productQty >= 50) return 260;
    if (productQty >= 25) return 280;
    return 300;
  };

  const calculateTotal = () => {
    const itemPrice = getCurrentPrice();
    const subtotal = itemPrice * productQty;
    const brandingCost = uploadedLogo ? product.brandingPrice * productQty : 0;
    const beforeTax = subtotal + brandingCost + product.processingFee;
    const gstAmount = (beforeTax * product.gst) / 100;
    const total = beforeTax + gstAmount;
    
    return {
      subtotal,
      brandingCost,
      processingFee: product.processingFee,
      gstAmount,
      total
    };
  };

  const pricing = calculateTotal();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedLogo(reader.result as string);
        setLogoFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSizeQuantity = (size: string, quantity: number) => {
    const newBreakdown = sizeBreakdown.map(item =>
      item.size === size ? { ...item, quantity: Math.max(0, quantity) } : item
    );
    setSizeBreakdown(newBreakdown);
    const total = newBreakdown.reduce((sum, item) => sum + item.quantity, 0);
    setProductQty(total);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { name: '', email: '', size: 'M', sendDate: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!plannedFor) newErrors.plannedFor = 'This field is required';
    if (!contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!selectedTeam) newErrors.selectedTeam = 'Please select a team';
    if (!approver) newErrors.approver = 'Please select an approver';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (productQty < moq) newErrors.quantity = `Minimum order quantity is ${moq}`;
    if (selectedColors.length === 0) newErrors.colors = 'Please select at least one color';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (greetingMethod === 'we-send') {
      recipients.forEach((recipient, index) => {
        if (!recipient.name) newErrors[`recipient${index}name`] = 'Name is required';
        if (!recipient.email) newErrors[`recipient${index}email`] = 'Email is required';
        if (!recipient.size) newErrors[`recipient${index}size`] = 'Size is required';
        if (!recipient.sendDate) newErrors[`recipient${index}date`] = 'Date is required';
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};
    if (!deliveryAddress) newErrors.address = 'Delivery address is required';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!pincode) newErrors.pincode = 'Pincode is required';
    if (!deliveryContact) newErrors.deliveryContact = 'Contact person is required';
    if (!deliveryPhone) newErrors.deliveryPhone = 'Contact phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    const newErrors: Record<string, string> = {};
    if (!termsAccepted) {
      newErrors.terms = 'Please accept the terms and conditions to continue';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep6 = () => {
    const newErrors: Record<string, string> = {};
    if (paymentMethod === 'card') {
      if (!cardType) newErrors.cardType = 'Please select card type';
      if (!cardName) newErrors.cardName = 'Name on card is required';
      if (!cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
      if (!cardCvv) newErrors.cardCvv = 'CVV is required';
    } else if (paymentMethod === 'upi') {
      if (!upiId) newErrors.upiId = 'UPI ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const steps = [
    { number: 1, label: 'Buying details', status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'upcoming' },
    { number: 2, label: 'Customization', status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'upcoming' },
    { number: 3, label: 'Greetings', status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'upcoming' },
    { number: 4, label: 'Delivery', status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'upcoming' },
    { number: 5, label: 'Review details', status: currentStep === 5 ? 'active' : currentStep > 5 ? 'completed' : 'upcoming' },
    { number: 6, label: 'Pay', status: currentStep === 6 ? 'active' : 'upcoming' },
  ];

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
      case 6:
        isValid = validateStep6();
        if (isValid) {
          // Save booking data to localStorage
          const bookingData = {
            id: `GFT${Date.now().toString().slice(-6)}`,
            name: product.name,
            category: 'Gifting',
            venue: `${city}, ${state}`,
            vendor: product.vendor,
            assignTo: approver,
            fromDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            toDate: recipients[0]?.sendDate ? new Date(recipients[0].sendDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            attendance: productQty,
            quantity: productQty,
            price: Math.round(pricing.total),
            status: 'CONFIRMED',
            type: 'Confirmed',
            bookingType: 'gifting',
            customization: {
              sizes: sizeBreakdown.filter(s => s.quantity > 0),
              colors: selectedColors,
              branding: uploadedLogo ? { method: brandingMethod, position: brandingPosition, logo: logoFileName } : null,
              sampleRequested: requestSample
            },
            delivery: {
              address: deliveryAddress,
              address2: deliveryAddress2,
              city,
              state,
              pincode,
              contact: deliveryContact,
              phone: deliveryPhone,
              instructions: deliveryInstructions
            },
            payment: {
              method: paymentMethod,
              option: paymentOption,
              amount: paymentOption === 'pay-now' ? Math.round(pricing.total) : 5000
            },
            greetingMethod,
            recipients: greetingMethod === 'we-send' ? recipients : [],
            plannedFor,
            team: selectedTeam
          };

          appendUnifiedBooking({
            id: bookingData.id,
            name: bookingData.name,
            venue: bookingData.venue,
            vendor: bookingData.vendor,
            assignTo: bookingData.assignTo,
            fromDate: bookingData.fromDate,
            toDate: bookingData.toDate,
            attendance: bookingData.attendance,
            price: bookingData.price,
            status: bookingData.status,
            type: deriveBookingTypeFromStatus(bookingData.status),
            source: 'gifting',
          });

          navigate('/bookings');
          return;
        }
        break;
    }

    if (isValid && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleApplyCoupon = () => {
    if (isApplyingCoupon) return;
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim();
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }

    setIsApplyingCoupon(true);
    setTimeout(() => {
      // Demo validation only; pricing breakdown is not recalculated in this flow.
      if (code.toUpperCase() === 'MOGZU10') {
        setCouponSuccess('Coupon applied successfully.');
      } else {
        setCouponError('Invalid coupon code.');
      }
      setIsApplyingCoupon(false);
    }, 450);
  };

  const handleUploadRecipients = () => {
    setRecipientToolMessage('Recipient CSV upload is available in the next release. Use manual add for now.');
  };

  const handleBulkPasteRecipients = () => {
    setRecipientToolMessage('Bulk paste is available in the next release. Use manual add for now.');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex min-h-screen h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search " />

        {/* Content Area */}
        <MogzuCorporateScrollSurface>
          <div className="max-w-[1200px] mx-auto px-6 py-4">
            {/* Header */}
            <div className="mb-4">
              <button onClick={handleBack} className="flex items-center gap-2 text-[#0e1e3f] mb-3 hover:text-[#2563eb] transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-lg font-semibold">Request to buy</span>
              </button>

              {/* Progress Steps */}
              <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      step.status === 'active' ? 'bg-green-50' : ''
                    }`}>
                      <span className={`text-xs font-semibold ${
                        step.status === 'active' ? 'text-[#16a34a]' : 
                        step.status === 'completed' ? 'text-[#4b5563]' : 
                        'text-[#9ca3af]'
                      }`}>
                        {step.number}
                      </span>
                      <span className={`text-xs font-medium ${
                        step.status === 'active' ? 'text-[#16a34a]' : 
                        step.status === 'completed' ? 'text-[#4b5563]' : 
                        'text-[#9ca3af]'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="mx-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
              {/* Left Column - Form */}
              <div className="bg-white rounded-xl border border-[#ececec] p-5">
                {/* Step 1: Buying Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#0e1e3f] pb-3 border-b border-[#ececec]">Buying Details</h2>
                    <div>
                      <label className="text-sm font-medium text-[#0e1e3f] mb-2 block">
                        What are you planning for?<span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="eg. Meetings, Workshops"
                        value={plannedFor}
                        onChange={(e) => setPlannedFor(e.target.value)}
                        className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                      {errors.plannedFor && <p className="text-xs text-[#ef4444] mt-1">{errors.plannedFor}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#0e1e3f] mb-2 block">
                        Contact number<span className="text-[#ef4444]">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 border border-[#ececec] rounded-lg bg-white">
                          <span className="text-lg">🇮🇳</span>
                          <span className="text-sm text-[#878e9e]">+91</span>
                          <ChevronDown className="w-4 h-4 text-[#878e9e]" />
                        </div>
                        <input
                          type="text"
                          placeholder="9862"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          className="flex-1 px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                      </div>
                      {errors.contactNumber && <p className="text-xs text-[#ef4444] mt-1">{errors.contactNumber}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#0e1e3f] mb-2 block">
                        Select the team<span className="text-[#ef4444]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none"
                        >
                          <option value="">select from team</option>
                          <option value="design-team">Design Team</option>
                          <option value="engineering-team">Engineering Team</option>
                          <option value="marketing-team">Marketing Team</option>
                          <option value="sales-team">Sales Team</option>
                          <option value="hr-team">HR Team</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#878e9e] pointer-events-none" />
                      </div>
                      {errors.selectedTeam && <p className="text-xs text-[#ef4444] mt-1">{errors.selectedTeam}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#0e1e3f] mb-2 block">
                        Who needs to approve this booking?<span className="text-[#ef4444]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={approver}
                          onChange={(e) => setApprover(e.target.value)}
                          className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none"
                        >
                          <option value="">select team member</option>
                          <option value="raj-kohli">Raj Kohli</option>
                          <option value="priya-sharma">Priya Sharma</option>
                          <option value="vikram-patel">Vikram Patel</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#878e9e] pointer-events-none" />
                      </div>
                      {errors.approver && <p className="text-xs text-[#ef4444] mt-1">{errors.approver}</p>}
                    </div>

                    {/* Step Navigation */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#ececec]">
                      <button
                        onClick={handleBack}
                        className="px-5 py-2 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-5 py-2 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Customization & Branding - Summary View */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ececec]">
                      <h2 className="text-lg font-semibold text-[#0e1e3f]">Review Customization & Branding</h2>
                      <span className="text-xs text-[#878e9e] bg-blue-50 px-3 py-1 rounded-full">From product selection</span>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-base font-semibold text-[#0e1e3f] mb-1">Product Customization</h3>
                          <p className="text-xs text-[#878e9e]">Customization options selected on product page</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/product-booking?category=${encodeURIComponent(product.category || 'apparel')}&id=${product.id ?? 1}`
                            )
                          }
                          className="text-xs text-[#2563eb] hover:underline font-medium px-3 py-1 border border-[#2563eb] rounded-full"
                        >
                          Edit
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="text-xs font-semibold text-[#0e1e3f] mb-2 block">Size Distribution</label>
                          <div className="flex gap-3 flex-wrap">
                            {sizeBreakdown.map((item) => (
                              item.quantity > 0 && (
                                <div key={item.size} className="bg-gray-50 px-3 py-1.5 rounded-md">
                                  <span className="text-xs text-[#0e1e3f]">
                                    <span className="font-semibold">{item.size}:</span> {item.quantity} units
                                  </span>
                                </div>
                              )
                            ))}
                          </div>
                          <p className="text-xs text-[#16a34a] mt-2 font-medium">
                            ✓ Total: {productQty} units (MOQ: {moq})
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="text-xs font-semibold text-[#0e1e3f] mb-2 block">Selected Colors</label>
                          <div className="flex gap-2 flex-wrap">
                            {selectedColors.map((color: string) => (
                              <div key={color} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                                  style={{
                                    backgroundColor: 
                                      color === 'Black' ? '#000000' :
                                      color === 'White' ? '#ffffff' :
                                      color === 'Navy' ? '#1e3a8a' :
                                      color === 'Grey' ? '#6b7280' :
                                      color
                                  }}
                                />
                                <span className="text-xs text-[#0e1e3f] font-medium">{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {uploadedLogo && (
                      <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-base font-semibold text-[#0e1e3f] mb-1">Branding Details</h3>
                            <p className="text-xs text-[#878e9e]">Logo and branding options</p>
                          </div>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/product-booking?category=${encodeURIComponent(product.category || 'apparel')}&id=${product.id ?? 1}`
                            )
                          }
                          className="text-xs text-[#2563eb] hover:underline font-medium px-3 py-1 border border-[#2563eb] rounded-full"
                        >
                            Edit
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                            <img src={uploadedLogo} alt="Logo" className="w-12 h-12 object-contain rounded border border-gray-200" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-[#0e1e3f]">{logoFileName}</p>
                              <p className="text-xs text-[#16a34a] mt-0.5">✓ Uploaded successfully</p>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-[#878e9e] block mb-1">Method:</span>
                                <span className="text-[#0e1e3f] font-semibold">{brandingMethod}</span>
                              </div>
                              <div>
                                <span className="text-[#878e9e] block mb-1">Position:</span>
                                <span className="text-[#0e1e3f] font-semibold">{brandingPosition}</span>
                              </div>
                            </div>
                          </div>

                          {requestSample && (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <p className="text-xs text-amber-900 font-medium">✓ Sample requested before bulk order</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!uploadedLogo && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-[#878e9e] text-center">No branding options selected</p>
                      </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#ececec]">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2.5 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm text-sm"
                      >
                        Confirm & Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Greetings & Recipients */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#0e1e3f] pb-3 border-b border-[#ececec]">Greetings & Recipients</h2>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0e1e3f] mb-3">Choose a greeting and recipients</h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => setGreetingMethod('we-send')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            greetingMethod === 'we-send'
                              ? 'border-[#2563eb] bg-blue-50'
                              : 'border-[#ececec] hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                              greetingMethod === 'we-send' ? 'bg-[#2563eb]' : 'bg-gray-200'
                            }`}>
                              <Gift className={`w-6 h-6 ${greetingMethod === 'we-send' ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <p className="text-sm font-semibold text-[#0e1e3f] mb-1">We will send it for you</p>
                            <p className="text-xs text-[#878e9e]">Add recipient details. Get it from our system and send like reminders</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setGreetingMethod('you-send')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            greetingMethod === 'you-send'
                              ? 'border-[#2563eb] bg-blue-50'
                              : 'border-[#ececec] hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                              greetingMethod === 'you-send' ? 'bg-[#2563eb]' : 'bg-gray-200'
                            }`}>
                              <Share2 className={`w-6 h-6 ${greetingMethod === 'you-send' ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <p className="text-sm font-semibold text-[#0e1e3f] mb-1">You send it</p>
                            <p className="text-xs text-[#878e9e]">Get a link of the recipient to send by SMS, social media or by email</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {greetingMethod === 'we-send' && (
                      <div className="border-t border-[#ececec] pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-semibold text-[#0e1e3f]">Add recipient info</h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleUploadRecipients}
                              className="text-xs text-[#2563eb] hover:underline flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Upload file
                            </button>
                            <button
                              type="button"
                              onClick={handleBulkPasteRecipients}
                              className="text-xs text-[#2563eb] hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Bulk copy & paste
                            </button>
                          </div>
                        </div>
                        {recipientToolMessage && (
                          <p className="text-xs text-[#878e9e] mb-3">{recipientToolMessage}</p>
                        )}

                        <div className="space-y-3">
                          {recipients.map((recipient, index) => (
                            <div key={index} className="p-3 border border-[#ececec] rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-[#0e1e3f]">Recipient {index + 1}</p>
                                {recipients.length > 1 && (
                                  <button
                                    onClick={() => removeRecipient(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-[#878e9e] mb-1 block">Name</label>
                                  <input
                                    type="text"
                                    placeholder="Enter name"
                                    value={recipient.name}
                                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                                  />
                                  {errors[`recipient${index}name`] && <p className="text-xs text-[#ef4444] mt-1">{errors[`recipient${index}name`]}</p>}
                                </div>

                                <div>
                                  <label className="text-xs text-[#878e9e] mb-1 block">Select t-shirt size</label>
                                  <div className="relative">
                                    <select
                                      value={recipient.size}
                                      onChange={(e) => updateRecipient(index, 'size', e.target.value)}
                                      className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none"
                                    >
                                      <option value="">Select size</option>
                                      <option value="S">S</option>
                                      <option value="M">M</option>
                                      <option value="L">L</option>
                                      <option value="XL">XL</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#878e9e] pointer-events-none" />
                                  </div>
                                  {errors[`recipient${index}size`] && <p className="text-xs text-[#ef4444] mt-1">{errors[`recipient${index}size`]}</p>}
                                </div>

                                <div>
                                  <label className="text-xs text-[#878e9e] mb-1 block">Email</label>
                                  <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={recipient.email}
                                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                                  />
                                  {errors[`recipient${index}email`] && <p className="text-xs text-[#ef4444] mt-1">{errors[`recipient${index}email`]}</p>}
                                </div>

                                <div>
                                  <label className="text-xs text-[#878e9e] mb-1 block">Send date</label>
                                  <div className="relative">
                                    <input
                                      type="date"
                                      value={recipient.sendDate}
                                      onChange={(e) => updateRecipient(index, 'sendDate', e.target.value)}
                                      className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                                    />
                                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#878e9e] pointer-events-none" />
                                  </div>
                                  {errors[`recipient${index}date`] && <p className="text-xs text-[#ef4444] mt-1">{errors[`recipient${index}date`]}</p>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={addRecipient}
                          className="mt-3 flex items-center gap-2 text-sm text-[#2563eb] hover:underline"
                        >
                          <Plus className="w-4 h-4" />
                          Add another recipient
                        </button>
                      </div>
                    )}

                    {greetingMethod === 'you-send' && (
                      <div className="border-t border-[#ececec] pt-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900 font-medium mb-2">Self-Service Link</p>
                          <p className="text-xs text-blue-700">
                            A unique link will be generated for you to share with recipients via SMS, email, or social media. Recipients can enter their details directly.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#ececec]">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2.5 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Delivery Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#0e1e3f] pb-3 border-b border-[#ececec]">Delivery Details</h2>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0e1e3f] mb-3">Delivery Address</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-[#0e1e3f] mb-2 block">
                            Address Line 1<span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Building name, floor, office number"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                          />
                          {errors.address && <p className="text-xs text-[#ef4444] mt-1">{errors.address}</p>}
                        </div>

                        <div>
                          <label className="text-sm text-[#0e1e3f] mb-2 block">Address Line 2</label>
                          <input
                            type="text"
                            placeholder="Street name, area"
                            value={deliveryAddress2}
                            onChange={(e) => setDeliveryAddress2(e.target.value)}
                            className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">
                              City<span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Enter city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                            {errors.city && <p className="text-xs text-[#ef4444] mt-1">{errors.city}</p>}
                          </div>

                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">
                              State<span className="text-[#ef4444]">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none"
                              >
                                <option value="">Select state</option>
                                <option value="maharashtra">Maharashtra</option>
                                <option value="karnataka">Karnataka</option>
                                <option value="delhi">Delhi</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#878e9e] pointer-events-none" />
                            </div>
                            {errors.state && <p className="text-xs text-[#ef4444] mt-1">{errors.state}</p>}
                          </div>

                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">
                              Pincode<span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="400001"
                              maxLength={6}
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                            {errors.pincode && <p className="text-xs text-[#ef4444] mt-1">{errors.pincode}</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-4">
                      <h3 className="text-lg font-semibold text-[#0e1e3f] mb-3">Delivery Contact</h3>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">
                              Contact Person<span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Name"
                              value={deliveryContact}
                              onChange={(e) => setDeliveryContact(e.target.value)}
                              className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                            {errors.deliveryContact && <p className="text-xs text-[#ef4444] mt-1">{errors.deliveryContact}</p>}
                          </div>

                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">
                              Phone<span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="9876543210"
                              value={deliveryPhone}
                              onChange={(e) => setDeliveryPhone(e.target.value)}
                              className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                            {errors.deliveryPhone && <p className="text-xs text-[#ef4444] mt-1">{errors.deliveryPhone}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-[#0e1e3f] mb-2 block">Delivery Instructions (Optional)</label>
                          <textarea
                            placeholder="Any special instructions..."
                            value={deliveryInstructions}
                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#ececec]">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2.5 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Review Details */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#0e1e3f] pb-3 border-b border-[#ececec] mb-4">Review Your Order</h2>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[#0e1e3f]">Buying details</h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-[#2563eb] hover:underline font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex">
                        <span className="text-[#878e9e] w-40">Planned for:</span>
                        <span className="text-[#0e1e3f] font-medium">{plannedFor}</span>
                      </div>
                      <div className="flex">
                        <span className="text-[#878e9e] w-40">Team:</span>
                        <span className="text-[#0e1e3f] font-medium">{selectedTeam}</span>
                      </div>
                      <div className="flex">
                        <span className="text-[#878e9e] w-40">Contact:</span>
                        <span className="text-[#0e1e3f] font-medium">{contactNumber}</span>
                      </div>
                      <div className="flex">
                        <span className="text-[#878e9e] w-40">Need approval from:</span>
                        <span className="text-[#0e1e3f] font-medium">{approver}</span>
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-3 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-[#0e1e3f]">Product & customization</h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs text-[#2563eb] hover:underline font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="text-[#878e9e] w-40">Quantity:</span>
                          <span className="text-[#0e1e3f] font-medium">{productQty} units</span>
                        </div>
                        <div className="flex">
                          <span className="text-[#878e9e] w-40">Colours:</span>
                          <span className="text-[#0e1e3f] font-medium">{selectedColors.join(', ')}</span>
                        </div>
                        {uploadedLogo ? (
                          <div className="flex">
                            <span className="text-[#878e9e] w-40">Branding:</span>
                            <span className="text-[#0e1e3f] font-medium">
                              {brandingMethod} · {brandingPosition}
                              {logoFileName ? ` · ${logoFileName}` : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="flex">
                            <span className="text-[#878e9e] w-40">Branding:</span>
                            <span className="text-[#0e1e3f] font-medium">None</span>
                          </div>
                        )}
                        {requestSample && (
                          <p className="text-xs text-amber-800">Sample requested before bulk production</p>
                        )}
                      </div>
                    </div>

                    {greetingMethod === 'we-send' && recipients.length > 0 && (
                      <div className="border-t border-[#ececec] pt-3 mt-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-[#0e1e3f]">Recipients</h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-xs text-[#2563eb] hover:underline font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recipients.map((recipient, index) => (
                            <div key={index} className="flex text-sm">
                              <span className="text-[#878e9e] w-40">Recipient {index + 1}</span>
                              <div className="text-[#0e1e3f]">
                                <span className="font-medium">{recipient.name}</span>
                                <span className="ml-4">Size: {recipient.size}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {greetingMethod === 'you-send' && (
                      <div className="border-t border-[#ececec] pt-3 mt-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-[#0e1e3f]">Greetings</h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-xs text-[#2563eb] hover:underline font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-sm text-[#0e1e3f]">You will receive a self-service link to share with recipients.</p>
                      </div>
                    )}

                    <div className="border-t border-[#ececec] pt-3 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-[#0e1e3f]">Delivery</h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="text-xs text-[#2563eb] hover:underline font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-[#0e1e3f]">
                          {[deliveryAddress, deliveryAddress2].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-[#0e1e3f]">
                          {city}
                          {city && state ? ', ' : ''}
                          {state} {pincode}
                        </p>
                        <p className="text-[#878e9e]">
                          Contact: {deliveryContact} · {deliveryPhone}
                        </p>
                        {deliveryInstructions && (
                          <p className="text-xs text-[#878e9e]">Note: {deliveryInstructions}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-3 mt-3">
                      <h3 className="text-lg font-semibold text-[#0e1e3f] mb-3">Price summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#878e9e]">Subtotal</span>
                          <span className="text-[#0e1e3f] font-medium">₹{pricing.subtotal.toLocaleString()}</span>
                        </div>
                        {uploadedLogo && (
                          <div className="flex justify-between">
                            <span className="text-[#878e9e]">Branding</span>
                            <span className="text-[#0e1e3f] font-medium">₹{pricing.brandingCost.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[#878e9e]">Processing</span>
                          <span className="text-[#0e1e3f] font-medium">₹{pricing.processingFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878e9e]">GST ({product.gst}%)</span>
                          <span className="text-[#0e1e3f] font-medium">₹{Math.round(pricing.gstAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-[#ececec]">
                          <span className="text-[#0e1e3f]">Total</span>
                          <span className="text-[#0e1e3f]">₹{Math.round(pricing.total).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#ececec] pt-4 mt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => {
                            setTermsAccepted(e.target.checked);
                            if (e.target.checked && errors.terms) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.terms;
                                return next;
                              });
                            }
                          }}
                          className="w-4 h-4 mt-0.5 accent-[#2563eb] shrink-0"
                        />
                        <span className="text-sm text-[#0e1e3f]">
                          I confirm the order details are correct and agree to the vendor terms, cancellation policy, and Mogzu gifting conditions.
                        </span>
                      </label>
                      {errors.terms && <p className="text-xs text-[#ef4444] mt-2">{errors.terms}</p>}
                    </div>

                    {/* Step Navigation */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#ececec]">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2.5 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 6: Payment */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#0e1e3f] pb-3 border-b border-[#ececec]">Payment</h2>
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setPaymentOption('pay-now')}
                        className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                          paymentOption === 'pay-now'
                            ? 'border-[#2563eb] bg-blue-50'
                            : 'border-[#ececec] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentOption === 'pay-now' ? 'border-[#2563eb]' : 'border-gray-300'
                          }`}>
                            {paymentOption === 'pay-now' && <div className="w-3 h-3 bg-[#2563eb] rounded-full" />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#0e1e3f]">Pay now (₹{Math.round(pricing.total).toLocaleString()})</p>
                            <p className="text-xs text-[#16a34a]">Get 15% off</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentOption('pay-partial')}
                        className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                          paymentOption === 'pay-partial'
                            ? 'border-[#2563eb] bg-blue-50'
                            : 'border-[#ececec] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentOption === 'pay-partial' ? 'border-[#2563eb]' : 'border-gray-300'
                          }`}>
                            {paymentOption === 'pay-partial' && <div className="w-3 h-3 bg-[#2563eb] rounded-full" />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#0e1e3f]">Pay ₹5,000 now</p>
                            <p className="text-xs text-[#878e9e]">and remaining later</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3 mb-3">
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            paymentMethod === 'card'
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-gray-100 text-[#878e9e] hover:bg-gray-200'
                          }`}
                        >
                          Card details
                        </button>
                        <button
                          onClick={() => setPaymentMethod('upi')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            paymentMethod === 'upi'
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-gray-100 text-[#878e9e] hover:bg-gray-200'
                          }`}
                        >
                          UPI payment
                        </button>
                        <button
                          onClick={() => setPaymentMethod('vendor')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            paymentMethod === 'vendor'
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-gray-100 text-[#878e9e] hover:bg-gray-200'
                          }`}
                        >
                          Empanelled vendor
                        </button>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">Card Type<span className="text-[#ef4444]">*</span></label>
                            <div className="relative">
                              <select
                                value={cardType}
                                onChange={(e) => setCardType(e.target.value)}
                                className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none"
                              >
                                <option value="">Select Card Type</option>
                                <option value="visa">Visa</option>
                                <option value="mastercard">Mastercard</option>
                                <option value="amex">American Express</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#878e9e] pointer-events-none" />
                            </div>
                            {errors.cardType && <p className="text-xs text-[#ef4444] mt-1">{errors.cardType}</p>}
                          </div>

                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">Name on card<span className="text-[#ef4444]">*</span></label>
                            <input
                              type="text"
                              placeholder="Name as on card"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                            {errors.cardName && <p className="text-xs text-[#ef4444] mt-1">{errors.cardName}</p>}
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                              <label className="text-sm text-[#0e1e3f] mb-2 block">Card number<span className="text-[#ef4444]">*</span></label>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                              />
                              {errors.cardNumber && <p className="text-xs text-[#ef4444] mt-1">{errors.cardNumber}</p>}
                            </div>

                            <div>
                              <label className="text-sm text-[#0e1e3f] mb-2 block">CVV<span className="text-[#ef4444]">*</span></label>
                              <input
                                type="text"
                                placeholder="CVV"
                                maxLength={3}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                              />
                              {errors.cardCvv && <p className="text-xs text-[#ef4444] mt-1">{errors.cardCvv}</p>}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-[#0e1e3f] mb-2 block">Expiration<span className="text-[#ef4444]">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Select Expiration"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                              />
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#878e9e] pointer-events-none" />
                            </div>
                            {errors.cardExpiry && <p className="text-xs text-[#ef4444] mt-1">{errors.cardExpiry}</p>}
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="w-4 h-4 accent-[#2563eb]"
                            />
                            <span className="text-sm text-[#878e9e]">Save card details (for later use)</span>
                          </label>
                        </div>
                      )}

                      {paymentMethod === 'upi' && (
                        <div>
                          <label className="text-sm text-[#0e1e3f] mb-2 block">UPI ID<span className="text-[#ef4444]">*</span></label>
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                          />
                          {errors.upiId && <p className="text-xs text-[#ef4444] mt-1">{errors.upiId}</p>}
                        </div>
                      )}

                      {paymentMethod === 'vendor' && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900 font-medium">Empanelled Vendor Payment</p>
                          <p className="text-xs text-blue-700 mt-1">Payment will be processed through your empanelled vendor agreement.</p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm text-[#0e1e3f] mb-2 block">Message for host</label>
                        <textarea
                          placeholder="Add Message"
                          value={messageForHost}
                          onChange={(e) => setMessageForHost(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-[#ececec] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 resize-none"
                        />
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#ececec]">
                      <button
                        onClick={handleBack}
                        className="px-5 py-2 bg-white border border-[#ececec] text-[#0e1e3f] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-5 py-2 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm text-sm"
                      >
                        Confirm & Pay
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Product Summary */}
              <div className="bg-white rounded-xl border border-[#ececec] p-4 h-fit sticky top-4">
                <div className="flex gap-3 mb-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#878e9e] mb-1">{product.brand}</p>
                    <h4 className="text-sm font-medium text-[#0e1e3f] mb-2 line-clamp-2">{product.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#878e9e]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#878e9e] mt-1">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      <span>{productQty || product.moq}</span>
                    </div>
                  </div>
                  <div className="flex items-start flex-shrink-0">
                    <span className="px-2 py-0.5 bg-[#dcfce7] text-[#16a34a] text-xs rounded-full font-medium">
                      {product.rating} ★
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#ececec] pt-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-[#0e1e3f]">Estimated delivery date</h5>
                    <button
                      onClick={() => {
                        setCurrentStep(4);
                        setCouponError('');
                        setCouponSuccess('');
                      }}
                      className="text-xs text-[#2563eb] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#878e9e] mb-2">Zip code: 409409</p>
                  <p className="text-xs text-[#0e1e3f] font-medium">Jun 28, 2024 • 09:00 am</p>
                  <p className="text-xs text-[#0e1e3f]">Jun 29, 2024 • 05:00 pm</p>
                </div>

                {currentStep === 6 && (
                  <div className="border-t border-[#ececec] pt-3 mb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Add Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {(couponError || couponSuccess) && (
                      <p
                        className={`text-xs font-medium mt-2 ${
                          couponError ? 'text-[#ef4444]' : 'text-[#16a34a]'
                        }`}
                      >
                        {couponError || couponSuccess}
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t border-[#ececec] pt-3 mt-3">
                  <h5 className="text-sm font-semibold text-[#0e1e3f] mb-3">Price Summary</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#878e9e]">₹{getCurrentPrice()} × {productQty} Qty</span>
                      <span className="text-[#0e1e3f] font-medium">₹{pricing.subtotal.toLocaleString()}</span>
                    </div>
                    {uploadedLogo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#878e9e]">Branding</span>
                        <span className="text-[#0e1e3f] font-medium">₹{pricing.brandingCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#878e9e]">Processing</span>
                      <span className="text-[#0e1e3f] font-medium">₹{pricing.processingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-[#ececec]">
                      <span className="text-[#0e1e3f]">Total</span>
                      <span className="text-[#0e1e3f]">₹{Math.round(pricing.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#878e9e] mt-3">Free cancellation up to 24 hours prior to event</p>
              </div>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}

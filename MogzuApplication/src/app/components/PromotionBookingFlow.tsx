import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronDown, Calendar, Clock, Users, Mail, Phone, Building2, FileText, Star, AlertCircle } from 'lucide-react';

interface Promotion {
  id: number;
  title: string;
  description: string;
  location: string;
  dimensions: string;
  footfall: string;
  rating: number;
  price: string;
  category: 'All' | 'Mall' | 'Theatres' | 'Retail' | 'Ads' | 'Social Media' | 'OTT' | 'Gated Community';
  image: string;
}

interface PromotionBookingFlowProps {
  promotion: Promotion;
  step: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function PromotionBookingFlow({ promotion, step, onClose, onBack, onNext }: PromotionBookingFlowProps) {
  const navigate = useNavigate();
  const [isFailed, setIsFailed] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Campaign Details
    campaignName: '',
    startDate: '',
    endDate: '',
    duration: '1 Month',
    adType: 'LED Screen',
    
    // Step 2: Requirements
    targetAudience: '',
    estimatedFootfall: '5000+',
    preferredHours: 'All Day',
    specialRequirements: '',
    
    // Step 3: Contact Information
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    designation: '',
    
    // Step 4: Additional Details
    budget: '',
    additionalNotes: '',
    preferredPayment: 'Monthly',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Campaign Details';
      case 2: return 'Requirements';
      case 3: return 'Contact Information';
      case 4: return 'Confirmation';
      default: return '';
    }
  };

  if (isFailed) {
    return (
      <div className="fixed inset-0 bg-[#f5f7fa] z-[60] flex flex-col overflow-hidden">
        {/* Page Content */}
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
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#fafafa] w-full max-w-[1400px] h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-[#ececec] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={step === 1 ? onClose : onBack}
                className="flex items-center gap-2 text-[#0e1e3f] hover:text-[#2563eb]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#0e1e3f] leading-tight">Promotion Enquiry</h1>
                <p className="text-sm text-[#878e9e]">{promotion.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#878e9e] hover:text-[#0e1e3f] text-2xl font-light"
            >
              ×
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-2 lg:gap-3 mt-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 1:</span>
              <span className={`text-xs lg:text-sm ${step === 1 ? 'text-[#2563eb] font-medium' : 'text-[#959595]'}`}>Campaign Details</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
              ))}
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 2:</span>
              <span className={`text-xs lg:text-sm ${step === 2 ? 'text-[#2563eb] font-medium' : 'text-[#959595]'}`}>Requirements</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
              ))}
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 3:</span>
              <span className={`text-xs lg:text-sm ${step === 3 ? 'text-[#2563eb] font-medium' : 'text-[#959595]'}`}>Contact Info</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#959595]" />
              ))}
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs lg:text-sm text-[#0e1e3f]">Step 4:</span>
              <span className={`text-xs lg:text-sm ${step === 4 ? 'text-[#2563eb] font-medium' : 'text-[#959595]'}`}>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
              {/* Left Column - Form */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#0e1e3f] mb-5">{getStepTitle()}</h2>

                {/* Step 1: Campaign Details */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        value={formData.campaignName}
                        onChange={(e) => handleInputChange('campaignName', e.target.value)}
                        placeholder="Enter campaign name"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Campaign Duration
                      </label>
                      <div className="relative">
                        <select
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                        >
                          <option>1 Week</option>
                          <option>2 Weeks</option>
                          <option>1 Month</option>
                          <option>3 Months</option>
                          <option>6 Months</option>
                          <option>1 Year</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Ad Type
                      </label>
                      <div className="relative">
                        <select
                          value={formData.adType}
                          onChange={(e) => handleInputChange('adType', e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                        >
                          <option>LED Screen</option>
                          <option>Banner</option>
                          <option>Hoarding</option>
                          <option>Standee</option>
                          <option>Kiosk</option>
                          <option>Wall Wrap</option>
                          <option>Digital Display</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Requirements */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Target Audience *
                      </label>
                      <input
                        type="text"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="E.g., Young professionals, Families, Students"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Estimated Daily Footfall Required
                      </label>
                      <div className="relative">
                        <select
                          value={formData.estimatedFootfall}
                          onChange={(e) => handleInputChange('estimatedFootfall', e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                        >
                          <option>1000+</option>
                          <option>2000+</option>
                          <option>5000+</option>
                          <option>10000+</option>
                          <option>20000+</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Preferred Visibility Hours
                      </label>
                      <div className="relative">
                        <select
                          value={formData.preferredHours}
                          onChange={(e) => handleInputChange('preferredHours', e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                        >
                          <option>All Day (6 AM - 12 AM)</option>
                          <option>Morning (6 AM - 12 PM)</option>
                          <option>Afternoon (12 PM - 6 PM)</option>
                          <option>Evening (6 PM - 12 AM)</option>
                          <option>24/7</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Special Requirements
                      </label>
                      <textarea
                        value={formData.specialRequirements}
                        onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                        placeholder="Any specific requirements for your campaign..."
                        rows={4}
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Information */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        placeholder="Enter contact person name"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        placeholder="E.g., Marketing Manager"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@company.com"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Phone *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-28">
                          <div className="flex items-center gap-2 px-3 py-2.5 border border-[#e5e7eb] rounded-lg bg-white">
                            <span className="text-xl">🇮🇳</span>
                            <span className="text-sm text-[#0e1e3f]">+91</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#959595] ml-auto" />
                          </div>
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Estimated Budget
                      </label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="E.g., ₹50,000 - ₹1,00,000"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Preferred Payment Terms
                      </label>
                      <div className="relative">
                        <select
                          value={formData.preferredPayment}
                          onChange={(e) => handleInputChange('preferredPayment', e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 appearance-none bg-white"
                        >
                          <option>Monthly</option>
                          <option>Quarterly</option>
                          <option>Upfront</option>
                          <option>50% Advance, 50% on completion</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#0e1e3f] font-medium mb-1.5">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        placeholder="Any additional information or requirements..."
                        rows={4}
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#0e1e3f] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 resize-none"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[#0e1e3f] mb-2">Summary</h4>
                      <div className="space-y-1 text-xs text-[#475569]">
                        <p><span className="font-medium">Campaign:</span> {formData.campaignName || 'Not specified'}</p>
                        <p><span className="font-medium">Duration:</span> {formData.duration}</p>
                        <p><span className="font-medium">Company:</span> {formData.companyName || 'Not specified'}</p>
                        <p><span className="font-medium">Contact:</span> {formData.contactPerson || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-xs text-[#475569]">
                        <span className="font-semibold text-[#0e1e3f]">Note:</span> Our team will review your enquiry and contact you within 24 hours with a detailed proposal and pricing.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-[#e5e7eb]">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-[#e5e7eb] text-[#475569] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {step < 4 ? (
                    <button
                      onClick={onNext}
                      className="flex-1 px-6 py-3 bg-[#fa8d40] text-white rounded-lg text-sm font-medium hover:bg-[#fb7b24] transition-colors"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        // Simulate random failure 20% of the time
                        if (Math.random() < 0.2) {
                          setIsFailed(true);
                          return;
                        }
                        onClose();
                      }}
                      className="flex-1 px-6 py-3 bg-[#fa8d40] text-white rounded-lg text-sm font-medium hover:bg-[#fb7b24] transition-colors"
                    >
                      Submit Enquiry
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column - Summary Card */}
              <div className="bg-white rounded-lg p-6 h-fit sticky top-0">
                <h3 className="text-base font-semibold text-[#0e1e3f] mb-4">Promotion Details</h3>
                
                <div className="mb-4">
                  <img
                    src={promotion.image}
                    alt={promotion.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <h4 className="text-sm font-semibold text-[#0e1e3f] mb-2">{promotion.title}</h4>
                <p className="text-xs text-[#878e9e] mb-3">{promotion.description}</p>

                <div className="space-y-2 mb-4 pb-4 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{promotion.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <Users className="w-3.5 h-3.5 text-[#878e9e]" />
                    <span>{promotion.footfall} daily footfall</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <svg className="w-3.5 h-3.5 text-[#878e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                    </svg>
                    <span>{promotion.dimensions}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{promotion.rating} rating</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#878e9e]">Starting at</span>
                    <span className="text-[#0e1e3f] font-semibold">{promotion.price}</span>
                  </div>
                  <p className="text-[10px] text-[#878e9e]">+ applicable taxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

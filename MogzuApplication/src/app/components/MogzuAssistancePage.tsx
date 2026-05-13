import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import svgPaths from '@/imports/svg-camfkj9vq4';

const assistanceTypes = [
  { id: 'rfp', icon: '📋', title: 'RFP', desc: 'Request for Proposal or RFP Cart' },
  { id: 'gifting', icon: '🎁', title: 'Gifting', desc: 'Corporate gifting solutions' },
  { id: 'space', icon: '🏢', title: 'Space Booking', desc: 'Meeting, marketing or activity spaces' },
  { id: 'events', icon: '🎉', title: 'Events', desc: 'Activity and event assistance' },
  { id: 'promo', icon: '📢', title: 'Promotional Space', desc: 'Vendor or in-office promotions' },
  { id: 'support', icon: '🛠', title: 'Support', desc: 'Help with ongoing services or issues' },
  { id: 'other', icon: '✏️', title: 'Other', desc: 'Custom request — let us know' },
];

export default function MogzuAssistancePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    type: '',
    clientName: '',
    phone: '',
    email: '',
    requirements: '',
    promoReqs: '',
    customReqs: '',
    isRfp: false,
    rfpDetails: '',
    adLink: '',
    comboReq: '',
    checkIn: '',
    checkOut: '',
    altDates: '',
    guests: 10,
    paxInfo: '',
    paymentMethod: 'Immediate Payment',
    paymentDetails: '',
    mogzuHandlesPayment: false,
  });

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.type !== '';
      case 2: return formData.clientName && formData.phone && formData.email;
      case 3: return formData.requirements;
      case 4: return formData.checkIn && formData.checkOut;
      case 5: return formData.guests > 0;
      case 6: return true; // Defaults exist
      default: return true;
    }
  };

  const steps = [
    { num: 1, title: 'Type' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'Requirements' },
    { num: 4, title: 'Dates' },
    { num: 5, title: 'Guests' },
    { num: 6, title: 'Payment' },
    { num: 7, title: 'Review' },
  ];

  if (isSuccess) {
    return (
      <div className="flex h-screen bg-white overflow-hidden font-['Inter'] items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-['Montserrat'] mb-2">Request Submitted!</h1>
          <p className="text-gray-500 mb-8">Your Mogzu team will review this and reach out within 2 business hours.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors w-full shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-['Inter']">
      <div className="flex-1 flex flex-col overflow-hidden">
        <SharedHeader brandInHeader="always" />
        
        <main className="flex-1 overflow-y-auto bg-[#f9fafb]">
          <div className="max-w-[1000px] mx-auto p-6 lg:p-10 flex gap-8 relative">
            
            {/* Left Sidebar - Step Tracker */}
            <div className="hidden lg:block w-64 shrink-0 mt-8">
              <div className="sticky top-10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Progress</h3>
                <div className="space-y-4">
                  {steps.map(step => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        currentStep === step.num ? 'bg-blue-600 text-white' :
                        currentStep > step.num ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step.num ? '✓' : step.num}
                      </div>
                      <span className={`text-sm font-medium ${
                        currentStep === step.num ? 'text-gray-900' :
                        currentStep > step.num ? 'text-gray-700' :
                        'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1">
              <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back to previous
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px] flex flex-col">
                <div className="flex-1">
                  
                  {/* Step 1 */}
                  {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">What do you need help with?</h2>
                      <p className="text-gray-500 mb-4">Select the type of assistance and we'll connect you with the right team.</p>
                      <p className="text-xs text-slate-600 mb-8 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        If we sent you a curated shortlist, open that link in your browser (paths include{' '}
                        <span className="font-mono text-slate-800">/shortlist/</span>) to review options and confirm your choice.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assistanceTypes.map(type => (
                          <button
                            key={type.id}
                            onClick={() => updateForm('type', type.id)}
                            className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                              formData.type === type.id 
                                ? 'border-blue-500 bg-blue-50/50' 
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {formData.type === type.id && (
                              <div className="absolute top-4 right-4 text-blue-600 bg-white rounded-full">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/><path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            )}
                            <div className="text-3xl mb-3">{type.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                            <p className="text-sm text-gray-500">{type.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">Your Contact Information</h2>
                      <p className="text-gray-500 mb-8">So our team knows who to reach out to.</p>
                      <div className="space-y-5 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client / Company Name *</label>
                          <input 
                            type="text" 
                            value={formData.clientName}
                            onChange={(e) => updateForm('clientName', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="Mogzu Inc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                          <div className="flex">
                            <select className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-l-lg border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option>+91</option>
                              <option>+1</option>
                              <option>+44</option>
                            </select>
                            <input 
                              type="tel" 
                              value={formData.phone}
                              onChange={(e) => updateForm('phone', e.target.value)}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                              placeholder="98765 43210"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => updateForm('email', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">Tell Us What You Need</h2>
                      <p className="text-gray-500 mb-8">The more detail you share, the better we can assist you.</p>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Details *</label>
                          <textarea 
                            value={formData.requirements}
                            onChange={(e) => updateForm('requirements', e.target.value)}
                            className="w-full px-4 py-3 min-h-[120px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="Describe your requirements in detail..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Needs</label>
                            <textarea 
                              value={formData.promoReqs}
                              onChange={(e) => updateForm('promoReqs', e.target.value)}
                              className="w-full px-4 py-2 min-h-[80px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                              placeholder="Any in-office or venue promotion needs?"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Requirements</label>
                            <textarea 
                              value={formData.customReqs}
                              onChange={(e) => updateForm('customReqs', e.target.value)}
                              className="w-full px-4 py-2 min-h-[80px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                              placeholder="Anything else we should know?"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                              <input type="checkbox" name="toggle" id="rfp-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked={formData.isRfp} onChange={(e) => updateForm('isRfp', e.target.checked)}/>
                              <label htmlFor="rfp-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${formData.isRfp ? 'bg-blue-500' : ''}`}></label>
                            </div>
                            <span className="text-gray-900 font-medium">This is an RFP request</span>
                          </label>
                          {formData.isRfp && (
                            <div className="mt-4">
                              <input 
                                type="text" 
                                value={formData.rfpDetails}
                                onChange={(e) => updateForm('rfpDetails', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="RFP Reference / Details"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Reference Link</label>
                          <input 
                            type="url" 
                            value={formData.adLink}
                            onChange={(e) => updateForm('adLink', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="Paste a link to reference material"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Reference Image</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer group">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p className="text-sm font-medium text-gray-700">Drop image here or click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Combo Request</label>
                          <input 
                            type="text" 
                            value={formData.comboReq}
                            onChange={(e) => updateForm('comboReq', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="Specify any combo packages you'd like"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {currentStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">When Do You Need This?</h2>
                      <p className="text-gray-500 mb-8">Set your preferred dates and we'll plan around your schedule.</p>
                      
                      <div className="space-y-6 max-w-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
                            <input 
                              type="date" 
                              value={formData.checkIn}
                              onChange={(e) => updateForm('checkIn', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                            <input 
                              type="date" 
                              value={formData.checkOut}
                              onChange={(e) => updateForm('checkOut', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Dates</label>
                          <textarea 
                            value={formData.altDates}
                            onChange={(e) => updateForm('altDates', e.target.value)}
                            className="w-full px-4 py-3 min-h-[100px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="List any backup dates or flexible date ranges"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5 */}
                  {currentStep === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">Guest Details</h2>
                      <p className="text-gray-500 mb-8">Help us understand the scale of your event or requirement.</p>
                      
                      <div className="space-y-8 max-w-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Number of Guests *</label>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => updateForm('guests', Math.max(1, formData.guests - 1))}
                              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-500 transition-colors text-gray-600 text-xl"
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              value={formData.guests}
                              onChange={(e) => updateForm('guests', parseInt(e.target.value) || 0)}
                              className="w-24 text-center text-2xl font-bold font-['Montserrat'] text-gray-900 py-2 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent"
                            />
                            <button 
                              onClick={() => updateForm('guests', formData.guests + 1)}
                              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-500 transition-colors text-gray-600 text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pax Information</label>
                          <textarea 
                            value={formData.paxInfo}
                            onChange={(e) => updateForm('paxInfo', e.target.value)}
                            className="w-full px-4 py-3 min-h-[120px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="Any details about attendees, special requirements, dietary needs, VIP guests, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 6 */}
                  {currentStep === 6 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">Payment Preference</h2>
                      <p className="text-gray-500 mb-8">How would you like to handle payment?</p>
                      
                      <div className="space-y-6 max-w-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
                          <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['Immediate Payment', 'Credit Terms'].map(method => (
                              <button
                                key={method}
                                onClick={() => updateForm('paymentMethod', method)}
                                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                  formData.paymentMethod === method 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                          <input 
                            type="text" 
                            value={formData.paymentDetails}
                            onChange={(e) => updateForm('paymentDetails', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            placeholder="Bank name, credit terms reference, or relevant details"
                          />
                        </div>

                        <div className="pt-4">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="mt-0.5">
                              <input 
                                type="checkbox" 
                                checked={formData.mogzuHandlesPayment}
                                onChange={(e) => updateForm('mogzuHandlesPayment', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <span className="block text-gray-900 font-medium group-hover:text-blue-600 transition-colors">Let Mogzu handle payment processing on my behalf</span>
                              {formData.mogzuHandlesPayment && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 animate-in fade-in slide-in-from-top-2 duration-200">
                                  Our team will reach out with a payment link or invoice.
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 7 */}
                  {currentStep === 7 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Montserrat'] mb-2">Review Your Request</h2>
                      <p className="text-gray-500 mb-8">Take a moment to confirm everything looks right before submitting.</p>
                      
                      <div className="space-y-4 max-w-2xl mb-8">
                        {/* Summary Cards */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span className="font-semibold text-gray-900">Assistance Type</span>
                            </div>
                            <button onClick={() => setCurrentStep(1)} className="text-sm text-blue-600 hover:underline">Edit</button>
                          </div>
                          <div className="p-4 text-sm text-gray-700 capitalize">
                            {formData.type || 'Not selected'}
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span className="font-semibold text-gray-900">Client Details</span>
                            </div>
                            <button onClick={() => setCurrentStep(2)} className="text-sm text-blue-600 hover:underline">Edit</button>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                            <div><span className="text-gray-500 block text-xs">Name</span>{formData.clientName || '-'}</div>
                            <div><span className="text-gray-500 block text-xs">Phone</span>{formData.phone || '-'}</div>
                            <div className="col-span-2"><span className="text-gray-500 block text-xs">Email</span>{formData.email || '-'}</div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span className="font-semibold text-gray-900">Requirements</span>
                            </div>
                            <button onClick={() => setCurrentStep(3)} className="text-sm text-blue-600 hover:underline">Edit</button>
                          </div>
                          <div className="p-4 text-sm text-gray-700">
                            {formData.requirements ? (
                              <p className="line-clamp-2">{formData.requirements}</p>
                            ) : '-'}
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span className="font-semibold text-gray-900">Dates & Guests</span>
                            </div>
                            <button onClick={() => setCurrentStep(4)} className="text-sm text-blue-600 hover:underline">Edit</button>
                          </div>
                          <div className="p-4 grid grid-cols-3 gap-y-2 text-sm text-gray-700">
                            <div><span className="text-gray-500 block text-xs">Check-in</span>{formData.checkIn || '-'}</div>
                            <div><span className="text-gray-500 block text-xs">Check-out</span>{formData.checkOut || '-'}</div>
                            <div><span className="text-gray-500 block text-xs">Guests</span>{formData.guests}</div>
                          </div>
                        </div>
                      </div>

                      <div className="max-w-2xl">
                        <label className="flex items-center gap-3 cursor-pointer group mb-6">
                          <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                          <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">I confirm the above details are accurate</span>
                        </label>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Navigation */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-8">
                  <button 
                    onClick={handleBack}
                    className={`px-6 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-100 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}
                  >
                    Back
                  </button>
                  
                  {currentStep < 7 ? (
                    <button 
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="px-8 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next Step
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsSuccess(true)}
                      className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg w-full max-w-sm justify-center"
                    >
                      Submit Request to Mogzu
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

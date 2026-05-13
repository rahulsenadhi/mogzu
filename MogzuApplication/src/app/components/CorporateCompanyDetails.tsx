import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronDown, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import imgImage24853 from 'figma:asset/97572b310bf103bcd94545d382d4a4a7ba1f9ce4.png';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import {
  CorporateOnboardingStepFooter,
  CorporateOnboardingBackButton,
  CorporateOnboardingSecondaryButton,
  CorporateOnboardingPrimaryButton,
} from '@/app/components/corporate/CorporateOnboardingStepFooter';
import {
  CorporateOnboardingPageShell,
  CorporateOnboardingHeader,
  CorporateOnboardingStepper,
  CorporateOnboardingFooterLinks,
} from '@/app/components/corporate/CorporateOnboardingChrome';

export default function CorporateCompanyDetails() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    billingAddress: '',
    departmentStructure: '',
  });
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    department: '',
    employeeId: '',
    // Company Details
    companyName: '',
    registrationNumber: '',
    countryCode: '+91',
    gstNumber: '',
    panNumber: '',
    industry: '',
    companySize: '',
    billingAddress: '',
    departmentStructure: '',
    companyLogo: null as File | null,
    gstRegistration: null as File | null,
    pan: null as File | null,
    cancelledCheque: null as File | null,
    certificateOfIncorporation: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setFieldErrors({ email: '', billingAddress: '', departmentStructure: '' });
    setError(null);

    const nextErrors = {
      email: '',
      billingAddress: '',
      departmentStructure: '',
    };

    if (!isValidEmail(formData.email)) {
      nextErrors.email = 'Enter a valid corporate email format.';
    }
    if (!formData.billingAddress.trim()) {
      nextErrors.billingAddress = 'Billing address is required.';
    }
    if (!formData.departmentStructure.trim()) {
      nextErrors.departmentStructure = 'Department structure is required.';
    }

    if (nextErrors.email || nextErrors.billingAddress || nextErrors.departmentStructure) {
      setFieldErrors(nextErrors);
      return;
    }

    if (
      !formData.fullName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.designation.trim() ||
      !formData.companyName.trim() ||
      !formData.gstNumber.trim() ||
      !formData.companySize
    ) {
      setError('Please complete all required profile fields before continuing.');
      return;
    }

    try {
      console.log('Company details:', formData);
      // Navigate to interests step
      navigate('/signup/corporate/interests');
    } catch (err) {
      setError('Something went wrong. Please try again or contact support.');
    }
  };

  const handleSkipDocuments = () => {
    // Skip document uploads and proceed
    console.log('Skipping documents');
    navigate('/signup/corporate/interests');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const fieldClass =
    'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20';

  const selectClass =
    'w-full h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm text-slate-800 shadow-sm transition-colors duration-200 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20';

  const textareaClass =
    'w-full min-h-[88px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20';

  return (
    <CorporateOnboardingPageShell>
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-white/88 p-6 shadow-md shadow-slate-900/5 backdrop-blur-md ring-1 ring-slate-200/40 sm:p-8 md:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              to="/signup/corporate"
              className="mb-4 self-start text-left text-xs font-medium text-[#2563eb] transition-colors duration-200 hover:text-[#1d4ed8]"
            >
              ← Back to account
            </Link>
            <Link
              to="/"
              className="inline-flex max-w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40"
              aria-label="Mogzu home"
            >
              {/*
                Frosted cards: multiply blend fights backdrop-blur and shows a matte “box”.
                Darken lets the wordmark sit on cream / frosted panels without a harsh white tile.
              */}
              <MogzuLogo
                blendWhite={false}
                wordmarkAlign="center"
                imgClassName="mix-blend-darken"
                className="h-10 w-auto max-w-[200px] justify-center sm:max-w-[240px]"
              />
            </Link>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Corporate signup
            </p>
          </div>

          <CorporateOnboardingHeader
            stepOfTotal="Step 1 of 3"
            title="Tell us about your company"
            description="We use this for billing verification and to tailor your dashboard and vendor recommendations."
            className="mb-8"
          />
          <CorporateOnboardingStepper currentStep={0} className="mb-10" />

        {error && (
          <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 relative">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive font-medium">
              {error}
            </AlertDescription>
            <button 
              onClick={() => setError(null)}
              className="absolute right-2 top-2 text-destructive hover:opacity-70 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}

        {/* Personal Details Section */}
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Personal details</h2>

        {/* Personal Details Grid */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name*</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={fieldClass}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Corporate Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your corporate email"
              className={fieldClass}
            />
            {fieldErrors.email && <p className="text-xs text-[#dc2626]">{fieldErrors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Phone Number*</label>
            <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors duration-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/20">
              <div className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3">
                <img src={imgImage24853} alt="India" className="w-5 h-3.5 object-cover rounded-sm" />
                <span className="text-sm text-[#363c48]">+91</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="flex-1 px-3 text-sm text-[#363c48] placeholder-[#878e9e] focus:outline-none"
              />
            </div>
          </div>

          {/* Designation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Designation*</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Enter your designation"
              className={fieldClass}
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Department</label>
            <div className="relative">
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={selectClass}
              >
                <option value="">Select Department</option>
                <option value="hr">Human Resources</option>
                <option value="admin">Administration</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="it">IT</option>
                <option value="finance">Finance</option>
                <option value="operations">Operations</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Employee ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Enter your employee ID"
              className={fieldClass}
            />
          </div>
        </div>

        {/* Company Details Section */}
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Company details</h2>

        {/* Form Fields Grid */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Company Name*</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Please enter company name"
              className={fieldClass}
            />
          </div>

          {/* Company Registration Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Registration Number*</label>
            <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors duration-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/20">
              <div className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3">
                <img src={imgImage24853} alt="India" className="w-5 h-3.5 object-cover rounded-sm" />
                <span className="text-sm text-[#363c48]">+91</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="Registration number"
                className="flex-1 px-3 text-sm text-[#363c48] placeholder-[#878e9e] focus:outline-none"
              />
            </div>
          </div>

          {/* Company GST Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">GST Number*</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              placeholder="Enter GST Number"
              className={fieldClass}
            />
          </div>

          {/* Company PAN Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">PAN Number*</label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              placeholder="Enter PAN Number"
              className={fieldClass}
            />
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Industry*</label>
            <div className="relative">
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={selectClass}
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Company Size */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Company size</label>
            <div className="relative">
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className={selectClass}
              >
                <option value="">Select Company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Billing Address */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Billing Address*</label>
            <textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => setFormData((prev) => ({ ...prev, billingAddress: e.target.value }))}
              placeholder="Enter complete billing address"
              className={textareaClass}
            />
            {fieldErrors.billingAddress && <p className="text-xs text-[#dc2626]">{fieldErrors.billingAddress}</p>}
          </div>

          {/* Department Structure */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Department Structure*</label>
            <input
              type="text"
              name="departmentStructure"
              value={formData.departmentStructure}
              onChange={(e) => setFormData((prev) => ({ ...prev, departmentStructure: e.target.value }))}
              placeholder="e.g. HR, Finance, Sales, Engineering"
              className={fieldClass}
            />
            {fieldErrors.departmentStructure && <p className="text-xs text-[#dc2626]">{fieldErrors.departmentStructure}</p>}
          </div>
          
          {/* Company Logo Upload */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Company Logo</label>
            <label className="group flex h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-200 hover:border-[#2563eb]/50 hover:bg-slate-50/90">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'companyLogo')}
                className="hidden"
              />
              <img src={imgImage24853} alt="Upload" className="w-8 h-8 opacity-40 mb-2 group-hover:opacity-60 transition-opacity" />
              <p className="text-center text-sm">
                <span className="text-[#2563eb] font-medium">Click to add a file</span>{' '}
                <span className="text-[#666c89]">or drag and drop file here</span>
              </p>
            </label>
          </div>
        </div>

        {/* Other Company Information */}
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Documents (optional)</h2>

        {/* Document Uploads Grid */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* GST Registration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">GST Registration</label>
            <label className="group flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-200 hover:border-[#2563eb]/50 hover:bg-slate-50/90">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'gstRegistration')}
                className="hidden"
              />
              <img src={imgImage24853} alt="Upload" className="w-6 h-6 opacity-40 mb-1.5 group-hover:opacity-60 transition-opacity" />
              <p className="text-center text-xs">
                <span className="text-[#2563eb] font-medium">Click to upload</span>{' '}
                <span className="text-[#666c89]">or drag</span>
              </p>
            </label>
          </div>

          {/* PAN */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">PAN</label>
            <label className="group flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-200 hover:border-[#2563eb]/50 hover:bg-slate-50/90">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'pan')}
                className="hidden"
              />
              <img src={imgImage24853} alt="Upload" className="w-6 h-6 opacity-40 mb-1.5 group-hover:opacity-60 transition-opacity" />
              <p className="text-center text-xs">
                <span className="text-[#2563eb] font-medium">Click to upload</span>{' '}
                <span className="text-[#666c89]">or drag</span>
              </p>
            </label>
          </div>

          {/* Cancelled Cheque */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Cancelled Cheque</label>
            <label className="group flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-200 hover:border-[#2563eb]/50 hover:bg-slate-50/90">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'cancelledCheque')}
                className="hidden"
              />
              <img src={imgImage24853} alt="Upload" className="w-6 h-6 opacity-40 mb-1.5 group-hover:opacity-60 transition-opacity" />
              <p className="text-center text-xs">
                <span className="text-[#2563eb] font-medium">Click to upload</span>{' '}
                <span className="text-[#666c89]">or drag</span>
              </p>
            </label>
          </div>

          {/* Certificate of Incorporation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Certificate of Incorporation</label>
            <label className="group flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-200 hover:border-[#2563eb]/50 hover:bg-slate-50/90">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'certificateOfIncorporation')}
                className="hidden"
              />
              <img src={imgImage24853} alt="Upload" className="w-6 h-6 opacity-40 mb-1.5 group-hover:opacity-60 transition-opacity" />
              <p className="text-center text-xs">
                <span className="text-[#2563eb] font-medium">Click to upload</span>{' '}
                <span className="text-[#666c89]">or drag</span>
              </p>
            </label>
          </div>
        </div>

        <CorporateOnboardingFooterLinks className="mt-12 border-t border-slate-100 pt-8" />
        </div>
      </div>

      <CorporateOnboardingStepFooter>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <CorporateOnboardingBackButton onClick={handleBack} />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:flex-initial sm:justify-end">
            <CorporateOnboardingSecondaryButton onClick={handleSkipDocuments} className="whitespace-nowrap">
              I&apos;ll add it later
            </CorporateOnboardingSecondaryButton>
            <CorporateOnboardingPrimaryButton onClick={() => handleSubmit()} className="whitespace-nowrap sm:min-w-[7.5rem]">
              Next
            </CorporateOnboardingPrimaryButton>
          </div>
        </div>
      </CorporateOnboardingStepFooter>
    </CorporateOnboardingPageShell>
  );
}

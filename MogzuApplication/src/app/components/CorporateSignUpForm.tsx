import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import svgPaths from '@/imports/svg-o29bchayym';
import imgGoogleIcon from 'figma:asset/623e1bc74569caceb0c89f1e0be048c9a6e5221f.png';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

export default function CorporateSignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState<'form' | 'verify-email'>('form');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(120);
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (signupStep !== 'verify-email' || otpSecondsLeft <= 0) return;
    const timer = setTimeout(() => setOtpSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [signupStep, otpSecondsLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: '',
    });

    const nextErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: '',
    };

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid corporate email format.';
    }

    if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeToTerms) {
      nextErrors.terms = 'Please accept Terms and Privacy Policy.';
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    // Mock async registration request
    setTimeout(() => {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const mockExistingEmails = [
        'existing@company.com',
        'hr@acme.com',
        'admin@mogzu.com',
      ];

      if (mockExistingEmails.includes(normalizedEmail)) {
        setIsSubmitting(false);
        setError('This email is already registered. Please login instead.');
        return;
      }

      try {
        console.log('Corporate sign up:', formData);
        setIsSubmitting(false);
        setSignupStep('verify-email');
        setVerificationOtp('');
        setOtpError('');
        setOtpSecondsLeft(120);
      } catch (err) {
        setIsSubmitting(false);
        setError('Something went wrong. Please try again or contact support.');
      }
    }, 700);
  };

  const handleVerifyEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpSecondsLeft <= 0) {
      setOtpError('OTP expired. Please resend OTP.');
      return;
    }

    if (!/^\d{6}$/.test(verificationOtp.trim())) {
      setOtpError('Enter a valid 6-digit OTP.');
      return;
    }

    // Demo OTP for corporate email verification.
    if (verificationOtp !== '123456') {
      setOtpError('Incorrect OTP. Please try again.');
      return;
    }

    navigate('/signup/corporate/company-details');
  };

  const handleResendVerificationOtp = () => {
    setVerificationOtp('');
    setOtpError('');
    setOtpSecondsLeft(120);
  };

  const handleGoogleSignup = () => {
    setError('Google sign up will be available soon.');
  };

  const handleLinkedInSignup = () => {
    setError('LinkedIn sign up will be available soon.');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white lg:flex-row">
      {/* Left Side - Background (desktop) */}
      <div className="relative hidden shrink-0 overflow-hidden bg-[#FA8D40] lg:block lg:min-h-dvh lg:w-[55%]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1054 1027"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <filter
              id="filter0_i_3_156"
              x="-47"
              y="-27"
              width="1101"
              height="1054"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="-47" dy="-27" />
              <feGaussianBlur stdDeviation="25" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.16 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3_156" />
            </filter>
          </defs>
          <path d={svgPaths.p3697c980} fill="#FA8D40" filter="url(#filter0_i_3_156)" />
        </svg>

        <div className="absolute top-[20%] left-[8%] right-[8%] text-white">
          <h1 className="font-semibold mb-6 leading-tight max-w-[650px] text-[24px] xl:text-[36px]">
            Make Work Feel Lighter With Mogzu
          </h1>
          <div className="space-y-3 text-lg mt-8 max-w-[550px]">
            <p className="leading-relaxed text-[16px] xl:text-[20px]">
              Plan well. Book quick. Enjoy more.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form: solid fill full viewport height (no split seam / partial backdrop) */}
      <div className="relative flex w-full flex-1 flex-col justify-center bg-white py-8 lg:min-h-dvh lg:w-[45%] lg:shrink-0 lg:py-0">
        <div className="relative mx-auto w-full max-w-[500px] px-6 sm:px-8 md:px-12 lg:px-8">
          <div className="mb-6">
            <Link
              to="/signup"
              className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-[#2563eb] transition-colors duration-200 hover:text-[#1d4ed8]"
            >
              ← Back to account type
            </Link>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Corporate signup · Account</p>
            <MogzuLogo className="h-10 w-auto max-w-[200px] sm:max-w-[240px]" />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/20 relative">
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

          {signupStep === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="space-y-0.5">
              <label htmlFor="fullName" className="block text-[10px] text-[#0e1e3f]">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                required
              />
              {fieldErrors.fullName && (
                <p className="text-[10px] text-[#0e1e3f]">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-0.5">
              <label htmlFor="email" className="block text-[10px] text-[#0e1e3f]">Corporate Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="Enter your corporate email"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                required
              />
              {fieldErrors.email && (
                <p className="text-[10px] text-[#0e1e3f]">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-0.5">
              <label htmlFor="password" className="block text-[10px] text-[#0e1e3f]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Create a password"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E3E3E5] hover:text-[#878e9e] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p1d5be100} fill="currentColor" />
                  </svg>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[10px] text-[#0e1e3f]">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-0.5">
              <label htmlFor="confirmPassword" className="block text-[10px] text-[#0e1e3f]">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E3E3E5] hover:text-[#878e9e] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p1d5be100} fill="currentColor" />
                  </svg>
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[10px] text-[#0e1e3f]">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-3 h-3 mt-0.5 rounded border-2 border-black bg-white focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 cursor-pointer appearance-none checked:bg-white checked:border-black relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:text-[9px] checked:after:font-bold"
                required
              />
              <label htmlFor="terms" className="text-[10px] text-[#323232] cursor-pointer">
                I agree to the{' '}
                <Link to="/why-mogzu" className="text-[#2563eb] underline hover:text-[#1e40af]">Terms and Conditions</Link>
                {' '}and{' '}
                <Link to="/why-mogzu" className="text-[#2563eb] underline hover:text-[#1e40af]">Privacy Policy</Link>
              </label>
            </div>
            {fieldErrors.terms && (
              <p className="text-[10px] text-[#0e1e3f]">{fieldErrors.terms}</p>
            )}

            <button
              type="submit"
              className="h-10 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          )}

          {signupStep === 'verify-email' && (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] text-[#0e1e3f]">
                  Enter the 6-digit OTP sent to <span className="font-medium">{formData.email.trim()}</span>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationOtp}
                  onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                />
                <p className="text-[10px] text-[#878e9e]">
                  {otpSecondsLeft > 0 ? `OTP expires in ${otpSecondsLeft}s` : 'OTP expired'}
                </p>
                {otpError && <p className="text-[10px] text-[#0e1e3f]">{otpError}</p>}
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                Verify Email
              </button>

              <button
                type="button"
                onClick={handleResendVerificationOtp}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => setSignupStep('form')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50"
              >
                Back to sign up
              </button>
            </form>
          )}

          {signupStep === 'form' && (
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-[#E1E1E1]" />
            <span className="text-[8px] text-[#949494]">Or</span>
            <div className="flex-1 h-px bg-[#E1E1E1]" />
          </div>
          )}

          {signupStep === 'form' && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-[48px] h-[32px] bg-[#f9f9f9] border border-[#e1e1e1] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <img src={imgGoogleIcon} alt="Google" className="w-3 h-3 object-contain" />
            </button>
            <button
              type="button"
              onClick={handleLinkedInSignup}
              className="w-[48px] h-[32px] bg-[#f9f9f9] border border-[#e1e1e1] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 31 31" fill="none">
                <path d={svgPaths.p25e98dc0} fill="black" />
              </svg>
            </button>
          </div>
          )}

          {signupStep === 'form' && (
          <p className="text-center mt-3 text-[10px]">
            <span className="text-[#878e9e]">Already have an account? </span>
            <Link to="/login" className="text-[#2563eb] underline font-medium hover:text-[#1e40af] transition-colors">
              Login
            </Link>
          </p>
          )}
        </div>
      </div>
    </div>
  );
}
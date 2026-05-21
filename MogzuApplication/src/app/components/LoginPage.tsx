import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import svgPaths from '@/imports/svg-o29bchayym';
import imgGoogleIcon from 'figma:asset/623e1bc74569caceb0c89f1e0be048c9a6e5221f.png';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { RoleSwitcher } from '@/app/components/global/RoleSwitcher';
import { RoleBanner } from '@/app/components/global/RoleBanner';
import { useAuth } from '@/lib/auth';
import { authActions } from '@/lib/authActions';
import { getPostLoginPath } from '@/lib/authRedirect';
import { resolveSsoForEmail } from '@/lib/ssoConfig';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, role, isLoading, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'otp' | 'reset'>('login');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resetError, setResetError] = useState('');
  const [showSessionTimeoutBanner, setShowSessionTimeoutBanner] = useState(false);
  const [ssoHint, setSsoHint] = useState<{ domain: string; enforce: boolean } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowSessionTimeoutBanner(params.get('reason') === 'session-timeout');
  }, [location.search]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    // Wait until auth/profile resolved before redirecting away from login
    if (!role) return;
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    navigate(from ?? getPostLoginPath(role, profile), { replace: true });
  }, [isLoading, isAuthenticated, role, profile, navigate, location.state]);

  useEffect(() => {
    if (view !== 'otp' || otpSecondsLeft <= 0) return;
    const timer = setTimeout(() => setOtpSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [view, otpSecondsLeft]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setEmailError('');
    setPasswordError('');

    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email format.');
      return;
    }

    // Pre-SSO routing — if the email domain is bound to an active IdP
    // and enforce_sso is on, the password path is blocked. Redirect
    // via SAML before falling through to password auth.
    setIsSubmitting(true);
    const { data: ssoRow } = await resolveSsoForEmail(email.trim());
    const domain = email.trim().split('@')[1]?.toLowerCase() ?? '';
    if (ssoRow && ssoRow.enforce_sso) {
      const { error: ssoError } = await authActions.signInWithSso(domain);
      setIsSubmitting(false);
      if (ssoError) {
        setFormError(ssoError);
      }
      return;
    }
    if (ssoRow) {
      setSsoHint({ domain, enforce: false });
    } else {
      setSsoHint(null);
    }

    if (!password.trim()) {
      setIsSubmitting(false);
      setPasswordError('Password is required.');
      return;
    }

    const { error } = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials')) {
        setPasswordError('Wrong email or password.');
      } else if (error.toLowerCase().includes('email') && error.toLowerCase().includes('confirm')) {
        setFormError('Please verify your email before signing in.');
      } else {
        setFormError(error);
      }
      return;
    }

    // Redirect is handled by the auth-state effect above once role + session
    // propagate through the context — avoid navigating here to prevent a
    // double-replace race against that effect.
  };

  const handleGoogleLogin = async () => {
    await authActions.signInWithOAuth('google');
  };

  const handleLinkedInLogin = async () => {
    setFormError('LinkedIn login coming soon.');
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setEmailError('');

    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email format.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await authActions.resetPasswordForEmail(email.trim());
    setIsSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    setView('otp');
    setOtpSecondsLeft(120);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpSecondsLeft <= 0) {
      setOtpError('OTP expired. Please resend OTP.');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError('Enter a valid 6-digit OTP.');
      return;
    }
    if (otp !== '123456') {
      setOtpError('Incorrect OTP. Please try again.');
      return;
    }

    setView('reset');
  };

  const handleResendOtp = () => {
    setOtp('');
    setOtpError('');
    setOtpSecondsLeft(120);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setView('login');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setFormError('Password reset successful. Please login.');
    }, 700);
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-auto">
      <div className="sticky top-0 z-50">
        <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center px-4">
          <div className="flex items-center gap-2">
            <MogzuLogo className="h-7" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <RoleSwitcher />
          </div>
        </header>
        <RoleBanner onSwitchToCorporate={() => {}} />
      </div>
      {/* Left Side - Animated Background */}
      <div className="hidden lg:block absolute left-0 top-0 lg:w-[55%] xl:w-[55%] h-full">
        <svg
          className="w-full h-full"
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
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dx="-47" dy="-27" />
              <feGaussianBlur stdDeviation="25" />
              <feComposite
                in2="hardAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.16 0"
              />
              <feBlend
                mode="normal"
                in2="shape"
                result="effect1_innerShadow_3_156"
              />
            </filter>
          </defs>
          <path
            d={svgPaths.p3697c980}
            fill="#FA8D40"
            filter="url(#filter0_i_3_156)"
          />
        </svg>

        {/* Content on orange background */}
        <div className="absolute top-[20%] left-[8%] right-[8%] text-white">
          <h1 className="font-semibold mb-6 leading-tight max-w-[650px] text-[24px] xl:text-[36px]">
            Make Work Feel Lighter With Mogzu.
          </h1>

          <div className="space-y-3 text-lg mt-8 max-w-[550px]">
            <p className="leading-relaxed text-[16px] xl:text-[20px]">
              Plan well. Book quick. Enjoy more.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:absolute lg:right-0 lg:top-0 lg:w-[45%] h-full flex items-center justify-center py-8 lg:py-0">
        <div className="w-full max-w-[500px] px-6 sm:px-8 md:px-12 lg:px-8">
          {/* Header */}
          <div className="mb-5 lg:mb-6">
            <p className="text-[12px] text-black mb-2">Welcome to</p>
            <MogzuLogo className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[240px]" />
          </div>

          {showSessionTimeoutBanner && (
            <div className="mb-3 p-2.5 rounded-md border border-[#dde2e4] bg-[#f9f9f9]">
              <p className="text-[11px] text-[#0e1e3f]">
                Session timed out. Please login again.
              </p>
            </div>
          )}

          {formError && (
            <div className="mb-3 p-2.5 rounded-md border border-[#dde2e4] bg-[#f9f9f9]">
              <p className="text-[11px] text-[#0e1e3f]">{formError}</p>
            </div>
          )}

          {view === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-[11px] text-[#0e1e3f]"
              >
                Email ID
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email ID"
                className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
              {emailError && <p className="text-[10px] text-[#0e1e3f]">{emailError}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-[11px] text-[#0e1e3f]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E3E3E5] hover:text-[#878e9e] transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d={svgPaths.p1d5be100} fill="currentColor" />
                  </svg>
                </button>
              </div>
              {passwordError && <p className="text-[10px] text-[#0e1e3f]">{passwordError}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-2 border-black bg-white focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 cursor-pointer appearance-none checked:bg-white checked:border-black relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:text-[10px] checked:after:font-bold"
                />
                <span className="text-[11px] text-[#323232]">
                  Remember Me?
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setEmailError('');
                  setPasswordError('');
                  setView('forgot');
                }}
                className="text-[11px] text-[#2563eb] underline hover:text-[#1e40af] transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full h-[40px] bg-[#2563eb] text-white text-[13px] font-medium rounded-full shadow-md hover:bg-[#1e40af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
              style={{
                boxShadow:
                  '0px 4px 6.1px 0px rgba(0,0,0,0.12), inset -3px 4px 4.9px 0px rgba(255,255,255,0.39)',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {ssoHint && !ssoHint.enforce && (
              <button
                type="button"
                onClick={async () => {
                  setFormError('');
                  setIsSubmitting(true);
                  const { error } = await authActions.signInWithSso(ssoHint.domain);
                  setIsSubmitting(false);
                  if (error) setFormError(error);
                }}
                disabled={isSubmitting}
                className="w-full h-[40px] mt-2 border border-[#2563eb] text-[#2563eb] text-[13px] font-medium rounded-full hover:bg-[#eff6ff] transition-colors"
              >
                Sign in with {ssoHint.domain} SSO
              </button>
            )}
          </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <label htmlFor="forgot-email" className="block text-[11px] text-[#0e1e3f]">
                  Email ID
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
                {emailError && <p className="text-[10px] text-[#0e1e3f]">{emailError}</p>}
              </div>
              <button
                type="submit"
                className="w-full h-[40px] bg-[#2563eb] text-white text-[13px] font-medium rounded-full shadow-md hover:bg-[#1e40af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full h-[40px] bg-white border border-[#dde2e4] text-[13px] text-[#0e1e3f] font-medium rounded-full"
              >
                Back to login
              </button>
            </form>
          )}

          {view === 'otp' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[12px] text-[#0e1e3f]">
                Check your email — we sent a password reset link to <strong>{email}</strong>. It expires in 10 minutes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setView('login');
                }}
                className="w-full h-[40px] bg-white border border-[#dde2e4] text-[13px] text-[#0e1e3f] font-medium rounded-full"
              >
                Back to login
              </button>
            </div>
          )}

          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <label htmlFor="new-password" className="block text-[11px] text-[#0e1e3f]">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="confirm-new-password" className="block text-[11px] text-[#0e1e3f]">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
                {resetError && <p className="text-[10px] text-[#0e1e3f]">{resetError}</p>}
              </div>
              <button
                type="submit"
                className="w-full h-[40px] bg-[#2563eb] text-white text-[13px] font-medium rounded-full shadow-md hover:bg-[#1e40af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetError('');
                  setFormError('');
                  setView('login');
                }}
                className="w-full h-[40px] bg-white border border-[#dde2e4] text-[13px] text-[#0e1e3f] font-medium rounded-full"
              >
                Back to login
              </button>
            </form>
          )}

          {/* Divider */}
          {view === 'login' && (
          <div className="flex items-center gap-3 my-4 sm:my-5">
            <div className="flex-1 h-px bg-[#E1E1E1]" />
            <span className="text-[9px] text-[#949494]">Or</span>
            <div className="flex-1 h-px bg-[#E1E1E1]" />
          </div>
          )}

          {/* Social Login Buttons */}
          {view === 'login' && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-[56px] h-[36px] bg-[#f9f9f9] border border-[#e1e1e1] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <img
                src={imgGoogleIcon}
                alt="Google"
                className="w-3.5 h-3.5 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={handleLinkedInLogin}
              className="w-[56px] h-[36px] bg-[#f9f9f9] border border-[#e1e1e1] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 31 31" fill="none">
                <path d={svgPaths.p25e98dc0} fill="black" />
              </svg>
            </button>
          </div>
          )}

          {/* Sign Up Link */}
          {view === 'login' && (
          <div className="text-center mt-4 sm:mt-5 space-y-2">
            <p className="text-[11px]">
              <span className="text-[#878e9e]">Don't have an account ? </span>
              <Link
                to="/signup"
                className="text-[#2563eb] underline font-medium hover:text-[#1e40af] transition-colors"
              >
                Sign Up
              </Link>
            </p>
            <p className="text-[11px]">
              <Link
                to="/admin/login"
                className="text-[#878e9e] hover:text-[#2563eb] underline font-medium transition-colors"
              >
                Admin sign-in
              </Link>
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
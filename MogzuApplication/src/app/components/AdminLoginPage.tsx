import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import svgPaths from '@/imports/svg-o29bchayym';
import imgGoogleIcon from 'figma:asset/623e1bc74569caceb0c89f1e0be048c9a6e5221f.png';
import { RoleSwitcher } from '@/app/components/global/RoleSwitcher';
import { RoleBanner } from '@/app/components/global/RoleBanner';
import { useAuth, isAdminRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getAuthCallbackUrl } from '@/lib/authRedirect';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, isAuthenticated, role, isLoading } = useAuth();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSessionTimeoutBanner, setShowSessionTimeoutBanner] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdminRole(role)) {
      navigate('/admin', { replace: true });
    }
  }, [isLoading, isAuthenticated, role, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowSessionTimeoutBanner(params.get('reason') === 'session-timeout');
  }, [location.search]);

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
    if (!password.trim()) {
      setPasswordError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    const { error, redirectTo } = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials')) {
        setPasswordError('Wrong email or password.');
      } else {
        setFormError(error);
      }
      return;
    }

    if (redirectTo && redirectTo !== '/admin') {
      // Non-admin account: drop the session we just created so the user is not
      // left signed in as a corporate user on the admin login page.
      await signOut();
      setFormError('This account does not have administrator access.');
      return;
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdminRole(role) && role !== null) {
      // Same guard for OAuth / restored sessions that land here without the
      // admin role. Sign out and surface the error.
      setFormError('This account does not have administrator access.');
      void signOut();
    }
  }, [isLoading, isAuthenticated, role, signOut]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthCallbackUrl() },
    });
  };

  const handleLinkedInLogin = async () => {
    setFormError('LinkedIn login coming soon.');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setEmailError('');
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email format.');
      return;
    }
    setFormError('Admin password reset is handled by IT. Please contact your platform owner.');
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
      {/* Left — same organic orange panel as corporate LoginPage */}
      <div className="hidden lg:block absolute left-0 top-0 lg:w-[55%] xl:w-[55%] h-full min-h-[520px]">
        <svg
          className="w-full h-full"
          viewBox="0 0 1054 1027"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <filter
              id="filter0_admin_login_orange"
              x="-47"
              y="-27"
              width="1101"
              height="1054"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dx="-47" dy="-27" />
              <feGaussianBlur stdDeviation="25" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.16 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_admin" />
            </filter>
          </defs>
          <path
            d={svgPaths.p3697c980}
            fill="#FA8D40"
            filter="url(#filter0_admin_login_orange)"
          />
        </svg>

        <div className="absolute top-[18%] left-[8%] right-[10%] text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 mb-3">
            Mogzu Admin
          </p>
          <h1 className="font-semibold mb-5 leading-tight max-w-[650px] text-[22px] xl:text-[32px]">
            Streamline your company&apos;s processes with our comprehensive management tools.
          </h1>
          <div className="space-y-3 max-w-[560px] text-[15px] xl:text-[17px] leading-relaxed text-white/95">
            <p>
              Empower your employees with personalized access to manage their schedules and track their
              performance.
            </p>
            <p>
              Simplify vendor interactions with our integrated system for orders, invoices, and
              communication.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form (aligned with corporate LoginPage) */}
      <div className="w-full lg:absolute lg:right-0 lg:top-0 lg:w-[45%] min-h-screen flex items-center justify-center py-8 lg:py-0">
        <div className="w-full max-w-[500px] px-6 sm:px-8 md:px-12 lg:px-8">
          <div className="mb-5 lg:mb-6">
            <p className="text-[12px] text-black mb-2">Welcome to</p>
            <MogzuLogo className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[240px]" />
            <p className="mt-2 text-[11px] text-[#878e9e]">
              Sign in with your <span className="font-medium text-[#0e1e3f]">administrator</span>{' '}
              account
            </p>
          </div>

          {showSessionTimeoutBanner && (
            <div className="mb-3 p-2.5 rounded-md border border-[#dde2e4] bg-[#f9f9f9]">
              <p className="text-[11px] text-[#0e1e3f]">Session timed out. Please login again.</p>
            </div>
          )}

          {formError && (
            <div className="mb-3 p-2.5 rounded-md border border-[#dde2e4] bg-[#f9f9f9]">
              <p className="text-[11px] text-[#0e1e3f]">{formError}</p>
            </div>
          )}

          {view === 'login' && (
            <>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label htmlFor="admin-email" className="block text-[11px] text-[#0e1e3f]">
                    Email ID
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email ID"
                    className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  />
                  {emailError && <p className="text-[10px] text-[#0e1e3f]">{emailError}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="admin-password" className="block text-[11px] text-[#0e1e3f]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E3E3E5] hover:text-[#878e9e] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d={svgPaths.p1d5be100} fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                  {passwordError && <p className="text-[10px] text-[#0e1e3f]">{passwordError}</p>}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-2 border-black bg-white focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 cursor-pointer appearance-none checked:bg-white checked:border-black relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:text-[10px] checked:after:font-bold"
                    />
                    <span className="text-[11px] text-[#323232]">Remember Me?</span>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[40px] bg-[#2563eb] text-white text-[13px] font-medium rounded-full shadow-md hover:bg-[#1e40af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:opacity-60"
                  style={{
                    boxShadow:
                      '0px 4px 6.1px 0px rgba(0,0,0,0.12), inset -3px 4px 4.9px 0px rgba(255,255,255,0.39)',
                  }}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4 sm:my-5">
                <div className="flex-1 h-px bg-[#E1E1E1]" />
                <span className="text-[9px] text-[#949494]">Or</span>
                <div className="flex-1 h-px bg-[#E1E1E1]" />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-[56px] h-[36px] bg-[#f9f9f9] border border-[#e1e1e1] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Continue with Google"
                >
                  <img src={imgGoogleIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                </button>
                <button
                  type="button"
                  onClick={handleLinkedInLogin}
                  className="w-[56px] h-[36px] bg-[#f9f9f9] border border-[#e1e1e1] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Continue with LinkedIn"
                >
                  <svg width="22" height="22" viewBox="0 0 31 31" fill="none" aria-hidden>
                    <path d={svgPaths.p25e98dc0} fill="black" />
                  </svg>
                </button>
              </div>

              <div className="text-center mt-4 sm:mt-5 space-y-2">
                <p className="text-[11px]">
                  <span className="text-[#878e9e]">Don&apos;t have an account ? </span>
                  <Link
                    to="/signup"
                    className="text-[#2563eb] underline font-medium hover:text-[#1e40af] transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
                <p className="text-[11px]">
                  <Link
                    to="/login"
                    className="text-[#878e9e] hover:text-[#2563eb] underline font-medium transition-colors"
                  >
                    Corporate login
                  </Link>
                </p>
              </div>
            </>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3 sm:space-y-4">
              <p className="text-[11px] text-[#0e1e3f] leading-relaxed">
                Enter your admin email. We&apos;ll share reset instructions with your IT contact.
              </p>
              <div className="space-y-1">
                <label htmlFor="admin-forgot-email" className="block text-[11px] text-[#0e1e3f]">
                  Email ID
                </label>
                <input
                  id="admin-forgot-email"
                  type="email"
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
                style={{
                  boxShadow:
                    '0px 4px 6.1px 0px rgba(0,0,0,0.12), inset -3px 4px 4.9px 0px rgba(255,255,255,0.39)',
                }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setEmailError('');
                  setView('login');
                }}
                className="w-full h-[40px] bg-white border border-[#dde2e4] text-[13px] text-[#0e1e3f] font-medium rounded-full"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

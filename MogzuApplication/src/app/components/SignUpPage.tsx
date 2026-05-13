import { Link, useNavigate } from 'react-router';
import svgPaths from '@/imports/svg-o29bchayym';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { Briefcase } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-white overflow-auto">
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
            Join Mogzu Today
          </h1>

          <div className="space-y-3 text-lg mt-8 max-w-[550px]">
            <p className="leading-relaxed text-[16px] xl:text-[20px]">
              Experience effortless management, unmatched reach, and real results.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Account Type Selection */}
      <div className="w-full lg:absolute lg:right-0 lg:top-0 lg:w-[45%] h-full flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[450px]">
          {/* Header */}
          <div className="text-center mb-6">
            <MogzuLogo className="h-12 w-auto max-w-[220px] sm:max-w-[260px] mx-auto mb-3 justify-center" />
            <h1 className="text-[16px] font-semibold text-black mb-1.5">Corporate account</h1>
            <p className="text-[11px] text-gray-600">For teams booking venues, gifting, and events</p>
          </div>

          {/* Corporate signup — vendor registration lives on the home page */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => navigate('/signup/corporate')}
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#2563eb] hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Briefcase className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-black mb-0.5">Continue as corporate</h3>
                  <p className="text-[11px] text-gray-600">
                    Plan events, manage approvals, and pay with one invoice
                  </p>
                </div>
              </div>
            </button>

            <p className="text-[11px] text-gray-600 text-center leading-relaxed px-1">
              Vendor, venue, or supplier?{' '}
              <Link to="/#partner-with-mogzu" className="text-[#15D39D] font-semibold hover:underline">
                Partner with us on the home page
              </Link>
              {' · '}
              <Link to="/signup/vendor" className="text-[#2563eb] font-semibold hover:underline">
                Start partner onboarding
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-5 mb-5 text-[11px]">
            <button
              type="button"
              onClick={() => navigate('/why-mogzu')}
              className="text-gray-600 hover:text-[#2563eb] transition-colors"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => navigate('/why-mogzu')}
              className="text-gray-600 hover:text-[#2563eb] transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => navigate('/assistance')}
              className="text-gray-600 hover:text-[#2563eb] transition-colors"
            >
              Support
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-[11px] text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#2563eb] font-medium hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
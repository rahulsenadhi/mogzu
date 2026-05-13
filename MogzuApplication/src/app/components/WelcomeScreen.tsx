import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to dashboard after welcome screen
          setTimeout(() => navigate('/dashboard'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleContinue = () => {
    if (isContinuing) return;
    setIsContinuing(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA8D40] via-[#FA8D40] to-[#e67c2d] flex flex-col items-center justify-center px-4">
      {/* Welcome Card */}
      <div className="bg-white rounded-[24px] shadow-2xl p-8 sm:p-12 md:p-16 max-w-[600px] w-full text-center">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="inline-flex" aria-label="Mogzu home">
            <MogzuLogo className="h-9 w-auto max-w-[180px] sm:max-w-[200px] justify-center" />
          </Link>
        </div>
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FA8D40] to-[#e67c2d] flex items-center justify-center shadow-lg">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className="animate-[scale-in_0.5s_ease-out]"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[#FA8D40] opacity-20 animate-ping" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-[28px] sm:text-[36px] font-bold text-[#0e1e3f] mb-4">
          Welcome to Mogzu! 🎉
        </h1>
        <p className="text-[16px] sm:text-[18px] text-[#475569] mb-8 leading-relaxed">
          Your account has been successfully created. We're setting up your personalized dashboard...
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#FA8D40] to-[#e67c2d] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[14px] text-[#878e9e]">{progress}% Complete</p>

        <button
          type="button"
          onClick={handleContinue}
          disabled={isContinuing}
          className="mt-6 w-full h-[42px] bg-[#2563eb] text-white text-[13px] font-medium rounded-full hover:bg-[#1e40af] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isContinuing ? 'Opening dashboard...' : 'Continue to dashboard'}
        </button>
      </div>

      {/* Footer Text */}
      <p className="mt-8 text-white text-[14px] opacity-90">
        Making work feel lighter, one event at a time ✨
      </p>

      {/* Keyframes for scale-in animation */}
      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

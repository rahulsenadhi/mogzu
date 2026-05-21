import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth, isAdminRole, isVendorRole } from '@/lib/auth'
import { getPostLoginPath } from '@/lib/authRedirect'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const { role, isLoading, isAuthenticated, profile } = useAuth()
  const [progress, setProgress] = useState(0)
  const [isContinuing, setIsContinuing] = useState(false)
  const didRedirectRef = useRef(false)

  const redirectToDestination = () => {
    if (didRedirectRef.current) return
    didRedirectRef.current = true

    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    if (isVendorRole(role)) {
      navigate('/vendor/dashboard', { replace: true })
      return
    }
    if (isAdminRole(role)) {
      navigate('/admin', { replace: true })
      return
    }

    // Corporate (incl. default l1_employee when profile still loading)
    navigate(getPostLoginPath(role, profile), { replace: true })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoading || progress < 100 || didRedirectRef.current) return
    if (!isAuthenticated) return

    const timer = setTimeout(() => redirectToDestination(), 500)
    return () => clearTimeout(timer)
  }, [isLoading, isAuthenticated, role, progress])

  const handleContinue = () => {
    if (isContinuing) return
    setIsContinuing(true)
    redirectToDestination()
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA8D40] via-[#FA8D40] to-[#e67c2d] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-[24px] shadow-2xl p-8 sm:p-12 md:p-16 max-w-[600px] w-full text-center">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="inline-flex" aria-label="Mogzu home">
            <MogzuLogo className="h-9 w-auto max-w-[180px] sm:max-w-[200px] justify-center" />
          </Link>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FA8D40] to-[#e67c2d] flex items-center justify-center shadow-lg">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="animate-[scale-in_0.5s_ease-out]">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-[#FA8D40] opacity-20 animate-ping" />
          </div>
        </div>

        <h1 className="text-[28px] sm:text-[36px] font-bold text-[#0e1e3f] mb-4">
          Welcome to Mogzu! 🎉
        </h1>
        <p className="text-[16px] sm:text-[18px] text-[#475569] mb-8 leading-relaxed">
          Your account is ready. Opening your dashboard…
        </p>

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
          disabled={isContinuing || (isLoading && isAuthenticated)}
          className="mt-6 w-full h-[42px] bg-[#2563eb] text-white text-[13px] font-medium rounded-full hover:bg-[#1e40af] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isContinuing ? 'Opening…' : 'Continue to dashboard'}
        </button>
      </div>

      <p className="mt-8 text-white text-[14px] opacity-90">
        Making work feel lighter, one event at a time ✨
      </p>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

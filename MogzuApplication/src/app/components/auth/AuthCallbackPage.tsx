import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setError('Invalid or missing verification code. Please request a new link.')
      return
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ data, error: exchangeError }) => {
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }

        // Check if this is a password-recovery flow
        const recoveryType =
          data.session?.user?.app_metadata?.type ??
          data.session?.user?.user_metadata?.type

        if (recoveryType === 'recovery') {
          navigate('/auth/reset-password', { replace: true })
        } else {
          // Send to dashboard — ProtectedRoute will redirect to the right portal
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => {
        setError('Something went wrong. Please try again.')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-4 font-['Inter']">
        <div className="w-full max-w-[400px] rounded-xl border border-[#dde2e4] bg-white p-8 text-center shadow-sm">
          <p className="mb-1 text-[13px] font-semibold text-[#0e1e3f]">Verification failed</p>
          <p className="mb-6 text-[12px] text-[#878e9e]">{error}</p>
          <Link
            to="/login"
            className="inline-block rounded-md bg-[#FA8D40] px-6 py-2.5 text-[12px] font-medium text-white hover:bg-[#e87d30]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFDF9] font-['Inter']">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FA8D40] border-t-transparent" />
      <p className="text-[13px] text-[#0e1e3f]">Verifying...</p>
    </div>
  )
}

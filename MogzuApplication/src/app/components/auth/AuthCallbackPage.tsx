import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { authActions } from '@/lib/authActions'
import { ensureUserProfile } from '@/lib/auth'
import { getPostLoginPath } from '@/lib/authRedirect'
import type { UserRole } from '@/lib/database.types'

function parseHashParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const hashParams = parseHashParams()
    const hashHasSession =
      hashParams.has('access_token') ||
      hashParams.get('type') === 'signup' ||
      hashParams.get('type') === 'recovery'

    const finish = async (sessionError: string | null, recovery = false) => {
      if (sessionError) {
        setError(sessionError)
        return
      }
      if (recovery) {
        navigate('/auth/reset-password', { replace: true })
        return
      }
      const { user } = await authActions.getUser()
      const profile = user ? await ensureUserProfile(user) : null
      navigate(getPostLoginPath((profile?.role as UserRole | undefined) ?? null), { replace: true })
    }

    const run = async () => {
      if (code) {
        const { data, error: exchangeError } = await authActions.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError)
          return
        }
        const recoveryType =
          data.session?.user?.app_metadata?.type ?? data.session?.user?.user_metadata?.type
        await finish(null, recoveryType === 'recovery')
        return
      }

      if (hashHasSession) {
        const { session, error: sessionError } = await authActions.getSession()
        if (sessionError) {
          setError(sessionError)
          return
        }
        if (!session) {
          setError('Could not verify your email. Request a new link from the login page.')
          return
        }
        await finish(null, hashParams.get('type') === 'recovery')
        return
      }

      const { session } = await authActions.getSession()
      if (session) {
        const profile = session.user
          ? await ensureUserProfile(session.user)
          : null
        navigate(getPostLoginPath((profile?.role as UserRole | undefined) ?? null), { replace: true })
        return
      }

      setError('Invalid or missing verification code. Please request a new link.')
    }

    run().catch(() => {
      setError(
        'Something went wrong. Make sure `npm run dev` is running, then request a new verification email.',
      )
    })
  }, [navigate, searchParams])

  if (error) {
    return (
      <motionlessAuthShell
        title="Verification failed"
        body={error}
        hint="Keep the dev server running (npm run dev), then sign up again for a fresh link."
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFDF9] font-['Inter']">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FA8D40] border-t-transparent" />
      <p className="text-[13px] text-[#0e1e3f]">Verifying...</p>
    </div>
  )
}

function motionlessAuthShell({
  title,
  body,
  hint,
}: {
  title: string
  body: string
  hint?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-4 font-['Inter']">
      <div className="w-full max-w-[400px] rounded-xl border border-[#dde2e4] bg-white p-8 text-center shadow-sm">
        <p className="mb-1 text-[13px] font-semibold text-[#0e1e3f]">{title}</p>
        <p className="mb-4 text-[12px] text-[#878e9e]">{body}</p>
        {hint ? <p className="mb-6 text-[11px] text-[#878e9e]">{hint}</p> : null}
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

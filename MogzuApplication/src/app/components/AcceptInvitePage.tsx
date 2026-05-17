import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { authActions } from '@/lib/authActions'
import { db } from '@/lib/db'
import { getPostLoginPath } from '@/lib/authRedirect'
import type { UserRole } from '@/lib/database.types'

type InviteSnapshot = {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  expires_at: string
  accepted_at: string | null
}

export default function AcceptInvitePage() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [invite, setInvite] = useState<InviteSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!token) {
      setError('Invite token missing.')
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: e } = await db.userInvites.getByToken(token)
    if (e) {
      setError(e.message)
      setLoading(false)
      return
    }
    const row = (data as InviteSnapshot[] | null)?.[0]
    if (!row) {
      setError('Invite link is invalid or has been revoked.')
      setLoading(false)
      return
    }
    if (row.accepted_at) {
      setError('This invite has already been accepted. Please sign in.')
      setLoading(false)
      return
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      setError('This invite has expired. Ask an admin to issue a new one.')
      setLoading(false)
      return
    }
    setInvite(row)
    setFullName(row.full_name ?? '')
    setLoading(false)
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite || !token) return
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    setError('')

    const { data: signUp, error: signUpError } = await authActions.signUp(
      invite.email,
      password,
      { full_name: fullName.trim() || invite.full_name || invite.email.split('@')[0] },
    )

    if (signUpError) {
      // Account may already exist (re-invite of existing email). Try sign in.
      const { error: signInError } = await authActions.signInWithPassword(invite.email, password)
      if (signInError) {
        setError(signInError)
        setSubmitting(false)
        return
      }
    }

    // Ensure a session exists before calling the RPC (the RPC requires
    // auth.uid()).
    const { session } = await authActions.getSession()
    if (!session) {
      setError(
        'Sign up succeeded but no session was returned. Check your email for confirmation, then sign in.',
      )
      setSubmitting(false)
      return
    }

    const { error: acceptError } = await db.userInvites.accept(token)
    setSubmitting(false)
    if (acceptError) {
      setError(`Invite accept failed: ${acceptError.message}`)
      return
    }

    // Refresh profile so role + status propagate, then route to the
    // role-appropriate landing page.
    void signUp
    navigate(getPostLoginPath(invite.role), { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <MogzuLogo className="mx-auto mb-4 h-10" />
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-8 text-center">
        <MogzuLogo className="mx-auto h-10" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Welcome to Mogzu</h1>
        <p className="mt-1 text-sm text-slate-500">
          You've been invited to join as <strong className="capitalize">{invite.role.replace('_', ' ')}</strong>.
          Set a password to activate your account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={invite.email}
            readOnly
            className="h-10 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-700">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-700">Choose password *</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Accept invite
        </button>
      </form>
    </div>
  )
}

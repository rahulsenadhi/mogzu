import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader2, Sparkles } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { db } from '@/lib/db'
import { rememberPartnerReferralCode } from '@/lib/partnerReferral'

export default function PartnerReferralIntakePage() {
  const navigate = useNavigate()
  const params = useParams<{ code: string }>()
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      const raw = params.code?.trim() ?? ''
      if (!raw) {
        setError('Referral code missing in URL.')
        setLoading(false)
        return
      }
      const code = raw.toUpperCase()
      const { data, error: e } = await db.partners.getByReferralCode(code)
      if (cancelled) return
      if (e) {
        setError(e.message)
        setLoading(false)
        return
      }
      if (!data) {
        setError('This referral link is invalid or the partner account is not active.')
        setLoading(false)
        return
      }
      rememberPartnerReferralCode(code)
      setPartnerName(data.business_name ?? data.full_name)
      setLoading(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [params.code])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <MogzuLogo className="mx-auto mb-6 h-10" />
        <h1 className="text-lg font-semibold text-slate-900">Referral link error</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="mt-6 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Continue to signup
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <MogzuLogo className="mx-auto mb-6 h-10" />
      <Sparkles className="mx-auto mb-3 size-6 text-indigo-500" />
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome — referred by {partnerName}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign up below to get started on Mogzu. Your account will be linked to {partnerName} for the
        next 90 days.
      </p>
      <button
        type="button"
        onClick={() => navigate('/signup')}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Continue to signup
      </button>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { authActions } from '@/lib/authActions'
import { db } from '@/lib/db'
import type { PartnerType } from '@/lib/database.types'

const PARTNER_TYPES: { value: PartnerType; label: string; description: string }[] = [
  { value: 'consultant', label: 'Consultant', description: 'Independent advisor referring corporate clients' },
  { value: 'agency', label: 'Agency', description: 'Marketing or HR agency with corporate roster' },
  { value: 'reseller', label: 'Reseller', description: 'Reselling Mogzu services to your customers' },
  { value: 'freelancer', label: 'Freelancer', description: 'Solo gigging partner' },
]

const REFERRAL_STORAGE_KEY = 'mogzu_partner_referral_intake'

const inputClass =
  'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function PartnerSignUpForm() {
  const navigate = useNavigate()
  const [partnerType, setPartnerType] = useState<PartnerType>('consultant')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [expertise, setExpertise] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REFERRAL_STORAGE_KEY)
      if (stored) {
        // Pre-fill expertise note if a partner code was captured (used for
        // sub-partner attribution in the future; for now stash silently).
        sessionStorage.setItem(REFERRAL_STORAGE_KEY, stored)
      }
    } catch {
      // ignore storage access errors (SSR / private mode)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)

    const { data: signUpData, error: signUpError } = await authActions.signUp(
      email.trim(),
      password,
      { full_name: fullName.trim() },
    )

    if (signUpError) {
      setError(signUpError)
      setSubmitting(false)
      return
    }

    const userId = signUpData.user?.id ?? signUpData.session?.user.id ?? null

    if (!userId) {
      setError('Signup created but no user returned. Check your email for confirmation, then sign in.')
      setSubmitting(false)
      return
    }

    // Promote the auto-created profile to the partner role. Self-update is
    // allowed by RLS via id = auth.uid().
    await db.userProfiles.upsertPartial({
      id: userId,
      role: 'partner',
      full_name: fullName.trim(),
      phone: phone.trim() || null,
    })

    const { error: partnerError } = await db.partners.signup({
      user_id: userId,
      partner_type: partnerType,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      business_name: businessName.trim() || null,
      expertise: expertise
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bank_account_name: accountName.trim() || null,
      bank_account_number: accountNumber.trim() || null,
      bank_ifsc: ifsc.trim() || null,
    })

    setSubmitting(false)

    if (partnerError) {
      setError(`Profile saved but partner record failed: ${partnerError.message}`)
      return
    }

    setSubmitted(true)
    try {
      sessionStorage.removeItem(REFERRAL_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md py-16 px-6 text-center">
        <MogzuLogo className="mx-auto mb-6 h-10" />
        <h1 className="text-xl font-semibold text-slate-900">Application received</h1>
        <p className="mt-3 text-sm text-slate-600">
          Mogzu Admin will review your application within 2 business days. You will receive an email
          with your unique referral code once approved.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">
        <MogzuLogo className="mx-auto h-10" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Become a Mogzu Partner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Refer corporate clients, earn commissions on bookings, and grow with our platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Partnership type
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {PARTNER_TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPartnerType(opt.value)}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  partnerType === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <p className="font-semibold">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Business / brand name">
            <input
              className={inputClass}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </Field>
          <Field label="Password" required>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </Field>
          <Field label="Expertise (comma-separated)">
            <input
              className={inputClass}
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="HR consulting, employee engagement"
            />
          </Field>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Payout details (optional — required before first payout)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account holder name">
              <input
                className={inputClass}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </Field>
            <Field label="Account number">
              <input
                className={inputClass}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </Field>
            <Field label="IFSC">
              <input
                className={inputClass}
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              />
            </Field>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900">
            Already a partner? Sign in
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            Submit application
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

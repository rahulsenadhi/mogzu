// Phase 5 Feature 2 — anonymous vendor onboarding form.

import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  REGIONS,
  submitApplication,
  type Region,
} from '@/lib/vendorOnboarding'

export default function PublicVendorApplyPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [business, setBusiness] = useState('')
  const [region, setRegion] = useState<Region>('in')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !business.trim()) {
      setError('Name, work email, and business name are all required.')
      return
    }
    setSubmitting(true)
    const { id, error: err } = await submitApplication({
      applicant_email: email.trim().toLowerCase(),
      applicant_name: name.trim(),
      business_name: business.trim(),
      region,
    })
    setSubmitting(false)
    if (err || !id) {
      setError(err ?? 'Could not submit application')
      return
    }
    setDone(id)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#FFFDF9]">
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto mb-3 size-10 text-emerald-500" />
          <h1 className="text-xl font-semibold text-slate-900">Application received</h1>
          <p className="mt-2 text-sm text-slate-500">
            We'll email <span className="font-medium">{email}</span> within one business day with
            next steps.
          </p>
          <p className="mt-4 font-mono text-xs text-slate-400">Ref: {done.slice(0, 8)}</p>
          <Link to="/" className="mt-6 inline-block text-sm font-medium text-[#2563eb]">
            Back to Mogzu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#0e1e3f]">
            Mogzu
          </Link>
          <Link to="/login" className="text-sm font-medium text-slate-600">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Become a Mogzu vendor</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us about your business; we'll come back with KYC + onboarding steps.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email *"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Business name *"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Apply to Mogzu
          </button>
        </form>
      </main>
    </div>
  )
}

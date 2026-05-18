// Phase 3 Feature 3 — embeddable "Request a quote" form.

import { useCallback, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  BUDGET_BANDS,
  TIMELINES,
  submitLead,
  type BudgetBand,
  type Timeline,
} from '@/lib/publicLeads'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/app/components/TurnstileWidget'

export default function PublicLeadForm({
  listingId,
  sourceSlug,
  compact = false,
}: {
  listingId?: string
  sourceSlug?: string
  compact?: boolean
}) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [requirement, setRequirement] = useState('')
  const [budget, setBudget] = useState<BudgetBand | ''>('')
  const [timeline, setTimeline] = useState<Timeline | ''>('')
  const [honeypot, setHoneypot] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleToken = useCallback((t: string | null) => setTurnstileToken(t), [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Name + email are required')
      return
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the verification challenge')
      return
    }

    setSubmitting(true)
    const { error: err } = await submitLead({
      listing_id: listingId ?? null,
      source_slug: sourceSlug ?? null,
      client_name: name.trim(),
      client_company: company.trim() || null,
      client_email: email.trim(),
      client_phone: phone.trim() || null,
      requirement_summary: requirement.trim() || null,
      budget_band: budget || null,
      timeline: timeline || null,
      honeypot,
      turnstile_token: turnstileToken,
    })
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
        <p className="text-sm font-semibold text-emerald-900">Thanks — we'll be in touch</p>
        <p className="mt-1 text-xs text-emerald-700">
          A Mogzu sales agent (or the AI Sales agent) will reach out within one business day.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? 'space-y-3'
          : 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3'
      }
    >
      {!compact && (
        <div>
          <h3 className="text-base font-semibold text-slate-900">Request a quote</h3>
          <p className="mt-1 text-xs text-slate-500">
            Tell us what you need; no account required.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name *"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email *"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value as BudgetBand)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Budget</option>
          {BUDGET_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select
          value={timeline}
          onChange={(e) => setTimeline(e.target.value as Timeline)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Timeline</option>
          {TIMELINES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        rows={3}
        value={requirement}
        onChange={(e) => setRequirement(e.target.value)}
        placeholder="What are you looking for?"
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
      />

      {/* Honeypot — hidden from humans, bots fill it, server flags as spam. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', height: 0, width: 0 }}
        aria-hidden="true"
      />

      <TurnstileWidget onToken={handleToken} />

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Request quote
      </button>
    </form>
  )
}

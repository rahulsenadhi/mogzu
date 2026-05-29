import { useMemo, useState } from 'react'
import { findDuplicateLeads } from '@/lib/leadDuplicates'
import type { PublicLead } from '@/lib/publicLeads'
import { Loader2, Phone, X } from 'lucide-react'
import {
  LEAD_INTAKE_CHANNELS,
  REFERRER_RELATIONSHIPS,
  type LeadIntakeChannel,
  type LeadIntakeVertical,
} from '@/lib/leadSources'
import {
  BUDGET_BANDS,
  TIMELINES,
  createStaffLead,
  type BudgetBand,
  type Timeline,
} from '@/lib/publicLeads'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
type StaffLeadIntakePanelProps = {
  initialChannel?: LeadIntakeChannel
  existingLeads?: PublicLead[]
  loggedByUserId?: string | null
  loggedByDisplayName?: string | null
  embedded?: boolean
  onClose: () => void
  onCreated: (leadId: string | null) => void
}
export function StaffLeadIntakePanel({
  initialChannel = 'inbound_phone',
  existingLeads = [],
  loggedByUserId,
  loggedByDisplayName,
  embedded = false,
  onClose,
  onCreated,
}: StaffLeadIntakePanelProps) {
  const [channel, setChannel] = useState<LeadIntakeChannel>(initialChannel)
  const [intakeVertical, setIntakeVertical] = useState<LeadIntakeVertical>('unspecified')
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [requirement, setRequirement] = useState('')
  const [budget, setBudget] = useState<BudgetBand | ''>('')
  const [timeline, setTimeline] = useState<Timeline | ''>('')
  const [referrerName, setReferrerName] = useState('')
  const [referrerCompany, setReferrerCompany] = useState('')
  const [referrerRelationship, setReferrerRelationship] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [callbackRequested, setCallbackRequested] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const channelMeta = useMemo(
    () => LEAD_INTAKE_CHANNELS.find((c) => c.id === channel),
    [channel],
  )
  const needsReferrer = channel === 'referral' || channel === 'partner_intro'
  const phoneRequired = channel === 'inbound_phone' || channel === 'whatsapp'
  const duplicates = useMemo(
    () => findDuplicateLeads(existingLeads, clientPhone, clientEmail),
    [existingLeads, clientPhone, clientEmail],
  )
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { id, error: err } = await createStaffLead({
      channel,
      intake_vertical: intakeVertical,
      client_name: clientName,
      client_company: clientCompany || null,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      requirement_summary: requirement,
      budget_band: budget || null,
      timeline: timeline || null,
      referrer_name: referrerName || null,
      referrer_company: referrerCompany || null,
      referrer_relationship: referrerRelationship || null,
      internal_notes: internalNotes || null,
      callback_requested: callbackRequested,
      logged_by_user_id: loggedByUserId ?? null,
      logged_by_display_name: loggedByDisplayName ?? null,
    })
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    onCreated(id)
  }
  return (
    <section className={embedded ? 'space-y-4' : `${LEAD_OPS.surface} p-5`} aria-labelledby="staff-lead-intake-title">
      {!embedded ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="staff-lead-intake-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Phone className="size-4 text-teal-600" aria-hidden />
              Log enquiry
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Phone, referral, WhatsApp, or partner intro — saved to your lead inbox.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close intake form"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          Capture offline enquiries. Fields marked * are required.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {duplicates.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
            <p className="font-semibold">
              {duplicates.length} existing lead{duplicates.length > 1 ? 's' : ''} match this phone or email
            </p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5">
              {duplicates.slice(0, 3).map((d) => (
                <li key={d.id}>
                  {d.client_name} — {d.status}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-amber-800">You can still save — review the duplicate in the inbox after.</p>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Source channel</span>
            <select
              className={LEAD_OPS.input}
              value={channel}
              onChange={(e) => setChannel(e.target.value as LeadIntakeChannel)}
            >
              {LEAD_INTAKE_CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            {channelMeta ? (
              <span className="text-[11px] text-slate-500">{channelMeta.hint}</span>
            ) : null}
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-xs font-medium text-slate-700">Product interest</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'gifting' as const, label: 'Gifting' },
                  { id: 'events' as const, label: 'Events' },
                  { id: 'unspecified' as const, label: 'Not sure yet' },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setIntakeVertical(v.id)}
                  aria-pressed={intakeVertical === v.id}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    intakeVertical === v.id
                      ? v.id === 'gifting'
                        ? 'bg-violet-600 text-white'
                        : v.id === 'events'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-700 text-white'
                      : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        {needsReferrer ? (
          <div className="grid gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-amber-900">Referrer / partner name</span>
              <input
                className={LEAD_OPS.input}
                value={referrerName}
                onChange={(e) => setReferrerName(e.target.value)}
                placeholder="Who referred this lead?"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-amber-900">Their company</span>
              <input
                className={LEAD_OPS.input}
                value={referrerCompany}
                onChange={(e) => setReferrerCompany(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-amber-900">Relationship</span>
              <select
                className={LEAD_OPS.input}
                value={referrerRelationship}
                onChange={(e) => setReferrerRelationship(e.target.value)}
              >
                <option value="">Select…</option>
                {REFERRER_RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-700">Client name *</span>
            <input
              className={LEAD_OPS.input}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-700">Company</span>
            <input
              className={LEAD_OPS.input}
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              autoComplete="organization"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-700">
              Phone {phoneRequired ? '*' : ''}
            </span>
            <input
              className={LEAD_OPS.input}
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required={phoneRequired}
              placeholder="+91 …"
              autoComplete="tel"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-700">Email</span>
            <input
              className={LEAD_OPS.input}
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder={phoneRequired ? 'Optional if phone added' : 'Required if no phone'}
              autoComplete="email"
            />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-700">
            Requirement / call notes *
          </span>
          <textarea
            className={`${LEAD_OPS.input} min-h-[88px] py-2`}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            required
            placeholder="What they need, headcount, city, gifting vs event context…"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-700">Budget band</span>
            <select
              className={LEAD_OPS.input}
              value={budget}
              onChange={(e) => setBudget((e.target.value || '') as BudgetBand | '')}
            >
              <option value="">Not discussed</option>
              {BUDGET_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-700">Timeline</span>
            <select
              className={LEAD_OPS.input}
              value={timeline}
              onChange={(e) => setTimeline((e.target.value || '') as Timeline | '')}
            >
              <option value="">Not discussed</option>
              {TIMELINES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-700">Internal notes (staff only)</span>
          <input
            className={LEAD_OPS.input}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Next follow-up, AM owner, competitor mention…"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={callbackRequested}
            onChange={(e) => setCallbackRequested(e.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          Client asked for a callback
        </label>
        {error ? (
          <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-white/60 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={LEAD_OPS.primaryBtn}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save to lead inbox'
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

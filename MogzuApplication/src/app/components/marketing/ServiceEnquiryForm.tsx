import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { submitLead, BUDGET_BANDS, TIMELINES } from '@/lib/publicLeads'
import {
  SERVICE_ENQUIRY_OPTIONS,
  serviceLabelForId,
} from '@/app/components/marketing/offlineServicesData'
import { MANAGED_SERVICES_COPY } from '@/app/lib/marketingContent'

type Props = {
  id?: string
  initialServiceId?: string
  onServiceChange?: (serviceId: string) => void
}

function normalizeWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (raw.trim().startsWith('+')) return raw.trim()
  return digits ? `+${digits}` : raw.trim()
}

function isValidWhatsApp(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function ServiceEnquiryForm({
  id = 'service-enquiry',
  initialServiceId = 'end-to-end-event',
  onServiceChange,
}: Props) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [serviceId, setServiceId] = useState(initialServiceId)
  const [budgetBand, setBudgetBand] = useState<string>('unknown')
  const [timeline, setTimeline] = useState<string>('exploring')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    setServiceId(initialServiceId)
  }, [initialServiceId])

  const handleServiceChange = (value: string) => {
    setServiceId(value)
    onServiceChange?.(value)
  }

  const resetForm = () => {
    setName('')
    setCompany('')
    setWhatsapp('')
    setServiceId(initialServiceId)
    setBudgetBand('unknown')
    setTimeline('exploring')
    setMessage('')
    setError('')
    setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidWhatsApp(whatsapp)) {
      setError('Please enter a valid WhatsApp number (10–15 digits).')
      return
    }

    setStatus('submitting')
    const phone = normalizeWhatsApp(whatsapp)
    const digits = phone.replace(/\D/g, '')
    const serviceLabel = serviceLabelForId(serviceId)
    const summaryParts = [`Service: ${serviceLabel}`]
    if (message.trim()) summaryParts.push(`Details: ${message.trim()}`)

    const { error: submitError } = await submitLead({
      client_name: name.trim(),
      client_company: company.trim() || null,
      client_email: `whatsapp+${digits}@enquiries.mogzu.app`,
      client_phone: phone,
      requirement_summary: summaryParts.join('. '),
      source_slug: 'offline-services',
      budget_band: budgetBand as (typeof BUDGET_BANDS)[number]['value'],
      timeline: timeline as (typeof TIMELINES)[number]['value'],
      metadata: {
        form_type: 'offline_services',
        service_interested_in: serviceId,
        service_interested_in_label: serviceLabel,
        preferred_channel: 'whatsapp',
      },
    })

    if (submitError) {
      setError(submitError)
      setStatus('idle')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div
        id={id}
        className="scroll-mt-28 card-chunky rounded-3xl bg-white p-8 sm:p-10 text-center"
      >
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-3 border-black bg-[#15D39D] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <svg className="size-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-[#0e1e3f] mb-3">{MANAGED_SERVICES_COPY.form.successTitle}</h3>
        <p className="text-base font-bold text-gray-600 max-w-md mx-auto">
          {MANAGED_SERVICES_COPY.form.successBody}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="btn-chunky mt-6 rounded-xl bg-white px-6 py-3 text-base font-black text-[#0e1e3f]"
        >
          Send another enquiry
        </button>
      </div>
    )
  }

  const selectedLabel = serviceLabelForId(serviceId)

  return (
    <div id={id} className="scroll-mt-28 card-chunky rounded-3xl bg-white p-6 sm:p-8">
      <div className="mb-6 border-b-2 border-gray-100 pb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl border-2 border-black bg-[#15D39D]">
            <MessageCircle className="size-5 text-[#0e1e3f]" aria-hidden />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">{MANAGED_SERVICES_COPY.form.eyebrow}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-[#0e1e3f] mb-2">{MANAGED_SERVICES_COPY.form.title}</h3>
        <p className="text-base font-bold text-gray-700">
          {MANAGED_SERVICES_COPY.form.subtitle}
        </p>
        {serviceId !== 'other' ? (
          <p className="mt-3 inline-flex rounded-lg border-2 border-black bg-[#FFFDF9] px-3 py-1.5 text-sm font-black text-[#0e1e3f]">
            {MANAGED_SERVICES_COPY.form.selectedPrefix} {selectedLabel}
          </p>
        ) : null}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <fieldset disabled={status === 'submitting'} className="m-0 space-y-4 border-0 p-0 disabled:opacity-70">
        {error ? (
          <p
            className="rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div>
          <label htmlFor="enquiry-name" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
            Full name
          </label>
          <input
            id="enquiry-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="enquiry-company" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
            Company <span className="normal-case font-bold text-gray-500">(optional)</span>
          </label>
          <input
            id="enquiry-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky"
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="enquiry-whatsapp" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
            WhatsApp number
          </label>
          <input
            id="enquiry-whatsapp"
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky"
            autoComplete="tel"
            inputMode="tel"
          />
          <p className="mt-1.5 text-xs font-bold text-gray-500">We use this as your primary contact channel.</p>
        </div>

        <div>
          <label htmlFor="enquiry-service" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
            Service interested in
          </label>
          <select
            id="enquiry-service"
            required
            value={serviceId}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky appearance-none"
          >
            {SERVICE_ENQUIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="enquiry-budget" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Budget band
            </label>
            <select
              id="enquiry-budget"
              value={budgetBand}
              onChange={(e) => setBudgetBand(e.target.value)}
              className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky appearance-none"
            >
              {BUDGET_BANDS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="enquiry-timeline" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Timeline
            </label>
            <select
              id="enquiry-timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky appearance-none"
            >
              {TIMELINES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="enquiry-message" className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
            Requirement details <span className="normal-case font-bold text-gray-500">(optional)</span>
          </label>
          <textarea
            id="enquiry-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="City, dates, headcount, occasion, or anything else we should know..."
            rows={4}
            className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky resize-y min-h-[100px]"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`btn-chunky w-full py-3.5 text-lg font-black rounded-xl mt-2 ${
            status === 'submitting'
              ? 'bg-gray-400 border-gray-500 cursor-not-allowed text-gray-700'
              : 'bg-[#15D39D] text-black'
          }`}
        >
          {status === 'submitting' ? MANAGED_SERVICES_COPY.form.submittingLabel : MANAGED_SERVICES_COPY.form.submitLabel}
        </button>

        <p className="text-center text-xs font-bold text-gray-500">
          {MANAGED_SERVICES_COPY.form.consent}
        </p>
        </fieldset>
      </form>
    </div>
  )
}

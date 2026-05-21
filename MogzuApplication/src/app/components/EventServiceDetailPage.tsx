import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Calendar, ChevronDown, MapPin, Star, Users } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { formatInr, getEventServiceById } from '@/app/lib/eventsServicesData'
import { getPricingBadgeConfig } from './ui/PriceBlock'

type DetailTab = 'overview' | 'included' | 'addons' | 'reviews' | 'faqs'
type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Credit'

export default function EventServiceDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const service = id ? getEventServiceById(id) : null

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [tab, setTab] = useState<DetailTab>('overview')
  const [selectedDate, setSelectedDate] = useState('')
  const [pax, setPax] = useState(100)
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([])

  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [bookStep, setBookStep] = useState(1)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [eventAddress, setEventAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [bookingId, setBookingId] = useState('')

  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [quoteDate, setQuoteDate] = useState('')
  const [quoteType, setQuoteType] = useState('')
  const [quotePax, setQuotePax] = useState('')
  const [quoteBudget, setQuoteBudget] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)

  const selectedAddOns = useMemo(() => {
    if (!service) return []
    return service.addOns.filter((a) => selectedAddOnIds.includes(a.id))
  }, [service, selectedAddOnIds])

  const basePrice = service?.price ?? 0
  const addonsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
  const totalAmount = basePrice + addonsTotal

  const openBookModal = () => {
    if (!service) return
    if (!selectedDate) return
    setBookStep(1)
    setBookModalOpen(true)
  }

  const handleConfirmAndPay = () => {
    const generated = `BK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    setBookingId(generated)
    setBookStep(4)
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] p-8">
        <div className="max-w-4xl mx-auto bg-white border border-[#ececec] rounded-xl p-8 text-center">
          <h1 className="text-[22px] font-bold text-[#0e1e3f]">Service not found</h1>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="mt-4 h-11 px-6 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const badge = getPricingBadgeConfig(service.pricingType)

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="activity" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search events..." />

        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
            <div className="flex items-center gap-2 text-[12px] mb-4">
              <button type="button" onClick={() => navigate('/events')} className="text-[#2563eb] hover:underline">
                Events
              </button>
              <ChevronDown className="size-4 text-[#878e9e] -rotate-90" />
              <span className="text-[#2563eb]">{service.category}</span>
              <ChevronDown className="size-4 text-[#878e9e] -rotate-90" />
              <span className="text-[#878e9e]">{service.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              <section>
                {/* Gallery */}
                <div className="bg-white rounded-xl border border-[#ececec] p-4">
                  <div className="h-[300px] rounded-lg overflow-hidden">
                    <img src={service.images[selectedImage]} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {service.images.slice(0, 4).map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className={`h-20 rounded-md overflow-hidden border ${selectedImage === idx ? 'border-[#2563eb]' : 'border-[#ececec]'}`}
                      >
                        <img src={img} alt={`${service.name}-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header */}
                <div className="mt-4 bg-white rounded-xl border border-[#ececec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-[22px] font-bold text-[#0e1e3f]">{service.name}</h1>
                      <p className="mt-1 text-[14px] text-[#878e9e]">{service.vendorName}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">{service.category}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-[#475569]">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-4 text-[#878e9e]" />{service.city}</span>
                    <span className="inline-flex items-center gap-1"><Star className="size-4 fill-[#FFCC47] text-[#FFCC47]" />{service.rating.toFixed(1)} ({service.ratingCount})</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-4 bg-white rounded-xl border border-[#ececec]">
                  <div className="border-b border-[#ececec] px-4">
                    <div className="flex gap-5 overflow-x-auto">
                      {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'included', label: "What's Included" },
                        { id: 'addons', label: 'Add-ons' },
                        { id: 'reviews', label: 'Reviews' },
                        { id: 'faqs', label: 'FAQs' },
                      ].map((t) => {
                        const isActive = tab === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id as DetailTab)}
                            className={`py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 ${
                              isActive ? 'text-[#2563eb] border-[#2563eb]' : 'text-[#64748b] border-transparent'
                            }`}
                          >
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-4">
                    {tab === 'overview' ? (
                      <div className="space-y-3 text-[14px] text-[#475569]">
                        <p>
                          This service is designed for corporate events with flexible setups, on-ground coordination, and quality assurance.
                        </p>
                        <p>
                          Supported event types: <span className="font-semibold text-[#0e1e3f]">{service.supportedEventTypes.join(', ')}</span>
                        </p>
                      </div>
                    ) : null}

                    {tab === 'included' ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {service.included.map((item) => (
                          <li key={item} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-[13px] text-[#0e1e3f]">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {tab === 'addons' ? (
                      <div className="space-y-2">
                        {service.addOns.map((addon) => {
                          const checked = selectedAddOnIds.includes(addon.id)
                          return (
                            <label key={addon.id} className="flex items-center justify-between rounded-lg border border-[#ececec] p-3 cursor-pointer">
                              <span className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setSelectedAddOnIds((prev) =>
                                      prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                                    )
                                  }
                                />
                                <span className="text-[13px] text-[#0e1e3f]">{addon.name}</span>
                              </span>
                              <span className="text-[13px] font-semibold text-[#2563eb]">{formatInr(addon.price)}</span>
                            </label>
                          )
                        })}
                      </div>
                    ) : null}

                    {tab === 'reviews' ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                          <p className="text-[13px] font-semibold text-[#0e1e3f]">Corporate Team — Verified Booking</p>
                          <p className="mt-1 text-[13px] text-[#475569]">Professional execution and great communication from the vendor.</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                          <p className="text-[13px] font-semibold text-[#0e1e3f]">People Ops Manager — Verified Booking</p>
                          <p className="mt-1 text-[13px] text-[#475569]">Setup was on time, and post-event support was excellent.</p>
                        </div>
                      </div>
                    ) : null}

                    {tab === 'faqs' ? (
                      <div className="space-y-2">
                        {service.faqs.map((f) => (
                          <div key={f.q} className="rounded-lg border border-[#ececec] p-3">
                            <p className="text-[13px] font-semibold text-[#0e1e3f]">{f.q}</p>
                            <p className="mt-1 text-[13px] text-[#475569]">{f.a}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Pricing panel */}
              <aside className="lg:sticky lg:top-4 h-fit">
                <div className="bg-white rounded-xl border border-[#ececec] p-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${badge.className}`}>{badge.label}</span>

                  <div className="mt-3">
                    {service.pricingType === 'transparent' ? (
                      <p className="text-[22px] font-bold text-[#2563eb]">{formatInr(service.price ?? 0)}</p>
                    ) : null}
                    {service.pricingType === 'offer_price' ? (
                      <div>
                        <p className="text-[12px] text-[#878e9e] line-through">{formatInr(service.originalPrice ?? 0)}</p>
                        <p className="text-[22px] font-bold text-[#2563eb]">{formatInr(service.price ?? 0)}</p>
                      </div>
                    ) : null}
                    {service.pricingType === 'request_for_price' ? (
                      <p className="text-[18px] font-bold text-[#0e1e3f]">Request a Quote</p>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Availability</label>
                      <div className="relative mt-1">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#0e1e3f]">Guest / pax count</label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min={1}
                          value={pax}
                          onChange={(e) => setPax(Math.max(1, Number(e.target.value || 1)))}
                          className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-[13px] text-[#475569] focus:outline-none focus:border-[#2563eb]"
                        />
                        <Users className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8] pointer-events-none" />
                      </div>
                    </div>

                    {service.pricingType === 'request_for_price' ? (
                      <button
                        type="button"
                        onClick={() => setQuoteModalOpen(true)}
                        className="w-full h-11 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700"
                      >
                        Request a Quote
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openBookModal}
                        className="w-full h-11 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {/* Booking flow modal */}
      {bookModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-[#ececec] max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#ececec]">
              <h3 className="text-[18px] font-bold text-[#0e1e3f]">Booking Confirmation Flow</h3>
              <p className="text-[12px] text-[#878e9e] mt-1">Step {bookStep} of 4</p>
            </div>

            <div className="p-4">
              {bookStep === 1 ? (
                <div>
                  <h4 className="text-[15px] font-semibold text-[#0e1e3f] mb-2">Review booking summary</h4>
                  <div className="rounded-lg border border-[#ececec] p-3 space-y-2 text-[13px]">
                    <p><span className="text-[#878e9e]">Service:</span> <span className="font-semibold text-[#0e1e3f]">{service.name}</span></p>
                    <p><span className="text-[#878e9e]">Date:</span> <span className="font-semibold text-[#0e1e3f]">{selectedDate || 'Not selected'}</span></p>
                    <p><span className="text-[#878e9e]">Pax:</span> <span className="font-semibold text-[#0e1e3f]">{pax}</span></p>
                    <p><span className="text-[#878e9e]">Add-ons:</span> <span className="font-semibold text-[#0e1e3f]">{selectedAddOns.length ? selectedAddOns.map((a) => a.name).join(', ') : 'None'}</span></p>
                    <p><span className="text-[#878e9e]">Total:</span> <span className="font-semibold text-[#2563eb]">{formatInr(totalAmount)}</span></p>
                  </div>
                </div>
              ) : null}

              {bookStep === 2 ? (
                <div className="space-y-3">
                  <h4 className="text-[15px] font-semibold text-[#0e1e3f]">Contact details</h4>
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                  <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                  <textarea value={eventAddress} onChange={(e) => setEventAddress(e.target.value)} placeholder="Event location/address" className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px]" rows={3} />
                </div>
              ) : null}

              {bookStep === 3 ? (
                <div className="space-y-3">
                  <h4 className="text-[15px] font-semibold text-[#0e1e3f]">Payment (mock)</h4>
                  <p className="text-[13px] text-[#475569]">Total: <span className="font-semibold text-[#2563eb]">{formatInr(totalAmount)}</span></p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['UPI', 'Bank Transfer', 'Credit'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`h-10 rounded-lg border text-[13px] font-semibold ${paymentMethod === method ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]' : 'border-[#e5e7eb] text-[#475569]'}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {bookStep === 4 ? (
                <div className="text-center py-6">
                  <h4 className="text-[18px] font-bold text-[#0e1e3f]">Booking Successful</h4>
                  <p className="mt-2 text-[13px] text-[#475569]">Booking ID: <span className="font-semibold">{bookingId}</span></p>
                  <p className="mt-1 text-[13px] text-[#878e9e]">Your booking has been confirmed and shared with the vendor.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setBookModalOpen(false)
                      navigate('/bookings')
                    }}
                    className="mt-4 h-11 px-6 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold"
                  >
                    View My Bookings
                  </button>
                </div>
              ) : null}
            </div>

            {bookStep < 4 ? (
              <div className="p-4 border-t border-[#ececec] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (bookStep === 1) {
                      setBookModalOpen(false)
                      return
                    }
                    setBookStep((s) => Math.max(1, s - 1))
                  }}
                  className="h-10 px-4 rounded-full border border-[#d1d5db] text-[13px] font-semibold text-[#475569]"
                >
                  {bookStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (bookStep === 2) {
                      if (!contactName || !contactEmail || !contactPhone || !companyName || !eventAddress) return
                    }
                    if (bookStep === 3) {
                      handleConfirmAndPay()
                      return
                    }
                    setBookStep((s) => Math.min(4, s + 1))
                  }}
                  className="h-10 px-5 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold"
                >
                  {bookStep === 3 ? 'Confirm & Pay' : 'Next'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Quote modal */}
      {quoteModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-xl bg-white rounded-xl border border-[#ececec]">
            <div className="p-4 border-b border-[#ececec]">
              <h3 className="text-[18px] font-bold text-[#0e1e3f]">Request a Quote</h3>
            </div>
            {!quoteSubmitted ? (
              <div className="p-4 space-y-3">
                <input value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} type="date" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                <input value={quoteType} onChange={(e) => setQuoteType(e.target.value)} placeholder="Event type" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                <input value={quotePax} onChange={(e) => setQuotePax(e.target.value)} placeholder="Pax count" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                <input value={quoteBudget} onChange={(e) => setQuoteBudget(e.target.value)} placeholder="Budget" className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px]" />
                <textarea value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)} placeholder="Notes" className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px]" rows={3} />
              </div>
            ) : (
              <div className="p-6 text-center">
                <h4 className="text-[16px] font-semibold text-[#0e1e3f]">Request submitted</h4>
                <p className="mt-1 text-[13px] text-[#878e9e]">Vendor will respond with a quote soon.</p>
              </div>
            )}
            <div className="p-4 border-t border-[#ececec] flex justify-end gap-2">
              <button type="button" onClick={() => { setQuoteModalOpen(false); setQuoteSubmitted(false) }} className="h-10 px-4 rounded-full border border-[#d1d5db] text-[13px] font-semibold text-[#475569]">Close</button>
              {!quoteSubmitted ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!quoteDate || !quoteType || !quotePax || !quoteBudget) return
                    setQuoteSubmitted(true)
                  }}
                  className="h-10 px-5 rounded-full bg-[#2563eb] text-white text-[13px] font-semibold"
                >
                  Submit Request
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


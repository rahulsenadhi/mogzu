import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import {
  DEFAULT_ENQUIRY_SERVICE_ID,
  OFFLINE_SERVICES,
  SERVICE_CATEGORIES,
  SERVICE_ENQUIRY_OPTIONS,
  servicesForCategory,
  type OfflineService,
} from '@/app/components/marketing/offlineServicesData'
import { ServiceEnquiryForm } from '@/app/components/marketing/ServiceEnquiryForm'
import { MANAGED_SERVICES_COPY } from '@/app/lib/marketingContent'
import { isValidServiceId } from '@/app/lib/landingNavigation'
import { scrollToServiceEnquiry, getMogzuWhatsAppUrl } from '@/app/lib/whatsapp'

type Props = {
  id?: string
  showEnquiryForm?: boolean
  compact?: boolean
  variant?: 'embedded' | 'page'
}

function ServiceCard({
  service,
  selected,
  onEnquire,
  featured = false,
}: {
  service: OfflineService
  selected: boolean
  onEnquire: (serviceId: string) => void
  featured?: boolean
}) {
  const Icon = service.icon

  return (
    <article
      className={`card-chunky group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white transition-all ${
        featured ? 'p-7 sm:p-8 lg:flex-row lg:items-stretch lg:gap-8' : 'p-6 sm:p-7'
      } ${selected ? 'ring-4 ring-offset-2 ring-[#0e1e3f]' : ''}`}
    >
      <div className={`${featured ? 'lg:flex lg:flex-1 lg:flex-col' : 'flex flex-col flex-1'}`}>
        <div className="mb-5 flex items-start gap-3">
          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl border-3 border-black shadow-[4px_4px_0_0_#111827] transition-transform group-hover:-translate-y-1 ${
              featured ? 'size-16' : 'size-14'
            }`}
            style={{ backgroundColor: service.accent }}
          >
            <Icon className={`${featured ? 'size-8' : 'size-7'} text-[#0e1e3f]`} aria-hidden />
          </div>
        </div>

        <p
          className={`mb-2 font-black leading-tight tracking-tight ${
            featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}
          style={{ color: service.accent }}
        >
          {service.tagline}
        </p>
        <h3 className={`mb-3 font-black tracking-tight text-[#0e1e3f] ${featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
          {service.title}
        </h3>
        <p className={`mb-4 flex-1 font-bold leading-relaxed text-gray-700 ${featured ? 'text-base sm:text-lg' : 'text-base'}`}>
          {service.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {service.examples.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border-2 border-gray-200 bg-[#FFFDF9] px-2.5 py-1 text-xs font-bold text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onEnquire(service.id)}
          className={`btn-chunky inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD100] px-5 py-3.5 text-base font-black text-black ${
            featured ? 'w-full lg:w-auto lg:self-start' : 'w-full sm:w-auto'
          }`}
          aria-pressed={selected}
        >
          {selected ? MANAGED_SERVICES_COPY.ctas.cardSelected : MANAGED_SERVICES_COPY.ctas.cardEnquire}
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    </article>
  )
}

export function OfflineServicesSection({
  id = 'services',
  showEnquiryForm = true,
  compact = false,
  variant = 'embedded',
}: Props) {
  const [searchParams] = useSearchParams()
  const serviceFromUrl = searchParams.get('service')
  const validServiceIds = SERVICE_ENQUIRY_OPTIONS.map((o) => o.value)

  const [selectedServiceId, setSelectedServiceId] = useState(() =>
    isValidServiceId(serviceFromUrl, validServiceIds) ? serviceFromUrl : DEFAULT_ENQUIRY_SERVICE_ID,
  )

  useEffect(() => {
    if (isValidServiceId(serviceFromUrl, validServiceIds)) {
      setSelectedServiceId(serviceFromUrl)
    }
  }, [serviceFromUrl])

  const heroCopy =
    variant === 'page' ? MANAGED_SERVICES_COPY.hero.page : MANAGED_SERVICES_COPY.hero.embedded
  const whatsappUrl = getMogzuWhatsAppUrl()

  const handleEnquire = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    window.requestAnimationFrame(() => {
      scrollToServiceEnquiry()
    })
  }

  const featured = OFFLINE_SERVICES.filter((s) => s.featured)
  const featuredIds = new Set(featured.map((s) => s.id))

  return (
    <section
      id={id}
      className="scroll-mt-28 border-y-3 border-black bg-[#FFFDF9] pb-24 sm:pb-28"
      aria-labelledby="offline-services-heading"
    >
      <div className="border-b-3 border-black bg-[#0e1e3f] py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className={`max-w-4xl ${variant === 'embedded' ? 'mx-auto text-center' : ''}`}>
            <h2
              id="offline-services-heading"
              className={`font-black tracking-tighter text-white text-balance ${
                compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-[3.25rem]'
              }`}
            >
              {heroCopy.headline}
            </h2>

            <p
              className={`mt-4 max-w-3xl text-lg font-bold leading-relaxed text-gray-200 md:text-xl ${
                variant === 'embedded' ? 'mx-auto' : ''
              }`}
            >
              {heroCopy.subhead}
            </p>

            <ul
              className={`mt-8 grid gap-3 sm:grid-cols-3 ${variant === 'embedded' ? '' : ''}`}
              aria-label="Why brief Mogzu Ops"
            >
              {MANAGED_SERVICES_COPY.trustSignals.map((signal) => (
                <li
                  key={signal.label}
                  className="rounded-2xl border-2 border-white/15 bg-white/5 p-4 text-left"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-[#15D39D]" aria-hidden />
                    <span className="text-sm font-black text-white">{signal.label}</span>
                  </div>
                  <p className="text-sm font-bold leading-snug text-gray-300">{signal.detail}</p>
                </li>
              ))}
            </ul>

            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row sm:items-center ${
                variant === 'embedded' ? 'sm:justify-center' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => scrollToServiceEnquiry()}
                className="btn-chunky inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD100] px-6 py-3.5 text-base font-black text-[#0e1e3f]"
              >
                {MANAGED_SERVICES_COPY.ctas.primary}
                <ArrowRight className="size-5" aria-hidden />
              </button>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-chunky inline-flex items-center justify-center rounded-xl border-3 border-black bg-white px-6 py-3.5 text-base font-black text-[#0e1e3f]"
                >
                  {MANAGED_SERVICES_COPY.ctas.secondaryWhatsapp}
                </a>
              ) : null}
              {variant === 'embedded' ? (
                <Link
                  to="/services"
                  className="text-center text-sm font-black text-[#15D39D] underline-offset-4 hover:underline sm:text-base"
                >
                  {MANAGED_SERVICES_COPY.ctas.viewAll}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-12 rounded-[2rem] border-3 border-black bg-[#FFD100]/30 p-6 sm:p-8">
          <p className="mb-4 text-lg font-black text-[#0e1e3f]">{MANAGED_SERVICES_COPY.audienceHeading}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {MANAGED_SERVICES_COPY.audience.map((row) => (
              <div key={row.label} className="rounded-xl border-2 border-black bg-white p-4">
                <p className="text-base font-black text-[#0e1e3f]">{row.label}</p>
                <p className="mt-1 text-sm font-bold text-gray-600">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-3xl font-black tracking-tight text-[#0e1e3f] sm:text-4xl">
            {MANAGED_SERVICES_COPY.catalogueIntro.title}
          </h3>
          <p className="mt-2 max-w-2xl text-lg font-bold text-gray-600">
            {MANAGED_SERVICES_COPY.catalogueIntro.subtitle}
          </p>
        </div>

        <div className={`grid gap-12 lg:gap-16 ${showEnquiryForm ? 'lg:grid-cols-12' : ''}`}>
          <div className={showEnquiryForm ? 'lg:col-span-7' : ''}>
            {featured.length > 0 ? (
              <div className="mb-10 grid grid-cols-1 gap-6">
                {featured.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedServiceId === service.id}
                    onEnquire={handleEnquire}
                    featured
                  />
                ))}
              </div>
            ) : null}

            {SERVICE_CATEGORIES.map((category) => {
              const services = servicesForCategory(category.id).filter((s) => !featuredIds.has(s.id))
              if (services.length === 0) return null

              return (
                <div key={category.id} className="mb-10 last:mb-0">
                  <h4 className="mb-5 border-b-2 border-black pb-2 text-lg font-black text-[#0e1e3f]">
                    {category.label}
                  </h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        selected={selectedServiceId === service.id}
                        onEnquire={handleEnquire}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="mt-14 rounded-[2rem] border-3 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0_0_#111827]">
              <h3 className="mb-2 text-2xl font-black text-[#0e1e3f]">{MANAGED_SERVICES_COPY.process.title}</h3>
              <p className="mb-8 text-base font-bold text-gray-700">{MANAGED_SERVICES_COPY.process.subtitle}</p>
              <ol className="grid gap-6 md:grid-cols-3">
                {MANAGED_SERVICES_COPY.process.steps.map((item) => (
                  <li key={item.step} className="flex flex-col">
                    <span
                      className="mb-3 inline-flex w-fit rounded-full border-3 border-black px-3 py-1 text-sm font-black text-[#0e1e3f]"
                      style={{ backgroundColor: item.accent }}
                    >
                      Step {item.step}
                    </span>
                    <h4 className="mb-2 text-lg font-black text-[#0e1e3f]">{item.title}</h4>
                    <p className="text-sm font-bold leading-relaxed text-gray-700">{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {showEnquiryForm ? (
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <ServiceEnquiryForm
                  initialServiceId={selectedServiceId}
                  onServiceChange={setSelectedServiceId}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

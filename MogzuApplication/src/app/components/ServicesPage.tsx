import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { LandingMarketingNav } from '@/app/components/marketing/LandingMarketingNav'
import { MarketingChunkyStyles } from '@/app/components/marketing/MarketingChunkyStyles'
import { MARKETING_PAGE_SHELL } from '@/app/components/marketing/marketingStyles'
import { OfflineServicesSection } from '@/app/components/marketing/OfflineServicesSection'
import { FloatingContactActions } from '@/app/components/marketing/FloatingContactActions'
import { scrollToServiceEnquiry } from '@/app/lib/whatsapp'

export default function ServicesPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash !== 'service-enquiry' && hash !== 'services') return
    const el = document.getElementById(hash)
    if (el) {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }
    if (hash === 'service-enquiry') {
      scrollToServiceEnquiry()
    }
  }, [location.hash, location.pathname, location.search])

  return (
    <div className={MARKETING_PAGE_SHELL}>
      <MarketingChunkyStyles />
      <LandingMarketingNav onBookDemo={() => navigate('/?demo=1')} />

      <main className="pt-24 sm:pt-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-[#15D39D] font-bold transition-colors"
          >
            <ArrowLeft className="size-5 mr-2" aria-hidden />
            Back to Home
          </Link>
        </div>

        <OfflineServicesSection id="services" showEnquiryForm variant="page" />
      </main>

      <FloatingContactActions />
    </div>
  )
}

import { Link } from 'react-router'
import { ArrowLeft, Building2 } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useMarketingCms } from '@/app/lib/useMarketingCms'
import { ABOUT_COPY } from '@/app/lib/marketingContent'

export default function AboutPage() {
  const { block: cms, fromCms } = useMarketingCms('about-mogzu')

  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-[#FFD100]/30 selection:text-[#0e1e3f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#FFD100] font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link to="/" className="inline-flex" aria-label="Mogzu home">
            <MogzuLogo className="h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[280px]" />
          </Link>
          <Link to="/services" className="text-base font-bold text-[#0e1e3f] hover:text-[#15D39D] hover:underline transition-colors">
            {ABOUT_COPY.servicesLink}
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-[24px] bg-[#15D39D] flex items-center justify-center shadow-[0_8px_0_#0e9a75] border-3 border-black">
            <Building2 className="w-12 h-12 text-[#0e1e3f]" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-[#0e1e3f] tracking-tighter mb-2">About Mogzu</h1>
            <p className="text-2xl text-gray-500 font-medium">
              {fromCms && cms?.title ? cms.title : 'Events, gifts, and spaces — made simple.'}
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-4xl text-gray-600 mb-16">
          <p className="text-xl leading-relaxed font-medium">
            {fromCms && cms?.body ? cms.body : ABOUT_COPY.defaultBody}
          </p>
        </div>

        <Link
          to="/services"
          className="inline-flex items-center justify-center rounded-xl border-3 border-black bg-[#FFD100] px-8 py-4 text-lg font-black text-black shadow-[4px_4px_0_0_#111827] hover:-translate-y-0.5 transition-transform"
        >
          {ABOUT_COPY.cta}
        </Link>
      </div>
    </div>
  )
}

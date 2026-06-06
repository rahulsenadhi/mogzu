import { MessageCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { getMogzuWhatsAppUrl, scrollToServiceEnquiry } from '@/app/lib/whatsapp'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function FloatingContactActions() {
  const location = useLocation()
  const navigate = useNavigate()
  const whatsappUrl = getMogzuWhatsAppUrl()

  const handleEnquireClick = () => {
    if (location.pathname === '/' || location.pathname === '/services') {
      if (scrollToServiceEnquiry()) return
    }
    navigate('/services#service-enquiry')
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 motion-reduce:transition-none sm:bottom-6 sm:right-6"
      aria-label="Quick contact actions"
    >
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-chunky flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-3 border-black bg-white px-4 text-[#25D366] shadow-[4px_4px_0_0_#111827] sm:size-14"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="size-6 sm:size-7" />
          <span className="sr-only sm:not-sr-only sm:text-sm sm:font-black sm:text-[#0e1e3f]">WhatsApp</span>
        </a>
      ) : null}

      <button
        type="button"
        onClick={handleEnquireClick}
        className="btn-chunky flex min-h-11 items-center justify-center gap-2 rounded-full border-3 border-black bg-[#15D39D] px-4 text-[#0e1e3f] shadow-[4px_4px_0_0_#111827] sm:min-w-[7.5rem]"
        aria-label="Open enquiry form"
      >
        <MessageCircle className="size-6 shrink-0 sm:size-7" aria-hidden />
        <span className="text-sm font-black">Enquire</span>
      </button>

      {location.pathname !== '/services' ? (
        <Link
          to="/services"
          className="sr-only focus:not-sr-only focus:absolute focus:bottom-full focus:right-0 focus:mb-2 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:border-2 focus:border-black"
        >
          View managed services
        </Link>
      ) : null}
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'

type Props = {
  onBookDemo: () => void
}

const CENTER_LINKS = [
  { label: 'How it Works', path: '/#how-it-works', color: 'hover:text-[#15D39D]' },
  { label: 'Services', path: '/services', color: 'hover:text-[#FF5E00]' },
  { label: 'About Mogzu', path: '/about', color: 'hover:text-[#9B51E0]' },
  { label: 'Partner benefits', path: '/vendor-benefits', color: 'hover:text-[#15D39D]' },
] as const

export function LandingMarketingNav({ onBookDemo }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="fixed w-full bg-[#FFFDF9]/95 backdrop-blur-xl z-50 border-b-3 border-black transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" onClick={closeMobile}>
              <MogzuLogo className="h-14 w-auto max-w-[min(100%,280px)]" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {CENTER_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`text-[#0e1e3f] ${link.color} text-base xl:text-lg font-black tracking-tight transition-colors whitespace-nowrap`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 shrink-0">
            <Link
              to="/#benefits"
              className="hidden sm:inline text-[#0e1e3f] hover:text-[#EE2A7B] text-sm sm:text-lg font-black tracking-tight transition-colors whitespace-nowrap"
            >
              Benefits
            </Link>
            <Link
              to="/why-mogzu"
              className="hidden md:inline text-[#0e1e3f] hover:text-[#FF5E00] text-sm sm:text-lg font-black tracking-tight transition-colors whitespace-nowrap"
            >
              Why Mogzu
            </Link>
            <Link
              to="/login"
              className="hidden sm:inline text-[#0e1e3f] hover:text-[#9B51E0] text-sm sm:text-lg font-black tracking-tight transition-colors"
            >
              Log In
            </Link>
            <button
              type="button"
              onClick={() => {
                closeMobile()
                onBookDemo()
              }}
              className="btn-chunky hidden sm:inline-flex items-center justify-center px-4 py-2.5 sm:px-8 sm:py-3.5 text-sm sm:text-lg font-black rounded-xl text-black bg-[#FFD100] whitespace-nowrap"
            >
              Book a Demo
            </button>

            <button
              type="button"
              className="lg:hidden flex size-11 items-center justify-center rounded-xl border-3 border-black bg-white text-[#0e1e3f]"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            id="landing-mobile-nav"
            className="lg:hidden border-t-3 border-black pb-6 pt-4"
          >
            <div className="flex flex-col gap-3">
              {CENTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={closeMobile}
                  className={`text-[#0e1e3f] ${link.color} text-lg font-black tracking-tight py-2`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/#benefits"
                onClick={closeMobile}
                className="text-[#0e1e3f] hover:text-[#EE2A7B] text-lg font-black tracking-tight py-2"
              >
                Benefits
              </Link>
              <Link
                to="/why-mogzu"
                onClick={closeMobile}
                className="text-[#0e1e3f] hover:text-[#FF5E00] text-lg font-black tracking-tight py-2"
              >
                Why Mogzu
              </Link>
              <Link
                to="/login"
                onClick={closeMobile}
                className="text-[#0e1e3f] hover:text-[#9B51E0] text-lg font-black tracking-tight py-2"
              >
                Log In
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMobile()
                  onBookDemo()
                }}
                className="btn-chunky mt-2 w-full py-3 text-lg font-black rounded-xl text-black bg-[#FFD100]"
              >
                Book a Demo
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  )
}

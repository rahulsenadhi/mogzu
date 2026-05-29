import { useNavigate } from "react-router";
import { Users, CreditCard, Sliders, ArrowRight } from "lucide-react";
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useMarketingCms } from '@/app/lib/useMarketingCms';

export default function VendorBenefitsPage() {
  const navigate = useNavigate();
  const { block: cms, fromCms } = useMarketingCms('vendor-benefits');

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-foreground selection:bg-blue-100 selection:text-slate-900 overflow-x-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Simple Header — Step 11/12: corporate nav spacing (max-w-7xl, px-4 sm:px-6 lg:px-8), border-gray-200, h-14 */}
      <nav className="fixed w-full bg-background/95 backdrop-blur-xl z-50 border-b border-gray-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
              aria-label="Mogzu home"
            >
              <MogzuLogo className="h-11 w-auto max-w-[200px] sm:max-w-[240px]" />
            </button>
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm sm:text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Log In
              </button>
              <Button
                type="button"
                size="lg"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:px-6 sm:py-2.5 sm:text-base"
                onClick={() => navigate('/signup/vendor')}
              >
                Partner with us
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section — Step 11/12: yellow-400 (Tailwind) vs #FFD100; heading scale text-4xl…font-bold like corporate; px-4 sm:px-6 lg:px-8 */}
      <section className="relative bg-yellow-400 pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-28 overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-32 h-32 rounded-full border border-gray-900 bg-rose-500 shadow-md rotate-12" />
          <div className="absolute bottom-[10%] left-[10%] w-24 h-24 rounded-2xl border border-gray-900 bg-emerald-500 shadow-md -rotate-12" />
          <div className="absolute top-[60%] right-[25%] w-16 h-16 rounded-full border border-gray-900 bg-violet-500 shadow-md" />
          <div className="absolute top-[10%] left-[20%] w-20 h-8 rounded-full border border-gray-900 bg-orange-500 shadow-md rotate-45" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-gray-900 shadow-sm sm:mb-10">
            The Vendor OS
          </div>
          {fromCms && cms?.title ? (
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:mb-8">
              {cms.title}
            </h1>
          ) : (
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:mb-8">
              Grow Your Business with <br />
              <span className="mt-3 inline-block rotate-1 rounded-lg border border-gray-900 bg-white px-4 py-1 shadow-md">
                Mogzu Network
              </span>
            </h1>
          )}
          <p className="mx-auto mb-10 max-w-3xl text-base font-semibold leading-relaxed text-gray-700 sm:text-lg md:text-xl lg:mb-12">
            {fromCms && cms?.body
              ? cms.body
              : 'Join our curated network of top-tier Event Providers, Venue In-charges, and Corporate Gifting suppliers.'}
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="h-auto rounded-lg bg-blue-600 px-10 py-4 text-lg font-semibold text-white hover:bg-blue-700 sm:px-12 sm:py-5 sm:text-xl"
              onClick={() => navigate('/signup/vendor')}
            >
              Partner with us
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid — Step 11/12: Card component + p-6/p-8 padding; gap-8; border-gray-200 */}
      <section className="relative z-10 border-b border-gray-200 bg-stone-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Why Partner with Mogzu?
            </h2>
            <p className="text-lg font-semibold text-gray-600 md:text-xl">Unfair advantages for premium vendors.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="gap-0 border-gray-200 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-start p-8 sm:p-10">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-900 bg-emerald-500 shadow-sm">
                  <Users className="h-10 w-10 text-gray-900" />
                </div>
                <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                  Access Premium Clients
                </h3>
                <p className="text-base font-semibold leading-relaxed text-gray-600 md:text-lg">
                  Connect directly with enterprise HRs and Admins. Bypass the middleman and build long-term relationships with corporate decision-makers.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 border-rose-600 bg-rose-500 text-gray-900 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-start p-8 sm:p-10">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-900 bg-white shadow-sm">
                  <CreditCard className="h-10 w-10 text-rose-600" />
                </div>
                <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                  Streamlined Booking & Payments
                </h3>
                <p className="text-base font-semibold leading-relaxed text-gray-900 opacity-90 md:text-lg">
                  Automated PO/WO processing and guaranteed payment cycles. Spend less time chasing invoices and more time delivering great experiences.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 border-gray-200 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-start p-8 sm:p-10">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-900 bg-violet-600 shadow-sm">
                  <Sliders className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                  Dynamic Pricing Control
                </h3>
                <p className="text-base font-semibold leading-relaxed text-gray-600 md:text-lg">
                  Accept 'Offer Prices' or set fixed rates directly from your dashboard. Keep full control over your margins while staying competitive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted By — Step 11/12: gap-6 sm:gap-10 preserved; slate/gray borders */}
      <section className="border-b border-gray-200 bg-stone-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-lg font-semibold uppercase tracking-widest text-gray-900 sm:mb-12 md:text-xl">
            Trusted by preferred corporate partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="cursor-default rounded-lg border border-gray-200 bg-card px-8 py-4 text-2xl font-bold text-gray-900 shadow-sm md:text-3xl">
              Acme Corp
            </div>
            <div className="cursor-default rounded-lg border border-gray-200 bg-card px-8 py-4 text-2xl font-bold tracking-tighter text-gray-900 shadow-sm md:text-3xl">
              GLOBAL<span className="font-normal text-rose-600">INC</span>
            </div>
            <div className="cursor-default rounded-lg border border-gray-200 bg-emerald-500 px-8 py-4 text-2xl font-bold italic text-gray-900 shadow-sm md:text-3xl">
              Vanguard
            </div>
            <div className="cursor-default rounded-lg border border-gray-200 bg-card px-8 py-4 text-2xl font-bold text-gray-900 shadow-sm md:text-3xl">
              TechFlow
            </div>
            <div className="cursor-default rounded-lg border border-gray-200 bg-yellow-400 px-8 py-4 text-2xl font-bold tracking-widest text-gray-900 shadow-sm md:text-3xl">
              NEXUS
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial — Step 11/12: bg-slate-900; heading text-2xl md:text-3xl font-bold */}
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-[10%] h-24 w-24 rounded-full bg-rose-500 opacity-20 blur-xl" />
          <div className="absolute bottom-[10%] right-[10%] h-40 w-40 rounded-full bg-emerald-500 opacity-20 blur-xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-10 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-orange-500 shadow-md sm:mb-12">
            <svg width="40" height="40" viewBox="0 0 24 24" className="text-gray-900" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
            </svg>
          </div>
          <h3 className="mb-10 text-2xl font-bold leading-tight tracking-tight text-white sm:mb-12 md:text-3xl lg:text-4xl">
            "Since joining Mogzu's Vendor Network, our inbound corporate requests have tripled. The automated PO system means we get paid on time, every time, without chasing HR departments."
          </h3>
          <div className="flex items-center justify-center gap-6">
            <div className="h-20 w-20 rotate-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-md">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3MjE4MzE5ODN8MA&ixlib=rb-4.1.0&q=80&w=200" alt="Vendor Partner" className="h-full w-full object-cover" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-white md:text-2xl">David Chen</p>
              <p className="text-base font-semibold text-gray-400 md:text-lg">Director of Sales, Horizon Venues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Big Bold CTA Footer — Step 11/12: blue-600 strip (corporate primary); Button for CTA */}
      <section className="relative overflow-hidden border-y border-gray-200 bg-blue-600 py-20 text-center sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-marquee flex items-center gap-10 whitespace-nowrap text-7xl font-bold text-white/20 sm:text-8xl md:text-9xl">
            VENDORS VENDORS VENDORS VENDORS VENDORS VENDORS VENDORS
          </div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-white sm:mb-8 md:text-4xl lg:text-5xl">
            Ready to receive <br /> corporate leads?
          </h2>
          <p className="mb-10 text-lg font-semibold text-white sm:mb-12 sm:text-xl">
            Stop chasing invoices and start delivering great experiences.
          </p>
          <Button
            type="button"
            size="lg"
            className="h-auto rounded-lg bg-yellow-400 px-12 py-5 text-lg font-semibold text-gray-900 hover:bg-yellow-500 sm:py-6 sm:text-xl"
            onClick={() => navigate('/signup/vendor')}
          >
            Partner with us
          </Button>
        </div>
      </section>

      {/* Simple Footer — Step 11/12: corporate-style footer text scale */}
      <footer className="bg-white py-8 text-center sm:py-10">
        <p className="text-sm font-semibold text-gray-500 sm:text-base">
          © {new Date().getFullYear()} Mogzu. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

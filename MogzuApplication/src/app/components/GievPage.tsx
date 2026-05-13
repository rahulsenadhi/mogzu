import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Gift, 
  Calendar, 
  MapPin, 
  Package, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Truck,
  Briefcase,
  Globe,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import {
  CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT,
  loadActiveCorporatePromotionsForSector,
} from '@/app/lib/corporateAdminPromotionsStorage';

const IMAGES = {
  giftBox: "https://images.unsplash.com/photo-1760602672748-6a570286ce73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY29ycG9yYXRlJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzM4NTEwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  swagKit: "https://images.unsplash.com/photo-1523634540939-0be5fba32c8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBkZXNrJTIwYWNjZXNzb3JpZXN8ZW58MXx8fHwxNzczNzc3NDU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  eventHall: "https://images.unsplash.com/photo-1727931287903-b24dd8011a56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjb3Jwb3JhdGUlMjBldmVudCUyMGNvbmZlcmVuY2V8ZW58MXx8fHwxNzczODUxNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  outdoorRetreat: "https://images.unsplash.com/photo-1773006088990-978c8d32b9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwdGVhbSUyMGFjdGl2aXR5fGVufDF8fHx8MTc3Mzg1MTc1OXww&ixlib=rb-4.1.0&q=80&w=1080"
};

export default function GievPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [promoTick, setPromoTick] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const bump = () => setPromoTick((n) => n + 1);
    window.addEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, bump);
    return () => window.removeEventListener(CORPORATE_ADMIN_PROMOTIONS_UPDATED_EVENT, bump);
  }, []);

  const giftingPromos = useMemo(
    () => loadActiveCorporatePromotionsForSector('Gifting'),
    [promoTick]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] selection:bg-pink-100 selection:text-pink-900 overflow-x-hidden text-[#0F172A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Corporate Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-6">
              <Link to="/" className="inline-flex grayscale opacity-80">
                <MogzuLogo className="h-8 w-auto max-w-[120px]" />
              </Link>
              <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
              <span className="text-sm font-semibold text-pink-600 hidden md:flex items-center gap-2">
                <Gift className="w-4 h-4" /> GiEv
              </span>
            </div>
            
            {/* Center Links */}
            <div className="hidden md:flex items-center space-x-10">
              {[
                { label: 'GiEv', path: '/giev', active: true },
                { label: 'D Space', path: '/dspace' },
                { label: 'Hey Genie', path: '/heygenie' },
                { label: 'Why Mogzu', path: '/why-mogzu' }
              ].map((link) => (
                <Link key={link.label} to={link.path} className={`text-sm font-medium transition-colors ${link.active ? 'text-pink-600' : 'text-gray-600 hover:text-[#0F172A]'}`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Links */}
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="text-sm font-medium text-gray-600 hover:text-[#0F172A] transition-colors hidden sm:block"
              >
                Log In
              </Link>
              <Link
                to="/signup/corporate"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#0F172A] hover:bg-gray-800 transition-colors shadow-sm"
              >
                Start Planning
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Corporate Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-pink-50/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-xs font-semibold tracking-wide uppercase mb-8">
            <Gift className="w-3.5 h-3.5" />
            GiEv Module
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold text-[#0F172A] tracking-tight leading-[1.1] mb-6">
            Curated Gifts. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Unforgettable Events.</span>
          </h1>
          
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            The premium corporate operating system for sending bespoke employee hampers and orchestrating massive end-of-year offsites seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate('/gifting-shop')}
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors shadow-sm"
            >
              Explore Gift Catalog
            </button>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-lg text-[#0F172A] bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Plan an Offsite
            </button>
          </div>
        </div>
      </section>

      {giftingPromos.length > 0 ? (
        <section className="border-y border-pink-100 bg-pink-50/60 py-10">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-800 mb-4">
              Live promotions (Admin → Paid Promotion · Gifting)
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {giftingPromos.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm text-left"
                >
                  {p.image ? (
                    <img src={p.image} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] line-clamp-2">{p.title}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3">{p.subtitle}</p>
                    <p className="text-[11px] text-pink-700 mt-2 font-medium">{p.vendorName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Two Pillars Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Gifting Pillar */}
            <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center mb-8 border border-pink-100">
                <Package className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Corporate Gifting</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                From premium Diwali hampers to customized employee onboarding kits. Browse a globally sourced catalog, customize with your branding, and let our automated fulfillment handle door-to-door delivery.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 mr-3" /> Branded Welcome Swag
                </li>
                <li className="flex items-center text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 mr-3" /> Festival & Milestone Hampers
                </li>
                <li className="flex items-center text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 mr-3" /> Global Door-to-Door Fulfillment
                </li>
              </ul>
            </div>

            {/* Events Pillar */}
            <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-8 border border-indigo-100">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Event Orchestration</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Eliminate the coordination chaos. Book venues, catering, transportation, and artists in one unified corporate cart. Let our experts handle the execution while you focus on culture.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" /> End-to-end Offsite Planning
                </li>
                <li className="flex items-center text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" /> Verified Corporate Venues
                </li>
                <li className="flex items-center text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" /> Consolidated GST Invoicing
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Catalog Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Trending in GiEv</h2>
              <p className="text-gray-500 font-medium">Curated selections frequently booked by top teams.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/gifting-shop')}
              className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-2 group"
            >
              Browse Full Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gift Item 1 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/gifting-shop')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/gifting-shop');
                }
              }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative bg-gray-50 flex items-center justify-center">
                <img src={IMAGES.giftBox} alt="Gift Box" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-[#0F172A] flex items-center gap-1 uppercase tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-pink-500" /> Hampers
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0F172A] mb-2 truncate">Executive Festive Kit</h3>
                <p className="text-sm text-gray-500 mb-4">Artisan chocolates, premium tech, and custom branding.</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">From </span>
                    <span className="font-bold text-[#0F172A]">₹4,500</span>
                    <span className="text-gray-500">/box</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Item 2 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/gifting-shop')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/gifting-shop');
                }
              }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative bg-gray-50 flex items-center justify-center">
                <img src={IMAGES.swagKit} alt="Swag Kit" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-[#0F172A] flex items-center gap-1 uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5 text-pink-500" /> Swag
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0F172A] mb-2 truncate">Onboarding Essential V2</h3>
                <p className="text-sm text-gray-500 mb-4">Notebook, sipper, premium pen, and welcome letter.</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">From </span>
                    <span className="font-bold text-[#0F172A]">₹2,100</span>
                    <span className="text-gray-500">/box</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Item 1 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/events')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/events');
                }
              }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={IMAGES.eventHall} alt="Event Hall" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-[#0F172A] flex items-center gap-1 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Town Hall
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0F172A] mb-2 truncate">Grand Corporate Gala</h3>
                <p className="text-sm text-gray-500 mb-4">500+ Pax • Premium venue sourcing and AV setup.</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">From </span>
                    <span className="font-bold text-[#0F172A]">₹15,000</span>
                    <span className="text-gray-500">/pax</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Item 2 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/events')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/events');
                }
              }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={IMAGES.outdoorRetreat} alt="Outdoor Retreat" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-[#0F172A] flex items-center gap-1 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Retreat
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0F172A] mb-2 truncate">Wilderness Team Build</h3>
                <p className="text-sm text-gray-500 mb-4">50-100 Pax • Curated activities and luxury stay.</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">From </span>
                    <span className="font-bold text-[#0F172A]">₹22,000</span>
                    <span className="text-gray-500">/pax</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Flow */}
      <section className="py-24 bg-[#0F172A] text-white overflow-hidden relative">
        {/* Soft abstract shapes in background */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How GiEv Works</h2>
            <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
              We've replaced fractured email chains with a clean, unified workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-lg font-bold text-gray-300">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Curate & Build</h3>
              <p className="text-sm text-gray-400">Select gifts or venue setups from our verified marketplace.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-lg font-bold text-gray-300">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Internal Approval</h3>
              <p className="text-sm text-gray-400">Check out instantly. Automatic routing to L1/L2 budget approvers.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-lg font-bold text-gray-300">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Flawless Fulfillment</h3>
              <p className="text-sm text-gray-400">Mogzu handles shipping tracking or event vendor coordination.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-lg font-bold text-gray-300">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2">One Invoice</h3>
              <p className="text-sm text-gray-400">You receive a single, fully compliant GST invoice for everything.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate CTA */}
      <section className="py-24 bg-[#F8FAFC] border-t border-gray-200 text-center">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#0F172A] mb-6">
            Execute your next initiative perfectly.
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            Let GiEv handle the messy logistics so you can focus on building team culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup/corporate"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors shadow-sm"
            >
              Start Planning with GiEv
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-lg text-[#0F172A] bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <Link to="/" className="inline-flex grayscale opacity-70">
              <MogzuLogo className="h-8 w-auto max-w-[120px]" />
            </Link>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
              <Link to="/giev" className="text-[#0F172A] font-semibold">GiEv</Link>
              <Link to="/dspace" className="hover:text-[#0F172A] transition-colors">D Space</Link>
              <Link to="/heygenie" className="hover:text-[#0F172A] transition-colors">Hey Genie</Link>
              <Link to="/why-mogzu" className="hover:text-[#0F172A] transition-colors">Why Mogzu</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 border-t border-gray-200 pt-8">
            <p>© 2026 Mogzu Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

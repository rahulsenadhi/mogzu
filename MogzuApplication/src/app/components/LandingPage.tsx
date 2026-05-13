import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  Search, 
  MapPin, 
  Users, 
  Gift, 
  Calendar, 
  Building2,
  ArrowRight,
  PlayCircle,
  Building,
  Briefcase,
  Zap,
  Globe,
  Sparkles,
  ChevronDown,
  Star,
  Coffee,
  Plane,
  Compass,
  ShoppingCart
} from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

const IMAGES = {
  teamBuilding: "https://images.unsplash.com/photo-1770240090990-0653176ee415?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwYnVpbGRpbmclMjBhY3Rpdml0eSUyMG91dGRvb3J8ZW58MXx8fHwxNzczODEwNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  giftBox: "https://images.unsplash.com/photo-1760602672748-6a570286ce73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY29ycG9yYXRlJTIwZ2lmdCUyMGJveHxlbnwxfHx8fDE3NzM4NTEwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  workspace: "https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZXxlbnwxfHx8fDE3NzM4NTEwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  resort: "https://images.unsplash.com/photo-1690199827629-552c41f6450f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNvcnQlMjBleHRlcmlvcnxlbnwxfHx8fDE3NzM4NTExMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
};

const FAQItem = ({ question, answer, color }: { question: string, answer: string, color: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`card-chunky bg-white rounded-2xl mb-6 transition-all duration-300`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-black text-xl text-[#0e1e3f] p-6"
      >
        {question}
        <div className={`w-12 h-12 border-3 border-black rounded-xl flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : 'bg-white text-black'}`} style={{ backgroundColor: isOpen ? color : undefined }}>
          <ChevronDown className="w-8 h-8" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out px-6 ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="w-full h-1 bg-black rounded-full mb-6" style={{ backgroundColor: color }} />
        <p className="text-xl font-bold text-gray-700 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'venues' | 'gifting' | 'experiences'>('venues');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormStatus, setDemoFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (location.hash !== '#partner-with-mogzu') return;
    const el = document.getElementById('partner-with-mogzu');
    if (el) {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash, location.pathname]);

  const explorePathForTab = () => {
    if (activeTab === 'gifting') return '/gifting-shop';
    if (activeTab === 'experiences') return '/dashboard/activities';
    return '/spacex';
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoFormStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setDemoFormStatus('success');
      // In a real app, this would redirect or send an email
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-['Plus_Jakarta_Sans',_sans-serif] selection:bg-[#EE2A7B]/30 selection:text-[#0e1e3f] overflow-x-hidden">
      {/* Demo Booking Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDemoModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl card-chunky p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center font-black text-lg hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-black"
            >
              ×
            </button>

            {demoFormStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-[#15D39D] rounded-full mx-auto mb-5 flex items-center justify-center border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-black mb-3">You're on the list!</h3>
                <p className="text-base font-bold text-gray-600 mb-6">
                  Our team will contact you shortly to schedule your personalized demo and set up your portal access.
                </p>
                <button 
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    setTimeout(() => setDemoFormStatus('idle'), 300);
                  }}
                  className="btn-chunky w-full py-3 text-lg font-black rounded-xl text-black bg-[#FFD100]"
                >
                  Got it, thanks!
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-black mb-2 leading-tight">Book a Demo</h3>
                  <p className="text-base font-bold text-gray-600">
                    See how Mogzu can streamline your corporate operations.
                  </p>
                </div>
                
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">Work Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="you@company.com"
                      className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky transition-colors focus:outline-none focus:border-[#EE2A7B]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">First Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Jane"
                        className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky transition-colors focus:outline-none focus:border-[#EE2A7B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">Last Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Doe"
                        className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky transition-colors focus:outline-none focus:border-[#EE2A7B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">Company Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Acme Corp"
                      className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky transition-colors focus:outline-none focus:border-[#EE2A7B]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white text-base font-bold px-4 py-3 rounded-xl input-chunky transition-colors focus:outline-none focus:border-[#EE2A7B]"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={demoFormStatus === 'submitting'}
                    className={`btn-chunky w-full py-3 text-lg font-black rounded-xl text-white mt-2 ${
                      demoFormStatus === 'submitting' ? 'bg-gray-400 border-gray-500 cursor-not-allowed text-gray-700' : 'bg-[#EE2A7B]'
                    }`}
                  >
                    {demoFormStatus === 'submitting' ? 'Submitting...' : 'Request Demo & Access'}
                  </button>
                  <p className="text-center text-xs font-bold text-gray-500 mt-3">
                    By submitting, you agree to our Terms of Service.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        .border-3 { border-width: 3px; }
        
        .btn-chunky {
          border: 3px solid #111827;
          box-shadow: 4px 4px 0px 0px #111827;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-chunky:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px 0px #111827;
        }
        .btn-chunky:active {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px 0px #111827;
        }
        
        .card-chunky {
          border: 3px solid #111827;
          box-shadow: 8px 8px 0px 0px #111827;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-chunky:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0px 0px #111827;
        }

        .input-chunky {
          border: 3px solid #111827;
          box-shadow: inset 4px 4px 0px 0px rgba(0,0,0,0.05);
        }
        .input-chunky:focus {
          outline: none;
          box-shadow: inset 4px 4px 0px 0px rgba(0,0,0,0.1);
          border-color: #EE2A7B;
        }

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

      {/* Navigation Bar */}
      <nav className="fixed w-full bg-[#FFFDF9]/95 backdrop-blur-xl z-50 border-b-3 border-black transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <MogzuLogo className="h-14 w-auto max-w-[min(100%,280px)]" />
              </Link>
            </div>
            
            {/* Center Links */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {[
                { label: 'How it Works', path: '#how-it-works', color: 'hover:text-[#15D39D]' },
                { label: 'About Mogzu', path: '/about', color: 'hover:text-[#9B51E0]' },
                { label: 'Partner benefits', path: '/vendor-benefits', color: 'hover:text-[#15D39D]' },
              ].map((link) => (
                <Link key={link.label} to={link.path} className={`text-[#0e1e3f] ${link.color} text-base xl:text-lg font-black tracking-tight transition-colors whitespace-nowrap`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: Benefits + Why Mogzu + login + demo (theme-aligned hovers) */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 shrink-0">
              <Link
                to="#benefits"
                className="text-[#0e1e3f] hover:text-[#EE2A7B] text-sm sm:text-lg font-black tracking-tight transition-colors whitespace-nowrap"
              >
                Benefits
              </Link>
              <Link
                to="/why-mogzu"
                className="text-[#0e1e3f] hover:text-[#FF5E00] text-sm sm:text-lg font-black tracking-tight transition-colors whitespace-nowrap"
              >
                Why Mogzu
              </Link>
              <Link 
                to="/login" 
                className="text-[#0e1e3f] hover:text-[#9B51E0] text-sm sm:text-lg font-black tracking-tight transition-colors hidden sm:block"
              >
                Log In
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDemoModalOpen(true);
                }}
                className="btn-chunky inline-flex items-center justify-center px-4 py-2.5 sm:px-8 sm:py-3.5 text-sm sm:text-lg font-black rounded-xl text-black bg-[#FFD100] whitespace-nowrap"
              >
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section (Search & Book Centric) */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-24 h-24 bg-[#EE2A7B] rounded-full border-3 border-black opacity-20 blur-xl" />
          <div className="absolute top-[50%] right-[10%] w-40 h-40 bg-[#15D39D] rounded-full border-3 border-black opacity-20 blur-xl" />
          <div className="absolute bottom-[10%] left-[20%] w-32 h-32 bg-[#FFD100] rounded-full border-3 border-black opacity-20 blur-xl" />
          
          {/* Abstract solid shapes */}
          <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-[#9B51E0] rounded-2xl border-3 border-black rotate-12" />
          <div className="absolute bottom-[25%] right-[5%] w-12 h-12 bg-[#FF5E00] rounded-full border-3 border-black" />
          <div className="absolute top-[40%] left-[10%] w-20 h-8 bg-[#15D39D] rounded-full border-3 border-black -rotate-12" />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-3 border-black shadow-[4px_4px_0_0_#EE2A7B] text-[#0e1e3f] text-sm font-black tracking-wide uppercase mb-10">
            <Sparkles className="w-5 h-5 text-[#EE2A7B]" />
            The Corporate OS
          </div>
          
          <h1 className="text-6xl md:text-[80px] lg:text-[96px] font-black text-[#0e1e3f] tracking-tighter leading-[1] mb-8 drop-shadow-sm">
            Book your next <br/>
            <span className="inline-block px-4 bg-[#FFD100] border-3 border-black shadow-[6px_6px_0_0_#111827] transform -rotate-2 mt-2">Offsite</span>
            <span className="mx-4 text-transparent bg-clip-text bg-gradient-to-r from-[#EE2A7B] to-[#FF5E00]">&</span>
            <span className="inline-block px-4 bg-[#15D39D] border-3 border-black shadow-[6px_6px_0_0_#111827] transform rotate-2 mt-2">Gifting</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 font-bold max-w-3xl mx-auto mb-16 leading-relaxed">
            Discover verified corporate venues, premium gifts, and team-building experiences—all with one unified invoice.
          </p>

          {/* Unified Search/Booking Bar */}
          <div className="max-w-[1000px] mx-auto bg-white rounded-[2rem] border-3 border-black shadow-[12px_12px_0_0_#111827] p-4 text-left">
            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b-3 border-black pb-4 px-4 overflow-x-auto">
              {[
                { id: 'venues', label: 'Venues & Offsites', icon: <MapPin className="w-5 h-5"/>, color: '#15D39D' },
                { id: 'gifting', label: 'Corporate Gifting', icon: <Gift className="w-5 h-5"/>, color: '#EE2A7B' },
                { id: 'experiences', label: 'Team Experiences', icon: <Compass className="w-5 h-5"/>, color: '#9B51E0' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'venues' | 'gifting' | 'experiences')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-lg transition-all border-3 ${activeTab === tab.id ? 'border-black bg-black text-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="flex flex-col md:flex-row gap-4 p-2">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={activeTab === 'venues' ? 'Search city or destination...' : activeTab === 'gifting' ? 'Search swag, hampers...' : 'Search activities...'}
                  className="w-full h-16 pl-14 pr-6 rounded-xl input-chunky text-xl font-bold placeholder:text-gray-400"
                />
              </div>
              
              {activeTab === 'venues' && (
                <div className="w-full md:w-64 relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <select className="w-full h-16 pl-14 pr-6 rounded-xl input-chunky text-xl font-bold appearance-none bg-white">
                    <option>Team Size</option>
                    <option>10 - 50</option>
                    <option>50 - 200</option>
                    <option>200+</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate(explorePathForTab())}
                className="h-16 px-10 rounded-xl bg-[#FF5E00] text-white font-black text-xl border-3 border-black btn-chunky flex-shrink-0 flex items-center justify-center gap-2"
              >
                <Search className="w-6 h-6" />
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules (Routing Category Cards) */}
      <section className="py-24 bg-[#111827] relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">The Operating System.</h2>
              <p className="text-2xl text-gray-400 font-bold">Pick your module to start executing.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* GiEv Routing Card */}
            <Link to="/giev" className="card-chunky bg-[#EE2A7B] rounded-[2.5rem] p-10 flex flex-col h-[480px] group relative overflow-hidden block text-black">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-20 h-20 bg-white border-3 border-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0_0_#111827] group-hover:-translate-y-2 transition-transform duration-300">
                <Gift className="w-10 h-10 text-[#EE2A7B]" />
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tight">GiEv</h3>
              <p className="text-xl font-bold mb-auto leading-relaxed opacity-90">Corporate Gifting & Event Management. Everything from bespoke hampers to massive end-of-year offsites.</p>
              <div className="mt-8 flex items-center gap-4">
                <span className="text-2xl font-black bg-white px-6 py-3 rounded-full border-3 border-black shadow-[4px_4px_0_0_#111827] group-hover:bg-black group-hover:text-white transition-colors">
                  Explore GiEv <ArrowRight className="inline ml-2" />
                </span>
              </div>
            </Link>

            {/* D Space Routing Card */}
            <Link to="/dspace" className="card-chunky bg-[#15D39D] rounded-[2.5rem] p-10 flex flex-col h-[480px] group relative overflow-hidden block text-black">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-20 h-20 bg-white border-3 border-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0_0_#111827] group-hover:-translate-y-2 transition-transform duration-300">
                <Building2 className="w-10 h-10 text-[#15D39D]" />
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tight">D Space</h3>
              <p className="text-xl font-bold mb-auto leading-relaxed opacity-90">Dynamic Workspace & Venue Booking. Secure co-working spaces and premium meeting rooms instantly.</p>
              <div className="mt-8 flex items-center gap-4">
                <span className="text-2xl font-black bg-white px-6 py-3 rounded-full border-3 border-black shadow-[4px_4px_0_0_#111827] group-hover:bg-black group-hover:text-white transition-colors">
                  Explore D Space <ArrowRight className="inline ml-2" />
                </span>
              </div>
            </Link>

            {/* Hey Genie Routing Card */}
            <Link to="/heygenie" className="card-chunky bg-[#9B51E0] rounded-[2.5rem] p-10 flex flex-col h-[480px] group relative overflow-hidden block text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-20 h-20 bg-white border-3 border-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0_0_#111827] group-hover:-translate-y-2 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-[#9B51E0]" />
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tight text-white">Hey Genie</h3>
              <p className="text-xl font-bold mb-auto leading-relaxed text-gray-100">Corporate Concierge & Custom Requests. Get VIP experiences and complex logistics handled magically.</p>
              <div className="mt-8 flex items-center gap-4">
                <span className="text-2xl font-black bg-[#FFD100] text-black px-6 py-3 rounded-full border-3 border-black shadow-[4px_4px_0_0_#111827] group-hover:bg-white transition-colors">
                  Ask Genie <ArrowRight className="inline ml-2" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending / Handpicked Section (TeamOut style) */}
      <section className="py-24 bg-[#FFFDF9]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-[#0e1e3f] tracking-tighter mb-4">Trending Top Picks.</h2>
              <p className="text-2xl text-gray-500 font-bold">Highly-rated venues, offsites, and gift bundles.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/spacex')}
              className="btn-chunky bg-white px-8 py-4 rounded-xl text-xl font-black border-3 border-black flex items-center gap-2"
            >
              View All Offers <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Listing Card 1 */}
            <div className="card-chunky bg-white rounded-3xl overflow-hidden group cursor-pointer flex flex-col">
              <div className="h-64 overflow-hidden relative border-b-3 border-black">
                <img src={IMAGES.resort} alt="Resort" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white border-2 border-black px-3 py-1.5 rounded-lg text-sm font-black flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#FFD100] text-[#FFD100]" /> 4.9
                </div>
                <div className="absolute top-4 right-4 bg-[#15D39D] border-2 border-black px-3 py-1.5 rounded-lg text-sm font-black">
                  D Space
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-[#EE2A7B]" /> Goa, India
                </div>
                <h3 className="text-2xl font-black text-[#0e1e3f] mb-3 leading-tight">Taj Exotica Resort & Spa</h3>
                <div className="flex gap-3 mb-6 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">50-200 Pax</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">Beachfront</span>
                </div>
                <div className="mt-auto border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-500 block">Starting from</span>
                    <span className="text-xl font-black">₹18,000<span className="text-sm text-gray-500 font-bold">/pax</span></span>
                  </div>
                  <div className="w-10 h-10 bg-[#FFD100] rounded-lg border-2 border-black flex items-center justify-center group-hover:-rotate-12 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Card 2 */}
            <div className="card-chunky bg-white rounded-3xl overflow-hidden group cursor-pointer flex flex-col">
              <div className="h-64 overflow-hidden relative border-b-3 border-black">
                <img src={IMAGES.teamBuilding} alt="Team Building" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-[#9B51E0] text-white border-2 border-black px-3 py-1.5 rounded-lg text-sm font-black">
                  Hey Genie
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-[#EE2A7B]" /> Lonavala, MH
                </div>
                <h3 className="text-2xl font-black text-[#0e1e3f] mb-3 leading-tight">Wilderness Survival Retreat</h3>
                <div className="flex gap-3 mb-6 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">20-50 Pax</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">Activity</span>
                </div>
                <div className="mt-auto border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-500 block">Starting from</span>
                    <span className="text-xl font-black">₹5,500<span className="text-sm text-gray-500 font-bold">/pax</span></span>
                  </div>
                  <div className="w-10 h-10 bg-[#FFD100] rounded-lg border-2 border-black flex items-center justify-center group-hover:-rotate-12 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Card 3 */}
            <div className="card-chunky bg-white rounded-3xl overflow-hidden group cursor-pointer flex flex-col">
              <div className="h-64 overflow-hidden relative border-b-3 border-black bg-pink-50">
                <img src={IMAGES.giftBox} alt="Gift Box" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
                <div className="absolute top-4 right-4 bg-[#EE2A7B] text-white border-2 border-black px-3 py-1.5 rounded-lg text-sm font-black">
                  GiEv
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <Gift className="w-4 h-4 text-[#EE2A7B]" /> Swag Store
                </div>
                <h3 className="text-2xl font-black text-[#0e1e3f] mb-3 leading-tight">Premium Welcome Kit V2</h3>
                <div className="flex gap-3 mb-6 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">MOQ 50</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">Custom Brand</span>
                </div>
                <div className="mt-auto border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-500 block">Starting from</span>
                    <span className="text-xl font-black">₹3,200<span className="text-sm text-gray-500 font-bold">/box</span></span>
                  </div>
                  <div className="w-10 h-10 bg-[#FFD100] rounded-lg border-2 border-black flex items-center justify-center group-hover:-rotate-12 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Card 4 */}
            <div className="card-chunky bg-white rounded-3xl overflow-hidden group cursor-pointer flex flex-col">
              <div className="h-64 overflow-hidden relative border-b-3 border-black">
                <img src={IMAGES.workspace} alt="Workspace" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-[#15D39D] border-2 border-black px-3 py-1.5 rounded-lg text-sm font-black">
                  D Space
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-[#EE2A7B]" /> Bangalore, KA
                </div>
                <h3 className="text-2xl font-black text-[#0e1e3f] mb-3 leading-tight">WeWork Galaxy Premium</h3>
                <div className="flex gap-3 mb-6 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">1-50 Pax</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-bold border-2 border-gray-200">Day Pass</span>
                </div>
                <div className="mt-auto border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-500 block">Starting from</span>
                    <span className="text-xl font-black">₹800<span className="text-sm text-gray-500 font-bold">/day</span></span>
                  </div>
                  <div className="w-10 h-10 bg-[#FFD100] rounded-lg border-2 border-black flex items-center justify-center group-hover:-rotate-12 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#FFD100] border-y-3 border-black">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-[#111827] tracking-tighter">How Mogzu Works.</h2>
            <p className="text-2xl text-gray-800 font-bold mt-4">Three steps to a flawless corporate event.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-3 bg-black rounded-full z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2rem] bg-[#EE2A7B] border-3 border-black shadow-[8px_8px_0_0_#111827] flex items-center justify-center mb-8 rotate-[-6deg]">
                <Search className="w-14 h-14 text-white" />
              </div>
              <div className="bg-white border-3 border-black shadow-[8px_8px_0_0_#111827] rounded-3xl p-8 w-full h-full">
                <span className="inline-block px-4 py-1 bg-black text-white rounded-full font-black text-lg mb-4">Step 1</span>
                <h3 className="text-3xl font-black text-[#0e1e3f] mb-4">Discover & Plan</h3>
                <p className="text-lg text-gray-600 font-bold">Use our intelligent routing platform to find the perfect venues, gifts, or experiences for your team's size and budget.</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center mt-12 md:mt-0">
              <div className="w-32 h-32 rounded-[2rem] bg-white border-3 border-black shadow-[8px_8px_0_0_#111827] flex items-center justify-center mb-8 rotate-[6deg]">
                <ShoppingCart className="w-14 h-14 text-[#FF5E00]" />
              </div>
              <div className="bg-white border-3 border-black shadow-[8px_8px_0_0_#111827] rounded-3xl p-8 w-full h-full">
                <span className="inline-block px-4 py-1 bg-black text-white rounded-full font-black text-lg mb-4">Step 2</span>
                <h3 className="text-3xl font-black text-[#0e1e3f] mb-4">Unified Cart</h3>
                <p className="text-lg text-gray-600 font-bold">Add catering, stay, gifts, and activities to a single cart. Check out instantly using L1/L2 approval workflows.</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center mt-12 md:mt-0">
              <div className="w-32 h-32 rounded-[2rem] bg-[#15D39D] border-3 border-black shadow-[8px_8px_0_0_#111827] flex items-center justify-center mb-8 rotate-[-3deg]">
                <Globe className="w-14 h-14 text-white" />
              </div>
              <div className="bg-white border-3 border-black shadow-[8px_8px_0_0_#111827] rounded-3xl p-8 w-full h-full">
                <span className="inline-block px-4 py-1 bg-black text-white rounded-full font-black text-lg mb-4">Step 3</span>
                <h3 className="text-3xl font-black text-[#0e1e3f] mb-4">Flawless Execution</h3>
                <p className="text-lg text-gray-600 font-bold">Mogzu handles all vendor coordination in the background. You receive exactly ONE consolidated GST invoice.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-[#FFFDF9]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-[#0e1e3f] tracking-tighter mb-4">Frequently Asked.</h2>
            <p className="text-2xl text-gray-500 font-bold">Everything you need to know about Mogzu.</p>
          </div>
          
          <div className="space-y-6">
            <FAQItem 
              color="#EE2A7B"
              question="How does the consolidated GST invoice work?" 
              answer="Mogzu acts as your primary Vendor of Record. Instead of receiving dozens of invoices from caterers, venues, and artists, Mogzu collects them and issues you a single, perfectly formatted GST invoice for the entire event, ensuring 100% compliance and zero headache."
            />
            <FAQItem 
              color="#FF5E00"
              question="What modules are included in the Mogzu Platform?" 
              answer="The core Mogzu OS includes GiEv (Gifting & Events), D Space (Dynamic Workspace & Venue Booking), and Hey Genie (Concierge & Custom Experiences). All modules share a unified budget and role hierarchy system."
            />
            <FAQItem 
              color="#15D39D"
              question="Is the pricing transparent for venues and vendors?" 
              answer="Absolutely. We enforce a strict Vendor Passport System. What you see on the platform is the final negotiated corporate rate. There are no hidden fees, last-minute markups, or coordination surprises."
            />
            <FAQItem 
              color="#9B51E0"
              question="Is Mogzu suitable for fast-growing startups or only large enterprises?" 
              answer="Mogzu scales with you. While we support complex L1/L2/L3 approval workflows for large enterprises, agile startups love our platform because it completely eliminates the need for a dedicated events coordination team."
            />
          </div>
        </div>
      </section>

      {/* Big Bold CTA Footer */}
      <section className="py-32 bg-[#EE2A7B] border-t-3 border-black text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-marquee flex items-center gap-10 opacity-20 text-white font-black text-[120px] whitespace-nowrap">
            MOGZU MOGZU MOGZU MOGZU MOGZU MOGZU MOGZU
          </div>
        </div>
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter mb-8 leading-[0.9]">
            Start Booking <br/> With Confidence.
          </h2>
          <p className="text-2xl text-black font-bold mb-12">
            Join thousands of teams executing flawless events every single day.
          </p>
          <Link
            to="/signup/corporate"
            className="btn-chunky inline-flex items-center justify-center px-10 py-5 sm:px-12 sm:py-6 text-xl sm:text-2xl font-black rounded-2xl text-black bg-[#FFD100]"
          >
            Corporate signup
          </Link>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="bg-white border-t-3 border-black pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-16 border-b-3 border-black pb-16 mb-8">
            <div className="flex flex-col lg:flex-row justify-between gap-12 items-start">
              {/* Left Column: Logo & partner CTA */}
              <div className="flex flex-col gap-8 max-w-sm">
                <Link to="/">
                  <MogzuLogo className="h-12 w-auto max-w-[220px] sm:max-w-[260px]" />
                </Link>
                <p className="text-xl font-bold text-gray-700 leading-snug">
                  The premier platform orchestrating corporate gifting, events, workspaces, and engagement seamlessly.
                </p>
                <div
                  id="partner-with-mogzu"
                  className="bg-[#EAEAEA] p-6 rounded-2xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-start gap-4 mt-2 scroll-mt-28"
                >
                  <div>
                    <h4 className="font-black text-black text-2xl mb-1">Partner with Mogzu</h4>
                    <p className="text-gray-700 font-bold text-sm">
                      Vendors, venues, and suppliers: grow your corporate business with us. Corporate
                      buyers should use <span className="text-[#0e1e3f]">Corporate signup</span> instead.
                    </p>
                  </div>
                  <Link
                    to="/signup/vendor"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-black rounded-xl text-black bg-[#15D39D] hover:bg-[#11B586] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none w-full sm:w-auto text-center border-3 border-black"
                  >
                    Partner with us
                  </Link>
                  <Link
                    to="/vendor-benefits"
                    className="text-base font-bold text-[#0e1e3f] hover:text-[#15D39D] hover:underline transition-colors"
                  >
                    Why partner with Mogzu →
                  </Link>
                </div>
              </div>

              {/* Right Columns: Links */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16 w-full lg:w-auto pt-2">
                {/* Modules */}
                <div className="flex flex-col gap-5">
                  <h4 className="font-black text-black text-2xl mb-2">Modules</h4>
                  <Link to="/giev" className="text-gray-600 hover:text-[#EE2A7B] font-bold transition-colors text-lg">GiEv</Link>
                  <Link to="/dspace" className="text-gray-600 hover:text-[#15D39D] font-bold transition-colors text-lg">D Space</Link>
                  <Link to="/heygenie" className="text-gray-600 hover:text-[#9B51E0] font-bold transition-colors text-lg">Hey Genie</Link>
                </div>

                {/* Company */}
                <div className="flex flex-col gap-5">
                  <h4 className="font-black text-black text-2xl mb-2">Company</h4>
                  <Link to="/why-mogzu" className="text-gray-600 hover:text-[#FF5E00] font-bold transition-colors text-lg">Why Mogzu</Link>
                  <span className="text-gray-600 hover:text-black font-bold transition-colors text-lg">About Us</span>
                  <span className="text-gray-600 hover:text-black font-bold transition-colors text-lg">Careers</span>
                  <span className="text-gray-600 hover:text-black font-bold transition-colors text-lg">Contact</span>
                </div>

                {/* Resources */}
                <div className="flex flex-col gap-5">
                  <h4 className="font-black text-black text-2xl mb-2">Resources</h4>
                  <span className="text-gray-600 hover:text-black font-bold transition-colors text-lg">Blog</span>
                  <span className="text-gray-600 hover:text-black font-bold transition-colors text-lg">Help Center</span>
                  <span className="text-gray-600 hover:text-black font-bold transition-colors text-lg">FAQs</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 font-bold">
            <p>© 2026 Mogzu Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-black">Privacy Policy</span>
              <span className="hover:text-black">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

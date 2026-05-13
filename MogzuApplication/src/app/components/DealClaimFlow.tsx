import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, CheckCircle2, CircleAlert, Clock3, Send, ShieldCheck, Sparkles, Tag, UserRound } from 'lucide-react'
import { SharedHeader } from '@/app/components/layouts/SharedHeader'
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface'

const MOCK_DEALS = [
  {
    id: 1,
    category: 'SpaceX',
    title: '50% off Monthly Coworking',
    provider: 'WeWork',
    description: 'Get half off your first month of any hot desk membership when you book for at least 3 months.',
    discount: '50% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBzcGFjZXxlbnwxfHx8fDE3NzMyMjc4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    validUntil: 'Dec 31, 2026',
  },
  {
    id: 2,
    category: 'Gifting',
    title: 'Bulk Corporate Hampers',
    provider: 'GiftBasket Co.',
    description: 'Order 20 or more premium corporate gift hampers and receive an automatic 25% discount.',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwYmFza2V0fGVufDF8fHx8MTc3MzE0NzU1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    validUntil: 'Nov 30, 2026',
  },
  {
    id: 3,
    category: 'Events',
    title: 'Free AV Setup for Summits',
    provider: 'Stage Masters',
    description: 'Book a full-day corporate event gathering with us and get your entire audio-visual setup absolutely free.',
    discount: 'FREE AV',
    imageUrl: 'https://images.unsplash.com/photo-1768508664411-9bef1b361224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBldmVudCUyMGdhdGhlcmluZ3xlbnwxfHx8fDE3NzMyMjk3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    validUntil: 'Oct 15, 2026',
  },
  {
    id: 4,
    category: 'SpaceX',
    title: 'Book 3 Days, Get 1 Free',
    provider: 'Regus Meeting Rooms',
    description: 'Book any premium meeting room for three consecutive days and get the fourth day completely free.',
    discount: '1 DAY FREE',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBzcGFjZXxlbnwxfHx8fDE3NzMyMjc4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    validUntil: 'Dec 15, 2026',
  },
]

export default function DealClaimFlow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  const deal = MOCK_DEALS.find((item) => item.id === Number(id)) || MOCK_DEALS[0]

  const handleConfirmClaim = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      if (Math.random() < 0.2) {
        setIsFailed(true)
        return
      }
      setStep(3)
    }, 1500)
  }

  const stepItems = [
    { id: 1, label: 'Review' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Confirmation' },
  ]

  if (isFailed) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#fdfdff] to-[#f6f8ff]">
        <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="deals" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed((value) => !value)} searchPlaceholder="Search deals..." />
          <MogzuCorporateScrollSurface className="px-5 py-6 sm:px-7">
            <div className="mx-auto w-full max-w-3xl">
              <section className="rounded-3xl border border-red-200/80 bg-white p-10 text-center shadow-[0_18px_48px_rgba(248,113,113,0.16)]">
                <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <CircleAlert className="size-10" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Claim unsuccessful</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
                  Something interrupted your request. Your deal has not been claimed yet, and no action was completed.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFailed(false)
                      setStep(2)
                    }}
                    className="min-h-[44px] rounded-xl bg-[#3568dd] px-6 text-sm font-semibold text-white transition-colors motion-safe:duration-200 hover:bg-[#2a55b8] focus:outline-none focus:ring-2 focus:ring-[#3568dd]/30"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/communication')}
                    className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors motion-safe:duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    Contact support
                  </button>
                </div>
              </section>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#fdfdff] to-[#f6f8ff]">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="deals" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed((value) => !value)} searchPlaceholder="Search deals..." />
        <MogzuCorporateScrollSurface className="px-5 py-6 sm:px-7">
          <div className="mx-auto w-full max-w-4xl">
            <button
              type="button"
              onClick={() => navigate('/deals')}
              className="mb-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors motion-safe:duration-200 hover:bg-slate-50"
            >
              <ArrowLeft className="size-3.5" />
              Back to deals
            </button>

            <section className="relative overflow-hidden rounded-3xl border border-[#d8e4ff]/90 bg-gradient-to-r from-[#0e1e3f] via-[#1f3f8f] to-[#3568dd] px-6 py-6 shadow-[0_24px_60px_rgba(53,104,221,0.22)]">
              <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90">
                  <Sparkles className="size-3 text-[#fbbf24]" />
                  Claim deal flow
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Confirm your corporate offer</h1>
                <p className="mt-2 max-w-2xl text-sm text-blue-100">
                  Review offer details, confirm your contact info, and finalize your claim in three quick steps.
                </p>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                {stepItems.map((item, index) => (
                  <div key={item.id} className="flex w-full items-center sm:w-auto sm:flex-1">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                        step >= item.id ? 'bg-[#3568dd] text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {item.id < step ? '✓' : item.id}
                    </div>
                    <span className={`ml-2 text-xs font-semibold ${step >= item.id ? 'text-slate-900' : 'text-slate-400'}`}>{item.label}</span>
                    {index < stepItems.length - 1 ? (
                      <div className="mx-3 hidden h-0.5 flex-1 rounded-full bg-slate-200 sm:block">
                        <div className={`h-full rounded-full bg-[#3568dd] transition-[width] motion-safe:duration-300 motion-reduce:transition-none ${step > item.id ? 'w-full' : 'w-0'}`} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
              {step === 1 ? (
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">Review deal information</h2>
                  <div className="mt-5 grid gap-5 md:grid-cols-[260px_1fr]">
                    <img src={deal.imageUrl} alt={deal.title} className="h-52 w-full rounded-2xl object-cover" />
                    <div>
                      <p className="inline-flex items-center gap-1 rounded-full bg-[#edf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#1d4ed8]">
                        <Tag className="size-3" />
                        {deal.category === 'SpaceX' ? 'D Space' : deal.category}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">{deal.title}</h3>
                      <p className="mt-1 text-sm font-medium text-[#3568dd]">{deal.provider}</p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">{deal.description}</p>

                      <div className="mt-5 grid gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 sm:grid-cols-2">
                        <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          <Clock3 className="size-3.5" />
                          Valid until {deal.validUntil}
                        </p>
                        <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                          <Sparkles className="size-3.5 text-[#f97316]" />
                          {deal.discount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={() => navigate('/deals')}
                      className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors motion-safe:duration-200 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="min-h-[44px] rounded-xl bg-[#3568dd] px-5 text-sm font-semibold text-white transition-colors motion-safe:duration-200 hover:bg-[#2a55b8] focus:outline-none focus:ring-2 focus:ring-[#3568dd]/30"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">Confirm your details</h2>
                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <UserRound className="size-3.5" />
                        Full Name
                      </span>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-700 outline-none transition focus:border-[#3568dd] focus:ring-2 focus:ring-[#3568dd]/15"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Send className="size-3.5" />
                        Company Email
                      </span>
                      <input
                        type="email"
                        defaultValue="john.doe@company.com"
                        className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-700 outline-none transition focus:border-[#3568dd] focus:ring-2 focus:ring-[#3568dd]/15"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">Additional notes (optional)</span>
                      <textarea
                        rows={3}
                        placeholder="Any specific requirements or team sizes?"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#3568dd] focus:ring-2 focus:ring-[#3568dd]/15"
                      />
                    </label>
                    <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/80 p-3.5">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#3568dd]" />
                      <p className="text-xs leading-relaxed text-blue-900">
                        Your contact information is securely shared with <strong>{deal.provider}</strong> only for fulfillment of this offer.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={isProcessing}
                      className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors motion-safe:duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmClaim}
                      disabled={isProcessing}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#3568dd] px-5 text-sm font-semibold text-white transition-colors motion-safe:duration-200 hover:bg-[#2a55b8] focus:outline-none focus:ring-2 focus:ring-[#3568dd]/30 disabled:cursor-not-allowed disabled:opacity-75"
                    >
                      {isProcessing ? (
                        <>
                          <span className="size-4 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/30 border-t-white" />
                          Processing...
                        </>
                      ) : (
                        'Confirm claim'
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Deal claimed successfully</h2>
                  <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
                    You have successfully claimed <strong>{deal.title}</strong> from {deal.provider}. A confirmation email has been sent.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navigate('/deals', { state: { claimedDealId: deal.id } })}
                      className="min-h-[44px] rounded-xl bg-[#3568dd] px-6 text-sm font-semibold text-white transition-colors motion-safe:duration-200 hover:bg-[#2a55b8] focus:outline-none focus:ring-2 focus:ring-[#3568dd]/30"
                    >
                      Back to deals
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors motion-safe:duration-200 hover:bg-slate-50"
                    >
                      Go to dashboard
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

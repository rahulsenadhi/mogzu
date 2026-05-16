import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ChevronDown, Home, Utensils } from 'lucide-react'
import svgPathsSpaceX from '@/imports/svg-5pj2l0pukf'

export type EventsDiscoveryTab = 'home' | 'event-activity' | 'event-service'

type EventsDiscoveryNavProps = {
  activeTab?: EventsDiscoveryTab
}

const activeStyle = {
  backgroundImage: 'linear-gradient(-9.24736deg, rgb(228, 235, 255) 9.7419%, rgb(255, 255, 255) 85.097%)',
}

const TabIconWrap = ({ children }: { children: ReactNode }) => (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center">{children}</span>
)

export const EventsDiscoveryNav = ({ activeTab }: EventsDiscoveryNavProps) => {
  const navigate = useNavigate()

  const pillBase =
    'h-9 flex items-center gap-2 px-4 rounded-full text-[14px] transition-all duration-200 active:scale-[0.98] border-[1.5px]'
  const pillActive = `${pillBase} font-semibold border-[#2563eb] shadow-[0_10px_24px_rgba(37,99,235,0.24)] text-[#0e1e3f]`
  const pillInactive = `${pillBase} font-medium border-slate-300/25 bg-white/[0.12] text-[#475569] backdrop-blur-sm hover:border-[#93c5fd] hover:-translate-y-0.5`

  return (
    <div className="border-b border-slate-300/[0.1] bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-2 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/10 bg-[#fffdf9]/[0.22] px-4 py-1 text-[14px] backdrop-blur-[2px]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="font-medium text-[#7b879a] transition-colors hover:text-[#2563eb]"
          >
            Dashboard
          </button>
          <ChevronDown className="h-4 w-4 rotate-[-90deg] text-[#a0aec0]" />
          <span className="font-semibold tracking-tight text-[#0e1e3f]">Events</span>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-[22px] font-bold leading-none text-[#0e1e3f]">Events</h1>
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => navigate('/events/home')}
              className={activeTab === 'home' ? pillActive : pillInactive}
              style={activeTab === 'home' ? activeStyle : undefined}
            >
              <TabIconWrap>
                <Home className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
              </TabIconWrap>
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/event-activity')}
              className={activeTab === 'event-activity' ? pillActive : pillInactive}
              style={activeTab === 'event-activity' ? activeStyle : undefined}
            >
              <TabIconWrap>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden>
                  <path d={svgPathsSpaceX.p9bd8700} fill="#B45309" />
                </svg>
              </TabIconWrap>
              <span>Event Activity</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/event-services')}
              className={activeTab === 'event-service' ? pillActive : pillInactive}
              style={activeTab === 'event-service' ? activeStyle : undefined}
            >
              <TabIconWrap>
                <Utensils className="h-5 w-5 text-[#0f766e]" strokeWidth={2.2} />
              </TabIconWrap>
              <span>Event Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

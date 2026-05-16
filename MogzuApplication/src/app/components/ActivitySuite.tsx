import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  ACTIVITY_SUITE_ID_TO_MODULE,
  getModuleCorporateState,
} from '@/app/lib/platformMarketplaceSettings'
import { usePlatformMarketplaceSettings } from '@/app/lib/usePlatformMarketplaceSettings'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import {
  Bell,
  Bot,
  Building2,
  CalendarCheck2,
  Gift,
  Sparkles,
  Search,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  History,
  Pin,
  ClipboardCheck,
  CalendarClock,
  Megaphone,
  Building,
} from 'lucide-react'
import { notifyInfo, notifySuccess } from '@/app/lib/toast'

interface ActivityModule {
  id: string
  title: string
  description: string
  value: string
  badge: string
  badgeTone: 'info' | 'success' | 'warning'
  hotkey: '1' | '2' | '3' | '4'
  route: string
  Icon: typeof Building2
  iconBgClass: string
  iconTextClass: string
  fallbackRoute?: string
}

interface MetricCard {
  label: string
  value: number
  icon: typeof Building2
  path: string
  iconBgClass: string
  iconTextClass: string
}

const ACTIVITY_SUITE_MODULES: ActivityModule[] = [
    {
      id: 'spacex',
    title: 'Dspace',
    description: 'Manage event venues, spaces, and availability',
    value: '18 active bookings · 3 pending holds',
    badge: '3 pending',
    badgeTone: 'warning',
    route: '/dspace',
    fallbackRoute: '/spacex',
    Icon: Building2,
    iconBgClass: 'from-[#d1faed] to-[#ecfdf7]',
    iconTextClass: 'text-[#11B586]',
    hotkey: '1',
    },
    {
      id: 'event',
    title: 'Events',
    description: 'Plan and book corporate events',
    value: '12 live workflows · 4 approvals',
    badge: '4 approvals',
    badgeTone: 'info',
      route: '/events/home',
    Icon: CalendarCheck2,
    iconBgClass: 'from-[#ffedd5] to-[#fff7ed]',
    iconTextClass: 'text-[#FF5E00]',
    hotkey: '2',
    },
    {
      id: 'gifting',
      title: 'Gifting',
    description: 'Corporate gifting made easy',
    value: '7 campaigns in progress · 23 dispatches',
    badge: '2 overdue',
    badgeTone: 'warning',
      route: '/gifting',
    Icon: Gift,
    iconBgClass: 'from-[#ffe4f1] to-[#fff1f7]',
    iconTextClass: 'text-[#EE2A7B]',
    hotkey: '3',
    },
    {
      id: 'assistant',
      title: 'Mogzu Assistant',
    description: 'Your AI event planning partner',
    value: '6 new suggestions · 1 unresolved query',
    badge: 'new',
    badgeTone: 'success',
      route: '/assistance',
    Icon: Bot,
    iconBgClass: 'from-[#efe3ff] to-[#f7f0ff]',
    iconTextClass: 'text-[#9B51E0]',
    hotkey: '4',
    },
]

export default function ActivitySuite() {
  const location = useLocation()
  const navigate = useNavigate()
  const marketplace = usePlatformMarketplaceSettings()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(5)
  const [pressedCard, setPressedCard] = useState<string | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('mogzu_activitysuite_last_module')
    } catch {
      return null
    }
  })
  const [metricValues, setMetricValues] = useState<Record<string, number>>({})
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('mogzu_activitysuite_pinned')
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })
  const selectedNav = 'activity'

  const visibleModules = useMemo(
    () =>
      ACTIVITY_SUITE_MODULES.filter((m) => {
        const key = ACTIVITY_SUITE_ID_TO_MODULE[m.id]
        if (key == null) return true
        return getModuleCorporateState(key) !== 'hidden'
      }),
    [marketplace]
  )

  const orderedModules = useMemo(() => {
    const pinOrder = [...visibleModules].sort((a, b) => {
      const ai = pinned.indexOf(a.id)
      const bi = pinned.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return pinOrder.slice(0, 4)
  }, [visibleModules, pinned])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault()
        document.getElementById('activitysuite-global-search')?.focus()
        return
      }
      if (e.key === '?') {
        e.preventDefault()
        setNotificationsOpen((v) => !v)
        return
      }
      const card = orderedModules.find((m) => m.hotkey === e.key)
      if (card) navigate(card.route)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, orderedModules])

  useEffect(() => {
    try {
      localStorage.setItem('mogzu_activitysuite_pinned', JSON.stringify(pinned))
    } catch {
      // no-op
    }
  }, [pinned])

  const metricCards: MetricCard[] = [
    {
      label: 'Pending approvals',
      value: 9,
      icon: ClipboardCheck,
      path: '/corporate/approvals',
      iconBgClass: 'from-[#ffe4f1] to-[#fff1f7]',
      iconTextClass: 'text-[#EE2A7B]',
    },
    {
      label: 'Active events',
      value: 12,
      icon: CalendarClock,
      path: '/event-activity',
      iconBgClass: 'from-[#ffedd5] to-[#fff7ed]',
      iconTextClass: 'text-[#FF5E00]',
    },
    {
      label: 'Gifting campaigns',
      value: 7,
      icon: Gift,
      path: '/gifting',
      iconBgClass: 'from-[#efe3ff] to-[#f7f0ff]',
      iconTextClass: 'text-[#9B51E0]',
    },
    {
      label: 'Unread alerts',
      value: unreadCount,
      icon: Megaphone,
      path: '/corporate/notifications',
      iconBgClass: 'from-[#fff7cc] to-[#fffbe6]',
      iconTextClass: 'text-[#d4a000]',
    },
    {
      label: 'Venue holds',
      value: 3,
      icon: Building,
      path: '/dspace',
      iconBgClass: 'from-[#d1faed] to-[#ecfdf7]',
      iconTextClass: 'text-[#11B586]',
    },
  ]

  const quickActions = [
    { label: 'Create event requirement', path: '/events' },
    { label: 'Start gifting campaign', path: '/gifting' },
    { label: 'Check venue availability', path: '/spacex' },
    { label: 'Ask Mogzu Assistant', path: '/assistance' },
    { label: 'View pending approvals', path: '/events' },
    { label: 'View recent bookings', path: '/bookings' },
  ]

  const activities = [
    {
      when: 'Today',
      module: 'Events',
      actor: 'Riya (Corporate Admin)',
      action: 'approved venue shortlist',
      entity: 'Q2 Leadership Offsite',
      status: 'approved',
      time: '11:20 AM',
    },
    {
      when: 'Today',
      module: 'Dspace',
      actor: 'Aman (Ops Lead)',
      action: 'placed tentative hold',
      entity: 'Grand Hall - NESCO',
      status: 'pending',
      time: '10:05 AM',
    },
    {
      when: 'Yesterday',
      module: 'Gifting',
      actor: 'Meera (People Ops)',
      action: 'launched campaign',
      entity: 'Welcome Kit FY26',
      status: 'active',
      time: '4:40 PM',
    },
  ]

  const resumeItems = [
    {
      module: 'Events',
      title: 'Annual Summit brief',
      status: 'Draft',
      updated: '2h ago',
      path: '/events',
    },
    {
      module: 'Dspace',
      title: 'NESCO hold request',
      status: 'Pending',
      updated: '45m ago',
      path: '/spacex',
    },
    {
      module: 'Gifting',
      title: 'Festive hamper campaign',
      status: 'In review',
      updated: 'Yesterday',
      path: '/gifting',
    },
  ]

  const handleTogglePin = (id: string) => {
    setPinned((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return [...prev, id].slice(0, 4)
    })
  }

  const handleModuleOpen = (module: ActivityModule, canNavigate: boolean) => {
    setPressedCard(module.id)
    window.setTimeout(() => setPressedCard(null), 120)
    if (!canNavigate) {
      notifyInfo(`${module.title} is coming soon. Stay tuned! 🚀`)
      return
    }
    try {
      localStorage.setItem('mogzu_activitysuite_last_module', module.id)
    } catch {
      // no-op
    }
    setActiveModuleId(module.id)
    window.setTimeout(() => navigate(module.route), 100)
  }

  const handleSearch = () => {
    const q = search.trim()
    if (!q) {
      navigate('/event-activity')
      return
    }
    navigate(`/event-activity?search=${encodeURIComponent(q)}`)
  }

  useEffect(() => {
    const routeToModule: Record<string, string> = {
      '/dspace': 'spacex',
      '/spacex': 'spacex',
      '/events': 'event',
      '/event-activity': 'event',
      '/gifting': 'gifting',
      '/shop': 'gifting',
      '/assistance': 'assistant',
    }
    const key = Object.entries(routeToModule).find(([path]) => location.pathname.startsWith(path))?.[1] ?? null
    if (key) {
      setActiveModuleId(key)
      try {
        localStorage.setItem('mogzu_activitysuite_last_module', key)
      } catch {
        // no-op
      }
    }
  }, [location.pathname])

  useEffect(() => {
    const start = performance.now()
    const duration = 800
    const from = { pending: 0, events: 0, gifting: 0, alerts: 0, holds: 0 }
    const to = {
      pending: metricCards[0].value,
      events: metricCards[1].value,
      gifting: metricCards[2].value,
      alerts: metricCards[3].value,
      holds: metricCards[4].value,
    }
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setMetricValues({
        'Pending approvals': Math.round(from.pending + (to.pending - from.pending) * p),
        'Active events': Math.round(from.events + (to.events - from.events) * p),
        'Gifting campaigns': Math.round(from.gifting + (to.gifting - from.gifting) * p),
        'Unread alerts': Math.round(from.alerts + (to.alerts - from.alerts) * p),
        'Venue holds': Math.round(from.holds + (to.holds - from.holds) * p),
      })
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [unreadCount])

  return (
    <div className="activitysuite-page relative flex h-screen overflow-hidden bg-[#FFFDF9]">
      <div className="activitysuite-brand-bg" aria-hidden />
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={selectedNav}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <MogzuCorporateScrollSurface>
          <a
            href="#activitysuite-main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded-md"
          >
            Skip to main content
          </a>

          <div className="activitysuite-header-anim relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-r from-white via-[#fafaf9] to-[#f8f9fa] backdrop-blur-xl">
            <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-12 py-8 text-center md:text-left">
              <h1 className="activitysuite-title-gradient corp-h1 mb-2 text-[#0e1e3f]">Activity Suite</h1>
              <p className="corp-body text-slate-600">
                Your central hub for events, venues, gifting, and AI assistance
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <div className="relative">
                  <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="activitysuite-global-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#d7e6ff] bg-white/90 pl-9 pr-3 text-sm shadow-[0_6px_20px_rgba(37,99,235,0.08)]"
                    placeholder="Search modules, events, venues, campaigns, or actions"
                    aria-label="Global module search"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
                  <span className="text-sm text-slate-600 w-full md:w-auto">
                    Welcome back, James · Corporate Admin
                  </span>
                  <button
                    type="button"
                    className="h-11 rounded-xl border border-[#bfd6ff] bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 text-sm font-semibold text-white hover:from-[#1d4ed8] hover:to-[#2563eb] transition-colors shadow-[0_8px_22px_rgba(37,99,235,0.24)]"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative size-11 rounded-xl border border-[#d7e6ff] bg-white grid place-items-center transition-colors hover:bg-[#eff6ff]"
                    onClick={() => setNotificationsOpen((v) => !v)}
                  >
                    <Bell className="size-4 text-slate-600" />
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#ef4444] text-white text-[10px] font-bold grid place-items-center">
                      {unreadCount}
                    </span>
                  </button>
                </div>
            </div>
            </div>
          </div>

          <main
            id="activitysuite-main"
            className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-12 py-6 space-y-8 corp-page-enter"
          >
            <section className="activitysuite-section-enter activitysuite-section-delay-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
              {metricCards.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  className="activitysuite-glass-card h-12 md:h-auto min-h-[48px] rounded-xl border border-[#d7e6ff] bg-gradient-to-br from-white to-[#f8fbff] px-3 py-3 text-left transition-all duration-150 hover:border-[#2563eb] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,99,235,0.16)]"
                  onClick={() => navigate(m.path)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`size-9 rounded-lg bg-gradient-to-br ${m.iconBgClass} grid place-items-center ${m.iconTextClass}`}>
                      <m.icon className="size-4" />
                    </div>
                    <div>
                      <p className="corp-micro text-slate-500">{m.label}</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">{metricValues[m.label] ?? 0}</p>
                    </div>
                  </div>
                </button>
              ))}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="activitysuite-section-title corp-h2 text-slate-900">Modules</h2>
                <p className="text-xs text-slate-500">
                  Shortcuts: 1 2 3 4 · Search: / · Help: ?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {orderedModules.map((module) => {
                  const mKey = ACTIVITY_SUITE_ID_TO_MODULE[module.id]
                  const moduleState = mKey == null ? 'live' : getModuleCorporateState(mKey)
                  const isComingSoon = moduleState === 'coming_soon'
                  const canNavigateModule = moduleState === 'live'
                  const isActive = activeModuleId === module.id
                  const badgeTone =
                    module.badgeTone === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : module.badgeTone === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'

                return (
                    <article
                    key={module.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${module.title}`}
                      onClick={() => handleModuleOpen(module, canNavigateModule)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleModuleOpen(module, canNavigateModule)
                        }
                      }}
                      className={`activitysuite-card-enter group relative flex min-h-[140px] h-full flex-col overflow-hidden rounded-[20px] border bg-gradient-to-br from-white to-[#f8fbff] transition-all [transition-timing-function:cubic-bezier(0.34,1.2,0.64,1)] duration-250 focus-within:ring-2 focus-within:ring-[#2563eb]/30 ${
                        isActive
                          ? 'border-[1.5px] border-[color-mix(in_oklch,var(--color-primary)_60%,transparent)] shadow-[0_12px_30px_rgba(37,99,235,0.22)]'
                          : 'border-[#dbeafe]'
                      } ${pressedCard === module.id ? 'scale-[0.97]' : 'scale-100'} ${
                        canNavigateModule
                          ? 'activitysuite-glass-card hover:-translate-y-1 hover:shadow-[0_4px_8px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.10),0_0_0_1px_rgba(37,99,235,0.2),0_0_32px_rgba(37,99,235,0.10)]'
                          : 'opacity-85 saturate-0'
                      }`}
                      style={{ animationDelay: `${300 + (Number(module.hotkey) - 1) * 80}ms` }}
                    >
                      {isActive ? (
                        <span className="absolute right-3 top-3 rounded-full bg-[color-mix(in_oklch,var(--color-primary)_12%,white)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                          Active
                        </span>
                      ) : null}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start gap-3">
                          <div className={`activitysuite-card-icon flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-gradient-to-br ${module.iconBgClass} ${module.iconTextClass} transition-all duration-200 group-hover:scale-105`}>
                            <module.Icon className="size-[26px] transition-transform duration-200 group-hover:scale-110" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h3 className="text-[15px] md:text-[18px] font-semibold text-[var(--color-text,#0f172a)]">
                                {module.title}
                              </h3>
                            {isComingSoon ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                                Coming soon
                              </span>
                            ) : null}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeTone}`}
                              >
                                {module.badge}
                              </span>
                            </div>
                            <p className="hidden md:block text-[13px] text-[var(--color-text-muted,#64748b)] mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm font-medium text-slate-800">{module.value}</p>

                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <button
                            type="button"
                            aria-label={`Pin ${module.title}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTogglePin(module.id)
                            }}
                            className={`h-11 min-h-[44px] inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${
                              pinned.includes(module.id)
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-500'
                            }`}
                          >
                            <History className="size-3.5" /> Key {module.hotkey}
                            <Pin className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={!canNavigateModule}
                            className={`h-11 md:h-12 min-h-[44px] inline-flex items-center gap-1 rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors group/cta ${
                              canNavigateModule
                                ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-40'
                            }`}
                            onClick={() => handleModuleOpen(module, canNavigateModule)}
                          >
                            Open Module <ArrowRight className="size-[14px] transition-transform duration-200 group-hover/cta:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="activitysuite-section-enter activitysuite-section-delay-5 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
              <div className="rounded-2xl border border-[#dbeafe] bg-gradient-to-br from-white to-[#f8fbff] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="activitysuite-section-title corp-h3 text-slate-900">Recent activity</h3>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#2563eb] hover:underline"
                    onClick={() => navigate('/corporate/notifications')}
                  >
                    View all activity
                  </button>
                </div>

                <div className="space-y-4">
                  {['Today', 'Yesterday', 'Earlier this week'].map((group) => (
                    <div key={group}>
                      <p className="corp-micro text-slate-500 uppercase mb-2">{group}</p>
                      <div className="space-y-2">
                        {activities
                          .filter((a) => a.when === group)
                          .map((a, idx) => (
                            <button
                              key={`${group}-${idx}`}
                              type="button"
                              className="w-full text-left rounded-xl border border-[#e2e8f0] bg-white p-3 hover:bg-[#f8fbff] transition-colors"
                              onClick={() => navigate(a.module === 'Gifting' ? '/gifting' : a.module === 'Dspace' ? '/spacex' : '/events/home')}
                            >
                              <p className="text-sm text-slate-800">
                                <span className="font-semibold">{a.module}</span> · {a.actor}{' '}
                                {a.action} for <span className="font-semibold">{a.entity}</span>
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                  {a.status}
                                </span>
                                <span>{a.time}</span>
                              </div>
                            </button>
                          ))}
                        {activities.filter((a) => a.when === group).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                            <p className="text-sm font-semibold text-slate-700">No activity yet</p>
                            <p className="mt-1 text-xs text-slate-500">
                              This section will show updates once your team starts taking actions.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#dbeafe] bg-gradient-to-br from-white to-[#f8fbff] p-4">
                  <h4 className="activitysuite-section-title corp-h3 text-slate-900 mb-3">Quick actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => navigate(action.path)}
                        className="h-11 min-h-[44px] rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                      </div>
                    </div>

                <div className="rounded-2xl border border-[#dbeafe] bg-gradient-to-br from-white to-[#f8fbff] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="activitysuite-section-title corp-h3 text-slate-900">Continue where you left off</h4>
                    <History className="size-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    {resumeItems.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className="w-full rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.module} · {item.status} · {item.updated}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#dbeafe] bg-gradient-to-r from-white to-[#f5f9ff] p-4">
              <button
                type="button"
                className="h-12 min-h-[44px] w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100/60 transition-colors"
                onClick={() => navigate('/assistance')}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-[#2563eb]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Ask Mogzu Assistant anything
                    </p>
                    <p className="text-xs text-slate-600">
                      Search, get help, and take guided actions instantly.
                    </p>
                  </div>
                </div>
              </button>
            </section>

            <footer className="border-t border-[color-mix(in_oklch,var(--color-border)_50%,transparent)] flex flex-wrap items-center justify-between gap-3 py-8 text-[13px] text-slate-500">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hover:text-slate-700 transition-colors inline-flex items-center gap-1"
                  onClick={() => notifyInfo('Help is coming soon')}
                >
                  <HelpCircle className="size-3.5" /> Help & Support
                </button>
                <button
                  type="button"
                  className="hover:text-slate-700 transition-colors"
                  onClick={() => notifyInfo('Shortcuts guide is coming soon')}
                >
                  Keyboard shortcuts
                </button>
                <button
                  type="button"
                  className="hover:text-slate-700 transition-colors"
                  onClick={() => notifyInfo('Feedback form is coming soon')}
                >
                  Feedback
                </button>
              </div>
              <span>Last updated: 2 mins ago · v2.9.1</span>
            </footer>
          </main>

          {notificationsOpen ? (
            <div className="fixed right-4 top-20 z-50 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 corp-soft-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="corp-h3 text-slate-900">Notifications</h4>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#2563eb] hover:underline"
                  onClick={() => {
                    setUnreadCount(0)
                    notifySuccess('All notifications marked as read')
                  }}
                >
                  Mark all as read
                      </button>
                    </div>
              <div className="space-y-2">
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 mt-0.5" />
                    <p>2 approval requests are pending your review</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Mogzu Assistant</span> suggested 3 vendor
                    alternatives for your summit brief.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Dspace</span> hold expires in 4 hours for Grand
                    Hall - NESCO.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </MogzuCorporateScrollSurface>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

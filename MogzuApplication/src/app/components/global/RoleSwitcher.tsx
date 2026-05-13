import { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, Check, ChevronDown, ShieldCheck, Store } from 'lucide-react'
import { toast } from 'sonner'
import { CORP } from '@/app/lib/adminTheme'
import type { DemoRole } from '@/app/lib/demoRole'
import { useDemoRole, useRoleRouting } from '@/app/lib/demoRole'
import { RoleSwitchOverlay } from '@/app/components/global/RoleSwitchOverlay'

type RoleOption = {
  id: DemoRole
  name: string
  sub: string
  Icon: typeof Building2
  color: string
  tint8: string
  tint12: string
  tint6: string
  overlay15: string
}

const OPTIONS: RoleOption[] = [
  {
    id: 'corporate',
    name: 'Corporate User',
    sub: 'Browse & book events',
    Icon: Building2,
    color: CORP.primary,
    tint8: 'rgba(37,99,235,0.08)',
    tint12: 'rgba(37,99,235,0.12)',
    tint6: 'rgba(37,99,235,0.06)',
    overlay15: 'rgba(37,99,235,0.15)',
  },
  {
    id: 'vendor',
    name: 'Vendor',
    sub: 'Manage your listings',
    Icon: Store,
    color: CORP.amber,
    tint8: 'rgba(234,179,8,0.08)',
    tint12: 'rgba(234,179,8,0.12)',
    tint6: 'rgba(234,179,8,0.06)',
    overlay15: 'rgba(234,179,8,0.15)',
  },
  {
    id: 'admin',
    name: 'Mogzu Admin',
    sub: 'Platform management',
    Icon: ShieldCheck,
    color: '#4F46E5',
    tint8: 'rgba(79,70,229,0.08)',
    tint12: 'rgba(79,70,229,0.12)',
    tint6: 'rgba(79,70,229,0.06)',
    overlay15: 'rgba(79,70,229,0.15)',
  },
]

const roleShort = (role: DemoRole) => {
  if (role === 'corporate') return 'Corporate'
  if (role === 'vendor') return 'Vendor'
  return 'Admin'
}

export function RoleSwitcher() {
  const { activeRole, setActiveRole } = useDemoRole()
  const { navigateForRole } = useRoleRouting()

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const pillRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const [switching, setSwitching] = useState<DemoRole | null>(null)

  const current = useMemo(() => OPTIONS.find((o) => o.id === activeRole)!, [activeRole])

  const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

  useEffect(() => {
    if (!open && !mobileOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (wrapperRef.current && !wrapperRef.current.contains(t)) {
        setOpen(false)
        setMobileOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setMobileOpen(false)
        pillRef.current?.focus()
      }
      if (e.key === 'Tab') {
        setOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, mobileOpen])

  const startSwitch = async (role: DemoRole) => {
    if (role === activeRole) {
      setOpen(false)
      setMobileOpen(false)
      return
    }

    setOpen(false)
    setMobileOpen(false)
    setSwitching(role)

    const startedAt = Date.now()
    setActiveRole(role)
    navigateForRole(role)

    const minMs = 600
    const elapsed = Date.now() - startedAt
    const wait = Math.max(0, minMs - elapsed)
    window.setTimeout(() => {
      setSwitching(null)
      const opt = OPTIONS.find((o) => o.id === role)!
      toast('Now viewing as ' + roleShort(role), {
        description:
          role === 'corporate'
            ? 'Browse and book events and services.'
            : role === 'vendor'
              ? 'Manage your listings and bookings.'
              : 'Full platform management access.',
        duration: 3000,
        icon: <opt.Icon className="size-4" />,
      })
    }, wait + 200)
  }

  const handlePillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isMobile()) {
        setMobileOpen(true)
        return
      }
      setOpen((v) => !v)
      setFocusIndex(OPTIONS.findIndex((o) => o.id === activeRole))
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setFocusIndex(0)
    }
  }

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIndex((i) => (i + 1) % OPTIONS.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length)
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      startSwitch(OPTIONS[focusIndex]!.id)
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        ref={pillRef}
        type="button"
        onClick={() => {
          if (isMobile()) {
            setMobileOpen(true)
            return
          }
          setOpen((v) => !v)
          setFocusIndex(OPTIONS.findIndex((o) => o.id === activeRole))
        }}
        onKeyDown={handlePillKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open || mobileOpen}
        className="h-8 rounded-full px-3 inline-flex items-center gap-2 border-[1.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          borderColor: current.color,
          backgroundColor: current.tint8,
        }}
      >
        <span className="size-2 rounded-full" style={{ backgroundColor: current.color }} aria-hidden />
        <span className="hidden md:inline text-[13px] font-semibold text-slate-900">{roleShort(activeRole)}</span>
        <ChevronDown
          className={`size-3 text-slate-500 transition-transform duration-200 ${open || mobileOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full mt-2 w-[240px] rounded-[var(--radius-lg)] border shadow-md overflow-hidden bg-white"
          style={{ borderColor: 'var(--color-border)' }}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
        >
          <div className="px-3 py-2 border-b text-[11px] uppercase tracking-[0.5px] text-slate-500" style={{ borderColor: 'var(--color-border)' }}>
            Switch demo role
          </div>
          <div className="py-2">
            {OPTIONS.map((opt, idx) => {
              const active = opt.id === activeRole
              const focused = idx === focusIndex
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setFocusIndex(idx)}
                  onClick={() => startSwitch(opt.id)}
                  className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
                    active ? '' : 'hover:bg-[var(--color-surface-offset)]'
                  } ${focused ? 'ring-2 ring-offset-[-2px] ring-[#2563EB]/30' : ''}`}
                  style={{ backgroundColor: active ? opt.tint6 : undefined }}
                >
                  <span className="size-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: opt.tint12 }}>
                    <opt.Icon className="size-4" style={{ color: opt.color }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{opt.name}</span>
                    <span className="block text-xs text-slate-500">{opt.sub}</span>
                  </span>
                  {active ? <Check className="size-4" style={{ color: opt.color }} aria-hidden /> : null}
                </button>
              )
            })}
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-slate-500 text-center" style={{ borderColor: 'var(--color-border)' }}>
            Demo mode — no real data is affected
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-0 z-[9997]">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            aria-label="Close role switcher"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white border border-slate-200 shadow-2xl">
            <div className="pt-3 pb-2 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-slate-200" aria-hidden />
            </div>
            <div className="px-4 py-2 border-b text-[11px] uppercase tracking-[0.5px] text-slate-500" style={{ borderColor: 'var(--color-border)' }}>
              Switch demo role
            </div>
            <div className="p-2">
              {OPTIONS.map((opt) => {
                const active = opt.id === activeRole
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => startSwitch(opt.id)}
                    className="w-full px-3 py-3 flex items-center gap-3 rounded-xl text-left"
                    style={{ backgroundColor: active ? opt.tint6 : undefined }}
                  >
                    <span className="size-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: opt.tint12 }}>
                      <opt.Icon className="size-4" style={{ color: opt.color }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{opt.name}</span>
                      <span className="block text-xs text-slate-500">{opt.sub}</span>
                    </span>
                    {active ? <Check className="size-4" style={{ color: opt.color }} aria-hidden /> : null}
                  </button>
                )
              })}
            </div>
            <div className="border-t px-4 py-3 text-[11px] text-slate-500 text-center" style={{ borderColor: 'var(--color-border)' }}>
              Demo mode — no real data is affected
            </div>
          </div>
        </div>
      ) : null}

      {switching ? (
        <RoleSwitchOverlay role={switching} tint={OPTIONS.find((o) => o.id === switching)!.overlay15} />
      ) : null}
    </div>
  )
}


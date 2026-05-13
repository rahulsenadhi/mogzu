import { useContext, createContext, createElement, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

export type DemoRole = 'corporate' | 'vendor' | 'admin'

export const DEMO_ROLE_STORAGE_KEY = 'mogzu_demo_role'

function getInitialRoleFromSession(): DemoRole {
  if (typeof window === 'undefined') return 'corporate'
  try {
    const raw = window.sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY)
    if (raw === 'vendor' || raw === 'admin' || raw === 'corporate') return raw
    return 'corporate'
  } catch {
    return 'corporate'
  }
}

function saveRoleToSession(role: DemoRole) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role)
  } catch {
    // ignore
  }
}

export function isRole(role: DemoRole, activeRole: DemoRole): boolean {
  return role === activeRole
}

type DemoRoleContextValue = {
  activeRole: DemoRole
  setActiveRole: (role: DemoRole) => void
}

const DemoRoleContext = createContext<DemoRoleContextValue | undefined>(undefined)

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<DemoRole>(() => getInitialRoleFromSession())

  const setActiveRole = (role: DemoRole) => {
    setActiveRoleState(role)
    saveRoleToSession(role)
  }

  const value = useMemo<DemoRoleContextValue>(
    () => ({
      activeRole,
      setActiveRole,
    }),
    [activeRole],
  )

  return createElement(DemoRoleContext.Provider, { value }, children)
}

export function useDemoRole(): DemoRoleContextValue {
  const ctx = useContext(DemoRoleContext)
  if (!ctx) {
    throw new Error('useDemoRole must be used within DemoRoleProvider')
  }
  return ctx
}

export type RoleSwitchSource = 'pill' | 'nav' | 'banner'

export function useRoleRouting() {
  const navigate = useNavigate()
  const location = useLocation()

  const routeForRole = (role: DemoRole): string | null => {
    const path = location.pathname
    const isVendorRoute = path.startsWith('/vendor')
    const isAdminRoute = path.startsWith('/admin')

    // Shared pages (anything not vendor/admin): stay put on role switch.
    if (!isVendorRoute && !isAdminRoute) return null

    if (role === 'corporate') {
      return '/events'
    }
    if (role === 'vendor') {
      return '/vendor/listings'
    }
    return '/admin/listings'
  }

  const navigateForRole = (role: DemoRole) => {
    const target = routeForRole(role)
    if (target && target !== location.pathname) {
      navigate(target)
    }
  }

  return { navigateForRole }
}


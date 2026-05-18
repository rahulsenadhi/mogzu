import {
  createContext,
  useContext,
  useEffect,
  useState,
  createElement,
  useMemo,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getAuthCallbackUrl, getPostLoginPath } from './authRedirect'
import { setLocale as setI18nLocale } from './i18n'
import type { CorporateAccount, UserProfile, UserRole } from './database.types'

// Never call supabase.auth.* directly in components — use this hook.

interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  availableRoles: UserRole[]
  corporateId: string | null
  vendorId: string | null
  corporateAccount: CorporateAccount | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; redirectTo: string | null }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  setActiveRole: (role: UserRole) => Promise<{ error: string | null }>
}

const ACTIVE_ROLE_KEY = 'mogzu_active_role'

type AuthContextValue = AuthState & AuthActions

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user profile:', error.message)
    return null
  }
  return data
}

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const existing = await fetchProfile(user.id)
  if (existing) return existing

  const meta = user.user_metadata ?? {}
  const now = new Date().toISOString()
  const profile: UserProfile = {
    id: user.id,
    corporate_id: null,
    vendor_id: null,
    role: 'l1_employee',
    available_roles: [],
    full_name:
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      user.email?.split('@')[0] ||
      'User',
    phone: null,
    avatar_url: null,
    department: null,
    status: 'active',
    invited_by: null,
    invited_at: null,
    locale: 'en-IN',
    preferred_currency: null,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await supabase.from('user_profiles').upsert(profile).select().single()
  if (error) {
    console.error('Failed to create user profile:', error.message)
    return null
  }
  return data
}

async function fetchCorporateAccount(corporateId: string): Promise<CorporateAccount | null> {
  const { data, error } = await supabase
    .from('corporate_accounts')
    .select('*')
    .eq('id', corporateId)
    .single()
  if (error) return null
  return data
}

function readStoredRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  try {
    return (window.sessionStorage.getItem(ACTIVE_ROLE_KEY) as UserRole | null) ?? null
  } catch {
    return null
  }
}

function writeStoredRole(role: UserRole | null) {
  if (typeof window === 'undefined') return
  try {
    if (role) window.sessionStorage.setItem(ACTIVE_ROLE_KEY, role)
    else window.sessionStorage.removeItem(ACTIVE_ROLE_KEY)
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [corporateAccount, setCorporateAccount] = useState<CorporateAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeRoleOverride, setActiveRoleOverride] = useState<UserRole | null>(() =>
    readStoredRole(),
  )

  const loadProfile = async (userId: string, authUser?: User) => {
    let p = await fetchProfile(userId)
    if (!p && authUser) {
      p = await ensureUserProfile(authUser)
    }
    if (!p) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) p = await ensureUserProfile(user)
    }

    if (p) {
      setProfile(p)
      if (p.locale) setI18nLocale(p.locale)
      if (p.corporate_id) {
        const ca = await fetchCorporateAccount(p.corporate_id)
        setCorporateAccount(ca)
      } else {
        setCorporateAccount(null)
      }
      return
    }

    setProfile((current) => {
      if (current?.id === userId) return current
      setCorporateAccount(null)
      return null
    })
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id, s.user).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id, s.user ?? undefined)
      } else {
        setProfile(null)
        setCorporateAccount(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Realtime: keep corporate account modules_enabled in sync (≤60s)
  useEffect(() => {
    if (!profile?.corporate_id) return
    const corporateId = profile.corporate_id
    const channel = supabase
      .channel(`auth-corporate-account-${corporateId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'corporate_accounts',
          filter: `id=eq.${corporateId}`,
        },
        (payload) => {
          setCorporateAccount(payload.new as CorporateAccount)
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.corporate_id])

  const formatAuthError = (message: string | undefined): string | null => {
    if (!message) return null
    const lower = message.toLowerCase()
    if (lower.includes('failed to fetch') || lower.includes('network')) {
      return 'Cannot reach Mogzu servers. Check your internet connection, then restart the dev server (npm run dev).'
    }
    return message
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { error: formatAuthError(error.message), redirectTo: null }
      }

      if (data.session) setSession(data.session)

      const user = data.user
      if (!user) {
        return { error: 'Sign in succeeded but no user was returned.', redirectTo: null }
      }

      const profileRow = await ensureUserProfile(user)
      setProfile(profileRow)
      if (profileRow?.corporate_id) {
        const ca = await fetchCorporateAccount(profileRow.corporate_id)
        setCorporateAccount(ca)
      } else {
        setCorporateAccount(null)
      }

      const role = profileRow?.role ?? null
      return { error: null, redirectTo: getPostLoginPath(role) }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.'
      return { error: formatAuthError(msg) ?? 'Sign in failed.', redirectTo: null }
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: getAuthCallbackUrl(),
        },
      })
      return { error: formatAuthError(error?.message) }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.'
      return { error: formatAuthError(msg) ?? 'Sign up failed.' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setCorporateAccount(null)
    setActiveRoleOverride(null)
    writeStoredRole(null)
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await loadProfile(session.user.id, session.user)
    }
  }

  // Roles the user is permitted to act as. profile.role is always included;
  // available_roles[] adds extras granted by admins.
  const availableRoles = useMemo<UserRole[]>(() => {
    if (!profile) return []
    const set = new Set<UserRole>([profile.role, ...(profile.available_roles ?? [])])
    return Array.from(set)
  }, [profile])

  // Active role = sessionStorage override (if still permitted) else primary role.
  const activeRole = useMemo<UserRole | null>(() => {
    if (profile) {
      if (activeRoleOverride && availableRoles.includes(activeRoleOverride)) {
        return activeRoleOverride
      }
      return profile.role
    }
    // Signed in but profile row missing — default corporate employee so dashboard is reachable
    if (session?.user) return 'l1_employee'
    return null
  }, [profile, activeRoleOverride, availableRoles, session?.user])

  // Clear stale override if it's no longer permitted (e.g. role grant revoked).
  useEffect(() => {
    if (activeRoleOverride && profile && !availableRoles.includes(activeRoleOverride)) {
      setActiveRoleOverride(null)
      writeStoredRole(null)
    }
  }, [activeRoleOverride, availableRoles, profile])

  const setActiveRole = async (next: UserRole): Promise<{ error: string | null }> => {
    if (!profile) return { error: 'Not signed in.' }
    if (!availableRoles.includes(next)) {
      return { error: `Role ${next} not granted to this user.` }
    }
    if (next === activeRole) return { error: null }

    const fromRole = activeRole ?? profile.role

    // Audit (non-blocking — UI switches even if audit insert fails)
    supabase
      .from('role_switch_events')
      .insert({
        user_id: profile.id,
        from_role: fromRole,
        to_role: next,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        ip_address: null,
      })
      .then(({ error }) => {
        if (error) console.error('Role switch audit failed:', error.message)
      })

    setActiveRoleOverride(next)
    writeStoredRole(next)
    return { error: null }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: activeRole,
      availableRoles,
      corporateId: profile?.corporate_id ?? null,
      vendorId: profile?.vendor_id ?? null,
      corporateAccount,
      isLoading,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      setActiveRole,
    }),
    [session, profile, corporateAccount, isLoading, activeRole, availableRoles],
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Role guard helpers
export const isCorporateRole = (role: UserRole | null) =>
  role === 'l1_employee' ||
  role === 'l2_manager' ||
  role === 'l3_admin' ||
  role === 'partner'

export const isVendorRole = (role: UserRole | null) => role === 'vendor'

export const isAdminRole = (role: UserRole | null) =>
  role === 'mogzu_admin' ||
  role === 'account_manager' ||
  role === 'support' ||
  role === 'sales_agent'

export const canApproveBookings = (role: UserRole | null) =>
  role === 'l2_manager' || role === 'l3_admin' || role === 'mogzu_admin'

export const canManageBudgets = (role: UserRole | null) =>
  role === 'l3_admin' || role === 'mogzu_admin'

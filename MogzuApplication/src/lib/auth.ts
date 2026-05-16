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
import type { CorporateAccount, UserProfile, UserRole } from './database.types'

// Never call supabase.auth.* directly in components — use this hook.

interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  corporateId: string | null
  vendorId: string | null
  corporateAccount: CorporateAccount | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

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

async function fetchCorporateAccount(corporateId: string): Promise<CorporateAccount | null> {
  const { data, error } = await supabase
    .from('corporate_accounts')
    .select('*')
    .eq('id', corporateId)
    .single()
  if (error) return null
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [corporateAccount, setCorporateAccount] = useState<CorporateAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    const p = await fetchProfile(userId)
    setProfile(p)
    if (p?.corporate_id) {
      const ca = await fetchCorporateAccount(p.corporate_id)
      setCorporateAccount(ca)
    } else {
      setCorporateAccount(null)
    }
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id)
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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setCorporateAccount(null)
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await loadProfile(session.user.id)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      corporateId: profile?.corporate_id ?? null,
      vendorId: profile?.vendor_id ?? null,
      corporateAccount,
      isLoading,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, corporateAccount, isLoading],
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
  role === 'l1_employee' || role === 'l2_manager' || role === 'l3_admin'

export const isVendorRole = (role: UserRole | null) => role === 'vendor'

export const isAdminRole = (role: UserRole | null) =>
  role === 'mogzu_admin' || role === 'account_manager' || role === 'support'

export const canApproveBookings = (role: UserRole | null) =>
  role === 'l2_manager' || role === 'l3_admin' || role === 'mogzu_admin'

export const canManageBudgets = (role: UserRole | null) =>
  role === 'l3_admin' || role === 'mogzu_admin'

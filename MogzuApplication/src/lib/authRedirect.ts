import type { UserRole } from './database.types'

/** Where to send the user after a successful login. */
export function getPostLoginPath(role: UserRole | null): string {
  if (role === 'mogzu_admin' || role === 'account_manager' || role === 'support') return '/admin'
  if (role === 'vendor') return '/vendor/dashboard'
  if (role === 'partner') return '/partner/dashboard'
  // Default for corporate roles and while profile is still loading (null)
  return '/dashboard'
}

/** Canonical redirect URL for Supabase email confirm, OAuth, and password reset. */
export function getAuthCallbackUrl(): string {
  // Prefer live browser origin so dev works on 5173, 5174, 5176, etc.
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`
  }
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  if (fromEnv) return `${fromEnv.replace(/\/$/, '')}/auth/callback`
  return 'http://localhost:5173/auth/callback'
}

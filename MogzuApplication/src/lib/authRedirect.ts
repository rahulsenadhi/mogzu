import type { UserProfile, UserRole } from './database.types'
import { getCorporateOnboardingPath, isCorporateOnboardingComplete } from '@/app/lib/corporateOnboarding'

function isCorporateRole(role: UserRole | null): boolean {
  return role === 'l1_employee' || role === 'l2_manager' || role === 'l3_admin'
}

/**
 * Where to send the user after a successful login.
 *
 * Pass `profile` when available so corporate-onboarding completeness is derived from
 * `user_profiles.corporate_id` (DB truth) instead of the localStorage flag. The flag is
 * device-scoped and forces existing users through onboarding on a fresh browser.
 */
export function getPostLoginPath(role: UserRole | null, profile?: UserProfile | null): string {
  if (
    role === 'mogzu_admin' ||
    role === 'account_manager' ||
    role === 'support' ||
    role === 'sales_agent'
  )
    return '/admin'
  if (role === 'field_agent') return '/agent/dashboard'
  if (role === 'vendor') return '/vendor/dashboard'
  if (role === 'partner') return '/partner/dashboard'
  if (isCorporateRole(role)) {
    const onboarding = getCorporateOnboardingPath(profile)
    if (onboarding) return onboarding
    if (!isCorporateOnboardingComplete(profile)) return '/signup/corporate/company-details'
    return '/dashboard'
  }
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

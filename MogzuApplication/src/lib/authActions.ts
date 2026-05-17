// Phase 2 cleanup — auth helpers used outside the useAuth hook
// (OAuth, magic links, password reset, OTP exchange, invite resend).
// Components must call these helpers, never `supabase.auth.*` directly.

import { supabase } from './supabase'
import { getAuthCallbackUrl } from './authRedirect'

export type Provider = 'google' | 'apple' | 'github' | 'azure' | 'facebook'

function fmt(error: { message: string } | null | undefined): string | null {
  return error?.message ?? null
}

export const authActions = {
  // ─── sign in variants ─────────────────────────────────────────────────────

  signInWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error: fmt(error) }
  },

  signInWithOAuth: async (provider: Provider, redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo ?? getAuthCallbackUrl() },
    })
    return { data, error: fmt(error) }
  },

  signInWithOtp: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getAuthCallbackUrl() },
    })
    return { error: fmt(error) }
  },

  // ─── sign-up + invite ─────────────────────────────────────────────────────

  signUp: async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: getAuthCallbackUrl() },
    })
    return { data, error: fmt(error) }
  },

  resendConfirmation: async (email: string, type: 'signup' | 'email_change' = 'signup') => {
    const { error } = await supabase.auth.resend({
      type,
      email,
      options: { emailRedirectTo: getAuthCallbackUrl() },
    })
    return { error: fmt(error) }
  },

  // ─── session lifecycle ────────────────────────────────────────────────────

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error: fmt(error) }
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error: fmt(error) }
  },

  exchangeCodeForSession: async (code: string) => {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    return { data, error: fmt(error) }
  },

  // ─── password reset / update ──────────────────────────────────────────────

  resetPasswordForEmail: async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? getAuthCallbackUrl(),
    })
    return { error: fmt(error) }
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: fmt(error) }
  },
}

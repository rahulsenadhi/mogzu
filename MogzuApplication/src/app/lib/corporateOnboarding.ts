import { db } from '@/lib/db'
import type { UserProfile } from '@/lib/database.types'

const STORAGE_KEY = 'mogzu_corporate_onboarding'
const COMPLETE_KEY = 'mogzu_corporate_onboarding_complete'

export type CorporateOnboardingStep = 'company-details' | 'interests' | 'access' | 'complete'

export interface CorporateOnboardingDraft {
  step: CorporateOnboardingStep
  companyDetails?: Record<string, unknown>
  interests?: string[]
  accessLevel?: string
  updatedAt: string
}

export function getCorporateOnboardingDraft(): CorporateOnboardingDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CorporateOnboardingDraft
  } catch {
    return null
  }
}

export function saveCorporateOnboardingDraft(patch: Partial<CorporateOnboardingDraft>) {
  if (typeof window === 'undefined') return
  const prev = getCorporateOnboardingDraft()
  const next: CorporateOnboardingDraft = {
    step: patch.step ?? prev?.step ?? 'company-details',
    companyDetails: patch.companyDetails ?? prev?.companyDetails,
    interests: patch.interests ?? prev?.interests,
    accessLevel: patch.accessLevel ?? prev?.accessLevel,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

/**
 * Onboarding completeness is DB-truth: a user is "onboarded" once user_profiles.corporate_id is set.
 * Pass the loaded profile when available. Falls back to a localStorage flag only when no profile is
 * supplied (e.g. pre-auth contexts or legacy callers) so behaviour stays defined.
 */
export function isCorporateOnboardingComplete(profile?: UserProfile | null): boolean {
  if (profile?.corporate_id) return true
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COMPLETE_KEY) === 'true'
}

export function setCorporateOnboardingComplete(complete: boolean) {
  if (typeof window === 'undefined') return
  if (complete) localStorage.setItem(COMPLETE_KEY, 'true')
  else localStorage.removeItem(COMPLETE_KEY)
}

export function getCorporateOnboardingPath(profile?: UserProfile | null): string | null {
  if (isCorporateOnboardingComplete(profile)) return null
  const draft = getCorporateOnboardingDraft()
  const step = draft?.step ?? 'company-details'
  if (step === 'company-details') return '/signup/corporate/company-details'
  if (step === 'interests') return '/signup/corporate/interests'
  if (step === 'access') return '/signup/corporate/access'
  return null
}

export async function validateCorporateEmailDomain(email: string): Promise<{
  ok: boolean
  corporateId?: string
  message?: string
}> {
  const domain = email.split('@')[1]?.trim().toLowerCase()
  if (!domain) {
    return { ok: false, message: 'Enter a valid corporate email address.' }
  }
  const { data, error } = await db.corporateAccounts.getByDomain(domain)
  if (error || !data) {
    return {
      ok: false,
      message:
        'This email domain is not registered. Contact your HR admin to invite you or register your company.',
    }
  }
  if (data.status !== 'active') {
    return { ok: false, message: 'Your company account is not active. Contact your HR admin.' }
  }
  return { ok: true, corporateId: data.id }
}

export async function linkProfileToCorporate(
  userId: string,
  corporateId: string,
  fullName?: string,
): Promise<{ error: string | null }> {
  const { supabase } = await import('@/lib/supabase')
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('user_profiles')
    .update({
      corporate_id: corporateId,
      full_name: fullName ?? undefined,
      updated_at: now,
    })
    .eq('id', userId)
  if (error) return { error: error.message }
  return { error: null }
}

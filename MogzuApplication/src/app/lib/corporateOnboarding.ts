import { db } from '@/lib/db'
import type { ModuleId, UserProfile } from '@/lib/database.types'

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

export async function setCorporateRegion(
  corporateId: string,
  region: string,
  defaultCurrency: string | null,
): Promise<{ error: string | null }> {
  const { supabase } = await import('@/lib/supabase')
  const { error } = await supabase
    .from('corporate_accounts')
    .update({ region, default_currency: defaultCurrency })
    .eq('id', corporateId)
  return { error: error?.message ?? null }
}

export async function linkProfileToCorporate(
  userId: string,
  corporateId: string,
  fullName?: string,
  role: UserProfile['role'] = 'l3_admin',
): Promise<{ error: string | null }> {
  const { supabase } = await import('@/lib/supabase')
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('user_profiles')
    .update({
      corporate_id: corporateId,
      full_name: fullName ?? undefined,
      role,
      updated_at: now,
    })
    .eq('id', userId)
  if (error) return { error: error.message }
  return { error: null }
}

const DEFAULT_MODULES: Record<ModuleId, boolean> = {
  events: true,
  gifting: true,
  spacex_coworking: true,
  spacex_stay: false,
}

export function interestIdsToModulesEnabled(interestIds: string[] | undefined): Record<ModuleId, boolean> {
  const enabled = { ...DEFAULT_MODULES }
  if (!interestIds?.length) return enabled
  const set = new Set(interestIds)
  enabled.events = set.has('event') || set.has('spacex')
  enabled.gifting = set.has('gifting')
  enabled.spacex_coworking = set.has('spacex')
  enabled.spacex_stay = false
  return enabled
}

export function accessLevelToPlan(accessLevel: string | undefined): 'starter' | 'growth' | 'enterprise' {
  switch (accessLevel) {
    case 'enterprise':
    case 'business-plus':
      return 'enterprise'
    case 'professional':
      return 'growth'
    case 'free-trial':
    default:
      return 'starter'
  }
}

export async function ensureCorporateAccount(params: {
  companyName: string
  domain: string
  region?: string
  defaultCurrency?: string | null
}): Promise<{ corporateId: string | null; error: string | null; created: boolean }> {
  const domain = params.domain.trim().toLowerCase()
  if (!domain) return { corporateId: null, error: 'Invalid email domain.', created: false }

  const existing = await db.corporateAccounts.getByDomain(domain)
  if (existing.data?.id) {
    return { corporateId: existing.data.id, error: null, created: false }
  }

  const { data, error } = await db.corporateAccounts.create({
    name: params.companyName.trim() || domain,
    domain,
    plan: 'starter',
    status: 'active',
    account_manager_id: null,
    modules_enabled: { ...DEFAULT_MODULES },
    region: params.region ?? 'IN',
    default_currency: params.defaultCurrency ?? 'INR',
  })

  if (error || !data?.id) {
    return { corporateId: null, error: error?.message ?? 'Could not register company.', created: false }
  }
  return { corporateId: data.id, error: null, created: true }
}

export async function finalizeCorporateOnboarding(params: {
  userId: string
  corporateId: string | null | undefined
  accessLevel: string
  draft: CorporateOnboardingDraft | null
}): Promise<{ error: string | null }> {
  const { userId, accessLevel, draft } = params
  let corporateId = params.corporateId ?? null

  if (!corporateId && draft?.companyDetails) {
    const details = draft.companyDetails as { email?: string; companyName?: string; region?: string }
    const email = typeof details.email === 'string' ? details.email.trim().toLowerCase() : ''
    const domain = email.split('@')[1]?.trim().toLowerCase() ?? ''
    const companyName = typeof details.companyName === 'string' ? details.companyName : domain
    const regionOpt = typeof details.region === 'string' ? details.region : 'IN'
    const ensured = await ensureCorporateAccount({
      companyName,
      domain,
      region: regionOpt,
    })
    if (ensured.error) return { error: ensured.error }
    corporateId = ensured.corporateId
  }

  if (!corporateId) {
    return { error: 'Company profile is missing. Complete company details first.' }
  }

  const modules_enabled = interestIdsToModulesEnabled(draft?.interests)
  const plan = accessLevelToPlan(accessLevel)

  const { error: corpError } = await db.corporateAccounts.update(corporateId, {
    plan,
    modules_enabled,
  })
  if (corpError) return { error: corpError.message }

  const fullName =
    typeof draft?.companyDetails === 'object' &&
    draft.companyDetails &&
    typeof (draft.companyDetails as { fullName?: string }).fullName === 'string'
      ? (draft.companyDetails as { fullName: string }).fullName
      : undefined

  const { error: linkError } = await linkProfileToCorporate(userId, corporateId, fullName, 'l3_admin')
  if (linkError) return { error: linkError }

  setCorporateOnboardingComplete(true)
  return { error: null }
}

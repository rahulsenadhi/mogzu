// Phase 5 Feature 2 — vendor self-serve onboarding.
//
// Anonymous applicants submit through the public form; admin reviews
// in the admin console. KYC providers (Persona / Onfido) plug in at
// the kyc_session_id column — actual handoff lands in P5 sprint
// implementing the provider flow.

import { supabase } from './supabase'

export const REGIONS = ['in', 'sg', 'ae', 'us', 'uk', 'eu'] as const
export type Region = (typeof REGIONS)[number]

export const ONBOARDING_STATUSES = [
  'submitted',
  'kyc_in_review',
  'awaiting_admin',
  'approved',
  'rejected',
] as const
export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number]

export const KYC_STATUSES = ['pending', 'approved', 'review', 'rejected'] as const
export type KycStatus = (typeof KYC_STATUSES)[number]

export type VendorApplication = {
  id: string
  applicant_email: string
  applicant_name: string
  business_name: string
  region: Region
  kyc_provider: 'persona' | 'onfido' | 'manual' | null
  kyc_session_id: string | null
  kyc_status: KycStatus
  payout_method: Record<string, unknown> | null
  catalogue_draft: unknown[]
  sla_signed_at: string | null
  vendor_id: string | null
  status: OnboardingStatus
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export async function submitApplication(payload: {
  applicant_email: string
  applicant_name: string
  business_name: string
  region: Region
  kyc_provider?: 'persona' | 'onfido' | 'manual'
  payout_method?: Record<string, unknown>
  catalogue_draft?: unknown[]
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('submit_vendor_application', {
    p_payload: payload,
  })
  if (error) return { id: null, error: error.message }
  return { id: data as string, error: null }
}

export async function listApplications(
  status?: OnboardingStatus,
): Promise<{ data: VendorApplication[]; error: string | null }> {
  let q = supabase
    .from('vendor_onboarding_applications')
    .select('*')
    .order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as VendorApplication[], error: null }
}

export async function setStatus(
  id: string,
  status: OnboardingStatus,
  notes?: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('vendor_onboarding_applications')
    .update({
      status,
      admin_notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function setKycStatus(
  id: string,
  kycStatus: KycStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('vendor_onboarding_applications')
    .update({ kyc_status: kycStatus })
    .eq('id', id)
  return { error: error?.message ?? null }
}

// Phase 3 Feature 5 (part 1) — SSO config service.

import { supabase } from './supabase'

export type SsoProvider =
  | 'okta'
  | 'azure_ad'
  | 'google_workspace'
  | 'onelogin'
  | 'generic_saml'

export const SSO_PROVIDERS: { value: SsoProvider; label: string }[] = [
  { value: 'okta', label: 'Okta' },
  { value: 'azure_ad', label: 'Microsoft Entra (Azure AD)' },
  { value: 'google_workspace', label: 'Google Workspace' },
  { value: 'onelogin', label: 'OneLogin' },
  { value: 'generic_saml', label: 'Generic SAML 2.0' },
]

export type SsoConfig = {
  id: string
  corporate_id: string
  provider: SsoProvider
  display_name: string | null
  entity_id: string
  sso_url: string
  acs_url: string | null
  certificate: string
  email_domain: string
  email_attribute_name: string
  enforce_sso: boolean
  is_active: boolean
  last_tested_at: string | null
  last_tested_status: 'ok' | 'failed' | null
  last_tested_error: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type SsoConfigDraft = Omit<
  SsoConfig,
  'id' | 'created_by' | 'created_at' | 'updated_at' | 'last_tested_at' | 'last_tested_status' | 'last_tested_error'
> & { id?: string }

export async function listSsoConfigs(): Promise<{ data: SsoConfig[]; error: string | null }> {
  const { data, error } = await supabase
    .from('sso_config')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as SsoConfig[], error: null }
}

export async function getSsoConfigByCorporate(
  corporateId: string,
): Promise<{ data: SsoConfig | null; error: string | null }> {
  const { data, error } = await supabase
    .from('sso_config')
    .select('*')
    .eq('corporate_id', corporateId)
    .maybeSingle()
  if (error) return { data: null, error: error.message }
  return { data: data as SsoConfig | null, error: null }
}

export async function upsertSsoConfig(
  draft: SsoConfigDraft,
  createdBy: string,
): Promise<{ data: SsoConfig | null; error: string | null }> {
  const payload = {
    ...draft,
    email_domain: draft.email_domain.trim().toLowerCase(),
    created_by: createdBy,
  }
  if (draft.id) {
    const { data, error } = await supabase
      .from('sso_config')
      .update(payload)
      .eq('id', draft.id)
      .select('*')
      .single()
    if (error) return { data: null, error: error.message }
    return { data: data as SsoConfig, error: null }
  }
  const { data, error } = await supabase
    .from('sso_config')
    .insert(payload)
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as SsoConfig, error: null }
}

// Test endpoint — full SAML probe lands in part 2. For now we record
// the test attempt + result so admin sees the last-tested badge.
export async function recordSsoTest(
  id: string,
  status: 'ok' | 'failed',
  error: string | null,
): Promise<{ error: string | null }> {
  const { error: err } = await supabase
    .from('sso_config')
    .update({
      last_tested_at: new Date().toISOString(),
      last_tested_status: status,
      last_tested_error: error,
    })
    .eq('id', id)
  return { error: err?.message ?? null }
}

// JIT corporate provisioning — call after a SAML-authenticated user
// lands on /auth/callback. Server-side function reads the active
// sso_config matching the email domain and binds the profile.
export async function jitProvisionSsoUser(email: string): Promise<{
  data:
    | {
        profile_id: string
        corporate_id: string | null
        role: string | null
        was_provisioned: boolean
      }
    | null
  error: string | null
}> {
  const { data, error } = await supabase.rpc('jit_provision_sso_user', { p_email: email })
  if (error) return { data: null, error: error.message }
  const row = Array.isArray(data) ? data[0] : data
  return { data: row ?? null, error: null }
}

// Domain → corporate routing preview, used by both the admin Test
// button now and the login form's pre-SSO redirect in part 2.
export async function resolveSsoForEmail(
  email: string,
): Promise<{
  data:
    | {
        config_id: string
        corporate_id: string
        provider: SsoProvider
        sso_url: string
        enforce_sso: boolean
      }
    | null
  error: string | null
}> {
  const { data, error } = await supabase.rpc('resolve_sso_for_email', { p_email: email })
  if (error) return { data: null, error: error.message }
  const row = Array.isArray(data) ? data[0] : data
  return { data: row ?? null, error: null }
}

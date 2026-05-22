// Phase 5 Feature 4 — white-label partner service.

import { supabase } from './supabase'

export const COMMERCIAL_MODELS = [
  'revenue_share',
  'flat_infra_fee',
  'per_corporate_seat',
] as const
export type CommercialModel = (typeof COMMERCIAL_MODELS)[number]

export type WhiteLabelPartner = {
  id: string
  slug: string
  business_name: string
  primary_color: string
  secondary_color: string
  logo_url: string | null
  contact_email: string
  contact_phone: string | null
  commercial_model: CommercialModel
  revenue_share_pct: number | null
  flat_fee_monthly: number | null
  per_seat_fee: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export async function listPartners(): Promise<{
  data: WhiteLabelPartner[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('white_label_partners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as WhiteLabelPartner[], error: null }
}

export async function getBySlug(
  slug: string,
): Promise<{ data: WhiteLabelPartner | null; error: string | null }> {
  const { data, error } = await supabase
    .from('white_label_partners')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) return { data: null, error: error.message }
  return { data: (data ?? null) as WhiteLabelPartner | null, error: null }
}

export async function upsertPartner(
  payload: Partial<WhiteLabelPartner> & {
    business_name: string
    slug: string
    contact_email: string
    commercial_model: CommercialModel
  },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('white_label_partners')
    .upsert(payload, { onConflict: 'slug' })
  return { error: error?.message ?? null }
}

export async function getById(
  id: string,
): Promise<{ data: WhiteLabelPartner | null; error: string | null }> {
  const { data, error } = await supabase
    .from('white_label_partners')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) return { data: null, error: error.message }
  return { data: (data ?? null) as WhiteLabelPartner | null, error: null }
}

export async function updatePartner(
  id: string,
  patch: Partial<WhiteLabelPartner>,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('white_label_partners')
    .update(patch)
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function setActive(
  id: string,
  isActive: boolean,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('white_label_partners')
    .update({ is_active: isActive })
    .eq('id', id)
  return { error: error?.message ?? null }
}

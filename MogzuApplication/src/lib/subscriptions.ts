// Phase 4 Feature 2 — SaaS subscription billing service.
//
// Mogzu-only bookkeeping for the first cut: plans + subscriptions live
// in the DB, admins move corporates between tiers, dunning is manual.
// The Stripe / Razorpay integration that mirrors this state lives in a
// separate worker (Sprint 32 reconciliation cron).

import { supabase } from './supabase'

export type PlanTier = 'free' | 'growth' | 'enterprise'

export type PlanFeatureFlags = {
  sso_enabled: boolean
  ai_agents_count: number
  custom_contracts: boolean
  audit_export: boolean
}

export type Plan = {
  id: string
  name: string
  tier: PlanTier
  monthly_per_seat: number
  annual_per_seat: number | null
  currency: string
  feature_flags: PlanFeatureFlags
  is_active: boolean
  display_order: number
  created_at: string
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'paused'

export type Subscription = {
  id: string
  corporate_id: string
  plan_id: string
  status: SubscriptionStatus
  seat_count: number
  current_period_starts_on: string
  current_period_ends_on: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  razorpay_subscription_id: string | null
  dunning_attempts: number
  last_payment_attempt_at: string | null
  last_payment_error: string | null
  created_at: string
  updated_at: string
}

export type SubscriptionWithPlan = Subscription & { plan?: Plan | null }

export async function listPlans(): Promise<{ data: Plan[]; error: string | null }> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Plan[], error: null }
}

export async function listSubscriptions(): Promise<{
  data: SubscriptionWithPlan[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .order('updated_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as SubscriptionWithPlan[], error: null }
}

export async function getSubscriptionByCorporate(
  corporateId: string,
): Promise<{ data: SubscriptionWithPlan | null; error: string | null }> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('corporate_id', corporateId)
    .maybeSingle()
  if (error) return { data: null, error: error.message }
  return { data: (data ?? null) as SubscriptionWithPlan | null, error: null }
}

export async function upsertSubscription(payload: {
  corporate_id: string
  plan_id: string
  seat_count: number
  status?: SubscriptionStatus
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        corporate_id: payload.corporate_id,
        plan_id: payload.plan_id,
        seat_count: payload.seat_count,
        status: payload.status ?? 'active',
      },
      { onConflict: 'corporate_id' },
    )
  return { error: error?.message ?? null }
}

export async function changePlan(
  subscriptionId: string,
  planId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ plan_id: planId })
    .eq('id', subscriptionId)
  return { error: error?.message ?? null }
}

export async function setSeats(
  subscriptionId: string,
  seatCount: number,
): Promise<{ error: string | null }> {
  if (!Number.isFinite(seatCount) || seatCount < 1) {
    return { error: 'seat_count must be at least 1' }
  }
  const { error } = await supabase
    .from('subscriptions')
    .update({ seat_count: seatCount })
    .eq('id', subscriptionId)
  return { error: error?.message ?? null }
}

export async function setSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('id', subscriptionId)
  return { error: error?.message ?? null }
}

// Pure feature-flag check. Components that gate UI on a plan capability
// call hasFeature(sub.plan, 'sso_enabled'). Keep this side-effect-free
// so it stays unit-testable.
export function hasFeature(
  plan: Plan | null | undefined,
  feature: keyof PlanFeatureFlags,
): boolean {
  if (!plan) return false
  const v = plan.feature_flags?.[feature]
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v > 0
  return false
}

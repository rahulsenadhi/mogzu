import type { UserProfile } from '@/lib/database.types'
import { listLeadOwners } from '@/lib/publicLeads'

/** Demo assignees when Supabase has no staff rows (local preview). */
export const DEMO_LEAD_ASSIGNEES: UserProfile[] = [
  {
    id: 'demo-owner-sales',
    corporate_id: null,
    vendor_id: null,
    role: 'sales_agent',
    available_roles: ['sales_agent'],
    full_name: 'Priya — Sales',
    phone: null,
    avatar_url: null,
    department: 'Sales',
    status: 'active',
    invited_by: null,
    invited_at: null,
    locale: 'en',
    preferred_currency: null,
    push_subscription: null,
    push_opt_in_at: null,
    push_declined_at: null,
    dashboard_widgets: null,
    created_at: '',
    updated_at: '',
    email: 'sales@mogzu.local',
  } as UserProfile & { email: string },
  {
    id: 'demo-owner-support',
    corporate_id: null,
    vendor_id: null,
    role: 'support',
    available_roles: ['support'],
    full_name: 'Arjun — Support',
    phone: null,
    avatar_url: null,
    department: 'Support',
    status: 'active',
    invited_by: null,
    invited_at: null,
    locale: 'en',
    preferred_currency: null,
    push_subscription: null,
    push_opt_in_at: null,
    push_declined_at: null,
    dashboard_widgets: null,
    created_at: '',
    updated_at: '',
    email: 'support@mogzu.local',
  } as UserProfile & { email: string },
]

type AssigneeRow = UserProfile & { email?: string | null }

function dedupeAssignees(rows: AssigneeRow[]): AssigneeRow[] {
  const seen = new Set<string>()
  const out: AssigneeRow[] = []
  for (const row of rows) {
    if (!row.id || seen.has(row.id)) continue
    seen.add(row.id)
    out.push(row)
  }
  return out
}

/** Staff picker list — includes current user even when RLS only returned self. */
export async function listLeadAssigneesForPicker(
  currentUser?: Pick<UserProfile, 'id' | 'full_name' | 'email' | 'role' | 'status'> | null,
  isDemo = false,
): Promise<{ data: AssigneeRow[]; error: string | null }> {
  if (isDemo) {
    const base = [...DEMO_LEAD_ASSIGNEES]
    if (currentUser?.id) {
      base.unshift({
        ...DEMO_LEAD_ASSIGNEES[0],
        id: currentUser.id,
        full_name: currentUser.full_name,
        email: (currentUser as AssigneeRow).email ?? 'you@mogzu.local',
        role: currentUser.role,
        status: 'active',
      })
    }
    return { data: dedupeAssignees(base), error: null }
  }

  const { data, error } = await listLeadOwners()
  const merged: AssigneeRow[] = [...(data as AssigneeRow[])]

  if (currentUser?.id && currentUser.status === 'active') {
    const exists = merged.some((o) => o.id === currentUser.id)
    if (!exists) {
      merged.unshift({
        id: currentUser.id,
        corporate_id: null,
        vendor_id: null,
        role: currentUser.role,
        available_roles: [currentUser.role],
        full_name: currentUser.full_name,
        phone: null,
        avatar_url: null,
        department: null,
        status: 'active',
        invited_by: null,
        invited_at: null,
        locale: 'en',
        preferred_currency: null,
        push_subscription: null,
        push_opt_in_at: null,
        push_declined_at: null,
        dashboard_widgets: null,
        created_at: '',
        updated_at: '',
        email: (currentUser as AssigneeRow).email ?? null,
      })
    }
  }

  if (merged.length === 0) {
    return {
      data: dedupeAssignees(DEMO_LEAD_ASSIGNEES),
      error:
        error ??
        'No staff profiles loaded. Apply migration 20260525000001_staff_read_lead_assignees.sql or use demo assignees below.',
    }
  }

  return { data: dedupeAssignees(merged), error }
}

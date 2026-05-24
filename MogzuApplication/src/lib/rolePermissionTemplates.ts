import type { PermissionAction, PermissionResource, UserRole } from './database.types'

const STORAGE_KEY = 'mogzu_role_permission_templates_v1'

export const MATRIX_RESOURCES: PermissionResource[] = [
  'bookings',
  'listings',
  'partners',
  'vendors',
  'corporate_accounts',
  'gifting',
  'support',
  'reports',
]

export const MATRIX_ACTIONS: PermissionAction[] = ['view', 'create', 'update', 'delete', 'approve']

export const INTERNAL_TEAM_ROLES: UserRole[] = [
  'mogzu_admin',
  'account_manager',
  'support',
  'sales_agent',
  'field_agent',
  'partner',
]

export type PermissionCell = `${PermissionResource}.${PermissionAction}`

type TemplatesState = Partial<Record<UserRole, Record<PermissionCell, boolean>>>

function safeParse(raw: string | null): TemplatesState {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as TemplatesState
  } catch {
    return {}
  }
}

export function buildDefaultTemplate(role: UserRole): Record<PermissionCell, boolean> {
  const out = {} as Record<PermissionCell, boolean>
  for (const r of MATRIX_RESOURCES) {
    for (const a of MATRIX_ACTIONS) {
      out[`${r}.${a}`] = false
    }
  }

  if (role === 'mogzu_admin') {
    for (const r of MATRIX_RESOURCES) {
      for (const a of MATRIX_ACTIONS) {
        out[`${r}.${a}`] = true
      }
    }
    return out
  }

  // Minimal, opinionated role seeds. Admin can override on the role page.
  if (role === 'support') {
    out['bookings.view'] = true
    out['support.view'] = true
    out['support.update'] = true
    out['corporate_accounts.view'] = true
  } else if (role === 'sales_agent') {
    out['corporate_accounts.view'] = true
    out['partners.view'] = true
    out['reports.view'] = true
  } else if (role === 'field_agent') {
    out['bookings.view'] = true
    out['bookings.update'] = true
  } else if (role === 'account_manager') {
    out['bookings.view'] = true
    out['corporate_accounts.view'] = true
    out['corporate_accounts.update'] = true
    out['reports.view'] = true
    out['support.view'] = true
  } else if (role === 'partner') {
    out['partners.view'] = true
    out['bookings.view'] = true
    out['reports.view'] = true
  }

  return out
}

export function getRoleTemplate(role: UserRole): Record<PermissionCell, boolean> {
  if (typeof localStorage === 'undefined') return buildDefaultTemplate(role)
  const all = safeParse(localStorage.getItem(STORAGE_KEY))
  const saved = all[role]
  if (!saved) return buildDefaultTemplate(role)
  return { ...buildDefaultTemplate(role), ...saved }
}

export function saveRoleTemplate(role: UserRole, template: Record<PermissionCell, boolean>): void {
  if (typeof localStorage === 'undefined') return
  const all = safeParse(localStorage.getItem(STORAGE_KEY))
  all[role] = template
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

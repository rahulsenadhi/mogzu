// Phase 3 Feature 6 — audit log query + export service.

import { supabase } from './supabase'

export type AuditEvent = {
  id: string
  actor_id: string | null
  action: string
  resource_kind: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  at: string
  source: string
}

export type AuditFilters = {
  from: Date
  to: Date
  actorId?: string | null
  action?: string | null
  resourceKind?: string | null
  limit?: number
}

export async function listAuditEvents(
  filters: AuditFilters,
): Promise<{ data: AuditEvent[]; error: string | null }> {
  let q = supabase
    .from('audit_events_unified')
    .select('*')
    .gte('at', filters.from.toISOString())
    .lt('at', filters.to.toISOString())
    .order('at', { ascending: false })
    .limit(filters.limit ?? 200)

  if (filters.actorId) q = q.eq('actor_id', filters.actorId)
  if (filters.action) q = q.eq('action', filters.action)
  if (filters.resourceKind) q = q.eq('resource_kind', filters.resourceKind)

  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AuditEvent[], error: null }
}

export async function exportAuditEvents(
  filters: AuditFilters,
): Promise<{ data: AuditEvent[]; error: string | null }> {
  const { data, error } = await supabase.rpc('export_audit_events', {
    p_from: filters.from.toISOString(),
    p_to: filters.to.toISOString(),
    p_actor_id: filters.actorId ?? null,
    p_action: filters.action ?? null,
    p_resource_kind: filters.resourceKind ?? null,
  })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AuditEvent[], error: null }
}

// Browser-side CSV builder. Quotes strings that contain commas, quotes,
// or newlines per RFC 4180. Use exportAuditEvents() upstream to get
// the rows.
export function toCsv(rows: AuditEvent[]): string {
  const cols = ['at', 'actor_id', 'action', 'resource_kind', 'resource_id', 'source', 'ip_address', 'user_agent', 'metadata']
  const escape = (val: unknown) => {
    if (val == null) return ''
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [cols.join(',')]
  for (const r of rows) {
    lines.push(cols.map((c) => escape((r as any)[c])).join(','))
  }
  return lines.join('\n')
}

export function downloadCsv(rows: AuditEvent[], filename: string) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

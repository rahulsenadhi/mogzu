import type { EnquiryVertical } from '@/lib/leadEnquiryVertical'
import { ENQUIRY_VERTICALS } from '@/lib/leadEnquiryVertical'
import type { LeadSourceFilter } from '@/lib/leadSources'
import { LEAD_SOURCE_FILTERS } from '@/lib/leadSources'
import { LEAD_QUICK_FILTERS, type LeadQuickFilter } from '@/lib/leadTriageUtils'
import type { LeadStatus } from '@/lib/publicLeads'

const STORAGE_KEY = 'mogzu_lead_ops_saved_views_v1'
const MAX_VIEWS_PER_SURFACE = 12

export type LeadInboxFilterSnapshot = {
  kind: 'inbox'
  search: string
  statusFilter: LeadStatus | 'all'
  vertical: EnquiryVertical
  sourceFilter: LeadSourceFilter
  quickFilter: LeadQuickFilter
}

export type LeadPipelineFilterSnapshot = {
  kind: 'pipeline'
  search: string
  quickFilter: LeadQuickFilter
}

export type LeadFilterSnapshot = LeadInboxFilterSnapshot | LeadPipelineFilterSnapshot

export type LeadSavedView = {
  id: string
  name: string
  snapshot: LeadFilterSnapshot
  createdAt: string
}

const STATUS_LABELS: Record<LeadStatus | 'all', string> = {
  all: 'All statuses',
  new: 'New',
  assigned: 'Assigned',
  qualified: 'Qualified',
  converted: 'Won',
  closed: 'Closed',
  spam: 'Spam',
}

function readAll(): LeadSavedView[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (v): v is LeadSavedView =>
        v != null &&
        typeof v === 'object' &&
        typeof (v as LeadSavedView).id === 'string' &&
        typeof (v as LeadSavedView).name === 'string' &&
        (v as LeadSavedView).snapshot != null,
    )
  } catch {
    return []
  }
}

function writeAll(views: LeadSavedView[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views))
}

export function listLeadSavedViews(surface: 'inbox' | 'pipeline'): LeadSavedView[] {
  return readAll()
    .filter((v) => v.snapshot.kind === surface)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function saveLeadSavedView(name: string, snapshot: LeadFilterSnapshot): LeadSavedView | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const surface = snapshot.kind
  const existing = listLeadSavedViews(surface)
  if (existing.length >= MAX_VIEWS_PER_SURFACE) return null

  const view: LeadSavedView = {
    id: `lv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: trimmed.slice(0, 48),
    snapshot,
    createdAt: new Date().toISOString(),
  }
  writeAll([view, ...readAll()])
  return view
}

export function deleteLeadSavedView(id: string): void {
  writeAll(readAll().filter((v) => v.id !== id))
}

export function snapshotsEqual(a: LeadFilterSnapshot, b: LeadFilterSnapshot): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'pipeline' && b.kind === 'pipeline') {
    return a.search === b.search && a.quickFilter === b.quickFilter
  }
  if (a.kind === 'inbox' && b.kind === 'inbox') {
    return (
      a.search === b.search &&
      a.statusFilter === b.statusFilter &&
      a.vertical === b.vertical &&
      a.sourceFilter === b.sourceFilter &&
      a.quickFilter === b.quickFilter
    )
  }
  return false
}

export function suggestLeadSavedViewName(snapshot: LeadFilterSnapshot): string {
  const parts: string[] = []

  if (snapshot.kind === 'inbox') {
    if (snapshot.statusFilter !== 'all') parts.push(STATUS_LABELS[snapshot.statusFilter])
    if (snapshot.vertical !== 'all') {
      parts.push(ENQUIRY_VERTICALS.find((v) => v.id === snapshot.vertical)?.label ?? snapshot.vertical)
    }
    if (snapshot.sourceFilter !== 'all') {
      parts.push(LEAD_SOURCE_FILTERS.find((s) => s.id === snapshot.sourceFilter)?.label ?? snapshot.sourceFilter)
    }
    if (snapshot.quickFilter !== 'all') {
      parts.push(LEAD_QUICK_FILTERS.find((p) => p.id === snapshot.quickFilter)?.label ?? snapshot.quickFilter)
    }
    if (snapshot.search.trim()) parts.push(`"${snapshot.search.trim().slice(0, 24)}"`)
  } else {
    if (snapshot.quickFilter !== 'all') {
      parts.push(LEAD_QUICK_FILTERS.find((p) => p.id === snapshot.quickFilter)?.label ?? snapshot.quickFilter)
    }
    if (snapshot.search.trim()) parts.push(`"${snapshot.search.trim().slice(0, 24)}"`)
  }

  return parts.length > 0 ? parts.join(' · ') : 'My view'
}

export function describeLeadSavedView(view: LeadSavedView): string {
  return suggestLeadSavedViewName(view.snapshot)
}

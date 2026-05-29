import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Calendar, ChevronDown, Mail, Phone, Share2, UserRound, X } from 'lucide-react'
import { LeadFlowStepper } from '@/app/components/leads/LeadFlowStepper'
import { LeadOpsBanner } from '@/app/components/leads/LeadOpsBanner'
import { LeadSourceBadge } from '@/app/components/leads/LeadSourceBadge'
import { LeadStatusBadge } from '@/app/components/leads/LeadStatusBadge'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { inferLeadVertical } from '@/lib/leadEnquiryVertical'
import { findDuplicateLeads } from '@/lib/leadDuplicates'
import { getLeadOwnerLabel } from '@/lib/leadFlow'
import { formatReferrerLine } from '@/lib/leadSources'
import type { UserProfile } from '@/lib/database.types'
import { listLeadAssigneesForPicker } from '@/lib/leadAssignees'
import { useAuth } from '@/lib/auth'
import {
  assignLeadOwner,
  BUDGET_BANDS,
  linkRelatedLead,
  markLeadCatalogueSent,
  TIMELINES,
  updateLeadMetadata,
  updateLeadStatus,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'
import { LEAD_STATUS_LABELS } from '@/lib/leadStatusUi'

const STATUS_ACTIONS: LeadStatus[] = ['assigned', 'qualified', 'converted', 'closed', 'spam']
type TimelineEntry = { from?: string; to: string; at: string }
function fmtWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
type LeadDetailDrawerProps = {
  lead: PublicLead
  allLeads: PublicLead[]
  isDemo: boolean
  busy: boolean
  layout?: 'overlay' | 'inline'
  currentUserId?: string | null
  currentUserName?: string | null
  onClose: () => void
  onUpdated: () => void
  onBusyChange: (id: string | null) => void
  onQuickShare: (lead: PublicLead, module: 'gifting' | 'events') => void
  onOpenLead?: (lead: PublicLead) => void
  onDemoPatch?: (leadId: string, patch: Partial<PublicLead>) => void
}
export function LeadDetailDrawer({
  lead,
  allLeads,
  isDemo,
  busy,
  currentUserId,
  currentUserName,
  onClose,
  onUpdated,
  onBusyChange,
  onQuickShare,
  onOpenLead,
  onDemoPatch,
  layout = 'overlay',
}: LeadDetailDrawerProps) {
  const { profile } = useAuth()
  const [internalNotes, setInternalNotes] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [owners, setOwners] = useState<UserProfile[]>([])
  const [ownersLoadError, setOwnersLoadError] = useState('')
  const [ownerPick, setOwnerPick] = useState('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  useEffect(() => {
    const notes =
      typeof lead.metadata?.internal_notes === 'string' ? lead.metadata.internal_notes : ''
    setInternalNotes(notes)
    setSaveNotice('')
    const uid = lead.metadata?.owner_user_id
    setOwnerPick(typeof uid === 'string' ? uid : '')
    setShowStatusMenu(false)
  }, [lead.id, lead.metadata])
  useEffect(() => {
    setOwnersLoadError('')
    void listLeadAssigneesForPicker(profile ?? null, isDemo).then(({ data, error }) => {
      setOwners(data)
      if (error) setOwnersLoadError(error)
    })
  }, [isDemo, profile?.id, profile?.full_name, profile?.email, profile?.role, profile?.status])
  const duplicates = useMemo(
    () => findDuplicateLeads(allLeads, lead.client_phone, lead.client_email, lead.id),
    [allLeads, lead.client_email, lead.client_phone, lead.id],
  )
  const vertical = inferLeadVertical(lead)
  const loggedBy =
    typeof lead.metadata?.logged_by_name === 'string' ? lead.metadata.logged_by_name : null
  const ownerLabel = getLeadOwnerLabel(lead)
  const catalogueSent = Boolean(lead.metadata?.quick_share_sent_at)
  const timeline = useMemo(() => {
    const entries: TimelineEntry[] = []
    const hist = lead.metadata?.status_history
    if (Array.isArray(hist)) {
      for (const row of hist) {
        if (row && typeof row === 'object' && 'to' in row && 'at' in row) {
          entries.push(row as TimelineEntry)
        }
      }
    }
    if (entries.length === 0) {
      entries.push({ to: lead.status, at: lead.created_at })
      if (lead.assigned_at) entries.push({ to: 'assigned', at: lead.assigned_at })
      if (lead.updated_at !== lead.created_at) {
        entries.push({ to: lead.status, at: lead.updated_at })
      }
    }
    return [...entries].reverse()
  }, [lead])
  const handleSaveNotes = async () => {
    if (isDemo) {
      setSaveNotice('Demo mode — notes are not persisted.')
      return
    }
    setSavingNotes(true)
    setSaveNotice('')
    const { error } = await updateLeadMetadata(lead.id, {
      internal_notes: internalNotes.trim(),
      notes_updated_at: new Date().toISOString(),
    })
    setSavingNotes(false)
    if (error) {
      setSaveNotice(error)
      return
    }
    setSaveNotice('Notes saved.')
    onUpdated()
  }
  const handleStatus = async (next: LeadStatus) => {
    if (lead.status === next) return
    setShowStatusMenu(false)
    if (isDemo && onDemoPatch) {
      onDemoPatch(lead.id, {
        status: next,
        assigned_at:
          next === 'assigned' && !lead.assigned_at
            ? new Date().toISOString()
            : lead.assigned_at,
      })
      setSaveNotice(`Status → ${LEAD_STATUS_LABELS[next]} (demo).`)
      return
    }
    if (isDemo) {
      setSaveNotice('Demo mode — status not saved.')
      return
    }
    onBusyChange(lead.id)
    const { error } = await updateLeadStatus(lead.id, next, lead)
    onBusyChange(null)
    if (error) setSaveNotice(error)
    else onUpdated()
  }
  const handleAssignOwner = async (userId: string) => {
    if (!userId) {
      if (isDemo && onDemoPatch) {
        onDemoPatch(lead.id, {
          status: lead.status === 'new' ? 'new' : lead.status,
          metadata: {
            ...lead.metadata,
            owner_user_id: undefined,
            owner_display_name: undefined,
            owner_assigned_at: undefined,
          },
        })
        setSaveNotice('Unassigned (demo).')
        return
      }
      if (isDemo) {
        setSaveNotice('Demo mode — assignment not saved.')
        return
      }
      onBusyChange(lead.id)
      const { error } = await assignLeadOwner(lead.id, null, lead)
      onBusyChange(null)
      if (error) setSaveNotice(error)
      else onUpdated()
      return
    }
    const row = owners.find((o) => o.id === userId)
    const display =
      row?.full_name?.trim() ||
      (row as UserProfile & { email?: string })?.email ||
      'Staff'
    if (isDemo && onDemoPatch) {
      const nextStatus: LeadStatus =
        lead.status === 'new' || lead.status === 'assigned' ? 'assigned' : lead.status
      onDemoPatch(lead.id, {
        status: nextStatus,
        assigned_at: new Date().toISOString(),
        metadata: {
          ...lead.metadata,
          owner_user_id: userId,
          owner_display_name: display,
          owner_assigned_at: new Date().toISOString(),
        },
      })
      setSaveNotice(`Assigned to ${display} (demo).`)
      return
    }
    if (isDemo) {
      setSaveNotice('Demo mode — assignment not saved.')
      return
    }
    onBusyChange(lead.id)
    const { error } = await assignLeadOwner(
      lead.id,
      { user_id: userId, display_name: display },
      lead,
    )
    onBusyChange(null)
    if (error) setSaveNotice(error)
    else {
      setSaveNotice(`Assigned to ${display}.`)
      onUpdated()
    }
  }
  const handleAssignToMe = () => {
    if (!currentUserId || !currentUserName) return
    void handleAssignOwner(currentUserId)
  }
  const handleMarkCatalogueSent = async () => {
    if (isDemo) {
      setSaveNotice('Demo mode — not saved.')
      return
    }
    onBusyChange(lead.id)
    const { error } = await markLeadCatalogueSent(lead.id, lead)
    onBusyChange(null)
    if (error) setSaveNotice(error)
    else {
      setSaveNotice('Marked catalogue sent.')
      if (lead.status === 'assigned') await updateLeadStatus(lead.id, 'qualified', lead)
      onUpdated()
    }
  }
  const handleLinkDuplicate = async (relatedId: string) => {
    if (isDemo) return
    onBusyChange(lead.id)
    const { error } = await linkRelatedLead(lead.id, relatedId, lead)
    onBusyChange(null)
    if (error) setSaveNotice(error)
    else {
      setSaveNotice('Linked to related enquiry.')
      onUpdated()
    }
  }
  const panelClass =
    layout === 'inline'
      ? `${LEAD_OPS.surfaceElevated} ${LEAD_OPS.drawerPanelInline}`
      : LEAD_OPS.drawerPanel
  const panel = (
    <aside
      className={panelClass}
      onClick={layout === 'overlay' ? (e) => e.stopPropagation() : undefined}
      aria-labelledby="lead-drawer-title"
    >
      <header className="shrink-0 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="lead-drawer-title" className="truncate text-lg font-semibold text-slate-900">
              {lead.client_name}
            </h2>
            {lead.client_company ? (
              <p className="truncate text-sm text-slate-500">{lead.client_company}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <LeadStatusBadge status={lead.status} size="md" />
              <LeadSourceBadge sourceSlug={lead.source_slug} metadata={lead.metadata} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              <span>
                Owner: <span className="font-semibold text-slate-800">{ownerLabel}</span>
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lead details"
            className={`${LEAD_OPS.ghostBtn} min-h-[40px] min-w-[40px] p-2`}
          >
            <X className="size-5" />
          </button>
        </div>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
        <LeadFlowStepper lead={lead} compact={layout === 'inline'} />
        <section className="space-y-2">
          <h3 className={LEAD_OPS.sectionTitle}>Assign owner</h3>
          {ownersLoadError ? (
            <p className="text-xs text-amber-800">{ownersLoadError}</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            {currentUserId ? (
              <button
                type="button"
                disabled={busy}
                onClick={handleAssignToMe}
                className={`${LEAD_OPS.secondaryBtn} shrink-0 text-xs`}
              >
                Assign to me
              </button>
            ) : null}
            <select
              value={ownerPick}
              disabled={busy || owners.length === 0}
              onChange={(e) => {
                const v = e.target.value
                setOwnerPick(v)
                void handleAssignOwner(v)
              }}
              className={`${LEAD_OPS.input} min-h-[44px] flex-1 text-xs`}
              aria-label="Assign lead owner"
            >
              <option value="">Unassigned</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name?.trim() || (o as UserProfile & { email?: string }).email || o.id}{' '}
                  ({o.role})
                </option>
              ))}
            </select>
          </div>
          {owners.length === 0 ? (
            <p className="text-xs text-slate-500">
              No staff profiles in the picker. Apply Supabase migration{' '}
              <code className="text-[10px]">20260525000001_staff_read_lead_assignees.sql</code> or use
              demo mode.
            </p>
          ) : null}
        </section>
        {duplicates.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
            <p className="font-semibold">Possible duplicate ({duplicates.length})</p>
            <ul className="mt-2 space-y-2">
              {duplicates.slice(0, 4).map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0">
                    {d.client_name}
                    {d.client_company ? ` · ${d.client_company}` : ''} — {LEAD_STATUS_LABELS[d.status]}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    {onOpenLead ? (
                      <button
                        type="button"
                        onClick={() => onOpenLead(d)}
                        className={`${LEAD_OPS.secondaryBtn} min-h-[32px] px-2 py-1 text-[10px]`}
                      >
                        Open
                      </button>
                    ) : null}
                    {!isDemo ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleLinkDuplicate(d.id)}
                        className={`${LEAD_OPS.secondaryBtn} min-h-[32px] px-2 py-1 text-[10px]`}
                      >
                        Link
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <section className="space-y-2">
          <h3 className={LEAD_OPS.sectionTitle}>Contact</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={`mailto:${lead.client_email}`}
              className={`${LEAD_OPS.secondaryBtn} min-h-[44px] justify-start text-xs`}
            >
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{lead.client_email}</span>
            </a>
            {lead.client_phone ? (
              <a
                href={`tel:${lead.client_phone}`}
                className={`${LEAD_OPS.secondaryBtn} min-h-[44px] justify-start text-xs`}
              >
                <Phone className="size-4 shrink-0" />
                <span className="truncate">{lead.client_phone}</span>
              </a>
            ) : null}
          </div>
        </section>
        {lead.requirement_summary ? (
          <section className="space-y-2">
            <h3 className={LEAD_OPS.sectionTitle}>Requirement</h3>
            <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              {lead.requirement_summary}
            </p>
          </section>
        ) : null}
        <section className="grid grid-cols-2 gap-2 text-xs">
          <div className={`${LEAD_OPS.surfaceMuted} p-3`}>
            <p className="text-slate-500">Vertical</p>
            <p className="mt-0.5 font-semibold capitalize text-slate-800">
              {vertical === 'all' ? 'Unspecified' : vertical}
            </p>
          </div>
          <div className={`${LEAD_OPS.surfaceMuted} p-3`}>
            <p className="text-slate-500">Budget</p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {BUDGET_BANDS.find((b) => b.value === lead.budget_band)?.label ?? '—'}
            </p>
          </div>
          <div className={`${LEAD_OPS.surfaceMuted} p-3`}>
            <p className="text-slate-500">Timeline</p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {TIMELINES.find((t) => t.value === lead.timeline)?.label ?? '—'}
            </p>
          </div>
          <div className={`${LEAD_OPS.surfaceMuted} p-3`}>
            <p className="text-slate-500">Logged</p>
            <p className="mt-0.5 font-semibold text-slate-800">{loggedBy ?? 'Website / system'}</p>
          </div>
        </section>
        {formatReferrerLine(lead.metadata) ? (
          <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
            {formatReferrerLine(lead.metadata)}
          </p>
        ) : null}
        <section className="space-y-2">
          <h3 className={LEAD_OPS.sectionTitle}>Internal notes</h3>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={4}
            className={`${LEAD_OPS.input} min-h-[100px] resize-y py-2`}
            placeholder="Follow-up plan, objections, competitor, AM handoff…"
          />
          <button
            type="button"
            disabled={savingNotes}
            onClick={() => void handleSaveNotes()}
            className={`${LEAD_OPS.primaryBtn} w-full sm:w-auto`}
          >
            {savingNotes ? 'Saving…' : 'Save notes'}
          </button>
        </section>
        <section className="space-y-2">
          <h3 className={`${LEAD_OPS.sectionTitle} flex items-center gap-1.5`}>
            <Calendar className="size-3.5" aria-hidden />
            Activity
          </h3>
          <ul className="space-y-2 border-l-2 border-slate-200 pl-3">
            {timeline.map((entry, idx) => (
              <li key={`${entry.at}-${idx}`} className="text-xs text-slate-600">
                <span className="font-semibold capitalize text-slate-800">{entry.to}</span>
                <span className="text-slate-400"> · {fmtWhen(entry.at)}</span>
              </li>
            ))}
          </ul>
        </section>
        {saveNotice ? (
          <LeadOpsBanner
            variant={
              saveNotice.toLowerCase().includes('error') ||
              saveNotice.toLowerCase().includes('fail')
                ? 'error'
                : saveNotice.includes('demo') || saveNotice.includes('Demo')
                  ? 'info'
                  : 'success'
            }
          >
            {saveNotice}
          </LeadOpsBanner>
        ) : null}
      </div>
      <footer className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4">
        <div>
          <h3 className={LEAD_OPS.sectionTitle}>Share catalogue with client</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Pick listings on Quick Share, generate a link, then send it to the client.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onQuickShare(lead, 'gifting')}
            className={`${LEAD_OPS.moduleAccentBtn} ${LEAD_OPS.moduleAccentGifting}`}
          >
            <Share2 className="size-4" />
            Gifting picks
          </button>
          <button
            type="button"
            onClick={() => onQuickShare(lead, 'events')}
            className={`${LEAD_OPS.moduleAccentBtn} ${LEAD_OPS.moduleAccentEvents}`}
          >
            <Share2 className="size-4" />
            Events picks
          </button>
        </div>
        {!isDemo && !catalogueSent ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleMarkCatalogueSent()}
            className={`${LEAD_OPS.secondaryBtn} w-full text-xs`}
          >
            Mark catalogue sent (manual)
          </button>
        ) : null}
        {catalogueSent ? (
          <p className="text-center text-xs font-medium text-emerald-700">
            Catalogue sent{' '}
            {lead.metadata?.quick_share_sent_at
              ? fmtWhen(String(lead.metadata.quick_share_sent_at))
              : ''}
          </p>
        ) : null}
        {lead.status === 'converted' ? (
          <Link
            to="/admin/mogzu-orders"
            className={`${LEAD_OPS.secondaryBtn} w-full border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100`}
          >
            Open Mogzu orders
          </Link>
        ) : null}
        <div className="relative">
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowStatusMenu((v) => !v)}
            className={`${LEAD_OPS.secondaryBtn} w-full justify-between`}
            aria-expanded={showStatusMenu}
          >
            Update status
            <ChevronDown className={`size-4 transition ${showStatusMenu ? 'rotate-180' : ''}`} />
          </button>
          {showStatusMenu ? (
            <ul className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {STATUS_ACTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    disabled={lead.status === s}
                    onClick={() => void handleStatus(s)}
                    className="flex w-full cursor-pointer px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Move to {LEAD_STATUS_LABELS[s]}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </footer>
    </aside>
  )
  if (layout === 'inline') return panel
  return (
    <div className={LEAD_OPS.drawerOverlay} role="dialog" aria-modal="true" onClick={onClose}>
      {panel}
    </div>
  )
}


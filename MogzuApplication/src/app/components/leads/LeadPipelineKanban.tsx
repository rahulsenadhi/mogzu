import { useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { GripVertical, Mail, Phone } from 'lucide-react'
import { ADMIN_MODULE } from '@/app/components/admin/adminModuleStyles'
import { LeadSourceBadge } from '@/app/components/leads/LeadSourceBadge'
import { LeadStatusBadge } from '@/app/components/leads/LeadStatusBadge'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { getLeadOwnerLabel } from '@/lib/leadFlow'
import { leadStatusLabel } from '@/lib/leadStatusUi'
import {
  BUDGET_BANDS,
  TIMELINES,
  type LeadStatus,
  type PublicLead,
} from '@/lib/publicLeads'

const DND_TYPE = 'LEAD_PIPELINE_CARD'

type DragItem = {
  leadId: string
  fromStatus: LeadStatus
}

type ColumnDef = { status: LeadStatus; label: string; dot: string }

type LeadPipelineKanbanProps = {
  columns: ColumnDef[]
  transitions: LeadStatus[]
  grouped: Record<LeadStatus, PublicLead[]>
  allLeads: PublicLead[]
  busyId: string | null
  emptyHint: string
  onOpenLead: (lead: PublicLead) => void
  onMove: (lead: PublicLead, next: LeadStatus) => void
}

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

function budgetLabel(v: PublicLead['budget_band']) {
  return BUDGET_BANDS.find((b) => b.value === v)?.label ?? '—'
}

function timelineLabel(v: PublicLead['timeline']) {
  return TIMELINES.find((t) => t.value === v)?.label ?? '—'
}

function LeadPipelineCard({
  lead,
  transitions,
  busyId,
  onOpenLead,
  onMove,
}: {
  lead: PublicLead
  transitions: LeadStatus[]
  busyId: string | null
  onOpenLead: (lead: PublicLead) => void
  onMove: (lead: PublicLead, next: LeadStatus) => void
}) {
  const dragRef = useRef<HTMLButtonElement>(null)

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPE,
      item: { leadId: lead.id, fromStatus: lead.status } satisfies DragItem,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [lead.id, lead.status],
  )

  drag(dragRef)

  return (
    <li
      className={`${ADMIN_MODULE.kanbanCard} ${isDragging ? 'opacity-40 ring-2 ring-[#2563eb]/30' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        <button
          ref={dragRef}
          type="button"
          aria-label={`Drag ${lead.client_name} to another stage`}
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpenLead(lead)}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold leading-tight text-slate-900">{lead.client_name}</p>
            <LeadStatusBadge status={lead.status} />
          </div>
          {lead.client_company ? (
            <p className="text-[11px] text-slate-500">{lead.client_company}</p>
          ) : null}
          <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{lead.client_email}</p>

          {lead.requirement_summary ? (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
              {lead.requirement_summary}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-1">
            <span className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
              {budgetLabel(lead.budget_band)}
            </span>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
              {timelineLabel(lead.timeline)}
            </span>
            <LeadSourceBadge sourceSlug={lead.source_slug} metadata={lead.metadata} showReferrer={false} />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[10px] text-slate-400">{fmtTime(lead.created_at)}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                getLeadOwnerLabel(lead) !== 'Unassigned'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-amber-100 bg-amber-50 text-amber-700'
              }`}
            >
              {getLeadOwnerLabel(lead)}
            </span>
          </div>
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <a
          href={`mailto:${lead.client_email}`}
          aria-label={`Email ${lead.client_name}`}
          className={`${LEAD_OPS.secondaryBtn} min-h-[36px] px-2 text-[10px]`}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="size-3" />
          Email
        </a>
        {lead.client_phone ? (
          <a
            href={`tel:${lead.client_phone}`}
            aria-label={`Call ${lead.client_name}`}
            className={`${LEAD_OPS.secondaryBtn} min-h-[36px] px-2 text-[10px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="size-3" />
            Call
          </a>
        ) : (
          <span className="flex min-h-[36px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400">
            —
          </span>
        )}
      </div>
      <select
        value={lead.status}
        disabled={busyId === lead.id}
        onChange={(e) => onMove(lead, e.target.value as LeadStatus)}
        aria-label={`Update status for ${lead.client_name}`}
        className={`${LEAD_OPS.input} mt-2 min-h-[36px] text-[10px]`}
      >
        {transitions.map((s) => (
          <option key={s} value={s}>
            {leadStatusLabel(s)}
          </option>
        ))}
      </select>
    </li>
  )
}

function LeadPipelineColumn({
  col,
  leads,
  allLeads,
  transitions,
  busyId,
  emptyHint,
  onOpenLead,
  onMove,
}: {
  col: ColumnDef
  leads: PublicLead[]
  allLeads: PublicLead[]
  transitions: LeadStatus[]
  busyId: string | null
  emptyHint: string
  onOpenLead: (lead: PublicLead) => void
  onMove: (lead: PublicLead, next: LeadStatus) => void
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DND_TYPE,
      drop: (item: DragItem) => {
        if (item.fromStatus === col.status) return
        const lead = allLeads.find((l) => l.id === item.leadId)
        if (lead) onMove(lead, col.status)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [col.status, allLeads, onMove],
  )

  const highlight = isOver && canDrop

  return (
    <div
      ref={drop}
      className={`${ADMIN_MODULE.kanbanColumn} transition ${
        highlight ? 'ring-2 ring-[#2563eb]/40 ring-offset-2' : ''
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`size-2 rounded-full ${col.dot}`} />
        <h2 className="flex-1 text-sm font-semibold text-slate-800">{col.label}</h2>
        <span className="rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">
          {leads.length}
        </span>
      </div>

      <ul className="flex min-h-[120px] flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <LeadPipelineCard
            key={lead.id}
            lead={lead}
            transitions={transitions}
            busyId={busyId}
            onOpenLead={onOpenLead}
            onMove={onMove}
          />
        ))}

        {leads.length === 0 ? (
          <li
            className={`flex flex-1 items-center justify-center rounded-xl border border-dashed p-4 text-center text-[11px] ${
              highlight
                ? 'border-[#2563eb]/40 bg-[#2563eb]/5 text-[#2563eb]'
                : 'border-slate-200/80 bg-white/40 text-slate-400'
            }`}
          >
            {highlight ? 'Drop here' : emptyHint}
          </li>
        ) : null}
      </ul>
    </div>
  )
}

function LeadPipelineKanbanInner(props: LeadPipelineKanbanProps) {
  const { columns, grouped, allLeads, ...rest } = props

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {columns.map((col) => (
        <LeadPipelineColumn
          key={col.status}
          col={col}
          leads={grouped[col.status] ?? []}
          allLeads={allLeads}
          {...rest}
        />
      ))}
    </div>
  )
}

export function LeadPipelineKanban(props: LeadPipelineKanbanProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <LeadPipelineKanbanInner {...props} />
    </DndProvider>
  )
}

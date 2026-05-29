import { AlertTriangle, ChevronRight, Mail, Phone } from 'lucide-react'
import { LeadSourceBadge } from '@/app/components/leads/LeadSourceBadge'
import { LeadStatusBadge } from '@/app/components/leads/LeadStatusBadge'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { inferLeadVertical } from '@/lib/leadEnquiryVertical'
import { getLeadOwnerLabel } from '@/lib/leadFlow'
import { BUDGET_BANDS, type PublicLead } from '@/lib/publicLeads'

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

type LeadInboxCardProps = {
  lead: PublicLead
  selected: boolean
  hasDuplicate: boolean
  onSelect: () => void
  bulkMode?: boolean
  bulkChecked?: boolean
  onBulkToggle?: () => void
}

export function LeadInboxCard({
  lead,
  selected,
  hasDuplicate,
  onSelect,
  bulkMode = false,
  bulkChecked = false,
  onBulkToggle,
}: LeadInboxCardProps) {
  const vertical = inferLeadVertical(lead)
  const owner = getLeadOwnerLabel(lead)
  const summary = lead.requirement_summary?.replace(/^\[Vertical:[^\]]+\]\n?/i, '').trim()

  return (
    <article
      className={`${LEAD_OPS.surface} flex overflow-hidden transition ${
        selected ? 'border-[#2563EB] ring-2 ring-[#93c5fd]/40' : 'hover:border-slate-300'
      }`}
    >
      {bulkMode ? (
        <label className="flex shrink-0 cursor-pointer items-center border-r border-slate-100 px-3">
          <input
            type="checkbox"
            checked={bulkChecked}
            onChange={() => onBulkToggle?.()}
            className="size-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]/20"
            aria-label={`Select ${lead.client_name} for bulk assign`}
          />
        </label>
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-semibold text-slate-900">{lead.client_name}</span>
            {lead.client_company ? (
              <span className="text-sm text-slate-500">{lead.client_company}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            {hasDuplicate ? (
              <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                <AlertTriangle className="size-3" aria-hidden />
                Duplicate
              </span>
            ) : null}
            <LeadSourceBadge sourceSlug={lead.source_slug} metadata={lead.metadata} showReferrer={false} />
          </div>
          {summary ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{summary}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{fmtTime(lead.created_at)}</span>
            <span aria-hidden className="text-slate-300">
              ·
            </span>
            <span className={owner === 'Unassigned' ? 'font-semibold text-amber-700' : 'text-slate-600'}>
              {owner}
            </span>
            {vertical !== 'all' ? (
              <>
                <span aria-hidden className="text-slate-300">
                  ·
                </span>
                <span className="font-medium capitalize text-slate-700">{vertical}</span>
              </>
            ) : null}
            {lead.budget_band ? (
              <span className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-800">
                {BUDGET_BANDS.find((b) => b.value === lead.budget_band)?.label}
              </span>
            ) : null}
            {lead.metadata?.callback_requested === true ? (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-800">
                Callback
              </span>
            ) : null}
          </div>
        </div>
        <ChevronRight
          className={`mt-1 size-5 shrink-0 ${selected ? 'text-[#2563EB]' : 'text-slate-300'}`}
          aria-hidden
        />
      </button>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3">
        <a
          href={`mailto:${lead.client_email}`}
          className={`${LEAD_OPS.secondaryBtn} min-h-[40px] text-xs`}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="size-4" />
          Email
        </a>
        {lead.client_phone ? (
          <a
            href={`tel:${lead.client_phone}`}
            className={`${LEAD_OPS.secondaryBtn} min-h-[40px] text-xs`}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="size-4" />
            Call
          </a>
        ) : (
          <span className="flex min-h-[40px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
            No phone
          </span>
        )}
      </div>
    </article>
  )
}

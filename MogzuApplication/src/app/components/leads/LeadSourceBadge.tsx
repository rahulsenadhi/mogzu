import { Mail, MessageCircle, Phone, Share2, Users, Globe } from 'lucide-react'
import {
  formatLeadSourceLabel,
  formatReferrerLine,
  resolveLeadChannel,
  type LeadIntakeChannel,
} from '@/lib/leadSources'
const CHANNEL_STYLE: Record<
  LeadIntakeChannel | 'web',
  { className: string; Icon: typeof Phone }
> = {
  inbound_phone: { className: 'border-teal-200 bg-teal-50 text-teal-800', Icon: Phone },
  whatsapp: { className: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: MessageCircle },
  inbound_email: { className: 'border-slate-200 bg-slate-50 text-slate-700', Icon: Mail },
  referral: { className: 'border-amber-200 bg-amber-50 text-amber-900', Icon: Users },
  partner_intro: { className: 'border-violet-200 bg-violet-50 text-violet-800', Icon: Share2 },
  walk_in: { className: 'border-slate-200 bg-slate-100 text-slate-700', Icon: Users },
  event_meetup: { className: 'border-indigo-200 bg-indigo-50 text-indigo-800', Icon: Users },
  linkedin_social: { className: 'border-sky-200 bg-sky-50 text-sky-800', Icon: Share2 },
  website_form: { className: 'border-blue-200 bg-blue-50 text-blue-800', Icon: Globe },
  other: { className: 'border-slate-200 bg-slate-50 text-slate-600', Icon: Share2 },
  web: { className: 'border-blue-200 bg-blue-50 text-blue-800', Icon: Globe },
}
type LeadSourceBadgeProps = {
  sourceSlug: string | null
  metadata?: Record<string, unknown>
  showReferrer?: boolean
}
export function LeadSourceBadge({
  sourceSlug,
  metadata,
  showReferrer = true,
}: LeadSourceBadgeProps) {
  const channel = resolveLeadChannel(sourceSlug, metadata) ?? 'other'
  const style = CHANNEL_STYLE[channel] ?? CHANNEL_STYLE.other
  const { className, Icon } = style
  const label = formatLeadSourceLabel(sourceSlug, metadata)
  const referrer = showReferrer ? formatReferrerLine(metadata) : null
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${className}`}
      >
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </span>
      {referrer ? (
        <span className="rounded-full border border-amber-100 bg-amber-50/80 px-2 py-0.5 text-[10px] font-medium text-amber-900">
          {referrer}
        </span>
      ) : null}
    </span>
  )
}

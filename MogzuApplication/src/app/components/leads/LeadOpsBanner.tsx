import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, Sparkles } from 'lucide-react'
type LeadOpsBannerVariant = 'demo' | 'success' | 'error' | 'info'
const VARIANT: Record<
  LeadOpsBannerVariant,
  { wrap: string; icon: typeof Info; label: string }
> = {
  demo: {
    wrap: 'border-amber-200/90 bg-amber-50/95 text-amber-950',
    icon: Sparkles,
    label: 'Preview mode',
  },
  success: {
    wrap: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950',
    icon: CheckCircle2,
    label: 'Success',
  },
  error: {
    wrap: 'border-rose-200/90 bg-rose-50/95 text-rose-950',
    icon: AlertCircle,
    label: 'Error',
  },
  info: {
    wrap: 'border-[#CFE0FF] bg-[#EFF6FF]/90 text-[#1E3A8A]',
    icon: Info,
    label: 'Note',
  },
}
type LeadOpsBannerProps = {
  variant: LeadOpsBannerVariant
  children: ReactNode
  title?: string
}
export function LeadOpsBanner({ variant, children, title }: LeadOpsBannerProps) {
  const v = VARIANT[variant]
  const Icon = v.icon
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${v.wrap}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {title ?? v.label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

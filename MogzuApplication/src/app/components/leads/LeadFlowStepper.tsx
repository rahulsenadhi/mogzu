import { buildLeadFlowSteps, nextRecommendedAction } from '@/lib/leadFlow'
import type { PublicLead } from '@/lib/publicLeads'
import { Check } from 'lucide-react'
type LeadFlowStepperProps = {
  lead: PublicLead
  compact?: boolean
}
export function LeadFlowStepper({ lead, compact = false }: LeadFlowStepperProps) {
  const steps = buildLeadFlowSteps(lead)
  const action = nextRecommendedAction(lead)
  if (compact) {
    return (
      <div className="rounded-xl border border-[#CFE0FF] bg-gradient-to-r from-[#EFF6FF] to-white p-3">
        <p className="text-xs font-semibold text-[#1E4DB7]">Next step</p>
        <p className="mt-1 text-sm text-slate-700">{action}</p>
        <div className="mt-3 flex gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              title={step.label}
              className={`h-1.5 flex-1 rounded-full ${
                step.done ? 'bg-emerald-500' : step.current ? 'bg-[#2563EB]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/90 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Progress
        </h3>
        <p className="max-w-[220px] text-right text-[11px] font-medium text-[#1D4ED8]">{action}</p>
      </div>
      <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, idx) => (
          <li
            key={step.id}
            className={`relative flex flex-1 flex-col items-center px-1 ${idx < steps.length - 1 ? 'sm:pb-0' : ''}`}
          >
            {idx < steps.length - 1 ? (
              <span
                className="absolute left-[calc(50%+14px)] top-4 hidden h-0.5 w-[calc(100%-28px)] bg-slate-200 sm:block"
                aria-hidden
              />
            ) : null}
            <span
              className={`relative z-[1] flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? 'bg-emerald-500 text-white'
                  : step.current
                    ? 'bg-[#2563EB] text-white ring-4 ring-[#DBEAFE]'
                    : 'border-2 border-slate-200 bg-white text-slate-400'
              }`}
            >
              {step.done ? <Check className="size-4" aria-hidden /> : idx + 1}
            </span>
            <p
              className={`mt-2 text-center text-[11px] font-semibold ${step.current ? 'text-[#1D4ED8]' : 'text-slate-600'}`}
            >
              {step.label}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

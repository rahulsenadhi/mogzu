import { Check, Clock3, FileText, Send, Star, ThumbsUp, CalendarCheck } from 'lucide-react'
import type { BookingPricingType } from '@/app/lib/bookingDraft'

const stepsFor = (pricingType: BookingPricingType) =>
  pricingType === 'request_for_price'
    ? [
        { label: 'Request Sent', Icon: Send },
        { label: 'Quote Received', Icon: FileText },
        { label: 'Quote Accepted', Icon: ThumbsUp },
        { label: 'Event Confirmed', Icon: CalendarCheck },
      ]
    : [
        { label: 'Request Sent', Icon: Send },
        { label: 'Vendor Reviewing', Icon: Clock3 },
        { label: 'Confirmed', Icon: CalendarCheck },
        { label: 'Completed', Icon: Star },
      ]

export function BookingStatusPipeline({
  pricing_type,
  current_step,
}: {
  pricing_type: BookingPricingType
  current_step: number
  booking_reference: string
}) {
  const steps = stepsFor(pricing_type)
  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => {
          const stepNo = index + 1
          const completed = stepNo < current_step
          const current = stepNo === current_step
          const Icon = completed ? Check : step.Icon
          return (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`size-9 rounded-full flex items-center justify-center ${
                    completed ? 'bg-emerald-500 text-white' : current ? 'bg-white border-2 border-blue-600 text-blue-600 animate-pulse' : 'bg-slate-100 border border-slate-300 text-slate-500'
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <p className={`mt-2 text-xs ${completed ? 'text-emerald-600 font-semibold' : current ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{step.label}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className={`mx-2 h-[2px] flex-1 ${completed ? 'bg-emerald-500' : 'border-t border-dashed border-slate-300'}`} />
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="sm:hidden space-y-3">
        {steps.map((step, index) => {
          const stepNo = index + 1
          const completed = stepNo < current_step
          const current = stepNo === current_step
          const Icon = completed ? Check : step.Icon
          return (
            <div key={step.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`size-8 rounded-full flex items-center justify-center ${
                    completed ? 'bg-emerald-500 text-white' : current ? 'bg-white border-2 border-blue-600 text-blue-600 animate-pulse' : 'bg-slate-100 border border-slate-300 text-slate-500'
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                {index < steps.length - 1 ? <div className={`mt-1 h-6 w-[2px] ${completed ? 'bg-emerald-500' : 'border-l border-dashed border-slate-300'}`} /> : null}
              </div>
              <p className={`pt-1 text-sm ${current ? 'text-blue-600 font-semibold' : completed ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>{step.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}


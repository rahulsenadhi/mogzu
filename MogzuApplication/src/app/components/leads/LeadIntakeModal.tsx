import { useEffect } from 'react'
import { X } from 'lucide-react'
import { StaffLeadIntakePanel } from '@/app/components/leads/StaffLeadIntakePanel'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import type { LeadIntakeChannel } from '@/lib/leadSources'
import type { PublicLead } from '@/lib/publicLeads'
type LeadIntakeModalProps = {
  open: boolean
  initialChannel: LeadIntakeChannel
  existingLeads: PublicLead[]
  loggedByUserId?: string | null
  loggedByDisplayName?: string | null
  onClose: () => void
  onCreated: (leadId: string | null) => void
}
export function LeadIntakeModal({
  open,
  initialChannel,
  existingLeads,
  loggedByUserId,
  loggedByDisplayName,
  onClose,
  onCreated,
}: LeadIntakeModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className={LEAD_OPS.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-intake-modal-title"
      onClick={onClose}
    >
      <div className={LEAD_OPS.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="lead-intake-modal-title" className="text-lg font-semibold text-slate-900">
              Log new enquiry
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Phone, referral, walk-in, or partner intro</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`${LEAD_OPS.ghostBtn} min-h-[40px] min-w-[40px] p-2`}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <StaffLeadIntakePanel
            initialChannel={initialChannel}
            existingLeads={existingLeads}
            loggedByUserId={loggedByUserId}
            loggedByDisplayName={loggedByDisplayName}
            embedded
            onClose={onClose}
            onCreated={onCreated}
          />
        </div>
      </div>
    </div>
  )
}


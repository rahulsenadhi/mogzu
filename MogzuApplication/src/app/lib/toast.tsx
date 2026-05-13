import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { toast } from 'sonner'

type ToastKind = 'success' | 'error' | 'info' | 'warning'

const styleFor = (kind: ToastKind) => {
  if (kind === 'success') return { color: 'var(--color-success)', duration: 3000, Icon: CheckCircle2 }
  if (kind === 'error') return { color: 'var(--color-error)', duration: 5000, Icon: XCircle }
  if (kind === 'warning') return { color: 'var(--color-warning)', duration: 4000, Icon: AlertTriangle }
  return { color: 'var(--color-primary)', duration: 3000, Icon: Info }
}

function renderContent(kind: ToastKind, title: string, subtitle?: string, showProgress = true) {
  const { color, Icon } = styleFor(kind)
  return (
    <div className="w-full min-w-[280px] max-w-[360px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] border border-slate-200 overflow-hidden group">
      <div className="p-3 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-start gap-2">
          <Icon className="size-5 shrink-0" style={{ color }} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      {showProgress ? <div className="h-[3px] w-full bg-slate-100"><div className="h-full animate-[toastProgress_linear_forwards] group-hover:[animation-play-state:paused]" style={{ backgroundColor: color, animationDuration: `${styleFor(kind).duration}ms` }} /></div> : null}
    </div>
  )
}

export const notifySuccess = (title: string, subtitle?: string) => toast.custom(() => renderContent('success', title, subtitle), { duration: styleFor('success').duration })
export const notifyError = (title: string, subtitle?: string) => toast.custom(() => renderContent('error', title, subtitle), { duration: styleFor('error').duration })
export const notifyInfo = (title: string, subtitle?: string) => toast.custom(() => renderContent('info', title, subtitle), { duration: styleFor('info').duration })
export const notifyWarning = (title: string, subtitle?: string) => toast.custom(() => renderContent('warning', title, subtitle), { duration: styleFor('warning').duration })
export const notifyUndo = (title: string, onUndo: () => void, subtitle?: string) =>
  toast.custom((t) => (
    <div className="w-full min-w-[280px] max-w-[360px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] border border-slate-200 overflow-hidden">
      <div className="p-3 border-l-4" style={{ borderLeftColor: 'var(--color-primary)' }}>
        <div className="flex items-start gap-2">
          <Info className="size-5 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 hover:underline"
            onClick={() => {
              onUndo()
              toast.dismiss(t)
            }}
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  ), { duration: 5000 })


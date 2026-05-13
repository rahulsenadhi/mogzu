import { Loader2 } from 'lucide-react'
import type { DemoRole } from '@/app/lib/demoRole'

const roleLabel = (role: DemoRole) => {
  if (role === 'corporate') return 'Corporate'
  if (role === 'vendor') return 'Vendor'
  return 'Admin'
}

export function RoleSwitchOverlay({
  role,
  tint,
}: {
  role: DemoRole
  tint: string
}) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-6 transition-opacity duration-150"
      style={{ backgroundColor: tint }}
      aria-label={`Switching to ${roleLabel(role)}`}
      role="status"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: tint }}>
          <span className="text-sm font-bold text-slate-900">{roleLabel(role).slice(0, 1)}</span>
        </div>
        <p className="text-sm font-semibold text-slate-900">Switching to {roleLabel(role)}…</p>
        <Loader2 className="mx-auto mt-3 size-5 animate-spin text-slate-600" aria-hidden />
      </div>
    </div>
  )
}


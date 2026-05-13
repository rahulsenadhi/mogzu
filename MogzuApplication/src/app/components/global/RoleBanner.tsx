import { ShieldCheck, Store } from 'lucide-react'
import { useMemo } from 'react'
import { useDemoRole } from '@/app/lib/demoRole'

export function RoleBanner({ onSwitchToCorporate }: { onSwitchToCorporate: () => void }) {
  const { activeRole } = useDemoRole()

  const cfg = useMemo(() => {
    if (activeRole === 'vendor') {
      return {
        show: true,
        bg: 'rgba(234,179,8,0.10)',
        border: 'rgba(234,179,8,0.30)',
        Icon: Store,
        msg: 'You are in Vendor View',
        extra: 'Switch to Corporate to browse listings →',
      }
    }
    if (activeRole === 'admin') {
      return {
        show: true,
        bg: 'rgba(79,70,229,0.10)',
        border: 'rgba(79,70,229,0.30)',
        Icon: ShieldCheck,
        msg: 'You are in Admin View — all data is visible',
        extra: 'Switch to Corporate →',
      }
    }
    return { show: false } as const
  }, [activeRole])

  if (!cfg.show) return null
  const Icon = cfg.Icon

  return (
    <div
      className="w-full overflow-hidden transition-all duration-250"
      style={{ backgroundColor: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}
    >
      <div className="h-9 px-4 flex items-center justify-center">
        <div className="text-xs text-slate-700 flex items-center gap-2">
          <Icon className="size-3.5 text-slate-700" aria-hidden />
          <span className="hidden md:inline">{cfg.msg}</span>
          <span className="hidden md:inline text-slate-400">·</span>
          <button
            type="button"
            onClick={onSwitchToCorporate}
            className="text-[#2563EB] font-semibold hover:underline text-xs"
            aria-label="Switch to Corporate"
          >
            {cfg.extra}
          </button>
        </div>
      </div>
    </div>
  )
}


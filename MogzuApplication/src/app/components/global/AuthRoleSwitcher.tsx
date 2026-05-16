import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import type { UserRole } from '@/lib/database.types'

const ROLE_LABELS: Record<UserRole, string> = {
  l1_employee: 'L1 Employee',
  l2_manager: 'L2 Manager',
  l3_admin: 'L3 Admin',
  vendor: 'Vendor',
  mogzu_admin: 'Mogzu Admin',
  account_manager: 'Account Manager',
  partner: 'Partner',
  support: 'Support',
}

const ROLE_TINT: Record<UserRole, string> = {
  l1_employee: 'bg-slate-100 text-slate-700',
  l2_manager: 'bg-blue-100 text-blue-800',
  l3_admin: 'bg-indigo-100 text-indigo-800',
  vendor: 'bg-amber-100 text-amber-800',
  mogzu_admin: 'bg-rose-100 text-rose-800',
  account_manager: 'bg-emerald-100 text-emerald-800',
  partner: 'bg-purple-100 text-purple-800',
  support: 'bg-teal-100 text-teal-800',
}

/**
 * Renders only if the signed-in user has more than one role granted
 * (user_profiles.role + available_roles[]). Shows the active role as a
 * persistent badge and lets the user switch with an audited insert into
 * role_switch_events.
 */
export function AuthRoleSwitcher() {
  const { role, availableRoles, setActiveRole } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<UserRole | null>(null)
  const [error, setError] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!role || availableRoles.length < 2) return null

  const handleSwitch = async (next: UserRole) => {
    if (next === role) {
      setOpen(false)
      return
    }
    setBusy(next)
    setError('')
    const { error: err } = await setActiveRole(next)
    setBusy(null)
    if (err) setError(err)
    else setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${ROLE_TINT[role]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Acting as ${ROLE_LABELS[role]} — click to switch`}
      >
        <ShieldCheck className="size-3.5" />
        {ROLE_LABELS[role]}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Switch role
            </p>
            <p className="text-[11px] text-slate-400">
              Switches are logged for audit. Permissions update immediately.
            </p>
          </div>
          <ul className="py-1">
            {availableRoles.map((r) => {
              const isActive = r === role
              const isBusy = busy === r
              return (
                <li key={r}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isBusy}
                    onClick={() => handleSwitch(r)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                      isActive ? 'bg-slate-50' : 'hover:bg-slate-50'
                    } disabled:opacity-60`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_TINT[r]}`}>
                        {ROLE_LABELS[r]}
                      </span>
                    </span>
                    {isActive && <Check className="size-4 text-emerald-600" />}
                  </button>
                </li>
              )
            })}
          </ul>
          {error && (
            <p className="border-t border-slate-100 px-3 py-2 text-[11px] text-rose-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

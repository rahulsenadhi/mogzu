import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import type { UserRole } from '@/lib/database.types'
import {
  INTERNAL_TEAM_ROLES,
  MATRIX_ACTIONS,
  MATRIX_RESOURCES,
  type PermissionCell,
  getRoleTemplate,
  saveRoleTemplate,
} from '@/lib/rolePermissionTemplates'

function Toggle({
  checked,
  onChange,
  labelId,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  labelId: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function AdminRolePermissionsPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const [targetRole, setTargetRole] = useState<UserRole>('support')
  const [notice, setNotice] = useState('')
  const [perms, setPerms] = useState<Record<PermissionCell, boolean>>(() =>
    getRoleTemplate('support'),
  )

  useEffect(() => {
    setPerms(getRoleTemplate(targetRole))
    setNotice('')
  }, [targetRole])

  const setPerm = (id: PermissionCell, v: boolean) => {
    setPerms((p) => ({ ...p, [id]: v }))
  }

  const handleSave = () => {
    saveRoleTemplate(targetRole, perms)
    setNotice(`Saved template for ${targetRole}.`)
  }

  if (role !== 'mogzu_admin') {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Role templates are restricted to mogzu_admin.
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Role permissions template</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/teams')}
          className="text-sm font-semibold text-[#2563EB] hover:underline"
        >
          Back to Teams
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6 space-y-6">
        <div>
          <label htmlFor="role-name" className="text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role-name"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as UserRole)}
            className="mt-2 w-full max-w-xl h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            {INTERNAL_TEAM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {notice && <p className="mt-2 text-xs text-emerald-700">{notice}</p>}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Permissions</h2>
          <div className="space-y-6">
            {MATRIX_RESOURCES.map((resource) => (
              <section key={resource}>
                <div className="px-3 py-2 rounded-t-lg bg-indigo-50/80 border border-b-0 border-slate-200/80 text-sm font-semibold text-slate-800">
                  {resource.replace('_', ' ')}
                </div>
                <div className="rounded-b-lg border border-slate-200/80 border-t-0 p-3 bg-white">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {MATRIX_ACTIONS.map((action) => {
                      const cell: PermissionCell = `${resource}.${action}`
                      const lid = `perm-${cell}`
                      return (
                        <div
                          key={cell}
                          className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-3 min-h-[88px] justify-between"
                        >
                          <span id={lid} className="text-xs text-slate-600 leading-snug">
                            {action}
                          </span>
                          <Toggle
                            checked={perms[cell] ?? false}
                            onChange={(v) => setPerm(cell, v)}
                            labelId={lid}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/teams')}
          className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8]"
        >
          Save
        </button>
      </div>
    </div>
  )
}

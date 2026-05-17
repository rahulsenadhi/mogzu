import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { CORP } from '@/app/lib/adminTheme'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  PermissionAction,
  PermissionResource,
  UserPermission,
  UserProfile,
} from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

const RESOURCES: PermissionResource[] = [
  'bookings',
  'listings',
  'partners',
  'vendors',
  'corporate_accounts',
  'gifting',
  'support',
  'reports',
]
const ACTIONS: PermissionAction[] = ['view', 'create', 'update', 'delete', 'approve']

type Cell = `${PermissionResource}.${PermissionAction}`

export default function AdminTeamPermissionsPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const { profile } = useAuth()

  const [target, setTarget] = useState<UserProfile | null>(null)
  const [grants, setGrants] = useState<Set<Cell>>(new Set())
  const [loading, setLoading] = useState(true)
  const [busyCell, setBusyCell] = useState<Cell | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    const [{ data: profileRow, error: pErr }, { data: perms, error: gErr }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
      db.userPermissions.listByUser(userId),
    ])
    if (pErr || !profileRow) {
      setError(pErr?.message ?? 'User not found.')
      setLoading(false)
      return
    }
    if (gErr) setError(gErr.message)
    setTarget(profileRow as UserProfile)
    const set = new Set<Cell>()
    for (const p of (perms ?? []) as UserPermission[]) {
      set.add(`${p.resource as PermissionResource}.${p.action}`)
    }
    setGrants(set)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = async (resource: PermissionResource, action: PermissionAction) => {
    if (!userId || !profile) return
    const cell: Cell = `${resource}.${action}`
    setBusyCell(cell)
    setNotice('')
    if (grants.has(cell)) {
      const { error: e } = await db.userPermissions.revoke(userId, resource, action)
      if (e) setError(e.message)
      else {
        const next = new Set(grants)
        next.delete(cell)
        setGrants(next)
        await db.userActivity.log(
          profile.id,
          'permission.revoked',
          'user_permissions',
          userId,
          { resource, action },
        )
        setNotice(`Revoked ${cell}`)
      }
    } else {
      const { error: e } = await db.userPermissions.grant(userId, resource, action, profile.id)
      if (e) setError(e.message)
      else {
        const next = new Set(grants)
        next.add(cell)
        setGrants(next)
        await db.userActivity.log(
          profile.id,
          'permission.granted',
          'user_permissions',
          userId,
          { resource, action },
        )
        setNotice(`Granted ${cell}`)
      }
    }
    setBusyCell(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading...
      </div>
    )
  }

  if (error || !target) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error || 'User not found.'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/team')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-3.5" /> Team
      </button>

      <AdminPageTitleRow title={`Permissions — ${target.full_name ?? target.id}`} />

      {notice && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {notice}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs text-slate-500">
          Role <strong className="font-semibold text-slate-700">{target.role}</strong> provides a
          baseline. Toggle additional grants below. Changes are recorded in the activity log.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                <th className="py-2 pl-3 pr-3">Resource</th>
                {ACTIONS.map((a) => (
                  <th key={a} className="py-2 px-2 text-center">
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((r) => (
                <tr key={r} className="border-b border-slate-100">
                  <td className="py-2 pl-3 pr-3 font-medium capitalize text-slate-700">
                    {r.replace('_', ' ')}
                  </td>
                  {ACTIONS.map((a) => {
                    const cell: Cell = `${r}.${a}`
                    const on = grants.has(cell)
                    const busy = busyCell === cell
                    return (
                      <td key={a} className="py-2 px-2 text-center">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggle(r, a)}
                          className={`inline-flex h-6 w-12 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                            on
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          } ${busy ? 'opacity-50' : ''}`}
                          aria-label={`${on ? 'Revoke' : 'Grant'} ${cell}`}
                        >
                          {on ? 'ON' : 'OFF'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/admin/team')}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          Done
        </button>
      </div>
    </div>
  )
}

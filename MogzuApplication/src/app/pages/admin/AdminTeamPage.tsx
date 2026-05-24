import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Activity, KeyRound, Loader2, Mail, Plus, UserCog } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { CORP } from '@/app/lib/adminTheme'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { UserInvite, UserProfile, UserRole } from '@/lib/database.types'

const INTERNAL_ROLES: UserRole[] = [
  'mogzu_admin',
  'account_manager',
  'support',
  'sales_agent',
  'field_agent',
  'partner',
]

const ROLE_LABELS: Record<UserRole, string> = {
  l1_employee: 'L1 Employee',
  l2_manager: 'L2 Manager',
  l3_admin: 'L3 Admin',
  vendor: 'Vendor',
  mogzu_admin: 'Mogzu Admin',
  account_manager: 'Account Manager',
  partner: 'Partner',
  support: 'Customer Support',
  sales_agent: 'Sales Agent',
  field_agent: 'Field Agent',
}

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function AdminTeamPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invites, setInvites] = useState<UserInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<UserRole | 'all'>('all')
  const [showInvite, setShowInvite] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('support')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteSaving, setInviteSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice('')
    const [usersRes, invitesRes] = await Promise.all([
      db.subUsers.listInternal(),
      db.userInvites.list(),
    ])
    if (usersRes.error) setNotice(usersRes.error.message)
    else setUsers((usersRes.data ?? []) as UserProfile[])
    if (invitesRes.error) setNotice(invitesRes.error.message)
    else setInvites((invitesRes.data ?? []) as UserInvite[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => (filter === 'all' ? users : users.filter((u) => u.role === filter)),
    [users, filter],
  )

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (!inviteEmail.trim()) {
      setNotice('Email is required.')
      return
    }
    setInviteSaving(true)
    setNotice('')
    const { data, error } = await db.userInvites.create(
      profile.id,
      inviteEmail,
      inviteRole,
      inviteName.trim() || null,
    )
    setInviteSaving(false)
    if (error || !data) {
      setNotice(error?.message ?? 'Invite failed.')
      return
    }
    await db.userActivity.log(profile.id, 'sub_user.invited', 'user_invites', data.id, {
      email: data.email,
      role: data.role,
    })
    const link = `${window.location.origin}/invite/${data.token}`
    setInviteLink(link)
    setInviteEmail('')
    setInviteName('')
    setInviteRole('support')
    await load()
  }

  const handleStatus = async (u: UserProfile, status: 'active' | 'deactivated') => {
    if (!profile) return
    setBusyId(u.id)
    const { error } = await db.subUsers.setStatus(u.id, status)
    if (error) setNotice(error.message)
    else {
      await db.userActivity.log(profile.id, `sub_user.${status}`, 'user_profiles', u.id, {
        role: u.role,
      })
      await load()
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow
          title="Team & sub-users"
          totalLabel={`${users.length} members · ${invites.filter((i) => !i.accepted_at).length} pending invites`}
        />
        <button
          type="button"
          onClick={() => {
            setShowInvite(true)
            setInviteLink(null)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" /> Invite member
        </button>
      </div>

      {notice && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {notice}
        </div>
      )}

      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Email *</span>
              <input
                type="email"
                className={inputClass}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Full name</span>
              <input
                className={inputClass}
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Role *</span>
              <select
                className={inputClass}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
              >
                {INTERNAL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {inviteLink && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <p className="font-semibold text-emerald-900">Invite created.</p>
              <p className="text-emerald-800">
                Share this link with the invitee — they have 14 days to accept:
              </p>
              <code className="mt-1 block break-all rounded bg-white px-2 py-1 text-emerald-900">
                {inviteLink}
              </code>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-white"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={inviteSaving}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {inviteSaving && <Loader2 className="size-3 animate-spin" />}
              Create invite
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          All
        </button>
        {INTERNAL_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFilter(r)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === r ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading team...
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No members in this view.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Member</th>
                <th className="py-3 pr-3">Role</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4 pr-3">
                    <p className="font-medium text-slate-900">{u.full_name ?? '—'}</p>
                    <p className="text-xs text-slate-500">{u.phone ?? '—'}</p>
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : u.status === 'invited'
                            ? 'bg-amber-50 text-amber-900 border border-amber-100'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/team/${u.id}/permissions`)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <KeyRound className="size-3" /> Permissions
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/team/${u.id}/activity`)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Activity className="size-3" /> Activity
                      </button>
                      {u.status === 'active' ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleStatus(u, 'deactivated')}
                          className="rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleStatus(u, 'active')}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {invites.filter((i) => !i.accepted_at).length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <h3 className="border-b border-slate-100 p-3 text-sm font-semibold text-slate-900">
            Pending invites
          </h3>
          <ul className="divide-y divide-slate-100 text-xs">
            {invites
              .filter((i) => !i.accepted_at)
              .map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      <Mail className="mr-1 inline size-3" /> {i.email}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {ROLE_LABELS[i.role as UserRole] ?? i.role} · expires{' '}
                      {new Date(i.expires_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Link
                    to={`/invite/${i.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    Copy link
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        <UserCog className="mr-1 inline size-3" /> Roles cover Customer Support, Sales Agent,
        Field Agent, Account Manager. External Partner accounts are managed in{' '}
        <Link to="/admin/partners" className="underline">
          Partners
        </Link>
        .
      </p>
    </div>
  )
}

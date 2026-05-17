import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { db } from '@/lib/db'
import type { UserActivityEvent, UserProfile } from '@/lib/database.types'

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function AdminTeamActivityPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [target, setTarget] = useState<UserProfile | null>(null)
  const [events, setEvents] = useState<UserActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    const [{ data: profileRow, error: pErr }, { data: evs, error: eErr }] = await Promise.all([
      db.userProfiles.getByIdMaybe(userId),
      db.userActivity.listByActor(userId, 100),
    ])
    if (pErr || !profileRow) {
      setError(pErr?.message ?? 'User not found.')
      setLoading(false)
      return
    }
    if (eErr) setError(eErr.message)
    setTarget(profileRow as UserProfile)
    setEvents((evs ?? []) as UserActivityEvent[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading activity...
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
      <AdminPageTitleRow
        title={`Activity — ${target.full_name ?? target.id}`}
        totalLabel={`${events.length} events`}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {events.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{e.event_type}</p>
                  {e.target_table && (
                    <p className="text-[11px] text-slate-500">
                      {e.target_table}
                      {e.target_id ? ` · ${e.target_id.slice(0, 8)}` : ''}
                    </p>
                  )}
                  {Object.keys(e.metadata).length > 0 && (
                    <pre className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-[10px] text-slate-700">
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  )}
                </div>
                <p className="shrink-0 text-[11px] text-slate-500">{fmtTime(e.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

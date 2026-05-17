import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldAlert, Star, XCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Review } from '@/lib/database.types'

type Row = Review & {
  listings: { title: string | null } | null
  vendors: { business_name: string | null } | null
}

export default function AdminReviewsApprovalPage() {
  const { profile, role } = useAuth()
  const isSupport = role === 'support' || role === 'mogzu_admin' || role === 'account_manager'

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.reviews.listQueue()
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (r: Row) => {
    if (!profile) return
    setBusy(r.id)
    await db.reviews.setStatus(r.id, 'approved', { approved_by: profile.id })
    setBusy(null)
    setNotice('Approved.')
    load()
  }

  const reject = async (r: Row) => {
    const reason = window.prompt('Rejection reason (required):')
    if (!reason || !reason.trim()) return
    setBusy(r.id)
    await db.reviews.setStatus(r.id, 'rejected', { rejection_reason: reason.trim() })
    setBusy(null)
    setNotice('Rejected.')
    load()
  }

  if (!isSupport) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Support / admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Review approval queue"
          subtitle="Pre-platform reviews from vendor invites. Approve to badge them on listings; reject with a reason."
        />

        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">Queue empty.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {r.reviewer_name ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.listings?.title ?? '—'} for {r.vendors?.business_name ?? '—'} ·{' '}
                        {new Date(r.created_at).toLocaleDateString('en-IN')} ·{' '}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {r.source === 'invite' ? 'Pre-platform' : 'Booking'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`size-4 ${n <= r.rating ? 'text-amber-500' : 'text-slate-200'}`}
                          fill={n <= r.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                    {r.body}
                  </p>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => reject(r)}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      <XCircle className="size-3" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => approve(r)}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {busy === r.id && <Loader2 className="size-3 animate-spin" />}
                      <CheckCircle2 className="size-3" />
                      Approve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

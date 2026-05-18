// Phase 5 Feature 6 — SOC2 access reviews admin console.

import { useCallback, useEffect, useState } from 'react'
import { Camera, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  completeReview,
  createReview,
  listReviews,
  snapshotReview,
  type AccessReview,
} from '@/lib/accessReviews'

export default function AdminAccessReviewsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [rows, setRows] = useState<AccessReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scheduledFor, setScheduledFor] = useState(
    () => new Date().toISOString().slice(0, 10),
  )

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listReviews()
    setRows(data)
    if (err) setError(err)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const onCreate = async () => {
    const { error: err } = await createReview(scheduledFor)
    if (err) setError(err)
    else load()
  }

  const onSnapshot = async (id: string) => {
    const { error: err } = await snapshotReview(id)
    if (err) setError(err)
    else load()
  }

  const onComplete = async (id: string) => {
    const notes = window.prompt('Closing notes (optional)') ?? undefined
    const { error: err } = await completeReview(id, {}, notes)
    if (err) setError(err)
    else load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">mogzu_admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <AdminPageTitleRow
          title="Access reviews"
          totalLabel={loading ? 'Loading…' : `${rows.length} reviews on record`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Schedule new review for</span>
            <input
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Schedule review
          </button>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Scheduled</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Snapshot rows</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-xs">{r.scheduled_for}</td>
                  <td className="px-4 py-2 text-xs">{r.status}</td>
                  <td className="px-4 py-2 text-right text-xs">
                    {Array.isArray(r.snapshot) ? r.snapshot.length : 0}
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate text-xs text-slate-500">{r.notes}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {r.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onSnapshot(r.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Camera className="size-3" /> Snapshot
                        </button>
                      )}
                      {r.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onComplete(r.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="size-3" /> Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                    No reviews scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

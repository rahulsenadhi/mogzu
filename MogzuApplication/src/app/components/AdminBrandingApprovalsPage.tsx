// Phase 2 Feature 4 — admin approval queue for gifting branding selections.

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  listPendingBrandingForAdmin,
  reviewBrandingSelection,
  PLACEMENT_OPTIONS,
  type AdminPendingRow,
} from '@/lib/giftingBranding'

const PLACEMENT_LABEL = Object.fromEntries(
  PLACEMENT_OPTIONS.map((o) => [o.value, o.label]),
)

export default function AdminBrandingApprovalsPage() {
  const { role } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support'

  const [rows, setRows] = useState<AdminPendingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await listPendingBrandingForAdmin()
    if (err) setError(err)
    setRows(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isStaff) load()
  }, [load, isStaff])

  const approve = async (r: AdminPendingRow) => {
    setBusy(r.id)
    const { error: err } = await reviewBrandingSelection(r.id, 'approved', null)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice('Approved. Vendor will receive the confirmed branding brief.')
    load()
  }

  const requestRevision = async (r: AdminPendingRow) => {
    const notes = window.prompt('What revision is needed? (required)')
    if (!notes || !notes.trim()) return
    setBusy(r.id)
    const { error: err } = await reviewBrandingSelection(r.id, 'revision_requested', notes.trim())
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice('Revision requested.')
    load()
  }

  if (!isStaff) {
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
          title="Gifting branding approvals"
          totalLabel="Logo placement requests from corporates"
        />

        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}
        {error && (
          <p className="mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No pending branding approvals.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <img
                      src={r.upload.public_url}
                      alt={r.upload.original_filename}
                      className="h-20 w-20 flex-shrink-0 rounded-lg border border-slate-200 bg-white object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {PLACEMENT_LABEL[r.placement_type] ?? r.placement_type}
                      </p>
                      <p className="text-xs text-slate-500">
                        Method: {r.branding_method ?? '—'} · Booking{' '}
                        <span className="font-mono">{r.booking_id.slice(0, 8)}</span> ·{' '}
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        File: {r.upload.original_filename}
                      </p>
                      {r.position_notes && (
                        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                          {r.position_notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => requestRevision(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                      >
                        <XCircle className="size-3" />
                        Request revision
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

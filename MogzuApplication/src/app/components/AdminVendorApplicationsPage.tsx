// Admin queue: pending vendor applications. Reads vendors WHERE status='pending'
// (the live source) and approves/rejects with a structured rejection-reason
// checklist that lands on vendors.rejection_reasons for resubmit feedback.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileText, Loader2, ShieldAlert, XCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Vendor, VendorKycStatus } from '@/lib/database.types'

const KYC_STATUSES: VendorKycStatus[] = ['not_started', 'submitted', 'review', 'approved', 'rejected']

type StatusFilter = 'pending' | 'active' | 'rejected'

const REJECTION_REASONS = [
  'Incomplete business information',
  'GST / tax details missing or invalid',
  'Categories outside Mogzu scope',
  'Reputation or compliance concerns',
  'Duplicate vendor application',
] as const

export default function AdminVendorApplicationsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('pending')
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null)
  const [reasonsPicked, setReasonsPicked] = useState<string[]>([])
  const [reasonNote, setReasonNote] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await db.vendors.listByStatus(filter)
    if (err) setError(err.message)
    setVendors((data ?? []) as Vendor[])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const approve = async (v: Vendor) => {
    if (v.kyc_status !== 'approved') {
      setError(`Cannot approve ${v.business_name}: KYC must be approved first.`)
      return
    }
    setBusyId(v.id)
    const { error: err } = await db.vendors.updateStatus(v.id, 'active')
    setBusyId(null)
    if (err) setError(err.message)
    else load()
  }

  const setKyc = async (id: string, status: VendorKycStatus) => {
    setBusyId(id)
    const { error: err } = await db.vendors.updateKycStatus(id, status)
    setBusyId(null)
    if (err) setError(err.message)
    else load()
  }

  const openRejectDialog = (v: Vendor) => {
    setRejectTarget(v)
    setReasonsPicked([])
    setReasonNote('')
  }

  const submitRejection = async () => {
    if (!rejectTarget) return
    const reasons = [...reasonsPicked]
    if (reasonNote.trim()) reasons.push(reasonNote.trim())
    if (reasons.length === 0) {
      setError('Pick at least one rejection reason.')
      return
    }
    setBusyId(rejectTarget.id)
    const { error: err } = await db.vendors.updateStatus(rejectTarget.id, 'rejected', reasons)
    let notifyErr: string | null = null
    if (!err && rejectTarget.user_id) {
      const { error } = await db.notifications.notify({
        userId: rejectTarget.user_id,
        type: 'system',
        title: 'Vendor application rejected',
        body: 'Your application needs corrections before approval. Review feedback and resubmit from the verification page.',
        linkUrl: '/vendor/verification-pending',
        metadata: {
          kind: 'vendor_application_rejected',
          vendorId: rejectTarget.id,
          reasons,
          reasonCount: reasons.length,
          rejectedAt: new Date().toISOString(),
        },
      })
      notifyErr = error
    }
    setBusyId(null)
    if (err) setError(err.message)
    else {
      setRejectTarget(null)
      if (notifyErr) {
        setError(`Vendor rejected, but notification failed: ${notifyErr}`)
      }
      load()
    }
  }

  const toggleReason = (r: string) => {
    setReasonsPicked((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
  }

  const totalLabel = useMemo(
    () => (loading ? 'Loading…' : `${vendors.length} ${filter === 'pending' ? 'in queue' : filter}`),
    [loading, vendors.length, filter],
  )

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / support role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow title="Vendor applications" totalLabel={totalLabel} />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['pending', 'active', 'rejected'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                filter === s
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Business</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">GST</th>
                  <th className="px-4 py-2">KYC</th>
                  <th className="px-4 py-2">Submitted</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{v.business_name}</div>
                      {v.description && (
                        <div className="mt-1 text-xs text-slate-500 line-clamp-2">{v.description}</div>
                      )}
                      {filter === 'rejected' && v.rejection_reasons && v.rejection_reasons.length > 0 && (
                        <ul className="mt-1 list-disc pl-4 text-xs text-rose-700">
                          {v.rejection_reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {[v.city, v.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {v.gst_number || <span className="text-amber-600">missing</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <select
                        value={v.kyc_status}
                        onChange={(e) => setKyc(v.id, e.target.value as VendorKycStatus)}
                        disabled={busyId === v.id}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        {KYC_STATUSES.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                      {v.kyc_doc_url && (
                        <a
                          href={v.kyc_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 text-[11px] text-[#2563EB] hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          doc
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{v.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right">
                      {filter === 'pending' ? (
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => approve(v)}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => openRejectDialog(v)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs uppercase text-slate-400">{filter}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                      No vendors match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Reject {rejectTarget.business_name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Select reasons. The vendor sees these on /vendor/verification-pending so they can fix and resubmit.
            </p>
            <div className="mt-3 space-y-2">
              {REJECTION_REASONS.map((r) => (
                <label key={r} className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={reasonsPicked.includes(r)}
                    onChange={() => toggleReason(r)}
                    className="mt-0.5 size-4 rounded border-slate-300"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <textarea
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              placeholder="Other (optional)…"
              rows={2}
              className="mt-3 w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRejection}
                disabled={busyId === rejectTarget.id}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {busyId === rejectTarget.id ? 'Rejecting…' : 'Confirm reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

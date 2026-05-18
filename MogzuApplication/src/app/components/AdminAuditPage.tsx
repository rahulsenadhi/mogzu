// Phase 3 Feature 6 — admin audit log + CSV export.

import { useCallback, useEffect, useState } from 'react'
import { Download, Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  downloadCsv,
  exportAuditEvents,
  listAuditEvents,
  type AuditEvent,
} from '@/lib/auditLog'

function defaultRange(days = 7): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - days)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(from), to: fmt(to) }
}

export default function AdminAuditPage() {
  const { role } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support'

  const initial = defaultRange(7)
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [action, setAction] = useState('')
  const [resourceKind, setResourceKind] = useState('')

  const [rows, setRows] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const filterPayload = useCallback(
    () => ({
      from: new Date(`${from}T00:00:00Z`),
      to: new Date(`${to}T23:59:59Z`),
      action: action || null,
      resourceKind: resourceKind || null,
    }),
    [from, to, action, resourceKind],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await listAuditEvents(filterPayload())
    if (err) setError(err)
    setRows(data)
    setLoading(false)
  }, [filterPayload])

  useEffect(() => {
    if (isStaff) load()
  }, [isStaff, load])

  const exportCsv = async () => {
    setExporting(true)
    const { data, error: err } = await exportAuditEvents(filterPayload())
    setExporting(false)
    if (err) {
      setError(err)
      return
    }
    downloadCsv(data, `mogzu-audit-${from}-to-${to}.csv`)
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
          title="Audit log"
          totalLabel={`${rows.length} events in window`}
        />

        {error && (
          <p className="mt-3 mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-4 mb-3 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Action</span>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="any"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Resource kind</span>
            <input
              type="text"
              value={resourceKind}
              onChange={(e) => setResourceKind(e.target.value)}
              placeholder="any"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={load}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Export CSV
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No events in this window.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2 pl-4 pr-2">When</th>
                  <th className="py-2 pr-2">Actor</th>
                  <th className="py-2 pr-2">Action</th>
                  <th className="py-2 pr-2">Resource</th>
                  <th className="py-2 pr-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="py-2 pl-4 pr-2 text-xs text-slate-500">
                      {new Date(r.at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 pr-2 font-mono text-xs">{r.actor_id?.slice(0, 8) ?? '—'}</td>
                    <td className="py-2 pr-2 text-slate-900">{r.action}</td>
                    <td className="py-2 pr-2 text-xs text-slate-600">
                      {r.resource_kind ?? '—'}
                      {r.resource_id ? `:${r.resource_id.slice(0, 8)}` : ''}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-500">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Unified view of <code className="rounded bg-slate-100 px-1">user_activity_events</code> +
          <code className="rounded bg-slate-100 px-1">role_switch_events</code> +
          <code className="rounded bg-slate-100 px-1">audit_events_archive</code> (events older
          than 90 days). CSV export goes through{' '}
          <code className="rounded bg-slate-100 px-1">export_audit_events()</code> RPC. Retention:
          7 years, enforced daily by{' '}
          <code className="rounded bg-slate-100 px-1">archive_old_audit_events</code> +{' '}
          <code className="rounded bg-slate-100 px-1">purge_archive_beyond_retention</code>.
        </p>
      </div>
    </div>
  )
}

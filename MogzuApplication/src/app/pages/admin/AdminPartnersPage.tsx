import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2, Pencil, Plus, Settings2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { CORP } from '@/app/lib/adminTheme'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Partner, PartnerStatus } from '@/lib/database.types'

function statusClass(s: PartnerStatus): string {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 border border-emerald-100'
  if (s === 'paused') return 'bg-amber-50 text-amber-900 border border-amber-100'
  if (s === 'terminated' || s === 'rejected') return 'bg-rose-50 text-rose-800 border border-rose-100'
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

export default function AdminPartnersPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [rows, setRows] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<PartnerStatus | 'all'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await db.partners.list()
    if (error) {
      setNotice(error.message)
    } else {
      setRows((data ?? []) as Partner[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  )

  const approve = async (row: Partner) => {
    if (!profile) return
    setBusyId(row.id)
    setNotice('')
    const seed = row.business_name?.trim() || row.full_name.trim() || 'PART'
    const { error } = await db.partners.approve(row.id, profile.id, seed)
    if (error) {
      setNotice(error.message)
    } else {
      setNotice(`${row.full_name} approved. Referral code generated.`)
      await load()
    }
    setBusyId(null)
  }

  const setStatus = async (row: Partner, status: PartnerStatus) => {
    setBusyId(row.id)
    setNotice('')
    let reason: string | undefined
    if (status === 'rejected' || status === 'terminated') {
      const r = window.prompt(`Reason for ${status === 'rejected' ? 'rejecting' : 'terminating'} ${row.full_name}:`)
      if (r === null) {
        setBusyId(null)
        return
      }
      reason = r
    }
    const { error } = await db.partners.setStatus(row.id, status, reason)
    if (error) setNotice(error.message)
    else await load()
    setBusyId(null)
  }

  const total = rows.length
  const pendingCount = rows.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow
          title="Partners"
          totalLabel={`${total} partners${pendingCount ? ` · ${pendingCount} pending` : ''}`}
        />
        <Link
          to="/signup/partner"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          style={{ backgroundColor: CORP.primary }}
        >
          <Plus className="size-4" />
          Public signup link
        </Link>
      </div>

      {notice && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'active', 'paused', 'terminated', 'rejected'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              filter === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading partners...
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No partners in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4 pr-3">Partner</th>
                  <th className="py-3 pr-3">Type</th>
                  <th className="py-3 pr-3">Referral code</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-3">
                      <p className="font-medium text-slate-900">
                        {row.business_name || row.full_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.full_name} · {row.email}
                      </p>
                    </td>
                    <td className="py-3 pr-3 capitalize text-slate-700">{row.partner_type}</td>
                    <td className="py-3 pr-3 font-mono text-xs">
                      {row.referral_code ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        {row.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => approve(row)}
                              className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => setStatus(row, 'rejected')}
                              className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {row.status === 'active' && (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => setStatus(row, 'paused')}
                            className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                          >
                            Pause
                          </button>
                        )}
                        {row.status === 'paused' && (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => setStatus(row, 'active')}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Resume
                          </button>
                        )}
                        {(row.status === 'active' || row.status === 'paused') && (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => setStatus(row, 'terminated')}
                            className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Terminate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/partners/${row.id}/agreement`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Settings2 className="size-3.5" />
                          Agreement
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/partners/edit/${row.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

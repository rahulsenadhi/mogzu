import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { db } from '@/lib/db'
import type { Listing } from '@/lib/database.types'

type Row = Listing & {
  vendors?: { business_name: string | null } | null
  partners?: { full_name: string | null; business_name: string | null } | null
}

function ownerLabel(r: Row): string {
  if (r.owner_type === 'partner') {
    return r.partners?.business_name || r.partners?.full_name || 'Partner'
  }
  return r.vendors?.business_name ?? 'Vendor'
}

export default function AdminPendingListingsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await db.listings.listPendingApproval()
    if (error) setNotice(error.message)
    else setRows(((data ?? []) as unknown as Row[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setStatus = async (row: Row, status: 'active' | 'rejected') => {
    setBusyId(row.id)
    setNotice('')
    const { error } = await db.listings.updateStatus(row.id, status)
    if (error) setNotice(error.message)
    else {
      setNotice(`${row.title} → ${status}`)
      await load()
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-4">
      <AdminPageTitleRow title="Listing approval queue" totalLabel={`${rows.length} pending`} />

      {notice && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading queue...
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Nothing pending approval.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Listing</th>
                <th className="py-3 pr-3">Owner</th>
                <th className="py-3 pr-3">Module</th>
                <th className="py-3 pr-3">Price</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4 pr-3">
                    <p className="font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {r.location_city ?? '—'} · {r.min_capacity ?? '–'}–{r.max_capacity ?? '–'} pax
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        r.owner_type === 'partner'
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {r.owner_type}
                    </span>
                    <span className="text-slate-700">{ownerLabel(r)}</span>
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{r.module}</td>
                  <td className="py-3 pr-3 text-slate-700">
                    {r.base_price != null ? `₹ ${r.base_price.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => setStatus(r, 'active')}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => setStatus(r, 'rejected')}
                        className="rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

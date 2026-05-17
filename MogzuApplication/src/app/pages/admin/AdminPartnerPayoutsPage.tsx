import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { PartnerPayoutPeriod } from '@/lib/database.types'

type Row = PartnerPayoutPeriod & {
  partners?: { full_name: string; business_name: string | null; email: string } | null
}

export default function AdminPartnerPayoutsPage() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await db.partnerPayouts.listPending()
    if (error) setNotice(error.message)
    else setRows((data ?? []) as Row[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleMarkPaid = async (row: Row) => {
    if (!profile) return
    const note = window.prompt(
      `Mark ${row.period_yyyymm} payout (₹ ${Number(row.total_amount).toLocaleString('en-IN')}) for ${
        row.partners?.business_name || row.partners?.full_name
      } as paid? Optional note:`,
      '',
    )
    if (note === null) return
    setBusyId(row.id)
    setNotice('')
    const { error } = await db.partnerPayouts.markPaid(row.id, profile.id, note.trim() || undefined)
    if (error) setNotice(error.message)
    else {
      setNotice(`Marked ${row.period_yyyymm} as paid.`)
      await load()
    }
    setBusyId(null)
  }

  const totalPending = rows.reduce((sum, r) => sum + Number(r.total_amount), 0)

  return (
    <div className="space-y-4">
      <AdminPageTitleRow
        title="Partner payouts"
        totalLabel={`${rows.length} pending · ₹ ${totalPending.toLocaleString('en-IN')}`}
      />

      {notice && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading payouts...
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No pending partner payouts. Bookings completed this month will accrue here.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Partner</th>
                <th className="py-3 pr-3">Period</th>
                <th className="py-3 pr-3">Resale margin</th>
                <th className="py-3 pr-3">Product share</th>
                <th className="py-3 pr-3">Total</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4 pr-3">
                    <p className="font-medium text-slate-900">
                      {r.partners?.business_name || r.partners?.full_name || '—'}
                    </p>
                    <p className="text-xs text-slate-500">{r.partners?.email ?? ''}</p>
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs">{r.period_yyyymm}</td>
                  <td className="py-3 pr-3">₹ {Number(r.resale_margin).toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-3">₹ {Number(r.product_share).toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-3 font-semibold">
                    ₹ {Number(r.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => handleMarkPaid(r)}
                      className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Mark paid
                    </button>
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

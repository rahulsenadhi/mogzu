import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Promotion } from '@/lib/database.types'

type Row = Promotion & {
  vendors: { business_name: string | null } | null
  listings: { title: string | null } | null
}

export default function AdminPromotionsApprovalPage() {
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.promotions.listQueue()
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (r: Row) => {
    if (!profile) return
    setBusy(r.id)
    await db.promotions.setStatus(r.id, 'active', { approved_by: profile.id })
    setBusy(null)
    setNotice('Approved + live.')
    load()
  }

  const reject = async (r: Row) => {
    const reason = window.prompt('Rejection reason:')
    if (!reason || !reason.trim()) return
    setBusy(r.id)
    await db.promotions.setStatus(r.id, 'rejected', { rejection_reason: reason.trim() })
    setBusy(null)
    setNotice('Rejected.')
    load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Mogzu admin required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <AdminPageTitleRow
          title="Promotion approval queue"
          subtitle="Vendor-submitted promotions awaiting admin review."
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
              {rows.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {p.vendors?.business_name ?? '—'} · {p.listings?.title ?? 'All listings'}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {p.kind}
                        {p.value != null ? ` · ${p.value}${p.kind === 'percent_off' ? '%' : '₹'}` : ''}
                        {p.add_on_name ? ` · ${p.add_on_name}` : ''} ·{' '}
                        {new Date(p.starts_at).toLocaleDateString('en-IN')} →{' '}
                        {new Date(p.ends_at).toLocaleDateString('en-IN')}
                        {p.paid_boost_payment_reference && (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            Boost paid · {p.paid_boost_payment_reference.slice(0, 12)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {p.description && (
                    <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => reject(p)}
                      disabled={busy === p.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      <XCircle className="size-3" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => approve(p)}
                      disabled={busy === p.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {busy === p.id && <Loader2 className="size-3 animate-spin" />}
                      <CheckCircle2 className="size-3" />
                      Approve & publish
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

// Phase 3 Feature 1 part 2 — admin toggle for public_visible flag.
//
// Lets Mogzu admin flip listings into the public /explore catalogue.
// Vendors will get the same toggle on their own listings page in a
// follow-up; admin is the gate today.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PUBLIC_MODULES } from '@/lib/publicCatalogue'

type Row = {
  id: string
  title: string
  module: string
  status: string
  public_visible: boolean
  vendor_id: string
  vendors: { business_name: string | null } | null
}

export default function AdminPublicListingsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await db.listings.listForPublicAdmin()
    if (err) setError(err.message)
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const toggle = async (r: Row) => {
    setBusy(r.id)
    const { error: err } = await db.listings.setPublicVisible(r.id, !r.public_visible)
    setBusy(null)
    if (err) {
      setError(err.message)
      return
    }
    setRows((prev) =>
      prev.map((row) => (row.id === r.id ? { ...row, public_visible: !row.public_visible } : row)),
    )
  }

  const visible = useMemo(() => {
    let list = rows
    if (filter === 'public') list = list.filter((r) => r.public_visible)
    if (filter === 'private') list = list.filter((r) => !r.public_visible)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.vendors?.business_name ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, filter, search])

  if (!isAdmin) {
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
          title="Public catalogue"
          totalLabel={`${rows.filter((r) => r.public_visible).length} of ${rows.length} listings live on /explore`}
        />

        {error && (
          <p className="mt-3 mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-3 mb-3 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or vendor"
            className="h-9 min-w-[220px] rounded-md border border-slate-200 px-3 text-sm"
          />
          <div className="flex gap-1">
            {(['all', 'public', 'private'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === f ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : visible.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No listings match.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4 pr-3">Title</th>
                  <th className="py-3 pr-3">Vendor</th>
                  <th className="py-3 pr-3">Module</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-4 text-right">Public</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const moduleLabel =
                    PUBLIC_MODULES.find((m) => m.value === r.module)?.label ?? r.module
                  return (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-3 pl-4 pr-3 font-medium text-slate-900">{r.title}</td>
                      <td className="py-3 pr-3 text-slate-600">
                        {r.vendors?.business_name ?? '—'}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{moduleLabel}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            r.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          type="button"
                          disabled={busy === r.id || r.status !== 'active'}
                          onClick={() => toggle(r)}
                          title={
                            r.status !== 'active'
                              ? 'Listing must be active before going public'
                              : ''
                          }
                          className={`inline-flex h-6 w-11 items-center rounded-full px-0.5 transition disabled:opacity-50 ${
                            r.public_visible ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                          }`}
                        >
                          <span className="size-5 rounded-full bg-white shadow" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Public listings appear on the unauthenticated /explore routes (P3.1). Toggling here also
          changes RLS exposure — anonymous clients can see only listings flipped public.
        </p>
      </div>
    </div>
  )
}

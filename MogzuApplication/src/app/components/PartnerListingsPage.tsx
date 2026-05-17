import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Loader2, Pencil, Plus, ShieldAlert } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Listing, Partner } from '@/lib/database.types'

function statusClass(s: string): string {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 border border-emerald-100'
  if (s === 'rejected' || s === 'paused') return 'bg-rose-50 text-rose-800 border border-rose-100'
  if (s === 'pending_approval') return 'bg-amber-50 text-amber-900 border border-amber-100'
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

export default function PartnerListingsPage() {
  const navigate = useNavigate()
  const { profile, role } = useAuth()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError('')
    const { data: p, error: pErr } = await db.partners.getByUserId(profile.id)
    if (pErr || !p) {
      setError(pErr?.message ?? 'No partner record found.')
      setLoading(false)
      return
    }
    setPartner(p as Partner)
    const { data: ls, error: lErr } = await db.partnerListings.listByPartner(p.id)
    if (lErr) {
      setError(lErr.message)
    } else {
      setListings((ls ?? []) as Listing[])
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void load()
  }, [load])

  if (role !== 'partner' && role !== 'mogzu_admin') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Partner access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="mx-auto max-w-md p-12 text-center text-sm text-rose-700">{error}</div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/partner/dashboard')}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-3.5" /> Dashboard
        </button>
        <span className="text-slate-300">·</span>
        <MogzuLogo className="h-7" />
        <h1 className="text-base font-semibold text-slate-900">My Listings</h1>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {listings.length} listing{listings.length === 1 ? '' : 's'} ·{' '}
          {partner.business_name || partner.full_name}
        </p>
        <Link
          to="/partner/listings/new"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="size-3.5" /> New listing
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {listings.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">
            No partner-owned listings yet. Create one to enter the Mogzu catalogue.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Listing</th>
                <th className="py-3 pr-3">Module</th>
                <th className="py-3 pr-3">Price</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4 pr-3">
                    <p className="font-medium text-slate-900">{l.title}</p>
                    <p className="text-xs text-slate-500">
                      {l.location_city ?? '—'} · {l.min_capacity ?? '–'}–{l.max_capacity ?? '–'} pax
                    </p>
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{l.module}</td>
                  <td className="py-3 pr-3 text-slate-700">
                    {l.base_price != null ? `₹ ${l.base_price.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusClass(l.status)}`}
                    >
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/partner/listings/${l.id}/edit`)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="size-3" /> Edit
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

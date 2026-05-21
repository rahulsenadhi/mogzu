import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Copy,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  CorporateAccount,
  Listing,
  Shortlist,
  ShortlistItem,
} from '@/lib/database.types'

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function AmShortlistsPage() {
  const params = useParams<{ id?: string }>()
  const { profile, role } = useAuth()
  const isAm = role === 'account_manager' || role === 'mogzu_admin'

  if (!isAm) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Account Manager access required.</p>
      </div>
    )
  }
  if (params.id) return <ShortlistEditor shortlistId={params.id} />
  return <ShortlistList />
}

function ShortlistList() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [rows, setRows] = useState<(Shortlist & { corporate_accounts?: { name: string | null } })[]>(
    [],
  )
  const [clients, setClients] = useState<CorporateAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [intro, setIntro] = useState('')
  const [corporateId, setCorporateId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const [sRes, cRes] = await Promise.all([
      db.shortlists.listByAm(profile.id),
      db.corporateAccounts.listByAccountManager(profile.id),
    ])
    setRows((sRes.data ?? []) as any)
    setClients((cRes.data ?? []) as CorporateAccount[])
    if (!corporateId && cRes.data && cRes.data[0]) setCorporateId(cRes.data[0].id)
    setLoading(false)
  }, [profile, corporateId])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!profile || !corporateId || !name.trim()) {
      setNotice('Name + client required.')
      return
    }
    setSubmitting(true)
    const { data, error } = await db.shortlists.create({
      account_manager_id: profile.id,
      corporate_id: corporateId,
      name: name.trim(),
      intro_note: intro.trim() || null,
      share_token: randomToken(),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      view_count: 0,
    })
    setSubmitting(false)
    if (error) {
      setNotice(error.message)
      return
    }
    setShowForm(false)
    setName('')
    setIntro('')
    setExpiresAt('')
    if (data) navigate(`/am/shortlists/${data.id}`)
    else load()
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
        <AdminPageTitleRow
          title="Client shortlists"
          subtitle="Curate listings for assigned clients. Share via tokenised link; track views + booking attribution."
        />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            New shortlist
          </button>
        </div>

        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No shortlists yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.corporate_accounts?.name ?? '—'} ·{' '}
                      {s.view_count} view{s.view_count !== 1 ? 's' : ''}
                      {s.expires_at && ` · expires ${new Date(s.expires_at).toLocaleDateString('en-IN')}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/shortlist/${s.share_token}`
                        navigator.clipboard?.writeText(url)
                        setNotice(`Link copied: ${url}`)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="size-3" /> Copy link
                    </button>
                    <button
                      type="button"
                      onClick={() => (window.location.href = `/am/shortlists/${s.id}`)}
                      className="rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">New shortlist</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <select
                value={corporateId}
                onChange={(e) => setCorporateId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shortlist name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                placeholder="Intro note for the client (optional)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Expires (optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Create + add listings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ShortlistEditor({ shortlistId }: { shortlistId: string }) {
  const navigate = useNavigate()
  const [shortlist, setShortlist] = useState<Shortlist | null>(null)
  const [items, setItems] = useState<(ShortlistItem & { listings?: Listing | null })[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [sRes, iRes, lRes] = await Promise.all([
      db.shortlists.getById(shortlistId),
      db.shortlists.listItems(shortlistId),
      db.listings.listByModule('events', 'active'),
    ])
    setShortlist(sRes.data ?? null)
    setItems((iRes.data ?? []) as any)
    setListings(lRes.data ?? [])
    setLoading(false)
  }, [shortlistId])

  useEffect(() => {
    load()
  }, [load])

  const addListing = async (listingId: string) => {
    await db.shortlists.addItem({
      shortlist_id: shortlistId,
      listing_id: listingId,
      am_note: null,
      display_order: items.length,
    })
    load()
  }

  const removeItem = async (id: string) => {
    await db.shortlists.removeItem(id)
    load()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!shortlist) return <p className="p-12 text-center">Shortlist not found.</p>

  const candidates = listings.filter((l) => !items.some((i) => i.listing_id === l.id))

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
        <button
          type="button"
          onClick={() => navigate('/am/shortlists')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-[#0e1e3f]">{shortlist.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Share link:{' '}
          <code className="rounded bg-slate-100 px-1 font-mono text-xs">
            /shortlist/{shortlist.share_token}
          </code>{' '}
          · {shortlist.view_count} view{shortlist.view_count !== 1 ? 's' : ''}
        </p>

        <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Items ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No listings yet — add from below.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
              >
                <p className="text-sm font-medium text-slate-900">
                  {it.listings?.title ?? it.listing_id.slice(0, 8)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add listings
        </h2>
        <div className="flex gap-2">
          <select
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            className="h-9 flex-1 rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value="">Pick a listing</option>
            {candidates.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!adding}
            onClick={() => {
              if (adding) addListing(adding)
              setAdding('')
            }}
            className="rounded-md bg-[#2563eb] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'

type ViewerItem = {
  item_id: string
  listing_id: string
  curator_note: string | null
  display_order: number
  title: string | null
  description: string | null
  base_price: number | null
  price_unit: string | null
  min_capacity: number | null
  max_capacity: number | null
  location_city: string | null
  cover_image: string | null
}

type ViewerData = {
  id: string
  module: string
  custom_note: string | null
  expires_at: string
  status: string
  client_label: string | null
  items: ViewerItem[]
}

function fmtMoney(n: number | null): string {
  if (n == null) return 'on request'
  return `₹ ${Number(n).toLocaleString('en-IN')}`
}

export default function QuickShareViewerPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<ViewerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState<Record<string, number>>({}) // listing_id -> qty
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [clientNote, setClientNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const { data: rows, error: e } = await db.quickShares.getByToken(token)
    if (e) {
      setError(e.message)
      setLoading(false)
      return
    }
    const row = (rows as ViewerData[] | null)?.[0]
    if (!row) {
      setError('This share link is invalid or has expired.')
      setLoading(false)
      return
    }
    setData(row)
    setLoading(false)
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = (listingId: string) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[listingId]) delete next[listingId]
      else next[listingId] = 1
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!name.trim()) {
      setError('Your name is required.')
      return
    }
    if (Object.keys(selected).length === 0) {
      setError('Pick at least one option.')
      return
    }
    setSubmitting(true)
    setError('')
    const items = Object.entries(selected).map(([listing_id, quantity]) => ({
      listing_id,
      quantity,
      note: notes[listing_id]?.trim() || undefined,
    }))
    const { error: submitError } = await db.quickShares.submit(token, {
      client_name: name.trim(),
      client_company: company.trim() || null,
      client_phone: phone.trim() || null,
      client_email: email.trim() || null,
      selected_items: items,
      client_note: clientNote.trim() || null,
    })
    setSubmitting(false)
    if (submitError) {
      setError(submitError.message)
      return
    }
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <MogzuLogo className="mx-auto mb-4 h-10" />
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <MogzuLogo className="mx-auto mb-4 h-10" />
        <CheckCircle2 className="mx-auto mb-2 size-10 text-emerald-500" />
        <h1 className="text-xl font-semibold text-slate-900">Submission received</h1>
        <p className="mt-2 text-sm text-slate-600">
          The Mogzu team will reconfirm with you shortly and share a payment link if needed.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6 text-center">
        <MogzuLogo className="mx-auto mb-3 h-10" />
        <h1 className="text-xl font-semibold text-slate-900">
          Curated picks for {data.client_label ?? 'you'}
        </h1>
        {data.custom_note && (
          <p className="mt-2 text-sm text-slate-600">{data.custom_note}</p>
        )}
        <p className="mt-2 text-[11px] text-slate-500">
          Module: <span className="capitalize">{data.module}</span> · expires{' '}
          {new Date(data.expires_at).toLocaleString('en-IN')}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="space-y-3">
          {data.items.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No items in this share.</p>
          ) : (
            data.items.map((it) => {
              const on = selected[it.listing_id] != null
              return (
                <div
                  key={it.item_id}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    on ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-white'
                  }`}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(it.listing_id)}
                      className="mt-1 size-4"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        {it.cover_image && (
                          <img
                            src={storageService.spaceImages.getUrl(it.cover_image)}
                            alt=""
                            className="size-16 shrink-0 rounded-md object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">{it.title}</p>
                          <p className="text-xs text-slate-500">
                            {it.location_city ?? '—'} · {fmtMoney(it.base_price)}
                            {it.price_unit ? ` ${it.price_unit.replace('_', ' ')}` : ''}
                          </p>
                          {it.curator_note && (
                            <p className="mt-1 text-xs italic text-slate-600">{it.curator_note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                  {on && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <label className="block space-y-1">
                        <span className="text-[11px] text-slate-700">Quantity</span>
                        <input
                          type="number"
                          min="1"
                          value={selected[it.listing_id]}
                          onChange={(e) =>
                            setSelected((p) => ({
                              ...p,
                              [it.listing_id]: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[11px] text-slate-700">Note for this item</span>
                        <input
                          value={notes[it.listing_id] ?? ''}
                          onChange={(e) =>
                            setNotes((p) => ({ ...p, [it.listing_id]: e.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Your contact details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-700">Name *</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm shadow-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-700">Company</span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm shadow-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-700">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm shadow-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm shadow-sm"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-700">Anything else?</span>
            <textarea
              value={clientNote}
              onChange={(e) => setClientNote(e.target.value)}
              className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm"
              placeholder="Date, headcount, preferences..."
            />
          </label>
        </section>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Submit my selection
        </button>

        <p className="text-center text-[11px] text-slate-400">Powered by Mogzu</p>
      </form>
    </div>
  )
}
